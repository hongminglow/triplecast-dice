export type SfxKey =
  | "button-click"
  | "confirm-bet"
  | "countdown-chime"
  | "dice-shake"
  | "chain-lock"
  | "game-start"
  | "kaching";

const SFX_PATHS: Record<SfxKey, string> = {
  "button-click": "/assets/sfx/button-click.mp3",
  "confirm-bet": "/assets/sfx/confirm-bet.mp3",
  "countdown-chime": "/assets/sfx/countdown-chime.mp3",
  "dice-shake": "/assets/sfx/dice-shake.mp3",
  "chain-lock": "/assets/sfx/chain-lock.mp3",
  "game-start": "/assets/sfx/game-start.mp3",
  kaching: "/assets/sfx/kaching.mp3",
};

const SFX_VOLUMES: Record<SfxKey, number> = {
  "button-click": 0.32,
  "confirm-bet": 0.5,
  "countdown-chime": 0.45,
  "dice-shake": 0.38,
  "chain-lock": 0.55,
  "game-start": 0.55,
  kaching: 0.65,
};

/**
 * Fire-and-forget one-shot SFX. Creates a fresh Audio instance each call so
 * rapid successive triggers (button mashing) overlap cleanly and GC after
 * playback.
 */
export function playSfx(key: SfxKey): void {
  try {
    const audio = new Audio(SFX_PATHS[key]);
    audio.volume = SFX_VOLUMES[key];
    void audio.play().catch(() => undefined);
  } catch (error) {
    void error;
  }
}

/** Create a persistent looping audio (e.g. dice-shake ambience). */
export function createLoopingSfx(key: SfxKey): HTMLAudioElement {
  const audio = new Audio(SFX_PATHS[key]);
  audio.volume = SFX_VOLUMES[key];
  audio.loop = true;
  return audio;
}
