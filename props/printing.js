// props/printing.js — εκτύπωση ρολού & κοπή (pf05 → pf06): χρώματα μελανιών, εκτυπωτής σε πρόσοψη, περίγραμμα κοπής (contour cut) από το alpha οποιουδήποτε σχεδίου
const L = require('../lib.js');
const { C, cut, rrPts, clamp, lerp } = L;

const INK = { C: '#16A3E0', M: '#E2358E', Y: '#F6D22F', K: '#262833' }; // CMYK μελάνια (φυσίγγια, κουκκίδες, κεφαλή)
const INKS = ['C', 'M', 'Y', 'K']; // σειρά μελανιών (φυσίγγια, διαχωρισμοί)
const METAL = { steel: '#AEB8CC', dark: '#7E89A2', light: '#D5DCE9', body: '#E9EDF4', liner: '#E6DFCD' }; // μέταλλο μηχανημάτων · σώμα · χαρτί-φορέας (liner) αυτοκόλλητου
const dot = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); };

// εκτυπωτής ρολού, πρόσοψη (σε px 1080×1920): στάντ, σώμα 60..1020 × 560..830, παράθυρο με το καρότσι, φυσίγγια, πάνελ, σχισμή εξόδου (y 786–816) · o.car = x καροτσιού
function printerFront(ctx, t, o = {}) {
  const { steel, dark, body } = METAL;
  for (const lx of [150, 930]) { cut(ctx, rrPts(lx - 22, 800, 44, 860, 12), dark, { seed: 9200 + lx, amp: 1.5, edgeW: 5 }); cut(ctx, rrPts(lx - 95, 1640, 190, 36, 16), C.navy, { seed: 9203 + lx, amp: 1.5, edgeW: 5 }); }
  cut(ctx, rrPts(150, 1420, 780, 30, 12), steel, { seed: 9206, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(60, 560, 960, 270, 40), body, { seed: 9210, amp: 2, scribble: '#DCE2EC' });
  cut(ctx, rrPts(60, 560, 960, 64, 28), '#CBD3E1', { seed: 9211, amp: 1.5, edgeW: 5, shadow: false });
  const win = cut(ctx, rrPts(206, 642, 672, 108, 22), '#34466F', { seed: 9212, amp: 1.5, edgeW: 6 });
  ctx.save(); L.path(ctx, win); ctx.clip();
  ctx.fillStyle = steel; ctx.fillRect(206, 668, 672, 10);                                               // ράγα
  const cx = o.car ?? lerp(330, 750, 0.5 + 0.5 * Math.sin(t * 5));
  cut(ctx, rrPts(cx - 58, 662, 116, 76, 12), C.navy, { seed: 9213, amp: 1, edgeW: 4, shadow: false });
  INKS.forEach((k, i) => { ctx.fillStyle = INK[k]; ctx.fillRect(cx - 40 + i * 22, 650, 10, 20); });
  ctx.restore();
  cut(ctx, rrPts(84, 642, 104, 108, 16), '#CBD3E1', { seed: 9214, amp: 1.5, edgeW: 5, shadow: false });   // πόρτα φυσιγγίων
  INKS.forEach((k, i) => cut(ctx, rrPts(98 + i * 22, 660, 16, 72, 6), INK[k], { seed: 9215 + i, amp: 0.8, edge: false, shadow: false }));
  cut(ctx, rrPts(898, 642, 96, 108, 16), C.navy, { seed: 9220, amp: 1.5, edgeW: 5 });                    // πάνελ
  dot(ctx, 922, 672, 9, '#7EE0A0'); dot(ctx, 948, 672, 9, C.paper); dot(ctx, 972, 672, 9, C.paper);
  ctx.fillStyle = '#8FB0EE'; ctx.fillRect(914, 696, 66, 34);
  cut(ctx, rrPts(170, 786, 740, 30, 12), '#22304F', { seed: 9222, amp: 1, edgeW: 5, shadow: false });    // σχισμή εξόδου
}

// περίγραμμα κοπής από το alpha ενός σχεδίου (canvas): διεύρυνση κατά pad px (λευκό περιθώριο) → πολικό από το (cx, cy), n σημεία από την κορυφή
// δεξιόστροφα, εξομάλυνση ±smooth → { pts: [[x, y], ...] (px του σχεδίου), len (αθροιστικά μήκη), total } · σχήμα «αστέρι» από το κέντρο (λογότυπα, αυτοκόλλητα)
function contour(img, o = {}) {
  const w = img.width, h = img.height, D = o.pad ?? 16, cx = o.cx ?? w / 2, cy = o.cy ?? h / 2, N = o.n ?? 220, sm = o.smooth ?? 4;
  const c = L.createCanvas(w, h), x = c.getContext('2d');
  for (let a = 0; a < 20; a++) x.drawImage(img, Math.cos(a / 20 * 2 * Math.PI) * D, Math.sin(a / 20 * 2 * Math.PI) * D);
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, w, h).data, R = [], r0 = o.rMax ?? Math.floor(Math.hypot(w, h) / 2);
  for (let n = 0; n < N; n++) {
    const a = n / N * 2 * Math.PI - Math.PI / 2; let r = r0;
    for (; r > 0; r--) { const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r); if (px >= 0 && py >= 0 && px < w && py < h && d[(py * w + px) * 4 + 3] > 80) break; }
    R.push(r);
  }
  const pts = R.map((_, n) => { let s = 0; for (let k = -sm; k <= sm; k++) s += R[(n + k + N) % N]; const r = s / (2 * sm + 1), a = n / N * 2 * Math.PI - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  let s = 0; const len = pts.map((p, i) => (s += i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0));
  return { pts, len, total: s + Math.hypot(pts[0][0] - pts[N - 1][0], pts[0][1] - pts[N - 1][1]) };
}
// σημείο του περιγράμματος στο ποσοστό p (0..1) της διαδρομής → [x, y, i] (i = επόμενο σημείο · για μερική γραμμή κοπής: pts.slice(0, i) + [x, y])
function contourAt(Cn, p) {
  const L0 = clamp(p) * Cn.total, { pts, len } = Cn; let i = 1; while (i < pts.length && len[i] < L0) i++;
  const a = pts[i - 1], b = pts[i % pts.length], f = (L0 - len[i - 1]) / ((i < pts.length ? len[i] : Cn.total) - len[i - 1] || 1);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, i];
}

module.exports = { INK, INKS, METAL, printerFront, contour, contourAt };
