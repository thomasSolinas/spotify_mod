// MAYBE DONE
import { waitForMusicReady } from "./waitForMusicReady";
import { initAdPlayingListener } from "./adPlayingListener";
import { captureAudioElement } from './audioElementCapture';


captureAudioElement();
// wait for the music player to be ready.
// then calls initAdPlayingLinstener with the now-playing widget as a parameter

waitForMusicReady(initAdPlayingListener);
