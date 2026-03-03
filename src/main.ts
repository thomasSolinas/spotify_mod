import { MOD_NAME, MODS, MOD_VERSION } from './core/config';
import { initMiniPlayer } from './mods/miniplayer';

console.log(`%c${MOD_NAME} v${MOD_VERSION} loaded!`, 'color: green; font-weight: bold;');

initMiniPlayer();