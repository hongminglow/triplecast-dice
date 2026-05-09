export function playCountdownTick(): void {
  try {
    const audio = new Audio("/assets/countdown-chime.mp3");
    audio.volume = 0.45;
    void audio.play();
  } catch (error) {
    void error;
  }
}

export function createDiceShakeLoop(): HTMLAudioElement {
  const audio = new Audio("/assets/dice-shake.mp3");
  audio.volume = 0.38;
  audio.loop = true;
  return audio;
}
