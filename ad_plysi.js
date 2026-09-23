// AD «Η πλύση» — φούτερ με λογότυπο (DTF) · host: Στράτος · 19s
// VO (Στράτος): see STYLE_GUIDE.md → Episode log
const L = require('./lib.js');
const { C, ST, W, H, cut, rectPts, rrPts, circlePts, starPts, txt, pop, caption, burst, check, rng, clamp, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { S, head, stratos, handPos } = require('./stratos.js');
const { BRAND, HOOD, cafeLogo, hoodie, tiles, drum, machine, reach, sparkle, pip } = require('./props.js');

const VO = [[0.25, 2.35], [2.8, 4.9], [5.3, 6.0], [6.35, 8.7], [10.6, 13.6], [14.1, 15.6], [15.95, 18.5]];

// ---------- scenes ----------
function s1(ctx, lt) {
  const r = rng(ST.FRAME * 7 + 1), sh = lt > 1.62 && lt < 2.0 ? (1 - (lt - 1.62) / 0.38) * 20 : 0;
  ctx.save(); ctx.translate((r() - .5) * sh, (r() - .5) * sh);
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), '#CFE0F7', { seed: 5, edge: false, shadow: false });
  const spin = lt * 5.5 + 0.6;
  const [px, py, rr] = machine(ctx, 540, 1000, 1400, 1700, spin, { logo: lt < 1.2 ? 'good' : 'none' });
  if (lt >= 1.2) {
    const hs = rr / 470, hx = px + Math.cos(1.2 * 5.5 + .6) * rr * 0.22, hy = py + Math.sin(1.2 * 5.5 + .6) * rr * 0.22, hr = (1.2 * 5.5 + .6) * 1.3;
    const k = easeIn(prog(lt, 1.2, 1.62)), stuck = lt > 1.62;
    const sx = stuck ? 640 : lerp(hx, 640, k), sy = stuck ? 960 + (lt - 1.62) * 45 : lerp(hy, 960, k);
    const sc = stuck ? hs * 1.7 * (1 + 0.15 * Math.exp(-(lt - 1.62) * 9) * Math.sin((lt - 1.62) * 40)) : hs * lerp(0.95, 1.7, k);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(stuck ? -0.18 : lerp(hr, -0.18, k) + k * 6); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 20; cafeLogo(ctx, 0, 0, sc, 'good'); ctx.restore();
  }
  ctx.restore();
  caption(ctx, 'Πλύση Νο1. Λογότυπο: αντίο.', lt, 0.05);
}
function s2(ctx, lt) {
  tiles(ctx);
  const x = 740, y = 1180, s = 0.9, facepalm = lt > 1.7;
  const [hx, hy] = handPos(-1, 2.2, s, x, y);
  hoodie(ctx, hx, hy + 250, 0.95, 0.04 + Math.sin(lt * 5) * 0.03, { logo: 'cracked', seed: 3200 });
  stratos(ctx, x, y, s, { seed: 1000, arms: [2.2, facepalm ? -2.65 : 0.15], handL: 'fist', handR: 'open', armRFront: facepalm, mouth: lipsync(VO, facepalm ? 'flat' : 'shock'), eyes: facepalm ? 'tired' : 'shock', brows: facepalm ? -0.3 : 1.1, look: -12, legs: false });
  [['Ξεβαμμένο.', 300, 470, -0.08, 0.3], ['Σκασμένο.', 700, 620, 0.07, 0.9], ['Ξεκολλημένο.', 380, 780, -0.04, 1.5]].forEach(([w, sx, sy, rot, st], i) =>
    pop(ctx, lt, st, sx, sy, () => { ctx.font = '62px Round'; const tw = ctx.measureText(w).width + 70; cut(ctx, rectPts(-tw / 2, -58, tw, 116), i === 1 ? C.sky : C.paper, { seed: 820 + i, amp: 4 }); txt(ctx, w, 0, 2, { font: 'bold 60px Round', color: C.navy }); }, rot));
}
function s3(ctx, lt) {
  s4(ctx, 0);
  const r = rng(4242), edge = []; for (let y = -60; y <= H + 60; y += 34) edge.push([540 + (r() - .5) * 60, y]);
  const dx = easeIn(prog(lt, 0.45, 0.95)) * 760;
  const half = (side) => {
    ctx.save(); ctx.translate(side * dx, 0);
    const poly = side < 0 ? [[-60, -60], ...edge, [-60, H + 60]] : [[W + 60, -60], ...edge, [W + 60, H + 60]];
    L.path(ctx, poly); ctx.save(); ctx.translate(side * 8, 10); ctx.fillStyle = 'rgba(5,10,30,0.3)'; ctx.fill(); ctx.restore();
    L.path(ctx, poly); ctx.lineWidth = 16; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); L.path(ctx, poly); ctx.clip(); L.scribble(ctx, [0, 0, W, H], '#E3DCCB', 77);
    const sq = 1 + 0.08 * Math.sin(lt * 20) * (lt < 0.45 ? 1 : 0);
    txt(ctx, 'Εκτός αν...', 540, 900, { font: `${Math.round(150 * sq)}px Hand`, color: C.navy, rot: -0.05 });
    ctx.restore();
    const [ex] = edge[Math.floor(edge.length * 0.55)];
    reach(ctx, ex + side * 40, side < 0 ? 1180 : 980, side * 260, 820, { seed: 850 + (side > 0 ? 10 : 0), hand: 'fist', side: -side });
    ctx.restore();
  };
  half(-1); half(1);
}
function s4(ctx, lt) {
  const r0 = rng(ST.FRAME * 3 + 2), land = lt > 1.1 && lt < 1.4 ? (1 - (lt - 1.1) / 0.3) * 16 : 0;
  ctx.save(); ctx.translate((r0() - .5) * land, (r0() - .5) * land);
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), '#EFE6D2', { seed: 900, edge: false, shadow: false, scribble: '#DCCDAE' });
  ctx.strokeStyle = 'rgba(160,130,90,0.35)'; ctx.lineWidth = 4; for (let y = 240; y < H; y += 260) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 6); ctx.stroke(); }
  const hx = 540, hy = 1080, hs = 1.25, peeled = lt > 3.65;
  hoodie(ctx, hx, hy, hs, 0, { logo: lt > 0.6 ? (peeled ? 'good' : false) : false, seed: 3300 });
  const lx = hx, ly = hy - 10 * hs, ls = 0.95 * hs;
  // film
  if (!peeled) {
    const fx = lt < 0.6 ? lerp(lx + 900, lx, easeOut(prog(lt, 0.1, 0.6))) : lx;
    const x0 = fx - 160 * ls, y0 = ly - 175 * ls, x1 = fx + 160 * ls, y1 = ly + 75 * ls, fw = x1 - x0, fh = y1 - y0;
    const d = easeInOut(prog(lt, 2.7, 3.65)) * (fw + fh);
    ctx.save();
    if (d > 0) { ctx.beginPath(); ctx.moveTo(x1 - d - 2000, y1 + 2000); ctx.lineTo(x1 - d + 2000, y1 - 2000); ctx.lineTo(-3000, -3000); ctx.closePath(); ctx.clip(); }
    cafeLogo(ctx, fx, ly, ls, 'film');
    ctx.restore();
    if (d > 0) {
      if (lt > 2.7) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 5, y0 - 5, fw + 10, fh + 10); ctx.clip(); ctx.beginPath(); ctx.moveTo(x1 - d - 2000, y1 + 2000); ctx.lineTo(x1 - d + 2000, y1 - 2000); ctx.lineTo(4000, 4000); ctx.closePath(); ctx.clip(); cafeLogo(ctx, lx, ly, ls, 'good'); ctx.restore(); }
      const cxp = x1 - d, cyp = y1 - d;
      ctx.save(); ctx.globalAlpha = 0.75; ctx.fillStyle = '#F4F6FA'; ctx.beginPath(); ctx.moveTo(x1 - d, y1); ctx.lineTo(x1, y1 - d); ctx.lineTo(cxp + d * 0, cyp + d * 0); ctx.closePath();
      ctx.beginPath(); ctx.moveTo(Math.max(x0, x1 - d), y1 - Math.max(0, d - fw)); ctx.lineTo(x1 - Math.max(0, d - fh), Math.max(y0, y1 - d)); ctx.lineTo(cxp, cyp); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
      reach(ctx, cxp, cyp, 420, 700, { seed: 870, hand: 'fist' });
    }
  }
  // press platen
  const down = easeIn(prog(lt, 0.75, 1.1)), up = easeIn(prog(lt, 2.2, 2.5));
  if (lt > 0.6 && up < 1) {
    const py = lerp(-1000, 760, down) - up * 1700;
    if (down > 0.2 && down < 1) { ctx.fillStyle = `rgba(10,15,35,${0.25 * down})`; ctx.fillRect(110, 780, 860, 600); }
    cut(ctx, rrPts(100, py, 880, 600, 34), '#AEB6C3', { seed: 910, amp: 3, sx: 16, sy: 22 });
    cut(ctx, rrPts(140, py + 40, 800, 520, 24), '#C3CAD4', { seed: 911, amp: 2, edge: false, shadow: false });
    cut(ctx, rrPts(380, py + 250, 320, 90, 45), C.navy, { seed: 912, amp: 2, edgeW: 6 });
    txt(ctx, 'HEAT PRESS', 540, py + 297, { font: '34px Brand', color: C.sky });
    if (lt > 1.1 && lt < 2.5) {
      for (let i = 0; i < 14; i++) { const k = ((lt - 1.1) * 1.4 + i / 14) % 1; const ex = 100 + (i % 7) * 146, ey = i < 7 ? py - 10 : py + 610; ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; ctx.beginPath(); ctx.arc(ex + Math.sin(i + lt * 4) * 20, ey - (i < 7 ? k * 160 : -k * 60) - k * 60, 20 + k * 40, 0, 7); ctx.fill(); }
    }
  }
  burst(ctx, lt, 1.12, 300, 560, 'ΤΣΣΣ!', -0.1);
  if (peeled) for (let i = 0; i < 4; i++) sparkle(ctx, lx + [-190, 170, -120, 210][i], ly + [-200, -140, 100, 60][i], [1.1, 0.8, 0.7, 1][i], lt, 3.7 + i * 0.1, 950 + i);
  ctx.restore();
  if (lt < 2.6) pip(ctx, 190, 1690, 140, VO, { rest: 'smile' });
  caption(ctx, 'Με DTF, στο εργαστήριό μας.', lt, 0.15);
}
function s5(ctx, lt) {
  tiles(ctx);
  // clock
  cut(ctx, circlePts(900, 520, 90), C.white, { seed: 960, amp: 2 }); ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (const [len, sp] of [[60, 9], [42, 1.2]]) { const a = lt * sp; ctx.beginPath(); ctx.moveTo(900, 520); ctx.lineTo(900 + Math.sin(a) * len, 520 - Math.cos(a) * len); ctx.stroke(); } ctx.restore();
  const spin = lt * 7 + lt * lt * 2.2, top = 930, s = 0.72, sy = top - 440 * s;
  // legs dangling over the front (drawn before machine top edge overlap)
  const [px, py, rr] = machine(ctx, 540, 1330, 720, 800, spin, { logo: 'good', display: `${40}°` });
  const tap = Math.sin(lt * 16) * 0.12;
  [[-1, 0], [1, tap]].forEach(([sd, rot], i) => {
    ctx.save(); ctx.translate(540 + sd * 46, top - 10); ctx.rotate(rot);
    cut(ctx, rectPts(-40, 0, 80, 230), S.jeans, { seed: 970 + i, scribble: S.jeansS }); cut(ctx, rrPts(-52, 215, 104 + 30, 52, 24), S.shoe, { seed: 972 + i, amp: 2 }); ctx.restore();
  });
  stratos(ctx, 540, sy, s, { seed: 1000, legs: false, arms: [0.25, 0.9], handL: 'open', handR: 'fist', mouth: lipsync(VO, 'flat'), eyes: 'tired', brows: -0.2, look: 8 });
  const [mx, my] = handPos(1, 0.9, s, 540, sy);
  cut(ctx, rrPts(mx - 34, my - 70, 68, 84, 12), C.navy, { seed: 975, amp: 1.5, edgeW: 6 }); ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(mx + 38, my - 30, 18, -1.3, 1.3); ctx.stroke(); ctx.restore();
  txt(ctx, 'S', mx, my - 26, { font: '38px Brand', color: '#fff' });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const k of [-12, 12]) { ctx.beginPath(); ctx.moveTo(mx + k, my - 84); ctx.quadraticCurveTo(mx + k + 12, my - 104 - Math.sin(lt * 6) * 6, mx + k, my - 124); ctx.stroke(); } ctx.restore();
  // tally sticky note
  ctx.save(); ctx.translate(820, 1560); ctx.rotate(0.08); cut(ctx, rectPts(-110, -95, 220, 190), '#FFF4B8', { seed: 980, amp: 3 });
  const n = Math.floor(easeIn(prog(lt, 0.2, 3.3)) * 23); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, gx = -85 + (g % 3) * 62, gy = -55 + Math.floor(g / 3) * 80; ctx.beginPath(); if (j < 4) { ctx.moveTo(gx + j * 12, gy - 24); ctx.lineTo(gx + j * 12, gy + 24); } else { ctx.moveTo(gx - 6, gy + 18); ctx.lineTo(gx + 44, gy - 18); } ctx.stroke(); }
  ctx.restore();
  caption(ctx, 'Πλύση... ξανά... και ξανά...', lt, 0.1);
}
function s6(ctx, lt) {
  tiles(ctx);
  const k = spring(prog(lt, 0.0, 0.55));
  hoodie(ctx, 540, lerp(1500, 880, easeOut(prog(lt, 0, 0.35))), 1.2 * Math.max(0.3, k), lerp(-0.6, 0, easeOut(prog(lt, 0, 0.5))), { logo: 'good', seed: 3400 });
  sparkle(ctx, 680, 640, 1.3, lt, 0.35, 990); sparkle(ctx, 380, 760, 0.8, lt, 0.5, 991); sparkle(ctx, 720, 950, 0.7, lt, 0.6, 992);
  stratos(ctx, 840, 1560, 0.7, { seed: 1000, legs: false, arms: [0.12, 2.75], handR: 'thumb', mouth: lipsync(VO, 'grin'), eyes: lt > 1.3 ? 'happy' : 'dot', brows: 0.6, look: -10, blink: blinkNow() });
  caption(ctx, '...και μένει σαν καινούργιο.', lt, 0.05);
}
function s7(ctx, lt) {
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.blue, { seed: 81, edge: false, shadow: false, scribble: '#3456B0' });
  const r = rng(99);
  for (let i = 0; i < 18; i++) { const x = r() * W, y = r() < 0.6 ? 30 + r() * 240 : 1640 + r() * 260, sz = (10 + r() * 14) * (0.75 + 0.25 * Math.sin(lt * 5 + i)); cut(ctx, starPts(x, y, sz), i % 4 ? '#fff' : '#F4D98A', { seed: 700 + i, amp: 1, edgeW: 3, shadow: false }); }
  pop(ctx, lt, 0.0, 540, 190, () => txt(ctx, 'Strategix Studios', 0, 0, { font: '62px Brand', color: '#fff' }));
  cut(ctx, rectPts(70, 300, 940, 1300), C.paper, { seed: 82, amp: 7, step: 16 });
  pop(ctx, lt, 0.1, 540, 430, () => txt(ctx, 'Φούτερ', 0, 0, { font: 'bold 124px Round', color: C.navy }));
  pop(ctx, lt, 0.22, 540, 545, () => txt(ctx, 'με το λογότυπό σου', 0, 0, { font: '74px Hand', color: C.mid }));
  pop(ctx, lt, 0.35, 540, 900, () => hoodie(ctx, 0, 0, 0.82, Math.sin(lt * 3) * 0.03, { logo: 'good', seed: 3500 }));
  pop(ctx, lt, 0.6, 540, 1250, () => txt(ctx, 'εκτύπωση DTF · στο εργαστήριό μας', 0, 0, { font: '44px Hand', color: '#5B6784' }));
  const pulse = lt > 1.2 ? 1 + 0.045 * Math.sin((lt - 1.2) * 7) : 1;
  pop(ctx, lt, 0.8, 600, 1440, () => {
    ctx.scale(pulse, pulse); cut(ctx, rrPts(-320, -64, 640, 128, 64), BRAND, { seed: 90, amp: 2, edgeW: 8 });
    txt(ctx, 'Πάρε προσφορά', -42, 2, { font: 'bold 52px Round', color: '#fff' });
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(220, 0); ctx.lineTo(266, 0); ctx.moveTo(246, -20); ctx.lineTo(268, 0); ctx.lineTo(246, 20); ctx.stroke();
  });
  pop(ctx, lt, 1.0, 640, 1770, () => txt(ctx, 'strategixstudios.com', 0, 0, { font: 'bold 54px Round', color: '#fff' }));
  const rise = easeOut(prog(lt, 0.3, 0.8));
  stratos(ctx, 175, lerp(2300, 1610, rise), 0.62, { seed: 1000, legs: false, arms: [0.1, 2.0], handR: 'point', mouth: lipsync(VO, 'grin'), eyes: 'dot', brows: 0.6, look: 12, blink: blinkNow() });
  // loop iris back into the washing machine
  if (lt > 2.75) {
    const rad = easeIn(prog(lt, 2.75, 3.2)) * 1150;
    ctx.save(); ctx.beginPath(); ctx.arc(540, 1136, rad, 0, 7); ctx.clip(); const sv = ST.T; ST.T = 0; s1(ctx, 0); ST.T = sv; ctx.restore();
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(540, 1136, rad, 0, 7); ctx.stroke(); ctx.restore();
  }
}


require('./render.js')({ name: 'ad_plysi', SCENES: [[s1, 2.6], [s2, 2.6], [s3, 1.0], [s4, 4.2], [s5, 3.6], [s6, 1.8], [s7, 3.2]], WIPES: [1, 4, 5, 6] });
