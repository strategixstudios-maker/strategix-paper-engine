// hands.js — Στράτος hand library v3 (paper cut-out). Arm-local space: wrist ≈ y244, fingers point +y (away from the elbow).
// side: +1 = arm on viewer's right, -1 = viewer's left.  See HANDS.md + `node hands.js sheet` → HANDS_SHEET.png
//
// VIEWS (what the viewer sees):
//   palm — palm towards camera: creases, NO nails, THUMB ON THE OUTER SIDE (anatomy: palm-forward ⇒ thumb lateral)
//   back — back of the hand: nails + knuckle marks, thumb on the body side
//   side — hand edge-on, palm towards the body (natural rest), thumb in front with nail
// TYPES: relaxed · open · fist · point · thumb · grip · wave · ok
// view 'auto' (default in the rig) picks the natural view from the forearm angle — see autoView().
const L = require('./lib.js');
const { cut, rrPts, circlePts } = L;
const SKIN = '#F2C29C', SKIND = '#DDA37C', NAIL = '#FBE3D4';

function finger(ctx, x, y, len, w, ang, seed, o = {}) { // extends +y from (x,y); direction after rotate = (-sin a, cos a)
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  cut(ctx, rrPts(-w / 2, 0, w, len, w / 2), SKIN, { seed, amp: 1, edgeW: 4, step: 14 });
  if (o.nail) { ctx.fillStyle = NAIL; ctx.beginPath(); ctx.ellipse(0, len - w * 0.62, w * 0.3, w * 0.4, 0, 0, 7); ctx.fill(); ctx.strokeStyle = SKIND; ctx.lineWidth = 2; ctx.stroke(); }
  if (o.joint) { ctx.strokeStyle = SKIND; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w * 0.25, len * 0.45); ctx.lineTo(w * 0.25, len * 0.45); ctx.stroke(); }
  ctx.restore();
}
const line = (ctx, pts, w = 3.5) => { ctx.save(); ctx.strokeStyle = SKIND; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); };
const palmBlock = (ctx, sd, h = 76) => cut(ctx, rrPts(-42, 244, 84, h, 26), SKIN, { seed: sd + 16, amp: 1.5, edgeW: 5 });
const sideBlock = (ctx, sd) => cut(ctx, rrPts(-26, 244, 52, 74, 24), SKIN, { seed: sd + 16, amp: 1.5, edgeW: 5 });
// 4 fingers from the thumb side: index, middle, ring, pinky. T = thumb side sign.
const FX = [24, 8, -8, -24], FLEN = [50, 58, 54, 42];
function fourFingers(ctx, T, sd, o = {}) {
  const fan = o.fan || [0.1, 0.03, -0.04, -0.12], k = o.len || 1;
  FX.forEach((fx, i) => { if (o.skip && o.skip.includes(i)) return; finger(ctx, T * fx, 304, FLEN[i] * k, 20, -T * fan[i], sd + 10 + i, { joint: o.joint ?? true, nail: o.nail }); });
}
function curled(ctx, T, sd, idx = [0, 1, 2, 3], y = 300) { // folded fingertips (palm side)
  idx.forEach(i => cut(ctx, rrPts(T * FX[i] - 10, y, 20, 32, 10), SKIN, { seed: sd + 20 + i, amp: 0.8, edgeW: 3 }));
}
function knuckles(ctx, T, idx = [0, 1, 2, 3]) { idx.forEach(i => line(ctx, [[T * FX[i] - 7, 300], [T * FX[i] + 7, 300]], 3)); }

