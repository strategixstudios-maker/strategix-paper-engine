// ad_doro «3 δώρα σε 1 κουτί» · AD εταιρικό δώρο BAGNER (MJ1655): ταπεράκι + παγούρι + μαχαιροπίρουνα μπαμπού σε κραφτ κουτί δώρου · λογότυπο χαραγμένο με laser
// host: Στράτος μόνο στο CTA · VO ElevenLabs «Stratos» + μουσική + SFX · seamless loop (LOOP: 'cut') · look: χάρτινη μακέτα (diorama.js, §1d)
// Σενάριο: scripts/ad_doro.md · σκελετός: node new.js ad_doro (2026-10-02)
// Προϊόντα ζωγραφισμένα σε χαρτί πάνω στις φωτογραφίες του site (photos/ad_doro.txt = αναφορά χρωμάτων/σχήματος): οι φωτογραφίες είναι σύνθετες (κουτί + σετ μαζί,
// demo λογότυπο LOVARTS στο πλάι του ταπεριού) → χωρίς ξεχωριστά κομμάτια για καπάκι που ανοίγει, πτήση, χάραξη. Χάραξη ΜΟΝΟ σε παγούρι + καπάκι μπαμπού (Αλέξανδρος).
// VO = vo/ad_doro_vo.mp3 @ 0,2s · χρόνοι λέξεων: VT.W('λέξη') (αρχή) / VT.E('λέξη') (τέλος)
// 0.26–1.56  Τρία δώρα σε ένα κουτί.
// 1.60–2.75  Με το λογότυπό σου.
// 2.76–7.12  Ταπεράκι για το μεσημεριανό, παγούρι για όλη τη μέρα, και μαχαιροπίρουνα από μπαμπού.
// 7.15–10.22  Το λογότυπο χαράζεται με λέιζερ, στο παγούρι και στο καπάκι.
// 10.25–10.93  Δεν ξεβάφει.
// 11.08–12.83  Και έρχονται έτοιμα, σε κουτί δώρου.
// 12.95–14.35  Το δίνεις όπως είναι.
// 14.37–17.22  Κάθε μεσημέρι, το λογότυπό σου στο τραπέζι τους.
// 17.41–18.50  Δώρα για την ομάδα σου;
// 18.60–19.64  Στείλε μας μήνυμα.
const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, txt, clamp, lerp, prog, easeIn, easeOut, easeInOut, rng, mixHex } = L;
const M = require('./motion.js');
const { handPos, poseSpring } = require('./stratos.js');
const P = require('./props.js');
const { BRAND, stamp, checkChip, ctaButton, bigTitle, kostasLogo, laserFX, smoke, sparkle } = P;
const D = require('./diorama.js'), { V } = D;
const { ROOM, roomItems, behindDesk, stratosItem, mixCam, handCam } = P;
const PI = Math.PI;

const VT = L.voText('vo/ad_doro_vo.mp3', 0.2);
const TAG = '', TOTAL = 21.2, LOOP_AT = 20.5;           // LOOP_AT: από εδώ η εικόνα = frame 0 (το caption του hook μπαίνει αυτόματα) · μουσική 21,47s
const CUTS = [0, 7.08, 11.03, 14.33, 17.33, TOTAL];       // hook → carousel = ένα πλάνο (η κάμερα πάει από κομμάτι σε κομμάτι) · laser · κουτί/στοίβα · μεσημέρι · CTA
const [, C2, C3, C4, C5] = CUTS;
const CAPS = VT.caps();
const T = {
  lid: 0.3, pop: [0.95, 1.28, 1.61], fly: 0.5, t2: VT.W('σε'), rise: [2.2, 2.6],
  lb: VT.W('ταπερ'), bt: VT.W('παγουρ'), cu: VT.W('μαχαιρ'), bam: VT.W('μπαμπου'),
  las: 7.36, pag: VT.W('παγουρ', 2), kap: VT.W('καπακ'), den: VT.W('δεν'), xeb: VT.W('ξεβαφ'),
  back: [11.14, 11.42, 11.7], close: 12.0, din: VT.W('δινεις'), drops: [13.12, 13.5, 13.88],
  mes: VT.W('μεσημερι', 2), logo: VT.W('λογοτυπ', 3), trap: VT.W('τραπεζ'),
  dora: VT.W('δωρα', 2), steile: VT.W('στειλε'), down: 19.8, exit: 19.98,
};

// ---------- χρώματα (από τις φωτογραφίες του προϊόντος) ----------
const KR = { c: '#C99B60', d: '#A97C44', in: '#D3AE76', inD: '#BF9762' };       // κραφτ: έξω · σκούρο · μέσα · μέσα σκιά
const BAM = { c: '#E8C083', d: '#C99858', l: '#F4D9AA', burn: '#4E2A10' };      // μπαμπού · χάραξη = καμένο καφέ
const STL = { c: '#BCC3CC', d: '#8E97A3', l: '#EEF1F4', mark: '#2B3038' };     // ανοξείδωτο · χάραξη = σκούρο γκρι
const BAND = '#1A1D25', PX = 40;                                              // λάστιχο · px υφής ανά cm

// ---------- στερεά από χαρτιά (1η χρήση: εδώ) ----------
// περιστροφή ως πίνακας M = Ry·Rx·Rz (ίδια σειρά με D.rot3) ↔ Euler · κομμάτι = { t, w, h, p (σημείο anchor, τοπικά cm), r ([rx, ry, rz] τοπικά), anchor }
const mat = ([rx = 0, ry = 0, rz = 0]) => {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  return [[cy * cz + sy * sx * sz, -cy * sz + sy * sx * cz, sy * cx], [cx * sz, cx * cz, -sx], [-sy * cz + cy * sx * sz, sy * sz + cy * sx * cz, cy * cx]];
};
const mm = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const mv = (A, p) => A.map(r => r[0] * p[0] + r[1] * p[1] + r[2] * p[2]);
const eul = M3 => { const rx = Math.asin(clamp(-M3[1][2], -1, 1)); return Math.cos(rx) > 1e-5 ? [rx, Math.atan2(M3[0][2], M3[2][2]), Math.atan2(M3[1][0], M3[1][1])] : [rx, Math.atan2(-M3[2][0], M3[0][0]), 0]; };
// σώμα: c = θέση της τοπικής αρχής στον κόσμο, R = πίνακας → items · ex = κοινά πεδία (zBias, alpha, clip)
const place = (parts, c, R, ex = {}) => parts.filter(Boolean).map(({ p, r, ...q }) => ({ ...q, ...ex, zBias: (q.zBias || 0) + (ex.zBias || 0), pos: V.add(c, mv(R, p)), rot: eul(mm(R, mat(r || [0, 0, 0]))) }));
// κύλινδρος (παγούρι) = χαρτί που γυρίζει πάντα προς την κάμερα γύρω από τον άξονά του
function board(cam, c, R, t, w, h, ex = {}) {
  const up = mv(R, [0, 1, 0]); let n = V.sub(cam.pos, c); n = V.sub(n, V.mul(up, V.dot(n, up)));
  if (Math.hypot(...n) < 1e-6) n = mv(R, [0, 0, -1]); n = V.norm(n);
  const zz = V.mul(n, -1), xx = V.cross(up, zz);
  return { t, w, h, pos: c, rot: eul([[xx[0], up[0], zz[0]], [xx[1], up[1], zz[1]], [xx[2], up[2], zz[2]]]), anchor: [0.5, 0.5], ...ex };
}
const A5 = [0.5, 0.5];

