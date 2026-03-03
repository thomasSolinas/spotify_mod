// Catch the opening of the PiP 
window.documentPictureInPicture.addEventListener('enter', (event) => {
    const pipWindow = event.window;
    console.log('PiP opened!! \n', pipWindow); 
});

const pipOpenFunction =  (event) => {
    const pipWindow = event.window;
    console.log('PiP opened!! \n', pipWindow); 
}

window.documentPictureInPicture.removeEventListener('enter', pipOpenFunction);