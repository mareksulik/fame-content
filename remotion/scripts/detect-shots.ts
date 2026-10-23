// Nájde strihy kamery v klipe a určí typ záberu, aby výrez na celé plátno sledoval rečníka.
//   node scripts/detect-shots.ts <id> <video.mp4>   → src/titulky/<id>-shots.ts
// Rozhovor 2museCast má dva zábery dvojíc: „A“ = vľavo moderátorka (tmavé vzorované tričko), vpravo hosť v sivom
// tričku (Marek); „B“ = vľavo hosť v bielom tričku (Roman), vpravo moderátor v tmavej polokošeli. Typ sa určí z jasu
// trupu ľavej postavy (A okolo 30, B okolo 110; nohy sú svetlé v oboch). Iné zábery dostanú „?“ (výrez na stred).
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [id, video] = process.argv.slice(2);
if (!id || !video) throw new Error("Použitie: node scripts/detect-shots.ts <id> <video.mp4>");

// showinfo píše na stderr.
const log = spawnSync("ffmpeg", ["-v", "info", "-i", video, "-vf", "select='gt(scene,0.08)',showinfo", "-an", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const cuts = [...log.matchAll(/pts_time:([\d.]+)/g)].map((m) => +m[1]);
const duration = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], { encoding: "utf8" });
const starts = [0, ...cuts];

// Priemerný jas oblasti (podiely šírky a výšky) v snímke t.
const luma = (t: number, x: number, y: number, w: number, h: number) =>
  execFileSync("ffmpeg", ["-v", "error", "-ss", String(t), "-i", video, "-frames:v", "1", "-vf", `crop=iw*${w}:ih*${h}:iw*${x}:ih*${y},scale=1:1:flags=area,format=gray`, "-f", "rawvideo", "-"])[0];

const shots = starts.map((from, i) => {
  const to = starts[i + 1] ?? duration;
  const t = (from + to) / 2;
  const torso = luma(t, 0.1, 0.38, 0.2, 0.17);
  const legs = luma(t, 0.05, 0.62, 0.25, 0.22);
  const type = torso < 70 ? "A" : torso > 90 ? "B" : "?";
  console.log(`${from.toFixed(2).padStart(6)}–${to.toFixed(2).padStart(6)} s  trup ${String(torso).padStart(3)}  nohy ${String(legs).padStart(3)}  → ${type}`);
  return { from: +from.toFixed(3), type };
});

writeFileSync(
  new URL(`../src/titulky/${id}-shots.ts`, import.meta.url),
  `// Vygenerované: node scripts/detect-shots.ts ${id} (strihy kamery a typ záberu, pozri komentár v skripte)\n` +
    `export const shots: { from: number; type: "A" | "B" | "?" }[] = ${JSON.stringify(shots)};\n`,
);
