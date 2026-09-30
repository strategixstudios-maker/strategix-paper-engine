// «Πώς φτιάχνεται;» — Αυτοκόλλητα βινυλίου με περιγραμμική κοπή · host: Στράτος (χέρι · στο τέλος στην κάμερα) · VO ElevenLabs «Stratos» + μουσική + SFX · seamless loop (LOOP: 'cut')
// Σενάριο του Αλέξανδρου (ολόκληρο): εκτύπωση σε αυτοκόλλητο βινύλιο (χρώματα που δεν ξεθωριάζουν στον ήλιο) → πλαστικοποίηση (γρατζουνιές, εξωτερικές συνθήκες) →
// κοπτικό: ο αισθητήρας διαβάζει τα μαύρα σημάδια (crop marks) → κόβει ακριβώς στο σχήμα του λογοτύπου → αυτοκίνητο / βιτρίνα / laptop / συσκευασία → νερό, ήλιος, τριβή → CTA.
// Hook: μακροπλάνο: το χέρι ξεκολλάει το αυτοκόλλητο → «πλατς» στο laptop → ◀◀ rewind → ο εκτυπωτής. Τέλος: η κάμερα γυρίζει στο φύλλο = frame 0.
// Look: diorama.js (§1d, 2ο επεισόδιο) · εκτυπωτής ρολού: κεφαλή μόνο στο X, βινύλιο στο Y · κοπτικό: μαχαίρι στο X, φύλλο στο Y (§7).
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, txt, captionSeq, clamp, lerp, prog, easeIn, easeOut, easeInOut, rng, mixHex } = L;
const M = require('./motion.js');
const D = require('./diorama.js'), { V } = D;
const { poseSpring } = require('./stratos.js');
const { BRAND, seriesTag, stamp, stepChip, checkChip, ctaButton, reach, rewindTag, INK, METAL, printerFront, contour, contourAt,
  mixCam, handCam, ROOM, roomItems, roomTex, behindDesk, stratosItem, mug } = require('./props.js');

// VO = vo/pf06_vo.mp3 @ 0,2s — `node vo.js pf06 --tempo 1.12` take 1 (seed 1000, κείμενο vo/pf06.txt = σενάριο του Αλέξανδρου · «laptop» λατινικά → «λάπτοπ»)
// · μεταγραφή Scribe ✔ (0 λέξεις εκτός κειμένου) · παύσεις → 0,3s (--gap 0.3) · 28,98s. Λέξεις: vo/pf06_vo.words.json → T.
// 0,27 Έλα να δεις πώς φτιάχνουμε αυτοκόλλητα με περιγραμμική κοπή. | 2,87 Πρώτα εκτυπώνουμε το σχέδιό σου σε αυτοκόλλητο βινύλιο. | 5,47 Με χρώματα που δεν ξεθωριάζουν στον ήλιο.
// | 7,63 Πλαστικοποιούμε, (8,53) για αντοχή σε γρατζουνιές και εξωτερικές συνθήκες. | 10,93 Μετά μπαίνει στον κοπτικό. | 12,33 Το μηχάνημα διαβάζει τα μαύρα σημάδια, (14,27) και ξέρει ΑΚΡΙΒΩΣ πού πρέπει να κόψει.
// | 16,50 Και έτσι κόβεται ακριβώς στο σχήμα του λογοτύπου σου. | 19,03 Το αποτέλεσμα; | 20,10 Αυτοκόλλητο που κολλάει σε αυτοκίνητα, βιτρίνες, (22,63) laptop, συσκευασίες.
// | 24,20 Και αντέχει σε νερό, (25,23) ήλιο και τριβή. | 26,47 Παράγγειλε τα δικά σου, (27,63) και ακολούθησέ μας για περισσότερα. (–28,97)
const T = { ela: 0.26, autok: 1.10, perig: 1.73, prota: 2.81, ektyp: 3.08, sxed: 3.61, vinyl: 4.25, xrom: 5.35, xeth: 6.32, ilio: 7.07, plast: 7.58,
  antoxi: 8.64, gratz: 9.01, exot: 9.59, meta: 10.82, kopt: 11.59, mixan: 12.22, diav: 12.82, mayra: 13.33, simad: 13.62, kserei: 14.36, akrib: 14.71,
  kopsei: 15.86, etsi: 16.47, kovetai: 16.73, sxima: 17.79, apot: 19.04, autok2: 20.10, aytok: 21.19, vitr: 21.92, laptop: 22.73, syskev: 23.21,
  antexei: 24.34, nero: 24.71, ilios: 25.30, trivi: 25.85, parag: 26.66, akol: 27.68, end: 28.98 };
const TAG = 'Πώς φτιάχνεται;', HOOK1 = 'Έλα να δεις πώς φτιάχνουμε';
const TOTAL = 29.75, LOOP_AT = 29.0, BACK = [28.98, 29.62], PI = Math.PI;
const SC = [0, 2.6, 7.45, 10.72, 18.95, TOTAL];                       // σκηνές (torn-paper wipe ανάμεσα): hook · εκτύπωση · πλαστικοποίηση · κοπή · αποτέλεσμα + CTA
const SHOTS = [[0, 'hook'], [2.6, 'print'], [3.95, 'printC'], [5.25, 'sun'], [7.45, 'lam'], [8.95, 'lamT'], [10.72, 'feed'], [12.2, 'sense'], [16.35, 'cut'],
  [18.95, 'peel'], [21.05, 'car'], [21.85, 'win'], [22.62, 'lap'], [23.12, 'box'], [24.1, 'endure'], [26.45, 'cta']];
const shotAt = t => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return SHOTS[i][1]; };
const kf = (t, K, e = easeInOut) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const a = K[i - 1][1], b = K[i][1], u = e(prog(t, K[i - 1][0], K[i][0])); return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u); } return K[K.length - 1][1]; };

// ---------- το σχέδιο: λογότυπο KOSTAS COFFEE για die-cut (δίσκος + ατμός + κορδέλα → ακανόνιστο περίγραμμα) · ART 600×600 = 10 cm ----------
const BROWN = '#7A3E1D', CREAM = '#F5E6C8', LINER = METAL.liner;
const ART = L.createCanvas(600, 600);
(() => {
  const x = ART.getContext('2d'); x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = BROWN; x.lineWidth = 30;                                                    // ατμός
  for (const [sx, k] of [[-62, -1], [0, 1], [62, -1]]) { x.beginPath(); x.moveTo(300 + sx, 170); x.bezierCurveTo(300 + sx + 38 * k, 128, 300 + sx - 38 * k, 92, 300 + sx + 8 * k, 44); x.stroke(); }
  x.fillStyle = BROWN; x.beginPath(); x.arc(300, 300, 165, 0, 7); x.fill();                   // δίσκος
  x.strokeStyle = CREAM; x.lineWidth = 8; x.beginPath(); x.arc(300, 300, 146, 0, 7); x.stroke();
  x.save(); x.translate(300, 262); x.scale(1.25, 1.25); x.fillStyle = CREAM; x.strokeStyle = CREAM;  // κούπα (όπως στο kostasLogo)
  x.beginPath(); x.moveTo(-62, -52); x.lineTo(62, -52); x.lineTo(50, 30); x.quadraticCurveTo(0, 46, -50, 30); x.closePath(); x.fill();
  x.lineWidth = 14; x.beginPath(); x.arc(70, -18, 24, -1.3, 1.3); x.stroke(); x.restore();
  const rb = [[40, 372], [98, 372], [98, 356], [502, 356], [502, 372], [560, 372], [534, 410], [560, 448], [98, 448], [40, 448], [66, 410]]; // κορδέλα με εγκοπές
  x.fillStyle = BRAND; x.beginPath(); rb.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill();
  x.fillStyle = CREAM; x.font = '46px Brand'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KOSTAS COFFEE', 300, 404);
})();
const CONT = contour(ART, { pad: 18, cx: 300, cy: 300, rMax: 299 });   // περίγραμμα κοπής (λευκό περιθώριο 18px ≈ 3 mm)

