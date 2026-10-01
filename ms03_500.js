// «Μάθε με τον Στράτο» — Έχεις 500€. Πού θα τα ρίξεις; · host: Στράτος · VO ElevenLabs «Stratos» + μουσική + SFX · seamless loop (LOOP: 'cut') · look: χάρτινη μακέτα (diorama.js, §1d)
// Σενάριο: scripts/ms03.md · σκελετός: node new.js ms03_500 (2026-10-01)
// Γραφείο από πάνω: το πακέτο 500€ «διαλέγει» ανάμεσα σε 3 κάρτες Α/Β/Γ · Στράτος: «εξαρτάται» · 3 μίνι σκηνές δρόμου πάνω στο γραφείο (ταμπέλα · φυλλάδια · ρούχα)
// VO = vo/ms03_vo.mp3 @ 0,2s · χρόνοι λέξεων: VT.W('λέξη') (αρχή) / VT.E('λέξη') (τέλος), όχι πίνακας με το χέρι
// 0.26–2.91  Έχεις πεντακόσια ευρώ για να κάνεις την επιχείρησή σου πιο γνωστή.
// 3.12–4.15  Μία επιλογή.
// 4.18–4.72  Φυλλάδια;
// 4.89–5.87  Ταμπέλα;
// 5.90–7.35  Ή επαγγελματική ένδυση;
// 7.52–9.05  Η απάντηση είναι: εξαρτάται.
// 9.08–12.49  Γιατί το λάθος είναι να διαλέξεις προϊόν πριν δεις το πρόβλημα.
// 12.53–14.89  Αν δεν σε βλέπουν απ' έξω, φτιάχνεις την εικόνα σου.
// 14.91–17.98  Αν θέλεις να φτάσεις σε κόσμο συγκεκριμένα, πας με φυλλάδιο.
// 18.02–22.67  Αν οι άνθρωποί σου κυκλοφορούν έξω, τότε κάθε εργαζόμενος γίνεται κινούμενη διαφήμιση.
// 22.74–24.10  Άρα δεν υπάρχει «καλύτερο».
// 24.27–26.46  Υπάρχει αυτό που λύνει το δικό σου πρόβλημα.
// 26.50–28.79  Πρώτα αποφασίζεις τι θέλεις να πετύχεις.
// 28.83–30.93  Μετά διαλέγεις πού θα πάνε τα λεφτά.
// 31.04–32.98  Τώρα πες μου: εσύ πού θα τα έριχνες;
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, txt, clamp, lerp, prog, easeIn, easeOut, easeInOut, mixHex, pop } = L;
const M = require('./motion.js');
const { poseSpring } = require('./stratos.js');
const P = require('./props.js');
const { BRAND, stamp, stepChip, ctaButton, qmark, sparkle, kostasLogo, tshirt, shopFront, walker } = P;

const VT = L.voText('vo/ms03_vo.mp3', 0.2);
const TAG = 'Μάθε με τον Στράτο', TOTAL = 33.73, LOOP_AT = 33.03;      // LOOP_AT: από εδώ η εικόνα = frame 0 (caption + ετικέτα του hook μπαίνουν αυτόματα)
const T = {
  drop: VT.W('πεντακ') - 0.2, zoom: VT.W('επιχειρ'), gnost: VT.W('γνωστ'), mia: VT.W('Μια'),
  A: VT.W('Φυλλαδ'), B: VT.W('Ταμπελ'), G: VT.W('επαγγ'), hes1: VT.W('ενδυσ') + 0.3, hes2: VT.W('ενδυσ') + 0.62, shrug: VT.W('εξαρτ'),
  err: VT.W('λαθος'), dialex: VT.W('διαλεξ'), prod: VT.W('προιον'), prob: VT.W('προβλ'),
  sign: VT.W('φτιαχν'), img: VT.W('εικονα'),
  reach: VT.W('φτασεις'), kosmo: VT.W('κοσμο'), sygk: VT.W('συγκεκρ'), fly: VT.W('φυλλαδιο', 1, 17),
  kathe: VT.W('καθε'), kin: VT.W('κινουμ'),
  ara: VT.W('Αρα'), best: VT.W('καλυτερ'), yp2: VT.W('Υπαρχει', 1, 23.5), lyn: VT.W('λυνει'), dik: VT.W('δικο'), prob2: VT.W('προβλ', 1, 25.5),
  prota: VT.W('Πρωτα'), apof: VT.W('αποφασ'), pet: VT.W('πετυχ'), meta: VT.W('Μετα'), dial2: VT.W('διαλεγ', 1, 28.8),
  tora: VT.W('Τωρα'), pes: VT.W('πες'), esy: VT.W('εσυ', 1, 31), pou3: VT.W('που', 1, 31.9), erix: VT.W('εριχν'),
};
const C1 = VT.W('απαντ') - 0.16, C2 = VT.W('Γιατι') - 0.06, C3 = VT.W('Αν', 1, 12.4) - 0.06, C4 = VT.W('Αν', 1, 14.6) - 0.06, C5 = VT.W('Αν', 1, 17.99) - 0.04, C6 = VT.W('Αρα') - 0.06;
const CUTS = [0, C1, C2, C3, C4, C5, C6, TOTAL];   // desk · Στράτος · desk (το λάθος) · ταμπέλα · φυλλάδια · ρούχα · desk (σύνοψη + CTA)
const CAPS = VT.caps({ text: { 0: 'Έχεις 500€ για να κάνεις' } });
const kind = t => t < C1 ? 'desk' : t < C2 ? 'stratos' : t < C3 ? 'desk' : t < C4 ? 'sign' : t < C5 ? 'flyer' : t < C6 ? 'shirt' : 'desk';

