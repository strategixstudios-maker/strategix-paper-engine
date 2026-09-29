// photos.js — αληθινές φωτογραφίες προϊόντων (site / προμηθευτής) → cut-outs χωρίς φόντο για το paper engine (ad_xeimonas →, STYLE_GUIDE §1c)
// Το φόντο κόβεται με macOS Vision (tools/lift.swift, «Lift subject» όπως στο Photos): χωρίς εξωτερικά εργαλεία ή API.
// CLI:  node photos.js <ep> [--force] [--h 1400]  → photos/<ep>.txt (γραμμές `όνομα URL`, # σχόλια) →
//       photos/<ep>/<όνομα>.webp = cut-out (alpha, κομμένο στο θέμα, ύψος ≤ --h) + <όνομα>.jpg = η φωτογραφία όπως είναι (480×600, για κατάλογο/κάρτα)
//       + photos/<ep>/index.json = { όνομα: { size (webp), src (αρχική), box (κόψιμο σε px αρχικής), cut (κομμένο κάτω) } } → θέση του cut-out μέσα στο .jpg
//       Όλα στο git (όπως τα vo/ · μικρά αρχεία webp/jpg) → ίδιο αποτέλεσμα σε κάθε render. Στο επεισόδιο: photo(ep, όνομα) (props/photo.js).
const fs = require('fs'), os = require('os'), path = require('path'), { spawnSync } = require('child_process');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const LIFT = path.join(os.homedir(), '.cache', 'strategix', 'lift');
function liftBin() { // compile μία φορά (swiftc ~1 λεπτό), μετά ~1s ανά φωτογραφία
  const src = path.join(__dirname, 'tools', 'lift.swift');
  if (fs.existsSync(LIFT) && fs.statSync(LIFT).mtimeMs > fs.statSync(src).mtimeMs) return LIFT;
  fs.mkdirSync(path.dirname(LIFT), { recursive: true });
  console.log('photos: compile tools/lift.swift…');
  const r = spawnSync('swiftc', ['-O', src, '-o', LIFT], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`photos: swiftc: ${r.stderr}`);
  return LIFT;
}

// cut-out: κόψιμο στο bbox του alpha (+ περιθώριο) και σμίκρυνση ώστε ύψος ≤ maxH
async function crop(png, out, maxH) {
  const im = await loadImage(png), c0 = createCanvas(im.width, im.height), x0 = c0.getContext('2d'); x0.drawImage(im, 0, 0);
  const d = x0.getImageData(0, 0, im.width, im.height).data; let a = im.width, b = im.height, e = 0, f = 0;
  for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) if (d[(y * im.width + x) * 4 + 3] > 16) { if (x < a) a = x; if (x > e) e = x; if (y < b) b = y; if (y > f) f = y; }
  const pad = 4; a = Math.max(0, a - pad); b = Math.max(0, b - pad); e = Math.min(im.width - 1, e + pad); f = Math.min(im.height - 1, f + pad);
  const w = e - a + 1, h = f - b + 1, k = Math.min(1, maxH / h), W = Math.round(w * k), H = Math.round(h * k);
  const c = createCanvas(W, H), x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, a, b, w, h, 0, 0, W, H);
  fs.writeFileSync(out, c.encodeSync('webp', 90));
  return { size: [W, H], src: [im.width, im.height], box: [a, b, w, h], cut: im.height - 1 - f <= pad + 2 }; // cut = η φωτογραφία κόβεται στο κάτω μέρος (μοντέλο ως τους μηρούς)
}
async function small(jpg, out) {
  const im = await loadImage(jpg), c = createCanvas(480, 600), x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
  const k = Math.max(480 / im.width, 600 / im.height), w = im.width * k, h = im.height * k; x.drawImage(im, (480 - w) / 2, (600 - h) / 2, w, h);
  fs.writeFileSync(out, c.encodeSync('jpeg', 86));
}

if (require.main === module) (async () => {
  const [ep, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (!ep) { console.log('usage: node photos.js <ep> [--force] [--h 1400]   (λίστα: photos/<ep>.txt → photos/<ep>/*.webp + *.jpg)'); process.exit(1); }
  const list = `photos/${ep}.txt`; if (!fs.existsSync(list)) { console.log(`photos: δεν υπάρχει το ${list}`); process.exit(1); }
  const dir = `photos/${ep}`, tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'photos-')), maxH = Number(opt('h') || 1400), force = rest.includes('--force');
  fs.mkdirSync(dir, { recursive: true });
  const items = fs.readFileSync(list, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => l.split(/\s+/));
  let bin; const IDX = `${dir}/index.json`, idx = fs.existsSync(IDX) ? JSON.parse(fs.readFileSync(IDX, 'utf8')) : {};
  for (const [name, url] of items) {
    const out = `${dir}/${name}.webp`, jpg = `${dir}/${name}.jpg`;
    if (!force && fs.existsSync(out) && fs.existsSync(jpg)) { console.log(`  ${name}: υπάρχει (--force για ξανά)`); continue; }
    const src = path.join(tmp, name + path.extname(new URL(url).pathname)), png = path.join(tmp, name + '.png');
    const dl = spawnSync('curl', ['-sfL', url, '-o', src]); if (dl.status !== 0) { console.log(`  ${name}: ✗ download ${url}`); continue; }
    bin = bin || liftBin();
    const r = spawnSync(bin, [src, png], { encoding: 'utf8' }); if (r.status !== 0) { console.log(`  ${name}: ✗ lift ${r.stdout}${r.stderr}`); continue; }
    const M = await crop(png, out, maxH); await small(src, jpg); idx[name] = M; const [w, h] = M.size, cut = M.cut;
    console.log(`  ${name}: ${w}×${h}${cut ? ' · κομμένο κάτω' : ''} → ${out} (${Math.round(fs.statSync(out).size / 1024)} KB) + .jpg`);
  }
  fs.writeFileSync(IDX, JSON.stringify(idx, null, 1)); fs.rmSync(tmp, { recursive: true, force: true });
})();
module.exports = { crop };
