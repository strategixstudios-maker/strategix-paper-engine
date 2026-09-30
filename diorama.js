// diorama.js — «χάρτινη μακέτα με αληθινή κάμερα» (ep02 →, STYLE_GUIDE §1d): κάθε κομμάτι = χαρτί σε 3D (υφή από τα ίδια cut()/props, προοπτική,
// καμπύλωμα, πίσω όψη) · κάμερα με φακό (fov, εστίαση, βάθος πεδίου) · ένα φως (παράθυρο): φωτισμός ανά γωνία + σκιές που απομακρύνονται και θολώνουν
// με το ύψος · δέσμη φωτός με σκόνη · grade (ζεστό φως, bloom) · motion blur. Stateless (όλα από το t) → preview t = render.
// Κόσμος σε cm: x δεξιά, y πάνω, z μακριά από την κάμερα. Γραφείο: επιφάνεια y = 0.
const L = require('./lib.js');
const { W, H, ST, FPS, createCanvas, clamp, rng, mixHex } = L;

// ---------- διανύσματα ----------
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};
// περιστροφή [rx, ry, rz] (rad): πρώτα rz (στο επίπεδο του χαρτιού), μετά rx (γέρνει μπρος/πίσω), μετά ry (γυρίζει δεξιά/αριστερά)
// rx = π/2 → το χαρτί ξαπλώνει στο γραφείο με την όψη προς τα πάνω (η πάνω άκρη του προς τα μέσα)
function rot3(p, r) {
  if (!r) return p;
  let [x, y, z] = p; const [rx = 0, ry = 0, rz = 0] = r;
  if (rz) { const c = Math.cos(rz), s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c]; }
  if (rx) { const c = Math.cos(rx), s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c]; }
  if (ry) { const c = Math.cos(ry), s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; }
  return [x, y, z];
}

// ---------- κάμερα ----------
// o = { pos, look, fov (κάθετο, μοίρες · default 40), roll (rad), focusAt (σημείο που είναι στο focus: ο πρωταγωνιστής) | focus (cm · default ως το look), ap (θόλωμα px όταν |z − focus| = z) }
// → { proj(p) → [x, y, z] οθόνης, toCam(p), coc(z) = ακτίνα θολώματος σε px, ray(sx, sy) }
function camera(o) {
  const f = V.norm(V.sub(o.look, o.pos));
  let r = V.norm(V.cross([0, 1, 0], f)), u = V.cross(f, r);
  if (o.roll) { const c = Math.cos(o.roll), s = Math.sin(o.roll); [r, u] = [V.add(V.mul(r, c), V.mul(u, s)), V.sub(V.mul(u, c), V.mul(r, s))]; }
  const F = (H / 2) / Math.tan((o.fov || 40) * Math.PI / 360);
  const focus = o.focusAt ? V.dot(V.sub(o.focusAt, o.pos), f) : o.focus ?? Math.hypot(...V.sub(o.look, o.pos)), ap = o.ap ?? 0;
  const toCam = p => { const d = V.sub(p, o.pos); return [V.dot(d, r), V.dot(d, u), V.dot(d, f)]; };
  const proj = p => { const [x, y, z] = toCam(p), zz = Math.max(z, 0.01); return [W / 2 + F * x / zz, H / 2 - F * y / zz, z]; };
  const coc = z => ap * Math.abs(z - focus) / Math.max(z, 1);
  const ray = (sx, sy) => V.norm(V.add(V.add(V.mul(r, (sx - W / 2) / F), V.mul(u, -(sy - H / 2) / F)), f));
  return { ...o, f, r, u, F, focus, ap, toCam, proj, coc, ray };
}

