// ORGANIC — «Πριν / Μετά» · Πώς το DTF άλλαξε την εκτύπωση σε ύφασμα · host: Στράτος · VO ElevenLabs «Stratos» + SFX · 23,0s · seamless loop
// Hook: υποδοχή, κάρτα παραγγελίας με σχέδιο 4 χρωμάτων → Στράτος σοκ. ΤΟΤΕ: παλιό εργαστήριο μεταξοτυπίας, πανικός, 4 τελάρα, ταύτιση, χρόνος/κόστος.
// ΤΩΡΑ: σκίσιμο οθόνης → DTF εκτυπωτής (ένα κλικ, όλα τα χρώματα) → πούδρα, πρέσα, ξεκόλλημα (top-down). CTA: «Μεταξοτυπία ή DTF;» → κάρτα παραγγελίας = frame 0.
const L = require('./lib.js');
const { C, W, H, cut, rrPts, rectPts, circlePts, txt, pop, captionSeq, lerp, clamp, prog, easeOut, easeIn, easeInOut, lipsync, blinkNow } = L;
const { stratos, poseAt } = require('./stratos.js');
const { BRAND, reception, RECEPTION, bgFlat, clock, tshirt, reach, stamp, seriesTag, sparkle, ctaButton, cuttingMat, SCREEN, screenFrame, walker } = require('./props.js');

// VO = vo/pm02_vo.mp3 @ 0,2s (eleven_v3, «Stratos», take 1/2 · atempo 1.05 · «αυτό σήμαινε» ×1.15 · παύσεις → 0,28s, καμία πριν το «πανικό», 0,45s πριν το «Μετά ήρθε»).
// Φράσεις (video): 0,33 Σχέδιο με τέσσερα χρώματα; | 2,43 [sighs] Πριν το DTF, | 4,00 αυτό σήμαινε (4,74) πανικό. | 5,60 Τέσσερα τελάρα. | 6,70 Ταύτιση στο χιλιοστό.
// 8,13 Χρόνος, κόστος... | 9,73 και για λίγα κομμάτια, | 10,97 δεν έβγαινε. | 11,97 Μετά ήρθε το DTF. | 13,30 Ένα κλικ, | 14,07 και βγαίνουν όλα τα χρώματα μαζί.
// 15,80 Πούδρα, πρέσα, | 16,93 έτοιμο. | 17,60 Ακόμα και για ένα κομμάτι. | 19,03 Μεταξοτυπία ή DTF; | 20,63 Εσύ τι θα διάλεγες; | 21,93 Και γιατί; (–22,33)
const T = { dots: [0.95, 1.1, 1.25, 1.4], shock: 1.55, prin: 2.43, auto: 4.0, panik: 4.74, telara: 5.6, tayt: 6.7, xronos: 8.13, ligo: 9.73, den: 10.97,
  meta: 11.97, klik: 13.3, print: 14.07, poudra: 15.8, etoimo: 16.93, akoma: 17.6, metax: 19.03, esy: 20.63, giati: 21.93, end: 22.33 };
Object.assign(T, { snap: T.tayt + 0.73, kostos: T.xronos + 0.63, printEnd: T.print + 1.42, presa: T.poudra + 0.43, dtf: T.metax + 0.8 });   // μέσα στις φράσεις
const SC = [0, 2.35, T.telara - 0.05, T.xronos - 0.07, T.meta - 0.15, T.poudra - 0.12, T.metax - 0.1];                               // αρχές σκηνών
const OUT = T.end + 0.05, END = OUT + 0.6;                                                                                              // CTA φεύγει · τέλος (= frame 0)
const VO = [];
const TAG = 'Πριν / Μετά', HOOK = 'Σχέδιο με 4 χρώματα;';

// ---------- το σχέδιο: «sunset» 4 χρωμάτων (ήλιος · λόφοι · θάλασσα · navy φοίνικας/δαχτυλίδι) — μονάδες R = 100 ----------
const YEL = '#F5D547', COR = '#F0715A', TEAL = '#27AFA0', INKS = [YEL, COR, TEAL, C.navy];
const SUN = circlePts(-36, -24, 32, 32, 28);
const HILLS = [[-112, 16], [-66, -20], [-34, 2], [10, -34], [56, 0], [112, -18], [112, 60], [-112, 60]];
const SEA = [...Array.from({ length: 13 }, (_, i) => [-120 + i * 20, 38 + 5 * Math.sin(i * 1.3)]), [120, 120], [-120, 120]];
const leaf = (a, len) => { const dx = Math.cos(a), dy = Math.sin(a), cx = 46, cy = -36, mx = cx + dx * len * 0.55, my = cy + dy * len * 0.55 + len * 0.12;
  return [[cx, cy], [mx - dy * 8, my + dx * 8], [cx + dx * len, cy + dy * len + len * 0.3], [mx + dy * 5, my - dx * 5]]; };
