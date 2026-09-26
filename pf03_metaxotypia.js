// «Πώς φτιάχνεται;» — Μεταξοτυπία (screen printing) · top-down σε cutting mat · host: Στράτος (reach + pip) · VO ElevenLabs «Stratos» + SFX · 27,9s · seamless loop
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, caption, captionSeq, brandMark,
  lerp, clamp, prog, easeOut, easeIn, easeInOut, spring } = L;
const { BRAND, reach, sparkle, seriesTag, pip, PIP, tshirt, stamp } = require('./props.js');

// VO = vo/pf03_vo.mp3 @ 0,15s (ElevenLabs eleven_v3, φωνή «Stratos», παύσεις ήδη σφιγμένες: 27,24s).
// v3 (2026-09-26): το βήμα 3 ξαναγράφτηκε πιο αναλυτικό — νέο take κολλημένο στη θέση του «Φως. Ό,τι κρύβει…» (atempo 1.06, +1,5 dB), τα υπόλοιπα όπως ήταν (+5,25s).
// Χρονισμοί φράσεων (video):
// 0,23 Αυτό είναι η μεταξοτυπία. | 2,63 Αλλά πώς γίνεται; | 4,10 Πρώτα, το σχέδιό σου τυπώνεται σε μια διαφάνεια.
// 6,90 Το τελάρο περνιέται με φωτοευαίσθητο υγρό. | 9,57 Βάζουμε το φιλμ πάνω στο τελάρο, | 11,60 και ανάβει το UV φως.
// 12,97 Όπου περνάει το φως, το υγρό σκληραίνει. | 15,27 Κάτω από το μαύρο σχέδιο, μένει μαλακό.
// 17,87 Ξέπλυμα — και το σχέδιο ανοίγει στο πλέγμα. | 20,87 Τώρα, το μελάνι περνάει μόνο από εκεί.
// 23,20 Ένας από τους παλιότερους τρόπους εκτύπωσης. | 25,50 Κι ακόμα, από τους πιο γερούς.
// SFX ducking = default του render.js (VO present).
const VO = [];
const TAG = 'Πώς φτιάχνεται;';

// ---- γεωμετρία (top-down) ----
const FCX = 540, FCY = 852;              // κέντρο τελάρου + κέντρο του «S»
const FW = 300, FH = 368, FB = 46;       // half outer πλάτος/ύψος τελάρου, πάχος πλαισίου
const IW = FW - FB, IH = FH - FB;        // half interior (πλέγμα)
const SR = 150;                          // ακτίνα «S»
const TCY = 904;                         // κέντρο tee (ελαφρώς πιο κάτω)
const FRAME = '#3C4F86';                 // αλουμίνιο τελάρου (steel blue)
const EMUL = '#A9C6F7';                  // φωτοευαίσθητο (emulsion) coat — σκληρυμένο (μετά το φως)
const FRESH = '#D3E2FB';                 // φρέσκο emulsion πριν από το φως (πιο ανοιχτό · σκουραίνει στην έκθεση)
const INK = '#2447C8';                   // μπλε μελάνι (στο πλέγμα / bead)
const SQW = IW - 22;                     // half πλάτος σπάτουλας (χωράει μέσα στο τελάρο)
const SQ0 = 572, SQ1 = 1100;             // σπάτουλα: αρχή (πάνω, «έτοιμη») / τέλος του περάσματος (κάτω)
const ARM = [440, 720];                  // το χέρι μπαίνει από κάτω-δεξιά

