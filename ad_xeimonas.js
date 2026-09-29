// AD — «Ντύσε την ομάδα σου για τον χειμώνα» · φούτερ / fleece / softshell / μπουφάν με logo (εκτύπωση ή κέντημα) · host: Στράτος (PiP + χέρι)
// 1ο επεισόδιο με ΑΛΗΘΙΝΕΣ φωτογραφίες προϊόντων (strategixstudios.com → Roly, photos/ad_xeimonas.txt → node photos.js ad_xeimonas):
// κάθε φωτογραφία = χάρτινο cut-out «κομμένο από κατάλογο» (props/photo.js: λευκή σκισμένη άκρη, σκιά, boil) που κινείται σαν χάρτινη κούκλα.
// Το λογότυπο του demo πελάτη (KOSTAS COFFEE, Latin §3) μπαίνει ΠΑΝΩ στο ύφασμα της φωτογραφίας (photoLogo: οι πτυχές περνάνε στη στάμπα/στο κέντημα).
// Ιδέα: hook = η ομάδα ντυμένη στο χιόνι (zoom + αργή κίνηση δεξιά πάνω στα ρούχα) → κατηγορίες → ο Στράτος ψαλιδίζει από τον κατάλογο → διαλέγεις → logo (στάμπα / κέντημα) → ομάδα = frame 0 (seamless).
// CTA: VO «Στείλε μας μήνυμα», κουμπί «Πάρε προσφορά» (όπως ad_event).
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, lerp, prog, clamp, easeOut, easeIn, easeInOut, rng, cam, snap, mixHex, brandMark } = L;
const { springTo, springKeys, wobble, fall, particles, deriv } = require('./motion.js');
const { BRAND, bgFlat, reach, pip, PIP, stamp, sparkle, ctaButton, cuttingMat, kostasLogo, photo, photoCut, photoPt, photoJpg, photoBox, photoLogo, drawLogo } = require('./props.js');

// VO = vo/ad_xeimonas_vo.mp3 @ 0,2s (vo/ad_xeimonas.txt, eleven_v3 «Stratos», take 1 seed 1001 · atempo 1.08 · παύσεις > 0,3s → 0,3s). Χρονισμοί (video):
// 0,27 Ήρθε η ώρα να ντύσεις (0,90) την ομάδα σου (1,45) για τον χειμώνα; (–2,60) | 2,75 Φούτερ με (3,35) ή χωρίς (3,82) κουκούλα; (–4,60)
// 4,83 Φλις; | 5,56 Σόφτσελ; | 6,24 Μπουφάν; (–6,80) | 7,16 Στη Στράτετζιξ θα βρεις (8,17) όλα όσα χρειάζεσαι (8,52) για τη χειμερινή (9,59) επαγγελματική (10,06) σου ένδυση. (–11,23)
// 11,45 Διάλεξε τα ρούχα (12,01) που ταιριάζουν (12,27) στην ομάδα σου, (12,87–13,43) | 13,60 και εμείς (13,75) αναλαμβάνουμε (14,01) να προσθέσουμε (14,70) το λόγκο σου, (15,27–15,80)
// 15,98 με εκτύπωση (16,13) ή κέντημα. (16,90–17,33) | 17,54 Για να είναι η ομάδα σου (18,07) όχι μόνο (18,71) ζεστή, (19,15) | 19,83 αλλά και επαγγελματική. (20,21–20,97)
// 21,28 Στείλε μας μήνυμα, (21,65) | 22,24 και πάμε να βρούμε μαζί (22,94) την κατάλληλη ένδυση (23,52) για την επιχείρησή σου. (24,61–25,27)
const T = {
  ntys: 0.9, omada: 1.45, xeim: 2.09, fout: 2.75, me: 3.35, xwris: 3.82, flis: 4.83, soft: 5.56, mpouf: 6.24,
  strat: 7.22, ola: 8.52, xreiaz: 8.96, xeimer: 9.59, epag: 10.06, endysi: 10.84,
  dialexe: 11.45, rouxa: 12.01, tair: 12.27, omada2: 12.87, emeis: 13.75, anal: 14.01, prosth: 14.7, logo: 15.27, ektyp: 16.13, kent: 16.9,
  gia: 17.54, zesti: 19.15, alla: 19.83, epag2: 20.21, steile: 21.28, kai: 22.24, katal: 23.52, gia2: 24.37, voEnd: 25.3,
};
const CUT = { B: 2.66, B2: 4.75, B3: 5.5, B4: 6.2, C: 7.02, D1: 11.33, D2: 13.52, E: 17.45, CTA: 21.1, OUT: 25.4, END: 26.3 };
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const HOOKCAP = 'Ήρθε η ώρα να ντύσεις'; // 1ο κομμάτι του hook = frame 0 = τελευταίο caption (seamless loop)
const EP = 'ad_xeimonas', ph = n => photo(EP, n);

// ---------- λογότυπο πελάτη πάνω στο ύφασμα ----------
function kostas(c, x, y, d) { kostasLogo(c, x, y, d); }                          // στάμπα (DTF): έγχρωμο
function kostasEmb(c, x, y, d) { kostasLogo(c, x, y, d, { mono: '#F5E6C8' }); } // κέντημα: κλωστή κρεμ
// ομάδα (royal blue): σημείο στο στήθος (u, v), διάμετρος σε px φωτογραφίας, είδος
const TEAM = { // μία σειρά αριστερά → δεξιά (ο επόμενος καλύπτει τη δεξιά πλευρά του προηγούμενου → logo στην αριστερή πλευρά)
  // σημεία από κοντινό κάθε φωτογραφίας (v2, σημείωση Αλέξανδρου «τα λογότυπα δεν μπήκαν σε σωστά σημεία»): επίπεδο ύφασμα στο στήθος, μακριά από χέρια / φερμουάρ / κορδόνια ·
  // μέγεθος πραγματικού logo στήθους (~10 cm ≈ 13% του πλάτους της φωτογραφίας) · φούτερ: στάμπα στο κέντρο του στήθους, ανάμεσα στα κορδόνια και την τσέπη
  urbanw: { x: 175, y: 1650, hh: 960, u: 0.44, v: 0.435, d: 135, kind: 'print' },
  newartic: { x: 420, y: 1650, hh: 960, u: 0.47, v: 0.37, d: 100, kind: 'emb' }, // v3: δεξιότερα, έξω από τη ραφή του μανικιού (τσάκιση στο u ≈ 0,34)
  antartida: { x: 660, y: 1650, hh: 960, u: 0.30, v: 0.375, d: 95, kind: 'emb' },
  americaw: { x: 895, y: 1650, hh: 960, u: 0.215, v: 0.395, d: 105, kind: 'print' },
};
const teamLogo = (n, kind = TEAM[n].kind) => photoLogo(ph(n), kind === 'emb' ? kostasEmb : kostas, TEAM[n].u, TEAM[n].v, TEAM[n].d, kind);

