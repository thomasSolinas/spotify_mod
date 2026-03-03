# CSP Bypass & Extension Setup

## The Problem
Spotify's **Content Security Policy (CSP)** blocks any script not loaded from their approved domains.
Tampermonkey injects via a `data:` URL which Spotify blocks — so userscripts don't work.

## Why the Console Works
DevTools console runs in the **page context** — same JS environment as Spotify's code.
No security boundaries, full access to `window`, `documentPictureInPicture`, etc.

## The Solution: Two Layers

### Layer 1 — Chrome Extension (`world: MAIN`)
A local unpacked extension with `"world": "MAIN"` in the manifest runs the content script
in the **page context** instead of the default isolated context.
This bypasses CSP and gives access to all page-level objects.

### Layer 2 — Webpack Chunk Injection
Spotify uses Webpack. Their module registry is exposed at:
```javascript
window.webpackChunkclient_web
```
By pushing a fake chunk into this array, your code runs inside Spotify's own JS runtime:
```javascript
window.webpackChunkclient_web.push([
    ["spotify_mod"],  // fake chunk ID
    {},               // no modules
    () => {           // entry function — your code goes here
        // mod code
    }
]);
```
This is necessary because even with `world: MAIN`, the webpack push ensures
your code integrates cleanly with Spotify's runtime.

## Extension Structure
```
extension/
├── manifest.json   # extension config, defines content script + world: MAIN
└── content.js      # built bundle.js copied here automatically on build
```

## manifest.json
```json
{
    "manifest_version": 3,
    "name": "Spotify Mod",
    "version": "0.1.1",
    "content_scripts": [
        {
            "matches": ["https://open.spotify.com/*"],
            "js": ["content.js"],
            "run_at": "document_idle",
            "world": "MAIN"
        }
    ]
}
```

## Build Command
```bash
bun run build
# builds dist/bundle.js AND copies it to extension/content.js automatically
```

Defined in `package.json`:
```json
"build": "bun build src/main.ts --outfile dist/bundle.js && cp dist/bundle.js extension/content.js"
```

## Loading the Extension Locally
1. Go to `vivaldi://extensions` (or `chrome://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. Reload Spotify

## Updating After Code Changes
1. `bun run build`
2. Go to extensions page → click **refresh** on the extension card
3. Reload Spotify

## Distribution (future)
Local unpacked extensions can't fetch remote code (Manifest V3 restriction).
To distribute publicly → publish to the **Chrome Web Store** (one-time $5 fee).
Firefox has its own store too.
The GitHub repo stays as source code — the store handles distribution.
