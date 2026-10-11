// Video Ebbie: reálna otázka „Kupujú ľudia verne jednu značku, alebo repertoár značiek?“ a jej zdieľaná odpoveď
// (ebbie.sk/a/1047e3d5-…, 11. 10. 2026). Snímky obrazovky: posts/2026-10-remotion-ebbie-repertoar/capture.mjs.
// Farebné pásy vysvetľujú, čo sa práve deje na obrazovke. 4:5, 18 s.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./ebbie.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inOut = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const K = 1.5; // snímka má 1,5× CSS px stránky (viewport 720 px = plátno 1080 px)

// Posun odpovede v CSS px stránky: úvod, hranice poznania, Verdikt a Zdroje, veta pre marketéra, späť hore.
const SCROLL: [number[], number[]] = [
  [96, 170, 180, 205, 300, 308, 330, 420, 445],
  [0, 170, 170, 1270, 1670, 1670, 1380, 1380, 0],
];
// Riadky vety „Pre marketéra to znamená … navyšovaním vernosti“ (zmerané na stránke odpovede).
const MARK = [[100, 1484, 663], [16, 1515, 629], [16, 1546, 648], [16, 1577, 695], [16, 1608, 192]];

const BANDS = [
  { n: 1, tone: "yellow", from: 14, to: 172, r: -2, title: "Nájde relevantný výskum k vašej téme", text: "Napíšte vlastnú otázku alebo vyberte z pripravených tém." },
  { n: 2, tone: "teal", from: 200, to: 304, r: 2, title: "Posúdi, aký silný je dôkaz", text: "Typ štúdie, nezávislé overenie aj hranice platnosti." },
  { n: 3, tone: "red", from: 322, to: 414, r: -2, title: "Postaví argumentáciu pre vedenie či klienta", text: "Oddelí podložené jadro od hypotézy." },
] as const;

const Band = ({ b }: { b: (typeof BANDS)[number] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - b.from, fps, config: { damping: 12, stiffness: 170, mass: 0.7 } });
  const away = interpolate(frame - b.to, [0, 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (frame < b.from || away >= 1) return null;
  const style = {
    opacity: interpolate(frame - b.from, [0, 4], [0, 1], clamp),
    transform: `translateX(${-130 * away}%) scale(${interpolate(p, [0, 1], [1.25, 1])}) rotate(${interpolate(p, [0, 1], [b.r * 4, b.r])}deg)`,
  };
  return (
    <div className={`e-band f-tile--${b.tone}`} style={style}>
      <span className="e-band__n">{b.n}</span>
      <div>
        <h2 className="e-band__title">{b.title}</h2>
        <p className="e-band__text">{b.text}</p>
      </div>
    </div>
  );
};

export const EbbieRepertoar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  // Scéna 1: výber pripravenej otázky kurzorom.
  const move = interpolate(frame, [22, 50], [0, 1], inOut);
  const press = interpolate(frame, [52, 55, 60], [1, 0.82, 1], clamp);
  const focus = interpolate(frame, [52, 56], [0, 1], clamp);
  const startOut = interpolate(frame, [84, 96], [1, 0], clamp);

  // Scéna 2: odpoveď.
  const y = interpolate(frame, SCROLL[0], SCROLL[1], inOut);
  const markT = interpolate(frame, [338, 392], [0, MARK.length], clamp);

  // Záver.
  const end = interpolate(frame, [432, 450], [100, 0], { ...clamp, easing: Easing.out(Easing.exp) });
  const endText = interpolate(frame, [446, 462], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const url = spring({ frame: frame - 470, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });

  return (
    <AbsoluteFill className="slide slide--portrait ebbie">
      <div className="screen" style={{ transform: `translateY(${-y * K}px)` }}>
        <Img src={staticFile("media/ebbie-repertoar/answer-full.png")} />
        {MARK.map(([x, top, right], i) => (
          <div
            key={i}
            className="mark"
            style={{ left: (x - 4) * K, top: (top - 4) * K, width: (right - x + 8) * K, transform: `scaleX(${Math.min(1, Math.max(0, markT - i))})` }}
          />
        ))}
      </div>

      {startOut > 0 && (
        <AbsoluteFill style={{ opacity: startOut }}>
          <Img className="start" src={staticFile("media/ebbie-repertoar/start.png")} />
          <div className="pick" style={{ opacity: focus }} />
          <svg className="cursor" viewBox="0 0 24 24" style={{ left: interpolate(move, [0, 1], [980, 640]), top: interpolate(move, [0, 1], [1220, 668]), transform: `scale(${press})` }}>
            <path d="M3 2l17 9.5-7.5 1.8L9 21z" fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </AbsoluteFill>
      )}

      {BANDS.map((b) => <Band key={b.n} b={b} />)}

      <div className="end" style={{ transform: `translateY(${end}%)` }}>
        <p className="end__title" style={{ opacity: endText, transform: `translateY(${(1 - endText) * 40}px)` }}>Vyskúšať si ju môže každý.</p>
        <p className="end__text" style={{ opacity: endText }}>Členovia FAME majú neobmedzený prístup.</p>
        <span className="f-url f-url--primary end__url" style={{ opacity: frame >= 470 ? 1 : 0, transform: `scale(${interpolate(url, [0, 1], [1.3, 1])}) rotate(${interpolate(url, [0, 1], [6, -2])}deg)` }}>ebbie.sk</span>
      </div>
    </AbsoluteFill>
  );
};
