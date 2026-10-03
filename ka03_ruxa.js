// ka03_ruxa — CAROUSEL «Κέντημα, DTF ή μεταξοτυπία; Ποιο να διαλέξω;» · 8 κάρτες 1080×1350 (4:5) · χωρίς VO / μουσική
// Σενάριο: scripts/ka03.md · σκελετός: node new.js ka03_ruxa (2026-10-03) · look: STYLE_GUIDE §7 Carousel (κάρτα 1 = χαρτί, μετά εναλλάξ μπλε / χαρτί)
// Runner: carousel.js (φόντο + υφή μόνο στο φόντο · σήμα + STRATEGIX STUDIOS κάτω · βελάκι → · lint) · props: node api.js carousel
// CLI: node ka03_ruxa.js 1 2 → style frames (ka03_ruxa_preview.png) · node ka03_ruxa.js check → lint + sheet · node ka03_ruxa.js → ka03_ruxa_NN.jpg + sheet
// Νήμα: KOSTAS COFFEE σε 3 υφές (κέντημα · DTF · μεταξοτυπία) + 3 κριτήρια = 3 εικονίδια (κομμάτια · χρώματα · ρούχο) στην ίδια θέση στις κάρτες 2–5
const L = require('./lib.js');
const { C, cut, rectPts, rrPts, circlePts, txt, rng } = L;
const P = require('./props.js');                      // node api.js → κατάλογος · node api.js carousel → κάρτες
const { BRAND, CARD, cardTitle, cardSub, cardTag, kostasLogo, stitched, tshirt, hoodie, screenFrame, SCREEN, stamp, paperPlane } = P;
const X0 = CARD.X0, CW = CARD.W, CH = CARD.H;

// ---------- KOSTAS COFFEE σε 3 υφές (size = διάμετρος, όπως kostasLogo) ----------
const SHIRT = '#FFFFFF', KD = '#7A3E1D', KF = '#F5E6C8';            // λευκό ύφασμα · χρώματα του λογότυπου (δίσκος · σχέδιο)
const SCR_INK = BRAND;                                               // μεταξοτυπία: ένα έντονο μελάνι
const cupPath = c => { c.beginPath(); c.moveTo(-62, -82); c.lineTo(62, -82); c.lineTo(50, 0); c.quadraticCurveTo(0, 16, -50, 0); c.closePath(); };   // η κούπα του kostasLogo (μονάδες 400)
// κέντημα: δίσκος tatami (καφέ κλωστή) · δαχτυλίδι, χερούλι, ατμός, γράμματα satin (κρεμ) · κούπα tatami (κρεμ)
function logoEmb(ctx, x, y, size, o = {}) {
  const s = size / 400, disk = c => { c.scale(s, s); c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, 190, 0, 7); c.fill(); };
  stitched(ctx, x, y, size, size, [
    { col: KD, kind: 'fill', ang: 0.62, draw: disk },
    { col: KF, kind: 'satin', ang: 1.2, draw: c => { kostasLogo(c, 0, 0, size, { disk: 'rgba(0,0,0,0)', fg: '#000' }); c.scale(s, s); c.globalCompositeOperation = 'destination-out'; cupPath(c); c.fill(); } },
    { col: KF, kind: 'fill', ang: -0.05, draw: c => { c.scale(s, s); c.fillStyle = '#000'; cupPath(c); c.fill(); } },
  ], { sp: o.sp || 3, key: 'ka03-emb-' + size });
}
// DTF: όλα τα χρώματα μαζί (διαβαθμίσεις) + λεπτή γυαλάδα (το τύπωμα κάθεται πάνω στο ύφασμα)
function logoDTF(ctx, x, y, size) {
  const g = ctx.createRadialGradient(-80, -100, 10, 0, 0, 205); g.addColorStop(0, '#FFC15E'); g.addColorStop(0.4, '#F0703F'); g.addColorStop(0.75, '#B4325E'); g.addColorStop(1, '#55307E');
  const f = ctx.createLinearGradient(0, -170, 0, 170); f.addColorStop(0, '#FFFBEF'); f.addColorStop(1, '#FFE29A');
  kostasLogo(ctx, x, y, size, { disk: g, fg: f });
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, size * 0.475, 0, 7); ctx.clip();
  const h = ctx.createLinearGradient(x - size * 0.5, y - size * 0.5, x + size * 0.5, y + size * 0.5);
  h.addColorStop(0.18, 'rgba(255,255,255,0)'); h.addColorStop(0.3, 'rgba(255,255,255,0.22)'); h.addColorStop(0.42, 'rgba(255,255,255,0)');
  ctx.fillStyle = h; ctx.fillRect(x - size, y - size, size * 2, size * 2); ctx.restore();
}
// μεταξοτυπία: ένα μελάνι (ο δίσκος) · το σχέδιο = το ύφασμα που μένει ακάλυπτο · κόκκος μελανιού
function logoScreen(ctx, x, y, size, o = {}) {
  kostasLogo(ctx, x, y, size, { disk: o.ink || SCR_INK, fg: o.bg || SHIRT });
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, size * 0.475, 0, 7); ctx.clip(); const r = rng(3303); ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 260; i++) ctx.fillRect(x - size / 2 + r() * size, y - size / 2 + r() * size, 2 + r() * 3, 2 + r() * 3);
  ctx.restore();
}