function layer(ctx, i, col, sd) {
  const o = { seed: sd + i, amp: 0.8, step: 14, edge: false, shadow: false };
  if (i === 0) return cut(ctx, SUN, col, o);
  if (i === 1) return cut(ctx, HILLS, col, o);
  if (i === 2) return cut(ctx, SEA, col, o);
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 94, 0, 7); ctx.stroke();
  cut(ctx, [[50, 72], [62, 72], [55, 20], [50, -34], [43, -34], [47, 20]], col, o);                       // κορμός
  [[-2.9, 44], [-2.3, 48], [-1.6, 40], [-0.9, 48], [-0.25, 44]].forEach(([a, l], k) => cut(ctx, leaf(a, l), col, { ...o, seed: sd + 10 + k }));
  ctx.lineWidth = 5; for (const [bx, by, s] of [[-8, -58, 1], [14, -68, 0.8]]) { ctx.beginPath(); ctx.moveTo(bx - 11 * s, by - 5 * s); ctx.quadraticCurveTo(bx - 4 * s, by - 9 * s, bx, by); ctx.quadraticCurveTo(bx + 4 * s, by - 9 * s, bx + 11 * s, by - 5 * s); ctx.stroke(); }
  ctx.restore();
}
// σχέδιο στο (x, y), ακτίνα r · o.only = μόνο ένα layer (διαχωρισμός χρώματος) · o.col = ένα χρώμα για όλα · o.off[i] = [dx, dy] (μονάδες) ταύτιση ·
// o.grad = εκδοχή DTF (ουρανός/θάλασσα σε ντεγκραντέ) · o.bg = φόντο μέσα στον κύκλο
function artwork(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 100, r / 100);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 100, 0, 7); ctx.clip();
  if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(-100, -100, 200, 200); }
  let fills = INKS;
  if (o.grad) {
    const sky = ctx.createLinearGradient(0, -100, 0, 30); sky.addColorStop(0, '#8FB0EE'); sky.addColorStop(0.55, '#F7B6A0'); sky.addColorStop(1, '#FCE3A0');
    ctx.fillStyle = sky; ctx.fillRect(-100, -100, 200, 200);
    const glow = ctx.createRadialGradient(-36, -24, 20, -36, -24, 70); glow.addColorStop(0, 'rgba(255,240,170,0.9)'); glow.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = glow; ctx.fillRect(-100, -100, 200, 200);
    const hill = ctx.createLinearGradient(0, -34, 0, 50); hill.addColorStop(0, '#F28A6B'); hill.addColorStop(1, '#C8465A');
    const sea = ctx.createLinearGradient(0, 34, 0, 100); sea.addColorStop(0, '#45C9B5'); sea.addColorStop(1, '#1F6F8B');
    fills = ['#FBE06A', hill, sea, C.navy];
  }
  for (let i = 0; i < 4; i++) {
    if (o.only != null && o.only !== i) continue; const [dx, dy] = o.off ? o.off[i] : [0, 0];
    ctx.save(); ctx.translate(dx, dy); layer(ctx, i, o.col || fills[i], o.seed || 3000); ctx.restore();
  }
  ctx.restore(); ctx.restore();
}
function regMark(ctx, x, y, col, s = 1) { // σημάδι ταύτισης ⊕
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(x, y, 13 * s, 0, 7); ctx.moveTo(x - 24 * s, y); ctx.lineTo(x + 24 * s, y); ctx.moveTo(x, y - 24 * s); ctx.lineTo(x, y + 24 * s); ctx.stroke(); ctx.restore();
}
// τελάρο με στένσιλ ενός χρώματος (ξύλινο = ΤΟΤΕ)
const sepScreen = (ctx, x, y, hw, hh, i, o = {}) => screenFrame(ctx, x, y, hw, hh, { col: SCREEN.wood, fill: SCREEN.emul, seed: 7700 + i * 7, ...o,
  inner: (c, iw, ih) => artwork(c, 0, 0, Math.min(iw, ih) * 0.92, { only: i }) });