// ---------- χιόνι (stateless) · o.stop = σταματάει και λιώνει · o.again = ξαναρχίζει ----------
function snow(ctx, t, o = {}) {
  const stop = o.stop ?? 1e9, melt = clamp((t - stop) / 0.5), wins = [[-10, stop]]; if (o.again) wins.push([o.again, 1e9]);
  for (const [a, b] of wins) particles(ctx, t, {
    t0: a, t1: b, rate: o.rate ?? 22, life: 4.5, seed: 700 + Math.round(a), g: 0, drag: 0,
    at: (te, r) => [r() * (W + 200) - 100, r() * H * 1.05 - 120], vel: r => [-18 + r() * 36, 100 + r() * 90],
    draw: (c, p) => {
      const k = Math.min(1, p.age / 0.35) * Math.min(1, (1 - p.k) / 0.12) * (b === stop && t > stop ? 1 - melt : 1); if (k <= 0.02) return;
      const rad = (5 + p.r() * 7) * (o.s ?? 1) * (0.4 + 0.6 * k), x = p.x + Math.sin(p.age * 1.7 + p.i) * 14, n = 7, ang = p.age * (p.i % 2 ? 1 : -1);
      c.save(); c.beginPath(); for (let i = 0; i < n; i++) { const a2 = ang + i / n * 6.283, rr = rad * (0.72 + 0.5 * p.r()); c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a2) * rr, p.y + Math.sin(a2) * rr); } c.closePath();
      c.globalAlpha = 0.25 * k; c.fillStyle = '#0B1B3F'; c.translate(2, 3); c.fill(); c.translate(-2, -3); c.globalAlpha = k; c.fillStyle = '#FBFAF6'; c.fill(); c.restore();
    },
  });
}
// χάρτινο έλατο (φόντο) · (x, y) = βάση
function pine(ctx, x, y, s, seed) {
  cut(ctx, rectPts(x - 12 * s, y - 40 * s, 24 * s, 44 * s), '#6B4A2E', { seed, amp: 1.5, edgeW: 5 });
  [[0, 170, 150], [-95, 135, 115], [-175, 100, 80]].forEach(([dy, w, h], i) => cut(ctx, [[x - w * s / 2, y - 30 * s + dy * s], [x + w * s / 2, y - 30 * s + dy * s], [x, y - 30 * s + (dy - h) * s]], '#0E2A5C', { seed: seed + i + 1, amp: 2, edgeW: 6, scribble: '#163A78' }));
}
// ---------- κόσμος: η ομάδα στο χιόνι (hook + τέλος) · warm 0..1 = «ζεστή» ----------
function winter(ctx, t, o = {}) {
  const warm = o.warm || 0;
  bgFlat(ctx, mixHex(C.blue, C.mid, warm), '#2A4AA0');
}
function team(ctx, t, o = {}) { // σκηνικό σε συντεταγμένες κόσμου (μέσα στο cam)
  cut(ctx, [[-400, 1470], [120, 1430], [520, 1460], [980, 1420], [1480, 1460], [1480, 2700], [-400, 2700]], C.pale, { seed: 620, amp: 6, edgeW: 8, scribble: '#C9D8F2' });
  pine(ctx, -10, 1500, 1.6, 630); pine(ctx, 1090, 1490, 1.5, 640);
  for (const n of ['urbanw', 'newartic', 'antartida', 'americaw']) {
    const M = TEAM[n], Lg = o.logos !== false && teamLogo(n), br = o.breath ? Math.sin(t * 2.1 + M.x) * 0.006 : 0;
    photoCut(ctx, ph(n), M.x, M.y, M.hh, { sy: 1 + br, draw: Lg ? (c => drawLogo(c, Lg)) : null });
    if (o.shine) sparkle(ctx, ...photoPt(ph(n), M.x, M.y, M.hh, M.u + 0.08, M.v - 0.07), 0.55, t, o.shine + (M.x % 5) * 0.06, 800 + M.x);
  }
  cut(ctx, [[-400, 1575], [60, 1540], [330, 1565], [620, 1535], [900, 1570], [1480, 1545], [1480, 2700], [-400, 2700]], C.paper, { seed: 660, amp: 7, edgeW: 9, scribble: '#E6E1D3' });
}
const WIDE = [540, 960, 1, 540, 960];
const camApply = (ctx, k) => cam(ctx, k[0], k[1], k[2], k[3], k[4]);
// hook (v3, σημείωση Αλέξανδρου): zoom στο πρώτο ρούχο → αργή κίνηση προς τα δεξιά όσο κρατάει η σκηνή, να περνάνε όλα τα ρούχα · lt < 0 = πριν το loop (τέλος της E)
const HOOKCAM = lt => [lerp(250, 830, lt / CUT.B), 1060, 1.5, 540, 1000];

