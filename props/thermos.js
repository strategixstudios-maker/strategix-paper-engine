// props/thermos.js — θερμός με κυλινδρική χάραξη (pf02)
const L = require('../lib.js');
const { C, cut, rectPts, rrPts } = L;
const { HOOD, HOODD, ENGR } = require('./core.js');
const { kostasLogo } = require('./logos.js');

// Τοπική γεωμετρία (όρθιο, origin = κέντρο σώματος): R ακτίνα, HB ύψος σώματος, lid πάνω. TH.top = πάνω άκρη καπακιού.
// Κυλινδρική προβολή: η χάραξη ζει σε «ξετυλιγμένο» texture (περιφέρεια × ύψος) και ζωγραφίζεται σε λωρίδες,
// οπότε όταν γυρίζει (o.phase, rad) το λογότυπο συμπιέζεται σωστά στις άκρες. Ξαπλωμένο: rot = -π/2 (καπάκι αριστερά).
const TH = { R: 90, HB: 440, ring: 26, lid: 110, top: -356, bot: 220, lw: 200, ly: -10 };
TH.C = Math.round(2 * Math.PI * TH.R);
const TH_TEX = L.createCanvas(TH.C * 2, TH.HB);
// thermosPhase(p) → phase ώστε η στήλη που χαράζεται τώρα να είναι μπροστά/κάτω από τη δέσμη (θ = 0)
const thermosPhase = p => (-TH.lw / 2 + p * TH.lw) / TH.R;
// θερμός (ανοξείδωτο, ματ βαφή). o.engrave 0..1 (αποκάλυψη λογοτύπου κατά την περιφέρεια) | false · o.phase περιστροφή · o.col χρώμα βαφής · o.logo(ctx, cx, cy, size, col)
function thermos(ctx, x, y, s, o = {}) {
  const { R, HB, ring, lid } = TH, sd = o.seed || 7000, col = o.col || HOOD, e = o.engrave ?? 1, ph = o.phase || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  cut(ctx, rrPts(-R + 10, -HB / 2 - ring - lid, 2 * R - 20, lid, 24), col, { seed: sd + 1, amp: 2, edgeW: o.edgeW ?? 7, scribble: HOODD, shadow: o.shadow });
  cut(ctx, rectPts(-R + 16, -HB / 2 - ring - lid + 18, 2 * R - 32, 10), 'rgba(255,255,255,0.10)', { seed: sd + 2, amp: 1, edge: false, shadow: false });
  cut(ctx, rrPts(-R + 4, -HB / 2 - ring - 4, 2 * R - 8, ring + 12, 6), C.silver, { seed: sd + 3, amp: 1.5, edgeW: o.edgeW ?? 6, shadow: false });
  const bf = cut(ctx, rrPts(-R, -HB / 2, 2 * R, HB, 30), col, { seed: sd + 4, amp: 2, edgeW: o.edgeW ?? 8, scribble: HOODD, shadow: o.shadow });
  ctx.save(); L.path(ctx, bf); ctx.clip();
  if (o.engrave !== false && e > 0) {
    const t = TH_TEX.getContext('2d'); t.clearRect(0, 0, TH_TEX.width, HB);
    for (const off of [0, TH.C]) { const cx = TH.C / 2 + off, cy = HB / 2 + TH.ly, x0 = cx - TH.lw / 2;
      t.save(); t.beginPath(); t.rect(x0 - 4, 0, TH.lw * e + 4, HB); t.clip();
      (o.logo || ((c, a, b, z, k) => kostasLogo(c, a, b, z, { mono: k })))(t, cx, cy, TH.lw, o.engC || ENGR); t.restore(); }
    const N = 44;
    for (let i = 0; i < N; i++) {
      const a0 = -Math.PI / 2 + i * Math.PI / N, a1 = a0 + Math.PI / N, x0 = R * Math.sin(a0), x1 = R * Math.sin(a1);
      let u = ((R * (a0 + ph)) % TH.C + TH.C) % TH.C, du = R * (a1 - a0);
      ctx.drawImage(TH_TEX, TH.C / 2 + u, 0, du, HB, x0, -HB / 2, x1 - x0 + 0.6, HB);
    }
  }
  const g = ctx.createLinearGradient(-R, 0, R, 0); g.addColorStop(0, 'rgba(0,0,0,0.38)'); g.addColorStop(0.28, 'rgba(255,255,255,0.10)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g; ctx.fillRect(-R, -HB / 2, 2 * R, HB);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-R, HB / 2 - 26, 2 * R, 26);
  ctx.restore(); ctx.restore();
}

module.exports = { TH, thermosPhase, thermos };
