// AD — «Όλα για το event σου» · γυμναστήρια / αθλητικοί σύλλογοι: ρούχα + εκτυπώσεις + σήμανση + βραβεία από έναν συνεργάτη · host: Στράτος
// Προϊόντα από το site (strategixstudios.com, από τις φωτογραφίες): sports collection → tech tee raglan τύπου DAYTONA, φόρμα με φάσα στο στήθος τύπου ATHENAS ·
// trophies → DRESEL (μετάλλιο με ανάγλυφο στεφάνι + κόκκινη κορδέλα), KUDER (χοντρό γυαλί σε ξύλινη βάση με καμπύλη), HOLDEN (ξύλινο μετάλλιο, βαμβακερό κορδόνι + κλιπ).
// Επιβεβαιωμένα από τον Αλέξανδρο (2026-09-28): στάμπα ΚΑΙ κέντημα στα ρούχα + αριθμός στην πλάτη · DRESEL χάραξη laser · KUDER laser · HOLDEN laser + UV ·
// banner PVC με τρουκς · αυτοκόλλητα δαπέδου · roll-up · χωρίς σφήνες μηχανημάτων. Demo πελάτης PULSE GYM (Latin, §3). CTA: VO «Στείλε μας μήνυμα», κουμπί «Πάρε προσφορά».
// Ιδέα: hook = το έτοιμο event → ◀◀ rewind → άδειο γυμναστήριο με διακεκομμένα (ό,τι λείπει) → κάθε προϊόν μπαίνει εκεί που θα ήταν σε πραγματικό event, με το ίδιο λογότυπο
// → το τέλος καταλήγει στο έτοιμο event = frame 0 (seamless). v2 (σημείωση Αλέξανδρου): το hook v1 έδειχνε ~3s την ίδια εικόνα (άδειο γυμναστήριο) → αλλαγή κάθε ~1s + προϊόν από το frame 0.
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, caption, lerp, prog, clamp, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow, cam, snap, rng, wrap } = L;
const { S, face, arm, handPos, lintRig, stratos, poseSpring } = require('./stratos.js');
const { springTo, wobble, fall, particles } = require('./motion.js');
const { BRAND, tshirt, phoneFrame, checkChip, ctaButton, sparkle, bgFlat, reach } = require('./props.js');

// VO = vo/ad_event_vo.mp3 @ 0,2s (vo/ad_event.txt, eleven_v3 «Stratos», take 2 του «event» με λατινικά · παύσεις → 0,3s, 0,45s πριν το «Ρούχα»). Χρονισμοί φράσεων (video):
// 0,23 Έχεις γυμναστήριο ή αθλητικό σύλλογο, και ετοιμάζεις το επόμενό σου event; (–3,93) | 4,23 Μην μπλέξεις με τρεις-τέσσερις διαφορετικούς προμηθευτές. (–6,80)
// 7,23 Ρούχα για την ομάδα; | 8,50 Εκτυπώσεις και μπάνερ; | 9,93 Αυτοκόλλητα και σήμανση; | 11,50 Κύπελλα, (12,00 μετάλλια) ή βραβεία; (–12,97)
// 13,27 Μπορείς να τα οργανώσεις όλα (14,35) | 14,90 με έναν συνεργάτη. (–15,87) | 16,13 Στη Στρατίτζικς | 17,33 αναλαμβάνουμε ό,τι χρειάζεσαι για το event σου,
// 19,90 από την ένδυση (20,32) και τις εκτυπώσεις, (20,83) | 21,80 μέχρι τα βραβεία (22,18) | 22,97 το μπράντινγκ του χώρου. (–24,07)
// 24,40 Εσύ οργανώνεις το event. | 25,87 Εμείς φροντίζουμε τα υπόλοιπα. (–27,30) | 27,60 Στείλε μας μήνυμα, | 28,67 και πάμε να οργανώσουμε μαζί | 30,40 το επόμενό σου event. (–31,50)
const T = {
  rouxa: 7.23, ektyp: 8.5, autok: 9.93, kyp: 11.5, metal: 12.0, vrav: 12.41, mpor: 13.27, ola: 14.35, enan: 14.9,
  strat: 16.13, anal: 17.33, endysi: 20.32, ektyp2: 20.83, mexri: 21.8, vrav2: 22.18, brand: 23.18,
  esy: 24.4, emeis: 25.87, ypol: 26.9, steile: 27.6, kai: 28.67, event2: 30.4, voEnd: 31.5,
};
const CUT = { B: 4.05, C: 7.05, C2: 8.38, C3: 9.8, C4: 11.32, D: 13.2, E1: 16.05, E1b: 18.1, E2: 19.85, E3: 21.7, E4: 23.0, F: 24.3, G: 27.45, OUT: 30.3, END: 32.1 };
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const HOOKCAP = 'Έχεις γυμναστήριο ή σύλλογο,'; // 1ο κομμάτι του hook = frame 0 = τελευταίο caption (seamless loop)

// ---------- PULSE GYM (demo πελάτης) ----------
const P = {
  or: '#FF6B1A', orD: '#D9530B', orS: '#FF8A45', ch: '#23262E', chD: '#15171C', chS: '#30343D',
  wall: '#E4E9F2', wallS: '#CFD8E8', floor: '#2A2F3B', floorS: '#343A48',
  wood: '#DDB988', woodD: '#B98E5A', woodL: '#EBD2AA', burn: '#5E3A1E', cotton: '#EFE4CC',
  gold: '#E2B23A', goldD: '#A87A1E', silver: '#CBD2DC', silverD: '#8E97A5', bronze: '#C4864F', bronzeD: '#85532C',
  ribbon: '#D7262E', ribbonD: '#A8161D', steel: '#B7BFCB', steelD: '#8A93A1', podium: '#D8DEE8', podiumD: '#BCC5D3',
};
// λογότυπο: δίσκος + παλμός (ΗΚΓ) + PULSE / GYM · d = διάμετρος · o.mono = ένα χρώμα, χωρίς δίσκο (χάραξη / κέντημα) · o.bg / o.fg · o.sx = τεντωμένο (λάθος proof)
function pulseLogo(ctx, x, y, d, o = {}) {
  const s = d / 400, m = o.mono, fg = m || o.fg || '#fff';
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.sx || 1), s / (o.sx || 1));
  if (!m) { ctx.fillStyle = o.bg || P.or; ctx.beginPath(); ctx.arc(0, 0, 196, 0, 7); ctx.fill(); }
  ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = m ? 18 : 12; ctx.beginPath(); ctx.arc(0, 0, m ? 186 : 170, 0, 7); ctx.stroke();
  ctx.lineWidth = 24; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  [[-150, -30], [-74, -30], [-44, -104], [-2, 46], [32, -54], [58, -30], [150, -30]].forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '84px Brand'; ctx.fillText('PULSE', 0, 80); ctx.font = '38px Brand'; ctx.fillText('GYM', 0, 140);
  ctx.restore();
}
// λογότυπο σε offscreen canvas για υλικά: κέντημα (βελονιές satin + ανάγλυφο), χάραξη σε μέταλλο / γυαλί / ξύλο
const LOGO_TX = {};
function logoTex(kind) {
  if (LOGO_TX[kind]) return LOGO_TX[kind];
  const cv = L.createCanvas(440, 440), c = cv.getContext('2d'), col = { emb: P.or, metal: 'rgba(90,60,20,0.75)', glass: 'rgba(255,255,255,0.92)', wood: P.burn }[kind];
  pulseLogo(c, 220, 220, 400, { mono: col });
  if (kind === 'emb') { // βελονιές: λεπτές διαγώνιες γραμμές φωτός/σκιάς πάνω στην κλωστή
    c.globalCompositeOperation = 'source-atop'; c.lineWidth = 3;
    for (let i = -440; i < 880; i += 9) { c.strokeStyle = i % 18 ? 'rgba(255,220,180,0.55)' : 'rgba(120,40,0,0.35)'; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 440, 440); c.stroke(); }
  }
  if (kind === 'glass' || kind === 'metal') { c.globalCompositeOperation = 'source-atop'; const r = rng(kind.length * 7); c.fillStyle = kind === 'glass' ? 'rgba(200,220,230,0.5)' : 'rgba(40,25,5,0.35)'; for (let i = 0; i < 1400; i++) c.fillRect(r() * 440, r() * 440, 2, 2); } // ματ υφή χάραξης
  return (LOGO_TX[kind] = cv);
}
function logoOn(ctx, kind, x, y, d, o = {}) { // κέντημα: ανάγλυφο με σκιά · χάραξη: επίπεδο
  const cv = logoTex(kind); ctx.save();
  if (kind === 'emb') { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowOffsetX = d * 0.02; ctx.shadowOffsetY = d * 0.03; ctx.shadowBlur = d * 0.03; }
  ctx.globalAlpha = o.a ?? 1; ctx.drawImage(cv, x - d * 0.55, y - d * 0.55, d * 1.1, d * 1.1); ctx.restore();
}

// ---------- σκηνικό: γυμναστήριο (κόσμος = οθόνη στο wide, z = 1) ----------
const FLOOR = 1165;
const BN = [150, 540, 780, 200];                     // banner PVC: x, y, w, h
const RU = [70, 230, 780, 1300];                     // roll-up: x0, x1, top, βάση
const RL = [752, 1004, 790, 1322];                   // κρεμάστρα ρούχων: x0, x1, μπάρα, πόδια
const TB = [372, 708, 1372, 1470];                   // τραπέζι βραβείων: x0, x1, πάνω, κάτω
const PD = [[300, 433, 140, '2'], [433, 567, 210, '1'], [567, 700, 100, '3']]; const PDB = 1330; // βάθρο
const EYE = [[14, 14], [0.5, 14], [-14, 14], [14, -14], [0.5, -14], [-14, -14]].map(([a, b]) => [a === 0.5 ? BN[0] + BN[2] / 2 : a > 0 ? BN[0] + a : BN[0] + BN[2] + a, b > 0 ? BN[1] + b : BN[1] + BN[3] + b]);

