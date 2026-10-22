// Vypíše strany titulkov klipu tak, ako ich ukáže video: node scripts/caption-pages.ts marek-1
import { pages } from "../src/captions.ts";
import { KLIPY } from "../src/klipy.ts";

const id = process.argv[2] as keyof typeof KLIPY;
if (!KLIPY[id]) throw new Error(`Neznámy klip: ${id}. Známe: ${Object.keys(KLIPY).join(", ")}`);
for (const page of pages(KLIPY[id].words)) {
  const t = page[0][0].t0.toFixed(1).padStart(5);
  console.log(`${t}s  ${page.map((l) => l.map((w) => w.w).join(" ")).join("  /  ")}`);
}
