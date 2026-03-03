import { removePaywall } from './paywallRemover';

export function initMiniPlayer() {
    window.documentPictureInPicture.addEventListener('enter', (event: Event) => {
        const pipWindow = (event as DocumentPictureInPictureEvent).window;
        console.log('PiP opened!', pipWindow);
        removePaywall(pipWindow);
    });
}