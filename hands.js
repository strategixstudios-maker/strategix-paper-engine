// hands.js — hand library v4 (paper cut-out). Hand frame = forearm frame: wrist ≈ y240, fingers point +y (away from the elbow).
// side: +1 = arm on viewer's right, -1 = viewer's left.  See HANDS.md + `node hands.js sheet` → HANDS_SHEET.png
// v4 (από εικόνα αναφοράς, er): κάθε χέρι = ΕΝΑ κομμάτι χαρτί (cutGroup: παλάμη + δάχτυλα χωρίς εσωτερικές λευκές άκρες),
// δάχτυλα κολλητά και κωνικά που χωρίζουν με λεπτές γραμμές, λεπτό περίγραμμα LINE μέσα στη λευκή άκρη. Στο rig το χέρι
// κολλάει και με τον πήχη (arm() → ένα κομμάτι από τον ώμο ως τα δάχτυλα).
//
// VIEWS (what the viewer sees):
//   palm — palm towards camera: creases, NO nails, THUMB ON THE OUTER SIDE (anatomy: palm-forward ⇒ thumb lateral)
//   back — back of the hand: nails + knuckle marks, thumb on the body side
//   side — palm towards the body (natural rest): relaxed/open = ¾ ράχη που κρέμεται (νύχια, αντίχειρας προς το σώμα) ·
//          fist/grip/point/thumb = γροθιά στο πλάι (ρολά δαχτύλων με νύχια)
// TYPES: relaxed · open · fist · point · thumb · grip · wave · ok
// view 'auto' (default in the rig) picks the natural view from the forearm angle — see autoView().
const L = require('./lib.js');
const { cut, cutGroup, rrPts, circlePts } = L;
const SKIN = '#F2C29C', SKIND = '#DDA37C', NAIL = '#FBE3D4', LINE = '#C68B66';

// ---------- γεωμετρία ----------
// κωνική κάψουλα: βάση (x, y) → άκρη προς (−sin a, cos a), ακτίνες r0 (βάση) → r1 (άκρη) · σημεία με την ίδια φορά (cutGroup)
function capsule(x, y, len, r0, r1 = r0, a = 0, n = 8) {
  const p = [];
  for (let i = 0; i <= n; i++) { const t = Math.PI * (1 + i / n); p.push([Math.cos(t) * r0, Math.sin(t) * r0]); }
  for (let i = 0; i <= n; i++) { const t = Math.PI * (i / n); p.push([Math.cos(t) * r1, len + Math.sin(t) * r1]); }
  const c = Math.cos(a), s = Math.sin(a);
  return p.map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]);
}
// ένα δάχτυλο: { pts, base, tip (κέντρο άκρης), dir, r, len, a }
function dg(x, y, len, w, a = 0, k = 0.86) {
  const r1 = w / 2 * k, dir = [-Math.sin(a), Math.cos(a)];
  return { pts: capsule(x, y, len, w / 2, r1, a), base: [x, y], tip: [x + dir[0] * len, y + dir[1] * len], dir, r: r1, len, a };
}
const P = (pts, seed) => [pts, SKIN, { seed, amp: 1.2, step: 12 }];
const at = (d, t) => [d.base[0] + d.dir[0] * t, d.base[1] + d.dir[1] * t];
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const end = (d, k = 0.55) => [d.tip[0] + d.dir[0] * d.r * k, d.tip[1] + d.dir[1] * d.r * k]; // σημείο κοντά στην άκρη (reach / props)

