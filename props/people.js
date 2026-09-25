// props/people.js — κόσμος σε κίνηση: περαστικοί, υπάλληλοι (person() του lib.js με bob / τρέξιμο) (pm01 → pm02)
const L = require('../lib.js');
const { person } = L;

// person() που περπατάει ή τρέχει: (x, y) = λαιμός (όπως person) · bob στο y · o.walk ένταση bob (default 1) · o.ph φάση ·
// o.run 0..1 = τρέξιμο (γρηγορότερο bob, κλίση προς o.dir ±1, γραμμές ταχύτητας πίσω του) · o.carry(ctx) = ό,τι κρατάει μπροστά στο στήθος
// (τοπικές συντεταγμένες του person, πριν την κλίμακα s) · τα υπόλοιπα o → person() (seed, type, shirt, shirtS, look, mood, sweat...)
function walker(ctx, lt, x, y, s, o = {}) {
  const run = o.run || 0, dir = o.dir || 1, bob = Math.abs(Math.sin(lt * (9 + 8 * run) + (o.ph || 0))) * (10 + 14 * run) * (o.walk ?? 1), yy = y - bob;
  ctx.save();
  if (run > 0.2) {                                                                  // γραμμές ταχύτητας
    ctx.strokeStyle = 'rgba(16,26,51,0.35)'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
    for (const [dy, len] of [[-120, 150], [30, 210], [170, 130]]) { const x0 = x - dir * 250 * s; ctx.beginPath(); ctx.moveTo(x0, yy + dy * s); ctx.lineTo(x0 - dir * len * s * run, yy + dy * s); ctx.stroke(); }
  }
  ctx.translate(x, yy + 420 * s); ctx.rotate(dir * 0.12 * run); ctx.translate(-x, -(yy + 420 * s));
  person(ctx, x, yy, s, o);
  if (o.carry) { ctx.save(); ctx.translate(x, yy); ctx.scale(s, s); o.carry(ctx); ctx.restore(); }
  ctx.restore();
}

module.exports = { walker };
