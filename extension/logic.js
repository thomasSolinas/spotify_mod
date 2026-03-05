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

// src/mods/adskipper/adskipperConfig.ts
var AD_SKIPPER_PREFIX = `[${MOD_NAME}:${MODS.ADS}]`;

// src/mods/adskipper/waitForMusicReady.ts
var NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';
function waitForMusicReady(onReady) {
  let nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR);
  if (nowPlayingWidget !== null) {
    console.log(`${AD_SKIPPER_PREFIX} Now-playing widget already present, starting ad listener!`, nowPlayingWidget);
    onReady(nowPlayingWidget);
    return;
  }
  const observer = new MutationObserver(() => {
    nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR);
    if (nowPlayingWidget !== null) {
      observer.disconnect();
      console.log(`${AD_SKIPPER_PREFIX} Now-playing widget found! Starting ad listener...`, nowPlayingWidget);
      onReady(nowPlayingWidget);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// src/mods/adskipper/adPlayingListener.ts
var AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';
function initAdPlayingListener(nowPlayingWidget) {
  const observer = new MutationObserver(async () => {
    console.log(`${AD_SKIPPER_PREFIX} Mutation detected on now-playing widget`);
    const adPlayer = document.querySelector(AD_PLAYING_SELECTOR);
    if (adPlayer) {
      console.log(`${AD_SKIPPER_PREFIX} Ad detected! Waiting for duration to load before skipping...`);
      await waitForValidDuration();
      const audio = window._spotifyAudio;
      audio.currentTime = audio.duration - 0.5;
      console.log(`${AD_SKIPPER_PREFIX} Ad skipped!`);
    }
  });
  observer.observe(nowPlayingWidget, {
    childList: true,
    subtree: true
  });
}
function waitForValidDuration() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const audio = window._spotifyAudio;
      if (!isNaN(audio.duration) && audio.duration > 0) {
        clearInterval(interval);
        resolve();
        console.log(`${AD_SKIPPER_PREFIX} Ad duration loaded, skipping now`);
      }
    }, 100);
  });
}

// src/mods/adskipper/audioElementCapture.ts
function captureAudioElement() {
  const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src");
  if (!desc || !desc.set || !desc.get) {
    console.error(`${AD_SKIPPER_PREFIX} Failed to intercept audio src property`);
    throw new Error("Cannot hook into HTMLMediaElement.src");
  }
  Object.defineProperty(HTMLMediaElement.prototype, "src", {
    set(val) {
      window._spotifyAudio = this;
      desc.set.call(this, val);
    },
    get() {
      return desc.get.call(this);
    }
  });
  console.log(`${AD_SKIPPER_PREFIX} Audio element capture hook installed!`);
}

// src/mods/adskipper/index.ts
function initAdSkipperMod() {
  console.log(`${AD_SKIPPER_PREFIX} Initializing ad skipper mod...`);
  captureAudioElement();
  waitForMusicReady(initAdPlayingListener);
}

// src/main.ts
inject(() => {
  console.log(`%c${MOD_NAME} v${MOD_VERSION} loaded!`, "color: green; font-weight: bold;");
  initMiniPlayerMod();
  initAdSkipperMod();
});