const D = require('./diorama.js'), { V } = D;
const { ROOM, roomItems, behindDesk, stratosItem, mixCam, handCam } = P;
const PI = Math.PI;

// ---------- κόσμος (cm) · φως παραθύρου (ένα φως, §1d) ----------
const R = ROOM, LIGHT = { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } };
const ST_POS = [-6, R.floor.y, 84], HEAD = [-6, 68, 84];
const CX = [-11.5, 0, 11.5], CZ = -3, PZ = 8;            // κάρτες Α/Β/Γ (x, z) · το πακέτο στέκεται πάνω από την κάρτα που «διαλέγει»
const HOVER = [0, 14, PZ], HRZ = 0.25, HRX = -0.12;      // frame 0: το πακέτο στον αέρα, λίγο πριν πέσει

// ---------- κάμερα: στησίματα + πλάνα (focus ΠΑΝΤΑ στον πρωταγωνιστή του πλάνου, §1d) ----------
const CAM = {
  top: { pos: [0, 84, -46], look: [0, 0, 15], fov: 40, ap: 12, focusAt: [0, 0, 4] },          // γραφείο από πάνω: πακέτο + κάρτες
  topZ: { pos: [0, 46, -20], look: [0, 0, 13], fov: 40, ap: 14, focusAt: [0, 0, PZ] },          // snap zoom στο πακέτο
  topF: { pos: [0, 74, -40], look: [0, 0, 14], fov: 40, ap: 12, roll: 0.035, focusAt: [0, 0, 4] }, // «πάγωμα» (το λάθος)
  med: { pos: [-2, 36, -380], look: [-5, 52, 84], fov: 33, ap: 22, focusAt: HEAD },              // Στράτος μέση
  med2: { pos: [-3, 38, -365], look: [-5, 54, 84], fov: 33, ap: 22, focusAt: HEAD },
  st: { pos: [0, 16, -72], look: [0, 16, 25], fov: 40, ap: 10, focusAt: [0, 10, 14] },         // μίνι δρόμος στο γραφείο
  stS: { pos: [0, 20, -58], look: [0, 20, 25], fov: 40, ap: 10, focusAt: [0, 29, 29] },        // η ταμπέλα
  st2: { pos: [5, 16, -78], look: [1, 15, 25], fov: 40, ap: 10, focusAt: [0, 10, 14] },
  stW: { pos: [0, 10, -42], look: [0, 6, 14], fov: 40, ap: 12, focusAt: [0, 9, 12] },          // ο εργαζόμενος (λογότυπο στο στήθος)
};
const SHOTS = [ // [t, στήσιμο] · ανάμεσα σε δύο κλειδιά: μείξη με easeInOut · ίδιο στήσιμο = ακίνητο
  [0, 'top'], [T.zoom - 0.03, 'top'], [T.zoom + 0.1, 'topZ'], [T.gnost - 0.03, 'topZ'], [T.gnost + 0.14, 'top'], [C1, 'top'],
  [C1, 'med'], [C2, 'med2'],
  [C2, 'top'], [T.err - 0.03, 'top'], [T.err + 0.1, 'topF'], [C3, 'topF'],
  [C3, 'st'], [T.sign + 0.1, 'st'], [T.sign + 0.8, 'stS'], [C4, 'stS'],
  [C4, 'st2'], [C5, 'st'],
  [C5, 'stW'], [T.kathe - 0.05, 'stW'], [T.kathe + 0.45, 'st'], [C6, 'st'],
  [C6, 'top'], [T.prota - 0.03, 'top'], [T.prota + 0.12, 'topZ'], [T.meta - 0.03, 'topZ'], [T.meta + 0.14, 'top'], [TOTAL, 'top'],
];
function camAt(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const [t0, a] = SHOTS[i], [t1, b] = SHOTS[i + 1] || [TOTAL, a], o = mixCam(CAM[a], CAM[b], t1 > t0 ? easeInOut(prog(t, t0, t1)) : 1);
  const k = Math.min(1, t / 0.6, Math.max(0, (LOOP_AT - t) / 0.6)); o.pos = V.add(o.pos, handCam(t, 0.6 * k)); // κάμερα στο χέρι: 0 στο frame 0 και στο loop
  return o;
}

// ---------- Στράτος: «εξαρτάται» (shrug, HANDS.md) ----------
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.3 }],
  [T.shrug - 0.3, { aL: 0.5, aR: 0.5, eL: -1.1, eR: -1.1, hL: 'open', hR: 'open', iL: 'shrug', iR: 'shrug', brows: 1, tilt: 0.08 }],
  [C2, { aL: 0.12, aR: 0.12, brows: 0.3 }],
];

