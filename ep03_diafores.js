// «Βρες τις διαφορές» — κωμικό αυτοτελές · host: Στράτος · VO ElevenLabs «Stratos» + μουσική + SFX · seamless loop (LOOP: 'cut') · look: χάρτινη μακέτα (diorama.js, §1d)
// Σενάριο: scripts/ep03.md (v2) · σκελετός: node new.js ep03_diafores (2026-10-01)
// 3 γύροι στην ίδια κάτοψη (ΑΡΧΕΙΟ πάνω · PROOF κάτω, χρονόμετρο 4→0, κύκλοι μαρκαδόρου) · γύρος 3: ο φακός σκανάρει → σταματάει στο «K0STAS» και το μεγεθύνει
// → μεσαίο πλάνο: μήνυμα πελάτη (φωτογραφία της στοίβας) → facepalm → CTA · νέες κάρτες πετάγονται στο γραφείο = frame 0 (η πτήση τους συνεχίζει μέσα από το loop: tau = t − TOTAL)
// VO = vo/ep03_vo.mp3 @ 0,2s · χρόνοι λέξεων: VT.W('λέξη') (αρχή) / VT.E('λέξη') (τέλος) · τα τέλη φράσεων πριν από σιωπή (--keep) είναι φουσκωμένα → W() + διάρκεια
// 0.26–2.53  Βρες τρεις διαφορές, πριν τυπωθούν χίλιες κάρτες.   (σιωπή 5,2s: αναζήτηση + κύκλοι)
// 7.89–8.65  Επόμενο.
// 12.25–13.63  Ο Νοέμβρης έχει τριάντα.
// 13.67–15.29  Τελευταίο. Μία διαφορά.   (σιωπή 3,8s: φακός)
// 19.18–20.88  Μηδέν αντί για όμικρον.
// 21.27–23.77  Ο πελάτης το βρήκε κι αυτός. Μετά την εκτύπωση.
// 24.20–25.22  Εσύ πόσες βρήκες;
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, starPts, txt, clamp, lerp, prog, easeIn, easeOut, easeInOut, rng, lipsync, blinkNow } = L;
const M = require('./motion.js');
const { stratos, poseSpring } = require('./stratos.js');
const P = require('./props.js');
const { BRAND, stamp, ctaButton, reach, phoneFrame, msgBubble } = P;

const VT = L.voText('vo/ep03_vo.mp3', 0.2);
const TAG = 'Βρες τις διαφορές', LOOP_AT = +(VT.end + 0.3).toFixed(2), TOTAL = +(VT.end + 0.72).toFixed(2);   // LOOP_AT: caption + ετικέτα του hook ξαναμπαίνουν (η εικόνα είναι ήδη η πτήση του frame 0)
const C1 = VT.E('Επομ') + 0.02, C2 = VT.W('Τελευτ') - 0.12, C3 = VT.E('ομικρ') + 0.12, C4 = VT.W('Εσυ') - 0.12;
const CUTS = [0, C1, C2, C3, C4, TOTAL];  // γύρος 1 · γύρος 2 · γύρος 3 · μήνυμα πελάτη (μεσαίο) · CTA + loop
const CAPS = VT.caps({ max: 22 });       // κομμάτια μιας γραμμής: το caption δεν σκεπάζει την ετικέτα ΑΡΧΕΙΟ

const D = require('./diorama.js'), { V } = D;
const { ROOM, roomItems, behindDesk, mixCam, handCam } = P;

// ---------- χρόνοι (από λέξεις) ----------
const ZOOM = VT.W('διαφ'), STAMPS = [VT.W('πριν'), VT.W('τυπωθ')];
const S1 = VT.W('καρτ') + 0.5, S3 = VT.W('διαφορα') + 0.5;            // αρχή αναζήτησης μετά από φράση με φουσκωμένο τέλος
const ROUND = [ // [αρχή σκηνής, ετικέτες, αρχή χρονομέτρου, τέλος χρονομέτρου, κύκλοι μαρκαδόρου]
  { t0: 0, st: STAMPS, a: S1, b: S1 + 3.6, mk: [S1 + 3.8, S1 + 4.15, S1 + 4.5] },         // κύκλοι σε σιωπή (μόνο pop) → «Επόμενο»
  { t0: C1, st: [C1 + 0.3, C1 + 0.45], a: C1 + 0.4, b: VT.W('Νοεμ') - 0.15, mk: [VT.W('Νοεμ'), VT.W('εχει'), VT.W('τριαντ') + 0.12] },
  { t0: C2, st: [C2 + 0.3, C2 + 0.45], a: S3, b: VT.W('Μηδ') - 0.05, mk: [VT.W('Μηδ'), VT.W('ομικρ')] },   // PROOF «0» · ΑΡΧΕΙΟ «O»
];
const MSG_PH = VT.W('πελατ'), MSG_TX = VT.W('βρηκε'), PALM = VT.W('Μετα') - 0.2, PHONE = C3 + 0.1, CTA = VT.W('Εσυ') + 0.05;
const FLY = 0.75;                        // s: πτήση των καρτών πριν από το frame 0 (tau ∈ [−FLY, 0])
const tauHook = t => t < C1 ? t : t >= C4 ? t - TOTAL : 99;

