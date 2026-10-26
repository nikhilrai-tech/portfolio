"use client";

// Generative ambient score, synthesised in the browser: no audio files, nothing to license.
// A soft pad holds a chord per section, sparse pentatonic plucks drift on top, and short
// ticks answer hovers and clicks. Everything runs through one master gain so it fades cleanly.

const CHORDS = [
  [57, 64, 69, 72], // Am   intro
  [53, 60, 65, 69], // F    about
  [48, 55, 60, 64], // C    experience
  [55, 62, 67, 71], // G    work
  [52, 59, 64, 67], // Em   stack
  [50, 57, 62, 65], // Dm   moments
  [57, 64, 69, 76], // Am   contact
];
const PENTA = [69, 72, 74, 76, 79, 81, 84];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private padBus!: GainNode;
  private filter!: BiquadFilterNode;
  private voices: OscillatorNode[] = [];
  private reverb!: ConvolverNode;
  private plucks = 0;
  private section = 0;
  on = false;

  private setup() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);

    // Synthetic hall: decaying stereo noise as the impulse response.
    this.reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 3;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
    }
    this.reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    this.reverb.connect(wet).connect(this.master);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 900;
    this.filter.Q.value = 0.6;
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoDepth.gain.value = 380;
    lfo.connect(lfoDepth).connect(this.filter.frequency);
    lfo.start();

    this.padBus = ctx.createGain();
    this.padBus.gain.value = 0.09;
    this.filter.connect(this.padBus);
    this.padBus.connect(this.master);
    this.padBus.connect(this.reverb);

    CHORDS[0].forEach((note, i) => {
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.value = hz(note - (i === 0 ? 12 : 0));
        osc.detune.value = detune;
        osc.connect(this.filter);
        osc.start();
        this.voices.push(osc);
      }
    });
  }

  private pluck() {
    if (!this.ctx || !this.on) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const chord = CHORDS[this.section] ?? CHORDS[0];
    const pool = Math.random() < 0.5 ? PENTA : chord.map((n) => n + 12);
    const note = pool[(Math.random() * pool.length) | 0];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = hz(note);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    osc.connect(gain);
    gain.connect(this.master);
    gain.connect(this.reverb);
    osc.start(t);
    osc.stop(t + 2.3);
    this.plucks = window.setTimeout(() => this.pluck(), 700 + Math.random() * 1900);
  }

  async start() {
    if (!this.ctx) this.setup();
    await this.ctx!.resume();
    this.on = true;
    const t = this.ctx!.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0.9, t, 0.8);
    window.clearTimeout(this.plucks);
    this.plucks = window.setTimeout(() => this.pluck(), 1200);
  }

  stop() {
    if (!this.ctx) return;
    this.on = false;
    window.clearTimeout(this.plucks);
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.35);
  }

  /** Glides the pad to the chord for a section. */
  setSection(index: number) {
    this.section = Math.max(0, Math.min(CHORDS.length - 1, index));
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const chord = CHORDS[this.section];
    this.voices.forEach((osc, i) => {
      const voice = Math.floor(i / 2);
      osc.frequency.setTargetAtTime(hz(chord[voice] - (voice === 0 ? 12 : 0)), t, 0.9);
    });
  }

  /** Short interface blip: "hover" is a soft high tick, "press" a lower one. */
  tick(kind: "hover" | "press" = "hover") {
    if (!this.ctx || !this.on) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(kind === "hover" ? 2200 : 660, t);
    osc.frequency.exponentialRampToValueAtTime(kind === "hover" ? 1600 : 420, t + 0.06);
    gain.gain.setValueAtTime(kind === "hover" ? 0.02 : 0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

let engine: SoundEngine | null = null;
export function getSound() {
  engine ??= new SoundEngine();
  return engine;
}
