// Renderuje FAME post (HTML so .slide sekciami) do PDF a PNG.
// Použitie: npm run render -- posts/<priecinok> [nazov-suboru]
// Každý .html v priečinku je samostatný variant.
// Výstup: <priecinok>/out/<nazov>-<html>.pdf + <nazov>-<html>-1.png, -2.png …
import { chromium } from "playwright-core";
import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const postDir = resolve(process.argv[2] ?? "");
const name = process.argv[3] ?? basename(postDir).replace(/^\d{4}-\d{2}-/, "fame-");
if (!process.argv[2]) {
  console.error("Použitie: npm run render -- posts/<priecinok> [nazov]");
  process.exit(1);
}

const htmls = (await readdir(postDir)).filter((f) => f.endsWith(".html"));
if (!htmls.length) throw new Error(`V ${postDir} chýba .html súbor`);

const outDir = join(postDir, "out");
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Lokálny Google Chrome – netreba sťahovať prehliadač pre Playwright
const browser = await chromium.launch({ channel: "chrome" });

for (const html of htmls) {
  const file = htmls.length > 1 ? `${name}-${html.replace(/\.html$/, "")}` : name;
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.goto(pathToFileURL(join(postDir, html)).href);
  await page.evaluate(() => document.body.classList.add("is-render"));
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.locator(".slide").all();
  if (!slides.length) throw new Error(`${html}: žiadny .slide element`);

  const { width, height } = await slides[0].boundingBox();
  for (const [i, slide] of slides.entries()) {
    await slide.screenshot({ path: join(outDir, `${file}-${i + 1}.png`) });
  }

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: join(outDir, `${file}.pdf`),
    width: `${width}px`,
    height: `${height}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await page.close();
  console.log(`${html}: ${slides.length} strán → out/${file}.pdf (+ PNG)`);
}

await browser.close();
