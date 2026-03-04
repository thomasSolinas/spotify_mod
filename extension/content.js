// spotify-mod - content.js (loader)
// Checks latest GitHub Release tag, fetches logic.js from that tag if changed.
// This file never needs to be updated after initial install.

const GITHUB_USER   = "thomasSolinas";
const GITHUB_REPO   = "spotify_mod";
const RELEASES_API  = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;

(async () => {
  try {
    // 1. Get the latest release tag (e.g. "v0.2.0")
    const res = await fetch(RELEASES_API);
    const { tag_name: latestTag } = await res.json();

    const cachedTag   = localStorage.getItem("spotify_mod_tag");
    const cachedLogic = localStorage.getItem("spotify_mod_logic");

    let logicCode;

    if (latestTag !== cachedTag || !cachedLogic) {
      // 2. Fetch logic.js directly from the tagged commit in the repo
      const logicUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/refs/tags/${latestTag}/extension/logic.js`;
      console.log(`[spotify-mod] Updating ${cachedTag ?? "none"} → ${latestTag}`);

      const logicRes = await fetch(logicUrl);
      if (!logicRes.ok) throw new Error(`Failed to fetch logic.js: ${logicRes.status}`);
      logicCode = await logicRes.text();

      localStorage.setItem("spotify_mod_logic", logicCode);
      localStorage.setItem("spotify_mod_tag",   latestTag);
    } else {
      console.log(`[spotify-mod] Up to date (${latestTag})`);
      logicCode = cachedLogic;
    }

    // 3. Inject into page context
    const script = document.createElement("script");
    script.textContent = logicCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();

  } catch (err) {
    console.error("[spotify-mod] Load failed:", err);

    // Fallback: use cached logic if network is unavailable
    const cached = localStorage.getItem("spotify_mod_logic");
    if (cached) {
      console.warn("[spotify-mod] Using cached logic as fallback");
      const script = document.createElement("script");
      script.textContent = cached;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    }
  }
})();