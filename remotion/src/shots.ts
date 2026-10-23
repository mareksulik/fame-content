// Strihy kamery v klipoch (scripts/detect-shots.ts) a výrez celého plátna podľa toho, kto hovorí.
// Záber 16:9 má na plátne 4:5 šírku 2400 px, viditeľných je 1080 px: ľavá polovica = posun 0, pravá = −1320, stred −660.
// A = moderátorka vľavo, Marek vpravo; B = Roman vľavo, moderátor vpravo.
import type { Word } from "./klipy";
import { shots as marek1 } from "./titulky/marek-1-shots.ts";
import { shots as marek2 } from "./titulky/marek-2-shots.ts";
import { shots as marek3 } from "./titulky/marek-3-shots.ts";
import { shots as marek4 } from "./titulky/marek-4-shots.ts";
import { shots as marek5 } from "./titulky/marek-5-shots.ts";
import { shots as roman1 } from "./titulky/roman-1-shots.ts";
import { shots as roman2 } from "./titulky/roman-2-shots.ts";
import { shots as roman3 } from "./titulky/roman-3-shots.ts";
import { shots as roman4 } from "./titulky/roman-4-shots.ts";
import { shots as roman5 } from "./titulky/roman-5-shots.ts";
import { shots as roman6 } from "./titulky/roman-6-shots.ts";

export type Shot = { from: number; type: "A" | "B" | "?" };

export const SHOTS: Record<string, Shot[]> = {
  "marek-1": marek1, "marek-2": marek2, "marek-3": marek3, "marek-4": marek4, "marek-5": marek5,
  "roman-1": roman1, "roman-2": roman2, "roman-3": roman3, "roman-4": roman4, "roman-5": roman5, "roman-6": roman6,
};

const LEFT = 0;
const RIGHT = -1320;
const CENTER = -660;
const GUEST = { A: RIGHT, B: LEFT, "?": CENTER };
const WOMAN = LEFT; // moderátorka, ktorá kladie otázky, sedí v zábere A vľavo
const HOST_MIN_S = 0.8; // kratšia replika moderátora záber nemení

// Úsek výrezu: x = vodorovný posun; src = začiatok vloženého záberu moderátorky v klipe (sekundy), ak ju aktuálny
// záber neukazuje. Vložený záber je bez zvuku, zvuk rozhovoru ide ďalej z hlavného záberu.
export type Segment = { from: number; to: number; x: number; src?: number };

function hostSpans(words: Word[]): [number, number][] {
  const spans: [number, number][] = [];
  let start: Word | null = null;
  words.forEach((w, i) => {
    if (w.host && !start) start = w;
    if (w.host && !words[i + 1]?.host && start) {
      if (w.t1 - start.t0 >= HOST_MIN_S) spans.push([start.t0 - 0.15, w.t1 + 0.25]);
      start = null;
    }
  });
  return spans;
}

// Strih na rečníka bez pohybu výrezu v zábere (Marekova poznámka 2026-10-23):
// - záber stola rečníka (guestShot: Marek A, Roman B): výrez na rečníkovi; počas otázky moderátorky ostrý strih na ňu;
// - reakčný záber druhého stola: vždy moderátorka; v zábere B nie je, tak sa vloží jej záber z inej chvíle klipu A,
//   keď nehovorí (najbližší pred, inak po). Bez takého záberu ostane výrez na rečníkovi.
export function cropPlan(shots: Shot[], words: Word[], end: number, guestShot: "A" | "B"): Segment[] {
  const spans = hostSpans(words);
  const inHost = (t: number) => spans.some(([a, b]) => t >= a && t <= b);
  const shotAt = (t: number) => {
    let s = shots.length - 1;
    while (s > 0 && shots[s].from > t) s--;
    return s;
  };

  // Rozhodnutie pre krátky krok času, potom zlúčenie rovnakých krokov do úsekov.
  const STEP = 1 / 30;
  const raw: { from: number; to: number; x: number; woman: boolean; shot: number }[] = [];
  for (let t = 0; t < end; t += STEP) {
    const s = shotAt(t);
    const type = shots[s]?.type ?? "?";
    let x = CENTER;
    let woman = false;
    if (type !== "?") {
      const wantWoman = type !== guestShot || inHost(t);
      if (!wantWoman) x = GUEST[type];
      else if (type === "A") x = WOMAN;
      else woman = true; // potrebujeme vložený záber
    }
    const last = raw[raw.length - 1];
    if (last && last.x === x && last.woman === woman && (!woman || last.shot === s)) last.to = t + STEP;
    else raw.push({ from: t, to: t + STEP, x, woman, shot: s });
  }

  // Úseky klipu A, kde moderátorka nehovorí: zdroj vložených záberov.
  const aRanges = shots
    .map((s, i) => ({ type: s.type, from: s.from, to: shots[i + 1]?.from ?? end }))
    .filter((r) => r.type === "A")
    .flatMap((r) => {
      let parts: [number, number][] = [[r.from + 0.1, r.to - 0.1]];
      for (const [a, b] of spans) parts = parts.flatMap(([x0, x1]) => (b <= x0 || a >= x1 ? [[x0, x1]] : ([[x0, a], [b, x1]] as [number, number][]).filter(([p, q]) => q - p > 0)));
      return parts;
    });

  return raw.map((seg) => {
    if (!seg.woman) return { from: seg.from, to: seg.to, x: seg.x };
    const len = seg.to - seg.from;
    const before = aRanges.filter(([a, b]) => b <= seg.from && b - a >= len).sort((p, q) => q[1] - p[1])[0];
    const after = aRanges.filter(([a, b]) => a >= seg.to && b - a >= len).sort((p, q) => p[0] - q[0])[0];
    const src = before ? before[1] - len : after ? after[0] : undefined;
    const type = shots[seg.shot]?.type ?? "?";
    return src === undefined ? { from: seg.from, to: seg.to, x: GUEST[type] } : { from: seg.from, to: seg.to, x: WOMAN, src };
  });
}