// ---------- PALM view (thumb outer side: T = +side) ----------
function palmView(ctx, type, side, sd) {
  const T = side;
  if (type === 'open' || type === 'relaxed' || type === 'wave') {
    const fan = type === 'wave' ? [0.34, 0.11, -0.12, -0.36] : type === 'relaxed' ? [0.05, 0.0, -0.03, -0.07] : undefined;
    fourFingers(ctx, T, sd, { fan, len: type === 'relaxed' ? 0.72 : 1 });
    finger(ctx, T * 36, 256, 50, 22, -T * (type === 'wave' ? 1.25 : type === 'relaxed' ? 0.5 : 0.95), sd + 15);
    palmBlock(ctx, sd);
    line(ctx, [[-T * 34, 286], [-T * 8, 280], [T * 16, 284]]); line(ctx, [[T * 18, 258], [T * 6, 284], [T * 10, 312]]);
  } else if (type === 'ok') {
    [1, 2, 3].forEach(i => finger(ctx, T * FX[i], 304, FLEN[i], 20, -T * [0, 0.06, -0.02, -0.12][i], sd + 10 + i, { joint: true }));
    palmBlock(ctx, sd);
    finger(ctx, T * 30, 300, 30, 20, -T * 0.7, sd + 10); // index curled to the thumb
    finger(ctx, T * 40, 262, 44, 22, -T * 0.25, sd + 15);
    ctx.save(); ctx.strokeStyle = SKIND; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(T * 50, 314, 11, 0, 7); ctx.stroke(); ctx.restore();
    line(ctx, [[-T * 30, 282], [-T * 4, 278]]);
  } else if (type === 'point') {
    finger(ctx, T * 22, 298, 100, 22, 0, sd + 10, { joint: true });
    palmBlock(ctx, sd, 70); curled(ctx, T, sd, [1, 2, 3]);
    finger(ctx, T * 38, 280, 44, 22, T * 1.2, sd + 15); // thumb folded over middle fingers
  } else { // fist / grip / thumb fallback
    palmBlock(ctx, sd, 64); curled(ctx, T, sd, [0, 1, 2, 3], 294);
    finger(ctx, T * 38, 284, 50, 22, T * 1.35, sd + 15);
  }
}
// ---------- BACK view (thumb body side: T = -side) ----------
function backView(ctx, type, side, sd) {
  const T = -side;
  if (type === 'open' || type === 'relaxed' || type === 'wave') {
    const fan = type === 'wave' ? [0.34, 0.11, -0.12, -0.36] : type === 'relaxed' ? [0.05, 0.0, -0.03, -0.07] : undefined;
    fourFingers(ctx, T, sd, { fan, len: type === 'relaxed' ? 0.72 : 1, nail: true, joint: false });
    finger(ctx, T * 36, 256, 50, 22, -T * (type === 'wave' ? 1.25 : type === 'relaxed' ? 0.5 : 0.95), sd + 15, { nail: true });
    palmBlock(ctx, sd); knuckles(ctx, T);
  } else if (type === 'point') {
    finger(ctx, T * 24, 296, 104, 22, 0, sd + 10, { nail: true, joint: true });
    cut(ctx, rrPts(-42, 244, 84, 80, 28), SKIN, { seed: sd + 16, amp: 1.5, edgeW: 5 });
    [T * 2, -T * 17, -T * 34].forEach((x, i) => cut(ctx, rrPts(x - 10, 306, 20, 30, 10), SKIN, { seed: sd + 20 + i, amp: 0.8, edgeW: 3 }));
    line(ctx, [[-T * 30, 298], [-T * 22, 294]], 3); line(ctx, [[-T * 10, 298], [-T * 2, 294]], 3);
    finger(ctx, T * 40, 266, 48, 22, T * -0.3, sd + 15, { nail: true });
  } else { // fist / grip
    cut(ctx, rrPts(-44, 246, 88, 84, 30), SKIN, { seed: sd + 16, amp: 1.5, edgeW: 5 });
    [-3, -1, 1, 3].forEach((k, i) => cut(ctx, circlePts(k * 11, 322, 13, 11, 12), SKIN, { seed: sd + 20 + i, amp: 1, edgeW: 3 }));
    [-22, 0, 22].forEach(x => line(ctx, [[x, 300], [x, 316]], 3));
    finger(ctx, T * 40, 262, 44, 22, T * -0.25, sd + 15, { nail: true });
  }
}
// ---------- SIDE view (palm faces the body: B = -side; thumb in front) ----------
function sideView(ctx, type, side, sd) {
  const B = -side;
  if (type === 'thumb') { // fist edge-on, thumb along the forearm direction
    cut(ctx, rrPts(-44, 246, 88, 84, 30), SKIN, { seed: sd + 16, amp: 1.5, edgeW: 5 });
    [254, 273, 292, 311].forEach((y, i) => cut(ctx, rrPts(Math.min(-B * 46, B * 10), y, 56, 20, 10), SKIN, { seed: sd + 20 + i, amp: 0.8, edgeW: 3 }));
    finger(ctx, B * 26, 300, 84, 26, 0, sd + 15, { nail: true, joint: true });
  } else if (type === 'fist' || type === 'grip' || type === 'point') {
    if (type === 'point') finger(ctx, -B * 4, 300, 98, 22, 0, sd + 10, { nail: true, joint: true });
    cut(ctx, rrPts(-34, 246, 68, 78, 28), SKIN, { seed: sd + 16, amp: 1.5, edgeW: 5 });
    (type === 'point' ? [294, 312] : [276, 294, 312]).forEach((y, i) => cut(ctx, rrPts(B * 4 - 16 + B * 18, y, 32, 20, 10), SKIN, { seed: sd + 20 + i, amp: 0.8, edgeW: 3 }));
    finger(ctx, -B * 10, 256, type === 'grip' ? 52 : 44, 22, B * (type === 'grip' ? 0.35 : 0.6), sd + 15, { nail: true }); // thumb wrapped over the front
  } else { // relaxed / open: edge-on hand, palm towards the body
    const open = type === 'open', bend = open ? 0.05 : 0.22;
    [[2, 30, 44], [1, 22, 52]].forEach(([k, dx, len], i) => finger(ctx, B * dx * 0.6, 296, len * (open ? 1.12 : 1), 20, -B * (bend + 0.08 * k), sd + 12 + i)); // ring/middle tips peek out on the palm side
    finger(ctx, -B * 4, 296, open ? 66 : 58, 26, -B * bend, sd + 10, { joint: true }); // index (front)
    sideBlock(ctx, sd);
    finger(ctx, -B * 16, 256, open ? 50 : 46, 21, -B * (open ? 0.02 : 0.12), sd + 15, { nail: true, joint: true }); // thumb in front
    line(ctx, [[B * 20, 262], [B * 18, 300]], 3);
  }
}

