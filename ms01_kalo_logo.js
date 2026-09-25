// ORGANIC — «Μάθε με τον Στράτο» · Τι κάνει ένα λογότυπο καλό; · host: Στράτος στην υποδοχή (reception) · VO ElevenLabs «Stratos» + SFX · 25,3s · seamless loop
// Hook: wide υποδοχή → απότομο zoom στον Στράτο. 5 στοιχεία (Απλό · Αξέχαστο · Διαχρονικό · Ευέλικτο · Ταιριαστό) ως ✓ chips αριστερά, καρουζέλ με
// διαχρονικά λογότυπα τρίτων (σιλουέτες, χαμηλή αντίθεση, μόνο ως παραδείγματα) κάτω. CTA like + σχόλια. Τέλος: η κάμερα ανοίγει σε wide = frame 0.
const L = require('./lib.js');
const { C, W, cut, rrPts, rectPts, circlePts, heartPts, txt, pop, captionSeq, brandMark, lerp, prog, easeOut, easeIn, easeInOut, lipsync, blinkNow } = L;
const { stratos } = require('./stratos.js');
const { BRAND, reception, RECEPTION, checkChip, seriesTag, sparkle, stamp, ctaButton, tshirt } = require('./props.js');

// VO = vo/ms01_vo.mp3 @ 0,2s (eleven_v3, «Stratos», take 1/2 · παύσεις → 0,25s, 0,33s πριν το «παιδότοπου»). Χρονισμοί φράσεων (video):
// 0,30 Έχεις σκεφτεί ποτέ... | 1,80 τι κάνει ένα λογότυπο καλό; | 3,70 Πέντε πράγματα. | 4,60 Απλό. | 5,17 Να το ζωγραφίζει κι ένα παιδί.
// 6,60 Αξέχαστο. | 7,63 Μία ματιά... | 8,63 και το θυμάσαι. | 9,63 Διαχρονικό. | 10,67 Να μην παλιώνει με τη μόδα. | 12,13 Ευέλικτο.
// 13,10 Σε κάρτα, (13,6) σε μπλούζα, (14,3) σε ταμπέλα... | 15,37 παντού να δουλεύει. | 16,47 Και ταιριαστό. | 17,40 Ο δικηγόρος
// 18,37 δεν θέλει λογότυπο... | 19,93 παιδότοπου. | 20,87 Κάνε ένα λάικ, | 21,77 και γράψε μου στα σχόλια: | 23,10 ποιο θεωρείς εσύ το καλύτερο λογότυπο; (–25,07)
const T = { ti: 1.8, pente: 3.7, aplo: 4.6, axe: 6.6, diax: 9.63, eyel: 12.13, karta: 13.1, mplouza: 13.6, tabela: 14.3, pantou: 15.37, tair: 16.47,
  dik: 17.4, paid: 19.93, like: 20.87, grapse: 21.77, poio: 23.1, end: 25.07 };
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const TAG = 'Μάθε με τον Στράτο', HOOK = 'Έχεις σκεφτεί τι κάνει ένα λογότυπο καλό;';
const CLEAR = 20.6, OUT = 24.45, BACK = 25.15, END = 25.25; // chips/καρουζέλ φεύγουν · zoom out → wide = frame 0 (loop)