// ---------- υφές (offscreen χαρτιά) ----------
// tex(key, w, h, draw, v) → υφή w×h px: draw(ctx, w, h) με τα συνηθισμένα cut()/props · ξαναζωγραφίζεται όταν αλλάζει το v
// (default ST.B = boil 12fps: οι άκρες «τρέμουν» όπως στο cut() · 0 = ακίνητο σκηνικό · t = κινούμενος χαρακτήρας)
const TEX = new Map(), BACK = '#ECE6D6';
function tex(key, w, h, draw, v = ST.B) {
  w = Math.ceil(w); h = Math.ceil(h);
  const e0 = TEX.get(key); if (e0 && e0.v === v && e0.w === w && e0.h === h) return e0;
  const c = e0 && e0.w === w && e0.h === h ? e0.c : createCanvas(w, h), x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.save(); draw(x, w, h); x.restore();
  const e = { key, c, w, h, v }; TEX.set(key, e);
  if (e0 && e0.c === c) e.pool = { back: e0.back || e0.pool?.back, sil: e0.sil || e0.pool?.sil, shc: e0.shc || e0.pool?.shc }; // νέα έκδοση ίδιου μεγέθους: ξαναχρησιμοποιεί τους canvases (λιγότερη μνήμη, pf06)
  return e;
}
function derived(e, kind) { // 'back' = πίσω όψη (ίδιο σχήμα, άβαφο χαρτί) · 'sil' = σιλουέτα για σκιές
  if (e[kind]) return e[kind];
  const c = e.pool?.[kind] || createCanvas(e.w, e.h), x = c.getContext('2d'); x.globalCompositeOperation = 'copy'; x.drawImage(e.c, 0, 0); x.globalCompositeOperation = 'source-in';
  x.fillStyle = kind === 'sil' ? '#070C24' : BACK; x.fillRect(0, 0, e.w, e.h);
  if (kind === 'back') { x.globalCompositeOperation = 'source-atop'; L.scribble(x, [0, 0, e.w, e.h], '#DCD4C0', 3); }
  x.globalCompositeOperation = 'source-over'; return (e[kind] = c);
}
function shaded(e, k, back) { // φωτισμός ανά γωνία: k < 1 σκιά (ψυχρό navy) · k > 1 φως (ζεστό)
  const base = back ? derived(e, 'back') : e.c; if (Math.abs(k - 1) < 0.015) return base;
  const q = Math.round(k * 50) / 50, key = (back ? 'b' : 'f') + q;
  if (e.shk === key) return e.shc;
  const c = e.shc || e.pool?.shc || createCanvas(e.w, e.h), x = c.getContext('2d');
  x.globalCompositeOperation = 'copy'; x.drawImage(base, 0, 0); x.globalCompositeOperation = 'source-atop';
  x.fillStyle = q < 1 ? `rgba(14,20,56,${(1 - q) * 0.95})` : `rgba(255,228,184,${(q - 1) * 1.5})`; x.fillRect(0, 0, e.w, e.h);
  x.globalCompositeOperation = 'source-over'; e.shk = key; e.shc = c; return c;
}
const shadeCol = (col, k) => k < 1 ? mixHex(col, '#0E1438', (1 - k) * 0.95) : k > 1 ? mixHex(col, '#FFE4B8', (k - 1) * 1.5) : col;

// ---------- scratch canvases (με περιθώριο PAD: το θόλωμα στις άκρες του κάδρου «βλέπει» περιεχόμενο) ----------
const PAD = 64, PW = W + 2 * PAD, PH = H + 2 * PAD, POOL = {};
function scratch(name, w = PW, h = PH) {
  let s = POOL[name]; if (!s || s.c.width !== w || s.c.height !== h) { const c = createCanvas(w, h); s = POOL[name] = { c, x: c.getContext('2d') }; }
  const x = s.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h);
  return s;
}
// src (padded) → dst (padded ή κάδρο, dOff) με θόλωμα r px · box = [x0, y0, x1, y1] σε px οθόνης (περιορίζει το κόστος)
function blurDraw(dst, dOff, src, box, r, alpha = 1, op) {
  let [x0, y0, x1, y1] = box; const m = Math.ceil(r * 2.5) + 2;
  x0 = Math.max(-PAD, Math.floor(x0 - m)); y0 = Math.max(-PAD, Math.floor(y0 - m)); x1 = Math.min(W + PAD, Math.ceil(x1 + m)); y1 = Math.min(H + PAD, Math.ceil(y1 + m));
  const w = x1 - x0, h = y1 - y0; if (w <= 0 || h <= 0) return;
  dst.save(); dst.globalAlpha = alpha; if (op) dst.globalCompositeOperation = op;
  if (r < 0.6) dst.drawImage(src, x0 + PAD, y0 + PAD, w, h, x0 + dOff, y0 + dOff, w, h);
  else if (r < 7) { dst.filter = `blur(${r.toFixed(2)}px)`; dst.drawImage(src, x0 + PAD, y0 + PAD, w, h, x0 + dOff, y0 + dOff, w, h); }
  else { // μεγάλο θόλωμα σε μικρή ανάλυση (δεν φαίνεται η διαφορά, 4–16× φθηνότερο)
    const k = r < 18 ? 0.5 : 0.25, sw = Math.ceil(w * k), sh = Math.ceil(h * k), A = scratch('bA', Math.ceil(PW / 2), Math.ceil(PH / 2)), B = scratch('bB', Math.ceil(PW / 2), Math.ceil(PH / 2));
    A.x.drawImage(src, x0 + PAD, y0 + PAD, w, h, 0, 0, sw, sh); B.x.filter = `blur(${(r * k).toFixed(2)}px)`; B.x.drawImage(A.c, 0, 0);
    dst.drawImage(B.c, 0, 0, sw, sh, x0 + dOff, y0 + dOff, w, h);
  }
  dst.restore();
}

