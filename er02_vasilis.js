// er02 — «Το Εργαστήριο» · Ο Βασίλης (ο ανυπόμονος πελάτης) · φόρμα «το τηλεφώνημα»
// Guest ενός επεισοδίου (STYLE_GUIDE §4b): ο Βασίλης, ~48, μάστορας γυψοσανίδας, σαλοπέτα. Rig μέσα στο επεισόδιο (1η χρήση).
// `node er02_vasilis.js design` → er02_design_sheet.png (οθόνη επιλογής χαρακτήρα + 360 + λογότυπο μπλούζας)
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, lerp, prog, easeOut, easeIn, easeInOut, lipsync, snap, blinkNow } = L;
const { S, face, arm, handPos, lintRig, stratos, poseAt } = require('./stratos.js');
const { rena, phoebus, crewHandPos, mug } = require('./crew.js');
const { tshirt } = require('./props/textile.js');
const { BRAND, reception, RECEPTION, camAt, bgFlat, stamp, seriesTag } = require('./props.js');

// VO = vo/er02_vo.mp3 @ 0,2s (TTS ανά ατάκα `--each`: Στράτος + Ρένα v2 · Βασίλης = τσιρίγματα ElevenLabs SFX · take 1/2 · παύσεις → 0,3s · 1,6s κουδούνισμα) + vo/er02_vo.who.json
// (όλες οι ατάκες της Ρένας σε ένα generation έβγαζαν «Είναι κάστομ» ανάμεσα: η φωνή θυμόταν το κείμενο του voice design → --each + έλεγχος με μεταγραφή)
// Χρονισμοί φράσεων (video) · Σ = Στράτος (αφήγηση), Ρ = Ρένα, Β = Βασίλης (τηλ.):
// 0,23 Σ Αυτός είναι ο Βασίλης. (–1,30) | 2,00 Σ Προχθές παρήγγειλε τριάντα μπλούζες με το λογότυπό του. (–4,70) | ~~ κουδούνισμα ~~
// 6,30 Ρ Στράτετζιξ Στούντιος, παρακαλώ. (–7,83) | 8,13 Β «Είναι έτοιμες οι μπλούζες μου;» (–9,67) | 9,97 Ρ Τις παραγγείλατε προχθές, κύριε Βασίλη. (–11,97)
// 12,27 Β «Δύο μέρες! Δύο ολόκληρες μέρες!» (–14,00) | 14,27 Ρ Η προσφορά γράφει (15,25) επτά με δέκα εργάσιμες. (–16,23)
// 16,53 Ρ Θα γίνουν τέλειες. (17,70) Θα σας πάρω εγώ. (–18,50) | 18,77 Β «Καλά. Ευχαριστώ, κοπελιά.» (–19,90) | 20,13 Ρ Μην γίνεις σαν τον κύριο Βασίλη. (–21,80)

// ---------- ΒΑΣΙΛΗΣ ----------
const V = {
  hair: '#A7A29B', hairD: '#7D7872', beard: '#B3AEA6', beardD: '#8E8982',
  tee: '#24272D', teeD: '#15171B', ov: '#7F8FA6', ovD: '#65758C', ovS: '#95A3B8', plaster: '#F3F0E8',
  boot: '#7A5232', bootD: '#553820', buckle: '#D6DBE1', yel: '#FFC20E', steel: '#B7C0CB', steelL: '#DEE4EA', wood: '#B8763E',
};
const VRIG = { headY: -180, headR: 130, shoulder: 148 };
const VPAL = { shoulder: 148, sleeve: V.tee, sleeveD: V.teeD };
// λεκέδες γύψου στη σαλοπέτα (σταθεροί)
const SPLOTS = [[-60, 200, 16], [48, 262, 11], [-120, 420, 20], [96, 560, 14], [-70, 700, 18], [60, 760, 10], [130, 380, 9]];
const splots = (ctx, sd, list = SPLOTS) => list.forEach(([x, y, r], i) => cut(ctx, circlePts(x, y, r, r * 0.8, 12), V.plaster, { seed: sd + 300 + i, amp: r * 0.25, edge: false, shadow: false }));

// μυστρί γυψοσανίδας (ορθογώνια λάμα + λαβή) · (x, y) = κέντρο λαβής (στη γροθιά) · rot
function trowel(ctx, x, y, s = 1, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, rrPts(-150, 34, 300, 108, 14), V.steel, { seed: 4401, amp: 1.5, edgeW: 6 });
  ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = V.steelL; ctx.beginPath(); ctx.moveTo(-130, 48); ctx.lineTo(-40, 48); ctx.lineTo(-90, 128); ctx.lineTo(-138, 128); ctx.fill(); ctx.restore();
  if (o.plaster !== false) cut(ctx, [[40, 100], [120, 92], [138, 130], [30, 136]], V.plaster, { seed: 4402, amp: 4, edge: false, shadow: false });
  cut(ctx, rectPts(-10, 8, 20, 32), '#8A939E', { seed: 4403, amp: 1, edgeW: 4 });
  cut(ctx, rrPts(-86, -26, 172, 40, 20), V.wood, { seed: 4404, amp: 1.5, edgeW: 5 });
  ctx.restore();
}

function vasilisHead(ctx, x, y, s, o = {}) {
  const sd = o.seed || 4000;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const ex of [-126, 126]) cut(ctx, circlePts(ex, -176, 28, 33, 16), S.skin, { seed: sd + (ex > 0 ? 1 : 2), amp: 2, edgeW: 7 });
  // γκρίζα μαλλιά στα πλάγια (φαλάκρα πάνω)
  for (const sg of [-1, 1]) cut(ctx, [[sg * 96, -268], [sg * 136, -236], [sg * 142, -176], [sg * 128, -138], [sg * 112, -176], [sg * 106, -236]], V.hair, { seed: sd + 3 + sg, amp: 3, edgeW: 6, scribble: V.hairD });
  cut(ctx, circlePts(0, -180, 128, 130, 40), S.skin, { seed: sd + 5, amp: 3 });
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-34, -276, 44, 16, -0.25, 0, 7); ctx.fill(); ctx.restore(); // γυαλάδα φαλάκρας
  // κοντό γκρίζο γένι (κάτω μισό του προσώπου) → το στόμα του face() από πάνω
  const bd = []; for (let i = 0; i <= 18; i++) { const a = 0.06 * Math.PI + i / 18 * 0.88 * Math.PI; bd.push([Math.cos(a) * 132, -180 + Math.sin(a) * 134]); }
  bd.push([-96, -132], [-60, -118], [-30, -126], [0, -120], [30, -126], [60, -118], [96, -132]);
  cut(ctx, bd, V.beard, { seed: sd + 6, amp: 3, edge: false, shadow: false, scribble: V.beardD });
  face(ctx, { ...o, seed: sd }, { hair: V.hairD, browW: 74, browY: -214 });
  ctx.restore();
}