// ---------- 3 κριτήρια = 3 χάρτινα εικονίδια (ίδια σειρά παντού) · (x, y) = κέντρο · s 1 ≈ 150 px ----------
function iconPieces(ctx, x, y, s, th) { // στοίβα διπλωμένα μπλουζάκια = πόσα κομμάτια
  const cols = th.dark ? [C.paper, C.sky, C.gold] : [C.navy, BRAND, C.sky];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  [[0, 44, -0.03], [6, 4, 0.02], [-4, -36, -0.02]].forEach(([dx, dy, rt], i) => {
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(rt);
    cut(ctx, rrPts(-72, -20, 144, 40, 8), cols[i], { seed: 3400 + i, amp: 1.2, edgeW: 5, sx: 3, sy: 4 });
    if (i === 2) cut(ctx, [[-22, -20], [22, -20], [0, 4]], th.dark ? C.blue : C.paper, { seed: 3410, amp: 0.6, edgeW: 3, shadow: false });   // λαιμόκοψη
    ctx.restore();
  });
  ctx.restore();
}
function drop(ctx, x, y, r, col, seed) { // σταγόνα: μύτη πάνω, (x, y) = κέντρο του στρογγυλού κάτω μέρους
  const d = 1.75 * r, a0 = Math.acos(r / d), pts = [[x, y - d]];
  for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 + a0 + (i / 20) * (2 * Math.PI - 2 * a0); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  cut(ctx, pts, col, { seed, amp: 1, edgeW: 5, sx: 3, sy: 4 });
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y + r * 0.35, r * 0.13, r * 0.24, 0.3, 0, 7); ctx.fill();
}
function iconInk(ctx, x, y, s) { // σταγόνες μελανιού = πόσα χρώματα
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  drop(ctx, -44, 10, 36, '#22B5E6', 3420); drop(ctx, 44, 10, 36, '#F5D547', 3421); drop(ctx, 0, -8, 42, '#E2438F', 3422);
  ctx.restore();
}
function iconHanger(ctx, x, y, s, th) { // κρεμάστρα = τι ρούχο
  const col = th.dark ? C.paper : C.navy;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const shape = () => { ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-74, 36); ctx.lineTo(74, 36); ctx.closePath(); ctx.moveTo(0, -18); ctx.lineTo(0, -32);
    ctx.arc(14, -46, 16, Math.PI * 0.75, Math.PI * 2.1); };
  ctx.save(); ctx.translate(3, 4); ctx.strokeStyle = 'rgba(5,10,30,0.22)'; ctx.lineWidth = 20; shape(); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 20; shape(); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 11; shape(); ctx.stroke();
  ctx.restore();
}
const ICONS = [iconPieces, iconInk, iconHanger], CRIT = ['κομμάτια', 'χρώματα', 'ρούχο'], COLS = [215, 520, 825];
// μπάρα κριτηρίων (κάρτες 3–5): εικονίδιο · κριτήριο · απάντηση, στις ίδιες στήλες με την κάρτα 2
function specBar(ctx, th, y, vals) {
  ctx.save(); ctx.strokeStyle = th.dark ? 'rgba(255,255,255,0.35)' : 'rgba(11,27,63,0.25)'; ctx.lineWidth = 3; ctx.setLineDash([10, 9]);
  for (const xx of [(COLS[0] + COLS[1]) / 2, (COLS[1] + COLS[2]) / 2]) { ctx.beginPath(); ctx.moveTo(xx, y + 10); ctx.lineTo(xx, y + 190); ctx.stroke(); }
  ctx.restore();
  vals.forEach((v, i) => {
    ICONS[i](ctx, COLS[i], y + 48, 0.62, th);
    txt(ctx, CRIT[i], COLS[i], y + 112, { font: '30px GeoS', color: th.dark ? C.pale : C.blue });
    ctx.save(); ctx.font = '36px GeoX'; const ls = v.includes('\n') ? v.split('\n') : L.wrap(ctx, v, 300); ctx.restore();
    ls.forEach((l, j) => txt(ctx, l, COLS[i], y + 156 + j * 43, { font: '36px GeoX', color: th.ink }));
  });
}

