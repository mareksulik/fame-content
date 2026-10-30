// Zákony marketingu 01: double jeopardy vysvetlený na rulete. Každý nákup je jedno zatočenie, šírka výseku je podiel značky.
// Simulácia 1 000 zákazníkov so seedom (zjednodušený NBD model: počet nákupov za rok = 1 + Poisson s gama rozdelenou mierou),
// všetci točia rovnakým kolesom. Čísla v texte aj grafoch sa počítajú zo simulácie, nie sú vpísané ručne.
// Každá scéna: naklonená dlaždica s pomenovaním, uprostred graf, dole béžový blok s vetou. 54 s, 4:5 a 9:16.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./dj.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic), inOut = Easing.inOut(Easing.cubic);
const prog = (f: number, start: number, dur: number, ease = out) => interpolate(f - start, [0, dur], [0, 1], { ...clamp, easing: ease });
const win = (f: number, a: number, b: number, d = 12) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
const slap = (f: number, start: number, fps: number) => spring({ frame: f - start, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });

// ---- Časová os (snímky pri 30 fps) ----
export const T = { rules: 96, one: 216, crowd: 432, penA: 582, penD: 672, freq: 792, mech: 942, mech2: 1077, mech3: 1227, why: 1392, end: 1512, total: 1626 };

// ---- Simulácia ----
const SHARES = [0.4, 0.3, 0.2, 0.1];
const NAMES = ["A", "B", "C", "D"];
// ink, teal, yellow, red z tokens.css; JS ich potrebuje ako hex na miešanie farieb
const COLORS = ["#242021", "#00A69C", "#FAE27B", "#EE3433"];
const ON = ["#ffffff", "#242021", "#242021", "#000000"];
const FAINT = "#ece9e5"; // --line zosvetlená k bielej: zákazník, ktorý značku nekúpil
const N = 1000, MEAN = 3, SEED = 7;

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const poisson = (r: () => number, l: number) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
const pick = (u: number) => { let b = 0; while (b < 3 && u > SHARES[b]) { u -= SHARES[b]; b++; } return b; };

function simulate() {
  const r = rng(SEED);
  // gama s tvarom 1 = exponenciálne rozdelenie: zákazníci sa líšia tým, ako často kategóriu kupujú
  const people = Array.from({ length: N }, () => {
    const n = 1 + poisson(r, -Math.log(1 - r()) * (MEAN - 1));
    return Array.from({ length: n }, () => pick(r()));
  });
  const buyers = [0, 1, 2, 3].map((b) => people.filter((p) => p.includes(b)).length);
  const freq = [0, 1, 2, 3].map((b) => people.reduce((s, p) => s + p.filter((x) => x === b).length, 0) / buyers[b]);
  // poradie, v akom sa zákazníci v dave rozsvietia
  const order = people.map((_, i) => [r(), i] as const).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
  const rank = new Array<number>(N);
  order.forEach((i, k) => { rank[i] = k; });
  // vzorový zákazník: 4 nákupy, malú značku D trafí raz, a to naposledy
  const hero = people.find((p) => p.length === 4 && p[3] === 3 && p.filter((x) => x === 3).length === 1 && p.includes(0)) ?? [0, 1, 0, 3];
  // Vysvetlenie vernosti: zákazníci so 4 nákupmi, ktorých PRVÝ nákup bol A (D); ďalšie tri zatočenia sú od neho nezávislé.
  // (Podmienka „kúpil A aspoň raz“ by nesedela: zatočenia pred prvým A by z definície neboli A.)
  // Na obraz ide prvých 8 po sebe idúcich, ktorých počet zásahov v 24 ďalších zatočeniach je najbližšie k podielu značky
  // (24 × 40 % ≈ 10, 24 × 10 % ≈ 2), aby obraz sedel s textom; malá vzorka by inak náhodne klamala.
  const hitsOf = (ps: number[][], b: number) => ps.reduce((s, p) => s + p.slice(1).filter((x) => x === b).length, 0);
  const sample = (b: number, rate: number) => {
    const g = people.filter((p) => p.length === 4 && p[0] === b);
    for (let i = 0; i + 8 <= g.length; i++) {
      const w = g.slice(i, i + 8);
      if (Math.abs(hitsOf(w, b) - 24 * rate) <= 0.5) return w;
    }
    return g.slice(0, 8);
  };
  return { people, buyers, freq, rank, hero, samples: [sample(0, SHARES[0]), sample(3, SHARES[3])] };
}
const SIM = simulate();