function gymBG(ctx) {
  cut(ctx, rectPts(-420, -200, W + 840, FLOOR + 210), P.wall, { seed: 11, amp: 2, edge: false, shadow: false, scribble: P.wallS });
  ctx.save(); ctx.fillStyle = 'rgba(11,27,63,0.06)'; for (let x = -400; x < W + 400; x += 180) ctx.fillRect(x, -200, 6, FLOOR + 200); ctx.restore(); // αρμοί πάνελ τοίχου
  cut(ctx, rectPts(-420, FLOOR - 26, W + 840, 34), '#B9C3D6', { seed: 12, amp: 1.5, edgeW: 5 });
  cut(ctx, rectPts(-420, FLOOR, W + 840, 1000), P.floor, { seed: 13, amp: 2, edgeW: 6, scribble: P.floorS });
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 3;               // λαστιχένια πλακάκια σε προοπτική
  for (let i = -9; i <= 9; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 120, FLOOR + 6); ctx.lineTo(540 + i * 380, 1960); ctx.stroke(); }
  for (const y of [1215, 1285, 1385, 1535, 1760]) { ctx.beginPath(); ctx.moveTo(-420, y); ctx.lineTo(W + 420, y); ctx.stroke(); }
  const r = rng(77); ctx.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = 0; i < 320; i++) ctx.fillRect(-400 + r() * 1880, FLOOR + 10 + r() * 760, 3, 3);
  ctx.restore();
}
function dashPoly(ctx, pts, a, w = 5) {
  ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([16, 12]); ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(11,27,63,0.7)';
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke(); ctx.restore();
}
const qm = (ctx, x, y, fs, a) => { ctx.save(); ctx.globalAlpha = a; txt(ctx, '?', x, y, { font: `bold ${fs}px Round`, color: 'rgba(11,27,63,0.42)' }); ctx.restore(); };
// σιλουέτα μπλούζας (για τα διακεκομμένα) · κέντρο λαιμού (x, y), s ≈ πλάτος/800
const teeSil = (x, y, s) => [[-98, 0], [-258, 48], [-405, 128], [-330, 250], [-272, 222], [-266, 796], [266, 796], [272, 222], [330, 250], [405, 128], [258, 48], [98, 0], [0, 50]].map(([a, b]) => [x + a * s, y + b * s]);
// διακεκομμένα: ό,τι λείπει ακόμα · pr = παρουσία κάθε αντικειμένου (0..1) → το περίγραμμά του σβήνει όσο μπαίνει
function ghosts(ctx, t, pr) {
  const br = 0.85 + 0.15 * Math.sin(t * 4), g = (k, pts, w) => { if (k < 0.99) dashPoly(ctx, pts, (1 - k) * br, w); };
  g(pr.banner, rectPts(BN[0], BN[1], BN[2], BN[3])); if (pr.banner < 0.99) qm(ctx, BN[0] + BN[2] / 2, BN[1] + BN[3] / 2, 120, 1 - pr.banner);
  g(pr.rollup, rectPts(RU[0], RU[2], RU[1] - RU[0], RU[3] - RU[2] + 34)); if (pr.rollup < 0.99) qm(ctx, (RU[0] + RU[1]) / 2, 1020, 110, 1 - pr.rollup);
  [800, 878, 956].forEach((gx, i) => g(pr.garm[i], teeSil(gx, RL[2] + 26, 0.105), 4));
  [402, 440, 478].forEach((mx, i) => { g(pr.dresel[i], circlePts(mx, 1334, 15, 15, 18), 3); g(pr.dresel[i], [[mx - 9, 1286], [mx, 1318], [mx + 9, 1286]], 3); });
  g(pr.kuder, rrPts(512, 1262, 56, 110, 8), 4); [612, 672].forEach((mx, i) => g(pr.holden[i], circlePts(mx, 1334, 17, 17, 18), 3));
  g(pr.floor, [[96, 1486], [986, 1486], [1004, 1528], [78, 1528]], 4);
  for (const ax of [140, 232]) g(pr.floor, [[ax - 34, 1392], [ax + 6, 1392], [ax + 40, 1410], [ax + 6, 1428], [ax - 34, 1428], [ax, 1410]], 4);
}
// βάθρο (έπιπλο του γυμναστηρίου) · logo = k του αυτοκόλλητου στο 1
function podium(ctx, logo) {
  for (const [x0, x1, h, n] of PD) {
    cut(ctx, rectPts(x0, PDB - h, x1 - x0, h), P.podium, { seed: 60 + +n, amp: 1.5, edgeW: 6, scribble: P.podiumD });
    cut(ctx, rectPts(x0, PDB - h, x1 - x0, 14), '#EEF1F6', { seed: 64 + +n, amp: 1, edge: false, shadow: false });
    txt(ctx, n, (x0 + x1) / 2, PDB - h / 2 + (n === '1' ? 40 : 6), { font: `bold ${n === '1' ? 64 : 54}px Round`, color: C.navy });
  }
  if (logo > 0.01) { ctx.save(); ctx.translate(500, PDB - 150); ctx.scale(spring(logo), spring(logo)); pulseLogo(ctx, 0, 0, 74); ctx.restore(); } // αυτοκόλλητο στο 1
}
// κρεμάστρα ρούχων (χρωμέ) + κρεμασμένα ρούχα
function railFrame(ctx) {
  const [x0, x1, bar, bot] = RL;
  for (const x of [x0 + 6, x1 - 6]) cut(ctx, rectPts(x - 6, bar, 12, bot - bar), P.steel, { seed: 70 + x, amp: 1, edgeW: 4 });
  cut(ctx, rrPts(x0 - 8, bar - 8, x1 - x0 + 16, 14, 7), P.steel, { seed: 72, amp: 1, edgeW: 4 });
  cut(ctx, rrPts(x0 - 30, bot - 8, x1 - x0 + 60, 14, 7), P.steelD, { seed: 73, amp: 1, edgeW: 4 });
  for (const x of [x0 - 20, x1 + 20]) cut(ctx, circlePts(x, bot + 12, 11, 11, 12), C.ink, { seed: 74 + x, amp: 1, edgeW: 3 });
}
function hanger(ctx, x, y) { // κρεμάστρα ρούχου: γάντζος + ώμοι (τοπικά: γάντζος στο (x, y))
  ctx.save(); ctx.strokeStyle = '#6F7784'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y + 6, 7, Math.PI, 0.1); ctx.moveTo(x + 7, y + 7); ctx.lineTo(x, y + 20); ctx.stroke(); ctx.restore();
  cut(ctx, [[x, y + 18], [x + 40, y + 34], [x - 40, y + 34]], P.ch, { seed: 80 + x, amp: 0.8, edgeW: 3, shadow: false });
}
// φόρμα προπονητή (τύπου ATHENAS): γκρι-μαύρη, πορτοκαλί φάσα στο στήθος, φερμουάρ, όρθιος γιακάς, κεντημένο λογότυπο · τοπικά όπως το tshirt (λαιμός −350, κάτω 446)
function jacket(ctx, x, y, s, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const sd = o.seed || 8800;
  for (const k of [-1, 1]) cut(ctx, [[k * 250, -300], [k * 330, -250], [k * 470, 330], [k * 380, 360], [k * 272, -40]], P.ch, { seed: sd + k, amp: 3, edgeW: 9, scribble: P.chS }); // μακριά μανίκια
  for (const k of [-1, 1]) cut(ctx, rrPts(k * 425 - 55, 320, 110, 60, 20), P.chD, { seed: sd + 3 + k, amp: 2, edgeW: 6 }); // μανσέτες
  cut(ctx, [[-110, -350], [110, -350], [270, -300], [276, 400], [-276, 400], [-270, -300]], P.ch, { seed: sd + 5, amp: 3, edgeW: 9, scribble: P.chS });
  cut(ctx, rectPts(-276, -140, 552, 110), P.or, { seed: sd + 6, amp: 2, edge: false, shadow: false });                         // φάσα στήθους
  cut(ctx, rectPts(-280, 380, 560, 70), P.chD, { seed: sd + 7, amp: 2, edgeW: 6 });                                          // λάστιχο
  cut(ctx, [[-120, -350], [120, -350], [110, -290], [-110, -290]], P.chD, { seed: sd + 8, amp: 2, edgeW: 6 });                 // όρθιος γιακάς
  ctx.save(); ctx.strokeStyle = '#B9C0CB'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(0, 440); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; for (let yy = -320; yy < 440; yy += 14) { ctx.beginPath(); ctx.moveTo(-6, yy); ctx.lineTo(6, yy); ctx.stroke(); } ctx.restore();
  cut(ctx, rrPts(-14, -318, 28, 54, 8), '#D8DEE6', { seed: sd + 9, amp: 1, edgeW: 3 });                                        // τιράντα φερμουάρ
  logoOn(ctx, 'emb', 140, -230, 150);                                                                                        // κέντημα (αριστερό στήθος)
  ctx.restore();
}
const GARM = [[800, 'front', 7.25], [878, 'back', 7.42], [956, 'jacket', 7.59]];
function garments(ctx, t, out) {
  GARM.forEach(([gx, kind, t0], i) => {
    const o0 = out + (2 - i) * 0.07; if (t < t0 || t > o0 + 0.35) return;
    const x = t < o0 ? springTo(t, t0, 1180, gx, { f: 2.6, z: 0.55 }) : lerp(gx, 1250, easeIn(prog(t, o0, o0 + 0.35)));
    const rot = wobble(t, t0 + 0.28, 0.2, 2.4, 0.18) + (t < t0 + 0.28 ? -0.18 * (1 - prog(t, t0, t0 + 0.28)) : 0);
    ctx.save(); ctx.translate(x, RL[2]); ctx.rotate(rot); ctx.translate(-x, -RL[2]);
    const s = 0.105, ny = RL[2] + 26 + 350 * s;
    if (kind === 'jacket') jacket(ctx, x, ny, s, 0);
    else tshirt(ctx, x, ny, s, 0, { color: P.or, rib: P.orD, inside: P.orD, scrib: P.orS, seed: 8700 + i * 10, back: kind === 'back',
      logoFn: kind === 'back' ? c => { txt(c, 'PULSE', 0, -90, { font: '80px Brand', color: P.ch }); txt(c, '10', 0, 130, { font: '300px Brand', color: P.ch }); } : c => pulseLogo(c, 0, 40, 230, { bg: P.ch }) });
    hanger(ctx, x, RL[2] - 12);
    ctx.restore();
  });
}
// banner PVC με τρουκς · k = ξετύλιγμα από αριστερά · δεματικά στα τρουκς (tie = χρόνοι)
function banner(ctx, t, k, ties) {
  if (k <= 0.001) return; const [x, y, w, h] = BN, ww = w * k;
  for (const [ex, ey] of EYE) if (ex < x + ww + 1) cut(ctx, circlePts(ex, ey + (ey < y + h / 2 ? -34 : 34), 6, 6, 10), P.steelD, { seed: 90 + ex, amp: 0.5, edgeW: 3 }); // βίδες στον τοίχο
  ctx.save(); ctx.beginPath(); ctx.rect(x - 30, y - 60, ww + 30, h + 120); ctx.clip();
  cut(ctx, rectPts(x, y, w, h), '#FBFAF6', { seed: 21, amp: 1.2, edgeW: 5 });
  cut(ctx, [[x, y], [x + 250, y], [x + 196, y + h], [x, y + h]], P.or, { seed: 22, amp: 1, edge: false, shadow: false });
  pulseLogo(ctx, x + 112, y + h / 2, 150, { bg: P.ch });
  txt(ctx, 'PULSE GAMES', x + 505, y + 78, { font: '78px Brand', color: P.ch });
  txt(ctx, 'ΣΑΒΒΑΤΟ · 10:00', x + 505, y + 148, { font: 'bold 40px Round', color: P.orD });
  for (const [ex, ey] of EYE) { ctx.fillStyle = P.steel; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#5B6270'; ctx.beginPath(); ctx.arc(ex, ey, 4.5, 0, 7); ctx.fill(); }
  ctx.restore();
  if (k < 1) { const rx = x + ww; cut(ctx, rrPts(rx - 13, y - 10, 26, h + 20, 12), '#F1EEE6', { seed: 23, amp: 1, edgeW: 4 }); ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx + 4, y - 6); ctx.lineTo(rx + 4, y + h + 6); ctx.stroke(); ctx.restore(); }
  EYE.forEach(([ex, ey], i) => { const tt = ties[i]; if (t < tt) return; const kk = spring(prog(t, tt, tt + 0.3)), up = ey < y + h / 2 ? -1 : 1; // δεματικό από το τρουκ στη βίδα
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(ex, ey + up * 17, 6 * kk, 20 * kk, 0, 0, 7); ctx.stroke(); ctx.restore(); });
}
// roll-up: το γραφικό βγαίνει από την κασέτα (k 0..1) · στύλος από πίσω
function rollup(ctx, k) {
  const [x0, x1, top, base] = RU, hh = (base - top) * k, cx = (x0 + x1) / 2;
  if (k > 0.01) {
    cut(ctx, rectPts(cx - 4, base - hh - 4, 8, hh), P.steel, { seed: 101, amp: 0.8, edge: false, shadow: false });
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, top - 30, x1 - x0 + 40, base - top + 30); ctx.clip(); ctx.translate(0, base - hh - top);
    cut(ctx, rectPts(x0, top, x1 - x0, base - top), P.ch, { seed: 102, amp: 1, edgeW: 5, scribble: P.chS });
    cut(ctx, [[x0, top + 330], [x1, top + 250], [x1, top + 330], [x0, top + 410]], P.or, { seed: 103, amp: 1, edge: false, shadow: false });
    pulseLogo(ctx, cx, top + 120, 128);
    txt(ctx, 'PULSE', cx, top + 450, { font: '44px Brand', color: '#fff' }); txt(ctx, 'GAMES', cx, top + 494, { font: '30px Brand', color: P.or });
    cut(ctx, rrPts(x0 - 4, top - 6, x1 - x0 + 8, 12, 5), P.steelD, { seed: 104, amp: 0.8, edgeW: 3 });
    ctx.restore();
  }
  cut(ctx, rrPts(x0 - 12, base - 6, x1 - x0 + 24, 40, 14), P.steel, { seed: 105, amp: 1, edgeW: 5 });                         // κασέτα
  for (const fx of [x0 + 4, x1 - 4]) cut(ctx, rrPts(fx - 22, base + 30, 44, 10, 5), P.steelD, { seed: 106 + fx, amp: 0.8, edgeW: 3 });
}
// αυτοκόλλητα δαπέδου (wide, σε προοπτική) + αυτοκόλλητο στο βάθρο
function floorStickers(ctx, k) {
  if (k <= 0.01) return; const sy = spring(k);
  ctx.save(); ctx.translate(540, 1507); ctx.scale(1, sy); ctx.translate(-540, -1507);
  cut(ctx, [[96, 1486], [986, 1486], [1004, 1528], [78, 1528]], P.or, { seed: 110, amp: 1, edgeW: 3, shadow: false });
  ctx.save(); ctx.fillStyle = P.ch; for (const x0 of [100, 930]) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) ctx.fillRect(x0 + i * 18 - (j ? 4 : 0), 1488 + j * 20, 18, 20); ctx.restore();
  ctx.save(); ctx.translate(540, 1508); ctx.scale(1.3, 0.55); txt(ctx, 'START', 0, 0, { font: '56px Brand', color: '#fff' }); ctx.restore();
  for (const ax of [140, 232]) cut(ctx, [[ax - 34, 1392], [ax + 6, 1392], [ax + 40, 1410], [ax + 6, 1428], [ax - 34, 1428], [ax, 1410]], P.or, { seed: 111 + ax, amp: 0.8, edgeW: 3, shadow: false });
  ctx.restore();
}
// ---------- βραβεία (από τις φωτογραφίες του site) ----------
// KUDER: χοντρό γυαλί (λοξές άκρες, στρογγυλεμένες πάνω γωνίες) σε ξύλινη βάση με καμπύλη · λογότυπο χαραγμένο με laser (ματ λευκό) · (cx, bot) = κάτω-κέντρο · sc
function kuder(ctx, cx, bot, sc = 1, o = {}) {
  ctx.save(); ctx.translate(cx, bot); ctx.scale(sc, sc); if (o.rot) ctx.rotate(o.rot);
  const gl = rrPts(-28, -112, 56, 96, 7);
  cut(ctx, gl, 'rgba(214,236,246,0.62)', { seed: 120, amp: 0.6, edgeW: 3, edgeC: 'rgba(255,255,255,0.9)', sx: 3, sy: 4 });
  ctx.save(); ctx.strokeStyle = 'rgba(70,120,150,0.75)'; ctx.lineWidth = 2.5; L.path(ctx, gl); ctx.stroke(); ctx.fillStyle = 'rgba(110,160,190,0.45)'; ctx.fillRect(20, -108, 7, 90); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-25, -108, 4, 88); ctx.fillRect(-24, -110, 46, 3); ctx.restore(); // πάχος + γυαλάδες
  logoOn(ctx, 'glass', -2, -72, 40); txt(ctx, 'MVP', -2, -36, { font: '13px Brand', color: 'rgba(255,255,255,0.95)' });
  if (o.glint > 0 && o.glint < 1) { ctx.save(); L.path(ctx, gl); ctx.clip(); const gx = lerp(-60, 60, o.glint); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.moveTo(gx - 8, -120); ctx.lineTo(gx + 6, -120); ctx.lineTo(gx - 20, 0); ctx.lineTo(gx - 34, 0); ctx.fill(); ctx.restore(); }
  cut(ctx, [[-40, 0], [40, 0], [40, -18], [22, -24], [8, -34], [-40, -34]], P.wood, { seed: 121, amp: 0.8, edgeW: 3, sx: 3, sy: 4 }); // βάση με καμπύλη
  ctx.save(); ctx.strokeStyle = 'rgba(140,95,50,0.35)'; ctx.lineWidth = 1.5; for (const yy of [-8, -16, -26]) { ctx.beginPath(); ctx.moveTo(-38, yy); ctx.quadraticCurveTo(0, yy - 3, 36, yy + 1); ctx.stroke(); } ctx.restore();
  ctx.restore();
}
// μετάλλιο: DRESEL (χρυσό/ασημί/χάλκινο, ανάγλυφο στεφάνι, χάραξη laser στο κέντρο) ή HOLDEN (ξύλο, laser ή UV) · (x, y) = κέντρο δίσκου · r
function medal(ctx, x, y, r, kind, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  if (kind === 'wood' || kind === 'uv') {
    cut(ctx, circlePts(0, 0, r, r, 22), P.wood, { seed: 130 + r, amp: 0.4, edgeW: 2.5, sx: 2, sy: 3 });
    ctx.save(); ctx.strokeStyle = 'rgba(150,100,50,0.35)'; ctx.lineWidth = 1.2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-r, i * r * 0.26); ctx.quadraticCurveTo(0, i * r * 0.26 + 3, r, i * r * 0.26); ctx.stroke(); } ctx.restore();
    if (kind === 'wood') logoOn(ctx, 'wood', 0, 0, r * 1.5); else pulseLogo(ctx, 0, 0, r * 1.5);
  } else {
    const [c1, c2] = { gold: [P.gold, P.goldD], silver: [P.silver, P.silverD], bronze: [P.bronze, P.bronzeD] }[kind];
    cut(ctx, circlePts(0, 0, r, r, 24), c1, { seed: 140 + r, amp: 0.4, edgeW: 2.5, sx: 2, sy: 3 });
    ctx.save(); ctx.strokeStyle = c2; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, 7); ctx.stroke();       // ανάγλυφο στεφάνι
    ctx.fillStyle = c2; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(r * 0.89, 0, r * 0.08, r * 0.04, 0.6, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.28, r * 0.12, -0.6, 0, 7); ctx.fill(); ctx.restore();
    logoOn(ctx, 'metal', 0, r * 0.02, r * 1.28);
  }
  ctx.restore();
}
// κορδέλα V από δύο σημεία πάνω ως τον κρίκο (κόκκινη DRESEL · βαμβακερή HOLDEN με κλιπ)
function ribbon(ctx, ax, ay, bx, by, mx, my, kind, w) {
  const col = kind === 'cotton' ? P.cotton : P.ribbon, colD = kind === 'cotton' ? '#D6C7A6' : P.ribbonD;
  for (const [sx, sy, c] of [[ax, ay, colD], [bx, by, col]]) { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.stroke(); ctx.restore(); }
  if (kind === 'cotton') cut(ctx, rrPts(mx - w * 0.6, my - w * 1.6, w * 1.2, w * 1.1, 2), P.steel, { seed: 150, amp: 0.3, edgeW: 1.5, shadow: false }); // μεταλλικό κλιπ
  ctx.save(); ctx.strokeStyle = kind === 'cotton' ? P.steelD : P.goldD; ctx.lineWidth = w * 0.3; ctx.beginPath(); ctx.arc(mx, my + w * 0.5, w * 0.45, 0, 7); ctx.stroke(); ctx.restore();
}
// τραπέζι βραβείων: βάση με μπάρα για μετάλλια (DRESEL αριστερά, HOLDEN δεξιά) + KUDER στη μέση · τα βραβεία πέφτουν από πάνω (fall) και κουνιούνται
const AW = { kuder: 11.55, dresel: [11.98, 12.08, 12.18], holden: [12.42, 12.54] };
function medalStand(ctx, x0, x1) {
  const cx = (x0 + x1) / 2; cut(ctx, rectPts(cx - 4, 1284, 8, TB[2] - 1284), P.woodD, { seed: 160 + x0, amp: 0.5, edgeW: 3 });
  cut(ctx, rrPts(x0, 1280, x1 - x0, 8, 3), P.woodD, { seed: 161 + x0, amp: 0.5, edgeW: 3 }); cut(ctx, rrPts(cx - 20, TB[2] - 6, 40, 8, 3), P.woodD, { seed: 162 + x0, amp: 0.5, edgeW: 3 });
}
function awardsTable(ctx, t, onAthletes, out) {
  const [x0, x1, top, bot] = TB;
  for (const lx of [x0 + 18, x1 - 18]) cut(ctx, rectPts(lx - 6, top, 12, bot - top + 40), P.steelD, { seed: 170 + lx, amp: 0.8, edgeW: 3 });
  cut(ctx, rectPts(x0, top, x1 - x0, 16), P.wood, { seed: 171, amp: 1, edgeW: 4, scribble: P.woodL });
  const gone = i => t > out + i * 0.04 ? spring(1 - prog(t, out + i * 0.04, out + i * 0.04 + 0.3)) : 1; // επιστροφή στο frame 0
  if (t >= AW.dresel[0] - 0.3 && !onAthletes) { ctx.save(); const g = gone(0); ctx.globalAlpha = g; medalStand(ctx, 386, 494); ctx.restore(); }
  if (t >= AW.holden[0] - 0.3) { ctx.save(); const g = gone(1); ctx.globalAlpha = g; medalStand(ctx, 586, 698); ctx.restore(); }
  const hang = (mx, t0, r, kind, rk, i) => { // πέφτει στη μπάρα και κουνιέται
    if (t < t0) return; const g = gone(2 + i); if (g <= 0.01) return;
    const f = fall(t, t0, -240, 0, { e: 0.25 }), sw = f.landed || f.hit >= 0 ? wobble(t, t0 + 0.12, 0.35, 2.6, 0.16) : 0;
    ctx.save(); ctx.translate(mx, 1284 + f.y); ctx.rotate(sw); ctx.scale(g, g);
    ribbon(ctx, -9, 0, 9, 0, 0, 34, rk, rk === 'cotton' ? 6 : 7); medal(ctx, 0, 50, r, kind); ctx.restore();
  };
  if (!onAthletes) ['gold', 'silver', 'bronze'].forEach((k, i) => hang([402, 440, 478][i], AW.dresel[i], 15, k, 'red', i));
  ['wood', 'uv'].forEach((k, i) => hang([612, 672][i], AW.holden[i], 17, k, 'cotton', 3 + i));
  if (t >= AW.kuder && !onAthletes) { const f = fall(t, AW.kuder, -300, 0, { e: 0.2 }), k = f.hit >= 0 && f.hit < 0.25 ? 1 - 0.18 * Math.sin(f.hit / 0.25 * Math.PI) : 1, g = gone(6);
    ctx.save(); ctx.translate(540, top + f.y); ctx.scale(g / Math.sqrt(k), g * k); kuder(ctx, 0, 0, 1, { glint: prog(t, AW.kuder + 0.45, AW.kuder + 1.0) }); ctx.restore(); }
  cut(ctx, rectPts(x0 + 8, top + 16, x1 - x0 - 16, 60), '#F1ECE0', { seed: 172, amp: 1, edgeW: 4 }); // μπροστινή ποδιά τραπεζιού
}

