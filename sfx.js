// sfx.js — procedural SFX για paper cut-out (engine v2). Χωρίς assets: κάθε ήχος = κώδικας + seed.
// CLI: node sfx.js demo              -> sfx_demo.wav (όλα τα presets στη σειρά) + λίστα χρόνων
//      node sfx.js <preset> [seed]   -> <preset>.wav
// API: mix(cues, total) -> [L, R] ; writeWav(path, [L, R])
//      cues: [[t, 'preset', { gain, pan, seed, dur, ... }], ...]
const fs = require('fs');
const SR = 48000, TAU = Math.PI * 2;

// ---------- DSP helpers ----------
const mulberry = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const buf = s => new Float32Array(Math.max(1, Math.ceil(s * SR)));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
const bell = (u, pk) => (u < pk ? Math.sin(Math.PI / 2 * u / pk) ** 2 : Math.cos(Math.PI / 2 * (u - pk) / (1 - pk)) ** 2);
const fade = (u, a = 0.03, b = 0.08) => Math.min(1, u / a, (1 - u) / b);
function biquad() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  return {
    set(type, f, Q = 0.707) {
      f = Math.min(Math.max(f, 20), SR * 0.45);
      const w = TAU * f / SR, c = Math.cos(w), al = Math.sin(w) / (2 * Q), a0 = 1 + al;
      if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
      else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
      else { b0 = al; b1 = 0; b2 = -al; } // bp (0 dB peak)
      b0 /= a0; b1 /= a0; b2 /= a0; a1 = -2 * c / a0; a2 = (1 - al) / a0; return this;
    },
    run(x) { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; },
  };
}
function pink(r) { let b0 = 0, b1 = 0, b2 = 0; return () => { const w = r() * 2 - 1; b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.96300 * b1 + w * 0.2965164; b2 = 0.57000 * b2 + w * 1.0526913; return (b0 + b1 + b2 + w * 0.1848) * 0.2; }; }
const W = r => r() * 2 - 1;