// ---------- A · hook (0 – 2,66): η ομάδα με logo στο χιόνι · 0,9 snap στο logo · 1,45 πίσω · 2,09 ριπή ----------
function sA(ctx, lt) {
  const tt = CUT.END + lt; // συνέχεια της τελευταίας σκηνής (seamless)
  const k = HOOKCAM(lt);
  winter(ctx, tt);
  ctx.save(); camApply(ctx, k); team(ctx, tt, { breath: true, logos: false }); ctx.restore(); // v3: χωρίς logo στα πλάνα της ομάδας (μικρά → «φαιλ»)
  const gust = clamp((lt - T.xeim + 0.05) / 0.25);
  ctx.save(); if (gust > 0) ctx.translate(gust * 30, 0); snow(ctx, tt, { again: CUT.OUT - 0.5, stop: T.zesti, rate: gust > 0 ? 40 : 22 }); ctx.restore();
  if (gust > 0 && gust < 1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - gust); ctx.strokeStyle = '#FBFAF6'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const y = 520 + i * 150, x = -200 + gust * 1400 - i * 60; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 150, y - 40, x + 300, y); ctx.stroke(); } ctx.restore(); }
  captionSeq(ctx, lt, [[-1, HOOKCAP], [T.omada - 0.1, 'την ομάδα σου για τον χειμώνα;']]);
}

// ---------- B · κατηγορίες (2,66 – 7,02): φούτερ με / χωρίς κουκούλα · fleece · softshell · μπουφάν ----------
const inS = (t, t0, o) => springTo(t, t0, 0, 1, { f: 2.4, z: 0.45, ...o });
// carousel (v3, σημείωση Αλέξανδρου «οι εναλλαγές στο 5,2 δεν είναι smooth»): κάθε κατηγορία = χάρτινο πάνελ με δικό του χρώμα · σε κάθε λέξη όλη η λωρίδα
// γλιστράει με ελατήριο (σαν καρτέλες καταλόγου) · τα ρούχα γέρνουν από την αδράνεια (−ταχύτητα) και ισιώνουν · χωρίς απότομη αλλαγή φόντου
const CAR = [[0, 0], [T.flis - 0.15, 1], [T.soft - 0.15, 2], [T.mpouf - 0.15, 3]];
const carAt = t => springKeys(CAR, t, { f: 2.6, z: 0.72 });
const PANELS = [ // χρώμα, scribble, ρούχα [όνομα, x, κάτω y, ύψος, κλίση], stamp, χρόνος
  [C.blue, '#2A4AA0', [['urban', 300, 1710, 960, -0.04], ['clasica', 790, 1710, 930, 0.04]], 'ΦΟΥΤΕΡ', T.fout],
  [C.pale, '#C9D8F2', [['newarticw', 540, 1710, 1000, 0.02]], 'FLEECE', T.flis],
  [C.mid, '#3E6AD6', [['siberia', 540, 1710, 1000, -0.02]], 'SOFTSHELL', T.soft],
  [C.sky, '#A5C0F2', [['finland', 540, 1710, 1000, 0.02]], 'ΜΠΟΥΦΑΝ', T.mpouf],
];
function sB(ctx, lt) {
  const t = CUT.B + lt, c = carAt(t), v = deriv(carAt, t), lean = clamp(v * 0.05, -0.12, 0.12);
  PANELS.forEach(([col, scr, items, word, st], i) => {
    const ox = (i - c) * (W + 40); if (Math.abs(ox) > W + 60) return;
    ctx.save(); ctx.translate(ox, 0);
    cut(ctx, [[-20, -60], [W + 20, -60], [W + 26, 700], [W + 14, 1300], [W + 20, H + 60], [-20, H + 60], [-14, 1200], [-26, 500]], col, { seed: 600 + i * 7, amp: 5, edgeW: 9, scribble: scr });
    items.forEach(([n, x, y, hh, rot], j) => {
      const k = i === 0 ? inS(t, j ? T.xwris - 0.1 : T.fout - 0.05) : 1;                       // φούτερ: pop στις λέξεις · τα άλλα έρχονται με το πάνελ
      const settle = i ? 0.04 * wobble(t, CAR[i][0] + 0.25, 1, 3, 0.35) : 0;
      if (k > 0.01) photoCut(ctx, ph(n), x, y, hh * k, { rot: rot - lean + settle });
    });
    if (i === 0) {
      tagLabel(ctx, t, T.me, ...photoPt(ph('urban'), 300, 1710, 960, 0.42, 0.3, { rot: -0.04 }), 'με κουκούλα', -0.06);
      tagLabel(ctx, t, T.xwris + 0.05, ...photoPt(ph('clasica'), 790, 1710, 930, 0.6, 0.3, { rot: 0.04 }), 'χωρίς', 0.05);
    }
    stamp(ctx, t, i ? CAR[i][0] + 0.2 : st, 540, 600, word, i % 2 ? 0.04 : -0.05);
    ctx.restore();
  });
  snow(ctx, t, { rate: 9, s: 0.8 });
  captionSeq(ctx, lt, [[0, 'Φούτερ με ή χωρίς κουκούλα;'], [T.flis - 0.08, 'Fleece;'], [T.soft - 0.08, 'Softshell;'], [T.mpouf - 0.08, 'Μπουφάν;']].map(([a, s]) => [a && a - CUT.B, s]));
}
// χάρτινη ετικέτα ρούχου (hang tag) με κορδόνι που ταλαντεύεται
function tagLabel(ctx, t, st, x, y, label, rot) {
  const k = inS(t, st); if (k < 0.01) return; const sw = 0.18 * wobble(t, st, 1, 2.2, 0.25);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + sw); ctx.scale(k, k); ctx.translate(0, 70); // (x, y) = σημείο ανάρτησης στο ρούχο
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -70); ctx.quadraticCurveTo(-10, -30, 0, 8); ctx.stroke();
  ctx.font = '44px Round'; const w = ctx.measureText(label).width + 60;
  cut(ctx, [[-w / 2, 30], [-w / 2 + 26, 0], [w / 2 - 26, 0], [w / 2, 30], [w / 2, 96], [-w / 2, 96]], C.paper, { seed: 670 + label.length, amp: 1.5, edgeW: 6 });
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(0, 18, 7, 0, 7); ctx.fill();
  txt(ctx, label, 0, 64, { font: '44px Round', color: C.navy }); ctx.restore();
}