// -------------------- background: cutting mat στα χρώματά μας --------------------
function matBG(ctx) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.strokeStyle = 'rgba(143,176,238,0.13)'; ctx.lineWidth = 2;            // λεπτό grid (sky)
  for (let x = 120; x <= 960; x += 90) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 1580); ctx.stroke(); }
  for (let y = 150; y <= 1580; y += 90) { ctx.beginPath(); ctx.moveTo(120, y); ctx.lineTo(960, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(143,176,238,0.28)'; ctx.lineWidth = 4;            // περίγραμμα mat + γωνιακοί οδηγοί
  ctx.strokeRect(120, 150, 840, 1430);
  ctx.lineWidth = 6;
  for (const [cx, cy, sx, sy] of [[120, 150, 1, 1], [960, 150, -1, 1], [120, 1580, 1, -1], [960, 1580, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx, cy + 46 * sy); ctx.lineTo(cx, cy); ctx.lineTo(cx + 46 * sx, cy); ctx.stroke();
  }
  ctx.restore();
}

// -------------------- λευκό t-shirt flat-lay (props/textile.js → tshirt) --------------------
function teeFlat(ctx, o = {}) {
  ctx.save(); ctx.translate(o.dx || 0, 0);
  tshirt(ctx, FCX, TCY, 1, 0, { seed: 7200 });
  if (o.print > 0) printedS(ctx, o.print, o);                              // μπλε «S» πάνω στο tee
  ctx.restore();
}
// μπλε «S» τυπωμένο, reveal top→down (frac), προαιρετικά «υγρό» sheen · o.bump 0..1 = παλμός όταν αποκαλύπτεται
function printedS(ctx, frac, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.rect(FCX - SR - 60, FCY - SR - 60, 2 * (SR + 60), (2 * SR + 120) * clamp(frac)); ctx.clip();
  const sc = o.pop ? spring(o.pop) : 1 + 0.08 * Math.sin(Math.PI * clamp(o.bump || 0)); ctx.translate(FCX, FCY); ctx.scale(sc, sc); ctx.translate(-FCX, -FCY);
  brandMark(ctx, FCX, FCY, SR, BRAND);
  if (o.wet) { ctx.globalAlpha = 0.55; ctx.strokeStyle = '#BFD4FB'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(FCX, FCY, SR, 3.5, 4.3); ctx.stroke(); ctx.globalAlpha = 1; }   // γυαλάδα (υγρό μελάνι)
  ctx.restore();
}

// -------------------- τελάρο (screen frame) --------------------
// o.lift 0..1 (σηκώνεται + fade), o.inner(ctx) ζωγραφίζει το εσωτερικό (πλέγμα/emulsion/film...)
let OFF = null;                          // offscreen: το τελάρο που σβήνει σβήνει σαν ένα κομμάτι (όχι στρώσεις που διαφαίνονται)
function frame(ctx, o = {}) {
  const lift = o.lift || 0, alpha = o.alpha != null ? o.alpha : 1;
  const cy = FCY - lift * 160;
  if (lift > 0.03) { ctx.save(); ctx.globalAlpha = 0.30 * clamp(lift * 1.5) * alpha; ctx.fillStyle = '#04102a'; L.path(ctx, rrPts(FCX - FW, FCY - FH + 34, FW * 2, FH * 2, 30)); ctx.fill(); ctx.restore(); }
  const c = alpha < 1 ? (OFF = OFF || L.createCanvas(W, H)).getContext('2d') : ctx;
  if (c !== ctx) c.clearRect(0, 0, W, H);
  c.save(); c.translate(0, cy - FCY);
  cut(c, rrPts(FCX - FW, FCY - FH, FW * 2, FH * 2, 30), FRAME, { seed: 7500, amp: 2, edgeW: 8 });     // πλαίσιο
  (o.inner || meshInner)(c);                                                                            // εσωτερικό (inset)
  c.restore();
  if (c !== ctx) { ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(OFF, 0, 0); ctx.restore(); }
}
function interiorBase(ctx, col, seed, scrib) {
  cut(ctx, rrPts(FCX - IW, FCY - IH, IW * 2, IH * 2, 14), col, { seed, amp: 1.5, edgeW: 5, scribble: scrib || null });
}
function meshGrid(ctx) {
  ctx.save(); L.path(ctx, rrPts(FCX - IW, FCY - IH, IW * 2, IH * 2, 14)); ctx.clip();
  ctx.strokeStyle = 'rgba(90,90,90,0.15)'; ctx.lineWidth = 1.5;
  for (let x = FCX - IW; x <= FCX + IW; x += 13) { ctx.beginPath(); ctx.moveTo(x, FCY - IH); ctx.lineTo(x, FCY + IH); ctx.stroke(); }
  for (let y = FCY - IH; y <= FCY + IH; y += 13) { ctx.beginPath(); ctx.moveTo(FCX - IW, y); ctx.lineTo(FCX + IW, y); ctx.stroke(); }
  ctx.restore();
}
const meshInner = ctx => { interiorBase(ctx, '#EDEBE3', 7510, '#DBD8CE'); meshGrid(ctx); };
// στένσιλ (μετά το ξέπλυμα): emulsion + ανοιχτό «S» → φαίνεται το λευκό tee · inkY = ως εκεί έχει περάσει το μελάνι (μπλε)
function stencilInner(ctx, inkY) {
  interiorBase(ctx, EMUL, 7512);
  brandMark(ctx, FCX, FCY, SR, '#F3F0E8');
  if (inkY > FCY - SR - 30) { ctx.save(); ctx.beginPath(); ctx.rect(FCX - SR - 60, FCY - SR - 60, 2 * (SR + 60), inkY - (FCY - SR - 60)); ctx.clip(); brandMark(ctx, FCX, FCY, SR, INK); ctx.restore(); }
  meshGrid(ctx);
}

// -------------------- squeegee (κάτοψη: μπάρα + λάμα) --------------------
// w = half πλάτος (default: όσο το τελάρο — emulsion coat) · στο πέρασμα SQW (μέσα στο πλέγμα)
function squeegee(ctx, y, w = FW - 12) {
  cut(ctx, rrPts(FCX - w, y - 34, w * 2, 44, 16), '#26356A', { seed: 7600, amp: 2, edgeW: 6 });
  cut(ctx, rrPts(FCX - (w - 6), y + 10, (w - 6) * 2, 16, 6), C.pale, { seed: 7601, amp: 1, edgeW: 3, shadow: false });
}
// κορδόνι μελανιού (ink bead) μπροστά από τη λάμα, στο y (πάνω άκρη)
function inkBead(ctx, y) {
  const pts = []; for (let x = -SQW + 20; x <= SQW - 20; x += 24) pts.push([FCX + x, y + 2 + 3 * Math.sin(x * 0.05)]);
  for (let x = SQW - 20; x >= -SQW + 20; x -= 24) pts.push([FCX + x, y + 30 + 6 * Math.sin(x * 0.037 + 1)]);
  cut(ctx, pts, INK, { seed: 7620, amp: 2.5, step: 18, edgeW: 3, sx: 3, sy: 4 });
  ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = '#7C9AF5'; ctx.lineWidth = 4; ctx.lineCap = 'round';   // γυαλάδα (υγρό)
  ctx.beginPath(); ctx.moveTo(FCX - SQW + 50, y + 11); ctx.lineTo(FCX - 40, y + 10); ctx.stroke(); ctx.restore();
}
// το τελάρο πάνω στο tee: στένσιλ + μελάνι + σπάτουλα στο sqY · lift/alpha: σηκώνεται μαζί με ό,τι έχει πάνω του
function press(ctx, sqY, o = {}) {
  frame(ctx, { lift: o.lift, alpha: o.alpha, inner: c => { stencilInner(c, sqY + 18); inkBead(c, sqY + 30); squeegee(c, sqY, SQW); } });
}
// το χέρι του Στράτου στη λαβή · out 0..1 = φεύγει/μπαίνει κατά μήκος του μπράτσου
function grip(ctx, sqY, out = 0) {
  const n = Math.hypot(...ARM), k = 900 * out;
  reach(ctx, FCX + SQW - 40 + ARM[0] / n * k, sqY - 12 + ARM[1] / n * k, ...ARM, { seed: 840, hand: 'grip', side: -1 });
}

// -------------------- film positive (διαφάνεια + μαύρο «S») --------------------
function filmPositive(ctx, dx = 0) {
  ctx.save(); ctx.translate(dx, 0); ctx.globalAlpha = 0.94;
  cut(ctx, rrPts(FCX - 272, FCY - 336, 544, 672, 12), '#CFE0FA', { seed: 7800, amp: 1.5, edgeW: 5 });
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; L.path(ctx, rrPts(FCX - 250, FCY - 316, 150, 632, 8)); ctx.fill();
  ctx.globalAlpha = 1; brandMark(ctx, FCX, FCY, SR, C.ink);
  ctx.restore();
}

// -------------------- πιστόλι πιεστικού νερού (κάτοψη) --------------------
const WD = [ARM[0] / Math.hypot(...ARM), ARM[1] / Math.hypot(...ARM)];    // κατεύθυνση λόγχης: από τον πίδακα προς το χέρι (κάτω-δεξιά)
// h = σημείο που χτυπάει ο πίδακας · jet 0..1 (ένταση) · out 0..1 = το χέρι φεύγει/μπαίνει κατά μήκος του μπράτσου
function washer(ctx, h, lt, jet, out = 0) {
  const k = 900 * out, N = [h[0] + WD[0] * (210 + k), h[1] + WD[1] * (210 + k)], px = -WD[1], py = WD[0];
  if (jet > 0.02) {                                                          // πίδακας + ομίχλη + σταγόνες
    const T = [N[0] - WD[0] * 26, N[1] - WD[1] * 26];
    ctx.save(); ctx.globalAlpha = 0.5 * jet; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(T[0] + px * 5, T[1] + py * 5); ctx.lineTo(h[0] + px * 40, h[1] + py * 40); ctx.lineTo(h[0] - px * 40, h[1] - py * 40); ctx.lineTo(T[0] - px * 5, T[1] - py * 5); ctx.fill();
    ctx.globalAlpha = 0.9 * jet; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.setLineDash([34, 22]); ctx.lineDashOffset = lt * 1100;
    ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.lineTo(h[0], h[1]); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 7; i++) { const r = L.rng(i * 7 + L.ST.B * 31); ctx.globalAlpha = 0.3 * jet; L.path(ctx, circlePts(h[0] + (r - 0.5) * 120, h[1] + (L.rng(i + 50 + L.ST.B) - 0.5) * 90, 18 + 26 * r)); ctx.fill(); }
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 16; i++) { const a = L.rng(i * 13 + L.ST.FRAME * 3) * Math.PI * 2, dd = 50 + 150 * L.rng(i * 5 + L.ST.FRAME * 7); ctx.globalAlpha = (0.7 + 0.3 * L.rng(i + L.ST.FRAME)) * jet; L.path(ctx, circlePts(h[0] + Math.cos(a) * dd, h[1] + Math.sin(a) * dd * 0.8, 5 + 6 * L.rng(i * 3 + L.ST.FRAME))); ctx.fill(); }
    ctx.globalAlpha = 0.9 * jet; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;                   // πιτσιλιά
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + L.ST.B, r0 = 44, r1 = 64 + 22 * L.rng(i + L.ST.B * 9); ctx.beginPath(); ctx.moveTo(h[0] + Math.cos(a) * r0, h[1] + Math.sin(a) * r0); ctx.lineTo(h[0] + Math.cos(a) * r1, h[1] + Math.sin(a) * r1); ctx.stroke(); }
    ctx.restore();
  }
  ctx.save(); ctx.translate(N[0], N[1]); ctx.rotate(Math.atan2(WD[1], WD[0]) - Math.PI / 2);   // τοπικό +y = προς το χέρι
  cut(ctx, rrPts(-9, 0, 18, 330, 8), '#B9C2D3', { seed: 8600, amp: 1, edgeW: 4 });                    // λόγχη
  cut(ctx, rrPts(-15, -28, 30, 40, 8), '#26356A', { seed: 8601, amp: 1, edgeW: 4 });              // μπεκ
  cut(ctx, rrPts(-40, 318, 80, 130, 22), '#26356A', { seed: 8602, amp: 2, edgeW: 6 });            // σώμα πιστολιού
  cut(ctx, rrPts(-26, 336, 52, 26, 10), BRAND, { seed: 8603, amp: 1, edgeW: 3, shadow: false });
  ctx.restore();
  reach(ctx, N[0] + WD[0] * 410, N[1] + WD[1] * 410, ...ARM, { seed: 830, hand: 'grip', side: -1 });
}