// ---------- κομμάτια χαρτιού ----------
// item = { t: tex() | fill: χρώμα (σκέτο χαρτί: κομφετί) , w, h (cm), pos (σημείο anchor στον κόσμο), anchor [ax, ay] (0..1 της υφής, default [0.5, 1] = κάτω-κέντρο),
//          rot [rx, ry, rz], bend(u, v) → cm προς την μπροστινή όψη (τσάκισμα / καμπύλωμα), surface (ξαπλωμένο στο γραφείο / κολλημένο στον τοίχο: μπαίνει στο σκηνικό,
//          δέχεται σκιές) + lift (cm, πόσο «πατάει»: σκιά επαφής, default 0.15), shadow (default true), lit (default true), alpha, clip(ctx, off) (path σε px οθόνης + off),
//          n/m (πλέγμα προοπτικής · default αυτόματα), backFill (χρώμα πίσω όψης για fill), zBias (cm: σειρά ζωγραφικής σαν να ήταν πιο κοντά),
//          dofAt [u, v] (σημείο της υφής που ορίζει το θόλωμα, αντί για το κέντρο: άκρη δαχτύλου, μύτη μαχαιριού) }
function world(it, u, v) {
  const [ax, ay] = it.anchor || [0.5, 1];
  const p = [(u - ax) * it.w, (ay - v) * it.h, it.bend ? -it.bend(u, v) : 0];
  return V.add(rot3(p, it.rot), it.pos);
}
const NEAR = 4;
function prep(cam, it, Lt) {
  it._skip = true; if ((it.alpha ?? 1) <= 0.003) return it;
  const nrm = V.norm(rot3([0, 0, -1], it.rot)), ctr = world(it, 0.5, 0.5);
  it._back = V.dot(nrm, V.sub(cam.pos, ctr)) < 0;
  const nf = it._back ? V.mul(nrm, -1) : nrm;
  it._k = it.lit === false ? 1 : clamp(1 + 0.45 * (V.dot(nf, Lt.to) - Lt.ref), 0.6, 1.14); // «έκθεση» για ό,τι κοιτάει την κάμερα: εκεί k = 1 (τα χρώματα του brand ως έχουν)
  if (it.fill) it._k = 0.86 + (it._k - 0.55) * 0.55; // κομφετί: στενότερο εύρος (όχι μαύρα κομμάτια), λάμπουν όταν γυρίζουν προς το φως
  it._zc = cam.toCam(it.dofAt ? world(it, ...it.dofAt) : ctr)[2]; it._z = cam.toCam(ctr)[2] - (it.zBias || 0); // zBias (cm): σειρά ζωγραφικής σαν να ήταν πιο κοντά (μικρό κομμάτι μπροστά από μεγάλο, π.χ. καρότσι μπροστά από τη ράγα · pf06) · το θόλωμα μένει από το _zc
  let n = it.n, m = it.m;
  if (it.fill) n = m = 1;
  else if (!n) {
    if (it.bend) n = m = 8;
    else {
      const c = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => cam.proj(world(it, u, v))); if (c.some(p => p[2] < NEAR)) return it;
      const err = Math.hypot(c[3][0] - (c[1][0] + c[2][0] - c[0][0]), c[3][1] - (c[1][1] + c[2][1] - c[0][1]));
      n = m = err < 0.8 ? 1 : clamp(Math.ceil(Math.sqrt(err) * 0.9) + 1, 2, 12);
    }
  }
  m = m || n;
  const G = [], Wg = []; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let j = 0; j <= m; j++) {
    const gr = [], wr = [];
    for (let i = 0; i <= n; i++) {
      const p = world(it, i / n, j / m), q = cam.proj(p); if (q[2] < NEAR) return it;
      wr.push(p); gr.push(q); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]);
    }
    G.push(gr); Wg.push(wr);
  }
  if (x1 < -PAD || y1 < -PAD || x0 > W + PAD || y0 > H + PAD) return it;
  Object.assign(it, { _G: G, _Wg: Wg, _n: n, _m: m, _box: [x0, y0, x1, y1], _skip: false });
  return it;
}
// τρίγωνο υφής: s0..s2 (px υφής) → d0..d2 (px οθόνης) · clip λίγο μεγαλύτερο (χωρίς ραφές) · ζωγραφίζει μόνο το κομμάτι της υφής που χρειάζεται
function tri(c, img, s0, s1, s2, d0, d1, d2, off) {
  const sx1 = s1[0] - s0[0], sy1 = s1[1] - s0[1], sx2 = s2[0] - s0[0], sy2 = s2[1] - s0[1], det = sx1 * sy2 - sx2 * sy1; if (Math.abs(det) < 1e-9) return;
  const du1 = d1[0] - d0[0], dv1 = d1[1] - d0[1], du2 = d2[0] - d0[0], dv2 = d2[1] - d0[1];
  const a = (du1 * sy2 - du2 * sy1) / det, cc = (du2 * sx1 - du1 * sx2) / det, b = (dv1 * sy2 - dv2 * sy1) / det, d = (dv2 * sx1 - dv1 * sx2) / det;
  const e = d0[0] - a * s0[0] - cc * s0[1] + off, f = d0[1] - b * s0[0] - d * s0[1] + off;
  const gx = (d0[0] + d1[0] + d2[0]) / 3, gy = (d0[1] + d1[1] + d2[1]) / 3, g = p => { const dx = p[0] - gx, dy = p[1] - gy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * 0.7 + off, p[1] + dy / l * 0.7 + off]; };
  const q0 = g(d0), q1 = g(d1), q2 = g(d2);
  const sxa = Math.max(0, Math.floor(Math.min(s0[0], s1[0], s2[0]) - 2)), sya = Math.max(0, Math.floor(Math.min(s0[1], s1[1], s2[1]) - 2));
  const sxb = Math.min(img.width, Math.ceil(Math.max(s0[0], s1[0], s2[0]) + 2)), syb = Math.min(img.height, Math.ceil(Math.max(s0[1], s1[1], s2[1]) + 2));
  if (sxb <= sxa || syb <= sya) return;
  c.save(); c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.lineTo(q2[0], q2[1]); c.closePath(); c.clip();
  c.transform(a, b, cc, d, e, f); c.drawImage(img, sxa, sya, sxb - sxa, syb - sya, sxa, sya, sxb - sxa, syb - sya); c.restore();
}
function warp(c, img, G, n, m, off) { // υφή πάνω στο προβεβλημένο πλέγμα G ((m+1)×(n+1) σημεία)
  const tw = img.width, th = img.height;
  if (n === 1 && m === 1) { // σχεδόν affine → μία εικόνα, χωρίς clip
    const [p0, p1] = G[0], [p2] = G[1];
    c.save(); c.transform((p1[0] - p0[0]) / tw, (p1[1] - p0[1]) / tw, (p2[0] - p0[0]) / th, (p2[1] - p0[1]) / th, p0[0] + off, p0[1] + off); c.drawImage(img, 0, 0); c.restore(); return;
  }
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const u0 = i / n * tw, u1 = (i + 1) / n * tw, v0 = j / m * th, v1 = (j + 1) / m * th;
    tri(c, img, [u0, v0], [u1, v0], [u1, v1], G[j][i], G[j][i + 1], G[j + 1][i + 1], off);
    tri(c, img, [u0, v0], [u1, v1], [u0, v1], G[j][i], G[j + 1][i + 1], G[j + 1][i], off);
  }
}
function outline(c, G, n, m, off) {
  c.beginPath(); const P = [];
  for (let i = 0; i <= n; i++) P.push(G[0][i]); for (let j = 1; j <= m; j++) P.push(G[j][n]); for (let i = n - 1; i >= 0; i--) P.push(G[m][i]); for (let j = m - 1; j > 0; j--) P.push(G[j][0]);
  P.forEach((p, k) => k ? c.lineTo(p[0] + off, p[1] + off) : c.moveTo(p[0] + off, p[1] + off)); c.closePath();
}
function drawItem(c, off, it) {
  c.save(); c.globalAlpha = it.alpha ?? 1;
  if (it.clip) { c.beginPath(); it.clip(c, off); c.clip(); }
  if (it.fill) { outline(c, it._G, 1, 1, off); c.fillStyle = shadeCol(it._back ? (it.backFill || BACK) : it.fill, it._k); c.fill(); }
  else warp(c, shaded(it.t, it._k, it._back), it._G, it._n, it._m, off);
  c.restore();
}

