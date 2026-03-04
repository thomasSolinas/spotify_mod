# spotify-mod

Removes the mini player (PiP) paywall on Spotify free accounts.
Auto-updates silently on every Spotify load — no reinstall ever needed.

---

## How it works

The extension is split into two layers:

| File | Role | Changes? |
|---|---|---|
| `extension/manifest.json` | Declares the extension to the browser | Never |
| `extension/content.js` | Thin loader — checks GitHub for updates, injects logic | Rarely |
| `extension/logic.js` | Actual mod logic — built from `src/` | Every release |

On every Spotify page load, `content.js`:
1. Hits the GitHub Releases API to get the latest tag
2. Compares it to the cached tag in `localStorage`
3. If different → fetches `logic.js` from that tag via `raw.githubusercontent.com`
4. Injects it into the page and caches it
5. If GitHub is unreachable → falls back to the cached version

This means **pushing a new release is the only thing needed to update all users**.

---

## Install (users)

Requires Python 3 — preinstalled on macOS/Linux, [download here](https://python.org) on Windows.

```bash
python install.py
```

The script will:
- Download the latest release files from GitHub
- Detect installed browsers (Chrome, Edge, Vivaldi, Firefox)
- Open the browser extensions page and walk you through the 2 required clicks

### Manual load (if you prefer)

1. Download this repo or clone it
2. **Chrome / Edge / Vivaldi** → go to `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `extension/` folder
3. **Firefox** → go to `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `extension/manifest.json`

> **Firefox note:** temporary extensions are removed on browser restart. Re-run `install.py` after each restart.

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
│   └── mods/
│       └── miniplayer/
│           ├── index.ts                 # mod entry point
│           ├── miniPlayer_config.ts     # selectors and prefix
│           └── paywallRemover.ts        # MutationObserver paywall removal
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
bun run build
```

After building, manually copy the bundle output to `extension/logic.js`.

### Branching strategy

```
main        → always stable, what users run
feature/*   → work in progress
```

Work on `main` or a feature branch freely — users are pinned to the **latest release tag**, not to `main`. A push to `main` without a new tag changes nothing for users.

---

## Releasing a new version

```bash
# 1. build and copy output to extension/logic.js
bun run build

# 2. commit
git add .
git commit -m "feat: description of what changed"

# 3. tag
git tag v0.x.0
git push origin main
git push origin v0.x.0
```

Then on GitHub: **Releases → Draft a new release → pick the tag → Publish**.

No assets need to be attached. The tag points to the commit, `content.js` fetches `logic.js` directly from `raw.githubusercontent.com/refs/tags/vX.X.X`.

### Verify the release is live

```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://api.github.com/repos/thomasSolinas/spotify_mod/releases/latest" -UseBasicParsing).Content | ConvertFrom-Json | Select-Object tag_name, name
```

```bash
# bash
curl https://api.github.com/repos/thomasSolinas/spotify_mod/releases/latest | grep tag_name
```

Should return the tag you just pushed.

---

## Versioning

Follows [semantic versioning](https://semver.org):

- `0.0.x` — bugfix
- `0.x.0` — new feature or structural change
- `1.0.0` — first fully stable public release

Current version: **v0.2.0**

---

## Roadmap

- [x] Mini player paywall removal
- [ ] Ad removal