// «Ο πελάτης είπε…» — Κάν' το να ξεχωρίζει · v2 · host: Στράτος · VO ElevenLabs «Stratos» + μουσική + SFX · 26,0s · seamless loop (LOOP: 'cut')
// Σενάριο v2 του Αλέξανδρου: «Αν έχεις δουλέψει ποτέ με αναποφάσιστο πελάτη σε γραφιστικό, ξέρεις ακριβώς τι έρχεται.» (το κινητό πλημμυρίζει μηνύματα →
// ο Στράτος στην κάμερα) → κάθε αίτημα γίνεται κυριολεξία: το λογότυπο ξεκολλάει από το δοκιμαστικό και «ξεχωρίζει» (ποδαράκια, hop) → «Πιο μεγάλο / Λίγο ακόμα»:
// φουσκώνει, στριμώχνει τον Στράτο, ρίχνει την κούπα → «Να πετάει»: φτερά origami, πτήση (χτυπάει στο ράφι) → «Να σκάει!»: κομφετί, ένα στο μουστάκι →
// «Και τότε έρχεται το καλύτερο.» (κινητό: όλα τα αιτήματα στη σειρά, «…») → «Τελικά θα προχωρήσουμε / με το πρώτο.» → deadpan → rewind όλης της ιστορίας →
// CTA «Αν είσαι γραφίστας… (👍) Αν δεν είσαι, στείλ' το στον γραφίστα σου ή κάν' τον tag.» → νέο «Καλησπέρα!» στο κινητό = frame 0 (ο ατελείωτος κύκλος).
// Look: diorama.js (χάρτινη μακέτα με αληθινή κάμερα, STYLE_GUIDE §1d): προοπτική, φως παραθύρου, σκιές ανά ύψος, βάθος πεδίου (focus στον πρωταγωνιστή
// του πλάνου, rack focus), motion blur στις γρήγορες κινήσεις.
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, starPts, txt, captionSeq, lipsync, blinkNow, clamp, lerp, prog, easeIn, easeOut, easeInOut, rng } = L;
const M = require('./motion.js');
const D = require('./diorama.js'), { V } = D;
const { stratos, poseSpring } = require('./stratos.js');
const { BRAND, seriesTag, kostasLogo, phoneFrame, msgBubble, mug, ctaButton } = require('./props.js');

// VO = vo/ep02_vo.mp3 @ 0,2s — `node vo.js ep02` take 1 (seed 1000, κείμενο v2 · «tag» με λατινικά: δοκιμαστικό 3 γραφών, διάλεξε ο Αλέξανδρος) · μεταγραφή Scribe ✔
// · «Πιο μεγάλο. Λίγο ακόμα.» και «Να πετάει! Να σκάει!» ήταν κολλητά στο take → χωρισμένα στη σιωπή ανάμεσα στις λέξεις (7,36 · 8,20 · 8,955 χρόνος take, +0,5s)
// · παύσεις: --keep 3:0.45,4:1.0,5:0.45,6:0.7,7:1.9,8:1.1,9:0.3,10:2.1 (χώρος για τις κυριολεξίες και το rewind). 24,59s.
// Χρονισμοί (video · λέξεις: vo/ep02_vo.words.json): 0,40 Αν έχεις δουλέψει ποτέ με αναποφάσιστο πελάτη (2,52) σε γραφιστικό, | 3,53 ξέρεις ακριβώς τι έρχεται. (–4,73)
// | 5,20 Κάν' το να ξεχωρίζει. | 7,17 Πιο μεγάλο. | 8,33 Λίγο ακόμα. | 9,67 Να πετάει! | 12,23 Να σκάει! | 14,07 Και τότε έρχεται το καλύτερο. (–15,30)
// | 15,57 Τελικά θα προχωρήσουμε (16,80) με το πρώτο. (–17,30) | 19,43 Αν είσαι γραφίστας, (20,34) καταλαβαίνεις για τι μιλάω. | 21,67 Αν δεν είσαι,
// | 22,63 στείλ' το στον γραφίστα σου | 23,90 ή κάν' τον tag. (–24,47)
const VO = [];
const TAG = 'Ο πελάτης είπε…', HOOK1 = 'Αν έχεις δουλέψει ποτέ';
const TOTAL = 26.0, PI = Math.PI;

// ---------- ιστορία (story time τ) · το rewind τρέχει την ιστορία ανάποδα ----------
const RW = [17.9, 19.4];                                    // rewind σε πραγματικό χρόνο
const T_PEEL = 5.5, T_BIG = [7.2, 8.35], T_WINGS = 9.75, FLY0 = 10.1, FLY1 = 12.2, T_POP = 12.55, POP_AT = [-16, 52, 30];
const tauOf = t => t < RW[0] ? t : t < RW[1] ? lerp(T_POP + 1.9, T_PEEL - 0.05, easeInOut(prog(t, RW[0], RW[1]))) : T_PEEL - 0.05;