// ---------- presets: (o, r) -> mono Float32Array ή [L, R] ----------
const P = {
  // πέρασμα αέρα με sweep + pan L→R (wipes, μεταβάσεις)
  whoosh(o, r) {
    const d = o.dur ?? 0.5, lo = o.lo ?? 280, hi = o.hi ?? 2600, pk = o.peak ?? 0.55, n = buf(d), f = biquad(), g = biquad(), hp = biquad().set('hp', o.hp ?? 140), p = pink(r);
    const L = new Float32Array(n.length), R = new Float32Array(n.length), sweep = o.pan ?? 0.9;
    for (let i = 0; i < n.length; i++) {
      const u = i / n.length, e = bell(u, pk), fc = lo * Math.pow(hi / lo, e);
      if (i % 32 === 0) { f.set('bp', fc, 1.3); g.set('lp', fc * 1.7, 0.7); }
      const x = hp.run(f.run(W(r)) + g.run(p()) * 0.45) * e, th = Math.PI / 4 + (u - 0.5) * sweep;
      L[i] = x * Math.cos(th); R[i] = x * Math.sin(th);
    }
    return [L, R];
  },
  swoosh: (o, r) => P.whoosh({ dur: 0.28, lo: 500, hi: 4200, peak: 0.4, ...o }, r),
  zoom: (o, r) => P.whoosh({ dur: 0.45, lo: 180, hi: 3600, peak: 0.88, pan: 0, ...o }, r),
  air: (o, r) => P.whoosh({ dur: 0.6, lo: 150, hi: 1000, peak: 0.35, pan: 0.3, ...o }, r),

  // σκίσιμο χαρτιού: crackles με μεταβλητή πυκνότητα + ινώδες σώμα
  tear(o, r) {
    const d = o.dur ?? 0.65, n = buf(d), bp = biquad(), hp = biquad().set('hp', 900), body = biquad().set('bp', 1900, 0.8);
    let next = 0, burst = 0, amp = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / SR, u = i / n.length;
      if (i >= next) { const dens = 260 + 520 * Math.sin(Math.PI * u); next = i + Math.floor(SR / dens * (0.3 + r() * 1.4)); burst = Math.floor(SR * (0.0008 + r() * 0.003)); amp = 0.3 + r() * 0.7; bp.set('bp', 1700 + r() * 3600, 2.5); }
      const c = burst-- > 0 ? W(r) * amp : 0, rasp = 0.55 + 0.45 * Math.sin(TAU * (32 + 22 * u) * t);
      n[i] = (bp.run(c) * 1.5 + body.run(hp.run(W(r))) * 0.45 * rasp) * fade(u, 0.05, 0.18);
    }
    return n;
  },

  // pop (spring pop εμφάνισης)
  pop(o, r) {
    const d = o.dur ?? 0.16, f0 = o.f0 ?? 720, f1 = o.f1 ?? 190, n = buf(d), hp = biquad().set('hp', 1500); let ph = 0;
    for (let i = 0; i < n.length; i++) { const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t / 0.018); ph += TAU * f / SR; const k = t < 0.004 ? W(r) * (1 - t / 0.004) * 0.5 : 0; n[i] = Math.sin(ph) * env(t, 0.002, 0.045) + hp.run(k); }
    return n;
  },
  // blip (κείμενο/caption εμφανίζεται)
  blip(o, r) {
    const d = o.dur ?? 0.09, f0 = o.f0 ?? 650, f1 = o.f1 ?? 1300, n = buf(d); let ph = 0;
    for (let i = 0; i < n.length; i++) { const t = i / SR, u = i / n.length; ph += TAU * (f0 + (f1 - f0) * u) / SR; n[i] = (Math.sin(ph) + 0.2 * Math.sin(2 * ph)) * env(t, 0.003, 0.03); }
    return n;
  },
  // boing (κωμικό ελατήριο)
  boing(o, r) {
    const d = o.dur ?? 0.55, f = o.f ?? 210, n = buf(d); let ph = 0;
    for (let i = 0; i < n.length; i++) { const t = i / SR; ph += TAU * f * (1 + 0.38 * Math.exp(-t / 0.16) * Math.sin(TAU * 13 * t)) / SR; n[i] = (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * env(t, 0.004, 0.2); }
    return n;
  },
  // click ποντικιού / κουμπιού (press + release)
  click(o, r) {
    const n = buf(0.06), bp = biquad().set('bp', 3500, 1);
    for (const [t0, a] of [[0, 1], [0.019, 0.55]]) for (let i = 0; i < SR * 0.03; i++) { const t = i / SR, j = Math.floor(t0 * SR) + i; if (j >= n.length) break; n[j] += a * (bp.run(t < 0.003 ? W(r) : 0) * 1.6 + Math.sin(TAU * 2400 * t) * Math.exp(-t / 0.006) * 0.5 + Math.sin(TAU * 180 * t) * Math.exp(-t / 0.012) * 0.4); }
    return n;
  },
  // beep μηχανήματος (count = πόσα)
  beep(o, r) {
    const f = o.f ?? 1046, len = o.dur ?? 0.14, gap = o.gap ?? 0.07, cnt = o.count ?? 1, n = buf(cnt * (len + gap));
    for (let k = 0; k < cnt; k++) for (let i = 0; i < len * SR; i++) { const t = i / SR, u = t / len, j = Math.floor(k * (len + gap) * SR) + i; const x = TAU * f * t; n[j] = (Math.sin(x) + 0.2 * Math.sin(3 * x)) * Math.min(1, t / 0.004, (1 - u) * len / 0.015); }
    return n;
  },
  // ding ✓ (καμπανάκι με inharmonic partials)
  ding(o, r) {
    const f = o.f ?? 1318, d = o.dur ?? 1.6, n = buf(d), hp = biquad().set('hp', 3000);
    const parts = [[1, 1, 1.3], [2.0, 0.35, 0.9], [2.76, 0.45, 0.7], [5.4, 0.2, 0.35], [8.93, 0.1, 0.2]];
    for (let i = 0; i < n.length; i++) { const t = i / SR; let s = 0; for (const [k, a, dc] of parts) s += Math.sin(TAU * f * k * t) * a * Math.exp(-t / dc); n[i] = s * Math.min(1, t / 0.0015) * 0.45 + hp.run(t < 0.002 ? W(r) * 0.4 : 0); }
    return n;
  },
  // thud (κάτι ακουμπάει / stamp με snap)
  thud(o, r) {
    const d = o.dur ?? 0.3, f0 = o.f0 ?? 110, f1 = o.f1 ?? 48, snap = o.snap ?? 0, n = buf(d), lp = biquad().set('lp', 380), hp = biquad().set('hp', 2000); let ph = 0;
    for (let i = 0; i < n.length; i++) { const t = i / SR; ph += TAU * (f1 + (f0 - f1) * Math.exp(-t / 0.03)) / SR; const x = Math.sin(ph) * env(t, 0.002, 0.09) + lp.run(W(r)) * env(t, 0.001, 0.03) * 1.2 + hp.run(t < 0.003 ? W(r) : 0) * snap; n[i] = Math.tanh(1.6 * x); }
    return n;
  },
  stamp: (o, r) => P.thud({ f0: 150, f1: 60, snap: 0.8, dur: 0.28, ...o }, r),
  // ticks slider (count ticks, pitch ανεβαίνει)
  ticks(o, r) {
    const cnt = o.count ?? 12, gap = o.gap ?? 0.05, f = o.f ?? 2100, rise = o.rise ?? 1.3, n = buf(cnt * gap + 0.02), bp = biquad().set('bp', 4000, 2);
    for (let k = 0; k < cnt; k++) { const fk = f * Math.pow(rise, k / cnt); for (let i = 0; i < 0.012 * SR; i++) { const t = i / SR, j = Math.floor(k * gap * SR) + i; n[j] += bp.run(t < 0.0015 ? W(r) : 0) * 1.2 + Math.sin(TAU * fk * t) * Math.exp(-t / 0.004) * 0.45; } }
    return n;
  },

  // CO2 laser: stepper whine (raster passes) + buzz όταν «ρίχνει» + τσιτσίρισμα + εξαερισμός
  laser(o, r) {
    const d = o.dur ?? 2.5, pass = o.pass ?? 0.32, n = buf(d);
    const mLP = biquad().set('lp', 3200, 0.8), fan = biquad().set('lp', 850, 0.6), hiss = biquad().set('hp', 6000), sz = biquad().set('bp', 4300, 1.4), bz = biquad().set('bp', 2350, 3);
    let ph = 0, bph = 0, fire = 0, fs = 0, fireT = 0, crk = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / SR, u = i / n.length, pu = (t % pass) / pass, spd = pu < 0.15 ? pu / 0.15 : pu > 0.85 ? (1 - pu) / 0.15 : 1;
      ph += TAU * (360 + 880 * spd) / SR;
      const s = Math.sin(ph), motor = (s + 0.35 * Math.sin(2 * ph) + 0.22 * Math.sign(s)) * 0.35 * (0.15 + 0.85 * spd);
      if (i >= fireT) { fire = spd > 0.8 && r() < 0.65 ? 1 : 0; fireT = i + Math.floor(SR * (0.01 + r() * 0.04)); }
      fs += (fire - fs) * 0.012;
      bph = (bph + (2350 + 30 * Math.sin(TAU * 7 * t)) / SR) % 1;
      if (fs > 0.5 && crk <= 0 && r() < 0.004) crk = Math.floor(SR * 0.0015);
      const c = crk-- > 0 ? W(r) : 0;
      n[i] = (mLP.run(motor) * 0.55 + bz.run(bph * 2 - 1) * 0.9 * fs + sz.run(c) * 1.1 + fan.run(W(r)) * 0.3 + hiss.run(W(r)) * 0.05) * fade(u, 0.04, 0.12);
    }
    return n;
  },
  // καπάκι μηχανήματος: τρίξιμο μεντεσέ (stick-slip) + «κλακ» στο τέλος
  lid(o, r) {
    const d = o.dur ?? 0.5, n = buf(d + 0.12), a = biquad().set('bp', 750, 5), b = biquad().set('bp', 1650, 6); let next = 0;
    for (let i = 0; i < d * SR; i++) { const u = i / (d * SR), rate = 70 + 55 * Math.sin(Math.PI * u) + r() * 25; let x = 0; if (i >= next) { x = 1; next = i + Math.floor(SR / rate); } n[i] = (a.run(x) + b.run(x) * 0.6) * 4 * bell(u, 0.4) * 0.6; }
    const k = P.thud({ f0: 240, f1: 120, snap: 0.9, dur: 0.12 }, r), j0 = Math.floor(d * SR);
    for (let i = 0; i < k.length && j0 + i < n.length; i++) n[j0 + i] += k[i] * 0.7;
    return n;
  },
  // χαρτί/αντικείμενο σέρνεται στο τραπέζι (strokes = πόσες μικρές κινήσεις)
  slide(o, r) {
    const d = o.dur ?? 1.1, st = o.strokes ?? 3, n = buf(d), bp = biquad().set('bp', 1300, 0.8), hp = biquad().set('hp', 4500), p = pink(r);
    for (let i = 0; i < n.length; i++) { const u = i / n.length, k = Math.min(st - 1, Math.floor(u * st)), v = (u * st - k), sp = v < 0.8 ? bell(v / 0.8, 0.35) : 0; n[i] = (bp.run(p()) * 2.2 + hp.run(W(r)) * 0.15) * sp * (0.8 + 0.4 * r()); }
    return n;
  },
  // shimmer ✨ (εμφάνιση αποτελέσματος)
  shimmer(o, r) {
    const d = o.dur ?? 1.0, n = buf(d + 0.2), L = new Float32Array(n.length), R = new Float32Array(n.length), cnt = o.count ?? 22;
    for (let k = 0; k < cnt; k++) { const t0 = d * Math.pow(r(), 1.6), f = 2600 + r() * 3600, dc = 0.04 + r() * 0.09, a = (0.35 + r() * 0.65) * (1 - t0 / d * 0.6), pn = r(), j0 = Math.floor(t0 * SR); for (let i = 0; i < dc * 5 * SR && j0 + i < n.length; i++) { const t = i / SR, x = Math.sin(TAU * f * t) * a * env(t, 0.002, dc); L[j0 + i] += x * Math.cos(pn * Math.PI / 2); R[j0 + i] += x * Math.sin(pn * Math.PI / 2); } }
    return [L, R];
  },
  // μήνυμα στάλθηκε (whoop)
  sent(o, r) {
    const d = o.dur ?? 0.24, n = buf(d), f = biquad(); let ph = 0;
    for (let i = 0; i < n.length; i++) { const t = i / SR, fr = 420 * Math.pow(1250 / 420, Math.min(1, t / 0.14)); ph += TAU * fr / SR; if (i % 32 === 0) f.set('bp', fr * 2, 2); n[i] = Math.sin(ph) * env(t, 0.005, 0.07) + f.run(W(r)) * 0.35 * env(t, 0.01, 0.06); }
    return n;
  },
  // vinyl plotter (drag knife): stepper whine που αλλάζει με την ταχύτητα ανά segment + ξύσιμο λεπίδας + «τικ» στις αλλαγές κατεύθυνσης
  plotter(o, r) {
    const d = o.dur ?? 2.5, seg = o.seg ?? 0.22, n = buf(d), mLP = biquad().set('lp', 2600, 0.7), sc = biquad().set('bp', 5200, 1.1), scl = biquad().set('hp', 2500), tk = biquad().set('bp', 3000, 3);
    let ph = 0, segEnd = 0, v0 = 0, v1 = 0, segLen = 1, segStart = 0, tick = 0, grit = 0, gT = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / SR, u = i / n.length;
      if (i >= segEnd) { v0 = v1; v1 = 0.35 + r() * 0.65; segStart = i; segLen = Math.floor(SR * seg * (0.5 + r())); segEnd = i + segLen; tick = Math.floor(SR * 0.004); }
      const su = (i - segStart) / segLen, ramp = su < 0.12 ? su / 0.12 : su > 0.88 ? (1 - su) / 0.12 : 1, v = v1 * ramp;
      ph += TAU * (220 + 900 * v) / SR;
      const s = Math.sin(ph), motor = (s + 0.3 * Math.sin(2 * ph) + 0.25 * Math.sign(s) + 0.12 * Math.sin(3.01 * ph)) * (0.1 + 0.9 * v);
      if (i >= gT) { grit = 0.4 + r() * 0.6; gT = i + Math.floor(SR * (0.002 + r() * 0.01)); }
      const scratch = sc.run(W(r)) * grit * v * 0.9 + scl.run(W(r)) * 0.08 * v;
      const k = tick-- > 0 ? tk.run(W(r)) * 1.2 : tk.run(0);
      n[i] = (mLP.run(motor) * 0.45 + scratch + k) * fade(u, 0.04, 0.1);
    }
    return n;
  },
  // vinyl ξεκολλάει από το backing (weeding / transfer tape): πυκνά micro-crackles κόλλας + stick-slip rasp · o.speed 0..1 (αργό = πιο «τραγανό»)
  peel(o, r) {
    const d = o.dur ?? 2.0, spd = o.speed ?? 0.5, n = buf(d), c1 = biquad(), body = biquad().set('bp', 1400, 0.9), hp = biquad().set('hp', 700), lo = biquad().set('lp', 500, 0.7);
    let next = 0, burst = 0, amp = 0, sp = 0, slipPh = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / SR, u = i / n.length;
      const vel = (0.55 + 0.45 * Math.sin(TAU * (0.7 + spd) * t + 1.3) * Math.sin(TAU * 0.23 * t + 0.4)) * fade(u, 0.08, 0.15);
      if (i >= next) { const dens = 350 + 2200 * vel * (0.6 + spd); next = i + Math.floor(SR / dens * (0.2 + r() * 1.6)); burst = Math.floor(SR * (0.00015 + r() * 0.0006)); amp = (0.25 + r() * 0.75) * (r() < 0.06 ? 1.8 : 1); c1.set('bp', 2200 + r() * 4200, 1.8); }
      const c = burst-- > 0 ? W(r) * amp : 0;
      slipPh += (70 + 110 * vel) / SR; const slip = Math.pow(Math.max(0, Math.sin(TAU * slipPh)), 6);
      sp += (vel - sp) * 0.002;
      n[i] = (c1.run(c) * 1.6 + body.run(hp.run(W(r))) * 0.35 * slip * sp + lo.run(W(r)) * 0.15 * sp) * vel;
    }
    return n;
  },
  // ράκλα (squeegee) πάνω σε vinyl/transfer tape: τρίψιμο πλαστικού + αχνό «τσιρ» · strokes = περάσματα
  squeegee(o, r) {
    const d = o.dur ?? 0.9, st = o.strokes ?? 1, n = buf(d), bp = biquad().set('bp', 950, 0.9), hp = biquad().set('hp', 3500), sq = biquad().set('bp', 2600, 8), p = pink(r);
    let ph = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / SR, u = i / n.length, k = Math.min(st - 1, Math.floor(u * st)), v = u * st - k, e = v < 0.85 ? bell(v / 0.85, 0.3) : 0;
      ph += TAU * (2300 + 350 * Math.sin(TAU * 9 * t) + 600 * e) / SR;
      const rub = bp.run(p()) * 2.4 + hp.run(W(r)) * 0.12, squeak = sq.run(Math.sin(ph) * (r() < 0.5 ? 1 : 0.2)) * 0.5 * Math.max(0, e - 0.5) * 2;
      n[i] = (rub + squeak) * e * (0.8 + 0.2 * Math.sin(TAU * 31 * t));
    }
    return n;
  },
};
// default gains (σχετική ένταση στο stem)
const GAIN = { plotter: 0.5, peel: 0.6, squeegee: 0.5, laser: 0.5, air: 0.4, slide: 0.55, shimmer: 0.5, whoosh: 0.75, swoosh: 0.7, zoom: 0.7, tear: 0.7, ding: 0.6, lid: 0.6, ticks: 0.55, beep: 0.3, blip: 0.45, sent: 0.55, boing: 0.55 };

