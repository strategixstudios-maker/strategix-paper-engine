// ΟΜΑΔΑ — οι συνάδελφοι του Στράτου στη σειρά «Το Εργαστήριο» (skits, STYLE_GUIDE §4b)
// Ίδιο rig με τον Στράτο (arm · hands.js · face · lint), άλλο κεφάλι / ρούχα. API ίδιο με stratos():
// (ctx, x, shoulderY, s, { arms, elbowL/R, handL/R, viewL/R, hintL/R, armRFront, behindArms, legs, mouth, eyes, brows, look, blink, seed })
// Σχέδιο: `node crew.js` → crew_sheet.png
const L = require('./lib.js');
const { C, cut, rectPts, rrPts, circlePts, txt, brandMark } = L;
const { S, face, arm, handPos, lintRig } = require('./stratos.js');
const { BRAND } = require('./props/core.js');

const PH = { // χρώματα του Φοίβου: φούτερ brand blue, navy φόρμα, γυαλιά laser
  hair: '#3A2A22', hood: '#2854F3', hoodD: '#1C3DB8', hoodS: '#4A70F6', jog: '#0B1B3F', jogD: '#1F3266', shoe: '#FFFFFF', lens: '#8FB0EE', frame: '#101A33',
};
const RE = { // χρώματα Ρένας: ριγέ μπλούζα, navy παντελόνι, γυαλιά + headset
  hair: '#6B4630', hairD: '#4E3222', top: '#F7F4EC', stripe: '#1E3A8A', pants: '#0B1B3F', pantsS: '#1F3266', shoe: '#FFFFFF', frame: '#0B1B3F', headset: '#101A33', lip: '#A8404F', pen: '#2F5FD0',
};
// γεωμετρία ανά χαρακτήρα: κέντρο/ακτίνα κεφαλιού (σε μονάδες rig, y από τη γραμμή ώμων) + ώμος (pivot χεριού) — για lint και crewHandPos
const RIG = {
  phoebus: { headY: -197, headR: 128, shoulder: 148, neck: 22 },
  rena: { headY: 10 - 185 * 0.94, headR: 128 * 0.94, shoulder: 128, headS: 0.94 },
};
const ARMPAL = {
  phoebus: { shoulder: 148, sleeve: PH.hood, sleeveD: PH.hoodD, long: true, cuff: PH.hoodD },
  rena: { shoulder: 128, sleeve: RE.top, sleeveD: RE.stripe },
};
// θέση χεριού για props (κούπα, κινητό…) — όπως handPos() του Στράτου, με τον ώμο του χαρακτήρα
const crewHandPos = (who, side, ang, s, x, y, elbow = 0) => handPos(side, ang, s, x, y, elbow, RIG[who].shoulder);

const ears = (ctx, sd, col = S.skin) => { for (const ex of [-124, 124]) cut(ctx, circlePts(ex, -178, 28, 32, 16), col, { seed: sd + (ex > 0 ? 1 : 2), amp: 2, edgeW: 7 }); };
const skull = (ctx, sd) => cut(ctx, circlePts(0, -185, 125, 128, 40), S.skin, { seed: sd + 3, amp: 3 });