const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const dec = (n: number) => n.toFixed(1).replace(".", ",");
const pct = (n: number) => `${Math.round(n * 100)} %`;
const TIMES = ["", "raz", "dvakrát", "trikrát", "štyrikrát", "päťkrát"];
const mix = (a: string, b: string, t: number) => {
  const c = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * t)).join(",")})`;
};

// ---- Rotácia kolesa ----
// Pri otočení θ je pod ukazovateľom (hore) bod kolesa s uhlom φ = −θ; výsek b leží medzi START[b] a START[b + 1].
const START = SHARES.reduce<number[]>((a, s) => [...a, a[a.length - 1] + s * 360], [0]);
const REST = -(START[0] + START[1]) / 2; // v pokoji je pod ukazovateľom stred výseku A
const spinAt = (i: number) => T.one + 24 + i * 38;
const SPIN = 30;
const TARGETS = (() => {
  const r = rng(SEED + 1);
  let prev = REST;
  return SIM.hero.map((b) => {
    const phi = START[b] + (START[b + 1] - START[b]) * (0.3 + 0.4 * r());
    prev += 720 + ((((-phi - prev) % 360) + 360) % 360);
    return prev;
  });
})();
const LAST = TARGETS[TARGETS.length - 1];
const WHY_ROT = -(START[3] + START[4]) / 2; // v závere je hore výsek D

function rotAt(f: number) {
  if (f < spinAt(0)) return interpolate(f, [0, T.one - 12], [REST - 1080, REST], { ...clamp, easing: out });
  for (let i = TARGETS.length - 1; i >= 0; i--) {
    if (f >= spinAt(i)) {
      const from = i ? TARGETS[i - 1] : REST;
      if (i === TARGETS.length - 1 && f >= spinAt(i) + SPIN) return LAST + 4000 * prog(f, T.crowd, 150, inOut);
      return interpolate(f, [spinAt(i), spinAt(i) + SPIN], [from, TARGETS[i]], { ...clamp, easing: out });
    }
  }
  return REST;
}

// ---- Rozloženie: scéna 936 × 690 medzi dlaždicou a béžovým blokom ----
export type DJFormat = "portrait" | "reel";
const STAGE_H = 690;

// ---- Koleso: jediný okrúhly tvar, lebo je to predmet, nie rozhranie ----
const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
type WheelProps = { cx: number; cy: number; r: number; rot: number; dim?: number[]; labels?: boolean };
const Wheel = ({ cx, cy, r, rot, dim = [1, 1, 1, 1], labels = true }: WheelProps) => {
  const k = r / 290;
  return (
    <g>
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        {SHARES.map((s, b) => {
          const [x0, y0] = polar(cx, cy, r, START[b]), [x1, y1] = polar(cx, cy, r, START[b + 1]);
          const [lx, ly] = polar(cx, cy, r * 0.66, (START[b] + START[b + 1]) / 2);
          return (
            <g key={b} opacity={dim[b]}>
              <path d={`M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${s > 0.5 ? 1 : 0} 1 ${x1},${y1} Z`} fill={COLORS[b]} className="dj-slice" style={{ strokeWidth: 5 * k }} />
              {labels && (
                <g fill={ON[b]} textAnchor="middle">
                  <text x={lx} y={ly + 6 * k} className="dj-slice__name" style={{ fontSize: 64 * k }}>{NAMES[b]}</text>
                  <text x={lx} y={ly + 44 * k} className="dj-slice__share" style={{ fontSize: 26 * k }}>{s * 100}{" "}%</text>
                </g>
              )}
            </g>
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} className="dj-rim" style={{ strokeWidth: 3 * Math.max(k, 0.5) }} />
      <rect x={cx - r * 0.07} y={cy - r * 0.07} width={r * 0.14} height={r * 0.14} className="dj-hub" />
      <polygon points={`${cx - 24 * k},${cy - r - 40 * k} ${cx + 24 * k},${cy - r - 40 * k} ${cx},${cy - r + 10 * k}`} className="dj-pointer" />
    </g>
  );
};

// ---- Dlaždice s pomenovaním scény: farby v cykle žltá → tyrkysová → červená, náklon sa strieda ----
type Tone = "yellow" | "teal" | "red";
const TILES: [number, number, Tone, string][] = [
  [0, T.rules, "yellow", "Prečo malé značky prehrávajú dvakrát?"],
  [T.rules, T.one, "teal", "Nákupy ako ruleta"],
  [T.one, T.crowd, "red", "Jeden zákazník"],
  [T.crowd, T.penA, "yellow", "1 000 zákazníkov"],
  [T.penA, T.freq, "teal", "Prvá strata: menej kupujúcich"],
  [T.freq, T.mech, "red", "Druhá strata: menej nákupov"],
  [T.mech, T.why, "yellow", "Prečo kupujú zriedkavejšie?"],
  [T.why, T.end, "teal", "Výsek je trhový podiel"],
];
const Tiles = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {TILES.map(([a, b, tone, text], i) => {
        if (f < a || f > b) return null;
        const cw = i % 2 === 1, r = cw ? 2 : -2;
        const p = slap(f, a + 2, fps);
        const away = prog(f, b - 12, 12, Easing.in(Easing.cubic));
        return (
          <div key={text} className={`dj-tile dj-tile--${i === 0 ? "hook" : "scene"} f-tile--${tone}`} style={{
            opacity: interpolate(f - a - 2, [0, 4], [0, 1], clamp),
            transform: `translateX(${-1300 * away}px) scale(${interpolate(p, [0, 1], [1.3, 1])}) rotate(${interpolate(p, [0, 1], [r * 4, r])}deg)`,
          }}>{text}</div>
        );
      })}
    </>
  );
};

// ---- Béžový blok dole: veta scény ----
const hero = SIM.hero, heroD = hero.filter((b) => b === 3).length;
const LINES: [number, number, string][] = [
  [0, T.rules, "Zákon double jeopardy vysvetlený na rulete."],
  [T.rules, T.one, "Každý nákup je jedno zatočenie. Šírka výseku zodpovedá podielu značky na trhu."],
  [T.one, T.crowd, `Za rok nakúpi ${TIMES[hero.length]}. Malú značku D pritom trafí iba ${TIMES[heroD]}.`],
  [T.crowd, T.penA, "To isté zopakujeme s tisíckou zákazníkov. Všetci točia rovnakým kolesom."],
  [T.penA, T.penD, `Veľkú značku A si aspoň raz kúpilo ${num(SIM.buyers[0])} z nich.`],
  [T.penD, T.freq, `Malú značku D iba ${num(SIM.buyers[3])}. Užší výsek znamená oveľa menej kupujúcich.`],
  [T.freq, T.mech, "Kto si D kúpil, kupuje ju aj zriedkavejšie. Rozdiel je však menší ako pri počte kupujúcich."],
  [T.mech, T.mech2, "Každý ďalší nákup je nové zatočenie toho istého kolesa."],
  [T.mech2, T.mech3, `Kto začal značkou A, trafí ju znova pri ${SHARES[0] * 100} % zatočení. Kto začal značkou D, iba pri ${SHARES[3] * 100} %.`],
  [T.mech3, T.why, "Jeden nákup má každý kupujúci istý. Šírka výseku rozhoduje iba o opakovaných nákupoch, preto je druhá strata menšia."],
  [T.why, T.end, "Šírka výseku je trhový podiel značky. Nikto tu D nemá menej rád, má iba menší podiel."],
];
const Block = () => {
  const f = useCurrentFrame();
  const rise = prog(f, 4, 18, Easing.out(Easing.exp));
  return (
    <div className="dj-block" style={{ transform: `translateY(${(1 - rise) * 100}%)` }}>
      {LINES.map(([a, b, t]) => {
        const p = prog(f, a + 8, 14);
        return <p key={t} className="dj-line" style={{ opacity: p * interpolate(f, [b - 8, b], [1, 0], clamp), transform: `translateY(${(1 - p) * 24}px)` }}>{t}</p>;
      })}
    </div>
  );
};

// ---- Koleso: úvod, pravidlá, jeden zákazník; v dave sa zmenší a točí ďalej, v závere sa vráti s výsekom D ----
const WHEEL = { cx: 468, cy: 330, r: 290 };
const SMALL = { cx: 60, cy: 642, r: 44 }; // pod mriežkou (končí na 570), zarovno s počítadlom
const WheelStage = () => {
  const f = useCurrentFrame();
  const shrink = prog(f, T.crowd, 18, inOut);
  const back = prog(f, T.why, 20, inOut);
  const lerp = (a: number, b: number) => a + (b - a) * shrink;
  const intro = prog(f, 0, 18);
  const leave = prog(f, T.end - 14, 14, Easing.in(Easing.cubic));
  const op = f < T.why ? intro * (1 - prog(f, T.penA, 12, Easing.linear)) : back * (1 - leave);
  const dimOthers = prog(f, T.why + 24, 20, inOut);
  const s = f < T.why ? 0.6 + 0.4 * intro : (0.85 + 0.15 * back) * (1 - 0.3 * leave);
  return (
    <svg className="dj-svg" viewBox={`0 0 936 ${STAGE_H}`} style={{ opacity: op }}>
      <g transform={`translate(${WHEEL.cx * (1 - s)} ${WHEEL.cy * (1 - s)}) scale(${s})`}>
        {f < T.why
          ? <Wheel cx={lerp(WHEEL.cx, SMALL.cx)} cy={lerp(WHEEL.cy, SMALL.cy)} r={lerp(WHEEL.r, SMALL.r)} rot={rotAt(f)} labels={shrink < 0.5} />
          : <Wheel {...WHEEL} rot={WHY_ROT} dim={[1, 1, 1, 0].map((d) => (d ? 1 - 0.78 * dimOthers : 1))} />}
      </g>
      <Chips />
    </svg>
  );
};

// Výsledky zatočení vzorového zákazníka: štvorce pod kolesom
const Chips = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = hero.length, size = 72, gap = 96, x0 = 468 - ((n - 1) * gap) / 2, y = 664;
  return (
    <g opacity={win(f, T.one + 8, T.crowd + 12)}>
      {hero.map((b, i) => {
        const p = slap(f, spinAt(i) + SPIN, fps);
        const x = x0 + i * gap;
        const ring = b === 3 ? prog(f, spinAt(i) + SPIN, 24) : 0;
        return (
          <g key={i}>
            <rect x={x - size / 2} y={y - size / 2} width={size} height={size} className="dj-slot" />
            {ring > 0 && <rect x={x - size / 2 - 24 * ring} y={y - size / 2 - 24 * ring} width={size + 48 * ring} height={size + 48 * ring} className="dj-ring" opacity={1 - ring} />}
            <g transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [1.35, 1])}) rotate(${interpolate(p, [0, 1], [i % 2 ? 8 : -8, 0])})`} opacity={interpolate(f - spinAt(i) - SPIN, [0, 4], [0, 1], clamp)}>
              <rect x={-size / 2} y={-size / 2} width={size} height={size} fill={COLORS[b]} />
              <text y={14} textAnchor="middle" fill={ON[b]} className="dj-chip">{NAMES[b]}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

