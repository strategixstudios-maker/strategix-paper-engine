// «Πώς φτιάχνεται;» #2 — Χάραξη σε θερμός (CO2 laser + rotary) · host: Στράτος · VO ElevenLabs «Stratos» + SFX (−6 dB + ducking κάτω από το VO) · 25,0s
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, check, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { stratos, handPos } = require('./stratos.js');
const { BRAND, TH, thermos, thermosPhase, rotary, layersInset, kostasLogo, laserMachine, laserFX, smoke, honeycomb, laserHeadTop,
  giftBox, msgOut, reach, sparkle, stamp, seriesTag, ctaButton, pip, PIP, wallShelf, starsBG, bgFlat, checkChip } = require('./props.js');

// VO = vo/pf02_vo.mp3 @ 0,2s (ElevenLabs eleven_v3, φωνή «Stratos», παύσεις σφιγμένες + atempo 1.06: 27,6 → 24,4s).
// Χρονισμοί φράσεων (απόλυτοι, από silence detect):
// 0,24 Πώς μπαίνει λογότυπο σε θερμός... | 2,37 χωρίς ούτε σταγόνα μελάνι; | 4,39 Παίρνουμε ένα θερμός με ματ βαφή.
// 6,33 Το στήνουμε στο rotary, για να γυρίζει όσο χαράζει. | 9,13 Το laser δεν τυπώνει. | 10,67 Καίει τη βαφή...
// 11,74 και από κάτω βγαίνει το ανοξείδωτο. | 13,92 Δεν είναι μελάνι, ούτε αυτοκόλλητο. | 16,06 Δεν έχει τίποτα να ξεκολλήσει.
// 17,82 Ιδανικό για εταιρικά δώρα, | 19,28 για την ομάδα σου, | 20,28 ή για πελάτες. | 21,29 Στείλε μας το λογότυπό σου και την ποσότητα,
// 23,40 και φτιάχνουμε τα δικά σου. (–24,5)
// φράσεις VO (απόλυτες) → ducking των SFX που πέφτουν πάνω στη φωνή (ίδια λογική με ad_afisa v2)
const PHR = [[0.24, 2.14], [2.37, 4.07], [4.39, 6.06], [6.33, 8.78], [9.13, 10.35], [10.67, 11.38], [11.74, 13.56], [13.92, 15.82], [16.06, 17.52],
  [17.82, 19.13], [19.28, 20.1], [20.28, 21.03], [21.29, 23.16], [23.4, 24.5]];
const SFX_MIX = 0.5, SFX_DUCK = 0.45; // όλα τα SFX −6 dB · όσα πέφτουν πάνω σε φράση άλλα −7 dB (≈ −13 dB κάτω από το VO)
const duck = cues => cues.map(([t, n, o = {}]) => { const e = t + (o.dur || 0.35), on = PHR.some(([a, b]) => t < b && e > a); return [t, n, { ...o, gain: (o.gain ?? 1) * SFX_MIX * (on ? SFX_DUCK : 1), note: (o.note || '') + (on ? ' · duck' : '') }]; });
const VO = [];
const TAG = 'Πώς φτιάχνεται; #2';
const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const MID = (TH.top + TH.bot) / 2; // κέντρο συνολικού μήκους (σώμα+καπάκι) σε τοπικές μονάδες

