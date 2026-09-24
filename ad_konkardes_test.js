// AD TEST — Κονκάρδες προσωπικού · host: Στράτος · 12s · engine v2 test (elbows, hands, captionSeq, safe zones, CTA)
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, badge, caption, captionSeq, lerp, prog, easeOut, easeIn, spring, lipsync, blinkNow } = L;
const { stratos } = require('./stratos.js');
const P = require('./props.js');

// VO (absolute seconds). VO1 = πελάτης εκτός κάδρου (ο Στράτος δεν μιλάει). VO2–5 = Στράτος.
const VO_CLIENT = [[0.2, 1.6]];
const VO = [[2.2, 4.3], [4.7, 7.3], [7.7, 9.2], [9.7, 11.7]];
const mouthS = (rest) => lipsync(VO, rest);

// scene backgrounds
function cafeBG(ctx) {
  P.bgFlat(ctx, C.pale, '#BFD0F0', 21);
  cut(ctx, rectPts(-40, 1420, W + 80, 600), C.navy, { seed: 22, scribble: '#1B2D62' }); // counter
  cut(ctx, rectPts(-40, 1400, W + 80, 46), C.paper, { seed: 23, amp: 2, edgeW: 6 });
}

// badge with ANNA CAFÉ logo + name. BADGE colours: gold|silver|bronze
function staffBadge(ctx, x, y, w, col, name, o = {}) {
  const h = w / 3;
  badge(ctx, x, y, w, col, '', { logo: false, rot: o.rot, s: o.s, seed: o.seed });
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.s || 1, o.s || 1);
  const rev = o.reveal ?? 1;
  if (rev > 0) {
    ctx.save(); if (rev < 1) { ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w * rev, h); ctx.clip(); }
    P.cafeLogo(ctx, -w / 2 + h * 0.62, h * 0.12, h / 290, 'good', 1, C.navy);
    txt(ctx, name, h * 0.45, h * 0.03, { font: `bold ${Math.round(h * 0.36)}px Round`, color: C.ink });
    ctx.restore();
  }
  ctx.restore();
}

