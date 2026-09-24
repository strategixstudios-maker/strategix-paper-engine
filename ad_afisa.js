// AD — «Θολή αφίσα» · online εκτύπωση αφίσας (strategixstudios.com/ektyposi-afisas) · host: Στράτος · VO ElevenLabs «Stratos» + SFX
// Ισχυρισμοί ΜΟΝΟ από τη landing: από 13 €, ματ 250gr, έλεγχος ανάλυσης πριν πληρώσεις (πράσινο/κίτρινο), σωλήνας χωρίς τσακίσεις.
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, check, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { stratos } = require('./stratos.js');
const { BRAND, POSTER, poster, posterTube, phoneFrame, reach, sparkle, stamp, ctaButton, checkChip, pip, PIP, bgFlat, starsBG } = require('./props.js');

// VO = vo/ad_afisa_vo.mp3 @ 0,1s (ElevenLabs eleven_v3, φωνή «Stratos», χωρίς «[sighs] Γνωστό σενάριο», παύσεις σφιγμένες + atempo 1.06). Χρονισμοί φράσεων (απόλυτοι, silence detect):
// 0,13 Περίμενες μια εβδομάδα την αφίσα σου... | 2,43 και βγήκε θολή. | 3,71 Εκτός αν... | 4,74 την ανεβάσεις εδώ, από το κινητό σου.
// 6,73 Διαλέγεις μέγεθος, | 7,75 και βλέπεις αν η ανάλυση φτάνει. | 9,38 Πριν πληρώσεις. | 10,42 Premium ματ χαρτί, διακόσια πενήντα γραμμάρια.
// 12,93 Έρχεται σε σωλήνα. | 13,94 Χωρίς τσακίσεις. | 15,02 Αφίσα από δεκατρία ευρώ. | 16,48 Ανέβασε τη φωτογραφία σου | 17,83 στο strategixstudios.com. (–19,58)
const T = {
  hook: 0.13, tholi: 2.43, ektos: 3.71, anevaseis: 4.74, megethos: 6.73, prin: 9.38,
  xarti: 10.42, solinas: 12.93, tsakiseis: 13.94, timi: 15.02, cta: 16.48, end: 19.58,
};
// SFX: ducking = default του render.js (όλα −6 dB · όσα πέφτουν πάνω σε φράση άλλα −7 dB, φράσεις αυτόματα από το VO)
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const S = { // όρια σκηνών (απόλυτα)
  a: 0, b: T.ektos - 0.1, c: T.anevaseis - 0.15, d: T.megethos - 0.2, e: T.xarti - 0.2, f: T.solinas - 0.2, g: T.timi - 0.2, h: T.end + 0.15,
};
const rel = k => T[k] - S[Object.keys(S).reverse().find(s => S[s] <= T[k])]; // χρόνος φράσης μέσα στη σκηνή του
const SX = 820, SY = 1010, SS = 0.8; // Στράτος στο hook

// ---------- κοινά ----------
function wall(ctx) {
  bgFlat(ctx, C.pale, '#BFD0F0', 21);
  cut(ctx, rectPts(-40, 1500, W + 80, 500), C.navy, { seed: 22, scribble: '#1B2D62', edgeW: 8 });
}
const PA = [370, 430, 500, 700]; // αφίσα στον τοίχο: cx, top, w, h
function hookShot(ctx, lt, t0, st) { // τοίχος + αφίσα που ξετυλίγεται + σωλήνας στο πάτωμα + Στράτος
  wall(ctx);
  const k = easeOut(prog(lt + t0, 0.1, 0.95));
  poster(ctx, PA[0], PA[1], PA[2], PA[3], { k, mode: 'blur', tape: k > 0.98, seed: 7000 });
  posterTube(ctx, 200, 1640, 520, { rot: -1.45, cap: 0, seed: 7100 });
  cut(ctx, rrPts(420, 1570, 130, 50, 12), C.navy, { seed: 7110, amp: 1, edgeW: 4 }); // καπάκι στο πάτωμα
  stratos(ctx, SX, SY, SS, { seed: 1000, legs: false, blink: blinkNow(), ...st });
}

