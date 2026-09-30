// props/diorama.js — κοινά κομμάτια για επεισόδια με τη χάρτινη μακέτα (diorama.js, STYLE_GUIDE §1d · ep02 → pf06): κάμερα, σκηνικό γραφείου, Στράτος ως χάρτινη κούκλα
const L = require('../lib.js');
const { C, W, ST, cut, rectPts, rrPts, clamp, lerp, lipsync, blinkNow } = L;
const D = require('../diorama.js'), { V } = D;
const { stratos } = require('../stratos.js');

// μείξη δύο στησιμάτων κάμερας { pos, look, fov, ap, roll, focusAt } · p 0..1
function mixCam(a, b, p) {
  return { pos: V.lerp(a.pos, b.pos, p), look: V.lerp(a.look, b.look, p), fov: lerp(a.fov || 40, b.fov || 40, p), ap: lerp(a.ap || 0, b.ap || 0, p), roll: lerp(a.roll || 0, b.roll || 0, p), focusAt: a.focusAt && b.focusAt ? V.lerp(a.focusAt, b.focusAt, p) : b.focusAt || a.focusAt };
}
// κάμερα στο χέρι (ελάχιστη) → μετατόπιση σε cm · k = ένταση (0 στο frame 0 και στο τέλος: seamless loop)
const handCam = (t, k = 1) => [(Math.sin(t * 1.3) * 0.35 + Math.sin(t * 2.9) * 0.15) * k, Math.sin(t * 1.7 + 1) * 0.3 * k, 0];

