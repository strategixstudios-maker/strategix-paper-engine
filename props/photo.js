// props/photo.js — αληθινές φωτογραφίες (photos.js → photos/<ep>/) ως χάρτινα cut-outs: λευκή σκισμένη άκρη γύρω από το θέμα, σκιά, boil 12fps · λογότυπο πάνω στο ύφασμα (ad_xeimonas →)
const fs = require('fs'), { spawnSync } = require('child_process');
const L = require('../lib.js');
const { ST, rng } = L;

// αποκωδικοποίηση ΣΥΓΧΡΟΝΑ (ffmpeg → RGBA): το Image του canvas αποκωδικοποιεί async και τα frames ζωγραφίζονται σύγχρονα
function rgba(file) {
  const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const [w, h] = pr.stdout.trim().split(',').map(Number); if (!w) throw new Error(`photo: δεν διαβάζεται το ${file} (node photos.js <ep>)`);
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 28 });
  const cv = L.createCanvas(w, h), c = cv.getContext('2d'), id = c.createImageData(w, h); id.data.set(r.stdout); c.putImageData(id, 0, 0);
  return { cv, w, h, data: r.stdout };
}

const PHOTOS = {};
// φωτογραφία του επεισοδίου (cache) · o.border = πάχος λευκής άκρης σε px φωτογραφίας (default 22 ≈ 14px στην οθόνη για ύψος 900) · o.amp = σκίσιμο
function photo(ep, name, o = {}) {
  const key = ep + '/' + name; if (PHOTOS[key]) return PHOTOS[key];
  const I = rgba(`photos/${ep}/${name}.webp`), meta = JSON.parse(fs.readFileSync(`photos/${ep}/index.json`, 'utf8'))[name] || {};
  const R = o.border ?? 22, amp = o.amp ?? 7, P = Math.ceil(R + amp + 3);
  const Ph = { name, ep, img: I.cv, data: I.data, w: I.w, h: I.h, P, R, amp, meta, st: [], _jpg: null, logos: {} };
  // απόσταση κάθε pixel από το θέμα (chamfer 1 / √2, δύο περάσματα) → η λευκή άκρη = απόσταση ≤ R ± θόρυβος
  const GW = I.w + 2 * P, GH = I.h + 2 * P, D = new Float32Array(GW * GH).fill(1e9);
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) if (I.data[(y * I.w + x) * 4 + 3] > 128) D[(y + P) * GW + x + P] = 0;
  const Q = 1.4142;
  for (let y = 1; y < GH; y++) for (let x = 1; x < GW - 1; x++) { const i = y * GW + x; let d = D[i]; d = Math.min(d, D[i - 1] + 1, D[i - GW] + 1, D[i - GW - 1] + Q, D[i - GW + 1] + Q); D[i] = d; }
  for (let y = GH - 2; y >= 0; y--) for (let x = GW - 2; x >= 1; x--) { const i = y * GW + x; let d = D[i]; d = Math.min(d, D[i + 1] + 1, D[i + GW] + 1, D[i + GW + 1] + Q, D[i + GW - 1] + Q); D[i] = d; }
  Ph.D = D; Ph.GW = GW; Ph.GH = GH;
  return (PHOTOS[key] = Ph);
}
// θόρυβος τιμών (value noise) για σκισμένη άκρη: cell px, τιμή 0..1
function vnoise(seed, cell, GW, GH) {
  const nx = Math.ceil(GW / cell) + 2, ny = Math.ceil(GH / cell) + 2, r = rng(seed), g = new Float32Array(nx * ny); for (let i = 0; i < g.length; i++) g[i] = r();
  return (x, y) => { const fx = x / cell, fy = y / cell, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = g[iy * nx + ix], b = g[iy * nx + ix + 1], c = g[(iy + 1) * nx + ix], d = g[(iy + 1) * nx + ix + 1]; return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
}
// 3 παραλλαγές άκρης (boil 12fps, όπως το cut() του lib) · lazy
function sticker(Ph, k) {
  if (Ph.st[k]) return Ph.st[k];
  const { GW, GH, D, R, amp, P } = Ph, n1 = vnoise(4101 + k * 31 + Ph.name.length, 26, GW, GH), n2 = vnoise(5203 + k * 17, 7, GW, GH);
  const cv = L.createCanvas(GW, GH), c = cv.getContext('2d'), id = c.createImageData(GW, GH), px = id.data;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x, lim = R + amp * (2 * n1(x, y) - 1) + 2.2 * (2 * n2(x, y) - 1);
    if (D[i] <= lim) { const j = i * 4; px[j] = 0xFB; px[j + 1] = 0xFA; px[j + 2] = 0xF6; px[j + 3] = D[i] > lim - 1 ? Math.round(255 * (lim - D[i])) : 255; }
  }
  c.putImageData(id, 0, 0); c.drawImage(Ph.img, P, P);
  return (Ph.st[k] = cv);
}
function tinted(Ph, k, col) { // το σχήμα του sticker σε ένα χρώμα (cache)
  const key = col + k; Ph.tints = Ph.tints || {}; if (Ph.tints[key]) return Ph.tints[key];
  const src = sticker(Ph, k), cv = L.createCanvas(src.width, src.height), c = cv.getContext('2d'); c.drawImage(src, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = col; c.fillRect(0, 0, cv.width, cv.height);
  return (Ph.tints[key] = cv);
}
// cut-out στην οθόνη · (x, y) = κάτω-κέντρο της φωτογραφίας · hh = ύψος φωτογραφίας (px οθόνης)
// o = { rot, a, sx, sy (squash/stretch), lift 0..1 (σηκώνεται από το χαρτί: σκιά μακραίνει), shadow:false, tint: χρώμα (μόνο το σχήμα: τρύπα στη σελίδα, σιλουέτα), draw(ctx, Ph) σε px φωτογραφίας (λογότυπο κ.λπ.) }
function photoCut(ctx, Ph, x, y, hh, o = {}) {
  const s = hh / Ph.h, st = o.tint ? tinted(Ph, ST.B % 3, o.tint) : sticker(Ph, ST.B % 3), lf = o.lift || 0, a = o.a ?? 1;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s * (o.sx ?? 1), s * (o.sy ?? 1)); ctx.translate(-Ph.w / 2 - Ph.P, -Ph.h - Ph.P);
  if (o.shadow !== false) { ctx.save(); ctx.translate((7 + lf * 22) / s, (9 + lf * 30) / s); ctx.filter = 'brightness(0)'; ctx.globalAlpha = (0.22 + lf * 0.08) * a; ctx.drawImage(st, 0, 0); ctx.restore(); }
  ctx.globalAlpha = a; ctx.drawImage(st, 0, 0);
  if (o.draw) { ctx.translate(Ph.P, Ph.P); o.draw(ctx, Ph); }
  ctx.restore();
}
// σημείο (u, v) της φωτογραφίας (0..1) → οθόνη, για ίδιο x, y, hh, o με το photoCut (κάμερα στο στήθος, props στο χέρι)
function photoPt(Ph, x, y, hh, u, v, o = {}) {
  const s = hh / Ph.h, px = (u - 0.5) * Ph.w * s * (o.sx ?? 1), py = -(1 - v) * Ph.h * s * (o.sy ?? 1), r = o.rot || 0;
  return [x + px * Math.cos(r) - py * Math.sin(r), y + px * Math.sin(r) + py * Math.cos(r)];
}
// η φωτογραφία όπως είναι (με φόντο, 480×600 · κατάλογος, κάρτα) → canvas
function photoJpg(Ph) {
  if (!Ph._jpg) Ph._jpg = rgba(`photos/${Ph.ep}/${Ph.name}.jpg`).cv;
  return Ph._jpg;
}
// πού βρίσκεται το cut-out μέσα στο photoJpg: [x, y, w, h] σε px του jpg (κόψιμο με ψαλίδι από κατάλογο)
function photoBox(Ph) {
  const m = Ph.meta, [sw, sh] = m.src || [Ph.w, Ph.h], [a, b, bw, bh] = m.box || [0, 0, sw, sh], k = Math.max(480 / sw, 600 / sh);
  return [(480 - sw * k) / 2 + a * k, (600 - sh * k) / 2 + b * k, bw * k, bh * k];
}
// λογότυπο ΠΑΝΩ στο ύφασμα (cache ανά φωτογραφία/σημείο/είδος): οι πτυχές και οι σκιές της φωτογραφίας περνάνε στο λογότυπο
// draw(c, cx, cy, d) ζωγραφίζει το λογότυπο · (u, v) κέντρο στο στήθος · d διάμετρος σε px φωτογραφίας · kind: 'print' (στάμπα, επίπεδη) | 'emb' (κέντημα: βελονιές satin + ανάγλυφο)
function photoLogo(Ph, draw, u, v, d, kind = 'print') {
  const key = [u, v, d, kind, draw.name].join(); if (Ph.logos[key]) return Ph.logos[key];
  const S = Math.ceil(d * 1.2), cv = L.createCanvas(S, S), c = cv.getContext('2d'); draw(c, S / 2, S / 2, d);
  const id = c.getImageData(0, 0, S, S), px = id.data, x0 = Math.round(u * Ph.w - S / 2), y0 = Math.round(v * Ph.h - S / 2);
  const lum = (x, y) => { x = Math.min(Ph.w - 1, Math.max(0, x)); y = Math.min(Ph.h - 1, Math.max(0, y)); const j = (y * Ph.w + x) * 4; return Ph.data[j + 3] < 128 ? -1 : 0.3 * Ph.data[j] + 0.59 * Ph.data[j + 1] + 0.11 * Ph.data[j + 2]; };
  let sum = 0, n = 0; for (let y = 0; y < S; y += 3) for (let x = 0; x < S; x += 3) { const l = lum(x0 + x, y0 + y); if (l >= 0) { sum += l; n++; } }
  const mean = n ? sum / n : 128, r = rng(Math.round(d) + kind.length);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const j = (y * S + x) * 4; if (!px[j + 3]) continue; const l = lum(x0 + x, y0 + y); if (l < 0) { px[j + 3] = 0; continue; }
    let f = Math.min(1.22, Math.max(0.5, l / mean));                                              // πτυχές / σκιές του υφάσματος
    if (kind === 'emb') f *= ((x + y) % 7 < 3 ? 1.1 : 0.9);                                         // βελονιές satin (διαγώνιες)
    else f *= 0.97 + r() * 0.06;                                                                     // υφή στάμπας
    px[j] = Math.min(255, px[j] * f); px[j + 1] = Math.min(255, px[j + 1] * f); px[j + 2] = Math.min(255, px[j + 2] * f);
  }
  c.putImageData(id, 0, 0);
  return (Ph.logos[key] = { cv, x: x0, y: y0, S, kind });
}
// ζωγραφίζει το photoLogo μέσα στο o.draw του photoCut · o.clip(c, Lg) = μερική εμφάνιση (κέντημα που προχωράει, film που ξεκολλάει)
function drawLogo(ctx, Lg, o = {}) {
  ctx.save(); if (o.clip) o.clip(ctx, Lg);
  if (Lg.kind === 'emb') { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowOffsetX = Lg.S * 0.012; ctx.shadowOffsetY = Lg.S * 0.02; ctx.shadowBlur = Lg.S * 0.02; }
  ctx.globalAlpha = o.a ?? 1; ctx.drawImage(Lg.cv, Lg.x, Lg.y); ctx.restore();
}

module.exports = { photo, photoCut, photoPt, photoJpg, photoBox, photoLogo, drawLogo };
