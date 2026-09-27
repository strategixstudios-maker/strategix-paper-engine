// «Μάθε με τον Στράτο» — Galvo ή XY; (galvo vs το Mira 7 του εργαστηρίου) · host: Στράτος · VO ElevenLabs «Stratos» + SFX · 33,0s · seamless loop (LOOP: 'cut')
// Hook: split screen, ίδιο λογότυπο σε σουβέρ · πάνω galvo laser (τελειώνει σε 1s) · κάτω gantry laser (3 γραμμές) → 1 galvo laser ολόκληρο με διάφανο κέλυφος:
// πηγή → 2 καθρεφτάκια (spring υψηλής συχνότητας) → φακός · zoom στους καθρέφτες + φτερό → 2 gantry κάτοψη: όλο το κεφάλι σε ράγες (raster: επιτάχυνση-φρενάρισμα,
// σωλήνας αέρα follow-through, το σώμα τρέμει στην αλλαγή κατεύθυνσης) + κάρτα ταχύτητας → 3 Στράτος «Όχι πάντα» (poseSpring, παλάμη «στοπ») → 4 galvo + μεγάλη ταμπέλα:
// κόκκινο preview = μικρό πεδίο, η κουκκίδα «χτυπάει» στο όριο → 5 Mira 7: πρόσοψη → κοπή σε όλο το τραπέζι (κάτοψη, ⏩) → καπάκι με spring, τα χέρια σηκώνουν την ταμπέλα,
// οι κύκλοι των τρυπών πέφτουν (βαρύτητα + squash) → 6 σύνοψη (αντικείμενα πέφτουν στις κάρτες) → 7 CTA → snap zoom στο παράθυρο του Mira → split screen = frame 0.
// Όροι (v2, κατ' απαίτηση): «galvo laser» / «gantry laser» (έτσι τα λένε κατασκευαστές και ελληνικοί προμηθευτές), όχι σκέτο «galvo / XY».
// Χάραξη galvo (v2): η δέσμη ξαναπερνάει όλο το σχέδιο πολύ γρήγορα → όλο το λογότυπο σκουραίνει με κάθε πέρασμα (+ λάμπει όσο δουλεύει), όχι σάρωση από πάνω προς τα κάτω.
// Πρώτο επεισόδιο με motion.js (STYLE_GUIDE §1b). Ισχυρισμοί (Αλέξανδρος, 2026-09-28): έχει galvo ΚΑΙ Mira 7 (gantry) · κόβει plexiglass στο Mira 7 · «Mira 7» στο βίντεο.
// Χωρίς νούμερα (§5.11 — datasheet Mira 7: 700×450 mm, ως 1200 mm/s, 5G: όχι στο βίντεο). Η κοπή είναι time-lapse (⏩ στην οθόνη).
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, captionSeq, lerp, clamp, prog, easeOut, easeIn, easeInOut, lipsync, blinkNow, cam, snap } = L;
const M = require('./motion.js');
const { stratos, poseSpring } = require('./stratos.js');
const { BRAND, bgFlat, seriesTag, stamp, sparkle, reach, kostasLogo, laserMachine, honeycomb, wallShelf, checkChip } = require('./props.js');

// VO = vo/ms02_vo.mp3 @ 0,2s — `node vo.js ms02` take 1 (seed 1000, με χρόνους λέξεων) · παύσεις → 0,3s · «Όχι πάντα» κολλητά (--keep 10:0.08). 32,31s.
// Χρονισμοί (video · `node ms02_galvo_xy.js vo` · λέξεις: vo/ms02_vo.words.json):
// 0,27 Ίδιο λογότυπο. | 1,43 Γιατί το πάνω τελείωσε ήδη; | 3,10 Στο γκάλβο λέιζερ κουνιούνται (4,46) μόνο δύο καθρεφτάκια. | 5,97 Δεν ζυγίζουν σχεδόν τίποτα, | 7,57 γι' αυτό πετάνε.
// 8,63 Στο γκάντρι λέιζερ τρέχει (9,97) όλο το κεφάλι (10,62) πάνω σε ράγες. | 11,80 Σε κάθε γραμμή | 12,83 φρενάρει (13,45) και ξαναξεκινάει.
// 14,50 Άρα κερδίζει το γκάλβο; (15,83) Όχι πάντα. | 16,67 Οι καθρέφτες | 17,45 φτάνουν (17,98) μόνο ένα (18,45) μικρό τετράγωνο. | 19,49 Το Μίρα Εφτά
// 20,38 μας φτάνει σε όλο (21,34) το τραπέζι, | 22,28 και κόβει ολόκληρη (23,91) την ταμπέλα. | 24,57 Μικρά και πολλά; | 25,80 Γκάλβο λέιζερ. | 26,97 Μεγάλα ή κοπή;
// 28,23 Γκάντρι λέιζερ. | 29,49 Εμείς έχουμε και τα δύο. | 31,26 Εσύ τι θα έφτιαχνες; (–32,30)
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const TAG = 'Μάθε με τον Στράτο', HOOK = 'Ίδιο λογότυπο. Γιατί το πάνω τελείωσε ήδη;';
const SC = [0, 2.95, 8.45, 14.4, 16.55, 19.4, 20.3, 22.2, 24.45, 29.35, 32.7, 33.6]; // αρχές σκηνών + τέλος video
const TAU = Math.PI * 2, GO = 0.35;                                                  // GO = «start» και στα δύο μηχανήματα του hook

// ---------- υλικά ----------
const WOOD = '#D8B283', WOODS = '#C49A68', BURN = '#4A2A14', ACR = '#CFE7F3', ACRS = '#B7D8EA', FROST = '#F6FBFF', ALU = '#AEB6C2', ALUD = '#8C95A3', DARK = '#1B2440', RED = '#FF4A3D';
// σουβέρ κόντρα πλακέ (κάτοψη · o.sy = προοπτική) · o.clip(c) = περιοχή που έχει καεί σε τοπικές μονάδες (κέντρο σουβέρ, gantry raster) · χωρίς clip = όλο χαραγμένο
// o.burn 0..1 = πόσο έχει σκουρύνει (galvo: όλο το σχέδιο μαζί, πέρασμα με πέρασμα) · o.pov 0..1 = το σχέδιο λάμπει όσο περνάει η δέσμη (persistence)
function coaster(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, o.sy || 1);
  cut(ctx, circlePts(0, 0, r), WOOD, { seed: o.seed || 8100, scribble: WOODS, amp: 2, edgeW: 7 });
  ctx.strokeStyle = 'rgba(120,80,40,0.28)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, TAU); ctx.stroke();
  ctx.save(); if (o.clip) { ctx.beginPath(); o.clip(ctx); ctx.clip(); } ctx.globalAlpha = o.burn ?? 1; if (ctx.globalAlpha > 0.005) kostasLogo(ctx, 0, 0, r * 1.86, { mono: BURN }); ctx.restore();
  if (o.pov > 0.01) { ctx.save(); ctx.globalAlpha = o.pov; ctx.globalCompositeOperation = 'lighter'; kostasLogo(ctx, 0, 0, r * 1.86, { mono: '#B85A18' }); ctx.restore(); }
  ctx.restore();
}
// ταμπέλα plexiglass με χαραγμένο (frosted) λογότυπο · τοπικές μονάδες 1000 × 460, κέντρο (0,0) · o.holes = κύκλοι των τρυπών ακόμα στη θέση τους
const SGN = { w: 1000, h: 460, r: 70, holes: [[-400, -150], [400, -150]], hr: 30 };
function sign(ctx, o = {}) {
  cut(ctx, rrPts(-SGN.w / 2, -SGN.h / 2, SGN.w, SGN.h, SGN.r), ACR, { seed: o.seed || 8400, amp: 2, edgeW: 7, scribble: ACRS });
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-360, -230); ctx.lineTo(-250, -230); ctx.lineTo(-420, 230); ctx.lineTo(-500, 230); ctx.lineTo(-500, 60); ctx.closePath(); ctx.fill(); ctx.restore();
  kostasLogo(ctx, -250, 40, 300, { mono: FROST });
  txt(ctx, 'KOSTAS', 150, 0, { font: '120px Brand', color: FROST }); txt(ctx, 'COFFEE', 150, 110, { font: '64px Brand', color: FROST });
  for (const [hx, hy] of SGN.holes) { ctx.fillStyle = o.holes === false ? 'rgba(16,26,51,0.55)' : 'rgba(120,160,190,0.35)'; ctx.beginPath(); ctx.arc(hx, hy, SGN.hr, 0, TAU); ctx.fill(); }
}
function hole(ctx, x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); cut(ctx, circlePts(0, 0, SGN.hr), ACR, { seed: 8410, amp: 1, edgeW: 5 }); ctx.restore(); }

