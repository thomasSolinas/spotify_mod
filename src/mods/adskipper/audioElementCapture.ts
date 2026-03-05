export function captureAudioElement(): void {
  const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');

  if (!desc || !desc.set || !desc.get) {
    console.error('Failed to intercept audio src property');
    throw new Error('Cannot hook into HTMLMediaElement.src');
  }

  Object.defineProperty(HTMLMediaElement.prototype, 'src', {
    set(val) {
      window._spotifyAudio = this;
      desc.set!.call(this, val);
    },
    get() {
      return desc.get!.call(this);
    }
  });
}