// ---------- κάρτα 1: λευκό μπλουζάκι σκισμένο σε 3 κάθετες λωρίδες, το ίδιο λογότυπο σε 3 υφές ----------
function tornShirt(ctx, cx, cy, s, fns) {
  const XB = [-1000, -84, 84, 1000], BOT = 262, SH = [[-30, 6, -0.035], [0, -8, 0.006], [30, 4, 0.03]];
  for (let i = 0; i < 3; i++) {
    const cv = L.createCanvas(CW, CH), c = cv.getContext('2d');
    tshirt(c, cx, cy, s, 0, { color: SHIRT, seed: 7300, scrib: '#F1EEE6', logoFn: fns[i] });
    const x0 = Math.max(-60, cx + XB[i] * s), x1 = Math.min(CW + 60, cx + XB[i + 1] * s), top = cy - 520 * s, bot = cy + BOT * s;
    const band = L.tear(rectPts(x0, top, x1 - x0, bot - top), 9100 + i * 17, 7, 13);
    c.globalCompositeOperation = 'destination-in'; L.path(c, band); c.fillStyle = '#000'; c.fill();
    c.globalCompositeOperation = 'source-atop'; c.strokeStyle = 'rgba(200,192,175,0.9)'; c.lineWidth = 3; L.path(c, band); c.stroke();   // ίνες στο σκίσιμο
    c.globalCompositeOperation = 'source-over';
    const mx = (Math.max(x0, cx - 410 * s) + Math.min(x1, cx + 410 * s)) / 2;
    ctx.save(); ctx.translate(mx + SH[i][0], cy + SH[i][1]); ctx.rotate(SH[i][2]); ctx.translate(-mx, -cy);
    ctx.shadowColor = 'rgba(5,10,30,0.22)'; ctx.shadowBlur = 16; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 9;
    ctx.drawImage(cv, 0, 0); ctx.restore();
  }
}

