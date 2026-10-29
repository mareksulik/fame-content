// FAME grafika na hotové video v pôvodnom zábere (bez orezania): orezané logo, otázka v žltej dlaždici, titulky so
// zvýraznenými slovami, menovky pri ľuďoch v zábere a záver. Jedna šablóna pre 4:5, 1:1 a 9:16; polohy podľa formátu
// (LAYOUT), lebo každý formát má inde voľné miesto. Údaje: bikoss.ts, video a logá: posts/2026-10-video-bikoss/public.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./overlay.css";
import { BIKOSS, type BikossFormat, type Line, type Tag } from "./bikoss";
import { balance } from "./captions";

export const FPS = 30;
export const OUTRO_S = 3.5;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const nbsp = (s: string) => s.replace(/(?<=^|\s)([aikosuvzAIKOSUVZ]) /g, "$1 ");

// Polohy v px plátna. 4:5 má nad aj pod záberom čierny pás, 9:16 rozmazané pozadie a spodok zakrýva rozhranie Stories.
const LAYOUT = {
  "4x5": { logoTop: 56, headTop: 196, capBottom: 104, tagBottom: 280, outroTop: 280, outroFs: 100, urlTop: 868, bandTop: 1080 },
  "1x1": { logoTop: 48, headTop: 184, capBottom: 64, tagBottom: 236, outroTop: 196, outroFs: 84, urlTop: 548, bandTop: 900 },
  "9x16": { logoTop: 96, headTop: 300, capBottom: 340, tagBottom: 520, outroTop: 420, outroFs: 104, urlTop: 1012, bandTop: 1560 },
};

function useSlap(start: number, r0: number, r: number, s0 = 1.3) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  return {
    opacity: interpolate(frame - start, [0, 4], [0, 1], clamp),
    transform: `scale(${interpolate(p, [0, 1], [s0, 1])}) rotate(${interpolate(p, [0, 1], [r0, r])}deg)`,
  };
}

function useAway(start: number, dir = -1) {
  const t = interpolate(useCurrentFrame() - start, [0, 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { t, transform: `translateX(${dir * 130 * t}%)` };
}

// Samolepka, ktorá sa nalepí v t0 a v t1 odletí (smer podľa strany).
const Timed = ({ t0, t1, r, className, style, children }: { t0: number; t1: number; r: number; className: string; style: React.CSSProperties; children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const slap = useSlap(Math.round(t0 * FPS), r * 4, r);
  const away = useAway(Math.round(t1 * FPS) - 6, r > 0 ? 1 : -1);
  if (frame < t0 * FPS || away.t >= 1) return null;
  return (
    <div className={className} style={{ ...style, opacity: slap.opacity, transform: `${away.transform} ${slap.transform}` }}>
      {children}
    </div>
  );
};

// Riadok titulkov: *slovo* je zvýraznené; zalomenie na najviac dva rovnako dlhé riadky.
const Caption = ({ line }: { line: Line }) => {
  const words = line.text.split(/\s+/).map((raw) => ({ w: raw.replace(/\*/g, ""), em: raw.includes("*") }));
  // Zvýraznenie môže zahŕňať viac slov (*Marek Šulik*): slová medzi otváracou a zatváracou hviezdičkou.
  let open = false;
  line.text.split(/\s+/).forEach((raw, i) => {
    if (raw.startsWith("*")) open = true;
    words[i].em = open;
    if (raw.replace(/[,.?!]+$/, "").endsWith("*")) open = false;
  });
  return (
    <div className="ov-captions__page">
      {balance(words, 36).map((l, i) => (
        <p key={i}>{l.map((w, j) => <span key={j} className={w.em ? "ov-w ov-w--em" : "ov-w"}>{w.w}</span>)}</p>
      ))}
    </div>
  );
};

export const OverlayClip = ({ format }: { format: BikossFormat }) => {
  const f = BIKOSS.formats[format];
  const L = LAYOUT[format];
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  const end = Math.round(BIKOSS.duration * FPS);
  const line = BIKOSS.lines.find((l) => t >= l.t0 - 0.05 && t < l.t1);
  const logoIn = useSlap(4, -6, 0, 1.2);
  const away = useAway(end - 6);
  const o1 = useSlap(end + 6, -8, -2);
  const o2 = useSlap(end + 22, 8, 2, 1.5);
  const wipe = interpolate(frame, [end - 4, end + 8], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill className="ov" style={{ width: f.width, height: f.height }}>
      <OffthreadVideo className="ov-video" src={staticFile(f.src)} endAt={end} />

      {away.t < 1 && (
        <AbsoluteFill style={{ transform: away.transform }}>
          <div className="ov-logo" style={{ top: L.logoTop, ...logoIn }}>
            <Img src={staticFile("brand/logo-web.png")} />
          </div>
          {BIKOSS.headlines.map((h: Line) => (
            <Timed key={h.t0} t0={h.t0} t1={h.t1} r={-2} className="f-tile f-tile--yellow ov-head" style={{ top: L.headTop }}>
              <h1 className="f-tile__title">{nbsp(h.text)}</h1>
            </Timed>
          ))}
          {BIKOSS.tags.map((g: Tag) => (
            <Timed key={g.name} t0={g.t0} t1={g.t1} r={g.side === "left" ? -2 : 2} className={`f-tile f-tile--red ov-tag ov-tag--${g.side}`} style={{ bottom: L.tagBottom }}>
              <strong>{g.name}</strong>
              {/* Rola po riadkoch (oddeľovač „·“), aby menovka ostala úzka pri svojom človeku. */}
              {g.role.split(" · ").map((r) => <span key={r}>{r}</span>)}
            </Timed>
          ))}
          <div className="ov-captions" style={{ bottom: L.capBottom }}>{line && <Caption line={line} />}</div>
        </AbsoluteFill>
      )}

      {frame >= end - 4 && (
        <AbsoluteFill className="ov-outro" style={{ transform: `translateY(${wipe}%)` }}>
          <Img className="ov-outro__logo" src={staticFile("brand/logo.png")} style={{ top: L.logoTop }} />
          <div className="f-tile f-tile--yellow ov-outro__tile" style={{ ...o1, top: L.outroTop, fontSize: L.outroFs }}>
            Priatelia aplikovanej marketingovej vedy
          </div>
          <div className="f-url f-url--primary ov-outro__url" style={{ ...o2, top: L.urlTop }}>
            fameworks.sk/clenstvo
          </div>
          <p className="ov-outro__credit" style={{ top: L.bandTop }}>{BIKOSS.credit}</p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