// ---------- κάμερα: wide → απότομο zoom (hook) → λίστα (Στράτος δεξιά, chips αριστερά) → wide ----------
const { wide, close } = RECEPTION.cams, CLOSE2 = [close[0], close[1], close[2] + 0.1], LIST = [390, 900, 2.05], LIST2 = [390, 904, 2.15];
const mix = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));
function cam(t) {
  if (t < 0.15) return wide;
  if (t < 0.4) return mix(wide, close, easeOut(prog(t, 0.15, 0.4)));
  if (t < 3.6) return mix(close, CLOSE2, prog(t, 0.4, 3.6));
  if (t < 4.15) return mix(CLOSE2, LIST, easeInOut(prog(t, 3.6, 4.15)));
  if (t < OUT) return mix(LIST, LIST2, prog(t, 4.15, OUT));
  return mix(LIST2, wide, easeInOut(prog(t, OUT, BACK)));
}
// ---------- Στράτος: πόζες ανά φράση (χέρι L = προς τα chips) ----------
const REST = { aL: 0.12, aR: 0.12, eL: 0, eR: 0, brows: 0.3, look: 0 };
const SHRUG = { aL: 0.5, aR: 0.5, eL: -1.1, eR: -1.1, hL: 'open', hR: 'open', iL: 'shrug', iR: 'shrug' };
const POSES = [
  [0, {}], [0.3, { brows: 0.7 }],
  [T.ti, { ...SHRUG, brows: 1.0 }],
  [T.pente - 0.1, { aL: 2.2, eL: -0.6, hL: 'open', eyes: 'happy', brows: 0.6 }],     // «πέντε»: ανοιχτή παλάμη
  [T.aplo - 0.1, { aL: 1.6, eL: -0.35, hL: 'point', look: -10 }],                   // δείχνει τα chips
  [T.axe - 0.1, { aL: 2.2, eL: -0.6, hL: 'ok', eyes: 'happy', brows: 0.6 }],
  [T.diax - 0.1, { aL: 1.4, eL: -1.6, hL: 'thumb', brows: 0.5 }],
  [T.eyel - 0.1, { aL: 0.9, eL: -0.9, hL: 'open', look: -8, brows: 0.5 }],           // παρουσιάζει κάρτα · μπλούζα · ταμπέλα
  [T.tair - 0.1, { ...SHRUG, brows: 0.8 }],
  [T.dik - 0.05, { aL: 0.8, hL: 'point', brows: -0.3, look: -10 }],
  [T.paid - 0.05, { ...SHRUG, eyes: 'happy', brows: 1.0 }],
  [T.like - 0.1, { aL: 1.4, eL: -1.6, hL: 'thumb', eyes: 'happy', brows: 0.6 }],
  [T.grapse - 0.05, { aL: 0.35, eL: -0.2, hL: 'point', look: -6, brows: 0.5 }],      // δείχνει κάτω (σχόλια)
  [T.poio - 0.05, { ...SHRUG, brows: 1.0 }],
  [OUT, {}],                                                                          // ηρεμία = frame 0
];
function poseAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= POSES[i + 1][0]) i++;
  const [t1, b] = POSES[i], a = i ? POSES[i - 1][1] : b, p = easeInOut(prog(t, t1, t1 + 0.28)), q = p < 0.5 ? a : b, m = k => lerp(a[k] ?? REST[k], b[k] ?? REST[k], p);
  return { arms: [m('aL'), m('aR')], elbowL: m('eL'), elbowR: m('eR'), handL: q.hL || 'relaxed', handR: q.hR || 'relaxed', hintL: q.iL, hintR: q.iR, eyes: q.eyes || 'dot', brows: m('brows'), look: m('look') };
}
const host = t => ctx => stratos(ctx, ...RECEPTION.desk, { seed: 1000, legs: false, mouth: lipsync(VO, 'smile'), blink: blinkNow(), ...poseAt(t) });
const outK = (ctx, k, x, y) => { ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); }; // σμίκρυνση για έξοδο

