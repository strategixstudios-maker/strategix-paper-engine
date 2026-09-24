// props/notebook.js — notebook A5 δερματίνη (pf01)
const L = require('../lib.js');
const { C, cut, rectPts, rrPts } = L;
const { ENGR } = require('./core.js');
const { cafeLogo } = require('./logos.js');

// notebook A5 (PU leatherette) — local geometry, used to aim the laser at the logo
const NB = { w: 300, h: 420, lx: 12, ly: -20, ls: 0.76, top: -138, bot: 22, half: 108 };
// notebook A5 με χαραγμένο λογότυπο. o.engrave 0..1 (reveal top→bottom) | false ; o.sy vertical squash (perspective on a bed) ; o.col cover colour
function notebook(ctx, x, y, s, rot = 0, o = {}) {
  const sd = o.seed || 4000, w = NB.w, h = NB.h;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s * (o.sy || 1));
  cut(ctx, rrPts(-w / 2 + 8, -h / 2 + 8, w - 4, h - 4, 14), '#EDE7D8', { seed: sd, amp: 1.5, edgeW: 5, shadow: o.shadow });
  const pf = cut(ctx, rrPts(-w / 2, -h / 2, w, h, 18), o.col || C.navy, { seed: sd + 1, amp: 2, edgeW: o.edgeW ?? 8, scribble: '#16285A', shadow: o.shadow });
  ctx.save(); L.path(ctx, pf); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-w / 2, -h / 2, 30, h);
  ctx.setLineDash([9, 7]); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2 + 42, -h / 2 + 14, w - 60, h - 28); ctx.setLineDash([]);
  const e = o.engrave ?? 1;
  if (o.engrave !== false && e > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, NB.top + (NB.bot - NB.top) * e + h / 2); ctx.clip();
    cafeLogo(ctx, NB.lx + 1.5, NB.ly + 2, NB.ls, 'good', 1, 'rgba(0,0,0,0.5)');
    cafeLogo(ctx, NB.lx, NB.ly, NB.ls, 'good', 1, o.engC || ENGR);
    ctx.restore();
  }
  ctx.restore();
  if (o.band !== false) cut(ctx, rectPts(w / 2 - 24, -h / 2 - 4, 15, h + 8), '#050C22', { seed: sd + 3, amp: 1, edge: false, shadow: false });
  ctx.restore();
}

module.exports = { NB, notebook };