// ---------- GALVO (1η χρήση) ----------
// δέσμη galvo στο σουβέρ (μονάδα = ακτίνα): κάθε πέρασμα = περίγραμμα (0,07s) + hatch όλου του σχεδίου (0,10s) → επαναλαμβάνεται πολύ γρήγορα
const GP = 0.17, GTOT = 1.17;
function galvoDot(tau) {
  const q = ((tau % GP) + GP) % GP;
  if (q < 0.07) { const a = -Math.PI / 2 + TAU * q / 0.07; return [0.86 * Math.cos(a), 0.86 * Math.sin(a)]; }
  const k = (q - 0.07) / 0.1, v = -0.8 + 1.6 * k, w = Math.sqrt(Math.max(0, 0.72 - v * v)), ph = (k * 14) % 2;
  return [(ph < 1 ? ph * 2 - 1 : 3 - ph * 2) * w, v];
}
// χάραξη galvo: burn = σκούρεμα όλου του σχεδίου (σκαλοπάτι ανά πέρασμα) · pov = λάμψη όσο δουλεύει (σβήνει σε 0,25s μετά το τέλος)
const galvoBurn = (tau, dur) => tau <= 0 ? 0 : Math.min(1, (Math.floor(tau / GP) + easeOut((tau % GP) / GP)) / Math.ceil(dur / GP));
const galvoPov = (tau, dur) => tau <= 0 ? 0 : tau < dur ? 0.55 : 0.55 * Math.max(0, 1 - (tau - dur) / 0.25);
function beam(ctx, x0, y0, x1, y1, col = '255,140,60', w = 7) {
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(${col},0.85)`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,248,230,0.95)'; ctx.lineWidth = w * 0.35; ctx.stroke(); ctx.restore();
}
function glow(ctx, x, y, r, col = '255,190,110') {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, `rgba(${col},0.85)`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
// καπνός με άνωση (3/4: ανεβαίνει) ή με ρεύμα αέρα (κάτοψη: προς το πίσω μέρος = πάνω) · at(te) → σημείο εκπομπής
function fumes(ctx, t, t0, t1, at, o = {}) {
  M.particles(ctx, t, { t0, t1, rate: o.rate ?? 34, life: o.life ?? 1.3, seed: o.seed ?? 3, at: te => at(te), vel: r => [(r() - 0.5) * 70, -40 - r() * 60],
    g: o.g ?? -160, drag: 1.4, wind: o.wind ?? 0,
    draw: (c, p) => { c.fillStyle = `rgba(232,236,244,${0.32 * (1 - p.k) * Math.min(1, p.age * 8)})`; c.beginPath(); c.arc(p.x, p.y, (8 + p.k * 46) * (o.s ?? 1), 0, TAU); c.fill(); } });
}
// σπίθες: πετάγονται, πέφτουν με βαρύτητα, αναπηδούν στο floor · σχήμα γραμμής κατά την ταχύτητα (motion blur)
function sparks(ctx, t, t0, t1, at, o = {}) {
  M.particles(ctx, t, { t0, t1, rate: o.rate ?? 60, life: o.life ?? 0.45, seed: o.seed ?? 5, at: te => at(te),
    vel: r => { const a = -Math.PI / 2 + (r() - 0.5) * (o.spread ?? 2.6), v = 300 + r() * 700; return [Math.cos(a) * v, Math.sin(a) * v]; },
    g: o.g ?? 2600, drag: o.drag ?? 1.2, floor: o.floor, bounce: 0.35,
    draw: (c, p) => { const a = 1 - p.k; if (a <= 0) return; c.strokeStyle = p.i % 3 ? `rgba(255,214,130,${a})` : `rgba(255,255,255,${a})`; c.lineCap = 'round'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022); c.stroke(); } });
}
// galvo σε 3/4: ντουλάπι, πλάκα με T-slots, κολόνα, κουτί laser + κεφαλή scanner + φακός · (x, y) = μπροστινή άκρη πλάκας (κέντρο)
// o.top(c) = ό,τι κάθεται στην πλάκα (τοπικές μονάδες: πλάκα y −200..0) · o.mir = [δ1, δ2] γωνίες καθρεφτών · o.h = πόσο πιο χαμηλά η κεφαλή
// o.xray = διάφανο κέλυφος: φαίνονται πηγή laser → καθρέφτης 1 → καθρέφτης 2 → φακός (o.beam = δέσμη ως τον φακό) · → [lx, ly] έξοδος φακού (canvas)
function galvoRig(ctx, x, y, s, o = {}) {
  const h = o.h || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, rrPts(-430, 40, 860, 300, 16), C.navy, { seed: 8300, scribble: '#16306E', amp: 2 });
  ctx.strokeStyle = 'rgba(143,176,238,0.35)'; ctx.lineWidth = 4; ctx.strokeRect(-390, 80, 380, 220); ctx.strokeRect(10, 80, 380, 220);
  cut(ctx, [[-420, -200], [420, -200], [462, 0], [-462, 0]], ALU, { seed: 8301, amp: 2, edgeW: 6 });
  cut(ctx, rectPts(-462, 0, 924, 44), ALUD, { seed: 8302, amp: 1.5, edge: false, shadow: false });
  ctx.strokeStyle = 'rgba(80,90,110,0.45)'; ctx.lineWidth = 5; for (let k = 1; k < 5; k++) { const yy = -200 + k * 40, xx = lerp(420, 462, k / 5); ctx.beginPath(); ctx.moveTo(-xx, yy); ctx.lineTo(xx, yy); ctx.stroke(); }
  if (o.top) { ctx.save(); o.top(ctx); ctx.restore(); }
  cut(ctx, rectPts(-370, -1030 + h, 92, 850 - h), C.silver, { seed: 8303, amp: 2, edgeW: 6 });
  ctx.strokeStyle = 'rgba(16,26,51,0.3)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-324, -1000 + h); ctx.lineTo(-324, -200); ctx.stroke();
  ctx.translate(0, h);
  const X = o.xray, shell = (pts, col, sd) => { if (!X) return cut(ctx, pts, col, { seed: sd, amp: 2, edgeW: 6 });
    ctx.save(); ctx.globalAlpha = 0.22; cut(ctx, pts, col, { seed: sd, amp: 2, edgeW: 6, shadow: false }); ctx.restore();
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); L.path(ctx, pts); ctx.stroke(); ctx.restore(); };
  shell(rrPts(-410, -1080, 460, 150, 18), C.navy, 8304);
  shell(rrPts(20, -1110, 250, 250, 20), '#16306E', 8305);
  const [d1, d2] = o.mir || [0, 0], M1 = [80, -1005], M2 = [185, -1005];
  if (X) { // εσωτερικό: σωλήνας laser, δέσμη, 2 γαλβανόμετρα (μοτέρ + καθρεφτάκι)
    cut(ctx, rrPts(-385, -1040, 360, 70, 30), '#DCEAF8', { seed: 8340, amp: 1.5, edgeW: 5 });
    ctx.fillStyle = 'rgba(255,140,90,0.35)'; ctx.fillRect(-360, -1016, 310, 22); txt(ctx, 'LASER', -205, -1004, { font: '38px Brand', color: C.navy });
    for (const ex of [-395, -30]) cut(ctx, rrPts(ex, -1030, 26, 50, 6), C.silver, { seed: 8341 + ex, amp: 0.5, edgeW: 3, shadow: false });
    if (o.beam) { beam(ctx, -25, M1[1], M1[0], M1[1]); beam(ctx, M1[0], M1[1], M2[0], M2[1] + d1 * 40); beam(ctx, M2[0], M2[1], 185, -718); }
    for (const [[mx, my], d, base, k] of [[M1, d1, 0.62, 0], [M2, d2, 2.36, 1]]) {
      cut(ctx, rrPts(mx - 20, my + 16, 40, 72, 10), C.silver, { seed: 8350 + k, amp: 1, edgeW: 4 });
      ctx.save(); ctx.translate(mx, my); ctx.rotate(base + d * 2.2); cut(ctx, rrPts(-40, -8, 80, 16, 5), '#F2F7FF', { seed: 8355 + k, amp: 0.5, edgeW: 4 });
      ctx.fillStyle = 'rgba(143,176,238,0.8)'; ctx.fillRect(-32, -3, 64, 6); ctx.restore();
    }
  } else { cut(ctx, rrPts(55, -1070, 180, 120, 12), '#0E1F4A', { seed: 8306, amp: 1, edge: false, shadow: false });
    for (const [mx, d] of [[105, d1], [185, d2]]) { ctx.save(); ctx.translate(mx, -1010); ctx.rotate(0.7 + d * 3); ctx.fillStyle = '#E8F0FA'; ctx.fillRect(-26, -6, 52, 12); ctx.restore(); } }
  cut(ctx, rrPts(135, -870, 100, 130, 10), '#222A3A', { seed: 8307, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(125, -752, 120, 34, 14), '#3A4560', { seed: 8308, amp: 1, edgeW: 4 });
  ctx.restore();
  return [x + 185 * s, y + (h - 718) * s];
}

// ---------- XY / MIRA 7 κάτοψη (1η χρήση) ----------
// raster γύρω από το σουβέρ: γραμμές στο bounding box του λογοτύπου (0,9 r) με overscan (φρενάρει έξω από το σχέδιο)
const rasOpts = X => ({ x0: X.cx - 0.9 * X.r, x1: X.cx + 0.9 * X.r, y0: X.cy - 0.9 * X.r, dy: X.dy, lines: Math.ceil(1.8 * X.r / X.dy) + 1, vmax: X.vmax, amax: X.amax, over: X.over, step: 0.06 });
const XY_HOOK = { cx: 540, cy: 1300, r: 190, dy: 8, vmax: 1100, amax: 7000, over: 50, t0: GO };
const XY_FULL = { cx: 540, cy: 1040, r: 330, dy: 12, vmax: 1300, amax: 9000, over: 60, t0: SC[2] - 2.1 };  // t0 νωρίτερα: η κεφαλή δουλεύει ήδη
// καμένες γραμμές (τοπικές μονάδες σουβέρ): όσες τελείωσαν + η τρέχουσα ως τη θέση της κεφαλής
const rasClip = (st, ro, X) => c => {
  const top = ro.y0 - X.cy - ro.dy / 2, x0 = ro.x0 - X.cx, x1 = ro.x1 - X.cx, yl = st.y - X.cy - ro.dy / 2;
  const full = st.done ? ro.lines : st.line + (st.part >= 1 ? 1 : 0);
  if (full > 0) c.rect(x0, top, x1 - x0, full * ro.dy);
  if (!st.done && st.part > 0 && st.part < 1) { const w = (x1 - x0) * st.part; c.rect(st.dir > 0 ? x0 : x1 - w, yl, w, ro.dy); }
};
// κηρήθρα + πλαίσιο + ράγες Y (στατικά)
function bedTop(ctx) {
  honeycomb(ctx);
  for (const [x0, w] of [[-60, 130], [1010, 130]]) cut(ctx, rectPts(x0, -60, w, H + 120), '#2A3148', { seed: 8500 + x0, amp: 2, edgeW: 6, scribble: '#323B57' });
  for (const x of [80, 978]) cut(ctx, rectPts(x, -60, 22, H + 120), C.silver, { seed: 8510 + x, amp: 1, edgeW: 4 });
}
// gantry: δοκός X που τρέχει στις ράγες Y + κεφαλή + αλυσίδα καλωδίων + σωλήνας αέρα (follow-through) · pos(tt) → [hx, by] σημείο δέσμης · on = ρίχνει
function gantry(ctx, t, pos, on, o = {}) {
  const [hx, by] = pos(t), gy = by - 62;
  ctx.fillStyle = 'rgba(10,16,34,0.2)'; ctx.fillRect(70, gy - 12, 940, 64);                                                 // σκιά στο τραπέζι
  cut(ctx, rectPts(62, gy - 28, 956, 56), C.silver, { seed: 8520, amp: 1.5, edgeW: 6 });
  ctx.strokeStyle = 'rgba(16,26,51,0.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(70, gy + 10); ctx.lineTo(1010, gy + 10); ctx.stroke();
  for (const x of [56, 972]) cut(ctx, rrPts(x, gy - 44, 52, 88, 10), C.navy, { seed: 8521 + x, amp: 1, edgeW: 5 });
  // αλυσίδα: η πάνω πλευρά τρέχει με την κεφαλή → οι κρίκοι κυλάνε
  const ph = ((hx % 24) + 24) % 24; ctx.fillStyle = '#3A4252';
  for (let x = 120 - 24 + ph; x < hx - 64; x += 24) if (x > 112) { ctx.fillRect(x, gy - 52, 19, 22); }
  ctx.strokeStyle = '#262C3A'; ctx.lineWidth = 3; ctx.strokeRect(112, gy - 52, Math.max(0, hx - 176), 22);
  // σωλήνας αέρα: κρέμεται από τη δεξιά βάση και ακολουθεί την κεφαλή με καθυστέρηση (ταλαντεύεται στις αλλαγές κατεύθυνσης)
  const l1 = M.lag(tt => pos(tt)[0], t, { f: 1.5, z: 0.28, win: 1.6 }), l2 = M.lag(tt => pos(tt)[0], t, { f: 0.9, z: 0.3, win: 2.2 });
  ctx.save(); ctx.lineCap = 'round'; const hose = () => { ctx.beginPath(); ctx.moveTo(hx + 36, gy - 40); ctx.bezierCurveTo(l1 + 70, gy - 190, l2 + 190, gy - 250, 996, gy - 150); };
  ctx.strokeStyle = '#5B77B8'; ctx.lineWidth = 20; hose(); ctx.stroke(); ctx.strokeStyle = C.sky; ctx.lineWidth = 12; hose(); ctx.stroke(); ctx.restore();
  // κεφαλή
  if (on) beam(ctx, hx, gy + 40, hx, by, '255,120,60', 8);
  cut(ctx, rrPts(hx - 56, gy - 64, 112, 100, 14), C.navy, { seed: 8530, amp: 1.5, edgeW: 6 });
  cut(ctx, circlePts(hx, gy - 14, 24), '#2A3558', { seed: 8531, amp: 1, edgeW: 4, shadow: false });
  cut(ctx, [[hx - 20, gy + 34], [hx + 20, gy + 34], [hx + 8, gy + 48], [hx - 8, gy + 48]], '#39435E', { seed: 8532, amp: 0.5, edge: false, shadow: false });
  if (o.hi) { ctx.save(); ctx.strokeStyle = BRAND; ctx.lineWidth = 10; ctx.setLineDash([26, 16]); ctx.lineDashOffset = -t * 90; ctx.globalAlpha = o.hi;
    ctx.strokeRect(50, gy - 80, 980, 136); ctx.restore(); }
}
// όλη η κάτοψη XY με raster χάραξη στο σουβέρ · κ. = αδράνεια: το σώμα μετακινείται λίγο αντίθετα στην επιτάχυνση της κεφαλής (lag → τρέμει)
function xyBed(ctx, t, X, o = {}) {
  const ro = rasOpts(X), R = tt => M.raster(tt - X.t0, ro), st = R(t);
  const kick = M.lag(tt => -R(tt).a * 0.0003, t, { f: 8, z: 0.22, win: 1 });
  ctx.save(); ctx.translate(kick, 0);
  bedTop(ctx);
  coaster(ctx, X.cx, X.cy, X.r, { clip: rasClip(st, ro, X) });
  if (t > X.t0) fumes(ctx, t, X.t0, Infinity, te => { const s = R(te); return s.on ? [s.x, s.y] : [-999, -999]; }, { g: -220, s: 0.8, seed: 11 });
  if (st.on) { glow(ctx, st.x, st.y, 60); sparks(ctx, t, t - 0.5, t, te => [R(te).x, R(te).y], { g: 0, drag: 5, spread: TAU, rate: 50, life: 0.25, seed: 13 }); }
  gantry(ctx, t, tt => { const s = R(tt); return [s.x, s.y]; }, st.on, o);
  ctx.restore();
  return st;
}

// ---------- σκηνές ----------
// hook: split screen · πάνω galvo κοντινό (3/4) · κάτω XY κάτοψη · tau = χρόνος από το start (≤ 0 = frame 0)
function galvoTop(ctx, t, tau) {
  cut(ctx, rectPts(-40, -40, W + 80, 1080), DARK, { seed: 8200, edge: false, shadow: false, scribble: '#232E52' });
  cut(ctx, rectPts(-40, 690, W + 80, 360), ALU, { seed: 8201, amp: 2, edgeW: 6 });
  ctx.strokeStyle = 'rgba(80,90,110,0.4)'; ctx.lineWidth = 6; for (const y of [735, 805, 890, 985]) { ctx.beginPath(); ctx.moveTo(-40, y); ctx.lineTo(W + 40, y); ctx.stroke(); }
  const CX = 540, CY = 860, R = 230, SY = 0.46, LX = 540, LY = 610;
  coaster(ctx, CX, CY, R, { sy: SY, burn: galvoBurn(tau, GTOT), pov: galvoPov(tau, GTOT) });
  const P = tt => { const q = galvoDot(tt); return [CX + q[0] * R, CY + q[1] * R * SY]; };
  fumes(ctx, t, GO, GO + GTOT, te => P(te - GO), { s: 0.6, seed: 21, g: -320, rate: 22 });
  cut(ctx, rrPts(340, 330, 400, 170, 20), C.navy, { seed: 8202, amp: 2, edgeW: 6 });
  cut(ctx, rrPts(485, 490, 110, 100, 10), '#222A3A', { seed: 8203, amp: 1.5, edgeW: 5 });
  cut(ctx, rrPts(472, 578, 136, 34, 14), '#3A4560', { seed: 8204, amp: 1, edgeW: 4 });
  if (tau > 0 && tau < GTOT) {
    M.streak(ctx, tau, P, { len: 0.06, n: 40, w: 7, col: '255,170,90', a: 0.9 });
    const [dx, dy] = P(tau); beam(ctx, LX, LY, dx, dy); glow(ctx, dx, dy, 50);
  }
}
function hookFrame(ctx, t, tau) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 1000, W, H - 1000); ctx.clip(); xyBed(ctx, GO + tau, XY_HOOK); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1000); ctx.clip(); galvoTop(ctx, t, tau); ctx.restore();
  cut(ctx, rectPts(-40, 985, W + 80, 30), C.paper, { seed: 8210, amp: 5, edgeW: 4 });                                          // σκισμένη λωρίδα ανάμεσα
  for (const [x, y, s, rot] of [[240, 612, 'GALVO LASER', -0.04], [250, 1088, 'GANTRY LASER', 0.03]]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = '46px Brand'; const w = ctx.measureText(s).width + 56;
    cut(ctx, rrPts(-w / 2, -40, w, 80, 40), C.paper, { seed: 8220 + x, amp: 2, edgeW: 7 }); txt(ctx, s, 0, 4, { font: '46px Brand', color: C.navy }); ctx.restore();
  }
}
function hook(ctx, t) {
  const tau = t - GO; hookFrame(ctx, t, tau);
  checkChip(ctx, t, GO + GTOT + 0.12, 800, 640, 'έτοιμο', { fs: 46, rot: 0.04 });
}
// 1 · galvo laser ολόκληρο με διάφανο κέλυφος: πηγή → καθρέφτης 1 → καθρέφτης 2 → φακός → σουβέρ · zoom στους καθρέφτες (spring υψηλής συχνότητας: σχεδόν χωρίς αδράνεια)
const GX = { x: 470, y: 1400, s: 0.95, h: 150, r: 150, j0: 3.1, dur: 4.3 };                    // j0/dur = η χάραξη σε αυτή τη σκηνή (πολλά περάσματα)
const GCAM = [[SC[1], [1, 540, 960, 540, 960]], [3.25, [2.1, 608, 607, 540, 930]], [5.9, [1, 540, 960, 540, 960]]];
function galvoXray(ctx, t) {
  bgFlat(ctx, C.pale, '#BFD0F0', 81);
  const sp = tt => tt < 7.57 ? tt - GX.j0 : 7.57 - GX.j0 + (tt - 7.57) * 1.8;                   // «γι' αυτό πετάνε» → πιο γρήγορα
  const tau = sp(t), on = tau > 0 && tau < GX.dur + 1.2;
  const loc = tt => { const q = galvoDot(sp(tt)); return [185 + q[0] * GX.r * 0.9, -100 + q[1] * GX.r * 0.9 * 0.4]; };
  const scr = ([u, v]) => [GX.x + u * GX.s, GX.y + (v) * GX.s];
  const [u, v] = M.lag(tt => galvoDot(sp(tt)), t, { f: 38, z: 0.6, win: 0.3, dt: 1 / 1000 });
  const c = M.springKeys(GCAM, t, { f: 1.2, z: 0.78 });
  ctx.save(); cam(ctx, c[1], c[2], c[0], c[3], c[4]);
  const [lx, ly] = galvoRig(ctx, GX.x, GX.y, GX.s, { h: GX.h, xray: true, beam: on, mir: on ? [v * 0.1, u * 0.12] : [0, 0],
    top: cc => coaster(cc, 185, -100, GX.r, { sy: 0.4, seed: 8120, burn: galvoBurn(tau, GX.dur), pov: on ? galvoPov(tau, GX.dur) : 0 }) });
  if (on) {
    fumes(ctx, t, GX.j0, SC[2], te => scr(loc(te)), { s: 0.5, seed: 31, g: -300, rate: 20 });
    sparks(ctx, t, GX.j0, SC[2], te => scr(loc(te)), { floor: GX.y - 60, rate: 30, life: 0.6, seed: 32 });
    M.streak(ctx, t, tt => scr(loc(tt)), { len: 0.05, n: 30, w: 6, col: '255,170,90' });
    const d = scr(loc(t)); beam(ctx, lx, ly, d[0], d[1]); glow(ctx, d[0], d[1], 45);
  }
  // κύκλοι γύρω από τους καθρέφτες
  for (const [mx, st] of [[80, 3.55], [185, 3.7]]) { const k = M.springTo(t, st, 0, 1, { f: 2.4, z: 0.4 }); if (k > 0.01 && t < 6.2) { const [px, py] = scr([mx, -1005 + GX.h]); ctx.save(); ctx.strokeStyle = BRAND; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(px, py, 42 * k, 0, TAU); ctx.stroke(); ctx.restore(); } }
  ctx.restore();
  if (t < 6.1) stamp(ctx, t, 3.5, 540, 600, '2 ΚΑΘΡΕΦΤΑΚΙΑ', -0.04, BRAND, 70);
  feather(ctx, t);
}
// φτερό: πέφτει αργά με αντίσταση αέρα + ταλάντωση (γέρνει προς την κίνηση) · «δεν ζυγίζουν σχεδόν τίποτα»
function feather(ctx, t) {
  const u = t - 5.97; if (u < 0) return;
  const sw = Math.sin(TAU * 0.75 * u), x = 880 + 70 * sw, y = 520 + 150 * u - 18 * Math.abs(Math.cos(TAU * 0.75 * u)), rot = 0.55 * Math.cos(TAU * 0.75 * u) + 0.3;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, [[0, -95], [26, -60], [34, -10], [26, 40], [8, 80], [-8, 80], [-26, 40], [-34, -10], [-26, -60]], '#FFFFFF', { seed: 8630, amp: 2, edgeW: 5 });
  ctx.strokeStyle = '#B9C4D8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(0, 120); ctx.stroke();
  ctx.lineWidth = 2; for (let k = -70; k < 70; k += 16) { ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(24, k - 16); ctx.moveTo(0, k); ctx.lineTo(-24, k - 16); ctx.stroke(); }
  ctx.restore();
}
// 2 · XY κάτοψη: όλο το κεφάλι · zoom στο φρενάρισμα · κάρτα ταχύτητας
function xyScene(ctx, t) {
  const ro = rasOpts(XY_FULL), st0 = M.raster(t - XY_FULL.t0, ro);
  const ZT = 11.75, z = M.springTo(t, ZT, 1, 1.85, { f: 1.3, z: 0.7 }), fx = M.springTo(t, ZT, 540, 836, { f: 1.3, z: 0.7 }), fy = M.springTo(t, ZT, 960, st0.y + 60, { f: 1.3, z: 0.7 });
  const hi = t > 9.97 && t < ZT ? Math.min(1, (t - 9.97) * 5, (ZT - t) * 5) : 0;
  ctx.save(); cam(ctx, fx, fy, z, 540, 960); xyBed(ctx, t, XY_FULL, { hi }); ctx.restore();
  if (t < 11.75) stamp(ctx, t, 9.97, 540, 600, 'ΟΛΟ ΤΟ ΚΕΦΑΛΙ', -0.04, BRAND, 72);
  speedCard(ctx, t, 12.6, ro);
}
// κάρτα: ταχύτητα της κεφαλής στον χρόνο → τραπέζια (φρενάρει σε κάθε γραμμή)
function speedCard(ctx, t, st, ro) {
  pop(ctx, t, st, 330, 1300, () => {
    cut(ctx, rrPts(-250, -130, 500, 260, 26), C.paper, { seed: 8700, amp: 3, edgeW: 8 });
    txt(ctx, 'ταχύτητα', -120, -88, { font: 'bold 40px Round', color: C.navy });
    const x0 = -220, x1 = 220, yb = 90, yt = -40, span = 2.4, n = 140;
    ctx.strokeStyle = 'rgba(16,26,51,0.3)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
    ctx.strokeStyle = BRAND; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const tt = t - span + span * i / n, v = Math.abs(M.raster(tt - XY_FULL.t0, ro).v) / ro.vmax; const px = lerp(x0, x1, i / n), py = lerp(yb, yt, v); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    const k = easeOut(prog(t, st + 0.5, st + 0.8)); if (k > 0) { ctx.globalAlpha = k; txt(ctx, 'φρενάρει', 130, -88, { font: 'bold 36px Round', color: RED }); ctx.globalAlpha = 1; }
  }, -0.02);
}
// 3 · Στράτος: «Άρα κερδίζει το galvo;» (shrug) → «Όχι πάντα.» (παλάμη «στοπ» που κουνιέται «όχι-όχι» + κεφάλι «όχι» — όχι σηκωμένο δάχτυλο από τη ράχη: διαβάζεται λάθος)
const NO_POSES = [[SC[3], { aL: 0.12, aR: 0.12, brows: 0.4, look: -10 }],
  [14.5, { aL: 0.55, aR: 0.55, eL: -1.15, eR: -1.15, hL: 'open', hR: 'open', iL: 'shrug', iR: 'shrug', brows: 1.0, look: -6, tilt: 0.05 }],
  [15.75, { aL: 0.12, aR: 1.1, eR: -1.5, hR: 'open', iR: 'stop', brows: 0.2, look: 0, tilt: 0 }]];
function noAlways(ctx, t) {
  wallShelf(ctx);
  cut(ctx, rectPts(-40, 1440, W + 80, 520), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  laserMachine(ctx, 250, 1440 - 400 * 0.44, 440, { label: 'MIRA 7', lt: t });
  const p = poseSpring(NO_POSES, t), wag = t > 15.95 ? Math.sin(TAU * 4.2 * (t - 15.95)) * Math.exp(-(t - 15.95) * 1.2) : 0;
  stratos(ctx, 690, 960, 0.86, { seed: 1000, legs: false, ...p, elbowR: p.elbowR + wag * 0.16, tilt: p.tilt - wag * 0.06, mouth: lipsync(VO, 'smile'), blink: blinkNow(), eyes: t > 15.8 ? 'happy' : 'dot' });
}
// 4 · galvo + μεγάλη ταμπέλα: κόκκινο preview γύρω από το πεδίο → μικρό τετράγωνο · η κουκκίδα πάει προς το «COFFEE» και αναπηδά στο όριο
const GR = { x: 460, y: 1300, s: 1.0, h: 230 }, FLD = { cx: 145, hw: 150 };                                           // πεδίο σε μονάδες ταμπέλας (κέντρο x 100)
function smallField(ctx, t) {
  bgFlat(ctx, C.pale, '#BFD0F0', 91);
  const z = M.springTo(t, 17.45, 1, 1.1, { f: 1.4, z: 0.6 });
  ctx.save(); cam(ctx, 560, 1180, z, 560, 1180);
  let dotL = null;                                                                                              // κουκκίδα σε μονάδες ταμπέλας
  const u = t - 16.65, per = 0.5, B0 = 18.4;
  if (u > 0 && t < B0) { const q = (u / per) % 1, s4 = q * 4, e = Math.floor(s4), f = s4 - e, h = FLD.hw, C4 = [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]]; dotL = [FLD.cx + lerp(C4[e][0], C4[e + 1][0], f), lerp(C4[e][1], C4[e + 1][1], f)]; }
  if (t >= B0) { let x = M.springKeys([[B0, FLD.cx], [B0 + 0.1, FLD.cx + 380]], t, { f: 2.2, z: 0.2 }), lim = FLD.cx + FLD.hw; if (x > lim) x = lim - (x - lim) * 0.8; dotL = [x, 0]; }
  const toScr = ([sx, sy]) => [GR.x + (40 + sx) * GR.s, GR.y + (-100 + sy * 0.4) * GR.s];
  const [lx, ly] = galvoRig(ctx, GR.x, GR.y, GR.s, { top: c => {
    c.translate(40, -100); c.scale(1, 0.4); sign(c, { seed: 8400 });
    const dim = easeOut(prog(t, 17.45, 17.8));
    if (dim > 0) { c.save(); c.fillStyle = `rgba(16,26,51,${0.45 * dim})`; c.beginPath(); c.rect(-560, -260, 1120, 520); c.rect(FLD.cx - FLD.hw, -FLD.hw, 2 * FLD.hw, 2 * FLD.hw); c.fill('evenodd'); c.restore();
      c.save(); c.strokeStyle = RED; c.lineWidth = 8; c.setLineDash([22, 14]); c.globalAlpha = dim; c.strokeRect(FLD.cx - FLD.hw, -FLD.hw, 2 * FLD.hw, 2 * FLD.hw); c.restore(); }
  }, h: GR.h, mir: dotL ? [dotL[1] / 1200, (dotL[0] - FLD.cx) / 1200] : [0, 0] });
  // κώνος που φτάνει η δέσμη (από τον φακό ως τις γωνίες του πεδίου)
  const cone = easeOut(prog(t, 17.5, 17.9));
  if (cone > 0) { const P4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => toScr([FLD.cx + a * FLD.hw, b * FLD.hw]));
    ctx.save(); ctx.fillStyle = `rgba(255,74,61,${0.14 * cone})`; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(P4[0][0], P4[0][1]); ctx.lineTo(P4[1][0], P4[1][1]); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(P4[3][0], P4[3][1]); ctx.lineTo(P4[2][0], P4[2][1]); ctx.closePath(); ctx.fill(); ctx.restore(); }
  if (dotL) { const [dx, dy] = toScr(dotL); beam(ctx, lx, ly, dx, dy, '255,74,61', 4); glow(ctx, dx, dy, 30, '255,90,80');
    if (u > 0 && t < B0) M.streak(ctx, t, tt => { const q = ((tt - 16.65) / per) % 1, s4 = Math.max(0, q) * 4, e = Math.min(3, Math.floor(s4)), f = s4 - e, h = FLD.hw, C4 = [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]]; return toScr([FLD.cx + lerp(C4[e][0], C4[e + 1][0], f), lerp(C4[e][1], C4[e + 1][1], f)]); }, { len: 0.12, n: 30, w: 6, col: '255,74,61' }); }
  if (t > 18.6) { const [xx, yy] = toScr([440, 0]); pop(ctx, t, 18.6, xx, yy, () => { ctx.strokeStyle = RED; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-36, -36); ctx.lineTo(36, 36); ctx.moveTo(36, -36); ctx.lineTo(-36, 36); ctx.stroke(); }, 0); }
  ctx.restore();
  stamp(ctx, t, 17.45, 540, 600, 'ΜΙΚΡΟ ΠΕΔΙΟ', -0.04, RED, 72);
}
// 5a · Mira 7 πρόσοψη: η κεφαλή πάει-έρχεται μέσα από το τζάμι, το σώμα τρέμει στις αλλαγές κατεύθυνσης
const MIRA_RAS = { x0: -300, x1: 300, y0: -236, dy: 0, lines: 60, vmax: 1500, amax: 11000, over: 70, step: 0.04 };
function onBed(c) { c.save(); c.translate(0, 10); c.scale(0.62, 0.3); sign(c, { seed: 8401 }); c.restore(); }
function miraFront(ctx, t) {
  wallShelf(ctx);
  cut(ctx, rectPts(-40, 1440, W + 80, 520), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  const R = tt => M.raster(tt - SC[5] + 2, MIRA_RAS), st = R(t), kick = M.lag(tt => -R(tt).a * 0.00035, t, { f: 7, z: 0.2, win: 1 });
  ctx.save(); ctx.translate(kick, 0); laserMachine(ctx, 540, 1440 - 400 * 0.88, 880, { label: 'MIRA 7', on: true, head: [st.x, -236], lt: t, inside: onBed }); ctx.restore();
  stamp(ctx, t, 19.55, 540, 600, 'MIRA 7', -0.04, BRAND, 80);
}
// 5b · κάτοψη: κοπή σε όλο το τραπέζι (τρύπες → περίγραμμα) · time-lapse ⏩
const SG = { cx: 540, cy: 1000, s: 0.74 };                                                   // ταμπέλα στο τραπέζι (κάτοψη)
const sgP = ([x, y]) => [SG.cx + x * SG.s, SG.cy + y * SG.s];
const circPoly = (cx, cy, r, n = 26) => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 2 + TAU * i / n; return sgP([cx + r * Math.cos(a), cy + r * Math.sin(a)]); });
function rrPoly(w, h, r, n = 7) { const P = [], cs = [[w / 2 - r, -h / 2 + r, -Math.PI / 2], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI]];
  P.push(sgP([0, -h / 2])); for (const [cx, cy, a0] of cs) for (let i = 0; i <= n; i++) { const a = a0 + Math.PI / 2 * i / n; P.push(sgP([cx + r * Math.cos(a), cy + r * Math.sin(a)])); } P.push(sgP([0, -h / 2])); return P; }
const H1 = circPoly(...SGN.holes[0], SGN.hr), H2 = circPoly(...SGN.holes[1], SGN.hr), OUT = rrPoly(SGN.w, SGN.h, SGN.r);
const CUTS = [{ P: H1, on: true }, { P: [H1[H1.length - 1], H2[0]], on: false }, { P: H2, on: true }, { P: [H2[H2.length - 1], OUT[0]], on: false }, { P: OUT, on: true }];
const CUTO = { vmax: 2300, amax: 24000, corner: 0.9, dwell: 0.02 }, CUT0 = SC[6] + 0.1;
CUTS.forEach((c, i) => { c.T = M.pathT(c.P, CUTO); c.t0 = i ? CUTS[i - 1].t0 + CUTS[i - 1].T : 0; });
function cutAt(tau) { tau = Math.max(0, tau); for (let i = 0; i < CUTS.length; i++) { const c = CUTS[i]; if (tau < c.t0 + c.T || i === CUTS.length - 1) { const m = M.pathMove(c.P, tau - c.t0, CUTO); return { ...m, k: i, on: c.on && !m.done && tau > c.t0 }; } } }
function strokeUpTo(ctx, P, len) { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); let s = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (s + l >= len) { const q = (len - s) / l; ctx.lineTo(lerp(P[i - 1][0], P[i][0], q), lerp(P[i - 1][1], P[i][1], q)); break; } ctx.lineTo(P[i][0], P[i][1]); s += l; } ctx.stroke(); }
function miraCut(ctx, t) {
  const tau = t - CUT0, st = cutAt(tau);
  bedTop(ctx);
  cut(ctx, rectPts(110, 560, 860, 880), ACR, { seed: 8800, amp: 2, edgeW: 6, scribble: ACRS });                // φύλλο plexiglass
  ctx.save(); ctx.translate(SG.cx, SG.cy); ctx.scale(SG.s, SG.s); ctx.globalAlpha = 0.9;
  kostasLogo(ctx, -250, 40, 300, { mono: FROST }); txt(ctx, 'KOSTAS', 150, 0, { font: '120px Brand', color: FROST }); txt(ctx, 'COFFEE', 150, 110, { font: '64px Brand', color: FROST }); ctx.restore();
  ctx.save(); ctx.strokeStyle = '#2B4A5E'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  CUTS.forEach((c, i) => { if (!c.on || i > st.k) return; strokeUpTo(ctx, c.P, i < st.k ? 1e9 : st.len); });
  ctx.restore();
  fumes(ctx, t, CUT0, SC[7], te => { const s = cutAt(te - CUT0); return s.on ? [s.x, s.y] : [-999, -999]; }, { g: -260, s: 0.8, seed: 41 });
  if (st.on) { glow(ctx, st.x, st.y, 70); sparks(ctx, t, t - 0.5, t, te => { const s = cutAt(te - CUT0); return [s.x, s.y]; }, { g: 0, drag: 5, spread: TAU, rate: 70, life: 0.25, seed: 43 }); }
  gantry(ctx, t, tt => { const s = cutAt(tt - CUT0); return [s.x, s.y]; }, st.on);
  // ολόκληρο το τραπέζι: διπλά βέλη
  const ar = M.springTo(t, 21.2, 0, 1, { f: 2, z: 0.5 });
  if (ar > 0.01) { ctx.save(); ctx.strokeStyle = BRAND; ctx.fillStyle = BRAND; ctx.lineWidth = 12; ctx.lineCap = 'round';
    const hw = 430 * ar, y = 1470; ctx.beginPath(); ctx.moveTo(540 - hw, y); ctx.lineTo(540 + hw, y); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * (hw + 18), y); ctx.lineTo(540 + s * (hw - 22), y - 26); ctx.lineTo(540 + s * (hw - 22), y + 26); ctx.closePath(); ctx.fill(); }
    ctx.restore(); }
  pop(ctx, t, 20.45, 905, 620, () => { cut(ctx, circlePts(0, 0, 58), C.paper, { seed: 8810, amp: 2, edgeW: 6 }); ctx.fillStyle = C.navy;
    for (const dx of [-22, 8]) { ctx.beginPath(); ctx.moveTo(dx - 10, -24); ctx.lineTo(dx + 22, 0); ctx.lineTo(dx - 10, 24); ctx.closePath(); ctx.fill(); } }, 0);
}
// 5c · καπάκι ανοίγει (βαρύ: spring με μικρή αναπήδηση στο στοπ) → χέρια σηκώνουν την ταμπέλα → οι κύκλοι των τρυπών πέφτουν στο τραπέζι (βαρύτητα + squash) → reward
const LIFT = 22.75, MW5 = 1300, MY5 = 1250;
function miraLift(ctx, t) {
  wallShelf(ctx);
  const lid = clamp(M.springTo(t, 22.25, 0, 1, { f: 1.7, z: 0.42 }), 0, 1.06), k = M.springTo(t, LIFT, 0, 1, { f: 1.5, z: 0.55, antic: 0.05 });
  const bedY = MY5 - 114 * MW5 / 1000, floor = bedY + 40;
  const lifted = t >= LIFT;
  laserMachine(ctx, 540, MY5, MW5, { label: 'MIRA 7', lid, head: [380, -250], lt: t, inside: lifted ? null : onBed });
  // οι κύκλοι: μένουν στη θέση τους μέχρι να σηκωθεί η ταμπέλα και μετά πέφτουν
  const S0 = 0.62 * MW5 / 1000;
  if (lifted) SGN.holes.forEach(([hx, hy], i) => {
    const x0 = 540 + hx * S0 + (i ? 30 : -30) * Math.min(1, t - LIFT), y0 = bedY + 10 * MW5 / 1000 + hy * S0 * 0.48 - 60;
    const f = M.fall(t, LIFT + 0.04 + i * 0.05, y0, floor + i * 14, { e: 0.42 }), sq = f.hit >= 0 ? 1 - Math.min(0.3, f.vi / 7000) * M.wobble(f.hit, 0, 1, 7, 0.35) : 1;
    ctx.save(); M.squash(ctx, x0, f.y + SGN.hr * S0 * 0.5, sq); ctx.translate(x0, f.y); ctx.scale(1, f.landed ? 0.45 : lerp(1, 0.45, clamp((t - LIFT) * 3))); hole(ctx, 0, 0, S0 * 1.1, (t - LIFT) * (i ? 6 : -5) * (f.landed ? 0 : 1)); ctx.restore();
  });
  if (t > LIFT - 0.25) {
    const sx = 540, sy = lerp(bedY + 10, 850, k), sc = lerp(S0, 0.8, k), syk = lerp(0.3, 1, clamp(k)), rot = -0.25 * (k - M.lag(tt => M.springTo(tt, LIFT, 0, 1, { f: 1.5, z: 0.55, antic: 0.05 }), t, { f: 1.2, z: 0.4, win: 1.2 }));
    const hin = easeOut(prog(t, LIFT - 0.25, LIFT)), hw = SGN.w / 2 * sc;
    if (lifted) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(sc, sc * syk); sign(ctx, { seed: 8401, holes: false }); ctx.restore(); }
    for (const s of [-1, 1]) { const tx = sx + s * (hw - 30) * Math.cos(rot), ty = sy + s * (hw - 30) * Math.sin(rot) + 20;
      reach(ctx, lerp(sx + s * 520, tx, hin), lerp(1900, ty, hin), s * 380, 820, { hand: 'fist', side: s > 0 ? -1 : 1, seed: 60 + (s > 0 ? 10 : 0) }); }
    if (t > 23.85) [[210, 700, 0.8], [880, 760, 0.7], [240, 1080, 0.6], [850, 1060, 0.8]].forEach(([x, y, s], i) => sparkle(ctx, x, y, s, t, 23.85 + i * 0.1, 8900 + i));
  }
}
// 6 · σύνοψη: μικρά αντικείμενα πέφτουν στην κάρτα galvo · ταμπέλα + σχήματα στην κάρτα XY
function pen(ctx) { cut(ctx, rrPts(-110, -16, 220, 32, 16), C.navy, { seed: 9001, amp: 1, edgeW: 5 }); cut(ctx, [[110, -12], [150, 0], [110, 12]], C.silver, { seed: 9002, amp: 0.5, edgeW: 4 }); ctx.fillStyle = C.silver; ctx.fillRect(-90, -24, 70, 10); txt(ctx, 'KOSTAS', 20, 2, { font: '20px Brand', color: C.silver }); }
function keychain(ctx) { cut(ctx, rrPts(-60, -40, 120, 80, 16), WOOD, { seed: 9003, amp: 1, edgeW: 5, scribble: WOODS }); kostasLogo(ctx, 10, 0, 64, { mono: BURN });
  ctx.strokeStyle = C.silver; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(-74, -40, 22, 0, TAU); ctx.stroke(); }
const DROPS = [[pen, 250, 24.62, -0.35], [keychain, 470, 24.74, 0.15], [c => coaster(c, 0, 0, 62, { seed: 9010 }), 640, 24.86, 0], [c => coaster(c, 0, 0, 62, { seed: 9011 }), 810, 24.98, 0], [pen, 520, 25.1, 0.2]];
function dropIn(ctx, t, t0, x, floorY, h, fn, rot0) {
  if (t < t0) return; const f = M.fall(t, t0, floorY - 520, floorY, { e: 0.38 });
  const sq = f.hit >= 0 ? 1 - Math.min(0.28, f.vi / 8000) * M.wobble(f.hit, 0, 1, 6, 0.32) : 1 + Math.min(0.12, f.v / 30000);
  ctx.save(); M.squash(ctx, x, f.y + h, sq); ctx.translate(x, f.y); ctx.rotate(f.landed ? rot0 * 0.3 : rot0 * (1 - (t - t0) * 2)); ctx.scale(1.35, 1.35); fn(ctx); ctx.restore();
}
function summary(ctx, t) {
  bgFlat(ctx, C.pale, '#BFD0F0', 101);
  for (const [y, h, rot, sd] of [[560, 400, -0.012, 9100], [1000, 420, 0.01, 9101]]) { ctx.save(); ctx.translate(540, y + h / 2); ctx.rotate(rot); cut(ctx, rectPts(-450, -h / 2, 900, h), C.paper, { seed: sd, amp: 5 }); ctx.restore(); }
  DROPS.forEach(([fn, x, t0, rot], i) => dropIn(ctx, t, t0, x, i === 4 ? 780 : 870, 50, fn, rot));
  // κάρτα XY: η ταμπέλα γλιστράει από δεξιά (τεντώνει όσο τρέχει, ζουλιέται στο σταμάτημα) + σχήματα κοπής πέφτουν
  if (t > 26.95) { const x = M.springTo(t, 26.95, 1500, 600, { f: 1.4, z: 0.42 }), v = M.deriv(tt => M.springTo(tt, 26.95, 1500, 600, { f: 1.4, z: 0.42 }), t);
    ctx.save(); M.squash(ctx, x, 1200, 1 + clamp(Math.abs(v) / 9000, 0, 0.18), 0); ctx.translate(x, 1200); ctx.rotate(-0.03); ctx.scale(0.52, 0.52); sign(ctx, { seed: 8402, holes: false }); ctx.restore(); }
  dropIn(ctx, t, 27.4, 200, 1330, 50, c => cut(c, L.starPts(0, 0, 58, 5, 0.45), WOOD, { seed: 9020, amp: 1, edgeW: 5, scribble: WOODS }), 0.4);
  dropIn(ctx, t, 27.55, 340, 1330, 50, c => cut(c, L.heartPts(0, 0, 3.4), BRAND, { seed: 9021, amp: 1, edgeW: 5 }), -0.3);
  stamp(ctx, t, 25.8, 330, 620, 'GALVO LASER', -0.05, BRAND, 66);
  stamp(ctx, t, 28.23, 350, 1062, 'GANTRY LASER', 0.04, BRAND, 66);
}
// 7 · CTA: Στράτος ανάμεσα στο galvo και το Mira 7 · «Εμείς έχουμε και τα δύο» (χέρια προς τα μηχανήματα) · «Εσύ τι θα έφτιαχνες;» (δείχνει κάτω) → snap zoom στο τζάμι
const CTA_POSES = [[SC[9], { aL: 0.12, aR: 0.12, brows: 0.4 }],
  [29.5, { aL: 1.05, aR: 1.05, eL: -0.45, eR: -0.45, hL: 'open', hR: 'open', brows: 0.8, eyes: 'happy' }],
  [31.25, { aL: 0.12, aR: 0.35, eR: -0.2, hR: 'point', brows: 1.0, look: 0 }]];
const ZIN = 32.4, MIRA_C = [835, 1146, 440];
function ctaScene(ctx, t) {
  const zk = easeIn(prog(t, ZIN, SC[10])), z = Math.exp(Math.log(2.6) * zk);
  ctx.save(); cam(ctx, MIRA_C[0] - 60, MIRA_C[1] - 60, z, lerp(MIRA_C[0] - 60, 540, zk), lerp(MIRA_C[1] - 60, 960, zk));
  wallShelf(ctx);
  const p = poseSpring(CTA_POSES, t);
  stratos(ctx, 540, 930, 0.78, { seed: 1000, legs: false, ...p, mouth: lipsync(VO, 'grin'), blink: blinkNow() });
  cut(ctx, rectPts(-40, 1330, W + 80, 700), C.navy, { seed: 6, scribble: '#1B2D62', edgeW: 8 });
  galvoRig(ctx, 205, 1330, 0.34, { top: c => coaster(c, 185, -100, 70, { sy: 0.4, seed: 9200 }) });
  laserMachine(ctx, MIRA_C[0], MIRA_C[1], MIRA_C[2], { label: 'MIRA 7', lt: t });
  ctx.restore();
}
// 8 · loop: το split screen του frame 0 · η κάμερα «κάθεται» με spring από το zoom
function loopHold(ctx, t) {
  const z = M.springTo(t, SC[10], 1.14, 1, { f: 2.4, z: 0.8 });
  ctx.save(); cam(ctx, 540, 960, z); hookFrame(ctx, 0, 0); ctx.restore();
}

// ---------- captions + ετικέτα σειράς ----------
const CAPS = [[-1, HOOK], [3.05, 'Στο galvo laser κουνιούνται...'], [4.42, '...μόνο δύο καθρεφτάκια.'], [5.92, 'Δεν ζυγίζουν σχεδόν τίποτα, γι\' αυτό πετάνε.'],
  [8.58, 'Στο gantry laser τρέχει όλο το κεφάλι...'], [10.57, '...πάνω σε ράγες.'], [11.75, 'Σε κάθε γραμμή...'], [12.78, '...φρενάρει και ξαναξεκινάει.'],
  [14.45, 'Άρα κερδίζει το galvo;'], [15.78, 'Όχι πάντα.'], [16.62, 'Οι καθρέφτες φτάνουν...'], [17.93, '...μόνο ένα μικρό τετράγωνο.'],
  [19.44, 'Το Mira 7 μας φτάνει σε όλο το τραπέζι,'], [22.23, '...και κόβει ολόκληρη την ταμπέλα.'],
  [24.52, 'Μικρά και πολλά;'], [25.75, 'Galvo laser.'], [26.92, 'Μεγάλα ή κοπή;'], [28.18, 'Gantry laser.'],
  [29.44, 'Εμείς έχουμε και τα δύο.'], [31.21, 'Εσύ τι θα έφτιαχνες; Γράψ\' το στα σχόλια.'], [SC[10], HOOK]];
const scene = fn => (t0) => (ctx, lt) => {
  const t = t0 + lt; fn(ctx, t); captionSeq(ctx, t, CAPS);
  if (t < SC[1]) seriesTag(ctx, t + 1, TAG);                                         // ήδη στο frame 0 · μόνο με το caption του hook
  if (t >= SC[10]) seriesTag(ctx, t - SC[10] + 1, TAG);                              // seamless loop: ξανά μαζί με το caption του hook
};
const FNS = [hook, galvoXray, xyScene, noAlways, smallField, miraFront, miraCut, miraLift, summary, ctaScene, loopHold];

require('./render.js')({
  name: 'ms02_galvo_xy',
  SCENES: FNS.map((fn, i) => [scene(fn)(SC[i]), SC[i + 1] - SC[i]]),
  WIPES: [1, 2, 3, 4, 5, 8, 9],                                                        // χωρίς wipe: πρόσοψη → κάτοψη → σήκωμα (ίδιο μηχάνημα) · snap zoom → loop
  LOOP: 'cut',
  VO_FILE: 'vo/ms02_vo.mp3', VO_AT: 0.2,
  SFX: [
    [GO, 'galvo', { dur: GTOT + 0.05, pan: -0.2, note: 'hook: galvo laser (πάνω)' }], [GO, 'laser', { dur: SC[1] - GO, pass: 0.63, gain: 0.6, pan: 0.2, note: 'hook: gantry laser (κάτω)' }],
    [GO + GTOT + 0.12, 'ding', { note: '✓ έτοιμο' }],
    [3.25, 'zoom', { gain: 0.5, note: 'zoom στην κεφαλή (διάφανη)' }], [GX.j0, 'galvo', { dur: SC[2] - GX.j0 - 0.05, seed: 2, gain: 0.8, note: 'καθρεφτάκια' }], [3.5, 'stamp', { note: '2 ΚΑΘΡΕΦΤΑΚΙΑ' }],
    [5.9, 'air', { dur: 1.6, gain: 0.5, note: 'zoom out + φτερό' }], [7.57, 'swoosh', { gain: 0.6, note: 'πετάνε (πιο γρήγορα)' }],
    [SC[2], 'laser', { dur: SC[3] - SC[2], pass: 0.75, note: 'gantry raster' }], [9.97, 'stamp', { note: 'ΟΛΟ ΤΟ ΚΕΦΑΛΙ' }],
    [11.75, 'zoom', { gain: 0.6, note: 'zoom στο φρενάρισμα' }], [12.6, 'pop', { note: 'κάρτα ταχύτητας' }],
    [14.5, 'boing', { gain: 0.5, note: 'shrug' }], [15.8, 'swoosh', { gain: 0.6, note: 'παλάμη «στοπ»' }], [16.0, 'ticks', { count: 4, gap: 0.12, gain: 0.5, note: '«όχι όχι»' }],
    [16.65, 'galvo', { dur: 1.75, seed: 3, gain: 0.6, rate: 20, note: 'κόκκινο preview' }], [17.45, 'stamp', { note: 'ΜΙΚΡΟ ΠΕΔΙΟ' }], [18.5, 'boing', { note: 'χτυπάει στο όριο' }], [18.62, 'pop', { gain: 0.7, note: '✗' }],
    [SC[5], 'laser', { dur: SC[6] - SC[5], pass: 0.5, gain: 0.8, note: 'Mira 7 πρόσοψη' }], [19.55, 'stamp', { note: 'MIRA 7' }],
    [CUT0, 'laser', { dur: SC[7] - CUT0, pass: 0.4, seed: 2, note: 'κοπή (time-lapse)' }], [20.45, 'pop', { gain: 0.7, note: '⏩' }], [21.2, 'swoosh', { gain: 0.5, note: 'βέλη: όλο το τραπέζι' }],
    [22.25, 'lid', { note: 'καπάκι' }], [LIFT, 'swoosh', { gain: 0.6, note: 'σηκώνει την ταμπέλα' }],
    [LIFT + 0.25, 'thud', { gain: 0.35, note: 'κύκλοι πέφτουν' }], [LIFT + 0.35, 'click', { gain: 0.5 }], [23.9, 'shimmer', { note: 'reward ✨' }],
    ...DROPS.map(([, , t0], i) => [t0 + 0.14, 'thud', { gain: 0.45, seed: 10 + i, note: i ? '' : 'αντικείμενα πέφτουν' }]),
    [25.8, 'stamp', { note: 'GALVO LASER' }], [26.95, 'slide', { dur: 0.5, note: 'ταμπέλα' }], [27.54, 'thud', { gain: 0.45, seed: 20 }], [27.69, 'thud', { gain: 0.45, seed: 21 }], [28.23, 'stamp', { seed: 2, note: 'GANTRY LASER' }],
    [29.5, 'swoosh', { gain: 0.6, note: 'χέρια στα μηχανήματα' }], [31.25, 'pop', { gain: 0.6, note: 'δείχνει κάτω' }],
    [ZIN, 'zoom', { gain: 0.8, note: 'snap zoom → loop' }],
  ],
});
