/* معمل الرسم الفني — synthesized sound effects (Web Audio, no files needed)
   Designed & Developed by Mohamed-Eldawly */
(function (root) {
  'use strict';
  var VOL = { pencil: 0.5, ruler: 0.32, slide: 0.38, squeak: 0.09, rub: 0.38, whoosh: 0.55 };
  var CHAIN = {
    pencil: [['highpass', 1800, 0.7], ['bandpass', 4200, 0.9], ['peaking', 7000, 1, 6]],
    ruler: [['bandpass', 1100, 1.1], ['lowpass', 2600, 0.7]],
    slide: [['bandpass', 650, 1.4], ['lowpass', 1400, 0.7]],
    squeak: [['bandpass', 2900, 9]],
    rub: [['bandpass', 1500, 1.5]],
    whoosh: [['lowpass', 520, 0.8]]
  };
  function SFX() { this.ctx = null; this.loops = {}; var v = null; try { v = localStorage.getItem('dl-sound'); } catch (e) {} this.on = v !== '0'; }
  SFX.prototype.setOn = function (on) { this.on = on; try { localStorage.setItem('dl-sound', on ? '1' : '0'); } catch (e) {} if (on) this.tick(1600, 0.15); };
  SFX.prototype.init = function () {
    if (!this.on) return null;
    if (!this.ctx) {
      var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
      try { this.ctx = new AC(); } catch (e) { return null; }
      var sr = this.ctx.sampleRate, len = sr * 2, buf = this.ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf; this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) {} }
    return this.ctx;
  };
  SFX.prototype.loop = function (name) {
    var ctx = this.init(); if (!ctx) return null; if (this.loops[name]) return this.loops[name];
    var src = ctx.createBufferSource(); src.buffer = this.noise; src.loop = true;
    var g = ctx.createGain(); g.gain.value = 0; var node = src;
    (CHAIN[name] || []).forEach(function (c) { var f = ctx.createBiquadFilter(); f.type = c[0]; f.frequency.value = c[1]; f.Q.value = c[2]; if (c[3] !== undefined) f.gain.value = c[3]; node.connect(f); node = f; });
    node.connect(g); g.connect(this.master); src.start(); this.loops[name] = { g: g }; return this.loops[name];
  };
  SFX.prototype.play = function (name, level) {
    var L = this.loop(name); if (!L) return; var t = this.ctx.currentTime;
    var jit = name === 'pencil' ? 0.5 + Math.random() * 0.5 : 1, v = Math.max(0, Math.min(1, level)) * jit * (VOL[name] || 0.4);
    L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(v, t, 0.015); L.g.gain.setTargetAtTime(0, t + 0.08, 0.05);
  };
  SFX.prototype.tone = function (freq, dur, vol, type) {
    var ctx = this.init(); if (!ctx) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'triangle'; o.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  };
  SFX.prototype.tick = function (f, v) { this.tone(f || 1700, 0.05, v || 0.16, 'triangle'); };
  SFX.prototype.clack = function () { this.tone(320, 0.09, 0.22, 'square'); this.tone(170, 0.14, 0.3, 'sine'); };
  SFX.prototype.chime = function () { var s = this; s.tone(880, 0.4, 0.16, 'sine'); setTimeout(function () { s.tone(1320, 0.55, 0.14, 'sine'); }, 130); setTimeout(function () { s.tone(1760, 0.7, 0.09, 'sine'); }, 260); };
  SFX.prototype.err = function () { this.tone(220, 0.22, 0.16, 'sawtooth'); };
  SFX.prototype.thud = function (v) {
    var ctx = this.init(); if (!ctx) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.2); g.gain.setValueAtTime(v || 0.4, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.25);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.3);
  };
  SFX.prototype.noiseBurst = function (type, f0, f1, dur, vol) {
    var ctx = this.init(); if (!ctx) return; var t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = this.noise;
    var f = ctx.createBiquadFilter(); f.type = type; f.Q.value = 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.05);
  };
  SFX.prototype.rip = function () { this.noiseBurst('highpass', 700, 5200, 0.42, 0.42); };
  SFX.prototype.swoosh = function (dur, vol) { this.noiseBurst('bandpass', 300, 1400, dur || 0.6, vol || 0.3); };
  SFX.prototype.write = function () { var s = this; for (var j = 0; j < 9; j++) setTimeout(function () { s.play('pencil', 0.9); }, j * 45); };
  root.DLSfx = new SFX();
})(typeof window !== 'undefined' ? window : globalThis);