// ---------- υφές ----------
const tx = (key, w, h, draw, v) => D.tex(key, w * PX, h * PX, draw, v);
const grain = (x, w, h, col, n, seed, horiz = true) => { const r = rng(seed); x.strokeStyle = col; for (let i = 0; i < n; i++) { const a = r() * (horiz ? h : w); x.lineWidth = 1 + r() * 2.5; x.beginPath(); for (let k = 0; k <= 12; k++) { const s = k / 12 * (horiz ? w : h), d = Math.sin(k * 0.9 + i) * 3 * r(); if (horiz) x.lineTo(s, a + d); else x.lineTo(a + d, s); } x.stroke(); } };
const kraft = (key, w, h, col, seed, o = {}) => tx(key, w, h, (x, ww, hh) => {
  const pf = cut(x, rectPts(4, 4, ww - 8, hh - 8), col, { seed, amp: 1.5, step: 30, edgeW: 6, shadow: false, scribble: mixHex(col, '#6B4520', 0.12) });
  x.save(); L.path(x, pf); x.clip(); x.strokeStyle = 'rgba(95,58,22,0.10)'; x.lineWidth = 3; for (let i = 14; i < ww; i += 18) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, hh); x.stroke(); }
  if (o.shade) { const g = x.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, 'rgba(60,35,10,0)'); g.addColorStop(1, `rgba(60,35,10,${o.shade})`); x.fillStyle = g; x.fillRect(0, 0, ww, hh); }
  x.restore();
});
const GB = { w: 27, h: 8.5, d: 24 };                      // κουτί δώρου (cm)
const TX = {
  kFront: () => kraft('kFront', GB.w, GB.h, KR.c, 301, { shade: 0.18 }),
  kSide: () => kraft('kSide', GB.d, GB.h, KR.c, 302, { shade: 0.18 }),
  kLid: () => kraft('kLid', GB.w, GB.d, KR.c, 303),
  kLip: () => kraft('kLip', GB.w, 2.2, KR.c, 304),
  kIn: () => kraft('kIn', GB.w, GB.d, KR.in, 305),
  kInWall: () => kraft('kInWall', GB.w, GB.h, KR.inD, 306, { shade: 0.25 }),
  kInSide: () => kraft('kInSide', GB.d, GB.h, KR.inD, 307, { shade: 0.25 }),
};
// χάραξη που προχωράει γραμμή-γραμμή (raster): e = { line, part, dir, n } ή 1 (έτοιμη) / 0 (καθόλου) → clip στο κομμάτι που έχει περάσει η δέσμη
const engKey = e => typeof e === 'number' ? String(e) : `${e.line}:${Math.round(e.part * 20)}`;
function engClip(x, e, cx, cy, d) {
  if (e === 1) return true; if (!e) return false;
  const rh = d / e.n, y0 = cy - d / 2; x.beginPath(); x.rect(cx - d, y0, d * 2, rh * e.line);
  const pw = d * e.part; if (pw > 0) x.rect(e.dir > 0 ? cx - d / 2 : cx + d / 2 - pw, y0 + rh * e.line, pw, rh);
  x.clip(); return true;
}
const logo = (x, cx, cy, d, col, e, halo) => { x.save(); if (!engClip(x, e, cx, cy, d)) { x.restore(); return; } if (halo) kostasLogo(x, cx, cy + 1, d * 1.02, { mono: halo }); kostasLogo(x, cx, cy, d, { mono: col }); x.restore(); };
// ταπεράκι 800 ml: ανοξείδωτο σώμα + καπάκι μπαμπού με μαύρο λάστιχο (λάστιχο: πάνω στο καπάκι και κάτω στο μπροστινό/πίσω πλευρό)
const LB = { w: 18.5, d: 12.5, hb: 5.3, hl: 1.2 }; LB.h = LB.hb + LB.hl;
const steel = (x, ww, hh, seed, o = {}) => {
  const pf = cut(x, rrPts(4, 4, ww - 8, hh - 8, o.r ?? 26), o.col || STL.c, { seed, amp: 1.2, step: 30, edgeW: 6, shadow: false });
  x.save(); L.path(x, pf); x.clip();
  const g = x.createLinearGradient(0, 0, ww, 0); g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.22, 'rgba(255,255,255,0.55)'); g.addColorStop(0.3, 'rgba(255,255,255,0.1)'); g.addColorStop(0.75, 'rgba(40,50,70,0.10)'); g.addColorStop(0.93, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(40,50,70,0.2)');
  x.fillStyle = g; x.fillRect(0, 0, ww, hh); grain(x, ww, hh, 'rgba(90,100,115,0.07)', Math.max(2, Math.round(hh / 40)), seed + 1, !o.vert);
  if (o.band) { x.fillStyle = BAND; x.fillRect(ww / 2 - 48, 0, 96, hh); x.strokeStyle = 'rgba(255,255,255,0.08)'; x.lineWidth = 2; for (let k = 6; k < hh; k += 9) { x.beginPath(); x.moveTo(ww / 2 - 48, k); x.lineTo(ww / 2 + 48, k + 3); x.stroke(); } }
  x.restore();
};
const bamboo = (x, ww, hh, seed, o = {}) => {
  const pf = cut(x, rrPts(4, 4, ww - 8, hh - 8, o.r ?? 30), o.col || BAM.c, { seed, amp: 1.2, step: 30, edgeW: 6, shadow: false });
  x.save(); L.path(x, pf); x.clip(); grain(x, ww, hh, 'rgba(150,95,35,0.20)', Math.round(hh / 14), seed + 2); grain(x, ww, hh, 'rgba(255,240,210,0.35)', Math.round(hh / 30), seed + 3);
  if (o.band) { x.fillStyle = BAND; x.fillRect(ww / 2 - 48, 0, 96, hh); x.strokeStyle = 'rgba(255,255,255,0.08)'; x.lineWidth = 2; for (let k = 6; k < hh; k += 9) { x.beginPath(); x.moveTo(ww / 2 - 48, k); x.lineTo(ww / 2 + 48, k + 3); x.stroke(); } }
  x.restore(); return pf;
};
TX.lbFront = () => tx('lbFront', LB.w, LB.hb, (x, w, h) => steel(x, w, h, 401, { band: true }));
TX.lbSide = () => tx('lbSide', LB.d, LB.hb, (x, w, h) => steel(x, w, h, 402, { col: '#AEB6C0' }));
TX.lbInner = () => tx('lbInner', LB.w, 0.9, (x, w, h) => steel(x, w, h, 405, { col: STL.d, r: 4 }));
TX.lidEdgeF = () => tx('lidEdgeF', LB.w, LB.hl, (x, w, h) => bamboo(x, w, h, 411, { band: true, r: 10, col: BAM.d }));
TX.lidEdgeS = () => tx('lidEdgeS', LB.d, LB.hl, (x, w, h) => bamboo(x, w, h, 412, { r: 10, col: BAM.d }));
const LIDLOGO = { u: 0.775, d: 5.4 };                       // λογότυπο στο δεξί μισό του καπακιού (δίπλα στο λάστιχο)
TX.lidTop = (e = 1) => tx('lidTop' + (e === 1 ? '' : 'E'), LB.w, LB.d, (x, w, h) => {
  bamboo(x, w, h, 413, { band: true, r: 46 });
  logo(x, w * LIDLOGO.u, h / 2, LIDLOGO.d * PX, BAM.burn, e, 'rgba(120,70,25,0.35)');
}, ST.B + ':' + engKey(e));
TX.food = () => tx('food', LB.w - 0.4, LB.d - 0.4, (x, w, h) => {
  const r = rng(77); cut(x, rrPts(2, 2, w - 4, h - 4, 30), STL.d, { seed: 420, amp: 1, edgeW: 4, shadow: false });
  cut(x, rrPts(26, 26, w - 52, h - 52, 22), '#F3EAD2', { seed: 421, amp: 2, edge: false, shadow: false, scribble: '#E6D8B4' });         // ρύζι
  for (let i = 0; i < 9; i++) cut(x, circlePts(w * (0.12 + 0.36 * r()), h * (0.2 + 0.6 * r()), 34 + r() * 14, 26 + r() * 10, 9), '#D9A047', { seed: 430 + i, amp: 3, edgeW: 4, shadow: false }); // κοτόπουλο
  for (let i = 0; i < 7; i++) cut(x, circlePts(w * (0.55 + 0.35 * r()), h * (0.2 + 0.6 * r()), 30, 30, 10), '#4E9A4A', { seed: 450 + i, amp: 5, edgeW: 4, shadow: false, scribble: '#3E7F3B' }); // μπρόκολο
  for (let i = 0; i < 6; i++) { const cx = w * (0.48 + 0.3 * r()), cy = h * (0.15 + 0.7 * r()); cut(x, circlePts(cx, cy, 24), '#D9483B', { seed: 470 + i, amp: 1.5, edgeW: 4, shadow: false }); x.fillStyle = 'rgba(255,255,255,0.5)'; x.beginPath(); x.arc(cx - 8, cy - 8, 6, 0, 7); x.fill(); } // ντοματίνια
});
// παγούρι 500 ml: χερούλι σύρμα · καπάκι μπαμπού · ανοξείδωτο σώμα · λογότυπο στη μέση του σώματος
const BT = { w: 7, h: 25.5, logoY: 15.6, d: 4.5 };
TX.bottle = (e = 1) => tx('bottle' + (e === 1 ? '' : 'E'), BT.w, BT.h, (x, w, h) => {
  const c = w / 2, Y = cm => cm * PX;
  x.strokeStyle = '#9EA6B2'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.ellipse(c, Y(2.2), 46, Y(1.75), 0, PI, 0); x.stroke();
  x.strokeStyle = '#E4E8EE'; x.lineWidth = 3; x.stroke();
  const body = [[c - 80, Y(6.2)], [c + 80, Y(6.2)], [c + 80, Y(6.6)], [w - 8, Y(8.6)], [w - 8, h - 30], [w - 34, h - 6], [34, h - 6], [8, h - 30], [8, Y(8.6)], [c - 80, Y(6.6)]];
  const pf = cut(x, body, STL.c, { seed: 501, amp: 1.2, step: 30, edgeW: 6, shadow: false });
  x.save(); L.path(x, pf); x.clip();
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(30,40,60,0.38)'); g.addColorStop(0.18, 'rgba(255,255,255,0.0)'); g.addColorStop(0.3, 'rgba(255,255,255,0.75)'); g.addColorStop(0.38, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.7, 'rgba(30,40,60,0.12)'); g.addColorStop(0.88, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(30,40,60,0.45)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  grain(x, w, h, 'rgba(90,100,115,0.10)', 10, 503, false);
  x.fillStyle = 'rgba(30,40,60,0.18)'; x.fillRect(0, Y(6.2), w, Y(0.5));
  const cy = Y(BT.logoY), d = BT.d * PX; x.save(); x.translate(c, cy); x.scale(0.9, 1); logo(x, 0, 0, d, STL.mark, e); x.restore();
  x.restore();
  x.save(); x.translate(c - Y(2.3), Y(3.3)); bamboo(x, Y(4.6), Y(3.0), 505, { r: 12 }); x.restore();   // καπάκι μπαμπού
}, ST.B + ':' + engKey(e));
// μαχαιροπίρουνα μπαμπού (πιρούνι · μαχαίρι · κουτάλι)
const CU = { w: 7.4, h: 16.5 };
TX.cutlery = () => tx('cutlery', CU.w, CU.h, (x, w, h) => {
  const hw = 46, gap = (w - 3 * hw * 1.9) / 4, cx = i => gap + hw * 0.95 + i * (hw * 1.9 + gap), hy = h * 0.45;
  const handle = i => rrPts(cx(i) - hw / 2, hy, hw, h - hy - 10, 22);
  const fork = [[cx(0) - 44, 14], [cx(0) + 44, 14], [cx(0) + 44, hy - 40], [cx(0) + 24, hy + 10], [cx(0) - 24, hy + 10], [cx(0) - 44, hy - 40]];
  const knife = [[cx(1) - 10, 10], [cx(1) + 26, 40], [cx(1) + 26, hy + 10], [cx(1) - 24, hy + 10], [cx(1) - 24, 60]];
  const spoon = circlePts(cx(2), hy * 0.45, 52, hy * 0.42, 22);
  const pcs = [[fork, 0], [knife, 1], [spoon, 2]];
  pcs.forEach(([pts, i]) => {
    const pf = L.cutGroup(x, [[pts, BAM.c, { seed: 520 + i, amp: 1.2, step: 24 }], [handle(i), BAM.c, { seed: 524 + i, amp: 1.2, step: 24 }], [rectPts(cx(i) - 20, hy - 30, 40, 60), BAM.c, { seed: 527 + i, amp: 1 }]], { edgeW: 6, shadow: false, line: 'rgba(150,95,35,0.5)', lineW: 2 });
    x.save(); x.beginPath(); pf.forEach(p => { x.moveTo(p[0][0], p[0][1]); p.forEach(q => x.lineTo(q[0], q[1])); x.closePath(); }); x.clip(); grain(x, w, h, 'rgba(150,95,35,0.22)', 10, 530 + i, false); x.restore();
  });
  x.strokeStyle = 'rgba(120,75,30,0.6)'; x.lineWidth = 6; x.lineCap = 'round'; for (const dx of [-18, 0, 18]) { x.beginPath(); x.moveTo(cx(0) + dx, 16); x.lineTo(cx(0) + dx, hy - 50); x.stroke(); }
  x.strokeStyle = 'rgba(120,75,30,0.35)'; x.lineWidth = 3; x.beginPath(); x.ellipse(cx(2), hy * 0.45, 34, hy * 0.3, 0, 0, 7); x.stroke();
});
// απλές υφές: χρώμα + σκισμένη άκρη (κεφαλή laser, ράγα, laptop) · ρολόι 13:30 · κηρήθρα laser
const flat = (key, w, h, col, o = {}) => tx(key, w, h, (x, ww, hh) => { cut(x, rrPts(3, 3, ww - 6, hh - 6, o.r ?? 8), col, { seed: o.seed || 600, amp: 1.2, step: 26, edgeW: 5, shadow: false, scribble: o.scr }); if (o.draw) o.draw(x, ww, hh); }, o.v ?? 0);
TX.clock = () => D.tex('clock', 520, 520, (x, w) => {
  const c = w / 2; cut(x, circlePts(c, c, c - 14), '#FFFFFF', { seed: 960, amp: 2, edgeW: 8, shadow: false }); cut(x, circlePts(c, c, c - 40), C.paper, { seed: 961, amp: 1, edge: false, shadow: false });
  x.strokeStyle = C.navy; x.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i * PI / 6; x.lineWidth = i % 3 ? 8 : 16; x.beginPath(); x.moveTo(c + Math.sin(a) * (c - 70), c - Math.cos(a) * (c - 70)); x.lineTo(c + Math.sin(a) * (c - 46), c - Math.cos(a) * (c - 46)); x.stroke(); }
  const hand = (a, len, lw) => { x.lineWidth = lw; x.beginPath(); x.moveTo(c, c); x.lineTo(c + Math.sin(a) * len, c - Math.cos(a) * len); x.stroke(); };
  hand(1.5 * PI / 6, c * 0.45, 22); hand(PI, c * 0.68, 14); x.fillStyle = BRAND; x.beginPath(); x.arc(c, c, 18, 0, 7); x.fill();
}, 0);
TX.bed = () => D.tex('bed', 2100, 2100, (x, w, h) => {
  x.fillStyle = '#9AA3B3'; x.fillRect(0, 0, w, h); x.strokeStyle = '#6F7A8E'; x.lineWidth = 3; const R = 10, dx = R * Math.sqrt(3), dy = R * 1.5;
  for (let row = 0, y = 0; y < h + R; row++, y += dy) for (let xx = (row % 2) * dx / 2; xx < w + dx; xx += dx) { x.beginPath(); for (let i = 0; i < 6; i++) { const a = PI / 6 + i * PI / 3; x.lineTo(xx + Math.cos(a) * R, y + Math.sin(a) * R); } x.closePath(); x.stroke(); }
}, 0);