// ---------- κόσμος (cm) ----------
const R = { desk: { y: 0, x0: -85, x1: 85, z0: -35, z1: 55 }, wall: { z: 150 }, floor: { y: -88 } };
// φως παραθύρου (αριστερά, εκτός κάδρου) · δύο στησίματα όπως στο σινεμά: 'desk' = η κηλίδα πέφτει στο γραφείο · 'wall' = στον τοίχο πίσω από τον Στράτο
const LIGHTS = {
  desk: { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } },
  wall: { light: { dir: [0.75, -0.45, 0.48], soft: 0.05, shadow: 0.42 }, window: { c: [-195, 159, 44], a: [0, 0, 30], b: [0, 40, 0], panes: [2, 2] } },
};
const SHEET = { w: 21, h: 29.7, pos: [-2, 0.12, -14], rot: [PI / 2, 0, 0], surface: true, lift: 0.12 };
const SHEET_LOGO = [0.5, 0.40];                                   // θέση λογοτύπου στο A4 (0..1)
const LOGO_PXC = 250 / 6.0, LS = 560 / LOGO_PXC, AY = (280 + 256) / 560, LD = (AY - 0.5) * LS; // υφή λογοτύπου: πλευρά (cm) · κάτω άκρη δίσκου · κέντρο→κάτω άκρη
const LC = D.world(SHEET, SHEET_LOGO[0], SHEET_LOGO[1]), HINGE = [LC[0], 0.3, LC[2] - LD];
const PHONE = [13, 0.5, -24], MUG = [-19, 0, 27], ST_POS = [-6, R.floor.y, 84], HEAD = [-6, 68, 84];

// ---------- κινητό: η συνομιλία ανά στιγμή ----------
const CHAT = [[1.3, 'Για το λογότυπο…'], [1.8, 'Έχω μερικές ιδέες'], [2.3, 'Μικρές αλλαγές'], [2.8, 'Πολύ μικρές!'], [3.2, 'Και κάτι ακόμα'],
  [5.2, 'Κάν\' το να ξεχωρίζει'], [7.17, 'Πιο μεγάλο'], [8.33, 'Λίγο ακόμα'], [9.67, 'Να πετάει!'], [12.23, 'Να σκάει!'],
  [14.2, '•••'], [15.6, 'Τελικά…'], [16.1, 'θα προχωρήσουμε'], [16.85, 'με το πρώτο.']];
const LOOP_AT = 24.55;                                      // νέο «Καλησπέρα!» → ξανά από την αρχή
function chatAt(t) {
  if (t >= LOOP_AT) return ['Καλησπέρα!'];
  const list = ['Καλησπέρα!']; for (const [tk, m] of CHAT) if (t >= tk) list.push(m);
  if (t >= 15.6) list.splice(list.indexOf('•••'), 1);                                     // το «γράφει…» γίνεται μήνυμα
  return list;
}