// Βασίλης ολόσωμος (μπροστά) · y = γραμμή ώμων · opts όπως stratos() + trowel: true (μυστρί στο δεξί χέρι του θεατή)
function vasilis(ctx, x, y, s, o = {}) {
  const sd = o.seed || 4000, [aL, aR] = o.arms || [0.12, 0.12];
  const ao = side => ({ seed: sd + 100, hand: side > 0 ? o.handR : o.handL, elbow: side > 0 ? o.elbowR : o.elbowL, view: side > 0 ? o.viewR : o.viewL, pal: VPAL });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.legs !== false) {
    for (const [sg, k] of [[-1, 30], [1, 31]]) {
      cut(ctx, [[sg * 4, 440], [sg * 176, 440], [sg * 150, 820], [sg * 24, 820]], V.ov, { seed: sd + k, scribble: V.ovS });
      const bx = sg * 84; cut(ctx, rrPts(bx - 82, 800, 164, 74, 26), V.boot, { seed: sd + k + 4, amp: 2 });
      cut(ctx, rectPts(bx - 80, 854, 160, 20), V.bootD, { seed: sd + k + 6, amp: 1, edge: false, shadow: false });
    }
    splots(ctx, sd, SPLOTS.filter(([, y]) => y > 600));
  }
  if (o.behindArms) arm(ctx, -1, aL, ao(-1));
  cut(ctx, rrPts(-34, -80, 68, 104, 20), S.skin, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  ctx.save(); ctx.fillStyle = 'rgba(150,80,50,0.22)'; ctx.beginPath(); ctx.ellipse(0, -36, 34, 12, 0, 0, 7); ctx.fill(); ctx.restore();
  // μαύρο t-shirt με κοιλιά
  const body = cut(ctx, [[-118, -4], [118, -4], [150, 10], [166, 56], [184, 300], [178, 470], [-178, 470], [-184, 300], [-166, 56], [-150, 10]], V.tee, { seed: sd + 25, scribble: '#33373E' });
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = V.teeD; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-52, -6); ctx.quadraticCurveTo(0, 44, 52, -6); ctx.stroke(); ctx.restore();
  cut(ctx, [[-44, -4], [44, -4], [0, 30]], S.skin, { seed: sd + 32, amp: 1, edge: false, shadow: false });
  // σαλοπέτα: παντελόνι ως τη μέση + μπούστος + τιράντες με αγκράφες
  cut(ctx, [[-186, 300], [186, 300], [180, 470], [-180, 470]], V.ov, { seed: sd + 26, scribble: V.ovS });
  cut(ctx, [[-96, 104], [96, 104], [104, 316], [-104, 316]], V.ov, { seed: sd + 27, scribble: V.ovS });
  for (const sg of [-1, 1]) {
    cut(ctx, [[sg * 66, 112], [sg * 96, 112], [sg * 118, -6], [sg * 90, -6]], V.ovD, { seed: sd + 28 + sg, amp: 1.5, edgeW: 5 });
    cut(ctx, circlePts(sg * 80, 118, 13, 13, 12), V.buckle, { seed: sd + 33 + sg, amp: 1, edgeW: 4 });
  }
  const pk = cut(ctx, rectPts(-62, 160, 124, 96), V.ovD, { seed: sd + 36, amp: 2, edgeW: 5 });
  ctx.save(); ctx.setLineDash([9, 7]); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.strokeRect(-52, 170, 104, 76); ctx.restore();
  // μέτρο στην τσέπη (κίτρινο)
  cut(ctx, rrPts(8, 138, 62, 62, 14), V.yel, { seed: sd + 37, amp: 1.5, edgeW: 5 });
  ctx.fillStyle = V.teeD; ctx.beginPath(); ctx.arc(39, 169, 12, 0, 7); ctx.fill();
  splots(ctx, sd, SPLOTS.filter(([, y]) => y <= 600));
  if (!o.behindArms) arm(ctx, -1, aL, ao(-1));
  if (!o.armRFront) arm(ctx, 1, aR, ao(1));
  vasilisHead(ctx, 0, 10, 1, o);
  if (o.armRFront) arm(ctx, 1, aR, ao(1));
  if (L.ST.lint) lintRig(ctx, o, aL, aR, VRIG);
  ctx.restore();
  if (o.trowel) { const [hx, hy] = handPos(1, aR, s, x, y, o.elbowR || 0); trowel(ctx, hx, hy, s * 0.9, o.trowelRot ?? -0.5); }
  return body;
}

// Βασίλης από πίσω (για το 360) · τιράντες Χ, πίσω τσέπες, γκρίζο «πέταλο» μαλλιών · το μυστρί στο χέρι αριστερά του θεατή
function vasilisBack(ctx, x, y, s, o = {}) {
  const sd = o.seed || 4000, [aL, aR] = o.arms || [0.12, 0.12];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [sg, k] of [[-1, 30], [1, 31]]) {
    cut(ctx, [[sg * 4, 440], [sg * 176, 440], [sg * 150, 820], [sg * 24, 820]], V.ov, { seed: sd + k, scribble: V.ovS });
    const bx = sg * 84; cut(ctx, rrPts(bx - 82, 800, 164, 74, 26), V.boot, { seed: sd + k + 4, amp: 2 });
  }
  cut(ctx, rrPts(-36, -80, 72, 104, 20), S.skinD, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  cut(ctx, [[-118, -4], [118, -4], [150, 10], [166, 56], [184, 300], [178, 470], [-178, 470], [-184, 300], [-166, 56], [-150, 10]], V.tee, { seed: sd + 40, scribble: '#33373E' });
  cut(ctx, [[-186, 300], [186, 300], [180, 470], [-180, 470]], V.ov, { seed: sd + 41, scribble: V.ovS });
  for (const sg of [-1, 1]) {
    const pk = cut(ctx, rectPts(sg > 0 ? 40 : -150, 360, 110, 96), V.ovD, { seed: sd + 42 + sg, amp: 2, edgeW: 5 });
    cut(ctx, [[sg * 104, -6], [sg * 132, -6], [-sg * 56, 306], [-sg * 88, 306]], V.ovD, { seed: sd + 45 + sg, amp: 1.5, edgeW: 5 });
  }
  cut(ctx, rrPts(-26, 118, 52, 40, 10), V.buckle, { seed: sd + 48, amp: 1, edgeW: 4 }); // σταυρός τιραντών
  splots(ctx, sd + 50, [[80, 400, 14], [-110, 600, 18], [70, 720, 12]]);
  arm(ctx, -1, aL, { seed: sd + 100, hand: o.handL, elbow: o.elbowL, view: 'back', pal: VPAL });
  arm(ctx, 1, aR, { seed: sd + 100, hand: o.handR, elbow: o.elbowR, view: 'back', pal: VPAL });
  // κεφάλι από πίσω
  cut(ctx, circlePts(0, -180, 128, 130, 40), S.skin, { seed: sd + 53, amp: 3 });
  const hs = [[134, -196], [136, -150], [118, -104], [80, -76], [40, -66], [0, -62], [-40, -66], [-80, -76], [-118, -104], [-136, -150], [-134, -196]]; // ως τον αυχένα
  for (let i = 0; i <= 12; i++) { const t = i / 12, xx = -128 + t * 256; hs.push([xx, -206 + Math.abs(xx) * 0.12 - (i % 2 ? 16 : 0)]); }
  cut(ctx, hs, V.hairD, { seed: sd + 54, amp: 3, edgeW: 6, scribble: V.hair });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let xx = -104; xx <= 104; xx += 16) { const y0 = -190 + Math.abs(xx) * 0.1; ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx * 0.9, y0 + 26); ctx.stroke(); } ctx.restore();
  for (const ex of [-126, 126]) cut(ctx, circlePts(ex, -176, 28, 33, 16), S.skin, { seed: sd + 51 + (ex > 0 ? 1 : 0), amp: 2, edgeW: 7 }); // αυτιά πάνω από τα μαλλιά
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(30, -272, 44, 16, 0.25, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
  if (o.trowel) { const [hx, hy] = handPos(-1, aL, s, x, y, o.elbowL || 0); trowel(ctx, hx, hy, s * 0.9, 0.5); }
}