// ---------- C · κατάλογος (7,02 – 11,33): ο Στράτος ψαλιδίζει ένα ρούχο από τον κατάλογο (κάτοψη σε cutting mat) ----------
const PG = { spine: 540, y: 470, h: 720, w: 470 };            // ανοιχτός κατάλογος: σελίδες 470 × 720 δεξιά/αριστερά της ράχης
const BIG = { name: 'newartic', x: 588, y: 600, w: 376, h: 470 }; // η φωτογραφία που κόβεται (δεξιά σελίδα)
const SMALL = [['capucha', 98, 600], ['luciane', 316, 600], ['nebraska', 98, 900], ['emin', 316, 900]]; // αριστερή σελίδα 200 × 250 (2 × 2)
const CUTT = [T.xreiaz - 0.1, T.epag - 0.15];                 // ψαλίδι: αρχή, τέλος
let OUTL = null;
function outline(Ph, n = 150) { // περίγραμμα της λευκής άκρης (ακτίνες από το κέντρο: το πιο μακρινό σημείο) σε px φωτογραφίας
  const { D, GW, GH, R, P } = Ph, cx = GW / 2, cy = GH * 0.4, pts = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * 2 * Math.PI; let last = [cx, cy]; for (let r = 0; ; r += 2) { const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r); if (x < 0 || y < 0 || x >= GW || y >= GH) break; if (D[y * GW + x] <= R) last = [x, y]; } pts.push([last[0] - P, last[1] - P]); }
  return pts;
}
function bigMap() { // px φωτογραφίας (cut-out) → οθόνη · + θέση/ύψος για photoCut
  const Ph = ph(BIG.name), [bx, by, bw, bh] = photoBox(Ph), k = BIG.w / 480, sx = bw / Ph.w;
  return { Ph, f: ([X, Y]) => [BIG.x + (bx + X * sx) * k, BIG.y + (by + Y * sx) * k], cx: BIG.x + (bx + bw / 2) * k, by: BIG.y + (by + bh) * k, hh: bh * k };
}
function page(ctx, x0, seed) { cut(ctx, rectPts(x0, PG.y, PG.w, PG.h), '#FBFAF6', { seed, amp: 1.2, edge: false, sx: 5, sy: 7 }); }
function sC(ctx, lt) {
  const t = CUT.C + lt, open = easeInOut(prog(t, 7.9, 8.4)), M = bigMap(); // εξώφυλλο στο «Στη Στράτετζιξ» → ανοίγει στο «θα βρεις»
  cuttingMat(ctx);
  const CZ = [776, 835, 1.55, 540, 900], ck = t < CUTT[0] - 0.15 ? WIDE : snap(t, CUTT[0] - 0.15, WIDE, CZ, 0.16); // snap στη σελίδα που κόβεται
  ctx.save(); camApply(ctx, ck);
  // δεξιά σελίδα (από κάτω) + μεγάλη φωτογραφία
  page(ctx, PG.spine, 681);
  txt(ctx, 'Fleece', PG.spine + PG.w / 2, PG.y + 70, { font: '40px Round', color: C.navy });
  const cutP = clamp((t - CUTT[0]) / (CUTT[1] - CUTT[0])), lifted = t > CUTT[1] + 0.1;
  ctx.drawImage(photoJpg(M.Ph), BIG.x, BIG.y, BIG.w, BIG.h);
  if (lifted) photoCut(ctx, M.Ph, M.cx, M.by, M.hh, { tint: C.navy, shadow: false }); // τρύπα στη σελίδα: φαίνεται το cutting mat
  txt(ctx, 'NEW ARTIC', PG.spine + PG.w / 2, BIG.y + BIG.h + 50, { font: '34px Brand', color: C.navy });
  // αριστερή σελίδα (όταν ανοίξει) / εξώφυλλο που γυρίζει γύρω από τη ράχη
  const ca = Math.cos(open * Math.PI);
  if (ca < 0) { ctx.save(); ctx.translate(PG.spine, 0); ctx.scale(-ca, 1); ctx.translate(-PG.spine, 0); leftPage(ctx, t); ctx.restore(); }
  else { ctx.save(); ctx.translate(PG.spine, 0); ctx.scale(ca, 1); ctx.translate(-PG.spine, 0); cover(ctx); ctx.restore(); }
  // ψαλίδι γύρω από το ρούχο + σχισμή
  if (!OUTL) OUTL = outline(M.Ph).map(M.f);
  if (t > CUTT[0] && !lifted) {
    const n = Math.floor(cutP * (OUTL.length - 1));
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [w, col] of [[9, 'rgba(11,27,63,0.6)'], [4, '#FBFAF6']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= n; i++) ctx[i ? 'lineTo' : 'moveTo'](...OUTL[i]); ctx.stroke(); }
    ctx.restore();
    const p = OUTL[n], q = OUTL[Math.min(OUTL.length - 1, n + 3)], ang = Math.atan2(q[1] - p[1], q[0] - p[0]), op = 0.5 + 0.5 * Math.sin(t * 38);
    scissors(ctx, p[0], p[1], ang, op, 1.5);
    const hx = p[0] - Math.cos(ang) * 215, hy = p[1] - Math.sin(ang) * 215; reach(ctx, hx, hy, 0.45, 1, { hand: 'fist', seed: 690 });
  }
  if (lifted) { // το cut-out σηκώνεται από τη σελίδα και έρχεται προς την κάμερα
    const up = easeOut(prog(t, CUTT[1] + 0.1, T.endysi)), fly = easeIn(prog(t, T.endysi + 0.05, CUT.D1 + 0.05));
    const s = lerp(1, 1.3, up) * lerp(1, 3.2, fly), cx = lerp(M.cx, 540, up * 0.6 + fly * 0.4), by = lerp(M.by, 1250, up * 0.5) + fly * 900;
    photoCut(ctx, M.Ph, cx, by, M.hh * s, { lift: up, rot: lerp(0, -0.06, up), a: 1 - fly * 0.3 });
    if (t < T.endysi + 0.3) sparkle(ctx, cx + M.hh * s * 0.18, by - M.hh * s * 0.72, 0.8, t, T.epag + 0.05, 695);
  }
  ctx.restore();
  pip(ctx, ...PIP, VO);
  captionSeq(ctx, lt, [[0, 'Στη Strategix θα βρεις'], [T.ola - 0.08, 'όλα όσα χρειάζεσαι'], [T.xeimer - 0.12, 'για τη χειμερινή'], [T.epag - 0.08, 'επαγγελματική σου ένδυση.']].map(([a, s]) => [a && a - CUT.C, s]));
}
function cover(ctx) { // εξώφυλλο καταλόγου (navy) με brandMark
  cut(ctx, rectPts(PG.spine, PG.y, PG.w, PG.h), C.navy, { seed: 700, amp: 1.2, edgeW: 6, scribble: '#15285A' });
  brandMark(ctx, PG.spine + PG.w / 2, PG.y + 170, 70, '#FBFAF6');
  txt(ctx, 'STRATEGIX', PG.spine + PG.w / 2, PG.y + 300, { font: '54px Brand', color: '#FBFAF6' });
  txt(ctx, 'Ένδυση · Χειμώνας', PG.spine + PG.w / 2, PG.y + 370, { font: '40px Round', color: C.sky });
  const Ph = ph('finland'); ctx.save(); ctx.beginPath(); ctx.rect(PG.spine + 95, PG.y + 420, 280, 250); ctx.clip(); ctx.drawImage(photoJpg(Ph), PG.spine + 95, PG.y + 400, 280, 350); ctx.restore();
}
function leftPage(ctx, t) { // αριστερή σελίδα: 4 φωτογραφίες (με φόντο, όπως τυπωμένες)
  page(ctx, PG.spine - PG.w, 682);
  txt(ctx, 'Χειμερινή συλλογή', PG.spine - PG.w / 2, PG.y + 70, { font: '40px Round', color: C.navy });
  for (const [n, x, y] of SMALL) { ctx.drawImage(photoJpg(ph(n)), x, y, 200, 250); ctx.strokeStyle = 'rgba(11,27,63,0.15)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 200, 250); }
  ctx.save(); ctx.fillStyle = 'rgba(11,27,63,0.18)'; ctx.fillRect(PG.spine - 26, PG.y, 26, PG.h); ctx.restore(); // σκιά ράχης
}
function scissors(ctx, x, y, ang, op, s = 1) { // χάρτινο ψαλίδι · (x, y) = σημείο κοπής · ang = κατεύθυνση · op 0..1 άνοιγμα · s κλίμακα
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  for (const sg of [1, -1]) {
    ctx.save(); ctx.translate(-78, 0); ctx.rotate(sg * op * 0.28);
    cut(ctx, [[0, -9 * sg], [86, sg * 2], [0, 7 * sg]], '#C9CDD8', { seed: 710 + sg, amp: 0.8, edgeW: 4 });
    ctx.restore();
    ctx.save(); ctx.translate(-78, 0); ctx.rotate(-sg * op * 0.28);
    cut(ctx, rrPts(-60, sg > 0 ? 4 : -34, 58, 30, 14), BRAND, { seed: 712 + sg, amp: 0.8, edgeW: 4 });
    ctx.restore();
  }
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-78, 0, 6, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- D1 · διάλεξε (11,33 – 13,52): 8 cut-outs στο τραπέζι · το χέρι διαλέγει τα 4 royal · τα άλλα πέφτουν ----------
const FAN = [ // όνομα, x, κάτω y, ύψος, κλίση, χρόνος επιλογής (0 = δεν επιλέγεται)
  ['capucha', 170, 930, 450, -0.07, 0], ['urbanw', 395, 925, 460, 0.05, T.rouxa - 0.1], ['nebraska', 620, 935, 450, -0.04, 0], ['americaw', 850, 925, 440, 0.06, T.omada2],
  ['newartic', 175, 1400, 460, 0.06, T.tair], ['emin', 405, 1410, 450, -0.05, 0], ['antartida', 630, 1400, 460, 0.04, T.tair + 0.32], ['luciane', 840, 1405, 430, -0.06, 0],
];
const ROW = { urbanw: 180, newartic: 410, antartida: 640, americaw: 875 }; // σειρά ομάδας στο τέλος της σκηνής
function sD1(ctx, lt) {
  const t = CUT.D1 + lt; bgFlat(ctx, C.pale, '#C9D8F2');
  FAN.forEach(([n, x, y, hh, rot, pick], i) => {
    const kin = inS(t, CUT.D1 + 0.02 + i * 0.05, { f: 3 }); if (kin < 0.01) return;
    let X = x, Y = y, R = rot, S = hh * kin;
    if (!pick && t > 13.1) { const F = fall(t, 13.1 + i * 0.03, y, 3000, { g: 6000 }); Y = F.y; R = rot + (t - 13.1) * (i % 2 ? 2 : -2); }
    if (pick && t > 13.2) { const m = springTo(t, 13.2, 0, 1, { f: 2.8, z: 0.6 }); X = lerp(x, ROW[n], m); Y = lerp(y, 1350, m); R = lerp(rot, 0, m); S = lerp(hh, 600, m); }
    const bump = pick ? 1 + 0.08 * wobble(t, pick, 1, 4, 0.3) * (t > pick ? 1 : 0) : 1;
    photoCut(ctx, ph(n), X, Y, S * bump, { rot: R });
    if (pick && t > pick) pop(ctx, t, pick, ...photoPt(ph(n), X, Y, S, 0.8, 0.2, { rot: R }), () => { cut(ctx, circlePts(0, 0, 34), BRAND, { seed: 720 + i, amp: 1.5, edgeW: 5 }); L.check(ctx, 0, 2, 1, '#FBFAF6'); });
  });
  // χέρι του Στράτου: δείχνει ένα-ένα τα royal (άκρη δαχτύλου στο στήθος)
  const TG = FAN.filter(f => f[5]).sort((a, b) => a[5] - b[5]).map(([n, x, y, hh, rot, pick]) => [pick - 0.18, photoPt(ph(n), x, y, hh, 0.5, 0.45, { rot })]);
  if (t > T.dialexe && t < 13.2) { const p = springKeys([[T.dialexe, [700, 2100]], ...TG], t, { f: 3.2, z: 0.6 }), out = t > 13.0 ? easeIn(prog(t, 13.0, 13.2)) * 900 : 0; reach(ctx, p[0], p[1] + out, 0.3, 1, { hand: 'point', seed: 730 }); }
  captionSeq(ctx, lt, [[0, 'Διάλεξε τα ρούχα'], [T.tair - 0.1 - CUT.D1, 'που ταιριάζουν στην ομάδα σου,']]);
}

// ---------- D2 · logo (13,52 – 17,45): αριστερά ΕΚΤΥΠΩΣΗ (film + πρέσα) · δεξιά ΚΕΝΤΗΜΑ (τελάρο + βελόνα) ----------
const PR = { n: 'urbanw', cx: 270, cy: 900, hh: 2000 }, EM = { n: 'newartic', cx: 810, cy: 900, hh: 2000 };
function panelPhoto(ctx, Q) { // cut-out ώστε το στήθος (u, v) να πέφτει στο κέντρο του πάνελ → [x, y] για photoCut
  const M = TEAM[Q.n], Ph = ph(Q.n), s = Q.hh / Ph.h; return [Q.cx - (M.u - 0.5) * Ph.w * s, Q.cy + (1 - M.v) * Ph.h * s];
}
function sD2(ctx, lt) {
  const t = CUT.D2 + lt;
  // αριστερό πάνελ: στάμπα DTF
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 540, H); ctx.clip(); bgFlat(ctx, C.sky, '#A5C0F2', 740);
  { const [x, y] = panelPhoto(ctx, PR), Lg = teamLogo('urbanw', 'print'), Ph = ph(PR.n), s = PR.hh / Ph.h, d = TEAM.urbanw.d * s;
    const peel = prog(t, 15.85, T.ektyp + 0.1), printed = t > 15.9;
    photoCut(ctx, Ph, x, y, PR.hh, { draw: printed ? (c => drawLogo(c, Lg)) : null });
    const fin = springTo(t, T.anal - 0.1, -700, 0, { f: 2.2, z: 0.6 }); // film πέφτει από πάνω
    if (t > T.anal - 0.1 && peel < 1) { // film DTF: διάφανο φύλλο με το logo · ξεκολλάει από τη γωνία
      ctx.save(); ctx.translate(PR.cx + peel * 260, PR.cy + fin - peel * 380); ctx.rotate(-peel * 0.6); ctx.globalAlpha = 1 - peel * 0.4;
      const fp = rrPts(-d * 0.75, -d * 0.75, d * 1.5, d * 1.5, 10); cut(ctx, fp, 'rgba(235,242,255,0.35)', { seed: 750, amp: 1, edge: false, shadow: false });
      ctx.save(); L.path(ctx, fp); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-d * 0.7, -d * 0.7); ctx.lineTo(-d * 0.35, -d * 0.7); ctx.lineTo(-d * 0.7, -d * 0.35); ctx.fill(); ctx.restore(); // γυαλάδα film
      if (!printed) kostasLogo(ctx, 0, 0, d, {});
      ctx.restore();
    }
    const pd = t < T.prosth - 0.05 ? 0 : t < 15.45 ? easeOut(prog(t, T.prosth - 0.05, T.prosth + 0.2)) : 1 - easeIn(prog(t, 15.45, 15.75)); // πρέσα: κατεβαίνει → πιέζει → ανεβαίνει
    if (pd > 0.001) {
      const py = lerp(-200, PR.cy - d * 0.85, pd), sh = t > T.prosth + 0.2 && t < 15.45 ? Math.sin(t * 90) * 2 : 0;
      cut(ctx, rrPts(PR.cx - 12 + sh, py - 700, 24, 520, 6), '#8A93A1', { seed: 752, amp: 0.8, edgeW: 4 });
      cut(ctx, rrPts(PR.cx - d * 0.95 + sh, py - 180, d * 1.9, 180, 16), '#B7BFCB', { seed: 753, amp: 1.2, edgeW: 6, scribble: '#A7B0BE' });
      cut(ctx, rrPts(PR.cx - d * 0.95 + sh, py - 40, d * 1.9, 40, 8), '#5B6472', { seed: 754, amp: 1, edgeW: 4 });
      if (t > T.prosth + 0.2 && t < 15.6) particles(ctx, t, { t0: T.prosth + 0.2, t1: 15.45, rate: 16, life: 0.9, seed: 755, g: -300, drag: 1.5, at: (te, r) => [PR.cx + (r() - 0.5) * d * 2, py - 20], vel: r => [(r() - 0.5) * 80, -120 - r() * 60],
        draw: (c, p) => { c.save(); c.globalAlpha = 0.6 * (1 - p.k); c.fillStyle = '#FBFAF6'; c.beginPath(); c.arc(p.x, p.y, 16 + p.k * 30, 0, 7); c.fill(); c.restore(); } });
    }
    stamp(ctx, t, T.ektyp, 270, 560, 'ΕΚΤΥΠΩΣΗ', -0.06, BRAND, 60);
  }
  ctx.restore();
  // δεξί πάνελ: κέντημα
  ctx.save(); ctx.beginPath(); ctx.rect(540, 0, 540, H); ctx.clip(); bgFlat(ctx, C.pale, '#C9D8F2', 760);
  { const [x, y] = panelPhoto(ctx, EM), Lg = teamLogo('newartic', 'emb'), Ph = ph(EM.n), s = EM.hh / Ph.h, d = TEAM.newartic.d * s;
    const st = prog(t, T.anal + 0.25, T.kent - 0.15), S0 = Lg.S, hoop = inS(t, T.anal - 0.05) * (t > T.kent - 0.05 ? 1 - easeIn(prog(t, T.kent - 0.05, T.kent + 0.2)) : 1);
    photoCut(ctx, Ph, x, y, EM.hh, { draw: st > 0 ? (c => drawLogo(c, Lg, { clip: (cc, G) => { cc.beginPath(); cc.rect(G.x, G.y, G.S, G.S * st); cc.clip(); } })) : null });
    if (hoop > 0.01) { // τελάρο κεντήματος (ξύλινοι δακτύλιοι) + κεφαλή με βελόνα
      ctx.save(); ctx.translate(EM.cx, EM.cy); ctx.scale(hoop, hoop);
      ctx.strokeStyle = '#6B4A2E'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, d * 0.78, 0, 7); ctx.stroke(); ctx.strokeStyle = '#C8955B'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, 0, d * 0.78, 0, 7); ctx.stroke();
      cut(ctx, rrPts(d * 0.72, -16, 60, 32, 8), '#8A93A1', { seed: 761, amp: 0.8, edgeW: 4 });
      ctx.restore();
      if (st > 0 && st < 1) {
        const ny = EM.cy - d * 0.6 + st * d * 1.2 - d * 0.02, nx = EM.cx + d * 0.55 * (2 * Math.abs(((t * 5) % 1) - 0.5) * 2 - 1) * 0.9, bob = Math.abs(Math.sin(t * 34)) * 26;
        cut(ctx, rrPts(nx - 50, ny - 520, 100, 380, 14), '#E8ECF3', { seed: 762, amp: 1, edgeW: 5, scribble: '#D5DBE6' });
        cut(ctx, rrPts(nx - 10, ny - 150 + bob - 30, 20, 60, 4), '#8A93A1', { seed: 763, amp: 0.6, edgeW: 3 });
        ctx.strokeStyle = '#C9CDD8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(nx, ny - 90 + bob - 30); ctx.lineTo(nx, ny - 20 + bob - 30); ctx.stroke();
        ctx.strokeStyle = '#F5E6C8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nx + 3, ny - 520); ctx.lineTo(nx + 3, ny - 40 + bob - 30); ctx.stroke(); // κλωστή
      }
    }
    stamp(ctx, t, T.kent, 810, 560, 'ΚΕΝΤΗΜΑ', 0.06, BRAND, 60);
  }
  ctx.restore();
  cut(ctx, [[532, -20], [548, -20], [546, 400], [552, 900], [545, 1400], [549, 1940], [531, 1940], [535, 1300], [529, 800], [534, 300]], C.paper, { seed: 770, amp: 2, edgeW: 3 }); // σκισμένη λωρίδα στη μέση
  captionSeq(ctx, lt, [[0, 'και εμείς αναλαμβάνουμε'], [T.prosth - 0.1 - CUT.D2, 'να προσθέσουμε το logo σου,'], [15.93 - CUT.D2, 'με εκτύπωση ή κέντημα.']]);
}