// ---------- ΦΟΙΒΟΣ — μαθητευόμενος ~20, «ο υπεύθυνος όταν λείπει ο Στράτος» ----------
// κεφάλι Φοίβου (για κάρτες/PiP) · o = όπως head() του Στράτου + o.goggles: 'head' (default, στο μέτωπο — signature) · 'eyes' (δουλεύει στο laser) · false
function phoebusHead(ctx, x, y, s, o = {}) {
  const sd = (o.seed || 2000), look = o.look || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ears(ctx, sd); skull(ctx, sd);
  // φακίδες
  ctx.fillStyle = S.skinD; for (const [fx, fy] of [[-92, -140], [-76, -150], [-100, -124], [92, -140], [76, -150], [100, -124]]) { ctx.beginPath(); ctx.arc(fx + look * .5, fy, 4, 0, 7); ctx.fill(); }
  face(ctx, o, { hair: PH.hair, browW: 66, browY: -222 });
  // μαλλιά: ανακατεμένο ψηλό τσουλούφι (δεξιά) + φράντζα με μύτες
  const hp = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28, a = Math.PI * (1.02 + t * 0.96), tuft = 14 * Math.abs(Math.sin(t * Math.PI * 6)), quiff = 78 * Math.exp(-(((t - 0.62) / 0.13) ** 2));
    const R = 134 + tuft + quiff; hp.push([Math.cos(a) * R + quiff * 0.35, -185 + Math.sin(a) * R]);
  }
  hp.push([112, -226], [84, -246], [66, -232], [40, -262], [14, -244], [-12, -266], [-40, -246], [-66, -262], [-92, -238], [-118, -222]);
  cut(ctx, hp, PH.hair, { seed: sd + 20, amp: 3, step: 16, scribble: '#523C30' });
  // γυαλιά laser
  const g = o.goggles === undefined ? 'head' : o.goggles;
  if (g) {
    const gy = g === 'eyes' ? -180 : -284;
    cut(ctx, rrPts(-136, gy - 9, 272, 18, 8), PH.frame, { seed: sd + 21, amp: 1.5, edgeW: 5 });
    for (const gx of [-50, 50]) {
      const fr = cut(ctx, rrPts(gx - 42 + look * .6, gy - 28, 84, 56, 22), PH.frame, { seed: sd + 22 + gx, amp: 1.5, edgeW: 6 });
      ctx.save(); L.path(ctx, fr); ctx.clip();
      ctx.globalAlpha = g === 'eyes' ? 0.5 : 0.85; ctx.fillStyle = PH.lens; ctx.beginPath(); ctx.roundRect(gx - 33 + look * .6, gy - 19, 66, 38, 15); ctx.fill();
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gx - 20 + look * .6, gy - 8); ctx.lineTo(gx - 8 + look * .6, gy - 14); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}
// Φοίβος ολόσωμος · y = γραμμή ώμων (ψηλότερος από τον Στράτο κατά RIG.phoebus.neck) · opts όπως stratos() + goggles
function phoebus(ctx, x, y, s, o = {}) {
  const sd = o.seed || 2000, [aL, aR] = o.arms || [0.12, 0.12], R = RIG.phoebus;
  const ao = side => ({ seed: sd + 100, hand: side > 0 ? o.handR : o.handL, elbow: side > 0 ? o.elbowR : o.elbowL, view: side > 0 ? o.viewR : o.viewL, pal: ARMPAL.phoebus });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.legs !== false) { // φόρμα με λάστιχο στον αστράγαλο + χοντρά sneakers
    for (const [sg, k] of [[-1, 30], [1, 31]]) {
      cut(ctx, [[sg * 6, 430], [sg * 124, 430], [sg * 104, 800], [sg * 22, 800]], PH.jog, { seed: sd + k, scribble: PH.jogD });
      cut(ctx, rrPts(sg > 0 ? 20 : -106, 784, 86, 34, 12), PH.jogD, { seed: sd + k + 2, amp: 1.5, edgeW: 5 });
      const sx = sg * 64;
      cut(ctx, rrPts(sx - 78, 806, 156, 66, 30), PH.shoe, { seed: sd + k + 4, amp: 2 });
      cut(ctx, rectPts(sx - 76, 852, 152, 18), PH.jog, { seed: sd + k + 6, amp: 1, edge: false, shadow: false });
    }
  }
  if (o.behindArms) arm(ctx, -1, aL, ao(-1));
  cut(ctx, rrPts(-100, -46, 200, 74, 34), PH.hoodD, { seed: sd + 23, amp: 2, edgeW: 6 }); // κουκούλα πίσω από τον λαιμό
  cut(ctx, rrPts(-31, -80 - R.neck, 62, 104 + R.neck, 20), S.skin, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  ctx.save(); ctx.fillStyle = 'rgba(150,80,50,0.22)'; ctx.beginPath(); ctx.ellipse(0, -36 - R.neck, 32, 12, 0, 0, 7); ctx.fill(); ctx.restore();
  const body = cut(ctx, [[-118, -4], [118, -4], [150, 10], [166, 56], [170, 450], [-170, 450], [-166, 56], [-150, 10]], PH.hood, { seed: sd + 25, scribble: PH.hoodS });
  // λαιμόκοψη + στεφάνη κουκούλας + κορδόνια
  cut(ctx, [[-44, -4], [44, -4], [0, 30]], S.skin, { seed: sd + 32, amp: 1, edge: false, shadow: false });
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = PH.hoodD; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(-64, -8); ctx.quadraticCurveTo(0, 74, 64, -8); ctx.stroke();
  ctx.strokeStyle = C.paper; ctx.lineWidth = 7;
  for (const [x0, x1, y1] of [[-20, -30, 160], [20, 26, 148]]) { ctx.beginPath(); ctx.moveTo(x0, 38); ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.2, 100, x1, y1); ctx.stroke(); ctx.fillStyle = C.paper; ctx.fillRect(x1 - 5, y1, 10, 18); }
  ctx.restore();
  brandMark(ctx, 72, 124, 26, C.paper); // merch: το «S» στην αριστερή πλευρά του στήθους του (δεξιά για τον θεατή) — fan της δουλειάς
  // τσέπη καγκουρό + λάστιχο στο τελείωμα
  cut(ctx, [[-96, 290], [96, 290], [118, 400], [-118, 400]], PH.hoodD, { seed: sd + 26, amp: 2, edgeW: 5 });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sg * 96, 292); ctx.lineTo(sg * 116, 396); ctx.stroke(); } ctx.restore();
  const hem = cut(ctx, rectPts(-168, 420, 336, 40), PH.hoodD, { seed: sd + 27, amp: 1.5, edgeW: 5 });
  ctx.save(); L.path(ctx, hem); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 4; for (let xx = -164; xx < 170; xx += 16) { ctx.beginPath(); ctx.moveTo(xx, 418); ctx.lineTo(xx, 462); ctx.stroke(); } ctx.restore();
  if (!o.behindArms) arm(ctx, -1, aL, ao(-1));
  if (!o.armRFront) arm(ctx, 1, aR, ao(1));
  phoebusHead(ctx, 0, 10 - R.neck, 1, o);
  if (o.armRFront) arm(ctx, 1, aR, ao(1));
  if (L.ST.lint) lintRig(ctx, o, aL, aR, R);
  ctx.restore();
  return body;
}

