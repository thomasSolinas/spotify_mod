export function inject(initFunction: () => void) {
    window.webpackChunkclient_web.push([
        ["spotify_mod"],
        {},
        initFunction
    ]);

}