// ---------- υφές ----------
const T = {
  wall: () => D.tex('wall', 1260, 900, (x, w, h) => {
    x.fillStyle = C.pale; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#C9D8F3', 11);
    x.strokeStyle = 'rgba(30,58,138,0.09)'; x.lineWidth = 3; for (let i = 1; i < 7; i++) { x.beginPath(); x.moveTo(i * w / 7, 0); x.lineTo(i * w / 7, h - 36); x.stroke(); }
    x.fillStyle = C.blue; x.fillRect(0, h - 36, w, 36);
  }, 0),
  floor: () => D.tex('floor', 1260, 600, (x, w, h) => { x.fillStyle = '#14224A'; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#22346C', 12); }, 0),
  deskTop: () => D.tex('deskTop', 1360, 720, (x, w, h) => { cut(x, rectPts(6, 6, w - 12, h - 12), C.sky, { seed: 13, amp: 3, scribble: '#A9C3F3', shadow: false }); }, 0),
  deskFront: () => D.tex('deskFront', 680, 352, (x, w, h) => { cut(x, rectPts(4, 4, w - 8, h - 8), C.blue, { seed: 14, amp: 2, scribble: '#2A4A9E', shadow: false }); }, 0),
  mat: () => D.tex('mat', 600, 450, (x, w, h) => {
    const p = cut(x, rrPts(8, 8, w - 16, h - 16, 14), C.navy, { seed: 21, amp: 1.5, edgeW: 6, shadow: false });
    x.save(); L.path(x, p); x.clip();
    for (let i = 20; i < w; i += 10) { x.strokeStyle = i % 50 === 20 ? 'rgba(143,176,238,0.30)' : 'rgba(143,176,238,0.12)'; x.lineWidth = i % 50 === 20 ? 2 : 1; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = 20; j < h; j += 10) { x.strokeStyle = j % 50 === 20 ? 'rgba(143,176,238,0.30)' : 'rgba(143,176,238,0.12)'; x.lineWidth = j % 50 === 20 ? 2 : 1; x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.restore();
  }, 0),
  // δοκιμαστικό A4 (24 px/cm) · hole = το λογότυπο έχει ξεκολλήσει (τρύπα με το πάχος του χαρτιού)
  sheet: hole => D.tex('sheet', 504, 713, (x, w, h) => {
    cut(x, rectPts(8, 8, w - 16, h - 16), '#FBFAF6', { seed: 31, amp: 1.5, edgeW: 5, shadow: false });
    x.strokeStyle = 'rgba(16,26,51,0.35)'; x.lineWidth = 2;
    for (const [cx, cy, sx, sy] of [[34, 34, 1, 1], [w - 34, 34, -1, 1], [34, h - 34, 1, -1], [w - 34, h - 34, -1, -1]]) { x.beginPath(); x.moveTo(cx - 18 * sx, cy); x.lineTo(cx + 12 * sx, cy); x.moveTo(cx, cy - 18 * sy); x.lineTo(cx, cy + 12 * sy); x.stroke(); }
    txt(x, 'δοκιμαστικό', w / 2, h - 70, { font: '30px Hand', color: 'rgba(16,26,51,0.45)' });
    if (hole) {
      const cx = SHEET_LOGO[0] * w, cy = SHEET_LOGO[1] * h, rr = 5.8 * 24;
      x.save(); x.globalCompositeOperation = 'destination-out'; L.path(x, L.tear(circlePts(cx, cy, rr, rr, 48), 77, 2, 14)); x.fill(); x.restore();
      x.save(); L.path(x, L.tear(circlePts(cx, cy, rr + 1, rr + 1, 48), 77, 2, 14)); x.strokeStyle = '#D9D2C0'; x.lineWidth = 4; x.stroke(); x.restore();
    }
  }, hole ? 1 : 0),
  logo: () => D.tex('logo', 1120, 1120, x => {
    x.scale(2, 2); cut(x, circlePts(280, 280, 250, 250, 48), BRAND, { seed: 41, amp: 2.5, edgeW: 12, shadow: false });
    kostasLogo(x, 280, 280, 500, { disk: BRAND, fg: C.paper });
  }),
  leg: () => D.tex('leg', 70, 230, x => {            // ποδαράκι: navy λωρίδα + λευκό sneaker (όπως του Στράτου)
    cut(x, rrPts(24, 4, 22, 178, 10), C.navy, { seed: 51, amp: 1, edgeW: 5, shadow: false });
    cut(x, rrPts(8, 176, 56, 40, 18), '#FFFFFF', { seed: 52, amp: 1, edgeW: 4, shadow: false }); x.fillStyle = '#C8CEDA'; x.fillRect(12, 206, 48, 5);
  }),
  wing: side => D.tex('wing' + side, 420, 320, x => {  // φτερό origami: η ρίζα στο x = 0 (δεξί) · το αριστερό είναι καθρέφτης
    if (side < 0) { x.translate(420, 0); x.scale(-1, 1); }
    const P = [[4, 130], [120, 44], [262, 12], [414, 34], [332, 112], [388, 150], [292, 188], [334, 238], [206, 262], [70, 250], [4, 206]];
    cut(x, P, C.paper, { seed: 55, amp: 2, edgeW: 7, shadow: false, scribble: '#ECE6D6' });
    x.strokeStyle = 'rgba(143,176,238,0.9)'; x.lineWidth = 4; for (const [ex, ey] of [[330, 112], [290, 188], [206, 262]]) { x.beginPath(); x.moveTo(10, 168); x.lineTo(ex, ey); x.stroke(); }
  }),
  burst: () => D.tex('burst', 600, 600, x => { cut(x, starPts(300, 300, 280, 10, 0.45), C.paper, { seed: 57, amp: 3, edgeW: 8, shadow: false }); cut(x, starPts(300, 300, 170, 8, 0.5), C.gold, { seed: 58, amp: 2, edge: false, shadow: false }); }),
  // κινητό: τα μηνύματα στοιβάζονται από κάτω προς τα πάνω (τα παλιά «ανεβαίνουν» και κρύβονται κάτω από την μπάρα)
  phone: list => D.tex('phone', 700, 1320, x => { x.scale(2, 2); phoneFrame(x, 175, 330, 330, 640, (c, w, h) => {
    c.fillStyle = '#E3EBFA'; c.fillRect(0, 0, w, 700);
    for (let i = list.length - 1, y = h - 96; i >= 0 && y > 20; i--, y -= 80) msgBubble(c, 12, y, 150, 66, list[i], { fs: 18, time: `10:${String(38 + i).padStart(2, '0')}`, seed: 3 + i });
    c.fillStyle = C.navy; c.fillRect(0, 0, w, 86); txt(c, 'KOSTAS COFFEE', w / 2, 52, { font: '24px Brand', color: '#fff' });
  }, { seed: 7300 }); }, list.join('|')),
  mug: () => D.tex('mug', 260, 300, x => mug(x, 118, 190, 1.15, ST.T, true)),
  shelf: () => D.tex('shelf', 680, 170, (x, w, h) => {
    const rolls = [C.navy, BRAND, C.mid, C.paper, C.sky, C.gold, BRAND, C.pale, C.navy, C.mid];
    rolls.forEach((col, i) => { const rx = 30 + i * 62, rh = 100 + (i % 3) * 12; cut(x, rrPts(rx, h - 34 - rh, 50, rh, 10), col, { seed: 60 + i, amp: 1.5, edgeW: 6, shadow: false }); x.fillStyle = 'rgba(11,27,63,0.25)'; x.beginPath(); x.ellipse(rx + 25, h - 34 - rh + 10, 14, 6, 0, 0, 7); x.fill(); });
    cut(x, rectPts(4, h - 36, w - 8, 26), C.navy, { seed: 59, amp: 1.5, edgeW: 6, shadow: false });
  }, 0),
  board: () => D.tex('board', 330, 270, (x, w, h) => {
    cut(x, rectPts(8, 8, w - 16, h - 16), C.paper, { seed: 70, amp: 2, edgeW: 6, shadow: false, scribble: '#ECE6D6' });
    [C.navy, BRAND, C.mid, C.sky, C.gold].forEach((col, i) => { cut(x, rectPts(30 + i * 56, 34, 44, 64), col, { seed: 71 + i, amp: 1, edgeW: 4, shadow: false }); x.fillStyle = C.ink; x.beginPath(); x.arc(52 + i * 56, 40, 4, 0, 7); x.fill(); });
    x.save(); x.globalAlpha = 0.5; kostasLogo(x, 110, 186, 110, { mono: C.ink }); x.restore();
    txt(x, 'v1 ✓', 220, 190, { font: '34px Hand', color: BRAND });
  }, 0),
};

// ---------- το λογότυπο ανά στιγμή της ιστορίας ----------
// Catmull-Rom πτήση (κέντρο δίσκου): ξεκινάει από το γραφείο, ανεβαίνει αριστερά μέσα από τη δέσμη φωτός, χτυπάει στο ράφι, γυρίζει μπροστά στον Στράτο
const T_SHELF = 11.25;
const FLY = [[FLY0, null], [10.5, [-26, 38, 2]], [10.9, [-52, 76, 52]], [T_SHELF, [-8, 97, 116]], [11.6, [44, 74, 72]], [11.9, [14, 58, 18]], [FLY1, POP_AT]];
function flyPos(tau, start) {
  const K = FLY.map(([tk, p]) => [tk, p || start]); let i = 0; while (i < K.length - 2 && tau >= K[i + 1][0]) i++;
  const u = clamp(prog(tau, K[i][0], K[i + 1][0])), P = k => K[clamp(k, 0, K.length - 1)][1];
  const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)], u2 = u * u, u3 = u2 * u;
  return [0, 1, 2].map(a => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * u + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * u2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * u3));
}
const flyTau = tau => lerp(FLY0, FLY1, easeInOut(prog(tau, FLY0, FLY1)));  // φρενάρει στην αρχή/τέλος
function logoState(tau) {
  if (tau >= T_POP) return null;
  const peel = M.springTo(tau, T_PEEL, 0, 1, { f: 1.7, z: 0.55, antic: 0.05 }), ang = PI / 2 * (1 - peel);
  const legs = clamp(M.springTo(tau, T_PEEL + 0.8, 0, 1, { f: 3.2, z: 0.4 })) * (1 - clamp(M.springTo(tau, T_WINGS - 0.05, 0, 1, { f: 3, z: 0.7 })));
  const H0p = T_PEEL + 1.0, H1p = T_PEEL + 1.3, hop = easeInOut(prog(tau, H0p, H1p)), hopY = Math.sin(prog(tau, H0p, H1p) * PI) * 4.5;
  const sc = M.springKeys([[0, 1], [T_BIG[0], 3.0], [T_BIG[1], 6.2], [T_WINGS - 0.05, 1.45], [FLY1, 1.35]], tau, { f: 2.3, z: 0.42 });
  const wings = clamp(M.springTo(tau, T_WINGS, 0, 1, { f: 2.6, z: 0.5 }));
  const squash = 1 - 0.13 * M.wobble(tau, H1p, 1, 5, 0.35) - 0.1 * M.wobble(tau, T_BIG[0], 1, 3, 0.4);
  const legH = 3.6 * legs;
  // στο γραφείο: κάτω άκρη δίσκου (μεντεσές → μετά το hop 9 cm μπροστά)
  const B = V.add(HINGE, [0, legH * sc + hopY, -9 * hop]);
  const ground = V.add(B, D.rot3([0, LD * sc, 0], [ang, 0, 0]));
  let c = ground, rot = [ang, 0, 0.035 * Math.sin(tau * 2.4) * legs];
  if (tau > FLY0) {
    const p = flyPos(flyTau(tau), ground), v = V.sub(flyPos(flyTau(tau + 0.03), ground), p);
    const j = tau > FLY1 ? M.shake(tau, FLY1, 1.2, { f: 16, decay: 1e9 }) : [0, 0];
    c = V.add(p, [j[0], j[1], 0]);
    rot = [0.1 * clamp(-v[1] * 0.3, -1, 1), clamp(v[0] * 0.06, -0.5, 0.5), clamp(-v[0] * 0.09, -0.55, 0.55)];
  }
  const flap = wings * (tau > T_WINGS + 0.25 ? 0.55 * Math.sin(PI * 2 * (tau < FLY1 ? 6.5 : 3) * tau) : 0);
  return { c, rot, ang, sc, squash, legs, legH, hop, wings, flap, bend: peel > 0.02 && peel < 0.98 ? Math.sin(peel * PI) * 2.2 : 0 };
}
function logoItems(tau) {
  const s = logoState(tau); if (!s) return [];
  const { c, rot, sc } = s, right = D.rot3([1, 0, 0], rot), down = D.rot3([0, -1, 0], rot), items = [];
  const disk = { t: T.logo(), w: LS * sc, h: LS * sc * s.squash, anchor: [0.5, 0.5], pos: c, rot, bend: s.bend ? (u, v) => s.bend * (1 - v) * (1 - v) : null };
  if (s.legs > 0.02) for (const sd of [-1, 1]) {
    const A = V.add(c, V.add(V.mul(right, 1.8 * sc * sd), V.mul(down, LD * sc * s.squash - 0.4 * sc)));
    const swing = 0.55 * Math.sin(s.hop * PI) * sd + 0.12 * Math.sin(tau * 9 + sd) * clamp(prog(tau, T_PEEL + 0.8, T_PEEL + 1.0)) * (tau < T_BIG[0] - 0.2 ? 1 : 0.3);
    items.push({ t: T.leg(), w: 1.1 * sc, h: s.legH * sc, anchor: [0.5, 0], pos: A, rot: [swing, rot[1], 0] });
  }
  if (s.wings > 0.02) for (const sd of [-1, 1]) {
    const A = V.add(c, V.mul(right, LS * sc * 0.43 * sd)), fold = (1 - s.wings) * 2.5 + s.flap;
    items.push({ t: T.wing(sd), w: 9 * sc * s.wings, h: 6.9 * sc * s.wings, anchor: [sd > 0 ? 0 : 1, 0.52], pos: A, rot: [rot[0], rot[1] - fold * sd, rot[2]] });
  }
  items.push(disk);
  return items;
}

