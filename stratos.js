// ΣΤΡΑΤΟΣ — Strategix Studios mascot (paper cut-out rig)
const L = require('./lib.js');
const { C, cut, rectPts, rrPts, circlePts, txt, logoMark, check } = L;

const S = {
  skin: '#F2C29C', skinD: '#DDA37C', hair: '#2E211C', beanie: '#E8B04A', beanieD: '#C99130',
  tee: '#FBFAF6', teeD: '#E4DED0', apron: '#0B1B3F', apronS: '#1F3266', jeans: '#3E68C9', jeansS: '#5A82DA', shoe: '#FFFFFF',
};

// mouth: smile | closed | A | E | O | shock | flat | grin
// eyes: dot | happy | shock | tired ; brows: 0 neutral, >0 raised, <0 frown
function head(ctx, x, y, s, o = {}) {
  const sd = (o.seed || 1000), look = o.look || 0, mouth = o.mouth || 'smile', eyes = o.eyes || 'dot', br = o.brows || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // ears
  for (const ex of [-124, 124]) cut(ctx, circlePts(ex, -178, 28, 32, 16), S.skin, { seed: sd + (ex > 0 ? 1 : 2), amp: 2, edgeW: 7 });
  // head
  cut(ctx, circlePts(0, -185, 125, 128, 40), S.skin, { seed: sd + 3, amp: 3 });
  // pencil behind ear
  ctx.save(); ctx.translate(138, -226); ctx.rotate(-0.9);
  cut(ctx, [[0, 0], [16, -8], [120, -8], [120, 8], [16, 8]], '#F6D25A', { seed: sd + 4, amp: 1, edgeW: 5 });
  cut(ctx, rectPts(108, -8, 18, 16), '#F29C9C', { seed: sd + 5, amp: 1, edge: false, shadow: false });
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, -3); ctx.lineTo(7, 3); ctx.closePath(); ctx.fill(); ctx.restore();
  // beanie
  const dome = [[-136, -262]]; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; dome.push([Math.cos(a) * 136, -262 + Math.sin(a) * 108]); }
  cut(ctx, dome, S.beanie, { seed: sd + 6, amp: 3, scribble: '#F2C66E' });
  const cuff = cut(ctx, rrPts(-146, -294, 292, 54, 18), S.beanieD, { seed: sd + 7, amp: 2 });
  ctx.save(); L.path(ctx, cuff); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 5;
  for (let xx = -140; xx < 150; xx += 22) { ctx.beginPath(); ctx.moveTo(xx, -296); ctx.lineTo(xx, -236); ctx.stroke(); } ctx.restore();
  cut(ctx, rrPts(58, -286, 50, 40, 8), S.apron, { seed: sd + 8, amp: 1, edgeW: 5, shadow: false });
  txt(ctx, 'S', 83, -265, { font: '30px Brand', color: '#fff' });
  // brows
  for (const [bx, sg] of [[-48, -1], [48, 1]]) {
    ctx.save(); ctx.translate(bx + look * .6, -218 - Math.max(0, br) * 10); ctx.rotate(sg * br * 0.18);
    cut(ctx, rrPts(-30, -9, 60, 18, 9), S.hair, { seed: sd + 9 + sg, amp: 1.5, edge: false, shadow: false }); ctx.restore();
  }
  // eyes
  for (const ex of [-46, 46]) {
    ctx.save(); ctx.translate(ex + look, -180);
    if (eyes === 'happy') { ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 6, 15, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    else if (eyes === 'shock') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); }
    else if (eyes === 'tired') { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 2, 14, 0, 7); ctx.fill(); cut(ctx, rectPts(-20, -22, 40, 20), S.skin, { seed: sd + 12, amp: 1, edge: false, shadow: false }); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.stroke(); }
    else { ctx.scale(1, o.blink ? 0.12 : 1); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(5, -5, 5, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // cheeks + nose
  ctx.globalAlpha = 0.75; ctx.fillStyle = C.cheek; for (const cx of [-80, 80]) { ctx.beginPath(); ctx.arc(cx + look * .5, -128, 22, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  cut(ctx, circlePts(look * .7, -148, 24, 20, 18), S.skinD, { seed: sd + 13, amp: 1.5, edge: false, shadow: false });
  // mouth (under the moustache)
  const mx = look * .5, my = -96;
  ctx.fillStyle = '#5A1F24'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const oval = (w, h) => { ctx.beginPath(); ctx.ellipse(mx, my + h * .35, w, h, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#F08A94'; ctx.beginPath(); ctx.ellipse(mx, my + h * .9, w * .6, h * .35, 0, 0, 7); ctx.fill(); };
  if (mouth === 'A') oval(30, 30);
  else if (mouth === 'E') oval(38, 16);
  else if (mouth === 'O') oval(18, 22);
  else if (mouth === 'shock') oval(26, 38);
  else if (mouth === 'grin') { ctx.beginPath(); ctx.moveTo(mx - 44, my - 4); ctx.quadraticCurveTo(mx, my + 62, mx + 44, my - 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(mx - 34, my - 4, 68, 12); }
  else if (mouth === 'flat') { ctx.beginPath(); ctx.moveTo(mx - 24, my + 8); ctx.lineTo(mx + 24, my + 4); ctx.stroke(); }
  else if (mouth === 'closed') { ctx.beginPath(); ctx.moveTo(mx - 22, my + 4); ctx.quadraticCurveTo(mx, my + 14, mx + 22, my + 4); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(mx, my - 14, 34, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  // moustache — the signature piece
  const m = [[-76, -118], [-60, -136], [-34, -142], [-10, -134], [0, -128], [10, -134], [34, -142], [60, -136], [76, -118], [66, -108], [40, -114], [16, -110], [0, -116], [-16, -110], [-40, -114], [-66, -108]];
  cut(ctx, m.map(([a, b]) => [a + look * .6, b]), S.hair, { seed: sd + 14, amp: 2.5, step: 12, edgeW: 6 });
  ctx.restore();
}
// hands → hands.js (views palm/back/side, auto view, lint). Kept re-exported for compatibility.
const { hand, finger, resolveView, lintArm } = require('./hands.js');
// arm pivots at the shoulder; ang 0 = straight down (radians, + = outward). o.elbow bends the forearm (+ = towards the body centre)
// draw order: upper arm → forearm → hand → SLEEVE on top (arm always comes out of the sleeve)
function arm(ctx, side, ang, o = {}) {
  const sd = (o.seed || 1100) + (side > 0 ? 0 : 50), el = o.elbow || 0;
  ctx.save(); ctx.translate(side * 148, 24); ctx.rotate(-side * ang);
  cut(ctx, rrPts(-27, 30, 54, 144, 26), S.skin, { seed: sd + 1, amp: 2, edgeW: 6 });
  ctx.save(); ctx.translate(0, 150); ctx.rotate(side * el); ctx.translate(0, -150);
  cut(ctx, rrPts(-26, 126, 52, 138, 25), S.skin, { seed: sd + 3, amp: 2, edgeW: 6 });
  const type = o.hand || 'relaxed';
  hand(ctx, type, side, sd + 2, resolveView(type, o.view, ang - el));
  ctx.restore();
  const cap = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; cap.push([Math.cos(a) * 48, Math.sin(a) * 40]); }
  const sl = cut(ctx, [...cap, [58, 110], [-58, 110]], S.tee, { seed: sd, amp: 2, edgeW: 6 });
  ctx.save(); L.path(ctx, sl); ctx.clip(); ctx.fillStyle = S.teeD; ctx.fillRect(-70, 94, 140, 20); ctx.restore();
  ctx.restore();
}
// full body. y = shoulder line. arms: [leftAng, rightAng]
function stratos(ctx, x, y, s, o = {}) {
  const sd = o.seed || 1000, [aL, aR] = o.arms || [0.12, 0.12];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.legs !== false) {
    cut(ctx, [[-118, 440], [-8, 440], [-18, 830], [-112, 830]], S.jeans, { seed: sd + 20, scribble: S.jeansS });
    cut(ctx, [[8, 440], [118, 440], [112, 830], [18, 830]], S.jeans, { seed: sd + 21, scribble: S.jeansS });
    for (const [sx, k] of [[-66, 22], [66, 23]]) { cut(ctx, rrPts(sx - 72, 810, 144, 58, 28), S.shoe, { seed: sd + k, amp: 2 }); cut(ctx, rectPts(sx - 70, 850, 140, 14), C.mid, { seed: sd + k + 5, amp: 1, edge: false, shadow: false }); }
  }
  if (o.behindArms) { arm(ctx, -1, aL, { seed: sd + 100, hand: o.handL, elbow: o.elbowL, view: o.viewL }); }
  cut(ctx, rrPts(-33, -80, 66, 104, 20), S.skin, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  ctx.save(); ctx.fillStyle = 'rgba(150,80,50,0.22)'; ctx.beginPath(); ctx.ellipse(0, -36, 34, 12, 0, 0, 7); ctx.fill(); ctx.restore();
  cut(ctx, [[-116, -4], [116, -4], [150, 10], [163, 56], [165, 470], [-165, 470], [-163, 56], [-150, 10]], S.tee, { seed: sd + 25, scribble: '#E9E5DA' });
  cut(ctx, [[-42, -4], [42, -4], [0, 32]], S.skin, { seed: sd + 32, amp: 1, edge: false, shadow: false });
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = S.teeD; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-50, -6); ctx.lineTo(0, 38); ctx.lineTo(50, -6); ctx.stroke(); ctx.restore();
  // apron
  cut(ctx, [[-118, 90], [118, 90], [140, 520], [-140, 520]], S.apron, { seed: sd + 26, scribble: S.apronS });
  for (const sg of [-1, 1]) cut(ctx, [[sg * 70, 0], [sg * 104, 0], [sg * 104, 100], [sg * 76, 100]], S.apron, { seed: sd + 27 + sg, amp: 1.5, edgeW: 6 });
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 170, 40, 0, 7); ctx.stroke(); ctx.restore(); txt(ctx, 'S', 0, 172, { font: '52px Brand', color: '#fff' });
  cut(ctx, rectPts(-86, 270, 172, 110), S.apronS, { seed: sd + 30, amp: 2, edgeW: 5 });
  ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(-74, 282, 148, 86); ctx.restore();
  if (!o.behindArms) arm(ctx, -1, aL, { seed: sd + 100, hand: o.handL, elbow: o.elbowL, view: o.viewL });
  if (!o.armRFront) arm(ctx, 1, aR, { seed: sd + 100, hand: o.handR, elbow: o.elbowR, view: o.viewR });
  head(ctx, 0, 10, 1, o);
  if (o.armRFront) arm(ctx, 1, aR, { seed: sd + 100, hand: o.handR, elbow: o.elbowR, view: o.viewR });
  if (L.ST.lint) lintStratos(ctx, o, aL, aR);
  ctx.restore();
}
// rig-level lint (runs only when ST.lint is on: sheet / preview guide / lint mode). Pushes {msg, x, y} to ST.warn in canvas px.
function lintStratos(ctx, o, aL, aR) {
  const m = ctx.getTransform(), P = ([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f], sc = Math.hypot(m.a, m.b);
  const head = P([0, -175]), hr = 128 * sc, S0 = L.SAFE;
  for (const [side, ang, el, type, view, hint] of [[-1, aL, o.elbowL || 0, o.handL || 'relaxed', o.viewL, o.hintL || ''], [1, aR, o.elbowR || 0, o.handR || 'relaxed', o.viewR, o.hintR || '']]) {
    const hp = P(handPos(side, ang, 1, 0, 0, el)), msgs = lintArm({ side, ang, elbow: el, type, view, hint });
    const behindHead = side < 0 || !o.armRFront;
    if (behindHead && Math.hypot(hp[0] - head[0], hp[1] - head[1]) < hr) msgs.push(`${side > 0 ? 'R' : 'L'}: χέρι κρύβεται πίσω από το κεφάλι → ${side > 0 ? 'armRFront:true' : 'άλλη γωνία'}`);
    const onCanvas = hp[0] > -40 && hp[0] < L.W + 40 && hp[1] > -40 && hp[1] < L.H + 40; // off-canvas = not visible = no safe-zone issue
    if (['point', 'thumb', 'ok', 'wave'].includes(type) && sc > 0.3 && onCanvas && (hp[0] < S0.left || hp[0] > S0.right || hp[1] < S0.top || hp[1] > S0.bottom || (hp[0] > S0.iconsX && hp[1] > S0.iconsY)))
      msgs.push(`${side > 0 ? 'R' : 'L'}: χειρονομία '${type}' εκτός safe zone`);
    for (const msg of msgs) L.ST.warn.push({ msg, x: hp[0], y: hp[1] });
  }
}
// hand centre in world coords (matches arm(): shoulder pivot, elbow at 150, hand centre ≈ 288)
function handPos(side, ang, s, x, y, elbow = 0) { const th = -side * ang, te = th + side * elbow; return [x + s * (side * 148 - 150 * Math.sin(th) - 138 * Math.sin(te)), y + s * (24 + 150 * Math.cos(th) + 138 * Math.cos(te))]; }
module.exports = { S, head, arm, hand, finger, stratos, handPos };

// ---------- character sheet ----------
if (require.main === module) {
  const cv = L.createCanvas(1080, 1920), ctx = cv.getContext('2d'); L.ST.B = 0;
  cut(ctx, rectPts(-40, -40, 1160, 2000), C.pale, { seed: 1, edge: false, shadow: false, scribble: '#BFD0F0' });
  ctx.save(); ctx.translate(540, 130); ctx.rotate(-0.02);
  cut(ctx, rectPts(-460, -80, 920, 160), C.navy, { seed: 2, amp: 5 });
  txt(ctx, 'Γνωρίστε τον ΣΤΡΑΤΟ', 0, -12, { font: 'bold 64px Round', color: '#fff' });
  txt(ctx, 'ο μάστορας της Strategix Studios', 0, 48, { font: '40px Hand', color: C.sky });
  ctx.restore();
  // main pose
  stratos(ctx, 300, 700, 0.88, { mouth: 'grin', eyes: 'dot', brows: 0.6, arms: [0.15, 2.75], handR: 'thumb', seed: 1000 });
  ctx.save(); ctx.translate(505, 300); ctx.rotate(0.15); txt(ctx, 'Γεια!', 0, 0, { font: '64px Hand', color: C.mid, edge: 10 }); ctx.restore();
  // expression cards
  const cards = [
    ['χαρούμενος', { mouth: 'smile', eyes: 'happy', brows: 0.5 }],
    ['σοκ', { mouth: 'shock', eyes: 'shock', brows: 1.2 }],
    ['βαριέται', { mouth: 'flat', eyes: 'tired', brows: -0.3, look: 12 }],
  ];
  cards.forEach(([label, o], i) => {
    const cy = 400 + i * 390;
    ctx.save(); ctx.translate(835, cy); ctx.rotate([0.03, -0.025, 0.02][i]);
    cut(ctx, rectPts(-190, -170, 380, 340), C.paper, { seed: 40 + i, amp: 5 });
    head(ctx, 0, 110, 0.62, { ...o, seed: 1000 });
    txt(ctx, label, 0, 135, { font: '46px Hand', color: C.ink });
    ctx.restore();
  });
  // lip-sync mouth set
  ctx.save(); ctx.translate(540, 1690); cut(ctx, rectPts(-500, -190, 1000, 380), C.white, { seed: 60, amp: 5 });
  txt(ctx, 'στόματα για lip-sync', 0, -145, { font: '44px Hand', color: C.mid });
  [['κλειστό', 'closed'], ['Α', 'A'], ['Ε', 'E'], ['Ο', 'O']].forEach(([l, m], i) => {
    const x = -375 + i * 250; head(ctx, x, 70, 0.42, { mouth: m, eyes: 'dot', seed: 1000 });
    txt(ctx, l, x, 140, { font: 'bold 38px Round', color: C.ink });
  });
  ctx.restore();
  require('fs').writeFileSync('stratos_sheet.png', cv.toBuffer('image/png'));
  console.log('sheet ok');
}
