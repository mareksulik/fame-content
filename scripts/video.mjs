// Renderuje animovaný FAME post (jeden .slide s CSS animáciami) do MP4.
// Použitie: npm run video -- posts/<priecinok> [sekundy=10.5] [fps=30]
// Čas sa posúva deterministicky cez Web Animations API, takže každá snímka je presná.
// Výstup: <priecinok>/out/<nazov>.mp4 + <nazov>-poster.png (posledná snímka).
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) {
  console.error("Použitie: npm run video -- posts/<priecinok> [sekundy] [fps]");
  process.exit(1);
}
const postDir = resolve(process.argv[2]);
const seconds = Number(process.argv[3] ?? 10.5);
const fps = Number(process.argv[4] ?? 30);
const name = basename(postDir).replace(/^\d{4}-\d{2}-/, "fame-");

const html = (await readdir(postDir)).find((f) => f.endsWith(".html"));
if (!html) throw new Error(`V ${postDir} chýba .html súbor`);

const outDir = join(postDir, "out");
await mkdir(outDir, { recursive: true });
const frameDir = await mkdtemp(join(tmpdir(), "fame-video-"));

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(join(postDir, html)).href);
await page.evaluate(() => document.body.classList.add("is-render"));
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));

const slide = page.locator(".slide").first();
const frames = Math.round(seconds * fps);
await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));

for (let f = 0; f < frames; f++) {
  const ms = (f * 1000) / fps;
  await page.evaluate((t) => document.getAnimations().forEach((a) => { a.currentTime = t; }), ms);
  await slide.screenshot({ path: join(frameDir, `f${String(f).padStart(4, "0")}.png`), animations: "allow" });
}
await slide.screenshot({ path: join(outDir, `${name}-poster.png`), animations: "allow" });
await browser.close();

execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-framerate", String(fps), "-i", join(frameDir, "f%04d.png"),
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow",
  "-movflags", "+faststart",
  join(outDir, `${name}.mp4`),
]);
await rm(frameDir, { recursive: true, force: true });
console.log(`${html}: ${frames} snímok, ${seconds} s @ ${fps} fps → out/${name}.mp4`);
