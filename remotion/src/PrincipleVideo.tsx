// Séria „Našich 10 princípov“: jedna šablóna, údaje v principles.ts. 4:5, 8 s.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PRINCIPLES, TONES, nb } from "./principles";
import "../../system/tokens.css";
import "../../system/components.css";
import "./principle.css";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

export const PrincipleVideo = ({ n }: { n: number }) => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("fonty FAME"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);

  const p = PRINCIPLES[n - 1];
  const tone = TONES[(n - 1) % 3];
  const cw = n % 2 === 0; // náklon sa strieda medzi susednými videami
  const numberTile = useSlap(3, cw ? 10 : -10, cw ? 3 : -3);
  // Číslo sa po nalepení jemne pohybuje, aby obraz nestál.
  const breathe = interpolate(frame, [20, 239], [0, cw ? -1 : 1], clamp);
  const title = useRise(16);
  const block = interpolate(frame, [70, 88], [100, 0], { ...clamp, easing: Easing.out(Easing.exp) });
  const body = useRise(84);
  const url = useSlap(132, 5, 0);

  return (
    <AbsoluteFill className="slide slide--portrait principle">
      <header className="f-header">
        <Img className="f-logo" src={staticFile("brand/logo.png")} />
        <span className="f-counter">Princíp {n} z 10</span>
      </header>
      <div className={`f-tile f-tile--${tone} number-tile`} style={{ ...numberTile, transform: `${numberTile.transform} rotate(${breathe}deg)` }}>
        {String(n).padStart(2, "0")}
      </div>
      <h1 className="title" style={title}>{nb(p.title)}</h1>
      <div className="block" style={{ transform: `translateY(${block}%)` }}>
        <p className="f-body" style={body}>{nb(p.body)}</p>
        <div className="f-actions">
          <span className="f-url f-url--primary" style={url}>fameworks.sk/manifest</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