// κάρτα = [θέμα, (ctx, th) => …] · th = P.CARD_TH[θέμα]: ink τίτλος · acc έμφαση (**…**) · sub · dark · γραφικά γύρω από το κείμενο, όχι στο κέντρο · κάτω ~150 px μόνο σήμα + βελάκι
const CARDS = [
  ['paper', (ctx, th) => { // 1 · Εξώφυλλο · λευκό μπλουζάκι σκισμένο σε 3 λωρίδες: κεντημένο · πολύχρωμο DTF · μονόχρωμη μεταξοτυπία
    let y = cardTitle(ctx, 'Κέντημα, DTF ή\nμεταξοτυπία;\n**Ποιο να διαλέξω;**', X0, 70, th, { size: 130 });
    y = cardSub(ctx, 'Ίδιο λογότυπο, τρεις τρόποι. Ο καθένας κάνει για άλλη δουλειά.', X0, y + 22, th);
    const S = 0.92, cx = 540, cy = y + 40 + 350 * S, LS = 400;
    tornShirt(ctx, cx, cy, S, [c => logoEmb(c, 0, 0, LS), c => logoDTF(c, 0, 0, LS), c => logoScreen(c, 0, 0, LS)]);
    const ty = cy + 196 * S;
    [['Κέντημα', 250, -0.04], ['DTF', 488, 0.03], ['Μεταξοτυπία', 650, -0.03]].forEach(([s, x, r], i) => cardTag(ctx, s, x, ty, r, th, { size: 34, seed: 710 + i }));
  }],
  ['blue', (ctx, th) => { // 2 · Re-hook · tag «Κέντημα · DTF · Μεταξοτυπία» · 3 κριτήρια = 3 χάρτινες κάρτες με εικονίδιο (ίδιες στήλες με τη μπάρα των καρτών 3–5)
    cardTag(ctx, 'Κέντημα · DTF · Μεταξοτυπία', X0, 90, -0.02, th, { size: 38, seed: 720 });
    let y = cardTitle(ctx, 'Δεν υπάρχει «καλύτερο».\nΥπάρχει **το σωστό**.', X0, 220, th, { size: 130 });
    y = cardSub(ctx, 'Το κρίνουν τρία πράγματα: πόσα κομμάτια, πόσα χρώματα, τι ρούχο.', X0, y + 28, th);
    const pth = P.CARD_TH.paper, cy = Math.max(y + 300, 860);
    ['πόσα\nκομμάτια;', 'πόσα\nχρώματα;', 'τι\nρούχο;'].forEach((lb, i) => {
      ctx.save(); ctx.translate(COLS[i], cy); ctx.rotate([-0.04, 0.025, -0.02][i]);
      cut(ctx, rrPts(-140, -200, 280, 400, 22), C.paper, { seed: 730 + i, amp: 2, edgeW: 8, scribble: '#EDE7D8' });
      ICONS[i](ctx, 0, -80, 1.3, pth);
      lb.split('\n').forEach((l, j) => txt(ctx, l, 0, 78 + j * 54, { font: '48px GeoX', color: C.navy }));
      ctx.restore();
    });
  }],
  ['paper', (ctx, th) => { // 3 · navy καπέλο με κεντημένο λογότυπο + κουβαρίστρα και βελόνα με κλωστή · μπάρα κριτηρίων
    spoolNeedle(ctx, 190, 250);
    P.cap(ctx, 650, 300, 0.92, { logoFn: c => logoEmb(c, 0, 0, 252) });
    let y = cardTitle(ctx, '**Κέντημα**:\nκλωστή, όχι μελάνι', X0, 590, th, { size: 130 });
    y = cardSub(ctx, 'Το λογότυπο ράβεται βελονιά-βελονιά. Ανάγλυφο, με γυαλάδα.', X0, y + 18, th);
    specBar(ctx, th, 975, ['λίγα ή πολλά', 'λίγα, καθαρά', 'καπέλα, πόλο, μπουφάν']);
  }],
  ['blue', (ctx, th) => { // 4 · μπλουζάκι με πολύχρωμο λογότυπο · μπάρα κριτηρίων
    dtfShirt(ctx, 560, 440, 0.86);
    let y = cardTitle(ctx, '**DTF**: όλα\nτα χρώματα μαζί', X0, 590, th, { size: 130 });
    y = cardSub(ctx, 'Τυπώνεται σε film και κολλάει στο ρούχο με πρέσα.', X0, y + 18, th);
    specBar(ctx, th, 975, ['λίγα,\nακόμα και ένα', 'όσα θες', 'μπλουζάκια, φούτερ, τσάντες']);
  }],
  ['paper', (ctx, th) => { // 5 · τελάρο με το στένσιλ + σπάτουλα με μελάνι · πίσω άλλα 2 τελάρα (ένα ανά χρώμα) · μπάρα κριτηρίων
    screens(ctx, 560, 300);
    let y = cardTitle(ctx, '**Μεταξοτυπία**: ένα\nτελάρο για κάθε χρώμα', X0, 590, th, { size: 130 });
    y = cardSub(ctx, 'Το μελάνι περνάει από πλέγμα με σπάτουλα. Από τους πιο παλιούς τρόπους, κι από τους πιο γερούς.', X0, y + 18, th, { size: 42 });
    specBar(ctx, th, 975, ['πολλά ίδια', 'λίγα, έντονα', 'μπλουζάκια, φούτερ, τσάντες']);
  }],
  ['blue', (ctx, th) => { // 6 · quiz: 3 χάρτινα δελτία παραγγελίας Α · Β · Γ
    let y = cardTitle(ctx, 'Εσύ ποιο θα **διάλεγες**;', X0, 80, th, { size: 130 });
    y = cardSub(ctx, 'Τρεις παραγγελίες. Μάντεψε πριν το →', X0, y + 20, th);
    ORDERS.forEach((od, i) => orderSlip(ctx, i, y + 60 + i * 245, od));
  }],
  ['paper', (ctx, th) => { // 7 · απαντήσεις: τα ίδια δελτία με σφραγίδα + το γιατί
    let y = cardTitle(ctx, 'Το **βρήκες**;', X0, 80, th, { size: 130 });
    ORDERS.forEach((od, i) => orderSlip(ctx, i, y + 50 + i * 300, od, true));
  }],
  ['blue', (ctx, th) => { // 8 · CTA · κινητό: το λογότυπο + «30 καπέλα, λογότυπο σε 2 χρώματα» · αεροπλανάκι
    let y = cardTitle(ctx, 'Δεν ξέρεις ποιο σου\nταιριάζει; **Στείλε**\n**μας μήνυμα.**', X0, 80, th, { size: 130 });
    y = cardSub(ctx, 'Πες μας πόσα κομμάτια και τι ρούχο, στείλε το λογότυπο. Σου λέμε εμείς.', X0, y + 24, th);
    const py = Math.max(y + 400, 1060), ay = py - 180;                                    // αεροπλανάκι φεύγει από το μήνυμα προς τα πάνω-αριστερά
    P.pinRoute(ctx, [[500, py - 70], [400, ay + 40], [300, ay + 10]], 'rgba(255,255,255,0.7)');
    ctaPhone(ctx, 700, py);
    ctx.save(); ctx.translate(230, ay - 10); ctx.scale(-1, 1); paperPlane(ctx, 0, 0, 1.4, -0.3); ctx.restore();
  }],
];

