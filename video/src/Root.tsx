import { Composition } from "remotion";
import { Video } from "./Video";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MissionControlLaunch"
      component={Video}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
