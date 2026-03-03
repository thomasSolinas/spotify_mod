interface Window {

    webpackChunkclient_web: Array<any>; // for our injection

    documentPictureInPicture: { // for PiP event listening
        requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
        addEventListener: (type: 'enter', listener: (event: DocumentPictureInPictureEvent) => void) => void;
    };
}

interface DocumentPictureInPictureEvent extends Event {
    readonly window: Window;
}