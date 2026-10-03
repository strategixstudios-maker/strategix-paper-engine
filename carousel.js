// carousel.js — runner καρτών carousel (ka02 →, STYLE_GUIDE §7 Carousel): 1080×1350 (4:5), χωρίς VO / μουσική · props: props/carousel.js
// Στο επεισόδιο (σκελετός: node new.js ka<NN>_<όνομα>, γεμίζει από τον πίνακα του scripts/ka<NN>.md):
//   const CARDS = [['paper', (ctx, th) => { … }], ['blue', …], …];   κάρτα = [θέμα, fn(ctx, th, i)] · θέμα 'paper' | 'blue' (P.CARD_TH)
//   module.exports = require('./carousel.js')({ name: 'ka02_vector', CARDS });
// Ο runner ζωγραφίζει: φόντο-χαρτί με υφή (scribble + grain + vignette, ΜΟΝΟ στο φόντο) → fn (κείμενο + στοιχεία, καθαρά) → σήμα + STRATEGIX STUDIOS κάτω · βελάκι → ως την προτελευταία
// Σειρά θεμάτων: κάρτα 1 = χαρτί, μετά εναλλάξ μπλε / χαρτί (Αλέξανδρος 2026-10-03: το feed έχει ήδη πολύ μπλε από τα reels) → lint
// CLI:  node <ep>.js            → <ep>_01.jpg … _NN.jpg (JPG: το TikTok photo δεν δέχεται PNG) + <ep>_sheet.png (όλες, μισή ανάλυση)
//       node <ep>.js 1 2        → <ep>_preview.png (μόνο αυτές, grid μισής ανάλυσης) = style frames · σημειώσεις σε 1–2 κάρτες
//       node <ep>.js check      → lint + sheet · lint → μόνο έλεγχος · sheet [clean] → μόνο το sheet (regress)
const fs = require('fs');
const L = require('./lib.js'), { C, cut, rectPts, brandMark, rng } = L;
const { CARD, CARD_TH } = require('./props/carousel.js');
const { W: CW, H: CH, X0 } = CARD;

