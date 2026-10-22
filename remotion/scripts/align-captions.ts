// Spáruje ručne opravený text titulkov s časmi slov z whisper.cpp a zapíše src/titulky/<id>.ts.
//   node scripts/align-captions.ts <id> <whisper.csv> <text.txt>
// whisper.csv: whisper-cli -ml 1 -sow --dtw large.v3.turbo -ocsv (začiatok, koniec v ms, slovo).
// text.txt: „|“ pred slovom začína novú stranu titulkov, {…} je reč moderátora (sivou).
// Párovanie: najdlhšia spoločná podpostupnosť nad slovami bez diakritiky a interpunkcie (s malou toleranciou preklepov);
// slovo bez páru dostane čas pomerne podľa dĺžky v medzere medzi susednými spárovanými slovami.
import { readFileSync, writeFileSync } from "node:fs";

const [id, csvPath, textPath] = process.argv.slice(2);
if (!id || !csvPath || !textPath) throw new Error("Použitie: node scripts/align-captions.ts <id> <whisper.csv> <text.txt>");

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const same = (a: string, b: string) => !!a && !!b && (a === b || (Math.min(a.length, b.length) >= 4 && lev(a, b) <= Math.floor(Math.max(a.length, b.length) * 0.3)));

const heard = readFileSync(csvPath, "utf8").trim().split("\n").slice(1)
  .map((l) => l.match(/^(\d+),(\d+),"?\s*(.*?)"?$/))
  .filter((m): m is RegExpMatchArray => !!m && norm(m[3]) !== "")
  .map((m) => ({ t0: +m[1] / 1000, t1: +m[2] / 1000, n: norm(m[3]) }));

type Out = { w: string; t0: number; t1: number; br?: boolean; host?: boolean };
const words: Out[] = [];
let host = false;
let br = true;
for (const raw of readFileSync(textPath, "utf8").split(/\s+/).filter(Boolean)) {
  let w = raw;
  if (w.startsWith("|")) { br = true; w = w.slice(1); }
  if (w.startsWith("{")) { host = true; w = w.slice(1); }
  const close = w.endsWith("}");
  if (close) w = w.slice(0, -1);
  if (w) words.push({ w, t0: NaN, t1: NaN, ...(br && { br: true }), ...(host && { host: true }) });
  if (w) br = false;
  if (close) host = false;
}

// LCS
const n = words.length, m = heard.length;
const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
for (let i = n - 1; i >= 0; i--)
  for (let j = m - 1; j >= 0; j--)
    L[i][j] = same(norm(words[i].w), heard[j].n) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
const pair: number[] = Array(n).fill(-1);
for (let i = 0, j = 0; i < n && j < m; ) {
  if (same(norm(words[i].w), heard[j].n) && L[i][j] === L[i + 1][j + 1] + 1) { pair[i] = j; i++; j++; }
  else if (L[i + 1][j] >= L[i][j + 1]) i++;
  else j++;
}
pair.forEach((j, i) => { if (j >= 0) { words[i].t0 = heard[j].t0; words[i].t1 = heard[j].t1; } });

// Slová bez páru: rozdeliť medzeru medzi susedmi pomerne podľa dĺžky.
for (let i = 0; i < n; ) {
  if (pair[i] >= 0) { i++; continue; }
  let k = i;
  while (k < n && pair[k] < 0) k++;
  const a = i > 0 ? words[i - 1].t1 : heard[0]?.t0 ?? 0;
  const b = k < n ? words[k].t0 : heard[m - 1]?.t1 ?? a + 0.3 * (k - i);
  const span = Math.max(b - a, 0.12 * (k - i));
  const total = words.slice(i, k).reduce((s, w) => s + w.w.length, 0);
  let t = a;
  for (let x = i; x < k; x++) {
    const d = (span * words[x].w.length) / total;
    words[x].t0 = +t.toFixed(3);
    words[x].t1 = +(t + d).toFixed(3);
    t += d;
  }
  i = k;
}

const unmatched = pair.filter((j) => j < 0).length;
const speakerFrom = words.find((w) => !w.host)?.t0 ?? 0;
const body = words.map((w) => `  ${JSON.stringify(w)},`).join("\n");
writeFileSync(
  new URL(`../src/titulky/${id}.ts`, import.meta.url),
  `// Vygenerované: node scripts/align-captions.ts ${id} (needitovať ručne, opraviť text v posts/2026-10-video-2musecast-klipy/titulky/${id}.txt)\n` +
    `import type { Word } from "../klipy";\n\nexport const speakerFrom = ${speakerFrom};\n\nexport const words: Word[] = [\n${body}\n];\n`,
);
console.log(`${id}: ${n} slov, ${n - unmatched} spárovaných, ${unmatched} dopočítaných, menovka od ${speakerFrom.toFixed(2)} s`);
