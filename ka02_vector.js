// ka02_vector — CAROUSEL «Σου ζήτησαν το λογότυπο σε vector;» · 9 κάρτες 1080×1350 (4:5) · χωρίς VO / μουσική
// Σενάριο: scripts/ka02.md · σκελετός: node new.js ka02_vector (2026-10-03) · look: STYLE_GUIDE §7 Carousel (κάρτα 1 = χαρτί, μετά εναλλάξ μπλε / χαρτί)
// Runner: carousel.js (φόντο + υφή μόνο στο φόντο · σήμα + STRATEGIX STUDIOS κάτω · βελάκι → · lint) · props: node api.js carousel
// CLI: node ka02_vector.js 1 2 → style frames (ka02_vector_preview.png) · node ka02_vector.js check → lint + sheet · node ka02_vector.js → ka02_vector_NN.jpg + sheet
const L = require('./lib.js');
const { C, cut, rectPts, rrPts, circlePts, path, txt } = L;
const P = require('./props.js');                      // node api.js → κατάλογος · node api.js carousel → κάρτες
const { BRAND, CARD, cardTitle, cardSub, cardTag, kostasLogo, paperPlane, poster, POSTER, METAL } = P;
const { stratos, handPos } = require('./stratos.js');
const X0 = CARD.X0;                                   // αριστερό περιθώριο κειμένου · CARD.W × CARD.H = 1080 × 1350
const WH = '#FBFAF6', COF = '#7A3E1D', CREAM = '#F5E6C8'; // λευκό χαρτί · χρώματα του kostasLogo

// ---------- pixels από χαρτί (1η χρήση: ka02 · 2η → props/carousel.js) ----------
// αληθινό pixelation: draw(c) ζωγραφίζει σε w×h canvas → at(i, j) = χρώμα του pixel (το antialiasing ανακατεύεται με το χαρτί) ή null (διάφανο)
function pixels(w, h, draw) {
  const c = L.createCanvas(w, h).getContext('2d'); draw(c);
  const d = c.getImageData(0, 0, w, h).data, bg = L.hexRGB(WH);
  return { w, h, at: (i, j) => { if (i < 0 || j < 0 || i >= w || j >= h) return null; const k = (j * w + i) * 4, a = d[k + 3] / 255; return a < 0.4 ? null : `rgb(${[0, 1, 2].map(q => Math.round(d[k + q] * a + bg[q] * (1 - a))).join(',')})`; } };
}
const LOGO = pixels(20, 20, c => kostasLogo(c, 10, 10, 20));          // το ίδιο «JPG» του λογότυπου σε όλες τις κάρτες
const PHOTO = pixels(50, 70, c => c.drawImage(POSTER.sharp, 0, 0, 50, 70)); // η φωτογραφία της αφίσας (κάρτα 5)
// ψηφιδωτό: κάθε pixel = χάρτινο τετραγωνάκι με σκιά (nearest-neighbor) · (x, y) = πάνω αριστερά του pixel (0, 0) · cell = πλευρά · keep(i, j) = ποια pixels
function mosaic(ctx, R, x, y, cell, keep = () => true, seed = 4000) {
  const g = cell * 0.06;
  for (let j = 0; j < R.h; j++) for (let i = 0; i < R.w; i++) {
    const col = R.at(i, j); if (!col || !keep(i, j)) continue;
    cut(ctx, rectPts(x + i * cell + g, y + j * cell + g, cell - 2 * g, cell - 2 * g), col, { seed: seed + j * R.w + i, amp: cell * 0.04, step: 80, edge: false, sx: cell * 0.07, sy: cell * 0.1 });
  }
}
// ψηφιδωτό μόνο μέσα σε κύκλο (cx, cy, r): για φακό
const inCircle = (x, y, cell, cx, cy, r) => (i, j) => Math.hypot(x + (i + 0.5) * cell - cx, y + (j + 0.5) * cell - cy) < r + cell;

