import { MINI_PLAYER_PREFIX } from './miniPlayer_config';
import { removePaywall } from './paywallRemover';
import { initMiniPlayerRemover } from './miniPlayerRemover';

// ── Mini Player Mod ─────────────────────────────────────────────────────────────────────────────
// Returns if the mod was successfully initialized (true)
export function initMiniPlayerMod(): boolean {
    window.documentPictureInPicture.addEventListener('enter', (event: DocumentPictureInPictureEvent) => {
        const pipWindow = (event).window;
        console.log(`${MINI_PLAYER_PREFIX} PiP opened!`, pipWindow);
        removePaywall(pipWindow);
        initMiniPlayerRemover(pipWindow);
    });

    return true;
}