// ---------- κάρτα 4: μπλουζάκι (σκισμένο κάτω, όπως στην κάρτα 1) με το πολύχρωμο λογότυπο (χωρίς film: Αλέξανδρος, άτσαλο / δεν διαβαζόταν) ----------
function dtfShirt(ctx, cx, cy, s) {
  const cv = L.createCanvas(CW, CH), c = cv.getContext('2d'), LS = 330;
  tshirt(c, cx, cy, s, 0, { color: SHIRT, seed: 7310, scrib: '#F1EEE6', logoFn: x => logoDTF(x, 0, 0, LS) });
  const band = L.tear(rectPts(-60, -60, CW + 120, cy + 90 * s + 60), 9160, 7, 13);
  c.globalCompositeOperation = 'destination-in'; L.path(c, band); c.fill(); c.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.025); ctx.translate(-cx, -cy); ctx.drawImage(cv, 0, 0);
  ctx.restore();
}

// ---------- κάρτα 5: τελάρα ----------
function squeegee(ctx, x, y, hw, rot) { // σπάτουλα (κάτοψη): λαβή + λάμα + κορδόνι μελανιού μπροστά
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const bead = []; for (let xx = -hw + 16; xx <= hw - 16; xx += 22) bead.push([xx, 30 + 3 * Math.sin(xx * 0.05)]);
  for (let xx = hw - 16; xx >= -hw + 16; xx -= 22) bead.push([xx, 58 + 6 * Math.sin(xx * 0.037 + 1)]);
  cut(ctx, bead, SCR_INK, { seed: 3620, amp: 2.5, step: 18, edgeW: 3, sx: 3, sy: 4 });
  ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#9DB4FF'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-hw + 40, 40); ctx.lineTo(hw * 0.2, 39); ctx.stroke(); ctx.restore();
  cut(ctx, rrPts(-hw, -30, hw * 2, 44, 16), '#26356A', { seed: 3600, amp: 2, edgeW: 6 });
  cut(ctx, rrPts(-hw + 6, 12, hw * 2 - 12, 16, 6), C.pale, { seed: 3601, amp: 1, edgeW: 3, shadow: false });
  ctx.restore();
}
function screens(ctx, x, y) {
  const LS = 300;
  [['#D8A93B', 150, -120, 0.08], ['#F0715A', 75, -60, 0.04]].forEach(([ink, dx, dy, r], i) =>    // πίσω: ένα τελάρο ανά χρώμα (μελάνι στην πάνω άκρη)
    screenFrame(ctx, x + dx, y + dy, 300, 210, { col: SCREEN.wood, fill: SCREEN.emul, rot: r, seed: 7520 + i * 3,
      inner: (c, iw, ih) => cut(c, rrPts(-iw + 16, -ih + 10, iw * 2 - 32, 46, 20), ink, { seed: 7540 + i, amp: 2.5, step: 16, edgeW: 3, sx: 2, sy: 3 }) }));
  screenFrame(ctx, x, y, 320, 225, { col: SCREEN.wood, fill: SCREEN.emul, rot: -0.02, seed: 7530,
    inner: c => kostasLogo(c, -30, -10, LS, { disk: SCR_INK, fg: SCREEN.emul }) });
  squeegee(ctx, x + 10, y + 128, 300, -0.02);
}

