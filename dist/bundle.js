// src/mods/miniplayer/index.ts
function initMiniPlayer() {
  window.documentPictureInPicture.addEventListener("enter", (event) => {
    const pipWindow = event.window;
    console.log("PiP opened!", pipWindow);
  });
}

// src/main.ts
initMiniPlayer();