const NATURAL = { relaxed: 'side', open: 'palm', fist: 'back', point: 'back', thumb: 'side', grip: 'side', wave: 'palm', ok: 'palm' };
const ONLY = { thumb: ['side'], grip: ['side', 'back', 'palm'], wave: ['palm', 'back'], ok: ['palm'] }; // allowed views per type
const wrapA = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
// forearm angle (rad) from straight down, + = outwards, - = across the body: fa = ang - elbow
function autoView(type, fa) {
  fa = wrapA(fa); const down = Math.abs(fa) < 0.75, across = fa < -0.5;
  switch (type) {
    case 'thumb': case 'grip': return 'side';
    case 'wave': case 'ok': return 'palm';
    case 'point': return down ? 'side' : 'back';
    case 'fist': return down ? 'side' : 'back';
    default: return down ? 'side' : across ? 'back' : 'palm'; // relaxed / open
  }
}
function resolveView(type, view, fa) {
  let v = !view || view === 'auto' ? autoView(type, fa) : view;
  if (ONLY[type] && !ONLY[type].includes(v)) v = ONLY[type][0];
  return v;
}
function hand(ctx, type = 'open', side = 1, sd = 1100, view) {
  const v = resolveView(type, view || NATURAL[type] || 'palm', 0);
  (v === 'palm' ? palmView : v === 'back' ? backView : sideView)(ctx, type, side, sd);
  return v;
}

// ---------- lint: anatomy / readability rules. Returns [{msg, level}] ----------
function lintArm({ side, ang, elbow = 0, type = 'open', view, hint = '' }) {
  const out = [], fa = wrapA(ang - elbow), v = resolveView(type, view, fa), deg = Math.round(fa * 57.3), who = side > 0 ? 'R' : 'L';
  if (v === 'palm' && Math.abs(fa) < 0.75 && !/shrug|stop/.test(hint)) out.push(`${who}: παλάμη προς θεατή με το χέρι κάτω (${deg}°) — αφύσικο. view:'auto' ή hint:'shrug' με λυγισμένο αγκώνα`);
  if (type === 'thumb' && Math.abs(wrapA(fa - Math.PI)) > 0.7) out.push(`${who}: thumb δεν δείχνει πάνω (forearm ${deg}°). Θέλει ang−elbow ≈ 3.0 (π.χ. ang 1.4, elbow −1.6)`);
  if (Math.abs(elbow) > 2.6) out.push(`${who}: αγκώνας ${elbow.toFixed(2)} rad — πέρα από το ανατομικό όριο (≤2.6)`);
  if (/shrug/.test(hint) && Math.abs(elbow) < 0.6) out.push(`${who}: shrug με ίσιο χέρι — λύγισε τον αγκώνα (|elbow| ≥ 0.8), πήχης μπροστά/έξω`);
  if (view && view !== 'auto' && ONLY[type] && !ONLY[type].includes(view)) out.push(`${who}: '${type}' δεν υπάρχει σε view '${view}' → ${ONLY[type][0]}`);
  return out;
}

