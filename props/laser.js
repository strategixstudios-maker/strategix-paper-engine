// props/laser.js — laser CO2 («Πώς φτιάχνεται;»): μηχάνημα, δέσμη, καπνός, κηρήθρα, rotary, τομή στρώσεων
const L = require('../lib.js');
const { C, ST, W, H, cut, rectPts, rrPts, circlePts, txt, pop, rng, lerp } = L;
const { BRAND, HOOD, HOODD } = require('./core.js');

// laser glow + sparks at the burn point
function laserFX(ctx, x, y, lt, s = 1, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 90); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.2, 'rgba(255,190,90,0.9)'); g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
  const r = rng(ST.B * 31 + seed); ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = r() * 6.28, l = 18 + r() * 50, d = 10 + r() * 18; ctx.strokeStyle = i % 3 ? '#FFD27A' : '#fff'; ctx.lineWidth = 3 + r() * 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d); ctx.lineTo(Math.cos(a) * (d + l), Math.sin(a) * (d + l)); ctx.stroke(); }
  ctx.restore();
}
// καπνός που ανεβαίνει από το σημείο χάραξης (dir, n τολύπες)
function smoke(ctx, x, y, lt, s = 1, dir = [0, -1], n = 6, a0 = 0.45) {
  ctx.save();
  for (let i = 0; i < n; i++) { const k = (lt * 0.9 + i / n) % 1, px = x + dir[0] * k * 160 * s + Math.sin(i * 3 + lt * 2) * 30 * s, py = y + dir[1] * k * 220 * s;
    ctx.fillStyle = `rgba(236,239,246,${a0 * (1 - k)})`; ctx.beginPath(); ctx.arc(px, py, (14 + k * 55) * s, 0, 7); ctx.fill(); }
  ctx.restore();
}
// full-screen honeycomb bed (top-down shots) — pre-rendered once
const HONEY = (() => { const c = L.createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#9AA3B3'; x.fillRect(0, 0, W, H); x.strokeStyle = '#6F7A8E'; x.lineWidth = 4; const R = 26, dx = R * Math.sqrt(3), dy = R * 1.5;
  for (let row = 0, y = 0; y < H + R; row++, y += dy) for (let xx = (row % 2) * dx / 2; xx < W + dx; xx += dx) { x.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; x.lineTo(xx + Math.cos(a) * R, y + Math.sin(a) * R); } x.closePath(); x.stroke(); }
  return c; })();
