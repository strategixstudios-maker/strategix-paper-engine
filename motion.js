// motion.js — κίνηση & physics (STYLE_GUIDE §1b): springs, μηχανήματα με μάζα, follow-through, βαρύτητα, κούνημα, squash, ίχνη
// Όλα stateless: κάθε τιμή υπολογίζεται από το t (preview/sheet σε οποιοδήποτε t = ίδιο αποτέλεσμα με το render) · ντετερμινιστικά (seed).
const L = require('./lib.js');
const { clamp, lerp, rng } = L;
const TAU = Math.PI * 2;

// ---------- springs ----------
// μοναδιαία βηματική απόκριση ταλαντωτή με απόσβεση: 0 → 1 με overshoot · f = Hz (ταχύτητα) · z = απόσβεση (0,3 ζωηρό · 0,5 cartoon · ≥1 χωρίς overshoot)
function stepResp(tau, f = 2.2, z = 0.5) {
  if (tau <= 0) return 0;
  const w = TAU * f;
  if (z >= 1) return 1 - Math.exp(-w * tau) * (1 + w * tau);
  const wd = w * Math.sqrt(1 - z * z), e = Math.exp(-z * w * tau);
  return 1 - e * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
// απόκριση κίνησης: spring + anticipation (λίγο προς τα πίσω πριν ξεκινήσει) · o = { f, z, antic (κλάσμα της κίνησης, 0 = χωρίς), ad (s), delay (s) }
function resp(tau, o = {}) {
  tau -= o.delay || 0;
  const a = o.antic || 0, d = o.ad ?? 0.12;
  if (!a) return stepResp(tau, o.f, o.z);
  return stepResp(tau - d, o.f, o.z) - (tau > 0 && tau < d * 1.8 ? a * Math.sin(Math.PI * tau / (d * 1.8)) : 0);
}
// a → b με spring από τη στιγμή t0 (a, b αριθμοί ή arrays) · o όπως resp()
function springTo(t, t0, a, b, o = {}) {
  const k = resp(t - t0, o);
  return Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k;
}
// K = [[t, v], ...] (v αριθμός ή array) → τιμή τη στιγμή t: κάθε νέο κλειδί = spring από την προηγούμενη τιμή (superposition, χωρίς state) · o όπως resp()
function springKeys(K, t, o = {}) {
  const arr = Array.isArray(K[0][1]), out = arr ? [...K[0][1]] : [K[0][1]];
  for (let i = 1; i < K.length && K[i][0] - (o.ad ?? 0.12) * 1.8 <= t; i++) {
    const k = resp(t - K[i][0], o), a = arr ? K[i - 1][1] : [K[i - 1][1]], b = arr ? K[i][1] : [K[i][1]];
    for (let j = 0; j < out.length; j++) out[j] += (b[j] - a[j]) * k;
  }
  return arr ? out : out[0];
}
// ταλάντωση που σβήνει (ζελέ, κούνημα μετά από χτύπημα): amt · e^(−ζωu) · cos(ω_d u) για u = t − t0 ≥ 0
function wobble(t, t0, amt = 1, f = 5, z = 0.25) {
  const u = t - t0; if (u < 0) return 0;
  const w = TAU * f; return amt * Math.exp(-z * w * u) * Math.cos(w * Math.sqrt(1 - z * z) * u);
}

// ---------- μηχανήματα με μάζα ----------
// άξονας με όριο ταχύτητας/επιτάχυνσης: επιτάχυνση → σταθερή ταχύτητα → φρενάρισμα (τραπέζιο· τρίγωνο αν δεν προλαβαίνει) · d απόσταση (px), vmax px/s, amax px/s²
// → { x, v, a, T (συνολική διάρκεια) } τη στιγμή tau από την αρχή
function trapez(tau, d, vmax, amax) {
  const s = d < 0 ? -1 : 1; d = Math.abs(d);
  let ta = vmax / amax, da = 0.5 * amax * ta * ta;
  if (2 * da > d) { ta = Math.sqrt(d / amax); vmax = amax * ta; da = d / 2; }
  const tc = (d - 2 * da) / vmax, T = 2 * ta + tc;
  let x, v, a;
  if (tau <= 0) { x = 0; v = 0; a = 0; }
  else if (tau < ta) { x = 0.5 * amax * tau * tau; v = amax * tau; a = amax; }
  else if (tau < ta + tc) { x = da + vmax * (tau - ta); v = vmax; a = 0; }
  else if (tau < T) { const u = T - tau; x = d - 0.5 * amax * u * u; v = amax * u; a = -amax; }
  else { x = d; v = 0; a = 0; }
  return { x: x * s, v: v * s, a: a * s, T };
}
// raster χάραξη XY gantry: γραμμές πέρα-δώθε από x0 ως x1 · o = { x0, x1, y0, dy, lines, vmax, amax, over (overscan px: φρενάρει έξω από το σχέδιο), step (s αλλαγή γραμμής) }
// → { x, y, v, a, line, dir, on (ρίχνει: μέσα στο x0..x1), part (0..1 πόσο έχει περάσει η τρέχουσα γραμμή), done, T, p (0..1) }
function raster(tau, o) {
  const over = o.over ?? 0, span = o.x1 - o.x0, d = span + 2 * over, T1 = trapez(0, d, o.vmax, o.amax).T, st = o.step ?? 0.06, Tl = T1 + st, T = o.lines * Tl - st;
  if (tau >= T) { const n = o.lines - 1, dir = n % 2 ? -1 : 1; return { x: dir > 0 ? o.x1 + over : o.x0 - over, y: o.y0 + n * o.dy, v: 0, a: 0, line: n, dir, on: false, part: 1, done: true, T, p: 1 }; }
  tau = Math.max(0, tau);
  const line = Math.floor(tau / Tl), u = tau - line * Tl, dir = line % 2 ? -1 : 1, r = trapez(u, d, o.vmax, o.amax);
  const x = dir > 0 ? o.x0 - over + r.x : o.x1 + over - r.x, dy = u > T1 ? o.dy * L.easeInOut((u - T1) / st) : 0;
  const part = clamp(dir > 0 ? (x - o.x0) / span : (o.x1 - x) / span);
  return { x, y: o.y0 + line * o.dy + dy, v: dir * r.v, a: dir * r.a, line, dir, on: u < T1 && x >= o.x0 && x <= o.x1, part, done: false, T, p: tau / T };
}
// κίνηση σε polyline P = [[x, y], ...] με όρια ταχύτητας/επιτάχυνσης: σταματάει μόνο σε γωνίες > corner rad (ομαλές καμπύλες = ένα πέρασμα)
// o = { vmax, amax, corner (default 0.5), dwell (s στάση σε κάθε γωνία) } → { x, y, v, seg (τρέχον τμήμα), done, T, len (μήκος που διανύθηκε) }
function pathMove(P, tau, o) {
  const cr = o.corner ?? 0.5, dw = o.dwell ?? 0.03, runs = [[0]];
  for (let i = 1; i < P.length - 1; i++) {
    const a1 = Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]), a2 = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]);
    let da = Math.abs(a2 - a1); if (da > Math.PI) da = TAU - da;
    runs[runs.length - 1].push(i); if (da > cr) runs.push([i]);
  }
  runs[runs.length - 1].push(P.length - 1);
  let t0 = 0, len0 = 0;
  for (let k = 0; k < runs.length; k++) {
    const idx = runs[k], segL = []; let tot = 0;
    for (let j = 1; j < idx.length; j++) { const l = Math.hypot(P[idx[j]][0] - P[idx[j - 1]][0], P[idx[j]][1] - P[idx[j - 1]][1]); segL.push(l); tot += l; }
    const m = trapez(tau - t0, tot, o.vmax, o.amax);
    if (tau < t0 + m.T + dw || k === runs.length - 1) {
      let s = clamp(m.x, 0, tot), j = 0; while (j < segL.length - 1 && s > segL[j]) { s -= segL[j]; j++; }
      const A = P[idx[j]], B = P[idx[j + 1]], q = segL[j] ? clamp(s / segL[j]) : 1;
      return { x: lerp(A[0], B[0], q), y: lerp(A[1], B[1], q), v: tau < t0 + m.T ? Math.abs(m.v) : 0, seg: idx[j], done: tau >= t0 + m.T && k === runs.length - 1, T: pathT(P, o), len: len0 + clamp(m.x, 0, tot) };
    }
    t0 += m.T + dw; len0 += tot;
  }
}
// συνολική διάρκεια του pathMove() (για χρονισμό σκηνών)
function pathT(P, o) {
  const cr = o.corner ?? 0.5, dw = o.dwell ?? 0.03; let T = 0, run = 0;
  for (let i = 1; i < P.length; i++) {
    run += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    let brk = i === P.length - 1;
    if (!brk) { const a1 = Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]), a2 = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]); let da = Math.abs(a2 - a1); if (da > Math.PI) da = TAU - da; brk = da > cr; }
    if (brk) { T += trapez(0, run, o.vmax, o.amax).T + dw; run = 0; }
  }
  return T - dw;
}

