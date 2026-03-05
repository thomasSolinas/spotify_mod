import { waitForMusicReady } from "./waitForMusicReady";
import { initAdPlayingListener } from "./adPlayingListener";
import { captureAudioElement } from './audioElementCapture';
import { AD_SKIPPER_PREFIX } from './adskipperConfig';


export function initAdSkipperMod(): void {
  console.log(`${AD_SKIPPER_PREFIX} Initializing ad skipper mod...`);
  captureAudioElement();
  // wait for the music player to be ready.
  // then calls initAdPlayingLinstener with the now-playing widget as a parameter

  waitForMusicReady(initAdPlayingListener);
}