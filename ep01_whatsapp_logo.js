// ORGANIC «Ο πελάτης είπε...» #1 — Το λογότυπο από WhatsApp · host: Στράτος · v2: VO ElevenLabs «Stratos» + SFX · 24,9s
const L = require('./lib.js');
const { C, ST, W, H, cut, rectPts, rrPts, circlePts, starPts, txt, pop, caption, captionSeq, burst, check, rng, clamp, lerp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { S, stratos, handPos } = require('./stratos.js');
const { BRAND, hoodie, reach, sparkle, msgBubble, stamp, seriesTag, wallShelf } = require('./props.js');

// VO = vo/ep01_vo.mp3 @ 0,2s (ElevenLabs eleven_v3, φωνή «Stratos»). Το lip-sync πατάει στην ένταση του αρχείου (ST.VOENV).
// Χρονισμοί φράσεων (απόλυτοι, από silence detect) — για captions/cues:
// 0,30 Ο πελάτης μου στέλνει το λογότυπο... | 2,93 από WhatsApp. | 4,10 [sigh] Ογδόντα pixel. | 5,96 Και φυσικά... | 7,09 το θέλει για αύριο.
// 8,49 Αν το τυπώσω έτσι... | 10,07 θα βγει χάλια. | 11,28 Tip: ζήτα από τον γραφίστα σου το λογότυπο | 13,93 σε PDF, SVG ή AI.
// 16,54 Λέγεται vector, | 17,62 και μεγαλώνει όσο θες χωρίς να χαλάσει. (–20,04) | 20,49 Γραφίστες, εμφανιστείτε στα σχόλια και πείτε μου τις εμπειρίες σας. (–23,89)
const VO = [];

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
function sA(ctx, lt) { // 0–5,8 · phone: logo arrives → pinch-zoom → 80 pixel
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 50, edge: false, shadow: false, scribble: '#BFD0F0' });
  ctx.save(); ctx.translate(540, 1080); ctx.rotate(-0.03);
  cut(ctx, rrPts(-360, -620, 720, 1400, 70), C.navy, { seed: 51, amp: 3, sx: 14, sy: 18 });
  const scr = rrPts(-330, -585, 660, 1330, 46);
  cut(ctx, scr, '#E6EEFB', { seed: 52, amp: 2, edge: false, shadow: false });
  ctx.save(); L.path(ctx, scr); ctx.clip();
  L.scribble(ctx, [-330, -480, 330, 745], '#D3E0F6', 9);
  cut(ctx, rectPts(-340, -590, 680, 150), C.navy, { seed: 53, amp: 1, edge: false, shadow: false });
  cut(ctx, circlePts(-250, -505, 38), '#7A3E1D', { seed: 54, amp: 1, edgeW: 4, shadow: false });
  txt(ctx, 'Κώστας – Καφέ', -190, -522, { font: 'bold 36px Round', color: '#fff', align: 'left' });
  txt(ctx, 'online', -190, -478, { font: '26px Round', color: C.sky, align: 'left' });
  const zoom = easeInOut(prog(lt, 2.95, 3.95));
  pop(ctx, lt, 0.25, 0, 0, () => {
    cut(ctx, rrPts(-290, -380, 420, 470, 26), '#fff', { seed: 55, amp: 2, edgeW: 6 });
    if (zoom <= 0) pixLogo(ctx, -80, -168, 380);
    txt(ctx, 'IMG-2026-0923.jpg · 14 KB', -270, 60, { font: '22px Round', color: '#8A94A8', align: 'left' });
  });
  pop(ctx, lt, 0.85, 0, 0, () => msgBubble(ctx, -290, 130, 470, 100, 'Το λογότυπο :)', { seed: 56 }));
  if (zoom > 0) { const sz = lerp(380, 3200, zoom); pixLogo(ctx, lerp(-80, 0, zoom), lerp(-168, -40, zoom), sz); }
  ctx.restore();
  if (lt > 2.75 && lt < 4.1) { const k = easeInOut(prog(lt, 2.95, 3.85)), a = lerp(40, 330, k); reach(ctx, -80 - a * 0.5, -168 - a * 0.5, 260, 1150, { seed: 60, hand: 'point' }); reach(ctx, -80 + a * 0.5, -168 + a * 0.5, 280, 1150, { seed: 61, hand: 'point' }); }
  ctx.restore();
  stamp(ctx, lt, 4.9, 600, 1250, '80 pixel', -0.08);
  if (lt > 3.3) { const k = easeOut(prog(lt, 3.3, 3.7)); stratos(ctx, 230, lerp(2400, 1500, k), 0.8, { seed: 1000, legs: false, arms: [0.1, 0.1], mouth: lipsync(VO, 'shock'), eyes: 'shock', brows: 1.2, look: 10 }); }
  captionSeq(ctx, lt, [[0.05, 'Ο πελάτης μου στέλνει το λογότυπο...'], [2.85, '...από WhatsApp.'], [4.5, 'Ογδόντα pixel.']]);
  seriesTag(ctx, lt, 'Ο πελάτης είπε... #1');
}
function sB(ctx, lt) { // 5,8–8,25 · messages keep coming, eye twitch, coffee shaking
  wallShelf(ctx);
  cut(ctx, circlePts(880, 760, 80), '#fff', { seed: 60, amp: 2 }); ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (const [len, sp] of [[56, 6], [38, 0.5]]) { const a = lt * sp; ctx.beginPath(); ctx.moveTo(880, 760); ctx.lineTo(880 + Math.sin(a) * len, 760 - Math.cos(a) * len); ctx.stroke(); } ctx.restore();
  const tw = lt > 1.5 ? Math.sin(lt * 60) * 6 : 0;
  stratos(ctx, 540, 1250, 0.95, { seed: 1000, legs: false, arms: [0.15, 0.15], mouth: lipsync(VO, 'flat'), eyes: lt > 1.5 && Math.sin(lt * 30) > 0 ? 'tired' : 'shock', brows: lt > 1.5 ? -0.4 : 1, look: tw });
  cut(ctx, rectPts(-40, 1520, W + 80, 500), C.paper, { seed: 61, scribble: '#E3DCCB' });
  cut(ctx, rectPts(-40, 1500, W + 80, 40), C.sky, { seed: 62, amp: 2, edgeW: 6 });
  const shake = lt > 1.0 ? Math.sin(lt * 70) * 5 : 0;
  ctx.save(); ctx.translate(800 + shake, 1430); ctx.rotate(shake * 0.01);
  cut(ctx, rrPts(-60, -80, 120, 140, 16), C.navy, { seed: 63, amp: 1.5, edgeW: 6 }); txt(ctx, 'S', 0, -8, { font: '52px Brand', color: '#fff' });
  ctx.strokeStyle = C.navy; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(66, -20, 26, -1.3, 1.3); ctx.stroke(); ctx.restore();
  pop(ctx, lt, 0.25, 90, 560, () => msgBubble(ctx, 0, 0, 640, 110, 'Λίγο πιο... μοντέρνο;', { seed: 64, time: '21:48' }), -0.03);
  pop(ctx, lt, 1.35, 150, 720, () => msgBubble(ctx, 0, 0, 640, 110, 'Για αύριο το θέλουμε!', { seed: 65, time: '21:48' }), 0.03);
  caption(ctx, 'Και φυσικά... το θέλει για αύριο.', lt, 0.05);
}
const PRESS = [0.3, 0.55, 0.8, 1.05, 1.3];
function sC(ctx, lt) { // 8,25–11,1 · ENHANCE spam → φούτερ «ΧΑΛΙΑ»
  if (lt < 1.45) {
    cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.navy, { seed: 70, edge: false, shadow: false, scribble: '#1B2D62' });
    cut(ctx, rrPts(120, 520, 840, 560, 30), '#2A3550', { seed: 71, amp: 3 });
    const presses = PRESS.filter(p => lt >= p).length, down = PRESS.some(p => lt >= p && lt < p + 0.1);
    cut(ctx, rrPts(150, 550, 780, 500, 16), down ? '#fff' : C.pale, { seed: 72, amp: 1.5, edge: false, shadow: false });
    pixLogo(ctx, 540, 800, 400);
    cut(ctx, rectPts(500, 1080, 80, 70), '#2A3550', { seed: 73, amp: 2 }); cut(ctx, rrPts(380, 1140, 320, 36, 16), '#2A3550', { seed: 74, amp: 2 });
    cut(ctx, rrPts(240, 1230, 600, 170, 85), '#B8262F', { seed: 75, amp: 3, sy: down ? 3 : 14 });
    txt(ctx, 'ENHANCE', 540, 1318, { font: '72px Brand', color: '#fff' });
    reach(ctx, down ? 790 : 810, down ? 1330 : 1260, 380, 700, { seed: 76, hand: 'point' });
    if (presses) pop(ctx, lt, PRESS[0], 820, 1040, () => { cut(ctx, circlePts(0, 0, 80, 66, 24), '#fff', { seed: 77, amp: 3 }); txt(ctx, `x${presses}`, 0, 2, { font: 'bold 60px Round', color: C.navy }); }, 0.1);
  } else {
    cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 78, edge: false, shadow: false, scribble: '#BFD0F0' });
    const k = spring(prog(lt, 1.45, 1.95));
    ctx.save(); ctx.translate(540, 900); ctx.scale(Math.max(0.2, k), Math.max(0.2, k));
    hoodie(ctx, 0, 0, 1.35, 0, { logo: false, seed: 3600 }); pixLogo(ctx, 0, -20 * 1.35, 300); ctx.restore();
    stamp(ctx, lt, 2.0, 640, 1300, 'ΧΑΛΙΑ', -0.07, '#B8262F', 96);
    stratos(ctx, 200, lerp(2400, 1540, easeOut(prog(lt, 1.6, 2.0))), 0.7, { seed: 1000, legs: false, arms: [0.1, 0.1], mouth: lipsync(VO, 'flat'), eyes: 'tired', brows: -0.3, look: 12, blink: blinkNow() });
  }
  captionSeq(ctx, lt, [[0.05, 'Αν το τυπώσω έτσι...'], [1.8, '...θα βγει χάλια.']]);
}
const BADGES = [['PDF', 2.85], ['SVG', 3.65], ['AI', 4.45]];
function sD(ctx, lt) { // 11,1–20,25 · chalkboard tip: JPG ✗ vs VECTOR ✓
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), C.pale, { seed: 80, edge: false, shadow: false, scribble: '#BFD0F0' });
  cut(ctx, rectPts(40, 540, 1000, 760), '#C9A56A', { seed: 81, amp: 3 });
  cut(ctx, rectPts(70, 570, 940, 700), '#1F3A34', { seed: 82, amp: 2, edge: false, shadow: false, scribble: '#2C4A43' });
  txt(ctx, 'JPG / WhatsApp', 300, 660, { font: '52px Hand', color: '#fff' });
  pop(ctx, lt, 5.3, 780, 660, () => txt(ctx, 'VECTOR', 0, 0, { font: '60px Hand', color: '#F4D98A' }));
  if (lt < 5.3) txt(ctx, 'VECTOR', 780, 660, { font: '52px Hand', color: '#fff' });
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 610); ctx.lineTo(545, 1250); ctx.stroke();
  const g = easeInOut(prog(lt, 6.4, 8.0)), sz = lerp(200, 400, g);
  ctx.save(); ctx.beginPath(); ctx.rect(75, 680, 460, 580); ctx.clip(); pixLogo(ctx, 300, 950, sz); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(550, 680, 455, 580); ctx.clip(); kostasLogo(ctx, 780, 950, sz); ctx.restore();
  pop(ctx, lt, 8.1, 300, 1190, () => { ctx.strokeStyle = '#FF6B6B'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(40, 40); ctx.moveTo(40, -40); ctx.lineTo(-40, 40); ctx.stroke(); });
  pop(ctx, lt, 8.35, 780, 1190, () => check(ctx, 0, 0, 3, '#7CE08A'));
  BADGES.forEach(([w, st], i) => pop(ctx, lt, st, 480 + i * 165, 1385, () => { cut(ctx, rrPts(-70, -50, 140, 100, 24), i === 1 ? BRAND : C.navy, { seed: 83 + i, amp: 2, edgeW: 7 }); txt(ctx, w, 0, 4, { font: '48px Brand', color: '#fff' }); }, (i - 1) * 0.06));
  pop(ctx, lt, 0.15, 930, 548, () => { cut(ctx, rrPts(-100, -48, 200, 96, 22), '#F4D98A', { seed: 88, amp: 3 }); txt(ctx, 'TIP', 0, 4, { font: '58px Brand', color: C.navy }); }, -0.08);
  stratos(ctx, 190, 1500, 0.72, { seed: 1000, legs: false, arms: [0.1, 2.3], handR: 'point', mouth: lipsync(VO, 'smile'), eyes: 'dot', brows: 0.6, look: 10, blink: blinkNow() });
  captionSeq(ctx, lt, [[0.05, 'Tip: ζήτα από τον γραφίστα σου'], [1.5, '...το λογότυπο'], [2.8, 'σε PDF, SVG ή AI.'], [5.3, 'Λέγεται vector.'], [6.3, 'Μεγαλώνει όσο θες, χωρίς να χαλάσει.']]);
}
function sE(ctx, lt) { // 20,25–24,9 · call-out σε γραφίστες + loop gag
  cut(ctx, rectPts(-40, -40, W + 80, H + 80), BRAND, { seed: 90, edge: false, shadow: false, scribble: '#4A70F5' });
  const facepalm = lt > 3.85;
  stratos(ctx, 540, 1220, 1.0, { seed: 1000, legs: false, arms: [0.12, facepalm ? -2.65 : 2.3], handR: facepalm ? 'open' : 'point', armRFront: facepalm, mouth: lipsync(VO, facepalm ? 'flat' : 'grin'), eyes: facepalm ? 'tired' : 'dot', brows: facepalm ? -0.3 : 0.7, blink: blinkNow() });
  pop(ctx, lt, 0.15, 540, 620, () => { cut(ctx, [[-40, 110], [30, 110], [-10, 190]], C.paper, { seed: 91, amp: 2 }); cut(ctx, rrPts(-420, -130, 840, 260, 90), C.paper, { seed: 92, amp: 3 }); txt(ctx, 'Γραφίστες,', 0, -45, { font: 'bold 70px Round', color: C.navy }); txt(ctx, 'εμφανιστείτε στα σχόλια!', 0, 48, { font: '62px Hand', color: BRAND }); });
  for (let i = 0; i < 5; i++) { const st = 0.8 + i * 0.35, k = prog(lt, st, st + 1.6); if (k <= 0 || k >= 1) continue; ctx.save(); ctx.globalAlpha = 1 - easeIn(k); const x = 820 + Math.sin(i * 2 + lt * 3) * 60 - (i % 2) * 90, y = 1700 - k * 700;
    cut(ctx, [[x - 20, y + 30], [x + 10, y + 30], [x - 30, y + 60]], '#fff', { seed: 93 + i, amp: 1, edgeW: 4 }); cut(ctx, rrPts(x - 70, y - 40, 140, 80, 30), '#fff', { seed: 98 + i, amp: 2, edgeW: 5 });
    ctx.fillStyle = C.navy; for (const d of [-30, 0, 30]) { ctx.beginPath(); ctx.arc(x + d, y, 8, 0, 7); ctx.fill(); } ctx.restore(); }
  if (lt > 3.0) {
    const k = easeOut(prog(lt, 3.0, 3.35)), buzz = Math.sin(lt * 80) * 4 * (lt < 3.6 ? 1 : 0);
    ctx.save(); ctx.translate(lerp(-400, 230, k) + buzz, 1480); ctx.rotate(-0.12);
    cut(ctx, rrPts(-150, -250, 300, 500, 36), C.navy, { seed: 105, amp: 2 }); cut(ctx, rrPts(-130, -225, 260, 450, 24), '#E6EEFB', { seed: 106, amp: 1.5, edge: false, shadow: false });
    ctx.restore();
    pop(ctx, lt, 3.3, 420, 1250, () => msgBubble(ctx, -300, -60, 640, 120, 'Σου στέλνω και φωτό της ταμπέλας!', { seed: 107, fs: 34, time: '23:12' }), -0.04);
  }
  captionSeq(ctx, lt, [[0.05, 'Γραφίστες, εμφανιστείτε στα σχόλια'], [1.9, 'και πείτε μου τις εμπειρίες σας.']]);
}