// ---------- σκιές ----------
// σημείο → πού πέφτει η σκιά του (πρώτη επιφάνεια κατά μήκος του φωτός): γραφείο (με όρια) · τοίχος · πάτωμα → [σημείο, απόσταση cm]
function hit(p, Ld, R) {
  let best = null;
  const cand = (t, ok) => { if (t >= -0.3 && (!best || t < best[1])) { const q = V.add(p, V.mul(Ld, t)); if (ok(q)) best = [q, Math.max(0, t)]; } };
  if (R.desk && Ld[1] < 0) cand((p[1] - R.desk.y) / -Ld[1], q => q[0] >= R.desk.x0 && q[0] <= R.desk.x1 && q[2] >= R.desk.z0 && q[2] <= R.desk.z1);
  if (R.wall && Ld[2] > 0) cand((R.wall.z - p[2]) / Ld[2], q => !R.floor || q[1] >= R.floor.y);
  if (R.floor && Ld[1] < 0) cand((p[1] - R.floor.y) / -Ld[1], q => !R.wall || q[2] <= R.wall.z);
  return best;
}
// σκιά ενός κομματιού πάνω στο σκηνικό (padded layer S) · σε ζώνες ύψους: κοντά στο σημείο επαφής κοφτή, ψηλά θολή και πιο ανοιχτή
function castShadow(S, cam, it, Lt, R) {
  if (it.shadow === false || !it.t) return;
  const sil = derived(it.t, 'sil'), n = Math.min(it._n, 6) || 1, m = Math.max(2, Math.min(it._m, 6));
  const P = [], T = [];
  for (let j = 0; j <= m; j++) { const pr = [], tr = []; for (let i = 0; i <= n; i++) { const hh = hit(world(it, i / n, j / m), Lt.dir, R); if (!hh) return; const q = cam.proj(hh[0]); if (q[2] < NEAR) return; pr.push(q); tr.push([hh[1], q[2]]); } P.push(pr); T.push(tr); }
  const bands = 3, per = Math.ceil(m / bands);
  for (let b = 0; b * per < m; b++) {
    const ja = b * per, jb = Math.min(m, ja + per); let tS = 0, zS = 0, cnt = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let j = ja; j <= jb; j++) for (let i = 0; i <= n; i++) { tS += T[j][i][0]; zS += T[j][i][1]; cnt++; const q = P[j][i]; x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    const tA = tS / cnt, zA = zS / cnt, r = Math.max(1.2, 0.5 * (0.35 + tA * Lt.soft) * cam.F / zA), a = Lt.shadow * (0.45 + 0.55 * Math.exp(-tA / 70)) * (it.alpha ?? 1);
    const K = scratch('sh'), tw = sil.width, th = sil.height, sub = P.slice(ja, jb + 1);
    K.x.save();
    for (let j = 0; j < jb - ja; j++) for (let i = 0; i < n; i++) {
      const u0 = i / n * tw, u1 = (i + 1) / n * tw, v0 = (ja + j) / m * th, v1 = (ja + j + 1) / m * th;
      tri(K.x, sil, [u0, v0], [u1, v0], [u1, v1], sub[j][i], sub[j][i + 1], sub[j + 1][i + 1], PAD);
      tri(K.x, sil, [u0, v0], [u1, v1], [u0, v1], sub[j][i], sub[j + 1][i + 1], sub[j + 1][i], PAD);
    }
    K.x.restore();
    blurDraw(S, PAD, K.c, [x0, y0, x1, y1], r, a);
  }
}
// σκιά επαφής για επιφάνειες (χαρτί στο γραφείο, ράφι στον τοίχο): μετατόπιση κατά το φως επί lift, λίγο θόλωμα
function contact(S, cam, it, Lt) {
  if (it.shadow === false || !it.t) return;
  const lift = it.lift ?? 0.15, sh = V.mul(Lt.dir, lift / Math.max(0.2, -V.dot(Lt.dir, V.norm(rot3([0, 0, -1], it.rot)))));
  const G = it._Wg.map(r => r.map(p => cam.proj(V.add(p, sh)))), K = scratch('sh'); warp(K.x, derived(it.t, 'sil'), G, it._n, it._m, PAD);
  const r = Math.max(1, 0.5 * (0.25 + lift * Lt.soft * 3) * cam.F / it._z);
  blurDraw(S, PAD, K.c, it._box, r + 1, Lt.shadow * 0.9);
}

