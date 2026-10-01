// props/street.js — δρόμος με μαγαζιά (pm01 → ab01): τέντα με ρίγες, πρόσοψη μαγαζιού (ταμπέλα · τέντα · βιτρίνα · πόρτα) · 2D, για σκηνές ή για υφές μακέτας (D.tex)
const L = require('../lib.js');
const { C, cut, rectPts, rrPts } = L;

// τέντα με ρίγες + δόντια από κάτω · (x0, y0) πάνω-αριστερά · o = { n: ρίγες (8), a / b: χρώματα (paper / navy), tooth: ύψος δοντιών (34) }
function awning(ctx, x0, y0, w, h, seed, o = {}) {
  const n = o.n || 8, a = o.a || '#FBFAF6', b = o.b || C.navy, th = o.tooth ?? 34;
  cut(ctx, rectPts(x0, y0, w, h), a, { seed, amp: 2, edgeW: 8 });
  for (let i = 0; i < n; i += 2) cut(ctx, rectPts(x0 + i * w / n, y0, w / n, h), b, { seed: seed + 1 + i, amp: 1.2, edge: false, shadow: false });
  for (let i = 0; i < n; i++) { const xx = x0 + i * w / n; cut(ctx, [[xx, y0 + h], [xx + w / n, y0 + h], [xx + w / n / 2, y0 + h + th]], i % 2 ? a : b, { seed: seed + 20 + i, amp: 1, edgeW: 5 }); }
}

// πρόσοψη μαγαζιού στο (x, y, w, h): τοίχος · ταμπέλα (πάνω 20%) · τέντα · βιτρίνα (αριστερά) + πόρτα (δεξιά) · σοβατεπί
// o = { seed, wall, wallS (scribble), frame (κουφώματα), glass, awning: { a, b } | false, sign(ctx, g) / window(ctx, g) / door(ctx, g): ζωγραφίζουν μέσα στο g = { x, y, w, h } }
// → { sign, window, door } (ορθογώνια) για ό,τι μπαίνει από πάνω
function shopFront(ctx, x, y, w, h, o = {}) {
  const sd = o.seed || 7700, fr = o.frame || C.navy, gl = o.glass || '#A9C3F1';
  cut(ctx, rectPts(x, y, w, h), o.wall || '#E9DCC4', { seed: sd, amp: 2, scribble: o.wallS || '#DCCBAE', edge: false, shadow: false });
  const sign = { x: x + w * 0.06, y: y + h * 0.04, w: w * 0.88, h: h * 0.17 };
  const aw = { x: x + w * 0.03, y: sign.y + sign.h + h * 0.025, w: w * 0.94, h: h * 0.065 };
  const top = aw.y + aw.h + h * 0.04, bot = y + h * 0.93;
  const win = { x: x + w * 0.08, y: top, w: w * 0.52, h: (bot - top) * 0.62 }, door = { x: x + w * 0.68, y: top, w: w * 0.24, h: bot - top };
  for (const [g, k] of [[win, 1], [door, 2]]) {
    cut(ctx, rectPts(g.x - 12, g.y - 12, g.w + 24, g.h + 24), fr, { seed: sd + k, amp: 1.5, scribble: '#1B2D62' });
    cut(ctx, rectPts(g.x, g.y, g.w, g.h), gl, { seed: sd + 10 + k, amp: 1, edge: false, shadow: false });
    if (k === 1 && o.window) { ctx.save(); ctx.beginPath(); ctx.rect(g.x, g.y, g.w, g.h); ctx.clip(); o.window(ctx, g); ctx.restore(); }
    if (k === 2 && o.door) o.door(ctx, g);
    ctx.save(); ctx.beginPath(); ctx.rect(g.x, g.y, g.w, g.h); ctx.clip(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#fff'; // ανταύγειες
    for (const [f0, f1] of [[0.15, 0.1], [0.32, 0.04], [0.7, 0.12]]) { const x0 = g.x + g.w * f0, w0 = g.w * f1, k2 = g.h * 0.45; ctx.beginPath(); ctx.moveTo(x0, g.y); ctx.lineTo(x0 + w0, g.y); ctx.lineTo(x0 + w0 - k2, g.y + g.h); ctx.lineTo(x0 - k2, g.y + g.h); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  cut(ctx, rectPts(door.x + door.w * 0.78, door.y + door.h * 0.48, door.w * 0.08, door.h * 0.1), C.gold, { seed: sd + 5, amp: 0.8, edgeW: 3, shadow: false }); // πόμολο
  cut(ctx, rectPts(x, bot, w, y + h - bot), o.plinth || '#8B5E3C', { seed: sd + 6, amp: 1.5, scribble: '#7A5033', edge: false, shadow: false });
  if (o.sign) o.sign(ctx, sign);
  if (o.awning !== false) awning(ctx, aw.x, aw.y, aw.w, aw.h, sd + 30, { ...(o.awning || {}), tooth: aw.h * 0.32 });
  return { sign, window: win, door };
}

module.exports = { awning, shopFront };
