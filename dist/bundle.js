// src/mods/miniplayer/paywallRemover.ts
function removePaywall(pipWindow) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        console.log("node added to PiP:", node);
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