// ---------- κόσμος (cm) · φως παραθύρου ----------
const R = ROOM, LIGHT = { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } };
const ST_POS = [3, R.floor.y, 84], HEAD = [3, 66, 84], MID = [0, 0, 8];
const SW = 30, SH = 17, GAP = 1.6, ZT = MID[2] + (SH + GAP) / 2, ZB = MID[2] - (SH + GAP) / 2;   // δύο φύλλα: ΑΡΧΕΙΟ (πάνω, μακριά) · PROOF (κάτω)
const PXC = 40;                          // px υφής ανά cm (κείμενο καθαρό στο κινητό)

// ---------- κάμερα ----------
const CAM = {
  hook: { pos: [0, 132, -16], look: [0, 0, 9], fov: 34, ap: 4, focusAt: [0, 6, 8] },          // λίγο ψηλότερα: οι κάρτες στον αέρα
  top: { pos: [0, 115, -13], look: [0, 0, 8.3], fov: 34, ap: 4, focusAt: MID },               // ο «πίνακας» του παιχνιδιού
  med: { pos: [11, 62, -230], look: [12, 44, 40], fov: 36, ap: 12, focusAt: HEAD },           // Στράτος πίσω από το γραφείο, αριστερά (δεξιά το κινητό)
};
function camAt(t) {
  let o;
  if (t < C1) o = mixCam(CAM.hook, CAM.top, M.springTo(t, ZOOM, 0, 1, { f: 2.4, z: 0.5 }));                        // snap zoom στο «διαφορές»
  else if (t < C3) { o = mixCam(CAM.top, CAM.top, 0); const u = prog(t, t < C2 ? C1 : C2, t < C2 ? C2 : C3); o.pos = V.add(o.pos, [lerp(-1.2, 1.2, u), lerp(2, -3, easeInOut(u)), 0]); } // αργό dolly
  else if (t < C4) { o = mixCam(CAM.med, CAM.med, 0); o.pos = V.add(o.pos, [0, 0, lerp(0, 14, easeInOut(prog(t, C3, C4)))]); }                  // αργό push-in
  else o = mixCam(CAM.hook, CAM.hook, 0);
  if (t < C1 && t > 0) { const u = prog(t, ROUND[0].a, ROUND[0].b); o.pos = V.add(o.pos, [lerp(-1.2, 1.2, u), lerp(2, -3, easeInOut(u)) * (t > ROUND[0].a ? 1 : 0), 0]); }
  const k = Math.min(1, t / 0.6, Math.max(0, (LOOP_AT - 0.4 - t) / 0.6)); o.pos = V.add(o.pos, handCam(t, 0.5 * k));
  return o;
}

