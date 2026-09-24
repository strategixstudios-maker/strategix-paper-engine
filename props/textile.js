// props/textile.js — ρούχα & πλύση (ad_plysi): φούτερ, κάδος, πλυντήριο
const L = require('../lib.js');
const { C, ST, cut, rectPts, rrPts, circlePts, txt, rng } = L;
const { BRAND, HOOD, HOODD } = require('./core.js');
const { cafeLogo } = require('./logos.js');

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
// κάδος πλυντηρίου: φούτερ που γυρίζει + νερό + φυσαλίδες (clip στον κύκλο)
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

module.exports = { hoodie, drum, machine };