// ---------- λεπτομέρειες (μετά το cutGroup) ----------
const stroke = (ctx, pts, w = 3, col = LINE) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); };
const crease = (ctx, a, c, b, w = 3) => { ctx.save(); ctx.strokeStyle = LINE; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]); ctx.stroke(); ctx.restore(); };
function nail(ctx, d) { // νύχι: ανοιχτό οβάλ στην άκρη (μόνο ράχη / πλάι)
  const c = [d.tip[0] - d.dir[0] * d.r * 0.15, d.tip[1] - d.dir[1] * d.r * 0.15];
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(d.a); ctx.fillStyle = NAIL; ctx.beginPath(); ctx.ellipse(0, 0, d.r * 0.6, d.r * 0.8, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 0.45; ctx.strokeStyle = LINE; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}
function sep(ctx, A, B, t0 = 20, t1) { // γραμμή ανάμεσα σε δύο κολλητά δάχτυλα: από την άκρη της παλάμης ως την άκρη του κοντύτερου
  const m = t1 ?? Math.min(A.len, B.len); stroke(ctx, [mid(at(A, t0), at(B, t0)), mid(at(A, m), at(B, m))], 2.5);
}

// 4 δάχτυλα από την πλευρά του αντίχειρα: δείκτης, μέσος, παράμεσος, μικρός. T = πρόσημο πλευράς αντίχειρα.
const FX = [33, 11, -11, -32], FY = [304, 307, 307, 301], FL = [58, 66, 62, 48], FW = [22, 22, 22, 20];
const four = (T, fan, k = 1) => FX.map((fx, i) => dg(T * fx, FY[i], FL[i] * k, FW[i], -T * fan[i]));
const FAN = { wave: [0.38, 0.13, -0.13, -0.4], relaxed: [0.06, 0.01, -0.04, -0.09], open: [0.2, 0.06, -0.08, -0.24] };
const bumps = (xs, y, r, sd) => xs.map((x, i) => P(circlePts(x, y, r, r * 0.92, 14), sd + 20 + i)); // κόμποι / άκρες διπλωμένων δαχτύλων

// ---------- PALM view (thumb outer side: T = +side) ----------
function palmView(type, side, sd) {
  const T = side;
  if (type === 'open' || type === 'relaxed' || type === 'wave') {
    const F = four(T, FAN[type], type === 'relaxed' ? 0.78 : 1), th = dg(T * 40, 262, 54, 26, -T * (type === 'wave' ? 1.2 : type === 'relaxed' ? 0.55 : 0.95));
    return { pieces: [...F.map((d, i) => P(d.pts, sd + 10 + i)), P(th.pts, sd + 15), P(rrPts(-44, 236, 88, 88, 34), sd + 16)], tip: end(F[1]),
      details: ctx => {
        for (let i = 0; i < 3; i++) sep(ctx, F[i], F[i + 1], 20, type === 'relaxed' ? undefined : 30);
        crease(ctx, [-T * 40, 298], [-T * 10, 289], [T * 16, 300]); crease(ctx, [T * 34, 292], [T * 4, 280], [T * 6, 246]);
      } };
  }
  if (type === 'ok') {
    const F = [1, 2, 3].map(i => dg(T * FX[i], FY[i], FL[i], FW[i], -T * [0, 0.08, -0.03, -0.16][i]));
    const ix = dg(T * 30, 298, 36, 22, -T * 0.95), th = dg(T * 42, 262, 46, 25, -T * 0.42);
    return { pieces: [...F.map((d, i) => P(d.pts, sd + 11 + i)), P(ix.pts, sd + 10), P(th.pts, sd + 15), P(rrPts(-44, 236, 88, 86, 34), sd + 16)], tip: end(F[0]),
      details: ctx => {
        sep(ctx, F[0], F[1]); sep(ctx, F[1], F[2]); crease(ctx, [-T * 38, 290], [-T * 10, 280], [T * 14, 288]);
        const c = mid(ix.tip, th.tip); ctx.save(); ctx.strokeStyle = LINE; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c[0] + T * 8, c[1] + 2, 10, 0, 7); ctx.stroke(); ctx.restore();
      } };
  }
  if (type === 'point') {
    const ix = dg(T * 22, 298, 100, 22, 0), th = dg(T * 38, 280, 46, 24, T * 1.2), R = [1, 2, 3].map(i => dg(T * FX[i], 330, 30, 22, Math.PI));
    return { pieces: [P(ix.pts, sd + 10), P(rrPts(-44, 236, 88, 82, 32), sd + 16), ...R.map((d, i) => P(d.pts, sd + 20 + i)), P(th.pts, sd + 15)], tip: end(ix),
      details: ctx => { sep(ctx, R[0], R[1], 0, 26); sep(ctx, R[1], R[2], 0, 26); crease(ctx, [-T * 38, 288], [-T * 10, 280], [T * 8, 286]); } };
  }
  // fist / grip / thumb fallback
  const th = dg(T * 40, 282, 52, 24, T * 1.35), R = FX.map(x => dg(T * x * 0.95, 334, 36, 22, Math.PI));
  return { pieces: [P(rrPts(-44, 236, 88, 80, 32), sd + 16), ...R.map((d, i) => P(d.pts, sd + 20 + i)), P(th.pts, sd + 15)], tip: [0, 344],
    details: ctx => { for (let i = 0; i < 3; i++) sep(ctx, R[i], R[i + 1], 0, 30); } };
}
// ---------- BACK view (thumb body side: T = -side) ----------
function backView(type, side, sd) {
  const T = -side;
  if (type === 'open' || type === 'relaxed' || type === 'wave') {
    const F = four(T, FAN[type], type === 'relaxed' ? 0.78 : 1), th = dg(T * 40, 258, 52, 25, -T * (type === 'wave' ? 1.2 : type === 'relaxed' ? 0.5 : 0.95));
    return { pieces: [...F.map((d, i) => P(d.pts, sd + 10 + i)), P(th.pts, sd + 15), P(rrPts(-44, 236, 88, 88, 34), sd + 16)], tip: end(F[1]),
      details: ctx => { for (let i = 0; i < 3; i++) sep(ctx, F[i], F[i + 1], 20, type === 'relaxed' ? undefined : 30); [...F, th].forEach(d => nail(ctx, d)); } };
  }
  if (type === 'point') {
    const ix = dg(T * 24, 298, 104, 22, 0), th = dg(T * 40, 266, 50, 24, T * -0.3), xs = [T * 2, -T * 18, -T * 34];
    return { pieces: [P(ix.pts, sd + 10), P(rrPts(-44, 236, 88, 84, 32), sd + 16), ...bumps(xs, 322, 12, sd), P(th.pts, sd + 15)], tip: end(ix),
      details: ctx => { nail(ctx, ix); nail(ctx, th); xs.forEach(x => crease(ctx, [x - 7, 306], [x, 302], [x + 7, 306], 2.5)); stroke(ctx, [[T * 13, 310], [T * 13, 328]], 2.5); } };
  }
  // fist / grip: ράχη γροθιάς με 4 κόμπους
  const th = dg(T * 42, 262, 46, 24, T * -0.25), xs = [-33, -11, 11, 33];
  return { pieces: [P(rrPts(-46, 238, 92, 82, 32), sd + 16), ...bumps(xs, 322, 13, sd), P(th.pts, sd + 15)], tip: [0, 336],
    details: ctx => { [-22, 0, 22].forEach(x => stroke(ctx, [[x, 304], [x, 322]], 2.5)); xs.forEach(x => crease(ctx, [x - 7, 300], [x, 296], [x + 7, 300], 2.5)); nail(ctx, th); } };
}
// ---------- SIDE view (palm faces the body: B = −side = πλευρά σώματος) ----------
function sideView(type, side, sd) {
  const B = -side;
  if (type === 'thumb') { // γροθιά στο πλάι, αντίχειρας προς τα έξω από τον πήχη (+y) · ρολά δαχτύλων προς τα έξω (−B) με νύχια
    const R = [0, 1, 2, 3].map(i => dg(B * 10, 256 + i * 19, 36, 20, B * Math.PI / 2, 0.92)), th = dg(B * 24, 296, 84, 26, 0);
    return { pieces: [P(rrPts(-34, 242, 68, 86, 28), sd + 16), ...R.map((d, i) => P(d.pts, sd + 20 + i)), P(th.pts, sd + 15)], tip: end(th),
      details: ctx => { R.forEach(d => nail(ctx, d)); for (let i = 0; i < 3; i++) sep(ctx, R[i], R[i + 1], 4); nail(ctx, th); crease(ctx, [B * 14, 330], [B * 24, 326], [B * 34, 330], 2.5); } };
  }
  if (type === 'fist' || type === 'grip' || type === 'point') { // γροθιά στο πλάι: ρολά προς το σώμα (B), αντίχειρας από πάνω τους
    const ys = type === 'point' ? [294, 314] : [274, 294, 314], R = ys.map(y => dg(-B * 2, y, 40, 22, -B * Math.PI / 2, 0.92));
    const ix = type === 'point' ? dg(-B * 4, 298, 98, 22, 0) : null, th = dg(-B * 14, 260, type === 'grip' ? 46 : 42, 22, -B * (type === 'grip' ? 0.55 : 0.9));
    return { pieces: [...(ix ? [P(ix.pts, sd + 10)] : []), P(rrPts(-34, 244, 68, 80, 28), sd + 16), ...R.map((d, i) => P(d.pts, sd + 20 + i)), P(th.pts, sd + 15)], tip: ix ? end(ix) : [0, 330],
      details: ctx => { R.forEach(d => nail(ctx, d)); for (let i = 0; i < R.length - 1; i++) sep(ctx, R[i], R[i + 1], 4); nail(ctx, th); if (ix) nail(ctx, ix); } };
  }
  // relaxed / open: ¾ ράχη που κρέμεται — δάχτυλα λίγο ανοιχτά, νύχια, αντίχειρας προς το σώμα
  const open = type === 'open', k = open ? 1.12 : 1, fan = open ? 0.5 : 1;
  const F = [[24, 302, 52, 21, 0.1], [8, 305, 58, 21, 0.02], [-8, 305, 55, 21, -0.06], [-24, 300, 44, 19, -0.16]].map(([x, y, l, w, f]) => dg(B * x, y, l * k, w, -B * f * fan));
  const th = dg(B * 36, 262, open ? 50 : 46, 24, -B * 0.32);
  return { pieces: [...F.map((d, i) => P(d.pts, sd + 10 + i)), P(rrPts(-38, 238, 76, 82, 30), sd + 16), P(th.pts, sd + 15)], tip: end(F[1]),
    details: ctx => { for (let i = 0; i < 3; i++) sep(ctx, F[i], F[i + 1], 18); [...F, th].forEach(d => nail(ctx, d)); } };
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
// κομμάτια του χεριού χωρίς σχέδιο: { v, pieces (για cutGroup, στο πλαίσιο του πήχη), details(ctx), tip } — το arm() τα κολλάει με τον πήχη
function handParts(type = 'open', side = 1, sd = 1100, view) {
  const v = resolveView(type, view || NATURAL[type] || 'palm', 0);
  return { v, ...(v === 'palm' ? palmView : v === 'back' ? backView : sideView)(type, side, sd) };
}
// χέρι μόνο του (ένα κομμάτι χαρτί) · επιστρέφει την όψη
function hand(ctx, type = 'open', side = 1, sd = 1100, view) {
  const h = handParts(type, side, sd, view);
  cutGroup(ctx, h.pieces, { edgeW: 5, line: LINE }); h.details(ctx);
  return h.v;
}
// ένα δάχτυλο ως ξεχωριστό κομμάτι (παλιό API v3, για συμβατότητα)
function finger(ctx, x, y, len, w, ang, seed, o = {}) {
  const d = dg(x, y, len, w, ang); cut(ctx, d.pts, SKIN, { seed, amp: 1, edgeW: 4, step: 14 }); if (o.nail) nail(ctx, d);
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

module.exports = { SKIN, SKIND, NAIL, LINE, capsule, finger, hand, handParts, autoView, resolveView, lintArm, wrapA, NATURAL, ONLY };

// ---------- catalog: node hands.js sheet → HANDS_SHEET.png ----------
if (require.main === module) {
  const { C, txt } = L; const { stratos } = require('./stratos.js');
  const TYPES = ['relaxed', 'open', 'fist', 'point', 'thumb', 'grip', 'wave', 'ok'], VIEWS = ['palm', 'back', 'side'];
  const cw = 170, ch = 190, top = 170, W0 = 120 + cw * 6, H0 = top + ch * TYPES.length + 90 + 1700;
  const cv = L.createCanvas(W0, H0), ctx = cv.getContext('2d'); L.ST.B = 0;
  cut(ctx, L.rectPts(-40, -40, W0 + 80, H0 + 80), C.pale, { seed: 1, edge: false, shadow: false });
  txt(ctx, 'ΧΕΡΙΑ — catalog v4 (Στράτος + ομάδα)', W0 / 2, 50, { font: 'bold 46px Round', color: C.navy });
  txt(ctx, 'palm = παλάμη (αντίχειρας ΕΞΩ) · back = ράχη (νύχια) · side = παλάμη προς σώμα · γκρι = fallback', W0 / 2, 100, { font: '22px Round', color: C.navy });
  ['R: palm', 'R: back', 'R: side', 'L: palm', 'L: back', 'L: side'].forEach((l, i) => txt(ctx, l, 120 + cw * i + cw / 2, top - 30, { font: 'bold 24px Round', color: C.blue }));
  TYPES.forEach((t, r) => {
    txt(ctx, t, 60, top + r * ch + ch / 2, { font: 'bold 24px Round', color: C.navy });
    [1, -1].forEach((sd, si) => VIEWS.forEach((v, c) => {
      const x = 120 + cw * (si * 3 + c) + cw / 2, y = top + r * ch + ch / 2, rv = resolveView(t, v, 0);
      cut(ctx, L.rrPts(x - cw / 2 + 8, y - ch / 2 + 8, cw - 16, ch - 16, 16), rv === v ? '#fff' : '#E4E8F0', { seed: 5 + r * 7 + c, amp: 1, edgeW: 3, shadow: false });
      ctx.save(); ctx.translate(x, y - 290 * 0.62 + 10); ctx.scale(0.62, 0.62);
      const h = handParts(t, sd, 1200 + r * 20, v); // πήχης + χέρι = ένα κομμάτι, όπως στο rig
      cutGroup(ctx, [[capsule(0, 170, 76, 25, 21), SKIN, { seed: 900 + r, amp: 2 }], ...h.pieces], { edgeW: 5, line: LINE }); h.details(ctx); ctx.restore();
      if (rv !== v) txt(ctx, '→ ' + rv, x, y + ch / 2 - 22, { font: '20px Round', color: '#8A94A8' });
    }));
  });
  // auto view across forearm angles
  const y0 = top + ch * TYPES.length + 60;
  txt(ctx, "view:'auto' ανά γωνία πήχη (ang − elbow) · δεξί χέρι", W0 / 2, y0, { font: 'bold 28px Round', color: C.navy });
  const ANG = [0, 0.5, 1.0, 1.6, 2.2, 2.9, -1.2, -2.6];
  const cells = [];
  [['open', 0], ['point', 2]].forEach(([t, row0]) => ANG.forEach((a, i) => cells.push([t, a, i, row0 + Math.floor(i / 4)])));
  const atc = (i, row) => [150 + (i % 4) * 260, y0 + 200 + row * 410];
  for (const [t, a, i, row] of cells) { const [x, y] = atc(i, row); stratos(ctx, x, y, 0.4, { legs: false, arms: [0.1, a], handR: t, armRFront: a < -0.3, eyes: 'happy', seed: 1000 }); }
  for (const [t, a, i, row] of cells) { const [x, y] = atc(i, row); cut(ctx, L.rrPts(x - 120, y + 200, 240, 40, 12), '#fff', { seed: 70 + i, amp: 1, edgeW: 3, shadow: false }); txt(ctx, `${t} ${Math.round(a * 57.3)}° → ${autoView(t, a)}`, x, y + 220, { font: 'bold 22px Round', color: C.navy }); }
  require('fs').writeFileSync('HANDS_SHEET.png', cv.toBuffer('image/png')); console.log('HANDS_SHEET.png');
}
