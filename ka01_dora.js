// ka01_dora — CAROUSEL «Το δώρο σου δουλεύει για σένα;» · εταιρικά δώρα (σετ BAGNER, φωτογραφίες του ad_doro) · 8 κάρτες 1080×1350 · scripts/ka01.md
// Look: κείμενο πρώτα (Geologica, 2 χρώματα), μικρά γραφικά γύρω (φωτογραφίες cut-out / κομμένες από κατάλογο + χάρτινα εικονίδια), εναλλάξ μπλε / χαρτί
// 1ο carousel: ο runner καρτών ζει εδώ (1η χρήση) → στο 2ο carousel περνάει στο engine (κανόνας 2ης φοράς)
// CLI: node ka01_dora.js          → ka01_dora_01.jpg … _08.jpg (δημοσίευση: node publish.js schedule ka01 publish/captions/ka01.json) + ka01_dora_sheet.png (όλες, μισή ανάλυση)
//      node ka01_dora.js 1 2      → ka01_dora_preview.png (μόνο αυτές, grid μισής ανάλυσης)
const fs = require('fs');
const L = require('./lib.js'), P = require('./props.js'), { stratos } = require('./stratos.js');
const { C, cut, rectPts, circlePts, path, txt, brandMark, rng } = L;

const NAME = 'ka01_dora', CW = 1080, CH = 1350, X0 = 70, MAXW = 940, BLUE = P.BRAND;
const TH = { // θέμα ανά φόντο: τίτλος · έμφαση · μικρό κείμενο · σήμα κάτω · λευκό κείμενο = καθαρό #FFFFFF (Αλέξανδρος 2026-10-03)
  blue: { bg: BLUE, scrib: '#3B63F6', ink: C.white, acc: C.gold, sub: C.white, mark: C.white },
  paper: { bg: C.paper, scrib: '#E9E3D3', ink: C.navy, acc: BLUE, sub: C.blue, mark: C.navy },
};

// ---------- κείμενο ----------
// τίτλος με **έμφαση** σε 2 χρώματα · με \n οι γραμμές μένουν όπως γράφτηκαν (μικραίνει ώσπου να χωράει η πιο φαρδιά) · χωρίς \n σπάει μόνος του σε o.maxL γραμμές → κάτω y
function title(ctx, s, x, y, th, o = {}) {
  const maxW = o.maxW || MAXW, font = o.font || 'Geo', fixed = s.includes('\n');
  const toks = l => l.split(/(\*\*[^*]+\*\*)/).filter(Boolean).flatMap(seg => seg.replace(/\*\*/g, '').split(' ').filter(Boolean).map(w => ({ w, a: seg.startsWith('**') })));
  let size = o.size || 130, R;
  const lay = () => {
    ctx.font = `${size}px ${font}`; const sp = ctx.measureText(' ').width * 0.9, lines = [];
    for (const l of s.split('\n')) { let cur = [], cw = 0; for (const t of toks(l)) { const tw = ctx.measureText(t.w).width; if (!fixed && cur.length && cw + sp + tw > maxW) { lines.push(cur); cur = []; cw = 0; } cw += (cur.length ? sp : 0) + tw; cur.push({ ...t, tw }); } lines.push(cur); }
    return { lines, sp, wide: Math.max(...lines.map(l => l.reduce((a, t) => a + t.tw, 0) + (l.length - 1) * sp)) };
  };
  for (R = lay(); size > 40 && (R.lines.length > (o.maxL || 9) || R.wide > maxW); R = lay()) size -= 4;
  const lh = size * (o.lh || 1.06);
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.font = `${size}px ${font}`;
  R.lines.forEach((l, i) => { let cx = x; for (const t of l) { ctx.fillStyle = t.a || o.all ? th.acc : th.ink; ctx.fillText(t.w, cx, y + size * 0.78 + i * lh); cx += t.tw + R.sp; } });
  ctx.restore();
  return y + R.lines.length * lh;
}
// μικρό κείμενο κάτω από τον τίτλο → κάτω y
function sub(ctx, s, x, y, th, o = {}) {
  const size = o.size || 48; ctx.save(); ctx.font = `${size}px GeoS`; ctx.fillStyle = th.sub; ctx.textBaseline = 'alphabetic';
  const lines = L.wrap(ctx, s, o.maxW || MAXW); lines.forEach((l, i) => ctx.fillText(l, x, y + size * 0.8 + i * size * 1.22)); ctx.restore();
  return y + lines.length * size * 1.22;
}
// χάρτινη ετικέτα καταλόγου (όνομα + κωδικός προϊόντος) · (x, y) = πάνω αριστερά
function tag(ctx, s, x, y, rot, th, o = {}) {
  const size = o.size || 40; ctx.save(); ctx.font = `${size}px GeoX`; const w = ctx.measureText(s).width + size * 1.1, h = size * 1.7;
  ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, rectPts(0, 0, w, h), th === TH.blue ? C.paper : C.navy, { seed: o.seed || 700, amp: 2, edgeW: 8 });
  ctx.fillStyle = th === TH.blue ? C.navy : C.white; ctx.textBaseline = 'middle'; ctx.fillText(s, size * 0.55, h / 2 + 2); ctx.restore();
}
// αριθμός στοιχείου λίστας: χάρτινος κύκλος
function num(ctx, n, x, y, th) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.07);
  cut(ctx, circlePts(0, 0, 52), th === TH.blue ? C.gold : BLUE, { seed: 300 + n, amp: 2.5, edgeW: 8 });
  txt(ctx, String(n), 0, 4, { font: '70px Geo', color: th === TH.blue ? C.navy : C.paper }); ctx.restore();
}