// ---------- αθλητές (ίδιο rig χεριών με τον Στράτο: arm() + lint) ----------
const ARIG = { headY: -180, headR: 130, shoulder: 148 };
const HAIR = ['#2B1F1C', '#6B4630', '#C98F4A'];
function athHead(ctx, o) {
  const sd = o.seed || 5000, v = o.hairV || 0, hc = HAIR[o.hairC || 0];
  if (v === 1) { cut(ctx, rrPts(-150, -316, 300, 290, 120), hc, { seed: sd + 1, amp: 3, edgeW: 6 });                                   // μαλλιά πίσω από το κεφάλι
    cut(ctx, [[-120, -270], [-196, -250], [-230, -160], [-214, -40], [-180, 10], [-168, -80], [-150, -170]], hc, { seed: sd + 8, amp: 3, edgeW: 6 }); } // αλογοουρά
  for (const ex of [-126, 126]) cut(ctx, circlePts(ex, -176, 26, 31, 14), S.skin, { seed: sd + (ex > 0 ? 2 : 3), amp: 2, edgeW: 6 });
  cut(ctx, circlePts(0, -180, 128, 130, 40), S.skin, { seed: sd + 5, amp: 3 });
  const cap = v === 1 ? [[-132, -168], [-126, -246], [-70, -300], [10, -312], [80, -296], [128, -246], [134, -178], [104, -220], [20, -236], [-60, -228], [-110, -196]]
    : [[-132, -186], [-128, -262], [-68, -316], [10, -324], [78, -310], [128, -262], [132, -192], [104, -234], [34, -254], [-44, -246], [-104, -236]];
  cut(ctx, cap, hc, { seed: sd + 6, amp: 3, edgeW: 6 });
  if (v === 1) { for (const sg of [-1, 1]) cut(ctx, [[sg * 118, -250], [sg * 140, -200], [sg * 138, -120], [sg * 120, -96], [sg * 116, -170]], hc, { seed: sd + 9 + sg, amp: 2, edgeW: 5 }); // τούφες στο πλάι
    cut(ctx, [[-128, -236], [-60, -276], [60, -276], [128, -236], [126, -214], [60, -252], [-60, -252], [-126, -214]], P.ch, { seed: sd + 7, amp: 1.5, edgeW: 4, shadow: false }); } // κορδέλα μαλλιών
  face(ctx, { ...o, seed: sd }, { hair: hc, browY: -214 });
}
function athLegs(ctx, sd, ph, back) { // σορτς + πόδια + αθλητικά · ph = φάση τρεξίματος (null = όρθιος)
  for (const [sg, k] of [[-1, 0], [1, 1]]) {
    const lift = ph == null ? 0 : Math.max(0, Math.sin(ph + k * Math.PI)) * 120, fy = 800 - lift, lx = sg * 62;
    cut(ctx, [[lx - 36, 540], [lx + 36, 540], [lx + 30, fy - 40], [lx - 30, fy - 40]], S.skin, { seed: sd + 10 + k, amp: 1.5, edgeW: 5 });
    cut(ctx, rectPts(lx - 32, fy - 64, 64, 34), '#FBFAF6', { seed: sd + 12 + k, amp: 1, edgeW: 4, shadow: false });          // κάλτσα
    cut(ctx, rrPts(lx - 58 + sg * 8, fy - 36, 116, 58, 26), '#FBFAF6', { seed: sd + 14 + k, amp: 1.5, edgeW: 5 });           // αθλητικό
    cut(ctx, rectPts(lx - 54 + sg * 8, fy + 8, 108, 12), P.or, { seed: sd + 16 + k, amp: 0.8, edge: false, shadow: false });
  }
  cut(ctx, [[-170, 420], [170, 420], [186, 592], [22, 592], [0, 552], [-22, 592], [-186, 592]], P.ch, { seed: sd + 18, amp: 2, edgeW: 7, scribble: P.chS }); // σορτς
  for (const sg of [-1, 1]) cut(ctx, [[sg * 168, 424], [sg * 180, 424], [sg * 192, 588], [sg * 180, 588]], P.or, { seed: sd + 19 + sg, amp: 0.8, edge: false, shadow: false });
}
// αθλητής μπροστά · y = γραμμή ώμων (όπως stratos) · o.run = φάση τρεξίματος · o.medal = gold|silver|bronze · o.swing (rad) · o.plaque (KUDER στο δεξί χέρι) · o.coach = φόρμα + σφυρίχτρα
function athlete(ctx, x, y, s, o = {}) {
  const sd = o.seed || 5000, [aL, aR] = o.arms || [0.12, 0.12], coach = o.coach;
  const pal = coach ? { shoulder: 148, sleeve: P.ch, sleeveD: P.chD, long: true } : { shoulder: 148, sleeve: P.or, sleeveD: P.orD };
  const ao = side => ({ seed: sd + 100, hand: side > 0 ? o.handR : o.handL, elbow: side > 0 ? o.elbowR : o.elbowL, view: side > 0 ? o.viewR : o.viewL, pal });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  athLegs(ctx, sd, o.run, false);
  cut(ctx, rrPts(-33, -80, 66, 104, 20), S.skin, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  const body = [[-116, -4], [116, -4], [150, 10], [163, 56], [168, 460], [-168, 460], [-163, 56], [-150, 10]];
  cut(ctx, body, coach ? P.ch : P.or, { seed: sd + 25, scribble: coach ? P.chS : P.orS });
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = coach ? P.chD : P.orD; ctx.lineWidth = 10;
  if (coach) { ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 460); ctx.stroke(); cut(ctx, rectPts(-166, 170, 332, 70), P.or, { seed: sd + 26, amp: 1.5, edge: false, shadow: false }); }
  else { ctx.beginPath(); ctx.moveTo(-50, -6); ctx.quadraticCurveTo(0, 40, 50, -6); ctx.stroke(); ctx.lineWidth = 5; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 70, 4); ctx.lineTo(k * 156, 150); ctx.stroke(); } } // raglan ραφές
  ctx.restore();
  if (coach) { logoOn(ctx, 'emb', 74, 90, 100); ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-40, -2); ctx.lineTo(-58, 220); ctx.moveTo(40, -2); ctx.lineTo(-50, 220); ctx.stroke(); ctx.restore(); cut(ctx, rrPts(-86, 216, 58, 30, 12), P.steel, { seed: sd + 27, amp: 0.8, edgeW: 3 }); }
  else pulseLogo(ctx, 0, 180, 150, { bg: P.ch });                                                                              // στάμπα στο στήθος
  if (o.medal) { const sw = o.swing || 0; ctx.save(); ctx.rotate(sw * 0.35); ribbon(ctx, -54, 0, 54, 0, 0, 236, 'red', 22); medal(ctx, 0, 290, 54, o.medal, { rot: sw }); ctx.restore(); }
  if (!o.armRFront) arm(ctx, 1, aR, ao(1)); arm(ctx, -1, aL, ao(-1));
  athHead(ctx, o);
  if (o.armRFront) arm(ctx, 1, aR, ao(1));
  if (L.ST.lint) lintRig(ctx, o, aL, aR, ARIG);
  ctx.restore();
  if (o.plaque) { const [hx, hy] = handPos(1, aR, s, x, y, o.elbowR || 0); kuder(ctx, hx, hy + 20 * s * 3.2, s * 3.2, { rot: 0.05, glint: o.glint }); }
}
// αθλητής από πίσω: αριθμός + PULSE στην πλάτη
function athleteBack(ctx, x, y, s, o = {}) {
  const sd = o.seed || 5000, [aL, aR] = o.arms || [0.3, 0.3], pal = { shoulder: 148, sleeve: P.or, sleeveD: P.orD }, hc = HAIR[o.hairC || 0];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  arm(ctx, -1, aL, { seed: sd + 100, hand: 'fist', elbow: o.elbowL, view: 'back', pal }); arm(ctx, 1, aR, { seed: sd + 100, hand: 'fist', elbow: o.elbowR, view: 'back', pal });
  athLegs(ctx, sd, o.run, true);
  cut(ctx, rrPts(-36, -80, 72, 104, 20), S.skinD, { seed: sd + 24, edge: false, shadow: false, amp: 1.5 });
  cut(ctx, [[-116, -4], [116, -4], [150, 10], [163, 56], [168, 460], [-168, 460], [-163, 56], [-150, 10]], P.or, { seed: sd + 40, scribble: P.orS });
  ctx.save(); ctx.strokeStyle = P.orD; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-54, -2); ctx.quadraticCurveTo(0, 14, 54, -2); ctx.stroke(); ctx.restore();
  txt(ctx, 'PULSE', 0, 80, { font: '52px Brand', color: P.ch }); txt(ctx, o.num || '7', 0, 250, { font: '210px Brand', color: P.ch }); // αριθμός στην πλάτη
  if (o.hairV === 1) cut(ctx, [[-40, -120], [40, -120], [34, 10], [0, 40], [-34, 10]], hc, { seed: sd + 41, amp: 3, edgeW: 6 });      // αλογοουρά
  cut(ctx, circlePts(0, -180, 128, 130, 40), hc, { seed: sd + 42, amp: 3, edgeW: 6, scribble: 'rgba(255,255,255,0.12)' });           // κεφάλι από πίσω
  for (const ex of [-126, 126]) cut(ctx, circlePts(ex, -170, 22, 28, 12), S.skin, { seed: sd + 43 + ex, amp: 1.5, edgeW: 5 });
  cut(ctx, [[-96, -104], [96, -104], [70, -62], [-70, -62]], S.skinD, { seed: sd + 44, amp: 1.5, edge: false, shadow: false });     // σβέρκος
  if (o.hairV === 1) cut(ctx, [[-128, -236], [-60, -270], [60, -270], [128, -236], [126, -214], [60, -246], [-60, -246], [-126, -214]], P.ch, { seed: sd + 45, amp: 1.5, edgeW: 4, shadow: false });
  ctx.restore();
}
// οι τρεις αθλητές + ο προπονητής
const ATH = [
  { seed: 5100, hairV: 1, hairC: 2, num: '7', medal: 'gold' },
  { seed: 5200, hairV: 0, hairC: 0, num: '10', medal: 'silver' },
  { seed: 5300, hairV: 0, hairC: 1, num: '23', medal: 'bronze' },
];
const runArms = (ph, k = 1) => ({ arms: [0.32 + 0.2 * k * Math.sin(ph), 0.32 - 0.2 * k * Math.sin(ph)], elbowL: 1.75 + 0.3 * k * Math.sin(ph), elbowR: 1.75 - 0.3 * k * Math.sin(ph), handL: 'fist', handR: 'fist' });
const AS = 0.36;                              // κλίμακα αθλητή στο wide
const ay = feet => feet - 850 * AS;           // πόδια → γραμμή ώμων
const LANE = [300, 520, 740], POD = [[500, 1120], [366, 1190], [633, 1230]]; // θέσεις: γραμμή εκκίνησης · βάθρο (x, πόδια)
function athletesWide(ctx, t, out) {
  const k = t > out ? spring(1 - prog(t, out, out + 0.3)) : 1; if (k <= 0.01) return;
  if (t >= CUT.E3) { // στο βάθρο με τα μετάλλια
    const sw = wobble(t, CUT.E3 + 0.12, 0.45, 2.2, 0.14);
    POD.map((p, i) => [p, i]).sort((a, b) => a[0][1] - b[0][1]).forEach(([[x, fy], i]) => { const s = 0.3; ctx.save(); ctx.translate(x, fy); ctx.scale(k, k); ctx.translate(-x, -fy);
      athlete(ctx, x, fy - 850 * s, s, { ...ATH[i], swing: sw * (i ? 0.7 : 1), mouth: 'grin', eyes: 'happy', blink: blinkNow(i),
        ...(i === 0 ? { arms: [0.3, 1.75], elbowR: -1.05, handR: 'grip', plaque: true, glint: prog(t, CUT.E3 + 0.5, CUT.E3 + 1.1) } : { arms: [0.2, 0.2] }) });
      ctx.restore(); });
    return;
  }
  if (t < CUT.E1) return;
  if (t >= CUT.E2) { // πλάτες: τρέχουν προς το βάθρο
    ATH.map((a, i) => i).reverse().forEach(i => { const u = prog(t, CUT.E2 - 0.1 + i * 0.12, CUT.E3 + 0.4), fy = lerp(1960, 1440, easeOut(u)), s = lerp(0.72, 0.3, easeOut(u)), ph = t * 11 + i * 2;
      athleteBack(ctx, lerp([340, 560, 790][i], [400, 540, 680][i], u), fy - 850 * s, s, { ...ATH[i], medal: null, run: ph, arms: [0.3 + 0.25 * Math.sin(ph), 0.3 - 0.25 * Math.sin(ph)], elbowL: 1.6, elbowR: 1.6 }); });
    return;
  }
  ATH.forEach((a, i) => { // μπαίνουν τρέχοντας από αριστερά → τρέχουν επί τόπου στη γραμμή εκκίνησης
    const t0 = CUT.E1 + 0.2 + i * 0.15, x = springTo(t, t0, -260, LANE[i], { f: 1.4, z: 0.7 }), moving = t < t0 + 0.9, ph = t * (moving ? 12 : 8) + i * 1.7;
    const sprint = t > T.anal + 1.6 ? prog(t, T.anal + 1.6, CUT.E2) : 0;
    athlete(ctx, x + sprint * 900, ay(1560), AS, { ...a, medal: null, run: ph, ...runArms(ph, moving || sprint ? 1 : 0.5), mouth: 'smile', eyes: 'dot', blink: blinkNow(i + 1), look: moving ? 10 : 0 });
  });
}
function coach(ctx, t, out) {
  if (t < CUT.E1 + 0.3) return; const k = Math.min(spring(prog(t, CUT.E1 + 0.3, CUT.E1 + 0.8)), t > out ? spring(1 - prog(t, out, out + 0.3)) : 1); if (k <= 0.01) return;
  const clap = Math.sin(t * 14) > 0, s = 0.4;
  ctx.save(); ctx.translate(165, 1600); ctx.scale(k, k); ctx.translate(-165, -1600);
  athlete(ctx, 165, 1600 - 850 * s, s, { seed: 5400, coach: true, hairC: 0, arms: [clap ? 0.5 : 0.62, clap ? 0.5 : 0.62], elbowL: 2.0, elbowR: 2.0, handL: 'open', handR: 'open', viewL: 'back', viewR: 'back', mouth: 'grin', eyes: 'happy', blink: blinkNow(3) });
  ctx.restore();
}

