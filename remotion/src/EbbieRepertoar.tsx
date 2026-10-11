// Video „Ako funguje Ebbie“: reálna otázka „Kupujú ľudia verne jednu značku, alebo repertoár značiek?“ a jej zdieľaná
// odpoveď (ebbie.sk/a/1047e3d5-…, 11. 10. 2026). Snímky obrazovky: posts/2026-10-remotion-ebbie-repertoar/capture.mjs.
// Ďalšie otázky: výrez screenshotu chatu s tou istou odpoveďou (chat-followups.png, 11. 10. 2026).
// Úvod, päť krokov vo farebných pásoch, samostatný záver. 4:5, 19,5 s.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./ebbie.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inOut = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const K = 1.5; // snímka má 1,5× CSS px stránky (viewport 720 px = plátno 1080 px)

// Začiatky scén (snímky pri 30 fps).
const START = 66; // výber otázky
const ANSWER = 150; // odpoveď
const SOURCES = 230; // Verdikt a Zdroje
const CHAT = 318; // ďalšie otázky
const SHARE = 392; // zdieľanie
const END = 468; // záver

// Posun odpovede v CSS px stránky: úvod odpovede, potom Verdikt a Zdroje.
const SCROLL: [number[], number[]] = [
  [ANSWER + 12, SOURCES - 6, SOURCES + 22, CHAT - 4],
  [0, 220, 1610, 1670],
];

const BANDS = [
  { n: 1, tone: "yellow", from: START + 8, to: ANSWER - 6, r: -2, title: "Napíšte otázku alebo ju vyberte z kategórie", text: "" },
  { n: 2, tone: "teal", from: ANSWER + 16, to: SOURCES - 6, r: 2, title: "Ebbie nájde relevantný výskum k otázke a zostaví odpoveď", text: "" },
  { n: 3, tone: "red", from: SOURCES + 14, to: CHAT - 6, r: -2, title: "Posúďte, aký silný je dôkaz a ktoré zdroje sa téme venujú podrobnejšie", text: "" },
  { n: 4, tone: "yellow", from: CHAT + 16, to: SHARE - 6, r: 2, title: "Môžete sa do témy ponoriť hlbšie s ďalšími otázkami", text: "" },
  { n: 5, tone: "teal", from: SHARE + 8, to: END - 4, r: -2, title: "Odpoveď môžete vyzdieľať vašim kolegom", text: "" },
] as const;

function useSlap(start: number, r0: number, r: number, s0 = 1.3) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  return {
    opacity: interpolate(frame - start, [0, 4], [0, 1], clamp),
    transform: `scale(${interpolate(p, [0, 1], [s0, 1])}) rotate(${interpolate(p, [0, 1], [r0, r])}deg)`,
  };
}

