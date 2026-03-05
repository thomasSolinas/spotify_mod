import { AD_SKIPPER_PREFIX } from './adskipperConfig';

const NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';

export function waitForMusicReady(onReady: (nowPlayingWidget: HTMLElement) => void): void {
    // Short-circuit if widget already exists (mid-session init)
    let nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR) as HTMLElement;
    if (nowPlayingWidget !== null) {
        console.log(`${AD_SKIPPER_PREFIX} Now-playing widget already present, starting ad listener!`, nowPlayingWidget);
        onReady(nowPlayingWidget);
        return;
    }

    const observer = new MutationObserver(() => {
        nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR) as HTMLElement;
        // Check if the now-playing widget has appeared
        if (nowPlayingWidget !== null) {
            observer.disconnect();
            console.log(`${AD_SKIPPER_PREFIX} Now-playing widget found! Starting ad listener...`, nowPlayingWidget);
            
            // Call the callback with the now-playing widget as parameter
            onReady(nowPlayingWidget);
        }
    });

    //observe for change in body
    observer.observe(document.body, { childList: true, subtree: true });
}