// ============ ΥΠΟΔΟΧΗ (hook + CTA) ============
const CAM = [390, 900, 2.05];
const SHRUG = { aL: 0.5, aR: 0.5, eL: -1.1, eR: -1.1, hL: 'open', hR: 'open', iL: 'shrug', iR: 'shrug' };
const POSES_R = [
  [0, { look: -10 }],
  [0.85, { aL: 0.9, eL: -0.9, hL: 'open', look: -10, brows: 0.6 }],                      // παρουσιάζει την κάρτα
  [T.shock, { ...SHRUG, eyes: 'shock', brows: 1.2 }],                                    // «τέσσερα;!»
  [SC[6], { aL: 1.6, eL: -0.35, hL: 'point', look: -10, brows: 0.6 }],                  // δείχνει τις δύο κάρτες
  [T.esy - 0.05, { ...SHRUG, brows: 1.0 }],
  [T.giati - 0.05, { ...SHRUG, eyes: 'happy', brows: 1.0 }],
  [OUT, { look: -10 }],                                                                   // = frame 0
];
const CARD = [300, 820];
function orderCard(ctx, t, x, y) { // κάρτα παραγγελίας: το σχέδιο + 4 βούλες χρωμάτων (σκάνε στο hook)
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05);
  cut(ctx, rrPts(-200, -235, 400, 470, 16), C.paper, { seed: 9100, amp: 2, edgeW: 8, scribble: '#EDE7D8' });
  artwork(ctx, 0, -50, 150, { bg: '#FFFFFF' });
  T.dots.forEach((st, i) => { if (t < 0.1 || t > SC[1] + 0.5) return; pop(ctx, t, st, -120 + i * 80, 172, () => {
    cut(ctx, circlePts(0, 0, 30), INKS[i], { seed: 9110 + i, amp: 1, edgeW: 5 }); txt(ctx, String(i + 1), 0, 2, { font: 'bold 34px Round', color: i ? '#fff' : C.navy }); }); });
  ctx.restore();
}
function choiceCard(ctx, t, st, x, y, label, col, icon, seed) {
  pop(ctx, t, st, x, y, () => {
    cut(ctx, rrPts(-210, -150, 420, 300, 18), C.paper, { seed, amp: 2, edgeW: 8, scribble: '#EDE7D8' });
    txt(ctx, label, 0, -92, { font: 'bold 52px Round', color: col }); icon(ctx);
  }, x < 400 ? -0.04 : 0.04);
}
function ctaCards(ctx, t) {
  const k = easeIn(prog(t, OUT, OUT + 0.22)); if (t < T.metax - 0.1 || k >= 1) return;
  ctx.save(); ctx.translate(-700 * k, 0);
  choiceCard(ctx, t, T.metax, 300, 700, 'Μεταξοτυπία', C.navy, c => [0, 1, 2, 3].forEach(i => sepScreen(c, -141 + i * 94, 38, 42, 54, i, { border: 10, step: 9 })), 9200);
  pop(ctx, t, T.dtf - 0.25, 300, 885, () => { cut(ctx, circlePts(0, 0, 40), C.navy, { seed: 9210, amp: 1, edgeW: 6 }); txt(ctx, 'ή', 0, 2, { font: 'bold 44px Round', color: '#fff' }); });
  choiceCard(ctx, t, T.dtf, 300, 1070, 'DTF', BRAND, c => { cut(c, rrPts(-90, -30, 180, 150, 8), '#E3ECFA', { seed: 9220, amp: 1, edgeW: 4 }); artwork(c, 0, 45, 64, { grad: true }); }, 9230);
  ctaButton(ctx, t, T.esy, 540, 1360, 'Γράψε στα σχόλια');
  ctx.restore();
}
function lobby(ctx, t) {
  const pose = poseAt(POSES_R, t), mouth = lipsync(VO, t > T.shock && t < SC[1] ? 'O' : 'smile');
  reception(ctx, t, { cam: CAM, behind: c => stratos(c, ...RECEPTION.desk, { seed: 1000, legs: false, mouth, blink: blinkNow(), ...pose }) });
  if (t < SC[1]) orderCard(ctx, t, ...CARD);
  else { ctaCards(ctx, t); const k = easeOut(prog(t, OUT + 0.15, OUT + 0.4)); if (k > 0) orderCard(ctx, 0, lerp(-320, CARD[0], k), CARD[1]); }
}

