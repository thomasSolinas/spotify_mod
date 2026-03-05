#!/usr/bin/env python3
"""
spotify-mod installer
Downloads the latest extension release from GitHub and guides the user
through loading it as an unpacked extension.
Works on Windows, macOS, Linux. Supports Chrome, Edge, Vivaldi, Firefox.
"""

import os
import sys
import json
import platform
import subprocess
import urllib.request
from pathlib import Path

# ── CONFIG ────────────────────────────────────────────────────────────────────
GITHUB_USER  = "thomasSolinas"
GITHUB_REPO  = "spotify_mod"
RELEASES_API = f"https://api.github.com/repos/{GITHUB_USER}/{GITHUB_REPO}/releases/latest"
RAW_MAIN     = f"https://raw.githubusercontent.com/{GITHUB_USER}/{GITHUB_REPO}/main"

INSTALL_DIR  = Path.home() / ".spotify-mod" / "extension"
TAG_CACHE    = Path.home() / ".spotify-mod" / ".installed_tag"

# ── ANSI COLORS ───────────────────────────────────────────────────────────────
BOLD   = "\033[1m"
GREEN  = "\033[92m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
RED    = "\033[91m"
RESET  = "\033[0m"

if platform.system() == "Windows":
    os.system("color")  # enable ANSI on Windows 10+

def p(msg, color=RESET):    print(f"{color}{msg}{RESET}")
def header(msg):            p(f"\n{'─'*55}\n  {msg}\n{'─'*55}", CYAN)
def ok(msg):                p(f"      ✓ {msg}", GREEN)
def warn(msg):              p(f"      ⚠ {msg}", YELLOW)
def err(msg):               p(f"      ✗ {msg}", RED)
def ask(prompt, default="y"):
    r = input(f"\n  {prompt} [{'Y/n' if default=='y' else 'y/N'}]: ").strip().lower()
    return r in ("", "y") if default == "y" else r == "y"

# ── GITHUB RELEASE ────────────────────────────────────────────────────────────
def fetch_latest_release():
    """Returns the latest release tag string e.g. 'v0.2.0'"""
    try:
        req = urllib.request.Request(RELEASES_API, headers={"Accept": "application/vnd.github+json"})
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read())
        return data["tag_name"], None
    except Exception as e:
        err(f"Could not fetch release info: {e}")
        sys.exit(1)

# ── UPDATE CHECK ──────────────────────────────────────────────────────────────
def get_installed_tag():
    if TAG_CACHE.exists():
        return TAG_CACHE.read_text().strip()
    return None

def check_for_update():
    installed = get_installed_tag()
    if not installed or not INSTALL_DIR.exists():
        return True, None  # fresh install

    tag, logic_url = fetch_latest_release()
    if installed == tag:
        ok(f"Already on latest release ({tag})")
        return False, None
    else:
        p(f"  Update available: {installed} → {tag}", YELLOW)
        return True, (tag, logic_url)

# ── DOWNLOAD ──────────────────────────────────────────────────────────────────
def download_release(tag=None, logic_url=None):
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)
    header("Downloading extension files")

    if tag is None:
        tag, _ = fetch_latest_release()

    RAW_TAG = f"https://raw.githubusercontent.com/{GITHUB_USER}/{GITHUB_REPO}/refs/tags/{tag}"

    files = {
        "manifest.json": f"{RAW_MAIN}/extension/manifest.json",
        "content.js":    f"{RAW_MAIN}/extension/content.js",
        "logic.js":      f"{RAW_TAG}/extension/logic.js",
    }

    for filename, url in files.items():
        dest = INSTALL_DIR / filename
        p(f"  → {url}", CYAN)
        try:
            urllib.request.urlretrieve(url, dest)
            ok(f"{filename} saved")
        except Exception as e:
            err(f"Failed to download {filename}: {e}")
            sys.exit(1)

    # Write version.json so content.js knows what's installed on disk
    version_path = INSTALL_DIR / "version.json"
    with open(version_path, "w") as f:
        json.dump({"version": tag}, f)
    ok(f"version.json written ({tag})")

    # Cache the installed tag
    TAG_CACHE.write_text(tag)
    ok(f"Release {tag} installed at {INSTALL_DIR}")

# ── BROWSER DETECTION ─────────────────────────────────────────────────────────
def detect_browsers():
    system = platform.system()
    home   = Path.home()
    found  = {}

    candidates = {
        "Chrome": {
            "Windows": [
                r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                home / r"AppData\Local\Google\Chrome\Application\chrome.exe",
            ],
            "Darwin": ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
            "Linux":  ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"],
        },
        "Edge": {
            "Windows": [
                r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            ],
            "Darwin": ["/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"],
            "Linux":  ["/usr/bin/microsoft-edge"],
        },
        "Vivaldi": {
            "Windows": [
                home / r"AppData\Local\Vivaldi\Application\vivaldi.exe",
                r"C:\Program Files\Vivaldi\Application\vivaldi.exe",
            ],
            "Darwin": ["/Applications/Vivaldi.app/Contents/MacOS/Vivaldi"],
            "Linux":  ["/usr/bin/vivaldi"],
        },
        "Firefox": {
            "Windows": [
                r"C:\Program Files\Mozilla Firefox\firefox.exe",
                r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe",
            ],
            "Darwin": ["/Applications/Firefox.app/Contents/MacOS/firefox"],
            "Linux":  ["/usr/bin/firefox", "/usr/bin/firefox-esr"],
        },
    }

    for browser, paths_by_os in candidates.items():
        for path in paths_by_os.get(system, []):
            if Path(path).exists():
                found[browser] = str(path)
                break

    return found

