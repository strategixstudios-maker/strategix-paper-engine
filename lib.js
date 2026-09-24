// Κονκάρδες προσωπικού — paper-cutout animation, drawn frame-by-frame in JavaScript
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
GlobalFonts.registerFromPath(__dirname + '/fonts/Mynerve-Regular.ttf', 'Hand');
GlobalFonts.registerFromPath(__dirname + '/fonts/Comfortaa.ttf', 'Round');
GlobalFonts.registerFromPath(__dirname + '/fonts/Poppins-Bold.ttf', 'Brand');

const W = 1080, H = 1920, FPS = 30;
const C = {
  navy: '#0B1B3F', blue: '#1E3A8A', mid: '#2F5FD0', sky: '#8FB0EE', pale: '#DCE7FA',
  paper: '#F7F4EC', white: '#FFFFFF', gold: '#D8A93B', silver: '#C3CAD4', bronze: '#B07A4F',
  skin: '#F0BE98', skinD: '#D99C74', cheek: '#F4A0A0', hair: '#2B1F1C', hair2: '#6B4630', ink: '#101A33',
};
const ST = { B: 0, FRAME: 0, T: 0 }; // boil index (12 fps wobble), frame index

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
  const s = (o.seed || 1) + ST.B * 7919, amp = o.amp ?? 4, step = o.step ?? 20;
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
// ---------- safe zones (IG Reels + TikTok, 1080×1920) ----------
// top 250: header/back/camera · bottom 440: username/caption/audio/CTA · sides 60 (device crop) · right icons x>920 when y>1150
const SAFE = { top: 250, bottom: 1480, left: 60, right: 1020, iconsX: 920, iconsY: 1150 };
function safeGuide(ctx) {
  ctx.save(); ctx.fillStyle = 'rgba(255,40,80,0.28)';
  ctx.fillRect(0, 0, W, SAFE.top); ctx.fillRect(0, SAFE.bottom, W, H - SAFE.bottom);
  ctx.fillRect(0, SAFE.top, SAFE.left, SAFE.bottom - SAFE.top); ctx.fillRect(SAFE.right, SAFE.top, W - SAFE.right, SAFE.bottom - SAFE.top);
  ctx.fillRect(SAFE.iconsX, SAFE.iconsY, SAFE.right - SAFE.iconsX, SAFE.bottom - SAFE.iconsY);
  ctx.strokeStyle = 'rgba(255,40,80,0.9)'; ctx.lineWidth = 4; ctx.setLineDash([16, 10]); ctx.strokeRect(SAFE.left, SAFE.top, SAFE.right - SAFE.left, SAFE.bottom - SAFE.top);
  ctx.restore();
}
// caption strip: Hand 76px, max ~2 lines (split long VO with captionSeq). Sets ST.capBottom for seriesTag.
const CAP = { font: 76, lh: 92, w: 940, y: SAFE.top + 8 };
function caption(ctx, text, lt, start = 0.15, o = {}) {
  const p = easeOut(prog(lt, start, start + 0.4)); if (p <= 0) return;
  const fs = o.fs || CAP.font, lh = Math.round(fs * 1.21);
  ctx.save(); ctx.font = `${fs}px Hand`; const lines = wrap(ctx, text, CAP.w - 90), h = lines.length * lh + 50, y = o.y ?? CAP.y;
  ctx.translate(lerp(-1150, (W - CAP.w) / 2, p), y); ctx.rotate(-0.012);
  cut(ctx, rectPts(0, 0, CAP.w, h), C.paper, { seed: 500 + lines.length, amp: 6, step: 16 });
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${fs}px Hand`;
  lines.forEach((l, i) => ctx.fillText(l, CAP.w / 2, 25 + lh / 2 + i * lh));
  ctx.restore(); ST.capBottom = y + h;
}
// timed caption chunks: seq = [[start, 'text'], ...] (lt-based). Only the first chunk slides in; later ones swap in place with a small pop.
function captionSeq(ctx, lt, seq) {
  let i = -1; for (let k = 0; k < seq.length; k++) if (lt >= seq[k][0]) i = k; if (i < 0) return;
  if (i === 0) return caption(ctx, seq[0][1], lt, seq[0][0]);
  const k = spring(prog(lt, seq[i][0], seq[i][0] + 0.35)); ctx.save(); ctx.translate(W / 2, CAP.y + 90); ctx.scale(0.94 + 0.06 * k, 0.94 + 0.06 * k); ctx.translate(-W / 2, -CAP.y - 90);
  caption(ctx, seq[i][1], lt, -1); ctx.restore();
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


// lip-sync: VO = [[start,end],...] in seconds. Returns a mouth shape for current ST.T
function lipsync(VO, rest = 'smile') { const t = ST.T; for (const [a, b] of VO) if (t >= a && t <= b) return ['A', 'E', 'O', 'A', 'E', 'closed'][Math.floor(rng(Math.floor(t * 11) * 97 + 13)() * 6)]; return rest; }
const blinkNow = () => (ST.T % 2.7) > 2.58;
module.exports={lipsync,blinkNow,createCanvas,W,H,FPS,C,ST,rng,clamp,lerp,prog,easeOut,easeIn,easeInOut,spring,rectPts,rrPts,circlePts,heartPts,starPts,tear,path,bbox,scribble,cut,txt,wrap,pop,check,logoMark,BADGE,badge,bubble,caption,captionSeq,burst,person,handPen,SAFE,CAP,safeGuide};