// ============================== SCENES ==============================
// «έτοιμο» = frame 0 = τέλος: τελάρο κάτω στο λευκό tee, μελάνι + σπάτουλα πάνω, χέρι στη λαβή → seamless loop (LOOP: 'cut')

// S0 — HOOK: η σπάτουλα τυπώνει → σηκώνεται το τελάρο → μπλε «S» καθαρό (τίποτα ημιδιάφανο από πάνω) + ✨  (VO: «Αυτό είναι η μεταξοτυπία.»)
function sHook(ctx, lt) {
  const sqY = lerp(SQ0, SQ1, easeInOut(prog(lt, 0.12, 1.0)));             // πέρασμα
  const out = easeIn(prog(lt, 1.0, 1.25));                                 // το χέρι αφήνει τη λαβή
  const lift = easeInOut(prog(lt, 1.08, 1.5)), alpha = 1 - easeIn(prog(lt, 1.18, 1.55));
  matBG(ctx);
  teeFlat(ctx, lt > 1.0 ? { print: 1, wet: lt < 1.85, bump: prog(lt, 1.28, 1.6) } : {});
  if (alpha > 0.01) press(ctx, sqY, { lift, alpha });
  if (out < 1) grip(ctx, sqY, out);
  if (lt > 2.05) { sparkle(ctx, FCX - 96, FCY - 70, 1.0, lt, 2.1, 71); sparkle(ctx, FCX + 104, FCY + 60, 0.9, lt, 2.17, 72); sparkle(ctx, FCX + 30, FCY - 150, 0.8, lt, 2.24, 73); }
  caption(ctx, 'Αυτό είναι η μεταξοτυπία', lt, -1); seriesTag(ctx, lt + 1, TAG);   // ήδη στο frame 0 (loop) · η ετικέτα σειράς μόνο εδώ
}

