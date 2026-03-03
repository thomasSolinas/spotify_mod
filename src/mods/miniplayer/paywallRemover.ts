
import { MOD_NAME, MODS } from "../../core/config";


const paywallSelector = 'data-testid="pip-hover-element"'; 

export function removePaywall(pipWindow: Window) {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {


        const paywall = pipWindow.document.querySelector(paywallSelector);
        if (paywall) {
            paywall.remove();
            observer.disconnect(); // stop watching once removed
            console.log(`[${MOD_NAME}:${MODS.MINI_PLAYER}] Paywall removed`);
        }


        // // Look for the paywall element in the added nodes
        // for (const mutation of mutations) {
        //     for (const node of mutation.addedNodes) {
        //         console.log('node added to PiP:', node);

        //     }
        // }
    });

    observer.observe(pipWindow.document.body, {
        childList: true,
        subtree: true
    });
}


