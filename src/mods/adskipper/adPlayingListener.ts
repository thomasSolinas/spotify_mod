import { AD_SKIPPER_PREFIX } from './adskipperConfig';

const AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';

export function initAdPlayingListener(nowPlayingWidget: HTMLElement): void {

    const observer = new MutationObserver(async () => {

        console.log(`${AD_SKIPPER_PREFIX} Mutation detected on now-playing widget`);

        const adPlayer = document.querySelector(AD_PLAYING_SELECTOR);
        
        if (adPlayer) {
            console.log(`${AD_SKIPPER_PREFIX} Ad detected! Waiting for duration to load before skipping...`);
            await waitForValidDuration();
            // Save the audio elem
            const audio = window._spotifyAudio as HTMLMediaElement;
            //skip ad
            audio.currentTime = audio.duration - 0.5;
            console.log(`${AD_SKIPPER_PREFIX} Ad skipped!`);
        }

    });

    observer.observe(nowPlayingWidget, {
        childList: true,
        subtree: true
    });
}

// ad duration (window._spotifyAudio.duration) loads asynchronously, 
// so we need to wait until it's valid before trying to skip
function waitForValidDuration() : Promise<void> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const audio = window._spotifyAudio as HTMLMediaElement;
            //if duration is valid, clear interval and resolve promise
            if(!isNaN(audio.duration) && audio.duration > 0) {
                clearInterval(interval);
                resolve();
                console.log(`${AD_SKIPPER_PREFIX} Ad duration loaded, skipping now`);
            }
        }, 100);
    });
}