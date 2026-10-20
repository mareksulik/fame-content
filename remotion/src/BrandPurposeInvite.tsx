// Pozvánka na podujatie „Funguje brand purpose?“ (20. 11. 2026). Texty doslovne zo stránky
// fameworks.sk/eventy/funguje-brand-purpose (20. 10. 2026); fotky rečníkov dodal zadávateľ (system/media/speakers).
// Úvod, štyria rečníci, záver s miestom, vstupným a odkazom. 4:5, 21 s.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./invite.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SPEAKERS = [
  { photo: "steve-harrison.jpg", pos: "50% 22%", zoom: 1, tone: "yellow", label: "Hlavný rečník", name: "Steve Harrison", role: "Bývalý európsky kreatívny riaditeľ Ogilvy a globálny kreatívny riaditeľ Wunderman", talk: "The Price of Purpose" },
  { photo: "richard-marecek.jpg", pos: "50% 30%", zoom: 1, tone: "teal", label: "Rečník", name: "Richard Mareček", role: "Marketingový stratég", talk: "Potrebujú značky vôbec nejaký vyšší cieľ?" },
  { photo: "roman-jazudek.jpg", pos: "62% 32%", zoom: 1.7, tone: "red", label: "Rečník", name: "Roman Jazudek", role: "B2B Marketing Team Lead, Slovenská sporiteľňa", talk: "Čo hovorí marketingová veda: Metaštúdie o brand purpose" },
  { photo: "rastislav-benka.jpg", pos: "50% 30%", zoom: 1, tone: "yellow", label: "Rečník", name: "Rastislav Benka", role: "Marketing expert, Slovenská sporiteľňa", talk: "Budúcnosť je vaša. Ako k brand purpose pristupuje Slovenská sporiteľňa" },
] as const;

// Začiatky scén (30 fps): Steve Harrison má dlhší záber.
const STARTS = [96, 216, 312, 408];
const END = 504;
export const INVITE_FRAMES = 630;

const nb = (s: string) => s.replace(/(^|[\s(„])([aikosuvzAIKOSUVZ]) /g, "$1$2 ");

function useSlap(start: number, r0: number, r: number, s0 = 1.3) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  return {
    opacity: interpolate(frame - start, [0, 4], [0, 1], clamp),
    transform: `scale(${interpolate(p, [0, 1], [s0, 1])}) rotate(${interpolate(p, [0, 1], [r0, r])}deg)`,
  };
}

function useRise(start: number) {
  const t = interpolate(useCurrentFrame() - start, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return { opacity: t, transform: `translateY(${(1 - t) * 36}px)` };
}

// Nová scéna prekryje predchádzajúcu posunom sprava.
function useEnter(start: number) {
  const t = interpolate(useCurrentFrame() - start, [0, 14], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return { transform: `translateX(${t * 100}%)` };
}

const Logo = () => (
  <header className="f-header inv__head">
    <Img className="f-logo" src={staticFile("brand/logo.png")} />
  </header>
);

const Intro = () => {
  const a = useSlap(4, -10, -2);
  const b = useSlap(16, 10, 2);
  const c = useSlap(32, -8, -1.5);
  const lead = useRise(44);
  return (
    <AbsoluteFill className="inv">
      <Logo />
      <div className="inv__stack">
        <div className="inv__big f-tile--yellow" style={a}>Funguje</div>
        <div className="inv__big inv__big--2 f-tile--teal" style={b}>brand purpose?</div>
        <div className="inv__date f-tile--red" style={c}>20. 11. 2026, 18:00</div>
        <p className="inv__lead" style={lead}>Zmenili sa marketéri na aktivistov? Funguje to, alebo to treba zmeniť?</p>
      </div>
    </AbsoluteFill>
  );
};

const Speaker = ({ i }: { i: number }) => {
  const frame = useCurrentFrame();
  const s = SPEAKERS[i];
  const start = STARTS[i];
  const dur = (STARTS[i + 1] ?? END) - start;
  const enter = useEnter(start);
  const r = i % 2 === 0 ? -2 : 2;
  const name = useSlap(start + 12, r * 4, r);
  const role = useRise(start + 22);
  const talk = useRise(start + 30);
  const zoom = s.zoom * interpolate(frame - start, [0, dur + 14], [1.1, 1], clamp);
  if (frame < start || frame > start + dur + 16) return null;
  return (
    <AbsoluteFill className="inv" style={enter}>
      <Logo />
      <span className="inv__label">{s.label}</span>
      <div className="inv__photo" style={{ transform: `rotate(${-r / 2}deg)` }}>
        <Img src={staticFile(`media/speakers/${s.photo}`)} style={{ objectPosition: s.pos, transformOrigin: s.pos, transform: `scale(${zoom})` }} />
      </div>
      <div className={`inv__name f-tile--${s.tone}`} style={name}>{s.name}</div>
      <div className="inv__text">
        <p className="inv__role" style={role}>{nb(s.role)}</p>
        <p className="inv__talk" style={talk}>{nb(s.talk)}</p>
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(END);
  const fly = (start: number, dir: number, rot: number) => {
    const p = spring({ frame: frame - start, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
    return { transform: `translateX(${(1 - p) * 120 * dir}%) rotate(${interpolate(p, [0, 1], [dir * 8, rot])}deg)` };
  };
  const price = useRise(END + 34);
  const url = useSlap(END + 50, 8, -2, 1.5);
  if (frame < END) return null;
  return (
    <AbsoluteFill className="inv" style={enter}>
      <Logo />
      <div className="inv__facts">
        <div className="inv__fact f-tile--yellow" style={fly(END + 10, -1, -2)}>20. 11. 2026, 18:00</div>
        <div className="inv__fact inv__fact--2 f-tile--teal" style={fly(END + 20, 1, 2)}>Ďatelinová 5530/6, Bratislava</div>
      </div>
      <div className="inv__price" style={price}>
        <p>Členovia FAME 30 € so zľavovým kódom pre členov, nečlenovia 50 €.</p>
      </div>
      <div className="inv__cta">
        <p className="inv__cta-title">Kúpiť lístky</p>
        <span className="f-url f-url--primary inv__url" style={url}>fameworks.sk/eventy/funguje-brand-purpose</span>
      </div>
    </AbsoluteFill>
  );
};

export const BrandPurposeInvite = () => {
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill className="slide slide--portrait invite">
      <Intro />
      {SPEAKERS.map((_, i) => <Speaker key={i} i={i} />)}
      <Outro />
    </AbsoluteFill>
  );
};
