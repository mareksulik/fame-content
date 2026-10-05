import { Composition } from "remotion";
import { EvidenceBased } from "./EvidenceBased";

// 4:5 pre feed LinkedInu a Instagramu, 8,5 s pri 30 fps (rovnaké ako posts/2026-10-video-evidence-based).
export const Root = () => (
  <Composition id="EvidenceBased" component={EvidenceBased} width={1080} height={1350} fps={30} durationInFrames={255} />
);