// ---------- χάρτινα εικονίδια της κάρτας ----------
// μεγεθυντικός φακός · (x, y) = κέντρο γυαλιού · hang = γωνία λαβής (0 = κάτω, + = κάτω αριστερά) · inside(ctx) = ό,τι φαίνεται μέσα (clip στο γυαλί)
function lens(ctx, x, y, r, hang, inside, seed = 5000) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(hang);
  cut(ctx, rrPts(-r * 0.15, r * 1.05, r * 0.3, r * 0.8, r * 0.13), C.navy, { seed, amp: 2, edgeW: 9 });
  ctx.restore();
  cut(ctx, circlePts(x, y, r * 1.14, r * 1.14, 48), C.navy, { seed: seed + 1, amp: 2, edgeW: 10 });
  const pf = cut(ctx, circlePts(x, y, r, r, 48), WH, { seed: seed + 2, amp: 1, edge: false, shadow: false });
  ctx.save(); path(ctx, pf); ctx.clip(); inside(ctx);
  ctx.strokeStyle = 'rgba(5,10,30,0.16)'; ctx.lineWidth = r * 0.1; ctx.beginPath(); ctx.arc(x + 6, y + 9, r, 0, 7); ctx.stroke(); // σκιά του στεφανιού στο γυαλί
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r * 0.8, -2.75, -2.0); ctx.stroke(); // ανταύγεια
  ctx.restore();
}
// cubic bezier → σημεία
function bez([x0, y0], [x1, y1], [x2, y2], [x3, y3], n = 16) {
  const p = []; for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; p.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); }
  return p;
}
// anchor point του vector (τετραγωνάκι · sel = επιλεγμένο, γεμάτο) και λαβή (γραμμή ως το control point + κουκκίδα)
function anchor(ctx, [x, y], sel, a = 11) { ctx.save(); ctx.fillStyle = sel ? C.navy : '#FFFFFF'; ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.fillRect(x - a, y - a, 2 * a, 2 * a); ctx.strokeRect(x - a, y - a, 2 * a, 2 * a); ctx.restore(); }
function handle(ctx, [x, y], [cx, cy]) { ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, cy); ctx.stroke(); ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill(); ctx.restore(); }
// μύτη πένας (pen tool) · (x, y) = άκρη · rot (0 = σώμα προς τα πάνω, + = πάνω δεξιά)
function penNib(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, rrPts(-40, -168, 80, 54, 10), C.navy, { seed: 5301, amp: 1.5, edgeW: 7 });
  cut(ctx, [[0, 0], [-38, -72], [-32, -118], [32, -118], [38, -72]], WH, { seed: 5300, amp: 1.5, edgeW: 7 });
  ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -64); ctx.stroke();
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(0, -70, 10, 0, 7); ctx.fill();
  ctx.restore();
}
// φλιτζάνι του KOSTAS COFFEE σε vector (ίδια γεωμετρία με το kostasLogo, πάτος = cubic με λαβές) · T(x, y) = μονάδες λογότυπου → οθόνη
function cupVector(ctx, T) {
  const b0 = T(50, 0), b1 = T(-50, 0), c1 = T(26, 26), c2 = T(-26, 26);
  const body = [T(-62, -82), T(62, -82), b0, ...bez(b0, c1, c2, b1)];
  const ring = []; for (let i = 0; i <= 14; i++) ring.push(T(70 + Math.cos(-2 + i / 14 * 4) * 32, -48 + Math.sin(-2 + i / 14 * 4) * 32)); for (let i = 14; i >= 0; i--) ring.push(T(70 + Math.cos(-2 + i / 14 * 4) * 17, -48 + Math.sin(-2 + i / 14 * 4) * 17));
  L.cutGroup(ctx, [[body, CREAM, { seed: 5200, amp: 1.5 }], [ring, CREAM, { seed: 5201, amp: 1.5 }]], { edgeW: 9 });
  ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.lineJoin = 'round'; path(ctx, body); ctx.stroke(); ctx.restore(); // το path = καθαρή γραμμή
  const steam = [-26, 0, 26].map(sx => [T(sx, -94), T(sx + 18, -106), T(sx - 18, -122), T(sx, -136)]);
  ctx.save(); ctx.strokeStyle = WH; ctx.lineWidth = 13; ctx.lineCap = 'round';
  for (const [a, c, d, e] of steam) { ctx.beginPath(); ctx.moveTo(...a); ctx.bezierCurveTo(...c, ...d, ...e); ctx.stroke(); }
  ctx.restore();
  handle(ctx, b0, c1); handle(ctx, b1, c2); handle(ctx, steam[1][0], steam[1][1]); handle(ctx, steam[1][3], steam[1][2]);
  for (const p of [T(-62, -82), b1, b0, steam[1][0], steam[1][3], steam[0][0], steam[0][3], steam[2][0], steam[2][3]]) anchor(ctx, p);
  anchor(ctx, T(62, -82), true);
  return T(62, -82);                                  // εκεί δουλεύει η πένα
}
// χάρτινη φωτογραφία (polaroid) με την εικόνα της αφίσας · (x, y) = κέντρο · w = πλάτος
function polaroid(ctx, x, y, w, rot, seed = 6000) {
  const m = w * 0.07, iw = w - 2 * m, h = iw + m + w * 0.24;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, rectPts(-w / 2, -h / 2, w, h), '#FFFFFF', { seed, amp: 2, edgeW: 6 });
  ctx.drawImage(POSTER.sharp, 0, POSTER.h * 0.18, POSTER.w, POSTER.w, -w / 2 + m, -h / 2 + m, iw, iw);
  ctx.restore();
}
// μισό επίπεδο του πολυγώνου (Sutherland–Hodgman) πάνω στη γραμμή a→b · sg = +1 / −1 πλευρά
function clipHalf(pts, [ax, ay], [bx, by], sg) {
  const sd = ([x, y]) => sg * ((bx - ax) * (y - ay) - (by - ay) * (x - ax)), out = [];
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], dp = sd(p), dq = sd(q); if (dp >= 0) out.push(p); if (dp * dq < 0) { const t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } });
  return out;
}
// καθρέφτισμα σημείου στη γραμμή a→b (το κομμάτι που ξεκολλάει διπλώνει πάνω στη γραμμή)
function mirror([x, y], [ax, ay], [bx, by]) { const dx = bx - ax, dy = by - ay, t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), px = ax + dx * t, py = ay + dy * t; return [2 * px - x, 2 * py - y]; }
// μαχαίρι plotter (θήκη λεπίδας στο καρότσι) · (x, y) = μύτη λεπίδας · rot (0 = όρθιο)
function plotterKnife(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, rrPts(-34, -250, 68, 190, 12), METAL.steel, { seed: 7101, amp: 1.5, edgeW: 7 });
  for (const yy of [-230, -212, -194]) cut(ctx, rectPts(-36, yy, 72, 9), METAL.dark, { seed: 7102 + yy, amp: 0.8, edge: false, shadow: false });
  cut(ctx, [[-34, -62], [34, -62], [10, -16], [-10, -16]], METAL.dark, { seed: 7103, amp: 1, edgeW: 6 });
  cut(ctx, [[-5, -18], [6, -18], [2, 0]], '#E9EDF4', { seed: 7104, amp: 0.4, edgeW: 3, shadow: false });
  cut(ctx, rrPts(-82, -340, 164, 112, 14), C.navy, { seed: 7105, amp: 1.5, edgeW: 7 });             // καρότσι
  cut(ctx, rrPts(-46, -246, 92, 34, 6), METAL.light, { seed: 7106, amp: 1, edgeW: 5 });              // σφιγκτήρας της θήκης
  ctx.restore();
}
// χάρτινο αρχείο (σελίδα με διπλωμένη γωνία) · (x, y) = κέντρο · label = «PDF»
function fileDoc(ctx, x, y, w, h, label, rot, seed = 8000) {
  const f = w * 0.24; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, [[-w / 2, -h / 2], [w / 2 - f, -h / 2], [w / 2, -h / 2 + f], [w / 2, h / 2], [-w / 2, h / 2]], '#FFFFFF', { seed, amp: 2, edgeW: 7 });
  cut(ctx, [[w / 2 - f, -h / 2], [w / 2 - f, -h / 2 + f], [w / 2, -h / 2 + f]], C.pale, { seed: seed + 1, amp: 1, edgeW: 4 });
  ctx.fillStyle = C.sky; for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + w * 0.14, -h / 2 + h * (0.24 + i * 0.09), w * (i === 3 ? 0.45 : 0.62), h * 0.035);
  cut(ctx, rectPts(-w / 2 - 14, h * 0.12, w * 0.78, h * 0.26), C.navy, { seed: seed + 2, amp: 1.5, edgeW: 6 });
  txt(ctx, label, -w / 2 - 14 + w * 0.39, h * 0.25 + 3, { font: `${Math.round(h * 0.17)}px Brand`, color: '#FFFFFF' });
  ctx.restore();
}
// λίστα με ✓ σε χάρτινο κύκλο → κάτω y
function checkItem(ctx, s, x, y, th, seed) {
  cut(ctx, circlePts(x + 28, y + 24, 28), th.acc, { seed, amp: 1.5, edgeW: 6 });
  L.check(ctx, x + 28, y + 25, 1.25, th.dark ? C.navy : '#FFFFFF');
  return cardSub(ctx, s, x + 80, y, th, { maxW: CARD.MAXW - 80 });
}

