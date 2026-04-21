export function inject(initFunction: () => void) {
  function tryInject() {
    if (window.webpackChunkclient_web) {
      window.webpackChunkclient_web.push([
        ["spotify_mod"],
        {},
        initFunction
      ]);
    } else {
      setTimeout(tryInject, 100);
    }
  }
  tryInject();
}