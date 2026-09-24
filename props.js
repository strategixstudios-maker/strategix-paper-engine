// props.js — reusable scene props for Strategix paper cut-out videos
const L = require('./lib.js');
const { C, ST, W, H, cut, rectPts, rrPts, circlePts, starPts, txt, pop, rng, lipsync, blinkNow } = L;
const { S, stratos, hand } = require('./stratos.js');
const { lerp } = L;
const BRAND = '#2854F3', HOOD = '#1C2E66', HOODD = '#132253';

// ---------- backgrounds ----------
const bgFlat = (ctx, col, scrib, seed = 5) => cut(ctx, rectPts(-40, -40, W + 80, H + 80), col, { seed, edge: false, shadow: false, scribble: scrib });
function tiles(ctx) { // laundry / bathroom tiles + navy floor
  bgFlat(ctx, '#CFE0F7');
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6; const r = rng(ST.B + 9);
  for (let x = 0; x <= W; x += 135) { ctx.beginPath(); ctx.moveTo(x + (r() - .5) * 3, 0); ctx.lineTo(x + (r() - .5) * 3, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 135) { ctx.beginPath(); ctx.moveTo(0, y + (r() - .5) * 3); ctx.lineTo(W, y + (r() - .5) * 3); ctx.stroke(); }
  ctx.restore();
  cut(ctx, rectPts(-40, 1740, W + 80, 300), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
}
function wallShelf(ctx) { // workshop wall with vinyl rolls on a shelf
  bgFlat(ctx, C.blue, '#3456B0', 11);
  cut(ctx, rectPts(-40, 560, W + 80, 40), C.paper, { seed: 12, amp: 2, edgeW: 6 });
  const cols = [C.sky, BRAND, C.paper, '#F4D98A', C.mid];
  for (let i = 0; i < 7; i++) cut(ctx, circlePts(110 + i * 140, 500, 56, 56, 24), cols[i % 5], { seed: 13 + i, amp: 2, edgeW: 6 });
}
function starsBG(ctx, lt, col = C.blue, scrib = '#3456B0') {
  bgFlat(ctx, col, scrib, 81); const r = rng(99);
  for (let i = 0; i < 18; i++) { const x = r() * W, y = r() < 0.6 ? 30 + r() * 240 : 1640 + r() * 260, sz = (10 + r() * 14) * (0.75 + 0.25 * Math.sin(lt * 5 + i)); cut(ctx, starPts(x, y, sz), i % 4 ? '#fff' : '#F4D98A', { seed: 700 + i, amp: 1, edgeW: 3, shadow: false }); }
}

// ---------- products ----------
function cafeLogo(ctx, x, y, sc, state = 'good', seed = 1, col = '#fff') { // demo client logo "ANNA CAFÉ" — states: good | cracked | none | film
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.globalAlpha = state === 'none' ? 0.13 : state === 'cracked' ? 0.82 : 1; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-44, -92); ctx.lineTo(44, -92); ctx.lineTo(36, -30); ctx.quadraticCurveTo(0, -18, -36, -30); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(50, -66, 18, -1.3, 1.3); ctx.stroke();
  ctx.lineWidth = 7; for (const sx of [-18, 0, 18]) { ctx.beginPath(); ctx.moveTo(sx, -104); ctx.quadraticCurveTo(sx + 10, -118, sx, -130); ctx.quadraticCurveTo(sx - 10, -142, sx, -152); ctx.stroke(); }
  ctx.font = '46px Brand'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ANNA CAFÉ', 0, 14); ctx.fillRect(-70, 46, 140, 6); ctx.globalAlpha = 1;
  if (state === 'cracked') {
    const r = rng(seed); ctx.strokeStyle = HOOD; ctx.lineWidth = 6;
    for (let i = 0; i < 9; i++) { let px = -130 + r() * 260, py = -150 + r() * 210; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (r() - .5) * 60; py += 12 + r() * 22; ctx.lineTo(px, py); } ctx.stroke(); }
    ctx.fillStyle = HOOD; for (let i = 0; i < 7; i++) { L.path(ctx, circlePts(-120 + r() * 240, -120 + r() * 180, 10 + r() * 16, 8 + r() * 12, 7)); ctx.fill(); }
    ctx.save(); ctx.translate(96, 20); ctx.rotate(-0.6); cut(ctx, [[0, 0], [46, -8], [30, 30]], '#EDEDED', { seed: seed + 3, amp: 1, edgeW: 3 }); ctx.restore();
  }
  if (state === 'film') {
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(-160, -175, 320, 250);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-160, -60); ctx.lineTo(-90, -175); ctx.lineTo(-50, -175); ctx.lineTo(-120, -60); ctx.closePath(); ctx.fill();
    ctx.setLineDash([12, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.strokeRect(-160, -175, 320, 250); ctx.setLineDash([]);
  }
  ctx.restore();
}
// flat-lay hoodie. o.logo: 'good'|'cracked'|'none'|'film'|false  o.logoFn(ctx) draws a custom logo at chest (local coords, origin = chest)
function hoodie(ctx, x, y, s, rot, o = {}) {
  const sd = o.seed || 3000, col = o.color || HOOD, dark = o.dark || HOODD, sc = o.scrib || '#2A3D7A';
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, circlePts(0, -185, 122, 88, 30), col, { seed: sd + 1, amp: 3 });
  cut(ctx, circlePts(0, -176, 74, 46, 24), '#0C173A', { seed: sd + 2, amp: 2, edge: false, shadow: false });
  cut(ctx, [[-170, -150], [-110, -120], [-250, 250], [-332, 212]], col, { seed: sd + 3, scribble: sc });
  cut(ctx, [[170, -150], [110, -120], [250, 250], [332, 212]], col, { seed: sd + 4, scribble: sc });
  cut(ctx, [[-255, 238], [-330, 205], [-348, 240], [-270, 276]], dark, { seed: sd + 5, amp: 1.5, edgeW: 5 });
  cut(ctx, [[255, 238], [330, 205], [348, 240], [270, 276]], dark, { seed: sd + 6, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(-185, -160, 370, 440, 34), col, { seed: sd + 7, scribble: sc });
  cut(ctx, rectPts(-185, 250, 370, 38), dark, { seed: sd + 8, amp: 1.5, edgeW: 5 });
  cut(ctx, [[-120, 118], [120, 118], [150, 250], [-150, 250]], '#22357A', { seed: sd + 9, amp: 2, edgeW: 5 });
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 30, -150); ctx.quadraticCurveTo(sx * 40, -90, sx * 36, -44); ctx.stroke(); }
  if (o.logoFn) { ctx.save(); ctx.translate(0, -10); o.logoFn(ctx); ctx.restore(); }
  else if (o.logo !== false) cafeLogo(ctx, 0, -10, 0.95, o.logo || 'good', sd + 20);
  ctx.restore();
}
function drum(ctx, px, py, rr, spin, o = {}) {
  ctx.save(); ctx.beginPath(); ctx.arc(px, py, rr, 0, 7); ctx.clip();
  ctx.fillStyle = '#1B3A8C'; ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2);
  ctx.fillStyle = 'rgba(10,20,60,0.5)'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + spin * 0.6; for (const k of [0.45, 0.78]) { ctx.beginPath(); ctx.arc(px + Math.cos(a + k) * rr * k, py + Math.sin(a + k) * rr * k, rr * 0.03, 0, 7); ctx.fill(); } }
  if (o.hoodie !== false) hoodie(ctx, px + Math.cos(spin) * rr * 0.22, py + Math.sin(spin) * rr * 0.22, rr / 470, spin * 1.3, { logo: o.logo, seed: 3100 });
  const wl = py + rr * 0.25; ctx.fillStyle = 'rgba(143,176,238,0.55)'; ctx.beginPath(); ctx.moveTo(px - rr, py + rr);
  for (let x = -rr; x <= rr; x += 20) ctx.lineTo(px + x, wl + Math.sin(x / 40 + spin * 3) * rr * 0.04); ctx.lineTo(px + rr, py + rr); ctx.closePath(); ctx.fill();
  const r = rng(ST.B * 5 + 1); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(px + (r() - .5) * rr * 1.6, py + (r() - .1) * rr * 0.9, 4 + r() * rr * 0.04, 0, 7); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(px - rr * 0.35, py - rr * 0.42, rr * 0.42, rr * 0.16, -0.6, 0, 7); ctx.fill();
  ctx.restore();
}
// washing machine; returns [porthole x, y, glass radius]
function machine(ctx, cx, cy, w, h, spin, o = {}) {
  cut(ctx, rrPts(cx - w / 2, cy - h / 2, w, h, w * 0.05), C.paper, { seed: 700, scribble: '#E6E0D0', amp: 3 });
  const pt = cy - h / 2 + w * 0.03;
  cut(ctx, rrPts(cx - w / 2 + w * 0.03, pt, w * 0.94, h * 0.16, w * 0.03), C.pale, { seed: 701, amp: 2, edgeW: 6, shadow: false });
  cut(ctx, rrPts(cx - w * 0.12, pt + h * 0.035, w * 0.24, h * 0.09, 10), C.navy, { seed: 702, amp: 1.5, edge: false, shadow: false });
  txt(ctx, o.display || '40°', cx, pt + h * 0.08, { font: `${Math.round(w * 0.05)}px Brand`, color: C.sky });
  cut(ctx, circlePts(cx + w * 0.34, pt + h * 0.08, w * 0.055), C.silver, { seed: 703, amp: 1.5, edgeW: 5 });
  for (let i = 0; i < 3; i++) cut(ctx, circlePts(cx - w * 0.38 + i * w * 0.07, pt + h * 0.08, w * 0.022), [BRAND, C.sky, C.mid][i], { seed: 704 + i, amp: 1, edgeW: 4, shadow: false });
  const px = cx, py = cy + h * 0.08, R = w * 0.36;
  cut(ctx, circlePts(px, py, R, R, 48), C.silver, { seed: 710, amp: 2 });
  cut(ctx, circlePts(px, py, R * 0.88, R * 0.88, 48), '#8E97A6', { seed: 711, amp: 2, edge: false, shadow: false });
  drum(ctx, px, py, R * 0.78, spin, o);
  return [px, py, R * 0.78];
}
function mug(ctx, x, y, s = 1, lt = 0, steam = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, rrPts(-34, -70, 68, 84, 12), C.navy, { seed: 975, amp: 1.5, edgeW: 6 });
  ctx.strokeStyle = C.navy; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(38, -30, 18, -1.3, 1.3); ctx.stroke();
  txt(ctx, 'S', 0, -26, { font: '38px Brand', color: '#fff' });
  if (steam) { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const k of [-12, 12]) { ctx.beginPath(); ctx.moveTo(k, -84); ctx.quadraticCurveTo(k + 12, -104 - Math.sin(lt * 6) * 6, k, -124); ctx.stroke(); } }
  ctx.restore();
}
function clock(ctx, x, y, r, lt, speed = 1) {
  cut(ctx, circlePts(x, y, r), '#fff', { seed: 960, amp: 2 }); ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round';
  for (const [len, sp] of [[0.68, 9], [0.47, 1.2]]) { const a = lt * sp * speed; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * r * len, y - Math.cos(a) * r * len); ctx.stroke(); } ctx.restore();
}

