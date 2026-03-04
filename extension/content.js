// spotify-mod - content.js (loader)
// Injects logic.js via chrome.runtime.getURL (CSP-safe).
// Compares installed version (version.json in extension folder) against
// latest GitHub release tag to show an update banner when needed.

const GITHUB_USER  = "thomasSolinas";
const GITHUB_REPO  = "spotify_mod";
const RELEASES_API = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;

// ── Inject local logic.js (CSP-safe) ────────────────────────────────────────
function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("logic.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

// ── Update banner ────────────────────────────────────────────────────────────
function showUpdateBanner(latestTag) {
  const snoozed = localStorage.getItem("spotify_mod_snooze");
  if (snoozed === latestTag) return; // user snoozed this specific tag

  const banner = document.createElement("div");
  banner.innerHTML = `
    <span>🎵 <strong>spotify-mod ${latestTag}</strong> is available — re-run <code>install.py</code> to update</span>
    <button id="smod-snooze" style="margin-left:12px;background:rgba(255,255,255,0.2);border:1px solid #fff;color:#fff;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:12px;">Skip until next release</button>
    <button id="smod-close" style="margin-left:8px;background:none;border:1px solid #fff;color:#fff;border-radius:4px;padding:3px 10px;cursor:pointer;">✕</button>
  `;
  Object.assign(banner.style, {
    position:     "fixed",
    bottom:       "80px",
    left:         "50%",
    transform:    "translateX(-50%)",
    background:   "#1db954",
    color:        "#fff",
    padding:      "12px 20px",
    borderRadius: "8px",
    fontFamily:   "sans-serif",
    fontSize:     "14px",
    zIndex:       "99999",
    boxShadow:    "0 4px 12px rgba(0,0,0,0.4)",
    display:      "flex",
    alignItems:   "center",
    gap:          "8px",
    whiteSpace:   "nowrap",
  });
  document.body.appendChild(banner);

  // ✕ — dismiss for this session, reappears on next Spotify load
  document.getElementById("smod-close").onclick = () => banner.remove();

  // Snooze — won't appear again until a newer tag is released
  document.getElementById("smod-snooze").onclick = () => {
    localStorage.setItem("spotify_mod_snooze", latestTag);
    banner.remove();
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  // Always inject first so the mod runs regardless of network
  injectScript();

  try {
    // Read the version install.py wrote into the extension folder
    const localRes  = await fetch(chrome.runtime.getURL("version.json"));
    const { version: installedVersion } = await localRes.json();

    // Ask GitHub for the latest release tag
    const remoteRes = await fetch(RELEASES_API);
    const { tag_name: latestTag } = await remoteRes.json();

    // Normalize: strip leading "v" for comparison (v0.2.1 === 0.2.1)
    const normalize = (v) => v.replace(/^v/, "");

    if (normalize(latestTag) !== normalize(installedVersion)) {
      console.log(`[spotify-mod] Update available: ${installedVersion} → ${latestTag}`);
      showUpdateBanner(latestTag);
    } else {
      console.log(`[spotify-mod] Up to date (${installedVersion})`);
      // Clear any leftover snooze from a previous version
      localStorage.removeItem("spotify_mod_snooze");
    }

  } catch (err) {
    console.error("[spotify-mod] Update check failed:", err);
  }
})();