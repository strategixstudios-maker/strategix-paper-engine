// ΣΤΡΑΤΟΣ — Strategix Studios mascot (paper cut-out rig)
const L = require('./lib.js');
const { C, cut, cutGroup, rectPts, rrPts, circlePts, txt, logoMark, check } = L;

const S = { // χρώματα του Στράτου (skin, beanie, tee, apron, jeans...)
  skin: '#F2C29C', skinD: '#DDA37C', hair: '#2E211C', beanie: '#E8B04A', beanieD: '#C99130',
  tee: '#FBFAF6', teeD: '#E4DED0', apron: '#0B1B3F', apronS: '#1F3266', jeans: '#3E68C9', jeansS: '#5A82DA', shoe: '#FFFFFF',
};

// mouth: smile | closed | A | E | O | shock | flat | grin
// eyes: dot | happy | shock | tired ; brows: 0 neutral, >0 raised, <0 frown
function head(ctx, x, y, s, o = {}) {
  const sd = (o.seed || 1000), look = o.look || 0;
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
  face(ctx, o);
  // moustache — the signature piece
  const m = [[-76, -118], [-60, -136], [-34, -142], [-10, -134], [0, -128], [10, -134], [34, -142], [60, -136], [76, -118], [66, -108], [40, -114], [16, -110], [0, -116], [-16, -110], [-40, -114], [-66, -108]];
  cut(ctx, m.map(([a, b]) => [a + look * .6, b]), S.hair, { seed: sd + 14, amp: 2.5, step: 12, edgeW: 6 });
  ctx.restore();
}
// φρύδια, μάτια, μάγουλα, μύτη, στόμα — κοινά σε όλους τους χαρακτήρες (crew.js) · σε συντεταγμένες κεφαλιού (κέντρο 0,-185, r ≈ 125)
// o: ό,τι δέχεται το head() + f = { hair (φρύδια), skin, skinD, lip (χρώμα γραμμής στόματος), lash (βλεφαρίδες), browY, browW }
function face(ctx, o = {}, f = {}) {
  const sd = (o.seed || 1000), look = o.look || 0, mouth = o.mouth || 'smile', eyes = o.eyes || 'dot', br = o.brows || 0;
  const hair = f.hair || S.hair, skin = f.skin || S.skin, skinD = f.skinD || S.skinD, bw = f.browW || 60;
  // brows
  for (const [bx, sg] of [[-48, -1], [48, 1]]) {
    ctx.save(); ctx.translate(bx + look * .6, (f.browY || -218) - Math.max(0, br) * 10); ctx.rotate(sg * br * 0.18);
    cut(ctx, rrPts(-bw / 2, -9, bw, 18, 9), hair, { seed: sd + 9 + sg, amp: 1.5, edge: false, shadow: false }); ctx.restore();
  }
  // eyes
  for (const ex of [-46, 46]) {
    ctx.save(); ctx.translate(ex + look, -180);
    if (eyes === 'happy') { ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 6, 15, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    else if (eyes === 'shock') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); }
    else if (eyes === 'tired') { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 2, 14, 0, 7); ctx.fill(); cut(ctx, rectPts(-20, -22, 40, 20), skin, { seed: sd + 12, amp: 1, edge: false, shadow: false }); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.stroke(); }
    else { ctx.scale(1, o.blink ? 0.12 : 1); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(5, -5, 5, 0, 7); ctx.fill(); }
    if (f.lash && eyes !== 'happy') { const sg = ex > 0 ? 1 : -1; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const k of [0, 1]) { ctx.beginPath(); ctx.moveTo(sg * (9 + k * 6), -11 + k * 5); ctx.lineTo(sg * (19 + k * 7), -19 + k * 4); ctx.stroke(); } }
    ctx.restore();
  }
  // cheeks + nose
  ctx.globalAlpha = 0.75; ctx.fillStyle = C.cheek; for (const cx of [-80, 80]) { ctx.beginPath(); ctx.arc(cx + look * .5, -128, 22, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  cut(ctx, circlePts(look * .7, -148, 24, 20, 18), skinD, { seed: sd + 13, amp: 1.5, edge: false, shadow: false });
  // mouth (under the moustache, όταν υπάρχει)
  const mx = look * .5, my = -96;
  ctx.fillStyle = '#5A1F24'; ctx.strokeStyle = f.lip || C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const oval = (w, h) => { ctx.beginPath(); ctx.ellipse(mx, my + h * .35, w, h, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#F08A94'; ctx.beginPath(); ctx.ellipse(mx, my + h * .9, w * .6, h * .35, 0, 0, 7); ctx.fill(); };
  if (mouth === 'A') oval(30, 30);
  else if (mouth === 'E') oval(38, 16);
  else if (mouth === 'O') oval(18, 22);
  else if (mouth === 'shock') oval(26, 38);
  else if (mouth === 'grin') { ctx.beginPath(); ctx.moveTo(mx - 44, my - 4); ctx.quadraticCurveTo(mx, my + 62, mx + 44, my - 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(mx - 34, my - 4, 68, 12); }
  else if (mouth === 'flat') { ctx.beginPath(); ctx.moveTo(mx - 24, my + 8); ctx.lineTo(mx + 24, my + 4); ctx.stroke(); }
  else if (mouth === 'closed') { ctx.beginPath(); ctx.moveTo(mx - 22, my + 4); ctx.quadraticCurveTo(mx, my + 14, mx + 22, my + 4); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(mx, my - 14, 34, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
}
// hands → hands.js (views palm/back/side, auto view, lint). Kept re-exported for compatibility.
const { hand, handParts, capsule, finger, resolveView, lintArm, LINE } = require('./hands.js');
// arm pivots at the shoulder; ang 0 = straight down (radians, + = outward). o.elbow bends the forearm (+ = towards the body centre)
// v4: μπράτσο + πήχης + χέρι = ΕΝΑ κομμάτι χαρτί (cutGroup): ο αγκώνας είναι λεπτή πτυχή, όχι σκαλοπάτι · SLEEVE on top (arm always comes out of the sleeve)
// o.pal (crew.js) = { shoulder (default 148), sleeve, sleeveD, long (μακρύ μανίκι: μανίκι ώμου + πήχη ένα κομμάτι, πτυχές αγκώνα, μανσέτα), cuff } — default = Στράτος (t-shirt)
function arm(ctx, side, ang, o = {}) {
  const sd = (o.seed || 1100) + (side > 0 ? 0 : 50), el = o.elbow || 0, p = o.pal || {}, E = 150, fr = side * el;
  const sleeve = p.sleeve || S.tee, sleeveD = p.sleeveD || S.teeD, type = o.hand || 'relaxed';
  const H = handParts(type, side, sd + 2, resolveView(type, o.view, ang - el));
  const c = Math.cos(fr), s = Math.sin(fr), fore = pts => pts.map(([x, y]) => [x * c - (y - E) * s, E + x * s + (y - E) * c]); // πλαίσιο πήχη → πλαίσιο μπράτσου
  const inFore = fn => { ctx.save(); ctx.translate(0, E); ctx.rotate(fr); ctx.translate(0, -E); fn(); ctx.restore(); };
  const fold = (col, w, rs) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; const a0 = side > 0 ? 1.5 : 1.1; // πτυχή στην έξω πλευρά του αγκώνα
    rs.forEach(([dy, r]) => { ctx.beginPath(); ctx.arc(-side * 4, E + dy, r, a0 * Math.PI, (a0 + 0.4) * Math.PI); ctx.stroke(); }); ctx.restore(); };
  ctx.save(); ctx.translate(side * (p.shoulder || 148), 24); ctx.rotate(-side * ang);
  if (p.long) {
    cutGroup(ctx, [[capsule(0, 14, E - 14, 34, 31), sleeve, { seed: sd + 1, amp: 2 }], [fore(capsule(0, E, 84, 31, 28)), sleeve, { seed: sd + 3, amp: 2 }]], { edgeW: 6 });
    inFore(() => {
      fold(sleeveD, 5, [[14, 22], [30, 16]]);
      cutGroup(ctx, H.pieces, { edgeW: 5, line: LINE }); H.details(ctx);
      cut(ctx, rrPts(-31, 214, 62, 34, 14), p.cuff || sleeveD, { seed: sd + 4, amp: 1.5, edgeW: 5 }); // μανσέτα: το χέρι βγαίνει από μέσα
    });
  } else {
    cutGroup(ctx, [[capsule(0, 10, E - 10, 29, 26), S.skin, { seed: sd + 1, amp: 2 }], [fore(capsule(0, E, 96, 26, 21)), S.skin, { seed: sd + 3, amp: 2 }],
      ...H.pieces.map(([q, f, oo]) => [fore(q), f, oo])], { edgeW: 6, line: LINE });
    inFore(() => { fold(LINE, 3, [[18, 22]]); H.details(ctx); });
    const cap = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; cap.push([Math.cos(a) * 50, 10 + Math.sin(a) * 34]); }
    const sl = cut(ctx, [...cap, [57, 118], [-57, 118]], sleeve, { seed: sd, amp: 2, edgeW: 6 }); // μανίκι-σωλήνας: ο θόλος ως τη γραμμή του ώμου, ανοίγει προς το στρίφωμα
    ctx.save(); L.path(ctx, sl); ctx.clip(); ctx.fillStyle = sleeveD; ctx.fillRect(-70, 102, 140, 20); ctx.restore();
  }
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
  const lean = o.lean || 0, bob = o.bob || 0, body = lean || bob; // physics (poseSpring): κορμός γέρνει γύρω από τη μέση (0, 440) · ανάσα = bob px
  if (body) { ctx.save(); ctx.translate(0, 440); ctx.rotate(lean); ctx.translate(0, bob - 440); }
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
  if (o.tilt) { ctx.save(); ctx.translate(0, -10); ctx.rotate(o.tilt); ctx.translate(0, 10); head(ctx, 0, 10, 1, o); ctx.restore(); } else head(ctx, 0, 10, 1, o);
  if (o.armRFront) arm(ctx, 1, aR, { seed: sd + 100, hand: o.handR, elbow: o.elbowR, view: o.viewR });
  if (L.ST.lint) lintStratos(ctx, o, aL, aR);
  if (body) ctx.restore();
  ctx.restore();
}
// rig-level lint (runs only when ST.lint is on: sheet / preview guide / lint mode). Pushes {msg, x, y} to ST.warn in canvas px.
// r (crew.js) = { headY (κέντρο κεφαλιού, default -175), headR (default 128), shoulder (default 148) }
function lintStratos(ctx, o, aL, aR, r = {}) {
  const m = ctx.getTransform(), P = ([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f], sc = Math.hypot(m.a, m.b);
  const head = P([0, r.headY ?? -175]), hr = (r.headR || 128) * sc, S0 = L.SAFE;
  for (const [side, ang, el, type, view, hint] of [[-1, aL, o.elbowL || 0, o.handL || 'relaxed', o.viewL, o.hintL || ''], [1, aR, o.elbowR || 0, o.handR || 'relaxed', o.viewR, o.hintR || '']]) {
    const hp = P(handPos(side, ang, 1, 0, 0, el, r.shoulder)), msgs = lintArm({ side, ang, elbow: el, type, view, hint });
    const behindHead = side < 0 || !o.armRFront;
    if (behindHead && Math.hypot(hp[0] - head[0], hp[1] - head[1]) < hr) msgs.push(`${side > 0 ? 'R' : 'L'}: χέρι κρύβεται πίσω από το κεφάλι → ${side > 0 ? 'armRFront:true' : 'άλλη γωνία'}`);
    const onCanvas = hp[0] > -40 && hp[0] < L.W + 40 && hp[1] > -40 && hp[1] < L.H + 40; // off-canvas = not visible = no safe-zone issue
    if (['point', 'thumb', 'ok', 'wave'].includes(type) && sc > 0.3 && onCanvas && (hp[0] < S0.left || hp[0] > S0.right || hp[1] < S0.top || hp[1] > S0.bottom || (hp[0] > S0.iconsX && hp[1] > S0.iconsY)))
      msgs.push(`${side > 0 ? 'R' : 'L'}: χειρονομία '${type}' εκτός safe zone`);
    for (const msg of msgs) L.ST.warn.push({ msg, x: hp[0], y: hp[1] });
  }
}
// hand centre in world coords (matches arm(): shoulder pivot, elbow at 150, hand centre ≈ 288) · sh = ώμος (crew.js: RIG[who].shoulder)
function handPos(side, ang, s, x, y, elbow = 0, sh = 148) { const th = -side * ang, te = th + side * elbow; return [x + s * (side * sh - 150 * Math.sin(th) - 138 * Math.sin(te)), y + s * (24 + 150 * Math.cos(th) + 138 * Math.cos(te))]; }
// ---------- πόζες με keyframes (ms01 → pm02) ----------
// ηρεμία: βάση για κάθε κλειδί που λείπει από μια πόζα
const REST_POSE = { aL: 0.12, aR: 0.12, eL: 0, eR: 0, brows: 0.3, look: 0 };
// POSES = [[t, { aL, aR, eL, eR, hL, hR, iL, iR, eyes, brows, look, front }], ...] → opts για stratos() τη στιγμή t. Γωνίες/φρύδια/βλέμμα: blend (blend s, default 0,28)
// από την προηγούμενη πόζα· χέρια (hL/hR), hints (iL/iR), eyes, front (armRFront) αλλάζουν στη μέση του blend. rest = βάση για ό,τι λείπει (default REST_POSE)
function poseAt(POSES, t, rest = REST_POSE, blend = 0.28) {
  let i = 0; while (i + 1 < POSES.length && t >= POSES[i + 1][0]) i++;
  const [t1, b] = POSES[i], a = i ? POSES[i - 1][1] : b, p = L.easeInOut(L.prog(t, t1, t1 + blend)), q = p < 0.5 ? a : b, m = k => L.lerp(a[k] ?? rest[k] ?? 0, b[k] ?? rest[k] ?? 0, p);
  return { arms: [m('aL'), m('aR')], elbowL: m('eL'), elbowR: m('eR'), handL: q.hL || 'relaxed', handR: q.hR || 'relaxed', hintL: q.iL, hintR: q.iR, eyes: q.eyes || 'dot', brows: m('brows'), look: m('look'), armRFront: !!q.front };
}
// πόζες με physics (ms02 →, STYLE_GUIDE §1b): ίδια POSES με το poseAt (+ κλειδιά lean, tilt), αλλά κάθε αλλαγή = spring με anticipation + overshoot,
// ο αγκώνας ακολουθεί τον ώμο με καθυστέρηση (overlapping action), ο κορμός αντιδρά στις γρήγορες κινήσεις των χεριών (lean), ανάσα σε ηρεμία (bob)
// o = { f (Hz, default 2,2), z (default 0,45), antic (default 0,08), lag (s αγκώνα, default 0,06), swap (s: αλλαγή τύπου χεριού μετά το κλειδί, default 0,12),
//       hintIn (s: το hint shrug/stop μπαίνει όταν έχει λυγίσει ο αγκώνας, default 0,32), breathe (px, default 3 · 0 = χωρίς), rest }
// → opts για stratos()/phoebus()/rena() (+ lean, bob, tilt)
function poseSpring(POSES, t, o = {}) {
  const M = require('./motion.js'), rest = o.rest || REST_POSE, val = (k, p) => p[k] ?? rest[k] ?? 0;
  const keys = k => POSES.map(([tk, p]) => [tk, val(k, p)]), ch = (k, so) => M.springKeys(keys(k), t, so);
  const arm = { f: o.f ?? 2.2, z: o.z ?? 0.45, antic: o.antic ?? 0.08 }, elb = { ...arm, delay: o.lag ?? 0.06, z: arm.z - 0.08 }, soft = { f: 2.6, z: 0.6 };
  let i = 0; while (i + 1 < POSES.length && t >= POSES[i + 1][0]) i++;
  const cur = POSES[i][1], prev = i ? POSES[i - 1][1] : cur, dt = t - POSES[i][0], q = i && dt < (o.swap ?? 0.12) ? prev : cur;
  const hint = k => (!i || cur[k] === prev[k]) ? cur[k] : cur[k] && dt >= (o.hintIn ?? 0.32) ? cur[k] : undefined; // hint μπαίνει αφού λυγίσει ο αγκώνας (lag), βγαίνει αμέσως
  const kd = POSES.map(([tk, p]) => [tk, val('aR', p) - val('aL', p)]), vd = M.deriv(tt => M.springKeys(kd, tt, arm), t);
  return { arms: [ch('aL', arm), ch('aR', arm)], elbowL: ch('eL', elb), elbowR: ch('eR', elb), handL: q.hL || 'relaxed', handR: q.hR || 'relaxed', hintL: hint('iL'), hintR: hint('iR'),
    eyes: q.eyes || 'dot', brows: ch('brows', soft), look: ch('look', soft), armRFront: !!q.front,
    lean: L.clamp(-0.008 * vd, -0.045, 0.045) + ch('lean', soft), bob: (o.breathe ?? 3) * Math.sin(Math.PI * 2 * 0.3 * t), tilt: ch('tilt', soft) };
}
module.exports = { S, head, face, arm, hand, finger, stratos, handPos, lintRig: lintStratos, REST_POSE, poseAt, poseSpring };

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