// ---------- shared shots ----------
// κάτοψη μέσα στο laser: θερμός ξαπλωμένο στο rotary, η δέσμη σαρώνει κατά μήκος, το θερμός γυρίζει
const BX = 540, BY = 860, BS = 1.5, BCX = BX - MID * BS; // BCX = κέντρο σώματος
function burnView(ctx, t, p) {
  honeycomb(ctx);
  rotary(ctx, BCX, BY, BS, { top: true, len: TH.HB + 20, gap: 100, spin: -p * 900 });
  thermos(ctx, BCX, BY, BS, { rot: -Math.PI / 2, engrave: p, phase: thermosPhase(p), seed: 7300 });
  const lx = BCX + (TH.ly + (TH.lw / 2 - 8) * Math.sin(t * 13)) * BS, ly = BY;
  if (p < 1) { smoke(ctx, lx, ly, t, 1.4, [0.3, -1]); laserFX(ctx, lx, ly, t, 1.3, 7); }
  laserHeadTop(ctx, lx, ly, 1.2, p < 1);
}
const hookP = t => 0.3 + t * 0.07;
// workshop wide: laser + rotary, Στράτος δεξιά
const MX = 430, MY = 1126, MW = 760, MU = MW / 1000, TS = 0.85, RY = 40, AX = RY + 10 - TH.R * TS; // AX = άξονας θερμός (inside units)
const BED = [MX - MID * TS * MU, MY + (-114 + AX) * MU];
function workshop(ctx, lt, o = {}) {
  wallShelf(ctx);
  stratos(ctx, 890, 860, 0.72, { seed: 1000, blink: blinkNow(), ...o.st });
  cut(ctx, rectPts(-40, 1430, W + 80, 600), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  laserMachine(ctx, MX, MY, MW, { lid: o.lid || 0, on: o.on, head: o.head, lt,
    inside: c => { rotary(c, 0, RY, 1, { len: TH.HB, spin: o.spin || 0 }); if (o.th) thermos(c, -MID * TS, AX, TS, { rot: -Math.PI / 2, engrave: false, edgeW: 5, seed: 7300 }); } });
}
// σταγόνα μελάνι με ✗
function inkNo(ctx, lt, st, x, y) {
  pop(ctx, lt, st, x, y, () => {
    cut(ctx, circlePts(0, 0, 96), C.paper, { seed: 7400, amp: 2, edgeW: 8 });
    cut(ctx, [[0, -62], [34, -8], [40, 18], [26, 44], [0, 54], [-26, 44], [-40, 18], [-34, -8]], C.ink, { seed: 7401, amp: 1.5, edgeW: 4, shadow: false });
    const k = easeOut(prog(lt, st + 0.3, st + 0.55)); ctx.strokeStyle = BRAND; ctx.lineCap = 'round'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.arc(0, 0, 74, 0, 7); ctx.stroke();
    if (k > 0) { ctx.beginPath(); ctx.moveTo(-52, -52); ctx.lineTo(-52 + 104 * k, -52 + 104 * k); ctx.stroke(); }
  }, 0.06);
}
// «όχι X» chip: χαρτί + διαγραφή
function noChip(ctx, lt, st, x, y, label, rot) {
  ctx.font = 'bold 52px Round'; const tw = ctx.measureText(label).width, w = tw + 80;
  pop(ctx, lt, st, x, y, () => {
    cut(ctx, rrPts(-w / 2, -48, w, 96, 48), C.paper, { seed: 7410 + label.length, amp: 2, edgeW: 8 });
    txt(ctx, label, 0, 2, { font: 'bold 52px Round', color: C.navy });
    const k = easeOut(prog(lt, st + 0.35, st + 0.6)); if (k > 0) { ctx.strokeStyle = BRAND; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 18, 6); ctx.lineTo(-w / 2 + 18 + (w - 36) * k, -6); ctx.stroke(); }
  }, rot);
}