module.exports = { SKIN, SKIND, NAIL, finger, hand, autoView, resolveView, lintArm, wrapA, NATURAL, ONLY };

// ---------- catalog: node hands.js sheet → HANDS_SHEET.png ----------
if (require.main === module) {
  const { C, txt } = L; const { stratos } = require('./stratos.js');
  const TYPES = ['relaxed', 'open', 'fist', 'point', 'thumb', 'grip', 'wave', 'ok'], VIEWS = ['palm', 'back', 'side'];
  const cw = 170, ch = 190, top = 170, W0 = 120 + cw * 6, H0 = top + ch * TYPES.length + 90 + 1700;
  const cv = L.createCanvas(W0, H0), ctx = cv.getContext('2d'); L.ST.B = 0;
  cut(ctx, L.rectPts(-40, -40, W0 + 80, H0 + 80), C.pale, { seed: 1, edge: false, shadow: false });
  txt(ctx, 'ΧΕΡΙΑ ΣΤΡΑΤΟΥ — catalog v3', W0 / 2, 50, { font: 'bold 46px Round', color: C.navy });
  txt(ctx, 'palm = παλάμη (αντίχειρας ΕΞΩ) · back = ράχη (νύχια) · side = κόψη (παλάμη προς σώμα) · γκρι = fallback', W0 / 2, 100, { font: '22px Round', color: C.navy });
  ['R: palm', 'R: back', 'R: side', 'L: palm', 'L: back', 'L: side'].forEach((l, i) => txt(ctx, l, 120 + cw * i + cw / 2, top - 30, { font: 'bold 24px Round', color: C.blue }));
  TYPES.forEach((t, r) => {
    txt(ctx, t, 60, top + r * ch + ch / 2, { font: 'bold 24px Round', color: C.navy });
    [1, -1].forEach((sd, si) => VIEWS.forEach((v, c) => {
      const x = 120 + cw * (si * 3 + c) + cw / 2, y = top + r * ch + ch / 2, rv = resolveView(t, v, 0);
      cut(ctx, L.rrPts(x - cw / 2 + 8, y - ch / 2 + 8, cw - 16, ch - 16, 16), rv === v ? '#fff' : '#E4E8F0', { seed: 5 + r * 7 + c, amp: 1, edgeW: 3, shadow: false });
      ctx.save(); ctx.translate(x, y - 290 * 0.62 + 10); ctx.scale(0.62, 0.62);
      cut(ctx, L.rrPts(-26, 170, 52, 94, 25), SKIN, { seed: 900 + r, amp: 2, edgeW: 5 }); // wrist stub
      hand(ctx, t, sd, 1200 + r * 20, v); ctx.restore();
      if (rv !== v) txt(ctx, '→ ' + rv, x, y + ch / 2 - 22, { font: '20px Round', color: '#8A94A8' });
    }));
  });
  // auto view across forearm angles
  const y0 = top + ch * TYPES.length + 60;
  txt(ctx, "view:'auto' ανά γωνία πήχη (ang − elbow) · δεξί χέρι", W0 / 2, y0, { font: 'bold 28px Round', color: C.navy });
  const ANG = [0, 0.5, 1.0, 1.6, 2.2, 2.9, -1.2, -2.6];
  const cells = [];
  [['open', 0], ['point', 2]].forEach(([t, row0]) => ANG.forEach((a, i) => cells.push([t, a, i, row0 + Math.floor(i / 4)])));
  const at = (i, row) => [150 + (i % 4) * 260, y0 + 200 + row * 410];
  for (const [t, a, i, row] of cells) { const [x, y] = at(i, row); stratos(ctx, x, y, 0.4, { legs: false, arms: [0.1, a], handR: t, armRFront: a < -0.3, eyes: 'happy', seed: 1000 }); }
  for (const [t, a, i, row] of cells) { const [x, y] = at(i, row); cut(ctx, L.rrPts(x - 120, y + 200, 240, 40, 12), '#fff', { seed: 70 + i, amp: 1, edgeW: 3, shadow: false }); txt(ctx, `${t} ${Math.round(a * 57.3)}° → ${autoView(t, a)}`, x, y + 220, { font: 'bold 22px Round', color: C.navy }); }
  require('fs').writeFileSync('HANDS_SHEET.png', cv.toBuffer('image/png')); console.log('HANDS_SHEET.png');
}
