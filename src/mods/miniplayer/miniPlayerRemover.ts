import { MINI_PLAYER_PREFIX, PLAYER_SELECTOR } from "./miniPlayer_config";

export function initMiniPlayerRemover(pipWindow: Window) {
    // const player = pipWindow.document.querySelector(PLAYER_SELECTOR);
    pipWindow.close();
}

function closePip(pipWindow: Window) {
  pipWindow?.close();
}