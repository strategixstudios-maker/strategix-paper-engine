// «Ανοίγω φούρνο. Ποια ταμπέλα;» · σειρά «Α ή Β;» (quiz) · host: Στράτος · VO ElevenLabs «Stratos» + μουσική + SFX · seamless loop (LOOP: 'cut') · look: χάρτινη μακέτα (diorama.js, §1d)
// Σενάριο: scripts/ab01.md · σκελετός: node new.js ab01_tampela (2026-10-01)
// Γύροι: ταμπέλα (δρόμος, από απέναντι) → φυλλάδιο (2″, κάδος / ψυγείο) → σακούλα (βγαίνει στη γειτονιά) → ανατροπή: ίδια τιμή → CTA → frame 0 (κινητό μπροστά στις προσόψεις)
// VO = vo/ab01_vo.mp3 @ 0,2s · χρόνοι λέξεων: VT.W('λέξη') (αρχή) / VT.E('λέξη') (τέλος), όχι πίνακας με το χέρι
// 0.33–2.07  Ανοίγω φούρνο στα τριάντα τέσσερα.
// 2.09–3.00  Ποια ταμπέλα;
// 3.03–4.57  Άλφα ή βήτα;
// 4.61–5.88  Η άλφα είναι πιο όμορφη.
// 5.89–7.44  Αλλά από απέναντι, δεν διαβάζεται.
// 7.73–8.65  Φυλλάδιο.
// 8.69–10.19  Άλφα ή βήτα;
// 10.26–12.13  Ο κόσμος το κοιτάει δύο δευτερόλεπτα.
// 12.20–14.08  Ένα μήνυμα, όχι δώδεκα.
// 14.13–14.87  Σακούλα.
// 14.90–16.38  Άλφα ή βήτα;
// 16.42–18.42  Η βήτα κάνει διαφήμιση σε όλη τη γειτονιά.
// 18.51–19.10  Δωρεάν.
// 19.45–20.84  Και ποια κόστισε πιο ακριβά;
// 20.89–21.48  Καμία.
// 21.52–23.05  Ίδιο χαρτί, ίδια τιμή.
// 23.13–24.42  Αλλάζει μόνο το σχέδιο.
// 24.60–25.75  Εσύ πόσα βρήκες σωστά;
// 25.86–26.89  Γράψ' το στα σχόλια.
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, txt, clamp, lerp, prog, easeIn, easeOut, easeInOut, spring } = L;
const M = require('./motion.js');
const { poseSpring } = require('./stratos.js');
const P = require('./props.js');
const { BRAND, stamp, checkChip, phoneFrame, sparkle, walker, shopFront } = P;

const VT = L.voText('vo/ab01_vo.mp3', 0.2);
const TAG = 'Α ή Β;', TOTAL = 27.64, LOOP_AT = 26.94;   // LOOP_AT: από εδώ η εικόνα = frame 0 (caption + ετικέτα του hook μπαίνουν αυτόματα)
const T = {
  ph: VT.W('τριαντα'), drop: VT.W('ταμπελ') + 0.1, ab1: VT.W('Αλφ'), omorf: VT.W('ομορφ') - 0.5, apen: VT.W('απεναντ') - 0.15, diav: VT.E('διαβαζ') - 0.25,
  fyl: VT.W('Φυλλ'), ab2: VT.W('Αλφ', 2), kosm: VT.W('κοσμ'), dyo: VT.W('δυο'), mhn: VT.W('μηνυμα'), oxi: VT.W('οχι'),
  sak: VT.W('Σακουλ'), ab3: VT.W('Αλφ', 3), geit: VT.W('γειτον'), dor: VT.W('Δωρεαν'),
  kai: VT.W('κοστισ') - 0.1, kam: VT.W('Καμια'), idio: VT.W('Ιδιο'), timh: VT.W('τιμη'), all: VT.W('Αλλαζ'),
  esy: VT.W('Εσυ'), graps: VT.W('Γραψ'), out: VT.E('σχολια') - 0.6,
};
const C1 = T.fyl - 0.25, C2 = T.sak - 0.22, C2B = VT.W('κανει') - 0.3, C3 = VT.W('Και', 1, 19) - 0.25, C4 = T.esy - 0.2;
const CUTS = [0, C1, C2, C2B, C3, C4, TOTAL];   // ταμπέλα · φυλλάδιο · σακούλα · σακούλα στον δρόμο · ανατροπή (τιμή) · CTA + loop
const CAPS = VT.caps({ text: { 0: '«Ανοίγω φούρνο. Ποια ταμπέλα;»', 2: 'Α ή Β;', 3: 'Η Α είναι πιο όμορφη.', 6: 'Α ή Β;', 7: 'Ο κόσμος το κοιτάει 2 δευτερόλεπτα.', 8: 'Ένα μήνυμα, όχι 12.', 10: 'Α ή Β;', 11: 'Η Β κάνει διαφήμιση σε όλη τη γειτονιά.' } })
  .filter((_, i) => i !== 1);                   // «Ποια ταμπέλα;» είναι ήδη στο caption του hook (χωρίς ηλικία, ≤ 5 λέξεις)

const D = require('./diorama.js'), { V } = D;
const { ROOM, roomItems, stratosItem, mixCam, handCam } = P;
const PI = Math.PI, sp = (t, t0, d = 0.55) => spring(prog(t, t0, t0 + d));
const KRAFT = '#C99A62', KRAFTD = '#B5864F', CREAM = '#F3EAD8', THIN = '#B99B6B';

