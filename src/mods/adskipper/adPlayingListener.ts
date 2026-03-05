const NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';
const AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';


document.querySelector(AD_PLAYING_SELECTOR) !== null;

export function isAdPPlaying(): boolean {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        document.querySelector(AD_PLAYING_SELECTOR)
                ? console.log("Ad is playing")
                : console.log("No ad playing");
        
    });


    observer.observe(document.querySelector(NOW_PLAYING_SELECTOR) as Node, {
        childList: true,
        subtree: true
    });

    return false;
}

// document.querySelector('[data-testid="ad-link"]') 
//     ? console.log("Ad is playing") 
//     : console.log("No ad playing");

// document.querySelector('[data-testid="now-playing-widget"]') 
//     ? console.log("Now playing widget found") 
//     : console.log("No now playing widget found");

// console.log(isAdPLaying());