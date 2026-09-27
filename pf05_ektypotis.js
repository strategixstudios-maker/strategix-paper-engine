// «Πώς φτιάχνεται;» — Πώς τυπώνει ένας εκτυπωτής μεγάλου φορμά (eco-solvent · Roland SP-300V του εργαστηρίου, χωρίς μάρκα στο βίντεο)
// host: Στράτος (από πίσω · PiP · χέρι · στο τέλος κρατάει το αυτοκόλλητό του) · VO ElevenLabs «Stratos» + SFX · 50,4s · seamless loop (LOOP: 'cut')
// Hook: μακροπλάνο κουκκίδων → zoom out: αυτοκόλλητο με τον Στράτο βγαίνει από τον εκτυπωτή · «μόνο 4 μελάνια — πώς βγάζει όλα τα χρώματα;»
// → 1 RIP: CMYK separations → 2 one-take «μικροσκόπιο»: φυσίγγια → σωληνάκι → αλυσίδα → damper (σταθερή πίεση) → ακροφύσιο (δεν στάζει)
// → πλάκα ακροφυσίων (σειρές ανά χρώμα) → 3 piezo (ρεύμα → λυγίζει → σταγόνα → χιλιάδες/δευτ.)
// v2 (κατ' απαίτηση): κόπηκε η ενότητα «μικρή/μεγάλη σταγόνα» (29–33s της v1) · σωστό contour (γωνία) · κοπή με X/Y όπως το τύπωμα
// → 4 περάσματα (κάτοψη) → 5 θερμαντήρας (τομή) → 6 contour cut: X = καρότσι, Y = βινύλιο (όπως στο τύπωμα), μόνο το βινύλιο → ξεκόλλημα + φακός στον σκούφο → CTA → zoom στις κουκκίδες = frame 0
// Ισχυρισμοί (datasheet + manual SP-300V): piezo · 4 φυσίγγια CMYK · variable droplet · print heater + dryer (35–50°C) · contour cut στο ίδιο μηχάνημα.
// Κεφαλή Epson DX4: ~8 kHz → «χιλιάδες φορές» · μικρότερη σταγόνα 3,5 pl ≈ 19 µm < τρίχα (50–100 µm) · damper = ελαφριά αρνητική πίεση, να μη στάζει.
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, lerp, clamp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow, cam, mixHex, rng } = L;
const { stratos } = require('./stratos.js');
const { BRAND, bgFlat, seriesTag, stamp, sparkle, stratosBack, reach, msgOut, pip, PIP, qmark, stepChip } = require('./props.js');

// VO = vo/pf05_vo.mp3 @ 0,2s — `node vo.js pf05` take 1 (seed 1000, κείμενο vo/pf05.txt) · παύσεις → 0,3s · «μουσταρδί» κολλητά (--keep 20:0.03).
// v2: οι φράσεις «Μικρή σταγόνα… γεμάτο χρώμα.» κόπηκαν από το ίδιο take με ffmpeg (29,03–32,93 στο αρχείο, −3,9s) → ίδια φωνή, χωρίς νέο generation.
// Χρονισμοί (video, (…) = μέσα στη φράση):
// 0,30 Αυτός ο εκτυπωτής (2,05) έχει μόνο τέσσερα μελάνια. | 3,17 Πώς βγάζει όλα τα χρώματα; | 4,73 Πρώτα, (5,28) το πρόγραμμα χωρίζει το σχέδιο
// (6,80) σε κυανό, (7,42) ματζέντα, (8,17) κίτρινο (8,65) και μαύρο. | 9,37 Το μελάνι ξεκινάει (10,03) από τα φυσίγγια (11,33) και ταξιδεύει σε λεπτά σωληνάκια, (13,12) ως την κεφαλή.
// 14,10 Λίγο πριν την κεφαλή, (15,32) ο ντάμπερ (16,00) κρατάει την πίεση σταθερή, (17,36) για να μη στάζει. | 18,37 Από κάτω, εκατοντάδες τρυπούλες, (20,40) σε σειρές για κάθε χρώμα.
// 21,90 Πίσω από κάθε τρύπα, (23,00) ένας πιεζοκρύσταλλος. | 24,47 Παίρνει ρεύμα, (25,39) λυγίζει, | 26,20 πετάει σταγόνα. | 27,30 Χιλιάδες φορές το δευτερόλεπτο.
// 29,23 Η κεφαλή τρέχει πέρα-δώθε, (30,95) και μετά από κάθε πέρασμα, (32,23) το βινύλιο προχωράει λίγο. | 33,87 Ένας θερμαντήρας ζεσταίνει το βινύλιο:
// 36,13 το μελάνι πιάνει (37,20) και στεγνώνει. | 38,10 Και στο τέλος, (38,93) το ίδιο μηχάνημα (40,02) κόβει με μαχαιράκι (41,10) γύρω-γύρω από το σχέδιο.
// 42,63 Κι ο σκούφος; | 43,57 Κίτρινες κουκκίδες με λίγες ματζέντα. (45,55) Το μάτι σου βλέπει μουσταρδί. | 47,50 Στείλε μας το σχέδιό σου, | 48,83 να το τυπώσουμε. (–49,70)
const T = { tessera: 2.05, pos: 3.17, xorizei: 5.28, kyano: 6.8, matz: 7.42, kitr: 8.17, mayro: 8.65, fysig: 10.03, taxid: 11.33, kefali: 13.12,
  ligo: 14.1, damper: 15.32, kratai: 16.0, stazei: 17.36, apokato: 18.37, seires: 20.4, piso: 21.9, piezo: 23.0, revma: 24.47, lygizei: 25.39,
  petaei: 26.2, xiliades: 27.3, trexei: 29.23, perasma: 30.95, vinylio: 32.23, therm: 33.87, piani: 36.13, stegn: 37.2,
  telos: 38.1, kovei: 40.02, gyro: 41.1, skoufos: 42.63, kitrines: 43.57, matz2: 44.65, mati: 45.55, moust: 46.5, steile: 47.5, typ: 48.83 };
const SC = [0, 4.6, 9.2, 18.25, 21.8, 29.1, 33.75, 38.0, 42.5, 47.4, 50.4];   // αρχές σκηνών + τέλος video
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const TAG = 'Πώς φτιάχνεται;', HOOK = 'Αυτός ο εκτυπωτής έχει μόνο 4 μελάνια.';

// ---------- χρώματα ----------
const INK = { C: '#16A3E0', M: '#E2358E', Y: '#F6D22F', K: '#262833' }, CH = ['C', 'M', 'Y', 'K'];
const STEEL = '#AEB8CC', STEELD = '#7E89A2', STEELL = '#D5DCE9', BODY = '#E9EDF4', LINER = '#E6DFCD', MUST = '#E8B04A';
// κεραυνός (ρεύμα) — σχήμα, όχι emoji (οι γραμματοσειρές μας δεν έχουν ⚡)
const bolt = (ctx, x, y, s, col) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.beginPath();
  [[6, -24], [-12, 4], [-1, 4], [-6, 24], [12, -6], [1, -6]].forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); };
const dot = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); };
// keyframes [[t, v], ...] → τιμή με easeInOut ανά τμήμα
const kf = (t, K, e = easeInOut) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], e(prog(t, K[i - 1][0], K[i][0]))); return K[K.length - 1][1]; };
const zkf = (t, K) => Math.exp(kf(t, K.map(([a, z]) => [a, Math.log(z)])));                 // zoom: εκθετικό (σταθερή αίσθηση ταχύτητας)