// ---------- υφές: λογότυπο KOSTAS COFFEE (κούπα · ατμός · κόκκος) ----------
const BR = '#7A3E1D', CR = '#F5E6C8';
function cupLogo(x, cx, cy, d, o = {}) {
  const s = d / 400; x.save(); x.translate(cx, cy); x.scale(s, s); x.lineCap = 'round';
  x.fillStyle = BR; x.beginPath(); x.arc(0, 0, 190, 0, 7); x.fill();
  x.strokeStyle = CR; x.fillStyle = CR; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 166, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(-66, -92); x.lineTo(66, -92); x.lineTo(52, 2); x.quadraticCurveTo(0, 20, -52, 2); x.closePath(); x.fill();
  x.lineWidth = 14; x.beginPath(); x.arc(74, -54, 24, -1.3, 1.3); x.stroke();
  x.lineWidth = 10; x.beginPath(); x.moveTo(-86, 24); x.quadraticCurveTo(0, 40, 86, 24); x.stroke();
  x.lineWidth = 10; for (const sx of (o.steam ?? 3) === 3 ? [-28, 0, 28] : [-28, 28]) { x.beginPath(); x.moveTo(sx, -106); x.quadraticCurveTo(sx + 14, -122, sx, -136); x.quadraticCurveTo(sx - 12, -148, sx, -156); x.stroke(); }
  if (o.bean !== false) { x.save(); x.translate(-114, -46); x.rotate(0.5); x.beginPath(); x.ellipse(0, 0, 17, 25, 0, 0, 7); x.fill(); x.strokeStyle = BR; x.lineWidth = 5; x.beginPath(); x.moveTo(0, -20); x.quadraticCurveTo(-8, 0, 0, 20); x.stroke(); x.restore(); }
  x.fillStyle = CR; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '62px Brand'; for (const [ch, lx, sx] of nameLayout(x, o.name || 'KOSTAS')) { x.save(); x.translate(lx, 82); x.scale(sx, 1); x.fillText(ch, 0, 0); x.restore(); }
  x.font = '30px Brand'; x.fillText('COFFEE', 0, 126);
  x.restore();
}
// θέση του 2ου γράμματος (O / 0) στο λογότυπο, σε τοπικές μονάδες του cupLogo (d = 400)
// το «0» στενότερο (όπως ένα αληθινό μηδέν δίπλα σε O): γράμμα-γράμμα → [χαρακτήρας, κέντρο x, κλίμακα x]
const ZX = 0.74;
function nameLayout(x, name) {
  const g = [...name].map(ch => [ch, x.measureText(ch).width * (ch === '0' ? ZX : 1)]), tot = g.reduce((a, [, w]) => a + w, 0); let cx = -tot / 2;
  return g.map(([ch, w]) => { const o = [ch, cx + w / 2, ch === '0' ? ZX : 1]; cx += w; return o; });
}
let LX; const LETTER2 = name => { LX = LX || L.createCanvas(8, 8).getContext('2d'); LX.font = '62px Brand'; LX.textAlign = 'center'; const [, cx, sx] = nameLayout(LX, name)[1]; return [cx, 82, LX.measureText(name[1]).width * sx]; };   // lazy: τα fonts φορτώνονται με το render.js
// κύκλος μαρκαδόρου (στο χαρτί) · p 0..1 = πόσο έχει ζωγραφιστεί
function marker(x, cx, cy, rx, ry, p, seed) {
  if (p <= 0) return; const r = rng(seed), a0 = -2.2 + r() * 0.6, n = 40, end = a0 + 2.25 * Math.PI * p;
  x.save(); x.strokeStyle = BRAND; x.lineWidth = 11; x.lineCap = 'round'; x.globalAlpha = 0.92; x.beginPath();
  for (let i = 0; i <= n; i++) { const a = a0 + (end - a0) * i / n, k = 1 + 0.06 * Math.sin(a * 3 + seed) + 0.05 * (a - a0) / (2 * Math.PI); x.lineTo(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k); }
  x.stroke(); x.restore();
}
const mkP = (t, t0) => easeOut(prog(t, t0, t0 + 0.3));
const paper = (x, w, h, seed, col = C.paper) => cut(x, rectPts(4, 4, w - 8, h - 8), col, { seed, amp: 2, edgeW: 7, shadow: false });

