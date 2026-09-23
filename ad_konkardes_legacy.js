// LEGACY standalone (πριν τον Στράτο): node ad_konkardes_legacy.js render out.mp4 | preview 3.5 11
// Κονκάρδες προσωπικού — paper-cutout animation, drawn frame-by-frame in JavaScript
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
GlobalFonts.registerFromPath(__dirname + '/fonts/Mynerve-Regular.ttf', 'Hand');
GlobalFonts.registerFromPath(__dirname + '/fonts/Comfortaa.ttf', 'Round');

const W = 1080, H = 1920, FPS = 30;
const C = {
  navy: '#0B1B3F', blue: '#1E3A8A', mid: '#2F5FD0', sky: '#8FB0EE', pale: '#DCE7FA',
  paper: '#F7F4EC', white: '#FFFFFF', gold: '#D8A93B', silver: '#C3CAD4', bronze: '#B07A4F',
  skin: '#F0BE98', skinD: '#D99C74', cheek: '#F4A0A0', hair: '#2B1F1C', hair2: '#6B4630', ink: '#101A33',
};
let B = 0, FRAME = 0; // boil index (12 fps wobble), frame index

// ---------- utils ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const spring = p => p <= 0 ? 0 : 1 - Math.exp(-5 * p) * Math.cos(10 * p);

const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function rrPts(x, y, w, h, r) {
  const p = [], cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a0] of cs) for (let i = 0; i <= 6; i++) { const a = a0 + i / 6 * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}
function circlePts(cx, cy, rx, ry = rx, n = 36) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function heartPts(cx, cy, s) { const p = []; for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 2; p.push([cx + 16 * Math.pow(Math.sin(t), 3) * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s]); } return p; }
function starPts(cx, cy, r, spikes = 4, inner = 0.35) { const p = []; for (let i = 0; i < spikes * 2; i++) { const a = i / (spikes * 2) * Math.PI * 2 - Math.PI / 2; const rr = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; }

function tear(pts, seed, amp = 5, step = 22) {
  const r = rng(seed), out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n];
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, k = Math.max(1, Math.round(L / step)), nx = -dy / L, ny = dx / L;
    for (let j = 0; j < k; j++) {
      const t = j / k;
      if (j === 0) out.push([x1 + (r() - .5) * amp * .6, y1 + (r() - .5) * amp * .6]);
      else { const o = (r() - 0.5) * 2 * amp; out.push([x1 + dx * t + nx * o, y1 + dy * t + ny * o]); }
    }
  }
  return out;
}
function path(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); }
function bbox(p) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of p) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }

function scribble(ctx, [x0, y0, x1, y1], color, seed) {
  const r = rng(seed * 3 + 1); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = 0.5;
  for (let y = y0 + 22; y < y1; y += 50) {
    ctx.beginPath(); let x = x0 - 20; ctx.moveTo(x, y);
    while (x < x1 + 20) { const w = 14 + r() * 14, h = 8 + r() * 12; ctx.quadraticCurveTo(x + w * .5, y - h, x + w, y); x += w; if (r() < 0.07) { x += 25 + r() * 40; ctx.moveTo(x, y); } }
    ctx.stroke();
  }
  ctx.restore();
}