// 360 σε paper cut-out: χάρτινη φιγούρα σε βάση που γυρίζει · θ (rad) 0 = μπροστά, π = πλάτη · στενεύει ως την κόψη του χαρτιού
// yF = πατούσες (βάση) · o = opts του vasilis() για μπροστά (η πλάτη καθρεφτίζει τα χέρια)
function turntable(ctx, x, yF, s, th, o = {}) {
  const c = Math.cos(th), k = Math.abs(c), y = yF - 874 * s;
  // βάση: χάρτινος δίσκος με σημάδια που γυρίζουν
  cut(ctx, circlePts(x, yF + 6, 250 * s / 0.62, 58 * s / 0.62, 40), C.mid, { seed: 4501, amp: 3 });
  ctx.save(); ctx.fillStyle = C.sky; for (let i = 0; i < 12; i++) { const a = th + i * Math.PI / 6, sx = Math.sin(a); if (Math.cos(a) < 0) continue; ctx.globalAlpha = 0.25 + 0.6 * Math.cos(a); ctx.beginPath(); ctx.ellipse(x + sx * 210 * s / 0.62, yF + 6 + Math.cos(a) * 30 * s / 0.62, 10, 5, 0, 0, 7); ctx.fill(); } ctx.restore();
  ctx.save(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.035), 1); ctx.translate(-x, 0);
  if (k < 0.06) { // κόψη: λεπτή λωρίδα χαρτιού
    cut(ctx, rrPts(x - 60, y - 330 * s, 120, 1204 * s, 40), C.paper, { seed: 4502, amp: 2, edgeW: 4 });
  } else if (c > 0) vasilis(ctx, x, y, s, o);
  else vasilisBack(ctx, x, y, s, { ...o, arms: [(o.arms || [0.12, 0.12])[1], (o.arms || [0.12, 0.12])[0]], elbowL: o.elbowR, elbowR: o.elbowL, handL: o.handR, handR: o.handL });
  ctx.restore();
}

// ---------- οθόνη επιλογής χαρακτήρα (hook + loop) ----------
const STATS = [['ΜΥΣΤΡΙ', 10], ['ΓΥΨΟΣΑΝΙΔΑ', 10], ['ΥΠΟΜΟΝΗ', 1]];
// lt = τοπικός χρόνος · th = γωνία 360 · o.statsAt = πότε γεμίζουν οι μπάρες (lt) · o.pose = opts Βασίλη
function selectScreen(ctx, lt, th, o = {}) {
  cut(ctx, rectPts(-40, -40, 1160, 2000), C.navy, { seed: 4600, edge: false, shadow: false, scribble: '#13254F' });
  // spotlight
  ctx.save(); const g = ctx.createRadialGradient(540, 860, 60, 540, 860, 560); g.addColorStop(0, 'rgba(143,176,238,0.55)'); g.addColorStop(1, 'rgba(143,176,238,0)'); ctx.fillStyle = g; ctx.fillRect(0, 200, 1080, 1100); ctx.restore();
  // βελάκια ◀ ▶
  const pu = 1 + 0.08 * Math.sin(lt * 6);
  for (const sg of [-1, 1]) cut(ctx, [[540 + sg * 400, 880 - 50 * pu], [540 + sg * (400 + 70 * pu), 880], [540 + sg * 400, 880 + 50 * pu]], C.paper, { seed: 4601 + sg, amp: 2 });
  turntable(ctx, 540, 1172, 0.55, th, { arms: [0.12, 1.0], elbowR: -1.2, handR: 'grip', trowel: true, mouth: 'smile', eyes: 'dot', brows: 0.3, blink: L.blinkNow(), ...o.pose });
  // P1 δείκτης πάνω από το κεφάλι
  const by = 470 + 8 * Math.sin(lt * 5);
  cut(ctx, [[500, by - 50], [580, by - 50], [580, by], [540, by + 34], [500, by]], V.yel, { seed: 4603, amp: 2, edgeW: 6 });
  txt(ctx, 'P1', 540, by - 22, { font: 'bold 38px Round', color: C.ink });
  // κάρτα στατιστικών
  ctx.save(); ctx.translate(500, 1344); ctx.rotate(-0.012);
  cut(ctx, rectPts(-410, -124, 820, 250), C.paper, { seed: 4604, amp: 4 });
  txt(ctx, 'ΒΑΣΙΛΗΣ', -392, -84, { font: 'bold 54px Round', color: C.ink, align: 'left' });
  txt(ctx, 'μάστορας γυψοσανίδας', 390, -82, { font: '36px Hand', color: C.mid, align: 'right' });
  STATS.forEach(([nm, v], i) => {
    const ry = -22 + i * 58, fo = i === 2 ? (o.focus || 0) : 0;
    ctx.save(); if (fo > 0) { ctx.translate((o.shake || 0) + 14 * fo, ry); ctx.scale(1 + 0.1 * fo, 1 + 0.1 * fo); ctx.translate(0, -ry);
      ctx.fillStyle = `rgba(224,69,58,${0.18 * fo})`; ctx.beginPath(); ctx.roundRect(-404, ry - 30, 808, 60, 12); ctx.fill(); ctx.strokeStyle = `rgba(224,69,58,${fo})`; ctx.lineWidth = 5; ctx.stroke(); } fill = o.statsAt === undefined ? 1 : L.clamp((lt - o.statsAt - i * 0.18) / 0.35);
    txt(ctx, nm, -392, ry + 4, { font: 'bold 34px Round', color: C.ink, align: 'left' });
    for (let j = 0; j < 10; j++) {
      const on = j < Math.round(v * fill), low = v <= 2, blink = low && Math.floor(lt * 4) % 2 === 0;
      ctx.fillStyle = !on ? 'rgba(16,26,51,0.12)' : low ? (blink ? '#E0453A' : '#B8322A') : C.brand || '#2854F3';
      ctx.beginPath(); ctx.roundRect(-40 + j * 42, ry - 20, 36, 40, 7); ctx.fill();
    }
    if (v <= 2 && fill >= 1) txt(ctx, '!', 392, ry + 4, { font: 'bold 44px Round', color: '#E0453A', align: 'right' });
    ctx.restore();
  });
  ctx.restore();
}

// ---------- λογότυπο στην πλάτη της μπλούζας (δίχρωμο: κίτρινο + λευκό) ----------
// (x, y) = κέντρο · πλάτος ~420 · o.yel / o.white = 0…1 (τύπωμα ανά χρώμα: κίτρινο = όνομα + λάμα, λευκό = «ΓΥΨΟΣΑΝΙΔΕΣ» + λαβή)
function vasLogo(ctx, x, y, s = 1, o = {}) {
  const ay = o.yel ?? 1, aw = o.white ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (aw > 0) { ctx.save(); ctx.globalAlpha = aw; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-5, -150, 10, 22); ctx.beginPath(); ctx.roundRect(-52, -172, 104, 26, 13); ctx.fill(); txt(ctx, 'ΓΥΨΟΣΑΝΙΔΕΣ', 0, 84, { font: 'bold 44px Round', color: '#FFFFFF' }); ctx.restore(); }
  if (ay > 0) {
    ctx.save(); ctx.globalAlpha = ay; ctx.fillStyle = V.yel;
    ctx.beginPath(); ctx.roundRect(-96, -130, 192, 58, 8); ctx.fill();
    txt(ctx, 'Ο ΒΑΣΙΛΗΣ', 0, -8, { font: 'bold 84px Round', color: V.yel });
    ctx.fillRect(-200, 40, 400, 8); ctx.fillRect(-200, 120, 400, 8);
    ctx.restore();
  }
  ctx.restore();
}

module.exports = { V, vasilis, vasilisBack, vasilisHead, turntable, trowel, selectScreen, vasLogo };