// ---------- καρουζέλ: διαχρονικά λογότυπα τρίτων (σιλουέτες, χαμηλή αντίθεση) σε χάρτινη λωρίδα ----------
const LOGO_C = '#7F98D3', BAND_Y = 1300, BAND_H = 144, GAP = 216;
const bez = (p0, c, p1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]; });
const fillPts = (x, pts) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill(); };
const LOGOS = [
  x => fillPts(x, [...bez([-50, -2], [-64, 36], [-22, 32]), ...bez([-22, 32], [12, 28], [60, -30]), ...bez([60, -30], [2, 8], [-28, 14]), ...bez([-28, 14], [-44, 16], [-50, -2])]), // swoosh
  x => { x.beginPath(); for (let i = 0; i <= 60; i++) { const a = Math.PI * (1.08 + 0.84 * i / 60), r = 46 + 3.5 * Math.abs(Math.sin(i / 60 * Math.PI * 7)); x.lineTo(Math.cos(a) * r, 12 + Math.sin(a) * r); } // κοχύλι
    x.lineTo(16, 30); x.lineTo(16, 44); x.lineTo(-16, 44); x.lineTo(-16, 30); x.closePath(); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = 3.5; for (let k = 1; k < 7; k++) { const a = Math.PI * (1.08 + 0.84 * k / 7); x.beginPath(); x.moveTo(0, 36); x.lineTo(Math.cos(a) * 40, 12 + Math.sin(a) * 40); x.stroke(); } },
  x => { x.beginPath(); x.moveTo(0, -26); x.bezierCurveTo(14, -36, 42, -34, 42, -6); x.bezierCurveTo(42, 20, 26, 44, 12, 44); x.bezierCurveTo(6, 44, 4, 40, 0, 40); // μήλο
    x.bezierCurveTo(-4, 40, -6, 44, -12, 44); x.bezierCurveTo(-26, 44, -42, 20, -42, -6); x.bezierCurveTo(-42, -34, -14, -36, 0, -26); x.fill();
    x.beginPath(); x.ellipse(8, -44, 6, 13, 0.7, 0, 7); x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(47, -4, 13, 0, 7); x.fill(); },
  x => { x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 44, 0, 7); x.stroke(); // αστέρι σε κύκλο
    for (const a of [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6]) { const c = Math.cos(a), s = Math.sin(a); fillPts(x, [[c * 42, s * 42], [-s * 8, c * 8], [s * 8, -c * 8]]); } },
  x => { x.lineWidth = 13; x.beginPath(); x.moveTo(-46, 42); x.quadraticCurveTo(-24, -84, -1, 28); x.moveTo(1, 28); x.quadraticCurveTo(24, -84, 46, 42); x.stroke(); }, // καμάρες
].map(fn => { const c = L.createCanvas(140, 140), x = c.getContext('2d'); x.translate(70, 70); x.fillStyle = x.strokeStyle = LOGO_C; fn(x); return c; });
function carousel(ctx, t) {
  const k = easeOut(prog(t, T.pente - 0.1, T.pente + 0.35)) * (1 - easeIn(prog(t, CLEAR - 0.05, CLEAR + 0.35))); if (k <= 0) return;
  ctx.save(); ctx.translate(0, (1 - k) * 260); ctx.translate(W / 2, BAND_Y + BAND_H / 2); ctx.rotate(-0.015); ctx.translate(-W / 2, -BAND_Y - BAND_H / 2);
  cut(ctx, rectPts(-40, BAND_Y, W + 80, BAND_H), '#EDF1FA', { seed: 9300, amp: 5, step: 18, scribble: '#E1E7F6' });
  ctx.beginPath(); ctx.rect(-40, BAND_Y + 8, W + 80, BAND_H - 16); ctx.clip(); ctx.globalAlpha = 0.85;
  const off = (t * 70) % (GAP * LOGOS.length);
  for (let i = 0; i <= 10; i++) { const x = 108 + i * GAP - off; if (x > -90 && x < W + 90) ctx.drawImage(LOGOS[i % LOGOS.length], x - 60, BAND_Y + BAND_H / 2 - 60, 120, 120); }
  ctx.restore();
}
// ---------- λίστα: ✓ chips αριστερά (φεύγουν στο CTA) ----------
const ITEMS = [['Απλό', T.aplo], ['Αξέχαστο', T.axe], ['Διαχρονικό', T.diax], ['Ευέλικτο', T.eyel], ['Ταιριαστό', T.tair]];
function chips(ctx, t) {
  ITEMS.forEach(([label, st], i) => {
    if (t < st) return; const fs = 50; ctx.font = `bold ${fs}px Round`; const w = ctx.measureText(label).width + fs * 2.6;
    checkChip(ctx, t, st, 80 + w / 2 - 760 * easeIn(prog(t, CLEAR + i * 0.05, CLEAR + 0.35 + i * 0.05)), 590 + i * 112, label, { fs, seed: 9400 + i * 3 });
  });
}
// «Ευέλικτο»: κάρτα · μπλούζα · ταμπέλα με το «S» σκάνε πάνω στον πάγκο
function versatile(ctx, t) {
  const k = 1 - easeIn(prog(t, T.tair - 0.25, T.tair + 0.05)); if (t < T.karta || k <= 0) return;
  ctx.save(); outK(ctx, k, 600, 1190);
  pop(ctx, t, T.karta, 410, 1195, () => { cut(ctx, rrPts(-86, -52, 172, 104, 8), C.paper, { seed: 9501, amp: 1.5, edgeW: 6 }); brandMark(ctx, -44, 0, 24, C.navy);
    for (const [y, w] of [[-12, 70], [6, 54], [22, 62]]) cut(ctx, rectPts(-6, y, w, 7), C.sky, { seed: 9502 + y, amp: 0.5, edge: false, shadow: false }); }, -0.12);
  pop(ctx, t, T.mplouza, 600, 1180, () => tshirt(ctx, 0, 0, 0.21, 0, { seed: 9510, logoFn: c => brandMark(c, 0, 0, 62, C.navy) }), 0.06);
  pop(ctx, t, T.tabela, 790, 1185, () => {
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-50, -44); ctx.lineTo(-34, -96); ctx.moveTo(50, -44); ctx.lineTo(34, -96); ctx.stroke(); ctx.restore();
    cut(ctx, rrPts(-84, -48, 168, 100, 12), BRAND, { seed: 9520, amp: 1.5, edgeW: 7 }); brandMark(ctx, 0, 2, 30, '#fff'); }, 0.1);
  ctx.restore();
}
// «Ο δικηγόρος δεν θέλει λογότυπο παιδότοπου»: «ΝΟΜΙΚΟ ΓΡΑΦΕΙΟ» σε στυλ παιδότοπου → ΟΧΙ
const KIDS = [BRAND, '#F29C9C', '#F4D98A', C.sky, '#F3B86A', '#6F93D8'];
function bubbly(ctx, s, y, fs, sh) {
  ctx.font = `bold ${fs}px Round`; const ch = [...s], ws = ch.map(c => ctx.measureText(c).width + 5); let x = -ws.reduce((a, b) => a + b, 0) / 2;
  ch.forEach((c, i) => { txt(ctx, c, x + ws[i] / 2, y + (i % 2 ? 6 : -4), { font: `bold ${fs}px Round`, color: KIDS[(i + sh) % KIDS.length], rot: i % 2 ? 0.14 : -0.12, edge: 8, edgeC: C.navy }); x += ws[i]; });
}
function lawyer(ctx, t) {
  const k = 1 - easeIn(prog(t, T.like - 0.3, T.like)); if (t < T.dik || k <= 0) return;
  ctx.save(); outK(ctx, k, 560, 1200);
  pop(ctx, t, T.dik, 560, 1200, () => {
    cut(ctx, rrPts(-210, -112, 420, 224, 20), C.paper, { seed: 9600, amp: 2, edgeW: 8, scribble: '#EDE7D8' });
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(172, -86); ctx.quadraticCurveTo(160, -40, 176, -8); ctx.stroke(); ctx.restore();
    cut(ctx, circlePts(172, -112, 26, 30, 20), '#F29C9C', { seed: 9601, amp: 1, edgeW: 5 });
    bubbly(ctx, 'ΝΟΜΙΚΟ', -38, 64, 0); bubbly(ctx, 'ΓΡΑΦΕΙΟ', 50, 64, 3);
  }, -0.05);
  stamp(ctx, t, T.paid, 610, 1210, 'ΟΧΙ', -0.2, C.navy, 80);
  ctx.restore();
}
// CTA: ♥ like · «Γράψε στα σχόλια»
function cta(ctx, t) {
  const k = 1 - easeIn(prog(t, OUT, OUT + 0.3)); if (t < T.like || k <= 0) return;
  ctx.save(); outK(ctx, k, 330, 780);
  pop(ctx, t, T.like, 330, 780, () => cut(ctx, heartPts(0, 0, 7.5), BRAND, { seed: 9700, amp: 2, edgeW: 9 }), -0.12);
  sparkle(ctx, 460, 670, 0.7, t, T.like + 0.2, 9701); sparkle(ctx, 190, 880, 0.5, t, T.like + 0.3, 9702);
  ctx.restore();
  ctx.save(); outK(ctx, k, 540, 1230); ctaButton(ctx, t, T.grapse, 540, 1230, 'Γράψε στα σχόλια'); ctx.restore();
}