// ---------- βάθος πεδίου για το σκηνικό (επιφάνειες που απλώνονται σε βάθος) ----------
// βάθος ανά σειρά οθόνης = πρώτη επιφάνεια που χτυπάει η ακτίνα στο κέντρο της σειράς → θόλωμα ανά λωρίδα (μείξη από 2 έτοιμα επίπεδα θολώματος)
const LEVELS = [0, 2, 4, 7, 11, 16, 24, 34];
function rowDepth(cam, R, sy) {
  const d = cam.ray(W / 2, sy), o = cam.pos; let best = 1e9;
  const plane = (axis, v, ok) => { if (Math.abs(d[axis]) < 1e-6) return; const t = (v - o[axis]) / d[axis]; if (t > 0 && t < best) { const q = V.add(o, V.mul(d, t)); if (ok(q)) best = t; } };
  if (R.desk) { plane(1, R.desk.y, q => q[0] >= R.desk.x0 && q[0] <= R.desk.x1 && q[2] >= R.desk.z0 && q[2] <= R.desk.z1); plane(2, R.desk.z0, q => q[1] <= R.desk.y && q[1] >= (R.floor ? R.floor.y : -1e9)); }
  if (R.floor) plane(1, R.floor.y, () => true);
  if (R.wall) plane(2, R.wall.z, () => true);
  return best === 1e9 ? cam.focus : best * V.dot(d, cam.f);
}
function setDOF(ctx, cam, R, S) {
  const band = 16, rows = [];
  let lo = 1e9, hi = 0; for (let y = 0; y < H; y += band) { const r = cam.coc(rowDepth(cam, R, y + band / 2)); rows.push(r); lo = Math.min(lo, r); hi = Math.max(hi, r); }
  if (hi < 0.8) { ctx.drawImage(S.c, PAD, PAD, W, H, 0, 0, W, H); return; }
  const need = LEVELS.filter((l, i) => l <= hi && (LEVELS[i + 1] === undefined || LEVELS[i + 1] > lo)), lv = {};
  for (const l of need) { if (l < 0.6) { lv[l] = S.c; continue; } const B = scratch('dof' + l); blurDraw(B.x, PAD, S.c, [0, 0, W, H], l); lv[l] = B.c; }
  rows.forEach((r, k) => {
    const y = k * band; let i = 0; while (i < need.length - 1 && need[i + 1] <= r) i++;
    const a = need[i], b = need[i + 1] ?? a, fr = b > a ? clamp((r - a) / (b - a)) : 0;
    ctx.drawImage(lv[a], PAD, y + PAD, W, band, 0, y, W, band);
    if (fr > 0.01) { ctx.save(); ctx.globalAlpha = fr; ctx.drawImage(lv[b], PAD, y + PAD, W, band, 0, y, W, band); ctx.restore(); }
  });
}

