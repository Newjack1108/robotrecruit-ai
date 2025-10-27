/**
 * Bot Runner Sound System
 * Retro arcade sounds using Web Audio API
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3; // Global volume control

  constructor() {
    // Initialize Audio Context lazily on first sound play
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported', error);
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    // Resume context if suspended (for browsers that require user interaction)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Create oscillator with envelope
   */
  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 1.0
  ): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Envelope: quick attack, sustain, quick release
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Create multi-tone sequence
   */
  private createSequence(notes: { freq: number; duration: number; delay: number; type?: OscillatorType; volume?: number }[]) {
    notes.forEach(note => {
      setTimeout(() => {
        this.createTone(note.freq, note.duration, note.type || 'square', note.volume || 1.0);
      }, note.delay);
    });
  }

  /**
   * Play task collection sound - upbeat blip
   */
  playTaskCollect() {
    this.ensureAudioContext();
    // Two-tone upbeat sound
    this.createTone(600, 0.06, 'sine', 0.4);
    setTimeout(() => {
      this.createTone(900, 0.08, 'sine', 0.4);
    }, 30);
  }

  /**
   * Play power-up pickup sound - rising tone sequence
   */
  playPowerUpPickup() {
    this.ensureAudioContext();
    this.createSequence([
      { freq: 400, duration: 0.1, delay: 0, type: 'sine' },
      { freq: 500, duration: 0.1, delay: 80, type: 'sine' },
      { freq: 600, duration: 0.1, delay: 160, type: 'sine' },
      { freq: 800, duration: 0.15, delay: 240, type: 'sine', volume: 1.2 },
    ]);
  }

  /**
   * Play bug eaten sound - descending whoosh
   */
  playBugEaten() {
    this.ensureAudioContext();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    
    // Descending frequency sweep
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    // Volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  /**
   * Play death sound - falling chromatic scale
   */
  playDeath() {
    this.ensureAudioContext();
    this.createSequence([
      { freq: 600, duration: 0.1, delay: 0 },
      { freq: 550, duration: 0.1, delay: 100 },
      { freq: 500, duration: 0.1, delay: 200 },
      { freq: 450, duration: 0.1, delay: 300 },
      { freq: 400, duration: 0.1, delay: 400 },
      { freq: 350, duration: 0.15, delay: 500 },
    ]);
  }

  /**
   * Play game start sound - quick startup jingle
   */
  playGameStart() {
    this.ensureAudioContext();
    this.createSequence([
      { freq: 440, duration: 0.15, delay: 0, type: 'triangle' },
      { freq: 554, duration: 0.15, delay: 150, type: 'triangle' },
      { freq: 659, duration: 0.2, delay: 300, type: 'triangle', volume: 1.2 },
    ]);
  }

  /**
   * Play game over sound - completion fanfare
   */
  playGameOver(isWin: boolean) {
    this.ensureAudioContext();
    if (isWin) {
      // Victory fanfare
      this.createSequence([
        { freq: 523, duration: 0.2, delay: 0, type: 'triangle' },
        { freq: 659, duration: 0.2, delay: 200, type: 'triangle' },
        { freq: 784, duration: 0.3, delay: 400, type: 'triangle', volume: 1.3 },
      ]);
    } else {
      // Game over (sad trombone)
      this.createSequence([
        { freq: 400, duration: 0.3, delay: 0 },
        { freq: 350, duration: 0.3, delay: 300 },
        { freq: 300, duration: 0.5, delay: 600 },
      ]);
    }
  }

  /**
   * Play power-up warning (when running out)
   */
  playPowerUpWarning() {
    this.ensureAudioContext();
    this.createTone(300, 0.1, 'sine', 0.5);
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