// ---------- κομφετί (φυσική με αντίσταση αέρα) ----------
const CONF = (() => { const r = rng(2026), cols = [BRAND, C.mid, C.sky, C.paper, C.gold, BRAND, C.pale, C.mid]; return Array.from({ length: 220 }, (_, i) => {
  const th = r() * PI * 2, ph = Math.acos(r() * 2 - 1), sp = 60 + r() * 150, toCam = i < 4;
  const v = toCam ? [(i % 2 ? 1 : -1) * (80 + r() * 40), 40 + r() * 70, -(60 + r() * 50)] : [Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp * 0.8 + 50, Math.sin(ph) * Math.sin(th) * sp];
  return { v, w: 1.6 + r() * 1.4, h: 2.2 + r() * 1.8, col: cols[i % cols.length], w0: [(r() - 0.5) * 16, (r() - 0.5) * 16, (r() - 0.5) * 12], r0: [r() * 6, r() * 6, r() * 6], sw: r() * 6, k: 2.2 + r() * 1.2 };
}); })();
function confetti(tau) {
  const u = tau - T_POP; if (u <= 0) return [];
  const g = 220;
  return CONF.map((c, i) => {
    const e = 1 - Math.exp(-c.k * u), term = g / c.k;
    const x = POP_AT[0] + c.v[0] / c.k * e + Math.sin(u * 3 + c.sw) * 3 * e, z = POP_AT[2] + c.v[2] / c.k * e + Math.cos(u * 2.6 + c.sw) * 3 * e;
    let y = POP_AT[1] + (c.v[1] + term) / c.k * e - term * u;
    const onDesk = x > R.desk.x0 && x < R.desk.x1 && z > R.desk.z0 && z < R.desk.z1, fl = onDesk ? 0.08 + (i % 7) * 0.01 : R.floor.y + 0.1;
    let rot = [c.r0[0] + c.w0[0] * u, c.r0[1] + c.w0[1] * u, c.r0[2] + c.w0[2] * u];
    if (y <= fl) { y = fl; rot = [PI / 2, 0, c.r0[2]]; }
    const onPhone = Math.abs(x - PHONE[0]) < 7 && Math.abs(z - PHONE[2]) < 10; // να διαβάζεται το κινητό
    return { fill: c.col, alpha: onPhone && y < 2 ? 0 : 1, backFill: C.paper, w: c.w, h: c.h, anchor: [0.5, 0.5], pos: [x, y, z], rot, shadow: false };
  });
}

