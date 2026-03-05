# spotify-mod

Removes the mini player (PiP) paywall and skips audio ads on Spotify free accounts.
Auto-updates on every Spotify load — no reinstall ever needed.

---

## Install

Requires Python 3 — preinstalled on macOS/Linux, [download here](https://python.org) on Windows.

**1. Download [install.py](install.py)**

**2. Run it:**
```bash
python install.py
```

The script downloads the extension from GitHub, detects your browsers, and walks you through the 2 required browser clicks. That's it — never touch it again.

> **Firefox note:** temporary extensions are removed on browser restart. Re-run `install.py` after each restart.

---

## How it works

The extension is split into two layers:

| File | Role | Changes? |
|---|---|---|
| `extension/manifest.json` | Declares the extension to the browser | Never |
| `extension/content.js` | Thin loader — checks GitHub for updates, injects logic | Rarely |
| `extension/logic.js` | Actual mod logic — built from `src/` | Every release |

On every Spotify page load, `content.js`:
1. Reads the installed version from `version.json` in the extension folder
2. Hits the GitHub Releases API to get the latest tag
3. If behind → shows a banner prompting to re-run `install.py`
4. Injects the local `logic.js` via `chrome.runtime.getURL` (CSP-safe)

---

## Development

### Project structure

```
spotify-mod/
├── src/
│   ├── main.ts                          # entry point
│   ├── core/
│   │   ├── inject.ts                    # webpack chunk injector
│   │   └── config.ts                    # mod name, version, mod IDs
│   ├── types/
│   │   └── spotify.d.ts                 # global type declarations
│   └── mods/
│       ├── miniplayer/
│       │   ├── index.ts                 # mod entry point
│       │   ├── miniPlayer_config.ts     # selectors and prefix
│       │   └── paywallRemover.ts        # MutationObserver paywall removal
│       └── adskipper/
│           ├── index.ts                 # mod entry point
│           ├── waitForMusicReady.ts     # gates ad detection until Spotify has loaded
│           ├── audioElementCapture.ts   # captures Spotify's media element via prototype hook
│           └── adPlayingListener.ts     # detects ads and skips them
├── extension/
│   ├── manifest.json                    # static, never changes
│   ├── content.js                       # static loader, rarely changes
│   └── logic.js                         # build output — updated every release
└── install.py                           # cross-platform installer
```

### Build

```bash
# install dependencies
bun install

# build src/
bun build .\src\main.ts --outfile .\extension\logic.js
```

After building, manually copy the bundle output to `extension/logic.js`.

### Branching strategy

```
main        → always stable, what users run
feature/*   → work in progress
```

Users are pinned to the latest release tag, not to `main`. A push to `main` without a new tag changes nothing for users.

---

## Releasing a new version

```bash
# 1. build and copy output to extension/logic.js
bun build .\src\main.ts --outfile .\extension\logic.js

# 2. commit
git add .
git commit -m "feat: description of what changed"

# 3. tag and push
git tag v0.x.0
git push origin main
git push origin v0.x.0
```

Then on GitHub: **Releases → Draft a new release → pick the tag → Publish**.

### Verify the release is live

```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://api.github.com/repos/thomasSolinas/spotify_mod/releases/latest" -UseBasicParsing).Content | ConvertFrom-Json | Select-Object tag_name, name
```

```bash
# bash
curl https://api.github.com/repos/thomasSolinas/spotify_mod/releases/latest | grep tag_name
```

---

## Versioning

Follows [semantic versioning](https://semver.org):

- `0.0.x` — bugfix
- `0.x.0` — new feature or structural change
- `1.0.0` — first fully stable public release

Current version: **v0.3.0**

---

## Roadmap

- [x] Mini player paywall removal
- [x] Audio ad skipper