// ---------- σχέδια Α / Β (ίδιο μαγαζί, ίδιο υλικό: αλλάζει μόνο το σχέδιο) ----------
function loaf(x, cx, cy, s, seed, col = '#C98A45') { // καρβέλι: οβάλ + χαρακιές
  cut(x, circlePts(cx, cy, 70 * s, 38 * s, 26), col, { seed, amp: 1.2, edgeW: 4 * s + 1, scribble: '#B87A3A' });
  x.save(); x.strokeStyle = '#F3D9A8'; x.lineWidth = 6 * s; x.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(cx + i * 34 * s - 12 * s, cy - 18 * s); x.lineTo(cx + i * 34 * s + 12 * s, cy + 14 * s); x.stroke(); }
  x.restore();
}
const fitFont = (x, s, w, px, fam) => { x.font = `${px}px ${fam}`; const k = Math.min(1, w / x.measureText(s).width); return `${Math.floor(px * k)}px ${fam}`; };
function signA(x, g) { // όμορφη αλλά λεπτή: καλλιγραφία, μακρύ όνομα, χαμηλή αντίθεση
  cut(x, rectPts(g.x, g.y, g.w, g.h), CREAM, { seed: 7101, amp: 1.5, edgeW: 7 });
  x.strokeStyle = THIN; x.lineWidth = 3; x.strokeRect(g.x + 18, g.y + 16, g.w - 36, g.h - 32);
  txt(x, 'Ο φούρνος της', g.x + g.w / 2, g.y + g.h * 0.3, { font: '44px Hand', color: THIN });
  txt(x, 'κυρίας Ελένης', g.x + g.w / 2, g.y + g.h * 0.56, { font: '58px Hand', color: THIN });
  txt(x, 'αρτοποιείο · ζαχαροπλαστείο · καφές', g.x + g.w / 2, g.y + g.h * 0.8, { font: '22px Hand', color: THIN });
}
function signB(x, g) { // χοντρά γράμματα: μία λέξη μεγάλη, το όνομα μικρό
  cut(x, rectPts(g.x, g.y, g.w, g.h), C.navy, { seed: 7201, amp: 1.5, edgeW: 7, scribble: '#1B2D62' });
  txt(x, 'ΦΟΥΡΝΟΣ', g.x + g.w / 2, g.y + g.h * 0.42, { font: 'bold ' + fitFont(x, 'ΦΟΥΡΝΟΣ', g.w * 0.86, 150, 'Round'), color: '#fff' });
  txt(x, 'της Ελένης', g.x + g.w / 2, g.y + g.h * 0.78, { font: '50px Hand', color: C.sky });
}
const SIGN = [signA, signB];
function facadeTex(k) { // πρόσοψη 120 × 300 cm (6 px/cm) · ίδιο μαγαζί, μόνο η ταμπέλα αλλάζει
  return D.tex('fac' + k, 720, 1800, (x, w, h) => shopFront(x, 0, 0, w, h, {
    seed: 7700, sign: SIGN[k],
    window: (c, g) => { for (const [fy, n] of [[0.38, 3], [0.78, 3]]) { c.fillStyle = '#7A5033'; c.fillRect(g.x, g.y + g.h * fy, g.w, 12); for (let i = 0; i < n; i++) loaf(c, g.x + g.w * (i + 0.5) / n, g.y + g.h * fy - 30, 0.75, 7300 + i + n * fy * 10); } },
  }), 0);
}
function buildingTex(i, wcm, hcm) { // γειτονικές πολυκατοικίες (3 px/cm): τοίχος + παράθυρα με παντζούρια
  const cols = [C.pale, '#E4D3B8', '#D6E0F5', C.paper, '#E9DCC4', '#CFDDF6'];
  return D.tex('bld' + i, wcm * 3, hcm * 3, (x, w, h) => {
    cut(x, rectPts(0, 0, w, h), cols[i % cols.length], { seed: 7400 + i, amp: 2, scribble: '#C9D8F3', edge: false, shadow: false });
    const nx = 2, ny = Math.floor(h / 260);
    for (let r = 0; r < ny; r++) for (let q = 0; q < nx; q++) {
      const wx = w * (0.18 + q * 0.42), wy = 50 + r * 260;
      cut(x, rectPts(wx, wy, w * 0.22, 150), '#A9C3F1', { seed: 7450 + i * 20 + r * 2 + q, amp: 1, edgeW: 4, shadow: false });
      cut(x, rectPts(wx - 26, wy, 24, 150), i % 2 ? C.blue : C.mid, { seed: 7470 + i * 20 + r, amp: 1, edge: false, shadow: false });
      cut(x, rectPts(wx + w * 0.22 + 2, wy, 24, 150), i % 2 ? C.blue : C.mid, { seed: 7490 + i * 20 + r, amp: 1, edge: false, shadow: false });
    }
  }, 0);
}
function flyerTex(k) { // φυλλάδιο 24 × 34 cm (25 px/cm)
  return D.tex('fly' + k, 600, 850, (x, w, h) => {
    if (!k) { // Α: 12 πληροφορίες, όλες ίδιας σημασίας
      cut(x, rectPts(6, 6, w - 12, h - 12), CREAM, { seed: 7501, amp: 1.5, edgeW: 6, shadow: false });
      txt(x, 'Ο φούρνος της κυρίας Ελένης', w / 2, 62, { font: fitFont(x, 'Ο φούρνος της κυρίας Ελένης', w - 60, 44, 'Hand'), color: THIN });
      const items = ['Ψωμί', 'Κουλούρια', 'Τυρόπιτες', 'Γλυκά', 'Τούρτες', 'Καφές', 'Χυμοί', 'Delivery', 'Κατάλογος', 'Ωράριο', 'Τηλέφωνο', 'Social'];
      const pal = [C.sky, '#E8B04A', C.pale, '#D6B8E8', '#9FD6B8', '#F2B8A8'];
      items.forEach((s, i) => { const cx = 40 + (i % 3) * 180, cy = 120 + Math.floor(i / 3) * 175;
        cut(x, rrPts(cx, cy, 160, 150, 14), pal[i % pal.length], { seed: 7510 + i, amp: 1, edgeW: 3, shadow: false });
        txt(x, s, cx + 80, cy + 40, { font: '26px Round', color: C.ink });
        x.fillStyle = 'rgba(16,26,51,0.35)'; for (let l = 0; l < 3; l++) x.fillRect(cx + 18, cy + 76 + l * 20, 124 - l * 22, 7); });
      txt(x, 'και πολλά ακόμα!', w / 2, h - 50, { font: '30px Hand', color: THIN });
    } else { // Β: ένα μήνυμα
      cut(x, rectPts(6, 6, w - 12, h - 12), C.navy, { seed: 7601, amp: 1.5, edgeW: 6, shadow: false, scribble: '#1B2D62' });
      loaf(x, w / 2, 250, 2.6, 7602);
      txt(x, 'Φρέσκο ψωμί', w / 2, 480, { font: 'bold ' + fitFont(x, 'Φρέσκο ψωμί', w - 70, 96, 'Round'), color: '#fff' });
      txt(x, 'από τις 6:00', w / 2, 590, { font: 'bold 70px Round', color: C.sky });
      txt(x, 'Ο φούρνος της Ελένης', w / 2, h - 70, { font: '40px Hand', color: C.sky });
    }
  }, 0);
}
function bagFace(x, w, h, k, top) { // μπροστινή όψη σακούλας (kraft): Α = μικρό λογότυπο στη γωνία · Β = μεγάλο, στο κέντρο
  cut(x, rectPts(4, top, w - 8, h - top - 4), KRAFT, { seed: 7701 + k, amp: 1.5, edgeW: 6, scribble: KRAFTD, shadow: false });
  x.strokeStyle = 'rgba(90,60,30,0.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(10, top + 40); x.lineTo(w - 10, top + 40); x.stroke();
  if (!k) { txt(x, 'Ο φούρνος της', w - 120, h - 92, { font: '22px Hand', color: '#8A6A40' }); txt(x, 'κυρίας Ελένης', w - 120, h - 64, { font: '26px Hand', color: '#8A6A40' }); }
  else { const cx = w / 2, cy = top + (h - top) * 0.52, r = (w - 8) * 0.38;
    cut(x, circlePts(cx, cy, r, r, 40), C.navy, { seed: 7710, amp: 1.5, edgeW: 6 });
    loaf(x, cx, cy - r * 0.22, r / 120, 7711);
    txt(x, 'ΦΟΥΡΝΟΣ', cx, cy + r * 0.32, { font: 'bold ' + fitFont(x, 'ΦΟΥΡΝΟΣ', r * 1.5, 70, 'Round'), color: '#fff' });
    txt(x, 'της Ελένης', cx, cy + r * 0.62, { font: `${Math.round(r * 0.2)}px Hand`, color: C.sky }); }
}
function bagTex(k) { // σακούλα 26 × 40 cm (με τα χερούλια) · 15 px/cm
  return D.tex('bag' + k, 390, 600, (x, w, h) => {
    x.strokeStyle = KRAFTD; x.lineWidth = 12; x.lineCap = 'round';
    for (const cx of [w * 0.3, w * 0.7]) { x.beginPath(); x.ellipse(cx, 130, 48, 90, 0, PI, 2 * PI); x.stroke(); }
    bagFace(x, w, h, k, 120);
  }, 0);
}
const bagSideTex = () => D.tex('bagSide', 135, 600, (x, w, h) => { cut(x, rectPts(2, 120, w - 4, h - 124), KRAFTD, { seed: 7720, amp: 1.2, edgeW: 5, shadow: false }); x.strokeStyle = 'rgba(80,50,20,0.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, 124); x.lineTo(w / 2, h - 6); x.stroke(); }, 0);
function miniSignTex(k) { return D.tex('mini' + k, 720, 306, (x, w, h) => SIGN[k](x, { x: 0, y: 0, w, h }), 0); } // ταμπέλα σε μακέτα (σκηνή τιμής)
function tagTex(back) { // ταμπελάκι τιμής 9 × 6 cm: μπροστά «€ ?» · πίσω «ΙΔΙΑ ΤΙΜΗ» (χωρίς ποσό)
  return D.tex('tag' + back, 270, 180, (x, w, h) => {
    cut(x, [[40, 8], [w - 8, 8], [w - 8, h - 8], [40, h - 8], [8, h / 2]], back ? BRAND : C.paper, { seed: 7801 + back, amp: 1, edgeW: 5, shadow: false });
    x.fillStyle = 'rgba(16,26,51,0.5)'; x.beginPath(); x.arc(34, h / 2, 9, 0, 7); x.fill();
    if (back) { txt(x, 'ΙΔΙΑ', w / 2 + 16, h * 0.34, { font: 'bold 52px Round', color: '#fff' }); txt(x, 'ΤΙΜΗ', w / 2 + 16, h * 0.7, { font: 'bold 52px Round', color: '#fff' }); }
    else txt(x, '€ ?', w / 2 + 16, h / 2 + 4, { font: 'bold 84px Round', color: C.navy });
  }, 0);
}
function phoneTex(t) { // κινητό του πελάτη: μήνυμα · στο T.ph έρχονται οι δύο φωτογραφίες Α | Β
  const n = t >= T.ph ? 2 : 1, k = n === 2 ? Math.min(1, prog(t, T.ph, T.ph + 0.35)) : 0;
  return D.tex('phone', 620, 1240, x => phoneFrame(x, 310, 620, 600, 1220, (c, w, h) => {
    c.fillStyle = '#E7EEFB'; c.fillRect(0, 0, w, h);
    cut(c, rectPts(-10, -10, w + 20, 150), C.navy, { seed: 7901, amp: 1, edge: false, shadow: false });
    cut(c, circlePts(70, 80, 34, 34, 20), C.beanie, { seed: 7902, amp: 1, edgeW: 3, shadow: false }); txt(c, 'Ε', 70, 82, { font: 'bold 38px Round', color: C.navy });
    txt(c, 'Ελένη', 128, 70, { font: 'bold 38px Round', color: '#fff', align: 'left' }); txt(c, 'online', 128, 108, { font: '24px Round', color: C.sky, align: 'left' });
    cut(c, rrPts(30, 200, 470, 170, 30), '#fff', { seed: 7903, amp: 1.5, edgeW: 5 });
    txt(c, 'Ανοίγω φούρνο στα 34.', 56, 254, { font: '38px Round', color: C.ink, align: 'left' });
    txt(c, 'Ποια ταμπέλα;', 56, 310, { font: 'bold 40px Round', color: C.ink, align: 'left' });
    if (n === 2) { c.save(); c.translate(265, 395); c.scale(lerp(0.4, 1, spring(k)), lerp(0.4, 1, spring(k))); c.translate(-265, -395);
      cut(c, rrPts(30, 395, 470, 330, 30), '#fff', { seed: 7904, amp: 1.5, edgeW: 5 });
      [0, 1].forEach(j => { const gx = 50 + j * 225, g = { x: gx, y: 420, w: 205, h: 88 };
        c.fillStyle = '#E9DCC4'; c.fillRect(gx, 410, 205, 250); c.save(); c.translate(gx, 420); c.scale(g.w / 634, g.h / 306); SIGN[j](c, { x: 0, y: 0, w: 634, h: 306 }); c.restore();
        c.save(); c.globalAlpha = 0.9; c.fillStyle = '#A9C3F1'; c.fillRect(gx + 14, 530, 120, 120); c.fillStyle = C.navy; c.fillRect(gx + 148, 530, 44, 130); c.restore();
        txt(c, j ? 'Β' : 'Α', gx + 102, 690, { font: 'bold 40px Round', color: j ? BRAND : C.navy }); });
      c.restore(); }
  }), n + ':' + Math.round(k * 12));
}

// ---------- δρόμος (cm): προσόψεις στο z = 0, πεζοδρόμιο y = 0 (z −80…0), δρόμος y = −14 · ήλιος από πάνω-δεξιά ----------
const SHOPX = [-61, 61], SIGNY = 262;
const STREET = { desk: { y: 0, x0: -700, x1: 700, z0: -80, z1: 0 }, wall: { z: 0 }, floor: { y: -14 } };
const SUN = { light: { dir: [-0.3, -0.75, 0.55], soft: 0.03, shadow: 0.42 } };
const BLD = [[-190, 138, 360], [-330, 140, 300], [-470, 140, 340], [190, 138, 330], [330, 140, 380], [470, 140, 290]];
const flatTex = (key, w, h, col, scr, deco) => D.tex(key, w, h, (x) => { cut(x, rectPts(0, 0, w, h), col, { seed: key.length * 31, amp: 1.5, scribble: scr, edge: false, shadow: false }); if (deco) deco(x, w, h); }, 0);
function streetItems() {
  const walk = (x, w, h) => { x.strokeStyle = 'rgba(16,26,51,0.12)'; x.lineWidth = 3; for (let i = 0; i < w; i += 60) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } };
  const road = (x, w, h) => { x.fillStyle = '#F7F4EC'; for (let i = 0; i < w; i += 160) x.fillRect(i, h * 0.5 - 6, 90, 12); };
  return [
    { t: flatTex('sky', 600, 300, '#A7C4F2', '#B8D0F5'), w: 4000, h: 2000, pos: [0, -200, 1200], surface: true, lift: 0, shadow: false, lit: false },
    ...[[-260, 520, 900, 1], [300, 600, 950, 2], [40, 680, 1000, 3]].map(([x0, y0, z0, k]) => ({ t: D.tex('cloud' + k, 400, 160, c => { cut(c, rrPts(20, 50, 360, 90, 45), '#FBFAF6', { seed: 7950 + k, amp: 3, edgeW: 6 }); cut(c, circlePts(160, 70, 70, 55, 24), '#FBFAF6', { seed: 7960 + k, amp: 3, edgeW: 6 }); }, 0), w: 200, h: 80, pos: [x0, y0, z0], surface: true, lift: 0, shadow: false, lit: false })),
    ...BLD.map(([x0, w, h], i) => ({ t: buildingTex(i, w, h), w, h, pos: [x0, 0, 0.5], surface: true, lift: 0, shadow: false })),
    ...SHOPX.map((x0, k) => ({ t: facadeTex(k), w: 120, h: 300, pos: [x0, 0, 0], surface: true, lift: 0, shadow: false })),
    { t: flatTex('pipe', 20, 300, '#9AA1B2'), w: 3, h: 310, pos: [0, 0, -0.3], surface: true, lift: 0.3 },             // υδρορροή ανάμεσα (το split)
    { t: flatTex('walk', 1400, 80, '#C9CDD6', '#B9BFCB', walk), w: 1400, h: 80, pos: [0, 0, -80], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: flatTex('kerb', 1400, 14, '#9AA1B2'), w: 1400, h: 14, pos: [0, -14, -80], surface: true, lift: 0, shadow: false },
    { t: flatTex('road', 1400, 400, '#5B6272', '#4E5566', road), w: 1400, h: 400, pos: [0, -14, -480], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: flatTex('walk2', 1400, 300, '#C9CDD6', '#B9BFCB', walk), w: 1400, h: 1500, pos: [0, 0, -1980], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: flatTex('kerb', 1400, 14, '#9AA1B2'), w: 1400, h: 14, pos: [0, -14, -480], rot: [0, PI, 0], surface: true, lift: 0, shadow: false },
  ];
}
const lampItem = () => ({ t: D.tex('lamp', 120, 1000, x => { cut(x, rectPts(48, 120, 24, 880), C.navy, { seed: 7980, amp: 1, edgeW: 4 }); cut(x, rrPts(10, 30, 100, 110, 30), C.navy, { seed: 7981, amp: 1, edgeW: 4 }); cut(x, rrPts(26, 60, 68, 60, 20), '#F4D98A', { seed: 7982, amp: 1, edge: false, shadow: false }); }, 0), w: 12, h: 100 * 3.3, pos: [-12, 0, -1700] });

// ---------- κάμερα: στησίματα (focus ΠΑΝΤΑ στον πρωταγωνιστή του πλάνου, §1d) ----------
const HOOKPOS = [0, 150, -615], PHONE = [0, 148, -570];        // frame 0: κινητό μπροστά στις δύο προσόψεις (POV του πελάτη)
const CAM = {
  hook: { pos: HOOKPOS, look: [0, 205, 0], fov: 40, ap: 10, focusAt: PHONE },
  shops: { pos: [0, 152, -600], look: [0, 200, 0], fov: 40, ap: 5, focusAt: [0, SIGNY, 0] },
  signA: { pos: [-55, 240, -255], look: [-61, 248, 0], fov: 40, ap: 5, focusAt: [-61, SIGNY, 0] },
  far: { pos: [40, 165, -2000], look: [0, 168, 0], fov: 40, ap: 6, focusAt: [0, SIGNY, 0] },
  fly: { pos: [-4, 108, -138], look: [-2, 6, 10], fov: 40, ap: 9, focusAt: [0, 0, -5] },
  fly2: { pos: [16, 80, -100], look: [22, 16, 26], fov: 40, ap: 9, focusAt: [36, 22, 38] },
  bags: { pos: [0, 62, -195], look: [0, 19, 0], fov: 36, ap: 10, focusAt: [0, 18, 0] },
  bags2: { pos: [0, 56, -172], look: [0, 19, 0], fov: 36, ap: 10, focusAt: [0, 18, 0] },
  str: { pos: [0, 120, -820], look: [0, 122, 0], fov: 40, ap: 5, focusAt: [0, 100, -40] },
  str2: { pos: [20, 120, -770], look: [20, 122, 0], fov: 40, ap: 5, focusAt: [20, 100, -40] },
  tags: { pos: [0, 178, -40], look: [0, 0, 16], fov: 40, ap: 7, focusAt: [0, 0, 8] },
  tags2: { pos: [0, 162, -34], look: [0, 0, 16], fov: 40, ap: 7, focusAt: [0, 0, 8] },
  cta: { pos: [0, 150, -690], look: [0, 195, 0], fov: 40, ap: 6, focusAt: [0, 150, -38] },
};
const SHOTS = [ // [t, στήσιμο] · ανάμεσα σε δύο κλειδιά: μείξη με easeInOut · ίδιο στήσιμο = ακίνητο
  [0, 'hook'], [T.drop - 0.05, 'hook'], [T.drop + 0.35, 'shops'], [T.omorf, 'shops'], [T.omorf + 0.7, 'signA'], [T.apen, 'signA'], [T.apen + 0.55, 'far'], [C1, 'far'],
  [C1, 'fly'], [T.mhn + 0.4, 'fly'], [T.oxi + 0.4, 'fly2'], [C2, 'fly2'],
  [C2, 'bags'], [C2B, 'bags2'], [C2B, 'str'], [C3, 'str2'],
  [C3, 'tags'], [T.all, 'tags'], [C4, 'tags2'],
  [C4, 'cta'], [T.out, 'cta'], [LOOP_AT - 0.06, 'hook'], [TOTAL, 'hook'],
];
const camKind = t => t < C1 || t >= C4 ? 'street' : t < C2B ? 'desk' : t < C3 ? 'street' : 'desk';
function camAt(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const [t0, a] = SHOTS[i], [t1, b] = SHOTS[i + 1] || [TOTAL, a], o = mixCam(CAM[a], CAM[b], t1 > t0 ? easeInOut(prog(t, t0, t1)) : 1);
  if (t >= C4 && t < LOOP_AT) o.focusAt = V.lerp(CAM.cta.focusAt, PHONE, easeInOut(prog(t, T.out + 0.1, T.out + 0.4))); // rack focus: Στράτος → κινητό
  if (t < C1 && t >= T.drop - 0.05) o.focusAt = V.lerp(PHONE, CAM.shops.focusAt, easeInOut(prog(t, T.drop, T.drop + 0.3)));
  const k = Math.min(1, t / 0.6, Math.max(0, (LOOP_AT - t) / 0.6)); o.pos = V.add(o.pos, V.mul(handCam(t, 0.6 * k), camKind(t) === 'street' ? 3 : 1)); // κάμερα στο χέρι: 0 στο frame 0 και στο loop
  return o;
}

// ---------- 1 · δρόμος: κινητό → Α | Β → από απέναντι ----------
function phoneItem(t) { // ψηλά στο frame 0 · πέφτει στο T.drop · ξανανεβαίνει στο τέλος (ίδια θέση με το frame 0)
  let dy = 0, rz = 0.035;
  if (t < C1) { const p = prog(t, T.drop, T.drop + 0.3); dy = -32 * easeIn(p); rz += 0.5 * easeIn(p); if (p >= 1) return null; }
  else if (t >= C4) { const p = prog(t, T.out + 0.1, LOOP_AT - 0.12); if (p <= 0) return null; dy = -32 * (1 - easeOut(p)); rz += 0.3 * (1 - easeOut(p)); }
  else return null;
  return { t: phoneTex(t >= C4 ? 0 : t), w: 10, h: 20, pos: V.add(PHONE, [0, dy, 0]), anchor: [0.5, 0.5], rot: [-0.05, 0, rz] };
}
function abLabels(ctx, cam, t, t0, t1 = 1e9) { // Α | Β πάνω από τις βιτρίνες (σε οθόνη, ακολουθούν την κάμερα)
  const out = easeIn(prog(t, t1, t1 + 0.2)); if (out >= 1) return;
  SHOPX.forEach((x0, k) => {
    const q = cam.proj([x0, 150, -2]), s = clamp(560 / q[2], 0.42, 1.1) * sp(t, t0 + k * 0.15) * (1 - out); if (s <= 0.01) return;
    ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
    cut(ctx, circlePts(0, 0, 78, 78, 30), k ? BRAND : '#FBFAF6', { seed: 5402 + k, amp: 2 }); txt(ctx, k ? 'Β' : 'Α', 0, 6, { font: 'bold 96px Round', color: k ? '#fff' : C.navy });
    ctx.restore();
  });
}

// ---------- 2 · φυλλάδιο: 2″ · Α → μπάλα → κάδος · Β → ψυγείο με μαγνήτη ----------
const FLY = [[-14, -0.05], [14, 0.05]], FW = 24, FH = 34, FZ = -26;   // [x, rz] · πάνω στο γραφείο
const BIN = [-31, 28], FRIDGE = [36, 40], BTARGET = [36, 26, 39.4];    // κάδος (x, z) · ψυγειάκι (x, z) · πού κολλάει το Β
function flyerItems(t) {
  const out = [];
  const y0 = M.fall(t, T.fyl - 0.3, 22, 0.05, { g: 1400, e: 0.25 }).y;
  const cr = prog(t, T.mhn, T.mhn + 0.28);                                       // τσαλάκωμα
  if (cr < 0.6) { const k = 1 - 0.8 * easeIn(cr / 0.6); out.push({ t: flyerTex(0), w: FW * k, h: FH * k, pos: [FLY[0][0], y0 + 6 * cr, FZ + FH * (1 - k) / 2], anchor: [0.5, 1], rot: [PI / 2 - cr, 0, FLY[0][1] + cr * 2], bend: cr > 0 ? (u, v) => cr * 6 * Math.sin(u * 9 + v * 7) : null }); }
  else { // μπάλα: τόξο ως τον κάδο, πέφτει μέσα
    const fa = prog(t, T.mhn + 0.3, T.mhn + 0.75), x = lerp(FLY[0][0], BIN[0], fa), z = lerp(FZ + FH / 2, BIN[1] + 6, fa), y = fa < 1 ? lerp(4, 22, fa) + 26 * 4 * fa * (1 - fa) : Math.max(6, 22 - 300 * (t - T.mhn - 0.75) ** 2 * 3);
    out.push({ t: D.tex('ball', 200, 200, c => { cut(c, circlePts(100, 100, 88, 82, 18), CREAM, { seed: 7520, amp: 6, edgeW: 6, scribble: '#E4D8BE' }); c.strokeStyle = 'rgba(120,100,70,0.45)'; c.lineWidth = 4; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(40 + i * 22, 50 + (i % 3) * 30); c.lineTo(70 + i * 18, 120 + (i % 2) * 25); c.stroke(); } }, 0), w: 9, h: 9, pos: [x, y, z], anchor: [0.5, 0.5], rot: [0.6, 0, t * 9] });
  }
  // Β: σηκώνεται, γυρίζει όρθιο και κολλάει στο ψυγείο
  const fb = easeInOut(prog(t, T.oxi, T.oxi + 0.42)), bs = lerp(1, 0.7, fb), stuck = t >= T.oxi + 0.42;
  const bp = V.lerp([FLY[1][0], y0, FZ + FH / 2], BTARGET, fb); bp[1] += 18 * 4 * fb * (1 - fb);
  out.push({ t: flyerTex(1), w: FW * bs, h: FH * bs, pos: bp, anchor: [0.5, 0.5], rot: [lerp(PI / 2, 0, fb), 0, FLY[1][1] * (1 - fb)], bend: fb > 0 && fb < 1 ? (u, v) => 3 * Math.sin(PI * fb) * Math.sin(PI * v) : null, lift: 0.2 });
  if (stuck) { const s = sp(t, T.oxi + 0.42, 0.4); out.push({ t: D.tex('magnet', 100, 100, c => cut(c, circlePts(50, 50, 42, 42, 20), C.beanie, { seed: 7530, amp: 1.5, edgeW: 5 }), 0), w: 4 * s + 0.01, h: 4 * s + 0.01, pos: [BTARGET[0], BTARGET[1] + FH * 0.7 / 2 - 2, BTARGET[2] - 0.6], anchor: [0.5, 0.5] }); }
  // χάρτινο χρονόμετρο: σηκώνεται όρθιο στο «κόσμος», μετράει 2″
  const up = sp(t, T.kosm, 0.5), run = prog(t, T.dyo - 0.1, T.mhn - 0.05);
  out.push({ t: D.tex('timer', 300, 340, c => {
    cut(c, rrPts(130, 10, 40, 40, 8), C.navy, { seed: 7540, amp: 1, edgeW: 4 });
    cut(c, circlePts(150, 190, 140, 140, 40), '#FBFAF6', { seed: 7541, amp: 1.5, edgeW: 6 });
    if (run > 0) { c.fillStyle = run >= 1 ? '#E86A5A' : 'rgba(232,106,90,0.85)'; c.beginPath(); c.moveTo(150, 190); c.arc(150, 190, 118, -PI / 2, -PI / 2 + 2 * PI * run); c.closePath(); c.fill(); }
    txt(c, run >= 1 ? '0″' : '2″', 150, 196, { font: 'bold 110px Round', color: C.navy, edge: 10, edgeC: '#FBFAF6' });
  }, run >= 1 ? 'end' : Math.floor(run * 24)), w: 12, h: 13.6, pos: [0, 0, 14], rot: [lerp(PI / 2, 0.45, up), 0, 0], lift: 0.1 });
  // κάδος (πίσω τοίχωμα · μπροστινό) + ψυγειάκι
  out.push({ t: flatTex('binIn', 160, 180, '#14224A'), w: 16, h: 18, pos: [BIN[0], 0, BIN[1] + 8] });
  out.push({ t: D.tex('binF', 160, 180, c => { cut(c, rrPts(4, 4, 152, 172, 10), C.blue, { seed: 7550, amp: 1, edgeW: 5, scribble: '#2A4A9E' }); c.strokeStyle = 'rgba(220,231,250,0.35)'; c.lineWidth = 4; for (let i = 24; i < 160; i += 22) { c.beginPath(); c.moveTo(i, 10); c.lineTo(i, 170); c.stroke(); } }, 0), w: 16, h: 18, pos: [BIN[0], 0, BIN[1]] });
  out.push({ t: D.tex('fridge', 300, 440, c => { cut(c, rrPts(6, 6, 288, 428, 26), '#F4F6FA', { seed: 7560, amp: 1.5, edgeW: 6, scribble: '#E3E8F2' }); c.fillStyle = '#C9D2E4'; c.fillRect(10, 150, 280, 6); cut(c, rrPts(250, 40, 14, 90, 7), C.navy, { seed: 7561, amp: 1, edgeW: 3 }); cut(c, rrPts(250, 190, 14, 150, 7), C.navy, { seed: 7562, amp: 1, edgeW: 3 }); cut(c, rectPts(30, 40, 60, 70), C.sky, { seed: 7563, amp: 1, edgeW: 3 }); cut(c, circlePts(60, 36, 10, 10, 12), '#E86A5A', { seed: 7564, amp: 1, edgeW: 2 }); }, 0), w: 30, h: 44, pos: [FRIDGE[0], 0, FRIDGE[1]], surface: false });
  return out;
}

