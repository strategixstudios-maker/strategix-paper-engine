// ORGANIC — «Το Εργαστήριο» · Ποιο είναι το τελικό; · Στράτος + Φοίβος + Ρένα · VO διαλόγου (Stratos · Phoebus · Rena) + SFX · 29,9s · seamless loop
// Φόρμα «ο ειδικός του τίποτα»: ο πελάτης στέλνει logo_final / final2 / FINAL_final… · ο Φοίβος («υπεύθυνος όταν λείπει ο Στράτος») διαλέγει με κανόνα
// «όσα περισσότερα final, τόσο πιο τελικό» και πάει στο laser · ο Στράτος τον σταματάει · Ρένα: «Θέλει το πρώτο.» · tip: ημερομηνία στο όνομα, όχι «final».
// Mockumentary: hard cuts, snap zoom, talking heads σε σταθερό κάδρο ανά χαρακτήρα. Loop: νέο logo_final.pdf στο κινητό = frame 0.
const L = require('./lib.js');
const { C, W, cut, rrPts, rectPts, circlePts, txt, pop, captionSeq, lerp, prog, easeOut, easeIn, easeInOut, lipsync } = L;
const { stratos, poseAt } = require('./stratos.js');
const { phoebus, rena, crewHandPos, mug } = require('./crew.js');
const { BRAND, reception, RECEPTION, camAt, wallShelf, bgFlat, laserMachine, notebook, stamp, seriesTag, ctaButton, checkChip, phoneFrame } = require('./props.js');

// VO = vo/er01_vo.mp3 @ 0,2s (text-to-dialogue eleven_v3 · take 2/2 · παύσεις → 0,3s · punchline κολλητά · 0,6s βλέμμα μετά) + vo/er01_vo.who.json (ποιος μιλάει πότε)
// Χρονισμοί φράσεων (video) · Ρ = Ρένα, Φ = Φοίβος, Σ = Στράτος:
// 0,30 Ρ Ποιο απ' όλα είναι το τελικό; | 2,07 Φ Όταν λείπει ο Στράτος, (3,27) υπεύθυνος είμαι εγώ. | 4,47 Ρ Έστειλε τρία.
// 5,53 Φ Κανόνας: (6,30) όσα περισσότερα final, (7,73) τόσο πιο τελικό. | 8,73 Ρ Ήρθε κι άλλο! | 9,90 Φ Πιο τελικό. (10,77) Αλλάζουμε!
// 11,57 Ρ Κι άλλο. (12,27) Σίγουρα final. | 13,60 Φ Το σίγουρα κερδίζει. (14,80) Πάμε, μωρό μου! | 15,73 Σ Στοπ! (16,37) Ρώτησε κανείς τον πελάτη;
// 17,87 Ρ Ρώτησα. Θέλει το πρώτο. (–19,13) | 19,73 Σ Όχι final. (20,77) Βάλε ημερομηνία στο όνομα. (22,57) Κι εμείς (23,23) ελέγχουμε κάθε αρχείο. (–24,50)
// 24,83 Φ Νέος κανόνας: (25,83) το πρώτο κερδίζει. | 27,03 Ρ Κάνε tag τον Φοίβο της δουλειάς σου. (–28,90)
const T = { r2: 4.47, kan: 5.53, osa: 6.3, toso: 7.73, r3: 8.73, pio: 9.9, allaz: 10.77, r4: 11.57, sig: 12.27, p4: 13.6, pame: 14.8, stop: 15.73, rotise: 16.37,
  r5: 17.87, proto: 18.45, ochi: 19.73, vale: 20.77, emeis: 22.57, neos: 24.83, kerd: 25.83, tag: 27.03, voEnd: 28.9 };
