# Project: spotify_mod

## Overview
A Chrome extension (Manifest V3) that modifies Spotify Web Player (`open.spotify.com`).
Currently ships two mods: mini player paywall removal (done) and audio ad skipper (in progress).
Auto-updates via GitHub Releases. Current version: v0.3.0.

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
│   ├── types/
│   │   └── spotify.d.ts                 # global type declarations (e.g. window._spotifyAudio)
│   └── mods/
│       ├── miniplayer/                  # SHIPPED — do not touch
│       │   ├── index.ts                 # mod entry point
│       │   ├── miniPlayer_config.ts     # selectors and prefix
│       │   └── paywallRemover.ts        # MutationObserver paywall removal
│       └── adskipper/                   # IN PROGRESS
│           ├── index.ts                 # entry — runs captureAudioElement, wires waitForMusicReady → initAdPlayingListener
│           ├── waitForMusicReady.ts     # one-shot body observer, fires onReady(nowPlayingWidget)
│           ├── audioElementCapture.ts   # hooks HTMLMediaElement.prototype.src setter to capture Spotify's media element
│           └── adPlayingListener.ts     # MutationObserver on now-playing-widget, detects ad-link and skips ad
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
- Spotify uses a `<video>` element (not `<audio>`) for all playback — `document.querySelector('audio')` always returns null
- The media element is never appended to the DOM — it must be captured via prototype hook (see `audioElementCapture.ts`)
- Ad duration (`audio.duration`) loads asynchronously — must wait for a valid value before seeking
- Ads are played through the same media element as music — only the src blob URL changes
- Multiple ads in a sequence each trigger a new DOM mutation on `now-playing-widget`, so the observer handles them naturally without any loop

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

### In progress — `src/mods/adskipper/`

**What is confirmed working (tested in browser with extension loaded):**
- `[data-testid="ad-link"]` is the primary ad detection signal — only appears in the DOM when an audio ad is playing
- MutationObserver on `[data-testid="now-playing-widget"]` with `{ childList: true, subtree: true }` correctly fires when an ad starts
- Each ad in a multi-ad sequence triggers its own mutation — no polling loop needed
- `waitForMusicReady` correctly gates the ad observer until Spotify has loaded a playback session
- `audioElementCapture.ts` successfully captures Spotify's media element by hooking `HTMLMediaElement.prototype.src` setter
- Seeking `audio.currentTime = audio.duration - 0.5` successfully skips ads
- `waitForValidDuration()` correctly handles the async duration load before attempting the seek
- Multiple ads in a row are all skipped reliably

**Current state of each file:**

`waitForMusicReady.ts` — **DONE**
Waits for `[data-testid="now-playing-widget"]` to appear in the DOM before starting ad detection. Short-circuits immediately if the widget is already present (mid-session init). Passes the widget element to the `onReady` callback. One-shot observer on `document.body` — disconnects itself once the widget is found.

`audioElementCapture.ts` — **DONE**
Hooks `HTMLMediaElement.prototype.src` setter to intercept the moment Spotify assigns a source to its media element. Stores the element in `window._spotifyAudio` (typed in `src/types/spotify.d.ts`). Must run before Spotify initializes — called at the top of `adskipper/index.ts`.

`adPlayingListener.ts` — **DONE, still testing**
Sets up a MutationObserver on `now-playing-widget`. On every mutation, checks for `[data-testid="ad-link"]`. If present, calls `waitForValidDuration()` then seeks to `audio.duration - 0.5` to skip the ad. `waitForValidDuration()` polls every 100ms until `audio.duration` is a valid non-NaN number. Still missing: `destroy` export.

`index.ts` — **DONE, exports missing**
Calls `captureAudioElement()` immediately, then `waitForMusicReady` → `initAdPlayingListener`. Still missing: `initAdSkipper` / `destroyAdSkipper` exports, not yet wired into `src/main.ts`.

### NEXT STEP
- Add `destroy` export to `adPlayingListener.ts`
- Export `initAdSkipper()` and `destroyAdSkipper()` from `index.ts`
- Wire adskipper into `src/main.ts`
- Finish testing, then ship

### Do not touch
- `src/mods/miniplayer/` — fully shipped
- `extension/content.js` — static loader, rarely changes
- `extension/manifest.json` — never changes
- `extension/logic.js` — compiled output only, edit via `src/`