// S1 — QUESTION / rewind  (VO: «Αλλά πώς γίνεται;»)
function sQuestion(ctx, lt) {
  matBG(ctx);
  frame(ctx, { inner: meshInner });                        // άδειο τελάρο (mesh)
  // «?» που σκάει
  pop(ctx, lt, 0.15, FCX, FCY, () => txt(ctx, ';', 0, 60, { font: 'bold 320px Round', color: C.sky }));
  pip(ctx, ...PIP, VO);
  caption(ctx, 'Αλλά πώς γίνεται;', lt, 0.1);
}

// S2 — βήμα 1: το σχέδιο σε film  (VO: «Πρώτα, το σχέδιό σου τυπώνεται σε μια διαφάνεια.»)
function sFilm(ctx, lt) {
  matBG(ctx);
  const k = easeOut(prog(lt, 0.15, 0.9));
  filmPositive(ctx, (1 - k) * -820);
  if (k > 0.9) reach(ctx, FCX + 150, FCY + 250, 300, 760, { seed: 810, hand: 'open', side: -1 });
  caption(ctx, '1 · Το σχέδιο σε film', lt, 0.12);
}

// S3 — βήμα 2: emulsion coat  (VO: «Το τελάρο περνιέται με φωτοευαίσθητο υγρό.»)
function sEmul(ctx, lt) {
  matBG(ctx);
  const coat = easeInOut(prog(lt, 0.35, 1.75));            // top→down
  frame(ctx, {
    inner: c => {
      interiorBase(c, '#EDEBE3', 7510, '#DBD8CE'); meshGrid(c);
      c.save(); c.beginPath(); c.rect(FCX - IW, FCY - IH, IW * 2, (IH * 2) * coat); c.clip();
      interiorBase(c, FRESH, 7512); c.restore();
    }
  });
  // coating bar + χέρι
  if (coat > 0 && coat < 1) { const y = FCY - IH + (IH * 2) * coat; squeegee(ctx, y); reach(ctx, FCX + FW - 60, y - 10, 420, 720, { seed: 820, hand: 'grip', side: -1 }); }
  caption(ctx, '2 · Emulsion', lt, 0.12);
}

