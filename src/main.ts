import { inject } from './core/inject';
import { MOD_NAME, MODS, MOD_VERSION } from './core/config';
import { initMiniPlayerMod } from './mods/miniplayer';
import { initAdSkipperMod } from './mods/adskipper';

//disabling
import { disable as disableRemoverMod } from './mods/miniplayer/miniPlayerRemover';

inject(() => {
    console.log(`%c${MOD_NAME} v${MOD_VERSION} loaded!`, 'color: green; font-weight: bold;');
    const bannerContainer = createModInitBannersContainer();

    bannerContainer.appendChild(createModInitBanner('Spotify Mod', MOD_VERSION));

    if (initMiniPlayerMod()) {
        setTimeout(() => {
            bannerContainer.appendChild(createModInitBanner('Mini Player'));

            const disableItem = document.createElement('button');
            disableItem.innerText = 'Disable';
            disableItem.addEventListener('click', e => {
                e.preventDefault();
                disableRemoverMod();
            });

            bannerContainer.appendChild(createModInitBanner('Mini Player remover', null, disableItem));
        }, 200);
    }
    if (initAdSkipperMod()) {
        setTimeout(() => {
            bannerContainer.appendChild(createModInitBanner('Ad Skipper'));
        }, 200);
    }
});

//  ── Mods load completion banners ────────────────────────────────────────────────────────────────
function createModInitBanner(modName: string, modVersion: string | null = null, additions: HTMLElement | null = null): HTMLDivElement {
    const banner = document.createElement("div");

    const verString = modVersion ? `v${modVersion} ` : '';

    banner.textContent = `✅ ${modName} ${verString}initialized!`;
    if(additions)
        banner.appendChild(additions);

    Object.assign(banner.style, {
        // position: "fixed",
        // bottom: "80px",
        // left: "50%",
        // transform: "translateX(-50%)",
        background: "#1db954",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        fontSize: "14px",
        zIndex: "99999",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
    });
    //   document.body.appendChild(banner);

    setTimeout(() => {
        banner.style.opacity = "0";
        banner.style.transition = "opacity 0.5s ease-in-out";
        banner.addEventListener("transitionend", () => banner.remove());
    }, 3000);

return banner;
}

function createModInitBannersContainer(): HTMLDivElement {
    const bannerContainer = document.createElement("div");
    bannerContainer.style = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        display: flex;
        gap: 10px;
        flex-direction: column;
        align-items: center;`;
    document.body.appendChild(bannerContainer);
    return bannerContainer;
}