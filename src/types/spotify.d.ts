interface Window {
    documentPictureInPicture: {
        requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
        addEventListener: (type: 'enter', listener: (event: DocumentPictureInPictureEvent) => void) => void;
    };
}

interface DocumentPictureInPictureEvent extends Event {
    readonly window: Window;
}