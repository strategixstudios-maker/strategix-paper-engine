// ORGANIC — «Πριν / Μετά» · Η τζαμαρία · host: Στράτος · VO ElevenLabs «Stratos» + SFX (plotter · peel · squeegee)
// Ίδιο μαγαζί, ίδια τζαμαρία: Α = άδειο τζάμι, Β = λογότυπο σε βινύλιο. Montage: plotter → weeding → transfer tape → τζάμι.
// Χωρίς αριθμούς/ισχυρισμούς (μόνο η διαδικασία). CTA = comment bait «Α ή Β; Και γιατί;».
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow, rng, person } = L;
const { stratos } = require('./stratos.js');
const { BRAND, cafeLogo, reach, bgFlat, sparkle, seriesTag, stamp } = require('./props.js');

// VO = vo/pm01_vo.mp3 @ 0,1s (ElevenLabs eleven_v3, φωνή «Stratos», take 2/2 · παύσεις σφιγμένες στα 0,3s, 0,42s πριν το «Ένα αυτοκόλλητο»). Χρονισμοί (απόλυτοι, silence detect):
// 0,22 Ίδιο μαγαζί. | 1,34 Ίδια τζαμαρία. | 2,51 Μία διαφορά. | 3,74 Ένα αυτοκόλλητο. | 4,93 Κόβουμε το λογότυπό σου σε βινύλιο...
// 6,97 το καθαρίζουμε... | 8,08 και το περνάμε στο τζάμι. | 9,46 Και ξαφνικά, | 10,50 η τζαμαρία σου δουλεύει για σένα. | 12,32 Όλη μέρα.
// 13,39 Εσύ ποιο μαγαζί θα διάλεγες; | 15,52 Και γιατί; (–16,09)
const T = { idio: 0.22, idia: 1.34, diafora: 2.51, ena: 3.74, kovoume: 4.93, katharizoume: 6.97, pername: 8.08, ksafnika: 9.46, tzamaria: 10.5, oli: 12.32, esy: 13.39, giati: 15.52, end: 16.09 };
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
// ---------- vinyl sheet (offscreen layers, sheet-local coords) ----------
const SW = 860, SH = 700, SX0 = 110, SY0 = 470;            // φύλλο στην οθόνη (medium)
const LX = 430, LY = 485, LS = 2.7;                          // λογότυπο μέσα στο φύλλο
const VIN = C.navy, VINB = '#5E6D9C', BACK = '#F4F0E4';      // vinyl · πίσω πλευρά (κόλλα) · backing liner
const mk = () => { const c = L.createCanvas(SW, SH); return [c, c.getContext('2d')]; };
function logoText(x, s) { x.save(); x.translate(LX, LY); x.scale(LS, LS); x.font = '46px Brand'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = VIN; x.fillText(s, 0, 14); x.restore(); }
// τόνος του É = διαφορά «É» − «E» (ίδιο advance στην Poppins)
const [accC, ac] = mk(); logoText(ac, 'ANNA CAFÉ'); ac.globalCompositeOperation = 'destination-out';
for (const [ox, oy] of [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) { ac.save(); ac.translate(ox, oy); logoText(ac, 'ANNA CAFE'); ac.restore(); }
const ACC = (() => { const dd = ac.getImageData(0, 0, SW, SH).data; let x0 = SW, y0 = SH, x1 = 0, y1 = 0; for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if (dd[(y * SW + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }; })();
// καθαρό mask τόνου (χωρίς antialias fringe του E): γέμισμα του bbox από το original
const [accOnly, ao] = mk(); ao.save(); ao.beginPath(); ao.rect(ACC.x - ACC.w / 2 - 2, ACC.y - ACC.h / 2 - 2, ACC.w + 4, ACC.h + 4); ao.clip(); logoText(ao, 'ANNA CAFÉ'); ao.restore();
const [logoC, lc] = mk(); cafeLogo(lc, LX, LY, LS, 'good', 1, VIN); lc.globalCompositeOperation = 'destination-out'; lc.drawImage(accOnly, 0, 0);
const [fullC, fc] = mk(); cafeLogo(fc, LX, LY, LS, 'good', 1, VIN);
function wasteLayer(col) { // vinyl γύρω από το λογότυπο, με κενό κοπής (dilate 5px)
  const [c, x] = mk(); x.fillStyle = col; x.fillRect(0, 0, SW, SH); x.globalCompositeOperation = 'destination-out';
  for (let a = 0; a < 16; a++) x.drawImage(fullC, Math.cos(a / 16 * 6.283) * 5, Math.sin(a / 16 * 6.283) * 5);
  return c;
}
const wasteC = wasteLayer(VIN), wasteBackC = wasteLayer(VINB);
const [gridC, gc] = mk(); gc.fillStyle = BACK; gc.fillRect(0, 0, SW, SH); gc.strokeStyle = 'rgba(40,60,110,0.10)'; gc.lineWidth = 2;
for (let g = 50; g < SW; g += 50) { gc.beginPath(); gc.moveTo(g, 0); gc.lineTo(g, SH); gc.stroke(); } for (let g = 50; g < SH; g += 50) { gc.beginPath(); gc.moveTo(0, g); gc.lineTo(SW, g); gc.stroke(); }
function tapeLayer(back) { // transfer tape (ημιδιάφανο, με grid) · back = πλευρά κόλλας
  const [c, x] = mk(); x.fillStyle = back ? 'rgba(236,232,218,0.93)' : 'rgba(244,238,214,0.62)'; x.fillRect(24, 34, SW - 48, SH - 68);
  x.strokeStyle = 'rgba(120,110,80,0.18)'; x.lineWidth = 2; for (let g = 74; g < SW - 24; g += 50) { x.beginPath(); x.moveTo(g, 34); x.lineTo(g, SH - 34); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,0.28)'; x.beginPath(); x.moveTo(60, 34); x.lineTo(210, 34); x.lineTo(90, SH - 34); x.lineTo(24, SH - 34); x.closePath(); x.fill();
  return c;
}
const tapeC = tapeLayer(false), tapeBackC = tapeLayer(true);

// ---------- peel (γενικό: weeding + transfer tape) ----------
const R2 = Math.SQRT2, DMAX = (SW + SH) / R2;
const dotN = (x, y) => (x + y) / R2;                        // απόσταση κατά τη διαγώνιο n = (1,1)/√2
function clipSide(ctx, p, ahead) { const c = p * R2, K = 4000; ctx.beginPath(); if (ahead) { ctx.moveTo(c + K, -K); ctx.lineTo(K * 2, K * 2); ctx.lineTo(-K, c + K); } else { ctx.moveTo(-K, -K); ctx.lineTo(c + K, -K); ctx.lineTo(-K, c + K); } ctx.closePath(); ctx.clip(); }
function chordMid(q) { // μέσο της χορδής x+y = q√2 μέσα στο φύλλο
  const c = q * R2, pts = [[c, 0], [0, c], [SW, c - SW], [c - SH, SH]].filter(([x, y]) => x >= -1 && x <= SW + 1 && y >= -1 && y <= SH + 1);
  if (pts.length < 2) return [SW, SH]; return [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
}
// front = layer που ξεκολλάει (ζωγραφίζεται στο d ≥ p) · back = η πίσω πλευρά του, καθρεφτισμένη στο flap [p, p+fw]
function peel(ctx, p, fw, front, back) {
  ctx.save(); clipSide(ctx, p, true); ctx.drawImage(front, 0, 0); ctx.restore();
  if (p <= 0 || fw <= 1) return null;
  ctx.save(); clipSide(ctx, p, true); clipSide(ctx, p + fw, false);
  ctx.save(); ctx.translate(7, 10); ctx.transform(0, -1, -1, 0, p * R2, p * R2); ctx.globalAlpha = 0.25; ctx.filter = 'brightness(0)'; ctx.drawImage(back, 0, 0); ctx.restore(); // σκιά flap
  ctx.save(); ctx.transform(0, -1, -1, 0, p * R2, p * R2); ctx.drawImage(back, 0, 0); ctx.restore();
  const [ax, ay] = [p / R2, p / R2], g = ctx.createLinearGradient(ax, ay, ax + fw / R2, ay + fw / R2);
  g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.12, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,20,50,0.28)');
  ctx.fillStyle = g; ctx.fillRect(-50, -50, SW + 100, SH + 100); ctx.restore();
  return chordMid(p + fw);
}

// ---------- μικρά props (1η χρήση) ----------
function pencil(ctx, x, y, rot, s = 1) { // μολύβι Στράτου (ίδιο με του αυτιού): (x,y) = μύτη
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, [[0, 0], [30, -13], [30, 13]], '#E9C9A0', { seed: 9101, amp: 1, edgeW: 5 });
  cut(ctx, [[0, 0], [11, -5], [11, 5]], '#3A3F4E', { seed: 9102, amp: 0.5, edge: false, shadow: false });
  cut(ctx, rectPts(30, -13, 330, 26), '#F6D25A', { seed: 9103, amp: 1, edgeW: 5 });
  cut(ctx, rectPts(360, -14, 26, 28), '#B9BFCB', { seed: 9104, amp: 0.8, edgeW: 4 });
  cut(ctx, rrPts(386, -13, 34, 26, 8), '#F29C9C', { seed: 9105, amp: 0.8, edgeW: 4 });
  ctx.restore();
}
function squeegee(ctx, x, y, s = 1) { // ράκλα κάτοψη (κάθετη): (x,y) = κέντρο της κόψης
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, rrPts(-44, -230, 88, 460, 30), BRAND, { seed: 9201, amp: 1.5, scribble: '#3F67F5' });
  cut(ctx, rrPts(-52, -236, 20, 472, 8), '#101A33', { seed: 9202, amp: 1, edgeW: 5 }); // felt edge
  ctx.restore();
}
function plotterRail(ctx, y, headX, lt) { // plotter κάτοψη: ράγα + κεφαλή με λεπίδα στο (headX, y)
  cut(ctx, rectPts(-40, y - 70, W + 80, 58), '#C9CDD6', { seed: 9301, amp: 1.5, edgeW: 7 });
  cut(ctx, rectPts(-40, y - 26, W + 80, 16), '#6B7284', { seed: 9302, amp: 1, edgeW: 4, shadow: false });
  ctx.save(); ctx.translate(headX, y);
  cut(ctx, rrPts(-78, -150, 156, 150, 22), '#E4E6EC', { seed: 9303, amp: 1.5, scribble: '#D3D6DF' });
  cut(ctx, circlePts(0, -40, 30, 30, 20), '#3A3F4E', { seed: 9304, amp: 1, edgeW: 5 });
  cut(ctx, circlePts(0, -40, 12, 12, 12), '#9AA1B2', { seed: 9305, amp: 0.6, edge: false, shadow: false });
  txt(ctx, 'CUT', 0, -112, { font: 'bold 26px Brand', color: '#9AA1B2' });
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(0, 0, 3 + Math.sin(lt * 40) * 1, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- φύλλο vinyl ----------
// o.p = peel · o.cutX = μέχρι πού έχει κοπεί (plotter) · o.lift = τόνος που σηκώνεται (0..1) · o.weeded · o.grip = χέρι στο flap
function sheet(ctx, lt, o = {}) {
  ctx.save(); ctx.translate(SX0, SY0);
  const pf = cut(ctx, rectPts(0, 0, SW, SH), BACK, { seed: 9401, amp: 2.5, edgeW: 9 });
  ctx.save(); L.path(ctx, pf); ctx.clip(); ctx.drawImage(gridC, 0, 0);
  const cutX = o.cutX ?? SW + 10, p = o.p ?? 0, lift = o.lift ?? 0;
  ctx.drawImage(logoC, 0, 0); if (lift <= 0) ctx.drawImage(accOnly, 0, 0);
  let grip = null;
  if (!o.weeded) {
    ctx.save(); ctx.beginPath(); ctx.rect(cutX, -10, SW + 20, SH + 20); ctx.clip(); ctx.fillStyle = VIN; ctx.fillRect(0, 0, SW, SH); ctx.restore(); // ακόμα άκοπο
    ctx.save(); ctx.beginPath(); ctx.rect(-10, -10, cutX + 10, SH + 20); ctx.clip();
    grip = peel(ctx, p, Math.min(p, o.fw ?? 170), wasteC, wasteBackC); ctx.restore();
  }
  if (o.tape) { ctx.save(); ctx.translate(0, o.tapeY || 0); ctx.drawImage(tapeC, 0, 0); ctx.restore(); }
  ctx.restore();
  if (lift > 0) { // τόνος που σηκώνεται μαζί με το waste
    const wob = Math.sin(lt * 9) * 0.08 * lift;
    ctx.save(); ctx.translate(ACC.x + lift * 34, ACC.y - lift * 30); ctx.rotate(-0.7 * lift + wob); ctx.scale(1 + 0.55 * lift, 1 + 0.55 * lift);
    ctx.shadowColor = 'rgba(5,10,30,0.35)'; ctx.shadowBlur = 6 + 14 * lift; ctx.shadowOffsetX = 5 + 10 * lift; ctx.shadowOffsetY = 7 + 14 * lift;
    ctx.drawImage(accOnly, -ACC.x, -ACC.y); ctx.restore();
  }
  ctx.restore();
  return grip ? [SX0 + grip[0], SY0 + grip[1]] : null;
}
const ACCW = [SX0 + ACC.x, SY0 + ACC.y];                    // τόνος σε world coords
const P_ACC = dotN(ACC.x, ACC.y) - 4, P_END = DMAX + 200;   // peel μέχρι τον τόνο · μέχρι έξω

function zoomAt(ctx, cx, cy, z, tx = cx, ty = cy) { ctx.translate(tx, ty); ctx.scale(z, z); ctx.translate(-cx, -cy); }
function table(ctx) { bgFlat(ctx, C.pale, '#BFD0F0', 31); }


// βιτρίνα café
const WIN = [100, 450, 880, 860]; // x, y, w, h (τζάμι)
function shopfront(ctx) {
  bgFlat(ctx, '#E9DCC4', '#DCCBAE', 41);
  cut(ctx, rectPts(WIN[0] - 34, WIN[1] - 34, WIN[2] + 68, WIN[3] + 68), C.navy, { seed: 9601, amp: 2, scribble: '#1B2D62' });
  cut(ctx, rectPts(...WIN), '#A9C3F1', { seed: 9602, amp: 1.5, edge: false, shadow: false });
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff';
  for (const [x0, w0] of [[WIN[0] + 90, 70], [WIN[0] + 200, 26], [WIN[0] + 560, 90]]) { ctx.beginPath(); ctx.moveTo(x0, WIN[1]); ctx.lineTo(x0 + w0, WIN[1]); ctx.lineTo(x0 + w0 - 260, WIN[1] + WIN[3]); ctx.lineTo(x0 - 260, WIN[1] + WIN[3]); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  cut(ctx, rectPts(-40, WIN[1] + WIN[3] + 34, W + 80, 600), '#8B5E3C', { seed: 9603, amp: 2, scribble: '#7A5033' }); // ποδιά βιτρίνας
}
const WS = 0.92, WX = WIN[0] + WIN[2] / 2 - SW * WS / 2, WY = WIN[1] + WIN[3] / 2 - SH * WS / 2 + 20;
function onGlass(ctx, lt, tp, tapeOn) { // λογότυπο στο τζάμι + transfer tape που ξεκολλάει (tp = peel)
  ctx.save(); ctx.translate(WX, WY); ctx.scale(WS, WS);
  ctx.drawImage(logoC, 0, 0); ctx.drawImage(accOnly, 0, 0);
  let g = null; if (tapeOn) g = peel(ctx, tp, Math.min(tp, 190), tapeC, tapeBackC);
  ctx.restore();
  return g ? [WX + g[0] * WS, WY + g[1] * WS] : null;
}

// ---------- δρόμος: δύο ίδια μαγαζιά (Α | Β) ----------
const GROUND = 1270, KERB = 1340;
const SHOP = cx => ({ x: cx - 245, y: 610, w: 490, h: 560 }); // τζάμι κάθε μαγαζιού
function awning(ctx, cx, seed) {
  const x0 = cx - 265, w = 530, y0 = 470, h = 110, n = 8;
  cut(ctx, rectPts(x0, y0, w, h), '#FBFAF6', { seed, amp: 2, edgeW: 8 });
  for (let i = 0; i < n; i += 2) cut(ctx, rectPts(x0 + i * w / n, y0, w / n, h), C.navy, { seed: seed + 1 + i, amp: 1.2, edge: false, shadow: false });
  for (let i = 0; i < n; i++) { const xx = x0 + i * w / n; cut(ctx, [[xx, y0 + h], [xx + w / n, y0 + h], [xx + w / n / 2, y0 + h + 34]], i % 2 ? '#FBFAF6' : C.navy, { seed: seed + 20 + i, amp: 1, edgeW: 5 }); }
}
function shop(ctx, lt, cx, branded, sd, o = {}) {
  cut(ctx, rectPts(cx - 270, 400, 540, GROUND - 400), '#E9DCC4', { seed: sd, amp: 2, scribble: '#DCCBAE', edge: false, shadow: false });
  const g = SHOP(cx);
  cut(ctx, rectPts(g.x - 22, g.y - 22, g.w + 44, g.h + 44), C.navy, { seed: sd + 1, amp: 1.5, scribble: '#1B2D62' });
  cut(ctx, rectPts(g.x, g.y, g.w, g.h), o.night ? '#F4D98A' : '#A9C3F1', { seed: sd + 2, amp: 1, edge: false, shadow: false });
  ctx.save(); ctx.beginPath(); ctx.rect(g.x, g.y, g.w, g.h); ctx.clip(); ctx.globalAlpha = 0.33; ctx.fillStyle = '#fff';
  for (const [x0, w0] of [[g.x + 60, 50], [g.x + 140, 18], [g.x + 330, 60]]) { ctx.beginPath(); ctx.moveTo(x0, g.y); ctx.lineTo(x0 + w0, g.y); ctx.lineTo(x0 + w0 - 200, g.y + g.h); ctx.lineTo(x0 - 200, g.y + g.h); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  if (branded) { const s = (o.logoS ?? 1) * 0.56; ctx.save(); ctx.translate(cx, g.y + g.h / 2 + 10); ctx.scale(s, s); ctx.translate(-SW / 2, -SH / 2); ctx.drawImage(logoC, 0, 0); ctx.drawImage(accOnly, 0, 0); ctx.restore(); }
  awning(ctx, cx, sd + 10);
}
function street(ctx, lt, o = {}) {
  bgFlat(ctx, o.night ? '#2B3A66' : C.pale, o.night ? '#23305A' : '#BFD0F0', 51);
  shop(ctx, lt, 270, false, 5100, o); shop(ctx, lt, 810, true, 5200, o);
  cut(ctx, rectPts(-40, GROUND, W + 80, KERB - GROUND), '#C9CDD6', { seed: 5301, amp: 2, scribble: '#B9BFCB' }); // πεζοδρόμιο
  cut(ctx, rectPts(-40, KERB, W + 80, H - KERB + 40), '#5B6272', { seed: 5302, amp: 2, scribble: '#4E5566' });   // δρόμος
}
function splitLabels(ctx, lt, st) { // διαχωριστικό + Α / Β
  cut(ctx, [[528, 380], [552, 380], [556, GROUND + 20], [524, GROUND + 20]], '#FBFAF6', { seed: 5401, amp: 3, edgeW: 6 });
  pop(ctx, lt, st, 270, 1420, () => { cut(ctx, circlePts(0, 0, 78, 78, 30), '#FBFAF6', { seed: 5402, amp: 2 }); txt(ctx, 'Α', 0, 6, { font: 'bold 96px Round', color: C.navy }); });
  pop(ctx, lt, st + 0.15, 810, 1420, () => { cut(ctx, circlePts(0, 0, 78, 78, 30), BRAND, { seed: 5403, amp: 2 }); txt(ctx, 'Β', 0, 6, { font: 'bold 96px Round', color: '#fff' }); });
}
const rel = (k, s) => T[k] - S[s];
const S = { a: 0, b: T.ena - 0.15, c: T.kovoume - 0.15, d: 6.35, e: 7.6, f: 8.4, g: T.ksafnika - 0.1, h: T.esy - 0.2, i: T.end + 0.4 }; // montage: plotter 1,6s · weeding 1,25s · tape 0,8s · τζάμι 0,95s
const d = k => { const ks = Object.keys(S), i = ks.indexOf(k); return S[ks[i + 1]] - S[k]; };

// ---------- σκηνές ----------
function sA(ctx, lt) { // hook: split Α | Β
  street(ctx, lt); splitLabels(ctx, lt, 0.1);
  captionSeq(ctx, lt, [[0.05, 'Ίδιο μαγαζί. Ίδια τζαμαρία.'], [rel('diafora', 'a') - 0.05, 'Μία διαφορά.']]);
  seriesTag(ctx, lt, 'Πριν / Μετά');
}
function sB(ctx, lt) { // Στράτος ανάμεσα, δείχνει το Β
  street(ctx, lt);
  const a = lerp(0.12, 1.45, easeOut(prog(lt, 0.05, 0.4)));
  stratos(ctx, 470, 1060, 0.7, { seed: 1000, legs: false, arms: [0.12, a], handR: a > 1.2 ? 'point' : 'relaxed', mouth: lipsync(VO, 'grin'), blink: blinkNow(), eyes: 'happy', brows: 0.6, look: 12 });
  sparkle(ctx, 960, 760, 1, lt, 0.35, 11);
  captionSeq(ctx, lt, [[0.05, 'Ένα αυτοκόλλητο.']]);
}
function sC(ctx, lt) { // montage 1: plotter κόβει
  table(ctx);
  const dur = d('c'), u = prog(lt, 0, dur + 0.2), bx = lerp(30, SW - 40, u);
  const cy = LY - 60 + Math.sin(lt * 7.3) * 150 + Math.sin(lt * 17.1) * 40;
  ctx.save(); zoomAt(ctx, SX0 + bx, SY0 + cy, 1.45, 540, RAIL_Y); sheet(ctx, lt, { cutX: bx }); ctx.restore();
  plotterRail(ctx, RAIL_Y, 540, lt);
  captionSeq(ctx, lt, [[0.05, 'Κόβουμε το λογότυπό σου σε βινύλιο...']]);
}
function sD(ctx, lt) { // montage 2: weeding
  table(ctx);
  const p = lerp(0, P_END, easeInOut(prog(lt, 0.1, d('d') + 0.1)));
  const g = sheet(ctx, lt, { p }); if (g && p < P_END - 80) reach(ctx, g[0], g[1], 420, 380, { hand: 'fist', seed: 9500 });
  captionSeq(ctx, lt, [[-1, 'Κόβουμε το λογότυπό σου σε βινύλιο...'], [rel('katharizoume', 'd') - 0.05, '...το καθαρίζουμε...']]);
}
function sE(ctx, lt) { // montage 3: transfer tape + ράκλα
  table(ctx);
  const tapeY = lerp(-SH - 600, 0, easeOut(prog(lt, 0.02, 0.25)));
  sheet(ctx, lt, { weeded: true, tape: true, tapeY });
  const sq = prog(lt, 0.25, 0.75);
  if (sq > 0 && sq < 1) { const x = SX0 + lerp(20, SW - 20, easeInOut(sq)); squeegee(ctx, x, SY0 + SH / 2); reach(ctx, x, SY0 + SH / 2 + 60, 120, 700, { hand: 'fist', seed: 9520 }); }
  captionSeq(ctx, lt, [[-1, '...το καθαρίζουμε...'], [rel('pername', 'e') - 0.05, '...και το περνάμε στο τζάμι.']]);
}
function sF(ctx, lt) { // montage 4: στο τζάμι — ξεκόλλημα transfer tape
  shopfront(ctx);
  const tp = lerp(0, P_END, easeInOut(prog(lt, 0.05, d('f') - 0.12)));
  const g = onGlass(ctx, lt, tp, true);
  if (g && tp < P_END - 60) reach(ctx, g[0], g[1], 420, 380, { hand: 'fist', seed: 9540 });
  captionSeq(ctx, lt, [[-1, '...και το περνάμε στο τζάμι.']]); // συνέχεια της ίδιας φράσης
}
// περαστικοί (bust, «περπατάνε» με bob) — ο 1ος περνάει το Α αδιάφορος και σταματάει στο Β
function walker(ctx, lt, x, s, o) { const bob = Math.abs(Math.sin(lt * 9 + (o.ph || 0))) * 10 * (o.walk ?? 1); person(ctx, x, 1185 - bob, s, o); }
function sG(ctx, lt) {
  const night = lt > rel('oli', 'g') + 0.1;
  street(ctx, lt, { night });
  const stopT = 1.5, x1 = lt < stopT ? lerp(-120, 800, easeInOut(prog(lt, 0, stopT))) : 800, turned = lt > stopT + 0.1;
  const x2 = lerp(1250, -150, prog(lt, 0.4, d('g')));
  walker(ctx, lt, x2, 0.5, { seed: 5600, type: 'woman', shirt: '#7CC39B', shirtS: '#69B188', look: night ? 18 : -8, walk: 1, ph: 1, mood: night ? 'happy' : undefined });
  walker(ctx, lt, x1, 0.55, { seed: 5500, shirt: '#E86A5A', shirtS: '#D55A4B', hairC: '#3A2A20', look: turned ? 20 : -10, walk: lt < stopT ? 1 : 0, mood: turned ? 'happy' : undefined });
  if (turned) pop(ctx, lt, stopT + 0.1, x1 + 125, 1085, () => { cut(ctx, circlePts(0, 0, 44, 44, 20), '#FBFAF6', { seed: 5610, amp: 2 }); txt(ctx, '!', 0, 4, { font: 'bold 70px Round', color: BRAND }); });
  cut(ctx, rectPts(-40, KERB - 60, W + 80, 200), '#C9CDD6', { seed: 5303, amp: 2, scribble: '#B9BFCB' }); // πεζοδρόμιο μπροστά (κρύβει τον κορμό)
  cut(ctx, rectPts(-40, KERB + 130, W + 80, 22), '#9AA1B2', { seed: 5304, amp: 1.5, edgeW: 5, shadow: false });
  captionSeq(ctx, lt, [[0.05, 'Και ξαφνικά, η τζαμαρία σου δουλεύει για σένα.'], [rel('oli', 'g'), 'Όλη μέρα.']]);
}
function sH(ctx, lt) { // CTA: split Α | Β + Στράτος «ζυγαριά»
  street(ctx, lt); splitLabels(ctx, lt, 0.05);
  const w = Math.sin(lt * 3.2) * 0.12;
  stratos(ctx, 540, 1080, 0.62, { seed: 1000, legs: false, arms: [0.5 + w, 0.5 - w], elbowL: -1.1, elbowR: -1.1, handL: 'open', handR: 'open', hintL: 'shrug', hintR: 'shrug', mouth: lipsync(VO, 'smile'), blink: blinkNow(), eyes: 'dot', brows: 0.8, look: 0 });
  captionSeq(ctx, lt, [[0.05, 'Εσύ ποιο μαγαζί θα διάλεγες;'], [rel('giati', 'h'), 'Α ή Β; Γράψε και γιατί.']]);
  seriesTag(ctx, lt, 'Πριν / Μετά');
}
function sI(ctx, lt) { sA(ctx, 99); } // loop → frame 0 (labels ήδη ανοιχτά — σχεδόν αόρατο loop)

const RAIL_Y = 830;
const SCENES = [[sA, d('a')], [sB, d('b')], [sC, d('c')], [sD, d('d')], [sE, d('e')], [sF, d('f')], [sG, d('g')], [sH, d('h')], [sI, 0.3]], WIPES = [2, 5, 6, 7];
const Sc = (k, t) => S[k] + t;
require('./render.js')({
  name: 'pm01_vitrina',
  SCENES, WIPES, // wipes → auto whoosh
  VO_FILE: require('fs').existsSync('vo/pm01_vo.mp3') ? 'vo/pm01_vo.mp3' : undefined, VO_AT: 0.1,
  SFX: [
    [0.15, 'pop', { note: 'Α' }], [0.3, 'pop', { f0: 860, note: 'Β' }],
    [Sc('b', 0.1), 'swoosh', { note: 'δείχνει το Β' }], [Sc('b', 0.35), 'shimmer', { gain: 0.6 }],
    [Sc('c', 0.02), 'plotter', { dur: d('c'), gain: 1.3, note: 'λεπίδα κόβει' }],
    [Sc('d', 0.05), 'peel', { dur: d('d'), speed: 0.6, gain: 1.3, note: 'weeding' }],
    [Sc('e', 0.02), 'slide', { dur: 0.25, gain: 0.7, note: 'transfer tape' }], [Sc('e', 0.24), 'squeegee', { dur: 0.55, gain: 1.3, note: 'ράκλα' }],
    [Sc('f', 0.05), 'peel', { dur: d('f') - 0.1, speed: 0.8, seed: 21, gain: 1.3, note: 'ξεκόλλημα tape' }], [Sc('f', d('f') - 0.25), 'shimmer', { gain: 0.8, note: 'λογότυπο στο τζάμι' }],
    [Sc('g', 1.6), 'ding', { gain: 0.6, note: 'περαστικός σταματάει' }], [Sc('g', rel('oli', 'g') + 0.1), 'air', { gain: 0.6, note: 'μέρα → νύχτα' }],
    [Sc('h', 0.1), 'pop', { note: 'Α' }], [Sc('h', 0.25), 'pop', { f0: 860, note: 'Β' }], [T.giati + 0.05, 'blip', { note: 'CTA' }],
  ],
});