// ---------- κάρτες 6–7: δελτία παραγγελίας ----------
const ORDERS = [
  { L: 'Α', big: '30 καπέλα', small: 'για το προσωπικό', ans: 'ΚΕΝΤΗΜΑ', why: 'στο καπέλο δείχνει premium', icon: (c, s) => P.cap(c, 0, 0, s * 0.3, { logoFn: x => kostasLogo(x, 0, 0, 220) }) },
  { L: 'Β', big: '200 ίδια μπλουζάκια', small: 'λογότυπο σε ένα χρώμα', ans: 'ΜΕΤΑΞΟΤΥΠΙΑ', why: 'πολλά ίδια, ένα χρώμα = ένα τελάρο',
    icon: (c, s) => [[-26, 18], [0, 0], [26, -18]].forEach(([dx, dy], i) => tshirt(c, dx * s, dy * s, s * 0.2, 0, { color: SHIRT, seed: 7400 + i, logoFn: i === 2 ? x => logoScreen(x, 0, 0, 260) : null })) },
  { L: 'Γ', big: '15 φούτερ', small: 'με πολύχρωμο σχέδιο', ans: 'DTF', why: 'λίγα κομμάτια, όλα τα χρώματα μαζί', icon: (c, s) => hoodie(c, 0, 0, s * 0.27, 0, { color: C.navy, logoFn: x => logoDTF(x, 0, 0, 230) }) },
];
function orderSlip(ctx, i, y, od, answer) {
  const h = answer ? 270 : 215, w = CW - 2 * X0, rot = [-0.012, 0.01, -0.008][i];
  ctx.save(); ctx.translate(CW / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-CW / 2, -(y + h / 2));
  cut(ctx, rrPts(X0, y, w, h, 18), C.paper, { seed: 740 + i, amp: 2, edgeW: 8, scribble: '#EDE7D8' });
  ctx.save(); ctx.strokeStyle = 'rgba(11,27,63,0.18)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X0 + 150, y + 24); ctx.lineTo(X0 + 150, y + h - 24); ctx.stroke(); ctx.restore();   // διάτρηση δελτίου
  cut(ctx, circlePts(X0 + 76, y + 82, 50), BRAND, { seed: 750 + i, amp: 2, edgeW: 7 });
  txt(ctx, od.L, X0 + 76, y + 86, { font: '64px Geo', color: C.paper });
  const tx = X0 + 185;
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.navy; ctx.font = '50px GeoX'; ctx.fillText(od.big, tx, y + 92);
  ctx.fillStyle = C.blue; ctx.font = '40px GeoS'; ctx.fillText(od.small, tx, y + 146); ctx.restore();
  if (answer) {
    ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = BRAND; ctx.font = '38px GeoX'; ctx.fillText('→ ' + od.why, tx, y + 218); ctx.restore();
    stamp(ctx, 1, 0, X0 + w - 190, y + 2, od.ans, [0.05, -0.04, 0.06][i], C.navy, 36);
  } else { ctx.save(); ctx.translate(X0 + w - 100, y + h / 2 + 6); od.icon(ctx, 0.92); ctx.restore(); }
  ctx.restore();
}

