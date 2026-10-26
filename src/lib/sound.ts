"use client";

// Generative lo-fi score, synthesised in the browser: no audio files, nothing to license.
// 88 BPM: a soft kick and hi-hat, a bass on the chord root, a warm pad that changes chord per
// section, and sparse pentatonic plucks on top. Ticks answer hovers and presses.

const BPM = 88;
const STEP = 60 / BPM / 4; // sixteenth note, seconds
const CHORDS = [
  [57, 60, 64, 67], // Am7  intro
  [53, 57, 60, 64], // Fmaj7 about
  [48, 52, 55, 59], // Cmaj7 experience
  [53, 57, 60, 67], // Fadd9 journey
  [55, 59, 62, 65], // G7   work
  [52, 55, 59, 62], // Em7  stack
  [50, 53, 57, 60], // Dm7  moments
  [57, 60, 64, 71], // Am9  contact
];
const PENTA = [69, 72, 74, 76, 79, 81, 84];
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** A tiny silent WAV. Playing it through an <audio> element moves iOS into the "playback"
 *  audio session, so Web Audio is heard even with the ring/silent switch on. */
function silentWavUrl() {
  const samples = 800;
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) =>
    [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + samples * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 16000, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private analyser!: AnalyserNode;
  private levels = new Uint8Array(32);
  private padFilter!: BiquadFilterNode;
  private padVoices: OscillatorNode[] = [];
  private reverb!: ConvolverNode;
  private noise!: AudioBuffer;
  private unlock: HTMLAudioElement | null = null;
  private timer = 0;
  private nextTime = 0;
  private step = 0;
  private section = 0;
  on = false;

  private setup() {
    const ctx = new AudioContext({ latencyHint: "playback" });
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);

    // Synthetic room: decaying stereo noise as the impulse response.
    this.reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.4;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.4;
    }
    this.reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    this.reverb.connect(wet).connect(this.master);

    this.noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    // Pad: two detuned saws per chord note through a slowly breathing low-pass.
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = 1500;
    this.padFilter.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoDepth.gain.value = 600;
    lfo.connect(lfoDepth).connect(this.padFilter.frequency);
    lfo.start();
    const padGain = ctx.createGain();
    padGain.gain.value = 0.05;
    this.padFilter.connect(padGain);
    padGain.connect(this.master);
    padGain.connect(this.reverb);
    CHORDS[0].forEach((note) => {
      for (const detune of [-9, 9]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = hz(note);
        osc.detune.value = detune;
        osc.connect(this.padFilter);
        osc.start();
        this.padVoices.push(osc);
      }
    });
  }

  // ---- instruments -------------------------------------------------------------------------

  private kick(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.34);
  }

  private hat(t: number, level: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(hp).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.06);
  }

  private bass(t: number, midi: number, length: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = hz(midi);
    lp.type = "lowpass";
    lp.frequency.value = 600;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.02);
    g.gain.setTargetAtTime(0, t + length * 0.7, 0.08);
    osc.connect(lp).connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + length + 0.4);
  }

  private pluck(t: number, midi: number, level = 0.12) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = hz(midi);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 1.4);
    osc.connect(g);
    g.connect(this.master);
    g.connect(this.reverb);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  // ---- sequencer: schedules a little ahead so timing stays tight ----------------------------

  private schedule() {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + 0.12) {
      const s = this.step % 16;
      const t = this.nextTime;
      const chord = CHORDS[this.section];
      if (s === 0 || s === 10) this.kick(t);
      if (s % 4 === 2) this.hat(t, 0.09);
      else if (s % 2 === 1) this.hat(t, 0.025);
      if (s === 0) this.bass(t, chord[0] - 24, STEP * 6);
      if (s === 8) this.bass(t, chord[0] - 24 + (this.step % 32 >= 16 ? 7 : 0), STEP * 4);
      if (s % 4 === 0 && Math.random() < 0.45) {
        const pool = Math.random() < 0.6 ? PENTA : chord.map((n) => n + 12);
        this.pluck(t + (Math.random() < 0.3 ? STEP : 0), pool[(Math.random() * pool.length) | 0]);
      }
      this.nextTime += STEP;
      this.step++;
    }
  }

  async start() {
    if (!this.ctx) this.setup();
    const ctx = this.ctx!;
    // iOS: route Web Audio through the media channel, not the ringer.
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
    if (!this.unlock) {
      this.unlock = new Audio(silentWavUrl());
      this.unlock.loop = true;
      this.unlock.setAttribute("playsinline", "");
    }
    this.unlock.play().catch(() => {});
    await ctx.resume();
    this.on = true;
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0.85, t + 1.2);
    this.nextTime = t + 0.08;
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  stop() {
    if (!this.ctx) return;
    this.on = false;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + 0.5);
    window.setTimeout(() => {
      if (this.on) return;
      window.clearInterval(this.timer);
      this.unlock?.pause();
      this.ctx?.suspend();
    }, 600);
  }

  /** Glides the pad to the chord for a section; drums and bass follow on the next step. */
  setSection(index: number) {
    this.section = Math.max(0, Math.min(CHORDS.length - 1, index));
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const chord = CHORDS[this.section];
    this.padVoices.forEach((osc, i) =>
      osc.frequency.setTargetAtTime(hz(chord[Math.floor(i / 2)]), t, 0.6),
    );
  }

  /** Output level 0..1, for the equalizer bars. */
  level(band: number) {
    if (!this.ctx || !this.on) return 0;
    this.analyser.getByteFrequencyData(this.levels);
    return this.levels[Math.min(this.levels.length - 1, band)] / 255;
  }

  /** Short interface blip: "hover" is a soft high tick, "press" a lower one. */
  tick(kind: "hover" | "press" = "hover") {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    this.pluck(t, kind === "hover" ? 93 : 81, kind === "hover" ? 0.03 : 0.07);
  }
}

let engine: SoundEngine | null = null;
export function getSound() {
  engine ??= new SoundEngine();
  return engine;
}