// ζωγραφίζει την κηρήθρα HONEY σε όλη την οθόνη
function honeycomb(ctx) { ctx.drawImage(HONEY, 0, 0); }
// top-down laser head on its gantry rail, beam hitting (x,y)
function laserHeadTop(ctx, x, y, s = 1, on = true) {
  cut(ctx, rectPts(-60, y - 170 * s, W + 120, 46 * s), C.silver, { seed: 5100, amp: 2, edgeW: 6 });
  if (on) { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,120,60,0.75)'; ctx.lineWidth = 10 * s; ctx.beginPath(); ctx.moveTo(x, y - 120 * s); ctx.lineTo(x, y); ctx.stroke(); ctx.strokeStyle = '#FFF4D8'; ctx.lineWidth = 3 * s; ctx.stroke(); ctx.restore(); }
  cut(ctx, rrPts(x - 62 * s, y - 212 * s, 124 * s, 110 * s, 16 * s), C.navy, { seed: 5101, amp: 2, edgeW: 6 });
  cut(ctx, circlePts(x, y - 150 * s, 26 * s), '#2A3558', { seed: 5102, amp: 1, edgeW: 4, shadow: false });
  cut(ctx, rrPts(x + 30 * s, y - 250 * s, 18 * s, 60 * s, 9 * s), C.sky, { seed: 5103, amp: 1, edgeW: 4, shadow: false });
}
// desktop CO2 laser, flat 3/4 front view. cy = bed centre. o.lid 0..1 (open), o.on, o.head [x, beamY] in machine units,
// o.inside(ctx) draws on the bed (origin = bed centre, units = machine units; use sy≈0.5 for depth)
function laserMachine(ctx, cx, cy, w, o = {}) {
  const u = w / 1000, sd = o.seed || 5000, lid = o.lid || 0, lt = o.lt || 0;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(u, u);
  cut(ctx, rrPts(-500, 50, 1000, 350, 22), C.paper, { seed: sd, scribble: '#E6E0D0', amp: 3 });
  cut(ctx, rectPts(-500, 360, 1000, 40), '#D9D2C0', { seed: sd + 1, amp: 1.5, edge: false, shadow: false });
  ctx.strokeStyle = 'rgba(16,26,51,0.22)'; ctx.lineWidth = 4; ctx.strokeRect(-470, 92, 640, 246);
  cut(ctx, rrPts(-220, 200, 140, 26, 13), C.silver, { seed: sd + 2, amp: 1, edgeW: 4 });
  cut(ctx, rrPts(220, 92, 250, 246, 20), C.navy, { seed: sd + 3, amp: 2, edgeW: 6 });
  cut(ctx, rrPts(250, 118, 190, 80, 10), '#16306E', { seed: sd + 4, amp: 1, edge: false, shadow: false });
  txt(ctx, o.on ? 'RUN' : 'READY', 345, 160, { font: '34px Brand', color: o.on ? '#FFD27A' : C.sky });
  [BRAND, C.sky, C.mid].forEach((c, i) => cut(ctx, circlePts(275 + i * 70, 270, 22), c, { seed: sd + 5 + i, amp: 1, edgeW: 4, shadow: false }));
  cut(ctx, [[-430, -300], [430, -300], [500, 60], [-500, 60]], C.paper, { seed: sd + 10, amp: 3 });
  cut(ctx, [[-395, -272], [395, -272], [458, 36], [-458, 36]], '#18203A', { seed: sd + 11, amp: 2, edge: false, shadow: false });
  const bf = cut(ctx, [[-360, -240], [360, -240], [420, 12], [-420, 12]], '#8E97A6', { seed: sd + 12, amp: 1.5, edge: false, shadow: false });
  ctx.save(); L.path(ctx, bf); ctx.clip(); ctx.strokeStyle = 'rgba(40,50,70,0.35)'; ctx.lineWidth = 3;
  for (let y = -240; y < 20; y += 16) { ctx.beginPath(); for (let x = -440; x < 440; x += 18) { ctx.moveTo(x, y); ctx.lineTo(x + 9, y + 8); ctx.lineTo(x + 18, y); } ctx.stroke(); }
  ctx.restore();
  if (o.inside) { ctx.save(); ctx.translate(0, -114); o.inside(ctx); ctx.restore(); }
  const [hx, by] = o.head || [0, -230];
  cut(ctx, rectPts(-445, by - 74, 890, 28), C.silver, { seed: sd + 13, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(hx - 34, by - 96, 68, 70, 12), C.navy, { seed: sd + 14, amp: 1.5, edgeW: 5 });
  cut(ctx, rectPts(hx - 9, by - 28, 18, 22), C.silver, { seed: sd + 15, amp: 1, edge: false, shadow: false });
  if (o.on) { ctx.save(); ctx.strokeStyle = 'rgba(255,140,60,0.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx, by - 6); ctx.lineTo(hx, by); ctx.stroke(); ctx.restore(); laserFX(ctx, hx, by, lt, 0.8, sd); smoke(ctx, hx, by, lt, 0.5); }
  // lid (hinged at the back edge)
  const fy = lerp(60, -860, lid), fw = lerp(500, 410, lid), lp = L.tear([[-430, -300], [430, -300], [fw, fy], [-fw, fy]], sd + 30 + ST.B * 7919, 3, 22);
  L.path(ctx, lp); ctx.fillStyle = 'rgba(38,58,120,0.42)'; ctx.fill();
  ctx.save(); L.path(ctx, lp); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.beginPath(); ctx.moveTo(-300, -900); ctx.lineTo(-180, -900); ctx.lineTo(-20, 80); ctx.lineTo(-140, 80); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.lineJoin = 'round'; ctx.lineWidth = 22; ctx.strokeStyle = C.paper; L.path(ctx, lp); ctx.stroke();
  cut(ctx, rrPts(-120, fy - 16, 240, 28, 14), C.silver, { seed: sd + 31, amp: 1, edgeW: 4 });
  if (o.on && lid < 0.3) { const g = ctx.createRadialGradient(hx, by, 0, hx, by, 160); g.addColorStop(0, 'rgba(255,200,120,0.5)'); g.addColorStop(1, 'rgba(255,160,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, by, 160, 0, 7); ctx.fill(); }
  ctx.restore();
}
// rotary (roller type). o.top: κάτοψη (2 κύλινδροι δίπλα στο θερμός, gap = απόσταση από τον άξονα) · αλλιώς πρόσοψη (πάνω άκρη κυλίνδρου στο y).
// o.len μήκος κυλίνδρων · o.spin (px) κύλιση των ραβδώσεων
function rotary(ctx, x, y, s, o = {}) {
  const len = o.len || 520, sp = o.spin || 0, sd = o.seed || 7100;
  const roller = (ry, rh, k) => { const pf = cut(ctx, rrPts(-len / 2, ry, len, rh, rh / 2), '#3A4668', { seed: sd + k, amp: 1.5, edgeW: 5 });
    ctx.save(); L.path(ctx, pf); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 6;
    for (let xx = -len / 2 - 40 + ((sp % 30) + 30) % 30; xx < len / 2 + 40; xx += 30) { ctx.beginPath(); ctx.moveTo(xx, ry); ctx.lineTo(xx - 16, ry + rh); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(-len / 2, ry + rh * 0.18, len, rh * 0.16); ctx.restore(); };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.top) {
    const gp = o.gap || 118;
    for (const sg of [-1, 1]) cut(ctx, rrPts(-len / 2 - 70, -gp - 50, 60, 2 * gp + 100, 12), C.silver, { seed: sd + 5 + sg, amp: 1.5, edgeW: 5 });
    cut(ctx, rrPts(-len / 2 - 150, -gp - 10, 90, 2 * gp + 20, 16), C.navy, { seed: sd + 8, amp: 2, edgeW: 6 });
    roller(-gp - 22, 44, 1); roller(gp - 22, 44, 2);
  } else {
    cut(ctx, rectPts(-len / 2 - 60, 46, len + 120, 26), C.silver, { seed: sd + 3, amp: 1.5, edgeW: 5 });
    cut(ctx, rrPts(-len / 2 - 150, -30, 110, 100, 14), C.navy, { seed: sd + 4, amp: 2, edgeW: 6 });
    cut(ctx, circlePts(-len / 2 - 95, 20, 20), C.sky, { seed: sd + 9, amp: 1, edgeW: 3, shadow: false });
    roller(0, 46, 1);
    for (const sg of [-1, 1]) cut(ctx, circlePts(sg * (len / 2 + 14), 23, 30), C.silver, { seed: sd + 5 + sg, amp: 1.5, edgeW: 5 });
  }
  ctx.restore();
}
// cross-section inset: βαφή (πάνω) → ανοξείδωτο (κάτω). p 0..1 = πόσο άνοιξε το αυλάκι της δέσμης. Pops at st. (x,y) = κέντρο κάρτας
function layersInset(ctx, lt, st, x, y, s, p, o = {}) {
  pop(ctx, lt, st, x, y, () => {
    ctx.scale(s, s); const w = 560, h = 300, sd = o.seed || 7200;
    const pf = cut(ctx, rrPts(-w / 2, -h / 2, w, h, 28), C.paper, { seed: sd, amp: 3, edgeW: 9 });
    ctx.save(); L.path(ctx, pf); ctx.clip();
    ctx.fillStyle = C.pale; ctx.fillRect(-w / 2, -h / 2, w, h);
    const cy = 10, gw = 280 * p, r = rng(sd + ST.B);
    const steel = cut(ctx, rectPts(-w / 2 - 20, cy + 34, w + 40, h), C.silver, { seed: sd + 1, amp: 1.5, edge: false, shadow: false });
    ctx.save(); L.path(ctx, steel); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3;
    for (let yy = cy + 50; yy < h; yy += 14) { ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); ctx.stroke(); } ctx.restore();
    const coat = (x0, x1, k) => { if (x1 - x0 > 4) cut(ctx, rectPts(x0, cy, x1 - x0, 38), HOOD, { seed: sd + k, amp: 1.5, edgeW: 4, scribble: HOODD, shadow: false }); };
    coat(-w / 2 - 20, -gw / 2, 2); coat(gw / 2, w / 2 + 20, 3);
    if (p > 0 && p < 1) { const g = ctx.createRadialGradient(0, cy + 30, 0, 0, cy + 30, 80); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, cy + 30, 80, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,120,60,0.85)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, cy + 34); ctx.stroke(); ctx.strokeStyle = '#FFF4D8'; ctx.lineWidth = 4; ctx.stroke();
      for (let i = 0; i < 5; i++) { const k = (lt * 1.3 + i / 5) % 1; ctx.fillStyle = `rgba(236,239,246,${0.6 * (1 - k)})`; ctx.beginPath(); ctx.arc((r() - 0.5) * 60 + Math.sin(i * 2 + lt * 3) * 20, cy - k * 140, 10 + k * 26, 0, 7); ctx.fill(); } }
    ctx.restore();
    if (o.labels !== false) {
      txt(ctx, 'βαφή', -w / 2 + 40, cy - 34, { font: 'bold 38px Round', color: C.navy, align: 'left' });
      if (p >= 1 || o.steelLabel) txt(ctx, 'ανοξείδωτο', 0, cy + 104, { font: 'bold 42px Round', color: C.navy });
    }
  });
}

module.exports = { laserFX, smoke, HONEY, honeycomb, laserHeadTop, laserMachine, rotary, layersInset };