// ---------- 3 · σακούλες: στο γραφείο → στον δρόμο ----------
function bagItems(t) {
  return [0, 1].flatMap(k => { const h = Math.max(0.01, sp(t, T.sak + k * 0.12)), x0 = k ? 17 : -17;
    return [{ t: bagTex(k), w: 26, h: 40 * h, pos: [x0, 0, 0], bend: (u) => -2.2 * Math.sin(PI * u) },
      { t: bagSideTex(), w: 9, h: 40 * h, pos: [x0 + 13, 0, 0], anchor: [0, 1], rot: [0, -1.25, 0] }]; });
}
function people(t) { // περαστικοί: Α (μικρό λογότυπο) ← · Β (μεγάλο) → · δύο γείτονες γυρίζουν να δουν
  const lt = t - C2B, dur = C3 - C2B;
  const P2 = [
    { key: 'wB', x: lerp(-260, 130, lt / dur), z: -40, o: { seed: 5500, shirt: '#E86A5A', shirtS: '#D55A4B', hairC: '#3A2A20', look: 8, ph: 0, carry: c => { c.save(); c.translate(-90, 40); bagMini(c, 1); c.restore(); } } },
    { key: 'wA', x: lerp(260, -150, lt / dur), z: -22, o: { seed: 5600, type: 'woman', shirt: '#7CC39B', shirtS: '#69B188', look: -8, ph: 1.3, carry: c => { c.save(); c.translate(-90, 40); bagMini(c, 0); c.restore(); } } },
    { key: 'n1', x: -175, z: -60, still: 1, o: { seed: 5700, shirt: C.sky, shirtS: C.mid, look: t > T.geit - 0.3 ? 14 : -4, mood: t > T.geit ? 'happy' : undefined } },
    { key: 'n2', x: 178, z: -62, still: 1, o: { seed: 5800, type: 'woman', shirt: '#D6B8E8', shirtS: '#BFA0D6', look: t > T.geit - 0.1 ? -14 : 4, mood: t > T.geit + 0.2 ? 'happy' : undefined } },
  ];
  return P2.map(p => ({ t: D.tex(p.key, 440, 800, c => walker(c, lt, 220, 340, 1, { walk: p.still ? 0 : 1, ...p.o }), ST.B), w: 66, h: 120, pos: [p.x, 8, p.z], anchor: [0.5, 1] }));
}
function bagMini(c, k) { c.save(); c.translate(-30, -20); c.scale(240 / 390, 240 / 390); bagFace(c, 390, 600, k, 120); c.restore(); }