// ---------- το σχέδιο: αυτοκόλλητο με τον Στράτο (μπλε κύκλος + προτομή, ο σκούφος βγαίνει από πάνω) · ART 600×600 ----------
const AW = 600, G = 5, NC = AW / G;
const ART = L.createCanvas(AW, AW);
(() => {
  const x = ART.getContext('2d');
  x.save(); x.beginPath(); x.arc(300, 330, 225, 0, 7); x.rect(40, 0, 520, 330); x.clip();
  x.beginPath(); x.arc(300, 330, 225, 0, 7); x.fillStyle = BRAND; x.fill();
  stratos(x, 300, 470, 1.2, { seed: 1000, legs: false, mouth: 'grin', eyes: 'dot', brows: 0.6, arms: [0.12, 0.12] });
  x.restore();
})();
// RGB (πάνω σε λευκό) → CMYK κάλυψη 0..1 (ελαφρύ GCR: μαύρο μόνο στα σκούρα, όπως ένα RIP)
function cmyk(r, g, b) {
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255, k0 = Math.min(c, m, y), k = k0 > 0.3 ? (k0 - 0.3) / 0.7 : 0, d = 1 - k || 1;
  return [(c - k) / d, (m - k) / d, (y - k) / d, k].map(v => clamp(v));
}
// κάλυψη ανά κελί G×G (κουκκίδες) + separations σε pixel (οθόνη RIP)
const { COV, SEP } = (() => {
  const d = ART.getContext('2d').getImageData(0, 0, AW, AW).data, COV = CH.map(() => new Float32Array(NC * NC));
  const SEP = CH.map(() => L.createCanvas(AW, AW)), sd = SEP.map(c => c.getContext('2d').createImageData(AW, AW));
  const rgb = CH.map(k => L.hexRGB(INK[k]));
  for (let p = 0; p < AW * AW; p++) {
    const a = d[p * 4 + 3] / 255; if (a < 0.02) continue;
    const q = cmyk(255 - a * (255 - d[p * 4]), 255 - a * (255 - d[p * 4 + 1]), 255 - a * (255 - d[p * 4 + 2]));
    const i = Math.floor((p % AW) / G), j = Math.floor(p / AW / G);
    for (let k = 0; k < 4; k++) { COV[k][j * NC + i] += q[k] / (G * G); const o = sd[k].data; o[p * 4] = rgb[k][0]; o[p * 4 + 1] = rgb[k][1]; o[p * 4 + 2] = rgb[k][2]; o[p * 4 + 3] = q[k] * 255; }
  }
  for (const cv of COV) for (let n = 0; n < cv.length; n++) if (cv[n] < 0.1) cv[n] = 0;
  SEP.forEach((c, k) => c.getContext('2d').putImageData(sd[k], 0, 0));
  return { COV, SEP };
})();
// κουκκίδες μελανιού (stochastic, όπως inkjet): ανά κελί/χρώμα μία σταγόνα με πιθανότητα = κάλυψη, μεγαλύτερη στα γεμάτα (variable droplet)
const hsh = (i, j, k) => { let h = Math.imul(i + 1, 374761393) ^ Math.imul(j + 1, 668265263) ^ Math.imul(k + 1, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const JIT = [[-0.2, -0.17], [0.19, -0.12], [-0.1, 0.21], [0.15, 0.19]];
function artBounds(ctx) {                                                                  // ορατό τμήμα του καμβά σε συντεταγμένες ART
  const m = ctx.getTransform(), det = m.a * m.d - m.b * m.c;
  const inv = (x, y) => [((x - m.e) * m.d - (y - m.f) * m.c) / det, ((y - m.f) * m.a - (x - m.e) * m.b) / det];
  const ps = [inv(0, 0), inv(W, 0), inv(0, H), inv(W, H)];
  return [Math.min(...ps.map(p => p[0])), Math.min(...ps.map(p => p[1])), Math.max(...ps.map(p => p[0])), Math.max(...ps.map(p => p[1]))];
}
function inkDots(ctx, a, only) {
  const [x0, y0, x1, y1] = artBounds(ctx), i0 = Math.max(0, Math.floor(x0 / G) - 1), i1 = Math.min(NC - 1, Math.ceil(x1 / G) + 1);
  const j0 = Math.max(0, Math.floor(y0 / G) - 1), j1 = Math.min(NC - 1, Math.ceil(y1 / G) + 1);
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'multiply';
  for (const k of [2, 1, 0, 3]) {
    if (only && !only.includes(k)) continue;
    ctx.fillStyle = INK[CH[k]]; ctx.beginPath();
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const c = COV[k][j * NC + i]; if (!c || hsh(i, j, k) > c * 1.08) continue;
      const r = G * (0.25 + 0.2 * c) * (0.85 + 0.3 * hsh(j, i, k + 7)), x = (i + 0.5 + JIT[k][0]) * G, y = (j + 0.5 + JIT[k][1]) * G;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7);
    }
    ctx.fill();
  }
  ctx.restore();
}
// το τυπωμένο σχέδιο σε συντεταγμένες ART · LOD: λεία εικόνα → κουκκίδες όσο μεγαλώνει το zoom · o.clip [x, y, w, h] (ART) · o.wet γυαλάδα
function printArt(ctx, o = {}) {
  const m = ctx.getTransform(), px = Math.hypot(m.a, m.b), kD = o.dots ?? clamp((G * px - 9) / 12), a = o.alpha ?? 1;
  ctx.save();
  if (o.clip) { ctx.beginPath(); ctx.rect(...o.clip); ctx.clip(); }
  if (kD < 1) { ctx.globalAlpha = a * (1 - kD * kD); ctx.drawImage(ART, 0, 0); ctx.globalAlpha = 1; }
  if (kD > 0) inkDots(ctx, a * kD);
  ctx.restore();
}
// περίγραμμα κοπής (contour cut): ART + 16px περιθώριο, πολικό από το κέντρο → [x, y] σε ART + μήκη
const CONT = (() => {
  const D = 16, c = L.createCanvas(AW, AW), x = c.getContext('2d');
  for (let a = 0; a < 20; a++) x.drawImage(ART, Math.cos(a / 20 * 2 * Math.PI) * D, Math.sin(a / 20 * 2 * Math.PI) * D);
  x.drawImage(ART, 0, 0);
  const d = x.getImageData(0, 0, AW, AW).data, cx = 300, cy = 320, N = 220, R = [];
  for (let n = 0; n < N; n++) {
    const a = n / N * 2 * Math.PI - Math.PI / 2; let r = 296;                             // από την κορυφή, δεξιόστροφα
    for (; r > 0; r--) { const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r); if (px >= 0 && py >= 0 && px < AW && py < AW && d[(py * AW + px) * 4 + 3] > 80) break; }
    R.push(r);
  }
  const pts = R.map((_, n) => { let s = 0; for (let k = -4; k <= 4; k++) s += R[(n + k + N) % N]; const r = s / 9, a = n / N * 2 * Math.PI - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  let s = 0; const len = pts.map((p, i) => (s += i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0));
  return { pts, len, total: s + Math.hypot(pts[0][0] - pts[N - 1][0], pts[0][1] - pts[N - 1][1]) };
})();
function contourAt(p) { // σημείο του περιγράμματος στο ποσοστό p (0..1), από την κορυφή δεξιόστροφα
  const L0 = clamp(p) * CONT.total, { pts, len } = CONT; let i = 1; while (i < pts.length && len[i] < L0) i++;
  const a = pts[i - 1], b = pts[i % pts.length], f = (L0 - len[i - 1]) / ((i < pts.length ? len[i] : CONT.total) - len[i - 1] || 1);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, i];
}
// αυτοκόλλητο: (x, y) = κέντρο, s κλίμακα (1 = 600px) · o.die: κομμένο (λευκό βινύλιο γύρω γύρω + σκιά) · o.lift ύψος σκιάς · o.rot
function sticker(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.translate(-300, -300);
  if (o.die) {
    const lift = o.lift || 0;
    ctx.save(); ctx.translate(6 + lift * 20, 9 + lift * 30); L.path(ctx, CONT.pts); ctx.fillStyle = `rgba(10,20,50,${0.22 + lift * 0.12})`; ctx.fill(); ctx.restore();
    L.path(ctx, CONT.pts); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = 'rgba(16,26,51,0.18)'; ctx.lineWidth = 2 / s; ctx.stroke();
  }
  printArt(ctx, o);
  ctx.restore();
}
const BEAN = [264, 110];                                                                    // σημείο του σκούφου (ART) για το μακροπλάνο

// ---------- εκτυπωτής, πρόσοψη (hook): σώμα, στάντ, παράθυρο με το καρότσι, πάνελ, σχισμή εξόδου, βινύλιο που κρέμεται ----------
function printerFront(ctx, t, o = {}) {
  for (const lx of [150, 930]) { cut(ctx, rrPts(lx - 22, 800, 44, 860, 12), STEELD, { seed: 9200 + lx, amp: 1.5, edgeW: 5 }); cut(ctx, rrPts(lx - 95, 1640, 190, 36, 16), C.navy, { seed: 9203 + lx, amp: 1.5, edgeW: 5 }); }
  cut(ctx, rrPts(150, 1420, 780, 30, 12), STEEL, { seed: 9206, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(60, 560, 960, 270, 40), BODY, { seed: 9210, amp: 2, scribble: '#DCE2EC' });
  cut(ctx, rrPts(60, 560, 960, 64, 28), '#CBD3E1', { seed: 9211, amp: 1.5, edgeW: 5, shadow: false });
  const win = cut(ctx, rrPts(206, 642, 672, 108, 22), '#34466F', { seed: 9212, amp: 1.5, edgeW: 6 });
  ctx.save(); L.path(ctx, win); ctx.clip();
  ctx.fillStyle = STEEL; ctx.fillRect(206, 668, 672, 10);                                               // ράγα
  const cx = o.car ?? lerp(330, 750, 0.5 + 0.5 * Math.sin(t * 5));
  cut(ctx, rrPts(cx - 58, 662, 116, 76, 12), C.navy, { seed: 9213, amp: 1, edgeW: 4, shadow: false });
  CH.forEach((k, i) => { ctx.fillStyle = INK[k]; ctx.fillRect(cx - 40 + i * 22, 650, 10, 20); });
  ctx.restore();
  cut(ctx, rrPts(84, 642, 104, 108, 16), '#CBD3E1', { seed: 9214, amp: 1.5, edgeW: 5, shadow: false });   // πόρτα φυσιγγίων
  CH.forEach((k, i) => cut(ctx, rrPts(98 + i * 22, 660, 16, 72, 6), INK[k], { seed: 9215 + i, amp: 0.8, edge: false, shadow: false }));
  cut(ctx, rrPts(898, 642, 96, 108, 16), C.navy, { seed: 9220, amp: 1.5, edgeW: 5 });                    // πάνελ
  dot(ctx, 922, 672, 9, '#7EE0A0'); dot(ctx, 948, 672, 9, C.paper); dot(ctx, 972, 672, 9, C.paper);
  ctx.fillStyle = '#8FB0EE'; ctx.fillRect(914, 696, 66, 34);
  cut(ctx, rrPts(170, 786, 740, 30, 12), '#22304F', { seed: 9222, amp: 1, edgeW: 5, shadow: false });    // σχισμή εξόδου
}
function vinylHang(ctx) { cut(ctx, [[190, 800], [890, 800], [890, 1600], [870, 1640], [210, 1640], [190, 1600]], '#FFFFFF', { seed: 9230, amp: 1.5, edgeW: 0, sy: 10 }); }
// φυσίγγιο (πρόσοψη, όρθιο): σώμα navy, ετικέτα στο χρώμα του μελανιού, γράμμα
function cartridge(ctx, x, y, k, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, rrPts(-62, -110, 124, 220, 18), C.navy, { seed: 9240 + k, amp: 2, edgeW: 7 });
  cut(ctx, rrPts(-50, -60, 100, 120, 12), INK[CH[k]], { seed: 9245 + k, amp: 1, edgeW: 0, shadow: false });
  txt(ctx, CH[k], 0, 4, { font: '78px Brand', color: k === 2 ? C.ink : '#fff' });
  cut(ctx, rrPts(-22, -132, 44, 26, 8), STEEL, { seed: 9250 + k, amp: 0.8, edgeW: 4, shadow: false });
  ctx.restore();
}

