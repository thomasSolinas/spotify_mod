# Project: spotify_mod

## Overview
A Chrome extension (Manifest V3) that modifies Spotify Web Player (`open.spotify.com`).
Currently ships two mods: mini player paywall removal (done) and audio ad skipper (in progress).
Auto-updates via GitHub Releases. Current version: v0.2.5.

## Stack
- TypeScript (`src/`) → compiled to `extension/logic.js`
- **Package manager: bun** — use `bun install`, `bun build` (no `build` script in package.json, call bun directly)
- Chrome Extension Manifest V3
- MutationObserver-based mod system
- Webpack chunk injector for hooking into Spotify internals (`src/core/inject.ts`)

## Architecture
```
spotify-mod/
├── src/
│   ├── main.ts                          # entry point — wires up all mods
│   ├── core/
│   │   ├── inject.ts                    # webpack chunk injector for Spotify internals
│   │   └── config.ts                    # mod name, version, mod IDs
│   └── mods/
│       ├── miniplayer/                  # SHIPPED — do not touch
│       │   ├── index.ts                 # mod entry point
│       │   ├── miniPlayer_config.ts     # selectors and prefix
│       │   └── paywallRemover.ts        # MutationObserver paywall removal
│       └── adskipper/                   # IN PROGRESS
│           └── index.ts                 # ad detection + mute/skip logic
├── extension/
│   ├── manifest.json                    # static, never changes
│   ├── content.js                       # thin loader: checks GitHub for updates, injects logic.js
│   └── logic.js                         # compiled output — copy here manually after build
├── dist/                                # build artifacts
├── research/                            # research notes and experiments
├── install.py                           # cross-platform user setup script
├── package.json
├── tsconfig.json
└── bun.lock
```

## Build
```bash
bun install
bun build .\src\main.ts --outfile .\extension\logic.js
```
No `build` script in package.json — call bun directly. After building, manually copy output to `extension/logic.js`.

## How the extension works
On every Spotify page load, `extension/content.js`:
1. Immediately injects `logic.js` via `chrome.runtime.getURL` (CSP-safe) — mod runs regardless of network
2. Fetches `version.json` from inside the extension folder (written there by `install.py` at install time — not a repo file)
3. Hits GitHub Releases API for the latest tag
4. If versions differ → shows update banner prompting user to re-run `install.py`
5. Snooze button stores the snoozed tag in `localStorage` so banner won't reappear until a newer release

## Releasing
```bash
bun build .\src\main.ts --outfile .\extension\logic.js
git add .
git commit -m "feat: description"
git tag v0.x.0
git push origin main
git push origin v0.x.0
# GitHub → Releases → Draft new release → pick tag → Publish
```

## Coding conventions
- TypeScript everywhere, no plain JS in `src/`
- MutationObserver pattern for all DOM watching — see `miniplayer/paywallRemover.ts` as the reference
- Each mod exports `init` and `destroy` functions
- **Always use `data-testid` attributes as selectors** — class names are obfuscated and rotate on every Spotify deploy
- Async/await only, no `.then()`

## Spotify Web Player notes
- Class names change on every deploy — never use them
- `data-testid` attributes are stable
- Spotify is a React SPA — nodes can be fully replaced by the reconciler mid-session
- Spotify localises UI strings (e.g. "Advertisement" → "Pubblicità" in Italian) — never rely on visible text for detection
- **Do not block network requests** — Spotify verifies ad handshake completion; blocking causes "Playback Paused" loops

## Key selectors (verified in browser during live session)
```
[data-testid="now-playing-widget"]            — bottom bar, parent of all playback state UI
[data-testid="ad-link"]                       — EXISTS ONLY when an audio ad is playing ← PRIMARY detection signal
[data-testid="context-item-info-ad-subtitle"] — shows "Pubblicità • 1 di 2" etc. during ads (locale-dependent text)
[data-testid="context-item-info-title"]       — current track title
[data-testid="context-item-info-subtitles"]   — artist name during music
```

## Current status

### Done
- Mini player paywall removal — fully shipped. **Do not touch `src/mods/miniplayer/`.**

### In progress — `src/mods/adskipper/index.ts`

**What is confirmed working (tested in browser console):**
- `[data-testid="ad-link"]` is the primary ad detection signal — only appears in the DOM when an audio ad is playing
- MutationObserver on `[data-testid="now-playing-widget"]` with `{ childList: true, subtree: true }` correctly fires when an ad starts/ends
- Observer fires 3x on normal song changes (multiple DOM updates for title, artist, cover art) and 1x on ad start — expected, the querySelector check handles it correctly
- `isAdPlaying()` confirmed working in browser console

**Current state of `src/mods/adskipper/index.ts`:**
```typescript
const NOW_PLAYING_SELECTOR = '[data-testid="now-playing-widget"]';
const AD_PLAYING_SELECTOR = '[data-testid="ad-link"]';

function isAdPlaying(): boolean {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        document.querySelector(AD_PLAYING_SELECTOR)
            ? console.log("Ad is playing")
            : console.log("No ad playing");
    });

    observer.observe(document.querySelector(NOW_PLAYING_SELECTOR) as Node, {
        childList: true,
        subtree: true
    });

    return false;
}

isAdPlaying();
```

### NEXT STEP — actually skip/mute the ad

Detection is done. The next task is: **when `[data-testid="ad-link"]` appears, act on the ad.**

Three approaches to try in order:

1. **Seek to end** — `const audio = document.querySelector("audio"); audio.currentTime = audio.duration - 0.5` — tricks Spotify into advancing to the next track. Try this first.
2. **Mute** — `audio.muted = true` when ad-link appears, `audio.muted = false` when it disappears. Use as fallback if seeking causes issues.
3. **Click skip button** — check if Spotify renders a skip button in the DOM during ads and `.click()` it programmatically.

**Do NOT block network requests** — Spotify verifies ad handshake completion and blocking causes "Playback Paused" loops.

Also need to: export `initAdSkipper()` and `destroyAdSkipper()`, then wire into `src/main.ts`.

### Do not touch
- `src/mods/miniplayer/` — fully shipped
- `extension/content.js` — static loader, rarely changes
- `extension/manifest.json` — never changes
- `extension/logic.js` — compiled output only, edit via `src/`