function norm(x, pk = 0.7) { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); if (m > 0) for (let i = 0; i < x.length; i++) x[i] *= pk / m; return x; }
function make(name, o = {}) {
  const fn = P[name]; if (!fn) throw new Error(`sfx: άγνωστο preset «${name}» (έχει: ${Object.keys(P).join(', ')})`);
  let out = fn(o, mulberry(o.seed ?? 7));
  if (!Array.isArray(out)) { const pn = ((o.pan ?? 0) + 1) * Math.PI / 4; out = [out.map(v => v * Math.cos(pn) * Math.SQRT2), out.map(v => v * Math.sin(pn) * Math.SQRT2)]; }
  let m = 0; for (const c of out) for (const v of c) m = Math.max(m, Math.abs(v));
  const g = (o.gain ?? 1) * (GAIN[name] ?? 0.65) * (m ? 0.7 / m : 0);
  return out.map(c => c.map(v => v * g));
}
function mix(cues, total) {
  const N = Math.ceil(total * SR), L = new Float32Array(N), R = new Float32Array(N);
  for (const [t, name, o] of cues) { const [a, b] = make(name, o || {}), j0 = Math.round(t * SR); for (let i = Math.max(0, -j0); i < a.length && j0 + i < N; i++) { L[j0 + i] += a[i]; R[j0 + i] += b[i]; } }
  const lim = x => { const s = Math.abs(x); return s < 0.8 ? x : Math.sign(x) * (0.8 + 0.2 * Math.tanh((s - 0.8) / 0.2)); };
  for (let i = 0; i < N; i++) { L[i] = lim(L[i]); R[i] = lim(R[i]); }
  return [L, R];
}
function writeWav(path, [L, R]) {
  const n = L.length, b = Buffer.alloc(44 + n * 4), q = v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(q(L[i]), 44 + i * 4); b.writeInt16LE(q(R[i]), 46 + i * 4); }
  fs.writeFileSync(path, b);
}
module.exports = { SR, P, GAIN, make, mix, writeWav };