// ---------- ένας κόσμος σε global χρόνο · 3 σκηνές (hook · λίστα · CTA → wide) χωρίς wipes ----------
const CAPS = [[-1, HOOK], [T.pente - 0.08, '5 πράγματα.'], [T.aplo - 0.05, 'Απλό: να το ζωγραφίζει κι ένα παιδί.'],
  [T.axe - 0.05, 'Αξέχαστο: μία ματιά και το θυμάσαι.'], [T.diax - 0.05, 'Διαχρονικό: να μην παλιώνει με τη μόδα.'],
  [T.eyel - 0.05, 'Ευέλικτο: σε κάρτα, σε μπλούζα, σε ταμπέλα...'], [T.pantou - 0.05, '...παντού να δουλεύει.'], [T.tair - 0.05, 'Και ταιριαστό.'],
  [T.dik - 0.05, 'Ο δικηγόρος δεν θέλει λογότυπο παιδότοπου.'], [T.like - 0.05, 'Κάνε ένα like...'], [T.grapse - 0.05, '...και γράψε στα σχόλια:'],
  [T.poio - 0.05, 'Ποιο είναι για σένα το καλύτερο λογότυπο;'], [T.end - 0.07, HOOK]];
function world(ctx, t) {
  reception(ctx, t, { cam: cam(t), behind: host(t) });
  carousel(ctx, t); chips(ctx, t); versatile(ctx, t); lawyer(ctx, t); cta(ctx, t);
  captionSeq(ctx, t, CAPS);
  if (t < T.pente - 0.08) seriesTag(ctx, t + 1, TAG);                              // ήδη στο frame 0 · η ετικέτα σειράς μόνο με το caption του hook
  else if (t >= T.end - 0.07) seriesTag(ctx, (t - T.end + 0.07) * 2.5, TAG);       // ξανά στο τέλος (loop)
}
const scene = t0 => (ctx, lt) => world(ctx, t0 + lt);