// γυαλάδα πλαστικοποίησης: διαγώνια λωρίδα φωτός (at 0..1 κατά μήκος) μόνο πάνω σε ό,τι υπάρχει ήδη στην υφή
function sheen(x, w, h, at, a = 0.5) {
  x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(255,255,255,${a * 0.12})`; x.fillRect(0, 0, w, h);
  const bw = Math.max(w, h) * 0.16; x.translate(lerp(-0.2, 1.2, at) * w, h / 2); x.rotate(0.55);
  const g = x.createLinearGradient(-bw, 0, bw, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(-bw, -2 * Math.max(w, h), 2 * bw, 4 * Math.max(w, h)); x.restore();
}
// αυτοκόλλητο σε συντεταγμένες ART · o.die: λευκό περιθώριο (κομμένο) · o.ink 0..1 · o.dash 0..1 (διακεκομμένο περίγραμμα: «ξέρει πού θα κόψει») · o.cut 0..1 (γραμμή κοπής)
function stickerDraw(x, o = {}) {
  if (o.die) { L.path(x, CONT.pts); x.fillStyle = '#FFFFFF'; x.fill(); x.strokeStyle = 'rgba(16,26,51,0.16)'; x.lineWidth = 3; x.stroke(); }
  if ((o.ink ?? 1) > 0) { x.save(); x.globalAlpha = o.ink ?? 1; x.drawImage(ART, 0, 0); x.restore(); }
  if (o.dash > 0) { x.save(); x.globalAlpha = clamp(o.dash * 1.5) * (o.cut > 0 ? 0.45 : 1); x.setLineDash([20, 14]); x.lineDashOffset = -ST.T * 60; L.path(x, CONT.pts); x.strokeStyle = BRAND; x.lineWidth = 7; x.stroke(); x.restore(); }
  if (o.cut > 0) {
    const [px, py, i] = contourAt(CONT, o.cut), P = [...CONT.pts.slice(0, i), [px, py]];
    for (const [dx, col, lw] of [[3, 'rgba(255,255,255,0.95)', 4], [0, 'rgba(16,26,51,0.75)', 6]]) {
      x.beginPath(); P.forEach(([a, b], k) => k ? x.lineTo(a + dx, b + dx) : x.moveTo(a + dx, b + dx)); if (o.cut >= 1) x.closePath(); x.strokeStyle = col; x.lineWidth = lw; x.stroke();
    }
  }
}

// ---------- φύλλο αυτοκόλλητων 24×34 cm: 6 λογότυπα (10 cm) + 4 crop marks ----------
const SW = 24, SHH = 34, SPX = 40, SL = [[6.5, 7.5], [17.5, 7.5], [6.5, 17.5], [17.5, 17.5], [6.5, 27.5], [17.5, 27.5]], HERO = 5;
const MK = [[1.1, 32.9], [22.9, 32.9], [22.9, 1.1], [1.1, 1.1]];            // με τη σειρά που τα διαβάζει ο αισθητήρας (τα πάνω τελευταία: το φύλλο μένει μπροστά από τη ράγα)
// s = { cut: [0..1 ×6] | 1, dash: [..] , hole: index (το αυτοκόλλητο λείπει → φαίνεται το χαρτί-φορέας), gloss: θέση γυαλάδας | null, ink }
function sheetTex(s = {}) {
  return D.tex('sheet', SW * SPX, SHH * SPX, (x, w, h) => {
    cut(x, rectPts(4, 4, w - 8, h - 8), '#FFFFFF', { seed: 301, amp: 1.2, edgeW: 3, shadow: false });
    x.fillStyle = INK.K; for (const [mx, my] of MK) x.fillRect((mx - 0.35) * SPX, (my - 0.35) * SPX, 0.7 * SPX, 0.7 * SPX);
    SL.forEach(([sx, sy], i) => {
      x.save(); x.translate(sx * SPX, sy * SPX); x.scale(SPX / 60, SPX / 60); x.translate(-300, -300);
      if (s.hole === i) { L.path(x, CONT.pts); x.fillStyle = LINER; x.fill(); x.strokeStyle = 'rgba(16,26,51,0.35)'; x.lineWidth = 4; x.stroke(); }
      else stickerDraw(x, { ink: s.ink, dash: s.dash ? s.dash[i] : 0, cut: s.cut === 1 ? 1 : s.cut ? s.cut[i] : 0 });
      x.restore();
    });
    if (s.gloss != null) sheen(x, w, h, s.gloss, 0.45);
  }, JSON.stringify(s) + (s.dash ? ':' + ST.FRAME : ''));
}
const heroTex = () => D.tex('hero', 800, 800, x => { x.scale(4 / 3, 4 / 3); stickerDraw(x, { die: true }); L.path(x, CONT.pts); x.clip(); sheen(x, 600, 600, 0.32, 0.4); }, 0);
// χέρι του Στράτου (reach: ο πήχης μπαίνει από κάτω, άκρη δαχτύλου στο (150, 40) × 3) · 42 × 61 cm
const handTex = () => D.tex('hand', 900, 720, x => { x.scale(3, 3); reach(x, 150, 40, 0, 1, { hand: 'point' }); });
const handItem = (tip, rot) => ({ t: handTex(), w: 42, h: 33.6, anchor: [0.5, 120 / 720], pos: tip, rot, zBias: 8, dofAt: [0.5, 0.3] });

// ---------- ΓΡΑΦΕΙΟ (hook · ήλιος · αποτέλεσμα · CTA): σκηνικό του ep02 ----------
const R0 = ROOM;
const SHEET = { w: SW, h: SHH, pos: [-8, 0.12, -24], rot: [PI / 2, 0, 0.1], surface: true, lift: 0.12 };
const sheetPt = (sx, sy, it = SHEET) => D.world(it, sx / SW, sy / SHH);
const HERO_C = sheetPt(...SL[HERO]);
const heroFlat = { w: 10, h: 10, anchor: [0.5, 0.5], pos: V.add(HERO_C, [0, 0.03, 0]), rot: SHEET.rot };
// laptop (κλειστό καπάκι προς την κάμερα: η οθόνη κοιτάει τον τοίχο) · ry γυρισμένο προς την κάμερα
const LAP = { base: { w: 32, h: 22, pos: [40, 0.6, 2], rot: [PI / 2, -0.55, 0] } };
LAP.hinge = D.world(LAP.base, 0.5, 0);
LAP.lid = { w: 32, h: 21, anchor: [0.5, 1], pos: LAP.hinge, rot: [-0.28, -0.55, 0] };
LAP.c = D.world(LAP.lid, 0.5, 0.5); LAP.n = V.norm(D.rot3([0, 0, -1], LAP.lid.rot));
const LIGHT0 = { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } };
const TXL = {
  lapBase: () => D.tex('lapBase', 640, 440, (x, w, h) => { cut(x, rrPts(6, 6, w - 12, h - 12, 26), '#5A6A92', { seed: 401, amp: 1.5, edgeW: 5, shadow: false }); x.fillStyle = 'rgba(11,27,63,0.35)'; for (let j = 0; j < 5; j++) for (let i = 0; i < 12; i++) x.fillRect(60 + i * 44, 60 + j * 44, 36, 36); x.fillRect(230, 300, 180, 110); }, 0),
  lapLid: () => D.tex('lapLid', 640, 420, (x, w, h) => { cut(x, rrPts(6, 6, w - 12, h - 12, 26), '#5A6A92', { seed: 402, amp: 1.5, edgeW: 5, shadow: false, scribble: '#6474A0' }); }, 0),
  mug: () => D.tex('mug', 260, 300, x => mug(x, 118, 190, 1.15, ST.T, true)),
};
function lapItems(stuck) {
  return [{ ...LAP.base, t: TXL.lapBase(), surface: true, lift: 0.6 }, { ...LAP.lid, t: TXL.lapLid() },
    stuck && { t: heroTex(), w: 10 * stuck.k, h: 10 * stuck.k * (stuck.sq || 1), anchor: [0.5, 0.5], pos: V.add(stuck.p || V.add(LAP.c, [0, 1.5, 0]), V.mul(LAP.n, 0.15 + (stuck.z || 0))), rot: [LAP.lid.rot[0], LAP.lid.rot[1], (stuck.rz || 0) - 0.08], shadow: true, zBias: 20 }];
}
// ξεκόλλημα με το χέρι: pp 0..1 (το μέτωπο προχωράει από δεξιά προς τα αριστερά, το κομμάτι που σηκώθηκε καμπυλώνει) → items αυτοκόλλητου + χεριού
const HAND_ROT = [PI / 2 + 0.5, -1.6, 0];
function peelItems(pp, handIn, lift = 0) {
  const f = 1.02 - pp * 1.15, bend = (u, v) => Math.pow(Math.max(0, u - f), 1.35) * 8.5 + lift * u * 6;
  const hero = { ...heroFlat, t: heroTex(), bend: pp > 0 || lift > 0 ? bend : null, pos: V.add(heroFlat.pos, [0, lift * 4, 0]) };
  const edge = D.world(hero, 0.95, 0.52), from = V.add(edge, [26, 20, -30]);
  return [hero, handIn > 0.001 && handItem(V.lerp(from, edge, handIn), HAND_ROT)];
}
// «πλατς»: το αυτοκόλλητο έρχεται από την κάμερα και κολλάει · s = {k (κλίμακα), p (σημείο), z (cm μπροστά)} στο χρόνο u από το t0
function slap(t, t0) {
  const a = clamp(prog(t, t0 - 0.14, t0)), fly = 1 - easeIn(a), wob = t > t0 ? M.wobble(t, t0, 1, 6, 0.35) : 0;
  return { k: 1 + fly * 0.9 + wob * 0.06, sq: 1 - wob * 0.08, z: fly * 14, rz: fly * 0.5, on: t >= t0 - 0.14 };
}

// ---------- ΕΚΤΥΠΩΤΗΣ (πρόσοψη του pf05 ως χάρτινη μακέτα) ----------
const RP = { floor: { y: -88 }, wall: { z: 110 } }, PZ = 30, PPX = 1080 / 150;       // printerFront σε υφή 1080×1180 (y 520..1700 του σχεδίου) = 150 cm
const P_BOT = -88 - (1700 - 1676) / PPX, SLOT_Y = P_BOT + (1700 - 801) / PPX, TOP_Y = P_BOT + (1700 - 560) / PPX;
const PR = { t0: 2.62, per: 0.3, band: 2.8 };                                        // πέρασμα κεφαλής (s) · προώθηση βινυλίου ανά πέρασμα (cm)
const printPos = t => { const u = (t - PR.t0) / PR.per; if (u < 0) return { car: 260, P: 26 }; const k = Math.floor(u), f = u - k, dir = k % 2 ? -1 : 1;
  return { car: lerp(dir > 0 ? 260 : 820, dir > 0 ? 820 : 260, easeInOut(clamp(f / 0.82))), P: 26 + (k + easeInOut(clamp((f - 0.82) / 0.18))) * PR.band }; };
const STRIP = { w: 97, h: 62, px: 20 };                                                   // βινύλιο που βγαίνει από τη σχισμή (cm) · px/cm
const SHEETS_X = [-37.5, -12, 13.5].map(x => x - 12);                                    // 3 φύλλα (24 cm) δίπλα-δίπλα στο ρολό · αριστερή άκρη κάθε φύλλου (cm από το κέντρο)
function stripTex(P) {
  return D.tex('strip', STRIP.w * STRIP.px, STRIP.h * STRIP.px, (x, w, h) => {
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, 'rgba(11,27,63,0.25)'); g.addColorStop(1, 'rgba(11,27,63,0)');
    x.save(); x.beginPath(); x.rect(0, 0, w, h); x.clip();
    for (const sx0 of SHEETS_X) {                                                      // περιεχόμενο: y βινυλίου = P − y φύλλου (ό,τι έχει τυπωθεί βγαίνει από τη σχισμή)
      const X0 = (sx0 + STRIP.w / 2) * STRIP.px;
      x.fillStyle = INK.K; for (const [mx, my] of MK) { const yy = (P - (SHH - my)) * STRIP.px; if (yy > 0) x.fillRect(X0 + (mx - 0.35) * STRIP.px, yy - 0.35 * STRIP.px, 0.7 * STRIP.px, 0.7 * STRIP.px); }
      for (const [sx, sy] of SL) { const yy = (P - (SHH - sy)) * STRIP.px; if (yy < -6 * STRIP.px || yy > h + 6 * STRIP.px) continue;
        x.save(); x.translate(X0 + sx * STRIP.px, yy); x.scale(STRIP.px / 60, STRIP.px / 60); x.translate(-300, -300); x.drawImage(ART, 0, 0); x.restore(); }
    }
    x.fillStyle = g; x.fillRect(0, 0, w, 90); x.restore();
  }, P.toFixed(2));
}
function printerItems(t) {
  const { car, P } = printPos(t);
  const front = D.tex('printer', 1080, 1180, x => { x.translate(0, -520); printerFront(x, t, { car }); }, Math.round(car) + ':' + ST.B);
  return [
    { t: roomTex.wall(), w: 420, h: 300, pos: [0, RP.floor.y, RP.wall.z], surface: true, lift: 0, shadow: false },
    { t: roomTex.floor(), w: 420, h: 260, pos: [0, RP.floor.y, -120], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: roomTex.shelf(), w: 170, h: 42, pos: [30, 70, RP.wall.z - 0.5], surface: true, lift: 5 },
    { fill: '#CBD3E1', w: 132, h: 34, anchor: [0.5, 1], pos: [0, TOP_Y - 0.4, PZ], rot: [PI / 2, 0, 0] },                    // πάνω καπάκι (βάθος)
    { t: front, w: 150, h: 1180 / PPX, pos: [0, P_BOT, PZ] },
    { t: stripTex(P), w: STRIP.w, h: STRIP.h, anchor: [0.5, 0], pos: [0, SLOT_Y, PZ - 1.2], bend: (u, v) => v * v * 16, shadow: true },
  ];
}

// ---------- ΠΛΑΣΤΙΚΟΠΟΙΗΤΗΣ (ψυχρή πλαστικοποίηση: διάφανο φιλμ από πάνω, το φύλλο βγαίνει γυαλιστερό προς την κάμερα) ----------
const LZ = 14;                                                                            // πρόσοψη μηχανήματος (z) · η σχισμή στο γραφείο
const LW = 60, lamTex = () => D.tex('laminator', 900, 520, (x, w, h) => {
  cut(x, rrPts(120, 40, 660, 80, 40), '#DCE7FA', { seed: 501, amp: 1.5, edgeW: 5, shadow: false });                                   // ρολό διάφανου φιλμ
  x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(140, 58, 620, 10); x.fillStyle = 'rgba(30,58,138,0.18)'; x.fillRect(140, 96, 620, 10);
  cut(x, rrPts(90, 60, 40, 60, 12), METAL.dark, { seed: 502, amp: 1, edgeW: 4, shadow: false }); cut(x, rrPts(770, 60, 40, 60, 12), METAL.dark, { seed: 503, amp: 1, edgeW: 4, shadow: false });
  cut(x, rrPts(20, 130, 860, 370, 36), C.navy, { seed: 504, amp: 2, edgeW: 7, shadow: false, scribble: '#15285A' });                     // σώμα
  cut(x, rrPts(90, 400, 720, 70, 20), '#22304F', { seed: 505, amp: 1, edgeW: 5, shadow: false });                                     // σχισμή
  for (const [yy, col] of [[410, METAL.steel], [436, METAL.dark]]) cut(x, rrPts(100, yy, 700, 22, 11), col, { seed: 506 + yy, amp: 0.8, edgeW: 0, shadow: false }); // κύλινδροι
  cut(x, rrPts(700, 180, 120, 150, 18), '#1E3A8A', { seed: 508, amp: 1, edgeW: 5, shadow: false });                                   // πάνελ
  for (let i = 0; i < 3; i++) { x.fillStyle = i ? C.paper : '#7EE0A0'; x.beginPath(); x.arc(730 + i * 30, 215, 10, 0, 7); x.fill(); }
  x.fillStyle = '#8FB0EE'; x.fillRect(724, 250, 72, 50);
}, 0);
const lamOut = t => clamp(easeInOut(prog(t, 7.5, 8.85))) * (SHH + 1);                  // πόσο έχει βγει το φύλλο (cm)
function lamItems(t) {
  const out = lamOut(t), near = LZ - 1.5 - out;
  const sheet = { t: sheetTex({ gloss: clamp(0.15 + (t - 7.5) * 0.25, 0, 1.2) }), w: SW, h: SHH, pos: [-2, 0.15, near], rot: [PI / 2, 0, 0], surface: true, lift: 0.1 };
  return [...roomItems(R0, { shelf: [-18, 96] }), sheet,
    { t: lamTex(), w: LW, h: LW * 520 / 900, pos: [0, -0.5, LZ] },
    { fill: METAL.body, w: LW * 0.95, h: 22, anchor: [0.5, 1], pos: [0, LW * 450 / 900 - 0.5, LZ], rot: [PI / 2, 0, 0] }];
}
// κλειδί που γρατζουνάει (τεστ πλαστικοποίησης)
const keyTex = () => D.tex('key', 420, 160, x => {
  cut(x, circlePts(80, 80, 62), METAL.steel, { seed: 511, amp: 1.5, edgeW: 5, shadow: false }); x.fillStyle = '#22304F'; x.beginPath(); x.arc(58, 80, 16, 0, 7); x.fill();
  cut(x, [[132, 58], [400, 58], [400, 84], [372, 84], [362, 100], [340, 84], [318, 104], [300, 84], [276, 102], [256, 84], [132, 102]], METAL.light, { seed: 512, amp: 1, edgeW: 4, shadow: false });
}, 0);

// ---------- ΚΟΠΤΙΚΟ (plotter: μαχαίρι + αισθητήρας στο καρότσι · το φύλλο πάει μπρος-πίσω στο Y) ----------
const RC = { desk: { y: 14, x0: -60, x1: 60, z0: -22, z1: 30 }, wall: { z: 110 }, floor: { y: -74 } };
const ZS = 2.6, BEAM_Z = 4.4;                                                              // γραμμή μαχαιριού/αισθητήρα (z) · πρόσοψη ράγας
const toWorldC = (sx, sy, zN) => [-12 + sx, RC.desk.y + 0.06, zN + (SHH - sy)];         // σημείο φύλλου (cm) → κόσμος · zN = z της κοντινής άκρης
const artToSheet = (k, p) => [SL[k][0] + (p[0] - 300) / 60, SL[k][1] + (p[1] - 300) / 60];
const CUTK = 5;                                                                           // το αυτοκόλλητο που κόβεται στο μακροπλάνο
const markAt = i => ({ x: -12 + MK[i][0], zN: ZS - (SHH - MK[i][1]) });
const MARK_T = [12.75, 13.22, 13.72, 14.18];                                             // ο αισθητήρας φτάνει σε κάθε σημάδι
const CUT0 = 16.5, CUT1 = 18.75;
function cutterState(t) {
  const start = artToSheet(CUTK, CONT.pts[0]);
  const K = [[10.72, [0, -36]], [11.45, [0, ZS - 30]], [12.35, [0, ZS - 30]]];           // [x καροτσιού, z κοντινής άκρης φύλλου]
  MARK_T.forEach((tm, i) => { const m = markAt(i); K.push([tm - 0.02, [m.x, m.zN]], [tm + 0.14, [m.x, m.zN]]); });
  K.push([15.2, [markAt(3).x, markAt(3).zN]], [16.2, [-12 + start[0], ZS - (SHH - start[1])]]);
  let [x, zN] = kf(t, K);
  const p = easeInOut(clamp(prog(t, CUT0, CUT1)));                                  // μαχαίρι: επιτάχυνση → σταθερή ταχύτητα → φρενάρισμα
  if (t >= CUT0) { const [px, py] = contourAt(CONT, p), q = artToSheet(CUTK, [px, py]); x = -12 + q[0]; zN = ZS - (SHH - q[1]); }
  if (t > CUT1 + 0.05) { const e = easeInOut(prog(t, CUT1 + 0.05, CUT1 + 0.5)); x = lerp(x, 45, e); }
  const dash = SL.map((_, i) => clamp(prog(t, T.akrib + i * 0.06, T.akrib + i * 0.06 + 0.25)));
  const cutP = SL.map((_, i) => i === CUTK ? p : 0);
  return { x, zN, dash, cutP, p, led: clamp(prog(t, 12.3, 12.45)) * (1 - clamp(prog(t, 15.6, 15.9))), clamp: clamp(prog(t, 11.55, 11.7)) };
}
const cutTex = {
  body: () => D.tex('cutBody', 1200, 150, (x, w, h) => {
    cut(x, rrPts(6, 6, w - 12, h - 12, 20), C.navy, { seed: 601, amp: 1.5, edgeW: 5, shadow: false, scribble: '#15285A' });
    cut(x, rrPts(930, 30, 220, 90, 14), '#1E3A8A', { seed: 602, amp: 1, edgeW: 4, shadow: false }); x.fillStyle = '#8FB0EE'; x.fillRect(950, 50, 90, 50);
    for (let i = 0; i < 3; i++) { x.fillStyle = i ? C.paper : '#7EE0A0'; x.beginPath(); x.arc(1070 + i * 26, 75, 9, 0, 7); x.fill(); }
  }, 0),
  bed: () => D.tex('cutBed', 1200, 520, (x, w, h) => {
    x.fillStyle = '#3A4A70'; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#34436A', 57);
    const yS = (RC.desk.z1 - ZS) / 52 * h; x.fillStyle = '#26345A'; x.fillRect(0, yS - 5, w, 10);                             // cutting strip κάτω από το μαχαίρι
    x.fillStyle = '#5A6A92'; for (const xx of [60, 1110]) for (let y = 10; y < h; y += 26) x.fillRect(xx, y, 30, 16);          // grit rollers
  }, 0),
  beam: () => D.tex('beam', 1300, 130, (x, w, h) => {
    cut(x, rrPts(4, 4, w - 8, h - 8, 26), METAL.body, { seed: 611, amp: 1.5, edgeW: 5, shadow: false, scribble: '#DCE2EC' });
    x.fillStyle = METAL.steel; x.fillRect(20, 40, w - 40, 14); x.fillStyle = 'rgba(11,27,63,0.25)'; x.fillRect(20, 54, w - 40, 5);
  }, 0),
  car: led => D.tex('carriage', 180, 240, (x, w, h) => {
    cut(x, rrPts(8, 6, w - 16, 150, 22), C.navy, { seed: 621, amp: 1, edgeW: 5, shadow: false });
    cut(x, rrPts(64, 140, 52, 80, 14), METAL.light, { seed: 622, amp: 0.8, edgeW: 4, shadow: false });                          // θήκη μαχαιριού
    x.fillStyle = METAL.dark; x.beginPath(); x.moveTo(82, 218); x.lineTo(98, 218); x.lineTo(90, 236); x.closePath(); x.fill();     // μύτη μαχαιριού
    x.fillStyle = led > 0 ? mixHex('#5A1020', '#FF3040', led) : '#5A1020'; x.beginPath(); x.arc(136, 128, 11, 0, 7); x.fill();    // αισθητήρας (LED)
    x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(22, 20, 136, 8);
  }, led.toFixed(2)),
  roller: () => D.tex('pinch', 120, 60, x => cut(x, rrPts(4, 4, 112, 52, 24), '#F2F4F8', { seed: 631, amp: 1, edgeW: 4, shadow: false }), 0),
  led: () => D.tex('led', 128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(255,90,90,1)'); g.addColorStop(0.25, 'rgba(255,40,60,0.8)'); g.addColorStop(1, 'rgba(255,30,60,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 0),
};
function cutterItems(t, s) {
  const d = RC.desk;
  const sheet = { t: sheetTex({ gloss: 0.5, dash: s.dash, cut: s.cutP }), w: SW, h: SHH, pos: [0, d.y + 0.06, s.zN], rot: [PI / 2, 0, 0], surface: true, lift: 0.06 };
  const ry = lerp(0.6, 0, s.clamp);
  return [
    { t: roomTex.wall(), w: 420, h: 300, pos: [0, RC.floor.y, RC.wall.z], surface: true, lift: 0, shadow: false },
    { t: roomTex.floor(), w: 420, h: 260, pos: [0, RC.floor.y, -140], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    { t: roomTex.shelf(), w: 170, h: 42, pos: [-30, 60, RC.wall.z - 0.5], surface: true, lift: 5 },
    { t: cutTex.bed(), w: 120, h: 52, pos: [0, d.y, d.z0], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    sheet,
    { t: cutTex.body(), w: 120, h: 15, pos: [0, d.y - 15, d.z0] },
    { t: cutTex.beam(), w: 130, h: 13, pos: [0, d.y + 0.7, BEAM_Z] },
    { fill: C.navy, w: 126, h: 18, anchor: [0.5, 1], pos: [0, d.y + 13.6, BEAM_Z], rot: [PI / 2, 0, 0] },
    ...[-10.6, 10.6].map(px => ({ t: cutTex.roller(), w: 3, h: 1.5, anchor: [0.5, 1], pos: [px, d.y + 0.06 + ry * 2, BEAM_Z - 0.3] })),
    { t: cutTex.car(s.led), w: 9, h: 12, anchor: [0.5, 1], pos: [s.x, d.y + 0.08, ZS + 0.5], zBias: 25, dofAt: [0.5, 0.95] },
    s.led > 0.01 && { t: cutTex.led(), w: 3.2, h: 3.2, anchor: [0.5, 0.5], pos: [s.x + 2.6, d.y + 0.1, ZS - 0.2], rot: [PI / 2, 0, 0], lit: false, shadow: false, alpha: s.led, zBias: 30 },
  ];
}

// ---------- ΑΥΤΟΚΙΝΗΤΟ · ΒΙΤΡΙΝΑ · ΚΟΥΤΙ (το αυτοκόλλητο κολλάει) ----------
const ROUT = { floor: { y: 0 }, wall: { z: 260 } };
const outTex = {
  street: () => D.tex('street', 1260, 900, (x, w, h) => { x.fillStyle = '#E4DCCB'; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#D8CFBB', 17);
    for (let i = 0; i < 5; i++) cut(x, rrPts(60 + i * 250, 140, 170, 300, 12), '#8FB0EE', { seed: 701 + i, amp: 1.5, edgeW: 6, shadow: false });
    x.fillStyle = '#B9AE98'; x.fillRect(0, h - 60, w, 60); }, 0),
  ground: () => D.tex('ground', 1260, 600, (x, w, h) => { x.fillStyle = '#3A4A70'; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#34436A', 21); x.fillStyle = C.paper; for (let i = 0; i < 6; i++) x.fillRect(40 + i * 220, 300, 120, 14); }, 0),
  car: () => D.tex('car', 1600, 800, (x, w, h) => {
    const body = [[70, 560], [80, 440], [170, 392], [430, 372], [590, 212], [660, 180], [1060, 180], [1200, 300], [1460, 340], [1530, 420], [1540, 560], [1470, 612], [140, 612]];
    cut(x, body, C.navy, { seed: 711, amp: 2.5, edgeW: 9, shadow: false, scribble: '#15285A' });
    cut(x, [[610, 372], [680, 222], [860, 214], [860, 372]], '#8FB0EE', { seed: 712, amp: 1.5, edgeW: 6, shadow: false });
    cut(x, [[890, 372], [890, 214], [1050, 216], [1170, 330], [1170, 372]], '#8FB0EE', { seed: 713, amp: 1.5, edgeW: 6, shadow: false });
    x.strokeStyle = 'rgba(143,176,238,0.55)'; x.lineWidth = 5; x.beginPath(); x.moveTo(600, 380); x.lineTo(600, 600); x.moveTo(880, 380); x.lineTo(880, 600); x.moveTo(1190, 380); x.lineTo(1200, 600); x.stroke();
    for (const hx of [820, 1130]) cut(x, rrPts(hx - 36, 410, 72, 18, 9), METAL.steel, { seed: 714 + hx, amp: 0.8, edgeW: 3, shadow: false });
    cut(x, rrPts(1470, 400, 60, 40, 14), '#F6D22F', { seed: 716, amp: 1, edgeW: 4, shadow: false });
    for (const wx of [360, 1250]) { cut(x, circlePts(wx, 630, 118), '#101A33', { seed: 717 + wx, amp: 2, edgeW: 8, shadow: false }); cut(x, circlePts(wx, 630, 58), METAL.steel, { seed: 718 + wx, amp: 1, edgeW: 5, shadow: false }); }
  }, 0),
  shop: () => D.tex('shop', 1000, 1100, (x, w, h) => {
    cut(x, rectPts(10, 10, w - 20, h - 20), C.navy, { seed: 721, amp: 2, edgeW: 7, shadow: false });
    for (let i = 0; i < 8; i++) cut(x, [[20 + i * 120, 40], [140 + i * 120, 40], [140 + i * 120, 170], [80 + i * 120, 200], [20 + i * 120, 170]], i % 2 ? C.paper : BRAND, { seed: 722 + i, amp: 1, edgeW: 4, shadow: false });
    txt(x, 'KOSTAS COFFEE', w / 2, 250, { font: '64px Brand', color: C.paper });
    const g = x.createLinearGradient(0, 300, 0, 1060); g.addColorStop(0, '#DCE7FA'); g.addColorStop(1, '#A9C3F3');
    x.fillStyle = g; x.fillRect(60, 310, 600, 740); x.fillRect(700, 310, 240, 740);
    x.fillStyle = 'rgba(255,255,255,0.35)'; for (const [a, b] of [[120, 60], [260, 30], [760, 40]]) { x.beginPath(); x.moveTo(a, 1050); x.lineTo(a + b, 1050); x.lineTo(a + b + 300, 310); x.lineTo(a + 300, 310); x.closePath(); x.fill(); }
    cut(x, rrPts(720, 640, 20, 110, 8), METAL.steel, { seed: 729, amp: 0.8, edgeW: 3, shadow: false });
  }, 0),
  boxF: () => D.tex('boxF', 600, 440, (x, w, h) => { cut(x, rectPts(4, 4, w - 8, h - 8), C.paper, { seed: 731, amp: 1.5, edgeW: 5, shadow: false, scribble: '#E6E0D0' }); x.fillStyle = BRAND; x.fillRect(w / 2 - 40, 0, 80, 70); }, 0),
  boxT: () => D.tex('boxT', 600, 400, (x, w, h) => { cut(x, rectPts(4, 4, w - 8, h - 8), '#ECE6D6', { seed: 732, amp: 1.5, edgeW: 5, shadow: false }); x.fillStyle = BRAND; x.fillRect(w / 2 - 40, 0, 80, h); x.strokeStyle = 'rgba(16,26,51,0.2)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke(); }, 0),
};
const CAR = { w: 320, h: 160, pos: [0, 0, 0] }, CAR_DOOR = D.world({ ...CAR, anchor: [0.5, 1] }, 0.46, 0.62);
const SHOP = { w: 200, h: 220, pos: [0, 0, 0] }, SHOP_GLASS = D.world({ ...SHOP, anchor: [0.5, 1] }, 0.36, 0.52);
const BOX = { c: [4, 0, 0], w: 30, d: 20, h: 22 }, BOX_F = [BOX.c[0], BOX.h * 0.46, BOX.c[2] - BOX.d / 2];
function outdoor(obj, stuck, k = 30) {
  return [
    { t: outTex.street(), w: 700, h: 400, pos: [0, 0, ROUT.wall.z], surface: true, lift: 0, shadow: false },
    { t: outTex.ground(), w: 700, h: 400, pos: [0, 0, -140], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
    obj, stuck && { t: heroTex(), w: k * stuck.k, h: k * stuck.k * (stuck.sq || 1), anchor: [0.5, 0.5], pos: V.add(stuck.p, [0, 0, -0.2 - stuck.z * k / 10]), rot: [0, 0, stuck.rz - 0.06], zBias: 60 },
  ];
}
function boxItems(stuck) {
  const { c, w, d, h } = BOX;
  return [...roomItems(R0, { shelf: [-18, 96] }),
    { t: outTex.boxF(), w, h, pos: [c[0], 0, c[2] - d / 2] },
    { t: outTex.boxT(), w, h: d, pos: [c[0], h, c[2] - d / 2], rot: [PI / 2, 0, 0], anchor: [0.5, 1] },
    stuck && { t: heroTex(), w: 8 * stuck.k, h: 8 * stuck.k * (stuck.sq || 1), anchor: [0.5, 0.5], pos: [BOX_F[0], BOX_F[1], BOX_F[2] - 0.12 - stuck.z * 0.8], rot: [0, 0, stuck.rz - 0.1], zBias: 20 }];
}

// ---------- Στράτος (CTA) ----------
const ST_POS = [-6, R0.floor.y, 84], HEAD = [-6, 68, 84];
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.4, look: 0 }],
  [26.48, { aR: 1.4, eR: -1.6, hR: 'fist', brows: 0.7 }],
  [26.68, { aR: 1.4, eR: -1.6, hR: 'thumb', brows: 0.8, tilt: 0.04 }],                    // 👍 «Παράγγειλε τα δικά σου»
  [27.62, { aR: 0.35, eR: -0.2, hR: 'point', brows: 0.5, tilt: 0 }],                      // δείχνει κάτω: «ακολούθησέ μας»
  [28.85, { aR: 0.12, eR: 0, hR: 'relaxed', brows: 0.3 }],
];

// ---------- κάμερες ----------
const HOOK_CAM = { pos: V.add(HERO_C, [5, 36, -27]), look: V.add(HERO_C, [-0.5, 0, 2.5]), fov: 34, ap: 30, focusAt: HERO_C };
const LAP_CAM = { pos: V.add(V.add(LAP.c, V.mul(LAP.n, 70)), [-6, 22, 0]), look: V.add(LAP.c, [0, -2, 0]), fov: 36, ap: 22, focusAt: LAP.c };
const MED = { pos: [-2, 52, -190], look: [-4, 46, 60], fov: 40, ap: 16, focusAt: HEAD };
// hook: ιστορία σε χρόνο τ (το rewind την τρέχει ανάποδα)
const HK = { touch: 0.48, peel: [0.5, 1.02], lift: [1.02, 1.2], whip: [1.08, 1.34], slap: 1.44, rw: [1.95, 2.42] };
const tauHook = t => t < HK.rw[0] ? t : lerp(1.9, 0, easeInOut(prog(t, HK.rw[0], HK.rw[1])));
function camAt(t) {
  const sh = shotAt(t), hk = t < 0.6 ? clamp(t / 0.6) : t > BACK[0] ? 1 - prog(t, BACK[0], BACK[1]) : 1;
  let o;
  if (sh === 'hook') { const tau = tauHook(t), w = easeInOut(prog(tau, ...HK.whip)), s = M.shake(tau, HK.slap, 0.6, { f: 14 });
    o = mixCam({ ...HOOK_CAM, pos: V.add(HOOK_CAM.pos, [0, -2 * clamp(tau / 1.0), 3 * clamp(tau / 1.0)]) }, LAP_CAM, w); o.pos = V.add(o.pos, [s[0], s[1], 0]); }
  else if (sh === 'print') o = mixCam({ pos: [-22, 62, -125], look: [-2, 34, PZ], fov: 40, ap: 12, focusAt: [0, 46, PZ] }, { pos: [-18, 58, -112], look: [-2, 33, PZ], fov: 40, ap: 12, focusAt: [0, 44, PZ] }, easeInOut(prog(t, 2.6, 3.95)));
  else if (sh === 'printC') o = mixCam({ pos: [-22, 44, -52], look: [-8, 28, PZ - 3], fov: 40, ap: 20, focusAt: [-12, SLOT_Y - 8, PZ - 4] }, { pos: [-18, 40, -46], look: [-8, 27, PZ - 3], fov: 40, ap: 20, focusAt: [-12, SLOT_Y - 9, PZ - 4] }, easeInOut(prog(t, 3.95, 5.25)));
  else if (sh === 'sun') { const c = D.world(SHEET, 0.5, 0.5); o = mixCam({ pos: V.add(c, [6, 62, -40]), look: V.add(c, [0, 0, 3]), fov: 40, ap: 16, focusAt: c }, { pos: V.add(c, [4, 54, -34]), look: V.add(c, [0, 0, 3]), fov: 40, ap: 16, focusAt: c }, easeInOut(prog(t, 5.25, 7.45))); }
  else if (sh === 'lam') o = mixCam({ pos: [-22, 66, -104], look: [0, 12, 0], fov: 40, ap: 14, focusAt: [0, 2, LZ - 12] }, { pos: [-18, 60, -92], look: [0, 10, -2], fov: 40, ap: 14, focusAt: [0, 1, LZ - 20] }, easeInOut(prog(t, 7.45, 8.95)));
  else if (sh === 'lamT') { const c = [-2, 0.15, LZ - 1.5 - (SHH + 1) + SHH / 2]; o = mixCam({ pos: V.add(c, [4, 38, -26]), look: c, fov: 38, ap: 24, focusAt: c }, { pos: V.add(c, [3, 34, -22]), look: c, fov: 38, ap: 24, focusAt: c }, easeInOut(prog(t, 8.95, 10.72))); }
  else if (sh === 'feed') o = mixCam({ pos: [-40, 56, -92], look: [0, 12, -6], fov: 40, ap: 14, focusAt: [0, 14, -12] }, { pos: [-30, 58, -80], look: [0, 12, -4], fov: 40, ap: 14, focusAt: [0, 14, -8] }, easeInOut(prog(t, 10.72, 12.2)));
  else if (sh === 'sense') { const s = cutterState(t); o = mixCam({ pos: [-24, 44, -56], look: [0, 17, -2], fov: 40, ap: 16, focusAt: [s.x, 16, ZS] }, { pos: [-18, 41, -50], look: [2, 17, 0], fov: 40, ap: 16, focusAt: [s.x, 16, ZS] }, easeInOut(prog(t, 12.2, 16.35))); }
  else if (sh === 'cut') { const c = [-12 + SL[CUTK][0], 14, ZS]; o = mixCam({ pos: V.add(c, [-16, 20, -30]), look: V.add(c, [0, 0, -3]), fov: 36, ap: 26, focusAt: V.add(c, [0, 0.5, -1]) }, { pos: V.add(c, [-13, 18, -26]), look: V.add(c, [0, 0, -3]), fov: 36, ap: 26, focusAt: V.add(c, [0, 0.5, -1]) }, easeOut(prog(t, 16.35, 16.5)) * 0.2 + 0.8 * easeInOut(prog(t, 16.5, 18.95))); }
  else if (sh === 'peel') { const hold = easeInOut(prog(t, 19.75, 20.35)); o = mixCam({ ...HOOK_CAM, pos: V.add(HOOK_CAM.pos, [2, 8, -8]) }, { pos: V.add(HERO_C, [2, 30, -52]), look: V.add(HERO_C, [0, 16, -12]), fov: 36, ap: 24, focusAt: V.add(HERO_C, [4, 18, -16]) }, hold); }
  else if (sh === 'car') o = { pos: V.add(CAR_DOOR, [60, 40, -330]), look: V.add(CAR_DOOR, [8, -12, 0]), fov: 38, ap: 10, focusAt: CAR_DOOR };
  else if (sh === 'win') o = { pos: V.add(SHOP_GLASS, [40, 10, -270]), look: V.add(SHOP_GLASS, [16, 8, 0]), fov: 38, ap: 10, focusAt: SHOP_GLASS };
  else if (sh === 'lap') o = LAP_CAM;
  else if (sh === 'box') o = { pos: V.add(BOX_F, [26, 34, -96]), look: V.add(BOX_F, [0, 2, 0]), fov: 36, ap: 20, focusAt: BOX_F };
  else if (sh === 'endure') o = mixCam({ pos: V.add(CAR_DOOR, [22, 14, -150]), look: V.add(CAR_DOOR, [0, -10, 0]), fov: 36, ap: 14, focusAt: CAR_DOOR }, { pos: V.add(CAR_DOOR, [18, 12, -132]), look: V.add(CAR_DOOR, [0, -10, 0]), fov: 36, ap: 14, focusAt: CAR_DOOR }, easeInOut(prog(t, 24.1, 26.45)));
  else o = mixCam(mixCam(MED, { ...MED, pos: [-3, 52, -168] }, easeInOut(prog(t, 26.45, BACK[0]))), HOOK_CAM, easeInOut(prog(t, BACK[0], BACK[1])));
  o.pos = V.add(o.pos, handCam(t, hk));
  return o;
}
const MB = t => { const sh = shotAt(t);
  if (sh === 'hook') { const tau = tauHook(t); return (tau > HK.whip[0] && tau < HK.slap) || (t > HK.rw[0] && t < HK.rw[1]) ? 5 : 1; }
  if (['car', 'win', 'lap', 'box'].includes(sh)) return 3;
  if (sh === 'cta' && t > BACK[0] && t < BACK[1]) return 5;
  return 1; };

// ---------- σκηνή ανά πλάνο ----------
const HOOK_SHEET = { cut: 1, hole: HERO, gloss: 0.32 };
function build(t) {
  const sh = shotAt(t), cam = D.camera(camAt(t));
  const desk = { cam, R: R0, ...LIGHT0, patch: 0.9, shaft: 0.8, dust: 90, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
  if (sh === 'hook') {
    const tau = tauHook(t), handIn = M.springTo(tau, 0.12, 0, 1, { f: 1.8, z: 0.7 }), pp = easeInOut(prog(tau, ...HK.peel)), up = easeInOut(prog(tau, ...HK.lift));
    const onLid = tau >= HK.slap - 0.14, st = slap(tau, HK.slap);
    return { ...desk, items: [...roomItems(R0, { mat: [-6, -14, 0.06], shelf: [-18, 96] }), { ...SHEET, t: sheetTex(HOOK_SHEET) }, { t: TXL.mug(), w: 10, h: 300 / 26, anchor: [0.12, 1], pos: [-38, 0, 20] },
      ...lapItems(onLid && st), ...(tau < HK.whip[1] ? peelItems(pp, handIn * (1 - up * 0.2), up * 1.4) : [])] };
  }
  if (sh === 'print' || sh === 'printC') return { cam, R: RP, items: printerItems(t), light: { dir: [0.75, -0.5, 0.42], soft: 0.05, shadow: 0.42 }, window: { c: [-195, 60, 10], a: [0, 0, 30], b: [0, 40, 0], panes: [2, 2] }, patch: 0.8, shaft: 0.7, dust: 80, grade: { from: [0, H * 0.3], warm: 0.22, bloom: 0.12 } };
  if (sh === 'sun') {
    const ph = lerp(-0.55, 0.6, easeInOut(prog(t, 5.3, 7.4))), sun = 0.9 + 0.5 * Math.sin(prog(t, 5.3, 7.4) * PI);
    return { ...desk, light: { dir: [0.8 * Math.cos(ph), -0.6, 0.8 * Math.sin(ph)], soft: 0.04, shadow: 0.55 }, window: { c: [-120, 82, 38 - ph * 40], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] },
      patch: sun, shaft: 0.6 + 0.6 * sun, dust: 120, grade: { from: [0, H * 0.3], warm: 0.3 + 0.1 * sun, bloom: 0.16 },
      items: [...roomItems(R0, { mat: [-6, -14, 0.06], shelf: [-18, 96] }), { ...SHEET, t: sheetTex({}) }, { t: TXL.mug(), w: 10, h: 300 / 26, anchor: [0.12, 1], pos: [12, 0, -6] }] };
  }
  if (sh === 'lam' || sh === 'lamT') {
    const items = lamItems(t);
    if (sh === 'lamT') { const k = prog(t, 9.0, 9.5); if (k > 0 && k < 1) { const c = [-2, 0.15, LZ - 1.5 - (SHH + 1) + SHH / 2]; items.push({ t: keyTex(), w: 8.4, h: 3.2, anchor: [0.95, 0.55], pos: V.add(c, [lerp(-9, 9, easeInOut(k)), 1.2, lerp(-5, 4, k)]), rot: [PI / 2 - 0.5, 0.25, -0.35] }); } }
    return { ...desk, items };
  }
  if (sh === 'feed' || sh === 'sense' || sh === 'cut') {
    const s = cutterState(t), dim = sh === 'feed' ? 0 : clamp(prog(t, 12.2, 12.5)) * (1 - clamp(prog(t, 15.7, 16.2)));
    return { cam, R: RC, items: cutterItems(t, s), light: { dir: [0.7, -0.62, 0.35], soft: 0.05, shadow: 0.45 }, window: { c: [-180, 70, 20], a: [0, 0, 30], b: [0, 40, 0], panes: [2, 2] },
      patch: lerp(0.8, 0.25, dim), shaft: lerp(0.7, 0.25, dim), dust: 70, ambient: mixHex('#CDD4EA', '#A2ABC8', dim), grade: { from: [0, H * 0.3], warm: lerp(0.22, 0.05, dim), bloom: lerp(0.12, 0.2, dim) } };
  }
  if (sh === 'peel') {
    const handIn = M.springTo(t, 18.98, 0, 1, { f: 2.2, z: 0.7 }), pp = easeInOut(prog(t, 19.1, 19.72)), hold = easeInOut(prog(t, 19.72, 20.35));
    let pe = peelItems(pp, handIn, 0);
    if (hold > 0) {                                                                       // το σηκώνει μπροστά στην κάμερα (καθαρό reveal του σχήματος)
      const P0 = V.add(HERO_C, [0, 0.03, 0]), P1 = V.add(HERO_C, [3, 17, -15 + 0.6 * Math.sin((t - 20.3) * 1.6)]), rz = 0.08 * Math.sin((t - 19.9) * 1.3);
      const hero = { t: heroTex(), w: 10, h: 10, anchor: [0.5, 0.5], pos: V.lerp(P0, P1, hold), rot: [lerp(PI / 2, 0.05, hold), lerp(0.1, -0.12, hold), lerp(0.1, rz, hold)], bend: (u, v) => (1 - hold) * Math.pow(Math.max(0, u + 0.13), 1.35) * 8.5 };
      const edge = D.world(hero, 0.96, 0.5);
      pe = [hero, handItem(edge, [lerp(HAND_ROT[0], 0.2, hold), lerp(HAND_ROT[1], -0.35, hold), lerp(0, 1.15, hold)])];
    }
    return { ...desk, items: [...roomItems(R0, { mat: [-6, -14, 0.06], shelf: [-18, 96] }), { ...SHEET, t: sheetTex(HOOK_SHEET) }, ...pe] };
  }
  if (sh === 'car' || sh === 'endure') {
    const st = sh === 'car' ? slap(t, T.aytok) : { k: 1, z: 0, rz: 0 };
    const rub = sh === 'endure' && t > T.trivi ? Math.sin((t - T.trivi) * 18) * clamp(prog(t, T.trivi, T.trivi + 0.1)) * (1 - clamp(prog(t, 26.3, 26.45))) : null;
    const sun = sh === 'endure' ? clamp(prog(t, T.ilios - 0.05, T.ilios + 0.15)) * (1 - clamp(prog(t, T.trivi - 0.1, T.trivi + 0.2))) : 0;
    const items = outdoor({ t: outTex.car(), ...CAR, anchor: [0.5, 1] }, (sh === 'endure' || st.on) && { ...st, p: CAR_DOOR });
    if (rub != null) items.push({ t: spongeTex(), w: 13, h: 8, anchor: [0.5, 0.5], pos: V.add(CAR_DOOR, [rub * 9, 2 + rub * 2, -2.5]), rot: [0, 0, 0.2 + rub * 0.1] });
    return { cam, R: ROUT, items, light: { dir: [0.55, -0.72, 0.42], soft: 0.03, shadow: 0.5 }, grade: { from: [0, 0], warm: 0.26 + 0.25 * sun, bloom: 0.1 + 0.25 * sun } };
  }
  if (sh === 'win') { const st = slap(t, T.vitr); return { cam, R: ROUT, items: outdoor({ t: outTex.shop(), ...SHOP, anchor: [0.5, 1] }, st.on && { ...st, p: SHOP_GLASS }, 34), light: { dir: [0.55, -0.72, 0.42], soft: 0.03, shadow: 0.5 }, grade: { from: [0, 0], warm: 0.26, bloom: 0.12 } }; }
  if (sh === 'lap') { const st = slap(t, T.laptop); return { ...desk, items: [...roomItems(R0, { mat: [-6, -14, 0.06], shelf: [-18, 96] }), { ...SHEET, t: sheetTex(HOOK_SHEET) }, ...lapItems(st.on && st)] }; }
  if (sh === 'box') { const st = slap(t, T.syskev); return { ...desk, items: boxItems(st.on && st) }; }
  // CTA: ο Στράτος πίσω από το γραφείο → η κάμερα γυρίζει στο φύλλο (frame 0)
  const P = poseSpring(POSES, t);
  return { ...desk, items: [...roomItems(R0, { mat: [-6, -14, 0.06], shelf: [-18, 96] }), { ...SHEET, t: sheetTex(HOOK_SHEET) }, { ...heroFlat, t: heroTex() }, { t: TXL.mug(), w: 10, h: 300 / 26, anchor: [0.12, 1], pos: [-38, 0, 20] },
    ...lapItems({ k: 1, z: 0, rz: 0 }), stratosItem(cam, t, { pos: ST_POS, pose: P, clip: behindDesk(cam) })] };
}
const spongeTex = () => D.tex('sponge', 260, 160, x => { cut(x, rrPts(6, 6, 248, 148, 30), C.sky, { seed: 801, amp: 2, edgeW: 6, shadow: false }); const r = rng(8); x.fillStyle = 'rgba(30,58,138,0.25)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(20 + r() * 220, 20 + r() * 120, 3 + r() * 5, 0, 7); x.fill(); } });

// ---------- 2D πάνω από τη μακέτα: ετικέτες, σημάδια ✓, νερό ----------
const proj = (t, p) => D.camera(camAt(t)).proj(p);
function overlay(ctx, t) {
  const sh = shotAt(t);
  if (sh === 'printC') { const q = proj(t, [-8, SLOT_Y - 14, PZ - 5]); stamp(ctx, t, T.vinyl, clamp(q[0], 330, 750), clamp(q[1] + 200, 700, 1350), 'ΑΥΤΟΚΟΛΛΗΤΟ ΒΙΝΥΛΙΟ', -0.05, BRAND, 46); }
  if (sh === 'sun') checkChip(ctx, t, T.xeth, 540, 1300, 'δεν ξεθωριάζει', { fs: 52 });
  if (sh === 'lam') { const q = proj(t, [0, LW * 480 / 900, LZ]); stamp(ctx, t, 7.95, clamp(q[0], 300, 780), clamp(q[1] - 90, 760, 1300), 'ΔΙΑΦΑΝΟ ΦΙΛΜ', 0.04, BRAND, 46); }
  if (sh === 'lamT') { checkChip(ctx, t, T.gratz + 0.35, 540, 1180, 'γρατζουνιές', { fs: 50 }); checkChip(ctx, t, T.exot + 0.2, 540, 1320, 'εξωτερικές συνθήκες', { fs: 50, seed: 64 }); rain(ctx, t); }
  if (sh === 'sense') {
    const s = cutterState(t), c = D.camera(camAt(t));
    MARK_T.forEach((tm, i) => { if (t < tm) return; const q = c.proj(toWorldC(MK[i][0], MK[i][1], s.zN)), k = M.springTo(t, tm, 0, 1, { f: 3, z: 0.5 });
      ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(k, k); ctx.strokeStyle = BRAND; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.stroke(); L.check(ctx, 0, -48, 0.7, BRAND); ctx.restore(); });
    if (s.led > 0.01) { const q = c.proj([s.x + 2.6, RC.desk.y + 0.1, ZS - 0.2]); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 70); g.addColorStop(0, `rgba(255,60,70,${0.55 * s.led})`); g.addColorStop(1, 'rgba(255,60,70,0)'); ctx.fillStyle = g; ctx.fillRect(q[0] - 70, q[1] - 70, 140, 140); ctx.restore(); }
    const qc = c.proj([s.x, RC.desk.y + 12, ZS + 0.5]); stamp(ctx, t, 12.45, clamp(qc[0] + 150, 330, 760), clamp(qc[1] - 110, 720, 1300), 'ΑΙΣΘΗΤΗΡΑΣ', 0.05, BRAND, 44);
    if (t < MARK_T[1] + 0.6) { const qm = c.proj(toWorldC(MK[0][0], MK[0][1], s.zN)); stamp(ctx, t, T.mayra, clamp(qm[0] + 40, 300, 760), clamp(qm[1] + 120, 700, 1380), 'CROP MARKS', -0.06, C.navy, 44); }
  }
  if (sh === 'endure') { water(ctx, t); sunFlare(ctx, t); checkChip(ctx, t, T.nero, 250, 1180, 'νερό', { fs: 50 }); checkChip(ctx, t, T.ilios, 250, 1300, 'ήλιος', { fs: 50, seed: 64 }); checkChip(ctx, t, T.trivi, 250, 1420, 'τριβή', { fs: 50, seed: 68 }); }
}
const DROPS = (() => { const r = rng(606); return Array.from({ length: 16 }, () => ({ x: 200 + r() * 680, t0: r() * 0.7, y1: 900 + r() * 420, sp: 60 + r() * 90, s: 0.7 + r() * 0.6 })); })();
function drop(ctx, x, y, s, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = 'rgba(220,235,255,0.55)'; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(14, 0, 12, 8); ctx.arc(0, 8, 12, 0, PI); ctx.quadraticCurveTo(-14, 0, 0, -20); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-4, 6, 3.5, 0, 7); ctx.fill(); ctx.restore(); }
function rain(ctx, t) {                                                                    // σταγόνες: πέφτουν → κάθονται σαν χάντρες → γλιστράνε (δεν περνάει τίποτα)
  for (const d of DROPS) { const u = t - (T.exot + d.t0); if (u < 0) continue; const fall = clamp(u / 0.18), y = lerp(d.y1 - 700, d.y1, fall) + Math.max(0, u - 0.3) * d.sp;
    if (fall < 1) { ctx.save(); ctx.strokeStyle = 'rgba(220,235,255,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(d.x, y - 70); ctx.lineTo(d.x, y); ctx.stroke(); ctx.restore(); } else drop(ctx, d.x, y, d.s * 2.2, 1 - clamp(prog(t, 10.5, 10.72))); }
}
function sunFlare(ctx, t) {                                                                // «ήλιο»: ζεστό φως από πάνω δεξιά που σαρώνει την πόρτα
  const a = clamp(prog(t, T.ilios - 0.1, T.ilios + 0.15)) * (1 - clamp(prog(t, T.trivi - 0.15, T.trivi + 0.15))); if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x = 980, y = 360, g = ctx.createRadialGradient(x, y, 0, x, y, 900);
  g.addColorStop(0, `rgba(255,214,150,${0.55 * a})`); g.addColorStop(0.35, `rgba(255,190,120,${0.22 * a})`); g.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.translate(x, y); ctx.rotate(t * 0.15); for (let i = 0; i < 9; i++) { ctx.rotate(PI * 2 / 9); ctx.fillStyle = `rgba(255,230,180,${0.10 * a})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1100, -60); ctx.lineTo(1100, 60); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function water(ctx, t) {                                                                   // πίδακας νερού από αριστερά → σταγόνες που κυλάνε στην πόρτα
  const u = t - T.nero; if (u < 0 || t > 26.45) return;
  if (u < 0.5) { ctx.save(); ctx.globalAlpha = 1 - clamp(prog(u, 0.35, 0.5)); for (let i = 0; i < 26; i++) { const r = rng(900 + i), y = 820 + r() * 420, len = 120 + r() * 200, x0 = -40 + ((u * 2600 + r() * 900) % 1300); ctx.strokeStyle = `rgba(210,230,255,${0.35 + r() * 0.4})`; ctx.lineWidth = 3 + r() * 5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + len, y + len * 0.12); ctx.stroke(); } ctx.restore(); }
  for (const d of DROPS) { const uu = u - 0.15 - d.t0 * 0.3; if (uu < 0) continue; drop(ctx, d.x, 780 + (d.y1 - 900) * 0.8 + uu * d.sp * 1.4, d.s * 1.3, 1 - clamp(prog(t, 25.6, 25.85))); }
}

