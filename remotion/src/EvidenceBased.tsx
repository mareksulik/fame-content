// Video „Evidence-based marketing prichádza na Slovensko“ v Remotion.
// Triedy a tokeny sú z dizajnového systému (system/tokens.css, components.css); pohyb sa počíta z čísla snímky.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../../system/tokens.css";
import "../../system/components.css";
import "./video.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// „Nalepenie“ samolepky: zmenšenie 1,3 → 1 s prekmitom a dorovnanie náklonu r0 → r.
function useSlap(start: number, r0: number, r: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } });
  return {
    opacity: interpolate(frame - start, [0, 4], [0, 1], clamp),
    transform: `scale(${interpolate(p, [0, 1], [1.3, 1])}) rotate(${interpolate(p, [0, 1], [r0, r])}deg)`,
  };
}

function useRise(start: number) {
  const frame = useCurrentFrame();
  const t = interpolate(frame - start, [0, 15], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return { opacity: t, transform: `translateY(${(1 - t) * 40}px)` };
}

// Odlet samolepky doľava pri prechode na druhú scénu.
function useAway(start: number) {
  const frame = useCurrentFrame();
  const t = interpolate(frame - start, [0, 13], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return `translateX(${-130 * t}%)`;
}

const Sticker = ({ className, start, away, r0, r, children }: { className: string; start: number; away: number; r0: number; r: number; children: React.ReactNode }) => {
  const slap = useSlap(start, r0, r);
  return (
    <div className={`sticker ${className}`} style={{ opacity: slap.opacity, transform: `${useAway(away)} ${slap.transform}` }}>
      {children}
    </div>
  );
};

export const EvidenceBased = () => {
  const frame = useCurrentFrame();
  // Fonty z tokens.css sa načítavajú lenivo; render počká, kým sú pripravené.
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  const sceneA = frame < 107; // samolepky dokončia odlet (štart 87–93, 13 snímok)
  const sceneB = frame >= 96;
  const artX = interpolate(frame, [96, 114], [110, 0], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  const artRot = interpolate(frame, [96, 114], [8, 0], clamp);
  const drift = interpolate(frame, [114, 254], [0, -36], clamp);
  const band = interpolate(frame, [102, 118], [100, 0], { ...clamp, easing: Easing.out(Easing.exp) });
  const l1 = useRise(114);
  const l2 = useRise(126);
  const l3 = useRise(141);
  const hl = useSlap(133, -7, -2);
  const url = useSlap(162, 5, 0);

  return (
    <AbsoluteFill className="slide slide--portrait">
      {sceneA && (
        <>
          <Sticker className="s1" start={3} away={87} r0={-11} r={-5}>Evidence-based</Sticker>
          <Sticker className="s2" start={13} away={90} r0={10} r={4}>marketing</Sticker>
          <Sticker className="s3" start={24} away={93} r0={-9} r={-3}>prichádza<br />na&nbsp;Slovensko!</Sticker>
        </>
      )}
      {sceneB && (
        <>
          <div className="band" style={{ transform: `translateY(${band}%) rotate(-3deg)` }} />
          <div className="art" style={{ transform: `translateX(${artX}%) rotate(${artRot}deg)` }}>
            <Img src={staticFile("media/stickers-bleed.png")} style={{ transform: `translateX(${drift}px)` }} />
          </div>
          <div className="copy">
            <p style={l1}>FAME – komunita ľudí z&nbsp;marketingu,</p>
            <p style={l2}>
              ktorí stavajú <span className="hl" style={hl}>na&nbsp;vede a&nbsp;dátach,</span>
            </p>
            <p style={l3}>nie na&nbsp;trendoch a&nbsp;pocitoch.</p>
            <span className="f-url f-url--primary url" style={url}>fameworks.sk</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