// κάρτα = [θέμα, (ctx, th) => …] · th = P.CARD_TH[θέμα]: ink τίτλος · acc έμφαση (**…**) · sub · dark · γραφικά γύρω από το κείμενο, όχι στο κέντρο · κάτω ~150 px μόνο σήμα + βελάκι
const CARDS = [
  ['paper', (ctx, th) => { // 1 · Εξώφυλλο · λογότυπο κομμένο στη μέση: αριστερά pixels (JPG), δεξιά καθαρό (SVG)
    let y = cardTitle(ctx, 'Σου ζήτησαν το λογότυπο σε **vector;**', X0, 170, th, { size: 130 });
    y = cardSub(ctx, 'Τι είναι, πώς διαφέρει από το raster και γιατί μετράει στο τύπωμα.', X0, y + 30, th);
    const D = 440, cx = 540, cy = 975, cell = D / LOGO.w, gap = 18;
    mosaic(ctx, LOGO, cx - gap - D / 2, cy - D / 2, cell, i => i < LOGO.w / 2);             // αριστερά: JPG = τετραγωνάκια
    ctx.save(); ctx.translate(cx + gap, cy); ctx.rotate(0.035);                              // δεξιά: SVG = καθαρό, σκισμένο στη μέση
    const half = []; for (let k = 0; k <= 24; k++) { const a = -Math.PI / 2 + k / 24 * Math.PI; half.push([Math.cos(a) * D * 0.49, Math.sin(a) * D * 0.49]); }
    const pf = cut(ctx, [...half, [0, D * 0.49], [0, -D * 0.49]], COF, { seed: 4100, amp: 3, edgeW: 9 });
    ctx.save(); path(ctx, pf); ctx.clip(); kostasLogo(ctx, 0, 0, D); ctx.restore(); ctx.restore();
    cardTag(ctx, 'JPG', 90, 1090, -0.06, th, { size: 46, seed: 701 });
    cardTag(ctx, 'SVG', 840, 1075, 0.05, th, { size: 46, seed: 702, col: th.acc });
  }],
  ['blue', (ctx, th) => { // 2 · Re-hook · δύο φακοί στην ίδια καμπύλη (πάνω αριστερή άκρη του δίσκου): σκαλοπάτια αριστερά, λεία γραμμή δεξιά
    let y = cardTitle(ctx, 'Η διαφορά φαίνεται στο **zoom**', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Ίδιο λογότυπο, 10 φορές μεγαλύτερο. Raster: τετραγωνάκια. Vector: καθαρή άκρη.', X0, y + 30, th);
    const Z = 820, r = 126, ly = 1072, a = -2.3, fx = Z / 2 + Math.cos(a) * Z * 0.43, fy = Z / 2 + Math.sin(a) * Z * 0.43; // σημείο του λογότυπου στο κέντρο του φακού
    for (const [lx, hang, seed, inside] of [
      [285, 1.0, 5000, c => mosaic(c, LOGO, 285 - fx, ly - fy, Z / LOGO.w, inCircle(285 - fx, ly - fy, Z / LOGO.w, 285, ly, r))],
      [795, -1.0, 5100, c => kostasLogo(c, 795 - fx + Z / 2, ly - fy + Z / 2, Z)]]) lens(ctx, lx, ly, r, hang, inside, seed);
    cardTag(ctx, 'RASTER', 150, ly - r - 58, -0.05, th, { size: 40, seed: 703 });
    cardTag(ctx, 'VECTOR', 670, ly - r - 52, 0.04, th, { size: 40, seed: 704, col: th.acc, ink: C.navy });
  }],
  ['paper', (ctx, th) => { // 3 · μικρό λογότυπο (φαίνεται εντάξει) → μεγάλο: τα ίδια pixels, τεράστια τετραγωνάκια · ετικέτα «JPG · PNG»
    let y = cardTitle(ctx, 'Raster = **τετραγωνάκια**', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Η εικόνα είναι ψηφιδωτό από pixels. Τη μεγαλώνεις; Μεγαλώνουν και τα τετραγωνάκια.', X0, y + 30, th);
    const sD = 150, sx = 205, sy = 960, D = 430, bx = 755, by = 985;
    mosaic(ctx, LOGO, sx - sD / 2, sy - sD / 2, sD / LOGO.w);
    mosaic(ctx, LOGO, bx - D / 2, by - D / 2, D / LOGO.w, undefined, 4500);
    P.pinRoute(ctx, [[sx + 95, sy - 20], [bx - D / 2 - 40, sy - 30]], C.navy);
    cut(ctx, [[0, -20], [30, 0], [0, 20]].map(([a, b]) => [bx - D / 2 - 34 + a, sy - 30 + b]), C.navy, { seed: 706, amp: 1, edgeW: 5 });
    cardTag(ctx, 'JPG · PNG', 95, 1110, -0.05, th, { size: 44, seed: 705 });
  }],
  ['blue', (ctx, th) => { // 4 · το φλιτζάνι του λογότυπου σε vector: anchor points + λαβές, μύτη πένας · ετικέτες «AI · SVG · EPS» + «διανυσματικό»
    let y = cardTitle(ctx, 'Vector = **γραμμές** και καμπύλες', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Το σχήμα είναι σημεία ενωμένα με γραμμές. Το μεγαλώνεις όσο θες και ξαναζωγραφίζεται καθαρό.', X0, y + 30, th);
    const k = 2.2, ox = 720, oy = 1168, tip = cupVector(ctx, (x, yy) => [ox + x * k, oy + yy * k]);
    penNib(ctx, tip[0] + 4, tip[1] - 4, 0.8, 0.65);
    cardTag(ctx, 'AI · SVG · EPS', X0 + 10, 960, -0.05, th, { size: 42, seed: 707 });
    cardTag(ctx, 'διανυσματικό', X0 + 30, 1070, 0.04, th, { size: 42, seed: 708, col: th.acc, ink: C.navy });
  }],
  ['paper', (ctx, th) => { // 5 · ίδια φωτογραφία σε μικρή εκτύπωση και σε αφίσα · φακός: κι αυτή pixels, πολλά
    let y = cardTitle(ctx, 'Φωτογραφία; Πάντα **raster**', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Εδώ μετράει η ανάλυση: όσο μεγαλύτερο το τύπωμα, τόσο περισσότερα pixels θέλει.', X0, y + 30, th);
    const pw = 330, ph = pw * POSTER.h / POSTER.w, px = 745, pt = 742;
    poster(ctx, px, pt, pw, ph, { rot: 0.025, tape: true, seed: 7000 });
    polaroid(ctx, 300, 1020, 250, -0.08);
    const lx = 805, ly = 965, r = 95, cell = pw / PHOTO.w * 2.2, ox = lx - (lx - px + pw / 2) / pw * PHOTO.w * cell, oy = ly - (ly - pt) / ph * PHOTO.h * cell; // το σημείο της αφίσας κάτω από τον φακό, 2,2× μεγαλύτερο
    lens(ctx, lx, ly, r, -0.75, c => mosaic(c, PHOTO, ox, oy, cell, inCircle(ox, oy, cell, lx, ly, r), 4800), 5200);
  }],
  ['blue', (ctx, th) => { // 6 · ίδιο λογότυπο σε επαγγελματική κάρτα και σε ταμπέλα, το ίδιο καθαρό
    let y = cardTitle(ctx, 'Λογότυπο; Πάντα **vector**', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Ένα αρχείο για όλα: από την κάρτα ως την ταμπέλα, το ίδιο καθαρό.', X0, y + 30, th);
    const sx = 670, sy = 985, sw = 500, sh = 270, by = sy - sh / 2 - 80; // ταμπέλα που κρέμεται από βραχίονα (ο τοίχος δεξιά, εκτός κάδρου)
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.setLineDash([12, 6]); for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx + d * sw * 0.36, by); ctx.lineTo(sx + d * sw * 0.36, sy - sh / 2 + 6); ctx.stroke(); } ctx.restore(); // αλυσίδες
    cut(ctx, rrPts(sx - sw * 0.46, by - 12, 1120 - sx + sw * 0.46, 24, 12), C.navy, { seed: 7300, amp: 1, edgeW: 6 });
    cut(ctx, circlePts(sx - sw * 0.46, by, 20), C.navy, { seed: 7301, amp: 1, edgeW: 6 });
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.015);
    cut(ctx, rectPts(-sw / 2, -sh / 2, sw, sh), WH, { seed: 7310, amp: 2, edgeW: 9 });
    kostasLogo(ctx, -sw / 2 + 125, 0, 195);
    txt(ctx, 'KOSTAS', 117, -20, { font: '62px Brand', color: COF }); txt(ctx, 'COFFEE', 117, 38, { font: '34px Brand', color: COF });
    ctx.restore();
    ctx.save(); ctx.translate(250, 1125); ctx.rotate(-0.08);                                   // επαγγελματική κάρτα
    cut(ctx, rectPts(-150, -88, 300, 176), '#FFFFFF', { seed: 7320, amp: 1.5, edgeW: 7 });
    kostasLogo(ctx, -82, 0, 112);
    txt(ctx, 'KOSTAS', 50, -26, { font: '34px Brand', color: COF }); txt(ctx, 'COFFEE', 50, 6, { font: '18px Brand', color: COF });
    ctx.fillStyle = C.sky; ctx.fillRect(4, 34, 96, 7); ctx.fillRect(4, 50, 70, 7);
    ctx.restore();
    cardTag(ctx, 'SVG', 480, 1140, 0.05, th, { size: 40, seed: 709, col: th.acc, ink: C.navy });
  }],
  ['paper', (ctx, th) => { // 7 · γράμμα βινυλίου σε φύλλο: διακεκομμένη γραμμή κοπής, μαχαίρι plotter πάνω της, η άκρη ξεκολλάει
    let y = cardTitle(ctx, 'Για **κοπή,** μόνο vector', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Plotter και laser κόβουν πάνω στις γραμμές του vector. Στο raster δεν έχουν γραμμή να ακολουθήσουν.', X0, y + 30, th);
    ctx.save(); ctx.translate(430, 985); ctx.rotate(-0.03);
    cut(ctx, rectPts(-300, -205, 600, 410), METAL.liner, { seed: 7400, amp: 2, edgeW: 8 });     // χαρτί-φορέας
    const k = 1.15, K = [[0, 0], [70, 0], [70, 105], [150, 0], [235, 0], [130, 135], [240, 280], [152, 280], [70, 170], [70, 280], [0, 280]].map(([a, b]) => [-138 + a * k, -161 + b * k]);
    const A = [-138 + 75 * k, -161 - 22 * k], B = [-138 + 275 * k, -161 + 112 * k];            // γραμμή διπλώματος στην άκρη του πάνω σκέλους
    cut(ctx, clipHalf(K, A, B, 1), BRAND, { seed: 7410, amp: 1, edge: false, sx: 3, sy: 4 }); // το βινύλιο που μένει
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.setLineDash([16, 10]); ctx.lineJoin = 'round'; path(ctx, K); ctx.stroke(); ctx.restore(); // γραμμή κοπής
    const flap = clipHalf(K, A, B, -1).map(p => mirror(p, A, B));                             // η άκρη που ξεκολλάει, διπλωμένη
    cut(ctx, flap, '#E8EEFB', { seed: 7411, amp: 1, edgeW: 4, sx: 10, sy: 14 });
    plotterKnife(ctx, -138 + 212 * k, -161 + 243 * k, 0.72, 0.3);       // στην έξω άκρη του κάτω σκέλους · το καρότσι γέρνει δεξιά, να φαίνεται η άκρη που ξεκολλάει
    ctx.restore();
  }],
  ['blue', (ctx, th) => { // 8 · checklist · φακός σε pixels · αρχείο PDF που «ανοίγει» και βγαίνει JPG
    let y = cardTitle(ctx, 'Τι αρχείο **έχεις;**', X0, 230, th, { size: 130 });
    y = checkItem(ctx, 'Zoom πολύ κοντά: τετραγωνάκια = raster, καθαρή άκρη = vector', X0, y + 36, th, 720);
    y = checkItem(ctx, 'AI, SVG, EPS: συνήθως vector', X0, y + 22, th, 721);
    y = checkItem(ctx, 'PDF: εξαρτάται. Ένα JPG μέσα σε PDF μένει raster.', X0, y + 22, th, 722);
    const Z = 820, r = 112, lx = 255, ly = 1060, a = -2.3, fx = Z / 2 + Math.cos(a) * Z * 0.43, fy = Z / 2 + Math.sin(a) * Z * 0.43;
    lens(ctx, lx, ly, r, 0.9, c => mosaic(c, LOGO, lx - fx, ly - fy, Z / LOGO.w, inCircle(lx - fx, ly - fy, Z / LOGO.w, lx, ly, r)), 5300);
    polaroid(ctx, 700, 975, 190, 0.16, 6100);
    cardTag(ctx, 'JPG', 770, 895, 0.12, th, { size: 34, seed: 711, col: th.acc, ink: C.navy });
    fileDoc(ctx, 650, 1110, 230, 260, 'PDF', -0.04);
  }],
  ['paper', (ctx, th) => { // 9 · CTA · Στράτος thumb up, κρατάει φύλλο με το λογότυπο σε vector · χάρτινο αεροπλανάκι
    let y = cardTitle(ctx, 'Έχεις το λογότυπό σου\nμόνο σε JPG;\n**Στείλε μας μήνυμα.**', X0, 230, th, { size: 130 });
    y = cardSub(ctx, 'Το ξανασχεδιάζουμε σε vector.', X0, y + 30, th);
    paperPlane(ctx, 880, y - 40, 0.85, -0.3);
    const s = 0.7, x = 740, sh = 1000, pose = { arms: [0.9, 1.4], elbowL: 1.2, elbowR: -1.6, handL: 'grip', handR: 'thumb', legs: false, mouth: 'grin', eyes: 'happy', brows: 0.4 };
    const [hx, hy] = handPos(-1, 0.9, s, x, sh, 1.2);
    ctx.save(); ctx.translate(hx - 105, hy - 80); ctx.rotate(-0.1);                           // φύλλο με το λογότυπο: πίσω από το χέρι που το κρατάει
    cut(ctx, rectPts(-110, -140, 220, 280), '#FFFFFF', { seed: 7500, amp: 2, edgeW: 7 });
    kostasLogo(ctx, 0, -18, 170); txt(ctx, 'SVG', 0, 106, { font: '30px Brand', color: BRAND });
    ctx.restore();
    stratos(ctx, x, sh, s, pose);
  }],
];

module.exports = require('./carousel.js')({ name: 'ka02_vector', CARDS });