// ---------- σκηνές ----------
function sA(ctx, lt) { // hook: η αφίσα ήρθε… θολή
  const shock = lt > rel('tholi') + 0.1;
  hookShot(ctx, lt, 0, { arms: [0.12, 0.12], mouth: lipsync(VO, shock ? 'shock' : 'smile'), eyes: shock ? 'shock' : 'happy', brows: shock ? 1.2 : 0.5, look: shock ? -8 : -14 });
  stamp(ctx, lt, rel('tholi') + 0.35, PA[0], PA[1] + PA[3] * 0.42, 'ΘΟΛΗ', -0.12, '#D6453D', 96);
  captionSeq(ctx, lt, [[0.05, 'Περίμενες μια εβδομάδα την αφίσα σου...'], [rel('tholi') - 0.05, '...και βγήκε θολή.']]);
}
function sB(ctx, lt) { // «Εκτός αν...» — δάχτυλο πάνω, μικρό zoom στον Στράτο
  const z = easeInOut(prog(lt, 0, 0.6)), zs = lerp(1, 1.18, z);
  ctx.save(); ctx.translate(SX - 120, 900); ctx.scale(zs, zs); ctx.translate(-(SX - 120), -900);
  hookShot(ctx, lt, 5, { arms: [1.4, 0.12], elbowL: -1.6, handL: 'point', mouth: lipsync(VO, 'grin'), eyes: 'dot', brows: 0.9, look: 0 });
  ctx.restore();
  captionSeq(ctx, lt, [[0.05, 'Εκτός αν...']]);
}
// κινητό: upload → μεγέθη
const PH = [560, 880, 660, 1100];
function header(c, w) { cut(c, rectPts(-10, -10, w + 20, 130), C.navy, { seed: 7300, amp: 1, edge: false, shadow: false }); txt(c, 'Εκτύπωση αφίσας', w / 2, 72, { font: 'bold 40px Round', color: '#fff' }); }
function sC(ctx, lt) { // upload από το κινητό
  starsBG(ctx, lt);
  const tap = rel('anevaseis') + 0.45, up = easeInOut(prog(lt, tap + 0.25, tap + 1.3));
  const [sx, sy] = phoneFrame(ctx, PH[0], PH[1], PH[2], PH[3], (c, w, h) => {
    header(c, w);
    ctx.save(); c.setLineDash([16, 12]); c.strokeStyle = C.mid; c.lineWidth = 5; c.strokeRect(40, 170, w - 80, 420); c.restore();
    if (lt < tap + 0.2) {
      cut(c, circlePts(w / 2, 320, 70), BRAND, { seed: 7310, amp: 1, edgeW: 4, shadow: false });
      c.save(); c.strokeStyle = '#fff'; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(w / 2, 355); c.lineTo(w / 2, 290); c.moveTo(w / 2 - 28, 316); c.lineTo(w / 2, 288); c.lineTo(w / 2 + 28, 316); c.stroke(); c.restore();
      txt(c, 'Ανέβασε φωτογραφία', w / 2, 450, { font: 'bold 38px Round', color: C.navy });
      txt(c, 'JPG · PNG · PDF', w / 2, 505, { font: '30px Round', color: '#6A7896' });
    } else {
      pop(c, lt, tap + 0.2, w / 2, 380, () => { cut(c, rectPts(-135, -185, 270, 378), '#fff', { seed: 7320, amp: 2, edgeW: 5 }); c.drawImage(POSTER.sharp, -125, -175, 250, 350); });
    }
    txt(c, 'IMG_4821.jpg', 48, 660, { font: 'bold 34px Round', color: C.navy, align: 'left' });
    cut(c, rrPts(48, 700, w - 96, 26, 13), '#D3DDF0', { seed: 7330, amp: 1, edge: false, shadow: false });
    if (up > 0) cut(c, rrPts(48, 700, (w - 96) * up, 26, 13), up >= 1 ? '#1FA66A' : BRAND, { seed: 7331, amp: 1, edge: false, shadow: false });
    if (up >= 1) { cut(c, circlePts(w - 70, 662, 24), '#1FA66A', { seed: 7332, amp: 1, edgeW: 3, shadow: false }); check(c, w - 70, 664, 0.9, '#fff'); }
  });
  const hin = easeOut(prog(lt, 0.1, tap)), out = easeIn(prog(lt, tap + 0.35, tap + 0.8)), press = lt > tap && lt < tap + 0.15 ? 14 : 0;
  if (out < 1) reach(ctx, sx + 300 + out * 300, sy + 330 + press + (1 - hin) * 900 + out * 700, 380, 900, { seed: 7340, hand: 'point' });
  pip(ctx, ...PIP, VO, { rest: 'smile', eyes: 'happy' });
  captionSeq(ctx, lt, [[0.05, '...την ανεβάσεις εδώ, από το κινητό σου.']]);
}
// μεγέθη & ένδειξη ανάλυσης: 12MP κινητό → άριστη (πράσινο) ως 40×50, καλή (κίτρινο) ως 70×100 (FAQ landing)
const SIZES = [['21×30', 21, 30, 'g'], ['30×40', 30, 40, 'g'], ['40×50', 40, 50, 'g'], ['50×70', 50, 70, 'y'], ['60×90', 60, 90, 'y'], ['70×100', 70, 100, 'y']];
const QC = { g: '#1FA66A', y: '#E3B32B' };
function sD(ctx, lt) {
  starsBG(ctx, lt);
  const t1 = rel('megethos'), dotT = i => t1 + 0.25 + i * 0.22, pickT = t1 + 1.8, sel = lt < pickT ? Math.min(5, Math.max(0, Math.floor((lt - t1 - 0.25) / 0.22))) : 2;
  const [, ww, hh] = SIZES[sel], ar = ww / hh, pw = 300, ph = pw / ar;
  const [sx, sy] = phoneFrame(ctx, PH[0], PH[1], PH[2], PH[3], (c, w) => {
    header(c, w);
    const cx = w / 2, cy = 390; cut(c, rectPts(cx - pw / 2, cy - ph / 2, pw, ph), '#fff', { seed: 7400 + sel, amp: 2, edgeW: 5 });
    c.save(); c.beginPath(); c.rect(cx - pw / 2 + 8, cy - ph / 2 + 8, pw - 16, ph - 16); c.clip(); const s = Math.max((pw - 16) / POSTER.w, (ph - 16) / POSTER.h); c.drawImage(POSTER.sharp, cx - POSTER.w * s / 2, cy - POSTER.h * s / 2, POSTER.w * s, POSTER.h * s); c.restore();
    SIZES.forEach(([lab, , , q], i) => {
      const x = 40 + (i % 3) * ((w - 80) / 3), y = 640 + Math.floor(i / 3) * 120, bw = (w - 80) / 3 - 14, on = i === sel;
      cut(c, rrPts(x, y, bw, 96, 22), on ? BRAND : '#fff', { seed: 7410 + i, amp: 1.5, edgeW: 4, shadow: false });
      txt(c, lab, x + bw / 2 - 12, y + 50, { font: 'bold 32px Round', color: on ? '#fff' : C.navy });
      pop(c, lt, dotT(i), x + bw - 22, y + 48, () => { cut(c, circlePts(0, 0, 14), QC[q], { seed: 7420 + i, amp: 0.5, edgeW: 3, shadow: false }); });
    });
    pop(c, lt, pickT + 0.1, w / 2, 900, () => { cut(c, rrPts(-210, -40, 420, 80, 40), '#E3F5EC', { seed: 7430, amp: 1, edge: false, shadow: false }); cut(c, circlePts(-170, 0, 16), QC.g, { seed: 7431, amp: 0.5, edge: false, shadow: false }); txt(c, 'Άριστη ανάλυση', 18, 2, { font: 'bold 34px Round', color: '#16774C' }); });
  });
  const tipP = [sx + 40 + 2 * ((PH[2] - 52 - 80) / 3) + 80, sy + 700], hin = easeOut(prog(lt, pickT - 0.45, pickT)), press = lt > pickT && lt < pickT + 0.15 ? 14 : 0, out = easeIn(prog(lt, pickT + 0.4, pickT + 0.85));
  if (lt > pickT - 0.45 && out < 1) reach(ctx, tipP[0] + out * 300, tipP[1] + press + (1 - hin) * 800 + out * 700, 380, 900, { seed: 7440, hand: 'point' });
  checkChip(ctx, lt, rel('prin') + 0.05, 650, 1390, 'Πριν πληρώσεις', { seed: 7450, fs: 54, rot: -0.03 });
  pip(ctx, ...PIP, VO, { rest: 'smile', eyes: 'happy' });
  captionSeq(ctx, lt, [[0.05, 'Διαλέγεις μέγεθος,'], [rel('megethos') + 1.0, '...και βλέπεις αν η ανάλυση φτάνει.'], [rel('prin') - 0.05, 'Πριν πληρώσεις.']]);
}
function sE(ctx, lt) { // premium ματ χαρτί 250gr: hero αφίσα + χέρι που τη χαϊδεύει
  bgFlat(ctx, C.pale, '#BFD0F0', 23);
  const sp = spring(prog(lt, 0, 0.6)), w = 560 * sp, h = w * 1.4;
  const g = ctx.createRadialGradient(540, 840, 60, 540, 840, 620); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1200);
  if (sp > 0.02) poster(ctx, 540, 840 - h / 2, w, h, { rot: lerp(-0.2, -0.03, easeOut(prog(lt, 0, 0.6))), seed: 7500 });
  [[250, 520, 1], [830, 600, 0.8], [240, 1160, 0.7], [840, 1110, 0.9]].forEach(([x, y, k], i) => sparkle(ctx, x, y, k, lt, 0.4 + i * 0.12, 7510 + i));
  const hin = easeOut(prog(lt, 0.6, 0.85)), rk = prog(lt, 0.85, 1.9), out = easeIn(prog(lt, 1.9, 2.2));
  if (lt > 0.6 && out < 1) reach(ctx, 560 + Math.sin(rk * Math.PI * 2) * 150 + (1 - hin) * 500 + out * 600, 930 + (1 - hin) * 300 + out * 300, 700, 420, { seed: 7520, hand: 'open' });
  stamp(ctx, lt, 0.5, 540, 1360, 'Ματ · 250gr', -0.05);
  captionSeq(ctx, lt, [[0.05, 'Premium ματ χαρτί, 250 γραμμάρια.']]);
}
function sF(ctx, lt) { // τυλίγεται → μπαίνει στον σωλήνα → καπάκι → «Χωρίς τσακίσεις»
  bgFlat(ctx, C.sky, '#A7C1F2', 24);
  cut(ctx, rectPts(-40, 1500, W + 80, 500), C.navy, { seed: 25, scribble: '#1B2D62', edgeW: 8 });
  const TX = 700, TB = 1470, TH = 760, pw = 400, ph = 560;
  const roll = easeInOut(prog(lt, 0.05, 0.6)), lift = easeInOut(prog(lt, 0.6, 1.0)), drop = easeIn(prog(lt, 1.0, 1.3)), cap = spring(prog(lt, 1.35, 1.75));
  posterTube(ctx, TX, TB, TH, { back: true, seed: 7600 });
  if (roll < 1) poster(ctx, 340, 620, pw, ph, { k: 1 - roll, dir: 'left', seed: 7610, roll: 26 });
  else if (drop < 1) { // το ρολό: από τη θέση του → πάνω από τον σωλήνα → μέσα
    const x0 = 340 - pw / 2, rx = lerp(x0, TX, lift), ry = lerp(620, TB - TH - ph - 40, lift) + drop * (ph + 60);
    cut(ctx, rrPts(rx - 26, ry, 52, ph, 26), '#F1EEE6', { seed: 7611, amp: 1.5, edgeW: 4 });
  }
  posterTube(ctx, TX, TB, TH, { cap, seed: 7600 });
  checkChip(ctx, lt, rel('tsakiseis') + 0.05, 340, 880, 'Χωρίς τσακίσεις', { seed: 7620, fs: 52, rot: -0.04 });
  pip(ctx, ...PIP, VO, { rest: 'smile' });
  captionSeq(ctx, lt, [[0.05, 'Έρχεται σε σωλήνα.'], [rel('tsakiseis') - 0.05, 'Χωρίς τσακίσεις.']]);
}
function sG(ctx, lt) { // CTA: καθαρή αφίσα στον τοίχο + Στράτος thumb up + «Από 13 €» + κουμπί
  wall(ctx);
  poster(ctx, 330, 500, 390, 546, { tape: true, seed: 7700 });
  const aL = lerp(0.12, 1.4, easeOut(prog(lt, 0.15, 0.5))), elL = lerp(0, -1.6, easeOut(prog(lt, 0.15, 0.5)));
  stratos(ctx, 810, 980, 0.72, { seed: 1000, legs: false, arms: [aL, 0.12], elbowL: elL, handL: aL > 1.2 ? 'thumb' : 'fist', mouth: lipsync(VO, 'grin'), blink: blinkNow(), eyes: 'happy', brows: 0.5, look: -6 });
  stamp(ctx, lt, 0.35, 330, 1120, 'Από 13 €', -0.06, BRAND, 84);
  const c1 = rel('cta');
  ctaButton(ctx, lt, c1 + 0.2, 540, 1275, 'Ανέβασε φωτογραφία', { w: 820 });
  pop(ctx, lt, c1 + 0.6, 540, 1405, () => txt(ctx, 'strategixstudios.com', 0, 0, { font: 'bold 50px Brand', color: C.navy }));
  captionSeq(ctx, lt, [[0.05, 'Αφίσα από 13 €.'], [c1 - 0.05, 'Ανέβασε τη φωτογραφία σου'], [c1 + 1.33, 'στο strategixstudios.com']]);
}
function sH(ctx, lt) { hookShot(ctx, 0, 0, { arms: [0.12, 0.12], mouth: 'smile', eyes: 'happy', brows: 0.5, look: -14 }); } // loop → frame 0