// ---------- υφές ----------
const OPT = [['Α', 'ΦΥΛΛΑΔΙΑ'], ['Β', 'ΤΑΜΠΕΛΑ'], ['Γ', 'ΕΝΔΥΣΗ']];
const fit = (x, s, w, px) => { x.font = `bold ${px}px Round`; return `bold ${Math.floor(px * Math.min(1, w / x.measureText(s).width))}px Round`; };
const noteTex = () => D.tex('note', 480, 240, (x, w, h) => { // χαρτονόμισμα 12 × 6 cm στην παλέτα (όχι αντίγραφο ευρώ)
  cut(x, rectPts(6, 6, w - 12, h - 12), C.mid, { seed: 8001, amp: 1.5, edgeW: 6, scribble: '#3F6FD8', shadow: false });
  x.strokeStyle = 'rgba(220,231,250,0.55)'; x.lineWidth = 4; x.strokeRect(24, 24, w - 48, h - 48);
  x.strokeStyle = 'rgba(220,231,250,0.22)'; x.lineWidth = 3; for (let k = 0; k < 4; k++) { x.beginPath(); for (let i = 0; i <= 40; i++) { const u = 170 + i * 6.5, v = 70 + k * 30 + Math.sin(i * 0.5 + k) * 10; i ? x.lineTo(u, v) : x.moveTo(u, v); } x.stroke(); }
  cut(x, circlePts(92, h / 2, 58, 58, 24), C.sky, { seed: 8002, amp: 1, edgeW: 4, shadow: false });
  txt(x, '€', 92, h / 2 + 4, { font: 'bold 84px Round', color: C.navy });
  txt(x, '100', w - 120, h / 2 + 4, { font: 'bold 92px Round', color: C.paper });
}, 0);
const bandTex = () => D.tex('band', 230, 320, (x, w, h) => { // ταινία του πακέτου «500€»
  cut(x, rectPts(4, 4, w - 8, h - 8), C.paper, { seed: 8005, amp: 1.5, edgeW: 5, shadow: false });
  txt(x, '500€', w / 2, h / 2 + 4, { font: fit(x, '500€', w - 30, 70), color: C.navy });
}, 0);
function signBoard(c, g) { // ταμπέλα KOSTAS COFFEE (navy, λογότυπο + όνομα)
  cut(c, rectPts(g.x, g.y, g.w, g.h), C.navy, { seed: 8011, amp: 1.5, edgeW: 7, scribble: '#1B2D62' });
  kostasLogo(c, g.x + g.h * 0.55, g.y + g.h / 2, g.h * 0.78);
  txt(c, 'KOSTAS COFFEE', g.x + g.h * 1.05 + (g.w - g.h * 1.15) / 2, g.y + g.h * 0.54, { font: fit(c, 'KOSTAS COFFEE', g.w - g.h * 1.35, g.h * 0.42).replace('Round', 'Brand'), color: '#fff' });
}
function flyerFace(c, x0, y0, w, h, seed = 8030) { // φυλλάδιο προσφοράς (ANNA CAFÉ)
  cut(c, rectPts(x0, y0, w, h), BRAND, { seed, amp: 1.5, edgeW: Math.max(3, w * 0.03), shadow: false });
  cut(c, rectPts(x0 + w * 0.1, y0 + h * 0.1, w * 0.8, h * 0.36), C.paper, { seed: seed + 1, amp: 1, edge: false, shadow: false });
  txt(c, '%', x0 + w / 2, y0 + h * 0.29, { font: `bold ${Math.floor(h * 0.3)}px Round`, color: BRAND });
  txt(c, 'ΠΡΟΣΦΟΡΑ', x0 + w / 2, y0 + h * 0.6, { font: fit(c, 'ΠΡΟΣΦΟΡΑ', w * 0.84, h * 0.14), color: '#fff' });
  c.fillStyle = 'rgba(220,231,250,0.7)'; for (let l = 0; l < 3; l++) c.fillRect(x0 + w * 0.18, y0 + h * (0.72 + l * 0.07), w * (0.64 - l * 0.12), h * 0.025);
}
function cardTex(k) { // κάρτα επιλογής 10 × 8 cm: γράμμα + εικονίδιο + λέξη
  return D.tex('card' + k, 600, 480, (x, w, h) => {
    cut(x, rrPts(8, 8, w - 16, h - 16, 26), C.paper, { seed: 8100 + k, amp: 2, edgeW: 8, shadow: false });
    const cx = w / 2 + 50, cy = 190;
    if (k === 0) { [[-0.18, -46, 8], [0.12, 40, -4]].forEach(([r, dx, dy], i) => { x.save(); x.translate(cx + dx, cy + dy); x.rotate(r); flyerFace(x, -75, -105, 150, 210, 8120 + i * 3); x.restore(); }); }
    if (k === 1) { x.save(); x.translate(cx - 120, cy - 130); x.scale(0.4, 0.4); shopFront(x, 0, 0, 600, 640, { seed: 8130, sign: signBoard }); x.restore(); }
    if (k === 2) tshirt(x, cx, cy + 18, 0.27, 0, { color: C.navy, seed: 8140, logoFn: c => kostasLogo(c, 0, 0, 210) });
    cut(x, circlePts(82, 82, 52, 52, 24), BRAND, { seed: 8110 + k, amp: 1, edgeW: 5, shadow: false });
    txt(x, OPT[k][0], 82, 86, { font: 'bold 68px Round', color: '#fff' });
    txt(x, OPT[k][1], w / 2, h - 66, { font: fit(x, OPT[k][1], w - 80, 70), color: C.navy });
  }, 0);
}
const flatTex = (key, w, h, col, scr, deco) => D.tex(key, w, h, x => { cut(x, rectPts(0, 0, w, h), col, { seed: 8200 + key.length * 7, amp: 1.5, scribble: scr, edge: false, shadow: false }); if (deco) deco(x, w, h); }, 0);
const backdropTex = () => D.tex('backdrop', 900, 600, (x, w, h) => { // ουρανός + μακρινές πολυκατοικίες (χάρτινο σκηνικό της μακέτας)
  cut(x, rectPts(0, 0, w, h), '#A7C4F2', { seed: 8210, amp: 1.5, scribble: '#B8D0F5', edge: false, shadow: false });
  [[90, 110, 2], [600, 70, 3]].forEach(([cx, cy, k]) => { cut(x, rrPts(cx, cy + 30, 210, 56, 28), '#FBFAF6', { seed: 8220 + k, amp: 3, edgeW: 5 }); cut(x, circlePts(cx + 90, cy + 40, 50, 40, 20), '#FBFAF6', { seed: 8230 + k, amp: 3, edgeW: 5 }); });
  [[0, 300, 150], [140, 250, 120], [250, 330, 170], [430, 270, 140], [560, 310, 130], [680, 240, 120], [790, 290, 110]].forEach(([bx, by, bw], i) => cut(x, rectPts(bx, by, bw, h - by), i % 2 ? '#C9D8F3' : '#B7CAEE', { seed: 8240 + i, amp: 2, edgeW: 5, shadow: false }));
}, 0);
const pavementTex = () => flatTex('pave', 1600, 340, '#C9CDD6', '#B9BFCB', (x, w, h) => { x.strokeStyle = 'rgba(16,26,51,0.13)'; x.lineWidth = 3; for (let i = 0; i < w; i += 67) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } x.beginPath(); x.moveTo(0, h * 0.5); x.lineTo(w, h * 0.5); x.stroke(); });
const hedgeTex = () => D.tex('hedge', 1600, 100, x => { for (let i = 0; i < 16; i++) { cut(x, rectPts(i * 100 + 4, 46, 92, 54), C.navy, { seed: 8300 + i, amp: 1, edgeW: 4, shadow: false }); cut(x, circlePts(i * 100 + 50, 44, 50, 30, 18), '#7CC39B', { seed: 8320 + i, amp: 3, edgeW: 4, scribble: '#69B188', shadow: false }); } }, 0);
const SHOPS = [ // προσόψεις 24 × 34 cm (20 px/cm) · 0 = KOSTAS COFFEE (ταμπέλα: κενή → μπαίνει) · 1 = ANNA CAFÉ (προσφορά στη βιτρίνα) · 2–6 = η πόλη (ρούχα)
  { seed: 7700, wall: '#E9DCC4', sign: (c, g) => cut(c, rectPts(g.x, g.y, g.w, g.h), '#DCCBAE', { seed: 8401, amp: 1.5, edgeW: 5 }) },
  { seed: 7800, wall: C.pale, wallS: '#C9D8F3', awning: { b: C.mid }, sign: (c, g) => { cut(c, rectPts(g.x, g.y, g.w, g.h), C.paper, { seed: 8402, amp: 1.5, edgeW: 6 }); txt(c, 'ANNA CAFÉ', g.x + g.w / 2, g.y + g.h * 0.55, { font: `bold ${Math.floor(g.h * 0.5)}px Brand`, color: C.blue }); },
    window: (c, g) => { c.save(); c.translate(g.x + g.w * 0.5, g.y + g.h * 0.5); c.rotate(-0.06); flyerFace(c, -g.w * 0.26, -g.h * 0.4, g.w * 0.52, g.h * 0.8, 8410); c.restore(); } },
  { seed: 7900, wall: '#E4D3B8', wallS: '#D6C2A2', awning: { b: C.blue }, sign: (c, g) => cut(c, rectPts(g.x, g.y, g.w, g.h), C.blue, { seed: 8403, amp: 1.5, edgeW: 6 }) },
  { seed: 7950, wall: '#D6E0F5', wallS: '#C4D2EE', awning: false, sign: (c, g) => cut(c, rectPts(g.x, g.y, g.w, g.h), C.paper, { seed: 8404, amp: 1.5, edgeW: 6 }) },
  { seed: 7980, wall: C.paper, wallS: '#E6E0D0', awning: { b: C.navy }, sign: (c, g) => cut(c, rectPts(g.x, g.y, g.w, g.h), C.mid, { seed: 8405, amp: 1.5, edgeW: 6 }) },
  { seed: 7990, wall: '#E9DCC4', awning: { b: C.mid }, sign: (c, g) => cut(c, rectPts(g.x, g.y, g.w, g.h), C.navy, { seed: 8406, amp: 1.5, edgeW: 6 }) },
];
const shopTex = k => D.tex('shop' + k, 480, 680, (x, w, h) => shopFront(x, 0, 0, w, h, SHOPS[k]), 0);
const bldTex = (k, col) => D.tex('bld' + k, 480, 1000, (x, w, h) => { // γειτονική πολυκατοικία 24 × 50 cm
  cut(x, rectPts(0, 0, w, h), col, { seed: 8500 + k, amp: 2, scribble: mixHex(col, '#0B1B3F', 0.06), edge: false, shadow: false });
  for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) { const wx = 70 + q * 220, wy = 60 + r * 230; cut(x, rectPts(wx, wy, 120, 140), '#A9C3F1', { seed: 8520 + k * 10 + r * 2 + q, amp: 1, edgeW: 4, shadow: false }); cut(x, rectPts(wx - 22, wy, 20, 140), k % 2 ? C.blue : C.mid, { seed: 8560 + k * 10 + r, amp: 1, edge: false, shadow: false }); }
}, 0);

