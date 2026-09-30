// props/ui.js — γραφικά οθόνης: μηνύματα, συννεφάκια, stamps, CTA, chips, slider, κινητό
const L = require('../lib.js');
const { C, ST, W, cut, rrPts, circlePts, starPts, txt, pop, clamp, prog } = L;
const M = require('../motion.js');
const { BRAND } = require('./core.js');

// πλάτος κουτιού που χωράει το κείμενο: max(w, πλάτος κειμένου + pad) — κοινό για όλα τα κουτιά με κείμενο (msgBubble, msgOut, speech, speechOff, ctaButton)
function fitW(ctx, font, text, w, pad) { if (!text) return w; ctx.save(); ctx.font = font; const tw = ctx.measureText(text).width; ctx.restore(); return Math.max(w, tw + pad); }
function msgBubble(ctx, x, y, w, h, text, o = {}) { // incoming chat message · το πλάτος μεγαλώνει όσο χρειάζεται για να χωρέσει το κείμενο
  const font = `${o.fs || 40}px Round`; w = fitW(ctx, font, text, w, 56);
  cut(ctx, [[x + 10, y + 16], [x - 22, y + 4], [x + 18, y + 44]], '#fff', { seed: (o.seed || 1) + 1, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(x, y, w, h, 26), '#fff', { seed: o.seed || 1, amp: 2, edgeW: 6 });
  if (text) { ctx.save(); ctx.font = font; ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 28, y + h / 2 - 6); ctx.restore(); }
  txt(ctx, o.time || '21:47', x + w - 52, y + h - 20, { font: '22px Round', color: '#8A94A8' });
}
function speech(ctx, x, y, w, h, lines, o = {}) { // speech bubble with tail pointing to (tx,ty) relative · το πλάτος μεγαλώνει αν δεν χωράει κάποια γραμμή
  for (const [t, font] of lines) w = fitW(ctx, font || '64px Hand', t, w, 100);
  const [tx, ty] = o.tail || [0, h / 2 + 70];
  cut(ctx, [[x - 40, y + h / 2 - 12], [x + 30, y + h / 2 - 12], [x + tx, y + ty]], C.paper, { seed: (o.seed || 1) + 1, amp: 2 });
  cut(ctx, rrPts(x - w / 2, y - h / 2, w, h, Math.min(90, h * 0.45)), C.paper, { seed: o.seed || 1, amp: 3 });
  lines.forEach(([t, font, col], i) => txt(ctx, t, x, y + (i - (lines.length - 1) / 2) * (o.lh || 90), { font, color: col || C.navy }));
}
function stamp(ctx, lt, st, x, y, word, rot, col = BRAND, fs = 76) { // big popping label
  pop(ctx, lt, st, x, y, () => { ctx.font = `bold ${fs}px Round`; const tw = ctx.measureText(word).width + 80; cut(ctx, rrPts(-tw / 2, -fs * 0.82, tw, fs * 1.64, 22), col, { seed: 40 + word.length, amp: 3, edgeW: 9 }); txt(ctx, word, 0, 4, { font: `bold ${fs}px Round`, color: '#fff' }); }, rot);
}
// μόνο στο hook (δηλώνει το είδος του βίντεο)· αλλού μόνο μαζί με caption του hook (π.χ. στο τέλος ενός seamless loop) — αλλιώς lint
const tagMsg = cap => `seriesTag μόνο στο hook, όχι σε κάθε caption (${cap ? '«' + cap.slice(0, 18) + '…»' : 'χωρίς caption'})`;
// ίδιος έλεγχος για το παράλληλο lint (render.js): log = [[σκηνή, caption, t], ...] από όλους τους workers → [[msg, t], ...]
const seriesTagLint = log => { const c0 = new Set(log.filter(e => !e[0]).map(e => e[1])); return c0.size ? log.filter(e => e[0] && !c0.has(e[1])).map(e => [tagMsg(e[1]), e[2]]) : []; };
function seriesTag(ctx, lt, label, x, y) { // sticker on the caption's bottom-right corner (inside the safe zone) unless x,y given
  ctx.font = '40px Hand'; const tw = ctx.measureText(label).width + 56;
  x = x ?? L.SAFE.right - 40 - tw / 2; y = y ?? (ST.capBottom ? ST.capBottom + 6 : L.SAFE.top + 40);
  if (ST.lint && lt > 0) { if (ST.TAGLOG) ST.TAGLOG.push([ST.SCENE, ST.capText, ST.T]); else { const c0 = ST.CAP0 = ST.CAP0 || new Set(); if (!ST.SCENE) c0.add(ST.capText); else if (c0.size && !c0.has(ST.capText)) ST.warn.push({ msg: tagMsg(ST.capText), x, y }); } }
  pop(ctx, lt, 0, x, y, () => { cut(ctx, rrPts(-tw / 2, -38, tw, 76, 20), C.navy, { seed: 30, amp: 3 }); txt(ctx, label, 0, 2, { font: '40px Hand', color: '#fff' }); }, 0.04);
}
// αστεράκι ✨ που σκάει στο start και πάλλεται
function sparkle(ctx, x, y, s, lt, start, seed) { pop(ctx, lt, start, x, y, () => { const k = 0.8 + 0.2 * Math.sin((lt - start) * 12); cut(ctx, starPts(0, 0, 60 * s * k, 4, 0.3), '#fff', { seed, amp: 1, edgeW: 3, shadow: false }); }); }
function ctaButton(ctx, lt, st, x, y, label, o = {}) { // brand-blue pill with arrow, pulses · το πλάτος μεγαλώνει αν δεν χωράει το label
  const pulse = lt > st + 0.4 ? 1 + 0.045 * Math.sin((lt - st - 0.4) * 7) : 1, w = fitW(ctx, 'bold 52px Round', label, o.w || 640, 160);
  pop(ctx, lt, st, x, y, () => {
    ctx.scale(pulse, pulse); cut(ctx, rrPts(-w / 2, -64, w, 128, 64), o.col || BRAND, { seed: 90, amp: 2, edgeW: 8 });
    txt(ctx, label, -42, 2, { font: 'bold 52px Round', color: '#fff' });
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const ax = w / 2 - 100;
    ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax + 46, 0); ctx.moveTo(ax + 26, -20); ctx.lineTo(ax + 48, 0); ctx.lineTo(ax + 26, 20); ctx.stroke();
  });
}
// UI slider (x,y = track left-centre), returns knob position
function uiSlider(ctx, x, y, w, v, label, o = {}) {
  if (label) txt(ctx, label, x, y - 50, { font: 'bold 38px Round', color: o.labelC || '#fff', align: 'left' });
  cut(ctx, rrPts(x, y - 12, w, 24, 12), '#2A3F7A', { seed: (o.seed || 5200), amp: 1, edge: false, shadow: false });
  cut(ctx, rrPts(x, y - 12, Math.max(24, w * v), 24, 12), BRAND, { seed: (o.seed || 5200) + 1, amp: 1, edge: false, shadow: false });
  cut(ctx, circlePts(x + w * v, y, 30), C.paper, { seed: (o.seed || 5200) + 2, amp: 1.5, edgeW: 5 });
  return [x + w * v, y];
}
// outgoing chat message (brand blue, tail bottom-right). x,y = top-left · το πλάτος μεγαλώνει αν δεν χωράει το κείμενο
function msgOut(ctx, x, y, w, h, text, o = {}) {
  const font = `bold ${o.fs || 42}px Round`; w = fitW(ctx, font, text, w, 60);
  cut(ctx, [[x + w - 40, y + h - 30], [x + w + 26, y + h + 4], [x + w - 12, y + h - 50]], BRAND, { seed: (o.seed || 1) + 1, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(x, y, w, h, 26), BRAND, { seed: o.seed || 1, amp: 2, edgeW: 7 });
  if (text) txt(ctx, text, x + 30, y + h / 2 - 4, { font, color: '#fff', align: 'left' });
}

// speech bubble from an off-screen speaker. side: 1 = speaker off right, -1 = off left. Pops at st. · το πλάτος μεγαλώνει αν δεν χωράει το κείμενο
function speechOff(ctx, lt, st, side, x, y, w, h, text, o = {}) {
  const font = o.font || '64px Hand'; w = fitW(ctx, font, text, w, 100);
  pop(ctx, lt, st, x, y, () => {
    const bx = side * (w / 2 - 60);
    cut(ctx, [[bx - 34, -h / 2 + 30], [bx + 34, h / 2 - 30], [side * (W + 200), side > 0 ? 40 : 40]], C.paper, { seed: (o.seed || 1) + 1, amp: 2 });
    cut(ctx, rrPts(-w / 2, -h / 2, w, h, Math.min(80, h * 0.45)), C.paper, { seed: o.seed || 1, amp: 3 });
    txt(ctx, text, 0, 4, { font, color: o.color || C.ink });
  }, o.rot || 0);
}
// check chip: rounded paper label with a brand-blue tick circle. Pops at st.
function checkChip(ctx, lt, st, x, y, label, o = {}) {
  const fs = o.fs || 58; ctx.font = `bold ${fs}px Round`; const tw = ctx.measureText(label).width, w = tw + fs * 2.6, h = fs * 1.9;
  pop(ctx, lt, st, x, y, () => {
    cut(ctx, rrPts(-w / 2, -h / 2, w, h, h / 2), o.bg || C.paper, { seed: o.seed || 60, amp: 2, edgeW: 8 });
    const cx = -w / 2 + h / 2 + 6; cut(ctx, circlePts(cx, 0, h * 0.34), BRAND, { seed: (o.seed || 60) + 1, amp: 1, edgeW: 4, shadow: false });
    L.check(ctx, cx, 0, h / 80, '#fff');
    txt(ctx, label, cx + h * 0.45 + tw / 2, 2, { font: `bold ${fs}px Round`, color: o.color || C.navy });
  }, o.rot || 0);
}
// phoneFrame: navy κινητό, draw(c, w, h) ζωγραφίζει την οθόνη με origin πάνω-αριστερά (clipped). Επιστρέφει [sx, sy] = πάνω-αριστερά οθόνης σε canvas coords
function phoneFrame(ctx, cx, cy, w, h, draw, o = {}) {
  const seed = o.seed || 7200, sx = cx - w / 2 + 26, sy = cy - h / 2 + 30, sw = w - 52, shh = h - 60;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.translate(-cx, -cy);
  cut(ctx, rrPts(cx - w / 2, cy - h / 2, w, h, 70), C.navy, { seed, amp: 3, sx: 14, sy: 18 });
  const scr = rrPts(sx, sy, sw, shh, 46); cut(ctx, scr, '#EEF3FC', { seed: seed + 1, amp: 2, edge: false, shadow: false });
  ctx.save(); L.path(ctx, scr); ctx.clip(); ctx.translate(sx, sy); draw(ctx, sw, shh); ctx.restore();
  cut(ctx, rrPts(cx - 70, cy - h / 2 + 10, 140, 12, 6), '#1B2D62', { seed: seed + 2, amp: 0.5, edge: false, shadow: false });
  ctx.restore(); return [sx, sy];
}

// μεγάλο «?» (περιέργεια / ερώτηση του hook) σε brand blue με χάρτινη άκρη · s κλίμακα (1 ≈ 640px) (pf04 → pf05)
function qmark(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  txt(ctx, '?', 14, 18, { font: 'bold 640px Round', color: 'rgba(5,10,30,0.22)' });
  txt(ctx, '?', 0, 0, { font: 'bold 640px Round', color: BRAND, edge: 26, edgeC: '#FBFAF6' });
  ctx.restore();
}
// βήμα διαδικασίας: αριθμός σε μπλε κύκλο + λέξη, αριστερά κάτω από το caption · pop στο st · o.y (default 568 = κάτω από caption 2 γραμμών) (pf04 → pf05)
function stepChip(ctx, lt, st, n, label, o = {}) {
  ctx.font = 'bold 44px Round'; const w = ctx.measureText(label).width + 124, x = (o.x ?? 72) + w / 2, y = o.y ?? 568;
  pop(ctx, lt, st, x, y, () => {
    cut(ctx, rrPts(-w / 2, -40, w, 80, 40), C.paper, { seed: 7000 + n, amp: 2, edgeW: 7 });
    cut(ctx, circlePts(-w / 2 + 42, 0, 29, 29, 20), BRAND, { seed: 7010 + n, amp: 1, edgeW: 4, shadow: false });
    txt(ctx, String(n), -w / 2 + 42, 2, { font: 'bold 40px Round', color: '#fff' });
    txt(ctx, label, -w / 2 + 84, 2, { font: 'bold 44px Round', color: C.ink, align: 'left' });
  }, -0.03);
}

// ◀◀ rewind: navy ταμπελάκι που αναβοσβήνει όσο η ιστορία γυρίζει πίσω (t0..t1) · (x, y) πάνω δεξιά κάτω από το caption (ep02 → pf06)
function rewindTag(ctx, t, t0, t1, x = 890, y = 560) {
  const p = M.springTo(t, t0, 0, 1, { f: 3, z: 0.45 }) * (1 - clamp(prog(t, t1 - 0.15, t1 + 0.05))); if (p <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate(0.06);
  cut(ctx, rrPts(-86, -48, 172, 96, 22), C.navy, { seed: 97, amp: 2, edgeW: 8 });
  ctx.fillStyle = `rgba(255,255,255,${Math.floor(t * 4) % 2 ? 1 : 0.75})`;
  for (const dx of [-36, 6]) { ctx.beginPath(); ctx.moveTo(dx + 34, -26); ctx.lineTo(dx, 0); ctx.lineTo(dx + 34, 26); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

module.exports = { rewindTag, qmark, stepChip, msgBubble, speech, stamp, seriesTag, seriesTagLint, sparkle, ctaButton, uiSlider, msgOut, speechOff, checkChip, phoneFrame };