// ---------- 4 · ανατροπή: ταμπελάκια τιμής · ίδια τιμή · αλλάζει μόνο το σχέδιο ----------
const ROWS = [ // [υφή(k), w, h, z, x Α / Β]
  [k => miniSignTex(k), 30, 12.75, 36], [k => flyerTex(k), 17, 24, 6], [k => bagTex(k), 18, 27.7, -28],
];
function tagItems(t) {
  const out = [];
  ROWS.forEach(([tx, w, h, z], r) => [0, 1].forEach(k => {
    const x0 = k ? 17 : -17, y0 = M.fall(t, C3 + 0.05 + r * 0.12 + k * 0.05, 20, 0.05, { g: 1400, e: 0.25 }).y;
    const rd = !k ? prog(t, T.all + r * 0.12, T.all + r * 0.12 + 0.32) : 0;                       // «αλλάζει μόνο το σχέδιο»: το Α γυρίζει και γίνεται Β
    const sw = Math.abs(Math.cos(PI * rd)) * (rd > 0 && rd < 1 ? 1 : 1);
    out.push({ t: tx(rd > 0.5 ? 1 : k), w: w * Math.max(0.02, sw), h, pos: [x0, y0 + 4 * Math.sin(PI * rd), z], rot: [PI / 2, 0, (k ? 0.03 : -0.03) * (r - 1)] });
    const fl = prog(t, T.kam + r * 0.2, T.kam + r * 0.2 + 0.28), tw = Math.abs(Math.cos(PI * fl));   // ταμπελάκι: γυρίζει → «ΙΔΙΑ ΤΙΜΗ»
    out.push({ t: tagTex(fl > 0.5 ? 1 : 0), w: 9 * Math.max(0.02, tw), h: 6, pos: [x0 + w / 2 - 1, y0 + 0.4 + 3 * Math.sin(PI * fl), z - 3.5], anchor: [0.5, 0.5], rot: [PI / 2, 0, 0.22] });
  }));
  return out;
}

