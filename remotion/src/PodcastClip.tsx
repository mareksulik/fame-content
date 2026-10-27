// Klip z rozhovoru (2museCast „Je Patri FAME?“) na 4:5: záber ako samolepka v ráme, téma v dlaždici, menovka,
// titulky so zvýrazneným práve vysloveným slovom a záver s výzvou. Záber a logo sú v public dire postu
// (posts/2026-10-video-2musecast-klipy/public), titulky a časy slov v klipy.ts.
import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./podcast.css";
import { pages } from "./captions";
import { KLIPY, type Word } from "./klipy";
import { SHOTS, cropPlan } from "./shots";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Pevná medzera za jednopísmenovým slovom, aby neostalo na konci riadku nadpisu (DESIGN.md).
const nbsp = (s: string) => s.replace(/(?<=^|\s)([aikosuvzAIKOSUVZ]) /g, "$1 ");
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

const Captions = ({ words, over }: { words: Word[]; over: boolean }) => {
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
    <div className={over ? "pc-captions pc-captions--over" : "pc-captions"}>
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

// Variant „full“: po ZOOM_S sekundách sa záber z rámu zväčší na celé plátno 4:5 (orezané na stred). Logo je webové
// fameworks.sk/logo.png (priehľadné) a pri zväčšení sa orezá na samolepky (prvých 376 z 529 px), lebo tmavý podtitul
// by sa na zábere stratil. Téma ide do menšej dlaždice vpravo hore, menovka sa ukáže na TAG_S sekúnd, titulky sú
// biele s tmavým obrysom priamo na zábere.
export const ZOOM_S = 3;
const TAG_S = 4;
const LOGO_W = 432; // logo-web.png 529 × 186 px pri výške 152 px
const LOGO_CROP = 307; // iba samolepky FAME

export const PodcastClip = ({ id, variant = "frame" }: { id: keyof typeof KLIPY; variant?: "frame" | "full" }) => {
  const k = KLIPY[id];
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  const end = Math.round(k.duration * FPS); // koniec záberu = začiatok záveru
  const words = k.words.map((w, i) => ({ ...w, next: k.words[i + 1]?.t0 }));

  const full = variant === "full";
  const zs = ZOOM_S * FPS;
  const z = full ? interpolate(frame, [zs, zs + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const lerp = (a: number, b: number) => a + (b - a) * z;
  // Rám .pc-shot (96, 430, 960 × 540 + 20 px rám) → celé plátno: 16:9 na výšku 1350 px má šírku 2400 px,
  // vodorovný posun sleduje rečníka (shots.ts).
  const guestShot = k.speaker.startsWith("Roman") ? "B" : "A";
  const plan = useMemo(() => (full ? cropPlan(SHOTS[id] ?? [{ from: 0, type: "?" }], k.words, k.duration, guestShot) : []), [full, id, k.words, k.duration, guestShot]);
  const t = frame / FPS;
  const seg = plan.find((s) => t >= s.from && t < s.to) ?? plan[plan.length - 1];
  const cropX = seg?.x ?? -660;
  const shotBox = full ? { left: lerp(96, cropX), top: lerp(430, 0), width: lerp(1000, 2400), height: lerp(580, 1350), padding: lerp(20, 0) } : {};
  const titleOut = full ? interpolate(frame, [zs, zs + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const corner = useSlap(zs + 12, 8, 2);

  const title = useSlap(4, -8, -2);
  const shotIn = interpolate(frame, [0, 14], [110, 0], { ...clamp, easing: Easing.out(Easing.back(1.1)) });
  const tagFrom = full ? Math.max(k.speakerFrom, ZOOM_S + 0.5) : k.speakerFrom;
  const tag = useSlap(Math.round(tagFrom * FPS), 8, -2);
  const tagAway = useAway(full ? Math.round((tagFrom + TAG_S) * FPS) : Infinity);
  const away = useAway(end - 6);

  const o1 = useSlap(end + 6, -8, -2);
  const o2 = useSlap(end + 22, 8, 2, 1.5);
  const wipe = interpolate(frame, [end - 4, end + 8], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill className="slide slide--portrait pc">
      <header className="f-header pc-head" style={full ? { zIndex: 4 } : undefined}>
        {full ? (
          <div className="pc-weblogo" style={{ width: lerp(LOGO_W, LOGO_CROP) }}>
            <Img src={staticFile("brand/logo-web.png")} />
          </div>
        ) : (
          <Img className="f-logo" src={staticFile("brand/logo.png")} />
        )}
        <span className="f-counter pc-source" style={{ opacity: 1 - z }}>Rozhovor 2museCast</span>
      </header>

      {away.t < 1 && (
        <div style={{ transform: away.transform }}>
          {titleOut < 1 && (
            <div className="f-tile f-tile--yellow pc-title" style={{ opacity: title.opacity, transform: `translateY(${-160 * titleOut}%) ${title.transform}` }}>
              <h1 className="f-tile__title">{nbsp(k.title)}</h1>
            </div>
          )}
          {full && frame >= zs + 12 && (
            <div className="f-tile f-tile--yellow pc-corner" style={corner}>
              <h1 className="f-tile__title">{nbsp(k.title)}</h1>
            </div>
          )}
          <div className="f-shot pc-shot" style={{ ...shotBox, transform: `translateX(${shotIn}%) rotate(${lerp(2, 0)}deg)` }}>
            <div className="pc-shot__video" style={full ? { width: "100%", height: "100%" } : undefined}>
              <OffthreadVideo src={staticFile(k.src)} endAt={end} />
              {/* Vložené zábery až po zväčšení: v malom ráme ostáva pôvodný strih. */}
              {plan.filter((s) => s.src !== undefined && s.to > ZOOM_S).map((s) => {
                const a = Math.max(s.from, ZOOM_S);
                return (
                  <Sequence key={s.from} from={Math.round(a * FPS)} durationInFrames={Math.max(1, Math.round((s.to - a) * FPS))} layout="none">
                    <OffthreadVideo className="pc-cutaway" src={staticFile(k.src)} trimBefore={Math.round((s.src! + a - s.from) * FPS)} muted />
                  </Sequence>
                );
              })}
            </div>
          </div>
          {frame >= tagFrom * FPS && tagAway.t < 1 && (
            <div className="f-tile f-tile--red pc-tag" style={{ opacity: tag.opacity, transform: `${tagAway.transform} ${tag.transform}` }}>
              <strong>{k.speaker}</strong>
              <span>{k.role}</span>
            </div>
          )}
          <Captions words={words} over={z > 0} />
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