// γύρος 1: επαγγελματική κάρτα (διαφορές: τηλέφωνο 548→543 · κόκκος · ατμός 3→2)
function card(x, w, h, proof, mk, seed) {
  paper(x, w, h, seed);
  cupLogo(x, 290, 340, 450, { steam: proof ? 2 : 3, bean: !proof });
  x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillStyle = BR; x.font = '58px Brand'; x.fillText('KOSTAS COFFEE', 560, 168);
  x.fillRect(560, 214, 560, 5);
  x.fillStyle = C.ink; x.font = 'bold 44px Round'; x.fillText('Κώστας Παπαδόπουλος', 560, 282);
  const ph = proof ? '210 543 2176' : '210 548 2176'; x.font = '66px Brand'; x.fillText(ph, 560, 398);
  const d0 = x.measureText('210 54').width, dw = x.measureText('8').width;
  x.fillStyle = BR; x.font = '40px Brand'; x.fillText('kostascoffee.gr', 560, 490);
  x.fillStyle = '#5A6478'; x.font = '36px Round'; x.fillText('Ερμού 12 · Αθήνα', 560, 566);
  marker(x, 560 + d0 + dw / 2, 400, 52, 60, mk[0], 11);
  marker(x, 290 - 114 * 1.125, 340 - 46 * 1.125, 46, 50, mk[1], 12);
  marker(x, 290, 340 - 132 * 1.125, 78, 50, mk[2], 13);
}
// γύρος 2: flyer εκδήλωσης (διαφορές: 30→31 Νοεμβρίου · ένα κουτάκι του QR · αστεράκι → κουκκίδα)
const QR = (() => { const r = rng(77), g = []; for (let j = 0; j < 11; j++) for (let i = 0; i < 11; i++) { const fz = (i < 4 && j < 4) || (i > 6 && j < 4) || (i < 4 && j > 6); g.push(!fz && r() < 0.5 ? 1 : 0); } g[5 * 11 + 6] = 1; return g; })();
function flyer(x, w, h, proof, mk, seed) {
  paper(x, w, h, seed, C.navy);
  x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillStyle = C.paper; x.font = 'bold 104px Round'; x.fillText('Βραδιά Jazz', 64, 150);
  const tw = x.measureText('Βραδιά Jazz').width, sx = 64 + tw + 62;
  if (proof) cut(x, circlePts(sx, 132, 15, 15, 14), C.gold, { seed: 5, amp: 0.5, edgeW: 3, shadow: false });
  else cut(x, starPts(sx, 132, 38, 5, 0.45), C.gold, { seed: 5, amp: 0.5, edgeW: 3, shadow: false });
  const day = proof ? 'Σάββατο 31 Νοεμβρίου' : 'Σάββατο 30 Νοεμβρίου'; x.fillStyle = C.gold; x.font = 'bold 58px Round'; x.fillText(day, 64, 300);
  const n0 = x.measureText('Σάββατο ').width, nw = x.measureText('30').width;
  x.fillStyle = C.sky; x.font = '46px Round'; x.fillText('21:00 · Ζωντανή μουσική', 64, 390);
  x.fillStyle = C.paper; x.font = '40px Round'; x.fillText('Είσοδος ελεύθερη', 64, 470);
  cut(x, rectPts(4, h - 110, w - 8, 106), BRAND, { seed: seed + 3, amp: 1.5, edge: false, shadow: false });
  x.fillStyle = '#fff'; x.font = '42px Brand'; x.textAlign = 'center'; x.fillText('KOSTAS COFFEE · kostascoffee.gr', w / 2, h - 56);
  const q0 = 850, q1 = 120, m = 26; x.fillStyle = '#fff'; x.fillRect(q0 - 20, q1 - 20, 11 * m + 40, 11 * m + 40); x.fillStyle = C.ink;
  QR.forEach((v, k) => { const i = k % 11, j = (k / 11) | 0; if (v && !(proof && i === 6 && j === 5)) x.fillRect(q0 + i * m, q1 + j * m, m, m); });
  for (const [i, j] of [[0, 0], [7, 0], [0, 7]]) { x.fillRect(q0 + i * m, q1 + j * m, 4 * m, 4 * m); x.fillStyle = '#fff'; x.fillRect(q0 + (i + 0.6) * m, q1 + (j + 0.6) * m, 2.8 * m, 2.8 * m); x.fillStyle = C.ink; x.fillRect(q0 + (i + 1.2) * m, q1 + (j + 1.2) * m, 1.6 * m, 1.6 * m); }
  x.fillStyle = C.paper; x.font = '36px Round'; x.fillText('Κράτηση', q0 + 5.5 * m, q1 + 11 * m + 58);
  marker(x, 64 + n0 + nw / 2, 302, 56, 54, mk[0], 21);
  marker(x, q0 + 6.5 * m, q1 + 5.5 * m, 42, 42, mk[1], 22);
  marker(x, sx, 132, 54, 54, mk[2], 23);
}
// γύρος 3: το λογότυπο · διαφορά = «K0STAS» (μηδέν αντί για όμικρον) στο PROOF
const LOGO_D = 0.84, nameOf = proof => proof ? 'K0STAS' : 'KOSTAS';
const letterUV = proof => { const [lx, ly] = LETTER2(nameOf(proof)), s = LOGO_D / 400; return [0.5 + lx * s, 0.5 + ly * s]; };   // σε u,v του φύλλου (τετράγωνο)
function logoSheet(x, w, h, proof, p, seed) {
  paper(x, w, h, seed); cupLogo(x, w / 2, h / 2, w * LOGO_D, { name: nameOf(proof) });
  const [u, v] = letterUV(proof), s = w * LOGO_D / 400, lw = LETTER2(nameOf(proof))[2];
  marker(x, u * w, v * h, lw * s * 0.5 + 40, 32 * s + 16, p, proof ? 31 : 32);
}