// paper cut-out: shadow + white torn edge + colored fill + optional scribble texture
function cut(ctx, pts, fill, o = {}) {
  const s = (o.seed || 1) + B * 7919, amp = o.amp ?? 4, step = o.step ?? 20;
  const pf = tear(pts, s, amp, step), pw = tear(pts, s + 13, amp * 1.6, step);
  if (o.shadow !== false) { ctx.save(); ctx.translate(o.sx ?? 7, o.sy ?? 9); path(ctx, pw); ctx.fillStyle = 'rgba(5,10,30,0.22)'; ctx.fill(); ctx.restore(); }
  if (o.edge !== false) { path(ctx, pw); ctx.lineJoin = 'round'; ctx.lineWidth = o.edgeW ?? 10; ctx.strokeStyle = o.edgeC || '#FBFAF6'; ctx.stroke(); ctx.fillStyle = o.edgeC || '#FBFAF6'; ctx.fill(); }
  path(ctx, pf); ctx.fillStyle = fill; ctx.fill();
  if (o.scribble) { ctx.save(); path(ctx, pf); ctx.clip(); scribble(ctx, bbox(pf), o.scribble, s); ctx.restore(); }
  return pf;
}
function txt(ctx, s, x, y, o = {}) {
  ctx.save(); ctx.font = o.font || '64px Hand'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  if (o.edge) { ctx.lineJoin = 'round'; ctx.lineWidth = o.edge; ctx.strokeStyle = o.edgeC || '#fff'; ctx.strokeText(s, 0, 0); }
  ctx.fillStyle = o.color || C.ink; ctx.fillText(s, 0, 0); ctx.restore();
}
function wrap(ctx, text, maxW) { const words = text.split(' '), lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
function pop(ctx, lt, start, x, y, fn, rot = 0) { const s = spring(prog(lt, start, start + 0.55)); if (s <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); fn(); ctx.restore(); }
function check(ctx, x, y, s, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.lineTo(x - 3 * s, y + 12 * s); ctx.lineTo(x + 16 * s, y - 12 * s); ctx.stroke(); ctx.restore(); }

// ---------- elements ----------
function logoMark(ctx, x, y, r, col = C.ink) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = r * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * .45, r * .45); ctx.quadraticCurveTo(-r * .5, -r * .5, r * .45, -r * .45); ctx.quadraticCurveTo(r * .5, r * .5, -r * .45, r * .45); ctx.fill();
  ctx.restore();
}
const BADGE = { gold: [C.gold, '#F4D98A'], silver: [C.silver, '#F1F4F8'], bronze: [C.bronze, '#DDAA82'] };
function badge(ctx, cx, cy, w, col, name, o = {}) {
  const h = w / 3, cols = BADGE[col];
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(o.s || 1, o.s || 1);
  const pf = cut(ctx, rrPts(-w / 2, -h / 2, w, h, h * 0.18), cols[0], { seed: o.seed || 77, amp: 1.5, step: 30, edgeW: o.edgeW ?? 10 });
  ctx.save(); path(ctx, pf); ctx.clip();
  ctx.globalAlpha = 0.5; ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.moveTo(-w * .22, -h); ctx.lineTo(w * .0, -h); ctx.lineTo(-w * .14, h); ctx.lineTo(-w * .36, h); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = Math.max(1, h / 60);
  for (let y = -h / 2 + h / 25; y < h / 2; y += h / 14) { ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); ctx.stroke(); }
  ctx.restore();
  const reveal = o.reveal ?? 1;
  if (reveal > 0) {
    ctx.save(); if (reveal < 1) { ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w * reveal, h); ctx.clip(); }
    if (o.logo !== false && (o.logoS ?? 1) > 0) logoMark(ctx, -w / 2 + h * 0.55, 0, h * 0.28 * (o.logoS ?? 1));
    if (name) { ctx.fillStyle = C.ink; ctx.font = `bold ${Math.round(h * 0.4)}px Round`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, h * 0.4, h * 0.03); }
    ctx.restore();
  }
  ctx.restore();
  return h;
}
function person(ctx, x, y, s, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const sd = o.seed, look = o.look || 0;
  if (o.type === 'woman') cut(ctx, rrPts(-138, -300, 276, 262, 115), C.hair, { seed: sd + 1, amp: 3 });
  cut(ctx, rectPts(-34, -70, 68, 90), C.skinD, { seed: sd + 2, edge: false, shadow: false, amp: 2 });
  cut(ctx, [[-150, 0], [150, 0], [205, 420], [-205, 420]], o.shirt, { seed: sd + 3, scribble: o.shirtS });
  cut(ctx, [[-74, -4], [-2, 4], [-42, 64]], C.paper, { seed: sd + 4, amp: 2, edgeW: 6 });
  cut(ctx, [[74, -4], [2, 4], [42, 64]], C.paper, { seed: sd + 5, amp: 2, edgeW: 6 });
  cut(ctx, circlePts(0, -175, 116, 118, 40), C.skin, { seed: sd + 6, amp: 3 });
  if (o.type === 'woman') {
    cut(ctx, [[-124, -190], [-114, -254], [-64, -296], [0, -306], [64, -296], [114, -254], [126, -186], [84, -236], [20, -222], [-44, -242]], C.hair, { seed: sd + 7, amp: 3, edgeW: 7 });
    ctx.save(); ctx.translate(-72, -250); ctx.rotate(-0.5); cut(ctx, rectPts(-26, -10, 52, 20), C.sky, { seed: sd + 8, amp: 1.5, edgeW: 5, shadow: false }); ctx.restore();
  } else {
    cut(ctx, [[-120, -180], [-116, -250], [-62, -296], [10, -304], [72, -290], [118, -244], [120, -184], [96, -222], [30, -240], [-40, -230], [-96, -220]], o.hairC || C.hair2, { seed: sd + 7, amp: 3, edgeW: 7 });
  }
  // eyes
  const blink = o.blink ? 0.12 : 1;
  for (const ex of [-40, 40]) {
    ctx.save(); ctx.translate(ex + look, -165); ctx.scale(1, blink);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4, -4, 4, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = 0.8; ctx.fillStyle = C.cheek; for (const cx of [-72, 72]) { ctx.beginPath(); ctx.arc(cx + look * .5, -122, 22, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
  if (o.mood === 'happy') ctx.arc(look * .5, -128, 30, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (o.mood === 'worried') { const m = look * .5; ctx.moveTo(m - 24, -112); ctx.quadraticCurveTo(m - 12, -124, m, -112); ctx.quadraticCurveTo(m + 12, -100, m + 24, -112); }
  else ctx.arc(look * .5, -122, 18, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  if (o.sweat) cut(ctx, [[112, -250], [124, -222], [118, -206], [104, -210], [100, -226]], C.pale, { seed: sd + 9, amp: 1, edgeW: 4, shadow: false });
  if (o.badge) badge(ctx, 72, 78, 150, 'gold', 'ΜΑΡΙΑ', { seed: sd + 10, edgeW: 5 });
  ctx.restore();
}
function bubble(ctx, cx, cy, w, h, tx, ty, text, font, seed) {
  cut(ctx, [[cx - 40, cy + h / 2 - 10], [cx + 30, cy + h / 2 - 10], [tx, ty]], C.paper, { seed: seed + 1, amp: 2 });
  cut(ctx, rrPts(cx - w / 2, cy - h / 2, w, h, h * 0.45), C.paper, { seed, amp: 3 });
  txt(ctx, text, cx, cy, { font, color: C.ink });
}
function caption(ctx, text, lt, start = 0.15) {
  const p = easeOut(prog(lt, start, start + 0.45)); if (p <= 0) return;
  ctx.save(); ctx.font = '60px Hand'; const lines = wrap(ctx, text, 860), lh = 74, h = lines.length * lh + 56;
  ctx.translate(lerp(-1150, 60, p), 150); ctx.rotate(-0.015);
  cut(ctx, rectPts(0, 0, 960, h), C.paper, { seed: 500 + lines.length, amp: 6, step: 16 });
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '60px Hand';
  lines.forEach((l, i) => ctx.fillText(l, 480, 28 + lh / 2 + i * lh));
  ctx.restore();
}
function burst(ctx, lt, start, x, y, word, rot) {
  pop(ctx, lt, start, x, y, () => {
    cut(ctx, starPts(0, 0, 190, 12, 0.72), C.white, { seed: 900, amp: 3 });
    txt(ctx, word, 0, 6, { font: 'bold 84px Round', color: C.blue });
  }, rot);
}
function handPen(ctx, px, py, seed) {
  cut(ctx, [[px + 120, py + 10], [px + 205, py - 30], [px + 620, py + 720], [px + 380, py + 790]], C.mid, { seed: seed, scribble: '#4B78DC' });
  cut(ctx, [[px + 130, py + 5], [px + 205, py - 30], [px + 235, py + 30], [px + 160, py + 70]], C.blue, { seed: seed + 1, amp: 2, edgeW: 6 });
  // pencil
  const ang = Math.atan2(-55, 160), L = 175; ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  cut(ctx, [[0, 0], [34, -11], [L, -11], [L, 11], [34, 11]], C.paper, { seed: seed + 2, amp: 1, edgeW: 5 });
  cut(ctx, rectPts(70, -11, 30, 22), C.mid, { seed: seed + 3, amp: 1, edge: false, shadow: false });
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, -4); ctx.lineTo(12, 4); ctx.closePath(); ctx.fill(); ctx.restore();
  cut(ctx, circlePts(px + 150, py - 22, 62, 56, 30), C.skin, { seed: seed + 4, amp: 3 });
  for (let i = 0; i < 3; i++) cut(ctx, circlePts(px + 100 + i * 8, py - 58 + i * 26, 24, 20, 16), C.skin, { seed: seed + 5 + i, amp: 2, edgeW: 5, shadow: false });
}

// ---------- backgrounds ----------
function receptionBG(ctx) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.blue, { seed: 11, edge: false, shadow: false, scribble: '#3456B0' });
  cut(ctx, rectPts(-40, 470, W + 80, 110), C.mid, { seed: 12, edgeW: 8 });
  ctx.save(); ctx.translate(560, 475); ctx.rotate(-0.03); cut(ctx, rectPts(-215, -72, 430, 144), C.paper, { seed: 13 });
  txt(ctx, 'ΥΠΟΔΟΧΗ', 0, 4, { font: 'bold 66px Round', color: C.navy }); ctx.restore();
  // plant
  const leaves = [[70, 1080, -0.6], [120, 1040, -0.1], [165, 1075, 0.5], [95, 1130, -1.0], [150, 1125, 0.9]];
  leaves.forEach(([lx, ly, r], i) => { ctx.save(); ctx.translate(lx, ly); ctx.rotate(r); cut(ctx, circlePts(0, -60, 34, 75, 24), i % 2 ? '#4F9BC0' : '#6CB3D6', { seed: 60 + i, amp: 2, edgeW: 6 }); ctx.restore(); });
  cut(ctx, [[60, 1150], [180, 1150], [165, 1255], [75, 1255]], C.paper, { seed: 66, scribble: '#E3DCCB' });
}
function counter(ctx) {
  cut(ctx, rectPts(-40, 1250, W + 80, 60), C.sky, { seed: 70, edgeW: 8 });
  cut(ctx, rectPts(-40, 1300, W + 80, 700), C.paper, { seed: 71, scribble: '#E3DCCB' });
  cut(ctx, rectPts(-40, 1440, W + 80, 26), C.mid, { seed: 72, amp: 2, edgeW: 6 });
  // bell
  cut(ctx, rectPts(850, 1232, 110, 18), C.navy, { seed: 73, amp: 1, edgeW: 5 });
  const dome = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + i / 18 * Math.PI; dome.push([905 + Math.cos(a) * 46, 1232 + Math.sin(a) * 42]); }
  cut(ctx, dome, C.gold, { seed: 74, amp: 1.5, edgeW: 5 });
}
function fabric(ctx) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.navy, { seed: 21, edge: false, shadow: false, scribble: '#22386E' });
  cut(ctx, rectPts(430, -40, 150, H + 80), '#132552', { seed: 22, edgeW: 6 });
  ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 4;
  [447, 563].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x + 4, H + 20); ctx.stroke(); }); ctx.restore();
  [560, 1060, 1560].forEach((y, i) => { cut(ctx, circlePts(505, y, 34, 34, 24), C.paper, { seed: 30 + i, amp: 2 }); ctx.fillStyle = C.navy;[[-9, -9], [9, -9], [-9, 9], [9, 9]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(505 + a, y + b, 5, 0, 7); ctx.fill(); }); });
  cut(ctx, rectPts(640, 1200, 330, 360), '#132552', { seed: 40, edgeW: 6, scribble: '#1E3163' });
  ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.strokeRect(662, 1222, 286, 316); ctx.restore();
}