// ---------- E · η ομάδα (17,45 – τέλος): «ζεστή» (θερμόμετρο, το χιόνι λιώνει) · «επαγγελματική» ✨ · CTA · επιστροφή στο frame 0 ----------
function thermo(ctx, x, y, k, s = 1) { // χάρτινο θερμόμετρο (οριζόντιο) · (x, y) = κέντρο βολβού, ο σωλήνας προς τα δεξιά · k 0..1 (μπλε → κόκκινο)
  const col = mixHex('#3B6FE0', '#D7262E', k);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.PI / 2);
  cut(ctx, rrPts(-28, -380, 56, 400, 28), '#FBFAF6', { seed: 780, amp: 1.5, edgeW: 6 });
  cut(ctx, circlePts(0, 0, 50), col, { seed: 781, amp: 1.5, edgeW: 7 });
  ctx.fillStyle = col; ctx.fillRect(-11, -40 - k * 290, 22, 40 + k * 290);
  ctx.strokeStyle = C.navy; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { const yy = -90 - i * 42; ctx.beginPath(); ctx.moveTo(18, yy); ctx.lineTo(i % 2 ? 26 : 34, yy); ctx.stroke(); }
  ctx.restore();
}
function sE(ctx, lt) {
  const t = CUT.E + lt, warm = clamp((t - T.zesti) / 0.5) * (1 - clamp((t - CUT.OUT) / 0.5));
  let k = WIDE; const ZO = [540, 1010, 0.8, 540, 880];
  if (t >= CUT.CTA) k = snap(t, CUT.CTA, WIDE, ZO, 0.3); if (t >= CUT.OUT) k = snap(t, CUT.OUT, ZO, HOOKCAM(t - CUT.END), 0.35); // → κάδρο του hook (seamless)
  winter(ctx, t, { warm });
  ctx.save(); camApply(ctx, k); team(ctx, t, { breath: true, shine: t < CUT.OUT ? T.epag2 : 0, logos: false }); ctx.restore(); // ✨ σβήνουν πριν το loop
  snow(ctx, t, { stop: T.zesti, again: CUT.OUT - 0.5 });
  if (t > T.zesti - 0.35 && t < CUT.CTA + 0.2) { // θερμόμετρο: ανεβαίνει στο «ζεστή»
    const kin = inS(t, T.zesti - 0.35) * (t > CUT.CTA - 0.1 ? 1 - easeIn(prog(t, CUT.CTA - 0.1, CUT.CTA + 0.2)) : 1);
    thermo(ctx, 660, 575, springTo(t, T.zesti, 0.05, 0.92, { f: 1.6, z: 0.7 }), 0.8 * kin);
  }
  if (t >= CUT.CTA) {
    const kb = t > CUT.OUT ? 1 - easeIn(prog(t, CUT.OUT, CUT.OUT + 0.25)) : 1;
    if (kb > 0.01) { ctx.save(); ctx.translate(540, 1330); ctx.scale(kb, kb); ctx.translate(-540, -1330); ctaButton(ctx, t, T.steile + 0.1, 540, 1330, 'Πάρε προσφορά');
      if (t > T.steile + 0.4) txt(ctx, 'strategixstudios.com', 540, 1432, { font: '40px Brand', color: C.navy }); ctx.restore(); }
  }
  captionSeq(ctx, lt, [[0, 'Για να είναι η ομάδα σου'], [18.62, 'όχι μόνο ζεστή,'], [T.alla - 0.08, 'αλλά και επαγγελματική.'],
    [T.steile - 0.08, 'Στείλε μας μήνυμα,'], [T.kai - 0.08, 'και πάμε να βρούμε μαζί'], [T.katal - 0.1, 'την κατάλληλη ένδυση'], [T.gia2 - 0.08, 'για την επιχείρησή σου.'], [CUT.OUT + 0.1, HOOKCAP]].map(([a, s]) => [a && a - CUT.E, s]));
}

