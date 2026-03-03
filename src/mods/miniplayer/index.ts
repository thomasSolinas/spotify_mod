import { removePaywall } from './paywallRemover';

export function initMiniPlayer() {
    window.documentPictureInPicture.addEventListener('enter', (event: DocumentPictureInPictureEvent) => {
        const pipWindow = (event).window;
        console.log('PiP opened!', pipWindow);
    });
}