// ---------- Στράτος: χάρτινη κούκλα (ζωντανή υφή · ανάλυση ανάλογα με την απόσταση της κάμερας) ----------
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.3, look: 4 }],                                                   // frame 0: κοιτάει το δοκιμαστικό
  [3.4, { brows: 0.1, look: 0, eyes: 'tired', tilt: 0.06 }],                                          // «ξέρεις ακριβώς τι έρχεται» (ξέρει)
  [5.2, { brows: 0.9, eyes: 'dot', tilt: 0 }],                                                        // το λογότυπο σηκώνεται
  [7.1, { brows: 0.5 }],                                                                              // «Πιο μεγάλο» (διαβάζει deadpan)
  [8.35, { aL: 0.6, aR: 0.6, eL: -1.2, eR: -1.2, hL: 'open', hR: 'open', iL: 'stop', iR: 'stop', brows: 1.1, eyes: 'shock', lean: -0.08, tilt: 0.08 }], // «Λίγο ακόμα»: τον στριμώχνει
  [9.6, { aL: 0.12, aR: 0.12, eL: 0, eR: 0, brows: 0.6, lean: 0, tilt: 0 }],
  [10.2, { brows: 0.8 }],                                                                             // παρακολουθεί την πτήση
  [12.53, { brows: -0.4, eyes: 'happy', tilt: -0.05 }],                                               // σκάει: κλείνει τα μάτια
  [13.05, { brows: -0.35, tilt: 0 }],                                                                 // deadpan με κομφετί
  [17.35, { brows: -0.25, look: 0 }],                                                                 // μετά το «πρώτο» → βλέμμα στην κάμερα
  [17.95, { brows: 0.1 }],                                                                            // rewind
  [19.4, { brows: 0.6, tilt: 0.05 }],                                                                 // «Αν είσαι γραφίστας…»
  [20.0, { aR: 1.4, eR: -1.6, hR: 'fist', brows: 0.8, tilt: 0 }],                                     // το χέρι ανεβαίνει σε γροθιά…
  [20.42, { aR: 1.4, eR: -1.6, hR: 'thumb', brows: 0.8 }],                                            // …και πάνω 👍 στο «καταλαβαίνεις» (lint: thumb μόνο με όρθιο πήχη)
  [21.6, { aR: 0.12, eR: 0, hR: 'relaxed', brows: 0.4 }],
  [23.8, { aR: 0.35, eR: -0.2, hR: 'point', brows: 0.5 }],                                            // «ή κάν' τον tag»: δείχνει κάτω
  [LOOP_AT, { aR: 0.12, eR: 0, hR: 'relaxed', brows: 0.3, look: 4 }],                                 // πίσω στο frame 0
];
function stratosItem(cam, t, tau, pos, lookAt) {
  const P = poseSpring(POSES, t);
  if (lookAt != null) P.look = lerp(P.look, clamp((lookAt - pos[0]) * 0.35, -15, 15), 0.85);
  const rest = t > 13.0 && t < 19.4 ? 'flat' : 'smile', conf = tau >= T_POP + 0.5, drop = clamp(prog(tau, T_POP + 0.5, T_POP + 0.65));
  const pxcm = cam.F / Math.max(20, cam.toCam(V.add(pos, [0, 140, 0]))[2]), s = clamp(Math.round(pxcm * 175 / 1243 * 1.15 * 4) / 4, 0.75, 3.25);
  const cw = Math.ceil(640 * s), ch = Math.ceil(1320 * s), sy = 400 * s, PXC = 1243 * s / 175;
  const it = { w: cw / PXC, h: ch / PXC, anchor: [0.5, (sy + 878 * s) / ch], pos, clip: behindDesk(cam) };
  const w0 = ST.warn ? ST.warn.length : 0;
  it.t = D.tex('stratos', cw, ch, x => {
    stratos(x, cw / 2, sy, s, { ...P, mouth: lipsync(VO, rest), blink: blinkNow() });
    if (conf) { x.save(); x.translate(cw / 2 + 22 * s, sy + (10 - 140 - 40 * (1 - drop)) * s); x.rotate(0.5); x.scale(s, s); cut(x, rectPts(-12, -7, 24, 14), BRAND, { seed: 91, amp: 0.8, edgeW: 4 }); x.restore(); }
  }, t + ':' + s);
  // lint χεριών: οι θέσεις είναι σε px υφής → px οθόνης μέσω της κάρτας · το safe zone ελέγχεται μόνο στην οθόνη (όχι στην υφή)
  if (ST.warn) for (let k = ST.warn.length - 1; k >= w0; k--) { const w = ST.warn[k]; if (/safe zone/.test(w.msg)) { ST.warn.splice(k, 1); continue; } const q = cam.proj(D.world(it, w.x / cw, w.y / ch)); w.x = q[0]; w.y = q[1]; }
  return it;
}
const behindDesk = cam => (c, off) => { // ό,τι στέκεται πίσω από το γραφείο κρύβεται κάτω από την πίσω άκρη του
  const a = cam.proj([R.desk.x0, 0, R.desk.z1]), b = cam.proj([R.desk.x1, 0, R.desk.z1]), k = (b[1] - a[1]) / (b[0] - a[0]), y = xx => a[1] + (xx - a[0]) * k;
  c.moveTo(-2000 + off, -3000); c.lineTo(W + 2000 + off, -3000); c.lineTo(W + 2000 + off, y(W + 2000) + off); c.lineTo(-2000 + off, y(-2000) + off); c.closePath();
};

