// «Πώς φτιάχνεται;» — Μεταξοτυπία (screen printing) · top-down σε cutting mat · host: Στράτος (reach + pip) · VO ElevenLabs «Stratos» + SFX · 22,6s · seamless loop
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, caption, captionSeq, brandMark,
  lerp, clamp, prog, easeOut, easeIn, easeInOut, spring } = L;
const { BRAND, reach, sparkle, seriesTag, pip, PIP } = require('./props.js');

// VO = vo/pf03_vo.mp3 @ 0,15s (ElevenLabs eleven_v3, φωνή «Stratos», παύσεις ήδη σφιγμένες, χωρίς atempo: 22,05s).
// Χρονισμοί φράσεων (raw, silence detect):
// 0,00 Αυτό είναι η μεταξοτυπία. | 2,49 Αλλά πώς γίνεται; | 3,96 Πρώτα, το σχέδιό σου τυπώνεται σε μια διαφάνεια.
// 6,78 Το τελάρο περνιέται με φωτοευαίσθητο υγρό. | 9,45 Φως. Ό,τι κρύβει το σχέδιο, μένει μαλακό.
// 12,47 Ξέπλυμα — και το σχέδιο ανοίγει στο πλέγμα. | 15,47 Τώρα, το μελάνι περνάει μόνο από εκεί.
// 17,83 Ένας από τους παλιότερους τρόπους εκτύπωσης. | 20,11 Κι ακόμα, από τους πιο γερούς.
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
const EMUL = '#A9C6F7';                  // φωτοευαίσθητο (emulsion) coat
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

// -------------------- λευκό t-shirt flat-lay --------------------
const TEE = [[-80, -350], [-300, -345], [-390, -315], [-380, -205], [-300, -225], [-300, 360], [-292, 442],
  [292, 442], [300, 360], [300, -225], [380, -205], [390, -315], [300, -345], [80, -350], [0, -300]];
function teeFlat(ctx, o = {}) {
  ctx.save(); ctx.translate(o.dx || 0, 0);
  ctx.save(); ctx.translate(FCX, TCY);
  cut(ctx, TEE, C.paper, { seed: 7200, amp: 3, edgeW: 8, scribble: '#E7E2D4' });
  // γιακάς
  ctx.strokeStyle = '#DAD5C6'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, -318, 78, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.restore();
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

// -------------------- heat-press platen (κατεβαίνει από πάνω) --------------------
function platen(ctx, down) {
  const w = 218 * lerp(0.8, 1.0, down), h = 246 * lerp(0.8, 1.0, down);
  ctx.save(); ctx.globalAlpha = 0.28 * down; ctx.fillStyle = '#04102a'; L.path(ctx, rrPts(FCX - w, FCY - h + 26, w * 2, h * 2, 24)); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.5 * down;                                   // ημιδιάφανο platen → φαίνεται το «S»
  cut(ctx, rrPts(FCX - w, FCY - h, w * 2, h * 2, 22), '#1B3168', { seed: 7700, amp: 2, edgeW: 8, shadow: false }); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.55 * down; ctx.strokeStyle = C.sky; ctx.lineWidth = 5; ctx.lineCap = 'round';   // heat waves
  for (let i = -1; i <= 1; i++) { const yy = FCY + i * 66; ctx.beginPath(); for (let x = -108; x <= 108; x += 8) ctx.lineTo(FCX + x, yy + Math.sin(x * 0.06 + down * 3) * 7); ctx.stroke(); }
  ctx.restore();
}

// ============================== SCENES ==============================
// «έτοιμο» = frame 0 = τέλος: τελάρο κάτω στο λευκό tee, μελάνι + σπάτουλα πάνω, χέρι στη λαβή → seamless loop (LOOP: 'cut')

// S0 — HOOK: η σπάτουλα τυπώνει → σηκώνεται το τελάρο → μπλε «S» → heat-press cure  (VO: «Αυτό είναι η μεταξοτυπία.»)
function sHook(ctx, lt) {
  const sqY = lerp(SQ0, SQ1, easeInOut(prog(lt, 0.12, 1.0)));             // πέρασμα
  const out = easeIn(prog(lt, 1.0, 1.25));                                 // το χέρι αφήνει τη λαβή
  const lift = easeInOut(prog(lt, 1.08, 1.5)), alpha = 1 - easeIn(prog(lt, 1.18, 1.55));
  const down = easeInOut(prog(lt, 1.72, 1.95)) * (1 - easeInOut(prog(lt, 2.08, 2.3)));
  matBG(ctx);
  teeFlat(ctx, lt > 1.0 ? { print: 1, wet: lt < 1.85, bump: prog(lt, 1.28, 1.6) } : {});
  if (alpha > 0.01) press(ctx, sqY, { lift, alpha });
  if (out < 1) grip(ctx, sqY, out);
  if (down > 0.02) platen(ctx, down);
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
      interiorBase(c, EMUL, 7512); c.restore();
    }
  });
  // coating bar + χέρι
  if (coat > 0 && coat < 1) { const y = FCY - IH + (IH * 2) * coat; squeegee(ctx, y); reach(ctx, FCX + FW - 60, y - 10, 420, 720, { seed: 820, hand: 'grip', side: -1 }); }
  caption(ctx, '2 · Emulsion', lt, 0.12);
}