// ============ ΤΟΤΕ: παλιό εργαστήριο μεταξοτυπίας ============
const SEP = { wall: '#E9DCBF', wallS: '#DFD0AE', wood: '#C49A68', woodD: '#9C7249', floor: '#8E6B45', floorS: '#80603D' };
const POSES_W = [
  [SC[1], { eyes: 'tired', brows: -0.2 }],                                               // [sighs]
  [T.auto - 0.05, { brows: 0.7, look: 6 }],
  [T.panik - 0.03, { aL: 2.6, aR: 2.6, eL: -0.3, eR: -0.3, hL: 'open', hR: 'open', eyes: 'shock', brows: 1.2 }],   // ΠΑΝΙΚΟΣ
  [SC[3], { aR: 2.2, eR: -0.5, hR: 'point', look: 12, brows: 0.8, eyes: 'shock' }],       // «Χρόνος» → ρολόι
  [T.kostos - 0.05, { aR: 1.2, eR: -0.8, hR: 'point', look: 12, brows: 0.6 }],             // «κόστος» → χαρτονομίσματα
  [T.ligo - 0.05, { ...SHRUG, brows: 0.9, look: -8 }],                                     // ένα μπλουζάκι μόνο
  [T.den - 0.05, { aR: -2.65, hR: 'open', front: true, eyes: 'tired', brows: -0.3 }],      // facepalm
];
const RUN = [ // υπάλληλοι: περίοδος διαδρομής, y, κλίμακα, φορά, φάση
  { P: 1.25, y: 1430, s: 0.74, dir: 1, ph: 0, o: { seed: 5100, shirt: '#7E8C6A', shirtS: '#72805F', mood: 'worried', sweat: true } },
  { P: 1.5, y: 1075, s: 0.52, dir: -1, ph: 0.35, o: { seed: 5200, type: 'woman', shirt: '#B07D5B', shirtS: '#A2714F', mood: 'worried', sweat: true } },
];
function runner(ctx, t, r) {
  const u = (t - T.panik) / r.P + r.ph; if (u < r.ph) return; const lap = Math.floor(u); if (T.panik + (lap - r.ph) * r.P > T.xronos + 1.13) return;
  const f = u - lap, x = r.dir > 0 ? lerp(-280, W + 280, f) : lerp(W + 280, -280, f);
  walker(ctx, t, x, r.y, r.s, { ...r.o, run: 1, dir: r.dir, ph: lap, look: r.dir * 14,
    carry: c => sepScreen(c, r.dir * 30, 150, 150, 175, (lap + (r.dir > 0 ? 0 : 2)) % 4, { rot: r.dir * 0.08, border: 22 }) });
}
function workshop(ctx, t) {
  bgFlat(ctx, SEP.wall, SEP.wallS, 9300);
  cut(ctx, rectPts(-40, 1250, W + 80, 190), SEP.wood, { seed: 9301, amp: 3, edgeW: 7 });                                   // ταμπλάς
  cut(ctx, rectPts(-40, 1430, W + 80, 560), SEP.floor, { seed: 9302, amp: 4, edgeW: 8, scribble: SEP.floorS });
  // σκοινί στεγνώματος + το ένα μπλουζάκι («λίγα κομμάτια»)
  ctx.save(); ctx.strokeStyle = '#6B5236'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, 575); ctx.quadraticCurveTo(540, 625, 1040, 575); ctx.stroke(); ctx.restore();
  if (t > T.ligo - 0.05) pop(ctx, t, T.ligo - 0.05, 330, 725, () => { tshirt(ctx, 0, 0, 0.3, 0, { seed: 7300, logoFn: c => artwork(c, 0, 0, 150) });
    for (const px of [-40, 40]) cut(ctx, rrPts(px - 7, -96, 14, 34, 4), '#B98A55', { seed: 9310 + px, amp: 0.5, edgeW: 3 }); }, 0.03);
  // ράφι με τελάρα
  cut(ctx, rectPts(690, 1060, 380, 22), SEP.woodD, { seed: 9320, amp: 1, edgeW: 5 });
  [[760, 965, 0, -0.07], [870, 960, 1, 0.04], [975, 968, 2, -0.03]].forEach(([x, y, i, r]) => sepScreen(ctx, x, y, 62, 92, i, { rot: r, border: 14, step: 10 }));
  // ρολόι (τρέχει στο «Χρόνος»)
  const fast = t > T.xronos - 0.05, bump = 1 + 0.25 * Math.sin(Math.PI * clamp(prog(t, T.xronos + 0.15, T.xronos + 0.55)));
  ctx.save(); ctx.translate(850, 740); ctx.scale(bump, bump); clock(ctx, 0, 0, 78, t, fast ? 2.5 : 0.08); ctx.restore();
  stamp(ctx, t, SC[1] + 0.12, 215, 560, 'ΤΟΤΕ', -0.1, '#8E6B45', 64);
  // υπάλληλος πίσω · Στράτος πίσω από τον πάγκο · πάγκος · χαρτονομίσματα · υπάλληλος μπροστά
  runner(ctx, t, RUN[1]);
  const panic = t > T.panik && t < T.xronos + 0.93, jit = panic ? Math.sin(t * 47) * 5 : 0;
  stratos(ctx, 540 + jit, 905, 0.85, { seed: 1000, legs: false, mouth: lipsync(VO, panic ? 'shock' : 'closed'), blink: blinkNow(), ...poseAt(POSES_W, t) });
  if (panic) for (const [dx, dy, k] of [[-130, -205, 0], [140, -175, 1]]) cut(ctx, [[540 + dx, 905 + dy], [550 + dx, 928 + dy], [540 + dx, 940 + dy], [530 + dx, 928 + dy]].map(([a, b]) => [a + jit, b + 6 * Math.sin(t * 9 + k)]), C.pale, { seed: 9330 + k, amp: 0.5, edgeW: 3, shadow: false });
  cut(ctx, rectPts(120, 1240, 840, 44), '#B8895A', { seed: 9340, amp: 2, edgeW: 7 });                                     // πάγκος εκτύπωσης
  cut(ctx, rectPts(142, 1282, 796, 170), SEP.woodD, { seed: 9341, amp: 2, edgeW: 6, scribble: '#916A43' });
  for (let i = 0; i < 4; i++) cut(ctx, rrPts(190, 1222 - i * 13, 250, 14, 4), i % 2 ? SCREEN.wood : '#B98A5E', { seed: 9350 + i, amp: 0.8, edgeW: 3 });   // στοίβα τελάρα
  const n = Math.floor(clamp(prog(t, T.kostos, T.kostos + 0.7)) * 8);
  for (let i = 0; i < n; i++) cut(ctx, rrPts(740 + 10 * Math.sin(i * 2.1), 1216 - i * 17, 160, 22, 4), i % 2 ? '#8CC7A0' : '#7DBB93', { seed: 9360 + i, amp: 1, edgeW: 3 });
  if (n > 0) txt(ctx, '€', 820 + 10 * Math.sin((n - 1) * 2.1), 1228 - (n - 1) * 17, { font: 'bold 22px Round', color: C.navy });
  runner(ctx, t, RUN[0]);
}