const CAPS = [[-1, HOOK1], [1.05, 'αυτοκόλλητα με περιγραμμική κοπή.'], [2.75, 'Πρώτα εκτυπώνουμε το σχέδιό σου'], [4.15, 'σε αυτοκόλλητο βινύλιο.'],
  [5.3, 'Με χρώματα που δεν ξεθωριάζουν στον ήλιο.'], [7.5, 'Πλαστικοποιούμε,'], [8.45, 'για αντοχή σε γρατζουνιές'], [9.45, 'και εξωτερικές συνθήκες.'],
  [10.75, 'Μετά μπαίνει στον κοπτικό.'], [12.15, 'Το μηχάνημα διαβάζει τα μαύρα σημάδια,'], [14.2, 'και ξέρει ΑΚΡΙΒΩΣ πού πρέπει να κόψει.'],
  [16.4, 'Και έτσι κόβεται ακριβώς'], [17.6, 'στο σχήμα του λογοτύπου σου.'], [18.97, 'Το αποτέλεσμα;'], [20.02, 'Αυτοκόλλητο που κολλάει σε αυτοκίνητα,'],
  [21.85, 'βιτρίνες, laptop, συσκευασίες.'], [24.1, 'Και αντέχει σε νερό, ήλιο και τριβή.'], [26.55, 'Παράγγειλε τα δικά σου,'], [27.6, 'και ακολούθησέ μας για περισσότερα.'], [LOOP_AT, HOOK1]];