// ---------- σκηνικό γραφείου (ep02): τοίχος, πάτωμα, γραφείο, cutting mat · R = { desk: { y, x0, x1, z0, z1 }, wall: { z }, floor: { y } } ----------
const ROOM = { desk: { y: 0, x0: -85, x1: 85, z0: -35, z1: 55 }, wall: { z: 150 }, floor: { y: -88 } }; // γεωμετρία γραφείου του ep02 (cm)
const roomTex = { // υφές σκηνικού: wall · floor · deskTop · deskFront · mat · shelf (ράφι με ρολά βινυλίου) → D.tex, ίδιες σε όλα τα επεισόδια
  wall: () => D.tex('wall', 1260, 900, (x, w, h) => {
    x.fillStyle = C.pale; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#C9D8F3', 11);
    x.strokeStyle = 'rgba(30,58,138,0.09)'; x.lineWidth = 3; for (let i = 1; i < 7; i++) { x.beginPath(); x.moveTo(i * w / 7, 0); x.lineTo(i * w / 7, h - 36); x.stroke(); }
    x.fillStyle = C.blue; x.fillRect(0, h - 36, w, 36);
  }, 0),
  floor: () => D.tex('floor', 1260, 600, (x, w, h) => { x.fillStyle = '#14224A'; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#22346C', 12); }, 0),
  deskTop: () => D.tex('deskTop', 1360, 720, (x, w, h) => { cut(x, rectPts(6, 6, w - 12, h - 12), C.sky, { seed: 13, amp: 3, scribble: '#A9C3F3', shadow: false }); }, 0),
  deskFront: () => D.tex('deskFront', 680, 352, (x, w, h) => { cut(x, rectPts(4, 4, w - 8, h - 8), C.blue, { seed: 14, amp: 2, scribble: '#2A4A9E', shadow: false }); }, 0),
  mat: () => D.tex('mat', 600, 450, (x, w, h) => {
    const p = cut(x, rrPts(8, 8, w - 16, h - 16, 14), C.navy, { seed: 21, amp: 1.5, edgeW: 6, shadow: false });
    x.save(); L.path(x, p); x.clip();
    for (let i = 20; i < w; i += 10) { x.strokeStyle = i % 50 === 20 ? 'rgba(143,176,238,0.30)' : 'rgba(143,176,238,0.12)'; x.lineWidth = i % 50 === 20 ? 2 : 1; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = 20; j < h; j += 10) { x.strokeStyle = j % 50 === 20 ? 'rgba(143,176,238,0.30)' : 'rgba(143,176,238,0.12)'; x.lineWidth = j % 50 === 20 ? 2 : 1; x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.restore();
  }, 0),
  shelf: () => D.tex('shelf', 680, 170, (x, w, h) => {
    const rolls = [C.navy, '#2854F3', C.mid, C.paper, C.sky, C.gold, '#2854F3', C.pale, C.navy, C.mid];
    rolls.forEach((col, i) => { const rx = 30 + i * 62, rh = 100 + (i % 3) * 12; cut(x, rrPts(rx, h - 34 - rh, 50, rh, 10), col, { seed: 60 + i, amp: 1.5, edgeW: 6, shadow: false }); x.fillStyle = 'rgba(11,27,63,0.25)'; x.beginPath(); x.ellipse(rx + 25, h - 34 - rh + 10, 14, 6, 0, 0, 7); x.fill(); });
    cut(x, rectPts(4, h - 36, w - 8, 26), C.navy, { seed: 59, amp: 1.5, edgeW: 6, shadow: false });
  }, 0),
};
// items του σκηνικού: τοίχος + πάτωμα + γραφείο (πρόσοψη, επιφάνεια) · o.mat = [x, z, rz] (cutting mat) · o.shelf = [x, y] (ράφι με ρολά βινυλίου στον τοίχο) · o.desk: false = χωρίς γραφείο
function roomItems(R = ROOM, o = {}) {
  const PI = Math.PI, dw = R.desk.x1 - R.desk.x0, dd = R.desk.z1 - R.desk.z0, dh = R.desk.y - R.floor.y, cx = (R.desk.x0 + R.desk.x1) / 2;
  return [
    { t: roomTex.wall(), w: 420, h: 300, pos: [0, R.floor.y, R.wall.z], surface: true, lift: 0, shadow: false },
    { t: roomTex.floor(), w: 420, h: 200, pos: [0, R.floor.y, -50], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    o.shelf && { t: roomTex.shelf(), w: 170, h: 42, pos: [o.shelf[0], o.shelf[1], R.wall.z - 0.5], surface: true, lift: 5 },
    o.desk !== false && { t: roomTex.deskFront(), w: dw, h: dh, pos: [cx, R.floor.y, R.desk.z0], surface: true, lift: 0, shadow: false },
    o.desk !== false && { t: roomTex.deskTop(), w: dw, h: dd, pos: [cx, R.desk.y, R.desk.z0], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    o.mat && { t: roomTex.mat(), w: 60, h: 45, pos: [o.mat[0], R.desk.y + 0.05, o.mat[1]], rot: [PI / 2, 0, o.mat[2] || 0], surface: true, lift: 0.1 },
  ].filter(Boolean);
}
// ό,τι στέκεται πίσω από το γραφείο κρύβεται κάτω από την πίσω άκρη του → item.clip
const behindDesk = (cam, R = ROOM) => (c, off) => {
  const a = cam.proj([R.desk.x0, R.desk.y, R.desk.z1]), b = cam.proj([R.desk.x1, R.desk.y, R.desk.z1]), k = (b[1] - a[1]) / (b[0] - a[0]), y = xx => a[1] + (xx - a[0]) * k;
  c.moveTo(-2000 + off, -3000); c.lineTo(W + 2000 + off, -3000); c.lineTo(W + 2000 + off, y(W + 2000) + off); c.lineTo(-2000 + off, y(-2000) + off); c.closePath();
};

// ---------- Στράτος ως χάρτινη κούκλα (ep02): ζωντανή υφή, ανάλυση ανάλογα με την απόσταση της κάμερας, lint χεριών στην οθόνη ----------
// o = { pos (πόδια, cm), pose (opts του stratos(): συνήθως poseSpring(POSES, t)), mouth (default lipsync([], 'smile')), clip, draw(x, s, cw, sy) = πάνω στην υφή (props στο χέρι) }
function stratosItem(cam, t, o) {
  const pos = o.pos, pxcm = cam.F / Math.max(20, cam.toCam(V.add(pos, [0, 140, 0]))[2]), s = clamp(Math.round(pxcm * 175 / 1243 * 1.15 * 4) / 4, 0.75, 3.25);
  const cw = Math.ceil(640 * s), ch = Math.ceil(1320 * s), sy = 400 * s, PXC = 1243 * s / 175;
  const it = { w: cw / PXC, h: ch / PXC, anchor: [0.5, (sy + 878 * s) / ch], pos, clip: o.clip };
  const w0 = ST.warn ? ST.warn.length : 0;
  it.t = D.tex(o.key || 'stratos', cw, ch, x => {
    stratos(x, cw / 2, sy, s, { mouth: lipsync([], 'smile'), blink: blinkNow(), ...o.pose });
    if (o.draw) o.draw(x, s, cw, sy);
  }, t + ':' + s);
  // lint χεριών: οι θέσεις είναι σε px υφής → px οθόνης μέσω της κάρτας · το safe zone ελέγχεται μόνο στην οθόνη (όχι στην υφή)
  if (ST.warn) for (let k = ST.warn.length - 1; k >= w0; k--) { const w = ST.warn[k]; if (/safe zone/.test(w.msg)) { ST.warn.splice(k, 1); continue; } const q = cam.proj(D.world(it, w.x / cw, w.y / ch)); w.x = q[0]; w.y = q[1]; }
  return it;
}

module.exports = { mixCam, handCam, ROOM, roomTex, roomItems, behindDesk, stratosItem };
