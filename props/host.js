// props/host.js — ο Στράτος εκτός rig: χέρι που μπαίνει στο κάδρο, PiP, από πίσω
const L = require('../lib.js');
const { C, cut, rectPts, rrPts, circlePts, lipsync, blinkNow } = L;
const { S, stratos, hand } = require('../stratos.js');

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

// PiP: default θέση μέσα στο safe zone (κάτω-αριστερά, πάνω από το username) = [x, y, r]
const PIP = [200, 1325, 130];
// Στράτος talking-head picture-in-picture (lip-sync από το VO) — pip(ctx, ...PIP, VO)
function pip(ctx, x, y, r, VO, o = {}) {
  ctx.save(); ctx.translate(x, y);
  cut(ctx, circlePts(0, 0, r + 14, r + 14, 40), C.navy, { seed: 800, amp: 3 });
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); ctx.fillStyle = o.bg || C.sky; ctx.fillRect(-r, -r, r * 2, r * 2);
  stratos(ctx, 0, r * 0.95, r / 250, { mouth: lipsync(VO, o.rest || 'smile'), blink: blinkNow(), brows: o.brows ?? 0.4, eyes: o.eyes, look: o.look, legs: false, arms: [0.1, 0.1], seed: 1000 });
  ctx.restore(); ctx.restore();
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

module.exports = { reach, PIP, pip, stratosBack };