require('./render.js')({
  name: 'ms01_kalo_logo',
  SCENES: [[scene(0), 3.6], [scene(3.6), CLEAR - 3.6], [scene(CLEAR), END - CLEAR]],
  LOOP: 'cut',                                    // seamless: η κάμερα ανοίγει ξανά σε wide με το caption του hook = frame 0
  VO_FILE: 'vo/ms01_vo.mp3', VO_AT: 0.2,
  SFX: [
    [0.12, 'zoom', { note: 'hook: απότομο zoom στον Στράτο' }],
    [3.6, 'swoosh', { note: 'κάμερα → λίστα · καρουζέλ μπαίνει' }],
    ...ITEMS.flatMap(([l, st], i) => [[st, 'pop', { seed: i, note: `✓ ${l}` }], [st + 0.12, 'ding', { gain: 0.45, seed: i }]]),
    [T.karta, 'pop', { seed: 11, gain: 0.8, note: 'κάρτα' }], [T.mplouza, 'pop', { seed: 12, gain: 0.8, note: 'μπλούζα' }], [T.tabela, 'pop', { seed: 13, gain: 0.8, note: 'ταμπέλα' }],
    [T.dik, 'boing', { note: 'λογότυπο παιδότοπου' }],
    [T.paid, 'stamp', { note: 'ΟΧΙ' }],
    [CLEAR, 'swoosh', { seed: 3, note: 'chips + καρουζέλ φεύγουν' }],
    [T.like, 'pop', { seed: 21, note: '♥ like' }], [T.like + 0.2, 'shimmer', { gain: 0.7 }],
    [T.grapse, 'click', { note: 'CTA «Γράψε στα σχόλια»' }],
    [OUT, 'air', { dur: 0.7, note: 'zoom out → wide = frame 0 (loop)' }],
  ],
});