// ---------- κάμερα (πλάνα σε πραγματικό χρόνο) ----------
const H0 = { pos: [12, 50, -86], look: [-1, 4, 0], fov: 34, ap: 30 }, H1 = { pos: [9, 40, -66], look: [-2, 6, -4], fov: 34, ap: 30 };
const MED0 = { pos: [-2, 46, -88], look: [-5, 60, 84], fov: 40, ap: 22 }, MED1 = { pos: [-3, 50, -70], look: [-5, 61, 84], fov: 40, ap: 22 };
const CTA0 = { pos: [-2, 44, -122], look: [-4, 56, 84], fov: 40, ap: 20 }, CTA1 = { pos: [-3, 47, -102], look: [-4, 57, 84], fov: 40, ap: 20 };
const PH0 = { pos: V.add(PHONE, [0, 32, -8]), look: V.add(PHONE, [0, 0, 1.5]), fov: 40, ap: 26, roll: 0.42 }, PH1 = { ...PH0, pos: V.add(PHONE, [0, 28, -6.5]) };
const mixCam = (a, b, p) => ({ pos: V.lerp(a.pos, b.pos, p), look: V.lerp(a.look, b.look, p), fov: lerp(a.fov, b.fov, p), ap: lerp(a.ap, b.ap, p), roll: lerp(a.roll || 0, b.roll || 0, p), focusAt: V.lerp(a.focusAt, b.focusAt, p) });
// hook · κινητό (πλημμύρα) · Στράτος «ξέρεις» · δοκιμαστικό (ξεκολλάει) · ευρύ (μεγαλώνει) · πτήση · med (σκάει) · κινητό (το πρώτο) · close · rewind · CTA · επιστροφή
const SHOTS = [0, 1.0, 3.4, 5.0, 6.9, 9.6, 12.15, 13.9, 17.35, RW[0], RW[1], LOOP_AT];
function shot(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++; return i; }
function camAt(t, tau, lg) {
  const hand = [Math.sin(t * 1.3) * 0.35 + Math.sin(t * 2.9) * 0.15, Math.sin(t * 1.7 + 1) * 0.3, 0];   // κάμερα στο χέρι (ελάχιστα)
  const lc = lg ? lg.c : HINGE, sh = shot(t);
  let o;
  if (sh === 0) o = mixCam({ ...H0, focusAt: lc }, { ...H0, pos: V.add(H0.pos, [-0.5, -2, 4]), focusAt: lc }, easeInOut(prog(t, 0, 1.0)));
  else if (sh === 1) o = mixCam({ ...PH0, focusAt: PHONE }, { ...PH1, focusAt: PHONE }, easeInOut(prog(t, 1.0, 3.4)));
  else if (sh === 2) o = mixCam({ ...MED0, focusAt: HEAD }, { ...MED1, focusAt: HEAD }, easeInOut(prog(t, 3.4, 5.0)));
  else if (sh === 3) o = mixCam({ ...H0, focusAt: lc }, { ...H1, focusAt: lc }, easeInOut(prog(t, 5.0, 6.9)));
  else if (sh === 4) {
    const k = M.springTo(t, T_BIG[1] + 0.02, 0, 1, { f: 2, z: 0.5 }), s = M.shake(t, T_BIG[1] + 0.12, 2.2, { f: 11 });
    o = { pos: V.add(V.lerp([0, 72, -175], [0, 90, -255], k), [s[0], s[1], 0]), look: V.lerp([0, 44, 30], [0, 56, 30], k), fov: 40, ap: 16, focusAt: lc };
  } else if (sh === 5) {
    const lag = logoState(tau - 0.12), lp = lag ? lag.c : POP_AT;
    o = { pos: V.add([0, 58, -125], [lp[0] * 0.3, (lp[1] - 50) * 0.2, 0]), look: V.lerp([0, 55, 50], lp, 0.75), fov: 42, ap: 14, focusAt: lc };
  } else if (sh === 6) o = { pos: [-2, 44, -92], look: [-3, 58, 80], fov: 42, ap: 26, focusAt: V.lerp(POP_AT, HEAD, easeInOut(prog(t, T_POP + 0.05, T_POP + 0.5))) };   // rack focus: λογότυπο → Στράτος
  else if (sh === 7) o = mixCam({ ...PH0, focusAt: PHONE }, { ...PH1, focusAt: PHONE }, easeInOut(prog(t, 13.9, 17.35)));
  else if (sh === 8) o = { pos: V.lerp([-5, 66, -60], [-5, 68, -34], easeOut(prog(t, 17.35, 17.47))), look: [-6, 68, 84], fov: 32, ap: 20, focusAt: HEAD };  // snap zoom
  else if (sh === 9) o = { pos: [0, 78, -215], look: [0, 50, 45], fov: 44, ap: 12, focusAt: lc };
  else if (sh === 10) o = mixCam({ ...CTA0, focusAt: HEAD }, { ...CTA1, focusAt: HEAD }, easeInOut(prog(t, RW[1], LOOP_AT)));
  else o = mixCam({ ...CTA1, focusAt: HEAD }, { ...H0, focusAt: HINGE }, easeInOut(prog(t, 24.8, 25.45)));
  // κάμερα στο χέρι: στο frame 0 / στο τέλος μηδέν (seamless loop)
  const hk = sh === 0 ? clamp(t / 0.6) : sh === 11 ? 1 - prog(t, 24.8, 25.45) : 1;
  o.pos = V.add(o.pos, V.mul(hand, hk));
  return o;
}
const MB = t => { const sh = shot(t); return sh === 5 || sh === 9 ? 5 : sh === 11 && t > 24.75 && t < 25.5 ? 5 : (t > 8.35 && t < 8.85) || (t > T_POP - 0.02 && t < T_POP + 0.3) ? 3 : 1; };

