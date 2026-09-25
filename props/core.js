// props/core.js — κοινά χρώματα των props + φόντα
const L = require('../lib.js');
const { C, ST, W, H, cut, rectPts, circlePts, starPts, rng } = L;

const BRAND = '#2854F3'; // brand blue από το λογότυπο: CTA, έμφαση
const HOOD = '#1C2E66', HOODD = '#132253'; // navy φούτερ + σκούρα απόχρωση (και default βαφή θερμός)
const ENGR = '#C9CDD8'; // χρώμα χάραξης laser πάνω σε σκούρο υλικό (notebook, θερμός)

// ---------- backgrounds ----------
// full-screen χρωματιστό χαρτί (φόντο) · scrib = χρώμα scribble
const bgFlat = (ctx, col, scrib, seed = 5) => cut(ctx, rectPts(-40, -40, W + 80, H + 80), col, { seed, edge: false, shadow: false, scribble: scrib });
function tiles(ctx) { // laundry / bathroom tiles + navy floor
  bgFlat(ctx, '#CFE0F7');
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6; const r = rng(ST.B + 9);
  for (let x = 0; x <= W; x += 135) { ctx.beginPath(); ctx.moveTo(x + (r() - .5) * 3, 0); ctx.lineTo(x + (r() - .5) * 3, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 135) { ctx.beginPath(); ctx.moveTo(0, y + (r() - .5) * 3); ctx.lineTo(W, y + (r() - .5) * 3); ctx.stroke(); }
  ctx.restore();
  cut(ctx, rectPts(-40, 1740, W + 80, 300), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
}
function wallShelf(ctx, o = {}) { // workshop wall with vinyl rolls on a shelf · o.y = πάνω άκρη ραφιού (default 640: τα ρολά βγαίνουν κάτω από caption 2 γραμμών)
  const y = o.y ?? 640;
  bgFlat(ctx, C.blue, '#3456B0', 11);
  cut(ctx, rectPts(-40, y, W + 80, 40), C.paper, { seed: 12, amp: 2, edgeW: 6 });
  const cols = [C.sky, BRAND, C.paper, '#F4D98A', C.mid];
  for (let i = 0; i < 7; i++) cut(ctx, circlePts(110 + i * 140, y - 60, 56, 56, 24), cols[i % 5], { seed: 13 + i, amp: 2, edgeW: 6 });
}
// φόντο με αστεράκια που αναβοσβήνουν (ζώνη πάνω + κάτω)
function starsBG(ctx, lt, col = C.blue, scrib = '#3456B0') {
  bgFlat(ctx, col, scrib, 81); const r = rng(99);
  for (let i = 0; i < 18; i++) { const x = r() * W, y = r() < 0.6 ? 30 + r() * 240 : 1640 + r() * 260, sz = (10 + r() * 14) * (0.75 + 0.25 * Math.sin(lt * 5 + i)); cut(ctx, starPts(x, y, sz), i % 4 ? '#fff' : '#F4D98A', { seed: 700 + i, amp: 1, edgeW: 3, shadow: false }); }
}

module.exports = { BRAND, HOOD, HOODD, ENGR, bgFlat, tiles, wallShelf, starsBG };