// ---------- scenes ----------
function s1(ctx, lt) { // hook: «Συγγνώμη… πώς σε λένε;»
  cafeBG(ctx);
  const shock = lt > 0.85;
  stratos(ctx, 470, 980, 1, {
    legs: false, seed: 1000, mouth: shock ? 'shock' : 'smile', eyes: shock ? 'shock' : 'dot', brows: shock ? 1.1 : 0.2,
    look: shock ? 12 : 0, blink: blinkNow(), arms: shock ? [0.5, 0.5] : [0.12, 0.12], elbowL: shock ? -1.1 : 0, elbowR: shock ? -1.1 : 0,
    handL: shock ? 'open' : 'relaxed', handR: shock ? 'open' : 'relaxed', hintL: shock ? 'shrug' : '', hintR: shock ? 'shrug' : '',
  });
  P.mug(ctx, 860, 1395, 0.9, lt, true);
  P.speechOff(ctx, lt, 0.2, 1, 700, 560, 560, 200, 'πώς σε λένε;', { seed: 31, rot: 0.03 });
  caption(ctx, 'Συγγνώμη... πώς σε λένε;', lt, 0.05);
}
function s2(ctx, lt) { // badge drops on apron
  P.bgFlat(ctx, C.pale, '#BFD0F0', 24);
  const x = 540, y = 960, s = 1, landed = lt > 0.72;
  stratos(ctx, x, y, s, {
    legs: false, seed: 1000, mouth: mouthS(landed ? 'grin' : 'O'), eyes: landed ? 'happy' : 'shock', brows: landed ? 0.5 : 1,
    blink: blinkNow(), arms: landed ? [0.12, 0.55] : [0.12, 0.12], elbowR: landed ? 1.9 : 0, handR: 'point', handL: 'open', armRFront: true,
  });
  // drop: from above head to apron chest (local 0,235)
  const k = easeIn(prog(lt, 0.25, 0.72)), bounce = landed ? Math.sin((lt - 0.72) * 22) * Math.exp(-(lt - 0.72) * 6) * 14 : 0;
  const by = lerp(-200, y + 235 * s, k) - bounce;
  staffBadge(ctx, x, by, 220, 'gold', 'ΣΤΡΑΤΟΣ', { rot: landed ? 0 : lerp(-0.4, 0, k), seed: 41 });
  if (landed) P.sparkle(ctx, x + 125, y + 190, 0.8, lt, 0.75, 42);
  if (landed) P.sparkle(ctx, x - 130, y + 270, 0.6, lt, 0.85, 43);
  captionSeq(ctx, lt, [[0.05, 'Κονκάρδες προσωπικού'], [1.25, 'με το λογότυπό σου']]);
}
function s3(ctx, lt) { // close-up + laser reveal + 3 checks
  P.bgFlat(ctx, C.navy, '#1B2D62', 25);
  const rev = easeOut(prog(lt, 0.15, 1.0));
  const bob = Math.sin(lt * 2.2) * 6;
  staffBadge(ctx, 540, 700 + bob, 860, 'gold', 'ΜΑΡΙΑ', { rot: -0.03, reveal: rev, seed: 44 });
  if (rev > 0 && rev < 1) P.laserFX(ctx, 540 - 430 + 860 * rev, 700 + bob, lt, 1, 45);
  P.checkChip(ctx, lt, 0.3, 540, 1080, 'μαγνήτης', { seed: 61, rot: -0.02 });
  P.checkChip(ctx, lt, 1.1, 540, 1220, 'χάραξη laser', { seed: 63, rot: 0.02 });
  P.checkChip(ctx, lt, 1.9, 540, 1360, '1–2 εργάσιμες', { seed: 65, rot: -0.015 });
  captionSeq(ctx, lt, [[0.05, 'Με μαγνήτη'], [1.05, 'χάραξη laser'], [1.85, 'έτοιμες σε 1–2 εργάσιμες']]);
}
function s4(ctx, lt) { // whole team
  P.starsBG(ctx, lt, C.blue, '#3456B0');
  const B = [['gold', 'ΜΑΡΙΑ', 560, -0.05], ['silver', 'ΝΙΚΟΣ', 730, 0.04], ['bronze', 'ΕΛΕΝΗ', 900, -0.03]];
  B.forEach(([col, n, y, r], i) => pop(ctx, lt, 0.1 + i * 0.28, 540, y, () => staffBadge(ctx, 0, 0, 480, col, n, { seed: 50 + i * 3 }), r));
  const up = spring(prog(lt, 0.7, 1.2));
  stratos(ctx, 540, lerp(2500, 1330, up), 0.62, {
    legs: false, seed: 1000, mouth: mouthS('grin'), eyes: 'happy', brows: 0.5, blink: blinkNow(),
    arms: [0.12, 1.4], elbowR: -1.6, handR: 'thumb', handL: 'open',
  });
  caption(ctx, 'για όλη την ομάδα σου', lt, 0.05);
}
function s5(ctx, lt) { // CTA
  P.bgFlat(ctx, C.pale, '#BFD0F0', 26);
  stratos(ctx, 540, 900, 0.72, {
    legs: false, seed: 1000, mouth: mouthS('smile'), eyes: 'dot', brows: 0.4, blink: blinkNow(), look: 0,
    arms: [0.12, 0.35], elbowR: -0.2, handR: 'point', handL: 'open',
  });
  staffBadge(ctx, 540, 900 + 235 * 0.72, 220 * 0.72, 'gold', 'ΣΤΡΑΤΟΣ', { seed: 41 });
  P.ctaButton(ctx, lt, 0.25, 540, 1375, 'Πάρε προσφορά', { w: 660 });
  caption(ctx, 'Πάρε προσφορά στο strategixstudios.com', lt, 0.05);
}

module.exports = require('./render.js')({ name: 'ad_konkardes_test', SCENES: [[s1, 2.0], [s2, 2.5], [s3, 3.0], [s4, 2.0], [s5, 2.5]], WIPES: 'all' });