// ---------- σώματα (τοπικές cm) ----------
// κουτί w × h × d με κέντρο το (0,0,0) · F = { front, back, left, right, top } υφές (ό,τι λείπει δεν μπαίνει) · σκιά μόνο από την πάνω όψη (καλύπτει όλο το περίγραμμα, όχι διπλή σκιά)
const cuboid = (w, h, d, F) => [
  F.front && { t: F.front, w, h, p: [0, 0, -d / 2], anchor: A5, shadow: false },
  F.back && { t: F.back, w, h, p: [0, 0, d / 2], r: [0, PI, 0], anchor: A5, shadow: false },
  F.left && { t: F.left, w: d, h, p: [-w / 2, 0, 0], r: [0, PI / 2, 0], anchor: A5, shadow: false },
  F.right && { t: F.right, w: d, h, p: [w / 2, 0, 0], r: [0, -PI / 2, 0], anchor: A5, shadow: false },
  F.top && { t: F.top, w, h: d, p: [0, h / 2, 0], r: [PI / 2, 0, 0], anchor: A5 },
];
const shift = (parts, d) => parts.filter(Boolean).map(q => ({ ...q, p: V.add(q.p, d) }));
// κουτί δώρου: αρχή = κέντρο βάσης · th = άνοιγμα καπακιού (rad, 0 = κλειστό), άρθρωση στην πίσω πάνω ακμή · ανοιχτό: πάτος + εσωτερικοί τοίχοι, σκιά από πίσω/δεξί τοίχωμα
function giftParts(th = 0) {
  const { w, h, d } = GB, hinge = [0, h, d / 2], Rl = mat([th, 0, 0]), at = q => V.add(hinge, mv(Rl, q)), open = th > 0.03;
  return [
    { t: TX.kFront(), w, h, p: [0, h / 2, -d / 2], anchor: A5, shadow: false, zBias: 4 },          // μπροστά από ό,τι είναι μέσα (zBias)
    { t: TX.kSide(), w: d, h, p: [-w / 2, h / 2, 0], r: [0, PI / 2, 0], anchor: A5, shadow: false },
    { t: TX.kSide(), w: d, h, p: [w / 2, h / 2, 0], r: [0, -PI / 2, 0], anchor: A5, shadow: open },
    { t: TX.kFront(), w, h, p: [0, h / 2, d / 2], r: [0, PI, 0], anchor: A5, shadow: open },
    open && { t: TX.kIn(), w: w - 0.4, h: d - 0.4, p: [0, 0.3, 0], r: [PI / 2, 0, 0], anchor: A5, shadow: false },
    open && { t: TX.kInWall(), w: w - 0.4, h: h - 0.4, p: [0, h / 2, d / 2 - 0.2], anchor: A5, shadow: false },
    open && { t: TX.kInSide(), w: d - 0.4, h: h - 0.4, p: [-w / 2 + 0.2, h / 2, 0], r: [0, -PI / 2, 0], anchor: A5, shadow: false },
    open && { t: TX.kInSide(), w: d - 0.4, h: h - 0.4, p: [w / 2 - 0.2, h / 2, 0], r: [0, PI / 2, 0], anchor: A5, shadow: false },
    { t: TX.kLid(), w, h: d, p: hinge, r: [PI / 2 + th, 0, 0], anchor: [0.5, 0] },
    open && { t: TX.kIn(), w: w - 0.3, h: d - 0.3, p: at([0, -0.15, 0]), r: [th - PI / 2, 0, 0], anchor: [0.5, 1], shadow: false },
    { t: TX.kLip(), w, h: 2.2, p: at([0, 0, -d - 0.12]), r: [th, 0, 0], anchor: [0.5, 0], shadow: false, zBias: open ? 0 : 4.5 },
  ];
}
// καπάκι μπαμπού (αρχή = κέντρο του) · k = squash · eng = χάραξη (raster)
function lidParts(o = {}) {
  const k = o.k || 1, s = 1 / Math.sqrt(k), w = LB.w * s + 0.15, d = LB.d * s + 0.15, hl = LB.hl * k;
  return cuboid(w, hl, d, { front: TX.lidEdgeF(), back: TX.lidEdgeF(), left: TX.lidEdgeS(), right: TX.lidEdgeS(), top: TX.lidTop(o.eng ?? 1) });
}
// ταπεράκι (αρχή = κέντρο του σώματος) · o.lid = false → ανοιχτό με φαγητό
function lunchParts(o = {}) {
  const k = o.k || 1, s = 1 / Math.sqrt(k), w = LB.w * s, d = LB.d * s, hb = LB.hb * k, hl = o.lid === false ? 0 : LB.hl * k, y0 = -(hb + hl) / 2;
  const body = shift(cuboid(w, hb, d, { front: TX.lbFront(), back: TX.lbFront(), left: TX.lbSide(), right: TX.lbSide() }), [0, y0 + hb / 2, 0]);
  if (o.lid === false) return [...body,
    { t: TX.food(), w: w - 0.4, h: d - 0.4, p: [0, y0 + hb - 0.9, 0], r: [PI / 2, 0, 0], anchor: A5 },
    { t: TX.lbInner(), w: w - 0.3, h: 0.9, p: [0, y0 + hb - 0.45, d / 2 - 0.15], anchor: A5, shadow: false }];
  return [...body, ...shift(lidParts(o), [0, y0 + hb + hl / 2, 0])];
}
const cutleryItem = (c, R, ex = {}) => ({ t: TX.cutlery(), w: CU.w, h: CU.h, pos: c, rot: eul(R), anchor: A5, ...ex });
const bottleItem = (cam, c, R, o = {}) => { const k = o.k || 1; return board(cam, c, R, TX.bottle(o.eng ?? 1), BT.w / Math.sqrt(k), BT.h * k, o.ex); };

