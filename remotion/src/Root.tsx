import { Composition } from "remotion";
import { EvidenceBased } from "./EvidenceBased";
import { PrincipleVideo } from "./PrincipleVideo";
import { PRINCIPLES } from "./principles";

// 4:5 pre feed LinkedInu a Instagramu, 30 fps.
export const Root = () => (
  <>
    <Composition id="EvidenceBased" component={EvidenceBased} width={1080} height={1350} fps={30} durationInFrames={255} />
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
