// src/core/config.ts
var MOD_NAME = "spotify-mod";
var MODS = {
  MINI_PLAYER: "miniplayer",
  ADS: "ads"
};

// src/mods/miniplayer/paywallRemover.ts
var MOD_PREFIX = `[${MOD_NAME}:${MODS.MINI_PLAYER}]`;
var PLAYER_SELECTOR = '[data-testid="pip-hover-element"]';
function removePaywall(pipWindow) {
  const observer = new MutationObserver((mutations) => {
    const player = pipWindow.document.querySelector(PLAYER_SELECTOR);
    if (player) {
      console.log(`${MOD_PREFIX} Found player element.`, player);
      const paywall = player.previousSibling;
      if (paywall) {
        paywall.remove();
        console.log(`${MOD_PREFIX} Paywall removed. 
                    \n Resizing PiP window is now possible!`);
        observer.disconnect();
      }
    }
  });
  observer.observe(pipWindow.document.body, {
    childList: true,
    subtree: true
  });
}

// src/mods/miniplayer/index.ts
function initMiniPlayer() {
  window.documentPictureInPicture.addEventListener("enter", (event) => {
    const pipWindow = event.window;
    console.log("PiP opened!", pipWindow);
    removePaywall(pipWindow);
  });
}

// src/main.ts
initMiniPlayer();