// ---------- σκηνικά ----------
// studio: μπλε τραπέζι + navy φόντο, φως από μπροστά-αριστερά (σκιές πίσω-δεξιά, στο τραπέζι και στο φόντο)
const STU = { desk: { y: 0, x0: -160, x1: 160, z0: -150, z1: 40 }, wall: { z: 95 }, floor: { y: -76 } };
const STU_L = { light: { dir: [0.5, -0.62, 0.6], soft: 0.05, shadow: 0.5 }, window: { c: [-85, 95, -75], a: [-22, 0, 18], b: [0, 30, 0], panes: [2, 2] } };
const stuItems = () => [
  { t: D.tex('stBack', 1400, 1000, (x, w, h) => { x.fillStyle = C.navy; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#15295A', 32); }, 0), w: 520, h: 360, pos: [0, STU.floor.y, STU.wall.z], surface: true, lift: 0, shadow: false },
  { t: D.tex('stTable', 1600, 960, (x, w, h) => { x.fillStyle = C.blue; x.fillRect(0, 0, w, h); L.scribble(x, [0, 0, w, h], '#2A4A9E', 31); }, 0), w: 320, h: 190, pos: [0, 0, STU.desk.z0], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
];
// laser: κηρήθρα, φως από πάνω (μέσα στο μηχάνημα)
const LZ = { desk: { y: 0, x0: -70, x1: 70, z0: -70, z1: 70 }, wall: { z: 300 }, floor: { y: -60 } };
const LZ_L = { light: { dir: [0.3, -0.92, 0.25], soft: 0.06, shadow: 0.42 } };
// γραφείο (ep02): roomItems + ρολόι 13:30 + laptop
const OFF_L = { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } };

// ---------- κουτί + 3 κομμάτια: μέσα (τοπικά στο κουτί) → πτήση → έξω (κόσμος) ----------
const BOX = [0, 0, 22];                                         // θέση του κουτιού στο frame 0 (κέντρο βάσης)
const IN = [
  { c: [-4, 0.3 + LB.h / 2, -4.5], a: [0, 0, 0] },              // ταπεράκι
  { c: [0.6, 0.3 + BT.w / 2, 7.4], a: [0, 0, -PI / 2] },          // παγούρι ξαπλωμένο (καπάκι δεξιά)
  { c: [9.3, 0.35, -3.4], a: [PI / 2, 0, 0] },                  // μαχαιροπίρουνα
];
const OUT = [
  { c: [-14, LB.h / 2, 2], a: [0, 0.38, 0], arc: 24, spin: [2 * PI, 0, 0] },
  { c: [15, BT.h / 2, 5], a: [0, 0, 0], arc: 30, spin: [0, 0, 2 * PI] },
  { c: [1, 0.35, -12], a: [PI / 2, -0.35, 0], arc: 26, spin: [0, 2 * PI, 0] },
];
function lidAt(t) {
  if (t < C3) return M.springTo(t, T.lid, 0, 1.9, { f: 2.1, z: 0.42 });
  if (t < C4) return 1.9 * (1 - easeIn(prog(t, T.close, T.close + 0.26)));
  return 0;
}
// p = 0 μέσα · 1 έξω · land = χρόνος τελευταίας προσγείωσης (squash)
function itemPose(i, t) {
  const back = t >= C3, t0 = back ? T.back[i] : T.pop[i], p = back ? 1 - clamp((t - t0) / T.fly) : clamp((t - t0) / T.fly), I = IN[i], O = OUT[i];
  const c0 = V.add(BOX, I.c), c = V.add(V.lerp(c0, O.c, p), [0, O.arc * 4 * p * (1 - p), 0]);
  const a = [0, 1, 2].map(j => lerp(I.a[j], O.a[j], p) + (back ? -1 : 1) * O.spin[j] * (back ? 1 - p : p));
  const k = i === 2 ? 1 : 1 - 0.26 * M.wobble(t, t0 + T.fly, 1, 4.5, 0.32);
  if (k !== 1) c[1] -= (1 - k) * (i === 1 ? BT.h : LB.h) / 2;
  return { c, R: mat(a), k, p, fly: p > 0 && p < 1 };
}
function itemsOf(cam, t, th) {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const s = itemPose(i, t); if (s.p <= 0 && th < 0.05) continue;                // κλειστό κουτί: κρυμμένα
    const ex = { zBias: s.p < 0.35 ? 1.5 : 0 };
    if (i === 0) out.push(...place(lunchParts({ k: s.k }), s.c, s.R, ex));
    else if (i === 1) out.push(bottleItem(cam, s.c, s.R, { k: s.k, ex }));
    else out.push(cutleryItem(s.c, s.R, ex));
  }
  return out;
}
// στοίβα: 3 ακόμα κουτιά πέφτουν το ένα πάνω στο άλλο (thud ×3)
const STACK = [[0.6, -0.4, 0.07], [-0.5, 0.5, -0.06], [0.4, -0.2, 0.1]];
function stackItems(t) {
  const out = [];
  STACK.forEach(([dx, dz, yaw], j) => {
    const tl = T.drops[j], tf = 0.3, y0 = (j + 1) * GB.h; if (t < tl - tf) return;
    const u = Math.min(0, t - tl), y = y0 + 980 / 2 * u * u, k = 1 - 0.2 * M.wobble(t, tl, 1, 5, 0.32);
    out.push(...place(giftParts(0).filter(Boolean).map(q => ({ ...q, h: q.h * (q.r && q.r[0] ? 1 : k), p: [q.p[0], q.p[1] * k, q.p[2]] })), V.add(BOX, [dx, y, dz]), mat([0, yaw, 0])));
  });
  return out;
}

// ---------- laser: raster (κεφαλή στο X, gantry στο Z), πρώτα το παγούρι, μετά το καπάκι ----------
const LZB = { c: [0, BT.w / 2, 18] }, LZD = { c: [0, LB.hl / 2, -6] };   // παγούρι ξαπλωμένο (καπάκι μακριά) · καπάκι στην κηρήθρα
const RB = { x0: -BT.d * 0.45, x1: BT.d * 0.45, y0: LZB.c[2] - (BT.logoY - BT.h / 2) + BT.d / 2 - BT.d / 18, dy: -BT.d / 9, lines: 9, vmax: 60, amax: 1600, over: 0.9, step: 0.035 };
const RL = { x0: LIDLOGO.u * 18.65 - 9.325 - LIDLOGO.d / 2, x1: LIDLOGO.u * 18.65 - 9.325 + LIDLOGO.d / 2, y0: LZD.c[2] + LIDLOGO.d / 2 - LIDLOGO.d / 18, dy: -LIDLOGO.d / 9, lines: 9, vmax: 70, amax: 1800, over: 0.9, step: 0.03 };
const LZT = { b: [T.las, T.pag - 0.12], l: [T.kap - 0.25, T.den - 0.08] };
const HZ = 2.2;                                                   // κεφαλή λίγο πίσω από τη δέσμη: από μπροστά-πάνω φαίνεται το σημείο χάραξης
function rast(t, o, [a, b]) { const T0 = M.raster(0, o).T; return M.raster((t - a) * T0 / (b - a), o); }
function engOf(r, n) { return r.done ? 1 : { line: r.line, part: r.part, dir: r.dir, n }; }
function laserState(t) {
  const rb = rast(t, RB, LZT.b), rl = rast(t, RL, LZT.l);
  const eb = t < LZT.b[0] ? 0 : engOf(rb, RB.lines), el = t < LZT.l[0] ? 0 : engOf(rl, RL.lines);
  let x, z, job = false, on = false, onB = true;
  if (t < LZT.b[0]) { x = RB.x0 - RB.over; z = RB.y0 + 3; }
  else if (t <= LZT.b[1]) { x = rb.x; z = rb.y; on = rb.on; job = true; }
  else if (t < LZT.l[0]) { const q = easeInOut(prog(t, LZT.b[1], LZT.l[0])); x = lerp(rb.x, RL.x0 - RL.over, q); z = lerp(rb.y, RL.y0, q); onB = q < 0.5; }
  else if (t < LZT.l[1]) { x = rl.x; z = rl.y; on = rl.on; job = true; onB = false; }
  else { const q = easeInOut(prog(t, LZT.l[1], LZT.l[1] + 0.4)); x = lerp(rl.x, 26, q); z = lerp(rl.y, 8, q); onB = false; }
  const surf = lerp(LZB.c[1], LB.hl, easeInOut(prog(t, LZT.b[1], LZT.l[0])));   // ο άξονας Z ανεβοκατεβαίνει (εστίαση) ανάλογα με το κομμάτι
  return { x, z, job, on, eb, el, surf, hy: surf + 4.4 };
}

// ---------- γραφείο: μεσημεριανό στο γραφείο (13:30) ----------
const LUN = { lb: [-2, LB.hb / 2, -4], lid: [-17, LB.hl / 2, -15], lidYaw: 0.25, bt: [17, BT.h / 2, -1], cu: [9, 0.35, -18], clk: [6, 0, 15] };
const LIDW = V.add(LUN.lid, mv(mat([0, LUN.lidYaw, 0]), [(LIDLOGO.u - 0.5) * 18.65, LB.hl / 2, 0]));   // λογότυπο του καπακιού στον κόσμο
function lunchItems(cam) {
  return [
    ...roomItems(ROOM, { shelf: [-38, 96] }),
    ...place(lunchParts({ lid: false }), LUN.lb, mat([0, 0, 0])),
    ...place(lidParts(), LUN.lid, mat([0, LUN.lidYaw, 0])),
    bottleItem(cam, LUN.bt, mat([0, 0, 0])),
    cutleryItem(LUN.cu, mat([PI / 2, -0.5, 0])),
    { t: TX.clock(), w: 17, h: 17, pos: V.add(LUN.clk, [0, 3, 0]), rot: [-0.12, 0, 0] },                 // επιτραπέζιο ρολόι 13:30
    { t: TX.railF(), w: 8, h: 3.2, pos: LUN.clk, rot: [0, 0, 0], shadow: false },
    ...place(shift(cuboid(32, 1.6, 22, { front: TX.lap(), top: TX.keys(), left: TX.lap(), right: TX.lap() }), [0, 0.8, 0]), [-32, 0, 24], mat([0, 0.35, 0])),
    ...place([{ t: TX.screen(), w: 32, h: 21, p: [0, 1.6, 11], r: [-0.28, 0, 0], anchor: [0.5, 1] }], [-32, 0, 24], mat([0, 0.35, 0])),
  ];
}
TX.lap = () => flat('lap', 32, 1.6, '#3A4664', { r: 4, seed: 610 });
TX.keys = () => flat('keys', 32, 22, '#4A5677', { seed: 611, draw: (x, w, h) => { x.fillStyle = '#2C3550'; for (let j = 0; j < 4; j++) for (let i = 0; i < 12; i++) x.fillRect(60 + i * 95, 70 + j * 80, 78, 60); x.fillRect(w / 2 - 170, h - 230, 340, 170); } });
TX.screen = () => flat('screen', 32, 21, C.navy, { seed: 612, draw: (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9FC0F5'); g.addColorStop(1, '#DCE7FA'); x.fillStyle = g; x.fillRect(40, 40, w - 80, h - 80); x.fillStyle = BRAND; x.fillRect(80, 90, w * 0.4, 50); x.fillStyle = '#fff'; for (let i = 0; i < 4; i++) x.fillRect(80, 190 + i * 70, w * (0.7 - i * 0.1), 30); } });
TX.rail = () => flat('rail', 120, 3, C.silver, { r: 4, seed: 620 });
TX.railF = () => flat('railF', 120, 2, '#8D96A2', { r: 3, seed: 621 });
TX.head = () => flat('head', 4.6, 4.6, C.navy, { seed: 622, draw: (x, w, h) => { x.fillStyle = '#2A3558'; x.beginPath(); x.arc(w / 2, h / 2, 50, 0, 7); x.fill(); x.fillStyle = C.sky; x.fillRect(w - 50, 16, 22, 64); } });
TX.headF = () => flat('headF', 4.6, 4, '#16244F', { seed: 623 });

// ---------- κάμερα: στησίματα (focus ΠΑΝΤΑ στον πρωταγωνιστή του πλάνου, §1d) ----------
// orb(στόχος, απόσταση cm, ύψος °, αζιμούθιο ° (0 = από μπροστά, + = από δεξιά), fov, ap, up = ο στόχος πιο κάτω στο κάδρο κατά up cm, focus = σημείο εστίασης)
const orb = (tg, d, el, az, fov, ap, up = 0, focus = tg) => { const e = el * PI / 180, a = az * PI / 180; return { pos: V.add(tg, [d * Math.sin(a) * Math.cos(e), d * Math.sin(e), -d * Math.cos(a) * Math.cos(e)]), look: V.add(tg, [0, up, 0]), fov, ap, focusAt: focus }; };
const CAM = {
  f0: orb([0, 4, 22], 135, 32, 0, 36, 16, 11),                    // frame 0: κλειστό κουτί (κάτω από τον τίτλο)
  arr: orb([0, 6, 8], 158, 30, 0, 36, 12, 13),                  // κουτί + 3 κομμάτια
  lb: orb([-14, 3.3, 2], 74, 24, -16, 34, 22, -2.5),
  bt: orb([15, 12, 5], 88, 12, 14, 34, 22, -4),
  cu: orb([1, 0.4, -12], 64, 52, 0, 34, 22),
  stack: orb([0, 17, 22], 185, 22, 20, 36, 10, 5),
  arr2: orb([0, 6, 18], 118, 34, 14, 36, 12, 1),
  cta: orb([5, 38, 50], 285, 10, 0, 36, 14, 16, [6, 52, 62]),
  lzB: orb([0, 3.5, 15.5], 70, 50, 0, 32, 18, 2.5),
  lzL: orb([3, 1.2, -6], 68, 48, 0, 32, 18, 2.5, [5, 1.2, -6]),
  off1: orb([0, 6, -2], 112, 27, -6, 38, 10, 4, [-2, 4, -4]),
  off2: orb(LIDW, 56, 40, -8, 34, 18, 0.5),
};
// [t, στήσιμο] · ανάμεσα σε δύο κλειδιά: easeInOut (ίδιο στήσιμο = στάση) · στις αλλαγές σκηνής (wipe) ασυνέχεια
const SHOTS = [
  [0, 'f0'], [0.85, 'f0'], [1.75, 'arr'], [2.6, 'arr'], [2.93, 'lb'], [T.bt - 0.18, 'lb'], [T.bt + 0.15, 'bt'], [T.cu - 0.18, 'bt'], [T.cu + 0.15, 'cu'],
  [C2, 'lzB'], [LZT.b[1], 'lzB'], [LZT.l[0], 'lzL'],
  [C3, 'arr'], [11.45, 'arr'], [12.3, 'arr2'], [12.85, 'arr2'], [13.95, 'stack'],
  [C4, 'off1'], [T.logo - 0.2, 'off1'], [T.logo + 0.55, 'off2'],
  [C5, 'cta'], [T.down + 0.05, 'cta'], [LOOP_AT, 'f0'],
];
const WHIP = [[2.6, 2.93], [T.bt - 0.18, T.bt + 0.15], [T.cu - 0.18, T.cu + 0.15]];
function camAt(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const [t0, a] = SHOTS[i], nx = SHOTS[i + 1], cut = CUTS.some(c => nx && c > t0 && c <= nx[0]);
  const o = !nx || cut ? mixCam(CAM[a], CAM[a], 0) : mixCam(CAM[a], CAM[nx[1]], easeInOut(prog(t, t0, nx[0])));
  const k = Math.min(1, t / 0.6, Math.max(0, (LOOP_AT - t) / 0.6)); o.pos = V.add(o.pos, handCam(t, 0.6 * k));
  return o;
}

// ---------- Στράτος (μόνο στο CTA): κρατάει το κουτί (δεξί χέρι, grip) + thumb up (αριστερό) → το αφήνει στο τραπέζι → βγαίνει δεξιά ----------
const POSES = [
  [0, { aR: 0.85, eR: 1.6, hR: 'grip', brows: 0.4 }],
  [T.dora + 0.05, { aR: 0.85, eR: 1.6, hR: 'grip', aL: 1.4, eL: -1.6, hL: 'fist', brows: 0.7, eyes: 'happy' }],     // γροθιά όσο σηκώνεται → thumb όταν φτάσει πάνω (lint)
  [T.dora + 0.4, { aR: 0.85, eR: 1.6, hR: 'grip', aL: 1.4, eL: -1.6, hL: 'thumb', brows: 0.7, eyes: 'happy' }],
  [T.steile + 0.5, { aR: 0.85, eR: 1.6, hR: 'grip', aL: 0.12, eL: 0, brows: 0.5 }],
  [T.down, { aR: 0.55, eR: 0.35, hR: 'grip', aL: 0.12, brows: 0.4 }],
  [T.exit, { aR: 0.12, eR: 0, aL: 0.12, brows: 0.3 }],
];
const ST_Z = 62, ST_X = 8;

function kind(t) { return t < C2 ? 'hook' : t < C3 ? 'laser' : t < C4 ? 'box' : t < C5 ? 'lunch' : 'cta'; }
function build(t) {
  const tt = t >= LOOP_AT ? 0 : t, k = kind(tt), cam = D.camera(camAt(tt));
  if (k === 'laser') {
    const s = laserState(tt), bedT = TX.bed();
    return { cam, R: LZ, ...LZ_L, grade: { from: [W * 0.3, 0], warm: 0.2, bloom: 0.16 }, items: [
      { t: bedT, w: 140, h: 140, pos: [0, 0, LZ.desk.z0], rot: [PI / 2, 0, 0], surface: true, lift: 0, shadow: false },
      bottleItem(cam, LZB.c, mat([PI / 2, 0, 0]), { eng: s.eb }),
      ...place(lidParts({ eng: s.el }), LZD.c, mat([0, 0, 0])),
      ...place(cuboid(120, 1.6, 2.2, { front: TX.railF(), top: TX.rail() }), [0, s.hy + 1, s.z + HZ + 3.4], mat([0, 0, 0])),
      ...place(cuboid(4.6, 4, 4.6, { front: TX.headF(), left: TX.headF(), right: TX.headF(), top: TX.head() }), [s.x, s.hy, s.z + HZ], mat([0, 0, 0])),
    ] };
  }
  if (k === 'lunch') return { cam, R: ROOM, ...OFF_L, items: lunchItems(cam), patch: 0.9, shaft: 0.7, dust: 80, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
  const items = [...stuItems()];
  if (k === 'cta') {
    const pose = poseSpring(POSES, tt), sx = ST_X + 110 * easeIn(prog(tt, T.exit, T.exit + 0.32));
    const st = stratosItem(cam, tt, { pos: [sx, STU.floor.y, ST_Z], pose, clip: behindDesk(cam, STU) }), s = st.t.w / 1000;
    const hp = handPos(1, pose.arms[1], s, st.t.w / 2, 400 * s, pose.elbowR), hw = D.world(st, hp[0] / st.t.w, hp[1] / st.t.h);
    const q = easeInOut(prog(tt, T.down, T.down + 0.4)), held = V.add(hw, [-4, 1.5, -12]);
    items.push(st, ...place(giftParts(0), V.add(V.lerp(held, BOX, q), [0, 7 * Math.sin(PI * q), 0]), mat([0, lerp(-0.32, 0, q), 0])));
  } else {
    const th = lidAt(tt);
    items.push(...place(giftParts(th), BOX, mat([0, 0, 0])), ...itemsOf(cam, tt, th));
    if (k === 'box') items.push(...stackItems(tt));
  }
  return { cam, items, R: STU, ...STU_L, patch: 0.45, shaft: 0.3, dust: 50, grade: { from: [W * 0.15, H * 0.2], warm: 0.22, bloom: 0.14 } };
}
const MB = t => WHIP.some(([a, b]) => t > a - 0.02 && t < b + 0.02) ? 4 : T.pop.some(p => t > p - 0.03 && t < p + T.fly) || (t > C3 && T.back.some(p => t > p - 0.03 && t < p + T.fly)) ? 3 : 1;

// ---------- 2D από πάνω ----------
const TITLE = { y: 575, fs: 122 };                                // written hook: πάνω από το κουτί (η δράση φαίνεται από κάτω)
const projOf = t => D.camera(camAt(t >= LOOP_AT ? 0 : t)).proj;
function water(ctx, t, pr) { // νερό περνάει πάνω από το καπάκι (πίσω → μπροστά) και αφήνει σταγόνες · το λογότυπο μένει
  const w = 18.65, d = 12.65, at = (u, v) => pr([LZD.c[0] + (u - 0.5) * w, LB.hl + 0.1, LZD.c[2] + (0.5 - v) * d]);
  const head = easeInOut(prog(t, T.den + 0.02, T.den + 0.42)), tail = easeInOut(prog(t, T.den + 0.25, T.xeb + 0.4));
  if (head > tail) {
    const Q = [at(0, tail), at(1, tail), at(1, head), at(0, head)];
    ctx.save(); ctx.beginPath(); Q.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    ctx.fillStyle = 'rgba(175,215,255,0.34)'; ctx.fill(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const v = lerp(tail, head, (i + 0.5) / 6), ph = t * 9 + i; ctx.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16, q = at(u, v + 0.012 * Math.sin(u * 14 + ph)); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.globalAlpha = 0.35 + 0.3 * (i % 2); ctx.stroke(); }
    ctx.restore();
    const fq = [at(0, head), at(1, head)]; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(...fq[0]); ctx.lineTo(...fq[1]); ctx.stroke(); ctx.restore();
  }
  const r = rng(808); ctx.save();
  for (let i = 0; i < 26; i++) { const u = 0.05 + 0.9 * r(), v = 0.06 + 0.88 * r(), sz = 0.6 + r(); if (Math.hypot((u - LIDLOGO.u) * w, (v - 0.5) * d) < LIDLOGO.d * 0.62 || Math.abs(u - 0.5) * w < 1.4 || v > tail) continue;
    const q = at(u, v), rr = 9 * sz; ctx.globalAlpha = clamp((tail - v) * 6); ctx.fillStyle = 'rgba(60,90,140,0.35)'; ctx.beginPath(); ctx.ellipse(q[0] + 3, q[1] + 4, rr, rr * 0.8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(225,240,255,0.85)'; ctx.beginPath(); ctx.ellipse(q[0], q[1], rr, rr * 0.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q[0] - rr * 0.35, q[1] - rr * 0.3, rr * 0.28, 0, 7); ctx.fill(); }
  ctx.restore();
}
function steam(ctx, t, q) {
  M.particles(ctx, t, { t0: C4 - 0.5, t1: C5, rate: 9, life: 1.6, seed: 91, at: () => [q[0], q[1]], vel: r => [(r() - 0.5) * 60, -60 - r() * 40], g: -30, drag: 0.6, wind: 12,
    draw: (c, p) => { const a = 0.22 * Math.sin(PI * p.k), rad = 30 + 60 * p.k; const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y + p.r() * 0, rad, 0, 7); c.fill(); } });
}

function SCENE(ctx, t) {
  D.frame(ctx, t, build, { mb: MB(t) });
  const tt = t >= LOOP_AT ? 0 : t, k = kind(tt), pr = projOf(t);
  if (k === 'hook') {
    if (tt < T.rise[1]) { bigTitle(ctx, tt, [['3 ΔΩΡΑ', -1], ['ΣΕ 1 ΚΟΥΤΙ', T.t2]].filter(([, st]) => tt >= st - 0.05), { ...TITLE, hl: 1, rise: T.rise }); }
    if (tt > 1.7 && tt < 2.7) [[OUT[0].c, [0, 3.4, 0]], [OUT[1].c, [0, 3, -3.6]]].forEach(([c, d], i) => { const q = pr(V.add(c, d)); sparkle(ctx, q[0], q[1], 0.8, tt, VT.W('λογοτυπ') + i * 0.12, 8700 + i); });
  }
  if (t >= LOOP_AT - 0.35 && t < LOOP_AT) bigTitle(ctx, t - LOOP_AT, [['3 ΔΩΡΑ', -0.3]], TITLE);
  if (t >= LOOP_AT) bigTitle(ctx, 0, [['3 ΔΩΡΑ', -1]], TITLE);
  if (k === 'hook') {
    const chip = (st, end, label) => { if (tt < end) { ctx.save(); const out = easeIn(prog(tt, end - 0.15, end)); ctx.translate(540, 1330); ctx.scale(1 - out, 1 - out); ctx.translate(-540, -1330); checkChip(ctx, tt, st, 540, 1330, label); ctx.restore(); } };
    chip(T.lb + 0.3, T.bt - 0.18, '800 ml'); chip(T.bt + 0.3, T.cu - 0.18, '500 ml'); chip(T.bam - 0.05, C2, 'ΜΠΑΜΠΟΥ');
  }
  if (k === 'laser') {
    const s = laserState(tt), b = pr([s.x, s.surf, s.z]), nz = pr([s.x, s.hy - 2, s.z + HZ - 2.3]);
    if (tt < T.pag) { const o = easeIn(prog(tt, T.pag - 0.4, T.pag - 0.15)); ctx.save(); ctx.translate(780, 1340); ctx.scale(1 - o, 1 - o); ctx.translate(-780, -1340); stamp(ctx, tt, C2 + 0.2, 780, 1340, 'LASER', -0.06, BRAND, 84); ctx.restore(); }
    if (s.job) {
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,120,60,0.75)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(nz[0], nz[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.strokeStyle = '#FFF4D8'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      if (s.on) laserFX(ctx, b[0], b[1], tt, 1.1, 7); smoke(ctx, b[0], b[1], tt, 0.8, [1, -0.3], 5, 0.22);
    }
    if (tt > T.pag - 0.15 && tt < LZT.l[0] + 0.2) { const q = pr([0, BT.w / 2, RB.y0 - 2]); sparkle(ctx, q[0] - 70, q[1] - 40, 0.9, tt, T.pag, 8711); }
    if (tt > T.den) { water(ctx, tt, pr); const q = pr([LZD.c[0] + 5.1, LB.hl, LZD.c[2]]); sparkle(ctx, q[0] + 60, q[1] - 70, 1, tt, T.xeb + 0.3, 8712); }
  }
  if (k === 'lunch') {
    steam(ctx, tt, pr(V.add(LUN.lb, [0, 2.4, 1])));
    if (tt > T.logo) { const q = pr(LIDW); sparkle(ctx, q[0] + 70, q[1] - 60, 1, tt, T.logo + 0.45, 8720); }
  }
  if (k === 'cta') {
    const out = easeIn(prog(tt, T.down - 0.1, T.down + 0.15)); if (out < 1) { ctx.save(); ctx.translate(540, 1370); ctx.scale(1 - out, 1 - out); ctx.translate(-540, -1370);
      ctaButton(ctx, tt, T.dora + 0.35, 540, 1360, 'Πάρε προσφορά'); if (tt > T.dora + 0.6) txt(ctx, 'strategixstudios.com', 540, 1456, { font: '40px Brand', color: C.paper }); ctx.restore(); }
  }
}

module.exports = require('./render.js')({
  name: 'ad_doro', CUTS, SCENE, LOOP: 'cut', LOOP_AT, TAG, CAPS,
  VO_FILE: 'vo/ad_doro_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/ad_doro.mp3',
  SFX: [
    [T.lid - 0.05, 'lid', { note: 'καπάκι ανοίγει' }], [T.t2, 'thud', { note: 'τίτλος 2η γραμμή' }],
    ...T.pop.map((p, i) => [p, 'pop', { seed: i, note: 'βγαίνει κομμάτι' }]), ...T.pop.map((p, i) => [p + T.fly, 'thud', { gain: 0.5, seed: 10 + i, note: 'προσγείωση' }]),
    ...WHIP.map(([a], i) => [a, 'swoosh', { seed: 20 + i, note: 'carousel' }]),
    [T.lb + 0.3, 'blip', { note: '800 ml' }], [T.bt + 0.3, 'blip', { note: '500 ml' }], [T.bam - 0.05, 'blip', { note: 'μπαμπού' }],
    [C2 + 0.2, 'stamp', { note: 'LASER' }], [LZT.b[0], 'laser', { dur: LZT.b[1] - LZT.b[0], note: 'χάραξη παγούρι' }], [T.pag, 'shimmer', { note: 'παγούρι έτοιμο' }],
    [LZT.l[0], 'laser', { dur: LZT.l[1] - LZT.l[0], seed: 2, note: 'χάραξη καπάκι' }], [T.den, 'flow', { dur: 0.7, note: 'νερό' }], [T.xeb + 0.3, 'shimmer', { seed: 2, note: 'δεν ξεβάφει' }],
    ...T.back.map((p, i) => [p, 'swoosh', { gain: 0.6, seed: 30 + i, note: 'μπαίνει στο κουτί' }]), [T.close + 0.24, 'thud', { note: 'καπάκι κλείνει' }],
    ...T.drops.map((p, i) => [p, 'thud', { seed: 40 + i, note: 'στοίβα' }]),
    [C4 + 0.15, 'ticks', { dur: 0.8, note: 'ρολόι 13:30' }], [T.logo + 0.45, 'shimmer', { seed: 3, note: 'λογότυπο στο τραπέζι' }],
    [T.dora + 0.35, 'pop', { seed: 5, note: 'CTA' }], [T.steile, 'click', { note: 'Στείλε μήνυμα' }], [T.down + 0.38, 'thud', { gain: 0.5, seed: 50, note: 'αφήνει το κουτί' }], [T.exit, 'swoosh', { seed: 51, note: 'βγαίνει' }],
  ],
});