// ---------- 0 · hook: κουκκίδες → zoom out → το αυτοκόλλητο στον εκτυπωτή · 4 φυσίγγια · «;» ----------
const HS = [540, 1130, 0.95], Z0 = 12;                                                     // αυτοκόλλητο στο βινύλιο (κέντρο, κλίμακα) · zoom του frame 0
const BW = [HS[0] + (BEAN[0] - 300) * HS[2], HS[1] + (BEAN[1] - 300) * HS[2]];               // ο σκούφος σε συντεταγμένες κόσμου
function hookWorld(ctx, t) {
  bgFlat(ctx, C.pale, '#C9D8F2', 51);
  printerFront(ctx, t, { car: 540 });
  vinylHang(ctx);
  sticker(ctx, ...HS);
}
function macro(ctx, z) { ctx.save(); cam(ctx, ...BW, z); hookWorld(ctx, 0); ctx.restore(); }   // frame 0 = macro(ctx, Z0) = τελευταίο frame
function hook(ctx, t) {
  const z = Math.exp(Math.log(Z0) * (1 - easeInOut(prog(t, 0.25, 1.75))));
  macro(ctx, z);
  CH.forEach((k, i) => pop(ctx, t, T.tessera + i * 0.13, 285 + i * 170, 690, () => cartridge(ctx, 0, 0, i, 0.95), (i - 1.5) * 0.05));
  const ring = easeOut(prog(t, T.pos + 0.1, T.pos + 0.8));                                  // «όλα τα χρώματα»: χρωματιστά κομμάτια γύρω γύρω
  if (ring > 0) {
    const cols = ['#E24A3B', '#F28C28', '#F6D22F', '#7AC943', '#1BAA8A', '#16A3E0', '#2854F3', '#7B4FD8', '#E2358E', '#8B5A2B'];
    cols.forEach((col, i) => { const a = i / cols.length * 2 * Math.PI + t * 0.6, r = 250 + 60 * ring;
      pop(ctx, t, T.pos + 0.1 + i * 0.05, HS[0] + Math.cos(a) * r * 1.1, HS[1] + Math.sin(a) * r, () => cut(ctx, circlePts(0, 0, 36, 36, 14), col, { seed: 9260 + i, amp: 1.5, edgeW: 6 })); });
  }
  pop(ctx, t, T.pos + 0.05, 800, 1010, () => qmark(ctx, 0, 0, 0.42, 0.08 * Math.sin((t - T.pos) * 5)), 0);
}

// ---------- 1 · RIP: το σχέδιο χωρίζεται σε κυανό, ματζέντα, κίτρινο, μαύρο (over-the-shoulder) ----------
const SCR = [104, 626, 872, 636], SEPC = [[654, 844], [856, 844], [654, 1064], [856, 1064]], WT = [T.kyano, T.matz, T.kitr, T.mayro];
function rip(ctx, t) {
  bgFlat(ctx, C.pale, '#C9D8F2', 52);
  cut(ctx, rrPts(80, 600, 920, 690, 34), C.navy, { seed: 9300, amp: 2.5, edgeW: 8 });
  cut(ctx, rrPts(470, 1286, 140, 90, 10), STEELD, { seed: 9301, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(360, 1360, 360, 34, 14), C.navy, { seed: 9302, amp: 1.5, edgeW: 5 });
  const [sx, sy, sw, sh] = SCR;
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#F4F7FD'; ctx.fillRect(sx, sy, sw, sh);
  ctx.fillStyle = '#2A3B73'; ctx.fillRect(sx, sy, sw, 50);
  txt(ctx, 'RIP · stratos_sticker.pdf', sx + 24, sy + 26, { font: 'bold 26px Round', color: '#fff', align: 'left' });
  for (let i = 0; i < 3; i++) dot(ctx, sx + sw - 30 - i * 28, sy + 25, 8, ['#F29C9C', '#F4D98A', C.sky][i]);
  const mv = easeInOut(prog(t, T.xorizei, T.xorizei + 0.6)), ax = lerp(540, 330, mv), ay = lerp(980, 960, mv), as = lerp(0.95, 0.55, mv);
  ctx.save(); ctx.translate(ax - 300 * as, ay - 300 * as); ctx.scale(as, as); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, AW, AW); ctx.drawImage(ART, 0, 0); ctx.restore();
  for (let k = 3; k >= 0; k--) {                                                            // separations: στοίβα → η θέση τους στη λέξη του VO
    const st = prog(t, T.xorizei + 0.3, T.xorizei + 0.9), fly = easeInOut(prog(t, WT[k] - 0.1, WT[k] + 0.35));
    if (st <= 0) continue;
    const x0 = ax + (k - 1.5) * 26 * st + 180 * st, y0 = ay + (k - 1.5) * 26 * st, x = lerp(x0, SEPC[k][0], fly), y = lerp(y0, SEPC[k][1], fly), s = lerp(0.36, 0.3, fly);
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - fly) * -0.05); ctx.globalAlpha = Math.min(1, st * 1.5);
    cut(ctx, rectPts(-300 * s, -300 * s, 600 * s, 600 * s), '#fff', { seed: 9310 + k, amp: 1, edgeW: 4 });
    ctx.drawImage(SEP[k], -300 * s, -300 * s, 600 * s, 600 * s); ctx.restore();
    if (fly > 0) pop(ctx, t, WT[k] + 0.1, SEPC[k][0], SEPC[k][1] + 108, () => {
      ctx.font = 'bold 30px Round'; const w = ctx.measureText(['κυανό', 'ματζέντα', 'κίτρινο', 'μαύρο'][k]).width + 70;
      cut(ctx, rrPts(-w / 2, -24, w, 48, 24), INK[CH[k]], { seed: 9320 + k, amp: 1.5, edgeW: 5 });
      txt(ctx, ['κυανό', 'ματζέντα', 'κίτρινο', 'μαύρο'][k], 0, 2, { font: 'bold 30px Round', color: k === 2 ? C.ink : '#fff' });
    });
  }
  ctx.restore();
  ctx.save(); ctx.filter = 'blur(6px)'; stratosBack(ctx, 110, 1760, 1.3); ctx.restore();   // ώμος σε πρώτο πλάνο, θολός
  stepChip(ctx, t - SC[1], 0.3, 1, 'Αρχείο');
}