// ---------- κομμάτια ----------
const sp = (t, t0, f = 2.4) => Math.max(0, M.springTo(t, t0, 0, 1, { f, z: 0.5 }));
const MOVES = [[0, 'c'], [T.A, 0], [T.B, 1], [T.G, 2], [T.hes1, 1], [T.hes2, 2], [T.err, 'c'], [T.yp2, 0], [T.lyn, 1], [T.dik, 2], [T.prob2, 'c'], [T.esy, 0], [T.pou3, 1], [T.erix, 2], [LOOP_AT - 0.45, 'c']];
const spot = s => s === 'c' ? [0, PZ] : [CX[s], PZ];
function bundleAt(t) { // το πακέτο 500€: πέφτει · πηδάει από κάρτα σε κάρτα · γίνεται «;» · ξαναπέφτει · σηκώνεται στο frame 0
  const [x, z] = M.springKeys(MOVES.map(([tk, s]) => [tk, spot(s)]), t, { f: 2.6, z: 0.55 });
  const rz = M.springKeys(MOVES.map(([tk], i) => [tk, i ? (i % 2 ? 0.07 : -0.05) : 0.03]), t, { f: 2, z: 0.5 });
  let hop = 0; for (let i = 1; i < MOVES.length - 1; i++) hop += 2.6 * Math.sin(PI * clamp(prog(t, MOVES[i][0], MOVES[i][0] + 0.3)));
  const f = M.fall(t, T.drop, 0, HOVER[1], { g: 1400, e: 0.22 }), q0 = clamp(prog(t, T.drop, T.drop + 0.15));
  let y = t < T.drop ? HOVER[1] : HOVER[1] - f.y, s = 1, spin = 0, b = { x, z, y: y + hop, rz: lerp(HRZ, rz, q0), rx: lerp(HRX, 0, q0) };
  if (t >= T.prota && t < T.meta) { const q = easeIn(prog(t, T.prota, T.prota + 0.35)); s = 1 - q; b.y += 8 * easeOut(q); spin = 4 * q; }   // «γίνεται ερωτηματικό»
  if (t >= T.meta) { const f2 = M.fall(t, T.meta + 0.05, 0, 12, { g: 1400, e: 0.22 }); if (t < T.meta + 0.05) s = 0; else b.y = 12 - f2.y + hop; }
  const qe = easeInOut(prog(t, LOOP_AT - 0.45, LOOP_AT)); b.y = lerp(b.y, HOVER[1], qe); b.rz = lerp(b.rz, HRZ, qe); b.rx = lerp(b.rx, HRX, qe); b.x = lerp(b.x, 0, qe); b.z = lerp(b.z, PZ, qe);
  return { ...b, s, rz: b.rz + spin };
}
function bundleItems(t) {
  const b = bundleAt(t); if (b.s < 0.02) return [];
  const out = [];
  for (let i = 0; i < 5; i++) { const j = ((i * 0.37) % 1) - 0.5; out.push({ t: noteTex(), w: 12 * b.s, h: 6 * b.s, pos: [b.x + j * 0.5 * b.s, b.y + 0.05 + i * 0.12, b.z + j * 0.3 * b.s], anchor: [0.5, 0.5], rot: [PI / 2 + b.rx, 0, b.rz + j * 0.08], lift: 0.1, zBias: 0.3 + i * 0.3 }); }
  out.push({ t: bandTex(), w: 4.4 * b.s, h: 6.4 * b.s, pos: [b.x, b.y + 0.7, b.z], anchor: [0.5, 0.5], rot: [PI / 2 + b.rx, 0, b.rz], lift: 0.1, zBias: 3 });
  return out;
}
const CARDWIN = [[T.gnost, T.err], [T.ara, T.prota], [T.meta + 0.3, 1e9]];
const CARDFROM = [[-46, 0, CZ], [0, 0, -40], [46, 0, CZ]];
function cardItems(t) {
  const w = CARDWIN.find(([a, b]) => t >= a && t < b + 0.6); if (!w) return [];
  return [0, 1, 2].map(k => {
    const pin = sp(t, w[0] + k * 0.08, 2.2), qo = easeIn(prog(t, w[1] + k * 0.05, w[1] + k * 0.05 + 0.35));
    const home = [CX[k], 0.1, CZ], pos = V.lerp(CARDFROM[k], home, pin);
    pos[0] += (k - 1 || -0.6) * 40 * qo; pos[1] += 10 * qo; pos[2] += 8 * qo;
    return { t: cardTex(k), w: 10, h: 8, pos, anchor: [0.5, 0.5], rot: [PI / 2 - 0.5 * qo, 0, [-0.04, 0.02, 0.05][k] + 0.6 * qo * (k - 1)], lift: 0.1 + pos[1] };
  });
}
function walkerItem(key, t, lt, x, z, o, still) { // περαστικός (person του lib.js) ως χάρτινη φιγούρα 13 cm
  return { t: D.tex(key, 440, 800, c => walker(c, lt, 220, 340, 1, { walk: still ? 0 : 1, ...o }), t), w: 7.15, h: 13, pos: [x, 0, z] };
}
const HEADY = 13.6; // πάνω από το κεφάλι ενός περαστικού (για «!»)
function stageItems(dx = 0) { // μίνι δρόμος στο γραφείο: σκηνικό · πεζοδρόμιο · φράχτης με θάμνους (dx = κύλιση, ρούχα)
  return [
    { t: backdropTex(), w: 96, h: 64, pos: [0, 0, 46], surface: true, lift: 0, shadow: false },
    { t: pavementTex(), w: 160, h: 34, pos: [-dx % 10, 0.05, -2], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: hedgeTex(), w: 130, h: 3.4, pos: [-dx % 8.125, 0, 6] },
  ];
}
// ταμπέλα: οι περαστικοί προσπερνάνε → πέφτει η ταμπέλα → γυρίζουν να δουν
const SIGNY = 34 * (1 - 0.125);
function signItems(t) {
  const lt = t - C3, lx = Math.min(lt, T.sign + 0.12 - C3), seen = t > T.sign + 0.15;
  const out = [...stageItems(), { t: bldTex(0, C.pale), w: 24, h: 50, pos: [-25, 0, 31] }, { t: shopTex(0), w: 24, h: 34, pos: [0, 0, 30], surface: true, lift: 0, shadow: false }, { t: bldTex(1, '#E4D3B8'), w: 24, h: 46, pos: [25, 0, 31] }];
  const w1 = -15 + 8.5 * lx, w2 = 17 - 7.5 * lx;
  out.push(walkerItem('wS1', t, lt, w1, 13, { seed: 5500, type: 'woman', shirt: '#E86A5A', shirtS: '#D55A4B', look: seen ? 12 : 8, mood: seen ? 'happy' : undefined, ph: 0 }, seen));
  out.push(walkerItem('wS2', t, lt, w2, 16, { seed: 5600, shirt: C.sky, shirtS: C.mid, hairC: '#3A2A20', look: seen ? -12 : -8, mood: t > T.sign + 0.35 ? 'happy' : undefined, ph: 1.3 }, seen));
  if (t > T.sign - 0.3) { const f = M.fall(t, T.sign - 0.24, 0, 22, { g: 900, e: 0.2 }); out.push({ t: D.tex('signK', 640, 176, (c, w, h) => signBoard(c, { x: 4, y: 4, w: w - 8, h: h - 8 }), ST.B), w: 21, h: 5.8, pos: [0, SIGNY + 22 - f.y, 29.4], anchor: [0.5, 0.5], lift: 0.6 }); }
  return out;
}
// φυλλάδια: προσφορά που δεν ξέρει κανείς → έρχεται κόσμος → τα φυλλάδια πετάνε από την πόρτα στα χέρια τους → πάνε στο μαγαζί
const DOOR = [7.2, 10, 29], FLYW = [[-13, 14], [-3.5, 12], [12, 15]];
const flyT = k => T.sygk + k * 0.22;
function flyerItems(t) {
  const lt = t - C4, out = [...stageItems(), { t: bldTex(2, '#E9DCC4'), w: 24, h: 46, pos: [-25, 0, 31] }, { t: shopTex(1), w: 24, h: 34, pos: [0, 0, 30], surface: true, lift: 0, shadow: false }, { t: bldTex(3, C.pale), w: 24, h: 50, pos: [25, 0, 31] }];
  out.push(walkerItem('wF0', t, lt, 8 + 9 * lt, 18, { seed: 5700, shirt: '#D6B8E8', shirtS: '#BFA0D6', look: 10 }));                 // περνάει χωρίς να δει
  const OPP = [{ seed: 5800, shirt: '#E86A5A', shirtS: '#D55A4B', type: 'woman' }, { seed: 5900, shirt: '#7CC39B', shirtS: '#69B188' }, { seed: 6000, shirt: C.sky, shirtS: C.mid, type: 'woman', hairC: '#3A2A20' }];
  FLYW.forEach(([x1, z], k) => {
    const x0 = x1 < 0 ? -34 : 34, tin = T.kosmo - 0.35 + k * 0.12, got = t > flyT(k) + 0.45, go = prog(t, T.fly + k * 0.1, T.fly + k * 0.1 + 0.9);
    let x = lerp(x0, x1, easeOut(prog(t, tin, tin + 0.7))); x = lerp(x, DOOR[0] + (k - 1) * 3, easeInOut(go));
    if (t < tin) return;
    out.push(walkerItem('wF' + (k + 1), t, lt, x, z, { ...OPP[k], ph: k, look: got ? (x < DOOR[0] ? 12 : -12) : x1 < 0 ? 8 : -8, mood: got ? 'happy' : undefined,
      carry: got ? c => { c.save(); c.rotate(-0.12); flyerFace(c, -70, 10, 140, 196, 8600 + k); c.restore(); } : undefined }, got && go <= 0));
  });
  FLYW.forEach(([x1, z], k) => { // φυλλάδιο σε τόξο από την πόρτα στο χέρι
    const q = prog(t, flyT(k), flyT(k) + 0.45); if (q <= 0 || q >= 1) return;
    const e = easeInOut(q), p = V.lerp(DOOR, [x1, 7, z - 0.6], e); p[1] += 9 * Math.sin(PI * q);
    out.push({ t: D.tex('flyF', 300, 420, (c, w, h) => flyerFace(c, 0, 0, w, h, 8620), 0), w: 3.2, h: 4.5, pos: p, anchor: [0.5, 0.5], rot: [0.3 * Math.sin(q * 7), 0.6 * q, (k - 1) * 0.5 + q * 6], lift: 3 });
  });
  return out;
}
// ρούχα: ο εργαζόμενος περπατάει μέσα στην πόλη (το σκηνικό κυλάει) · το λογότυπο ξανά και ξανά σε άλλο φόντο · «κάθε εργαζόμενος» → +2
const VW = 10, logoShirt = c => kostasLogo(c, 0, 160, 150);
function shirtItems(t) {
  const lt = t - C5, dx = VW * lt, out = [...stageItems(dx)];
  [2, 3, 4, 5, 1, 0].forEach((k, i) => out.push({ t: shopTex(k), w: 24, h: 34, pos: [-26 + i * 25.5 - dx, 0, 30], surface: true, lift: 0, shadow: false }));
  [[1, 5700, '#D6B8E8', '#BFA0D6', 'woman'], [3, 5800, '#E86A5A', '#D55A4B'], [4, 6000, C.sky, C.mid, 'woman']].forEach(([i, seed, shirt, shirtS, type], j) => {
    const x = -26 + i * 25.5 - dx + 4, near = Math.abs(x) < 7;
    out.push(walkerItem('wB' + j, t, lt, x, 20, { seed, shirt, shirtS, type, look: clamp(-x * 1.6, -14, 14), mood: near ? 'happy' : undefined }, true));
  });
  out.push(walkerItem('wW0', t, lt, 0, 12, { seed: 6100, shirt: C.navy, shirtS: '#1B2D62', carry: logoShirt, look: 6, mood: 'happy' }));
  [-1, 1].forEach((sd, j) => { const s = sp(t, T.kathe + j * 0.15, 2.2); if (s > 0.01) out.push({ ...walkerItem('wW' + (j + 1), t, lt, sd * 9.5, 14.5, { seed: 6200 + j * 100, type: j ? 'woman' : undefined, shirt: C.navy, shirtS: '#1B2D62', carry: logoShirt, look: -sd * 4, mood: 'happy', ph: 1 + j }), h: 13 * s }); });
  return out;
}
const bystanderBang = j => { const i = [1, 3, 4][j], x0 = -26 + i * 25.5 + 4; return C5 + (x0 - 5) / VW; }; // πότε ο περαστικός j «βλέπει» το λογότυπο

