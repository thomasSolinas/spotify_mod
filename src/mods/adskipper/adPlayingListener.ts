//FIX
const AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';


// document.querySelector(AD_PLAYING_SELECTOR) !== null;

export function initAdPlayingListener(nowPlayingWidget: HTMLElement): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        // Check if the ad-link element is present, indicating an ad is playing
        const addPlayer = document.querySelector(AD_PLAYING_SELECTOR);
        if(addPlayer) {
            console.log("Ad is playing");
        } else {
            console.log("No ad playing");
        }

        console.log("isAdPPlaying() called with mutations:", mutations);
        
    });


    //observe the now-playing widget for changes to detect ad start/stop
    observer.observe(nowPlayingWidget, {
        childList: true,
        subtree: true
    });

}