// ---------- hands entering frame (Στράτος' arm, same style) ----------
// fingertip / grip point at (tx,ty); the arm comes from the direction (dx,dy). hand: point | fist | open
function reach(ctx, tx, ty, dx, dy, o = {}) {
  const type = o.hand || 'point', side = o.side || 1, len = Math.hypot(dx, dy), ux = -dx / len, uy = -dy / len;
  const tip = type === 'point' ? [-side * 26, 392] : type === 'open' ? [0, 352] : [0, 330];
  ctx.save(); ctx.translate(tx, ty); ctx.rotate(Math.atan2(-ux, uy)); ctx.translate(-tip[0], -tip[1]);
  cut(ctx, rrPts(-27, 30, 54, 232, 26), S.skin, { seed: (o.seed || 60) + 1, amp: 2, edgeW: 6 });
  hand(ctx, type, side, (o.seed || 60) + 2);
  const sl = cut(ctx, [[-50, -1700], [50, -1700], [58, 96], [-58, 96]], S.tee, { seed: (o.seed || 60), amp: 2, edgeW: 6 }); // sleeve always over the arm
  ctx.save(); L.path(ctx, sl); ctx.clip(); ctx.fillStyle = S.teeD; ctx.fillRect(-70, 78, 140, 20); ctx.restore();
  ctx.restore();
}

