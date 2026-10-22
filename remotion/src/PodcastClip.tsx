// Klip z rozhovoru (2museCast „Je Patri FAME?“) na 4:5: záber ako samolepka v ráme, téma v dlaždici, menovka,
// titulky so zvýrazneným práve vysloveným slovom a záver s výzvou. Záber a logo sú v public dire postu
// (posts/2026-10-video-2musecast-klipy/public), titulky a časy slov v klipy.ts.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./podcast.css";
import { pages } from "./captions";
import { KLIPY, type Word } from "./klipy";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const FPS = 30;
export const OUTRO_S = 3.5;

function useSlap(start: number, r0: number, r: number, s0 = 1.3) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  return {
    opacity: interpolate(frame - start, [0, 4], [0, 1], clamp),
    transform: `scale(${interpolate(p, [0, 1], [s0, 1])}) rotate(${interpolate(p, [0, 1], [r0, r])}deg)`,
  };
}

function useAway(start: number) {
  const t = interpolate(useCurrentFrame() - start, [0, 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { t, transform: `translateX(${-130 * t}%)` };
}

const Captions = ({ words }: { words: Word[] }) => {
  const t = useCurrentFrame() / FPS;
  const ps = pages(words);
  const page = ps.find((p, i) => {
    const start = p[0][0].t0;
    const next = ps[i + 1]?.[0][0].t0 ?? Infinity;
    return t >= start - 0.05 && t < next - 0.05;
  });
  if (!page) return null;
  const end = page[page.length - 1].at(-1)!.t1;
  if (t > end + 1.2) return null; // pauza bez reči: titulok zmizne
  return (
    <div className="pc-captions">
      {page.map((line, i) => (
        <p key={i}>
          {line.map((w, j) => (
            <span key={j} className={`pc-word${w.host ? " pc-word--host" : ""}${t >= w.t0 && t < (w.next ?? w.t1 + 0.4) ? " pc-word--on" : ""}`}>{w.w}</span>
          ))}
        </p>
      ))}
    </div>
  );
};

export const PodcastClip = ({ id }: { id: keyof typeof KLIPY }) => {
  const k = KLIPY[id];
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  const end = Math.round(k.duration * FPS); // koniec záberu = začiatok záveru
  const words = k.words.map((w, i) => ({ ...w, next: k.words[i + 1]?.t0 }));

  const title = useSlap(4, -8, -2);
  const shotIn = interpolate(frame, [0, 14], [110, 0], { ...clamp, easing: Easing.out(Easing.back(1.1)) });
  const tag = useSlap(Math.round(k.speakerFrom * FPS), 8, -2);
  const away = useAway(end - 6);

  const o1 = useSlap(end + 6, -8, -2);
  const o2 = useSlap(end + 22, 8, 2, 1.5);
  const wipe = interpolate(frame, [end - 4, end + 8], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill className="slide slide--portrait pc">
      <header className="f-header pc-head">
        <Img className="f-logo" src={staticFile("brand/logo.png")} />
        <span className="f-counter pc-source">Rozhovor 2museCast</span>
      </header>

      {away.t < 1 && (
        <div style={{ transform: away.transform }}>
          <div className="f-tile f-tile--yellow pc-title" style={title}>
            <h1 className="f-tile__title">{k.title}</h1>
          </div>
          <div className="f-shot pc-shot" style={{ transform: `translateX(${shotIn}%) rotate(2deg)` }}>
            <div className="pc-shot__video">
              <OffthreadVideo src={staticFile(k.src)} endAt={end} />
            </div>
          </div>
          {frame >= k.speakerFrom * FPS && (
            <div className="f-tile f-tile--red pc-tag" style={tag}>
              <strong>{k.speaker}</strong>
              <span>{k.role}</span>
            </div>
          )}
          <Captions words={words} />
        </div>
      )}

      {frame >= end - 4 && (
        <AbsoluteFill className="pc-outro" style={{ transform: `translateY(${wipe}%)` }}>
          <header className="f-header pc-head">
            <Img className="f-logo" src={staticFile("brand/logo.png")} />
          </header>
          <div className="f-tile f-tile--yellow pc-outro__tile" style={o1}>
            Priatelia aplikovanej marketingovej vedy
          </div>
          <div className="f-url f-url--primary pc-outro__url" style={o2}>fameworks.sk/clenstvo</div>
          <p className="pc-outro__credit">Celý rozhovor: podcast 2museCast</p>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