// λήψεις (hard cuts): A hook κινητό · B TH Φοίβου · C1 Ρένα · C2 Φοίβος στον πάγκο · D1/D2 laser · R Ρένα (insert) · E Στράτος «Στοπ» · F Ρένα punchline · G snap Φοίβος · H TH Στράτου · I TH Φοίβου (tag) · J CTA κινητό
const CUT = { B: 1.95, C: 4.3, C2: 5.42, D1: 8.55, R: 11.45, D2: 12.2, E: 15.62, F: 17.72, G: 19.18, H: 19.7, I: 24.72, J: 26.92, NEW: 29.1, END: 29.9 };
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV) · ανά χαρακτήρα από το .who.json (ST.VOWHO)
const TAG = 'Το Εργαστήριο', HOOK = 'Ποιο απ\' όλα είναι το τελικό;';
const F1 = 'logo_final.pdf', F2 = 'logo_final2.pdf', F3 = 'logo_FINAL_final.pdf', F4 = 'logo_final_FINAL_αυτό.pdf', F5 = 'logo_ΣΙΓΟΥΡΑ_final.pdf', FD = 'logo_26-09.pdf';
const mix = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));
const blink = off => ((L.ST.T + off) % 2.7) > 2.58;
// snap zoom (mockumentary): η κάμερα «πηδάει» από z0 σε z1 σε 0,12s
const snap = (t, t0, a, b) => mix(a, b, easeOut(prog(t, t0, t0 + 0.12)));