// ---------- UI / graphic bits ----------
function msgBubble(ctx, x, y, w, h, text, o = {}) { // incoming chat message
  cut(ctx, [[x + 10, y + 16], [x - 22, y + 4], [x + 18, y + 44]], '#fff', { seed: (o.seed || 1) + 1, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(x, y, w, h, 26), '#fff', { seed: o.seed || 1, amp: 2, edgeW: 6 });
  if (text) { ctx.save(); ctx.font = `${o.fs || 40}px Round`; ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 28, y + h / 2 - 6); ctx.restore(); }
  txt(ctx, o.time || '21:47', x + w - 52, y + h - 20, { font: '22px Round', color: '#8A94A8' });
}
function speech(ctx, x, y, w, h, lines, o = {}) { // speech bubble with tail pointing to (tx,ty) relative
  const [tx, ty] = o.tail || [0, h / 2 + 70];
  cut(ctx, [[x - 40, y + h / 2 - 12], [x + 30, y + h / 2 - 12], [x + tx, y + ty]], C.paper, { seed: (o.seed || 1) + 1, amp: 2 });
  cut(ctx, rrPts(x - w / 2, y - h / 2, w, h, Math.min(90, h * 0.45)), C.paper, { seed: o.seed || 1, amp: 3 });
  lines.forEach(([t, font, col], i) => txt(ctx, t, x, y + (i - (lines.length - 1) / 2) * (o.lh || 90), { font, color: col || C.navy }));
}
function stamp(ctx, lt, st, x, y, word, rot, col = BRAND, fs = 76) { // big popping label
  pop(ctx, lt, st, x, y, () => { ctx.font = `bold ${fs}px Round`; const tw = ctx.measureText(word).width + 80; cut(ctx, rrPts(-tw / 2, -fs * 0.82, tw, fs * 1.64, 22), col, { seed: 40 + word.length, amp: 3, edgeW: 9 }); txt(ctx, word, 0, 4, { font: `bold ${fs}px Round`, color: '#fff' }); }, rot);
}
function seriesTag(ctx, lt, label, x, y) { // sticker on the caption's bottom-right corner (inside the safe zone) unless x,y given
  ctx.font = '40px Hand'; const tw = ctx.measureText(label).width + 56;
  x = x ?? L.SAFE.right - 40 - tw / 2; y = y ?? (ST.capBottom ? ST.capBottom + 6 : L.SAFE.top + 40);
  pop(ctx, lt, 0, x, y, () => { cut(ctx, rrPts(-tw / 2, -38, tw, 76, 20), C.navy, { seed: 30, amp: 3 }); txt(ctx, label, 0, 2, { font: '40px Hand', color: '#fff' }); }, 0.04);
}
function sparkle(ctx, x, y, s, lt, start, seed) { pop(ctx, lt, start, x, y, () => { const k = 0.8 + 0.2 * Math.sin((lt - start) * 12); cut(ctx, starPts(0, 0, 60 * s * k, 4, 0.3), '#fff', { seed, amp: 1, edgeW: 3, shadow: false }); }); }
function ctaButton(ctx, lt, st, x, y, label, o = {}) { // brand-blue pill with arrow, pulses
  const pulse = lt > st + 0.4 ? 1 + 0.045 * Math.sin((lt - st - 0.4) * 7) : 1, w = o.w || 640;
  pop(ctx, lt, st, x, y, () => {
    ctx.scale(pulse, pulse); cut(ctx, rrPts(-w / 2, -64, w, 128, 64), o.col || BRAND, { seed: 90, amp: 2, edgeW: 8 });
    txt(ctx, label, -42, 2, { font: 'bold 52px Round', color: '#fff' });
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const ax = w / 2 - 100;
    ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax + 46, 0); ctx.moveTo(ax + 26, -20); ctx.lineTo(ax + 48, 0); ctx.lineTo(ax + 26, 20); ctx.stroke();
  });
}
// Στράτος talking-head picture-in-picture. Default spot inside the safe zone (bottom-left, above the username): PIP = [x, y, r]
const PIP = [200, 1325, 130];
function pip(ctx, x, y, r, VO, o = {}) {
  ctx.save(); ctx.translate(x, y);
  cut(ctx, circlePts(0, 0, r + 14, r + 14, 40), C.navy, { seed: 800, amp: 3 });
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); ctx.fillStyle = o.bg || C.sky; ctx.fillRect(-r, -r, r * 2, r * 2);
  stratos(ctx, 0, r * 0.95, r / 250, { mouth: lipsync(VO, o.rest || 'smile'), blink: blinkNow(), brows: o.brows ?? 0.4, eyes: o.eyes, look: o.look, legs: false, arms: [0.1, 0.1], seed: 1000 });
  ctx.restore(); ctx.restore();
}

