# Project: spotify_mod

## Overview
A Chrome extension (Manifest V3) that modifies Spotify Web Player (`open.spotify.com`).
Currently ships two mods: mini player paywall removal (done) and audio ad skipper (in progress).
Auto-updates via GitHub Releases. Current version: v0.2.5.

## Stack
- TypeScript (`src/`) → compiled to `extension/logic.js` via `bun run build`
- **Package manager: bun** (not npm/yarn — use `bun install`, `bun run build`)
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
│   └── logic.js                         # compiled output — copy here manually after bun run build
├── dist/                                # build artifacts
├── research/                            # research notes and experiments
├── install.py                           # cross-platform user setup script
├── package.json
├── tsconfig.json
└── bun.lock
```

## Build
```bash
bun install          # install dependencies
bun run build        # compile src/ → manually copy output to extension/logic.js
```

## How the extension works
On every Spotify page load, `extension/content.js`:
1. Injects `logic.js` immediately via `chrome.runtime.getURL` (CSP-safe) — mod always runs regardless of network
2. Fetches `version.json` from the extension folder (written there by `install.py` at install time, not in the repo)
3. Hits the GitHub Releases API for the latest release tag
4. If versions differ → shows an update banner prompting to re-run `install.py`
5. Snooze button stores the tag in `localStorage` so the banner won't reappear until a newer release

## Releasing
```bash
bun run build
# copy bundle to extension/logic.js
git add .
git commit -m "feat: description"
git tag v0.x.0
git push origin main
git push origin v0.x.0
# then: GitHub → Releases → Draft new release → pick tag → Publish
```

## Coding conventions
- TypeScript everywhere, no plain JS in `src/`
- MutationObserver pattern for all DOM watching — see `miniplayer/paywallRemover.ts` as reference
- Each mod exports `init` and `destroy` functions
- Use `data-testid` attributes for all Spotify DOM selectors — class names are obfuscated and change frequently
- Async/await only, no `.then()`

## Spotify Web Player notes
- Class names are obfuscated and rotate on every deploy — **never use them as selectors**
- `data-testid` attributes are stable
- Spotify is a React SPA — nodes can be replaced entirely by the reconciler, observers may need re-attaching
- Spotify localises UI text (e.g. "Advertisement" → "Pubblicità" in Italian) — never rely on visible text for detection
- **Do not block network requests** — Spotify verifies the ad handshake completes; blocking causes "Playback Paused" loops

## Key selectors (verified in browser)
```
[data-testid="now-playing-widget"]            — bottom bar, parent container for all playback state
[data-testid="ad-link"]                       — ONLY present when an audio ad is playing ← primary ad signal
[data-testid="context-item-info-ad-subtitle"] — shows "Pubblicità • 1 di 2" etc. during ads
[data-testid="context-item-info-title"]       — current track title
[data-testid="context-item-info-subtitles"]   — artist name / ad subtitle text
```

## Current status

### Done
- Mini player paywall removal — fully shipped, stable. **Do not touch `src/mods/miniplayer/`.**

### In progress — `src/mods/adskipper/index.ts`
Detection signal confirmed in browser: `[data-testid="ad-link"]` appears in the DOM only when an audio ad is playing.

**Next steps:**
1. Set up `MutationObserver` on `[data-testid="now-playing-widget"]` with `{ childList: true, subtree: true }`
2. In the observer callback: check if `[data-testid="ad-link"]` exists in the DOM
3. If ad detected → mute `<audio>` element, seek to `duration - 0.5s` to skip
4. If ad ended (element disappears) → unmute `<audio>`
5. Export `initAdSkipper()` and `destroyAdSkipper()`
6. Call `initAdSkipper()` from `src/main.ts` alongside the miniplayer init

### Do not touch
- `src/mods/miniplayer/` — fully shipped
- `extension/content.js` — static loader, rarely changes
- `extension/manifest.json` — never changes
- `extension/logic.js` — compiled output only, edit via `src/`