// ---------- scenes ----------
function sA(ctx, lt) { // 0–4,25 · hook: burn close-up
  burnView(ctx, lt, hookP(lt));
  inkNo(ctx, lt, 2.4, 800, 1190);
  pip(ctx, ...PIP, VO, { rest: 'smile', brows: 0.8 });
  captionSeq(ctx, lt, [[0.05, 'Πώς μπαίνει λογότυπο σε θερμός...'], [2.35, '...χωρίς ούτε σταγόνα μελάνι;']]);
  seriesTag(ctx, lt, TAG);
}
function sB(ctx, lt) { // 4,25–6,2 · Στράτος δείχνει το ματ θερμός
  wallShelf(ctx);
  cut(ctx, rectPts(-40, 1430, W + 80, 600), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  const sx = 620, sy = 980, ss = 0.95, up = easeOut(prog(lt, 0.05, 0.45)), aL = lerp(0.15, 0.5, up), eL = lerp(0, -1.4, up);
  const [hx, hy] = handPos(-1, aL, ss, sx, sy, eL);
  const g = ctx.createRadialGradient(hx, hy - 110, 20, hx, hy - 110, 300); g.addColorStop(0, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(hx - 300, hy - 420, 600, 620);
  thermos(ctx, hx + 36, hy - 30, 0.72, { engrave: false, rot: 0.05 * Math.sin(lt * 3), seed: 7300 });
  stratos(ctx, sx, sy, ss, { seed: 1000, legs: false, arms: [aL, 0.12], elbowL: eL, handL: 'grip', mouth: lipsync(VO, 'smile'), blink: blinkNow(), brows: 0.5, look: -12 });
  checkChip(ctx, lt, 0.75, 300, 1330, 'ματ βαφή', { fs: 50, rot: -0.04 });
  captionSeq(ctx, lt, [[0.12, 'Παίρνουμε ένα θερμός με ματ βαφή.']]);
}
function sC(ctx, lt) { // 6,2–9,0 · στο rotary μέσα στο laser, κλείνει το καπάκι, γυρίζει
  const raise = easeInOut(prog(lt, 0.0, 0.45)), drop = easeIn(prog(lt, 0.5, 1.0)), back = easeInOut(prog(lt, 1.1, 1.5));
  const aL = lerp(0.9, 1.25, raise) - back * 1.1, landed = drop >= 1, lid = 1 - easeInOut(prog(lt, 1.3, 1.75));
  const spin = lt > 1.9 ? (lt - 1.9) * 160 : 0;
  const bump = lt > 1.0 && lt < 1.2 ? Math.sin((lt - 1.0) * 50) * 6 * (1 - (lt - 1.0) / 0.2) : 0;
  ctx.save(); ctx.translate(0, bump);
  workshop(ctx, lt, { lid, th: landed, spin, st: { arms: [aL, 0.12], handL: landed ? 'open' : 'grip', mouth: lipsync(VO, 'smile'), brows: 0.3, look: -12 } });
  if (!landed) {
    const [hx, hy] = handPos(-1, aL, 0.72, 890, 860), pos = lp([hx, hy - 20], BED, drop);
    thermos(ctx, pos[0], pos[1], lerp(0.47, TS * MU, drop), { rot: lerp(0, -Math.PI / 2, easeInOut(prog(lt, 0.45, 1.0))), engrave: false, edgeW: 6, seed: 7300 });
  }
  ctx.restore();
  if (lt > 1.9) pop(ctx, lt, 1.9, MX, 760, () => { // ↻ = γυρίζει
    cut(ctx, circlePts(0, 0, 70), C.paper, { seed: 7420, amp: 2, edgeW: 7 });
    ctx.save(); ctx.rotate(-(lt - 1.9) * 4); ctx.strokeStyle = BRAND; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 38, 0.4, 5.6); ctx.stroke();
    ctx.fillStyle = BRAND; ctx.beginPath(); ctx.moveTo(38 * Math.cos(0.4) + 18, 38 * Math.sin(0.4) - 6); ctx.lineTo(38 * Math.cos(0.4) - 16, 38 * Math.sin(0.4) - 12); ctx.lineTo(38 * Math.cos(0.4) + 2, 38 * Math.sin(0.4) + 22); ctx.closePath(); ctx.fill(); ctx.restore();
  });
  captionSeq(ctx, lt, [[0.12, 'Το στήνουμε στο rotary, για να γυρίζει όσο χαράζει.']]);
}
function sD(ctx, lt) { // 9,0–13,7 · χάραξη + inset στρώσεων
  const p = 0.02 + 0.98 * prog(lt, 0.1, 4.3);
  burnView(ctx, lt, p);
  layersInset(ctx, lt, 1.55, 620, 1195, 1, prog(lt, 1.75, 2.75), { steelLabel: lt > 2.75 });
  if (lt > 2.75) sparkle(ctx, 620, 1290, 0.6, lt, 2.8, 7430);
  pip(ctx, ...PIP, VO, { rest: 'smile', eyes: 'happy' });
  captionSeq(ctx, lt, [[0.1, 'Το laser δεν τυπώνει.'], [1.67, 'Καίει τη βαφή...'], [2.74, '...και από κάτω βγαίνει το ανοξείδωτο.']]);
}
function sE(ctx, lt) { // 13,7–17,65 · reveal: όχι μελάνι, όχι αυτοκόλλητο → ΧΑΡΑΞΗ
  starsBG(ctx, lt);
  const g = ctx.createRadialGradient(660, 930, 60, 660, 930, 520); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, 1100);
  const sp = spring(prog(lt, 0, 0.6));
  if (sp > 0.01) thermos(ctx, 660, 1010, 1.2 * sp, { engrave: 1, phase: 0.38 * Math.sin(lt * 1.5), rot: lerp(-0.3, -0.04, easeOut(prog(lt, 0, 0.6))), seed: 7300 });
  [[560, 700, 0.9], [790, 820, 0.7], [540, 1150, 0.6], [800, 1110, 0.8]].forEach(([x, y, k], i) => sparkle(ctx, x, y, k, lt, 0.4 + i * 0.12, 7440 + i));
  noChip(ctx, lt, 0.25, 290, 760, 'μελάνι', -0.05);
  noChip(ctx, lt, 1.15, 290, 960, 'αυτοκόλλητο', 0.04);
  stamp(ctx, lt, 2.4, 610, 1350, 'ΧΑΡΑΞΗ', -0.05);
  pip(ctx, ...PIP, VO, { rest: 'grin', eyes: 'happy' });
  captionSeq(ctx, lt, [[0.2, 'Δεν είναι μελάνι, ούτε αυτοκόλλητο.'], [2.36, 'Δεν έχει τίποτα να ξεκολλήσει.']]);
}
function sF(ctx, lt) { // 17,65–21,1 · δώρα · ομάδα · πελάτες
  bgFlat(ctx, C.pale, '#BFD0F0', 21);
  const cards = [['Εταιρικά δώρα', 0.15], ['Ομάδα', 1.6], ['Πελάτες', 2.6]];
  cards.forEach(([label, st], i) => {
    const cy = 650 + i * 325, rot = [-0.03, 0.025, -0.02][i];
    pop(ctx, lt, st, 510, cy, () => {
      const pf = cut(ctx, rectPts(-410, -145, 820, 290), C.paper, { seed: 610 + i, amp: 5 });
      ctx.save(); L.path(ctx, pf); ctx.clip();
      if (i === 0) giftBox(ctx, -230, 20, 0.6, { seed: 4200, inside: c => thermos(c, 20, -105, 0.36, { rot: 0.15, seed: 7310, edgeW: 5 }) });
      if (i === 1) [[-340, BRAND], [-225, C.mid], [-110, C.navy]].forEach(([x, sh], j) => {
        L.person(ctx, x, 20, 0.28, { seed: 4300 + j * 20, type: j === 1 ? 'woman' : 'man', shirt: sh, mood: 'happy' });
        thermos(ctx, x + 30, 110, 0.18, { rot: [-0.1, 0.05, 0.12][j], seed: 7320 + j, edgeW: 4 });
      });
      if (i === 2) {
        reach(ctx, -120, 30, 200, 700, { seed: 905, hand: 'open', side: -1 });
        thermos(ctx, -250, -10, 0.3, { rot: 1.25, seed: 7330, edgeW: 5 });
        reach(ctx, -310, -20, -500, 500, { seed: 900, hand: 'fist' });
      }
      ctx.restore();
      txt(ctx, label, 170, 4, { font: 'bold 60px Round', color: C.navy });
    }, rot);
  });
  captionSeq(ctx, lt, [[0.17, 'Ιδανικό για εταιρικά δώρα,'], [1.63, 'για την ομάδα σου,'], [2.63, 'ή για πελάτες.']]);
}
function sG(ctx, lt) { // 21,1–24,75 · CTA
  starsBG(ctx, lt);
  const sx = 770, sy = 900, ss = 0.64, up = easeOut(prog(lt, 0.15, 0.5)), aR = lerp(0.12, 1.4, up), eR = lerp(0, -1.6, up);
  const [hx, hy] = handPos(-1, 0.5, ss, sx, sy, -1.4);
  thermos(ctx, hx - 3, hy - 22, 0.52, { engrave: 1, phase: 0.2, rot: -0.08, seed: 7300, edgeW: 6 });
  stratos(ctx, sx, sy, ss, { seed: 1000, arms: [0.5, aR], elbowL: -1.4, elbowR: eR, handL: 'grip', handR: up > 0.8 ? 'thumb' : 'open', mouth: lipsync(VO, 'grin'), blink: blinkNow(), brows: 0.5, look: -8 });
  pop(ctx, lt, 0.6, 275, 690, () => {
    msgOut(ctx, -215, -110, 430, 220, '', { seed: 660 });
    cut(ctx, rrPts(-190, -85, 170, 170, 18), '#7A3E1D', { seed: 662, amp: 1.5, edgeW: 5 });
    kostasLogo(ctx, -105, 0, 150);
    txt(ctx, 'logo.pdf', 95, -4, { font: 'bold 44px Round', color: '#fff' });
  }, -0.02);
  pop(ctx, lt, 1.55, 275, 920, () => msgOut(ctx, -215, -60, 430, 120, 'Ποσότητα: 50 τμχ', { seed: 664, fs: 40 }), 0.02);
  ctaButton(ctx, lt, 2.35, 540, 1360, 'Στείλε μήνυμα', { w: 700 });
  captionSeq(ctx, lt, [[0.19, 'Στείλε μας το λογότυπό σου και την ποσότητα,'], [2.3, 'και φτιάχνουμε τα δικά σου.']]);
}
function sH(ctx, lt) { burnView(ctx, lt - 0.25, hookP(lt - 0.25)); } // loop → frame 0