// ---------- ΡΕΝΑ — υποδοχή ~30, deadpan, οι πελάτες περνάνε από εκείνη ----------
// κεφάλι Ρένας (για κάρτες/PiP) · o = όπως head() του Στράτου + o.headset: true (default — signature) · false
function renaHead(ctx, x, y, s, o = {}) {
  const sd = (o.seed || 3000), look = o.look || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // κότσος + στυλό (πίσω από το κεφάλι)
  ctx.save(); ctx.translate(8, -322); ctx.rotate(-0.54); // στυλό στον κότσο (όχι μολύβι: το μολύβι στο αυτί είναι του Στράτου)
  cut(ctx, rrPts(-120, -9, 240, 18, 8), RE.pen, { seed: sd + 1, amp: 1, edgeW: 5 });
  cut(ctx, rrPts(70, -9, 52, 18, 8), RE.frame, { seed: sd + 10, amp: 1, edgeW: 4 });
  cut(ctx, rectPts(76, -16, 40, 7), RE.frame, { seed: sd + 11, amp: 1, edge: false, shadow: false }); ctx.restore();
  cut(ctx, circlePts(8, -322, 62, 54, 24), RE.hair, { seed: sd + 2, amp: 3, scribble: RE.hairD });
  cut(ctx, circlePts(0, -196, 140, 132, 40), RE.hair, { seed: sd + 3, amp: 3 }); // όγκος μαλλιών γύρω από το κεφάλι
  ears(ctx, sd + 4); skull(ctx, sd + 4);
  for (const ex of [-124, 124]) { ctx.fillStyle = C.sky; ctx.beginPath(); ctx.arc(ex, -136, 9, 0, 7); ctx.fill(); } // σκουλαρίκια
  face(ctx, o, { hair: RE.hairD, browW: 54, browY: -232, lip: RE.lip, lash: true });
  // φράντζα στο πλάι
  cut(ctx, [[-128, -190], [-132, -250], [-96, -300], [-30, -318], [40, -316], [100, -292], [130, -240], [126, -196], [104, -236], [60, -262], [8, -262], [-40, -252], [-84, -236], [-110, -214]], RE.hair, { seed: sd + 5, amp: 2.5, step: 14, scribble: RE.hairD });
  // γυαλιά
  ctx.save(); ctx.strokeStyle = RE.frame; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (const gx of [-48, 48]) { ctx.beginPath(); ctx.arc(gx + look, -180, 36, 0, 7); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-14 + look, -186); ctx.quadraticCurveTo(look, -196, 14 + look, -186); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-84 + look, -186); ctx.lineTo(-120, -192); ctx.moveTo(84 + look, -186); ctx.lineTo(120, -192); ctx.stroke();
  ctx.globalAlpha = 0.7; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; for (const gx of [-48, 48]) { ctx.beginPath(); ctx.arc(gx + look, -180, 25, 1.15 * Math.PI, 1.4 * Math.PI); ctx.stroke(); }
  ctx.restore();
  // headset: στεφάνη πάνω από τα μαλλιά, ακουστικό αριστερά, μπούμα με μικρόφωνο ως τη γωνία του στόματος
  if (o.headset !== false) {
    const band = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * (1.08 + i / 24 * 0.84); band.push([Math.cos(a) * 150, -185 + Math.sin(a) * 150]); }
    for (let i = 24; i >= 0; i--) { const a = Math.PI * (1.08 + i / 24 * 0.84); band.push([Math.cos(a) * 134, -185 + Math.sin(a) * 134]); }
    cut(ctx, band, RE.headset, { seed: sd + 6, amp: 1.5, edgeW: 5 });
    cut(ctx, rrPts(116, -212, 36, 60, 14), RE.headset, { seed: sd + 7, amp: 1.5, edgeW: 5 });
    ctx.save(); ctx.strokeStyle = RE.headset; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-140, -160); ctx.quadraticCurveTo(-128, -96, -62 + look * .5, -92); ctx.stroke(); ctx.restore();
    cut(ctx, rrPts(-164, -216, 48, 78, 18), RE.headset, { seed: sd + 8, amp: 1.5, edgeW: 6 });
    cut(ctx, rrPts(-74 + look * .5, -102, 24, 20, 8), '#2B3550', { seed: sd + 9, amp: 1, edgeW: 4 });
  }
  ctx.restore();
}
// Ρένα ολόσωμη · y = γραμμή ώμων · πίσω από τον πάγκο: rena(ctx, ...RECEPTION.desk, { legs: false }) · opts όπως stratos() + headset
function rena(ctx, x, y, s, o = {}) {
  const sd = o.seed || 3000, [aL, aR] = o.arms || [0.12, 0.12], R = RIG.rena;
  const ao = side => ({ seed: sd + 100, hand: side > 0 ? o.handR : o.handL, elbow: side > 0 ? o.elbowR : o.elbowL, view: side > 0 ? o.viewR : o.viewL, pal: ARMPAL.rena });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.legs !== false) { // φαρδύ navy παντελόνι + λευκά sneakers
    for (const [sg, k] of [[-1, 30], [1, 31]]) {
      cut(ctx, [[sg * 4, 400], [sg * 132, 400], [sg * 146, 820], [sg * 12, 820]], RE.pants, { seed: sd + k, scribble: RE.pantsS });
      const sx = sg * 72;
      cut(ctx, rrPts(sx - 64, 806, 128, 52, 24), RE.shoe, { seed: sd + k + 4, amp: 2 });
      cut(ctx, rectPts(sx - 62, 842, 124, 12), C.sky, { seed: sd + k + 6, amp: 1, edge: false, shadow: false });
    }
  }
  if (o.behindArms) arm(ctx, -1, aL, ao(-1));
  cut(ctx, rrPts(-28, -80, 56, 104, 18), S.skin, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  ctx.save(); ctx.fillStyle = 'rgba(150,80,50,0.22)'; ctx.beginPath(); ctx.ellipse(0, -40, 28, 10, 0, 0, 7); ctx.fill(); ctx.restore();
  const body = cut(ctx, [[-98, -4], [98, -4], [128, 10], [142, 56], [126, 250], [136, 420], [-136, 420], [-126, 250], [-142, 56], [-128, 10]], RE.top, { seed: sd + 25, amp: 3 });
  ctx.save(); L.path(ctx, body); ctx.clip(); ctx.fillStyle = RE.stripe; for (let yy = 42; yy < 430; yy += 44) ctx.fillRect(-160, yy, 320, 14); ctx.restore(); // ριγέ (μπρετόν)
  const neck = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; neck.push([Math.cos(a) * 46, -6 + Math.sin(a) * 28]); }
  cut(ctx, neck, S.skin, { seed: sd + 32, amp: 1, edge: false, shadow: false });
  ctx.save(); ctx.strokeStyle = RE.stripe; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, -6, 48, 32, 0, 0.05, Math.PI - 0.05); ctx.stroke(); ctx.restore();
  if (!o.behindArms) arm(ctx, -1, aL, ao(-1));
  if (!o.armRFront) arm(ctx, 1, aR, ao(1));
  renaHead(ctx, 0, 10, R.headS, o);
  if (o.armRFront) arm(ctx, 1, aR, ao(1));
  if (L.ST.lint) lintRig(ctx, o, aL, aR, R);
  ctx.restore();
  return body;
}

