// ORGANIC «Ο πελάτης είπε...» #1 — Το λογότυπο από WhatsApp · host: Στράτος · 19s
const L = require('./lib.js');
const { C, ST, W, H, cut, rectPts, rrPts, circlePts, starPts, txt, pop, caption, burst, check, rng, clamp, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { S, stratos, handPos } = require('./stratos.js');
const { BRAND, hoodie, reach, sparkle, msgBubble, stamp, seriesTag, wallShelf } = require('./props.js');

const VO = [[0.2, 1.4], [1.7, 3.8], [4.4, 6.6], [7.2, 9.8], [10.2, 15.2], [15.6, 18.3]];

// ---------- client logo: vector + pixelated JPG ----------
function kostasLogo(ctx, x, y, size) {
  const s = size / 400; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#7A3E1D'; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.fill();
  ctx.strokeStyle = '#F5E6C8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 165, 0, 7); ctx.stroke();
  ctx.fillStyle = '#F5E6C8'; ctx.beginPath(); ctx.moveTo(-62, -82); ctx.lineTo(62, -82); ctx.lineTo(50, 0); ctx.quadraticCurveTo(0, 16, -50, 0); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(70, -48, 24, -1.3, 1.3); ctx.stroke();
  ctx.lineWidth = 9; ctx.lineCap = 'round'; for (const sx of [-24, 0, 24]) { ctx.beginPath(); ctx.moveTo(sx, -98); ctx.quadraticCurveTo(sx + 12, -114, sx, -130); ctx.stroke(); }
  ctx.font = '62px Brand'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('KOSTAS', 0, 70);
  ctx.font = '30px Brand'; ctx.fillText('COFFEE', 0, 118);
  ctx.restore();
}
const PIX = (() => {
  const big = L.createCanvas(400, 400), b = big.getContext('2d'); b.fillStyle = '#fff'; b.fillRect(0, 0, 400, 400); kostasLogo(b, 200, 200, 400);
  const sm = L.createCanvas(34, 34), s = sm.getContext('2d'); s.drawImage(big, 0, 0, 34, 34);
  const im = s.getImageData(0, 0, 34, 34), r = rng(5); for (let i = 0; i < im.data.length; i += 4) for (let c = 0; c < 3; c++) im.data[i + c] = clamp(im.data[i + c] + (r() - .5) * 30, 0, 255);
  s.putImageData(im, 0, 0); return sm;
})();
function pixLogo(ctx, x, y, size) { ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(PIX, x - size / 2, y - size / 2, size, size); ctx.restore(); }

// ---------- scenes ----------
function sA(ctx, lt) { // phone: logo arrives + zoom
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 50, edge: false, shadow: false, scribble: '#BFD0F0' });
  ctx.save(); ctx.translate(540, 1060); ctx.rotate(-0.03);
  cut(ctx, rrPts(-360, -700, 720, 1400, 70), C.navy, { seed: 51, amp: 3, sx: 14, sy: 18 });
  const scr = rrPts(-330, -665, 660, 1330, 46);
  cut(ctx, scr, '#E6EEFB', { seed: 52, amp: 2, edge: false, shadow: false });
  ctx.save(); L.path(ctx, scr); ctx.clip();
  L.scribble(ctx, [-330, -560, 330, 665], '#D3E0F6', 9);
  cut(ctx, rectPts(-340, -670, 680, 160), C.navy, { seed: 53, amp: 1, edge: false, shadow: false });
  cut(ctx, circlePts(-250, -575, 38), '#7A3E1D', { seed: 54, amp: 1, edgeW: 4, shadow: false });
  txt(ctx, 'Κώστας – Καφέ', -190, -592, { font: 'bold 36px Round', color: '#fff', align: 'left' });
  txt(ctx, 'online', -190, -548, { font: '26px Round', color: C.sky, align: 'left' });
  // image message
  const zoom = easeInOut(prog(lt, 1.75, 2.9));
  pop(ctx, lt, 0.25, 0, 0, () => {
    cut(ctx, rrPts(-290, -440, 420, 470, 26), '#fff', { seed: 55, amp: 2, edgeW: 6 });
    if (zoom <= 0) pixLogo(ctx, -80, -228, 380);
    txt(ctx, 'IMG-2026-0923.jpg · 14 KB', -270, 0, { font: '22px Round', color: '#8A94A8', align: 'left' });
  });
  pop(ctx, lt, 0.8, 0, 0, () => msgBubble(ctx, -290, 70, 470, 100, 'Το λογότυπο :)', { seed: 56 }));
  if (zoom > 0) { const sz = lerp(380, 3200, zoom); pixLogo(ctx, lerp(-80, 0, zoom), lerp(-228, -80, zoom), sz); }
  ctx.restore();
  // pinch fingers
  if (lt > 1.55 && lt < 3.0) { const k = easeInOut(prog(lt, 1.7, 2.6)), a = lerp(40, 330, k); reach(ctx, -80 - a * 0.5, -228 - a * 0.5, 260, 1150, { seed: 60, hand: 'point' }); reach(ctx, -80 + a * 0.5, -228 + a * 0.5, 240, 900, { seed: 70, hand: 'point' }); }
  ctx.restore();
  stamp(ctx, lt, 2.55, 540, 1500, '80 pixel', -0.08);
  if (lt > 2.4) { const k = easeOut(prog(lt, 2.4, 2.8)); stratos(ctx, 880, lerp(2500, 1650, k), 0.8, { seed: 1000, legs: false, arms: [0.1, 0.1], mouth: lipsync(VO, 'shock'), eyes: 'shock', brows: 1.2, look: -10 }); }
  caption(ctx, 'Ο πελάτης μου στέλνει το λογότυπο... από WhatsApp.', lt, 0.05);
  seriesTag(ctx, lt, 'Ο πελάτης είπε... #1', 800, 60);
}
function sB(ctx, lt) { // messages keep coming, eye twitch, coffee shaking
  wallShelf(ctx);
  // clock
  cut(ctx, circlePts(900, 760, 80), '#fff', { seed: 60, amp: 2 }); ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (const [len, sp] of [[56, 6], [38, 0.5]]) { const a = lt * sp; ctx.beginPath(); ctx.moveTo(900, 760); ctx.lineTo(900 + Math.sin(a) * len, 760 - Math.cos(a) * len); ctx.stroke(); } ctx.restore();
  const tw = lt > 1.5 ? Math.sin(lt * 60) * 6 : 0;
  stratos(ctx, 540, 1250, 0.95, { seed: 1000, legs: false, arms: [0.15, 0.15], mouth: lipsync(VO, 'flat'), eyes: lt > 1.5 && Math.sin(lt * 30) > 0 ? 'tired' : 'shock', brows: lt > 1.5 ? -0.4 : 1, look: tw });
  cut(ctx, rectPts(-40, 1520, W + 80, 500), C.paper, { seed: 61, scribble: '#E3DCCB' });
  cut(ctx, rectPts(-40, 1500, W + 80, 40), C.sky, { seed: 62, amp: 2, edgeW: 6 });
  const shake = lt > 1.0 ? Math.sin(lt * 70) * 5 : 0;
  ctx.save(); ctx.translate(820 + shake, 1430); ctx.rotate(shake * 0.01);
  cut(ctx, rrPts(-60, -80, 120, 140, 16), C.navy, { seed: 63, amp: 1.5, edgeW: 6 }); txt(ctx, 'S', 0, -8, { font: '52px Brand', color: '#fff' });
  ctx.strokeStyle = C.navy; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(66, -20, 26, -1.3, 1.3); ctx.stroke(); ctx.restore();
  pop(ctx, lt, 0.3, 90, 620, () => msgBubble(ctx, 0, 0, 640, 110, 'Λίγο πιο... μοντέρνο;', { seed: 64, time: '21:48' }), -0.03);
  pop(ctx, lt, 1.2, 150, 790, () => msgBubble(ctx, 0, 0, 640, 110, 'Για αύριο το θέλουμε!', { seed: 65, time: '21:48' }), 0.03);
  caption(ctx, 'Και φυσικά... το θέλει για αύριο.', lt, 0.05);
}
function sC(ctx, lt) { // ENHANCE spam -> Minecraft hoodie
  if (lt < 1.3) {
    cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.navy, { seed: 70, edge: false, shadow: false, scribble: '#1B2D62' });
    cut(ctx, rrPts(120, 380, 840, 600, 30), '#2A3550', { seed: 71, amp: 3 });
    const flash = lt > 0.1 && (Math.floor(lt * 10) % 3 === 0);
    cut(ctx, rrPts(150, 410, 780, 540, 16), flash ? '#fff' : C.pale, { seed: 72, amp: 1.5, edge: false, shadow: false });
    pixLogo(ctx, 540, 680, 420);
    cut(ctx, rectPts(500, 980, 80, 90), '#2A3550', { seed: 73, amp: 2 }); cut(ctx, rrPts(380, 1060, 320, 40, 16), '#2A3550', { seed: 74, amp: 2 });
    const presses = Math.floor(lt * 7.5), down = (lt * 7.5) % 1 < 0.45;
    cut(ctx, rrPts(240, 1230, 600, 170, 85), '#B8262F', { seed: 75, amp: 3, sy: down ? 3 : 14 });
    txt(ctx, 'ENHANCE', 540, 1318, { font: '72px Brand', color: '#fff' });
    reach(ctx, down ? 790 : 810, down ? 1330 : 1260, 380, 700, { seed: 76, hand: 'point' });
    pop(ctx, lt, 0.2, 880, 1110, () => { cut(ctx, circlePts(0, 0, 86, 70, 24), '#fff', { seed: 77, amp: 3 }); txt(ctx, `x${Math.max(1, presses)}`, 0, 2, { font: 'bold 64px Round', color: C.navy }); }, 0.1);
  } else {
    cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 78, edge: false, shadow: false, scribble: '#BFD0F0' });
    const k = spring(prog(lt, 1.3, 1.8));
    ctx.save(); ctx.translate(540, 900); ctx.scale(Math.max(0.2, k), Math.max(0.2, k));
    hoodie(ctx, 0, 0, 1.35, 0, { logo: false, seed: 3600 }); pixLogo(ctx, 0, -20 * 1.35, 300); ctx.restore();
    stamp(ctx, lt, 1.75, 600, 1330, 'MINECRAFT EDITION', -0.06, '#3E9B4F');
    stratos(ctx, 190, lerp(2400, 1700, easeOut(prog(lt, 1.5, 1.9))), 0.7, { seed: 1000, legs: false, arms: [0.1, 0.1], mouth: lipsync(VO, 'flat'), eyes: 'tired', brows: -0.3, look: 12, blink: blinkNow() });
  }
  caption(ctx, 'Αν το τυπώσω έτσι... θα βγει Minecraft.', lt, 0.05);
}
function sD(ctx, lt) { // chalkboard tip
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 80, edge: false, shadow: false, scribble: '#BFD0F0' });
  cut(ctx, rectPts(40, 360, 1000, 900), '#C9A56A', { seed: 81, amp: 3 });
  cut(ctx, rectPts(70, 390, 940, 840), '#1F3A34', { seed: 82, amp: 2, edge: false, shadow: false, scribble: '#2C4A43' });
  txt(ctx, 'JPG / WhatsApp', 300, 470, { font: '52px Hand', color: '#fff' });
  txt(ctx, 'VECTOR', 780, 470, { font: '52px Hand', color: '#fff' });
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 440); ctx.lineTo(545, 1180); ctx.stroke();
  const g = easeInOut(prog(lt, 3.5, 4.8)), sz = lerp(220, 420, g);
  ctx.save(); ctx.beginPath(); ctx.rect(75, 520, 460, 700); ctx.clip(); pixLogo(ctx, 300, 820, sz); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(550, 520, 455, 700); ctx.clip(); kostasLogo(ctx, 780, 820, sz); ctx.restore();
  if (lt > 4.8) {
    pop(ctx, lt, 4.8, 300, 1130, () => { ctx.strokeStyle = '#FF6B6B'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(40, 40); ctx.moveTo(40, -40); ctx.lineTo(-40, 40); ctx.stroke(); });
    pop(ctx, lt, 4.95, 780, 1130, () => check(ctx, 0, 0, 3, '#7CE08A'));
  }
  [['PDF', 2.2], ['SVG', 2.5], ['AI', 2.8]].forEach(([w, st], i) => pop(ctx, lt, st, 560 + i * 170, 1420, () => { cut(ctx, rrPts(-72, -52, 144, 104, 24), i === 1 ? BRAND : C.navy, { seed: 83 + i, amp: 2, edgeW: 7 }); txt(ctx, w, 0, 4, { font: '52px Brand', color: '#fff' }); }, (i - 1) * 0.06));
  stratos(ctx, 200, 1500, 0.72, { seed: 1000, legs: false, arms: [0.1, 2.3], handR: 'point', mouth: lipsync(VO, 'smile'), eyes: 'dot', brows: 0.6, look: 10, blink: blinkNow() });
  pop(ctx, lt, 0.0, 170, 300, () => { cut(ctx, rrPts(-110, -52, 220, 104, 22), '#F4D98A', { seed: 88, amp: 3 }); txt(ctx, 'TIP', 0, 4, { font: '64px Brand', color: C.navy }); }, -0.08);
  caption(ctx, lt < 3.4 ? 'Ζήτα από τον γραφίστα σου το λογότυπο σε vector.' : 'Μεγαλώνει όσο θες, χωρίς να χαλάσει.', lt, 0.05);
}
function sE(ctx, lt) { // call-out to designers + loop gag
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), BRAND, { seed: 90, edge: false, shadow: false, scribble: '#4A70F5' });
  const facepalm = lt > 2.85;
  stratos(ctx, 540, 1220, 1.0, { seed: 1000, legs: false, arms: [0.12, facepalm ? -2.65 : 0.55], handR: facepalm ? 'open' : 'point', armRFront: facepalm, mouth: lipsync(VO, facepalm ? 'flat' : 'grin'), eyes: facepalm ? 'tired' : 'dot', brows: facepalm ? -0.3 : 0.7, blink: blinkNow() });
  pop(ctx, lt, 0.15, 540, 560, () => { cut(ctx, [[-40, 110], [30, 110], [-10, 190]], C.paper, { seed: 91, amp: 2 }); cut(ctx, rrPts(-420, -130, 840, 260, 90), C.paper, { seed: 92, amp: 3 }); txt(ctx, 'Γραφίστες,', 0, -45, { font: 'bold 70px Round', color: C.navy }); txt(ctx, 'εμφανιστείτε στα σχόλια!', 0, 48, { font: '62px Hand', color: BRAND }); });
  for (let i = 0; i < 5; i++) { const st = 0.8 + i * 0.3, k = prog(lt, st, st + 1.6); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.globalAlpha = 1 - easeIn(k); const x = 820 + Math.sin(i * 2 + lt * 3) * 60 - (i % 2) * 90, y = 1700 - k * 700;
    cut(ctx, [[x - 20, y + 30], [x + 10, y + 30], [x - 30, y + 60]], '#fff', { seed: 93 + i, amp: 1, edgeW: 4 }); cut(ctx, rrPts(x - 70, y - 40, 140, 80, 30), '#fff', { seed: 98 + i, amp: 2, edgeW: 5 });
    ctx.fillStyle = C.navy; for (const d of [-30, 0, 30]) { ctx.beginPath(); ctx.arc(x + d, y, 8, 0, 7); ctx.fill(); } ctx.restore(); }
  if (lt > 2.4) {
    const k = easeOut(prog(lt, 2.4, 2.75)), buzz = Math.sin(lt * 80) * 4 * (lt < 2.9 ? 1 : 0);
    ctx.save(); ctx.translate(lerp(-400, 230, k) + buzz, 1480); ctx.rotate(-0.12);
    cut(ctx, rrPts(-150, -250, 300, 500, 36), C.navy, { seed: 105, amp: 2 }); cut(ctx, rrPts(-130, -225, 260, 450, 24), '#E6EEFB', { seed: 106, amp: 1.5, edge: false, shadow: false });
    ctx.restore();
    pop(ctx, lt, 2.6, 400, 1260, () => msgBubble(ctx, -300, -60, 640, 120, 'Σου στέλνω και φωτό της ταμπέλας!', { seed: 107, fs: 34, time: '23:12' }), -0.04);
  }
  caption(ctx, 'Πείτε μου τις εμπειρίες σας.', lt, 0.05);
}


require('./render.js')({ name: 'ep01_whatsapp_logo', SCENES: [[sA, 4.2], [sB, 2.8], [sC, 3.0], [sD, 5.4], [sE, 3.6]], WIPES: 'all' });
