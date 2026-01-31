import { useCallback, useRef } from "react";

/**
 * Hook to play achievement/celebration sounds using Web Audio API
 * Creates a synthesized fanfare sound without external dependencies
 */
export function useAchievementSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a celebratory achievement fanfare sound
   */
  const playAchievementSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Master gain for overall volume
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.connect(ctx.destination);

      // Achievement fanfare notes (C major arpeggio with flourish)
      const notes = [
        { freq: 523.25, start: 0, duration: 0.15 },      // C5
        { freq: 659.25, start: 0.1, duration: 0.15 },    // E5
        { freq: 783.99, start: 0.2, duration: 0.15 },    // G5
        { freq: 1046.50, start: 0.3, duration: 0.4 },    // C6 (held)
        { freq: 1318.51, start: 0.35, duration: 0.35 },  // E6 (harmony)
      ];

      notes.forEach(({ freq, start, duration }) => {
        // Create oscillator for each note
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);

        // ADSR envelope for each note
        noteGain.gain.setValueAtTime(0, now + start);
        noteGain.gain.linearRampToValueAtTime(0.8, now + start + 0.02); // Attack
        noteGain.gain.linearRampToValueAtTime(0.6, now + start + 0.05); // Decay
        noteGain.gain.setValueAtTime(0.6, now + start + duration - 0.1); // Sustain
        noteGain.gain.linearRampToValueAtTime(0, now + start + duration); // Release

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + start);
        osc.stop(now + start + duration + 0.1);
      });

      // Add a subtle shimmer effect (high frequency sparkle)
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(2637, now + 0.4); // E7

      shimmerGain.gain.setValueAtTime(0, now + 0.4);
      shimmerGain.gain.linearRampToValueAtTime(0.15, now + 0.42);
      shimmerGain.gain.linearRampToValueAtTime(0, now + 0.7);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(masterGain);
      shimmerOsc.start(now + 0.4);
      shimmerOsc.stop(now + 0.8);

    } catch (error) {
      console.warn("Could not play achievement sound:", error);
    }
  }, [getAudioContext]);

  /**
   * Play a quick success/confirmation sound
   */
  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25, now);
      masterGain.connect(ctx.destination);

      // Two-note success chime
      const notes = [
        { freq: 880, start: 0, duration: 0.12 },    // A5
        { freq: 1174.66, start: 0.08, duration: 0.2 }, // D6
      ];

      notes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);

        noteGain.gain.setValueAtTime(0, now + start);
        noteGain.gain.linearRampToValueAtTime(0.7, now + start + 0.02);
        noteGain.gain.linearRampToValueAtTime(0, now + start + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + start);
        osc.stop(now + start + duration + 0.05);
      });
    } catch (error) {
      console.warn("Could not play success sound:", error);
    }
  }, [getAudioContext]);

  return { playAchievementSound, playSuccessSound };
}