function scene(ctx, t) {
  D.frame(ctx, t, build, { mb: MB(t) });
  overlay(ctx, t);
  captionSeq(ctx, t, CAPS);
  if (t < SC[1]) seriesTag(ctx, t + 1, TAG); else if (t >= LOOP_AT) seriesTag(ctx, t - LOOP_AT + 1, TAG);
  rewindTag(ctx, t, HK.rw[0], HK.rw[1] + 0.2);
  if (t >= SC[1] && t < SC[2]) stepChip(ctx, t, SC[1] + 0.25, 1, 'Εκτύπωση');
  else if (t >= SC[2] && t < SC[3]) stepChip(ctx, t, SC[2] + 0.15, 2, 'Πλαστικοποίηση');
  else if (t >= SC[3] && t < SC[4]) stepChip(ctx, t, SC[3] + 0.15, 3, 'Κοπή');
  if (t > T.parag && t < BACK[0] + 0.1) ctaButton(ctx, t, T.parag + 0.05, 540, 1330, 'Παράγγειλε τα δικά σου');
}
const at = t0 => (ctx, lt) => scene(ctx, t0 + lt);

module.exports = require('./render.js')({
  name: 'pf06_autokollita', SCENES: SC.slice(0, -1).map((t0, i) => [at(t0), SC[i + 1] - t0]), WIPES: [1, 2, 3, 4], LOOP: 'cut',
  VO_FILE: 'vo/pf06_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/pf06.mp3',
  SFX: [
    [0.5, 'peel', { dur: 0.55, speed: 0.6, gain: 0.8, note: 'ξεκόλλημα' }],
    [1.06, 'swoosh', { gain: 0.7, note: 'whip στο laptop' }],
    [1.43, 'thud', { gain: 0.8, note: 'πλατς στο laptop' }],
    [HK.rw[0], 'ticks', { count: 10, rise: 1, gain: 0.45, note: 'rewind' }],
    [HK.rw[0], 'whoosh', { dur: HK.rw[1] - HK.rw[0], gain: 0.5, seed: 13 }],
    [2.75, 'slide', { dur: 2.5, strokes: 8, gain: 0.4, note: 'κεφαλή εκτυπωτή πέρα-δώθε' }],
    [T.vinyl, 'pop', { gain: 0.6, note: 'ετικέτα βινύλιο' }],
    [5.3, 'air', { dur: 1.9, gain: 0.35, note: 'time-lapse ήλιος' }],
    [T.xeth, 'ding', { gain: 0.6, note: 'δεν ξεθωριάζει ✓' }],
    [7.5, 'slide', { dur: 1.35, strokes: 1, gain: 0.5, note: 'βγαίνει από τον πλαστικοποιητή' }],
    [7.95, 'pop', { gain: 0.5, seed: 2, note: 'ετικέτα φιλμ' }],
    [9.0, 'slide', { dur: 0.5, strokes: 1, gain: 0.45, seed: 3, note: 'κλειδί' }],
    [T.gratz + 0.35, 'ding', { gain: 0.55, seed: 2 }],
    [T.exot, 'drop', { dur: 0.9, rate: 12, gain: 0.45, note: 'βροχή' }],
    [T.exot + 0.2, 'ding', { gain: 0.55, seed: 3 }],
    [10.8, 'slide', { dur: 0.7, strokes: 1, gain: 0.5, seed: 4, note: 'το φύλλο μπαίνει στο κοπτικό' }],
    [11.6, 'click', { gain: 0.6, note: 'κύλινδροι' }],
    [12.3, 'blip', { gain: 0.5, note: 'αισθητήρας' }],
    ...MARK_T.map((tm, i) => [tm, 'beep', { gain: 0.45, seed: i, note: i ? '' : 'crop marks' }]),
    [T.akrib, 'shimmer', { gain: 0.7, note: 'περιγράμματα' }],
    [15.2, 'plotter', { dur: 1.0, gain: 0.3, note: 'καρότσι στην αρχή' }],
    [16.35, 'zoom', { gain: 0.6 }],
    [CUT0, 'plotter', { dur: CUT1 - CUT0, gain: 0.7, seed: 2, note: 'κοπή' }],
    [19.1, 'peel', { dur: 0.65, speed: 0.7, gain: 0.8, seed: 2, note: 'ξεκόλλημα (αποτέλεσμα)' }],
    [19.75, 'swoosh', { gain: 0.5, seed: 2 }],
    [20.35, 'shimmer', { gain: 0.6, seed: 2 }],
    ...[[21.05, T.aytok], [21.85, T.vitr], [22.62, T.laptop], [23.12, T.syskev]].flatMap(([a, b], i) => [[a, 'swoosh', { gain: 0.5, seed: 4 + i }], [b, 'thud', { gain: 0.8, seed: 4 + i, note: i ? '' : 'πλατς ×4' }]]),
    [T.nero, 'spray', { dur: 0.5, gain: 0.7, note: 'νερό' }],
    [T.nero + 0.02, 'ding', { gain: 0.5, seed: 4 }],
    [T.ilios, 'shimmer', { gain: 0.6, seed: 3, note: 'ήλιος' }],
    [T.ilios + 0.02, 'ding', { gain: 0.5, seed: 5 }],
    [T.trivi, 'slide', { dur: 0.55, strokes: 4, gain: 0.5, seed: 5, note: 'τριβή' }],
    [T.trivi + 0.02, 'ding', { gain: 0.5, seed: 6 }],
    [26.68, 'swoosh', { gain: 0.5, seed: 9, note: '👍' }],
    [T.parag + 0.05, 'pop', { gain: 0.6, seed: 3, note: 'κουμπί' }],
    [27.62, 'swoosh', { gain: 0.4, seed: 10, note: 'δείχνει κάτω' }],
    [BACK[0], 'zoom', { gain: 0.6, seed: 2, note: 'πίσω στο φύλλο (loop)' }],
  ],
});