// ---- Dav 1 000 zákazníkov: štvorce 40 × 25 ----
const PITCH = 23, GRID_X = (936 - 39 * PITCH) / 2;
const revealAt = (i: number) => T.crowd + 24 + (SIM.rank[i] / N) * 96;
function dotColor(f: number, i: number): string | null {
  const p = SIM.people[i], t0 = revealAt(i);
  if (f < t0) return null;
  const shown = p[Math.min(p.length - 1, Math.floor((f - t0) / 3))];
  let c = COLORS[shown];
  const a = prog(f, T.penA, 15), d = prog(f, T.penD, 15);
  if (a > 0) c = mix(COLORS[shown], p.includes(0) ? COLORS[0] : FAINT, a);
  if (d > 0) c = mix(p.includes(0) ? COLORS[0] : FAINT, p.includes(3) ? COLORS[3] : FAINT, d);
  return c;
}
const Stat = ({ b, value, label, style }: { b: number | null; value: string; label: string; style: React.CSSProperties }) => (
  <div className="dj-stat" style={style}>
    {b !== null && <span className="dj-stat__mark" style={{ background: COLORS[b] }} />}
    <span className="dj-stat__value">{value}</span>
    <span className="dj-stat__label">{label}</span>
  </div>
);
const Crowd = () => {
  const f = useCurrentFrame();
  const op = win(f, T.crowd + 16, T.freq + 8, 12); // až keď sa koleso zmenší, aby cez dav neprechádzalo
  if (op <= 0) return null;
  const size = PITCH - 5, statY = 642;
  const spins = SIM.people.reduce((s, p, i) => s + (f >= revealAt(i) ? p.length : 0), 0);
  return (
    <div className="dj-layer" style={{ opacity: op }}>
      <svg className="dj-svg" viewBox={`0 0 936 ${STAGE_H}`}>
        {SIM.people.map((_, i) => {
          const c = dotColor(f, i);
          const x = GRID_X + (i % 40) * PITCH - size / 2, y = Math.floor(i / 40) * PITCH;
          return c ? <rect key={i} x={x} y={y} width={size} height={size} fill={c} /> : <rect key={i} x={x + 1} y={y + 1} width={size - 2} height={size - 2} className="dj-empty" />;
        })}
      </svg>
      <Stat b={null} value={num(spins)} label="zatočení kolesa" style={{ left: 148, top: statY, opacity: 1 - prog(f, T.penA, 10, Easing.linear) }} />
      <Stat b={0} value={num(SIM.buyers[0])} label="si kúpilo A" style={{ left: 0, top: statY, opacity: prog(f, T.penA + 6, 14) * (1 - 0.6 * prog(f, T.penD, 14)) }} />
      <Stat b={3} value={num(SIM.buyers[3])} label="si kúpilo D" style={{ left: 488, top: statY, opacity: prog(f, T.penD + 6, 14) }} />
    </div>
  );
};