if (require.main === module) {
  const [cmd = 'demo', seed] = process.argv.slice(2);
  if (cmd === 'demo') {
    const list = [['whoosh', { seed: 1 }], ['whoosh', { seed: 2 }], ['tear'], ['pop'], ['blip'], ['boing'], ['click'], ['beep', { count: 2 }], ['ding'], ['thud'], ['stamp'], ['ticks'], ['slide'], ['lid'], ['air'], ['zoom'], ['swoosh'], ['sent'], ['shimmer'], ['laser', { dur: 3 }], ['plotter', { dur: 2.5 }], ['peel', { dur: 2.5 }], ['squeegee', { strokes: 3, dur: 1.8 }]];
    let t = 0.3; const cues = [];
    for (const [nm, o = {}] of list) { const len = make(nm, o)[0].length / SR; cues.push([t, nm, o]); console.log(`${t.toFixed(1).padStart(5)}s  ${nm}${o.seed ? ' (seed ' + o.seed + ')' : ''}`); t += len + 0.6; }
    writeWav('sfx_demo.wav', mix(cues, t + 0.3)); console.log('sfx_demo.wav', t.toFixed(1) + 's');
  } else { writeWav(`${cmd}.wav`, mix([[0.05, cmd, { seed: +seed || 7 }]], make(cmd, { seed: +seed || 7 })[0].length / SR + 0.15)); console.log(`${cmd}.wav`); }
}
