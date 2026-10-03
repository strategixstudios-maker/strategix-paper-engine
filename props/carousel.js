// props/carousel.js — κάρτες carousel 4:5 (ka01 → engine στο ka02): θέματα χαρτί / μπλε, τίτλος 2 χρωμάτων, μικρό κείμενο, ετικέτα, αριθμός λίστας, φωτογραφία «κομμένη από κατάλογο», χάρτινα εικονίδια
// Runner (φόντο, υφή, σήμα, βελάκι, CLI, lint) → carousel.js · κανόνες → STYLE_GUIDE §7 Carousel
const L = require('../lib.js');
const { C, cut, rectPts, circlePts, path, txt } = L;
const { BRAND } = require('./core.js');
const { drawLogo } = require('./photo.js');

// διαστάσεις κάρτας · X0 = αριστερό περιθώριο κειμένου · MAXW = πλάτος κειμένου (τίτλος εξωφύλλου μέσα στο x 70–1010: το grid του IG κόβει το 4:5 σε 3:4)
const CARD = { W: 1080, H: 1350, X0: 70, MAXW: 940 };
// θέμα ανά φόντο (κάρτα 1 = χαρτί, μετά εναλλάξ μπλε / χαρτί): bg · scrib (υφή φόντου) · ink τίτλος · acc έμφαση (brand blue στο χαρτί, gold στο μπλε) · sub μικρό κείμενο · mark σήμα κάτω · λευκό = καθαρό #FFFFFF
const CARD_TH = {
  paper: { key: 'paper', bg: C.paper, scrib: '#E9E3D3', ink: C.navy, acc: BRAND, sub: C.blue, mark: C.navy, arrow: BRAND, dark: false },
  blue: { key: 'blue', bg: BRAND, scrib: '#3B63F6', ink: C.white, acc: C.gold, sub: C.white, mark: C.white, arrow: C.gold, dark: true },
};

