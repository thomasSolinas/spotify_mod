// MAYBE DONE
import { waitForMusicReady } from "./waitForMusicReady";
import { initAdPlayingListener } from "./adPlayingListener";
import { captureAudioElement } from './audioElementCapture';


captureAudioElement();
waitForMusicReady((nowPlayingWidget) => {
  initAdPlayingListener(nowPlayingWidget);
});
