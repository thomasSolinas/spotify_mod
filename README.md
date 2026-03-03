# spotify_mod

Spotify Web Player modifications.

## Features
- Mini player paywall removal (resize freely without Premium)

## Installation

### Requirements
- Any Chromium browser (Chrome, Edge, Vivaldi) or Firefox
- [Tampermonkey](https://www.tampermonkey.net/) extension installed

### Steps
1. Install Tampermonkey from your browser's extension store
2. Click the Tampermonkey icon → **Create new script**
3. Replace the default content with:
```javascript
// ==UserScript==
// @name         Spotify Mod
// @version      0.1.0
// @match        https://open.spotify.com/*
// @grant        none
// @run-at       document-idle
// @require      https://raw.githubusercontent.com/thomasSolinas/spotify_mod/main/dist/bundle.js
// @downloadURL  https://raw.githubusercontent.com/thomasSolinas/spotify_mod/main/dist/bundle.js
// @updateURL    https://raw.githubusercontent.com/thomasSolinas/spotify_mod/main/dist/bundle.js
// ==/UserScript==
```

4. Save (`Ctrl+S`)
5. Open Spotify — the mods will run automatically

## Development
```bash
bun install
bun build src/main.ts --outfile dist/bundle.js
```

## Versions
See [tags](https://github.com/YOUR_USERNAME/spotify_mod/tags) for version history.