// ---------- laser engraving («Πώς φτιάχνεται;») ----------
const ENGR = '#C9CDD8';
// notebook A5 (PU leatherette) — local geometry, used to aim the laser at the logo
const NB = { w: 300, h: 420, lx: 12, ly: -20, ls: 0.76, top: -138, bot: 22, half: 108 };
// o.engrave 0..1 (reveal top→bottom) | false ; o.sy vertical squash (perspective on a bed) ; o.col cover colour
function notebook(ctx, x, y, s, rot = 0, o = {}) {
  const sd = o.seed || 4000, w = NB.w, h = NB.h;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s * (o.sy || 1));
  cut(ctx, rrPts(-w / 2 + 8, -h / 2 + 8, w - 4, h - 4, 14), '#EDE7D8', { seed: sd, amp: 1.5, edgeW: 5, shadow: o.shadow });
  const pf = cut(ctx, rrPts(-w / 2, -h / 2, w, h, 18), o.col || C.navy, { seed: sd + 1, amp: 2, edgeW: o.edgeW ?? 8, scribble: '#16285A', shadow: o.shadow });
  ctx.save(); L.path(ctx, pf); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-w / 2, -h / 2, 30, h);
  ctx.setLineDash([9, 7]); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2 + 42, -h / 2 + 14, w - 60, h - 28); ctx.setLineDash([]);
  const e = o.engrave ?? 1;
  if (o.engrave !== false && e > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, NB.top + (NB.bot - NB.top) * e + h / 2); ctx.clip();
    cafeLogo(ctx, NB.lx + 1.5, NB.ly + 2, NB.ls, 'good', 1, 'rgba(0,0,0,0.5)');
    cafeLogo(ctx, NB.lx, NB.ly, NB.ls, 'good', 1, o.engC || ENGR);
    ctx.restore();
  }
  ctx.restore();
  if (o.band !== false) cut(ctx, rectPts(w / 2 - 24, -h / 2 - 4, 15, h + 8), '#050C22', { seed: sd + 3, amp: 1, edge: false, shadow: false });
  ctx.restore();
}
// laser glow + sparks at the burn point
function laserFX(ctx, x, y, lt, s = 1, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 90); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.2, 'rgba(255,190,90,0.9)'); g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
  const r = rng(ST.B * 31 + seed); ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = r() * 6.28, l = 18 + r() * 50, d = 10 + r() * 18; ctx.strokeStyle = i % 3 ? '#FFD27A' : '#fff'; ctx.lineWidth = 3 + r() * 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d); ctx.lineTo(Math.cos(a) * (d + l), Math.sin(a) * (d + l)); ctx.stroke(); }
  ctx.restore();
}
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
// UI slider (x,y = track left-centre), returns knob position
function uiSlider(ctx, x, y, w, v, label, o = {}) {
  if (label) txt(ctx, label, x, y - 50, { font: 'bold 38px Round', color: o.labelC || '#fff', align: 'left' });
  cut(ctx, rrPts(x, y - 12, w, 24, 12), '#2A3F7A', { seed: (o.seed || 5200), amp: 1, edge: false, shadow: false });
  cut(ctx, rrPts(x, y - 12, Math.max(24, w * v), 24, 12), BRAND, { seed: (o.seed || 5200) + 1, amp: 1, edge: false, shadow: false });
  cut(ctx, circlePts(x + w * v, y, 30), C.paper, { seed: (o.seed || 5200) + 2, amp: 1.5, edgeW: 5 });
  return [x + w * v, y];
}
// gift box with optional item peeking out (o.inside(ctx), drawn behind the box front)
function giftBox(ctx, x, y, s = 1, o = {}) {
  const sd = o.seed || 4200; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.inside) o.inside(ctx);
  cut(ctx, rrPts(-150, -40, 300, 180, 10), o.col || BRAND, { seed: sd, scribble: '#4A6FF6' });
  cut(ctx, rectPts(-18, -40, 36, 180), C.paper, { seed: sd + 1, amp: 1, edge: false, shadow: false });
  ctx.save(); ctx.translate(150, -60); ctx.rotate(0.5);
  cut(ctx, rrPts(-20, -150, 56, 320, 10), o.lidC || C.mid, { seed: sd + 2, amp: 2 });
  cut(ctx, rectPts(-20, -18, 56, 36), C.paper, { seed: sd + 3, amp: 1, edge: false, shadow: false });
  ctx.restore();
  for (const sg of [-1, 1]) cut(ctx, circlePts(sg * 34, -58, 34, 22, 18), C.paper, { seed: sd + 5 + sg, amp: 1.5, edgeW: 5 });
  cut(ctx, circlePts(0, -56, 14), C.paper, { seed: sd + 8, amp: 1, edgeW: 4 });
  ctx.restore();
}
// Στράτος from behind (over-the-shoulder shots). y = shoulder line
function stratosBack(ctx, x, y, s, o = {}) {
  const sd = o.seed || 1000; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, [[-175, 0], [175, 0], [215, 700], [-215, 700]], S.tee, { seed: sd + 40, scribble: '#E9E5DA' });
  cut(ctx, rectPts(-215, 470, 430, 34), S.apron, { seed: sd + 41, amp: 1.5, edgeW: 5 });
  for (const sg of [-1, 1]) cut(ctx, circlePts(sg * 30, 487, 30, 18, 14), S.apron, { seed: sd + 42 + sg, amp: 1, edgeW: 4 });
  for (const sg of [-1, 1]) cut(ctx, [[sg * 40, -20], [sg * 70, -20], [sg * 60, 200], [sg * 34, 200]], S.apron, { seed: sd + 45 + sg, amp: 1, edgeW: 4, shadow: false });
  cut(ctx, rectPts(-40, -80, 80, 100), S.skinD, { seed: sd + 47, amp: 2, edge: false, shadow: false });
  for (const ex of [-124, 124]) cut(ctx, circlePts(ex, -178, 28, 32, 16), S.skin, { seed: sd + 48 + (ex > 0 ? 1 : 0), amp: 2, edgeW: 7 });
  cut(ctx, circlePts(0, -185, 125, 128, 40), S.skin, { seed: sd + 50, amp: 3 });
  cut(ctx, [[-124, -250], [124, -250], [122, -150], [96, -110], [60, -118], [30, -100], [0, -108], [-30, -100], [-60, -118], [-96, -110], [-122, -150]], S.hair, { seed: sd + 51, amp: 2.5, edgeW: 6 });
  ctx.save(); ctx.translate(-138, -226); ctx.scale(-1, 1); ctx.rotate(-0.9);
  cut(ctx, [[0, 0], [16, -8], [120, -8], [120, 8], [16, 8]], '#F6D25A', { seed: sd + 52, amp: 1, edgeW: 5 });
  cut(ctx, rectPts(108, -8, 18, 16), '#F29C9C', { seed: sd + 53, amp: 1, edge: false, shadow: false }); ctx.restore();
  const dome = [[-136, -262]]; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; dome.push([Math.cos(a) * 136, -262 + Math.sin(a) * 108]); }
  cut(ctx, dome, S.beanie, { seed: sd + 54, amp: 3, scribble: '#F2C66E' });
  const cuff = cut(ctx, rrPts(-146, -294, 292, 54, 18), S.beanieD, { seed: sd + 55, amp: 2 });
  ctx.save(); L.path(ctx, cuff); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 5;
  for (let xx = -140; xx < 150; xx += 22) { ctx.beginPath(); ctx.moveTo(xx, -296); ctx.lineTo(xx, -236); ctx.stroke(); } ctx.restore();
  ctx.restore();
}
// outgoing chat message (brand blue, tail bottom-right). x,y = top-left
function msgOut(ctx, x, y, w, h, text, o = {}) {
  cut(ctx, [[x + w - 40, y + h - 30], [x + w + 26, y + h + 4], [x + w - 12, y + h - 50]], BRAND, { seed: (o.seed || 1) + 1, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(x, y, w, h, 26), BRAND, { seed: o.seed || 1, amp: 2, edgeW: 7 });
  if (text) txt(ctx, text, x + 30, y + h / 2 - 4, { font: `bold ${o.fs || 42}px Round`, color: '#fff', align: 'left' });
}

module.exports = { PIP, NB, ENGR, notebook, laserFX, smoke, HONEY, honeycomb, laserHeadTop, laserMachine, uiSlider, giftBox, stratosBack, msgOut, BRAND, HOOD, HOODD, bgFlat, tiles, wallShelf, starsBG, cafeLogo, hoodie, drum, machine, mug, clock, reach, msgBubble, speech, stamp, seriesTag, sparkle, ctaButton, pip };
