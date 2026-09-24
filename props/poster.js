// props/poster.js — αφίσες (ad_afisa): αφίσα-χαρτί (sharp / θολή), σωλήνας
const L = require('../lib.js');
const { C, cut, rectPts, rrPts, circlePts, txt, lerp } = L;

// posterArt: demo «φωτογραφία πελάτη» (τοπίο, πρωτότυπο) σε offscreen canvas 500×700 · sharp + blur (θολή, από μικρή ανάλυση)
const POSTER = (() => {
  const w = 500, h = 700, c = L.createCanvas(w, h), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, h * 0.62); g.addColorStop(0, '#F3B86A'); g.addColorStop(0.55, '#F6D7A8'); g.addColorStop(1, C.pale); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#FFF2D6'; x.beginPath(); x.arc(330, 300, 70, 0, 7); x.fill();
  const hill = (col, pts, base) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, base); for (const [px, py] of pts) x.lineTo(px, py); x.lineTo(w, base); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill(); };
  hill(C.sky, [[0, 380], [90, 300], [180, 360], [290, 250], [400, 340], [500, 290]], 420);
  hill(C.mid, [[0, 430], [120, 360], [230, 420], [360, 330], [500, 410]], 460);
  hill(C.navy, [[0, 470], [160, 440], [300, 480], [500, 450]], 490);
  x.fillStyle = '#6F93D8'; x.fillRect(0, 490, w, 210); x.fillStyle = 'rgba(255,242,214,0.55)'; for (let i = 0; i < 6; i++) x.fillRect(270 + (i % 2) * 20, 505 + i * 22, 120 - i * 14, 6);
  x.fillStyle = C.navy; x.beginPath(); x.moveTo(130, 600); x.lineTo(250, 600); x.lineTo(228, 628); x.lineTo(150, 628); x.closePath(); x.fill(); x.fillRect(188, 530, 5, 70);
  x.fillStyle = C.paper; x.beginPath(); x.moveTo(193, 535); x.lineTo(240, 592); x.lineTo(193, 592); x.closePath(); x.fill();
  x.strokeStyle = C.navy; x.lineWidth = 4; x.lineCap = 'round'; for (const [bx, by] of [[110, 150], [150, 175], [200, 130]]) { x.beginPath(); x.moveTo(bx - 14, by); x.quadraticCurveTo(bx - 7, by - 9, bx, by); x.quadraticCurveTo(bx + 7, by - 9, bx + 14, by); x.stroke(); }
  // θολή = μικρή ανάλυση (JPG από social) που μεγάλωσε: downscale + gaussian blur + ξεπλυμένα χρώματα
  const sm = L.createCanvas(60, 84); sm.getContext('2d').drawImage(c, 0, 0, 60, 84);
  const blur = L.createCanvas(w, h), b = blur.getContext('2d'); b.drawImage(sm, 0, 0, w, h);
  const b2 = L.createCanvas(w, h), bx = b2.getContext('2d'); bx.fillStyle = C.pale; bx.fillRect(0, 0, w, h); bx.filter = 'blur(9px)'; bx.drawImage(blur, 0, 0); bx.filter = 'none';
  b.clearRect(0, 0, w, h); b.drawImage(b2, 0, 0); b.fillStyle = 'rgba(247,244,236,0.16)'; b.fillRect(0, 0, w, h);
  return { sharp: c, blur, w, h };
})();
// poster: αφίσα-χαρτί. (cx, top) = πάνω-κέντρο · k = πόσο έχει ξετυλιχτεί (0–1) · dir 'down' (ρολό κάτω) | 'left' (ρολό δεξιά, τυλίγεται προς τα αριστερά)
function poster(ctx, cx, top, w, h, o = {}) {
  const k = o.k ?? 1, dir = o.dir || 'down', img = o.mode === 'blur' ? POSTER.blur : POSTER.sharp, m = o.margin ?? 12, seed = o.seed || 7000;
  ctx.save(); ctx.translate(cx, top); ctx.rotate(o.rot || 0);
  const vw = dir === 'left' ? w * k : w, vh = dir === 'down' ? h * k : h, x0 = -w / 2;
  if (k > 0.02) {
    const sh = cut(ctx, rectPts(x0, 0, vw, vh), '#fff', { seed, amp: 2, edgeW: 5, edge: false });
    ctx.save(); L.path(ctx, sh); ctx.clip(); ctx.drawImage(img, x0 + m, m, w - 2 * m, h - 2 * m); ctx.restore();
  }
  if (k < 0.999) { // ρολό
    const r = o.roll || 22;
    if (dir === 'down') { cut(ctx, rrPts(x0 - 4, vh - r, w + 8, r * 2, r), '#F1EEE6', { seed: seed + 1, amp: 1.5, edgeW: 4 }); ctx.fillStyle = 'rgba(16,26,51,0.12)'; ctx.fillRect(x0, vh + r * 0.35, w, r * 0.5); }
    else { cut(ctx, rrPts(x0 + vw - r, -4, r * 2, h + 8, r), '#F1EEE6', { seed: seed + 1, amp: 1.5, edgeW: 4 }); ctx.fillStyle = 'rgba(16,26,51,0.12)'; ctx.fillRect(x0 + vw + r * 0.35, 0, r * 0.5, h); }
  }
  if (o.tape) for (const sx of [-1, 1]) cut(ctx, rectPts(sx * (w / 2 - 20) - 45, -22, 90, 44), 'rgba(220,231,250,0.85)', { seed: seed + 3 + sx, amp: 2, edge: false, shadow: false });
  ctx.restore();
}
const TUBE = '#C9A274', TUBED = '#A9824F';
// posterTube: κάθετος χάρτινος σωλήνας. (x, bottom) · h ύψος · o.cap = 0–1 (καπάκι μπαίνει) · o.back → μόνο το «στόμιο» (ζωγράφισε πριν από ό,τι μπαίνει μέσα)
function posterTube(ctx, x, bottom, h, o = {}) {
  const r = o.r || 62, top = bottom - h, seed = o.seed || 7100;
  ctx.save(); ctx.translate(x, bottom); ctx.rotate(o.rot || 0); ctx.translate(-x, -bottom);
  if (o.back) { cut(ctx, circlePts(x, top, r, r * 0.32, 24), '#5C4526', { seed: seed + 5, amp: 1, edgeW: 4, shadow: false }); ctx.restore(); return; }
  const body = cut(ctx, [[x - r, top], [x + r, top], [x + r, bottom - 10], [x, bottom + 6], [x - r, bottom - 10]], TUBE, { seed, amp: 1.5, edgeW: 5 });
  ctx.save(); L.path(ctx, body); ctx.clip(); ctx.strokeStyle = TUBED; ctx.lineWidth = 3; for (let i = -6; i < h / 40 + 4; i++) { ctx.beginPath(); ctx.moveTo(x - r, top + i * 40); ctx.lineTo(x + r, top + i * 40 + 70); ctx.stroke(); } ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - r * 0.55, top, r * 0.25, h); ctx.restore();
  cut(ctx, rrPts(x - r + 8, top + h * 0.42, r * 2 - 16, 96, 10), C.paper, { seed: seed + 2, amp: 1, edgeW: 4, shadow: false });
  txt(ctx, 'S', x, top + h * 0.42 + 50, { font: '58px Brand', color: C.navy });
  cut(ctx, rrPts(x - r - 4, bottom - 44, r * 2 + 8, 40, 10), C.navy, { seed: seed + 3, amp: 1, edgeW: 4 });
  const cap = o.cap ?? 1;
  if (cap > 0) { const cy = top - lerp(260, 0, cap); cut(ctx, rrPts(x - r - 6, cy - 22, r * 2 + 12, 48, 12), C.navy, { seed: seed + 4, amp: 1, edgeW: 4 }); }
  else cut(ctx, circlePts(x, top, r, r * 0.32, 24), '#5C4526', { seed: seed + 5, amp: 1, edgeW: 4, shadow: false });
  ctx.restore();
}

module.exports = { POSTER, poster, posterTube };