// ---------- 2 · one-take «μικροσκόπιο»: η κάμερα ακολουθεί το κυανό μελάνι ----------
// κεντρική γραμμή της δέσμης (Catmull-Rom) → [x, y, s] · 4 σωληνάκια σε παράλληλες αποστάσεις (ανοιχτά στα φυσίγγια / στο καρότσι, σφιχτά στη διαδρομή)
const RP = (() => {
  const K = [[420, 1800], [800, 1800], [1150, 1790], [1400, 1700], [1520, 1480], [1540, 1200], [1590, 930], [1780, 790], [1980, 900], [2030, 1100], [2030, 1250], [2030, 1400], [2030, 1560]];
  const pts = [];
  for (let i = 0; i < K.length - 1; i++) {
    const p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(K.length - 1, i + 2)];
    for (let n = 0; n < 24; n++) { const u = n / 24, u2 = u * u, u3 = u2 * u; pts.push([0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); }
  }
  pts.push(K[K.length - 1]);
  let s = 0; return pts.map((p, i) => { if (i) s += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); return [p[0], p[1], s]; });
})();
const RLEN = RP[RP.length - 1][2], sOf = (x, y) => RP.reduce((b, p) => (Math.hypot(p[0] - x, p[1] - y) < Math.hypot(b[0] - x, b[1] - y) ? p : b))[2];
const S_CH0 = sOf(1540, 1200), S_CH1 = sOf(2030, 1100), S_CAR = sOf(2030, 1130), S_DMP = sOf(2030, 1300), S_HEAD = sOf(2030, 1420);
function rAt(s) {
  s = clamp(s, 0, RLEN); let lo = 0, hi = RP.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (RP[m][2] < s) lo = m; else hi = m; }
  const a = RP[lo], b = RP[hi], f = (s - a[2]) / (b[2] - a[2] || 1), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return [a[0] + dx * f, a[1] + dy * f, dx / l, dy / l];
}
const spc = s => s < 420 ? lerp(120, 34, easeInOut(s / 420)) : s > S_CAR - 60 ? lerp(34, 95, easeInOut(prog(s, S_CAR - 60, S_CAR + 60))) : 34;
const tubeAt = (i, s) => { const [x, y, dx, dy] = rAt(s), o = (i - 1.5) * spc(s); return [x - dy * o, y + dx * o, dx, dy]; };
const NOZ = i => [tubeAt(i, RLEN)[0], 1640];                                                // ακροφύσιο κάθε χρώματος (κάτω από την κεφαλή)
// σωληνάκι: διάφανο τοίχωμα + μελάνι που κυλάει (ραβδώσεις με lineDashOffset = ροή) · ως το s1
function tube(ctx, i, s1, flow) {
  const pts = []; for (let s = 0; s <= s1; s += 10) pts.push(tubeAt(i, s));
  const line = (w, col, dash) => { ctx.beginPath(); pts.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.setLineDash(dash || []); ctx.lineDashOffset = dash ? -flow : 0; ctx.stroke(); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  line(34, 'rgba(10,20,50,0.18)');                                                        // σκιά
  ctx.translate(-3, -4); line(30, '#F4F8FF'); line(20, INK[CH[i]]);
  line(20, mixHex(INK[CH[i]], '#FFFFFF', 0.35), [26, 58]);                                  // ροή
  line(5, 'rgba(255,255,255,0.75)', [140, 40]);                                             // γυαλάδα τοιχώματος
  ctx.restore(); ctx.setLineDash([]);
}
// αλυσίδα καλωδίων (drag chain) πάνω από τη δέσμη στο τμήμα S_CH0..S_CH1
function chain(ctx) {
  for (let s = S_CH0; s < S_CH1; s += 64) {
    const [x, y, dx, dy] = rAt(s), a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    for (const sd of [-1, 1]) cut(ctx, rrPts(-30, sd * 92 - 14, 60, 28, 10), '#2A3B73', { seed: 9400 + Math.round(s) + sd, amp: 1, edgeW: 4, shadow: sd > 0 });
    for (const sd of [-1, 1]) dot(ctx, 0, sd * 92, 6, STEEL);
    if (Math.round(s / 64) % 2) { ctx.fillStyle = 'rgba(42,59,115,0.85)'; ctx.fillRect(-7, -86, 14, 172); }   // εγκάρσια μπάρα
    ctx.restore();
  }
}
// damper (πρόσοψη): διάφανο σακουλάκι με μελάνι, μεμβράνη που «αναπνέει», βαλβίδα στην είσοδο · (x, y) = κέντρο
function damper(ctx, x, y, k, t, hero) {
  const br = hero ? Math.sin(t * 7) : Math.sin(t * 5 + k), mem = 6 * br, valve = br > 0.3;
  cut(ctx, rrPts(x - 36, y - 62, 72, 124, 16), 'rgba(236,242,252,0.95)', { seed: 9500 + k, amp: 1, edgeW: 5 });
  ctx.save(); L.path(ctx, rrPts(x - 30, y - 56, 60, 112, 12)); ctx.clip();
  ctx.fillStyle = INK[CH[k]]; ctx.globalAlpha = 0.85; ctx.fillRect(x - 30, y - 40, 60, 100);
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4;       // μεμβράνη (πλαϊνή όψη = καμπύλη)
  ctx.beginPath(); ctx.moveTo(x + 26, y - 50); ctx.quadraticCurveTo(x + 26 - mem * 2.2, y, x + 26, y + 50); ctx.stroke();
  ctx.restore();
  cut(ctx, rrPts(x - 14, y - 76, 28, 18, 6), valve ? '#7EE0A0' : STEELD, { seed: 9510 + k, amp: 0.6, edgeW: 3, shadow: false });   // βαλβίδα
}
// καρότσι με τα 4 dampers + κεφαλή (τομή: κανάλια ως τα ακροφύσια) · μηνίσκος στο κυανό ακροφύσιο
function carriage(ctx, t, men) {
  cut(ctx, rrPts(1790, 1180, 480, 520, 34), '#CBD3E1', { seed: 9520, amp: 2, edgeW: 8, scribble: '#BCC6D6' });
  cut(ctx, rrPts(1818, 1460, 424, 180, 16), STEELL, { seed: 9521, amp: 1.5, edgeW: 5 });    // κεφαλή
  ctx.save(); ctx.strokeStyle = 'rgba(126,137,162,0.5)'; ctx.lineWidth = 3;
  for (let x = 1830; x < 2240; x += 22) { ctx.beginPath(); ctx.moveTo(x, 1470); ctx.lineTo(x + 30, 1630); ctx.stroke(); } ctx.restore();   // διαγράμμιση τομής
  for (let k = 0; k < 4; k++) {
    const [x] = tubeAt(k, S_DMP), [nx] = NOZ(k);
    tubeSeg(ctx, k, S_DMP + 62, S_HEAD, t);
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK[CH[k]]; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(x, 1460); ctx.lineTo(x, 1600); ctx.lineTo(nx, 1628); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(nx, 1600); ctx.lineTo(nx, 1640); ctx.stroke(); ctx.restore();
    damper(ctx, x, tubeAt(k, S_DMP)[1], k, t, k === 0);
  }
  ctx.fillStyle = '#2A3B73'; ctx.fillRect(1818, 1638, 424, 8);                               // πλάκα ακροφυσίων
  const [nx] = NOZ(0);                                                                      // μηνίσκος: φουσκώνει και τραβιέται πίσω
  ctx.save(); ctx.fillStyle = INK.C; ctx.beginPath(); ctx.ellipse(nx, 1645, 7, 2 + men * 9, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(nx - 2.5, 1647 + men * 3, 1.6, 1 + men * 2, 0, 0, 7); ctx.fill(); ctx.restore();
}
function tubeSeg(ctx, i, s0, s1) {
  const pts = []; for (let s = s0; s <= s1; s += 8) pts.push(tubeAt(i, s));
  ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.lineWidth = 24; ctx.strokeStyle = '#F4F8FF'; ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = INK[CH[i]]; ctx.stroke(); ctx.restore();
}
// φυσίγγια (οριζόντια, στοιβαγμένα στην αρχή των σωλήνων) · in = πόσο έχουν μπει (0..1)
function cartridgeBay(ctx, t) {
  cut(ctx, rrPts(20, 1520, 440, 560, 30), '#CBD3E1', { seed: 9530, amp: 2, edgeW: 8 });
  for (let k = 0; k < 4; k++) {
    const [ox, oy] = tubeAt(k, 0), inK = easeOut(prog(t, 9.28 + k * 0.1, 9.62 + k * 0.1)), x = ox - 20 - 320 * (1 - inK);
    ctx.save(); ctx.translate(x, oy);
    cut(ctx, rrPts(-340, -46, 340, 92, 16), C.navy, { seed: 9540 + k, amp: 1.5, edgeW: 6 });
    cut(ctx, rrPts(-300, -30, 230, 60, 22), mixHex(INK[CH[k]], '#FFFFFF', 0.15), { seed: 9545 + k, amp: 1, edge: false, shadow: false });   // σακούλα μελανιού
    txt(ctx, CH[k], -38, 2, { font: '50px Brand', color: '#fff' });
    ctx.fillStyle = STEEL; ctx.fillRect(0, -9, 22, 18);
    ctx.restore();
  }
}
// ροή: μετατόπιση ραβδώσεων (ίδια ταχύτητα με την κάμερα στο κυνήγι → το μελάνι «ταξιδεύει μαζί μας»)
const HERO = [[9.95, 0], [10.55, 90], [12.95, S_CH1 + 40], [13.9, S_CAR - 20], [14.8, S_DMP], [17.15, S_DMP], [17.85, RLEN]];
const heroS = t => kf(t, HERO, (u) => u);
const ZC = [[9.2, 1.25], [9.9, 1.25], [10.5, 1.9], [12.7, 1.9], [13.35, 1.3], [14.05, 1.3], [14.8, 2.5], [17.05, 2.5], [17.8, 5.5], [18.0, 5.5], [18.25, 150]];
function camC(t) {                                                                          // κέντρο κάμερας + zoom
  const s = heroS(t), [hx, hy, dx, dy] = tubeAt(0, s), lead = t < 13 ? 70 : 0;
  let x = hx + dx * lead, y = hy + dy * lead;
  const w0 = 1 - prog(t, 9.9, 10.5); x = lerp(x, 250, w0); y = lerp(y, 1800, w0);            // αρχή: όλα τα φυσίγγια
  const wc = Math.sin(Math.PI * prog(t, 12.95, 14.6)); x = lerp(x, 2030, wc * 0.85); y = lerp(y, 1400, wc * 0.85);   // «ως την κεφαλή»: όλο το καρότσι
  if (t > 17.2) { const [nx] = NOZ(0), w = easeInOut(prog(t, 17.2, 17.8)); x = lerp(x, nx, w); y = lerp(y, 1641, w); }
  return [x, y, zkf(t, ZC)];
}
const toScr = ([cx, cy, z], wx, wy) => [W / 2 + (wx - cx) * z, H / 2 + 60 + (wy - cy) * z];
function ride(ctx, t) {
  bgFlat(ctx, C.pale, '#C9D8F2', 53);
  const cm = camC(t), [cx, cy, z] = cm, flow = heroS(t);
  ctx.save(); ctx.translate(W / 2, H / 2 + 60); ctx.scale(z, z); ctx.translate(-cx, -cy);
  ctx.strokeStyle = 'rgba(143,176,238,0.35)'; ctx.lineWidth = 2 / z;                         // πλέγμα «σχεδίου» (παράλλαξη)
  for (let x = 0; x < 2600; x += 120) { ctx.beginPath(); ctx.moveTo(x, 400); ctx.lineTo(x, 2300); ctx.stroke(); }
  for (let y = 400; y < 2300; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2600, y); ctx.stroke(); }
  cut(ctx, rrPts(380, 1930, 1100, 40, 16), STEEL, { seed: 9550, amp: 1.5, edgeW: 5 });     // πλαίσιο μηχανής
  cut(ctx, rrPts(1660, 1000, 36, 700, 14), STEEL, { seed: 9551, amp: 1.5, edgeW: 5 });
  for (const [x, y] of [[520, 1950], [900, 1950], [1300, 1950], [1678, 1100], [1678, 1500]]) dot(ctx, x, y, 9, STEELD);
  cartridgeBay(ctx, t);
  for (let k = 3; k >= 0; k--) tube(ctx, k, S_DMP - 62, flow * 1.0 + k * 13);
  chain(ctx);
  carriage(ctx, t, t > T.stazei - 0.3 ? clamp(Math.sin((t - T.stazei + 0.3) * 6) * 0.9) : 0.2 + 0.1 * Math.sin(t * 7));
  ctx.restore();
  const sp = t > 10.5 && t < 12.95 ? 1 : 0;                                                  // γραμμές ταχύτητας στο κυνήγι
  if (sp) {
    const [, , dx, dy] = tubeAt(0, heroS(t)), r = rng(ST.FRAME || Math.floor(t * 30));
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineCap = 'round';
    for (let n = 0; n < 14; n++) { const x = r() * W, y = 520 + r() * 1000, l = 60 + r() * 140; ctx.lineWidth = 3 + r() * 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx * l, y - dy * l); ctx.stroke(); }
    ctx.restore();
  }
  const lab = (st, wx, wy, word, rot, col) => { const [x, y] = toScr(cm, wx, wy); stamp(ctx, t, st, clamp(x, 220, 860), clamp(y, 640, 1380), word, rot, col, 56); };
  if (t < 11.2) lab(T.fysig, 240, 1560, 'ΦΥΣΙΓΓΙΑ', -0.05, C.navy);
  if (t > 13.0 && t < 14.4) lab(T.kefali, 2030, 1170, 'ΚΕΦΑΛΗ', 0.04, C.navy);
  if (t > 15.2 && t < 17.25) { const [x] = tubeAt(0, S_DMP); lab(T.damper, x, 1195, 'DAMPER', -0.05); }
  if (t > T.kratai - 0.05 && t < 17.3) gauge(ctx, t, 790, 1300);
  if (t > T.stazei && t < 18.05) stamp(ctx, t, T.stazei + 0.05, 540, 1250, 'ΔΕΝ ΣΤΑΖΕΙ', -0.04, BRAND, 60);
  stepChip(ctx, t - SC[2], 0.3, 2, 'Μελάνι');
}
// μανόμετρο (inset): η βελόνα τρέμει μέσα στην πράσινη ζώνη = σταθερή πίεση
function gauge(ctx, t, x, y) {
  pop(ctx, t, T.kratai, x, y, () => {
    cut(ctx, circlePts(0, 0, 130, 130, 40), C.paper, { seed: 9560, amp: 2, edgeW: 8 });
    ctx.lineWidth = 22; ctx.lineCap = 'butt';
    ctx.strokeStyle = '#F29C9C'; ctx.beginPath(); ctx.arc(0, 18, 88, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.strokeStyle = '#7EE0A0'; ctx.beginPath(); ctx.arc(0, 18, 88, Math.PI * 1.36, Math.PI * 1.52); ctx.stroke();
    const a = Math.PI * 1.44 + 0.03 * Math.sin(t * 23) + 0.02 * Math.sin(t * 9);
    ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(Math.cos(a) * 80, 18 + Math.sin(a) * 80); ctx.stroke();
    dot(ctx, 0, 18, 12, C.navy);
    txt(ctx, 'σταθερή', 0, 78, { font: 'bold 30px Round', color: C.navy });
  });
}

// ---------- 2β · πλάκα ακροφυσίων (από κάτω): zoom out από μία τρύπα → σειρές ανά χρώμα ----------
const NP = { x0: 250, dx: 20, n: 32, y0: 790, dy: 60 };
function plate(ctx, t) {
  bgFlat(ctx, C.pale, '#C9D8F2', 54);
  const z = zkf(t, [[SC[3], 150], [19.7, 1.12], [21.35, 1.12], [21.8, 7]]), hx = NP.x0 + 8 * NP.dx, hy = NP.y0;
  const ex = easeInOut(prog(t, SC[3], 19.7)), fx = lerp(hx, 540, ex), fy = lerp(hy, 1000, ex);
  ctx.save(); cam(ctx, fx, fy, z, 540, lerp(1020, 1060, ex));
  cut(ctx, rrPts(170, 720, 740, 560, 36), STEELL, { seed: 9600, amp: 2, edgeW: 8, scribble: '#C8D0DE' });
  for (let r = 0; r < 8; r++) {
    const k = r >> 1, y = NP.y0 + r * NP.dy, hi = t > T.seires + k * 0.2 ? spring(prog(t, T.seires + k * 0.2, T.seires + k * 0.2 + 0.4)) : 0;
    if (hi > 0) { ctx.save(); ctx.globalAlpha = 0.35 * Math.min(1, hi); L.path(ctx, rrPts(NP.x0 - 22, y - 20, NP.dx * NP.n + 24, 40, 20)); ctx.fillStyle = INK[CH[k]]; ctx.fill(); ctx.restore(); }
    for (let c = 0; c < NP.n; c++) { const x = NP.x0 + c * NP.dx; dot(ctx, x, y, 7.5, '#3A4668'); dot(ctx, x, y, 5, INK[CH[k]]); dot(ctx, x - 1.5, y - 1.8, 1.4, 'rgba(255,255,255,0.8)'); }
  }
  ctx.restore();
  if (z < 1.3) for (let k = 0; k < 4; k++) pop(ctx, t, T.seires + k * 0.2, 540 + (205 - 540) * z, 1060 + (NP.y0 + (k * 2 + 0.5) * NP.dy - 1000) * z, () => {
    cut(ctx, circlePts(0, 0, 30, 30, 20), INK[CH[k]], { seed: 9610 + k, amp: 1, edgeW: 5 }); txt(ctx, CH[k], 0, 3, { font: '36px Brand', color: k === 2 ? C.ink : '#fff' });
  });
  pip(ctx, ...PIP, VO);
  stepChip(ctx, t - SC[3], 0.15, 3, 'Κεφαλή');
}

// ---------- 3 · piezo (τομή): ρεύμα → ο κρύσταλλος λυγίζει → σταγόνα → χιλιάδες φορές ----------
const PZ = { x0: 300, x1: 780, top: 770, ch: [790, 960], noz: [540, 1150], vin: 1330 };
// φάση κύκλων ψεκασμού: 1 σταγόνα στο 26,2 · από το 27,3 επιτάχυνση ως ~40 Hz (οπτικά: τρέμει + συνεχής ροή σταγόνων)
function pzCycle(t) {
  if (t < T.xiliades) return { bend: t < T.lygizei ? 0 : t < T.petaei ? spring(prog(t, T.lygizei, T.lygizei + 0.5)) : 1 - easeOut(prog(t, T.petaei + 0.05, T.petaei + 0.35)), fast: 0 };
  const u = t - T.xiliades, f = 1.6 * Math.exp(u * 2.4), ph = 1.6 * (Math.exp(u * 2.4) - 1) / 2.4;
  return { bend: f > 12 ? 0.5 + 0.5 * rng(Math.floor(t * 30))() : Math.max(0, Math.sin(ph * 2 * Math.PI)), fast: clamp((f - 3) / 10), ph, f };
}
function piezo(ctx, t) {
  bgFlat(ctx, C.pale, '#C9D8F2', 55);
  const b = pzCycle(t), bend = b.bend * 34, bd = t > T.revma - 0.05;
  ctx.save(); ctx.translate(0, 80);
  pop(ctx, t, SC[4] + 0.05, 540, 1000, () => {
    ctx.translate(-540, -1000);
    cut(ctx, rrPts(180, 600, 720, 590, 40), STEELL, { seed: 9700, amp: 2, edgeW: 8 });   // σώμα κεφαλής (τομή)
    ctx.save(); ctx.strokeStyle = 'rgba(126,137,162,0.45)'; ctx.lineWidth = 3; L.path(ctx, rrPts(180, 600, 720, 590, 40)); ctx.clip();
    for (let x = 120; x < 960; x += 26) { ctx.beginPath(); ctx.moveTo(x, 600); ctx.lineTo(x + 120, 1190); ctx.stroke(); } ctx.restore();
    // κανάλι μελανιού: είσοδος αριστερά → θάλαμος → ακροφύσιο
    ctx.fillStyle = INK.C; ctx.beginPath(); ctx.moveTo(180, 850); ctx.lineTo(PZ.x0, 850); ctx.lineTo(PZ.x0, PZ.ch[0]);
    ctx.quadraticCurveTo(540, PZ.ch[0] + bend * 2, PZ.x1, PZ.ch[0]); ctx.lineTo(PZ.x1, PZ.ch[1]); ctx.lineTo(560, 1100); ctx.lineTo(552, PZ.noz[1]); ctx.lineTo(528, PZ.noz[1]); ctx.lineTo(520, 1100);
    ctx.lineTo(PZ.x0, PZ.ch[1]); ctx.lineTo(PZ.x0, 890); ctx.lineTo(180, 890); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; ctx.setLineDash([18, 30]); ctx.lineDashOffset = -t * 120;
    ctx.beginPath(); ctx.moveTo(190, 870); ctx.lineTo(PZ.x0 + 60, 870); ctx.lineTo(540, 1000); ctx.stroke(); ctx.setLineDash([]);
    // μεμβράνη + πιεζοκρύσταλλος (λυγίζει προς τα κάτω)
    ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(PZ.x0, PZ.ch[0]); ctx.quadraticCurveTo(540, PZ.ch[0] + bend * 2, PZ.x1, PZ.ch[0]); ctx.stroke();
    const glow = bd ? 0.5 + 0.5 * Math.sin(t * 30) * (b.fast || 1) : 0;
    for (let n = 0; n < 5; n++) {
      const y0 = 700 + n * 14, col = n % 2 ? '#C9A24A' : (glow > 0.4 ? '#FFE27A' : '#E8C46A');
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(PZ.x0 + 20, y0); ctx.quadraticCurveTo(540, y0 + bend * 2 * (0.6 + n * 0.1), PZ.x1 - 20, y0);
      ctx.lineTo(PZ.x1 - 20, y0 + 14); ctx.quadraticCurveTo(540, y0 + 14 + bend * 2 * (0.6 + n * 0.1), PZ.x0 + 20, y0 + 14); ctx.closePath(); ctx.fill();
    }
    // καλώδια → οδηγός (⚡)
    ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(PZ.x0 + 30, 700); ctx.lineTo(PZ.x0 + 30, 650); ctx.lineTo(240, 650); ctx.stroke();
    cut(ctx, rrPts(206, 620, 60, 60, 12), C.navy, { seed: 9701, amp: 1, edgeW: 4, shadow: false });
    bolt(ctx, 236, 650, 1, '#FFE27A');
    if (bd && t < T.xiliades + 1.5) { const p = ((t - T.revma) * 2.2) % 1; const [x, y] = p < 0.4 ? [lerp(240, PZ.x0 + 30, p / 0.4), 650] : [PZ.x0 + 30, lerp(650, 700, (p - 0.4) / 0.6)]; dot(ctx, x, y, 12, '#FFE27A'); }
    // βινύλιο κάτω
    cut(ctx, rectPts(120, PZ.vin, 840, 44), '#FFFFFF', { seed: 9702, amp: 1.5, edgeW: 5 });
    ctx.fillStyle = LINER; ctx.fillRect(126, PZ.vin + 44, 828, 16);
  }, 0);
  if (t > SC[4] + 0.4) {
    const [nx, ny] = PZ.noz, meniscus = b.bend;
    ctx.fillStyle = INK.C; ctx.beginPath(); ctx.ellipse(nx, ny, 12, 3 + meniscus * 12, 0, 0, Math.PI); ctx.fill();
    const one = prog(t, T.petaei, T.petaei + 0.4), shift = t > T.xiliades ? (t - T.xiliades) * 260 : 0;
    if (t > T.petaei && t < T.xiliades) {                                                   // η πρώτη σταγόνα (slow-mo)
      if (one < 1) { const y = lerp(ny + 16, PZ.vin - 12, easeIn(one)); dot(ctx, nx, y, 12, INK.C); ctx.fillStyle = INK.C; ctx.beginPath(); ctx.ellipse(nx, y - 16, 5, 12, 0, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = INK.C; ctx.beginPath(); ctx.ellipse(nx, PZ.vin + 2, 20 * spring(prog(t, T.petaei + 0.4, T.petaei + 0.7)), 6, 0, 0, 7); ctx.fill(); }
    }
    if (t >= T.xiliades) {                                                                  // πολλές σταγόνες: ροή + κουκκίδες που φεύγουν με το βινύλιο
      const n = Math.floor(b.ph), gap = Math.max(18, 110 / (1 + b.f * 0.4));
      for (let y = ny + 20 + ((b.ph % 1) * gap); y < PZ.vin - 8; y += gap) dot(ctx, nx, y, 9, INK.C);
      ctx.fillStyle = INK.C;
      for (let i = 0; i <= Math.min(n + 1, 120); i++) { const x = nx - shift + (i / Math.max(1, b.ph)) * shift; if (x > 130 && x < 950) { ctx.beginPath(); ctx.ellipse(x, PZ.vin + 2, 14, 5, 0, 0, 7); ctx.fill(); } }
      ctx.beginPath(); ctx.ellipse(nx - shift, PZ.vin + 2, 20, 6, 0, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
  stamp(ctx, t, T.piezo + 0.1, 540, 650, 'ΠΙΕΖΟ', -0.03, BRAND, 60);
  if (t > T.revma) { stamp(ctx, t, T.revma + 0.05, 250, 640, 'ρεύμα', -0.05, C.navy, 44); pop(ctx, t, T.revma + 0.15, 380, 610, () => bolt(ctx, 0, 0, 1.6, '#FFE27A'), 0.1); }
  pip(ctx, ...PIP, VO);
}

// ---------- 4 · περάσματα (κάτοψη): η κεφαλή πάει πέρα-δώθε, το βινύλιο προχωράει μία λωρίδα μετά από κάθε πέρασμα ----------
const PS = { yh: 800, B: 54, n: 10, s: 0.9, t0: 29.3, per: 0.44, run: 0.36 };
function platenTop(ctx, dy = 0) {                                                            // πλατό + βινύλιο (κάτοψη) · dy = κίνηση του βινυλίου στο Y
  bgFlat(ctx, '#3A4A70', '#34436A', 57);
  cut(ctx, rectPts(140, 480 + dy, 800, 2400), '#FFFFFF', { seed: 9900, amp: 1.5, edgeW: 0 });
  const o = ((dy % 34) + 34) % 34;
  for (const x of [118, 962]) for (let y = 526 + o; y < 1900; y += 34) { ctx.fillStyle = '#5A6A92'; ctx.fillRect(x - 12, y, 24, 20); }   // grit rollers (άκρες)
}
function railTop(ctx, cx, o = {}) {                                                          // ράγα + καρότσι (κάτοψη) · o.blade: μαχαιράκι
  cut(ctx, rrPts(40, 690, 1000, 40, 14), STEEL, { seed: 9901, amp: 1.5, edgeW: 5 });
  for (const x of [200, 400, 680, 880]) cut(ctx, rrPts(x - 26, 728, 52, 26, 10), '#2A3B73', { seed: 9902 + x, amp: 1, edgeW: 4 });   // pinch rollers
  cut(ctx, rrPts(cx - 100, 640, 200, 190, 24), C.navy, { seed: 9910, amp: 2, edgeW: 7 });
  cut(ctx, rrPts(cx - 76, 660, 152, 60, 14), '#2A3B73', { seed: 9911, amp: 1, edgeW: 0, shadow: false });
  CH.forEach((k, i) => { ctx.fillStyle = INK[k]; ctx.fillRect(cx - 62 + i * 34, 674, 22, 32); });
  if (o.blade) pop(ctx, o.t, o.blade, cx + BLX, YB, () => { ctx.fillStyle = C.navy; ctx.fillRect(-12, -44, 24, 30); cut(ctx, circlePts(0, 0, 24, 24, 16), STEELD, { seed: 9912, amp: 1, edgeW: 4 }); dot(ctx, 0, 0, 7, '#fff'); });
}
function passes(ctx, t) {
  platenTop(ctx);
  const k = clamp(Math.floor((t - PS.t0) / PS.per), 0, PS.n), u = (t - PS.t0) / PS.per - k;
  const adv = k >= PS.n ? 0 : easeInOut(clamp((u * PS.per - PS.run) / (PS.per - PS.run))), f = (Math.min(k, PS.n) + (k < PS.n ? adv : 0)) * PS.B;
  const artH = AW * PS.s, x0 = 540 - artH / 2, top = PS.yh + f - artH, swept = t < PS.t0 ? 0 : k >= PS.n ? 0 : clamp(u * PS.per / PS.run);
  const dir = k % 2 ? -1 : 1, cx = t < PS.t0 ? 160 : k >= PS.n ? 540 : lerp(dir > 0 ? 160 : 920, dir > 0 ? 920 : 160, easeInOut(swept));
  ctx.save(); ctx.translate(x0, top); ctx.scale(PS.s, PS.s);
  const done = Math.min(k, PS.n) * PS.B / PS.s + (k < PS.n ? adv * PS.B / PS.s : 0);        // τυπωμένες σειρές (ART, από κάτω)
  printArt(ctx, { clip: [0, AW - done, AW, done] });
  if (k < PS.n && swept > 0) {                                                               // λωρίδα που τυπώνεται τώρα (μέχρι το καρότσι)
    const bx = (cx - x0) / PS.s, band = [dir > 0 ? 0 : bx, AW - done - PS.B / PS.s, dir > 0 ? bx : AW - bx, PS.B / PS.s];
    printArt(ctx, { clip: band });
  }
  ctx.restore();
  railTop(ctx, cx);
  if (t > PS.t0 + 0.2) { pop(ctx, t, PS.t0 + 0.2, 680, 600, () => { ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(-240, 0); ctx.lineTo(-200, -26); ctx.lineTo(-200, -9); ctx.lineTo(200, -9); ctx.lineTo(200, -26); ctx.lineTo(240, 0); ctx.lineTo(200, 26); ctx.lineTo(200, 9); ctx.lineTo(-200, 9); ctx.lineTo(-200, 26); ctx.closePath(); ctx.fill(); }); stamp(ctx, t, PS.t0 + 0.25, 680, 600, 'πέρασμα', 0, C.navy, 40); }
  if (t > T.vinylio - 0.1) {
    pop(ctx, t, T.vinylio, 108, 1010, () => { cut(ctx, [[-30, -60], [30, -60], [30, 10], [58, 10], [0, 80], [-58, 10], [-30, 10]], BRAND, { seed: 9920, amp: 1.5, edgeW: 5 }); });
  }
  stepChip(ctx, t - SC[5], 0.2, 4, 'Περάσματα', { y: 568 });
}

// ---------- 5 · θερμαντήρας (τομή): ζεσταίνει το βινύλιο → το μελάνι πιάνει → ο διαλύτης φεύγει, στεγνώνει ----------
const HT = { vin: [950, 1030], adh: 1040, lin: [1040, 1096], heat: [1110, 1300] };
function heat(ctx, t) {
  bgFlat(ctx, C.pale, '#C9D8F2', 58);
  ctx.save(); ctx.translate(0, 110);
  const hk = easeInOut(prog(t, T.therm, T.therm + 1.0)), bond = easeInOut(prog(t, T.piani, T.piani + 0.8)), dry = easeInOut(prog(t, T.stegn, T.stegn + 0.7));
  cut(ctx, rrPts(100, HT.heat[0], 880, HT.heat[1] - HT.heat[0], 20), '#3A4A70', { seed: 9950, amp: 2, edgeW: 7 });
  ctx.save(); ctx.strokeStyle = mixHex('#7E89A2', '#FF8A3D', hk); ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let x = 150; x <= 930; x += 30) ctx.lineTo(x, HT.heat[0] + 80 + (Math.round(x / 30) % 2 ? -30 : 30)); ctx.stroke(); ctx.restore();   // αντίσταση
  if (hk > 0) {                                                                             // κύματα ζέστης (ανεβαίνουν μέσα από το βινύλιο)
    ctx.save(); ctx.globalAlpha = 0.55 * hk; ctx.strokeStyle = '#FF8A3D'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const x = 190 + i * 140, ph = (t * 0.9 + i * 0.37) % 1, y0 = HT.heat[0] - 10 - ph * 420;
      ctx.globalAlpha = 0.55 * hk * Math.sin(Math.PI * ph); ctx.beginPath(); for (let y = 0; y < 110; y += 6) ctx.lineTo(x + 14 * Math.sin((y + t * 200) / 18), y0 - y); ctx.stroke(); }
    ctx.restore();
  }
  cut(ctx, rectPts(100, HT.lin[0], 880, HT.lin[1] - HT.lin[0]), LINER, { seed: 9951, amp: 1.5, edgeW: 5 });
  ctx.fillStyle = 'rgba(246,210,47,0.35)'; ctx.fillRect(104, HT.adh - 10, 872, 10);          // κόλλα
  cut(ctx, rectPts(100, HT.vin[0], 880, HT.vin[1] - HT.vin[0]), mixHex('#FFFFFF', '#FFE9D6', hk * 0.8), { seed: 9952, amp: 1.5, edgeW: 5 });
  const dl = [[190, 'C'], [260, 'M'], [320, 'Y'], [400, 'M'], [470, 'C'], [540, 'K'], [610, 'Y'], [680, 'M'], [750, 'C'], [820, 'Y'], [890, 'M']];
  for (const [x, k] of dl) {                                                                // σταγόνες: στρογγυλές/γυαλιστερές → πλακώνουν, «πιάνουν», ματ
    const h = lerp(26, 9, bond), w = lerp(26, 34, bond), y = HT.vin[0] + lerp(0, 4, bond);
    ctx.fillStyle = INK[k]; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, Math.PI, 2 * Math.PI); ctx.fill();
    if (bond > 0) { ctx.globalAlpha = 0.5 * bond; ctx.fillRect(x - w + 4, y, 2 * w - 8, 7); ctx.globalAlpha = 1; }
    if (dry < 1) { ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - dry)})`; ctx.beginPath(); ctx.ellipse(x - w * 0.35, y - h * 0.55, w * 0.22, h * 0.2, -0.3, 0, 7); ctx.fill(); }
  }
  if (t > T.stegn) {                                                                        // διαλύτης: ατμός που φεύγει
    ctx.save(); ctx.strokeStyle = 'rgba(126,137,162,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const [x] of dl.filter((_, i) => i % 2 === 0)) { const ph = ((t - T.stegn) * 1.1 + x / 300) % 1, y0 = HT.vin[0] - 30 - ph * 220;
      ctx.globalAlpha = Math.sin(Math.PI * ph) * (t < 37.7 ? prog(t, T.stegn, 37.6) : 1); ctx.beginPath(); for (let y = 0; y < 70; y += 5) ctx.lineTo(x + 10 * Math.sin((y + t * 160) / 14), y0 - y); ctx.stroke(); }
    ctx.restore();
  }
  pop(ctx, t, T.therm + 0.05, 860, 760, () => {                                              // θερμόμετρο
    cut(ctx, rrPts(-26, -150, 52, 240, 26), C.paper, { seed: 9953, amp: 1.5, edgeW: 6 }); cut(ctx, circlePts(0, 108, 46, 46, 20), C.paper, { seed: 9954, amp: 1.5, edgeW: 6 });
    dot(ctx, 0, 108, 32, '#E24A3B'); ctx.fillStyle = '#E24A3B'; ctx.fillRect(-10, 100 - 220 * (0.2 + 0.7 * hk), 20, 220 * (0.2 + 0.7 * hk));
  });
  stamp(ctx, t, T.therm + 0.4, 690, 1205, 'θερμαντήρας', -0.03, '#FF8A3D', 42);
  stamp(ctx, t, 34.85, 300, 860, 'βινύλιο', 0.04, C.navy, 42);
  if (t > T.stegn) stamp(ctx, t, T.stegn + 0.1, 640, 690, 'διαλύτης ↑', 0.04, STEELD, 42);
  ctx.restore();
  pip(ctx, ...PIP, VO);
  stepChip(ctx, t - SC[6], 0.2, 5, 'Θέρμανση');
}

// ---------- 6 · contour cut (κάτοψη): το ίδιο μηχάνημα κόβει με μαχαιράκι γύρω γύρω · inset: μόνο το βινύλιο ----------
const CS = [540, PS.yh + PS.n * PS.B - AW * PS.s / 2, PS.s];                                  // το αυτοκόλλητο όπως τελείωσε το τύπωμα
const CUT_T = [40.1, 42.25], YB = 862, BLX = 40, PARK = 900;                               // μαχαίρι κάτω από το καρότσι (y) · απόσταση από το κέντρο του · θέση στάθμευσης
function cutLine(ctx, p, x, y, s) {
  const n = Math.floor(p * CONT.pts.length);
  ctx.save(); ctx.translate(x - 300 * s, y - 300 * s); ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(40,50,80,0.75)'; ctx.lineWidth = 3 / s; ctx.setLineDash([10 / s, 7 / s]);
  ctx.beginPath(); for (let i = 0; i <= n; i++) { const q = i < CONT.pts.length ? CONT.pts[i] : CONT.pts[0]; i ? ctx.lineTo(...q) : ctx.moveTo(...q); }
  if (p < 1) ctx.lineTo(...contourAt(p)); else ctx.closePath(); ctx.stroke(); ctx.restore();
}
function cutting(ctx, t) {
  const p = easeInOut(prog(t, ...CUT_T)), [px, py] = contourAt(p), [px0, py0] = contourAt(0);
  const yOf = q => YB - (CS[1] + (q - 300) * CS[2]), xOf = q => CS[0] + (q - 300) * CS[2];     // πόσο πρέπει να κινηθεί το βινύλιο ώστε το σημείο να είναι κάτω από το μαχαίρι
  const pre = easeInOut(prog(t, T.kovei - 0.5, CUT_T[0])), post = easeInOut(prog(t, CUT_T[1], SC[8] - 0.05));
  const dy = t < CUT_T[0] ? yOf(py0) * pre : t < CUT_T[1] ? yOf(py) : yOf(py0) * (1 - post);
  const inn = easeInOut(prog(t, T.telos, T.kovei - 0.5)), cx = t < CUT_T[0] ? lerp(160, xOf(px0) - BLX, inn) : t < CUT_T[1] ? xOf(px) - BLX : lerp(xOf(px0) - BLX, PARK, post);
  platenTop(ctx, dy);
  ctx.save(); ctx.translate(0, dy); sticker(ctx, ...CS); if (t > CUT_T[0] - 0.05) cutLine(ctx, p, ...CS); ctx.restore();
  railTop(ctx, cx, { blade: T.kovei, t });
  const ax = (st, y, vert, label) => pop(ctx, t, st, 300, y, () => {                      // υπόμνημα: X = κεφαλή (ράγα) · Y = βινύλιο (κύλινδροι)
    ctx.font = 'bold 38px Round'; const w = ctx.measureText(label).width + 130;
    cut(ctx, rrPts(-w / 2, -38, w, 76, 38), C.paper, { seed: 9965 + (vert ? 1 : 0), amp: 1.5, edgeW: 6 });
    ctx.save(); ctx.translate(-w / 2 + 50, 0); if (vert) ctx.rotate(Math.PI / 2); ctx.fillStyle = C.navy; ctx.beginPath();
    [[-28, 0], [-12, -14], [-12, -5], [12, -5], [12, -14], [28, 0], [12, 14], [12, 5], [-12, 5], [-12, 14]].forEach(([u, v], i) => (i ? ctx.lineTo(u, v) : ctx.moveTo(u, v))); ctx.closePath(); ctx.fill(); ctx.restore();
    txt(ctx, label, -w / 2 + 92, 2, { font: 'bold 38px Round', color: C.navy, align: 'left' });
  });
  ax(T.kovei + 0.35, 1190, false, 'X · κεφαλή');
  ax(T.kovei + 0.6, 1290, true, 'Y · βινύλιο');
  pop(ctx, t, T.kovei + 0.05, 540, 610, () => { cut(ctx, rrPts(-150, -34, 300, 68, 34), C.paper, { seed: 9962, amp: 1.5, edgeW: 6 }); txt(ctx, 'μαχαιράκι', 0, 2, { font: 'bold 40px Round', color: C.navy }); });
  pop(ctx, t, T.gyro, 780, 1330, () => {                                                     // inset: τομή — κόβει το βινύλιο, όχι το χαρτί από κάτω
    ctx.save(); cut(ctx, circlePts(0, 0, 130, 130, 40), C.paper, { seed: 9963, amp: 2, edgeW: 8 }); ctx.beginPath(); ctx.arc(0, 0, 122, 0, 7); ctx.clip();
    ctx.fillStyle = LINER; ctx.fillRect(-130, 20, 260, 60); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-130, -14, 260, 30);
    ctx.fillStyle = 'rgba(40,50,80,0.25)'; ctx.fillRect(-130, 15, 260, 5);
    ctx.fillStyle = STEELD; ctx.beginPath(); ctx.moveTo(-16, -130); ctx.lineTo(16, -130); ctx.lineTo(10, -40); ctx.lineTo(0, 18); ctx.lineTo(-10, -40); ctx.closePath(); ctx.fill();
    ctx.restore(); txt(ctx, 'μόνο το βινύλιο', 0, 160, { font: 'bold 34px Round', color: C.navy, edge: 8, edgeC: C.paper });
  });
  stepChip(ctx, t - SC[7], 0.2, 6, 'Κοπή');
}

// ---------- 7 · ξεκόλλημα + φακός στον σκούφο: κίτρινες + λίγες ματζέντα κουκκίδες = μουσταρδί ----------
const PEEL = [42.55, 43.4], LOUPE = [43.3, 43.8], LR = 190, LZ = 5.5;
function answer(ctx, t) {
  platenTop(ctx);
  railTop(ctx, PARK, { blade: 0, t: 99 });
  const pk = easeInOut(prog(t, ...PEEL)), x = CS[0] - 20 * pk, y = CS[1] - 40 * pk, s = CS[2] * (1 + 0.06 * pk), rot = -0.06 * pk;
  ctx.save(); ctx.translate(CS[0] - 300 * CS[2], CS[1] - 300 * CS[2]); ctx.scale(CS[2], CS[2]);   // ίχνος στο χαρτί (liner) εκεί που ήταν
  L.path(ctx, CONT.pts); ctx.fillStyle = '#F2EFE6'; ctx.fill(); ctx.strokeStyle = 'rgba(40,50,80,0.4)'; ctx.lineWidth = 3 / CS[2]; ctx.stroke(); ctx.restore();
  sticker(ctx, x, y, s, { die: true, lift: pk, rot });
  const gx = x + 250 * s, gy = y + 215 * s;                                                  // λαβή: κάτω-δεξιά άκρη
  reach(ctx, gx, gy + 10 * (1 - pk), 330, 700, { hand: 'grip', side: -1, seed: 870 });
  if (t > PEEL[1] - 0.1) sparkle(ctx, x + 250, y - 240, 0.6, t, PEEL[1], 5501);
  // φακός: μεγεθύνει το σημείο του σκούφου → κουκκίδες
  const lk = easeOut(prog(t, ...LOUPE)), [bx, by] = [x + (BEAN[0] - 300) * s, y + (BEAN[1] - 300) * s], lx = lerp(1250, bx, lk), ly = lerp(1300, by, lk);
  if (lk > 0) {
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx + LR * 0.7, ly + LR * 0.7); ctx.lineTo(lx + LR * 1.35, ly + LR * 1.35); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, LR, 0, 7); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(lx - LR, ly - LR, 2 * LR, 2 * LR);
    ctx.translate(lx, ly); ctx.scale(s * LZ, s * LZ); ctx.translate(-BEAN[0], -BEAN[1]); printArt(ctx, { dots: 1 }); ctx.restore();
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(lx, ly, LR + 8, 0, 7); ctx.stroke(); ctx.strokeStyle = C.navy; ctx.lineWidth = 16; ctx.stroke(); ctx.restore();
  }
  const chipC = (st, cx, cy, col, label, dark) => pop(ctx, t, st, cx, cy, () => {
    ctx.font = 'bold 36px Round'; const w = ctx.measureText(label).width + 96;
    cut(ctx, rrPts(-w / 2, -32, w, 64, 32), C.paper, { seed: 9980 + label.length, amp: 1.5, edgeW: 6 }); dot(ctx, -w / 2 + 34, 0, 18, col);
    txt(ctx, label, 22, 2, { font: 'bold 36px Round', color: dark || C.navy });
  });
  chipC(T.kitrines + 0.2, 830, 780, INK.Y, 'κίτρινο');
  chipC(T.matz2, 810, 870, INK.M, 'λίγο ματζέντα');
  pop(ctx, t, T.mati, 790, 1045, () => {                                                     // = μουσταρδί
    cut(ctx, rrPts(-160, -70, 320, 140, 30), MUST, { seed: 9990, amp: 2, edgeW: 8 });
    txt(ctx, 'μουσταρδί', 0, 4, { font: 'bold 46px Round', color: C.ink });
  }, 0.05);
  if (t > T.moust) sparkle(ctx, 930, 975, 0.5, t, T.moust, 5502);
  pip(ctx, ...PIP, VO, { eyes: t > T.mati ? 'happy' : undefined });
}

// ---------- 8 · CTA: ο Στράτος κρατάει το αυτοκόλλητό του · «Το σχέδιό μου» στέλνεται · zoom στον σκούφο → κουκκίδες = frame 0 ----------
const SK0 = [330, 1100, 1.15], HOLD = { arms: [0.12, 1.25], elbowR: -1.35, handR: 'grip' };
const holdPos = () => require('./stratos.js').handPos(1, HOLD.arms[1], SK0[2], SK0[0], SK0[1], HOLD.elbowR);
const KS = 0.55;                                                                            // κλίμακα αυτοκόλλητου στο χέρι
function outro(ctx, t) {
  const [hx, hy] = holdPos(), sx = hx + 10, sy = hy - 300 * KS + 40;                        // το χέρι κρατάει την κάτω άκρη
  const bw = [sx + (BEAN[0] - 300) * KS, sy + (BEAN[1] - 300) * KS];
  const zk = prog(t, 49.05, 49.8), z = Math.exp(Math.log(Z0 * HS[2] / KS) * easeInOut(zk));
  const e = easeInOut(zk), scx = lerp(bw[0], BW[0], e), scy = lerp(bw[1], BW[1], e);          // ο σκούφος καταλήγει εκεί που είναι στο frame 0
  if (t >= 49.8) { macro(ctx, Z0); return; }
  ctx.save(); cam(ctx, bw[0], bw[1], z, scx, scy);
  bgFlat(ctx, C.pale, '#C9D8F2', 59);
  sticker(ctx, sx, sy, KS, { die: true });
  stratos(ctx, SK0[0], SK0[1], SK0[2], { seed: 1000, legs: false, mouth: lipsync(VO, 'grin'), blink: blinkNow(), brows: 0.7, eyes: t > T.typ ? 'happy' : 'dot', look: 6, ...HOLD });
  ctx.restore();
  const out = easeIn(prog(t, T.typ - 0.05, T.typ + 0.3));
  if (t > 47.55 && out < 1 && zk <= 0) { ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(520 * out, -420 * out); pop(ctx, t, 47.6, 0, 0, () => msgOut(ctx, 560, 600, 400, 96, 'Το σχέδιό μου', { fs: 38, seed: 7300 }), 0); ctx.restore(); }
}

// ---------- captions + ετικέτα σειράς ----------
const CAPS = [[-1, HOOK], [3.1, 'Πώς βγάζει ΟΛΑ τα χρώματα;'], [4.68, 'Πρώτα, το πρόγραμμα χωρίζει το σχέδιο...'], [6.75, '...σε κυανό, ματζέντα, κίτρινο και μαύρο.'],
  [9.32, 'Το μελάνι ξεκινάει από τα φυσίγγια...'], [11.28, '...και ταξιδεύει σε λεπτά σωληνάκια,'], [13.07, '...ως την κεφαλή.'], [14.05, 'Λίγο πριν την κεφαλή, ο damper...'],
  [15.95, '...κρατάει την πίεση σταθερή,'], [17.31, 'για να μη στάζει.'], [18.33, 'Από κάτω, εκατοντάδες τρυπούλες,'], [20.35, 'σε σειρές για κάθε χρώμα.'],
  [21.86, 'Πίσω από κάθε τρύπα, ένας πιεζοκρύσταλλος.'], [24.42, 'Παίρνει ρεύμα, λυγίζει, πετάει σταγόνα.'], [27.25, 'Χιλιάδες φορές το δευτερόλεπτο.'],
  [29.18, 'Η κεφαλή τρέχει πέρα-δώθε,'],
  [30.9, 'και μετά από κάθε πέρασμα,'], [32.18, 'το βινύλιο προχωράει λίγο.'], [33.82, 'Ένας θερμαντήρας ζεσταίνει το βινύλιο:'], [36.08, 'το μελάνι πιάνει και στεγνώνει.'],
  [38.05, 'Και στο τέλος, το ίδιο μηχάνημα...'], [39.97, '...κόβει με μαχαιράκι...'], [41.05, '...γύρω-γύρω από το σχέδιο.'], [42.58, 'Κι ο σκούφος;'],
  [43.52, 'Κίτρινες κουκκίδες με λίγες ματζέντα.'], [45.5, 'Το μάτι σου βλέπει μουσταρδί.'], [47.45, 'Στείλε μας το σχέδιό σου,'], [48.78, '...να το τυπώσουμε.'], [49.85, HOOK]];
const scene = (fn, t0) => (ctx, lt) => {
  const t = t0 + lt; fn(ctx, t); captionSeq(ctx, t, CAPS);
  if (t < 3.1) seriesTag(ctx, t + 1, TAG);                                          // ήδη στο frame 0 · μόνο με το caption του hook
  if (t >= 49.85) seriesTag(ctx, t - 49.85 + 1, TAG);                               // seamless loop: ξανά μαζί με το caption του hook
};
const FNS = [hook, rip, ride, plate, piezo, passes, heat, cutting, answer, outro];

require('./render.js')({
  name: 'pf05_ektypotis',
  SCENES: FNS.map((fn, i) => [scene(fn, SC[i]), SC[i + 1] - SC[i]]),
  WIPES: [1, 2, 4, 5, 6, 7, 9],                                     // χωρίς wipe: σωληνάκι → πλάκα (one-take) · κοπή → ξεκόλλημα (ίδιο πλατό)
  LOOP: 'cut',
  VO_FILE: 'vo/pf05_vo.mp3', VO_AT: 0.2,
  SFX: [
    [0.25, 'zoom', { gain: 0.7, note: 'zoom out από τις κουκκίδες' }],
    ...CH.map((_, i) => [T.tessera + i * 0.13, 'pop', { seed: i + 1, note: i ? '' : '4 φυσίγγια' }]),
    [T.pos + 0.05, 'pop', { seed: 7, note: '«?»' }], [T.pos + 0.1, 'boing', { gain: 0.7 }], [T.pos + 0.15, 'ticks', { count: 10, gap: 0.05, rise: 1.4, note: 'χρώματα γύρω γύρω' }],
    [T.xorizei + 0.3, 'swoosh', { gain: 0.6, note: 'separations' }],
    ...WT.map((w, i) => [w + 0.1, 'blip', { seed: i, note: i ? '' : 'κυανό · ματζέντα · κίτρινο · μαύρο' }]),
    [9.28, 'slide', { dur: 0.5, note: 'φυσίγγια μπαίνουν' }], [9.72, 'click', { note: 'κουμπώνουν' }],
    [9.95, 'flow', { dur: 3.9, note: 'μελάνι στο σωληνάκι' }], [10.45, 'whoosh', { dur: 2.4, peak: 0.3, gain: 0.5, lo: 200, hi: 1400, pan: 0.4, note: 'κυνήγι (κάμερα)' }],
    [T.kefali + 0.05, 'blip', { seed: 5, note: 'ΚΕΦΑΛΗ' }],
    [14.2, 'flow', { dur: 1.3, seed: 2, gain: 0.6, note: 'γεμίζει ο damper' }], [T.damper + 0.05, 'stamp', { note: 'DAMPER' }], [T.kratai, 'pop', { seed: 8, note: 'μανόμετρο' }],
    [T.stazei - 0.2, 'drop', { f0: 600, gain: 0.7, note: 'μηνίσκος' }], [T.stazei + 0.05, 'stamp', { seed: 2, note: 'ΔΕΝ ΣΤΑΖΕΙ' }],
    [17.9, 'zoom', { gain: 0.8, note: 'βουτιά στο ακροφύσιο' }], [SC[3] + 0.05, 'air', { gain: 0.6, note: 'zoom out: πλάκα' }],
    ...CH.map((_, i) => [T.seires + i * 0.2, 'blip', { seed: 10 + i, note: i ? '' : 'σειρές C · M · Y · K' }]),
    [21.55, 'zoom', { gain: 0.5 }],
    [SC[4] + 0.05, 'pop', { seed: 9, note: 'τομή κεφαλής' }], [T.piezo + 0.1, 'stamp', { seed: 3, note: 'ΠΙΕΖΟ' }],
    [T.revma + 0.05, 'beep', { gain: 0.5, note: 'ρεύμα ⚡' }], [T.lygizei, 'thud', { gain: 0.5, note: 'λυγίζει' }],
    [T.petaei + 0.02, 'drop', { note: 'σταγόνα' }], [T.petaei + 0.42, 'pop', { seed: 11, gain: 0.5, note: 'πέφτει στο βινύλιο' }],
    [T.xiliades, 'drop', { dur: 1.75, rate: 1.6, rise: 30, note: 'χιλιάδες φορές (επιτάχυνση ως βουητό)' }],
    [PS.t0, 'plotter', { dur: PS.per * PS.n, note: 'περάσματα κεφαλής' }], ...Array.from({ length: PS.n }, (_, k) => [PS.t0 + k * PS.per + PS.run, 'ticks', { count: 2, gap: 0.04, gain: 0.4, seed: k, note: k ? '' : 'βινύλιο προχωράει' }]),
    [T.therm + 0.05, 'pop', { seed: 12, note: 'θερμόμετρο' }], [T.therm + 0.3, 'air', { dur: 1.2, gain: 0.5, note: 'ζέστη' }],
    [T.piani, 'thud', { gain: 0.4, note: 'πιάνει' }], [T.stegn + 0.05, 'air', { seed: 4, gain: 0.6, note: 'διαλύτης φεύγει' }],
    [T.telos, 'slide', { dur: 0.6, seed: 4, note: 'καρότσι' }], [T.kovei + 0.05, 'click', { note: 'μαχαιράκι κάτω' }],
    [CUT_T[0], 'plotter', { dur: CUT_T[1] - CUT_T[0], seed: 2, note: 'contour cut' }], [T.gyro, 'pop', { seed: 13, note: 'inset τομή' }],
    [PEEL[0], 'peel', { dur: 0.9, note: 'ξεκόλλημα' }], [PEEL[1], 'shimmer', { gain: 0.6, note: '✨ αυτοκόλλητο' }],
    [LOUPE[0], 'swoosh', { gain: 0.6, note: 'φακός' }], [T.kitrines + 0.2, 'blip', { seed: 20, note: 'κίτρινο' }], [T.matz2, 'blip', { seed: 21, note: 'ματζέντα' }],
    [T.mati, 'pop', { seed: 14, note: '= μουσταρδί' }], [T.moust, 'ding', { gain: 0.8 }],
    [47.6, 'pop', { seed: 15, note: 'μήνυμα «Το σχέδιό μου»' }], [T.typ, 'sent', { note: 'στάλθηκε' }], [49.05, 'zoom', { gain: 0.8, note: 'zoom στις κουκκίδες → loop' }],
  ],
});