// ============ ΤΟΤΕ: 4 τελάρα → ταύτιση (insert) ============
const GRID = [[300, 715], [780, 715], [300, 1080], [780, 1080]], ROW = [[195, 600], [415, 600], [665, 600], [885, 600]], MID = [540, 900];
const OFF = [[26, -18], [-30, 14], [18, 26], [-22, -24]];                                  // λάθος ταύτιση (μονάδες σχεδίου)
function screens(ctx, t) {
  bgFlat(ctx, SEP.wall, SEP.wallS, 9400);
  const k = easeInOut(prog(t, T.tayt - 0.05, T.tayt + 0.25));
  for (let i = 0; i < 4; i++) {
    const st = T.telara + i * 0.15, a = easeOut(prog(t, st - 0.14, st));
    if (t >= st - 0.02) pop(ctx, t, st, lerp(GRID[i][0], ROW[i][0], k), lerp(GRID[i][1], ROW[i][1], k), () => sepScreen(ctx, 0, 0, lerp(200, 102, k), lerp(165, 84, k), i, { border: lerp(24, 13, k) }));
    else if (a > 0) artwork(ctx, lerp(MID[0], GRID[i][0], a), lerp(MID[1], GRID[i][1], a), lerp(170, 135, a), { only: i });
    else artwork(ctx, ...MID, 170, { only: i });                                           // ακόμα μέρος του σχεδίου
  }
  if (t < T.tayt - 0.05) return;
  // tee + τα 4 χρώματα πέφτουν στραβά → κουνιούνται → κλακ, ευθυγραμμίζονται
  const ty = lerp(1850, 1110, easeOut(prog(t, T.tayt - 0.05, T.tayt + 0.2))), cx = 540, cy = ty - 44;
  tshirt(ctx, cx, ty, 0.85, 0, { seed: 7400 });
  const snap = easeOut(prog(t, T.snap, T.snap + 0.16));
  for (let i = 0; i < 4; i++) {
    const st = T.tayt + 0.1 + i * 0.15; if (t < st) continue;
    const w = (1 - snap) * 4, d = OFF[i].map((v, j) => v * (1 - snap) + w * Math.sin(t * 11 + i * 2 + j)), drop = 1 + 0.18 * (1 - easeOut(prog(t, st, st + 0.12)));
    ctx.save(); ctx.translate(cx, cy); ctx.scale(drop, drop); ctx.translate(-cx, -cy);
    artwork(ctx, cx, cy, 190, { only: i, off: [d, d, d, d] });
    for (const [mx, my] of [[-205, -225], [205, 225]]) regMark(ctx, cx + mx + d[0] * 1.9, cy + my + d[1] * 1.9, INKS[i]);
    ctx.restore();
  }
}