if (process.argv[2] === 'design') {
  const cv = L.createCanvas(1080, 1920), ctx = cv.getContext('2d'); L.ST.B = 0;
  selectScreen(ctx, 1.2, 0);
  L.caption(ctx, 'Αυτός είναι ο Βασίλης.', 1, -1);
  require('fs').writeFileSync('er02_design_sheet.png', cv.toBuffer('image/png'));
  // 360: 6 γωνίες + μπλούζα
  const cv2 = L.createCanvas(2400, 1500), c2 = cv2.getContext('2d');
  cut(c2, rectPts(-40, -40, 2480, 1580), C.pale, { seed: 1, edge: false, shadow: false, scribble: '#BFD0F0' });
  [0, 0.9, 1.52, 2.2, Math.PI, 5.4].forEach((th, i) => turntable(c2, 200 + i * 400, 900, 0.5, th, { arms: [0.12, 1.0], elbowR: -1.2, handR: 'grip', trowel: true }));
  vasilisHead(c2, 300, 1380, 0.7, { mouth: 'O', eyes: 'shock', brows: 1.1 });
  tshirt(c2, 1500, 1170, 0.6, 0, { color: V.tee, back: true, rib: V.teeD, scrib: '#33373E' });
  vasLogo(c2, 1500, 1150, 0.52);
  require('fs').writeFileSync('er02_design2_sheet.png', cv2.toBuffer('image/png'));
  console.log('er02_design_sheet.png · er02_design2_sheet.png');
} else {

// ================= ΕΠΕΙΣΟΔΙΟ =================
const T = { v1: 0.23, v2: 2.0, tria: 2.9, logo: 3.65, r1: 6.3, b1: 8.13, b1e: 9.67, r2: 9.97, b2: 12.27, b2e: 14.0, prosf: 14.27, epta: 15.25, r4: 16.53, r4b: 17.7, b3: 18.77, b3e: 19.9, hang: 19.95, punch: 20.13, voEnd: 21.8 };
const CUT = { TEE: 1.9, RING: 4.95, CALL: 6.2, WS: 16.45, BACK: 18.64, TAG: 22.3, ZOOM: 24.1, END: 25.28 };
const PUNCH = 1.1, PHCLOSE = CUT.RING + 0.62, LOOK = T.b2 + 0.6; // hook: zoom στο «ΥΠΟΜΟΝΗ 1» · κοντινό κινητού ως · βλέμμα Ρένας στην κάμερα
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV) + ποιος μιλάει (ST.VOWHO)
const TAG = 'Το Εργαστήριο', HOOK = 'Αυτός είναι ο Βασίλης.';
const [DX, DY, DS] = RECEPTION.desk, RY = DY + 14 * DS;
const CAM = { med: [DX - 20, DY + 10, 1.75], call: [DX, DY + 60, 2.2], angry: [DX - 14, DY + 30, 2.7], look: [DX + 4, DY - 30, 3.4], punch: [DX, DY - 5, 3.1], ws: [785, 870, 2.1] };
const PHONE = { x: 452, y: 975, w: 45, h: 80 }; // κινητό σε βάση πάνω στον πάγκο · οθόνη 9:16 (για το zoom του loop)
const THK = 2 * Math.PI; // μία στροφή 360

// ---------- κινητό της Ρένας (1η χρήση): εισερχόμενη κλήση «ΒΑΣΙΛΗΣ» · o.shake = τρέμει · o.sel = 0…1 η οθόνη γίνεται η επιλογή χαρακτήρα ----------
function callScreen(ctx, w, h, lt, missed = 7) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, w, h);
  const k = w / 1080; ctx.save(); ctx.scale(k, k);
  const pr = 1 + 0.06 * Math.sin(lt * 14);
  ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = C.sky; ctx.lineWidth = 14; for (const r of [300, 380]) { ctx.beginPath(); ctx.arc(540, 700, r * pr, 0, 7); ctx.stroke(); } ctx.restore();
  ctx.fillStyle = C.mid; ctx.beginPath(); ctx.arc(540, 700, 250, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(540, 700, 250, 0, 7); ctx.clip(); vasilisHead(ctx, 540, 920, 1.25, { mouth: 'O', eyes: 'dot', brows: 0.9 }); ctx.restore();
  txt(ctx, 'ΒΑΣΙΛΗΣ', 540, 1110, { font: 'bold 120px Round', color: '#fff' });
  txt(ctx, 'εισερχόμενη κλήση…', 540, 1230, { font: '72px Hand', color: C.sky });
  cut(ctx, rrPts(250, 1300, 580, 110, 55), '#E0453A', { seed: 5150, amp: 2, edgeW: 6 });
  txt(ctx, `${missed} αναπάντητες`, 540, 1357, { font: 'bold 64px Round', color: '#fff' });
  for (const [x, col] of [[300, '#E0453A'], [780, '#2FB36B']]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, 1600, 110, 0, 7); ctx.fill(); }
  ctx.restore();
}
function phone(ctx, lt, o = {}) {
  const { x, y, w, h } = PHONE, jx = o.shake ? Math.sin(lt * 90) * 2.2 : 0, sx = x - w / 2 + jx, sy = y - h;
  ctx.save();
  cut(ctx, [[x - 16, y + 6], [x + 16, y + 6], [x + 10, y - 10], [x - 10, y - 10]], '#1C2E66', { seed: 5101, amp: 0.4, edgeW: 2, sx: 2, sy: 3 }); // βάση
  cut(ctx, rrPts(sx - 3, sy - 4, w + 6, h + 8, 7), C.navy, { seed: 5102, amp: 0.4, edgeW: 2, sx: 2, sy: 3 });
  ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, w, h, 5); ctx.clip(); ctx.translate(sx, sy);
  callScreen(ctx, w, h, lt, o.missed ?? 7);
  if (o.sel > 0) { ctx.globalAlpha = o.sel; const k = w / W; ctx.scale(k, k); selectScreen(ctx, 0, 0, SEL); }
  ctx.restore(); ctx.restore();
}
const SEL = { pose: { blink: false } };