// S4 — βήμα 3: έκθεση σε UV φως (v3: αναλυτικό — φιλμ πάνω στο τελάρο → UV λάμπες → όπου περνάει το φως σκληραίνει → κάτω από το «S» μένει μαλακό)
// (VO: «Βάζουμε το φιλμ πάνω στο τελάρο, και ανάβει το UV φως.» 0,27 · «Όπου περνάει το φως, το υγρό σκληραίνει.» 3,67 · «Κάτω από το μαύρο σχέδιο, μένει μαλακό.» 5,97)
// Το emulsion σκουραίνει στο φως (FRESH → EMUL, όπως στην πραγματικότητα) · κάτω από το μαύρο «S» μένει FRESH (λανθάνουσα εικόνα → ανοίγει στο ξέπλυμα)
const UV = '#7B5CFF', UVL = '#E6DEFF';           // UV φως (μωβ: εξαίρεση στην παλέτα, έτσι το αναγνωρίζει ο θεατής)
const TUBES = [150, 930];                          // UV λάμπες δίπλα στο τελάρο (κάτοψη)
// διαφάνεια πάνω στο τελάρο: καθαρό acetate (φαίνεται το emulsion από κάτω) + μαύρο «S»
function acetate(ctx, ox = 0, oy = 0, rot = 0) {
  ctx.save(); ctx.translate(FCX + ox, FCY + oy); ctx.rotate(rot); ctx.translate(-FCX, -FCY);
  ctx.globalAlpha = 0.22; cut(ctx, rrPts(FCX - 272, FCY - 336, 544, 672, 12), '#E4EEFC', { seed: 7800, amp: 1.5, edgeW: 5, shadow: false });
  ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff'; L.path(ctx, rrPts(FCX - 250, FCY - 316, 110, 632, 8)); ctx.fill();   // γυαλάδα
  ctx.globalAlpha = 1; brandMark(ctx, FCX, FCY, SR, C.ink);
  ctx.restore();
}
// UV λάμπες (σβηστές / αναμμένες) + ακτίνες προς το τελάρο · uv 0..1
function uvLamps(ctx, lt, uv) {
  for (const x of TUBES) {
    cut(ctx, rrPts(x - 34, 540, 68, 640, 28), '#26356A', { seed: 8700 + x, amp: 2, edgeW: 6 });           // βάση
    cut(ctx, rrPts(x - 15, 566, 30, 588, 15), uv > 0.05 ? UVL : '#8E8AB0', { seed: 8710 + x, amp: 1, edgeW: 3, shadow: false });   // σωλήνας
  }
  if (uv <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const x of TUBES) {                                                   // φωτοστέφανο λάμπας (έλλειψη, μαλακές άκρες)
    ctx.save(); ctx.translate(x, 860); ctx.scale(1, 2.5);
    const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 160);
    g.addColorStop(0, `rgba(160,130,255,${0.8 * uv})`); g.addColorStop(1, 'rgba(123,92,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-160, -160, 320, 320); ctx.restore();
  }
  ctx.strokeStyle = `rgba(200,185,255,${0.8 * uv})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([26, 30]); ctx.lineDashOffset = -lt * 260;   // ακτίνες λάμπα → τελάρο
  for (let i = 0; i < 6; i++) {
    const y = 600 + i * 104;
    ctx.beginPath(); ctx.moveTo(TUBES[0] + 40, y); ctx.lineTo(FCX - IW + 30, y + (FCY - y) * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(TUBES[1] - 40, y); ctx.lineTo(FCX + IW - 30, y + (FCY - y) * 0.15); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalCompositeOperation = 'source-over';
  L.path(ctx, rrPts(FCX - FW, FCY - FH, FW * 2, FH * 2, 30)); ctx.clip();   // το τελάρο λούζεται στο UV (μωβ απόχρωση)
  const r = ctx.createRadialGradient(FCX, FCY, 60, FCX, FCY, 460);
  r.addColorStop(0, `rgba(123,92,255,${0.2 * uv})`); r.addColorStop(1, `rgba(123,92,255,${0.34 * uv})`);
  ctx.fillStyle = r; ctx.fillRect(FCX - FW, FCY - FH, FW * 2, FH * 2);
  ctx.restore();
}
// χρονόμετρο έκθεσης: χάρτινος κύκλος «UV» + δακτύλιος που γεμίζει · p 0..1
function uvTimer(ctx, lt, p, out) {
  if (out >= 1) return;
  ctx.save(); ctx.translate(FCX, 1318); ctx.scale(1 - out, 1 - out); ctx.translate(-FCX, -1318);
  pop(ctx, lt, 2.4, FCX, 1318, () => {
    cut(ctx, circlePts(0, 0, 66), C.paper, { seed: 8720, amp: 2, edgeW: 6 });
    ctx.strokeStyle = 'rgba(123,92,255,0.18)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.stroke();
    if (p > 0) { ctx.strokeStyle = UV; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke(); }
    txt(ctx, 'UV', 0, 2, { font: 'bold 38px Brand', color: UV });
  });
  ctx.restore();
}
function sLight(ctx, lt) {
  const k = easeOut(prog(lt, 0.25, 1.1));                                   // το φιλμ μπαίνει (όπως στο βήμα 1)
  const pat = 1 - easeOut(prog(lt, 0.95, 1.25)) + easeIn(prog(lt, 1.75, 2.15));   // χέρι: ακουμπάει το φιλμ και φεύγει
  const dark = easeInOut(prog(lt, 2.1, 2.5)) * (1 - easeInOut(prog(lt, 5.75, 6.1)));   // σκοτάδι όσο είναι αναμμένο το UV
  const on = lt >= 2.55 && lt < 5.75 ? (lt < 2.8 && Math.sin(lt * 95) < -0.2 ? 0.35 : 1) : 0;   // UV ανάβει (τρεμόπαιγμα) → σβήνει
  const cure = easeInOut(prog(lt, 3.8, 5.4));                               // σκλήρυνση: FRESH → EMUL (εκτός από κάτω από το «S»)
  const peel = easeIn(prog(lt, 6.25, 6.9)), grab = 1 - easeOut(prog(lt, 5.9, 6.25));   // το φιλμ τραβιέται προς το χέρι
  const DIR = [ARM[0] / Math.hypot(...ARM), ARM[1] / Math.hypot(...ARM)], pd = 1150 * peel;
  matBG(ctx);
  frame(ctx, { inner: c => {
    interiorBase(c, FRESH, 7512);
    if (cure > 0) { c.save(); c.globalAlpha = cure; interiorBase(c, EMUL, 7512); c.restore(); brandMark(c, FCX, FCY, SR, FRESH); }
  } });
  if (peel < 1) acetate(ctx, (1 - k) * -820 + DIR[0] * pd, DIR[1] * pd, 0.14 * peel);
  if (pat < 1) reach(ctx, FCX + 150 + 300 / 811 * 900 * pat, FCY + 250 + 760 / 811 * 900 * pat, 300, 760, { seed: 810, hand: 'open', side: -1 });
  if (dark > 0) {                                                           // σκοτάδι γύρω · το τελάρο μένει στο φως (φαίνεται η σκλήρυνση)
    const q = rrPts(FCX - FW, FCY - FH, FW * 2, FH * 2, 30);
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(...q[0]); for (const pt of q) ctx.lineTo(...pt); ctx.closePath();
    ctx.fillStyle = `rgba(5,12,32,${0.62 * dark})`; ctx.fill('evenodd');
  }
  uvLamps(ctx, lt, on);
  if (on > 0) brandMark(ctx, FCX, FCY, SR, C.ink);                          // το μαύρο «S» μπλοκάρει το φως: μένει σκοτεινό
  if (lt > 5.9 && peel < 1) reach(ctx, FCX + 230 + DIR[0] * (pd + 900 * grab), FCY + 300 + DIR[1] * (pd + 900 * grab), ...ARM, { seed: 850, hand: 'grip', side: -1 });
  uvTimer(ctx, lt, prog(lt, 2.6, 5.75), easeIn(prog(lt, 6.1, 6.35)));
  stamp(ctx, lt, 4.6, FCX, 600, 'σκληραίνει', -0.04, C.navy, 46);
  if (lt > 7.0) pop(ctx, lt, 7.0, FCX, 1036, () => cut(ctx, [[-15, 22], [15, 22], [15, 0], [30, 0], [0, -30], [-30, 0], [-15, 0]], BRAND, { seed: 8730, amp: 1, edgeW: 4 }));
  stamp(ctx, lt, 7.0, FCX, 1108, 'μαλακό', 0.03, BRAND, 46);
  captionSeq(ctx, lt, [[0.12, '3 · Έκθεση σε UV φως'], [3.62, 'Όπου περνάει το φως, σκληραίνει'], [5.92, 'Κάτω από το σχέδιο, μένει μαλακό']]);
}

// S5 — βήμα 4: ξέπλυμα με πιεστικό νερό → το «S» ανοίγει εκεί που περνάει ο πίδακας  (VO: «Ξέπλυμα — και το σχέδιο ανοίγει στο πλέγμα.»)
// ο πίδακας σαρώνει ζιγκ-ζαγκ top→down· βρέχει όλο το emulsion, αλλά ανοίγει μόνο το «S» (το υπόλοιπο σκλήρυνε στο φως)
const jetAt = u => [FCX + 185 * Math.sin(u * Math.PI * 5), lerp(FCY - SR - 30, FCY + SR + 30, u)];
function sWash(ctx, lt) {
  matBG(ctx);
  const u = easeInOut(prog(lt, 0.5, 2.1)), jet = prog(lt, 0.45, 0.55) * (1 - prog(lt, 2.1, 2.2));
  const h = jetAt(u), out = 1 - easeOut(prog(lt, 0.1, 0.5)) + easeIn(prog(lt, 2.2, 2.6));
  const washed = c => {                                                     // ό,τι έχει περάσει ο πίδακας: ό,τι είναι πάνω από το μέτωπο + ίχνος
    c.beginPath(); if (lt >= 2.1) { c.rect(0, 0, W, H); return; }
    c.rect(0, 0, W, h[1] - 50);
    for (let k = 0; k <= 60; k++) { const q = jetAt(u * k / 60); c.moveTo(q[0] + 80, q[1]); c.arc(q[0], q[1], 80, 0, Math.PI * 2); }
  };
  frame(ctx, {
    inner: c => {
      interiorBase(c, EMUL, 7512);
      brandMark(c, FCX, FCY, SR, FRESH);                                     // λανθάνον «S» (μαλακό, από το βήμα 3)
      if (lt > 0.5) {
        c.save(); washed(c); c.clip();
        c.fillStyle = `rgba(30,60,150,${lt < 2.1 ? 0.14 : 0.14 * (1 - prog(lt, 2.1, 3.0))})`; c.fillRect(FCX - IW, FCY - IH, IW * 2, IH * 2);   // βρεγμένο emulsion
        brandMark(c, FCX, FCY, SR, C.navy);                                  // ανοιχτό «S» (φαίνεται το mat από κάτω)
        c.restore();
      }
      meshGrid(c);
    }
  });
  if (out < 1) washer(ctx, h, lt, jet, out);
  caption(ctx, '4 · Ξέπλυμα', lt, 0.12);
}

// S6 — βήμα 5: πέρασμα → σήκωμα → επόμενο tee → τελάρο κάτω → σπάτουλα «έτοιμη» (= frame 0, seamless loop)
// (VO: «Τώρα, το μελάνι περνάει μόνο από εκεί.» · «Ένας από τους παλιότερους τρόπους εκτύπωσης.» · «Κι ακόμα, από τους πιο γερούς.»)
function sPass(ctx, lt) {
  const sqY = lerp(SQ0, SQ1, easeInOut(prog(lt, 0.3, 1.6)));              // πέρασμα (αργό: το μελάνι μόνο στο «S»)
  const out = easeIn(prog(lt, 1.6, 1.85));
  const lift = easeInOut(prog(lt, 1.85, 2.3)), alpha = 1 - easeIn(prog(lt, 1.95, 2.35));
  const swapOut = easeIn(prog(lt, 3.9, 4.5)), swapIn = easeOut(prog(lt, 4.2, 4.85));   // το τυπωμένο φεύγει, έρχεται λευκό
  const drop = 1 - easeInOut(prog(lt, 5.0, 5.55)), fadeIn = easeOut(prog(lt, 4.9, 5.2)); // τελάρο κάτω, σπάτουλα ήδη πάνω
  const handIn = 1 - easeOut(prog(lt, 6.0, 6.45));                          // το χέρι πιάνει τη λαβή
  matBG(ctx);
  if (lt < 4.5) teeFlat(ctx, lt > 1.6 ? { print: 1, wet: lt < 3.2, bump: prog(lt, 2.15, 2.45), dx: -1200 * swapOut } : {});
  if (lt >= 4.2) teeFlat(ctx, { dx: 1200 * (1 - swapIn) });
  if (lt < 2.4 && alpha > 0.01) press(ctx, sqY, { lift, alpha });
  if (lt < 1.85) grip(ctx, sqY, out);
  if (lt > 2.5 && lt < 3.9) { sparkle(ctx, FCX - 96, FCY - 70, 1.0, lt, 2.6, 74); sparkle(ctx, FCX + 104, FCY + 60, 0.9, lt, 2.72, 75); sparkle(ctx, FCX + 30, FCY - 150, 0.8, lt, 2.84, 76); }
  if (lt >= 4.9) press(ctx, SQ0, { lift: drop, alpha: fadeIn });
  if (lt >= 6.0) grip(ctx, SQ0, handIn);
  captionSeq(ctx, lt, [[0.12, '5 · Πέρασμα'], [2.4, 'Ένας από τους παλιότερους τρόπους'], [4.65, 'Κι από τους πιο γερούς.'], [6.72, 'Αυτό είναι η μεταξοτυπία']]);
  if (lt >= 6.72) seriesTag(ctx, (lt - 6.72) * 1.5, TAG);             // ετικέτα σειράς μόνο με το caption του hook (loop)
}

const SCENES = [[sHook, 2.6], [sQuestion, 1.45], [sFilm, 2.7], [sEmul, 2.55], [sLight, 8.35], [sWash, 3.05], [sPass, 7.1]];
const WIPES = [1, 2, 3, 4, 5, 6];

require('./render.js')({
  name: 'pf03_metaxotypia',
  SCENES, WIPES, LOOP: 'cut',                // seamless: το τέλος = η σπάτουλα έτοιμη να τυπώσει = frame 0
  VO_FILE: 'vo/pf03_vo.mp3', VO_AT: 0.15,
  SFX: [
    [0.10, 'squeegee', { dur: 0.95, note: 'hook: η σπάτουλα τυπώνει' }],
    [1.08, 'lid', { note: 'σηκώνει το τελάρο' }],
    [1.30, 'pop', { note: 'reveal «S»' }],
    [2.10, 'shimmer', { note: '✨' }],
    [4.25, 'slide', { dur: 0.7, note: 'film μπαίνει' }],
    [6.95, 'squeegee', { dur: 1.4, note: 'emulsion coat' }],
    [9.55, 'slide', { dur: 0.7, note: 'φιλμ πάνω στο τελάρο' }],
    [10.45, 'thud', { gain: 0.45, note: 'το χέρι ακουμπάει το φιλμ' }],
    [11.85, 'click', { note: 'διακόπτης UV' }], [11.88, 'beep', { count: 1, note: 'UV on' }],
    [11.95, 'air', { dur: 3.1, gain: 0.7, note: 'UV λάμπες (βουητό)' }],
    [13.90, 'pop', { gain: 0.6, note: '«σκληραίνει»' }],
    [15.05, 'beep', { count: 2, note: 'τέλος έκθεσης, UV off' }],
    [15.55, 'peel', { note: 'το φιλμ ξεκολλάει' }],
    [16.30, 'pop', { gain: 0.6, note: '«μαλακό»' }],
    [18.11, 'click', { gain: 0.6, note: 'σκανδάλη πιστολιού' }],
    [18.15, 'spray', { dur: 1.62, note: 'ξέπλυμα με πιεστικό νερό' }],
    [20.97, 'squeegee', { dur: 1.35, note: 'πέρασμα μελάνι' }],
    [22.55, 'lid', { note: 'σηκώνει το τελάρο' }],
    [22.85, 'pop', { note: 'reveal «S»' }],
    [23.30, 'shimmer', { note: '✨' }],
    [24.60, 'slide', { dur: 0.9, note: 'επόμενο tee' }],
    [26.23, 'thud', { gain: 0.8, note: 'τελάρο κάτω → «έτοιμο» (loop)' }],
  ],
});