// ============ ΤΩΡΑ: DTF εκτυπωτής (σκίσιμο οθόνης από το ΤΟΤΕ) ============
const PR = [540, 880], PS = 1.1, SLOT = PR[1] + 136 * PS, CART = [['C', '#22B5E6'], ['M', '#E2438F'], ['Y', YEL], ['K', '#1D2230'], ['W', '#FFFFFF']];
const BTN = [PR[0] + 330 * PS, PR[1] + 70 * PS];
// DTF εκτυπωτής (πρόσοψη): ρολό film πίσω, παράθυρο με την κεφαλή, μελάνια CMYK + W, κουμπί · head = θέση κεφαλής (−1..1) · press 0..1 · on
function dtfPrinter(ctx, x, y, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(o.s || 1, o.s || 1);
  cut(ctx, rrPts(-330, -250, 660, 74, 36), '#DCE6F6', { seed: 9500, amp: 1.5, edgeW: 6 });                                  // ρολό film
  for (const s of [-1, 1]) cut(ctx, rrPts(s * 330 - 26, -262, 52, 98, 16), C.navy, { seed: 9501 + s, amp: 1, edgeW: 5 });
  cut(ctx, rrPts(-420, -190, 840, 330, 34), '#F2F4F9', { seed: 9503, amp: 2, edgeW: 8, scribble: '#E6EAF3' });              // σώμα
  cut(ctx, rrPts(-420, -190, 840, 64, 30), C.navy, { seed: 9504, amp: 1.5, edgeW: 5, shadow: false });
  txt(ctx, 'DTF', -330, -158, { font: 'bold 30px Brand', color: '#fff' });
  cut(ctx, rrPts(-370, -104, 740, 96, 16), '#1B2A55', { seed: 9505, amp: 1, edgeW: 5, shadow: false });                      // παράθυρο
  ctx.save(); ctx.strokeStyle = '#6D7FA8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-350, -56); ctx.lineTo(350, -56); ctx.stroke(); ctx.restore();
  const hx = (o.head || 0) * 290;
  cut(ctx, rrPts(hx - 62, -98, 124, 84, 10), '#E9EDF5', { seed: 9506, amp: 1, edgeW: 4 });                                   // κεφαλή
  CART.slice(0, 4).forEach(([, c], i) => { ctx.fillStyle = c; ctx.fillRect(hx - 44 + i * 23, -40, 16, 14); });
  CART.forEach(([l, c], i) => { const cx = -350 + i * 62;                                                                   // μελάνια
    cut(ctx, rrPts(cx, 10, 48, 70, 8), c, { seed: 9510 + i, amp: 0.8, edgeW: 4 });
    txt(ctx, l, cx + 24, 104, { font: 'bold 24px Round', color: C.navy }); });
  cut(ctx, rrPts(180, 30, 96, 62, 8), C.sky, { seed: 9520, amp: 0.8, edgeW: 4 });                                            // οθονάκι
  if (o.on) { ctx.fillStyle = '#fff'; ctx.fillRect(194, 54, 68 * clamp(o.prog || 0), 12); }
  const pr = 1 - 0.12 * (o.press || 0);
  ctx.save(); ctx.translate(330, 70); ctx.scale(pr, pr); cut(ctx, circlePts(0, 0, 38), o.on ? '#5B82FF' : BRAND, { seed: 9521, amp: 1, edgeW: 6 });
  cut(ctx, [[-10, -15], [16, 0], [-10, 15]], '#fff', { seed: 9522, amp: 0.3, edge: false, shadow: false }); ctx.restore();
  cut(ctx, rrPts(-340, 124, 680, 16, 6), C.navy, { seed: 9523, amp: 0.5, edge: false, shadow: false });                      // σχισμή εξόδου
  ctx.restore();
}
function tearFrom(ctx, t, t0, draw) { // σκίσιμο οθόνης: η προηγούμενη εικόνα (παγωμένη στο t0) σκίζεται στη μέση και φεύγει
  const p = easeIn(prog(t, t0, t0 + 0.45)); if (p >= 1) return;
  const pts = []; for (let y = -60; y <= H + 60; y += 48) pts.push([540 + 34 * Math.sin(y * 0.021) + (L.rng(y)() - 0.5) * 44, y]);
  for (const s of [-1, 1]) {
    const poly = s < 0 ? [[-80, -80], ...pts, [-80, H + 80]] : [[W + 80, -80], ...pts, [W + 80, H + 80]];
    ctx.save(); ctx.translate(s * W * 0.75 * p, 60 * p); ctx.rotate(s * 0.07 * p);
    ctx.save(); L.path(ctx, poly); ctx.clip(); draw(ctx, t0); ctx.restore();
    ctx.strokeStyle = C.paper; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.stroke();
    ctx.restore();
  }
}
function printer(ctx, t) {
  bgFlat(ctx, C.pale, '#D2DEF5', 9600);
  cut(ctx, rectPts(-40, SLOT - 4, W + 80, 950), '#C6D3EC', { seed: 9601, amp: 3, edgeW: 8, scribble: '#BCC9E4' });               // πάγκος
  const on = t > T.klik, pp = prog(t, T.print, T.printEnd), printing = t > T.print && t < T.printEnd;
  const head = printing ? Math.sin((t - T.print) * 13) : 0, press = 1 - Math.min(1, Math.abs(t - T.klik) / 0.12);
  dtfPrinter(ctx, ...PR, { s: PS, head, on, prog: pp, press: clamp(press) });
  const len = 420 * easeInOut(pp);                                                                                        // film βγαίνει με το σχέδιο
  if (len > 2) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, SLOT, W, len + 10); ctx.clip();
    cut(ctx, rrPts(300, SLOT - 30, 480, len + 30, 6), 'rgba(236,242,252,0.92)', { seed: 9610, amp: 1, edgeW: 4 });
    artwork(ctx, 540, SLOT + len - 212, 150, { grad: true });
    ctx.restore();
  }
  const k = 1 - easeOut(prog(t, T.klik - 0.45, T.klik - 0.03)) + easeIn(prog(t, T.klik + 0.35, T.klik + 0.75)), dd = 900 * k;   // χέρι: κλικ στο κουμπί
  if (k < 1) reach(ctx, BTN[0] + 0.34 * dd, BTN[1] + 0.94 * dd + press * 6, 260, 720, { hand: 'point', seed: 850, side: -1 });
  stamp(ctx, t, T.meta + 0.2, 225, 540, 'ΤΩΡΑ', -0.08, BRAND, 64);
  tearFrom(ctx, t, SC[4], workshop);
}

