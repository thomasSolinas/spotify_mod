import { MINI_PLAYER_PREFIX, PLAYER_SELECTOR } from "./miniPlayer_config";

export function initMiniPlayerRemove(pipWindow: Window) {

}

function closePip(pipWindow: Window) {
  pipWindow?.close();
}