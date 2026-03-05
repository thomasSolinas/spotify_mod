import { removePaywall } from './paywallRemover';
import { MINI_PLAYER_PREFIX } from './miniPlayer_config';


export function initMiniPlayerMod() {
    window.documentPictureInPicture.addEventListener('enter', (event: DocumentPictureInPictureEvent) => {
        const pipWindow = (event).window;
        console.log(`${MINI_PLAYER_PREFIX} PiP opened!`, pipWindow);
        removePaywall(pipWindow);
    });
}