// ---------- συννεφάκι τσιριγμάτων από το ακουστικό + υπότιτλος Βασίλη (κίτρινο σε μαύρη λωρίδα, κάτω) ----------
function squeak(ctx, lt, st, en, size = 1, calm = false) {
  if (lt < st || lt > en + 0.15) return;
  const k = easeOut(prog(lt, st, st + 0.15)) * (1 - easeIn(prog(lt, en, en + 0.15))), wob = 1 + 0.07 * Math.sin(lt * (calm ? 9 : 26));
  ctx.save(); ctx.translate(190, 800); ctx.scale(k * size * wob, k * size * wob); ctx.rotate(-0.08);
  cut(ctx, L.starPts(0, 0, 150, calm ? 9 : 14, calm ? 0.8 : 0.66), V.yel, { seed: 5200 + Math.floor(lt * 12) % 3, amp: 3, edgeW: 7 });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const yy of [-34, 0, 34]) { ctx.beginPath(); for (let i = 0; i <= 8; i++) { const xx = -78 + i * 19.5, a = (i % 2 ? 1 : -1) * (calm ? 6 : 13) * Math.sin(lt * 30 + yy); i ? ctx.lineTo(xx, yy + a) : ctx.moveTo(xx, yy + a); } ctx.stroke(); }
  ctx.restore();
  // «ουρά» προς το αυτί

}
// PiP του Βασίλη στο εργοτάξιο όσο μιλάει (τσιρίζει στο κινητό σε ανοιχτή ακρόαση, κουνάει το μυστρί) · calm = στο τέλος, ήρεμος
function vasPip(ctx, t, st, en, calm = false) {
  if (t < st - 0.05 || t > en + 0.2) return;
  const k = L.spring(prog(t, st - 0.05, st + 0.3)) * (1 - easeIn(prog(t, en, en + 0.2))), x = 230, y = 1050, r = 170;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.03);
  cut(ctx, circlePts(0, 0, r + 12, r + 12, 40), C.paper, { seed: 5900, amp: 3 });
  const disk = circlePts(0, 0, r, r, 40); ctx.save(); L.path(ctx, disk); ctx.clip();
  ctx.fillStyle = '#E4DED2'; ctx.fillRect(-r, -r, 2 * r, 2 * r);                                                   // εργοτάξιο: γυψοσανίδες
  for (const [bx, w] of [[-r, 110], [-r + 116, 110], [-r + 232, 110]]) { ctx.fillStyle = '#EFEBE3'; ctx.fillRect(bx, -r, w, 2 * r); ctx.fillStyle = 'rgba(120,110,95,0.35)'; for (let yy = -r + 20; yy < r; yy += 44) { ctx.beginPath(); ctx.arc(bx + 10, yy, 3, 0, 7); ctx.arc(bx + w - 10, yy, 3, 0, 7); ctx.fill(); } }
  ctx.fillStyle = 'rgba(243,240,232,0.9)'; ctx.fillRect(-r, 90, 2 * r, 12);                                        // στόκος στον αρμό
  const wave = calm ? 0 : Math.sin(t * 16) * 0.35, s = 0.58, vy = 75;
  vasilis(ctx, 0, vy, s, { seed: 4000, legs: false, arms: [calm ? 0.2 : 1.5 + wave, 0.9], elbowL: calm ? 0 : -0.9, elbowR: 1.2, handL: calm ? 'relaxed' : 'grip', handR: 'grip',
    mouth: lipsync([], calm ? 'smile' : 'flat', 'vasilis'), eyes: calm ? 'happy' : 'dot', brows: calm ? 0.4 : -0.5, look: 4, blink: false });
  if (!calm) { const [hx, hy] = handPos(-1, 1.5 + wave, s, 0, vy, -0.9); trowel(ctx, hx, hy, s * 0.8, 0.6 + wave); }
  const [px, py] = handPos(1, 0.9, s, 0, vy, 1.2);                                                                 // κινητό μπροστά στο στόμα (ανοιχτή ακρόαση)
  cut(ctx, rrPts(px - 14, py - 60, 28, 52, 6), C.navy, { seed: 5901, amp: 0.6, edgeW: 3 });
  ctx.restore();
  ctx.strokeStyle = C.paper; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  ctx.restore();
  squeak(ctx, t, st, en, calm ? 0.45 : st === T.b2 ? 0.8 : 0.6, calm);
}
function subtitle(ctx, t, seq) {
  const cur = seq.find(([a, b]) => t >= a && t < b + 0.2); if (!cur) return;
  const [a, b, text] = cur, k = easeOut(prog(t, a, a + 0.18)) * (1 - easeIn(prog(t, b + 0.05, b + 0.2)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(540, 1352); ctx.rotate(0.01); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k);
  let fs = 64; ctx.font = `${fs}px Hand`; const mw = ctx.measureText(text).width; if (mw > 740) fs = Math.floor(64 * 740 / mw); const tw = Math.min(820, mw * fs / 64 + 80);
  cut(ctx, rectPts(-tw / 2, -58, tw, 116), '#111318', { seed: 5300, amp: 4, step: 18 });
  cut(ctx, rrPts(-tw / 2 + 10, -96, 250, 50, 14), V.yel, { seed: 5301, amp: 2, edgeW: 5 });
  txt(ctx, 'ΒΑΣΙΛΗΣ · τηλ.', -tw / 2 + 135, -70, { font: 'bold 28px Round', color: C.ink });
  txt(ctx, text, 0, 4, { font: `${fs}px Hand`, color: V.yel });
  ctx.restore();
}
// ---------- προσφορά: χαρτί με «Παράδοση: 7–10 εργάσιμες» (μαρκαδόρος) ----------
function quote(ctx, lt) {
  pop(ctx, lt, T.prosf, 640, 1170, () => {
    ctx.scale(1.2, 1.2);
    cut(ctx, rectPts(-250, -190, 500, 380), C.paper, { seed: 5400, amp: 4 });
    txt(ctx, 'ΠΡΟΣΦΟΡΑ', -210, -135, { font: 'bold 42px Round', color: C.navy, align: 'left' });
    L.brandMark(ctx, 190, -140, 26, BRAND);
    ctx.fillStyle = 'rgba(16,26,51,0.2)'; for (const [yy, ww] of [[-78, 380], [-44, 300], [-10, 340]]) ctx.fillRect(-210, yy, ww, 12);
    txt(ctx, '30 × μπλούζα, τύπωμα πλάτης', -210, 40, { font: '32px Hand', color: C.ink, align: 'left' });
    const hk = easeOut(prog(lt, T.epta, T.epta + 0.4)); ctx.font = 'bold 32px Round'; const qw = ctx.measureText('Παράδοση: 7–10 εργάσιμες').width;
    if (hk > 0) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = V.yel; ctx.fillRect(-222, 92, (qw + 24) * hk, 54); ctx.restore(); }
    txt(ctx, 'Παράδοση: 7–10 εργάσιμες', -210, 120, { font: 'bold 32px Round', color: C.ink, align: 'left' });
  }, 0.04);
}
// ---------- ημερολόγιο (ΔΕΥΤΕΡΑ / ΤΕΤΑΡΤΗ) ----------
function dayChip(ctx, lt, st, day, note, x = 210, y = 560) {
  pop(ctx, lt, st, x, y, () => {
    cut(ctx, rectPts(-150, -110, 300, 220), C.paper, { seed: 5500 + day.length, amp: 3 });
    cut(ctx, rectPts(-150, -110, 300, 70), BRAND, { seed: 5501, amp: 2, edge: false, shadow: false });
    txt(ctx, day, 0, -74, { font: 'bold 44px Round', color: '#fff' });
    txt(ctx, note, 0, 34, { font: '42px Hand', color: C.ink });
  }, -0.06);
}