// ---------- σκηνή ----------
const BUZZ = [[0.3, 0.35], ...CHAT.map(([tk]) => [tk, tk === 14.2 ? 0.2 : 0.3]).filter(([tk]) => tk < 4 || tk > 14), [LOOP_AT, 0.35]];
function build(t) {
  const tau = tauOf(t), lg = logoState(tau), cam = D.camera(camAt(t, tau, lg));
  const peeled = tau >= T_PEEL + 0.08;
  const mugTip = 1.5 * clamp(easeIn(prog(tau, T_BIG[1] + 0.12, T_BIG[1] + 0.4))) - (tau > T_BIG[1] + 0.4 ? 0.08 * M.wobble(tau, T_BIG[1] + 0.4, 1, 4, 0.5) : 0);
  const shelfSh = M.shake(tau, T_SHELF, 1.3, { f: 9 });
  const buzz = M.shakes(t, BUZZ, { f: 22 });
  const followX = (t > 10.0 && t < T_POP) || (t > RW[0] && t < RW[1]) ? (lg ? lg.c[0] : null) : null;
  const pushX = M.springKeys([[0, 0], [T_BIG[1] + 0.05, 40], [T_WINGS, 0]], t, { f: 2.2, z: 0.45 });
  const burstP = prog(tau, T_POP, T_POP + 0.22);
  const items = [
    { t: T.wall(), w: 420, h: 300, pos: [0, R.floor.y, R.wall.z], surface: true, lift: 0, shadow: false },
    { t: T.floor(), w: 420, h: 200, pos: [0, R.floor.y, -50], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: T.shelf(), w: 170, h: 42, pos: [-18 + shelfSh[0] * 0.5, 96 + shelfSh[1] * 0.3, R.wall.z - 0.5], rot: [0, 0, shelfSh[2] * 0.3], surface: true, lift: 5 },
    { t: T.board(), w: 55, h: 45, pos: [62, 28, R.wall.z - 0.5], surface: true, lift: 1.2 },
    { t: T.deskFront(), w: 170, h: 88, pos: [0, R.floor.y, R.desk.z0], surface: true, lift: 0, shadow: false },
    { t: T.deskTop(), w: 170, h: 90, pos: [0, 0, R.desk.z0], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: T.mat(), w: 60, h: 45, pos: [0, 0.05, -24], rot: [PI / 2, 0, 0.07], surface: true, lift: 0.1 },
    { ...SHEET, t: T.sheet(peeled) },
    { t: T.phone(chatAt(t)), w: 8.75, h: 16.5, anchor: [0.5, 0.5], pos: V.add(PHONE, [buzz[0] * 0.25, 0, buzz[1] * 0.25]), rot: [PI / 2, 0, 0.42 + buzz[2] * 0.3], surface: true, lift: 0.5 },
    { t: T.mug(), w: 10, h: 300 / 26, anchor: [0.12, 1], pos: [MUG[0] - 10 * 0.38, 0, MUG[2]], rot: [0, 0, mugTip] },
    stratosItem(cam, t, tau, V.add(ST_POS, [pushX, 0, 0]), followX),
    ...logoItems(tau), ...confetti(tau),
    burstP > 0 && burstP < 1 && { t: T.burst(), w: 26 * easeOut(burstP) + 4, h: 26 * easeOut(burstP) + 4, anchor: [0.5, 0.5], pos: POP_AT, rot: [0, 0, burstP * 0.6], alpha: 1 - easeIn(burstP), lit: false, shadow: false },
  ];
  const Lk = LIGHTS[[0, 1, 3, 4, 7, 11].includes(shot(t)) ? 'desk' : 'wall'];
  return { cam, items, R, light: Lk.light, window: Lk.window, patch: 0.9, shaft: 0.8, dust: 90, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
}

// ---------- UI: rewind sticker ----------
function rewindTag(ctx, t) {
  const p = M.springTo(t, RW[0], 0, 1, { f: 3, z: 0.45 }) * (1 - clamp(prog(t, RW[1] - 0.15, RW[1] + 0.05))); if (p <= 0.01) return;
  ctx.save(); ctx.translate(890, 560); ctx.scale(p, p); ctx.rotate(0.06);
  cut(ctx, rrPts(-86, -48, 172, 96, 22), C.navy, { seed: 97, amp: 2, edgeW: 8 });
  ctx.fillStyle = `rgba(255,255,255,${Math.floor(t * 4) % 2 ? 1 : 0.75})`;
  for (const dx of [-36, 6]) { ctx.beginPath(); ctx.moveTo(dx + 34, -26); ctx.lineTo(dx, 0); ctx.lineTo(dx + 34, 26); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
const CAPS = [[-1, HOOK1], [1.35, 'με αναποφάσιστο πελάτη σε γραφιστικό,'], [3.45, 'ξέρεις ακριβώς τι έρχεται.'], [5.1, '«Κάν\' το να ξεχωρίζει.»'], [7.1, '«Πιο μεγάλο.»'], [8.25, '«Λίγο ακόμα.»'],
  [9.6, '«Να πετάει!»'], [12.15, '«Να σκάει!»'], [14.0, 'Και τότε έρχεται το καλύτερο.'], [15.5, '«Τελικά θα προχωρήσουμε'], [16.78, 'με το πρώτο.»'],
  [19.35, 'Αν είσαι γραφίστας,'], [20.28, 'καταλαβαίνεις για τι μιλάω.'], [21.6, 'Αν δεν είσαι, στείλ\' το στον γραφίστα σου'], [23.82, 'ή κάν\' τον tag.'], [LOOP_AT, HOOK1]];

function scene(ctx, lt) {
  const t = lt;
  D.frame(ctx, t, build, { mb: MB(t) });
  captionSeq(ctx, t, CAPS);
  if (t < 5.1) seriesTag(ctx, t + 1, TAG); else if (t >= LOOP_AT) seriesTag(ctx, t - LOOP_AT + 1, TAG);
  rewindTag(ctx, t);
  if (t > 23.82 && t < LOOP_AT) ctaButton(ctx, t, 23.85, 540, 1330, '@γραφίστας');
}

module.exports = require('./render.js')({
  name: 'ep02_xexorizei', SCENES: [[scene, TOTAL]], WIPES: [], LOOP: 'cut', VO_FILE: 'vo/ep02_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/ep02.mp3',
  SFX: [
    [0.3, 'blip', { gain: 0.6, note: 'κινητό: μήνυμα' }],
    ...[1.3, 1.8, 2.3, 2.8, 3.2].map((tk, i) => [tk, 'blip', { gain: 0.45 + i * 0.05, seed: 20 + i, note: i ? '' : 'πλημμύρα μηνυμάτων' }]),
    [T_PEEL + 0.02, 'tear', { dur: 0.45, gain: 0.55, note: 'ξεκολλάει από το χαρτί' }],
    [T_PEEL + 0.8, 'pop', { gain: 0.7, note: 'ποδαράκια' }],
    [T_PEEL + 1.02, 'boing', { gain: 0.6, note: 'hop' }],
    [T_PEEL + 1.3, 'thud', { gain: 0.35, note: 'προσγείωση' }],
    [T_BIG[0], 'zoom', { gain: 0.8, note: 'πιο μεγάλο' }],
    [T_BIG[0] + 0.22, 'boing', { gain: 0.5, seed: 2 }],
    [T_BIG[1], 'zoom', { gain: 1.0, seed: 3, note: 'λίγο ακόμα' }],
    [T_BIG[1] + 0.12, 'thud', { gain: 0.9, note: 'στριμώχνει τον Στράτο' }],
    [T_BIG[1] + 0.38, 'thud', { gain: 0.5, seed: 4, note: 'πέφτει η κούπα' }],
    [T_WINGS - 0.05, 'swoosh', { gain: 0.8, note: 'ξεφουσκώνει' }],
    [T_WINGS + 0.1, 'slide', { dur: 0.3, gain: 0.5, note: 'φτερά origami' }],
    [FLY0, 'air', { dur: FLY1 - FLY0, gain: 0.6, note: 'πτήση' }],
    [10.7, 'whoosh', { gain: 0.5, seed: 11 }],
    [T_SHELF, 'thud', { gain: 0.45, seed: 5, note: 'χτυπάει στο ράφι' }],
    [11.7, 'whoosh', { gain: 0.5, seed: 12 }],
    [T_POP, 'pop', { gain: 1.5, seed: 9, note: 'ΣΚΑΕΙ' }],
    [T_POP + 0.04, 'shimmer', { gain: 0.8, note: 'κομφετί' }],
    [14.2, 'blip', { gain: 0.5, seed: 2, note: 'κινητό: γράφει…' }],
    [15.6, 'blip', { gain: 0.6, seed: 3, note: '«Τελικά…»' }],
    [16.1, 'blip', { gain: 0.6, seed: 8, note: '«θα προχωρήσουμε»' }],
    [16.85, 'blip', { gain: 0.85, seed: 6, note: '«με το πρώτο.»' }],
    [RW[0], 'ticks', { count: 12, rise: 1, gain: 0.5, note: 'rewind' }],
    [RW[0], 'whoosh', { dur: RW[1] - RW[0], gain: 0.6, seed: 13 }],
    [RW[1] - 0.03, 'stamp', { gain: 0.8, note: 'κλακ: ξανά στη θέση του' }],
    [20.35, 'swoosh', { gain: 0.5, seed: 7, note: '👍' }],
    [23.85, 'click', { gain: 0.6, note: 'tag' }],
    [LOOP_AT, 'blip', { gain: 0.6, seed: 4, note: '«Καλησπέρα!» (loop)' }],
  ],
});