// ---------- 1η χρήση (inline): αρχείο PDF · συνομιλία · ταμπελάκι ομιλητή · lower third ----------
function pdfIcon(ctx, x, y, s, seed) { // σελίδα με διπλωμένη γωνία + ταινία «PDF»
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, [[-30, -40], [14, -40], [30, -24], [30, 40], [-30, 40]], '#fff', { seed, amp: 1, edgeW: 4 });
  cut(ctx, [[14, -40], [14, -24], [30, -24]], '#D5DCEA', { seed: seed + 1, amp: 0.5, edge: false, shadow: false });
  cut(ctx, rrPts(-38, 2, 58, 26, 6), BRAND, { seed: seed + 2, amp: 0.8, edgeW: 3, shadow: false });
  txt(ctx, 'PDF', -9, 16, { font: '18px Brand', color: '#fff' });
  ctx.restore();
}
// κάρτα αρχείου: εικονίδιο + όνομα · o.check ✓ (brand blue) · o.cross ✗ (σβησμένο)
function fileChip(ctx, x, y, name, o = {}) {
  const fs = o.fs || 36, font = `bold ${fs}px Round`, sd = o.seed || 6100; ctx.save(); ctx.font = font; const tw = ctx.measureText(name).width; ctx.restore();
  const h = fs * 2.3, mk = o.check || o.cross ? h * 0.85 : 0, w = tw + h + 44 + mk, x0 = x - w / 2;
  cut(ctx, rrPts(x0, y - h / 2, w, h, 20), o.bg || C.paper, { seed: sd, amp: 2, edgeW: 7 });
  pdfIcon(ctx, x0 + h * 0.52, y, h / 105, sd + 3);
  txt(ctx, name, x0 + h + 6, y + 2, { font, color: o.cross ? '#7D879C' : C.ink, align: 'left' });
  const mx = x0 + w - h * 0.52;
  if (o.cross) {
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 + h, y + 2); ctx.lineTo(x0 + h + 12 + tw, y - 2); ctx.stroke(); ctx.restore();
    cut(ctx, circlePts(mx, y, h * 0.32), C.navy, { seed: sd + 5, amp: 1, edgeW: 4, shadow: false });
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; const k = h * 0.12; ctx.beginPath(); ctx.moveTo(mx - k, y - k); ctx.lineTo(mx + k, y + k); ctx.moveTo(mx + k, y - k); ctx.lineTo(mx - k, y + k); ctx.stroke(); ctx.restore();
  }
  if (o.check) { cut(ctx, circlePts(mx, y, h * 0.32), BRAND, { seed: sd + 6, amp: 1, edgeW: 4, shadow: false }); L.check(ctx, mx, y, h / 90, '#fff'); }
}
// κινητό της Ρένας: WhatsApp με τον πελάτη (εκτός κάδρου: μόνο εικονίδιο) · files = [[όνομα, ώρα, t εμφάνισης], ...]
const PHONE = [540, 1090, 700, 1000];
function chat(ctx, t, files) {
  phoneFrame(ctx, ...PHONE, (c, w) => {
    c.fillStyle = '#E6ECF7'; c.fillRect(0, 0, w, 1000);
    cut(c, rectPts(-10, -10, w + 20, 134), C.navy, { seed: 7300, amp: 1, edge: false, shadow: false });
    cut(c, circlePts(78, 68, 40), C.sky, { seed: 7301, amp: 1, edgeW: 3, shadow: false });
    cut(c, circlePts(78, 56, 14), C.paper, { seed: 7302, amp: 0.5, edge: false, shadow: false });
    cut(c, [[54, 98], [58, 80], [70, 74], [86, 74], [98, 80], [102, 98]], C.paper, { seed: 7303, amp: 0.5, edge: false, shadow: false });
    txt(c, 'Πελάτης', 140, 52, { font: 'bold 40px Round', color: '#fff', align: 'left' });
    txt(c, 'online', 140, 94, { font: '26px Round', color: C.sky, align: 'left' });
    cut(c, rrPts(w / 2 - 90, 158, 180, 46, 23), C.pale, { seed: 7304, amp: 1, edgeW: 3, shadow: false });
    txt(c, 'Σήμερα', w / 2, 181, { font: '26px Round', color: '#5A6A8C' });
    files.forEach(([name, time, st], i) => pop(c, t, st, 30, 236 + i * 172, () => {
      cut(c, [[10, 16], [-20, 4], [18, 44]], '#fff', { seed: 7311 + i, amp: 1, edgeW: 4 });
      cut(c, rrPts(0, 0, w - 90, 148, 24), '#fff', { seed: 7310 + i * 3, amp: 1.5, edgeW: 5 });
      pdfIcon(c, 64, 74, 0.95, 7320 + i * 3);
      txt(c, name, 118, 56, { font: 'bold 32px Round', color: C.ink, align: 'left' });
      txt(c, 'PDF · 1 σελίδα', 118, 100, { font: '24px Round', color: '#8A94A8', align: 'left' });
      txt(c, time, w - 142, 118, { font: '22px Round', color: '#8A94A8' });
    }, -0.01));
  });
}
// caption διαλόγου: ταμπελάκι με το όνομα του ομιλητή στην κάτω-αριστερή γωνία του caption (το seriesTag είναι δεξιά)
const SPK = { rena: ['Ρένα', C.sky, C.navy], phoebus: ['Φοίβος', BRAND, '#fff'], stratos: ['Στράτος', C.navy, '#fff'] };
function dialogCaps(ctx, t, seq) {
  captionSeq(ctx, t, seq);
  let i = -1; for (let k = 0; k < seq.length; k++) if (t >= seq[k][0]) i = k; if (i < 0) return;
  const [st, , who] = seq[i], [name, bg, col] = SPK[who]; ctx.font = 'bold 34px Round'; const tw = ctx.measureText(name).width + 48;
  pop(ctx, i ? t : t + 1, st, (W - L.CAP.w) / 2 + 40 + tw / 2, L.ST.capBottom + 4, () => { cut(ctx, rrPts(-tw / 2, -30, tw, 60, 18), bg, { seed: 31, amp: 2, edgeW: 6 }); txt(ctx, name, 0, 2, { font: 'bold 34px Round', color: col }); }, -0.03);
}
// lower third (mockumentary): όνομα + ρόλος, κάτω-αριστερά μέσα στο safe zone
function lowerThird(ctx, t, st, end, name, role) {
  const k = 1 - easeIn(prog(t, end - 0.25, end)); if (t < st || k <= 0) return;
  const x = lerp(-400, 90, easeOut(prog(t, st, st + 0.3))) - (1 - k) * 600;
  ctx.save(); ctx.translate(x, 1330); ctx.rotate(-0.02);
  cut(ctx, rectPts(0, -64, 470, 128), C.paper, { seed: 6200, amp: 4, step: 18 });
  cut(ctx, rectPts(0, -64, 18, 128), BRAND, { seed: 6201, amp: 1, edge: false, shadow: false });
  txt(ctx, name, 44, -18, { font: 'bold 50px Round', color: C.navy, align: 'left' });
  txt(ctx, role, 46, 34, { font: '38px Hand', color: C.mid, align: 'left' });
  ctx.restore();
}
const outK = (ctx, k, x, y) => { ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); };

