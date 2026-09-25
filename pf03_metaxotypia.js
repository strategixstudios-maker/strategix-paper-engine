// «Πώς φτιάχνεται;» — Μεταξοτυπία (screen printing) · top-down σε cutting mat · host: Στράτος (reach + pip) · VO ElevenLabs «Stratos» + SFX · ~22,4s
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, caption, captionSeq, logoMark,
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
const PARK = FCY + FH - 44;              // squeegee σε ηρεμία (κάτω)

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
  ctx.save(); ctx.translate(FCX, TCY);
  cut(ctx, TEE, C.paper, { seed: 7200, amp: 3, edgeW: 8, scribble: '#E7E2D4' });
  // γιακάς
  ctx.strokeStyle = '#DAD5C6'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, -318, 78, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.restore();
  if (o.print > 0) printedS(ctx, o.print, o);                              // μπλε «S» πάνω στο tee
}
// μπλε «S» τυπωμένο, reveal top→down (frac), προαιρετικά «υγρό» sheen
function printedS(ctx, frac, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.rect(FCX - SR - 60, FCY - SR - 60, 2 * (SR + 60), (2 * SR + 120) * clamp(frac)); ctx.clip();
  const sc = o.pop ? spring(o.pop) : 1; ctx.translate(FCX, FCY); ctx.scale(sc, sc); ctx.translate(-FCX, -FCY);
  logoMark(ctx, FCX, FCY, SR, BRAND);
  if (o.wet) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#BFD4FB'; L.path(ctx, circlePts(FCX - 34, FCY - 40, 30, 44)); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}

// -------------------- τελάρο (screen frame) --------------------
// o.lift 0..1 (σηκώνεται + fade), o.inner(ctx) ζωγραφίζει το εσωτερικό (πλέγμα/emulsion/film...)
function frame(ctx, o = {}) {
  const lift = o.lift || 0, alpha = o.alpha != null ? o.alpha : 1;
  const cy = FCY - lift * 160;
  if (lift > 0.03) { ctx.save(); ctx.globalAlpha = 0.30 * clamp(lift * 1.5); ctx.fillStyle = '#04102a'; L.path(ctx, rrPts(FCX - FW, FCY - FH + 34, FW * 2, FH * 2, 30)); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(0, cy - FCY);
  cut(ctx, rrPts(FCX - FW, FCY - FH, FW * 2, FH * 2, 30), FRAME, { seed: 7500, amp: 2, edgeW: 8 });   // πλαίσιο
  (o.inner || meshInner)(ctx);                                                                          // εσωτερικό (inset)
  ctx.restore();
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
// «rest»: πλέγμα με μπλε μελάνι στο «S» (μόλις πέρασε το μελάνι) — για hook & τέλος (loop frame)
const inkedInner = ctx => { interiorBase(ctx, '#EDEBE3', 7510, '#DBD8CE'); meshGrid(ctx); logoMark(ctx, FCX, FCY, SR, '#2447C8'); };

// -------------------- squeegee (κάτοψη: μπάρα + λάμα) --------------------
function squeegee(ctx, y) {
  cut(ctx, rrPts(FCX - (FW - 12), y - 34, (FW - 12) * 2, 44, 16), '#26356A', { seed: 7600, amp: 2, edgeW: 6 });
  cut(ctx, rrPts(FCX - (FW - 18), y + 10, (FW - 18) * 2, 16, 6), C.pale, { seed: 7601, amp: 1, edgeW: 3, shadow: false });
}

// -------------------- film positive (διαφάνεια + μαύρο «S») --------------------
function filmPositive(ctx, dx = 0) {
  ctx.save(); ctx.translate(dx, 0); ctx.globalAlpha = 0.94;
  cut(ctx, rrPts(FCX - 272, FCY - 336, 544, 672, 12), '#CFE0FA', { seed: 7800, amp: 1.5, edgeW: 5 });
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; L.path(ctx, rrPts(FCX - 250, FCY - 316, 150, 632, 8)); ctx.fill();
  ctx.globalAlpha = 1; logoMark(ctx, FCX, FCY, SR, C.ink);
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
// helper: «rest» = τελάρο κάτω στο tee, squeegee parked (hook@0 ≡ pass end → seamless loop)
function restOnTee(ctx) { matBG(ctx); teeFlat(ctx); frame(ctx, { inner: inkedInner }); squeegee(ctx, PARK); }

// S0 — HOOK: τελάρο κάτω → σηκώνεται → μπλε «S» → heat-press cure  (VO: «Αυτό είναι η μεταξοτυπία.»)
function sHook(ctx, lt) {
  const lift = easeInOut(prog(lt, 0.5, 1.25));
  const alpha = 1 - easeIn(prog(lt, 1.0, 1.55));
  const revealed = lift > 0.1;
  const down = easeInOut(prog(lt, 1.5, 1.8)) * (1 - easeInOut(prog(lt, 2.0, 2.3)));
  matBG(ctx);
  teeFlat(ctx, revealed ? { print: 1, wet: lt < 1.9, pop: prog(lt, 1.05, 1.4) } : {});
  if (alpha > 0.02) frame(ctx, { inner: inkedInner, lift, alpha });
  if (lift < 0.15) squeegee(ctx, PARK);
  if (down > 0.02) platen(ctx, down);
  if (lt > 2.0) { sparkle(ctx, FCX - 96, FCY - 70, 1.0, lt, 2.06, 71); sparkle(ctx, FCX + 104, FCY + 60, 0.9, lt, 2.16, 72); sparkle(ctx, FCX + 30, FCY - 150, 0.8, lt, 2.26, 73); }
  caption(ctx, 'Αυτό είναι η μεταξοτυπία', lt, 0.15); seriesTag(ctx, lt, TAG);
}

// S1 — QUESTION / rewind  (VO: «Αλλά πώς γίνεται;»)
function sQuestion(ctx, lt) {
  matBG(ctx);
  frame(ctx, { inner: meshInner });                        // άδειο τελάρο (mesh)
  // «?» που σκάει
  pop(ctx, lt, 0.15, FCX, FCY, () => txt(ctx, ';', 0, 60, { font: 'bold 320px Round', color: C.sky }));
  pip(ctx, ...PIP, VO);
  caption(ctx, 'Αλλά πώς γίνεται;', lt, 0.1); seriesTag(ctx, lt, TAG);
}

// S2 — βήμα 1: το σχέδιο σε film  (VO: «Πρώτα, το σχέδιό σου τυπώνεται σε μια διαφάνεια.»)
function sFilm(ctx, lt) {
  matBG(ctx);
  const k = easeOut(prog(lt, 0.15, 0.9));
  filmPositive(ctx, (1 - k) * -820);
  if (k > 0.9) reach(ctx, FCX + 150, FCY + 250, 300, 760, { seed: 810, hand: 'open', side: -1 });
  caption(ctx, '1 · Το σχέδιο σε film', lt, 0.12); seriesTag(ctx, lt, TAG);
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
  caption(ctx, '2 · Emulsion', lt, 0.12); seriesTag(ctx, lt, TAG);
}

// S4 — βήμα 3: έκθεση σε φως  (VO: «Φως. Ό,τι κρύβει το σχέδιο, μένει μαλακό.»)
function sLight(ctx, lt) {
  matBG(ctx);
  frame(ctx, { inner: c => { interiorBase(c, EMUL, 7512); logoMark(c, FCX, FCY, SR, C.ink); } }); // emulsion + film (μαύρο S)
  const g = easeOut(prog(lt, 0.2, 0.8)) * (1 - 0.15 * Math.max(0, Math.sin(lt * 20)));
  ctx.save();
  const grd = ctx.createRadialGradient(FCX, FCY - 40, 40, FCX, FCY - 40, 560);
  grd.addColorStop(0, `rgba(255,255,255,${0.72 * g})`); grd.addColorStop(0.5, `rgba(220,231,250,${0.28 * g})`); grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 250, W, 1230);
  ctx.strokeStyle = `rgba(255,255,255,${0.5 * g})`; ctx.lineWidth = 6; ctx.lineCap = 'round';       // ακτίνες
  for (let a = 0; a < 6; a++) { const an = a / 6 * Math.PI * 2 + lt * 0.4; ctx.beginPath(); ctx.moveTo(FCX + Math.cos(an) * 210, FCY - 40 + Math.sin(an) * 210); ctx.lineTo(FCX + Math.cos(an) * 320, FCY - 40 + Math.sin(an) * 320); ctx.stroke(); }
  ctx.restore();
  caption(ctx, '3 · Έκθεση σε φως', lt, 0.12); seriesTag(ctx, lt, TAG);
}

// S5 — βήμα 4: ξέπλυμα → ανοίγει το «S» στο πλέγμα  (VO: «Ξέπλυμα — και το σχέδιο ανοίγει στο πλέγμα.»)
function sWash(ctx, lt) {
  matBG(ctx);
  const open = easeInOut(prog(lt, 0.5, 1.9));              // το «S» ανοίγει top→down
  frame(ctx, {
    inner: c => {
      interiorBase(c, EMUL, 7512);
      c.save(); c.beginPath(); c.rect(FCX - SR - 60, FCY - SR - 40, 2 * (SR + 60), (2 * SR + 80) * open); c.clip();
      logoMark(c, FCX, FCY, SR, C.navy);                   // ανοιχτό «S» (φαίνεται το mat από κάτω)
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
  caption(ctx, '4 · Ξέπλυμα', lt, 0.12); seriesTag(ctx, lt, TAG);
}

// S6 — βήμα 5: πέρασμα στο tee + κλείσιμο (τελάρο ΚΑΤΩ → loop)  (VO: πέρασμα + «...πιο γερούς.»)
function sPass(ctx, lt) {
  matBG(ctx); teeFlat(ctx, {});
  const sqStart = FCY - FH + 60, sqEnd = PARK;
  const travel = easeInOut(prog(lt, 0.25, 2.0));           // η σπάτουλα κατεβαίνει
  const sqY = lerp(sqStart, sqEnd, travel);
  const inkFrac = clamp((sqY - (FCY - SR)) / (2 * SR));
  // τελάρο (πλέγμα ανοιχτό) — δείχνει το μπλε μελάνι μέχρι τη σπάτουλα
  frame(ctx, {
    inner: c => {
      interiorBase(c, '#EDEBE3', 7510, '#DBD8CE'); meshGrid(c);
      c.save(); c.beginPath(); c.rect(FCX - SR - 60, FCY - SR - 60, 2 * (SR + 60), (sqY - (FCY - SR - 60))); c.clip();
      logoMark(c, FCX, FCY, SR, '#2447C8'); c.restore();
    }
  });
  squeegee(ctx, sqY);
  if (travel < 1) reach(ctx, FCX + FW - 70, sqY - 12, 440, 720, { seed: 840, hand: 'grip', side: -1 });
  captionSeq(ctx, lt, [[0.12, '5 · Πέρασμα'], [2.4, 'Ένας από τους παλιότερους τρόπους'], [4.65, 'Κι από τους πιο γερούς.']]);
  seriesTag(ctx, lt, TAG);
}

const SCENES = [[sHook, 2.6], [sQuestion, 1.45], [sFilm, 2.7], [sEmul, 2.55], [sLight, 3.1], [sWash, 3.05], [sPass, 6.95]];
const WIPES = [1, 2, 3, 4, 5, 6];

require('./render.js')({
  name: 'pf03_metaxotypia',
  SCENES, WIPES, LOOP: true,
  VO_FILE: 'vo/pf03_vo.mp3', VO_AT: 0.15,
  SFX: [
    [0.55, 'lid', { note: 'σηκώνει το τελάρο' }],
    [1.15, 'pop', { note: 'reveal «S»' }],
    [1.75, 'thud', { note: 'heat-press κατεβαίνει' }],
    [2.30, 'shimmer', { note: 'cure ✨' }],
    [4.25, 'slide', { dur: 0.7, note: 'film μπαίνει' }],
    [6.95, 'squeegee', { dur: 1.4, note: 'emulsion coat' }],
    [9.50, 'beep', { count: 1, note: 'φως on' }], [9.65, 'air', { dur: 2.0, note: 'έκθεση σε φως' }],
    [12.65, 'air', { dur: 1.8, note: 'ξέπλυμα spray' }],
    [15.70, 'squeegee', { dur: 1.4, note: 'πέρασμα μελάνι' }],
  ],
});