// ---------- Στράτος ----------
const SX = 880, SF = 1520, SS = 0.42, SY = SF - 870 * SS;
const POSES = [
  [0, {}],
  [T.enan + 0.1, { aL: 1.4, eL: -1.6, hL: 'thumb', eyes: 'happy' }],
  [T.strat + 0.4, { aL: 1.4, eL: -1.6, hL: 'fist', eyes: 'happy' }],   // πρώτα κλείνει το χέρι, μετά κατεβαίνει (όχι thumb προς τα κάτω)
  [T.strat + 0.8, { eyes: 'happy' }],
  [T.esy, { aL: 1.25, eL: -0.3, hL: 'open', look: -10 }],
  [T.emeis - 0.05, { aR: 0.55, eR: 1.9, hR: 'point', front: true, look: 0 }],
  [T.ypol, { aL: 1.4, eL: -1.6, hL: 'thumb', eyes: 'happy' }],
  [T.steile, { aL: 2.2, eL: -0.6, hL: 'wave', eyes: 'happy' }],
  [T.kai, { aL: 0.35, eL: -0.2, hL: 'point', look: -12, eyes: 'dot' }],
  [CUT.OUT, { eyes: 'happy' }],
];
function stratosIn(ctx, t) {
  const tin = T.enan - 0.05, tout = CUT.OUT + 0.2; if (t < tin || t > tout + 0.35) return;
  const k = t < tout ? spring(prog(t, tin, tin + 0.5)) : spring(1 - prog(t, tout, tout + 0.35)); if (k <= 0.01) return;
  ctx.save(); ctx.translate(SX, SF); ctx.scale(k, k); ctx.translate(-SX, -SF);
  stratos(ctx, SX, SY, SS, { seed: 1000, ...poseSpring(POSES, t, { swap: 0.3, f: 2.8 }), mouth: lipsync(VO, 'smile'), blink: blinkNow() });
  ctx.restore();
}