function build(t) {
  if (t >= LOOP_AT) t = 0;                                           // ουρά του loop = frame 0
  const cam = D.camera(camAt(t)), k = kind(t);
  const items = [...roomItems(R, { mat: [0, -16, 0.03], shelf: [-18, 96] })];
  if (k === 'desk') items.push(...cardItems(t), ...bundleItems(t));
  if (k === 'stratos') items.push(stratosItem(cam, t, { pos: ST_POS, pose: poseSpring(POSES, t), clip: behindDesk(cam, R) }));
  if (k === 'sign') items.push(...signItems(t));
  if (k === 'flyer') items.push(...flyerItems(t));
  if (k === 'shirt') items.push(...shirtItems(t));
  return { cam, items, R, ...LIGHT, patch: 0.9, shaft: k === 'desk' || k === 'stratos' ? 0.8 : 0.4, dust: 90, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
}
const MB = t => (t > T.drop && t < T.drop + 0.16) || (t > T.zoom - 0.02 && t < T.zoom + 0.12) || (t > T.err - 0.02 && t < T.err + 0.12) || (t > T.prota && t < T.prota + 0.35) || (t > T.sign - 0.24 && t < T.sign) ? 3 : 1;

// ---------- 2D από πάνω ----------
// μεγάλος χάρτινος τίτλος στη μέση (written hook §5.1 · 1η χρήση: εδώ ×5 → engine στο επόμενο) · lines = [[κείμενο, st], ...]
// o = { y, fs, hl (γραμμή σε brand blue), end (φεύγει), rise: [t0, t1] (ανεβαίνει και σβήνει στο caption: hook) }
function bigTitle(ctx, t, lines, o = {}) {
  const yc = o.y ?? 800, fs0 = o.fs || 130, lh = fs0 * 1.45, y0 = yc - (lines.length - 1) * lh / 2;
  let k = 1, dy = 0, a = 1;
  if (o.end != null) { const q = prog(t, o.end, o.end + 0.2); if (q >= 1) return; k *= 1 - 0.35 * easeIn(q); a *= 1 - q; }
  if (o.rise) { const q = easeInOut(prog(t, o.rise[0], o.rise[1])); if (q >= 1) return; k *= lerp(1, 0.4, q); dy = lerp(0, 330 - yc, q); a *= 1 - easeIn(q); }
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, yc + dy); ctx.scale(k, k); ctx.translate(-540, -yc);
  lines.forEach(([s, st], i) => {
    const hl = i === o.hl, font = fit(ctx, s, 860, fs0), fs = +font.match(/\d+/)[0]; ctx.font = font; const tw = ctx.measureText(s).width;
    pop(ctx, t, st, 540, y0 + i * lh, () => { cut(ctx, rectPts(-tw / 2 - 40, -fs * 0.72, tw + 80, fs * 1.44), hl ? BRAND : C.paper, { seed: 8800 + i * 7 + s.length, amp: 3, edgeW: 9 }); txt(ctx, s, 0, fs * 0.05, { font, color: hl ? '#fff' : C.navy }); }, i % 2 ? 0.025 : -0.02);
  });
  ctx.restore();
}
const bang = (ctx, t, st, q) => pop(ctx, t, st, q[0], q[1] - 30, () => { cut(ctx, circlePts(0, 0, 40, 40, 20), '#FBFAF6', { seed: 8900 + Math.round(st * 10) % 50, amp: 2 }); txt(ctx, '!', 0, 4, { font: 'bold 62px Round', color: BRAND }); });

