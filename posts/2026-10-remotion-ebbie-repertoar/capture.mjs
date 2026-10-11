// Reálne snímky Ebbie pre video: úvodná obrazovka s pripravenou otázkou (téma Zákonitosti nákupu)
// a zdieľaná odpoveď na ňu. Spustenie z koreňa repozitára:
//   node posts/2026-10-remotion-ebbie-repertoar/capture.mjs
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const Q = "Kupujú ľudia verne jednu značku, alebo repertoár značiek?";
const ANSWER = "https://ebbie.sk/a/1047e3d5-a496-4521-a9ce-04b720c251b2";
const out = "system/media/ebbie-repertoar";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 720, height: 900 }, deviceScaleFactor: 1.5, locale: "sk-SK" });

await page.goto("https://ebbie.sk/?tema=buyer-behaviour-laws", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.getByRole("button", { name: "Odmietnuť" }).click(); // cookies: bez súhlasu
const btn = page.getByRole("button", { name: Q });
await btn.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 200));
await page.screenshot({ path: `${out}/start.png` });
const box = await btn.boundingBox();
const scrollY = await page.evaluate(() => window.scrollY);

await page.goto(ANSWER, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/answer-full.png`, fullPage: true });
const text = await page.evaluate(() => document.body.innerText);
// Polohy sekcií v CSS px (snímka je 1,5×), podľa nich sa vo videu posúva.
const marks = await page.evaluate(() => {
  const y = (re) => {
    const el = [...document.querySelectorAll("h1,h2,h3,p,li,div,section")].find((e) => re.test(e.textContent) && e.children.length < 12 && e.textContent.length < 2000);
    return el ? Math.round(el.getBoundingClientRect().top + scrollY) : null;
  };
  return { title: y(/^Kupujú ľudia/), marketer: y(/Pre marketéra to znamená/), verdict: y(/^\s*Verdikt/), sources: y(/^\s*Zdroje/), height: document.documentElement.scrollHeight };
});
await writeFile(`${out}/answer.txt`, text);
await writeFile(`${out}/meta.json`, JSON.stringify({ button: box, scrollY, marks, answer: ANSWER }, null, 2));
console.log(box, marks, text.length);
await browser.close();