// ---------- χαρακτήρες ----------
const RE_POSES = [
  [0, { aR: 0.9, eR: 1.2, hR: 'grip', look: 0 }],
  [PHCLOSE, { aR: 0.9, eR: 1.2, hR: 'grip', look: -12, brows: 0.2 }],              // κοιτάει το κινητό
  [PHCLOSE + 0.3, { aR: 0.9, eR: 1.2, hR: 'grip', look: 0, brows: -0.3 }],          // … και την κάμερα (ξέρει ποιος είναι)
  [T.b1, { aR: 0.9, eR: 1.2, hR: 'grip', look: -6, brows: 0 }],
  [T.b2, { aR: 0.9, eR: 1.2, hR: 'grip', look: 10, brows: -0.5, eyes: 'tired' }],   // τσιρίγματα: μορφάζει
  [LOOK, { aR: 0.9, eR: 1.2, hR: 'grip', look: 0, brows: -0.2 }],                   // … και κοιτάει την κάμερα (deadpan)
  [T.prosf - 0.1, { aR: 0.9, eR: 1.2, hR: 'grip', look: 0, brows: 0.1 }],
  [T.b3, { aR: 0.9, eR: 1.2, hR: 'grip', look: -6, brows: 0.2 }],
  [T.punch - 0.1, { aR: 0.9, eR: 1.2, hR: 'grip', look: 0, brows: -0.2 }],          // στην κάμερα
  [CUT.TAG + 0.3, { aR: 0.65, eR: 2.5, hR: 'grip', look: 0, brows: -0.2, eyes: 'tired' }], // πίνει αργά από την κούπα (το χέρι δεν φτάνει το στόμα → κούπα ψηλά, γερμένη)
];
function renaAt(ctx, t) {
  const p = poseAt(RE_POSES, t);
  rena(ctx, DX, RY, DS, { seed: 3000, legs: false, ...p, blink: blinkNow(1.7), mouth: t >= CUT.TAG + 0.3 ? 'closed' : lipsync(VO, 'flat', 'rena') });
  const [mx, my] = crewHandPos('rena', 1, p.arms[1], DS, DX, RY, p.elbowR), sip = easeInOut(prog(t, CUT.TAG + 0.3, CUT.TAG + 0.7));
  ctx.save(); ctx.translate(mx - 18 * DS * sip, my - 62 * DS * sip); ctx.rotate(-0.45 * sip); mug(ctx, 0, 0, DS * 0.9, { steam: sip ? undefined : t }); ctx.restore();
}
// ---------- θερμοπρέσα clamshell σε πρώτο πλάνο (1η χρήση, πιο ρεαλιστική: μέταλλα με gradient) ----------
// κάμερα από ψηλά ~30°: κάτω πλατό με τη μπλούζα (πλάτη, λογότυπο) · πάνω πλατό με άρθρωση πίσω · auto-open: op 0 (κλειστό) → 1 (ανοιχτό ~70°)
const PR = { x: 400, hy: 1120, fy: 1440, bw: 250, fw: 300, th: 56 }; // άρθρωση (πίσω) · μπροστινή ακμή · μισό πλάτος πίσω/μπροστά · πάχος πλατό
function metal(ctx, x0, y0, x1, y1, a, b) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function heatPress(ctx, lt, op, o = {}) {
  const { x, hy, fy, bw, fw, th } = PR;
  // βάση + κολόνα άρθρωσης
  cut(ctx, [[x - fw - 6, fy + 18], [x + fw + 6, fy + 18], [x + fw + 6, fy + 70], [x - fw - 6, fy + 70]], '#2E3443', { seed: 5601, amp: 1, edgeW: 5 });
  cut(ctx, rrPts(x - 34, hy - 120, 68, 150, 12), '#2E3443', { seed: 5602, amp: 1, edgeW: 5 });
  // χειριστήριο: οθόνη με μπάρα χρόνου που αδειάζει + λαμπάκι
  const cb = cut(ctx, rrPts(x + fw - 118, fy + 24, 104, 40, 8), '#171B24', { seed: 5603, amp: 0.6, edgeW: 3, shadow: false });
  const tb = L.clamp(o.timer ?? 0); ctx.fillStyle = '#3A4458'; ctx.fillRect(x + fw - 108, fy + 36, 70, 14); ctx.fillStyle = tb > 0 ? '#E0453A' : '#2FB36B'; ctx.fillRect(x + fw - 108, fy + 36, 70 * tb, 14);
  ctx.beginPath(); ctx.arc(x + fw - 26, fy + 43, 6, 0, 7); ctx.fill();
  // κάτω πλατό (σιλικόνη) + μπλούζα απλωμένη (πλάτη προς τα πάνω)
  cut(ctx, [[x - bw, hy + 26], [x + bw, hy + 26], [x + fw, fy + 18], [x - fw, fy + 18]], metal(ctx, 0, hy, 0, fy, '#9AA0AB', '#80868F'), { seed: 5604, amp: 0.8, edgeW: 4 });
  ctx.save(); ctx.translate(x, (hy + fy) / 2 + 20); ctx.scale(0.8, 0.4);
  tshirt(ctx, 0, 0, 1, 0, { color: V.tee, back: true, rib: V.teeD, scrib: '#33373E', seed: 7400, logoFn: k => vasLogo(k, 0, 10, 0.95, { yel: o.logo ?? 1, white: o.logo ?? 1 }) });
  ctx.restore();
  // πάνω πλατό: γωνία α (0 = κλειστό) · μπροστινή ακμή y = hy + D cos α − Lh sin α
  const a = op * 1.22, D = fy - hy, Lh = 480, yF = hy + D * Math.cos(a) - Lh * Math.sin(a), wF = lerp(fw, bw + 14, op);
  ctx.save(); ctx.fillStyle = 'rgba(8,12,24,0.28)'; ctx.beginPath(); ctx.ellipse(x, hy + 20, bw + 20, 18, 0, 0, 7); ctx.fill(); ctx.restore();
  if (yF > hy + 2) { // κλειστό / λίγο ανοιχτό: φαίνεται το καπάκι από πάνω + η μπροστινή πλευρά
    const top = [[x - bw - 4, hy], [x + bw + 4, hy], [x + wF + 4, yF], [x - wF - 4, yF]];
    cut(ctx, top, metal(ctx, 0, hy, 0, yF, '#3B4354', '#252B38'), { seed: 5605, amp: 0.8, edgeW: 4 });
    cut(ctx, [[x - wF - 4, yF], [x + wF + 4, yF], [x + wF + 4, yF + th], [x - wF - 4, yF + th]], metal(ctx, 0, yF, 0, yF + th, '#A9B1BE', '#6E7686'), { seed: 5606, amp: 0.6, edgeW: 3 });
  } else { // ανοιχτό: φαίνεται η θερμαινόμενη πλάκα από κάτω
    const pl = [[x - bw - 4, hy], [x + bw + 4, hy], [x + wF + 4, yF], [x - wF - 4, yF]];
    const P = cut(ctx, pl, metal(ctx, x - bw, yF, x + bw, hy, '#E4E8EE', '#9EA7B5'), { seed: 5607, amp: 0.8, edgeW: 4 });
    ctx.save(); L.path(ctx, P); ctx.clip(); ctx.strokeStyle = 'rgba(80,90,110,0.18)'; ctx.lineWidth = 3;
    for (let k = 1; k < 6; k++) { const u = k / 6, yy = lerp(hy, yF, u), ww = lerp(bw, wF, u); ctx.beginPath(); ctx.moveTo(x - ww, yy); ctx.lineTo(x + ww, yy); ctx.stroke(); }
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - bw + 30, hy - 6); ctx.lineTo(x - bw + 110, hy - 6); ctx.lineTo(x - wF + 60, yF + 10); ctx.lineTo(x - wF + 20, yF + 10); ctx.fill(); ctx.restore();
    cut(ctx, [[x - wF - 4, yF - 22], [x + wF + 4, yF - 22], [x + wF + 4, yF], [x - wF - 4, yF]], '#2B3242', { seed: 5608, amp: 0.6, edgeW: 3 });
  }
  // λαβή στη μπροστινή ακμή
  const hyH = yF > hy ? yF + th / 2 : yF - 11;
  cut(ctx, rrPts(x - 90, hyH - 12, 180, 24, 12), '#1B2030', { seed: 5609, amp: 0.6, edgeW: 3 });
  // ατμός μετά το άνοιγμα
  if (o.steam > 0) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.55 * o.steam})`; ctx.lineWidth = 10; ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const sx = x - 150 + k * 75, ph = lt * 3 + k * 1.7, rise = 40 + 120 * o.steam; ctx.beginPath(); ctx.moveTo(sx, hy + 110); ctx.bezierCurveTo(sx + 18 * Math.sin(ph), hy + 60 - rise * 0.3, sx - 18 * Math.sin(ph), hy - rise * 0.6, sx + 8 * Math.sin(ph + 1), hy - rise); ctx.stroke(); }
    ctx.restore(); }
}
// στοίβα διπλωμένες μαύρες μπλούζες (έτοιμες)
function foldedStack(ctx, x, y, n) {
  for (let i = 0; i < n; i++) { const yy = y - i * 20; cut(ctx, [[x - 120, yy], [x + 120, yy], [x + 128, yy + 22], [x - 128, yy + 22]], i % 2 ? '#262A31' : '#1E2227', { seed: 5700 + i, amp: 0.8, edgeW: 3, sx: 3, sy: 4 }); }
  ctx.fillStyle = V.yel; ctx.fillRect(x - 40, y - (n - 1) * 20 + 4, 80, 8);
}
// εργαστήριο: μόνο ο Στράτος πίσω από τον πάγκο · η πρέσα τελειώνει (μπάρα → beep) → auto-open → ατμός + λογότυπο → 👍
function workshop(ctx, t) {
  const lt = t - CUT.WS;
  bgFlat(ctx, '#D6DEF0', '#C3CFE8', 31);
  // πινακίδα εργαλείων στον τοίχο
  cut(ctx, rrPts(70, 470, 300, 380, 10), C.navy, { seed: 5801, amp: 1.5, edgeW: 6 });
  ctx.fillStyle = '#2A3C70'; for (let yy = 500; yy < 840; yy += 34) for (let xx = 96; xx < 360; xx += 34) { ctx.beginPath(); ctx.arc(xx, yy, 4, 0, 7); ctx.fill(); }
  cut(ctx, rrPts(110, 520, 90, 26, 6), '#C9A274', { seed: 5802, amp: 1, edgeW: 3 }); cut(ctx, rrPts(140, 546, 30, 90, 4), '#AEB8C8', { seed: 5803, amp: 1, edgeW: 3 }); // σπάτουλα
  for (const k of [0, 1]) cut(ctx, circlePts(262 + k * 34, 560, 16, 16, 14), '#E0453A', { seed: 5804 + k, amp: 1, edgeW: 3 });                                // ψαλίδι
  cut(ctx, [[268, 574], [258, 680], [270, 680], [290, 574]], '#C9CDD6', { seed: 5806, amp: 0.6, edgeW: 3 });
  cut(ctx, rrPts(110, 700, 220, 110, 6), '#F2EFE8', { seed: 5807, amp: 1, edgeW: 3 }); txt(ctx, 'teflon', 220, 756, { font: '30px Hand', color: C.mid });  // φύλλο τεφλόν
  // ο Στράτος πίσω από τον πάγκο
  const done = T.r4 + 0.15, open = easeOut(prog(t, done + 0.12, done + 0.55)), up = easeOut(prog(t, done + 0.9, done + 1.15));
  stratos(ctx, 735, 730, 0.8, { seed: 1000, legs: false, arms: [0.15, lerp(0.15, 1.4, up)], elbowR: lerp(0, -1.6, up), handR: up > 0.97 ? 'thumb' : 'relaxed',
    look: open > 0.5 ? -10 : -12, eyes: up > 0.5 ? 'happy' : 'dot', mouth: up > 0.3 ? 'grin' : 'closed', brows: open > 0.5 ? 0.6 : 0.1, blink: blinkNow(0) });
  // πάγκος
  cut(ctx, [[-40, 1100], [1120, 1100], [1120, 1560], [-40, 1560]], '#C8AE86', { seed: 5810, amp: 2, scribble: '#B89B72' });
  cut(ctx, rectPts(-40, 1550, 1160, 420), C.navy, { seed: 5811, amp: 2, scribble: '#1B2D62' });
  foldedStack(ctx, 885, 1420, 12);
  heatPress(ctx, lt, open, { timer: 1 - prog(t, CUT.WS, done), steam: prog(t, done + 0.3, done + 0.8) * (1 - prog(t, CUT.BACK - 0.3, CUT.BACK)), logo: 1 });
  stamp(ctx, lt, 1.25, 870, 1150, '12 / 30', 0.05, BRAND, 64);
}

// ---------- λήψεις ----------
function shot(ctx, t) {
  if (t < CUT.TEE) { // HOOK: επιλογή χαρακτήρα · μία στροφή 360
    const th = THK * easeInOut(prog(t, 0.25, 1.05)), k = easeOut(prog(t, PUNCH, PUNCH + 0.14)), sh = k > 0 ? Math.sin(t * 70) * 6 * (1 - prog(t, PUNCH + 0.14, PUNCH + 0.5)) : 0;
    return selectScreen(ctx, t < 0.25 ? 0 : t, th, t < 0.25 ? SEL : { pose: { blink: blinkNow(0.5) }, focus: k, shake: sh });
  }
  if (t < CUT.RING) { // μπλούζα: άδεια → στοίβα ×30 → τύπωμα κίτρινο → λευκό
    const lt = t - CUT.TEE;
    bgFlat(ctx, C.pale, '#BFD0F0', 23);
    for (let i = 4; i >= 1; i--) { const k = easeOut(prog(t, T.tria + (4 - i) * 0.07, T.tria + (4 - i) * 0.07 + 0.2)); if (k > 0) tshirt(ctx, 540 + i * 34 * k, 1030 - i * 30 * k, 1.1, 0.02 * i, { color: V.tee, back: true, rib: V.teeD, scrib: '#33373E', seed: 7300 + i }); }
    tshirt(ctx, 540, 1030, 1.1, 0, { color: V.tee, back: true, rib: V.teeD, scrib: '#33373E' });
    const py = spring => L.spring(prog(t, spring, spring + 0.35));
    vasLogo(ctx, 540, 960, 1.05, { yel: Math.min(1, py(T.logo)), white: Math.min(1, py(T.logo + 0.45)) });
    dayChip(ctx, lt, 0.2, 'ΔΕΥΤΕΡΑ', 'παραγγελία', 215, 1335);
    return stamp(ctx, t, T.tria + 0.3, 840, 640, '×30', 0.12, BRAND, 110);
  }
  if (t < CUT.CALL) { // υποδοχή: χτυπάει το κινητό · πρώτα κοντινό στην οθόνη («ΒΑΣΙΛΗΣ · 7 αναπάντητες»)
    const cm = t < PHCLOSE ? snap(t, CUT.RING, [PHONE.x, PHONE.y - PHONE.h / 2 + 4, 9], [PHONE.x, PHONE.y - PHONE.h / 2, 10], 0.6) : CAM.med;
    reception(ctx, t, { cam: cm, behind: c => renaAt(c, t), front: c => phone(c, t, { shake: t > CUT.RING + 0.05 && t < CUT.RING + 0.97 }) });
    if (t < PHCLOSE) return;
    return dayChip(ctx, t - CUT.RING, 0.15, 'ΤΕΤΑΡΤΗ', '10:04');
  }
  if (t < CUT.WS || (t >= CUT.BACK && t < CUT.TAG)) { // τηλεφώνημα (Ρένα close) · snap zooms
    let cm = snap(t, CUT.CALL, CAM.med, CAM.call);
    if (t >= T.b2 && t < CUT.WS) cm = snap(t, T.b2, CAM.call, CAM.angry, 0.1);
    if (t >= LOOK && t < CUT.WS) cm = snap(t, LOOK, CAM.angry, CAM.look, 0.1);        // βλέμμα στην κάμερα όσο τσιρίζει
    if (t >= T.prosf && t < CUT.WS) cm = snap(t, T.prosf, CAM.angry, CAM.call, 0.2);
    if (t >= CUT.BACK) cm = t < T.punch - 0.05 ? CAM.call : snap(t, T.punch - 0.05, CAM.call, CAM.punch);
    reception(ctx, t, { cam: cm, behind: c => renaAt(c, t), front: c => phone(c, t) });
    vasPip(ctx, t, T.b1, T.b1e); vasPip(ctx, t, T.b2, T.b2e); vasPip(ctx, t, T.b3, T.b3e, true);
    if (t < CUT.WS) quote(ctx, t);
    return;
  }
  if (t < CUT.BACK) return workshop(ctx, t);
  // TAG: ξαναχτυπάει · η Ρένα πίνει καφέ · zoom στην οθόνη του κινητού → επιλογή χαρακτήρα (= frame 0)
  const zk = easeInOut(prog(t, CUT.ZOOM, CUT.END - 0.12));
  if (t >= CUT.END - 0.12) return selectScreen(ctx, 0, 0, SEL);
  const scr = [PHONE.x, PHONE.y - PHONE.h / 2], zEnd = W / PHONE.w, z = Math.exp(lerp(Math.log(CAM.med[2]), Math.log(zEnd), zk));
  const cx = lerp(CAM.med[0], scr[0], zk), cy = lerp(CAM.med[1], scr[1], zk);
  reception(ctx, t, { cam: [cx, cy, z], behind: c => renaAt(c, t), front: c => phone(c, t, { missed: 8, shake: t > CUT.TAG + 0.1 && t < CUT.ZOOM, sel: easeOut(prog(t, CUT.ZOOM + 0.45, CUT.ZOOM + 0.8)) }) });
}
const CAPS = [[0, HOOK], [T.v2 - 0.05, 'Προχθές παρήγγειλε 30 μπλούζες'], [T.logo - 0.1, 'με το λογότυπό του.'], [CUT.RING, 'Δύο μέρες μετά…'],
  [T.r1 - 0.05, 'Strategix Studios, παρακαλώ.'], [T.r2 - 0.05, 'Τις παραγγείλατε προχθές, κύριε Βασίλη.'], [T.prosf - 0.05, 'Η προσφορά γράφει 7–10 εργάσιμες.'],
  [T.r4 - 0.05, 'Θα γίνουν τέλειες.'], [T.r4b - 0.05, 'Θα σας πάρω εγώ.'], [T.punch - 0.05, 'Μην γίνεις σαν τον κύριο Βασίλη.'], [CUT.TAG + 0.2, 'Κάνε tag τον Βασίλη που ξέρεις.'], [CUT.ZOOM + 0.25, HOOK]];
const SUBS = [[T.b1, T.b1e, 'Είναι έτοιμες οι μπλούζες μου;'], [T.b2, T.b2e, 'Δύο μέρες! Δύο ολόκληρες μέρες!'], [T.b3, T.b3e, 'Καλά. Ευχαριστώ, κοπελιά.']];
function world(ctx, t) {
  shot(ctx, t);
  if (!SUBS.some(([a, b]) => t >= a - 0.05 && t < b + 0.1)) captionSeq(ctx, t < CUT.TEE ? t + 1 : t, t < CUT.TEE ? [[-1, HOOK]] : CAPS);
  subtitle(ctx, t, SUBS);
  if (t < CUT.TEE) seriesTag(ctx, t + 1, TAG);                                   // ήδη στο frame 0 · μόνο με το caption του hook
  else if (t >= CUT.ZOOM + 0.25) seriesTag(ctx, (t - CUT.ZOOM - 0.25) * 2.5, TAG); // ξανά στο τέλος (loop)
}
const scene = t0 => (ctx, lt) => world(ctx, t0 + lt);
const cuts = [0, CUT.TEE, CUT.RING, CUT.CALL, CUT.WS, CUT.BACK, CUT.TAG, CUT.END];

require('./render.js')({
  name: 'er02_vasilis',
  SCENES: cuts.slice(0, -1).map((a, i) => [scene(a), cuts[i + 1] - a]),
  WIPES: [1, 2],
  LOOP: 'cut',                                    // seamless: zoom στην οθόνη του κινητού → επιλογή χαρακτήρα + caption του hook = frame 0
  VO_FILE: 'vo/er02_vo.mp3', VO_AT: 0.2,
  SFX: [
    [0.02, 'file', { src: 'sfx/er02_jingle.mp3', dur: 1.9, gain: 0.8, note: 'jingle επιλογής χαρακτήρα (ElevenLabs)' }],
    [0.25, 'swoosh', { gain: 0.6, note: 'στροφή 360' }], [PUNCH + 0.08, 'beep', { f: 220, count: 2, gain: 0.8, note: 'ΥΠΟΜΟΝΗ 1' }],
    [CUT.TEE + 0.2, 'pop', { note: 'ΔΕΥΤΕΡΑ' }],
    ...[0, 1, 2, 3].map(i => [T.tria + i * 0.07, 'pop', { seed: i + 1, gain: 0.6, note: `στοίβα ${i + 1}` }]), [T.tria + 0.3, 'stamp', { note: '×30' }],
    [T.logo, 'stamp', { seed: 2, gain: 0.8, note: 'τύπωμα κίτρινο' }], [T.logo + 0.45, 'stamp', { seed: 3, gain: 0.8, note: 'τύπωμα λευκό' }], [T.logo + 0.6, 'shimmer', { gain: 0.6 }],
    [CUT.RING + 0.05, 'ring', { note: 'κουδούνισμα' }], [CUT.RING + 0.15, 'pop', { seed: 4, note: 'ΤΕΤΑΡΤΗ' }],
    [CUT.CALL, 'click', { note: 'απαντάει' }], [CUT.CALL + 0.02, 'zoom', { note: 'snap zoom' }],
    [T.b2, 'zoom', { seed: 2, gain: 0.6, note: 'snap · θυμωμένος' }],
    [T.prosf, 'slide', { dur: 0.3, gain: 0.6, note: 'προσφορά' }], [T.epta, 'slide', { dur: 0.4, gain: 0.4, seed: 2, note: 'μαρκαδόρος' }],
    [T.r4 + 0.1, 'beep', { count: 2, gain: 0.6, note: 'πρέσα: τέλος χρόνου' }], [T.r4 + 0.27, 'lid', { gain: 0.7, note: 'auto-open' }], [T.r4 + 0.45, 'air', { dur: 0.8, gain: 0.5, note: 'ατμός' }], [T.r4 + 1.05, 'swoosh', { seed: 2, gain: 0.6, note: '👍 Στράτος' }], [CUT.WS + 1.25, 'stamp', { seed: 5, gain: 0.7, note: '12/30' }],
    [T.hang, 'click', { seed: 2, note: 'κλείνει' }], [T.punch - 0.05, 'zoom', { seed: 3, note: 'snap · στην κάμερα' }],
    [CUT.TAG + 0.1, 'ring', { count: 2, note: 'ξαναχτυπάει' }],
    [CUT.ZOOM, 'zoom', { seed: 4, note: 'zoom στο κινητό → frame 0 (loop)' }],
    [PUNCH, 'zoom', { seed: 5, gain: 0.7, note: 'punch-in «ΥΠΟΜΟΝΗ 1»' }],
    [PHCLOSE, 'swoosh', { seed: 3, gain: 0.5, note: 'κοντινό κινητού → Ρένα' }],
    [T.b1 - 0.05, 'pop', { seed: 6, gain: 0.6, note: 'PiP Βασίλη' }], [T.b2 - 0.05, 'pop', { seed: 7, gain: 0.6, note: 'PiP Βασίλη' }], [T.b3 - 0.05, 'pop', { seed: 8, gain: 0.5, note: 'PiP Βασίλη' }],
    [LOOK, 'zoom', { seed: 6, gain: 0.5, note: 'βλέμμα Ρένας στην κάμερα' }],
  ],
});
}