// ---------- ο κόσμος σε μια στιγμή t ----------
const ITEM = { banner: [8.46, 8.95], ties: [9.0, 9.06, 9.12, 9.18, 9.24, 9.3], rollup: [8.9, 9.35], floor: 10.95 };
const outs = X => ({ banner: X + 0.5, rollup: X + 0.4, floor: X + 0.3, awards: X + 0.12, garm: X + 0.45, ath: X }); // rewind: ανάποδη σειρά
const inOut = (t, a, o, dIn, dOut) => t < a ? 0 : t < o ? prog(t, a, a + dIn) : 1 - prog(t, o, o + dOut);        // παρουσία: μπαίνει στο a, φεύγει στο o
function world(ctx, t, o = {}) {
  const OU = outs(o.out ?? Infinity);
  const bk = t > OU.banner ? 1 - easeInOut(prog(t, OU.banner, OU.banner + 0.45)) : easeInOut(prog(t, ...ITEM.banner));
  const rk = t > OU.rollup ? 1 - easeIn(prog(t, OU.rollup, OU.rollup + 0.35)) : easeOut(prog(t, ...ITEM.rollup));
  const fk = t > OU.floor ? 1 - prog(t, OU.floor, OU.floor + 0.3) : prog(t, ITEM.floor, ITEM.floor + 0.45);
  gymBG(ctx);
  ghosts(ctx, t, { banner: bk, rollup: rk, floor: fk, garm: GARM.map(([, , t0], i) => inOut(t, t0, OU.garm + (2 - i) * 0.07, 0.2, 0.35)),
    dresel: AW.dresel.map(a => inOut(t, a, OU.ath, 0.2, 0.3)), kuder: inOut(t, AW.kuder, OU.ath, 0.2, 0.3), holden: AW.holden.map((a, i) => inOut(t, a, OU.awards + i * 0.04, 0.2, 0.3)) });
  banner(ctx, t, bk, ITEM.ties);
  rollup(ctx, rk);
  railFrame(ctx); garments(ctx, t, OU.garm);
  podium(ctx, fk);
  floorStickers(ctx, fk);
  awardsTable(ctx, t, t >= CUT.E3, OU.awards);
  coach(ctx, t, OU.ath);
  athletesWide(ctx, t, OU.ath);
  if (o.focus) { ctx.save(); ctx.globalAlpha = o.focus; ctx.fillStyle = P.wall; ctx.fillRect(-400, -200, W + 800, H + 400); ctx.restore(); } // focus στον Στράτο
  stratosIn(ctx, t);
}