// ---------- κείμενο ----------
// τίτλος με **έμφαση** σε 2 χρώματα (Geologica) → κάτω y · με \n οι γραμμές μένουν όπως γράφτηκαν (μικραίνει ώσπου να χωράει η πιο φαρδιά) · χωρίς \n σπάει μόνος του (o.maxL γραμμές) · o: size (130) · font ('Geo') · maxW · lh · all (όλο σε χρώμα έμφασης)
function cardTitle(ctx, s, x, y, th, o = {}) {
  const maxW = o.maxW || CARD.MAXW, font = o.font || 'Geo', fixed = s.includes('\n');
  const toks = l => { const out = [];                                                 // λέξη = parts [{ w, a }] · κομμάτι χωρίς κενό μπροστά (στίξη μετά από **…**) κολλάει στην προηγούμενη λέξη (ka03)
    let glue = false; for (const seg of l.split(/(\*\*[^*]+\*\*)/).filter(Boolean)) { const a = seg.startsWith('**'), s2 = seg.replace(/\*\*/g, '');
      s2.split(' ').forEach((w, i) => { if (!w) return; if (!i && glue && out.length) out[out.length - 1].parts.push({ w, a }); else out.push({ parts: [{ w, a }] }); }); glue = !s2.endsWith(' '); }
    return out; };
  let size = o.size || 130, R;
  const lay = () => {
    ctx.font = `${size}px ${font}`; const sp = ctx.measureText(' ').width * 0.9, lines = [];
    for (const l of s.split('\n')) { let cur = [], cw = 0; for (const t of toks(l)) { const tw = t.parts.reduce((a, p) => a + ctx.measureText(p.w).width, 0); if (!fixed && cur.length && cw + sp + tw > maxW) { lines.push(cur); cur = []; cw = 0; } cw += (cur.length ? sp : 0) + tw; cur.push({ ...t, tw }); } lines.push(cur); }
    return { lines, sp, wide: Math.max(...lines.map(l => l.reduce((a, t) => a + t.tw, 0) + (l.length - 1) * sp)) };
  };
  for (R = lay(); size > 40 && (R.lines.length > (o.maxL || 9) || R.wide > maxW); R = lay()) size -= 4;
  const lh = size * (o.lh || 1.06);
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.font = `${size}px ${font}`;
  R.lines.forEach((l, i) => { let cx = x; for (const t of l) { let px = cx; for (const p of t.parts) { ctx.fillStyle = p.a || o.all ? th.acc : th.ink; ctx.fillText(p.w, px, y + size * 0.78 + i * lh); px += ctx.measureText(p.w).width; } cx += t.tw + R.sp; } });
  ctx.restore();
  return y + R.lines.length * lh;
}
// μικρό κείμενο κάτω από τον τίτλο (GeoS, σπάει μόνο του) → κάτω y · o: size (48) · maxW
function cardSub(ctx, s, x, y, th, o = {}) {
  const size = o.size || 48; ctx.save(); ctx.font = `${size}px GeoS`; ctx.fillStyle = th.sub; ctx.textBaseline = 'alphabetic';
  const lines = L.wrap(ctx, s, o.maxW || CARD.MAXW); lines.forEach((l, i) => ctx.fillText(l, x, y + size * 0.8 + i * size * 1.22)); ctx.restore();
  return y + lines.length * size * 1.22;
}
// χάρτινη ετικέτα (όνομα + κωδικός προϊόντος, μορφές αρχείου «JPG · PNG»…) · (x, y) = πάνω αριστερά · → πλάτος · o: size (40) · seed · col / ink (αντί για τα χρώματα του θέματος)
function cardTag(ctx, s, x, y, rot, th, o = {}) {
  const size = o.size || 40; ctx.save(); ctx.font = `${size}px GeoX`; const w = ctx.measureText(s).width + size * 1.1, h = size * 1.7;
  ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, rectPts(0, 0, w, h), o.col || (th.dark ? C.paper : C.navy), { seed: o.seed || 700, amp: 2, edgeW: 8 });
  ctx.fillStyle = o.ink || (th.dark ? C.navy : C.white); ctx.textBaseline = 'middle'; ctx.fillText(s, size * 0.55, h / 2 + 2); ctx.restore();
  return w;
}
// αριθμός στοιχείου λίστας «1.–5.» σε χάρτινο κύκλο (επιτρέπεται: το §7 απαγορεύει αριθμό επεισοδίου, όχι λίστας) · (x, y) = κέντρο
function cardNum(ctx, n, x, y, th) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.07);
  cut(ctx, circlePts(0, 0, 52), th.dark ? C.gold : BRAND, { seed: 300 + n, amp: 2.5, edgeW: 8 });
  txt(ctx, String(n), 0, 4, { font: '70px Geo', color: th.dark ? C.navy : C.paper }); ctx.restore();
}