// ---------- χαρακτήρες: πόζες με keyframes (poseAt, stratos.js) σε global χρόνο ----------
const PH_POSES = [
  [0, {}],
  [CUT.B, { aR: 0.55, eR: 1.9, hR: 'point', front: true, brows: 0.7 }],                          // TH: «υπεύθυνος είμαι εγώ» — δείχνει τον εαυτό του
  [3.2, { aR: 0.55, eR: 1.9, hR: 'point', front: true, brows: 1.0, eyes: 'happy' }],
  [CUT.C, { look: -10, brows: 0.3 }],                                                            // ακούει τη Ρένα
  [T.kan - 0.1, { aR: 1.4, eR: -1.6, hR: 'point', brows: 0.9, look: 6 }],                        // «Κανόνας»: δάχτυλο ψηλά
  [T.toso - 0.1, { aR: 1.4, eR: -1.6, hR: 'point', brows: 1.0, eyes: 'happy', look: 6 }],
  [CUT.D1, { look: -12, brows: 0.6 }],                                                           // laser: η Ρένα φωνάζει από τα αριστερά
  [T.pio - 0.1, { aL: 1.9, eL: -0.3, hL: 'point', brows: 0.9, look: -8 }],                       // δείχνει το νέο αρχείο
  [T.allaz - 0.1, { aR: 1.4, eR: -1.6, hR: 'fist', eyes: 'happy', brows: 1.0 }],
  [CUT.D2, { look: -12, brows: 0.5 }],
  [T.p4 - 0.1, { aL: 1.4, eL: -1.6, hL: 'thumb', brows: -0.3 }],
  [T.pame - 0.1, { aL: 0.9, eL: -0.2, hL: 'point', brows: 0.8, eyes: 'happy', look: -8 }],        // «Πάμε»: δείχνει το laser
  [CUT.I - 0.3, {}],
  [CUT.I, { aL: 1.4, eL: -1.6, hL: 'point', brows: 0.9 }],                                       // TH tag: «Νέος κανόνας»
  [T.kerd - 0.1, { aL: 1.4, eL: -1.6, hL: 'point', brows: 1.0, eyes: 'happy' }],
];
function phoebusAt(ctx, t, x, y, s, o = {}) {
  const p = poseAt(PH_POSES, t);
  const eyes = t >= CUT.G && t < CUT.H ? 'shock' : p.eyes;
  phoebus(ctx, x, y, s, { seed: 2000, ...p, eyes, brows: t >= CUT.G && t < CUT.H ? 1.2 : p.brows, look: t >= CUT.G && t < CUT.H ? 0 : p.look,
    goggles: t >= T.p4 - 0.1 && t < CUT.G ? 'eyes' : 'head',                                     // στο σοκ τα σπρώχνει στο μέτωπο
    blink: blink(0.9), mouth: t >= CUT.G && t < CUT.H ? 'shock' : lipsync(VO, 'smile', 'phoebus'), ...o });
}
const RE_POSES = [
  [0, { aR: 0.9, eR: 1.2, hR: 'grip' }],
  [T.r2 - 0.1, { aR: 1.2, eR: 1.75, hR: 'grip', brows: 0.1 }],                                   // «Έστειλε τρία»: σηκώνει το κινητό
  [T.kan, { aR: 0.9, eR: 1.2, hR: 'grip', look: 10, brows: -0.1 }],                              // κοιτάει τον Φοίβο
  [CUT.R, { aR: 1.2, eR: 1.75, hR: 'grip', look: 0, brows: -0.2 }],                              // insert: κούπα, βλέμμα στην κάμερα
  [CUT.F, { aR: 1.2, eR: 1.75, hR: 'grip', look: 0, brows: 0.1 }],                               // punchline: κινητό στο χέρι
];
function renaAt(ctx, t, prop) {
  const [dx, dy, ds] = RECEPTION.desk, y = dy + 14 * ds, p = poseAt(RE_POSES, t);
  rena(ctx, dx, y, ds, { seed: 3000, legs: false, ...p, blink: blink(1.7), mouth: lipsync(VO, 'flat', 'rena') });
  const [hx, hy] = crewHandPos('rena', 1, p.arms[1], ds, dx, y, p.elbowR);
  if (prop === 'mug') mug(ctx, hx, hy, ds * 0.9, { steam: t });
  else { // κινητό (πλάτη προς εμάς)
    ctx.save(); ctx.translate(hx + 4 * ds, hy - 40 * ds); ctx.rotate(-0.12); ctx.scale(ds, ds);
    cut(ctx, rrPts(-44, -84, 88, 168, 18), C.navy, { seed: 3500, amp: 1.5, edgeW: 5 });
    cut(ctx, circlePts(-18, -58, 10), '#2B3A66', { seed: 3501, amp: 0.5, edge: false, shadow: false });
    L.brandMark(ctx, 0, 20, 18, C.sky);
    ctx.restore();
  }
}
const ST_POSES = [
  [0, {}],
  [CUT.E, { aR: 1.2, eR: -1.3, hR: 'open', iR: 'stop', brows: -0.4 }],                          // «Στοπ!»
  [T.rotise - 0.1, { aL: 0.5, aR: 0.5, eL: -1.1, eR: -1.1, hL: 'open', hR: 'open', iL: 'shrug', iR: 'shrug', brows: 0.9 }],
  [CUT.H, { aL: 1.4, eL: -1.6, hL: 'point', brows: 0.4 }],                                       // tip: «Όχι final»
  [T.vale - 0.1, { aL: 1.6, eL: -0.35, hL: 'point', look: -10, brows: 0.5 }],                    // δείχνει τα αρχεία
  [T.emeis - 0.1, { aL: 1.4, eL: -1.6, hL: 'thumb', eyes: 'happy', brows: 0.6 }],               // «ελέγχουμε κάθε αρχείο»
];
const stratosAt = (ctx, t, x, y, s, o = {}) => stratos(ctx, x, y, s, { seed: 1000, ...poseAt(ST_POSES, t), blink: blink(0), mouth: lipsync(VO, 'smile', 'stratos'), ...o });