// ---- Tabuľka double jeopardy: počet kupujúcich klesá strmo, nákupy na kupujúceho mierne ----
const Table = () => {
  const f = useCurrentFrame();
  const op = win(f, T.freq, T.mech + 6, 16);
  if (op <= 0) return null;
  const top = 64, row = 136;
  const maxB = Math.max(...SIM.buyers), maxF = Math.max(...SIM.freq);
  return (
    <div className="dj-layer" style={{ opacity: op }}>
      <div className="dj-th" style={{ left: 168 }}>Kupujúci z&nbsp;1&nbsp;000</div>
      <div className="dj-th" style={{ left: 576 }}>Nákupy na kupujúceho</div>
      {SHARES.map((s, b) => {
        const pb = prog(f, T.freq + 10 + b * 5, 24, inOut), pf = prog(f, T.freq + 54 + b * 5, 24, inOut);
        const wb = (SIM.buyers[b] / maxB) * 260 * pb, wf = (SIM.freq[b] / maxF) * 250 * pf;
        return (
          <div key={b} className="dj-row" style={{ top: top + b * row }}>
            <span className="dj-row__chip" style={{ background: COLORS[b], color: ON[b] }}>{NAMES[b]}</span>
            <span className="dj-row__share">{s * 100}&nbsp;%</span>
            <span className="dj-bar" style={{ left: 168, width: wb, background: COLORS[b] }} />
            <span className="dj-row__value" style={{ left: 168 + wb + 16, opacity: pb }}>{num(SIM.buyers[b])}</span>
            <span className="dj-bar" style={{ left: 576, width: wf, background: COLORS[b] }} />
            <span className="dj-row__value" style={{ left: 576 + wf + 16, opacity: pf }}>{dec(SIM.freq[b])}</span>
          </div>
        );
      })}
      <p className="dj-source" style={{ top: top + 4 * row + 8 }}>Simulácia 1&nbsp;000 zákazníkov, zjednodušený model NBD-Dirichlet (Goodhardt, Ehrenberg, Chatfield, 1984).</p>
    </div>
  );
};