// ============ ΤΩΡΑ: πούδρα → πρέσα → ξεκόλλημα (top-down σε cutting mat) ============
const TEE = [540, 1060, 0.9], CH = [540, 1060 - 52 * 0.9];
function film(ctx, x, y, hw, o = {}) { // film DTF με το τυπωμένο σχέδιο · o.frost = πούδρα 0..1 · o.peel 0..1 (ξεκολλάει από πάνω-αριστερά προς κάτω-δεξιά)
  const D = 2 * hw, B = 4 * hw, cd = lerp(-D - 20, D + 20, o.peel || 0);             // μένει ό,τι έχει x + y > cd
  ctx.save(); ctx.translate(x, y);
  if (o.peel) { ctx.beginPath(); ctx.moveTo(cd - B, B); ctx.lineTo(cd + B, -B); ctx.lineTo(cd + B, B); ctx.closePath(); ctx.clip(); }
  cut(ctx, rrPts(-hw, -hw, D, D, 10), 'rgba(226,236,250,0.62)', { seed: 9700, amp: 1, edgeW: 4 });
  artwork(ctx, 0, 0, hw * 0.79, { grad: true });
  if (o.frost > 0) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.75; for (let i = 0; i < Math.floor(220 * o.frost); i++) { const r = L.rng(i * 3 + 1); ctx.fillRect(-hw * 0.8 + r() * hw * 1.6, -hw * 0.8 + r() * hw * 1.6, 4, 4); } ctx.globalAlpha = 1; }
  ctx.restore();
  const x0 = Math.max(-hw, cd - hw), x1 = Math.min(hw, cd + hw);                        // η άκρη που σηκώνεται (γραμμή x + y = cd μέσα στο film)
  if (o.peel > 0 && x1 > x0) {
    ctx.save(); ctx.translate(x - 10, y - 10); ctx.strokeStyle = 'rgba(248,251,255,0.96)'; ctx.lineWidth = 28; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(4,16,42,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.moveTo(x0, cd - x0); ctx.lineTo(x1, cd - x1); ctx.stroke(); ctx.restore();
  }
}
function platen(ctx, x, y, t) { // θερμοπρέσα (κάτοψη): πλάκα + λαβή + ατμός όταν πατάει
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(4,16,42,0.35)'; L.path(ctx, rrPts(-248, -228, 520, 520, 34)); ctx.fill();
  cut(ctx, rrPts(-260, -260, 520, 520, 34), '#8E97A8', { seed: 9800, amp: 2, edgeW: 8 });
  cut(ctx, rrPts(-226, -226, 452, 452, 24), '#B3BAC7', { seed: 9801, amp: 1.5, edge: false, shadow: false, scribble: '#A9B0BE' });
  cut(ctx, rrPts(-60, -330, 120, 90, 20), C.navy, { seed: 9802, amp: 1, edgeW: 5 });
  ctx.restore();
}
function steam(ctx, x, y, t, a) {
  if (a <= 0) return; ctx.save(); ctx.fillStyle = '#fff';
  for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2 + 0.3, ph = ((t * 1.4 + i * 0.37) % 1), r = 250 + 110 * ph;
    ctx.globalAlpha = a * 0.3 * (1 - ph); L.path(ctx, circlePts(x + Math.cos(ang) * r, y + Math.sin(ang) * r, 40 + 50 * ph, 30 + 36 * ph)); ctx.fill(); }
  ctx.restore();
}
function process(ctx, t) {
  cuttingMat(ctx);
  tshirt(ctx, ...TEE, 0, { seed: 7500 });
  const pressed = t > T.presa + 0.6;                                                                                     // το σχέδιο πέρασε στο ύφασμα
  if (pressed) artwork(ctx, ...CH, 150, { grad: true });
  const inA = easeOut(prog(t, SC[5], SC[5] + 0.2)), mv = easeInOut(prog(t, T.presa - 0.08, T.presa + 0.12));
  const fx = 540, fy = lerp(lerp(-300, 610, inA), CH[1], mv), hw = lerp(150, 190, mv);
  const frost = clamp(prog(t, T.poudra, T.poudra + 0.35)), peel = easeInOut(prog(t, T.etoimo, T.etoimo + 0.5));
  if (peel < 1) film(ctx, fx, fy, hw, { frost, peel });
  if (t > T.poudra - 0.05 && t < T.poudra + 0.45) {                                                                     // πούδρα πέφτει
    ctx.save(); ctx.fillStyle = '#fff';
    for (let i = 0; i < 60; i++) { const r = L.rng(i * 11 + 5), ph = (t * 3 + r()) % 1; ctx.globalAlpha = 0.85 * (1 - ph);
      L.path(ctx, circlePts(fx - 160 + r() * 320, fy - 260 + ph * 300 + r() * 60, 3 + 5 * r())); ctx.fill(); }
    ctx.restore();
  }
  const pin = easeOut(prog(t, T.presa + 0.1, T.presa + 0.22)), pout = easeIn(prog(t, T.presa + 0.6, T.presa + 0.74));
  if (pin > 0 && pout < 1) { platen(ctx, 540, lerp(lerp(-420, CH[1], pin), -420, pout), t); steam(ctx, ...CH, t, pin * (1 - pout)); }
  if (peel >= 1) { sparkle(ctx, 360, 860, 0.7, t, T.etoimo + 0.55, 9901); sparkle(ctx, 720, 880, 0.55, t, T.etoimo + 0.65, 9902); sparkle(ctx, 700, 1170, 0.45, t, T.etoimo + 0.75, 9903); }
}

// ============ σκηνές σε global χρόνο ============
const CAPS = [[-1, HOOK], [SC[1] + 0.03, 'Πριν το DTF, αυτό σήμαινε...'], [T.panik - 0.05, 'Πριν το DTF, αυτό σήμαινε πανικό.'],
  [T.telara - 0.05, 'Τέσσερα τελάρα.'], [T.tayt - 0.05, 'Ταύτιση στο χιλιοστό.'], [T.xronos - 0.05, 'Χρόνος, κόστος...'],
  [T.ligo - 0.05, '...και για λίγα κομμάτια, δεν έβγαινε.'], [T.meta - 0.05, 'Μετά ήρθε το DTF.'], [T.klik - 0.05, 'Ένα κλικ, και βγαίνουν όλα τα χρώματα μαζί.'],
  [T.poudra - 0.05, 'Πούδρα, πρέσα, έτοιμο.'], [T.akoma - 0.05, 'Ακόμα και για ένα κομμάτι.'], [T.metax - 0.05, 'Μεταξοτυπία ή DTF;'],
  [T.esy - 0.05, 'Εσύ τι θα διάλεγες; Και γιατί;'], [OUT + 0.1, HOOK]];