// ---------- πλαίσιο κάρτας ----------
function bg(ctx, th, seed) { cut(ctx, rectPts(-40, -40, CW + 80, CH + 80), th.bg, { seed, edge: false, shadow: false, scribble: th.scrib }); }
function frame(ctx, th, last) {
  ctx.save(); ctx.textBaseline = 'alphabetic';
  brandMark(ctx, X0 + 24, CH - 82, 24, th.mark); ctx.font = '28px Brand'; ctx.fillStyle = th.mark; ctx.fillText('STRATEGIX STUDIOS', X0 + 62, CH - 72);
  ctx.restore();
  if (!last) { // χάρτινο βελάκι «σύρε»
    const x = CW - 120, y = CH - 84, pts = [[-50, -15], [8, -15], [8, -40], [52, 0], [8, 40], [8, 15], [-50, 15]].map(([a, b]) => [x + a, y + b]);
    cut(ctx, pts, th === TH.blue ? C.gold : BLUE, { seed: 77, amp: 2, edgeW: 7 });
  }
}
const NOISE = (() => { const c = L.createCanvas(360, 450), x = c.getContext('2d'), im = x.createImageData(360, 450), r = rng(5); for (let i = 0; i < im.data.length; i += 4) { const v = 205 + r() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; })();
function finish(ctx) { // grain + vignette (§1) — στα carousels μόνο στο φόντο
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.38; ctx.drawImage(NOISE, 0, 0, CW, CH); ctx.restore();
  const g = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.35, CW / 2, CH / 2, CH * 0.78); g.addColorStop(0, 'rgba(0,0,20,0)'); g.addColorStop(1, 'rgba(0,0,20,0.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
}

// ---------- γραφικά ----------
const PH = n => P.photo('ad_doro', n);
// χαραγμένο demo λογότυπο πάνω στη φωτογραφία (οι αντανακλάσεις του υλικού περνάνε στη χάραξη): ανοξείδωτο = σκούρο γκρι · μπαμπού = καμένο καφέ
function steelLogo(c, cx, cy, d) { P.kostasLogo(c, cx, cy, d, { mono: '#2C3139' }); }
function bambooLogo(c, cx, cy, d) { P.kostasLogo(c, cx, cy, d, { mono: '#5A3214' }); }
const LOGO = { bottle: () => P.photoLogo(PH('set2'), steelLogo, 0.135, 0.5, 150), lid: () => P.photoLogo(PH('set2'), bambooLogo, 0.775, 0.735, 92) };
// κομμάτι φωτογραφίας «κομμένο με ψαλίδι από κατάλογο»: [u0, v0, u1, v1] της φωτογραφίας → χαρτί πλάτους w με κέντρο (x, y) · logo = LOGO.* → { k, ox, oy } για σημεία πάνω του
function clip(ctx, Ph, [u0, v0, u1, v1], x, y, w, o = {}) {
  const sx = u0 * Ph.w, sy = v0 * Ph.h, sw = (u1 - u0) * Ph.w, sh = (v1 - v0) * Ph.h, k = w / sw, h = sh * k;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const pf = cut(ctx, rectPts(-w / 2, -h / 2, w, h), '#FBFAF6', { seed: o.seed || 500, amp: 5, edgeW: 16 });
  ctx.save(); path(ctx, pf); ctx.clip(); ctx.drawImage(Ph.img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  if (o.logo) { ctx.translate(-w / 2 - sx * k, -h / 2 - sy * k); ctx.scale(k, k); P.drawLogo(ctx, o.logo()); }
  ctx.restore(); ctx.restore();
  const r = o.rot || 0; // σημείο (u, v) της φωτογραφίας → οθόνη
  return (u, v) => { const px = (u * Ph.w - sx) * k - w / 2, py = (v * Ph.h - sy) * k - h / 2; return [x + px * Math.cos(r) - py * Math.sin(r), y + px * Math.sin(r) + py * Math.cos(r)]; };
}
function clockAt(ctx, x, y, r, h, m) { // ρολόι σε συγκεκριμένη ώρα
  cut(ctx, circlePts(x, y, r), '#FFFFFF', { seed: 960, amp: 2, edgeW: 9 });
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = C.navy; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = i % 3 ? 4 : 7; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); ctx.lineTo(Math.sin(a) * r * 0.88, -Math.cos(a) * r * 0.88); ctx.stroke(); }
  for (const [a, len, lw] of [[(h % 12 + m / 60) / 12 * Math.PI * 2, 0.45, r * 0.1], [m / 60 * Math.PI * 2, 0.68, r * 0.07]]) { ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * r * len, -Math.cos(a) * r * len); ctx.stroke(); }
  ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(0, 0, r * 0.08, 0, 7); ctx.fill(); ctx.restore();
}
function pin(ctx, x, y, r, col, seed) { // pin χάρτη · (x, y) = μύτη
  const pts = [[x, y]]; for (let i = 0; i <= 24; i++) { const a = Math.PI / 2 + 0.75 + i / 24 * (Math.PI * 2 - 1.5); pts.push([x + Math.cos(a) * r, y - 1.55 * r + Math.sin(a) * r]); }
  cut(ctx, pts, col, { seed, amp: 2, edgeW: 7 }); cut(ctx, circlePts(x, y - 1.55 * r, r * 0.4), '#FFFFFF', { seed: seed + 1, amp: 1, edgeW: 0, shadow: false });
}
function route(ctx, pts, col) { // διακεκομμένη διαδρομή ανάμεσα στα pins
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([2, 18]); ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, d] = pts[i]; ctx.quadraticCurveTo((a + c) / 2 + (d - b) * 0.25, (b + d) / 2 - (c - a) * 0.25, c, d); }
  ctx.stroke(); ctx.restore();
}
function leaf(ctx, x, y, s, rot, seed) { // φύλλο (μπαμπού / οικολογικό)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([-90 * s + 180 * s * t, -Math.sin(t * Math.PI) * 38 * s]); }
  for (let i = 16; i >= 0; i--) { const t = i / 16; pts.push([-90 * s + 180 * s * t, Math.sin(t * Math.PI) * 30 * s]); }
  cut(ctx, pts, '#5E8F4E', { seed, amp: 1.5, edgeW: 7 });
  ctx.strokeStyle = '#3F6B33'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(-84 * s, 0); ctx.lineTo(84 * s, -4 * s); ctx.stroke(); ctx.restore();
}
function plane(ctx, x, y, s, rot) { // χάρτινο αεροπλανάκι = μήνυμα
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, [[-70, -6], [80, -40], [-20, 30]], '#FFFFFF', { seed: 820, amp: 1.5, edgeW: 6 });
  cut(ctx, [[-20, 30], [80, -40], [-4, 58]], C.pale, { seed: 821, amp: 1.5, edgeW: 6, shadow: false }); ctx.restore();
}
function laserBeam(ctx, x0, y0, x1, y1) { // δέσμη + καυτό σημείο (σχηματικά, όπως στα «Πώς φτιάχνεται;»)
  ctx.save(); ctx.lineCap = 'round';
  for (const [w, c] of [[26, 'rgba(255,90,70,0.18)'], [12, 'rgba(255,110,90,0.45)'], [4, '#FFF4EE']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  const g = ctx.createRadialGradient(x1, y1, 0, x1, y1, 30); g.addColorStop(0, 'rgba(255,250,240,1)'); g.addColorStop(0.3, 'rgba(255,150,90,0.8)'); g.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x1, y1, 30, 0, 7); ctx.fill(); ctx.restore();
}
function laserHead(ctx, x, y) { // κεφαλή laser που κατεβαίνει από πάνω · (x, y) = ακροφύσιο
  cut(ctx, rectPts(x - 46, y - 150, 92, 110), C.navy, { seed: 870, amp: 2, edgeW: 7 });
  cut(ctx, [[x - 30, y - 42], [x + 30, y - 42], [x + 12, y], [x - 12, y]], C.silver, { seed: 871, amp: 1, edgeW: 6 });
}
const spark = (ctx, x, y, s, seed) => P.sparkle(ctx, x, y, s, 5, 0, seed);

// ---------- κάρτες (scripts/ka01.md) ----------
const CARDS = [
  ['blue', ctx => { // 1 · εξώφυλλο
    const th = TH.blue, y = title(ctx, 'Το εταιρικό\nσου δώρο\n**δουλεύει**\nγια σένα;', X0, 150, th, { size: 140 });
    sub(ctx, '5 λόγοι που αυτό εδώ δουλεύει', X0, y + 30, th, { size: 50, maxW: 430 });
    P.photoCut(ctx, PH('open'), 770, 1235, 460, { rot: -0.04 });
    spark(ctx, 540, 960, 0.5, 11); spark(ctx, 980, 820, 0.4, 12);
  }],
  ['paper', ctx => { // 2 · re-hook = ποιο είναι το προϊόν (στέκει και μόνη της)
    const th = TH.paper, y = title(ctx, '**3 δώρα**\nσε 1 κουτί', X0, 180, th, { size: 150 });
    sub(ctx, 'Ταπεράκι, παγούρι και μαχαιροπίρουνα, με το λογότυπό σου. Για πελάτες ή για την ομάδα σου.', X0, y + 30, th);
    P.photoCut(ctx, PH('set'), 660, 1235, 530, { rot: 0.03 });
    tag(ctx, 'Σετ BAGNER · κωδ. MJ1655', X0, 1120, -0.05, th);
  }],
  ['blue', ctx => { // 3
    const th = TH.blue; num(ctx, 1, X0 + 52, 228, th);
    const y = title(ctx, 'Το χρησιμοποιούν\n**κάθε μέρα**', X0, 310, th, { size: 130 });
    sub(ctx, 'Ταπεράκι 800 ml: κάθε μεσημέρι, το λογότυπό σου στο τραπέζι τους.', X0, y + 24, th);
    clip(ctx, PH('set2'), [0.1, 0.62, 0.88, 1], 620, 990, 680, { rot: -0.03, seed: 510, logo: LOGO.lid });
    clockAt(ctx, 190, 1030, 92, 13, 30);
  }],
  ['paper', ctx => { // 4
    const th = TH.paper; num(ctx, 2, X0 + 52, 228, th);
    const y = title(ctx, 'Βγαίνει **έξω**\nμαζί τους', X0, 310, th, { size: 140 });
    sub(ctx, 'Παγούρι 500 ml: γυμναστήριο, γραφείο, δρόμος. Το βλέπουν κι άλλοι.', X0, y + 24, th, { maxW: 560 });
    clip(ctx, PH('set2'), [0, 0.07, 0.28, 0.7], 830, 925, 236, { rot: 0.05, seed: 520, logo: LOGO.bottle });
    const ps = [[160, 1160], [370, 1010], [580, 1170]]; route(ctx, ps, 'rgba(30,58,138,0.55)');
    pin(ctx, ...ps[0], 40, BLUE, 530); pin(ctx, ...ps[1], 40, C.gold, 532); pin(ctx, ...ps[2], 40, C.navy, 534);
  }],
  ['blue', ctx => { // 5
    const th = TH.blue; num(ctx, 3, X0 + 52, 228, th);
    const y = title(ctx, 'Λογότυπο που\n**δεν ξεβάφει**', X0, 310, th, { size: 130 });
    sub(ctx, 'Χαραγμένο με λέιζερ, στο παγούρι και στο καπάκι.', X0, y + 24, th, { maxW: 540 });
    const at = clip(ctx, PH('set2'), [0, 0.36, 0.3, 0.64], 620, 1000, 420, { rot: 0.03, seed: 540, logo: LOGO.bottle }); // κοντινό: η δέσμη στην άκρη του λογότυπου
    const [lx, ly] = at(0.135 + 0.06, 0.47); laserHead(ctx, lx, ly - 175); laserBeam(ctx, lx, ly - 175, lx, ly);
    spark(ctx, lx + 46, ly - 26, 0.3, 41); spark(ctx, lx + 30, ly + 40, 0.22, 42);
  }],
  ['paper', ctx => { // 6
    const th = TH.paper; num(ctx, 4, X0 + 52, 228, th);
    const y = title(ctx, 'Υλικά που\n**δείχνουν**\n**ποιότητα**', X0, 310, th, { size: 130 });
    sub(ctx, 'Ανοξείδωτο ατσάλι και μπαμπού. Ό,τι δίνεις, λέει κάτι για σένα.', X0, y + 24, th, { maxW: 500 });
    P.photoCut(ctx, PH('set2'), 770, 1235, 440, { rot: 0.03 });
    leaf(ctx, 900, 790, 0.85, -0.5, 610); leaf(ctx, 470, 1170, 0.7, 0.4, 612);
  }],
  ['blue', ctx => { // 7
    const th = TH.blue; num(ctx, 5, X0 + 52, 228, th);
    const y = title(ctx, 'Έρχεται **έτοιμο**\nσε κουτί', X0, 310, th, { size: 140 });
    sub(ctx, 'Κραφτ κουτί δώρου με ένθετο. Το δίνεις όπως είναι.', X0, y + 24, th);
    P.photoCut(ctx, PH('open2'), 690, 1235, 560, { rot: -0.03 });
    spark(ctx, 380, 820, 0.5, 71); spark(ctx, 960, 880, 0.4, 72); spark(ctx, 330, 1120, 0.3, 73);
  }],
  ['paper', ctx => { // 8 · CTA
    const th = TH.paper; let y = title(ctx, 'Θες το σετ με το\nλογότυπό σου;', X0, 190, th, { size: 110 });
    y = title(ctx, 'Στείλε μας\nμήνυμα.', X0, y + 24, th, { size: 150, all: true });
    plane(ctx, 900, 715, 0.9, -0.25);
    P.photoCut(ctx, PH('open'), 280, 1235, 340, { rot: -0.05 });
    tag(ctx, 'Σετ BAGNER · κωδ. MJ1655', X0, y + 28, -0.03, th, { seed: 710, size: 36 });
    stratos(ctx, 725, 1120, 0.78, { legs: false, arms: [0.12, 1.4], elbowR: -1.6, handR: 'thumb', eyes: 'happy', mouth: 'grin' });
  }],
];

function draw(i) {
  const cv = L.createCanvas(CW, CH), ctx = cv.getContext('2d'), [k, fn] = CARDS[i], th = TH[k];
  bg(ctx, th, 20 + i); finish(ctx); // grain + vignette μόνο στο φόντο · κείμενο και στοιχεία από πάνω, καθαρά (Αλέξανδρος 2026-10-03)
  fn(ctx); frame(ctx, th, i === CARDS.length - 1);
  return cv;
}
function grid(ids, file, cols) {
  const rows = Math.ceil(ids.length / cols), w = CW / 2, h = CH / 2, G = L.createCanvas(w * cols, h * rows), g = G.getContext('2d');
  ids.forEach((i, j) => g.drawImage(draw(i), (j % cols) * w, Math.floor(j / cols) * h, w, h));
  fs.writeFileSync(file, G.toBuffer('image/png')); console.log(file);
}

if (require.main === module) {
  const ids = process.argv.slice(2).map(n => +n - 1).filter(i => CARDS[i]);
  if (ids.length) grid(ids, `${NAME}_preview.png`, Math.min(ids.length, 4));
  else {
    CARDS.forEach((_, i) => { const f = `${NAME}_${String(i + 1).padStart(2, '0')}.jpg`; fs.writeFileSync(f, draw(i).toBuffer('image/jpeg', 92)); });
    console.log(`${NAME}_01…${String(CARDS.length).padStart(2, '0')}.jpg (${CARDS.length} κάρτες ${CW}×${CH})`);
    grid(CARDS.map((_, i) => i), `${NAME}_sheet.png`, 4);
  }
}
module.exports = { CARDS, draw, CW, CH };