// ---- Prečo zriedkavejšie: 8 ľudí, ktorí začali značkou A, a 8, ktorí začali D; stĺpec = jeden človek so 4 nákupmi ----
// Prvý riadok je nákup, ktorým začali; ďalšie tri sú nové zatočenia toho istého kolesa.
const MP = 54, MS = 48, MROW = 86, MOFF = 44, MTOP = MOFF + 60;
const Mechanism = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = win(f, T.mech, T.why + 6, 16);
  if (op <= 0) return null;
  const dimOthers = prog(f, T.mech2 + 10, 18);
  const band = slap(f, T.mech3 + 10, fps);
  const bandOp = interpolate(f - T.mech3 - 10, [0, 4], [0, 1], clamp);
  const after = prog(f, T.mech2 + 40, 16);
  const below = MTOP + 3 * MROW + MS;
  return (
    <div className="dj-layer" style={{ opacity: op }}>
      {/* žltý pás za prvým riadkom: prvý nákup má každý istý */}
      <div className="dj-band" style={{ top: MTOP - 18, opacity: bandOp, transform: `scale(${interpolate(band, [0, 1], [1.3, 1])}) rotate(${interpolate(band, [0, 1], [-6, -1.5])}deg)` }} />
      <svg className="dj-svg" viewBox={`0 0 936 ${STAGE_H}`}>
        {SIM.samples.map((people, side) => {
          const b = side ? 3 : 0, x0 = side ? 496 : 0, cx0 = x0 + (440 - 7 * MP) / 2;
          return (
            <g key={side}>
              <text x={x0 + 220} y={MOFF + 24} textAnchor="middle" className="dj-head">8 ľudí, ktorí začali značkou {NAMES[b]}</text>
              {people.map((p, i) => p.map((c, j) => {
                const x = cx0 + i * MP - MS / 2, y = MTOP + j * MROW;
                // prvý riadok sa zjaví, ďalšie sa „roztočia“ a usadia na výsledku simulácie
                const t0 = j === 0 ? T.mech + 12 + i * 2 : T.mech + 34 + (j - 1) * 14 + i * 2;
                if (f < t0) return <rect key={`${i}-${j}`} x={x + 1} y={y + 1} width={MS - 2} height={MS - 2} className="dj-empty" />;
                const settled = j === 0 || f >= t0 + 14;
                const shown = settled ? c : Math.floor((f + i * 7 + j * 3) / 3) % 4;
                const fill = c === b || !settled ? COLORS[shown] : mix(COLORS[shown], FAINT, dimOthers);
                return (
                  <g key={`${i}-${j}`}>
                    <rect x={x} y={y} width={MS} height={MS} fill={fill} />
                    {settled && c === b && <text x={x + MS / 2} y={y + MS / 2 + 10} textAnchor="middle" fill={ON[b]} className="dj-mini">{NAMES[b]}</text>}
                  </g>
                );
              }))}
            </g>
          );
        })}
      </svg>
      {[0, 3].map((b, side) => (
        <div key={b} className="dj-calc" style={{ left: side ? 496 : 0, top: below + 40, opacity: after }}>
          <div className="dj-calc__hits">šanca na {NAMES[b]} pri ďalšom nákupe: {SHARES[b] * 100} %</div>
          <div className="dj-calc__formula"><span className="dj-calc__one" style={{ background: `rgb(250 226 123 / ${bandOp})` }}>1</span> + 3 × {SHARES[b] * 100}&nbsp;% ≈ {dec(1 + 3 * SHARES[b])}</div>
          <div className="dj-calc__note">nákupu značky {NAMES[b]} na&nbsp;človeka</div>
        </div>
      ))}
    </div>
  );
};

