// MAYBE DONE
import { waitForMusicReady } from "./waitForMusicReady";
import { initAdPlayingListener } from "./adPlayingListener";

waitForMusicReady(() => {
    initAdPlayingListener(document.querySelector('[data-testid="now-playing-widget"]') as HTMLElement);
});