const sheetTex = (round, proof, t) => {
  const Rd = ROUND[round], mk = Rd.mk.map(m => Math.round(mkP(t, m) * 20) / 20), key = `s${round}${proof ? 'p' : 'a'}`;
  if (round === 0) return D.tex(key, SW * PXC, SH * PXC, (x, w, h) => card(x, w, h, proof, mk, proof ? 31 : 30), ST.B + '|' + mk);
  if (round === 1) return D.tex(key, SW * PXC, SH * PXC, (x, w, h) => flyer(x, w, h, proof, mk, proof ? 41 : 40), ST.B + '|' + mk);
  const p = proof ? mk[0] : mk[1];
  return D.tex(key, SH * PXC, SH * PXC, (x, w, h) => logoSheet(x, w, h, proof, p, proof ? 51 : 50), ST.B + '|' + p);
};

// ---------- φύλλα στην κάτοψη ----------
const PI = Math.PI;
function cardFly(tau, i) { // hook: πτήση (tau < 0, από τον Στράτο πέρα από την πάνω άκρη) → κορυφή στο frame 0 (ταχύτητα 0: δένει το loop) → πτώση με αναπήδηση
  const zT = i ? ZB : ZT, rz0 = i ? 0.012 : -0.01, top = i ? 24 : 18, rzA = i ? -0.3 : 0.24;
  if (tau < 0) { const k = easeOut(clamp(1 + tau / (FLY * (i ? 0.8 : 1)), 0, 1)); return { z: lerp(zT + 62, zT + 4, k), y: lerp(34, top, k), rz: rz0 + rzA + (1 - k) * 1.6, rx: 0.12 + 0.3 * (1 - k) }; }
  const f = M.fall(tau, 0, -top, 0, { g: 300, e: 0.22, v0: i ? -30 : 0 }), u = easeInOut(clamp(tau / LAND[i], 0, 1));
  return { z: lerp(zT + 4, zT, u), y: Math.max(0, -f.y) + 0.05, rz: lerp(rz0 + rzA, rz0, u), rx: 0.12 * (1 - u) };
}
const LAND = [0, 1].map(i => { for (let t = 0; t < 2; t += 0.005) if (M.fall(t, 0, -(i ? 24 : 18), 0, { g: 300, e: 0.22, v0: i ? -30 : 0 }).hit >= 0) return t; return 0.5; }); // 1η πρόσκρουση κάθε κάρτας
const sheetItem = (i, w, s, tex) => ({ t: tex, w, h: SH, pos: [i ? 0.4 : -0.3, R.desk.y + s.y, s.z], anchor: [0.5, 0.5], rot: [PI / 2 - s.rx, 0, s.rz], lift: 0.12 });
const restOf = i => ({ z: i ? ZB : ZT, y: 0.05, rz: i ? 0.012 : -0.01, rx: 0 });
function sheetItems(t) {
  const round = t < C1 || t >= C4 ? 0 : t < C2 ? 1 : 2, w = round === 2 ? SH : SW, out = [];
  for (const i of [0, 1]) {
    const tex = t >= C4 ? sheetTex(0, !!i, -1) : sheetTex(round, !!i, t);
    const s = round === 0 ? cardFly(tauHook(t), i) : restOf(i);
    if (s.z > 70) continue;
    out.push(sheetItem(i, w, s, tex));
  }
  return out;
}
const deskPt = (i, u, v) => { const p = D.world(sheetItem(i, SH, restOf(i), null), u, v); return [p[0], p[2]]; };   // σημείο του λογότυπου (γύρος 3) → [x, z] στο γραφείο