// ---------- keyframes · χρόνος ιστορίας ----------
// keyframes K = [[t, v], ...] (v αριθμός ή array) → τιμή στο t με easing ανά τμήμα (default easeInOut) · κάμερα, πόζες χωρίς spring (pf05 → pf06)
function kf(t, K, e = L.easeInOut) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const a = K[i - 1][1], b = K[i][1], u = e(L.prog(t, K[i - 1][0], K[i][0])); return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u); }
  return K[K.length - 1][1];
}
// rewind (◀◀): ο χρόνος της ιστορίας τ ως το t0, μετά γυρίζει από το from στο to μέσα στο [t0, t1] (easeInOut) και μένει στο to (ep02 tauOf · pf06 tauHook)
// → όλη η σκηνή ζωγραφίζεται με τ = rewindTau(t, …) και ξαναπαίζει ανάποδα χωρίς state
const rewindTau = (t, [t0, t1], from, to) => t < t0 ? t : lerp(from, to, L.easeInOut(L.prog(t, t0, t1)));

// ---------- follow-through · αδράνεια ----------
// κομμάτι που ακολουθεί το fn(t) με ελατήριο (καλώδια, σωλήνας, ποδιά, κρεμαστά): ολοκλήρωση σε παράθυρο win s πριν το t σε σταθερό πλέγμα → χωρίς state
// fn(t) → αριθμός ή array · o = { f (Hz, default 2), z (default 0,35), win (s, default 2), dt } → τιμή (ή array) του follower
function lag(fn, t, o = {}) {
  const f = o.f ?? 2, z = o.z ?? 0.35, win = o.win ?? 2, dt = o.dt ?? 1 / 120, w = TAU * f;
  let tt = Math.floor((t - win) / dt) * dt;
  const x0 = fn(tt), arr = Array.isArray(x0), x = arr ? [...x0] : [x0], v = x.map(() => 0);
  while (tt < t - 1e-9) {
    const h = Math.min(dt, t - tt), g = fn(tt + h), G = arr ? g : [g];
    for (let i = 0; i < x.length; i++) { v[i] += (w * w * (G[i] - x[i]) - 2 * z * w * v[i]) * h; x[i] += v[i] * h; }
    tt += h;
  }
  return arr ? x : x[0];
}
// παράγωγος (ταχύτητα) του fn στο t · αριθμός ή array
function deriv(fn, t, h = 1 / 120) { const a = fn(t - h), b = fn(t + h); return Array.isArray(a) ? a.map((v, i) => (b[i] - v) / (2 * h)) : (b - a) / (2 * h); }
// δεύτερη παράγωγος (επιτάχυνση) → αντίδραση αδράνειας: το σώμα του μηχανήματος τρέμει αντίθετα στην επιτάχυνση της κεφαλής
function accel(fn, t, h = 1 / 60) { const a = fn(t - h), b = fn(t), c = fn(t + h); return Array.isArray(a) ? a.map((v, i) => (c[i] - 2 * b[i] + v) / (h * h)) : (c - 2 * b + a) / (h * h); }