// ---------- φως παραθύρου: κηλίδα στις επιφάνειες + δέσμη στον αέρα + σκόνη ----------
// win = { c: κέντρο παραθύρου (cm), a, b: μισές πλευρές (διανύσματα), panes: [nx, ny] (κουφώματα) }
function windowPatch(S, cam, Lt, R, win, amt) { // το φως φωτίζει το ίδιο χρώμα (base × (1 + amt)), όχι βάψιμο: το navy μένει navy, πιο φωτεινό
  const [nx, ny] = win.panes || [2, 2], gap = 0.06, M = scratch('lpM');
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const Q = []; for (const [su, sv] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      const u = -1 + 2 * (i + gap + su * (1 - 2 * gap)) / nx, v = -1 + 2 * (j + gap + sv * (1 - 2 * gap)) / ny;
      const hh = hit(V.add(win.c, V.add(V.mul(win.a, u), V.mul(win.b, v))), Lt.dir, R); if (!hh) break; Q.push(cam.proj(hh[0]));
    }
    if (Q.length < 4) continue;
    M.x.beginPath(); Q.forEach((q, k) => k ? M.x.lineTo(q[0] + PAD, q[1] + PAD) : M.x.moveTo(q[0] + PAD, q[1] + PAD)); M.x.closePath(); M.x.fillStyle = '#fff'; M.x.fill();
  }
  const Mb = scratch('lpMb'); blurDraw(Mb.x, PAD, M.c, [0, 0, W, H], 4);
  const K = scratch('lpK'); K.x.drawImage(S.c, 0, 0); K.x.globalCompositeOperation = 'destination-in'; K.x.drawImage(Mb.c, 0, 0);
  S.x.save(); S.x.globalCompositeOperation = 'lighter'; S.x.globalAlpha = amt * 0.85; S.x.drawImage(K.c, 0, 0); S.x.restore();
  K.x.globalCompositeOperation = 'source-in'; K.x.fillStyle = Lt.warm; K.x.fillRect(0, 0, PW, PH);
  S.x.save(); S.x.globalCompositeOperation = 'soft-light'; S.x.globalAlpha = amt * 0.35; S.x.drawImage(K.c, 0, 0); S.x.restore();
}
function shaft(ctx, cam, Lt, R, win, t, amt, dust = 70) {
  const K = scratch('shaft'), pts = [];
  for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const p = V.add(win.c, V.add(V.mul(win.a, u), V.mul(win.b, v))), hh = hit(p, Lt.dir, R); pts.push(cam.proj(p)); if (hh) pts.push(cam.proj(hh[0])); }
  // κυρτό περίβλημα (δέσμη = από το παράθυρο ως την κηλίδα)
  const hull = convex(pts.filter(p => p[2] > NEAR).map(p => [p[0], p[1]]));
  if (hull.length > 2) {
    const [a, b] = [cam.proj(win.c), cam.proj(V.add(win.c, V.mul(Lt.dir, 160)))];
    const g = K.x.createLinearGradient(a[0] + PAD, a[1] + PAD, b[0] + PAD, b[1] + PAD); g.addColorStop(0, `rgba(255,226,170,${0.8 * amt})`); g.addColorStop(1, 'rgba(255,226,170,0)');
    K.x.beginPath(); hull.forEach((q, k) => k ? K.x.lineTo(q[0] + PAD, q[1] + PAD) : K.x.moveTo(q[0] + PAD, q[1] + PAD)); K.x.closePath(); K.x.fillStyle = g; K.x.fill();
    blurDraw(ctx, 0, K.c, [0, 0, W, H], 28, 0.8, 'screen');
  }
  // σκόνη: σωματίδια μέσα στη δέσμη, αργή αιώρηση · θολά όσα είναι εκτός εστίασης (bokeh)
  const r0 = rng(4242); ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let k = 0; k < dust; k++) {
    const u = r0() * 2 - 1, v = r0() * 2 - 1, s = 0.15 + r0() * 0.8, ph = r0() * 6.28, sp = 0.4 + r0();
    const p0 = V.add(win.c, V.add(V.mul(win.a, u), V.mul(win.b, v))), hh = hit(p0, Lt.dir, R); const len = hh ? hh[1] : 150;
    const p = V.add(V.add(p0, V.mul(Lt.dir, len * s)), [Math.sin(t * 0.5 * sp + ph) * 3, Math.sin(t * 0.37 * sp + ph * 2) * 2.5 - ((t * 1.2 * sp) % 6), Math.cos(t * 0.43 * sp + ph) * 3]);
    const q = cam.proj(p); if (q[2] < NEAR || q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) continue;
    const cr = cam.coc(q[2]), rad = 1.1 * cam.F / q[2] * 0.12 + cr * 0.6, tw = 0.55 + 0.45 * Math.sin(t * 2.3 * sp + ph);
    const al = amt * tw * clamp(0.9 / (1 + cr * 0.25)) * 0.8;
    const gr = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], Math.max(1.2, rad));
    gr.addColorStop(0, `rgba(255,240,210,${al})`); gr.addColorStop(cr > 3 ? 0.8 : 0.4, `rgba(255,232,190,${al * 0.6})`); gr.addColorStop(1, 'rgba(255,232,190,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(1.2, rad), 0, 7); ctx.fill();
  }
  ctx.restore();
}
function convex(P) { // monotone chain
  if (P.length < 3) return P; P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

// ---------- grade: ζεστό φως από την πλευρά του παραθύρου, ψυχρές σκιές, απαλό bloom ----------
function grade(ctx, o = {}) {
  const [lx, ly] = o.from || [0, H * 0.25];
  if (o.contrast !== 0) { const Q = scratch('grade', W, H); Q.x.drawImage(ctx.canvas, 0, 0); ctx.save(); ctx.filter = `contrast(${o.contrast ?? 1.15}) saturate(${o.sat ?? 1.12})`; ctx.drawImage(Q.c, 0, 0); ctx.restore(); }
  const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, H * 1.1); g.addColorStop(0, `rgba(255,196,130,${o.warm ?? 0.32})`); g.addColorStop(0.55, 'rgba(255,214,170,0.08)'); g.addColorStop(1, `rgba(40,70,170,${o.cool ?? 0.22})`);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (o.bloom !== 0) {
    const Q = scratch('bloom', W / 4, H / 4), B = scratch('bloom2', W / 4, H / 4);
    Q.x.filter = 'brightness(0.85) contrast(2.2)'; Q.x.drawImage(ctx.canvas, 0, 0, W, H, 0, 0, W / 4, H / 4);
    B.x.filter = 'blur(9px)'; B.x.drawImage(Q.c, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.bloom ?? 0.22; ctx.drawImage(B.c, 0, 0, W / 4, H / 4, 0, 0, W, H); ctx.restore();
  }
}

// ---------- ένα frame της μακέτας ----------
// scene = { cam: camera(), items: [...], light: { dir (κατεύθυνση που ταξιδεύει το φως), soft (0.03–0.1), shadow (0..1), warm }, R: { desk, wall, floor },
//           window: { c, a, b, panes }, patch (0..1), shaft (0..1), dust (πλήθος), grade: { from, warm, cool, bloom } | false }
function draw(ctx, scene, t) {
  const cam = scene.cam, R = scene.R || {}, lt = scene.light || {};
  const dir = V.norm(lt.dir || [0.62, -0.72, 0.32]);
  const Lt = { dir, to: V.mul(dir, -1), soft: lt.soft ?? 0.06, shadow: lt.shadow ?? 0.34, warm: lt.warm || 'rgba(255,214,150,1)' };
  Lt.ref = V.dot(V.mul(cam.f, -1), Lt.to);
  const items = scene.items.filter(Boolean).map(it => prep(cam, it, Lt)).filter(it => !it._skip);
  const surf = items.filter(it => it.surface), obj = items.filter(it => !it.surface).sort((a, b) => b._z - a._z);
  // 1 σκηνικό: επιφάνειες (με τη σειρά που δόθηκαν) + σκιές επαφής → σκιές των αντικειμένων → κηλίδα φωτός → DOF ανά σειρά
  const S = scratch('set');
  S.x.fillStyle = scene.bg || '#1B2A55'; S.x.fillRect(0, 0, PW, PH);
  for (const it of surf) { if (it.lift !== 0 && !it.base) contact(S.x, cam, it, Lt); drawItem(S.x, PAD, it); }
  for (const it of obj) castShadow(S.x, cam, it, Lt, R);
  // σκιά περιβάλλοντος: ό,τι δεν βλέπει το παράθυρο πέφτει λίγο (ψυχρό) → η κηλίδα φωτός και τα αντικείμενα ξεχωρίζουν
  if (scene.ambient !== 0) { S.x.save(); S.x.globalCompositeOperation = 'multiply'; S.x.fillStyle = scene.ambient || '#CDD4EA'; S.x.fillRect(0, 0, PW, PH); S.x.restore(); }
  if (scene.window && scene.patch) windowPatch(S, cam, Lt, R, scene.window, scene.patch);
  setDOF(ctx, cam, R, S);
  // 2 αντικείμενα από πίσω προς τα μπρος, σε ομάδες ίδιου θολώματος
  const Lr = scratch('lay'); let cur = -1, box = null;
  const flush = () => { if (box) blurDraw(ctx, 0, Lr.c, box, cur); scratch('lay'); box = null; };
  for (const it of obj) {
    const r = cam.coc(it._zc ?? it._z), lvl = r < 1.5 ? 0 : LEVELS.reduce((b, l) => Math.abs(l - r) < Math.abs(b - r) ? l : b, 0);
    if (lvl !== cur) { flush(); cur = lvl; }
    if (lvl === 0) { drawItem(ctx, 0, it); continue; }
    drawItem(Lr.x, PAD, it); box = box ? [Math.min(box[0], it._box[0]), Math.min(box[1], it._box[1]), Math.max(box[2], it._box[2]), Math.max(box[3], it._box[3])] : it._box.slice();
  }
  flush();
  // 3 δέσμη + σκόνη, grade
  if (scene.window && scene.shaft) shaft(ctx, cam, Lt, R, scene.window, t, scene.shaft, scene.dust ?? 70);
  if (scene.grade !== false) grade(ctx, scene.grade || {});
}
// frame με motion blur: build(tt) → scene · n δείγματα μέσα στο κλείστρο (shutter 0.5 = 180°) · n = 1 → χωρίς · στο lint χωρίς (ίδιες θέσεις, 3–5× γρηγορότερο)
function frame(ctx, t, build, o = {}) {
  const n = ST.MODE === 'lint' ? 1 : o.mb || 1, sh = o.shutter ?? 0.5;
  if (n <= 1) { draw(ctx, build(t), t); return; }
  const A = scratch('acc', W, H), T = scratch('mbT', W, H);
  for (let i = 0; i < n; i++) {
    const tt = t + sh * (i / (n - 1) - 0.5) / FPS, c = i ? T : A; if (i) scratch('mbT', W, H);
    draw(c.x, build(tt), tt); if (i) { A.x.save(); A.x.globalAlpha = 1 / (i + 1); A.x.drawImage(T.c, 0, 0); A.x.restore(); }
  }
  ctx.drawImage(A.c, 0, 0);
}

module.exports = { V, rot3, camera, tex, world, draw, frame, grade, scratch, blurDraw, PAD };