// ---------- σκηνές ----------
const WIDE = [540, 960, 1, 540, 960];
const camApply = (ctx, [x, y, z, sx, sy]) => cam(ctx, x, y, z, sx, sy);
// hook (αλλαγή κάθε ~1s): το έτοιμο event (= συνέχεια του τέλους, seamless) → κοντινό στην απονομή → ◀◀ rewind: όλα φεύγουν ανάποδα → άδειο με «?»
const HK = { close: 1.15, rew: 2.3, empty: 3.0 };
function sA(ctx, lt) {
  const tw = CUT.END + lt, c0 = [540, 975, 1.04, 540, 960];                  // χρόνος κόσμου: συνεχίζει από το τέλος του βίντεο
  const c = lt < HK.close ? L.lerpArr(WIDE, c0, easeInOut(prog(lt, 0, HK.close))) : lt < HK.rew ? snap(lt, HK.close, c0, K.E3, 0.14)
    : lt < HK.empty ? snap(lt, HK.rew, K.E3, WIDE, 0.14) : L.lerpArr(WIDE, [540, 1000, 1.07, 540, 960], easeInOut(prog(lt, HK.empty, CUT.B)));
  const rw = lt >= HK.rew && lt < HK.empty + 0.25;
  ctx.save(); if (rw) ctx.translate(Math.sin(lt * 70) * 6, 0);
  camApply(ctx, c); world(ctx, tw, { out: CUT.END + HK.rew });
  if (lt < HK.close) LOGOS.forEach(([x, y], i) => sparkle(ctx, x + 30, y - 30, 0.55, lt, 0.2 + i * 0.1, 970 + i));
  if (lt >= HK.close && lt < HK.rew) confetti(ctx, lt, HK.close + 0.05, 0.8, 1.4);
  ctx.restore();
  if (rw) rewindFX(ctx, lt);
  captionSeq(ctx, lt, [[-1, HOOKCAP], [2.3, 'και ετοιμάζεις το επόμενο event;']]);
}
function rewindFX(ctx, lt) { // ◀◀ + γραμμές βίντεο
  ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#fff'; for (let y = (lt * 900) % 26; y < H; y += 26) ctx.fillRect(0, y, W, 5);
  ctx.globalAlpha = 0.5; const yb = (lt * 1700) % (H + 200) - 100; ctx.fillRect(0, yb, W, 40); ctx.restore();
  pop(ctx, lt, HK.rew, 190, 590, () => { cut(ctx, rrPts(-120, -58, 240, 116, 26), C.ink, { seed: 3400, amp: 2, edgeW: 7 });
    for (const dx of [-44, 20]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(dx + 36, -32); ctx.lineTo(dx + 36, 32); ctx.lineTo(dx - 12, 0); ctx.closePath(); ctx.fill(); } });
}
// 4 κινητά, 4 προμηθευτές, 4 εκδοχές του λογότυπου
const SUP = [
  ['Ρούχα', 'Ξαναστείλε το λογότυπο.', { sx: 1.5 }, [290, 720, -0.08]],
  ['Εκτυπώσεις', 'Αυτό το πορτοκαλί;', { bg: '#E2402A' }, [790, 700, 0.07]],
  ['Αυτοκόλλητα', 'Παράδοση... Δευτέρα;', { bg: '#FFB21A' }, [300, 1215, 0.05]],
  ['Βραβεία', 'Ποιο λογότυπο;', { bg: P.ch, fg: P.or }, [780, 1190, -0.06]],
];
function sB(ctx, lt) {
  const t = CUT.B + lt;
  bgFlat(ctx, '#C9A57C', '#B8926A', 31);
  SUP.forEach(([name, msg, lo, [cx, cy, rot]], i) => {
    const t0 = CUT.B + 0.08 + i * 0.3; if (t < t0) return;
    const k = spring(prog(t, t0, t0 + 0.45)), buzz = (t - t0 < 0.7 ? 1 : 0) + (t > 6.0 ? 1.4 : 0), dx = Math.sin(t * 95 + i) * 5 * buzz, dr = Math.sin(t * 80 + i * 2) * 0.02 * buzz;
    ctx.save(); ctx.translate(cx + dx, cy); ctx.scale(k, k); ctx.rotate(dr); ctx.translate(-cx, -cy);
    phoneFrame(ctx, cx, cy, 350, 580, (c, w, h) => {
      cut(c, rectPts(-10, -10, w + 20, 96), C.navy, { seed: 3200 + i, amp: 1, edge: false, shadow: false });
      c.fillStyle = C.sky; c.beginPath(); c.arc(46, 44, 24, 0, 7); c.fill();
      txt(c, name, 84, 44, { font: 'bold 34px Round', color: '#fff', align: 'left' });
      pop(c, t, t0 + 0.25, 128, 214, () => { cut(c, rrPts(-104, -94, 208, 188, 22), '#fff', { seed: 3210 + i, amp: 1.5, edgeW: 4 }); pulseLogo(c, 0, 0, 150, lo); });
      pop(c, t, t0 + 0.5, 20, 336, () => { c.font = 'bold 30px Round'; const ln = wrap(c, msg, w - 90), bh = 24 + ln.length * 38;
        cut(c, rrPts(0, 0, w - 50, bh, 20), '#fff', { seed: 3220 + i, amp: 1.5, edgeW: 4 }); ln.forEach((s, j) => txt(c, s, 22, 30 + j * 38, { font: 'bold 30px Round', color: C.ink, align: 'left' })); });
    }, { rot, seed: 7200 + i * 10 });
    ctx.restore();
  });
  captionSeq(ctx, lt, [[0.1, 'Μην μπλέξεις με 3-4'], [5.45 - CUT.B, 'διαφορετικούς προμηθευτές.']]);
}
// C–G: ένα συνεχές σκηνικό με snap zoom (mockumentary)
const K = {
  C1: [880, 858, 3.0, 540, 1010], C2: [560, 900, 1.08, 540, 960], C4: [540, 1325, 3.2, 540, 1000],
  E1b: [520, 1330, 1.9, 540, 960], E3: [500, 1000, 2.2, 540, 960], F: [SX, SY + 10, 2.1, 720, 960],
};
function camAt(t) {
  if (t < CUT.C2) return L.lerpArr(K.C1, [890, 858, 3.1, 540, 1010], prog(t, CUT.C, CUT.C2));
  if (t < CUT.C4) return snap(t, CUT.C2, K.C1, K.C2, 0.16);
  if (t < CUT.D) return L.lerpArr(K.C4, [540, 1320, 3.3, 540, 1000], prog(t, CUT.C4, CUT.D));
  if (t < CUT.E1b) return snap(t, CUT.D, K.C4, WIDE, 0.3);
  if (t < CUT.E2) return snap(t, CUT.E1b, WIDE, K.E1b, 0.14);
  if (t < CUT.E3) return snap(t, CUT.E2, K.E1b, WIDE, 0.14);
  if (t < CUT.E4) return snap(t, CUT.E3, WIDE, K.E3, 0.14);
  if (t < CUT.F) return snap(t, CUT.E4, K.E3, WIDE, 0.22);
  if (t < CUT.G) return snap(t, CUT.F, WIDE, K.F, 0.14);
  return snap(t, CUT.G, K.F, WIDE, 0.22);
}
// κάτοψη δαπέδου: το αυτοκόλλητο START στρώνεται με ρακλέτα + βέλη
function floorTop(ctx, t) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), P.floor, { seed: 180, amp: 2, edge: false, shadow: false, scribble: P.floorS });
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 4; for (let x = 0; x <= W; x += 270) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 150; y <= H; y += 270) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const r = rng(181); ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 500; i++) ctx.fillRect(r() * W, r() * H, 4, 4); ctx.restore();
  const X0 = 80, X1 = 1000, Y0 = 860, Y1 = 1120, k = easeInOut(prog(t, CUT.C3 + 0.05, CUT.C3 + 0.5)), xe = lerp(X0, X1, k);
  const sq = lerp(X0 - 80, X1 + 60, easeInOut(prog(t, CUT.C3 + 0.5, CUT.C3 + 1.15)));
  if (k > 0.01) {
    ctx.save(); ctx.beginPath(); ctx.rect(X0 - 20, Y0 - 40, xe - X0 + 20, Y1 - Y0 + 80); ctx.clip();
    cut(ctx, rectPts(X0, Y0, X1 - X0, Y1 - Y0), P.or, { seed: 182, amp: 1.5, edgeW: 5, sx: 3, sy: 4 });
    ctx.fillStyle = P.ch; for (const x0 of [X0 + 10, X1 - 70]) for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) ctx.fillRect(x0 + i * 30, Y0 + 10 + j * 60, 30, 60);
    pulseLogo(ctx, X0 + 190, (Y0 + Y1) / 2, 190, { bg: P.ch });
    txt(ctx, 'START', 620, (Y0 + Y1) / 2 + 6, { font: '150px Brand', color: '#fff' });
    const r2 = rng(183); ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 40; i++) { const bx = X0 + 40 + r2() * (X1 - X0 - 80), by = Y0 + 20 + r2() * (Y1 - Y0 - 40), br = 5 + r2() * 9; if (bx > sq + 20) { ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill(); } } // φυσαλίδες πριν τη ρακλέτα
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(300, Y0); ctx.lineTo(380, Y0); ctx.lineTo(300, Y1); ctx.lineTo(220, Y1); ctx.fill(); ctx.restore(); // πλαστικοποίηση anti-slip
    ctx.restore();
    if (k < 1) cut(ctx, rrPts(xe - 24, Y0 - 24, 48, Y1 - Y0 + 48, 22), P.orS, { seed: 184, amp: 1, edgeW: 5 });                // ρολό
  }
  if (t > CUT.C3 + 0.45 && t < CUT.C3 + 1.3) { // ρακλέτα με τσόχα + χέρι
    cut(ctx, rrPts(sq - 20, Y0 - 50, 40, Y1 - Y0 + 100, 12), C.mid, { seed: 185, amp: 1, edgeW: 5 });
    cut(ctx, rectPts(sq + 12, Y0 - 44, 10, Y1 - Y0 + 88), C.ink, { seed: 186, amp: 0.5, edge: false, shadow: false });
    reach(ctx, sq - 6, (Y0 + Y1) / 2 + 60, -0.35, 1, { hand: 'fist', seed: 187 });
  }
  [[330, 1360, CUT.C3 + 0.95], [700, 1360, CUT.C3 + 1.12]].forEach(([ax, ay2, st]) => pop(ctx, t, st, ax, ay2, () => cut(ctx, [[-110, -60], [20, -60], [110, 0], [20, 60], [-110, 60], [-30, 0]], P.or, { seed: 188 + ax, amp: 1.5, edgeW: 5 })));
}
function sC(ctx, lt) {
  const t = CUT.C + lt;
  if (t >= CUT.C3 && t < CUT.C4) floorTop(ctx, t);
  else { ctx.save(); camApply(ctx, camAt(t)); world(ctx, t, { focus: t >= CUT.F && t < CUT.G ? 0.62 * clamp((t - CUT.F) / 0.2) : 0 }); sparkles(ctx, t); ctx.restore(); }
  chips(ctx, t);
  if (t >= CUT.F && t < CUT.G) organizeCards(ctx, t);
  if (t >= CUT.G) { const k = t > CUT.OUT ? 1 - easeIn(prog(t, CUT.OUT, CUT.OUT + 0.2)) : 1; if (k > 0.01) { ctx.save(); ctx.translate(540, 1330); ctx.scale(k, k); ctx.translate(-540, -1330); ctaButton(ctx, t, T.steile + 0.1, 540, 1330, 'Πάρε προσφορά'); ctx.restore(); } }
  captionSeq(ctx, lt, [
    [T.rouxa - 0.1, 'Ρούχα για την ομάδα;'], [T.ektyp - 0.08, 'Εκτυπώσεις και banners;'], [T.autok - 0.1, 'Αυτοκόλλητα και σήμανση;'], [T.kyp - 0.1, 'Κύπελλα, μετάλλια ή βραβεία;'],
    [T.mpor - 0.08, 'Μπορείς να τα οργανώσεις όλα'], [T.enan - 0.1, 'με έναν συνεργάτη.'], [T.strat - 0.05, 'Στη Strategix αναλαμβάνουμε'], [T.anal + 0.6, 'ό,τι χρειάζεσαι για το event σου,'],
    [19.85, 'από την ένδυση και τις εκτυπώσεις,'], [T.mexri - 0.05, 'μέχρι τα βραβεία'], [T.brand - 0.2, 'και το branding του χώρου.'],
    [T.esy - 0.05, 'Εσύ οργανώνεις το event.'], [T.emeis - 0.05, 'Εμείς φροντίζουμε τα υπόλοιπα.'],
    [T.steile - 0.05, 'Στείλε μας μήνυμα,'], [T.kai - 0.05, 'και πάμε να οργανώσουμε μαζί'], [T.event2 - 0.05, 'το επόμενό σου event.'], [T.voEnd - 0.3, HOOKCAP],
  ].map(([a, s]) => [a - CUT.C, s]));
}
function chips(ctx, t) { // ✓ ανά κατηγορία στα κοντινά
  const Cp = [[CUT.C, CUT.C2, 'Ρούχα', 540, 610], [CUT.C2, CUT.C3, 'Εκτυπώσεις', 600, 1000], [CUT.C3, CUT.C4, 'Σήμανση', 540, 610], [CUT.C4, CUT.D, 'Βραβεία', 540, 610]];
  for (const [a, b, lab, x, y] of Cp) if (t >= a && t < b) checkChip(ctx, t, a + 0.3, x, y, lab, { seed: 60 + lab.length });
}
const LOGOS = [[BN[0] + 112, BN[1] + 100], [150, RU[2] + 120], [800, RL[2] + 90], [500, PDB - 150], [540, 1507], [540, TB[2] - 72]];
function confetti(ctx, t, t0, dur, life) { // χάρτινο κομφετί πάνω από το βάθρο (συντεταγμένες κόσμου)
  particles(ctx, t, { t0, t1: t0 + dur, rate: 70, life, seed: 990 + Math.round(t0 * 10), g: 420, drag: 1.4,
    at: (te, r) => [240 + r() * 520, 700 + r() * 40], vel: r => [(r() - 0.5) * 160, -140 - r() * 120],
    draw: (c, p) => { c.save(); c.translate(p.x, p.y); c.rotate(p.age * (4 + p.r() * 4)); c.fillStyle = [P.or, '#FBFAF6', BRAND, P.gold][p.i % 4]; c.fillRect(-6, -3, 12, 6); c.restore(); } });
}
function sparkles(ctx, t) { // λογότυπα που «ανάβουν» (ίδιο λογότυπο παντού)
  const S1 = LOGOS;
  if (t < CUT.E1) S1.forEach(([x, y], i) => sparkle(ctx, x + 30, y - 30, 0.5, t, T.mpor + 0.3 + i * 0.16, 900 + i));
  if (t >= CUT.E2 && t < CUT.E3) [[BN[0] + 112, BN[1] + 100], [150, RU[2] + 120]].forEach(([x, y], i) => sparkle(ctx, x + 30, y - 30, 0.6, t, T.ektyp2 + i * 0.12, 950 + i));
  if (t >= CUT.E4 && t < CUT.F) S1.forEach(([x, y], i) => sparkle(ctx, x + 30, y - 30, 0.55, t, T.brand + i * 0.1, 960 + i));
  if (t >= CUT.E3 && t < CUT.E4) confetti(ctx, t, T.vrav2, 0.9, 1.6);
  if (t >= CUT.G) confetti(ctx, t, T.event2 - 0.1, 0.3, 1.3);   // «…το επόμενό σου event.» · σβήνει πριν το τέλος (= frame 0)
}
function organizeCards(ctx, t) { // «Εσύ» → πρόχειρο · «Εμείς» → τα 4 ✓
  pop(ctx, t, T.esy + 0.05, 250, 760, () => {
    cut(ctx, rrPts(-130, -170, 260, 340, 18), '#C8955B', { seed: 3300, amp: 2, edgeW: 7 }); cut(ctx, rrPts(-108, -130, 216, 280, 8), C.paper, { seed: 3301, amp: 1.5, edgeW: 4 });
    cut(ctx, rrPts(-50, -186, 100, 40, 10), P.steel, { seed: 3302, amp: 1, edgeW: 4 });
    txt(ctx, 'EVENT', 0, -92, { font: '40px Brand', color: P.ch }); ctx.save(); ctx.strokeStyle = 'rgba(16,26,51,0.3)'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-80, -30 + i * 44); ctx.lineTo(80, -30 + i * 44); ctx.stroke(); } ctx.restore();
  }, -0.06);
  ['Ρούχα', 'Εκτυπώσεις', 'Σήμανση', 'Βραβεία'].forEach((lab, i) => checkChip(ctx, t, T.emeis + 0.2 + i * 0.14, 250, 1060 + i * 100, lab, { fs: 40, seed: 70 + i }));
}
require('./render.js')({
  name: 'ad_event',
  SCENES: [[sA, CUT.B], [sB, CUT.C - CUT.B], [sC, CUT.END - CUT.C]],
  WIPES: [1, 2],
  LOOP: 'cut',                                    // seamless: το τέλος (έτοιμο event + caption του hook) = frame 0 · το hook συνεχίζει από εκεί (CUT.END + lt)
  VO_FILE: 'vo/ad_event_vo.mp3', VO_AT: 0.2,
  MUSIC_FILE: 'music/ad_event.mp3',
  SFX: [
    [0.25, 'shimmer', { gain: 0.5, note: 'hook: λογότυπα στο έτοιμο event' }], [HK.close, 'zoom', { gain: 0.5, note: 'snap στην απονομή' }],
    [HK.close + 0.08, 'pop', { seed: 20, gain: 0.6, note: 'κομφετί' }], [HK.close + 0.15, 'shimmer', { seed: 6, gain: 0.45 }],
    [HK.rew, 'ticks', { count: 16, gap: 0.04, f: 3200, rise: 0.55, gain: 0.8, note: '◀◀ rewind' }], [HK.rew + 0.05, 'swoosh', { seed: 4, gain: 0.6, note: 'όλα φεύγουν ανάποδα' }],
    ...[0, 1, 2].map(i => [HK.empty + 0.05 + i * 0.18, 'pop', { seed: 21 + i, gain: 0.4, note: '«?»' }]),
    ...SUP.map((_, i) => [CUT.B + 0.08 + i * 0.3, 'ring', { count: 1, seed: i + 1, gain: 0.45, note: `κινητό ${i + 1}` }]),
    ...SUP.map((_, i) => [CUT.B + 0.58 + i * 0.3, 'blip', { seed: i + 1, gain: 0.5, note: 'μήνυμα' }]),
    ...GARM.map(([, , t0], i) => [t0, 'slide', { dur: 0.25, seed: i + 1, gain: 0.6, note: 'κρεμάστρα' }]),
    [ITEM.banner[0], 'slide', { dur: 0.5, seed: 5, gain: 0.7, note: 'banner ξετυλίγεται' }], ...ITEM.ties.filter((_, i) => i % 2 === 0).map((t0, i) => [t0, 'click', { seed: i + 1, gain: 0.5, note: 'δεματικό' }]),
    [ITEM.rollup[0], 'swoosh', { gain: 0.5, note: 'roll-up' }],
    [CUT.C3 + 0.05, 'slide', { dur: 0.45, seed: 7, gain: 0.6, note: 'αυτοκόλλητο δαπέδου' }], [CUT.C3 + 0.5, 'squeegee', { dur: 0.65, gain: 0.6, note: 'ρακλέτα' }],
    [CUT.C3 + 0.95, 'stamp', { gain: 0.6, note: 'βέλος' }], [CUT.C3 + 1.12, 'stamp', { seed: 2, gain: 0.6, note: 'βέλος' }],
    [AW.kuder + 0.12, 'thud', { gain: 0.6, note: 'KUDER' }], [AW.kuder + 0.5, 'shimmer', { gain: 0.5, note: 'γυαλάδα' }],
    ...AW.dresel.map((t0, i) => [t0 + 0.08, 'pop', { seed: i + 3, gain: 0.5, note: 'DRESEL' }]), ...AW.holden.map((t0, i) => [t0 + 0.08, 'pop', { seed: i + 6, gain: 0.45, note: 'HOLDEN' }]),
    [CUT.D, 'zoom', { seed: 2, gain: 0.6, note: 'zoom out' }], [T.mpor + 0.3, 'shimmer', { seed: 2, gain: 0.5, note: 'ίδιο λογότυπο παντού' }],
    [T.enan - 0.05, 'pop', { seed: 9, note: 'Στράτος' }], [T.enan + 0.12, 'swoosh', { seed: 2, gain: 0.5, note: '👍' }],
    [CUT.E1 + 0.2, 'whoosh', { seed: 7, gain: 0.5, note: 'αθλητές τρέχουν' }], [CUT.E1b, 'zoom', { seed: 3, gain: 0.5 }], [CUT.E2, 'zoom', { seed: 4, gain: 0.5 }],
    [T.ektyp2, 'shimmer', { seed: 3, gain: 0.4 }], [CUT.E3, 'zoom', { seed: 5, gain: 0.5 }], [T.vrav2, 'pop', { seed: 10, gain: 0.6, note: 'κομφετί' }], [T.vrav2 + 0.1, 'shimmer', { seed: 4, gain: 0.5 }],
    [CUT.E4, 'zoom', { seed: 6, gain: 0.5 }], [T.brand + 0.1, 'shimmer', { seed: 5, gain: 0.5, note: 'branding' }],
    [CUT.F, 'zoom', { seed: 7, gain: 0.5 }], [T.esy + 0.05, 'pop', { seed: 11, gain: 0.6, note: 'πρόχειρο' }], ...[0, 1, 2, 3].map(i => [T.emeis + 0.2 + i * 0.14, 'pop', { seed: 12 + i, gain: 0.45, note: '✓' }]),
    [T.ypol, 'swoosh', { seed: 3, gain: 0.5, note: '👍' }], [CUT.G, 'zoom', { seed: 8, gain: 0.5 }], [T.steile + 0.1, 'pop', { seed: 16, note: 'Πάρε προσφορά' }],
    [T.event2 - 0.05, 'pop', { seed: 24, gain: 0.5, note: 'κομφετί τέλους' }], [T.event2, 'shimmer', { seed: 7, gain: 0.45 }],
  ],
});
