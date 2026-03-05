// src/mods/adskipper/waitForMusicReady.ts
var NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';
function waitForMusicReady(onReady) {
  let nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR);
  if (nowPlayingWidget !== null) {
    onReady(nowPlayingWidget);
    return;
  }
  const observer = new MutationObserver(() => {
    nowPlayingWidget = document.querySelector(NOW_PLAYING_SELECTOR);
    if (nowPlayingWidget !== null) {
      observer.disconnect();
      onReady(nowPlayingWidget);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// src/mods/adskipper/adPlayingListener.ts
var AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';
function initAdPlayingListener(nowPlayingWidget) {
  const observer = new MutationObserver(async () => {
    console.log("mutation fired");
    const adPlayer = document.querySelector(AD_PLAYING_SELECTOR);
    if (adPlayer) {
      console.log("Ad detected, waiting for duration to load before skipping...");
      await waitForValidDuration();
      const audio = window._spotifyAudio;
      audio.currentTime = audio.duration - 0.5;
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
        console.log("Ad duration loaded, skipping ad now");
      }
    }, 100);
  });
}

// src/mods/adskipper/audioElementCapture.ts
function captureAudioElement() {
  const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src");
  if (!desc || !desc.set || !desc.get) {
    console.error("Failed to intercept audio src property");
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
}

// src/mods/adskipper/index.ts
captureAudioElement();
waitForMusicReady(initAdPlayingListener);
