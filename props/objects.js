// props/objects.js — μικρά αντικείμενα: κούπα, ρολόι, κουτί δώρου
const L = require('../lib.js');
const { C, cut, rectPts, rrPts, circlePts, txt } = L;
const { BRAND } = require('./core.js');

// κούπα Strategix «S» (navy) με ατμό
function mug(ctx, x, y, s = 1, lt = 0, steam = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, rrPts(-34, -70, 68, 84, 12), C.navy, { seed: 975, amp: 1.5, edgeW: 6 });
  ctx.strokeStyle = C.navy; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(38, -30, 18, -1.3, 1.3); ctx.stroke();
  txt(ctx, 'S', 0, -26, { font: '38px Brand', color: '#fff' });
  if (steam) { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const k of [-12, 12]) { ctx.beginPath(); ctx.moveTo(k, -84); ctx.quadraticCurveTo(k + 12, -104 - Math.sin(lt * 6) * 6, k, -124); ctx.stroke(); } }
  ctx.restore();
}
// ρολόι τοίχου· οι δείκτες τρέχουν με speed
function clock(ctx, x, y, r, lt, speed = 1) {
  cut(ctx, circlePts(x, y, r), '#fff', { seed: 960, amp: 2 }); ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round';
  for (const [len, sp] of [[0.68, 9], [0.47, 1.2]]) { const a = lt * sp * speed; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * r * len, y - Math.cos(a) * r * len); ctx.stroke(); } ctx.restore();
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

module.exports = { mug, clock, giftBox };
