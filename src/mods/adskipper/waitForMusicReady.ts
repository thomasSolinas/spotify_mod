//DONE
const NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';

export function waitForMusicReady(onReady: (nowPlayingWidget: HTMLElement) => void): void {
    // Short-circuit if widget already exists (mid-session init)
    let nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR) as HTMLElement;
    if (nowPlayingWidget !== null) {
        
        onReady(nowPlayingWidget);
        return;
    }

    const observer = new MutationObserver(() => {
        nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR) as HTMLElement;
        // Check if the now-playing widget has appeared
        if (nowPlayingWidget !== null) {
            observer.disconnect();
            
            // Call the callback with the now-playing widget as parameter
            onReady(nowPlayingWidget);
        }
    });

    //observe for change in body
    observer.observe(document.body, { childList: true, subtree: true });
}