const SCENES = [[sA, 4.25], [sB, 1.95], [sC, 2.8], [sD, 4.7], [sE, 3.95], [sF, 3.45], [sG, 3.65], [sH, 0.25]], WIPES = [1, 2, 3, 4, 5, 6, 7];
const START = SCENES.reduce((a, [, du]) => [...a, a[a.length - 1] + du], [0]);
require('./render.js')({
  name: 'pf02_thermos_laser',
  SCENES, WIPES, AUTO_SFX: false, // wipes → whoosh εδώ, για να περνάνε κι αυτά από το duck
  VO_FILE: 'vo/pf02_vo.mp3', VO_AT: 0.2,
  SFX: duck([
    ...WIPES.map(k => [START[k] - 0.27, 'whoosh', { seed: k, note: 'wipe' }]),
    [0.0, 'laser', { dur: 4.0, note: 'hook: laser loop' }],
    [2.4, 'pop', { note: 'σταγόνα μελάνι' }], [2.72, 'swoosh', { gain: 0.6, note: '✗ διαγραφή' }],
    [4.35, 'swoosh', { gain: 0.7, note: 'σηκώνει το θερμός' }], [5.0, 'pop', { note: 'chip «ματ βαφή»' }],
    [6.25, 'slide', { dur: 0.75, note: 'θερμός → rotary' }], [7.2, 'thud', { note: 'πατάει στο rotary' }],
    [7.5, 'lid', { note: 'κλείνει καπάκι' }], [8.1, 'ticks', { count: 6, note: 'rotary γυρίζει' }], [8.6, 'beep', { count: 1, note: 'ready' }],
    [9.05, 'laser', { dur: 4.4, note: 'χάραξη loop' }], [10.55, 'pop', { note: 'inset στρώσεις' }],
    [10.75, 'air', { dur: 1.0, note: 'καίγεται η βαφή' }], [11.8, 'shimmer', { note: 'ανοξείδωτο ✨' }],
    [13.7, 'pop', { note: 'θερμός reveal' }], [13.95, 'pop', { gain: 0.8, note: 'chip μελάνι' }], [14.3, 'swoosh', { gain: 0.5, note: 'διαγραφή' }],
    [14.85, 'pop', { gain: 0.8, note: 'chip αυτοκόλλητο' }], [15.2, 'swoosh', { gain: 0.5, note: 'διαγραφή' }],
    [16.1, 'stamp', { note: 'ΧΑΡΑΞΗ' }], [16.2, 'shimmer', { gain: 0.8 }],
    [17.8, 'pop', { note: 'εταιρικά δώρα' }], [19.25, 'pop', { note: 'ομάδα' }], [20.25, 'pop', { note: 'πελάτες' }],
    [21.3, 'swoosh', { note: 'thumb up' }], [21.7, 'sent', { note: 'logo.pdf' }], [22.65, 'sent', { note: 'ποσότητα' }], [23.45, 'pop', { note: 'CTA «Στείλε μήνυμα»' }],
    [24.75, 'laser', { dur: 0.25, note: 'loop → αρχή' }],
  ]),
});
