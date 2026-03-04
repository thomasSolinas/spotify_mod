# spotify_mod
Spotify Web Player modifications.

## Features
- Mini player paywall removal (resize freely without Premium)
- Automatic add skipping (work ing progress...)

## Installation

### Requirements
- Any Chromium browser (Chrome, Edge, Vivaldi)

### Steps
1. Download or clone this repo
2. Go to `chrome://extensions` or `vivaldi://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `extension/` folder
5. Open Spotify — the mods will run automatically

## Development

### Requirements
- [Bun](https://bun.sh)

### Setup
```bash
bun install
```

### Build
```bash
bun run build
```
Compiles `src/main.ts` into `dist/bundle.js` and copies it to `extension/content.js` automatically.

### Workflow
1. Make changes in `src/`
2. Run `bun run build`
3. Go to extensions page → click **refresh** on the Spotify Mod card
4. Reload Spotify

## Project Structure
```
src/
├── main.ts               # entry point, boots all mods
├── core/
│   ├── config.ts         # global constants (mod name, version, mod IDs)
│   └── inject.ts         # webpack chunk injection utility
├── mods/
│   ├── miniplayer/       # mini player paywall removal
│   └── ads/              # ad skipping (WIP)
└── types/
    └── spotify.d.ts      # Spotify-specific TypeScript types
extension/
├── manifest.json         # extension config
└── content.js            # built bundle (auto-generated, do not edit)
dist/
└── bundle.js             # compiled output (auto-generated, do not edit)
```

## How it works
Spotify's CSP blocks external script injection, so the mod uses two layers:
1. A Chrome extension with `world: MAIN` to run code in Spotify's page context
2. A webpack chunk push into `window.webpackChunkclient_web` to integrate with Spotify's runtime

See `research/` for detailed notes on the reverse engineering process.

## Versions
See [tags](https://github.com/thomasSolinas/spotify_mod/tags) for version history.