const d = k => { const ks = Object.keys(S); const i = ks.indexOf(k); return S[ks[i + 1]] - S[k]; };
const SCENES = [[sA, d('a')], [sB, d('b')], [sC, d('c')], [sD, d('d')], [sE, d('e')], [sF, d('f')], [sG, d('g')], [sH, 0.25]], WIPES = [2, 4, 5, 6, 7];
require('./render.js')({
  name: 'ad_afisa',
  SCENES, WIPES, // wipes → auto whoosh
  VO_FILE: require('fs').existsSync('vo/ad_afisa_vo.mp3') ? 'vo/ad_afisa_vo.mp3' : undefined, VO_AT: 0.1,
  SFX: [
    [0.12, 'slide', { dur: 0.8, note: 'αφίσα ξετυλίγεται' }], [T.tholi + 0.1, 'boing', { note: 'θολή' }], [T.tholi + 0.35, 'stamp', { note: 'ΘΟΛΗ' }],
    [T.ektos, 'pop', { note: 'δάχτυλο πάνω' }],
    [S.c + rel('anevaseis') + 0.45, 'click', { note: 'tap upload' }], [S.c + rel('anevaseis') + 0.65, 'pop', { note: 'φωτογραφία' }], [S.c + rel('anevaseis') + 1.3, 'ding', { gain: 0.7, note: 'upload ✓' }],
    [T.megethos + 0.25, 'ticks', { count: 6, note: 'κουκκίδες ποιότητας' }], [T.megethos + 1.8, 'click', { note: 'επιλογή 40×50' }], [T.megethos + 1.9, 'ding', { note: 'άριστη ανάλυση' }], [T.prin + 0.05, 'pop', { note: 'Πριν πληρώσεις' }],
    [S.e + 0.05, 'pop', { note: 'hero αφίσα' }], [S.e + 0.5, 'stamp', { note: 'Ματ 250gr' }], [S.e + 0.85, 'slide', { dur: 1.0, gain: 0.7, note: 'χέρι στο χαρτί' }], [S.e + 0.4, 'shimmer', { gain: 0.6 }],
    [S.f + 0.05, 'slide', { dur: 0.55, note: 'τύλιγμα' }], [S.f + 1.0, 'swoosh', { note: 'ρολό στον σωλήνα' }], [S.f + 1.4, 'lid', { note: 'καπάκι' }], [T.tsakiseis + 0.05, 'ding', { gain: 0.7 }],
    [S.g + 0.35, 'stamp', { note: 'Από 13 €' }], [S.g + 0.3, 'swoosh', { note: 'thumb up' }], [T.cta + 0.2, 'pop', { note: 'CTA' }], [T.cta + 0.6, 'shimmer', { gain: 0.7 }],
  ],
});
