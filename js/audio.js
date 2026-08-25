/**
 * Vannie's World - Audio Synthesizer (Web Audio API)
 * Procedural retro/kawaii sound effects and dynamic background music.
 */

import { CONSTANTS } from './constants.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isBgmPlaying = false;
    this.bgmTimer = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.currentBgmForm = CONSTANTS.FORMS.PASTEL;
    this.bgmStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.25, this.masterGain);
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureAudio() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureAudio();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  playJump(form) {
    if (this.isMuted) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (form === CONSTANTS.FORMS.PASTEL) {
      // Pastel: Sweet sparkling sine/triangle chime (higher pitch, cheerful)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    } else {
      // Crimson: Punchy cute warm square/triangle jump
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.14);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playTransform(toForm) {
    if (this.isMuted) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.currentBgmForm = toForm;

    // Multi-tone magical sparkle burst
    const notes = toForm === CONSTANTS.FORMS.PASTEL
      ? [523.25, 659.25, 783.99, 1046.50] // C5 - E5 - G5 - C6
      : [392.00, 493.88, 587.33, 783.99]; // G4 - B4 - D5 - G5

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = toForm === CONSTANTS.FORMS.PASTEL ? 'sine' : 'sawtooth';
      
      const startTime = t + idx * 0.035;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.12);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  playSwitch() {
    if (this.isMuted) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.setValueAtTime(600, t + 0.05);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playGem() {
    if (this.isMuted) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.1); // E6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playHurt() {
    if (this.isMuted) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playVictory() {
    if (this.isMuted) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    melody.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const st = t + idx * 0.08;
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(st);
      osc.stop(st + 0.4);
    });
  }

  // --- Dynamic Procedural BGM (Kawaii Lofi / Chiptune arpeggios) ---

  startBGM() {
    if (this.isBgmPlaying) return;
    this.ensureAudio();
    this.isBgmPlaying = true;
    this.scheduleBgmStep();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleBgmStep() {
    if (!this.isBgmPlaying || !this.ctx || this.isMuted) {
      this.bgmTimer = setTimeout(() => this.scheduleBgmStep(), 150);
      return;
    }

    const t = this.ctx.currentTime;
    const isPastel = this.currentBgmForm === CONSTANTS.FORMS.PASTEL;

    // Cute Pentatonic / Lydian Scale Patterns
    const pastelNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const crimsonNotes = [261.63, 329.63, 392.00, 440.00, 523.25, 587.33];

    const notePool = isPastel ? pastelNotes : crimsonNotes;
    const noteIdx = (this.bgmStep % notePool.length);
    const freq = notePool[noteIdx];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isPastel ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Warm soft bell envelope
    const dur = 0.18;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(t);
    osc.stop(t + dur);

    this.bgmStep = (this.bgmStep + 1) % 32;
    this.bgmTimer = setTimeout(() => this.scheduleBgmStep(), 140);
  }
}

export const audio = new AudioManager();