// ---------- φωτογραφία ----------
// κομμάτι φωτογραφίας «κομμένο με ψαλίδι από κατάλογο» (§1c): [u0, v0, u1, v1] της φωτογραφίας (P.photo) → χαρτί πλάτους w με κέντρο (x, y) · o: rot · seed · logo = () => photoLogo(…) (χαραγμένο/τυπωμένο λογότυπο πάνω της)
// → (u, v) => [x, y] στην οθόνη (σημείο της φωτογραφίας, π.χ. για δέσμη laser στην άκρη του λογότυπου)
function photoClip(ctx, Ph, [u0, v0, u1, v1], x, y, w, o = {}) {
  const sx = u0 * Ph.w, sy = v0 * Ph.h, sw = (u1 - u0) * Ph.w, sh = (v1 - v0) * Ph.h, k = w / sw, h = sh * k;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const pf = cut(ctx, rectPts(-w / 2, -h / 2, w, h), '#FBFAF6', { seed: o.seed || 500, amp: 5, edgeW: 16 });
  ctx.save(); path(ctx, pf); ctx.clip(); ctx.drawImage(Ph.img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  if (o.logo) { ctx.translate(-w / 2 - sx * k, -h / 2 - sy * k); ctx.scale(k, k); drawLogo(ctx, o.logo()); }
  ctx.restore(); ctx.restore();
  const r = o.rot || 0;
  return (u, v) => { const px = (u * Ph.w - sx) * k - w / 2, py = (v * Ph.h - sy) * k - h / 2; return [x + px * Math.cos(r) - py * Math.sin(r), y + px * Math.sin(r) + py * Math.cos(r)]; };
}

// ---------- χάρτινα εικονίδια ----------
// ρολόι σε συγκεκριμένη ώρα (h, m) · (x, y) = κέντρο
function clockAt(ctx, x, y, r, h, m) {
  cut(ctx, circlePts(x, y, r), '#FFFFFF', { seed: 960, amp: 2, edgeW: 9 });
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = C.navy; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = i % 3 ? 4 : 7; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); ctx.lineTo(Math.sin(a) * r * 0.88, -Math.cos(a) * r * 0.88); ctx.stroke(); }
  for (const [a, len, lw] of [[(h % 12 + m / 60) / 12 * Math.PI * 2, 0.45, r * 0.1], [m / 60 * Math.PI * 2, 0.68, r * 0.07]]) { ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * r * len, -Math.cos(a) * r * len); ctx.stroke(); }
  ctx.fillStyle = BRAND; ctx.beginPath(); ctx.arc(0, 0, r * 0.08, 0, 7); ctx.fill(); ctx.restore();
}
// pin χάρτη · (x, y) = μύτη
function mapPin(ctx, x, y, r, col, seed) {
  const pts = [[x, y]]; for (let i = 0; i <= 24; i++) { const a = Math.PI / 2 + 0.75 + i / 24 * (Math.PI * 2 - 1.5); pts.push([x + Math.cos(a) * r, y - 1.55 * r + Math.sin(a) * r]); }
  cut(ctx, pts, col, { seed, amp: 2, edgeW: 7 }); cut(ctx, circlePts(x, y - 1.55 * r, r * 0.4), '#FFFFFF', { seed: seed + 1, amp: 1, edgeW: 0, shadow: false });
}
// διακεκομμένη καμπύλη διαδρομή ανάμεσα σε σημεία (pins)
function pinRoute(ctx, pts, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([2, 18]); ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, d] = pts[i]; ctx.quadraticCurveTo((a + c) / 2 + (d - b) * 0.25, (b + d) / 2 - (c - a) * 0.25, c, d); }
  ctx.stroke(); ctx.restore();
}
// πράσινο φύλλο (μπαμπού / οικολογικό) · s κλίμακα (1 = 180 px)
function leaf(ctx, x, y, s, rot, seed) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([-90 * s + 180 * s * t, -Math.sin(t * Math.PI) * 38 * s]); }
  for (let i = 16; i >= 0; i--) { const t = i / 16; pts.push([-90 * s + 180 * s * t, Math.sin(t * Math.PI) * 30 * s]); }
  cut(ctx, pts, '#5E8F4E', { seed, amp: 1.5, edgeW: 7 });
  ctx.strokeStyle = '#3F6B33'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(-84 * s, 0); ctx.lineTo(84 * s, -4 * s); ctx.stroke(); ctx.restore();
}
// χάρτινο αεροπλανάκι = «στείλε μήνυμα» (CTA) · s κλίμακα (1 ≈ 150 px)
function paperPlane(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, [[-70, -6], [80, -40], [-20, 30]], '#FFFFFF', { seed: 820, amp: 1.5, edgeW: 6 });
  cut(ctx, [[-20, 30], [80, -40], [-4, 58]], C.pale, { seed: 821, amp: 1.5, edgeW: 6, shadow: false }); ctx.restore();
}

module.exports = { CARD, CARD_TH, cardTitle, cardSub, cardTag, cardNum, photoClip, clockAt, mapPin, pinRoute, leaf, paperPlane };
