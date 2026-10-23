import { Composition } from "remotion";
import { BrandPurposeInvite, INVITE_FRAMES } from "./BrandPurposeInvite";
import { EbbieRepertoar } from "./EbbieRepertoar";
import { EvidenceBased } from "./EvidenceBased";
import { KLIPY } from "./klipy";
import { FPS, OUTRO_S, PodcastClip } from "./PodcastClip";
import { PrincipleVideo } from "./PrincipleVideo";
import { PRINCIPLES } from "./principles";

// 4:5 pre feed LinkedInu a Instagramu, 30 fps.
export const Root = () => (
  <>
    <Composition id="BrandPurposeInvite" component={BrandPurposeInvite} width={1080} height={1350} fps={30} durationInFrames={INVITE_FRAMES} />
    <Composition id="EbbieRepertoar" component={EbbieRepertoar} width={1080} height={1350} fps={30} durationInFrames={660} />
    <Composition id="EvidenceBased" component={EvidenceBased} width={1080} height={1350} fps={30} durationInFrames={255} />
    {/* Klipy z rozhovoru 2museCast: render s --public-dir ../posts/2026-10-video-2musecast-klipy/public */}
    {(Object.keys(KLIPY) as (keyof typeof KLIPY)[]).map((id) => (
      <Composition
        key={id}
        id={`Klip-${id}`}
        component={PodcastClip}
        defaultProps={{ id }}
        width={1080}
        height={1350}
        fps={FPS}
        durationInFrames={Math.round((KLIPY[id].duration + OUTRO_S) * FPS)}
      />
    ))}
    {(Object.keys(KLIPY) as (keyof typeof KLIPY)[]).map((id) => (
      <Composition
        key={`full-${id}`}
        id={`KlipFull-${id}`}
        component={PodcastClip}
        defaultProps={{ id, variant: "full" as const }}
        width={1080}
        height={1350}
        fps={FPS}
        durationInFrames={Math.round((KLIPY[id].duration + OUTRO_S) * FPS)}
      />
    ))}
    {PRINCIPLES.map((p) => (
      <Composition
        key={p.n}
        id={`Princip${String(p.n).padStart(2, "0")}`}
        component={PrincipleVideo}
        defaultProps={{ n: p.n }}
        width={1080}
        height={1350}
        fps={30}
        durationInFrames={240}
      />
    ))}
  </>
);
