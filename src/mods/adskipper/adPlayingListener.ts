const AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';

export function initAdPlayingListener(nowPlayingWidget: HTMLElement): void {
    console.log('mutation fired');

    const observer = new MutationObserver(() => {
        const adPlayer = document.querySelector(AD_PLAYING_SELECTOR);
        if (adPlayer) {
            console.log('Ad detected, skipping...');
            const audio = window._spotifyAudio as HTMLMediaElement;
            audio.currentTime = audio.duration - 0.5;
        }

        // if (adPlayer) {
        //     let attempts = 0;
        //     const poll = setInterval(() => {
        //         const audio = window._spotifyAudio as HTMLMediaElement;
        //         if (!document.querySelector(AD_PLAYING_SELECTOR) || attempts >= 5) {
        //             clearInterval(poll);
        //             return;
        //         }
        //         if (!isNaN(audio.duration) && audio.duration > 0) {
        //             console.log(`Skipping ad, attempt ${attempts + 1}`);
        //             audio.currentTime = audio.duration - 0.5;
        //             attempts++;
        //         }
        //     }, 1000);
        // }


    });

    observer.observe(nowPlayingWidget, {
        childList: true,
        subtree: true
    });
}