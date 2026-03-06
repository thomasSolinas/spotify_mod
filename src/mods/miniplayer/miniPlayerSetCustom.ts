//sets size of mini player, default is 1x1 (it auto sets to min size, so it will be as small as possible)

export function setCustomMiniPlayerSize(pipWindow: Window, width = 1, height = 1) {
    pipWindow.resizeTo(width, height);
}

// make exported function that accepts an object (i'll define what it contains in src/typc/spotify.d.ts) 
// object is used to set custom preferences for the mini player, such as size, position, etc. (for now just size)
function setCustomMiniPlayerPreferences(pipWindow: Window, preferences: PipPreferencesObject): void {
    if(!preferences.areSet) return;

    if(!preferences.pipEnabled) {
        pipWindow.close();
        return;
    }

    pipWindow.resizeTo(preferences.width, preferences.height);
    //

    return; 
}