// ---- Záver: dva pásy vybiehajú za okraje, béžový blok s vetou a červenou URL ----
const End = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bands: [Tone, number, string][] = [["yellow", -2, "Podiel nerastie vernosťou."], ["teal", 2, "Rastie počtom kupujúcich."]];
  const block = prog(f, T.end + 30, 18, Easing.out(Easing.exp));
  const url = slap(f, T.end + 56, fps);
  if (f < T.end) return null;
  return (
    <AbsoluteFill className="dj-end">
      <div className="dj-end__bands">
        {bands.map(([tone, r, text], i) => {
          const p = slap(f, T.end + 4 + i * 10, fps);
          return (
            <div key={text} className={`dj-end__band dj-end__band--${i + 1} f-tile--${tone}`} style={{
              opacity: interpolate(f - T.end - 4 - i * 10, [0, 4], [0, 1], clamp),
              transform: `scale(${interpolate(p, [0, 1], [1.3, 1])}) rotate(${interpolate(p, [0, 1], [r * 4, r])}deg)`,
            }}>{text}</div>
          );
        })}
      </div>
      <div className="dj-end__block" style={{ transform: `translateY(${(1 - block) * 100}%)` }}>
        <p className="dj-line dj-end__line">Väčší trhový podiel získate, keď si na značku spomenie a kúpi ju viac ľudí.</p>
        <span className="f-url f-url--primary dj-end__url" style={{ opacity: interpolate(f - T.end - 56, [0, 4], [0, 1], clamp), transform: `scale(${interpolate(url, [0, 1], [1.3, 1])})` }}>fameworks.sk/manifest</span>
      </div>
    </AbsoluteFill>
  );
};

export const DoubleJeopardy = ({ format = "portrait" }: { format?: DJFormat }) => {
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => { document.fonts.ready.then(() => continueRender(handle)); }, [handle]);
  const end = useCurrentFrame() >= T.end;
  return (
    <AbsoluteFill className={`slide dj dj--${format}`}>
      {!end && (
        <>
          <div className="dj-stage">
            <WheelStage />
            <Crowd />
            <Table />
            <Mechanism />
          </div>
          <Tiles />
        </>
      )}
      <Block />
      <End />
      <header className="f-header dj-header">
        <Img className="f-logo" src={staticFile("brand/logo.png")} />
        <span className="f-counter">Zákony marketingu 01</span>
      </header>
    </AbsoluteFill>
  );
};