function SCENE(ctx, t) {
  D.frame(ctx, t, build, { mb: MB(t) });
  const tt = t >= LOOP_AT ? 0 : t, cam = D.camera(camAt(tt)), at = p => cam.proj(p), k = kind(tt);
  if (tt < C1) { // hook: «ΕΧΕΙΣ 500€.» → caption · «ΠΟΥ ΘΑ ΤΑ ΡΙΞΕΙΣ;»
    bigTitle(ctx, tt, [['ΕΧΕΙΣ 500€.', -1]], { y: 700, fs: 150, rise: [1.35, 1.75] });
    if (tt >= T.mia - 0.05) bigTitle(ctx, tt, [['ΠΟΥ ΘΑ ΤΑ', T.mia], ['ΡΙΞΕΙΣ;', T.mia + 0.12]], { y: 680, fs: 120, hl: 1, end: C1 - 0.2 });
  }
  if (k === 'desk' && tt >= C2 && tt < C3) { // το λάθος
    bigTitle(ctx, tt, [['ΤΟ ΛΑΘΟΣ:', T.err], ['ΝΑ ΔΙΑΛΕΞΕΙΣ', T.dialex], ['ΠΡΟΪΟΝ', T.prod]], { y: 760, fs: 120, hl: 0 });
    stamp(ctx, tt, T.prob - 0.1, 540, 1130, 'ΠΡΙΝ ΔΕΙΣ ΤΟ ΠΡΟΒΛΗΜΑ', -0.04, C.navy, 54);
  }
  if (k === 'sign') {
    stepChip(ctx, tt, C3 + 0.25, 'Β', 'ΤΑΜΠΕΛΑ');
    if (tt > T.sign - 0.05) { const q = at([0, SIGNY, 29]); [[-0.42, -0.6], [0.4, 0.5], [0.05, 0.9]].forEach(([u, v], i) => sparkle(ctx, q[0] + u * 520, q[1] - 70 * v, 0.9, tt, T.sign + 0.1 + i * 0.12, 8950 + i)); }
    const lx = Math.min(tt - C3, T.sign + 0.12 - C3);
    bang(ctx, tt, T.sign + 0.25, at([-15 + 8.5 * lx, HEADY, 13])); bang(ctx, tt, T.sign + 0.4, at([17 - 7.5 * lx, HEADY, 16]));
  }
  if (k === 'flyer') {
    stepChip(ctx, tt, C4 + 0.25, 'Α', 'ΦΥΛΛΑΔΙΑ');
    FLYW.forEach(([x1, z], j) => { if (tt < T.fly + j * 0.1) bang(ctx, tt, flyT(j) + 0.45, at([x1, HEADY, z])); });
  }
  if (k === 'shirt') {
    stepChip(ctx, tt, C5 + 0.25, 'Γ', 'ΕΝΔΥΣΗ');
    [1, 3, 4].forEach((i, j) => { const tb = bystanderBang(j), x = -26 + i * 25.5 - VW * (tt - C5) + 4; if (tb < C6 - 0.3 && tt < tb + 1.4) bang(ctx, tt, tb, at([x, HEADY, 20])); });
  }
  if (k === 'desk' && tt >= C6) { // σύνοψη · «;» · CTA
    if (tt < T.yp2 + 0.2) { stamp(ctx, tt, T.best - 0.1, 540, 820, '«ΚΑΛΥΤΕΡΟ»', -0.05, BRAND, 96);
      const q = easeOut(prog(tt, T.best + 0.45, T.best + 0.75)); if (q > 0) { ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(240, 850); ctx.lineTo(240 + 600 * q, 850 - 70 * q); ctx.stroke(); ctx.restore(); } }
    if (tt >= T.prota && tt < T.meta + 0.2) { const q = prog(tt, T.meta, T.meta + 0.2); pop(ctx, tt, T.prota + 0.25, 540, 1190, () => qmark(ctx, 0, 0, 0.55 * (1 - q), 0.06));
      bigTitle(ctx, tt, [['ΤΙ ΘΕΛΕΙΣ', T.apof], ['ΝΑ ΠΕΤΥΧΕΙΣ;', T.pet]], { y: 720, fs: 120, hl: 1, end: T.meta - 0.05 }); }
    if (tt >= T.meta - 0.05) bigTitle(ctx, tt, [['ΚΑΙ ΜΕΤΑ', T.meta], ['ΔΙΑΛΕΓΕΙΣ ΤΟ ΜΕΣΟ.', T.dial2]], { y: 760, fs: 110, end: T.tora - 0.1 });
    if (tt >= T.tora) ctaButton(ctx, tt, T.pes, 540, 820, "Γράψε στα σχόλια: Α, Β ή Γ");
  }
}

