import { inject } from './core/inject';
import { MOD_NAME, MODS, MOD_VERSION } from './core/config';
import { initMiniPlayerMod } from './mods/miniplayer';

inject(() => {
    console.log(`%c${MOD_NAME} v${MOD_VERSION} loaded!`, 'color: green; font-weight: bold;');
    initMiniPlayerMod();
});