// Odlet doľava (pásy, úvod).
function useAway(start: number) {
  const t = interpolate(useCurrentFrame() - start, [0, 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { t, transform: `translateX(${-130 * t}%)` };
}

const Band = ({ b }: { b: (typeof BANDS)[number] }) => {
  const frame = useCurrentFrame();
  const slap = useSlap(b.from, b.r * 4, b.r, 1.25);
  const away = useAway(b.to);
  if (frame < b.from || away.t >= 1) return null;
  return (
    <div className={`e-band f-tile--${b.tone}`} style={{ opacity: slap.opacity, transform: `${away.transform} ${slap.transform}` }}>
      <span className="e-band__n">{b.n}</span>
      <div>
        <h2 className="e-band__title">{b.title}</h2>
        {b.text && <p className="e-band__text">{b.text}</p>}
      </div>
    </div>
  );
};

// Úvod: otázka videa na dvoch naklonených dlaždiciach.
const Intro = () => {
  const frame = useCurrentFrame();
  const a = useSlap(6, -8, -2);
  const b = useSlap(20, 8, 2);
  const away = useAway(START - 12);
  if (frame >= START) return null;
  return (
    <AbsoluteFill className="intro" style={{ transform: away.transform }}>
      <header className="f-header intro__head">
        <Img className="f-logo" src={staticFile("brand/logo.png")} />
      </header>
      <div className="intro__tiles">
        <div className="intro__tile f-tile--yellow" style={a}>Ako funguje<br />Ebbie,</div>
        <div className="intro__tile intro__tile--2 f-tile--teal" style={b}>naša evidence-based<br />marketing asistentka?</div>
      </div>
    </AbsoluteFill>
  );
};

// Záver: slová vletia striedavo zľava a sprava, potom adresa.
const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fly = (start: number, dir: number) => {
    const p = spring({ frame: frame - start, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
    return { transform: `translateX(${(1 - p) * 120 * dir}%) rotate(${interpolate(p, [0, 1], [dir * 10, dir * -2.5])}deg)` };
  };
  const url = useSlap(END + 26, 10, -2.5, 1.5);
  const wipe = interpolate(frame, [END - 4, END + 8], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const drift = interpolate(frame, [END + 30, END + 117], [0, -24], clamp);
  if (frame < END - 4) return null;
  return (
    <AbsoluteFill className="outro" style={{ transform: `translateY(${wipe}%)` }}>
      <header className="f-header intro__head">
        <Img className="f-logo" src={staticFile("brand/logo.png")} />
      </header>
      <div className="outro__words" style={{ transform: `translateY(${drift}px)` }}>
        <div className="outro__w f-tile--yellow" style={fly(END + 6, -1)}>Vyskúšajte</div>
        <div className="outro__w outro__w--2 f-tile--teal" style={fly(END + 14, 1)}>si Ebbie</div>
        <div className="outro__w outro__w--3 f-tile--red" style={url}>na ebbie.sk</div>
      </div>
    </AbsoluteFill>
  );
};

export const EbbieRepertoar = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  // Výber pripravenej otázky kurzorom.
  const move = interpolate(frame, [START + 18, START + 46], [0, 1], inOut);
  const press = interpolate(frame, [START + 48, START + 51, START + 56], [1, 0.82, 1], clamp);
  const focus = interpolate(frame, [START + 48, START + 52], [0, 1], clamp);
  const startOut = interpolate(frame, [ANSWER, ANSWER + 12], [1, 0], clamp);

  const y = interpolate(frame, SCROLL[0], SCROLL[1], inOut);
  const chat = interpolate(frame, [CHAT, CHAT + 12], [0, 1], clamp);
  const chatY = interpolate(frame, [CHAT, SHARE], [-400, -470], inOut);
  // Krok 5: kurzor klikne na Zdieľať (tlačidlo je vo výreze na x 149–291, y 579–635).
  const sMove = interpolate(frame, [SHARE + 4, SHARE + 30], [0, 1], inOut);
  const sPress = interpolate(frame, [SHARE + 32, SHARE + 35, SHARE + 40], [1, 0.82, 1], clamp);
  const sFocus = interpolate(frame, [SHARE + 32, SHARE + 36], [0, 1], clamp);

  return (
    <AbsoluteFill className="slide slide--portrait ebbie">
      <div className="screen" style={{ transform: `translateY(${-y * K}px)` }}>
        <Img src={staticFile("media/ebbie-repertoar/answer-full.png")} />
      </div>

      {chat > 0 && (
        <AbsoluteFill style={{ opacity: chat, background: "var(--paper)" }}>
          <Img className="chat" src={staticFile("media/ebbie-repertoar/chat-followups.png")} style={{ transform: `translateY(${chatY}px)` }} />
          {frame >= SHARE && (
            <>
              <div className="share" style={{ top: chatY + 573, opacity: sFocus }} />
              <svg className="cursor" viewBox="0 0 24 24" style={{ left: interpolate(sMove, [0, 1], [760, 250]), top: interpolate(sMove, [0, 1], [560, chatY + 612]), transform: `scale(${sPress})` }}>
                <path d="M3 2l17 9.5-7.5 1.8L9 21z" fill="#000" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </>
          )}
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
      <Intro />
      <Outro />
    </AbsoluteFill>
  );
};