// ---------- κρούσεις · βαρύτητα ----------
// κούνημα με απόσβεση (βαρύ πράγμα που σταματάει, χτύπημα) → [dx, dy, rot] · amp px · o = { f (Hz, default 13), decay (s, default 0,3), seed }
function shake(t, t0, amp, o = {}) {
  const u = t - t0; if (u < 0) return [0, 0, 0];
  const e = amp * Math.exp(-u / (o.decay ?? 0.3)); if (e < 0.05) return [0, 0, 0];
  const f = o.f ?? 13, r = rng(o.seed ?? 1), p = [r() * TAU, r() * TAU, r() * TAU];
  return [e * Math.sin(TAU * f * u + p[0]), e * 0.7 * Math.sin(TAU * f * 1.31 * u + p[1]), e * 0.0015 * Math.sin(TAU * f * 0.77 * u + p[2])];
}
// άθροισμα από κουνήματα: S = [[t0, amp], ...] → [dx, dy, rot]
function shakes(t, S, o = {}) { return S.reduce((acc, [t0, a], i) => { const s = shake(t, t0, a, { ...o, seed: (o.seed ?? 1) + i }); return [acc[0] + s[0], acc[1] + s[1], acc[2] + s[2]]; }, [0, 0, 0]); }
// squash & stretch με σταθερό όγκο (μέσα σε save/restore): k > 1 τεντώνει κατά τη γωνία ang, k < 1 ζουλάει · (x, y) = σημείο που μένει σταθερό (π.χ. βάση που ακουμπάει)
function squash(ctx, x, y, k, ang = -Math.PI / 2) { ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, 1 / k); ctx.rotate(-ang); ctx.translate(-x, -y); }
// πτώση με αναπηδήσεις (αναλυτικά): αντικείμενο αφήνεται στο t0 από y0 με ταχύτητα v0 (px/s, + = κάτω) πάνω σε δάπεδο floor
// o = { g (px/s², default 5200), e (ελαστικότητα, default 0,35) } → { y, v, landed (ακουμπάει μόνιμα), hit (s από την τελευταία πρόσκρουση ή −1), vi (ταχύτητα πρόσκρουσης) }
// squash στην πρόσκρουση: k = 1 − min(0,3, vi/8000) · wobble(hit…)
function fall(t, t0, y0, floor, o = {}) {
  const g = o.g ?? 5200, e = o.e ?? 0.35; let u = t - t0, y = y0, v = o.v0 ?? 0, hits = 0, vi = 0;
  if (u <= 0) return { y: y0, v: 0, landed: false, hit: -1, vi: 0 };
  for (let n = 0; n < 12; n++) {
    const d = floor - y, th = (-v + Math.sqrt(v * v + 2 * g * Math.max(0, d))) / g;   // χρόνος ως το δάπεδο
    if (u < th) return { y: y + v * u + 0.5 * g * u * u, v: v + g * u, landed: false, hit: hits ? u : -1, vi };
    u -= th; vi = v + g * th; v = -vi * e; y = floor; hits++;
    if (Math.abs(v) < 180) return { y: floor, v: 0, landed: true, hit: u, vi };
  }
  return { y: floor, v: 0, landed: true, hit: u, vi };
}