module.exports = require('./render.js')({
  name: 'ms03_500', CUTS, SCENE, LOOP: 'cut', LOOP_AT, TAG, CAPS, HOOK_END: T.mia,
  VO_FILE: 'vo/ms03_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/ms03.mp3',
  SFX: [                                // wipes → whoosh αυτόματα
    [T.drop + 0.14, 'thud', { f0: 95, f1: 40, gain: 0.9, note: 'πακέτο στο γραφείο' }], [T.drop + 0.15, 'slide', { dur: 0.18, gain: 0.5 }],
    [T.zoom, 'zoom', { gain: 0.6 }], [T.gnost, 'swoosh', { note: 'κάρτες' }], [T.mia, 'thud', { f0: 70, f1: 32, dur: 0.6, gain: 0.9, note: 'bass hit' }],
    [T.A, 'pop'], [T.B, 'pop', { seed: 2 }], [T.G, 'pop', { seed: 3 }], [T.hes1, 'ticks', { count: 6, gain: 0.6 }],
    [T.shrug, 'boing', { gain: 0.4 }],
    [VT.W('Γιατι'), 'scratch', { note: 'record scratch: πάγωμα' }], [T.err, 'stamp'], [T.dialex, 'pop', { seed: 4 }], [T.prod, 'pop', { seed: 5 }], [T.prob - 0.1, 'stamp', { seed: 2 }],
    [T.sign - 0.04, 'thud', { note: 'ταμπέλα' }], [T.sign + 0.12, 'shimmer', { gain: 0.6 }], [T.sign + 0.25, 'blip'], [T.sign + 0.4, 'blip', { seed: 2 }],
    [T.kosmo - 0.3, 'swoosh', { seed: 3, gain: 0.5 }], ...[0, 1, 2].map(k => [flyT(k), 'swoosh', { seed: 5 + k, gain: 0.55 }]), ...[0, 1, 2].map(k => [flyT(k) + 0.45, 'pop', { seed: 6 + k, gain: 0.7 }]),
    ...[0, 1, 2].map(j => [bystanderBang(j), 'blip', { seed: 3 + j }]).filter(c => c[0] < C6 - 0.3), [T.kathe, 'pop', { seed: 9 }], [T.kathe + 0.15, 'pop', { seed: 10 }],
    [T.ara, 'swoosh', { seed: 8 }], [T.best - 0.1, 'stamp', { seed: 3 }], [T.best + 0.45, 'swoosh', { seed: 9, gain: 0.6 }],
    [T.yp2, 'pop', { seed: 11 }], [T.lyn, 'pop', { seed: 12 }], [T.dik, 'pop', { seed: 13 }],
    [T.prota, 'zoom', { gain: 0.6 }], [T.prota + 0.25, 'pop', { seed: 14 }], [T.meta + 0.2, 'thud', { f0: 95, f1: 40 }], [T.meta + 0.3, 'swoosh', { seed: 10 }],
    [T.pes, 'ding'], [T.esy, 'pop', { seed: 15 }], [T.pou3, 'pop', { seed: 16 }], [T.erix, 'pop', { seed: 17 }],
  ],
});