// ---------- 5 · CTA: ο Στράτος ανάμεσα στις δύο προσόψεις → φεύγει → κινητό = frame 0 ----------
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.3 }],
  [T.esy, { aL: 0.5, aR: 0.5, eL: -1.1, eR: -1.1, hL: 'open', hR: 'open', iL: 'shrug', iR: 'shrug', brows: 0.9 }],
  [T.graps, { aL: 0.12, aR: 0.35, eL: 0, eR: -0.2, hR: 'point', brows: 0.5 }],
  [T.out, { aL: 0.12, aR: 0.12, brows: 0.3 }],
];
const ST_X = t => { const p = prog(t, T.out, T.out + 0.4); return -260 * easeIn(p); };

function build(t) {
  if (t >= LOOP_AT) t = 0;                                         // ουρά του loop = frame 0
  const cam = D.camera(camAt(t)), kind = camKind(t);
  let items;
  if (kind === 'street') {
    items = [...streetItems(), t >= T.apen - 0.1 && t < C1 ? lampItem() : null];
    if (t < C1 || t >= C4) items.push(phoneItem(t));
    if (t >= C2B && t < C3) items.push(...people(t), { t: D.tex('hedge', 1600, 60, x => { for (let i = 0; i < 16; i++) { cut(x, rectPts(i * 100 + 4, 22, 92, 38), C.navy, { seed: 8300 + i, amp: 1, edgeW: 4, shadow: false }); cut(x, circlePts(i * 100 + 50, 22, 50, 20, 18), '#7CC39B', { seed: 8320 + i, amp: 3, edgeW: 4, scribble: '#69B188', shadow: false }); } }, 0), w: 800, h: 30, pos: [0, 0, -74] });
    if (t >= C4) { const x = ST_X(t); if (x > -250) items.push(stratosItem(cam, t, { pos: [x, 0, -38], pose: poseSpring(POSES, t) })); }
    return { cam, items, R: STREET, ...SUN, bg: '#A7C4F2', grade: { from: [W, 0], warm: 0.16, bloom: 0.1 } };
  }
  items = [...roomItems(ROOM, { shelf: [-30, 96] })];
  if (t < C2) items.push(...flyerItems(t)); else if (t < C2B) items.push(...bagItems(t)); else items.push(...tagItems(t));
  return { cam, items, R: ROOM, ...LIGHT, patch: 0.45, shaft: 0.5, dust: 80, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
}
const LIGHT = { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } };
const MB = t => (t > T.drop && t < T.drop + 0.32) || (t > T.apen && t < T.apen + 0.5) ? 4 : (t > T.mhn + 0.28 && t < T.mhn + 0.8) || (t > T.oxi && t < T.oxi + 0.45) || (t > T.out && t < T.out + 0.4) ? 3 : 1;

