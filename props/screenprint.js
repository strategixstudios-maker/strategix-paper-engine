// props/screenprint.js — μεταξοτυπία: τελάρο (πλαίσιο + πλέγμα + στένσιλ), cutting mat για top-down λήψεις (pf03 → pm02)
const L = require('../lib.js');
const { C, W, H, cut, rrPts } = L;

// ---------- φόντο ----------
// cutting mat στα χρώματά μας (navy + λεπτό grid sky + γωνιακοί οδηγοί) για top-down λήψεις σε πάγκο
function cuttingMat(ctx) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.strokeStyle = 'rgba(143,176,238,0.13)'; ctx.lineWidth = 2;
  for (let x = 120; x <= 960; x += 90) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 1580); ctx.stroke(); }
  for (let y = 150; y <= 1580; y += 90) { ctx.beginPath(); ctx.moveTo(120, y); ctx.lineTo(960, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(143,176,238,0.28)'; ctx.lineWidth = 4; ctx.strokeRect(120, 150, 840, 1430);
  ctx.lineWidth = 6;
  for (const [cx, cy, sx, sy] of [[120, 150, 1, 1], [960, 150, -1, 1], [120, 1580, 1, -1], [960, 1580, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx, cy + 46 * sy); ctx.lineTo(cx, cy); ctx.lineTo(cx + 46 * sx, cy); ctx.stroke();
  }
  ctx.restore();
}

// ---------- τελάρο ----------
// χρώματα τελάρου: frame = αλουμίνιο (steel blue) · wood = παλιό ξύλινο · mesh = πλέγμα · emul = φωτοευαίσθητο (στένσιλ)
const SCREEN = { frame: '#3C4F86', wood: '#A7794C', mesh: '#EDEBE3', emul: '#A9C6F7' };
// πλέγμα: λεπτές γραμμές ανά step μέσα σε στρογγυλεμένο ορθογώνιο (x, y = πάνω-αριστερά)
function meshGrid(ctx, x, y, w, h, step = 13, r = 14) {
  ctx.save(); L.path(ctx, rrPts(x, y, w, h, r)); ctx.clip();
  ctx.strokeStyle = 'rgba(90,90,90,0.15)'; ctx.lineWidth = 1.5;
  for (let a = x; a <= x + w; a += step) { ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(a, y + h); ctx.stroke(); }
  for (let b = y; b <= y + h; b += step) { ctx.beginPath(); ctx.moveTo(x, b); ctx.lineTo(x + w, b); ctx.stroke(); }
  ctx.restore();
}
// τελάρο (κάτοψη ή πρόσοψη): (x, y) = κέντρο · hw/hh = μισό πλάτος/ύψος · o.border πάχος πλαισίου · o.col πλαίσιο (SCREEN.frame | SCREEN.wood) ·
// o.fill εσωτερικό (SCREEN.mesh | SCREEN.emul) · o.inner(ctx, iw, ih) = στένσιλ/μελάνι μέσα στο πλέγμα (origin = κέντρο, clipped) · o.rot · o.seed · o.alpha
function screenFrame(ctx, x, y, hw, hh, o = {}) {
  const b = o.border ?? Math.round(Math.min(hw, hh) * 0.15), iw = hw - b, ih = hh - b, sd = o.seed || 7500, r = Math.min(30, b * 0.8);
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  cut(ctx, rrPts(-hw, -hh, hw * 2, hh * 2, r), o.col || SCREEN.frame, { seed: sd, amp: 2, edgeW: o.edgeW ?? 7 });
  const inner = rrPts(-iw, -ih, iw * 2, ih * 2, r * 0.45);
  cut(ctx, inner, o.fill || SCREEN.mesh, { seed: sd + 1, amp: 1.2, edgeW: 4, shadow: false });
  if (o.inner) { ctx.save(); L.path(ctx, inner); ctx.clip(); o.inner(ctx, iw, ih); ctx.restore(); }
  meshGrid(ctx, -iw, -ih, iw * 2, ih * 2, o.step || 13, r * 0.45);
  ctx.restore();
}

module.exports = { cuttingMat, SCREEN, screenFrame };