// κούπα της Ρένας (signature prop) · (x, y) = κέντρο · o.steam = lt για ατμό που ανεβαίνει
function mug(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(46, 0, 24, -1.3, 1.3); ctx.stroke(); ctx.restore();
  cut(ctx, rrPts(-46, -52, 92, 104, 14), C.white, { seed: 3401, amp: 1.5, edgeW: 6 });
  ctx.fillStyle = '#5A3A26'; ctx.beginPath(); ctx.ellipse(0, -44, 38, 8, 0, 0, 7); ctx.fill();
  brandMark(ctx, 0, 8, 22, BRAND);
  if (o.steam !== undefined) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const k of [-1, 1]) { const ph = o.steam * 3 + k; ctx.beginPath(); ctx.moveTo(k * 14, -62); ctx.bezierCurveTo(k * 14 + 12 * Math.sin(ph), -84, k * 14 - 12 * Math.sin(ph), -100, k * 14, -122); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}

module.exports = { PH, RE, RIG, phoebus, phoebusHead, rena, renaHead, crewHandPos, mug };

// ---------- character sheet ----------
if (require.main === module) {
  const cv = L.createCanvas(1080, 1920), ctx = cv.getContext('2d'); L.ST.B = 0;
  const { stratos } = require('./stratos.js');
  cut(ctx, rectPts(-40, -40, 1160, 2000), C.pale, { seed: 1, edge: false, shadow: false, scribble: '#BFD0F0' });
  ctx.save(); ctx.translate(540, 130); ctx.rotate(-0.015);
  cut(ctx, rectPts(-470, -80, 940, 160), C.navy, { seed: 2, amp: 5 });
  txt(ctx, 'Γνωρίστε την ομάδα', 0, -12, { font: 'bold 64px Round', color: '#fff' });
  txt(ctx, '«Το Εργαστήριο» · Strategix Studios', 0, 48, { font: '40px Hand', color: C.sky });
  ctx.restore();
  // η τριάδα, ίδια κλίμακα
  const Y = 560, K = 0.5;
  rena(ctx, 190, Y + 14, K, { mouth: 'flat', eyes: 'dot', brows: -0.1, arms: [0.12, 0.9], elbowR: 1.2, handR: 'grip', seed: 3000 });
  mug(ctx, ...crewHandPos('rena', 1, 0.9, K, 190, Y + 14, 1.2), K * 0.9);
  stratos(ctx, 540, Y, K, { mouth: 'grin', eyes: 'dot', brows: 0.6, arms: [0.15, 1.4], elbowR: -1.6, handR: 'thumb', seed: 1000 });
  phoebus(ctx, 890, Y, K, { mouth: 'grin', eyes: 'dot', brows: 0.9, arms: [0.12, 0.55], elbowR: 1.9, handR: 'point', armRFront: true, seed: 2000 });
  [[190, 'Ρένα', 'υποδοχή · deadpan'], [540, 'Στράτος', 'ο μάστορας'], [890, 'Φοίβος', '«ο υπεύθυνος»']].forEach(([x, n, r], i) => {
    ctx.save(); ctx.translate(x, 1075); ctx.rotate([-0.02, 0.015, -0.01][i]);
    cut(ctx, rectPts(-150, -52, 300, 104), C.paper, { seed: 50 + i, amp: 4 });
    txt(ctx, n, 0, -14, { font: 'bold 46px Round', color: C.ink }); txt(ctx, r, 0, 30, { font: '34px Hand', color: C.mid });
    ctx.restore();
  });
  // εκφράσεις
  const cards = [
    ['Φοίβος', [['περήφανος', { mouth: 'grin', eyes: 'happy', brows: 0.9 }], ['σοκ', { mouth: 'shock', eyes: 'shock', brows: 1.2 }], ['στο laser', { mouth: 'closed', eyes: 'dot', brows: -0.4, goggles: 'eyes' }]], phoebusHead, 2000],
    ['Ρένα', [['deadpan', { mouth: 'flat', eyes: 'dot', brows: 0 }], ['στο τηλέφωνο', { mouth: 'E', eyes: 'dot', brows: 0.4, look: -8 }], ['σοκ', { mouth: 'shock', eyes: 'shock', brows: 1.2 }]], renaHead, 3000],
  ];
  cards.forEach(([who, list, fn, seed], row) => list.forEach(([label, o], i) => {
    const cx = 200 + i * 340, cy = 1330 + row * 360;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate([0.025, -0.02, 0.015][i] * (row ? -1 : 1));
    cut(ctx, rectPts(-155, -165, 310, 330), C.paper, { seed: 60 + row * 3 + i, amp: 5 });
    fn(ctx, 0, 118, 0.6, { ...o, seed });
    txt(ctx, label, 0, 138, { font: '40px Hand', color: C.ink });
    ctx.restore();
  }));
  require('fs').writeFileSync('crew_sheet.png', cv.toBuffer('image/png'));
  // στο σκηνικό: η Ρένα πίσω από τον πάγκο της υποδοχής, Στράτος + Φοίβος μπροστά (κλίμακα / αντίθεση με τα χρώματα του χώρου)
  const { reception, RECEPTION } = require('./props/studio.js');
  const cv2 = L.createCanvas(1080, 1920), c2 = cv2.getContext('2d');
  const [dx, dy, ds] = RECEPTION.desk, [sx, sy, ss] = RECEPTION.spot(150, -30), [fx, fy, fs] = RECEPTION.spot(-30, -30);
  reception(c2, 0, {
    cam: RECEPTION.cams.wide,
    behind: c => { rena(c, dx, dy + 14 * ds, ds, { legs: false, mouth: 'flat', arms: [0.12, 0.9], elbowR: 1.2, handR: 'grip' }); mug(c, ...crewHandPos('rena', 1, 0.9, ds, dx, dy + 14 * ds, 1.2), ds * 0.9, { steam: 0.4 }); },
    front: c => { stratos(c, sx, sy, ss, { arms: [0.12, 0.12], look: 8, mouth: 'closed' }); phoebus(c, fx, fy, fs, { mouth: 'grin', brows: 0.9, arms: [0.12, 0.55], elbowR: 1.9, handR: 'point', armRFront: true }); },
  });
  require('fs').writeFileSync('crew_desk_sheet.png', cv2.toBuffer('image/png'));
  // πόζες αναφοράς (αρθρώσεις: ώμοι, αγκώνες, δάχτυλα) — medium shot, 3 χαρακτήρες × 4 πόζες HANDS.md
  const POSES = [
    { arms: [0.12, 0.12] },
    { arms: [0.5, 0.5], elbowL: -1.1, elbowR: -1.1, handL: 'open', handR: 'open', hintL: 'shrug', hintR: 'shrug', mouth: 'flat', brows: 0.8 },
    { arms: [0.12, 1.4], elbowR: -1.6, handR: 'thumb', mouth: 'grin' },
    { arms: [0.12, 0.9], elbowR: 1.2, handR: 'grip', prop: true },
  ];
  const cv3 = L.createCanvas(2000, 2160), c3 = cv3.getContext('2d');
  cut(c3, rectPts(-40, -40, 2080, 2240), C.pale, { seed: 1, edge: false, shadow: false, scribble: '#BFD0F0' });
  [[rena, 'rena', 3000, 14], [stratos, 'stratos', 1000, 0], [phoebus, 'phoebus', 2000, 22]].forEach(([fn, who, seed, dy], r) => POSES.forEach(({ prop, ...o }, i) => {
    const x = 250 + i * 500, y = 330 + r * 700 + dy * 0.55, k = 0.55;
    fn(c3, x, y, k, { legs: false, seed, ...o });
    if (prop) { const hp = who === 'stratos' ? handPos(1, 0.9, k, x, y, 1.2) : crewHandPos(who, 1, 0.9, k, x, y, 1.2); mug(c3, ...hp, k * 0.9); }
  }));
  require('fs').writeFileSync('crew_poses_sheet.png', cv3.toBuffer('image/png'));
  console.log('crew_sheet.png · crew_desk_sheet.png · crew_poses_sheet.png');
}