# ── BROWSER SETUP ─────────────────────────────────────────────────────────────
def install_chromium(browser_name, browser_path):
    header(f"Loading extension in {browser_name}")
    ext_path = str(INSTALL_DIR)

    p(f"""
  Two quick steps in {browser_name}:

  {BOLD}  1. Enable "Developer mode"{RESET}  (toggle, top-right corner)
  {BOLD}  2. Click "Load unpacked" → select this folder:{RESET}

     {CYAN}{ext_path}{RESET}
""")

    if ask("Open extensions page now?"):
        try:
            subprocess.Popen([browser_path, "chrome://extensions"])
        except Exception as e:
            warn(f"Could not open automatically: {e}")
            p(f"  Open {browser_name} manually → chrome://extensions")

    input("\n  Press Enter once the extension is loaded... ")
    ok(f"Extension loaded in {browser_name}!")

def install_firefox(browser_path):
    header("Loading extension in Firefox")
    manifest_path = str(INSTALL_DIR / "manifest.json")

    p(f"""
  Firefox steps:

  {BOLD}  1. Click "This Firefox"{RESET}
  {BOLD}  2. Click "Load Temporary Add-on"{RESET}
  {BOLD}  3. Select this file:{RESET}

     {CYAN}{manifest_path}{RESET}

  {YELLOW}Note: Firefox removes temporary extensions on restart.
  Re-run this installer after each restart.{RESET}
""")

    if ask("Open about:debugging now?"):
        try:
            subprocess.Popen([browser_path, "about:debugging#/runtime/this-firefox"])
        except Exception as e:
            warn(f"Could not open automatically: {e}")
            p("  Open Firefox manually → about:debugging#/runtime/this-firefox")

    input("\n  Press Enter once the extension is loaded... ")
    ok("Extension loaded in Firefox!")

# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    p(r"""
  ╔══════════════════════════════════════╗
  ║       spotify-mod  installer         ║
  ║   Mini player paywall remover        ║
  ╚══════════════════════════════════════╝
""", CYAN)

    # ── Update / install check
    needs_download = True
    prefetched     = None  # (tag, logic_url) if already fetched during update check

    if INSTALL_DIR.exists():
        p("  Existing installation found.", YELLOW)
        needs_update, release_info = check_for_update()

        if not needs_update:
            if not ask("Reinstall anyway?", default="n"):
                p("\n  Files are up to date. Skipping download.\n")
                needs_download = False
        else:
            prefetched = release_info  # pass along so we don't hit API twice
            if not ask("Download update?"):
                sys.exit(0)

    if needs_download:
        if prefetched:
            download_release(*prefetched)
        else:
            download_release()

    # ── Browser setup
    header("Detecting browsers")
    browsers = detect_browsers()

    if not browsers:
        err("No supported browsers found.")
        p(f"\n  Load manually:\n  Folder: {CYAN}{INSTALL_DIR}{RESET}\n"
          f"  Chrome/Edge/Vivaldi: chrome://extensions → Developer mode → Load unpacked\n"
          f"  Firefox: about:debugging → This Firefox → Load Temporary Add-on\n")
        sys.exit(1)

    for name, path in browsers.items():
        ok(f"Found {name}: {path}")

    p("\n  Which browsers should the extension be loaded in?")
    browser_list = list(browsers.items())
    for i, (name, _) in enumerate(browser_list, 1):
        p(f"    {i}. {name}", BOLD)
    p(f"    {len(browser_list)+1}. All", BOLD)
    p(f"    0. Skip (files already downloaded)", BOLD)

    choice = input("\n  Enter numbers separated by commas (e.g. 1,3): ").strip()

    selected = []
    if choice == "0":
        pass
    elif str(len(browser_list) + 1) in choice.split(","):
        selected = browser_list
    else:
        for c in choice.split(","):
            c = c.strip()
            if c.isdigit() and 1 <= int(c) <= len(browser_list):
                selected.append(browser_list[int(c) - 1])

    for name, path in selected:
        if name == "Firefox":
            install_firefox(path)
        else:
            install_chromium(name, path)

    # ── Done
    header("All done!")
    p(f"""
  {GREEN}✓ spotify-mod is installed!{RESET}

  {BOLD}Updates are automatic:{RESET}
    The extension checks GitHub Releases on every Spotify load.
    When you publish a new release, users get it instantly — no reinstall needed.

  {BOLD}To update extension files manually:{RESET}
    python install.py

  {BOLD}Extension folder:{RESET}
  {CYAN}  {INSTALL_DIR}{RESET}
""")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\n\n  Cancelled.\n", YELLOW)
        sys.exit(0)