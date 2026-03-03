export function removePaywall(pipWindow: Window) {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                console.log('node added to PiP:', node);
                // paywall removal logic will go here once we identify the element
            }
        }
    });

    observer.observe(pipWindow.document.body, {
        childList: true,
        subtree: true
    });
}