// μεγεθυντικός φακός + χέρι του Στράτου (γύρος 3) · υφή: φακός πάνω, λαβή, γροθιά, μπράτσο προς τα κάτω · η μεγέθυνση γίνεται 2D (lensFX)
const MAGW = 520, MAGH = 1500, MPX = 36, LENS_Y = 9, LR = 176 / MPX;   // ύψος φακού πάνω από το γραφείο · ακτίνα γυαλιού (cm)
const magTex = () => D.tex('mag', MAGW, MAGH, (x, w) => {
  reach(x, w / 2, 700, 0, 1, { hand: 'fist', seed: 80 });
  cut(x, rrPts(w / 2 - 20, 430, 40, 260, 16), C.navy, { seed: 81, amp: 1, edgeW: 5 });
  x.save(); x.lineWidth = 34; x.strokeStyle = '#fff'; x.beginPath(); x.arc(w / 2, 240, 196, 0, 7); x.stroke(); x.lineWidth = 24; x.strokeStyle = C.navy; x.stroke(); x.restore();
});
const ZERO = () => deskPt(1, ...letterUV(true));
function magState(t) { // σημείο του γραφείου που κοιτάει ο φακός → θέση του φακού (στην ακτίνα της κάμερας) + μεγέθυνση
  const a = S3 - 0.3, hold = VT.W('αντι'), out = hold + 0.6;
  if (t < a || t >= out) return null;
  const Z = ZERO(), K = [[a, [8, ZB - 40]], [a + 0.6, deskPt(0, 0.4, 0.4)], [a + 1.35, deskPt(1, 0.62, 0.3)], [a + 2.1, deskPt(0, 0.66, 0.68)], [a + 2.8, deskPt(1, 0.36, 0.7)], [a + 3.4, Z], [hold, Z], [out, [2, ZB - 46]]];
  const [px, pz] = M.kf(t, K), wob = Math.sin(t * 7) * (t > a + 3.4 && t < hold ? 0.12 : 0.4), c = camAt(t).pos, k = (c[1] - LENS_Y) / c[1];
  const pos = V.add(c, V.mul(V.sub([px + wob, R.desk.y, pz], c), k));
  return { pos, rz: 0.12 + wob * 0.05, zoom: 1.6 + 0.8 * M.springTo(t, VT.W('Μηδ') - 0.1, 0, 1, { f: 2.4, z: 0.5 }) };
}
function magItem(t) {
  const m = magState(t); if (!m) return null;
  return { t: magTex(), w: MAGW / MPX, h: MAGH / MPX, anchor: [0.5, 240 / MAGH], pos: m.pos, rot: [PI / 2 - 0.15, 0, m.rz], zBias: 30 };
}
function lensFX(ctx, t, cam) { // ό,τι φαίνεται μέσα στο γυαλί × zoom (αντιγραφή του frame γύρω από το κέντρο)
  const m = magState(t); if (!m) return;
  const c = cam.proj(m.pos), ex = cam.proj(V.add(m.pos, [LR, 0, 0])), ez = cam.proj(V.add(m.pos, [0, 0, LR]));
  const rx = Math.hypot(ex[0] - c[0], ex[1] - c[1]), ry = Math.hypot(ez[0] - c[0], ez[1] - c[1]), ang = Math.atan2(ex[1] - c[1], ex[0] - c[0]);
  const s = Math.ceil(2 * Math.max(rx, ry) / m.zoom) + 4, Q = D.scratch('lens', 600, 600), z = m.zoom;
  Q.x.clearRect(0, 0, 600, 600); Q.x.drawImage(ctx.canvas, c[0] - s / 2, c[1] - s / 2, s, s, 0, 0, s, s);
  ctx.save(); ctx.beginPath(); ctx.ellipse(c[0], c[1], rx, ry, ang, 0, 2 * PI); ctx.clip();
  ctx.drawImage(Q.c, 0, 0, s, s, c[0] - s * z / 2, c[1] - s * z / 2, s * z, s * z);
  ctx.fillStyle = 'rgba(220,231,250,0.10)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(c[0], c[1], rx * 0.84, ry * 0.84, ang, 3.6, 4.4); ctx.stroke();
  ctx.restore();
}

// ---------- μεσαίο πλάνο: Στράτος πίσω από το γραφείο διαβάζει το μήνυμα → facepalm ----------
// stratosItem με φαρδύτερη υφή (640·s κόβει τα χέρια που ανοίγουν έξω) → BACKLOG: option πλάτους στο props/diorama.js
function stratosWide(cam, t, o, wide = 1.7) {
  const pos = o.pos, pxcm = cam.F / Math.max(20, cam.toCam(V.add(pos, [0, 140, 0]))[2]), s = clamp(Math.round(pxcm * 175 / 1243 * 1.15 * 4) / 4, 0.75, 3.25);
  const cw = Math.ceil(640 * wide * s), ch = Math.ceil(1320 * s), sy = 400 * s, PX = 1243 * s / 175;
  const it = { w: cw / PX, h: ch / PX, anchor: [0.5, (sy + 878 * s) / ch], pos, clip: o.clip }, w0 = ST.warn ? ST.warn.length : 0;
  it.t = D.tex('stratosW', cw, ch, x => stratos(x, cw / 2, sy, s, { mouth: lipsync([], 'smile'), blink: blinkNow(), ...o.pose }), t + ':' + s);
  if (ST.warn) for (let k = ST.warn.length - 1; k >= w0; k--) { const w = ST.warn[k]; if (/safe zone/.test(w.msg)) { ST.warn.splice(k, 1); continue; } const q = cam.proj(D.world(it, w.x / cw, w.y / ch)); w.x = q[0]; w.y = q[1]; }
  return it;
}
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.3, look: 8 }],
  [MSG_PH, { aL: 0.12, aR: 0.12, brows: 0.9, look: 10, eyes: 'dot' }],
  [MSG_TX + 0.15, { aL: 0.12, aR: 0.12, brows: -0.3, look: 10, eyes: 'tired' }],
  [PALM, { aL: 0.12, aR: -2.65, hR: 'open', front: true, brows: -0.4, eyes: 'tired', tilt: 0.06 }],
];
const stratosMed = (cam, t) => stratosWide(cam, t, { pos: ST_POS, pose: poseSpring(POSES, t), clip: behindDesk(cam, R) });