// ---------- σωματίδια · ίχνη ----------
// σωματίδια με βαρύτητα / αντίσταση αέρα / αναπήδηση, χωρίς state: κάθε σωματίδιο = χρόνος γέννησης + δικό του seed → θέση με ολοκλήρωση ως το t
// o = { t0, t1 (εκπομπή), rate (/s), life (s), seed, at(te, r) → [x, y] σημείο εκπομπής, vel(r, te) → [vx, vy] px/s, g (px/s², + κάτω · − άνωση για καπνό),
//       drag (1/s), wind (px/s² στο x), floor (y), bounce (0..1), draw(ctx, p) } · p = { x, y, vx, vy, age, k (0..1 της ζωής), r (rng), i, b (αναπηδήσεις), te }
function particles(ctx, t, o) {
  const rate = o.rate ?? 30, life = o.life ?? 1, t0 = o.t0 ?? 0, t1 = o.t1 ?? Infinity, dt = o.dt ?? 1 / 120, g = o.g ?? 0, k = o.drag ?? 0, wd = o.wind ?? 0;
  const i0 = Math.max(0, Math.ceil((t - life - t0) * rate)), i1 = Math.floor((Math.min(t, t1) - t0) * rate);
  for (let i = i0; i <= i1; i++) {
    const te = t0 + i / rate, age = t - te; if (age < 0 || age > life) continue;
    const r = rng((o.seed ?? 1) * 7919 + i * 104729);
    let [x, y] = o.at(te, r), [vx, vy] = o.vel(r, te), a = 0, b = 0;
    while (a < age) {
      const h = Math.min(dt, age - a);
      vx += (wd - k * vx) * h; vy += (g - k * vy) * h; x += vx * h; y += vy * h; a += h;
      if (o.floor != null && y > o.floor && vy > 0) { y = o.floor; vy = -vy * (o.bounce ?? 0.3); vx *= 0.7; b++; }
    }
    o.draw(ctx, { x, y, vx, vy, age, k: age / life, r, i, b, te });
  }
}
// ίχνος θέσης (persistence: η δέσμη galvo «ζωγραφίζει» όλο το σχήμα) · pos(tt) → [x, y] · γραμμή από t − len ως t, πιο φωτεινή κοντά στο t
// o = { len (s), n (δείγματα), w (πάχος), col (rgb 'r,g,b'), a (αδιαφάνεια) }
function streak(ctx, t, pos, o = {}) {
  const len = o.len ?? 0.3, n = o.n ?? 60, col = o.col ?? '255,120,60', a0 = o.a ?? 0.9, w = o.w ?? 6;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let prev = pos(t - len);
  for (let i = 1; i <= n; i++) {
    const tt = t - len + len * i / n, p = pos(tt), k = i / n;
    ctx.strokeStyle = `rgba(${col},${a0 * k * k})`; ctx.lineWidth = w * (0.4 + 0.6 * k);
    ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); prev = p;
  }
  ctx.restore();
}
// motion smear: fn(ctx, tt, i) ζωγραφίζεται n φορές σε παλαιότερα tt = t − i·dt με φθίνουσα αδιαφάνεια (γρήγορο χέρι, αντικείμενο που πετάγεται)
function smear(ctx, t, fn, o = {}) {
  const n = o.n ?? 4, dt = o.dt ?? 1 / 60, a = o.a ?? 0.35;
  for (let i = n - 1; i >= 0; i--) { ctx.save(); if (i) ctx.globalAlpha *= a * (1 - i / n); fn(ctx, t - i * dt, i); ctx.restore(); }
}

module.exports = { stepResp, resp, springTo, springKeys, wobble, trapez, raster, pathMove, pathT, kf, rewindTau, lag, deriv, accel, shake, shakes, squash, fall, particles, streak, smear };
