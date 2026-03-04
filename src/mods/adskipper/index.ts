const NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';
const AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';


document.querySelector(AD_PLAYING_SELECTOR) !== null;

function isAdPLaying(): boolean {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        if(document.querySelector(AD_PLAYING_SELECTOR) !== null) {
            console.log("Ad is playing");
        }
    });


    observer.observe(document.querySelector(NOW_PLAYING_SELECTOR) as Node, {
        childList: true,
        subtree: true
    });

    return false;
}

// console.log(isAdPLaying());