function build(t) {
  const cam = D.camera(camAt(t)), med = t >= C3 && t < C4;
  const items = [...roomItems(R, { shelf: [-18, 96] }), ...sheetItems(t)];
  if (med) items.push(stratosMed(cam, t));
  const mg = magItem(t); if (mg) items.push(mg);
  return { cam, items, R, ...LIGHT, patch: 0.9, shaft: med ? 0.8 : 0.4, dust: med ? 90 : 40, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
}
const MB = t => t >= TOTAL - FLY - 0.05 && t < TOTAL - 0.25 ? 3 : 1;   // πτήση των καρτών (και στο frame 0 → loop)

// ---------- 2D από πάνω: ετικέτες ΑΡΧΕΙΟ / PROOF · χρονόμετρο · φακός · κινητό · CTA ----------
function timer(ctx, t, a, b) {
  if (t < a - 0.1 || t > b + 0.45) return;
  const u = clamp((t - a) / (b - a), 0, 1), n = Math.max(0, 4 - Math.floor(u * 4 + 1e-6)), lt = t - a, out = easeIn(prog(t, b + 0.25, b + 0.45));
  const x = 930, y = 958, sh = n === 0 ? M.shake(t, b, 10) : [0, 0];
  L.pop(ctx, lt, 0, x + (sh[0] || 0), y, () => {
    ctx.scale(1 - out, 1 - out);
    cut(ctx, circlePts(0, 0, 70, 70, 26), n === 0 ? C.gold : C.paper, { seed: 90, amp: 2, edgeW: 7 });
    if (n > 0) { ctx.fillStyle = 'rgba(40,84,243,0.25)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 56, -PI / 2, -PI / 2 + 2 * PI * (1 - u)); ctx.closePath(); ctx.fill(); }
    const pn = L.spring(prog(lt % ((b - a) / 4), 0, 0.3));
    ctx.save(); ctx.scale(0.8 + 0.2 * pn, 0.8 + 0.2 * pn); txt(ctx, String(n), 0, 4, { font: 'bold 72px Round', color: C.navy }); ctx.restore();
  }, -0.05);
}
// φωτογραφία του πελάτη: στοίβα τυπωμένων καρτών «K0STAS» πάνω σε τραπέζι
function stackPhoto(c, x, y, w, h) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = '#C9A27A'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(90,50,20,0.18)'; for (let k = 0; k < 6; k++) c.fillRect(x, y + k * h / 6 + 8, w, 3);
  const cx = x + w / 2, cy = y + h / 2 + 6;
  for (let k = 6; k >= 0; k--) {
    c.save(); c.translate(cx + (k % 3 - 1) * 5 + k * 2, cy + k * 5); c.rotate(-0.08 + (k % 2) * 0.05 + k * 0.012);
    c.fillStyle = 'rgba(40,20,10,0.25)'; c.fillRect(-118, -64, 240, 136); c.fillStyle = '#FBF8F1'; c.fillRect(-122, -70, 240, 136);
    c.fillStyle = BR; c.beginPath(); c.arc(-74, -2, 40, 0, 7); c.fill();
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '34px Brand'; c.fillText('K0STAS', -24, -16); c.font = '18px Brand'; c.fillText('COFFEE', -22, 16);
    c.restore();
  }
  c.restore();
}
function SCENE(ctx, t) {
  D.frame(ctx, t, build, { mb: MB(t) });
  const cam = D.camera(camAt(t));
  lensFX(ctx, t, cam);
  if (t < C3) { // ετικέτες στην πάνω-αριστερή γωνία κάθε φύλλου (όχι στο τέλος: frame 0 χωρίς ετικέτες)
    const r = ROUND[t < C1 ? 0 : t < C2 ? 1 : 2], w = t >= C2 ? SH : SW;
    for (const i of [0, 1]) { const z = (i ? ZB : ZT) + SH / 2, q = cam.proj([-w / 2 + 2, 0, z]); stamp(ctx, t, r.st[i], Math.max(150, q[0] + 70), q[1] - 4, i ? 'PROOF' : 'ΑΡΧΕΙΟ', -0.07, i ? BRAND : C.navy, 40); }
    timer(ctx, t, r.a, r.b);
  }
  if (t >= C3 && t < C4) { // κινητό: ο πελάτης στέλνει φωτογραφία της στοίβας + ερώτηση
    const k = M.springTo(t, PHONE, 0, 1, { f: 2.2, z: 0.55 });
    if (k > 0.01) phoneFrame(ctx, lerp(1400, 775, k), 860, 450, 660, (c, w, h) => {
      c.fillStyle = C.navy; c.fillRect(0, 0, w, 96); txt(c, 'Πελάτης', w / 2, 56, { font: 'bold 38px Round', color: '#fff' });
      if (t >= MSG_PH) L.pop(c, t, MSG_PH, 0, 0, () => { msgBubble(c, 20, 112, w - 60, 262, '', { seed: 7 }); stackPhoto(c, 36, 126, w - 96, 232); });
      if (t >= MSG_TX) L.pop(c, t, MSG_TX, 0, 0, () => {   // κάτω άκρη κειμένου ≤ y 1150 (εικονίδια δεξιά)
        msgBubble(c, 20, 390, w - 60, 186, '', { seed: 8 });
        [['Γιατί οι κάρτες', ''], ['γράφουν K0STAS', 'bold '], ['με μηδέν;', '']].forEach(([s, b], i) => txt(c, s, 38, 428 + i * 46, { font: `${b}34px Round`, color: C.ink, align: 'left' }));
      });
    }, { rot: -0.05, seed: 7300 });
  }
  if (t >= C4) { // CTA (φεύγει πριν από το loop)
    const out = easeIn(prog(t, LOOP_AT - 0.25, LOOP_AT));
    if (out < 1) { ctx.save(); ctx.translate(540, 1240); ctx.scale(1 - out, 1 - out); ctx.translate(-540, -1240); ctaButton(ctx, t, CTA, 540, 1240, 'Γράψε πόσες βρήκες'); ctx.restore(); }
  }
}

// ---------- ήχος ----------
const SFX = [
  [LAND[0], 'thud', { gain: 0.8, note: 'κάρτα 1' }], [LAND[1], 'thud', { gain: 0.8, seed: 2, note: 'κάρτα 2' }], [ZOOM - 0.05, 'zoom', { gain: 0.6 }],
  [STAMPS[0], 'stamp', { gain: 0.5 }], [STAMPS[1], 'stamp', { gain: 0.5, seed: 3 }],
  [TOTAL - FLY, 'swoosh', { gain: 0.6, note: 'νέες κάρτες' }],
];
ROUND.forEach((r, j) => {
  if (j) for (const s of r.st) SFX.push([s, 'stamp', { gain: 0.45, seed: 10 + j }]);
  for (let k = 0; k < 4; k++) SFX.push(j < 2 ? [r.a + k * (r.b - r.a) / 4, 'click', { gain: 0.7, seed: k }] : [r.a + k * (r.b - r.a) / 4, 'ticks', { count: 1, f: 2100 * Math.pow(1.18, k), gain: 0.8 }]);
  SFX.push([r.b, 'beep', { gain: 0.5 }]);
  r.mk.forEach((m, i) => SFX.push([m, 'pop', { gain: 0.8, seed: 20 + i }]));
});
SFX.push([S3 - 0.3, 'swoosh', { gain: 0.4, seed: 6, note: 'φακός μπαίνει' }], [VT.W('Μηδ') - 0.1, 'zoom', { gain: 0.5, seed: 4, note: 'μεγέθυνση στο 0' }],
  [PHONE + 0.1, 'blip', { gain: 0.6 }], [MSG_PH, 'blip', { gain: 0.7, seed: 4 }], [MSG_TX, 'blip', { gain: 0.7, seed: 9 }],
  [PALM + 0.3, 'thud', { gain: 0.35, seed: 7, note: 'facepalm' }], [CTA, 'pop', { gain: 0.6 }]);

module.exports = require('./render.js')({
  name: 'ep03_diafores', CUTS, SCENE, LOOP: 'cut', LOOP_AT, TAG, CAPS, HOOK_END: VT.E('καρτ') > 4 ? VT.W('καρτ') + 0.5 : VT.E('καρτ'),
  VO_FILE: 'vo/ep03_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/ep03.mp3', SFX,
});
