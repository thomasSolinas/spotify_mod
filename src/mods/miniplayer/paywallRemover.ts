import { MINI_PLAYER_PREFIX } from "./miniPlayer_config";

const PLAYER_SELECTOR = '[data-testid="pip-hover-element"]'; // Paywall is immediate sibling before this element

export function removePaywall(pipWindow: Window) {
    const observer = new MutationObserver((mutations: MutationRecord[]) => { // Check for mutations in the PiP window

        const player: HTMLElement | null = pipWindow.document.querySelector(PLAYER_SELECTOR);
        if (player) {
            console.log(`${MINI_PLAYER_PREFIX} Found player element`, player);

            const paywall = player.previousSibling;
            if (paywall) {
                paywall.remove();
                console.log(`${MINI_PLAYER_PREFIX} Paywall removed. Resizing PiP window is now possible!`);

                observer.disconnect(); // stop watching once removed
            }
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