// SFX (απόλυτοι χρόνοι) — τα wipes παίρνουν auto whoosh
const A = 0, B = 5.8, Cc = 8.25, D = 11.1, E = 20.25;
const SFX = [
  [A + 0.25, 'sent', { note: 'έρχεται η εικόνα στο WhatsApp' }],
  [A + 0.85, 'pop', { gain: 0.7, note: 'bubble «Το λογότυπο :)»' }],
  [A + 2.95, 'zoom', { dur: 1.0, note: 'pinch-zoom στα pixel' }],
  [A + 3.3, 'boing', { gain: 0.6, pan: -0.4, note: 'σκάει ο Στράτος' }],
  [A + 4.9, 'stamp', { note: '«80 pixel»' }],
  [B + 0.25, 'pop', { note: 'bubble «μοντέρνο;»' }],
  [B + 0.4, 'ticks', { count: 8, gain: 0.5, pan: 0.5, note: 'ρολόι τρέχει' }],
  [B + 1.35, 'pop', { seed: 2, note: 'bubble «για αύριο!»' }],
  ...PRESS.map((p, i) => [Cc + p, 'click', { seed: i, gain: 0.9, note: i ? '' : 'ENHANCE ×5' }]),
  [Cc + 1.45, 'boing', { note: 'φούτερ' }],
  [Cc + 2.0, 'stamp', { seed: 3, note: '«ΧΑΛΙΑ»' }],
  [D + 0.15, 'pop', { note: 'TIP' }],
  ...BADGES.map(([w, st], i) => [D + st, 'pop', { seed: 10 + i, gain: 0.8, note: w }]),
  [D + 5.3, 'blip', { note: 'VECTOR' }],
  [D + 6.4, 'zoom', { dur: 1.6, gain: 0.6, note: 'τα λογότυπα μεγαλώνουν' }],
  [D + 8.1, 'thud', { note: '✗ JPG' }],
  [D + 8.35, 'ding', { note: '✓ vector' }],
  [E + 0.15, 'pop', { note: 'bubble «Γραφίστες»' }],
  ...[0, 1, 2, 3, 4].map(i => [E + 0.8 + i * 0.35, 'blip', { seed: 20 + i, gain: 0.5, pan: 0.5, note: i ? '' : 'σχόλια' }]),
  [E + 3.0, 'beep', { count: 2, note: 'κινητό χτυπάει' }],
  [E + 3.3, 'sent', { seed: 2, note: '«φωτό της ταμπέλας!»' }],
  [E + 3.85, 'thud', { seed: 4, note: 'facepalm' }],
];

require('./render.js')({ name: 'ep01_whatsapp_logo', SCENES: [[sA, 5.8], [sB, 2.45], [sC, 2.85], [sD, 9.15], [sE, 4.65]], WIPES: 'all', SFX, VO_FILE: 'vo/ep01_vo.mp3', VO_AT: 0.2 });