require('./render.js')({
  name: EP,
  SCENES: [[sA, CUT.B], [sB, CUT.C - CUT.B], [sC, CUT.D1 - CUT.C], [sD1, CUT.D2 - CUT.D1], [sD2, CUT.E - CUT.D2], [sE, CUT.END - CUT.E]],
  WIPES: [1, 2, 3, 4, 5],
  LOOP: 'cut',                                    // seamless: το τέλος (ομάδα στο χιόνι + caption του hook) = frame 0 · το hook συνεχίζει από εκεί (CUT.END + lt)
  VO_FILE: 'vo/ad_xeimonas_vo.mp3', VO_AT: 0.2,
  MUSIC_FILE: 'music/ad_xeimonas.mp3',
  SFX: [
    [T.xeim - 0.05, 'air', { dur: 0.6, gain: 0.6, note: 'ριπή χιονιού' }],
    [T.fout, 'pop', { seed: 1, note: 'φούτερ με κουκούλα' }], [T.fout + 0.03, 'stamp', { gain: 0.5, note: 'ΦΟΥΤΕΡ' }], [T.me, 'blip', { gain: 0.5, note: 'ετικέτα' }],
    [T.xwris - 0.05, 'pop', { seed: 2, note: 'χωρίς κουκούλα' }],
    ...CAR.slice(1).map(([t0], i) => [t0 - 0.02, 'swoosh', { seed: i + 1, gain: 0.55, note: i ? '' : 'carousel: fleece → softshell → μπουφάν' }]),
    ...CAR.slice(1).map(([t0], i) => [t0 + 0.22, 'stamp', { seed: i + 2, gain: 0.5, note: PANELS[i + 1][3] }]),
    [7.9, 'slide', { dur: 0.4, gain: 0.6, note: 'εξώφυλλο γυρίζει' }], [CUTT[0] - 0.15, 'zoom', { seed: 4, gain: 0.45, note: 'snap στη σελίδα' }],
    ...Array.from({ length: 7 }, (_, i) => [CUTT[0] + 0.05 + i * 0.16, 'click', { seed: i + 1, gain: 0.45, note: i ? '' : 'ψαλίδι' }]),
    [CUTT[1] + 0.05, 'tear', { dur: 0.25, gain: 0.5, note: 'ξεκολλάει από τη σελίδα' }], [T.epag + 0.05, 'shimmer', { gain: 0.45 }], [T.endysi + 0.05, 'whoosh', { seed: 5, gain: 0.5, note: 'προς την κάμερα' }],
    [CUT.D1 + 0.05, 'pop', { seed: 5, gain: 0.4, note: 'ρούχα στο τραπέζι' }],
    ...FAN.filter(f => f[5]).map((f, i) => [f[5], 'ding', { seed: i + 1, gain: 0.45, note: '✓ ' + f[0] }]), [13.1, 'swoosh', { seed: 6, gain: 0.5, note: 'τα υπόλοιπα πέφτουν' }],
    [T.anal, 'slide', { dur: 0.3, seed: 2, gain: 0.5, note: 'film DTF' }], [T.prosth + 0.15, 'thud', { seed: 2, gain: 0.7, note: 'πρέσα' }], [T.prosth + 0.2, 'air', { dur: 0.9, seed: 2, gain: 0.35, note: 'ατμός' }],
    [15.45, 'lid', { gain: 0.5, note: 'πρέσα ανοίγει' }], [15.85, 'tear', { dur: 0.3, seed: 2, gain: 0.5, note: 'film ξεκολλάει' }], [T.ektyp, 'stamp', { seed: 5, gain: 0.55, note: 'ΕΚΤΥΠΩΣΗ' }],
    [T.anal + 0.25, 'ticks', { count: 40, gap: 0.06, gain: 0.4, note: 'βελόνα κεντήματος' }], [T.kent, 'stamp', { seed: 6, gain: 0.55, note: 'ΚΕΝΤΗΜΑ' }],
    [T.zesti - 0.3, 'pop', { seed: 7, gain: 0.5, note: 'θερμόμετρο' }], [T.zesti, 'ticks', { count: 8, gap: 0.05, rise: 0.5, seed: 2, gain: 0.4, note: 'ανεβαίνει' }],
    [T.epag2 + 0.05, 'shimmer', { seed: 2, gain: 0.5, note: 'logos ✨' }], [CUT.CTA, 'zoom', { seed: 3, gain: 0.4 }], [T.steile + 0.1, 'pop', { seed: 9, note: 'Πάρε προσφορά' }],
    [CUT.OUT, 'zoom', { seed: 4, gain: 0.4, note: 'zoom στο πρώτο ρούχο (= frame 0)' }],
  ],
});
