interface Window {

    webpackChunkclient_web: Array<any>; // for our injection

    documentPictureInPicture: { // for PiP event listening
        requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
        addEventListener: (type: 'enter', listener: (event: DocumentPictureInPictureEvent) => void) => void;
    };

    _spotifyAudio?: HTMLMediaElement;
}

interface DocumentPictureInPictureEvent extends Event {
    readonly window: Window;
}

interface PipPreferencesObject {
    areSet: boolean; // whether the user has set their preferences or not
    pipEnabled: boolean;
    width: number;
    height: number;
    backgroundColor: string; //hex color code, e.g. #000000 for black
    textColor: string; //hex color code, e.g. #FFFFFF for white
}