function bg(ctx, th, seed) { cut(ctx, rectPts(-40, -40, CW + 80, CH + 80), th.bg, { seed, edge: false, shadow: false, scribble: th.scrib }); }
const NOISE = (() => { const c = L.createCanvas(360, 450), x = c.getContext('2d'), im = x.createImageData(360, 450), r = rng(5); for (let i = 0; i < im.data.length; i += 4) { const v = 205 + r() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; })();
function grain(ctx) { // grain + vignette (§1) — στα carousels μόνο στο φόντο
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.38; ctx.drawImage(NOISE, 0, 0, CW, CH); ctx.restore();
  const g = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.35, CW / 2, CH / 2, CH * 0.78); g.addColorStop(0, 'rgba(0,0,20,0)'); g.addColorStop(1, 'rgba(0,0,20,0.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
}
function frame(ctx, th, last) { // σήμα + STRATEGIX STUDIOS κάτω αριστερά · χάρτινο βελάκι «σύρε» κάτω δεξιά (όχι στην τελευταία)
  ctx.save(); ctx.textBaseline = 'alphabetic';
  brandMark(ctx, X0 + 24, CH - 82, 24, th.mark); ctx.font = '28px Brand'; ctx.fillStyle = th.mark; ctx.fillText('STRATEGIX STUDIOS', X0 + 62, CH - 72);
  ctx.restore();
  if (!last) { const x = CW - 120, y = CH - 84; cut(ctx, [[-50, -15], [8, -15], [8, -40], [52, 0], [8, 40], [8, 15], [-50, 15]].map(([a, b]) => [x + a, y + b]), th.arrow, { seed: 77, amp: 2, edgeW: 7 }); }
}

module.exports = function carousel({ name, CARDS }) {
  const ep = name.split('_')[0];
  function draw(i, texts) {
    const cv = L.createCanvas(CW, CH), ctx = cv.getContext('2d'), [k, fn] = CARDS[i], th = CARD_TH[k];
    if (!th) throw new Error(`${name}: κάρτα ${i + 1}: άγνωστο θέμα «${k}» (paper | blue)`);
    if (texts) { const f = ctx.fillText.bind(ctx); ctx.fillText = (s, ...a) => { texts.push(String(s)); return f(s, ...a); }; }
    bg(ctx, th, 20 + i); grain(ctx); // υφή μόνο στο φόντο · κείμενο και στοιχεία από πάνω, καθαρά (Αλέξανδρος 2026-10-03)
    fn(ctx, th, i); frame(ctx, th, i === CARDS.length - 1);
    return cv;
  }
  function grid(ids, file, cols) {
    const rows = Math.ceil(ids.length / cols), w = CW / 2, h = CH / 2, G = L.createCanvas(w * cols, h * rows), g = G.getContext('2d');
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, G.width, G.height);
    ids.forEach((i, j) => g.drawImage(draw(i), (j % cols) * w, Math.floor(j / cols) * h, w, h));
    fs.writeFileSync(file, G.toBuffer('image/png')); console.log(file);
  }
  function lint() { // σειρά θεμάτων · πλήθος καρτών · «#N» σε κείμενο (§7) · crash σε κάρτα = error
    const warn = [], n = CARDS.length;
    if (n < 2 || n > 20) warn.push(`${n} κάρτες: το carousel θέλει 2–20 (docs/publish.md)`);
    if (CARDS[0] && CARDS[0][0] !== 'paper') warn.push('κάρτα 1: θέμα «' + CARDS[0][0] + '» → η 1η κάρτα είναι ΠΑΝΤΑ χαρτί (§7 Carousel: τα reels είναι ήδη μπλε)');
    for (let i = 1; i < n; i++) if (CARDS[i][0] === CARDS[i - 1][0]) warn.push(`κάρτες ${i}–${i + 1}: ίδιο θέμα «${CARDS[i][0]}» → εναλλάξ χαρτί / μπλε`);
    CARDS.forEach((_, i) => { const texts = []; draw(i, texts); for (const s of texts) if (/#\s?\d/.test(s)) warn.push(`κάρτα ${i + 1}: «${s}» → χωρίς αριθμό επεισοδίου (§7)`); });
    console.log(warn.length ? `lint: ${warn.length} warning${warn.length > 1 ? 's' : ''}` : `lint ✔ καθαρό (${n} κάρτες)`); for (const w of warn) console.log('  ' + w);
    return !warn.length;
  }
  const api = { CARDS, draw, lint, CW, CH, name, carousel: true };
  if (require.main !== module.parent) return api;

  const args = process.argv.slice(2), mode = args[0] || 'render', hint = (m, ok = true) => { try { require('./next.js').after(name, m, ok); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } };
  const ids = args.map(a => +a - 1).filter(i => Number.isInteger(i) && CARDS[i]);
  const sheet = () => grid(CARDS.map((_, i) => i), `${name}_sheet.png`, 4);
  if (ids.length) grid(ids, `${name}_preview.png`, Math.min(ids.length, 4));
  else if (mode === 'lint') hint('lint', lint());
  else if (mode === 'check') { const ok = lint(); sheet(); hint('check', ok); }
  else if (mode === 'sheet') sheet();
  else if (mode === 'sfx') console.log(`${name}: carousel, χωρίς ήχο`);
  else if (mode === 'render') {
    const ok = lint();
    CARDS.forEach((_, i) => fs.writeFileSync(`${name}_${String(i + 1).padStart(2, '0')}.jpg`, draw(i).toBuffer('image/jpeg', 92)));
    console.log(`${name}_01…${String(CARDS.length).padStart(2, '0')}.jpg (${CARDS.length} κάρτες ${CW}×${CH}) · δημοσίευση: node publish.js schedule ${ep} publish/captions/${ep}.json`);
    sheet(); hint('cards', ok);
  } else console.log(`carousel: node ${name}.js [1 2 …] | check | lint | sheet`);
  return api;
};