// ---------- κάρτα 8: κινητό με το μήνυμα (κάτω άκρη έξω από την κάρτα) ----------
function ctaPhone(ctx, cx, cy) {
  P.phoneFrame(ctx, cx, cy, 500, 780, (c, w, h) => {
    c.fillStyle = '#EEF3FC'; c.fillRect(0, 0, w, h);
    cut(c, rrPts(w - 236, 40, 210, 210, 22), '#FFFFFF', { seed: 760, amp: 1, edgeW: 4, sx: 3, sy: 4 });     // συνημμένο: το λογότυπο
    kostasLogo(c, w - 131, 145, 170);
    cut(c, rrPts(28, 278, w - 54, 132, 26), BRAND, { seed: 761, amp: 1.5, edgeW: 5, sx: 3, sy: 4 });      // μήνυμα
    c.save(); c.fillStyle = '#FFFFFF'; c.font = '32px GeoX'; c.textBaseline = 'alphabetic'; c.fillText('30 καπέλα, λογότυπο', 48, 332); c.fillText('σε 2 χρώματα', 48, 376); c.restore();
    L.check(c, w - 74, 430, 0.3, BRAND); L.check(c, w - 58, 430, 0.3, BRAND);              // ✓✓ στάλθηκε (η Geologica δεν έχει ✓)
  }, { rot: 0.05, seed: 7700 });
}

// κουβαρίστρα (κρεμ κλωστή) + βελόνα · η κλωστή πάει από την κουβαρίστρα στο μάτι της βελόνας · (x, y) = κέντρο κουβαρίστρας
function spoolNeedle(ctx, x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08);
  cut(ctx, rrPts(-62, -96, 124, 26, 10), '#C49A68', { seed: 3500, amp: 1, edgeW: 5 });
  cut(ctx, rrPts(-48, -74, 96, 148, 6), KF, { seed: 3501, amp: 1, edgeW: 5 });
  ctx.save(); L.path(ctx, rrPts(-48, -74, 96, 148, 6)); ctx.clip(); ctx.strokeStyle = 'rgba(122,62,29,0.22)'; ctx.lineWidth = 2;
  for (let yy = -70; yy < 74; yy += 6) { ctx.beginPath(); ctx.moveTo(-50, yy); ctx.lineTo(50, yy + 4); ctx.stroke(); }
  const g = ctx.createLinearGradient(-48, 0, 48, 0); g.addColorStop(0, 'rgba(0,0,0,0.12)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = g; ctx.fillRect(-50, -76, 100, 152); ctx.restore();
  cut(ctx, rrPts(-62, 70, 124, 26, 10), '#C49A68', { seed: 3502, amp: 1, edgeW: 5 });
  ctx.restore();
  // κλωστή → βελόνα
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(5,10,30,0.18)'; ctx.lineWidth = 5;
  const th = () => { ctx.beginPath(); ctx.moveTo(x + 44, y + 30); ctx.bezierCurveTo(x + 150, y + 120, x + 40, y + 250, x + 120, y + 268); };
  ctx.save(); ctx.translate(3, 4); th(); ctx.stroke(); ctx.restore(); ctx.strokeStyle = '#E9D5B0'; ctx.lineWidth = 4; th(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(x + 132, y + 270); ctx.rotate(-0.55);
  cut(ctx, [[-14, -5], [150, -2], [178, 0], [150, 2], [-14, 5], [-20, 0]], '#BAC3D3', { seed: 3510, amp: 0.4, edgeW: 3, sx: 3, sy: 4 });
  ctx.fillStyle = '#7E89A2'; ctx.beginPath(); ctx.ellipse(-6, 0, 7, 2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(20, -2, 110, 1.5);
  ctx.restore();
}

module.exports = require('./carousel.js')({ name: 'ka03_ruxa', CARDS });
