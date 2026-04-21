import { MINI_PLAYER_PREFIX, PLAYER_SELECTOR } from "./miniPlayer_config";
let disabled = false;

export function initMiniPlayerRemover(pipWindow: Window) {
    // const player = pipWindow.document.querySelector(PLAYER_SELECTOR);
    if(disabled) return;
    pipWindow.close();
}

export function disable() {
  disabled = true;
  console.log('miniplayer Remover disabled');
}