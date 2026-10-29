// Delenie titulkov: úsek medzi značkami br sa rozdelí na čo najmenej riadkov rovnakej dĺžky (žiadne osamotené
// slovo na konci) a riadky úseku idú na strany po dvoch. Kontrola strán bez renderu: node scripts/caption-pages.ts <id>
import type { Word } from "./klipy";

export const MAX_CHARS = 30; // cieľová dĺžka riadku
const HARD_MAX = 34; // pri 50 px Bricolage 700 sa ešte zmestí do 936 px

type HasText = { w: string };
const len = (ws: HasText[]) => ws.reduce((n, w) => n + w.w.length, 0) + Math.max(ws.length - 1, 0);

// Jednopísmenová predložka alebo spojka nesmie ostať na konci riadku (pravidlo &nbsp; v DESIGN.md).
const SHORT = new Set(["a", "i", "k", "o", "s", "u", "v", "z", "A", "I", "K", "O", "S", "U", "V", "Z"]);

// Greedy zalomenie s limitom width.
function wrap<T extends HasText>(ws: T[], width: number): T[][] {
  const lines: T[][] = [];
  let line: T[] = [];
  for (const w of ws) {
    if (line.length && len([...line, w]) > width) {
      const carry = line.length > 1 && SHORT.has(line[line.length - 1].w) ? [line.pop()!] : [];
      lines.push(line);
      line = carry;
    }
    line.push(w);
  }
  if (line.length) lines.push(line);
  return lines;
}

// Najmenší počet riadkov, potom najmenšia šírka, pri ktorej sa úsek do toľkých riadkov zmestí.
export function balance<T extends HasText>(ws: T[], hardMax = HARD_MAX): T[][] {
  for (let n = Math.ceil(len(ws) / hardMax); ; n++) {
    for (let width = Math.ceil(len(ws) / n); width <= hardMax; width++) {
      const lines = wrap(ws, width);
      if (lines.length <= n) return lines;
    }
    if (n > ws.length) return wrap(ws, hardMax);
  }
}

export function pages(words: Word[]): Word[][][] {
  const chunks: Word[][] = [];
  for (const w of words) {
    if (!chunks.length || w.br) chunks.push([]);
    chunks[chunks.length - 1].push(w);
  }
  const out: Word[][][] = [];
  for (const chunk of chunks) {
    const lines = balance(chunk);
    for (let i = 0; i < lines.length; i += 2) out.push(lines.slice(i, i + 2));
  }
  return out;
}
