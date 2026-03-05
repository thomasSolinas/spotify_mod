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
  const observer = new MutationObserver((mutations) => {
    const addPlayer = document.querySelector(AD_PLAYING_SELECTOR);
    if (addPlayer) {
      console.log("Ad is playing");
    } else {
      console.log("No ad playing");
    }
    console.log("isAdPPlaying() called with mutations:", mutations);
  });
  observer.observe(nowPlayingWidget, {
    childList: true,
    subtree: true
  });
}

// src/mods/adskipper/index.ts
waitForMusicReady(() => {
  initAdPlayingListener(document.querySelector('[data-testid="now-playing-widget"]'));
});