function SCENE(ctx, t) {
  D.frame(ctx, t, build, { mb: MB(t) });
  if (t >= LOOP_AT) return;
  const cam = D.camera(camAt(t)), at = p => cam.proj(p);
  if (t < C1) { // ταμπέλα
    abLabels(ctx, cam, t, T.ab1);
    if (t >= T.omorf && t < T.apen + 0.2) [[-0.42, -0.1], [0.4, 0.06], [0.1, 0.12]].forEach(([u, v], i) => { const q = at([-61 + u * 120, SIGNY + v * 100 + 10, -2]); sparkle(ctx, q[0], q[1], 0.9, t, T.omorf + 0.35 + i * 0.15, 8100 + i); });
    if (t >= T.diav) { const qa = at([-61, SIGNY + 60, -2]), qb = at([61, SIGNY + 60, -2]);
      stamp(ctx, t, T.diav - 0.25, qa[0], qa[1] - 40, '?', -0.12, C.navy, 70); checkChip(ctx, t, T.diav, qb[0] + 40, qb[1] - 40, 'διαβάζεται', { fs: 44, rot: 0.05 }); }
  } else if (t < C2) { // φυλλάδιο
    const qa = at([FLY[0][0], 0, FZ + FH + 6]), qb = at([FLY[1][0], 0, FZ + FH + 6]);
    if (t < T.mhn) [qa, qb].forEach((q, k) => L.pop(ctx, t, T.ab2 + k * 0.15, q[0], q[1] - 20, () => { cut(ctx, circlePts(0, 0, 62, 62, 28), k ? BRAND : '#FBFAF6', { seed: 5410 + k, amp: 2 }); txt(ctx, k ? 'Β' : 'Α', 0, 5, { font: 'bold 76px Round', color: k ? '#fff' : C.navy }); }));
    if (t >= T.oxi + 0.42) { const q = at(BTARGET); checkChip(ctx, t, T.oxi + 0.5, q[0] - 120, q[1] + 300, 'στο ψυγείο', { fs: 44, rot: -0.05 }); }
  } else if (t < C2B) { // σακούλα
    [-17, 17].forEach((x0, k) => { const q = at([x0, 46, 0]); L.pop(ctx, t, T.ab3 + k * 0.15, q[0], q[1] - 30, () => { cut(ctx, circlePts(0, 0, 62, 62, 28), k ? BRAND : '#FBFAF6', { seed: 5420 + k, amp: 2 }); txt(ctx, k ? 'Β' : 'Α', 0, 5, { font: 'bold 76px Round', color: k ? '#fff' : C.navy }); }); });
  } else if (t < C3) { // η Β στη γειτονιά
    [[-175, -60, 0], [178, -62, 1]].forEach(([x0, z0, i]) => { const q = at([x0, 178, z0]); L.pop(ctx, t, T.geit - 0.1 + i * 0.2, q[0], q[1], () => { cut(ctx, circlePts(0, 0, 44, 44, 20), '#FBFAF6', { seed: 5610 + i, amp: 2 }); txt(ctx, '!', 0, 4, { font: 'bold 70px Round', color: BRAND }); }); });
    stamp(ctx, t, T.dor, W / 2, 760, 'ΔΩΡΕΑΝ', -0.06, BRAND, 84);
  } else if (t < C4) { // ίδια τιμή
    if (t >= T.timh && t < T.all) stamp(ctx, t, T.timh, W / 2, 1210, 'ΙΔΙΑ ΤΙΜΗ', -0.05, C.navy, 84);
    if (t >= T.all) checkChip(ctx, t, T.all + 0.3, W / 2, 1210, 'αλλάζει μόνο το σχέδιο', { fs: 46, rot: -0.03 });
  } else { // CTA
    abLabels(ctx, cam, t, C4 + 0.1, T.out - 0.1);
    if (t < T.out) L.pop(ctx, t, T.esy + 0.3, 790, 800, () => { cut(ctx, rrPts(-120, -62, 240, 124, 30), C.paper, { seed: 8200, amp: 2, edgeW: 7 }); txt(ctx, '?/3', 0, 6, { font: 'bold 76px Round', color: BRAND }); }, 0.08);
  }
}

