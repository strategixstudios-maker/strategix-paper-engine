// «Πώς φτιάχνεται;» #1 — Χάραξη σε notebook (laser) · host: Στράτος · 27.6s
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, caption, burst, check, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { stratos, handPos } = require('./stratos.js');
const { BRAND, NB, notebook, laserMachine, laserFX, smoke, honeycomb, laserHeadTop, uiSlider, giftBox, stratosBack, msgOut,
  reach, sparkle, stamp, seriesTag, ctaButton, pip, wallShelf, starsBG, bgFlat, cafeLogo } = require('./props.js');

const VO = [[0.2, 2.3], [2.6, 4.6], [4.8, 7.0], [7.4, 10.2], [10.4, 11.4], [11.8, 14.8], [15.2, 16.0], [16.3, 18.3], [18.7, 21.4], [21.8, 26.8]];
const TAG = 'Πώς φτιάχνεται; #1';
const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------- shared shots ----------
const MX = 430, MY = 1126, MW = 760, MU = MW / 1000, NBS = 0.62; // wide: machine + notebook on bed
const BED = [MX, MY - 114 * MU];
function workshop(ctx, lt, o = {}) {
  wallShelf(ctx);
  stratos(ctx, 890, 860, 0.72, { seed: 1000, blink: blinkNow(), ...o.st });
  cut(ctx, rectPts(-40, 1430, W + 80, 600), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  laserMachine(ctx, MX, MY, MW, { lid: o.lid || 0, on: o.on, head: o.head, lt,
    inside: c => { if (o.nb !== false) notebook(c, 0, 0, NBS, 0, { sy: 0.5, engrave: o.engrave ?? 0, edgeW: 5, seed: 4100 }); } });
}
const wideHead = (t, p) => [NB.lx * NBS + NB.half * NBS * Math.sin(t * 13), -114 + lerp(NB.top, NB.bot, p) * NBS * 0.5];
// top-down close-up inside the laser
const BX = 540, BY = 1000, BS = 2.1;
function burnView(ctx, t, p) {
  honeycomb(ctx);
  notebook(ctx, BX, BY, BS, 0, { engrave: p, seed: 4100 });
  const ly = BY + lerp(NB.top, NB.bot, p) * BS, lx = BX + NB.lx * BS + NB.half * BS * Math.sin(t * 13);
  smoke(ctx, lx, ly, t, 1.5, [0.3, -1]);
  laserFX(ctx, lx, ly, t, 1.4, 7);
  laserHeadTop(ctx, lx, ly, 1.25);
}
const hookP = t => 0.35 + t * 0.12;

// ---------- scenes ----------
function s1a(ctx, lt) { // hook: burn close-up
  burnView(ctx, lt, hookP(lt));
  caption(ctx, 'Έλα μαζί μας να δεις πώς χαράζεται ένα notebook.', lt, 0.05);
  seriesTag(ctx, lt, TAG, 800, 60);
}
function s1b(ctx, lt) { // pull back: workshop, Στράτος invites
  const t = lt + 1.3, p = hookP(t);
  workshop(ctx, t, { on: true, engrave: p, head: wideHead(t, p),
    st: { arms: [0.12, 2.45 + 0.3 * Math.sin(t * 9)], handR: 'open', mouth: lipsync(VO, 'grin'), eyes: 'happy', brows: 0.6, look: -10 } });
  caption(ctx, 'Έλα μαζί μας να δεις πώς χαράζεται ένα notebook.', lt, -1);
  seriesTag(ctx, t, TAG, 800, 60);
}
function s2(ctx, lt) { // place notebook in the laser
  const lid = easeInOut(prog(lt, 0.05, 0.55)), raise = easeInOut(prog(lt, 0.3, 0.9)), drop = easeIn(prog(lt, 0.95, 1.35)), back = easeInOut(prog(lt, 1.5, 1.95));
  const aL = lerp(0.15, 1.25, raise) - back * 1.1, landed = drop >= 1;
  const bump = lt > 1.35 && lt < 1.55 ? Math.sin((lt - 1.35) * 50) * 6 * (1 - (lt - 1.35) / 0.2) : 0;
  ctx.save(); ctx.translate(0, bump);
  workshop(ctx, lt, { lid, nb: landed, engrave: 0, st: { arms: [aL, 0.12], handL: landed ? 'open' : 'fist', mouth: lipsync(VO, 'smile'), brows: 0.3, look: -12 } });
  if (!landed) {
    const [hx, hy] = handPos(-1, aL, 0.72, 890, 860), from = [hx - 30, hy + 70], pos = lp(from, BED, drop);
    notebook(ctx, pos[0], pos[1], lerp(0.48, NBS * MU, drop), lerp(0.12, 0, drop), { sy: lerp(1, 0.5, drop), engrave: 0, edgeW: 6, seed: 4100 });
  }
  ctx.restore();
  pop(ctx, lt, 1.4, BED[0] + 170, BED[1] - 90, () => { cut(ctx, circlePts(0, 0, 46), C.paper, { seed: 620, amp: 2 }); check(ctx, 0, 2, 1.6, BRAND); });
  caption(ctx, 'Πρώτα τοποθετούμε το σημειωματάριο στο laser.', lt, 0.1);
}
function s3(ctx, lt) { // top-down: center under the red dot
  honeycomb(ctx);
  const cs = 1.8, tx = 540, ty = 1000, k = easeInOut(prog(lt, 0.45, 1.6));
  const nx = lerp(tx + 230, tx, k), ny = lerp(ty + 190, ty, k), rot = lerp(0.18, 0, k);
  notebook(ctx, nx, ny, cs, rot, { engrave: 0, seed: 4100 });
  const gx = tx + (NB.lx - NB.half) * cs, gy = ty + NB.top * cs, gw = NB.half * 2 * cs, gh = (NB.bot - NB.top) * cs;
  const dx = tx + NB.lx * cs, dy = gy + gh / 2;
  ctx.save(); ctx.globalAlpha = 0.55 + 0.25 * Math.sin(lt * 8); ctx.setLineDash([18, 12]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeRect(gx - 14, gy - 14, gw + 28, gh + 28);
  ctx.setLineDash([12, 14]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, dy); ctx.lineTo(W, dy); ctx.moveTo(dx, 380); ctx.lineTo(dx, H); ctx.stroke(); ctx.restore();
  const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 40); g.addColorStop(0, 'rgba(255,90,80,1)'); g.addColorStop(0.35, 'rgba(255,60,60,0.8)'); g.addColorStop(1, 'rgba(255,60,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, 40, 0, 7); ctx.fill();
  // Στράτος' finger pushes the corner
  const cxl = 110 * cs, cyl = 205 * cs, px = nx + cxl * Math.cos(rot) - cyl * Math.sin(rot), py = ny + cxl * Math.sin(rot) + cyl * Math.cos(rot);
  const hin = easeOut(prog(lt, 0.05, 0.45)), out = easeIn(prog(lt, 1.8, 2.3));
  if (out < 1) reach(ctx, px + out * 300, py + (1 - hin) * 700 + out * 800, 300, 900, { seed: 880, hand: 'point' });
  pop(ctx, lt, 1.65, dx + 250, dy - 210, () => { cut(ctx, circlePts(0, 0, 56), C.paper, { seed: 621, amp: 2 }); check(ctx, 0, 2, 2, BRAND); });
  pip(ctx, 170, 1730, 120, VO, { rest: 'smile' });
  caption(ctx, 'Και το κεντράρουμε εκεί ακριβώς που θέλουμε να χαράξουμε.', lt, 0.1);
}
function s4(ctx, lt) { // over the shoulder: power / speed → press
  const z = easeInOut(prog(lt, 3.0, 3.45)), zs = lerp(1, 1.9, z), BTN = [540, 970];
  const v1 = lerp(0.25, 0.7, easeInOut(prog(lt, 0.6, 1.3))), v2 = lerp(0.8, 0.4, easeInOut(prog(lt, 1.7, 2.4)));
  const pr = lt < 3.65 ? 0 : lt < 3.8 ? easeOut(prog(lt, 3.65, 3.8)) : 1 - easeInOut(prog(lt, 3.8, 4.05)), running = lt > 3.78;
  ctx.save(); ctx.translate(540, lerp(960, 1000, z)); ctx.scale(zs, zs); ctx.translate(-540, -960);
  bgFlat(ctx, C.blue, '#3456B0', 11);
  cut(ctx, rrPts(505, 1040, 70, 170, 10), C.silver, { seed: 630, amp: 1.5, edgeW: 5 });
  cut(ctx, rectPts(-40, 1190, W + 80, 900), C.navy, { seed: 631, scribble: '#1B2D62', edgeW: 8 });
  cut(ctx, rrPts(120, 400, 840, 680, 30), C.paper, { seed: 632, amp: 3 });
  cut(ctx, rrPts(150, 430, 780, 620, 18), '#10204A', { seed: 633, amp: 2, edge: false, shadow: false });
  txt(ctx, 'LASER · Notebook', 190, 482, { font: 'bold 34px Round', color: C.sky, align: 'left' });
  [BRAND, C.sky, C.mid].forEach((c, i) => cut(ctx, circlePts(810 + i * 38, 482, 11), c, { seed: 640 + i, amp: 0.5, edge: false, shadow: false }));
  pop(ctx, lt, 0.25, 190, 565, () => { cut(ctx, rrPts(0, -36, 420, 72, 36), C.paper, { seed: 634, amp: 2, edgeW: 5 }); txt(ctx, 'Υλικό: Δερματίνη', 210, 2, { font: 'bold 34px Round', color: C.navy }); });
  const k1 = uiSlider(ctx, 190, 705, 700, v1, 'Ισχύς', { seed: 5200 }), k2 = uiSlider(ctx, 190, 850, 700, v2, 'Ταχύτητα', { seed: 5210 });
  ctx.save(); ctx.translate(BTN[0], BTN[1]); ctx.scale(1 - 0.08 * pr, 1 - 0.08 * pr);
  cut(ctx, rrPts(-200, -52, 400, 104, 52), running ? '#1FA66A' : BRAND, { seed: 650, amp: 2, edgeW: 7 });
  if (!running) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-120, -22); ctx.lineTo(-120, 22); ctx.lineTo(-84, 0); ctx.closePath(); ctx.fill(); }
  txt(ctx, running ? 'Χαράζει...' : 'Χάραξη', running ? 0 : 24, 2, { font: 'bold 46px Round', color: '#fff' });
  ctx.restore();
  stratosBack(ctx, 250, 1560, 1.15, { seed: 1000 });
  // hand path
  let tip;
  if (lt < 0.55) tip = lp([900, 2200], k1, easeOut(prog(lt, 0.1, 0.55)));
  else if (lt < 1.35) tip = k1;
  else if (lt < 1.7) tip = lp(k1, k2, easeInOut(prog(lt, 1.35, 1.7)));
  else if (lt < 2.45) tip = k2;
  else tip = lp(k2, [565, 955], easeInOut(prog(lt, 2.45, 3.0)));
  if (lt > 3.0) tip = [565, 955 + pr * 26];
  reach(ctx, tip[0], tip[1], 450, 1000, { seed: 890, hand: 'point' });
  ctx.restore();
  burst(ctx, lt, 3.72, 830, 650, 'ΚΛΙΚ!', 0.12);
  if (lt < 3.2) caption(ctx, 'Μετά ρυθμίζουμε την ισχύ και την ταχύτητα ανάλογα με το υλικό.', lt, 0.15);
  else caption(ctx, 'Και πατάμε «χάραξη».', lt, 3.2);
}
function s5(ctx, lt) { // inside the laser: raster engraving
  burnView(ctx, lt, 0.03 + 0.97 * prog(lt, 0.15, 3.2));
  pip(ctx, 170, 1730, 120, VO, { rest: 'smile', eyes: 'happy' });
  caption(ctx, 'Το laser καίει το υλικό και εμφανίζεται το λογότυπο του πελάτη.', lt, 0.1);
}
function s6a(ctx, lt) { // lid opens: result?
  const lid = easeInOut(prog(lt, 0.1, 0.6));
  workshop(ctx, lt, { lid, engrave: 1, head: [0, -250], st: { arms: [0.12, 0.3], handR: 'open', mouth: lipsync(VO, 'O'), eyes: 'dot', brows: 1.0, look: -12 } });
  smoke(ctx, BED[0], BED[1] - 40, lt * 0.8 + 0.2, 2.2, [0, -1.4], 7, 0.6 * (1 - prog(lt, 0.4, 1.2)));
  caption(ctx, 'Αποτέλεσμα;', lt, 0.1);
}
function s6b(ctx, lt) { // hero shot
  starsBG(ctx, lt);
  const sp = spring(prog(lt, 0, 0.7)), s = 2.0 * sp, rot = lerp(-0.35, -0.05, easeOut(prog(lt, 0, 0.7)));
  const g = ctx.createRadialGradient(540, 1040, 60, 540, 1040, 560); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, 1300);
  if (s > 0.01) notebook(ctx, 540, 1040, s, rot, { engrave: 1, seed: 4100 });
  [[330, 720, 1.1], [760, 790, 0.8], [300, 1300, 0.7], [790, 1250, 1.0]].forEach(([x, y, k], i) => sparkle(ctx, x, y, k, lt, 0.5 + i * 0.12, 960 + i));
  const hin = easeOut(prog(lt, 0.8, 1.0)), out = easeIn(prog(lt, 1.95, 2.25)), rk = prog(lt, 1.0, 1.95);
  if (lt > 0.8 && out < 1) reach(ctx, 540 + NB.lx * 2 + Math.sin(rk * Math.PI * 3) * 150 + out * 300, 1040 + (NB.ly - 10) * 2 + (1 - hin) * 700 + out * 700, 350, 900, { seed: 895, hand: 'point' });
  stamp(ctx, lt, 0.45, 540, 1640, 'Premium χάραξη', -0.05);
  caption(ctx, 'Premium χάραξη που δεν φεύγει ποτέ.', lt, 0.05);
}
function s7(ctx, lt) { // gifts for clients / partners / team
  bgFlat(ctx, C.pale, '#BFD0F0', 21);
  const cards = [['Πελάτες', 0.25], ['Συνεργάτες', 1.1], ['Ομάδα', 1.9]];
  cards.forEach(([label, st], i) => {
    const cy = 640 + i * 430, rot = [-0.03, 0.025, -0.02][i];
    pop(ctx, lt, st, 540, cy, () => {
      const pf = cut(ctx, rectPts(-440, -185, 880, 370), C.paper, { seed: 610 + i, amp: 5 });
      ctx.save(); L.path(ctx, pf); ctx.clip();
      if (i === 0) giftBox(ctx, -230, 50, 0.72, { seed: 4200, inside: c => notebook(c, 0, -120, 0.42, -0.08, { seed: 4150, edgeW: 5 }) });
      if (i === 1) {
        reach(ctx, -130, 40, 200, 700, { seed: 905, hand: 'open', side: -1 });
        notebook(ctx, -250, -10, 0.34, 0.35, { seed: 4160, edgeW: 5 });
        reach(ctx, -300, -30, -500, 500, { seed: 900, hand: 'fist' });
      }
      if (i === 2) [[-340, BRAND], [-230, C.mid], [-120, C.navy]].forEach(([x, sh], j) => {
        L.person(ctx, x, 40, 0.3, { seed: 4300 + j * 20, type: j === 1 ? 'woman' : 'man', shirt: sh, mood: 'happy' });
        notebook(ctx, x, 110, 0.2, [-0.1, 0.05, 0.12][j], { seed: 4170 + j, edgeW: 4 });
      });
      ctx.restore();
      txt(ctx, label, 200, 4, { font: 'bold 64px Round', color: C.navy });
    }, rot);
  });
  caption(ctx, 'Ιδανικό για δώρα σε πελάτες, σε συνεργάτες, ή για την ομάδα σου.', lt, 0.05);
}
function s8(ctx, lt) { // CTA
  starsBG(ctx, lt);
  const sx = 740, sy = 860, ss = 0.76, aR = lerp(0.15, 2.75, easeOut(prog(lt, 0.2, 0.6)));
  stratos(ctx, sx, sy, ss, { seed: 1000, arms: [0.5, aR], handL: 'fist', handR: aR > 2 ? 'thumb' : 'open', mouth: lipsync(VO, 'grin'), blink: blinkNow(), brows: 0.5, look: -8 });
  const [hx, hy] = handPos(-1, 0.5, ss, sx, sy);
  notebook(ctx, hx - 10, hy + 100, 0.5, -0.12, { engrave: 1, seed: 4100, edgeW: 6 });
  pop(ctx, lt, 1.6, 300, 640, () => {
    msgOut(ctx, -230, -110, 460, 220, '', { seed: 660 });
    cut(ctx, rrPts(-205, -85, 170, 170, 18), C.navy, { seed: 662, amp: 1.5, edgeW: 5 });
    cafeLogo(ctx, -120, 20, 0.42, 'good');
    txt(ctx, 'logo.pdf', 90, -4, { font: 'bold 44px Round', color: '#fff' });
  }, -0.02);
  pop(ctx, lt, 2.7, 300, 870, () => msgOut(ctx, -230, -60, 460, 120, 'Ποσότητα: 50 τμχ', { seed: 664, fs: 40 }), 0.02);
  ctaButton(ctx, lt, 3.6, 540, 1690, 'Στείλε μήνυμα', { w: 700 });
  caption(ctx, 'Στείλε μας μήνυμα με το λογότυπό σου και την ποσότητα που σε ενδιαφέρει, και φτιάξε τα δικά σου εταιρικά δώρα.', lt, 0.05);
}
function s9(ctx, lt) { burnView(ctx, lt - 0.3, hookP(lt - 0.3)); } // loop → frame 0

require('./render.js')({ name: 'pf01_notebook_laser', SCENES: [[s1a, 1.3], [s1b, 1.2], [s2, 2.2], [s3, 2.5], [s4, 4.4], [s5, 3.4], [s6a, 1.2], [s6b, 2.3], [s7, 3.1], [s8, 5.7], [s9, 0.3]], WIPES: [1, 3, 4, 5, 6, 7, 8, 9, 10] });