const WORLDS = [lobby, workshop, screens, workshop, printer, process, lobby];
const scene = i => (ctx, lt) => { const t = SC[i] + lt; WORLDS[i](ctx, t); captionSeq(ctx, t, CAPS);
  if (t < SC[1]) seriesTag(ctx, t + 1, TAG);                                                   // ήδη στο frame 0 · μόνο με το caption του hook
  else if (t >= OUT + 0.1) seriesTag(ctx, (t - OUT - 0.1) * 2.5, TAG); };                      // ξανά στο τέλος (loop)
const ENDS = [...SC.slice(1), END];

require('./render.js')({
  name: 'pm02_dtf',
  SCENES: SC.map((s, i) => [scene(i), ENDS[i] - s]),
  WIPES: [1, 2, 3, 5, 6],                         // 4 = σκίσιμο οθόνης μέσα στη σκηνή
  LOOP: 'cut',                                    // seamless: η κάρτα παραγγελίας ξαναγλιστράει στη θέση της = frame 0
  VO_FILE: 'vo/pm02_vo.mp3', VO_AT: 0.2,
  SFX: [
    ...T.dots.map((st, i) => [st, 'pop', { seed: i, gain: 0.8, note: `βούλα χρώματος ${i + 1}` }]),
    [T.shock, 'boing', { gain: 0.7, note: 'σοκ: 4 χρώματα' }],
    [SC[1] + 0.12, 'stamp', { note: 'ΤΟΤΕ' }],
    [T.panik, 'boing', { seed: 2, note: 'πανικός' }], [T.panik + 0.15, 'swoosh', { seed: 4, gain: 0.7, note: 'υπάλληλος τρέχει' }], [T.panik + 0.8, 'swoosh', { seed: 5, gain: 0.6 }],
    ...[0, 1, 2, 3].map(i => [T.telara + i * 0.15, 'pop', { seed: 10 + i, note: `τελάρο ${i + 1}` }]),
    ...[0, 1, 2, 3].map(i => [T.tayt + 0.1 + i * 0.15, 'thud', { seed: i, gain: 0.5, note: `χρώμα ${i + 1} στραβό` }]),
    [T.tayt + 0.7, 'slide', { dur: 0.3, gain: 0.6, note: 'ταύτιση' }], [T.snap, 'stamp', { gain: 0.8, note: 'κλακ: ευθυγραμμίστηκαν' }], [T.snap + 0.1, 'ding', { gain: 0.6 }],
    [T.xronos - 0.05, 'ticks', { count: 10, note: 'ρολόι τρέχει' }], [T.kostos, 'blip', { seed: 1, gain: 0.6, note: 'χαρτονομίσματα' }], [T.kostos + 0.3, 'blip', { seed: 2, gain: 0.6 }],
    [T.ligo - 0.05, 'pop', { seed: 20, gain: 0.7, note: 'ένα μπλουζάκι' }], [T.den - 0.02, 'thud', { seed: 7, gain: 0.7, note: 'facepalm' }],
    [SC[4] - 0.03, 'tear', { dur: 0.5, note: 'σκίσιμο οθόνης → ΤΩΡΑ' }], [T.meta + 0.2, 'stamp', { seed: 2, note: 'ΤΩΡΑ' }],
    [T.klik, 'click', { note: 'Print' }], [T.klik + 0.15, 'beep', { count: 2, note: 'εκτυπωτής ξεκινάει' }],
    [T.print, 'plotter', { dur: T.printEnd - T.print, gain: 0.8, note: 'κεφαλή DTF' }],
    [SC[5] + 0.02, 'slide', { dur: 0.25, gain: 0.6, note: 'film μπαίνει' }], [T.poudra, 'air', { dur: 0.45, note: 'πούδρα' }],
    [T.presa + 0.1, 'lid', { note: 'πρέσα κλείνει' }], [T.presa + 0.2, 'air', { dur: 0.45, gain: 0.8, note: 'ατμός' }], [T.presa + 0.6, 'lid', { seed: 2, gain: 0.7, note: 'πρέσα ανοίγει' }],
    [T.etoimo, 'peel', { dur: 0.5, note: 'ξεκόλλημα film' }], [T.etoimo + 0.55, 'shimmer', { note: 'αποτέλεσμα ✨' }],
    [T.metax, 'pop', { seed: 30, note: 'κάρτα Μεταξοτυπία' }], [T.dtf, 'pop', { seed: 31, note: 'κάρτα DTF' }],
    [T.esy, 'click', { seed: 2, note: 'CTA «Γράψε στα σχόλια»' }],
    [OUT, 'swoosh', { seed: 6, note: 'κάρτες φεύγουν' }], [OUT + 0.15, 'slide', { dur: 0.25, gain: 0.6, note: 'κάρτα παραγγελίας = frame 0 (loop)' }],
  ],
});