// ---------- σκηνικό laser (όπως pf01): ράφι με ρολά · laser με notebook στην κηρήθρα · πάτωμα ----------
const MX = 400, MY = 1126, MW = 700, MU = MW / 1000, PX = 790, PY = 872, PS = 0.7;
function laserRoom(ctx, t, cam, who) {
  ctx.save(); camAt(ctx, ...cam);
  wallShelf(ctx);
  cut(ctx, rectPts(-40, 1430, W + 80, 600), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  laserMachine(ctx, MX, MY, MW, { lid: 0, lt: t, inside: c => notebook(c, 0, 0, 0.58, 0, { sy: 0.5, engrave: 0, edgeW: 5, seed: 4100 }) });
  if (who === 'phoebus') phoebusAt(ctx, t, PX, PY, PS);
  if (who === 'stratos') stratosAt(ctx, t, PX - 90, PY - 8, 0.72);
  ctx.restore();
}
// το αρχείο που «φόρτωσε» ο Φοίβος στο laser: κάρτα πάνω από το μηχάνημα, αλλάζει με κάθε νέο final
function laserFile(ctx, t) {
  const list = [[CUT.D1, F3], [T.pio, F4], [T.sig, F5]];
  let i = 0; while (i + 1 < list.length && t >= list[i + 1][0]) i++;
  const [st, name] = list[i], k = i ? L.spring(prog(t, st, st + 0.45)) : 1;
  ctx.save(); ctx.translate(MX + 40, 790); ctx.scale(1, Math.max(0.05, k)); ctx.translate(-MX - 40, -790);
  fileChip(ctx, MX + 40, 790, name, { fs: 34, seed: 6300 + i * 10, check: true });
  ctx.restore();
}

// ---------- λήψεις (global t) ----------
const CAPS = [[-1, HOOK, 'rena'], [CUT.B, 'Όταν λείπει ο Στράτος, υπεύθυνος είμαι εγώ.', 'phoebus'], [T.r2 - 0.05, 'Έστειλε τρία.', 'rena'],
  [T.kan - 0.05, 'Κανόνας: όσα περισσότερα final...', 'phoebus'], [T.toso - 0.05, '...τόσο πιο τελικό.', 'phoebus'], [T.r3 - 0.05, 'Ήρθε κι άλλο!', 'rena'], [T.pio - 0.05, 'Πιο τελικό. Αλλάζουμε!', 'phoebus'],
  [T.r4 - 0.05, 'Κι άλλο: «ΣΙΓΟΥΡΑ final».', 'rena'], [T.p4 - 0.05, 'Το ΣΙΓΟΥΡΑ κερδίζει. Πάμε, μωρό μου!', 'phoebus'],
  [T.stop - 0.08, 'Στοπ! Ρώτησε κανείς τον πελάτη;', 'stratos'], [T.r5 - 0.05, 'Ρώτησα. Θέλει το πρώτο.', 'rena'],
  [T.ochi - 0.05, 'Όχι «final». Βάλε ημερομηνία στο όνομα.', 'stratos'], [T.emeis - 0.05, 'Κι εμείς ελέγχουμε κάθε αρχείο.', 'stratos'],
  [T.neos - 0.05, 'Νέος κανόνας: το πρώτο κερδίζει.', 'phoebus'], [T.tag - 0.05, 'Κάνε tag τον Φοίβο της δουλειάς σου.', 'rena'], [CUT.NEW, HOOK, 'rena']];
const THP = [700, 900, 1.6], THP0 = [700, 930, 1.4];                                              // TH Φοίβου (σταθερό κάδρο) · πριν το snap
function shot(ctx, t) {
  if (t < CUT.B) { bgFlat(ctx, C.pale, '#BFD0F0', 21); return chat(ctx, t, [[F1, '17:52', -1], [F2, '17:53', 0.55], [F3, '17:55', 1.05]]); }
  if (t < CUT.C) { laserRoom(ctx, t, snap(t, CUT.B + 0.05, THP0, THP), 'phoebus'); return lowerThird(ctx, t, CUT.B + 0.3, CUT.C, 'Φοίβος', 'ο υπεύθυνος'); }
  if (t < CUT.C2) return reception(ctx, t, { cam: RECEPTION.cams.close, behind: c => renaAt(c, t) });
  if (t < CUT.D1) { // ο Φοίβος στον πάγκο, μπροστά από τη Ρένα (κρύβεται πίσω του)
    const [fx, fy, fs] = RECEPTION.spot(0, -60);
    reception(ctx, t, { cam: [700, 1000, 1.4], front: c => phoebusAt(c, t, fx, fy, fs) });
    stamp(ctx, t, T.kan, 330, 600, 'ΚΑΝΟΝΑΣ', -0.08, BRAND, 60);
    [F1, F2, F3].forEach((f, i) => pop(ctx, t, T.osa + i * 0.15, 770, 578 + i * 110, () => fileChip(ctx, 0, 0, f, { fs: 30, seed: 6400 + i * 10, check: i === 2 && t >= T.toso }), 0.02 * (i - 1)));
    return;
  }
  if (t < CUT.R) { laserRoom(ctx, t, [600, 1000, 1.12], 'phoebus'); return laserFile(ctx, t); }
  if (t < CUT.D2) return reception(ctx, t, { cam: RECEPTION.cams.close, behind: c => renaAt(c, t, 'mug') });
  if (t < CUT.E) {
    laserRoom(ctx, t, [600, 1000, 1.12], 'phoebus'); return laserFile(ctx, t);
  }
  if (t < CUT.F) return laserRoom(ctx, t, [700, 900, 1.4], 'stratos');
  if (t < CUT.G) {
    reception(ctx, t, { cam: RECEPTION.cams.close, behind: c => renaAt(c, t) });
    return pop(ctx, t, T.proto, 540, 1330, () => fileChip(ctx, 0, 0, F1, { fs: 36, seed: 6500, check: true }), -0.03);
  }
  if (t < CUT.H) return laserRoom(ctx, t, snap(t, CUT.G + 0.02, [PX, 760, 1.8], [PX, 740, 2.7]), 'phoebus');
  if (t < CUT.I) {
    reception(ctx, t, { cam: [390, 900, 2.05], behind: c => stratosAt(c, t, ...RECEPTION.desk, { legs: false }) });
    pop(ctx, t, T.ochi, 330, 700, () => fileChip(ctx, 0, 0, F3, { fs: 30, seed: 6600, cross: true }), -0.03);
    pop(ctx, t, T.vale + 0.35, 330, 860, () => fileChip(ctx, 0, 0, FD, { fs: 36, seed: 6610, check: true }), 0.02);
    return checkChip(ctx, t, T.emeis + 0.2, 330, 1040, 'Ελέγχουμε', { fs: 44, seed: 6620, rot: -0.02 });
  }
  if (t < CUT.J) { laserRoom(ctx, t, snap(t, CUT.I + 0.05, THP0, THP), 'phoebus'); return stamp(ctx, t, T.neos, 340, 612, 'ΝΕΟΣ ΚΑΝΟΝΑΣ', -0.08, BRAND, 56); }
  bgFlat(ctx, C.pale, '#BFD0F0', 21); chat(ctx, t, [[F1, '17:52', CUT.NEW]]);
  const k = 1 - easeIn(prog(t, CUT.NEW - 0.2, CUT.NEW + 0.05)); if (k > 0) { ctx.save(); outK(ctx, k, 540, 1380); ctaButton(ctx, t, T.tag + 0.4, 540, 1380, 'Κάνε tag'); ctx.restore(); }
}
function world(ctx, t) {
  shot(ctx, t);
  dialogCaps(ctx, t, CAPS);
  if (t < CUT.B) seriesTag(ctx, t + 1, TAG);                                                      // ήδη στο frame 0 · μόνο με το caption του hook
  else if (t >= CUT.NEW) seriesTag(ctx, (t - CUT.NEW) * 2.5, TAG);                                 // ξανά στο τέλος (loop)
}
const scene = t0 => (ctx, lt) => world(ctx, t0 + lt);
const cuts = [0, CUT.B, CUT.C, CUT.C2, CUT.D1, CUT.R, CUT.D2, CUT.E, CUT.F, CUT.G, CUT.H, CUT.I, CUT.J, CUT.END];

require('./render.js')({
  name: 'er01_teliko',
  SCENES: cuts.slice(0, -1).map((a, i) => [scene(a), cuts[i + 1] - a]),
  LOOP: 'cut',                                    // seamless: νέο logo_final.pdf στο κινητό + caption του hook = frame 0
  VO_FILE: 'vo/er01_vo.mp3', VO_AT: 0.2,
  SFX: [
    [0.55, 'blip', { note: 'αρχείο 2' }], [1.05, 'blip', { seed: 2, note: 'αρχείο 3' }],
    [CUT.B + 0.05, 'zoom', { note: 'snap zoom · TH Φοίβου' }], [CUT.B + 0.3, 'slide', { dur: 0.3, gain: 0.6, note: 'lower third' }],
    [T.kan, 'stamp', { note: 'ΚΑΝΟΝΑΣ' }],
    ...[0, 1, 2].map(i => [T.osa + i * 0.15, 'pop', { seed: i, gain: 0.7, note: `αρχείο ${i + 1}` }]), [T.toso, 'ding', { note: '✓ FINAL_final' }],
    [T.r3 - 0.1, 'blip', { seed: 3, note: 'νέο αρχείο' }], [T.pio, 'click', { note: '→ final_FINAL_αυτό' }],
    [T.sig, 'blip', { seed: 4, note: '→ ΣΙΓΟΥΡΑ_final' }], [T.p4, 'click', { seed: 2, note: 'γυαλιά στα μάτια' }], [T.pame + 0.1, 'beep', { count: 2, note: 'laser έτοιμο' }],
    [CUT.E - 0.05, 'swoosh', { note: 'μπαίνει ο Στράτος' }], [T.stop, 'thud', { gain: 0.7, note: '«Στοπ!»' }],
    [T.proto, 'ding', { seed: 2, note: '✓ το πρώτο' }],
    [CUT.G + 0.02, 'zoom', { seed: 2, note: 'snap zoom · βλέμμα Φοίβου' }], [CUT.G + 0.05, 'boing', { gain: 0.7 }],
    [T.ochi, 'stamp', { gain: 0.7, note: '✗ FINAL_final' }], [T.vale + 0.35, 'pop', { seed: 5, note: 'logo_26-09' }], [T.vale + 0.47, 'ding', { seed: 3, gain: 0.6 }],
    [T.emeis + 0.2, 'pop', { seed: 6, note: '✓ Ελέγχουμε' }],
    [CUT.I + 0.05, 'zoom', { seed: 3, note: 'snap zoom · TH Φοίβου' }], [T.neos, 'stamp', { seed: 2, note: 'ΝΕΟΣ ΚΑΝΟΝΑΣ' }],
    [T.tag + 0.4, 'click', { note: 'CTA «Κάνε tag»' }],
    [CUT.NEW, 'blip', { seed: 5, note: 'νέο logo_final.pdf = frame 0 (loop)' }],
  ],
});