// S4 — βήμα 3: έκθεση σε φως  (VO: «Φως. Ό,τι κρύβει το σχέδιο, μένει μαλακό.»)
function sLight(ctx, lt) {
  matBG(ctx);
  frame(ctx, { inner: c => { interiorBase(c, EMUL, 7512); brandMark(c, FCX, FCY, SR, C.ink); } }); // emulsion + film (μαύρο S)
  const g = easeOut(prog(lt, 0.2, 0.8)) * (1 - 0.15 * Math.max(0, Math.sin(lt * 20)));
  ctx.save();
  const grd = ctx.createRadialGradient(FCX, FCY - 40, 40, FCX, FCY - 40, 560);
  grd.addColorStop(0, `rgba(255,255,255,${0.72 * g})`); grd.addColorStop(0.5, `rgba(220,231,250,${0.28 * g})`); grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 250, W, 1230);
  ctx.strokeStyle = `rgba(255,255,255,${0.5 * g})`; ctx.lineWidth = 6; ctx.lineCap = 'round';       // ακτίνες
  for (let a = 0; a < 6; a++) { const an = a / 6 * Math.PI * 2 + lt * 0.4; ctx.beginPath(); ctx.moveTo(FCX + Math.cos(an) * 210, FCY - 40 + Math.sin(an) * 210); ctx.lineTo(FCX + Math.cos(an) * 320, FCY - 40 + Math.sin(an) * 320); ctx.stroke(); }
  ctx.restore();
  caption(ctx, '3 · Έκθεση σε φως', lt, 0.12);
}

// S5 — βήμα 4: ξέπλυμα → ανοίγει το «S» στο πλέγμα  (VO: «Ξέπλυμα — και το σχέδιο ανοίγει στο πλέγμα.»)
function sWash(ctx, lt) {
  matBG(ctx);
  const open = easeInOut(prog(lt, 0.5, 1.9));              // το «S» ανοίγει top→down
  frame(ctx, {
    inner: c => {
      interiorBase(c, EMUL, 7512);
      c.save(); c.beginPath(); c.rect(FCX - SR - 60, FCY - SR - 40, 2 * (SR + 60), (2 * SR + 80) * open); c.clip();
      brandMark(c, FCX, FCY, SR, C.navy);                   // ανοιχτό «S» (φαίνεται το mat από κάτω)
      meshGrid(c); c.restore();
    }
  });
  // spray νερού
  if (open > 0 && open < 1) {
    const y = FCY - SR + (2 * SR) * open;
    reach(ctx, FCX + 130, y - 30, 380, 740, { seed: 830, hand: 'point', side: -1 });
    ctx.save(); ctx.fillStyle = C.sky;
    for (let i = 0; i < 9; i++) { const s = L.rng(i + Math.floor(lt * 22)); ctx.globalAlpha = 0.5 + 0.4 * s; const dx = (s - 0.5) * 220, dy = s * 90; L.path(ctx, circlePts(FCX + dx, y + dy - 30, 5 + s * 4)); ctx.fill(); }
    ctx.restore();
  }
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

const SCENES = [[sHook, 2.6], [sQuestion, 1.45], [sFilm, 2.7], [sEmul, 2.55], [sLight, 3.1], [sWash, 3.05], [sPass, 7.1]];
const WIPES = [1, 2, 3, 4, 5, 6];

require('./render.js')({
  name: 'pf03_metaxotypia',
  SCENES, WIPES, LOOP: 'cut',                // seamless: το τέλος = η σπάτουλα έτοιμη να τυπώσει = frame 0
  VO_FILE: 'vo/pf03_vo.mp3', VO_AT: 0.15,
  SFX: [
    [0.10, 'squeegee', { dur: 0.95, note: 'hook: η σπάτουλα τυπώνει' }],
    [1.08, 'lid', { note: 'σηκώνει το τελάρο' }],
    [1.30, 'pop', { note: 'reveal «S»' }],
    [1.80, 'thud', { note: 'heat-press κατεβαίνει' }],
    [2.10, 'shimmer', { note: 'cure ✨' }],
    [4.25, 'slide', { dur: 0.7, note: 'film μπαίνει' }],
    [6.95, 'squeegee', { dur: 1.4, note: 'emulsion coat' }],
    [9.50, 'beep', { count: 1, note: 'φως on' }], [9.65, 'air', { dur: 2.0, note: 'έκθεση σε φως' }],
    [12.65, 'air', { dur: 1.8, note: 'ξέπλυμα spray' }],
    [15.72, 'squeegee', { dur: 1.35, note: 'πέρασμα μελάνι' }],
    [17.30, 'lid', { note: 'σηκώνει το τελάρο' }],
    [17.60, 'pop', { note: 'reveal «S»' }],
    [18.05, 'shimmer', { note: '✨' }],
    [19.35, 'slide', { dur: 0.9, note: 'επόμενο tee' }],
    [20.98, 'thud', { gain: 0.8, note: 'τελάρο κάτω → «έτοιμο» (loop)' }],
  ],
});
