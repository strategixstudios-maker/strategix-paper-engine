// props/textile.js — ρούχα & πλύση: φούτερ, t-shirt, κάδος, πλυντήριο
const L = require('../lib.js');
const { C, ST, cut, rectPts, rrPts, circlePts, txt, rng } = L;
const { BRAND, HOOD, HOODD } = require('./core.js');
const { cafeLogo } = require('./logos.js');

// flat-lay hoodie. o.logo: 'good'|'cracked'|'none'|'film'|false  o.logoFn(ctx) draws a custom logo at chest (local coords, origin = chest)
function hoodie(ctx, x, y, s, rot, o = {}) {
  const sd = o.seed || 3000, col = o.color || HOOD, dark = o.dark || HOODD, sc = o.scrib || '#2A3D7A';
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, circlePts(0, -185, 122, 88, 30), col, { seed: sd + 1, amp: 3 });
  cut(ctx, circlePts(0, -176, 74, 46, 24), '#0C173A', { seed: sd + 2, amp: 2, edge: false, shadow: false });
  cut(ctx, [[-170, -150], [-110, -120], [-250, 250], [-332, 212]], col, { seed: sd + 3, scribble: sc });
  cut(ctx, [[170, -150], [110, -120], [250, 250], [332, 212]], col, { seed: sd + 4, scribble: sc });
  cut(ctx, [[-255, 238], [-330, 205], [-348, 240], [-270, 276]], dark, { seed: sd + 5, amp: 1.5, edgeW: 5 });
  cut(ctx, [[255, 238], [330, 205], [348, 240], [270, 276]], dark, { seed: sd + 6, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(-185, -160, 370, 440, 34), col, { seed: sd + 7, scribble: sc });
  cut(ctx, rectPts(-185, 250, 370, 38), dark, { seed: sd + 8, amp: 1.5, edgeW: 5 });
  cut(ctx, [[-120, 118], [120, 118], [150, 250], [-150, 250]], '#22357A', { seed: sd + 9, amp: 2, edgeW: 5 });
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 30, -150); ctx.quadraticCurveTo(sx * 40, -90, sx * 36, -44); ctx.stroke(); }
  if (o.logoFn) { ctx.save(); ctx.translate(0, -10); o.logoFn(ctx); ctx.restore(); }
  else if (o.logo !== false) cafeLogo(ctx, 0, -10, 0.95, o.logo || 'good', sd + 20);
  ctx.restore();
}
// γεωμετρία του tshirt() (λαιμόκοψη πίσω/μπροστά, περίγραμμα, άνοιγμα λαιμού) — τοπικά, s = 1
const TSH = (() => {
  const q = (a, c, b, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
  const back = q([-98, -350], [0, -318], [98, -350]), front = q([-98, -350], [0, -178], [98, -350], 16);   // πίσω / μπροστά λαιμόκοψη
  const right = [[258, -302], [405, -205], [322, -78], [268, -128], ...q([268, -128], [256, 160], [272, 440], 6).slice(1)];
  const hem = q([272, 440], [0, 452], [-272, 440], 8).slice(1, -1);
  const outline = [...back.slice(1), ...right, ...hem, ...right.map(([x, y]) => [-x, y]).reverse()];   // back (αριστ.→δεξ.) → δεξιά πλευρά → πάτος → αριστερή
  return { back, front, outline, opening: [...back, ...front.slice(1, -1).reverse()], q };
})();
// flat-lay t-shirt (crew neck, κάτοψη): ribbed γιακάς + εσωτερικό πλάτης, κεκλιμένοι ώμοι, μανίκια με στρίφωμα, ραφές. Λαιμός y −350, πάτος 446, σώμα ±272, μανίκια ±405 · o.color, o.seed · o.logoFn(ctx) στο στήθος (origin = (0, −52))
function tshirt(ctx, x, y, s = 1, rot = 0, o = {}) {
  const sd = o.seed || 7200, col = o.color || C.paper, line = o.seam || 'rgba(120,110,90,0.28)', { q } = TSH;
  const poly = (p, c) => { ctx.beginPath(); p.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); if (c) ctx.closePath(); };
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const body = cut(ctx, TSH.outline, col, { seed: sd, amp: 2.5, edgeW: 8, scribble: o.scrib || '#E7E2D4' });
  ctx.save(); L.path(ctx, body); ctx.clip(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(160,150,125,0.16)'; ctx.lineWidth = 9;                                   // απαλές πτυχώσεις
  for (const k of [-1, 1]) { poly(q([k * 262, -110], [k * 205, -40], [k * 150, 60], 8)); ctx.stroke(); poly(q([k * 250, 250], [k * 190, 320], [k * 120, 360], 8)); ctx.stroke(); }
  ctx.strokeStyle = line; ctx.lineWidth = 3;                                                          // ραφές ώμου + μασχάλης
  for (const k of [-1, 1]) { poly([[k * 98, -350], [k * 258, -302]]); ctx.stroke(); poly(q([k * 258, -302], [k * 236, -212], [k * 268, -128], 8)); ctx.stroke(); }
  ctx.setLineDash([12, 9]); ctx.lineWidth = 3;                                                        // στριφώματα (ραφή με βελονιές)
  for (const k of [-1, 1]) { poly([[k * 383, -220], [k * 302, -95]]); ctx.stroke(); }
  poly(q([266, 414], [0, 426], [-266, 414], 10)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = o.rib || '#E8E2D3'; ctx.lineWidth = 42; poly(TSH.front); ctx.stroke();          // ribbed γιακάς μπροστά
  ctx.strokeStyle = 'rgba(120,110,90,0.22)'; ctx.lineWidth = 2.5;
  for (let i = 1; i < TSH.front.length - 1; i++) { const [a, b] = TSH.front[i], [c, d] = TSH.front[i + 1], nx = -(d - b), ny = c - a, n = Math.hypot(nx, ny) || 1; ctx.beginPath(); ctx.moveTo(a + nx / n * 4, b + ny / n * 4); ctx.lineTo(a + nx / n * 18, b + ny / n * 18); ctx.stroke(); }
  ctx.strokeStyle = line; ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
  poly(TSH.front.map(([a, b]) => [a * 1.02, b + 22 - Math.abs(a) * 0.02])); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  ctx.fillStyle = o.inside || '#CFC6B2'; poly(TSH.opening, true); ctx.fill();                        // εσωτερικό πλάτης (μέσα από τη λαιμόκοψη)
  ctx.save(); poly(TSH.opening, true); ctx.clip();
  ctx.strokeStyle = o.rib || '#E8E2D3'; ctx.lineWidth = 30; poly(TSH.back); ctx.stroke();           // γιακάς πλάτης
  ctx.fillStyle = '#FBFAF6'; ctx.fillRect(-20, -334, 40, 26); ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.strokeRect(-20, -334, 40, 26);   // ετικέτα
  ctx.restore();
  ctx.strokeStyle = 'rgba(110,100,80,0.35)'; ctx.lineWidth = 3; poly(TSH.front); ctx.stroke();      // άκρη λαιμόκοψης
  if (o.logoFn) { ctx.save(); ctx.translate(0, -52); o.logoFn(ctx); ctx.restore(); }
  ctx.restore();
}
// κάδος πλυντηρίου: φούτερ που γυρίζει + νερό + φυσαλίδες (clip στον κύκλο)
function drum(ctx, px, py, rr, spin, o = {}) {
  ctx.save(); ctx.beginPath(); ctx.arc(px, py, rr, 0, 7); ctx.clip();
  ctx.fillStyle = '#1B3A8C'; ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2);
  ctx.fillStyle = 'rgba(10,20,60,0.5)'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + spin * 0.6; for (const k of [0.45, 0.78]) { ctx.beginPath(); ctx.arc(px + Math.cos(a + k) * rr * k, py + Math.sin(a + k) * rr * k, rr * 0.03, 0, 7); ctx.fill(); } }
  if (o.hoodie !== false) hoodie(ctx, px + Math.cos(spin) * rr * 0.22, py + Math.sin(spin) * rr * 0.22, rr / 470, spin * 1.3, { logo: o.logo, seed: 3100 });
  const wl = py + rr * 0.25; ctx.fillStyle = 'rgba(143,176,238,0.55)'; ctx.beginPath(); ctx.moveTo(px - rr, py + rr);
  for (let x = -rr; x <= rr; x += 20) ctx.lineTo(px + x, wl + Math.sin(x / 40 + spin * 3) * rr * 0.04); ctx.lineTo(px + rr, py + rr); ctx.closePath(); ctx.fill();
  const r = rng(ST.B * 5 + 1); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(px + (r() - .5) * rr * 1.6, py + (r() - .1) * rr * 0.9, 4 + r() * rr * 0.04, 0, 7); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(px - rr * 0.35, py - rr * 0.42, rr * 0.42, rr * 0.16, -0.6, 0, 7); ctx.fill();
  ctx.restore();
}
// washing machine; returns [porthole x, y, glass radius]
function machine(ctx, cx, cy, w, h, spin, o = {}) {
  cut(ctx, rrPts(cx - w / 2, cy - h / 2, w, h, w * 0.05), C.paper, { seed: 700, scribble: '#E6E0D0', amp: 3 });
  const pt = cy - h / 2 + w * 0.03;
  cut(ctx, rrPts(cx - w / 2 + w * 0.03, pt, w * 0.94, h * 0.16, w * 0.03), C.pale, { seed: 701, amp: 2, edgeW: 6, shadow: false });
  cut(ctx, rrPts(cx - w * 0.12, pt + h * 0.035, w * 0.24, h * 0.09, 10), C.navy, { seed: 702, amp: 1.5, edge: false, shadow: false });
  txt(ctx, o.display || '40°', cx, pt + h * 0.08, { font: `${Math.round(w * 0.05)}px Brand`, color: C.sky });
  cut(ctx, circlePts(cx + w * 0.34, pt + h * 0.08, w * 0.055), C.silver, { seed: 703, amp: 1.5, edgeW: 5 });
  for (let i = 0; i < 3; i++) cut(ctx, circlePts(cx - w * 0.38 + i * w * 0.07, pt + h * 0.08, w * 0.022), [BRAND, C.sky, C.mid][i], { seed: 704 + i, amp: 1, edgeW: 4, shadow: false });
  const px = cx, py = cy + h * 0.08, R = w * 0.36;
  cut(ctx, circlePts(px, py, R, R, 48), C.silver, { seed: 710, amp: 2 });
  cut(ctx, circlePts(px, py, R * 0.88, R * 0.88, 48), '#8E97A6', { seed: 711, amp: 2, edge: false, shadow: false });
  drum(ctx, px, py, R * 0.78, spin, o);
  return [px, py, R * 0.78];
}

module.exports = { hoodie, tshirt, drum, machine };
