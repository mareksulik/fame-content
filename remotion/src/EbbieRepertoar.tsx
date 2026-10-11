// Video Ebbie: reálna otázka „Kupujú ľudia verne jednu značku, alebo repertoár značiek?“ a jej zdieľaná odpoveď
// (ebbie.sk/a/1047e3d5-…, 11. 10. 2026). Snímky obrazovky: posts/2026-10-remotion-ebbie-repertoar/capture.mjs.
// Ďalšie otázky: výrez screenshotu chatu s tou istou odpoveďou (chat-followups.png, 11. 10. 2026).
// Farebné pásy vysvetľujú, čo sa práve deje na obrazovke. 4:5, 18 s.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./ebbie.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inOut = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const K = 1.5; // snímka má 1,5× CSS px stránky (viewport 720 px = plátno 1080 px)

// Posun odpovede v CSS px stránky: úvod, potom Verdikt a Zdroje.
const SCROLL: [number[], number[]] = [
  [96, 170, 180, 205, 318],
  [0, 170, 170, 1450, 1670],
];

const BANDS = [
  { n: 1, tone: "yellow", from: 8, to: 80, r: -2, title: "Napíšte alebo vyberte otázku z kategórie", text: "" },
  { n: 2, tone: "teal", from: 100, to: 186, r: 2, title: "Ebbie nájde relevantný výskum k vašej téme", text: "a zostaví odpoveď." },
  { n: 3, tone: "red", from: 210, to: 322, r: -2, title: "Posúďte, aký silný je dôkaz", text: "a ktoré zdroje sa téme venujú podrobnejšie." },
  { n: 4, tone: "yellow", from: 340, to: 424, r: 2, title: "Zobrazí vám ďalšie otázky", text: "" },
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
        {b.text && <p className="e-band__text">{b.text}</p>}
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
  const chat = interpolate(frame, [322, 334], [0, 1], clamp);
  const chatY = interpolate(frame, [322, 420], [-420, -480], inOut);

  // Záver.
  const end = interpolate(frame, [432, 450], [100, 0], { ...clamp, easing: Easing.out(Easing.exp) });
  const endText = interpolate(frame, [446, 462], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const url = spring({ frame: frame - 470, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });

  return (
    <AbsoluteFill className="slide slide--portrait ebbie">
      <div className="screen" style={{ transform: `translateY(${-y * K}px)` }}>
        <Img src={staticFile("media/ebbie-repertoar/answer-full.png")} />
      </div>

      {chat > 0 && (
        <AbsoluteFill style={{ opacity: chat, background: "var(--paper)" }}>
          <Img className="chat" src={staticFile("media/ebbie-repertoar/chat-followups.png")} style={{ transform: `translateY(${chatY}px)` }} />
        </AbsoluteFill>
      )}

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
        <span className="f-url f-url--primary end__url" style={{ opacity: frame >= 470 ? 1 : 0, transform: `scale(${interpolate(url, [0, 1], [1.3, 1])}) rotate(${interpolate(url, [0, 1], [6, -2])}deg)` }}>ebbie.sk</span>
      </div>
    </AbsoluteFill>
  );
};