// ---------- scenes ----------
function s1(ctx, lt) {
  receptionBG(ctx);
  const worried = lt > 2.3;
  person(ctx, 720, 1060, 1, { type: 'woman', seed: 100, shirt: C.navy, shirtS: '#22345F', look: worried ? -14 : 0, mood: worried ? 'worried' : 'neutral', sweat: lt > 2.6, blink: (lt % 2.2) > 2.05 });
  counter(ctx);
  const wp = easeOut(prog(lt, 0.1, 1.2)), walking = lt < 1.2;
  const cy = 1330 - (walking ? Math.abs(Math.sin(lt * 11)) * 16 : 0);
  person(ctx, lerp(-260, 270, wp), cy, 1.15, { type: 'man', seed: 200, shirt: C.sky, shirtS: '#7FA0E4', look: 16, mood: 'neutral' });
  pop(ctx, lt, 1.35, 300, 820, () => bubble(ctx, 0, 0, 500, 170, 10, 150, 'Συγγνώμη... κυρία;', '56px Hand', 300));
  pop(ctx, lt, 2.5, 935, 690, () => {
    cut(ctx, circlePts(-60, 110, 16), C.paper, { seed: 310, amp: 1.5, edgeW: 5 });
    cut(ctx, circlePts(0, 0, 105, 72, 30), C.paper, { seed: 311, amp: 3 });
    txt(ctx, '...;', 0, 0, { font: '70px Hand' });
  });
  caption(ctx, 'Ο πελάτης σου δεν ξέρει πώς να σε φωνάξει...', lt);
}
function s2(ctx, lt) {
  const imp = 1.15, r = rng(FRAME * 31 + 7);
  const sh = lt > imp && lt < imp + 0.5 ? (1 - (lt - imp) / 0.5) * 26 : 0;
  ctx.save(); ctx.translate((r() - .5) * sh, (r() - .5) * sh);
  fabric(ctx);
  const dy = lerp(-1100, 0, easeIn(prog(lt, 0.15, imp)));
  ctx.save(); ctx.translate(790, 960 + dy); ctx.rotate(0.2);
  if (lt > imp) {
    const hr = 62 * easeOut(prog(lt, imp, imp + 0.35));
    if (hr > 2) {
      cut(ctx, circlePts(-205, 138, hr * 1.25, hr, 28), C.pale, { seed: 400, amp: hr * 0.22, step: 9, edgeW: 6 });
      cut(ctx, circlePts(-205, 138, hr * 0.55, hr * 0.42, 20), '#08122B', { seed: 401, amp: hr * 0.12, step: 8, edge: false, shadow: false });
      if (lt > imp + 0.3) { ctx.save(); ctx.strokeStyle = C.pale; ctx.lineWidth = 5; ctx.lineCap = 'round';[[1, .3], [-1, .6], [.2, 1.3], [-.4, -1.2]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(-205 + a * hr * 1.2, 138 + b * hr * .8); ctx.lineTo(-205 + a * hr * 1.9, 138 + b * hr * 1.4); ctx.stroke(); }); ctx.restore(); }
    }
  }
  const wob = lt > imp ? Math.sin((lt - imp) * 20) * 0.1 * Math.exp(-(lt - imp) * 3) : 0;
  ctx.rotate(wob);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#6E7686'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-110, 30); ctx.lineTo(-205, 138); ctx.stroke();
  ctx.strokeStyle = '#E3E7EE'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-110, 30); ctx.lineTo(-203, 136); ctx.stroke();
  ctx.lineWidth = 10; ctx.strokeStyle = '#B9C0CC'; ctx.beginPath(); ctx.arc(-110, 30, 20, 0, 7); ctx.stroke(); ctx.restore();
  cut(ctx, rectPts(-195, -68, 390, 136), '#ECECEC', { seed: 410, amp: 3 });
  txt(ctx, 'ΟΝΟΜΑ: ..........', 0, 0, { font: '46px Hand', color: '#6B7280', rot: -0.03 });
  ctx.restore();
  burst(ctx, lt, imp + 0.05, 330, 740, 'ΚΡΑΤΣ!', -0.14);
  ctx.restore();
  caption(ctx, 'Κι η παλιά καρφίτσα; Τρυπάει τη στολή.', lt);
}
function s3(ctx, lt) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 50, edge: false, shadow: false, scribble: '#BFD0F0' });
  ctx.save(); ctx.translate(540, 1080); ctx.rotate(-0.04);
  cut(ctx, rrPts(-320, -640, 640, 1280, 70), C.navy, { seed: 51, amp: 3, sx: 14, sy: 18 });
  cut(ctx, rrPts(-290, -605, 580, 1210, 46), C.white, { seed: 52, amp: 2, edge: false, shadow: false });
  cut(ctx, rrPts(-60, -590, 120, 26, 13), C.navy, { seed: 53, amp: 1, edge: false, shadow: false });
  txt(ctx, 'strategixstudios.com', 0, -525, { font: '26px Round', color: '#8A94A8' });
  txt(ctx, 'Κονκάρδες προσωπικού', 0, -455, { font: 'bold 40px Round', color: C.navy });
  // color cycling
  let col = 'gold'; if (lt > 3.7) col = ['silver', 'bronze', 'gold'][Math.min(2, Math.floor((lt - 3.7) / 0.45))];
  const bx = 0, by = -250, bw = 500;
  const bh = badge(ctx, bx, by, bw, col, null, { seed: 54, logoS: spring(prog(lt, 0.35, 0.9)) });
  // handwriting the name
  ctx.font = `${Math.round(bh * 0.5)}px Hand`; const name = 'Μαρία', tw = ctx.measureText(name).width;
  const x0 = bx + bh * 0.4 - tw / 2, p = easeInOut(prog(lt, 1.25, 3.0));
  if (p > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, by - bh / 2, tw * p + 10, bh); ctx.clip(); ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(name, x0, by + 4); ctx.restore(); }
  // steps
  const steps = [['Ανέβασε λογότυπο', 0.95], ['Γράψε ονόματα', 3.1], ['Διάλεξε χρώμα', 4.9]];
  steps.forEach(([s, tt], i) => {
    const y = 20 + i * 120;
    cut(ctx, rrPts(-230, y - 34, 68, 68, 14), lt > tt ? C.mid : C.pale, { seed: 60 + i, amp: 1.5, edgeW: 5, shadow: false });
    if (lt > tt) pop(ctx, lt, tt, -196, y, () => check(ctx, 0, 0, 1.3, '#fff'));
    txt(ctx, s, -140, y, { font: '40px Round', color: C.ink, align: 'left' });
  });
  ['gold', 'silver', 'bronze'].forEach((c, i) => {
    const x = -120 + i * 120, y = 420;
    if (c === col) cut(ctx, circlePts(x, y, 56), C.mid, { seed: 70 + i, amp: 1.5, edge: false, shadow: false });
    cut(ctx, circlePts(x, y, 42), BADGE[c][0], { seed: 73 + i, amp: 1.5, edgeW: 6 });
  });
  // hand with pen
  const hin = easeOut(prog(lt, 0.9, 1.25)) * (1 - easeIn(prog(lt, 3.2, 3.6)));
  if (hin > 0) { const tipX = x0 + tw * p, tipY = by + 18 + Math.sin(lt * 26) * 8 * (p > 0 && p < 1 ? 1 : 0); handPen(ctx, lerp(tipX + 700, tipX, hin), lerp(tipY + 700, tipY, hin), 80); }
  ctx.restore();
  pop(ctx, lt, 3.3, 820, 1720, () => { cut(ctx, circlePts(0, 0, 140, 110, 30), C.navy, { seed: 90, amp: 4 }); txt(ctx, '5 λεπτά', 0, 0, { font: 'bold 50px Round', color: '#fff' }); }, 0.1);
  caption(ctx, 'Ανεβάζεις λογότυπο, γράφεις ονόματα και τις βλέπεις live.', lt);
}
function s4(ctx, lt) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.navy, { seed: 41, edge: false, shadow: false, scribble: '#1B2D62' });
  cut(ctx, rectPts(50, 830, 980, 800), '#152A5E', { seed: 42, edgeW: 8 });
  ctx.fillStyle = '#2A4382'; for (let y = 870; y < 1610; y += 40) for (let x = 90; x < 1010; x += 40) { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); }
  const bw = 840, bx = 540, by = 1200, left = bx - bw / 2 + 30, right = bx + bw / 2 - 30;
  const lp = easeInOut(prog(lt, 0.35, 3.0)), firing = lt > 0.35 && lt < 3.0;
  const hx = lt < 3.0 ? lerp(left, right, lp) : lerp(right, 1250, easeIn(prog(lt, 3.0, 3.6)));
  badge(ctx, bx, by, bw, 'gold', 'ΜΑΡΙΑ', { seed: 43, reveal: clamp((Math.min(hx, right) - (bx - bw / 2)) / bw * (lt < 3.0 ? 1 : 2)) });
  // rail + head
  cut(ctx, rectPts(-40, 560, W + 80, 70), C.silver, { seed: 44, edgeW: 6 });
  ctx.fillStyle = '#8E97A6'; ctx.fillRect(-40, 590, W + 80, 10);
  cut(ctx, rrPts(hx - 110, 600, 220, 230, 22), C.paper, { seed: 45, amp: 2 });
  cut(ctx, rectPts(hx - 110, 690, 220, 34), C.mid, { seed: 46, amp: 1.5, edge: false, shadow: false });
  txt(ctx, 'LASER', hx, 770, { font: 'bold 34px Round', color: C.navy });
  cut(ctx, [[hx - 38, 832], [hx + 38, 832], [hx + 15, 895], [hx - 15, 895]], C.silver, { seed: 47, amp: 1.5, edgeW: 5 });
  if (firing) {
    const ey = by + Math.sin(lt * 42) * 70;
    ctx.save(); ctx.shadowColor = '#FF3B3B'; ctx.shadowBlur = 30; ctx.strokeStyle = '#FF5A5A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(hx, 895); ctx.lineTo(hx, ey); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hx, 895); ctx.lineTo(hx, ey); ctx.stroke();
    const g = ctx.createRadialGradient(hx, ey, 0, hx, ey, 70); g.addColorStop(0, 'rgba(255,240,200,0.95)'); g.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, ey, 70, 0, 7); ctx.fill();
    const r = rng(FRAME * 13 + 3); ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const a = -Math.PI * r(), d = 15 + r() * 70, l = 10 + r() * 28; ctx.strokeStyle = ['#FFD27A', '#FFFFFF', '#FF8A4D'][i % 3]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * d, ey + Math.sin(a) * d); ctx.lineTo(hx + Math.cos(a) * (d + l), ey + Math.sin(a) * (d + l)); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { const k = ((lt * 140 + i * 45) % 260) / 260; ctx.fillStyle = `rgba(220,228,245,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(hx + Math.sin(i * 2 + lt * 3) * 25, ey - 30 - k * 240, 18 + k * 30, 0, 7); ctx.fill(); }
  }
  pop(ctx, lt, 3.1, 800, 1520, () => { cut(ctx, circlePts(0, 0, 150, 150, 36), C.paper, { seed: 48, amp: 4 }); txt(ctx, '1–2', 0, -25, { font: 'bold 76px Round', color: C.navy }); txt(ctx, 'εργάσιμες', 0, 50, { font: '44px Hand', color: C.mid }); }, 0.12);
  caption(ctx, 'Τις χαράζουμε με laser στο εργαστήριό μας.', lt);
}
function s5(ctx, lt) {
  const snap = 0.9;
  fabric(ctx);
  const p = easeOut(prog(lt, 0.15, snap));
  const x = lerp(1500, 780, p), y = lerp(560, 1010, p), rot = lerp(0.9, 0, p);
  const sc = lt > snap ? 1 + 0.14 * Math.exp(-(lt - snap) * 7) * Math.sin((lt - snap) * 32) : 1;
  if (lt > snap) {
    const k = prog(lt, snap, snap + 0.5); ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, d1 = 230 + k * 80, d2 = d1 + 60; ctx.beginPath(); ctx.moveTo(780 + Math.cos(a) * d1, 1010 + Math.sin(a) * d1 * 0.6); ctx.lineTo(780 + Math.cos(a) * d2, 1010 + Math.sin(a) * d2 * 0.6); ctx.stroke(); }
    ctx.restore();
  }
  badge(ctx, x, y, 380, 'gold', 'ΜΑΡΙΑ', { seed: 55, rot, s: sc });
  if (lt > 1.5) {
    const k = easeOut(prog(lt, 1.5, 1.9)); ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([14, 10]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
    ctx.strokeRect(780 - 150, 1010 + 72, 300, 46); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(420, 1300); ctx.quadraticCurveTo(520, 1120, 640, 1105); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(640, 1105); ctx.lineTo(610, 1090); ctx.moveTo(640, 1105); ctx.lineTo(618, 1130); ctx.stroke(); ctx.restore();
  }
  pop(ctx, lt, 1.6, 330, 1380, () => { cut(ctx, rrPts(-260, -60, 520, 120, 40), C.paper, { seed: 56, amp: 3 }); txt(ctx, 'μαγνήτης από μέσα', 0, 2, { font: '50px Hand' }); }, -0.05);
  pop(ctx, lt, 2.1, 330, 1540, () => { cut(ctx, rrPts(-230, -60, 460, 120, 40), C.sky, { seed: 57, amp: 3 }); check(ctx, -160, 0, 1.6, C.navy); txt(ctx, 'χωρίς τρύπες', 30, 2, { font: '50px Hand' }); }, 0.04);
  burst(ctx, lt, snap + 0.03, 330, 760, 'ΚΛΙΚ!', -0.12);
  caption(ctx, 'Με μαγνήτη. Μπαίνει σε ένα δευτερόλεπτο.', lt);
}
function s6(ctx, lt) {
  receptionBG(ctx);
  person(ctx, 720, 1060, 1, { type: 'woman', seed: 100, shirt: C.navy, shirtS: '#22345F', look: -10, mood: 'happy', badge: true, blink: (lt % 2.4) > 2.25 });
  counter(ctx);
  person(ctx, 270, 1330, 1.15, { type: 'man', seed: 200, shirt: C.sky, shirtS: '#7FA0E4', look: 16, mood: 'happy' });
  pop(ctx, lt, 0.35, 300, 820, () => bubble(ctx, 0, 0, 540, 170, 10, 150, 'Ευχαριστώ, Μαρία!', '56px Hand', 320));
  for (let i = 0; i < 6; i++) {
    const st = 1.0 + i * 0.28, k = prog(lt, st, st + 1.8); if (k <= 0 || k >= 1) continue;
    const hx = 470 + (i % 3) * 110 + Math.sin(lt * 4 + i) * 20, hy = 1000 - k * 420, s = spring(prog(lt, st, st + 0.4)) * (1 - k * 0.3) * (i % 2 ? 3.2 : 2.4);
    ctx.save(); ctx.globalAlpha = 1 - easeIn(k); cut(ctx, heartPts(hx, hy, s), i % 3 === 1 ? '#FF8FA3' : C.white, { seed: 600 + i, amp: 1.5, edgeW: 5 }); ctx.restore();
  }
  caption(ctx, 'Και ο πελάτης σε φωνάζει με το όνομά σου.', lt);
}
function s7(ctx, lt) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.blue, { seed: 81, edge: false, shadow: false, scribble: '#3456B0' });
  const r = rng(99);
  for (let i = 0; i < 22; i++) {
    let x = r() * W, y = r() < 0.5 ? 40 + r() * 230 : 1720 + r() * 180; if (i % 5 === 0) { y = 300 + r() * 1400; x = r() < .5 ? 25 + r() * 30 : W - 55 + r() * 30; }
    const s = 10 + r() * 16, tw = 0.75 + 0.25 * Math.sin(lt * 5 + i);
    cut(ctx, starPts(x, y, s * tw), i % 4 ? C.white : '#F4D98A', { seed: 700 + i, amp: 1, edgeW: 3, shadow: false });
  }
  pop(ctx, lt, 0.05, 540, 200, () => txt(ctx, 'Strategix Studios', 0, 0, { font: '60px Hand', color: '#fff' }));
  cut(ctx, rectPts(70, 300, 940, 1390), C.paper, { seed: 82, amp: 7, step: 16 });
  pop(ctx, lt, 0.15, 540, 440, () => txt(ctx, 'Κονκάρδες', 0, 0, { font: 'bold 104px Round', color: C.navy }));
  pop(ctx, lt, 0.3, 540, 550, () => txt(ctx, 'προσωπικού', 0, 0, { font: '84px Hand', color: C.mid }));
  pop(ctx, lt, 0.45, 255, 880, () => badge(ctx, 0, 0, 330, 'silver', 'ΝΙΚΟΣ', { seed: 83 }), -0.14);
  pop(ctx, lt, 0.55, 825, 880, () => badge(ctx, 0, 0, 330, 'bronze', 'ΕΛΕΝΗ', { seed: 84 }), 0.14);
  pop(ctx, lt, 0.65, 540, 745, () => badge(ctx, 0, 0, 390, 'gold', 'ΜΑΡΙΑ', { seed: 85 }), -0.02);
  pop(ctx, lt, 0.9, 540, 1010, () => txt(ctx, 'από', 0, 0, { font: '62px Hand', color: C.ink }));
  pop(ctx, lt, 1.0, 540, 1115, () => txt(ctx, '10,90 €', 0, 0, { font: 'bold 150px Round', color: C.navy }), -0.02);
  [['μαγνήτης', 228], ['laser', 540], ['1–2 μέρες', 852]].forEach(([s, x], i) => pop(ctx, lt, 1.25 + i * 0.1, x, 1285, () => {
    cut(ctx, rrPts(-148, -44, 296, 88, 44), C.pale, { seed: 86 + i, amp: 2, edgeW: 6 }); check(ctx, -108, 0, 1.0, C.mid); txt(ctx, s, 24, 2, { font: '40px Hand' });
  }));
  const pulse = lt > 2.1 ? 1 + 0.04 * Math.sin((lt - 2.1) * 7) : 1;
  pop(ctx, lt, 1.6, 540, 1450, () => {
    ctx.scale(pulse, pulse); cut(ctx, rrPts(-340, -62, 680, 124, 62), C.navy, { seed: 90, amp: 2, edgeW: 8 });
    txt(ctx, 'Σχεδίασέ τες online', -30, 2, { font: 'bold 50px Round', color: '#fff' });
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(292, 0); ctx.moveTo(274, -18); ctx.lineTo(294, 0); ctx.lineTo(274, 18); ctx.stroke();
  });
  pop(ctx, lt, 1.8, 540, 1600, () => txt(ctx, 'χωρίς έξοδα σχεδίου · με ΦΠΑ', 0, 0, { font: '42px Hand', color: '#5B6784' }));
  pop(ctx, lt, 2.0, 540, 1795, () => txt(ctx, 'strategixstudios.com', 0, 0, { font: 'bold 54px Round', color: '#fff' }));
}

const SCENES = [[s1, 4.5], [s2, 4.0], [s3, 5.5], [s4, 4.0], [s5, 4.0], [s6, 3.5], [s7, 5.0]];
const STARTS = []; let acc = 0; for (const [, d] of SCENES) { STARTS.push(acc); acc += d; }
const TOTAL = acc, TR = 0.3;

// grain
const NOISE = [0, 1, 2].map(k => { const c = createCanvas(360, 640), x = c.getContext('2d'), im = x.createImageData(360, 640), r = rng(k + 5); for (let i = 0; i < im.data.length; i += 4) { const v = 205 + r() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; });

function frame(ctx, t) {
  B = Math.floor(t * 12);
  let i = STARTS.length - 1; while (i > 0 && t < STARTS[i]) i--;
  ctx.save(); SCENES[i][0](ctx, t - STARTS[i]); ctx.restore();
  // torn-paper wipe transitions
  for (let k = 1; k < STARTS.length; k++) {
    const b = STARTS[k], d = t - b; if (Math.abs(d) >= TR) continue;
    const col = k % 2 ? C.paper : C.sky;
    let top, bot; if (d < 0) { top = lerp(H + 120, -140, easeInOut(1 + d / TR)); bot = H + 200; } else { top = -200; bot = lerp(H + 120, -140, easeInOut(d / TR)); }
    if (bot > top) cut(ctx, [[-60, top], [W + 60, top], [W + 60, bot], [-60, bot]], col, { seed: 1000 + k, amp: 22, step: 26, edgeW: 14, sy: -12, scribble: col === C.sky ? '#A7C1F2' : '#E6E0D0' });
  }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.45; ctx.drawImage(NOISE[B % 3], 0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,20,0)'); g.addColorStop(1, 'rgba(0,0,20,0.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

async function main() {
  const mode = process.argv[2] || 'render';
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'preview') {
    const times = process.argv.slice(3).map(Number);
    for (const t of times) { FRAME = Math.round(t * FPS); ctx.clearRect(0, 0, W, H); frame(ctx, t); fs.writeFileSync(`prev_${t}.png`, cv.toBuffer('image/png')); }
    return;
  }
  const out = process.argv[3] || 'out.mp4', N = Math.round(TOTAL * FPS);
  const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < N; f++) {
    FRAME = f; ctx.clearRect(0, 0, W, H); frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 90 === 0) process.stdout.write(`frame ${f}/${N}\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', out, TOTAL + 's');
}
main();
