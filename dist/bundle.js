// src/core/inject.ts
function inject(initFunction) {
  function tryInject() {
    if (window.webpackChunkclient_web) {
      window.webpackChunkclient_web.push([
        ["spotify_mod"],
        {},
        initFunction
      ]);
    } else {
      setTimeout(tryInject, 100);
    }
  }
  tryInject();
}

// src/core/config.ts
var MOD_NAME = "spotify-mod";
var MOD_VERSION = "0.1.0";
var MODS = {
  MINI_PLAYER: "miniplayer",
  ADS: "ads"
};

// src/mods/miniplayer/miniPlayer_config.ts
var MINI_PLAYER_PREFIX = `[${MOD_NAME}:${MODS.MINI_PLAYER}]`;

// src/mods/miniplayer/paywallRemover.ts
var PLAYER_SELECTOR = '[data-testid="pip-hover-element"]';
function removePaywall(pipWindow) {
  const observer = new MutationObserver((mutations) => {
    const player = pipWindow.document.querySelector(PLAYER_SELECTOR);
    if (player) {
      console.log(`${MINI_PLAYER_PREFIX} Found player element`, player);
      const paywall = player.previousSibling;
      if (paywall) {
        paywall.remove();
        console.log(`${MINI_PLAYER_PREFIX} Paywall removed. Resizing PiP window is now possible!`);
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
function initMiniPlayerMod() {
  window.documentPictureInPicture.addEventListener("enter", (event) => {
    const pipWindow = event.window;
    console.log(`${MINI_PLAYER_PREFIX} PiP opened!`, pipWindow);
    removePaywall(pipWindow);
  });
}

// src/main.ts
inject(() => {
  console.log(`%c${MOD_NAME} v${MOD_VERSION} loaded!`, "color: green; font-weight: bold;");
  initMiniPlayerMod();
});
