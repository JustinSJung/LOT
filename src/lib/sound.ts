/**
 * Silent by default. Register a file path here once real audio assets exist
 * under public/sounds/ and playSound() will start using them automatically —
 * no call sites need to change. Keep any future sounds understated (a soft
 * tick/chime), never slot-machine/casino style.
 */
export type SoundName = "reveal-ball" | "save-set" | "unlock-achievement";

const SOUND_FILES: Partial<Record<SoundName, string>> = {
  // "reveal-ball": "sounds/reveal-ball.mp3",
};

const audioCache = new Map<string, HTMLAudioElement>();

export function playSound(name: SoundName): void {
  if (typeof window === "undefined") return;
  const src = SOUND_FILES[name];
  if (!src) return; // no file registered yet — stay silent

  try {
    let audio = audioCache.get(src);
    if (!audio) {
      audio = new Audio(src);
      audioCache.set(src, audio);
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Autoplay/user-gesture restrictions — fail silently.
    });
  } catch {
    // Audio unsupported/unavailable — fail silently.
  }
}