module.exports = require('./render.js')({
  name: 'ab01_tampela', CUTS, SCENE, LOOP: 'cut', LOOP_AT, TAG, CAPS, HOOK_END: VT.E('βητα'),
  VO_FILE: 'vo/ab01_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/ab01.mp3',
  SFX: [
    [T.ph, 'sent', { gain: 0.7, note: 'οι δύο φωτογραφίες' }], [T.drop, 'swoosh', { gain: 0.5, seed: 1, note: 'κινητό πέφτει' }],
    [T.ab1, 'pop', { gain: 0.7, seed: 1 }], [T.ab1 + 0.15, 'pop', { gain: 0.7, seed: 2 }], [VT.E('βητα') - 0.85, 'ticks', { count: 4, gain: 0.6, note: 'ο θεατής διαλέγει' }],
    [T.omorf + 0.35, 'shimmer', { gain: 0.5 }], [T.apen, 'zoom', { gain: 0.55, seed: 3, note: 'από απέναντι' }], [T.diav - 0.25, 'pop', { gain: 0.6, seed: 4 }], [T.diav, 'stamp', { gain: 0.5, seed: 1 }],
    [T.fyl - 0.15, 'slide', { gain: 0.6, note: 'φυλλάδια' }], [T.ab2, 'pop', { gain: 0.7, seed: 5 }], [T.ab2 + 0.15, 'pop', { gain: 0.7, seed: 6 }], [VT.E('βητα', 2) - 0.85, 'ticks', { count: 4, gain: 0.6 }],
    [T.kosm, 'click', { gain: 0.6, note: 'χρονόμετρο' }], [T.dyo - 0.1, 'ticks', { count: 6, gain: 0.55 }], [T.mhn - 0.05, 'ding', { gain: 0.5 }],
    [T.mhn + 0.05, 'peel', { gain: 0.5, note: 'τσαλάκωμα' }], [T.mhn + 0.75, 'thud', { gain: 0.7, note: 'στον κάδο' }], [T.oxi, 'swoosh', { gain: 0.45, seed: 2 }], [T.oxi + 0.42, 'click', { gain: 0.7, seed: 2, note: 'μαγνήτης' }],
    [T.sak, 'pop', { gain: 0.6, seed: 7 }], [T.sak + 0.12, 'pop', { gain: 0.6, seed: 8 }], [T.ab3, 'pop', { gain: 0.7, seed: 9 }], [T.ab3 + 0.15, 'pop', { gain: 0.7, seed: 10 }], [VT.E('βητα', 3) - 0.85, 'ticks', { count: 4, gain: 0.6 }],
    [T.geit - 0.1, 'blip', { gain: 0.6 }], [T.geit + 0.1, 'blip', { gain: 0.6, seed: 2 }], [T.dor, 'stamp', { gain: 0.55, seed: 2 }],
    [C3 + 0.1, 'slide', { gain: 0.5, seed: 2 }], [T.kam, 'blip', { gain: 0.45, seed: 3 }], [T.kam + 0.2, 'blip', { gain: 0.45, seed: 4 }], [T.kam + 0.4, 'blip', { gain: 0.45, seed: 5 }],
    [T.timh, 'stamp', { gain: 0.55, seed: 3 }], [T.all, 'swoosh', { gain: 0.45, seed: 3, note: 'Α → Β' }], [T.all + 0.3, 'stamp', { gain: 0.45, seed: 4 }],
    [T.esy + 0.3, 'pop', { gain: 0.6, seed: 11 }], [T.out, 'swoosh', { gain: 0.5, seed: 4, note: 'ο Στράτος φεύγει' }], [T.out + 0.15, 'swoosh', { gain: 0.4, seed: 5, note: 'κινητό ανεβαίνει' }],
  ],
});
