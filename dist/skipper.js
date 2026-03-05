// src/mods/adskipper/adPlayingListener.ts
var NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';
var AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';
document.querySelector(AD_PLAYING_SELECTOR);
function isAdPPlaying() {
  const observer = new MutationObserver((mutations) => {
    document.querySelector(AD_PLAYING_SELECTOR) ? console.log("Ad is playing") : console.log("No ad playing");
  });
  observer.observe(document.querySelector(NOW_PLAYING_SELECTOR), {
    childList: true,
    subtree: true
  });
  return false;
}

// src/mods/adskipper/index.ts
isAdPPlaying();
