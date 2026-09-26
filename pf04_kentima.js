// «Πώς φτιάχνεται;» — Κέντημα σε καπέλο · host: Στράτος · VO ElevenLabs «Stratos» + SFX · 22,2s · χωρίς loop (κατ' απαίτηση), τέλος = CTA
// Hook: ο Στράτος κρατάει navy καπέλο με κεντημένο «S» → μηχανή σε περίγραμμα + «?» → 1 σχέδιο → βελονιές (over-the-shoulder)
// → 2 τελάρο (τεντωμένο) → 3 η μηχανή κεντάει (reveal) → CTA «Στείλε μας το λογότυπό σου, και ας φτιάξουμε τα δικά σου.»
const L = require('./lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, txt, pop, caption, captionSeq, brandMark,
  lerp, clamp, prog, easeOut, easeIn, easeInOut, spring, lipsync, blinkNow } = L;
const { stratos, handPos, S: SK } = require('./stratos.js');
const { BRAND, bgFlat, wallShelf, seriesTag, stamp, sparkle, stratosBack, reach, msgOut } = require('./props.js');

// VO = vo/pf04_vo.mp3 @ 0,2s (ElevenLabs eleven_v3 από τον connector, φωνή «Stratos», take 1/2 · παύσεις → 0,3s, «μόνο συντεταγμένες» κολλητά).
// v2: η τελευταία φράση (CTA) = νέο take 1/2 κολλημένο στη θέση του «…και...» του loop. Χρονισμοί φράσεων (video):
// 0,30 Αυτό είναι ένα καπέλο με κέντημα. | 2,17 Πάμε να δούμε πώς φτιάχνεται. | 3,63 Πρώτα, στον υπολογιστή, το σχέδιο γίνεται βελονιές.
// 6,60 Γιατί η μηχανή δεν διαβάζει εικόνες, (8,61) μόνο συντεταγμένες. | 9,93 Μετά, | 10,60 το καπέλο μπαίνει στο τελάρο, | 12,03 τεντωμένο, για να μη ζαρώσει.
// 13,77 Το τελάρο κουμπώνει στη μηχανή, | 15,53 και η βελόνα | 16,37 ακολουθεί το αρχείο, βελονιά-βελονιά. | 18,77 Στείλε μας το λογότυπό σου, | 20,23 και ας φτιάξουμε τα δικά σου. (–21,40)
const T = { pame: 2.17, prota: 3.63, giati: 6.6, mono: 8.61, meta: 9.93, kapelo: 10.6, tent: 12.03, klak: 14.45, velona: 15.53, steile: 18.77, kai: 20.23, dika: 20.85, end: 21.4 };
const SC = [0, 2.05, 3.5, 9.8, 13.62, 18.64, 22.2];   // αρχές σκηνών (hook · ; · 1 · 2 · 3 · CTA) + τέλος video
const VO = []; // lip-sync από την ένταση του αρχείου (ST.VOENV)
const TAG = 'Πώς φτιάχνεται;', HOOK = 'Αυτό είναι ένα καπέλο με κέντημα.';

// ---------- χρώματα ----------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixC = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
const THREAD = '#F4F1E9';                          // λευκή κλωστή
const CAPC = '#1D2F6B', CAPL = '#26397E';          // navy καπέλο (ύφασμα · πάνω όψη γείσου)

// ---------- κέντημα satin: «S» (Poppins, όπως brandMark) + κύκλος — γεωμετρία μία φορά ----------
// Βελονιές = [x0, y0, x1, y1, sheen] σε font-px (F = 600, origin = κέντρο του brandMark). Σειρά = σειρά ραφής: «S» από πάνω προς τα κάτω, μετά ο κύκλος.
const EMB = (() => {
  const N = 700, F = 600, SP = 9, c = L.createCanvas(N, N), x = c.getContext('2d');
  x.font = `${F}px Brand`; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  const m = x.measureText('S'), by = N / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  x.fillStyle = '#000'; x.fillText('S', N / 2, by);
  const d = x.getImageData(0, 0, N, N).data, M = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) M[i] = d[i * 4 + 3] > 127 ? 1 : 0;
  const inside = (px, py) => { const i = Math.round(px), j = Math.round(py); return i >= 0 && j >= 0 && i < N && j < N && M[j * N + i]; };
  // σκελετός (Zhang–Suen) → μεγαλύτερη διαδρομή = κεντρική γραμμή του «S»
  const K = M.slice(), P = (i, j) => K[j * N + i];
  for (let ch = true; ch;) {
    ch = false;
    for (const st of [0, 1]) {
      const del = [];
      for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
        if (!K[j * N + i]) continue;
        const q = [P(i, j - 1), P(i + 1, j - 1), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1), P(i - 1, j + 1), P(i - 1, j), P(i - 1, j - 1)];
        const B = q.reduce((a, b) => a + b, 0); if (B < 2 || B > 6) continue;
        let A = 0; for (let k = 0; k < 8; k++) if (!q[k] && q[(k + 1) % 8]) A++; if (A !== 1) continue;
        const [p2, , p4, , p6, , p8] = q;
        if (st === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue;
        del.push(j * N + i);
      }
      for (const k of del) K[k] = 0; if (del.length) ch = true;
    }
  }
  const nb = k => { const i = k % N, j = (k - i) / N, o = []; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if ((di || dj) && K[(j + dj) * N + i + di]) o.push((j + dj) * N + i + di); return o; };
  const bfs = s => { const prev = new Map([[s, -1]]), q = [s]; let last = s; for (let h = 0; h < q.length; h++) { last = q[h]; for (const n of nb(last)) if (!prev.has(n)) { prev.set(n, last); q.push(n); } } return [last, prev]; };
  const k0 = K.findIndex(v => v), [a] = bfs(k0), [b, prev] = bfs(a);
  let cl = []; for (let k = b; k !== -1; k = prev.get(k)) cl.push([k % N, Math.floor(k / N)]);
  if (cl[0][1] > cl[cl.length - 1][1]) cl.reverse();                               // ξεκινά από την πάνω άκρη
  cl = cl.slice(8, -8);                                                              // χωρίς τις «διχάλες» του σκελετού στις άκρες
  for (let it = 0; it < 4; it++) cl = cl.map((p, i) => { let sx = 0, sy = 0, n = 0; for (let j = Math.max(0, i - 6); j <= Math.min(cl.length - 1, i + 6); j++) { sx += cl[j][0]; sy += cl[j][1]; n++; } return [sx / n, sy / n]; });
  // προέκταση στις άκρες (ο σκελετός σταματά πριν από την κομμένη άκρη του γράμματος)
  const ext = (p, q) => { const L0 = Math.hypot(p[0] - q[0], p[1] - q[1]), ux = (p[0] - q[0]) / L0, uy = (p[1] - q[1]) / L0, o = []; for (let s = 1; s < 120 && inside(p[0] + ux * s, p[1] + uy * s); s++) o.push([p[0] + ux * s, p[1] + uy * s]); return o; };
  cl = [...ext(cl[0], cl[10]).reverse(), ...cl, ...ext(cl[cl.length - 1], cl[cl.length - 11])];
  // επαναδειγματοληψία ανά SP/2 px (zigzag: μία όχθη ανά σταθμό)
  const arc = [0]; for (let i = 1; i < cl.length; i++) arc.push(arc[i - 1] + Math.hypot(cl[i][0] - cl[i - 1][0], cl[i][1] - cl[i - 1][1]));
  const at = s => { let i = 1; while (i < arc.length - 1 && arc[i] < s) i++; const f = (s - arc[i - 1]) / ((arc[i] - arc[i - 1]) || 1); return [lerp(cl[i - 1][0], cl[i][0], f), lerp(cl[i - 1][1], cl[i][1], f)]; };
  const r = L.rng(4242), zz = [], len = arc[arc.length - 1], sta = [];
  for (let s = 0, side = 1; s <= len; s += SP / 2, side = -side) {
    const p = at(s), p1 = at(Math.max(0, s - 6)), p2 = at(Math.min(len, s + 6)), tl = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    const nx = -(p2[1] - p1[1]) / tl, ny = (p2[0] - p1[0]) / tl;
    let e = 0; while (e < 160 && inside(p[0] + nx * side * e, p[1] + ny * side * e)) e += 0.5;
    sta.push([p, nx * side, ny * side, e]);
  }
  const med = sta.map(v => v[3]).sort((a, b) => a - b)[sta.length >> 1] * 1.25;         // όριο μισού πάχους: χωρίς «αγκάθια» στις κομμένες άκρες
  for (const [p, nx, ny, e0] of sta) { const e = Math.min(e0, med) + 0.5; zz.push([p[0] + nx * e + (r() - 0.5), p[1] + ny * e + (r() - 0.5)]); }
  const st = [], LA = -2.3;                                                          // φως από πάνω-αριστερά
  const add = (p, q) => { const th = Math.atan2(q[1] - p[1], q[0] - p[0]); st.push([p[0] - N / 2, p[1] - N / 2, q[0] - N / 2, q[1] - N / 2, 0.5 - 0.5 * Math.cos(2 * (th - LA))]); };
  for (let i = 0; i + 1 < zz.length; i++) add(zz[i], zz[i + 1]);
  const nS = st.length;
  // κύκλος: satin με κλίση, ξεκινά κάτω και γυρίζει δεξιόστροφα
  const R = F / 1.3, RW = R * 0.15 / 2 + 2, nR = Math.round(2 * Math.PI * R / (SP / 2));
  for (let i = 0; i < nR; i++) {
    const a0 = Math.PI / 2 + (i / nR) * 2 * Math.PI, a1 = Math.PI / 2 + ((i + 1) / nR) * 2 * Math.PI, sl = 0.05;
    const p = i % 2 ? [Math.cos(a0 + sl) * (R + RW), Math.sin(a0 + sl) * (R + RW)] : [Math.cos(a0) * (R - RW), Math.sin(a0) * (R - RW)];
    const q = i % 2 ? [Math.cos(a1) * (R - RW), Math.sin(a1) * (R - RW)] : [Math.cos(a1 + sl) * (R + RW), Math.sin(a1 + sl) * (R + RW)];
    const j = () => (r() - 0.5) * 1.6, th = Math.atan2(q[1] - p[1], q[0] - p[0]);
    st.push([p[0] + j(), p[1] + j(), q[0] + j(), q[1] + j(), 0.5 - 0.5 * Math.cos(2 * (th - LA))]);
  }
  return { st, nS, F, SP };
})();

// κέντημα: (x, y) = κέντρο · r = ακτίνα κύκλου (όπως brandMark) · o.p 0..1 = πρόοδος ραφής · o.col κλωστή · επιστρέφει το σημείο της βελόνας
function embroidery(ctx, x, y, r, o = {}) {
  const k = 1.3 * r / EMB.F, n = EMB.st.length, cnt = clamp(o.p ?? 1) * n, last = Math.ceil(cnt), col = o.col || THREAD, w = EMB.SP * 0.62;
  if (cnt <= 0) return [x + EMB.st[0][0] * k, y + EMB.st[0][1] * k];
  const seg = i => { const s = EMB.st[i], f = i < Math.floor(cnt) ? 1 : cnt - i; return [s[0], s[1], s[0] + (s[2] - s[0]) * f, s[1] + (s[3] - s[1]) * f, s[4]]; };
  const S = []; for (let i = 0; i < last; i++) S.push(seg(i));
  const stroke = (list, width, style, ox = 0, oy = 0, a = 0, b = 1) => {
    ctx.beginPath(); for (const s of list) { ctx.moveTo(s[0] + (s[2] - s[0]) * a + ox, s[1] + (s[3] - s[1]) * a + oy); ctx.lineTo(s[0] + (s[2] - s[0]) * b + ox, s[1] + (s[3] - s[1]) * b + oy); }
    ctx.lineWidth = width; ctx.strokeStyle = style; ctx.stroke();
  };
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.lineCap = 'round';
  stroke(S, w * 2.2, 'rgba(3,8,26,0.38)', 7, 11);                                       // ανάγλυφο: σκιά στο ύφασμα
  ctx.lineCap = 'butt';
  stroke(S, w * 2.4, mixC(col, '#8D90A6', 0.2), 0, 0, 0.02, 0.98);                    // βάση: γεμίζει τα κενά στις καμπύλες (underlay)
  stroke(S, w * 1.12, mixC(col, '#6E7494', 0.3));                                     // αυλάκια ανάμεσα στις κλωστές
  for (let bkt = 0; bkt < 6; bkt++) {                                                  // σώμα κλωστής: γυαλάδα ανά κατεύθυνση (anisotropic)
    const list = S.filter(s => Math.min(5, Math.floor(s[4] * 6)) === bkt); if (!list.length) continue;
    stroke(list, w * 0.95, mixC(mixC(col, '#7F84A2', 0.3), '#FFFFFF', (bkt / 5) ** 0.55));
  }
  for (let bkt = 0; bkt < 6; bkt++) {                                                  // λάμψη στη μέση της κλωστής (φουσκωμένη)
    const list = S.filter(s => Math.min(5, Math.floor(s[4] * 6)) === bkt); if (!list.length) continue;
    stroke(list, w * 0.38, `rgba(255,255,255,${0.1 + 0.8 * (bkt / 5) ** 1.5})`, 0, 0, 0.28, 0.72);
  }
  ctx.restore();
  const s = S[S.length - 1]; return [x + s[2] * k, y + s[3] * k];
}

// ---------- καπέλο baseball (structured, 6 φύλλα), πρόσοψη από λίγο ψηλά ----------
// (x, y) = κέντρο του κεντήματος · s = κλίμακα (s 1 ≈ 600px πλάτος) · o.emb 0..1 πρόοδος κεντήματος (false = χωρίς) · o.wrinkle 0..1 ζάρες στο μπροστινό φύλλο
const CAP = { hw: 300, base: 112, dip: 34, top: -222, vis: 318, visD: 150, r: 116 };
const bez3 = (p0, p1, p2, p3, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); });
const capBase = (xx, hw = CAP.hw) => CAP.base + CAP.dip * (1 - (xx / hw) ** 2);
function cap(ctx, x, y, s, o = {}) {
  const sd = o.seed || 5100, { hw, top, vis, visD } = CAP;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // γείσο (πάνω όψη): μισοφέγγαρο κάτω από τη βάση
  if (o.visor !== false) {
    const up = [], dn = [];
    for (let i = 0; i <= 24; i++) { const xx = -vis + (2 * vis * i) / 24, f = 1 - (xx / vis) ** 2; up.push([xx, capBase(xx, vis) - 6]); dn.push([xx, CAP.base + visD * Math.pow(Math.max(0, f), 0.6)]); }
    const pv = cut(ctx, [...up, ...dn.reverse()], CAPL, { seed: sd + 1, amp: 2, step: 26, edgeW: 8 });
    ctx.save(); L.path(ctx, pv); ctx.clip();
    const g = ctx.createLinearGradient(0, CAP.base, 0, CAP.base + visD); g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(0.35, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,255,255,0.06)');
    ctx.fillStyle = g; ctx.fillRect(-vis, CAP.base - 20, 2 * vis, visD + 40);
    ctx.setLineDash([11, 7]); ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(160,184,238,0.42)';
    for (const f of [0.34, 0.5, 0.66, 0.82]) { ctx.beginPath(); for (let i = 0; i <= 30; i++) { const xx = -vis * 0.97 + (1.94 * vis * i) / 30, q = 1 - (xx / vis) ** 2; const yy = lerp(capBase(xx, vis), CAP.base + visD * Math.pow(Math.max(0, q), 0.6), f); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
    ctx.setLineDash([]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(2,6,22,0.3)'; ctx.beginPath();                               // πάχος γείσου στην άκρη
    for (let i = 0; i <= 30; i++) { const xx = -vis + (2 * vis * i) / 30, q = 1 - (xx / vis) ** 2, yy = CAP.base + visD * Math.pow(Math.max(0, q), 0.6) - 9; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    ctx.restore();
  }
  // θόλος
  const L1 = bez3([-hw, CAP.base], [-hw - 8, -70], [-238, top], [0, top]), R1 = L1.map(([a, b]) => [-a, b]).reverse();
  const bs = []; for (let i = 1; i < 24; i++) { const xx = hw - (2 * hw * i) / 24; bs.push([xx, capBase(xx)]); }
  const pc = cut(ctx, [...L1, ...R1.slice(1), ...bs], CAPC, { seed: sd + 2, amp: 2, step: 26, edgeW: 9, scribble: '#23377A' });
  ctx.save(); L.path(ctx, pc); ctx.clip();
  const g = ctx.createRadialGradient(-50, -150, 30, 0, -40, 380); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = g; ctx.fillRect(-hw - 20, top - 20, 2 * hw + 40, 520);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 2;                       // twill ύφανση
  for (let i = -900; i < 900; i += 8) { ctx.beginPath(); ctx.moveTo(i, top - 20); ctx.lineTo(i + 520, top + 500); ctx.stroke(); }
  // ραφές: κέντρο + πλαϊνές (σκούρα γραμμή + διπλό τρύπημα)
  const seams = [[[0, top + 6], [0, -120], [0, 40], [0, capBase(0)]], [[0, top + 6], [165, top + 25], [225, -30], [212, capBase(212)]], [[0, top + 6], [-165, top + 25], [-225, -30], [-212, capBase(212)]]];
  for (const sm of seams) {
    const pts = bez3(...sm, 24), line = (dx, w, c, dash) => { ctx.setLineDash(dash); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a + dx, b) : ctx.moveTo(a + dx, b)); ctx.stroke(); };
    line(0, 4.5, 'rgba(2,6,22,0.45)', []); line(-10, 2.4, 'rgba(160,184,238,0.4)', [9, 7]); line(10, 2.4, 'rgba(160,184,238,0.4)', [9, 7]);
  }
  ctx.setLineDash([]);
  if (o.wrinkle > 0) {                                                                   // ζάρες (πριν το τέντωμα)
    const a = clamp(o.wrinkle);
    for (const [p0, c1, p1] of [[[-230, 110], [-150, 20], [-60, -40]], [[210, 130], [120, 60], [50, -10]], [[-150, -190], [-110, -110], [-30, -80]], [[140, -170], [90, -60], [30, -40]], [[-40, 150], [0, 100], [60, 120]]]) {
      for (const [w, c, dy] of [[14, `rgba(2,6,22,${0.34 * a})`, 0], [5, `rgba(170,190,240,${0.22 * a})`, -8]]) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p0[0], p0[1] + dy); ctx.quadraticCurveTo(c1[0], c1[1] + dy, p1[0], p1[1] + dy); ctx.stroke(); }
    }
  }
  ctx.restore();
  // τρύπες αερισμού + κουμπί
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 118, -150); ctx.fillStyle = '#0A1433'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 11, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(160,184,238,0.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 14, 16, 0, 0, 7); ctx.stroke(); ctx.restore(); }
  cut(ctx, circlePts(0, top + 2, 24, 16, 16), CAPC, { seed: sd + 3, amp: 1, edgeW: 5 });
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.ellipse(-6, top - 3, 12, 6, 0, 0, 7); ctx.fill();
  let needle = null;
  if (o.emb !== false) needle = embroidery(ctx, 0, 0, CAP.r, { p: o.emb ?? 1, col: o.thread });
  ctx.restore();
  return needle && [x + (needle[0] - x) * s, y + (needle[1] - y) * s];
}

// τελάρο καπέλου: πλαϊνά μπράτσα, κάτω ζώνη, λουρί με μεντεσέ (αριστερά) και μάνταλο (δεξιά) · (x, y) = κέντρο κεντήματος
// o.strap 0..1 (το λουρί κατεβαίνει) · o.latch 0..1 (μάνταλο κλειδώνει) · o.dy (το καπέλο πέφτει μέσα) · o.wrinkle · o.emb · o.gauge (βάση τοποθέτησης)
const STEEL = '#AEB8CC', STEELD = '#7E89A2', STEELL = '#D5DCE9', BODY = '#EEF1F7';
function capHoop(ctx, x, y, s, o = {}) {
  const sd = 5300, hb = xx => capBase(xx, 350);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.gauge) { cut(ctx, rrPts(-120, 150, 240, 420, 18), STEELD, { seed: sd, amp: 2, edgeW: 7 }); cut(ctx, rrPts(-270, 540, 540, 64, 16), STEELD, { seed: sd + 1, amp: 2, edgeW: 7 }); }
  for (const sg of [-1, 1]) cut(ctx, rrPts(sg > 0 ? 288 : -348, -60, 60, 240, 14), STEEL, { seed: sd + 2 + sg, amp: 1.5, edgeW: 7 });
  cap(ctx, 0, o.dy || 0, 1, { visor: false, wrinkle: o.wrinkle, emb: o.emb ?? false, seed: 5100 });
  const band = [];
  for (let i = 0; i <= 20; i++) { const xx = -352 + 35.2 * i; band.push([xx, hb(xx) + 12]); }
  for (let i = 20; i >= 0; i--) { const xx = -352 + 35.2 * i; band.push([xx, hb(xx) + 62]); }
  cut(ctx, band, STEELD, { seed: sd + 5, amp: 1.5, step: 30, edgeW: 7 });
  for (const xx of [-300, -150, 0, 150, 300]) { ctx.fillStyle = STEELL; ctx.beginPath(); ctx.arc(xx, hb(xx) + 37, 7, 0, 7); ctx.fill(); }
  const hx = -334, hy = hb(-334) + 2, st = clamp(o.strap ?? 1), lat = clamp(o.latch ?? 1);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-(1 - easeOut(st)) * 1.2); ctx.translate(-hx, -hy);
  const sp = [];
  for (let i = 0; i <= 20; i++) { const xx = -334 + 33.4 * i; sp.push([xx, hb(xx) - 18]); }
  for (let i = 20; i >= 0; i--) { const xx = -334 + 33.4 * i; sp.push([xx, hb(xx) + 16]); }
  cut(ctx, sp, STEELL, { seed: sd + 6, amp: 1.2, step: 30, edgeW: 6 });
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const xx = -320 + 32 * i; i ? ctx.lineTo(xx, hb(xx) - 6) : ctx.moveTo(xx, hb(xx) - 6); } ctx.stroke();
  ctx.save(); ctx.translate(330, hb(330) + 1); ctx.rotate(-(1 - lat) * 1.1);                     // μάνταλο (μοχλός)
  cut(ctx, rrPts(-12, -14, 74, 28, 12), STEELD, { seed: sd + 7, amp: 1, edgeW: 5 }); ctx.restore();
  ctx.restore();
  cut(ctx, circlePts(hx, hy, 15, 15, 14), STEELD, { seed: sd + 8, amp: 1, edgeW: 5 });
  ctx.restore();
}

// ---------- κεντητική μηχανή (πρόσοψη) · origin = σημείο βελόνας = κέντρο κεντήματος ----------
// REV = { t, t0 }: πριν το t0 όλα σε μαύρο περίγραμμα (σκηνή «;»), μετά γεμίζουν χρώμα κομμάτι-κομμάτι · null = χρώμα
const MO = [540, 1110], MS = 0.82, HS = 0.55;           // θέση · κλίμακα μηχανής · κλίμακα τελάρου πάνω στη μηχανή
const CONES = [C.paper, BRAND, '#F4D98A', C.sky, C.navy, '#FFFFFF', C.mid, '#F29C9C', C.pale, '#6F93D8', C.blue];
let REV = null;
const revK = i => !REV ? 1 : clamp((REV.t - REV.t0 - i * 0.03) / 0.3);
function part(ctx, pts, col, i, o = {}) {
  const k = revK(i);
  if (k <= 0) { L.path(ctx, pts); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke(); return pts; }
  const [a, b, c, d] = L.bbox(pts), cx = (a + c) / 2, cy = (b + d) / 2, sc = 0.8 + 0.2 * spring(k);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  const pf = cut(ctx, pts, col, { seed: 6000 + i * 7, amp: 2, edgeW: 7, ...o }); ctx.restore(); return pf;
}
const dot = (ctx, x, y, r, fill, line) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (line) { ctx.lineWidth = 4; ctx.strokeStyle = line; ctx.stroke(); } };
function machineBack(ctx) {
  part(ctx, rectPts(-440, -642, 880, 22), STEEL, 9);                                          // ράφι κώνων
  for (const sx of [-436, 420]) part(ctx, rectPts(sx, -792, 16, 152), STEEL, 9);
  part(ctx, rectPts(-448, -806, 896, 18), STEEL, 9);                                          // μπάρα οδηγών
  CONES.forEach((col, i) => {
    const cx = -400 + 80 * i, k = revK(10 + i);
    part(ctx, [[cx - 30, -642], [cx + 30, -642], [cx + 13, -738], [cx - 13, -738]], col, 10 + i, { edgeW: 5, amp: 1.2 });
    if (k > 0) { ctx.strokeStyle = 'rgba(0,0,0,0.13)'; ctx.lineWidth = 2; for (let yy = -728; yy < -648; yy += 9) { const hw = 13 + 17 * (yy + 738) / 96; ctx.beginPath(); ctx.moveTo(cx - hw + 4, yy); ctx.lineTo(cx + hw - 4, yy); ctx.stroke(); } }
  });
  part(ctx, rrPts(-470, 230, 940, 120, 20), C.navy, 0);                                       // βάση
  part(ctx, rrPts(-470, -330, 110, 570, 16), BODY, 1); part(ctx, rrPts(360, -330, 110, 570, 16), BODY, 2);
  part(ctx, rectPts(-360, 104, 720, 28), STEELD, 3); part(ctx, rrPts(-62, 118, 124, 118, 12), '#5B6478', 3); // ράγες + κάτω βραχίονας
  part(ctx, rrPts(-470, -620, 940, 320, 44), BODY, 4);                                        // κεφαλή
  part(ctx, rectPts(-470, -332, 940, 26), C.navy, 5);
  if (revK(4) > 0) brandMark(ctx, -385, -540, 34, C.navy); else dot(ctx, -385, -540, 34, C.paper, C.ink);
  CONES.forEach((col, i) => {                                                                  // κλωστές: κώνος → οδηγός → τανυστήρας
    const cx = -400 + 80 * i, kx = -150 + 30 * i, k = revK(10 + i);
    ctx.strokeStyle = k > 0 ? (col === '#FFFFFF' || col === C.paper ? '#DAD6CC' : col) : C.ink; ctx.lineWidth = k > 0 ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(cx, -738); ctx.lineTo(cx, -797); ctx.lineTo(kx, -440); ctx.stroke();
  });
  const drv = []; for (let i = 0; i <= 16; i++) { const xx = -250 + 31.25 * i; drv.push([xx, 52 + 26 * (1 - (xx / 250) ** 2)]); }
  for (let i = 16; i >= 0; i--) { const xx = -250 + 31.25 * i; drv.push([xx, 92 + 26 * (1 - (xx / 250) ** 2)]); }
  part(ctx, drv, STEEL, 21);                                                                   // cap driver
}
function machineFront(ctx, t, run) {
  const on = revK(6) > 0, bob = run ? (Math.floor(t * 30) % 2 ? 16 : 0) : 0;
  part(ctx, rrPts(-182, -472, 364, 382, 24), STEEL, 6);                                        // κουτί βελονών
  for (let j = 0; j < 11; j++) {
    const kx = -150 + 30 * j, act = j === 5;
    dot(ctx, kx, -440, 10, on ? STEELL : C.paper, on ? STEELD : C.ink);                       // τανυστήρες
    ctx.strokeStyle = on ? '#4A5470' : C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(kx, -405); ctx.lineTo(kx, -318); ctx.stroke();
    const ly = -380 + (act ? bob * 2.2 : 0);
    L.path(ctx, rrPts(kx - 9, ly - 7, 18, 14, 5)); ctx.fillStyle = on ? (act ? BRAND : STEELD) : C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = on ? '#4A5470' : C.ink; ctx.stroke();
    ctx.strokeStyle = on ? '#5B6478' : C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(kx, -92); ctx.lineTo(kx, act ? -62 - bob : -74); ctx.stroke();
  }
  const ty = -4 - bob;                                                                         // ενεργή βελόνα + πιεστικό πόδι + κλωστή
  if (on) { ctx.strokeStyle = 'rgba(244,241,233,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, ty - 18); ctx.lineTo(1, -380 + bob * 2.2); ctx.stroke(); }
  ctx.strokeStyle = on ? STEELL : C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -62 - bob); ctx.lineTo(0, ty); ctx.stroke();
  ctx.strokeStyle = on ? STEELD : C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, -12 - bob * 0.4, 17, 6, 0, 0, 7); ctx.stroke();
  part(ctx, rectPts(470, -560, 44, 20), STEELD, 7);                                            // πάνελ ελέγχου
  part(ctx, rrPts(506, -622, 124, 190, 16), C.navy, 7);
  if (revK(7) > 0) { cut(ctx, rrPts(518, -608, 100, 118, 8), C.sky, { seed: 6200, amp: 1, edge: false, shadow: false }); brandMark(ctx, 568, -549, 26, C.navy); }
}
// το σημείο της βελόνας στο κέντημα (font-px), εξομαλυμένο (ο πίδακας των βελονιών πηγαίνει δεξιά-αριστερά στο satin)
function embPt(p) { const n = EMB.st.length, c = clamp(p) * n, i = Math.min(n - 1, Math.floor(c)), f = c - i, s = EMB.st[i]; return [s[0] + (s[2] - s[0]) * f, s[1] + (s[3] - s[1]) * f]; }
function embCenter(p) { let x = 0, y = 0; for (let j = 0; j < 10; j++) { const q = embPt(p - j * 0.0015); x += q[0]; y += q[1]; } return [x / 10, y / 10]; }
// μεγάλο «?» σε χαρτί
function qmark(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  txt(ctx, '?', 14, 18, { font: 'bold 640px Round', color: 'rgba(5,10,30,0.22)' });
  txt(ctx, '?', 0, 0, { font: 'bold 640px Round', color: BRAND, edge: 26, edgeC: '#FBFAF6' });
  ctx.restore();
}
// βήμα: αριθμός σε μπλε κύκλο + λέξη (κάτω από το caption)
function stepChip(ctx, t, st, n, label) {
  ctx.font = 'bold 44px Round'; const w = ctx.measureText(label).width + 124, x = 72 + w / 2, y = 568;
  pop(ctx, t, st, x, y, () => {
    cut(ctx, rrPts(-w / 2, -40, w, 80, 40), C.paper, { seed: 7000 + n, amp: 2, edgeW: 7 });
    cut(ctx, circlePts(-w / 2 + 42, 0, 29, 29, 20), BRAND, { seed: 7010 + n, amp: 1, edgeW: 4, shadow: false });
    txt(ctx, String(n), -w / 2 + 42, 2, { font: 'bold 40px Round', color: '#fff' });
    txt(ctx, label, -w / 2 + 84, 2, { font: 'bold 44px Round', color: C.ink, align: 'left' });
  }, -0.03);
}
const cam = (ctx, x, y, z, sx = x, sy = y) => { ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-x, -y); };

// αντίχειρες πάνω στο μπροστινό φύλλο (τα χέρια κρατάνε το καπέλο από τα πλάγια, πίσω από τον θόλο)
function thumb(ctx, x, y, side, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * side, s); ctx.rotate(-0.5);
  cut(ctx, rrPts(-20, -62, 40, 92, 20), SK.skin, { seed: 5160 + side, amp: 1.2, edgeW: 5 });
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(0, -44, 11, 13, 0, 0, 7); ctx.fill();   // νύχι
  ctx.restore();
}
// ---------- 0 · hook: ο Στράτος κρατάει το καπέλο ----------
const ST0 = [540, 970, 1.3], CAP0 = [540, 1230, 0.78];   // Στράτος: x, ώμοι, κλίμακα · καπέλο
const HOLD = { arms: [0.85, 0.85], elbowL: 1.5, elbowR: 1.5, handL: 'grip', handR: 'grip' };
const handsY = (a, e) => handPos(1, a, ST0[2], ST0[0], ST0[1], e)[1];
function hostCap(ctx, t, o = {}) {
  const k = o.k ?? 1, a = lerp(0.42, 0.85, k), e = lerp(0.55, 1.5, k);                         // k 0 → 1: σηκώνει το καπέλο στην πόζα του hook
  const [cx, , cs] = CAP0, cy = CAP0[1] + handsY(a, e) - handsY(0.85, 1.5), sc = cs * lerp(0.9, 1, k);
  wallShelf(ctx, { y: 700 });
  stratos(ctx, ST0[0], ST0[1], ST0[2], { seed: 1000, legs: false, mouth: lipsync(VO, 'smile'), blink: blinkNow(), brows: o.brows ?? 0.5, eyes: o.eyes, look: o.look,
    ...HOLD, arms: [a, a], elbowL: e, elbowR: e });
  cap(ctx, cx, cy, sc);
  for (const sd of [-1, 1]) thumb(ctx, cx + sd * (CAP.hw - 34) * sc, cy + 40 * sc, sd, 0.9);
}
function hook(ctx, t) {
  const z = 1 + 0.2 * easeInOut(prog(t, 0.15, 1.85));
  ctx.save(); cam(ctx, CAP0[0], CAP0[1], z); hostCap(ctx, t); ctx.restore();
  sparkle(ctx, CAP0[0] + 118, CAP0[1] - 96, 0.55, t, 1.15, 5401);
}
// ---------- 1 · «;»: η μηχανή σε περίγραμμα + μεγάλο «?» ----------
function question(ctx, t) {
  bgFlat(ctx, C.paper, '#E6E0D0', 41);
  REV = { t, t0: Infinity };
  ctx.save(); ctx.translate(...MO); ctx.scale(MS, MS); machineBack(ctx); machineFront(ctx, t, false); ctx.restore();
  REV = null;
  pop(ctx, t, T.pame + 0.1, 540, 930, () => qmark(ctx, 0, 0, 1, 0.06 * Math.sin((t - T.pame) * 5)), 0);
}
// ---------- 2 · βήμα 1: over-the-shoulder, το σχέδιο γίνεται βελονιές ----------
const SCR = [118, 646, 844, 538], CAN = [288, 694, 674, 490], CC = [625, 939], SR = 185;   // οθόνη · καμβάς · κέντρο «S» · ακτίνα κύκλου
const scrK = 1.3 * SR / EMB.F, P1 = [4.1, 6.2], P2 = [8.8, 9.75];
function cursor(ctx, x, y, down) {
  ctx.save(); ctx.translate(x, y); ctx.scale(down ? 0.9 : 1, down ? 0.9 : 1);
  L.path(ctx, [[0, 0], [0, 46], [12, 35], [21, 56], [30, 52], [21, 32], [36, 32]]); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
}
function software(ctx, t) {
  const [sx, sy, sw, sh] = SCR, [cx0, cy0, cw, ch] = CAN;
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#F4F7FD'; ctx.fillRect(sx, sy, sw, sh);
  ctx.fillStyle = '#2A3B73'; ctx.fillRect(sx, sy, sw, 48);
  txt(ctx, 'Ψηφιοποίηση · S_logo.dst', sx + 24, sy + 25, { font: 'bold 26px Round', color: '#fff', align: 'left' });
  for (let i = 0; i < 3; i++) dot(ctx, sx + sw - 30 - i * 28, sy + 24, 8, ['#F29C9C', '#F4D98A', C.sky][i]);
  ctx.fillStyle = '#E3EAF8'; ctx.fillRect(sx, sy + 48, 170, sh - 48);
  txt(ctx, 'ΕΙΚΟΝΑ', sx + 85, sy + 88, { font: 'bold 22px Round', color: C.ink });
  ctx.fillStyle = '#fff'; ctx.fillRect(sx + 18, sy + 110, 134, 134); brandMark(ctx, sx + 85, sy + 177, 46, C.navy);
  const bx = sx + 85, by = sy + 322, press = t > 3.95 && t < 4.1;                              // κουμπί «Βελονιές»
  L.path(ctx, rrPts(bx - 70, by - 28, 140, 56, 28)); ctx.fillStyle = press ? C.navy : BRAND; ctx.fill();
  txt(ctx, 'Βελονιές', bx, by + 1, { font: 'bold 25px Round', color: '#fff' });
  ctx.strokeStyle = '#E1E8F6'; ctx.lineWidth = 2;                                                // καμβάς: πλέγμα
  for (let x = cx0 + 25; x < cx0 + cw; x += 40) { ctx.beginPath(); ctx.moveTo(x, cy0); ctx.lineTo(x, cy0 + ch); ctx.stroke(); }
  for (let y = cy0 + 25; y < cy0 + ch; y += 40) { ctx.beginPath(); ctx.moveTo(cx0, y); ctx.lineTo(cx0 + cw, y); ctx.stroke(); }
  brandMark(ctx, CC[0], CC[1], SR, 'rgba(40,84,243,0.13)');                                      // το σχέδιο (εικόνα) από κάτω
  const p = easeInOut(prog(t, ...P1)), n = Math.floor(p * EMB.st.length);                       // βελονιές με τη σειρά ραφής
  ctx.save(); ctx.translate(...CC); ctx.scale(scrK, scrK); ctx.lineWidth = 1.5 / scrK; ctx.lineCap = 'round';
  for (const [a, b, col] of [[0, Math.min(n, EMB.nS), BRAND], [EMB.nS, n, C.navy]]) {
    if (b <= a) continue; ctx.strokeStyle = col; ctx.beginPath(); for (let i = a; i < b; i++) { const s = EMB.st[i]; ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); } ctx.stroke();
  }
  ctx.restore();
  if (p > 0 && p < 1) { const q = embPt(p); dot(ctx, CC[0] + q[0] * scrK, CC[1] + q[1] * scrK, 7, '#F29C9C', C.ink); }
  const ax = easeOut(prog(t, T.mono, T.mono + 0.3));                                               // «μόνο συντεταγμένες»: άξονες X / Y + σταυρόνημα
  if (ax > 0) {
    ctx.strokeStyle = C.navy; ctx.fillStyle = C.navy; ctx.lineWidth = 4;
    const x1 = lerp(CC[0], cx0 + cw - 30, ax), y1 = lerp(CC[1], cy0 + 30, ax);
    ctx.beginPath(); ctx.moveTo(cx0 + 20, CC[1]); ctx.lineTo(x1, CC[1]); ctx.moveTo(CC[0], cy0 + ch - 20); ctx.lineTo(CC[0], y1); ctx.stroke();
    L.path(ctx, [[x1 + 14, CC[1]], [x1 - 6, CC[1] - 10], [x1 - 6, CC[1] + 10]]); ctx.fill(); L.path(ctx, [[CC[0], y1 - 14], [CC[0] - 10, y1 + 6], [CC[0] + 10, y1 + 6]]); ctx.fill();
    txt(ctx, 'X', x1 - 4, CC[1] + 34, { font: 'bold 34px Round', color: C.navy }); txt(ctx, 'Y', CC[0] + 30, y1 + 6, { font: 'bold 34px Round', color: C.navy });
    const q = embPt(prog(t, ...P2)), px = CC[0] + q[0] * scrK, py = CC[1] + q[1] * scrK;
    if (t > P2[0]) {
      ctx.save(); ctx.setLineDash([8, 7]); ctx.strokeStyle = '#F29C9C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, CC[1]); ctx.moveTo(px, py); ctx.lineTo(CC[0], py); ctx.stroke(); ctx.restore();
      dot(ctx, px, py, 9, '#F29C9C', C.ink);
      const f = v => (v / 10).toFixed(1).replace('.', ','), lab = `X ${f(q[0])}   Y ${f(-q[1])}`;
      ctx.font = 'bold 28px Round'; const lw = ctx.measureText(lab).width + 30, lx = clamp(px + 24, cx0 + 10, cx0 + cw - lw - 10), ly = clamp(py - 58, cy0 + 10, cy0 + ch - 50);
      L.path(ctx, rrPts(lx, ly, lw, 44, 12)); ctx.fillStyle = C.navy; ctx.fill(); txt(ctx, lab, lx + 15, ly + 23, { font: 'bold 28px Round', color: '#fff', align: 'left' });
    }
  }
  const cp = t < 3.9 ? easeInOut(prog(t, 3.5, 3.9)) : 1, cq = easeInOut(prog(t, 4.15, 4.6));     // κέρσορας → κλικ στο «Βελονιές» → φεύγει
  cursor(ctx, lerp(lerp(760, bx, cp), 610, cq), lerp(lerp(1130, by, cp), 1150, cq), press);
  ctx.restore();
}
function step1(ctx, t) {
  bgFlat(ctx, C.blue, '#3456B0', 21);
  const g = ctx.createRadialGradient(540, 920, 100, 540, 920, 640); g.addColorStop(0, 'rgba(220,231,250,0.35)'); g.addColorStop(1, 'rgba(220,231,250,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1300);
  cut(ctx, rectPts(-40, 1262, W + 80, 800), C.pale, { seed: 22, amp: 3, scribble: '#C9D7F2' });                      // γραφείο
  cut(ctx, rectPts(500, 1180, 80, 100), C.navy, { seed: 23, amp: 1.5, edgeW: 6 }); cut(ctx, rrPts(390, 1262, 300, 26, 12), C.navy, { seed: 24, amp: 1.5, edgeW: 6 });
  cut(ctx, rrPts(470, 1330, 470, 96, 14), STEELL, { seed: 25, amp: 1.5, edgeW: 6 });                                    // πληκτρολόγιο
  ctx.fillStyle = 'rgba(11,27,63,0.18)'; for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) ctx.fillRect(488 + c * 37, 1344 + r * 26, 30, 19);
  cut(ctx, rrPts(92, 620, 896, 590, 28), C.navy, { seed: 26, amp: 2, edgeW: 8 });                                     // οθόνη
  software(ctx, t);
  ctx.save(); ctx.filter = 'blur(7px)'; stratosBack(ctx, 170, 1570, 1.5); ctx.restore();                               // ώμος σε πρώτο πλάνο, θολός
  stepChip(ctx, t, 3.7, 1, 'Βελονιές');
  pop(ctx, t, T.giati + 0.15, SCR[0] + 85, SCR[1] + 177, () => { for (const r of [0.78, -0.78]) { ctx.save(); ctx.rotate(r); cut(ctx, rrPts(-86, -13, 172, 26, 12), C.navy, { seed: 7100 + r * 10, amp: 1, edgeW: 6 }); ctx.restore(); } }, 0);
}
// ---------- 3 · βήμα 2: το καπέλο στο τελάρο, τεντωμένο ----------
const HO = [540, 930, 1.05];                                  // τελάρο στη βάση τοποθέτησης
function step2(ctx, t) {
  bgFlat(ctx, C.blue, '#3456B0', 31);
  cut(ctx, rectPts(-40, 1520, W + 80, 500), C.navy, { seed: 32, amp: 3 });
  const drop = t < 10.95 ? -1100 * (1 - easeIn(prog(t, 10.55, 10.95))) : -26 * Math.sin(Math.PI * prog(t, 10.95, 11.2));
  const wr = 1 - easeOut(prog(t, T.tent, T.tent + 0.4)), pulse = 1 + 0.018 * Math.sin(Math.PI * prog(t, T.tent, T.tent + 0.3));
  capHoop(ctx, HO[0], HO[1], HO[2] * pulse, { gauge: true, dy: drop, wrinkle: wr, strap: prog(t, 11.2, 11.85), latch: prog(t, T.tent - 0.08, T.tent + 0.04) });
  const lx = HO[0] + 330 * HO[2] + 40, ly = HO[1] + (capBase(330, 350) - 14) * HO[2];            // χέρι πατάει το μάνταλο
  const inK = easeOut(prog(t, 11.55, 11.95)) * (1 - easeIn(prog(t, 12.35, 12.75))), press = 14 * Math.sin(Math.PI * prog(t, T.tent - 0.12, T.tent + 0.12));
  if (inK > 0) reach(ctx, lx + 300 * (1 - inK), ly - 10 + press + 160 * (1 - inK), 1, 0.55, { hand: 'point', side: -1, seed: 7200 });
  stepChip(ctx, t, 9.95, 2, 'Τελάρο');
  stamp(ctx, t, T.tent + 0.18, 560, 700, 'ΤΕΝΤΩΜΕΝΟ', -0.06, BRAND, 66);
}
// ---------- 4 · βήμα 3: το τελάρο κουμπώνει → reveal → η βελόνα ράβει ----------
const P3 = [T.velona, 18.3], RUN = [15.05, 18.35];
function step3(ctx, t) {
  const bgK = prog(t, T.klak, T.klak + 0.35);
  bgFlat(ctx, C.paper, '#E6E0D0', 41);
  if (bgK > 0) { ctx.save(); ctx.globalAlpha = bgK; bgFlat(ctx, C.blue, '#3456B0', 42); ctx.restore(); }
  const z = 1 + 1.55 * easeInOut(prog(t, 15.0, 15.5)), run = t > RUN[0] && t < RUN[1];
  const p = prog(t, ...P3), w = easeInOut(prog(t, 15.2, P3[0])) * (1 - easeInOut(prog(t, 18.3, 18.6)));
  const q = embCenter(p), kE = 1.3 * CAP.r / EMB.F * HS, shake = run ? (Math.floor(t * 30) % 2 ? 1.5 : -1.5) : 0;
  const slide = t < T.klak ? 700 * (1 - easeOut(prog(t, 13.72, 14.4))) : -8 * Math.sin(Math.PI * prog(t, T.klak, T.klak + 0.15));
  ctx.save(); cam(ctx, MO[0], MO[1], z, MO[0], lerp(MO[1], 930, easeInOut(prog(t, 15.0, 15.5)))); ctx.translate(...MO); ctx.scale(MS, MS);
  REV = { t, t0: T.klak };
  machineBack(ctx);
  capHoop(ctx, -q[0] * kE * w + shake, -q[1] * kE * w + slide, HS, { emb: p });
  machineFront(ctx, t, run);
  REV = null; ctx.restore();
  if (t < T.klak + 0.4) {                                                                          // το «?» σκίζεται στο κλακ
    const k = easeIn(prog(t, T.klak, T.klak + 0.4));
    for (const sg of [-1, 1]) {
      ctx.save(); ctx.globalAlpha = 1 - k; ctx.beginPath();
      const tearX = [[560, 480], [520, 620], [575, 760], [515, 900], [570, 1040], [525, 1200], [560, 1380]];
      ctx.moveTo(sg < 0 ? -100 : W + 100, 480); for (const [x, y] of tearX) ctx.lineTo(x, y); ctx.lineTo(sg < 0 ? -100 : W + 100, 1380); ctx.closePath(); ctx.clip();
      ctx.translate(sg * 260 * k, 180 * k); ctx.rotate(sg * 0.35 * k); qmark(ctx, 540, 930, 1, 0.06 * Math.sin((t - T.pame) * 5)); ctx.restore();
    }
  }
  stepChip(ctx, t, T.klak + 0.2, 3, 'Κέντημα');
  if (t > 18.25) sparkle(ctx, 540 + 130, 930 - 120, 0.6, t, 18.3, 5402);
}
// ---------- 5 · CTA: σηκώνει το καπέλο · «Το λογότυπό μου» στέλνεται («Στείλε μας το λογότυπό σου, και ας φτιάξουμε τα δικά σου.») ----------
function outro(ctx, t) {
  const k = easeOut(prog(t, SC[5] + 0.05, SC[5] + 0.85));
  hostCap(ctx, t, { k, eyes: t < 19.9 || t > T.dika ? 'happy' : 'dot', brows: t < 19.9 ? 0.7 : t > T.dika ? 0.9 : 0.5 });
  if (t > T.dika - 0.05) sparkle(ctx, CAP0[0] + 118, CAP0[1] - 96, 0.6, t, T.dika, 5403);
  const out = easeIn(prog(t, T.kai - 0.05, T.kai + 0.3));
  if (t > 18.9 && out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(520 * out, -420 * out); pop(ctx, t, 18.95, 0, 0, () => msgOut(ctx, 610, 860, 380, 96, 'Το λογότυπό μου', { fs: 38, seed: 7300 }), 0); ctx.restore(); }
}

// ---------- captions + ετικέτα σειράς ----------
const CAPS = [[-1, HOOK], [2.1, 'Πάμε να δούμε πώς φτιάχνεται.'], [3.57, 'Πρώτα, στον υπολογιστή,'], [4.98, '...το σχέδιο γίνεται βελονιές.'],
  [6.55, 'Γιατί η μηχανή δεν διαβάζει εικόνες...'], [8.56, '...μόνο συντεταγμένες.'], [9.88, 'Μετά, το καπέλο μπαίνει στο τελάρο,'],
  [11.98, 'τεντωμένο, για να μη ζαρώσει.'], [13.72, 'Το τελάρο κουμπώνει στη μηχανή...'], [15.48, '...και η βελόνα ακολουθεί το αρχείο,'], [17.48, 'βελονιά-βελονιά.'],
  [18.72, 'Στείλε μας το λογότυπό σου,'], [20.18, '...και ας φτιάξουμε τα δικά σου.']];
const scene = (fn, t0) => (ctx, lt) => {
  const t = t0 + lt; fn(ctx, t); captionSeq(ctx, t, CAPS);
  if (t < 2.1) seriesTag(ctx, t + 1, TAG);                                          // ήδη στο frame 0 · μόνο με το caption του hook
};
const FNS = [hook, question, step1, step2, step3, outro];

require('./render.js')({
  name: 'pf04_kentima',
  SCENES: FNS.map((fn, i) => [scene(fn, SC[i]), SC[i + 1] - SC[i]]),
  WIPES: 'all',
  LOOP: false,                                    // κατ' απαίτηση: χωρίς loop (το «…και» → «Αυτό είναι…» δεν έδενε καλά), τέλος = CTA
  VO_FILE: 'vo/pf04_vo.mp3', VO_AT: 0.2,
  SFX: [
    [0.3, 'zoom', { gain: 0.6, note: 'hook: push-in στο κέντημα' }],
    [1.15, 'shimmer', { gain: 0.6, note: '✨ κέντημα' }],
    [T.pame + 0.1, 'pop', { note: '«?»' }], [T.pame + 0.15, 'boing', { gain: 0.7 }],
    [3.97, 'click', { note: 'κουμπί «Βελονιές»' }],
    [P1[0], 'ticks', { count: 16, gap: 0.13, rise: 1.5, note: 'βελονιές στην οθόνη' }],
    [T.giati + 0.15, 'stamp', { note: '✗ στην εικόνα' }],
    [T.mono, 'blip', { note: 'άξονες X / Y' }], [P2[0], 'ticks', { count: 10, gap: 0.09, rise: 1.2, note: 'συντεταγμένες' }],
    [10.55, 'slide', { dur: 0.45, note: 'το καπέλο μπαίνει στο τελάρο' }], [10.95, 'thud', { gain: 0.8 }],
    [11.2, 'swoosh', { gain: 0.6, note: 'λουρί' }],
    [T.tent, 'stamp', { note: 'μάνταλο: κλακ' }], [T.tent + 0.18, 'pop', { seed: 3, note: 'ΤΕΝΤΩΜΕΝΟ' }],
    [13.72, 'slide', { dur: 0.6, seed: 2, note: 'τελάρο → μηχανή' }],
    [T.klak, 'stamp', { seed: 2, note: 'κουμπώνει' }], [T.klak + 0.02, 'tear', { gain: 0.8, note: 'το «?» σκίζεται' }], [T.klak + 0.1, 'shimmer', { gain: 0.5, dur: 0.6, note: 'χρώματα' }],
    [15.0, 'zoom', { gain: 0.6, note: 'zoom στη βελόνα' }],
    [RUN[0], 'stitch', { dur: RUN[1] - RUN[0], note: 'κεντητική μηχανή' }],
    [18.3, 'ding', { note: '✓ κέντημα' }], [18.35, 'shimmer', { gain: 0.6 }],
    [18.95, 'pop', { seed: 5, note: 'μήνυμα «Το λογότυπό μου»' }], [T.kai, 'sent', { note: 'στάλθηκε' }], [T.dika, 'shimmer', { gain: 0.5, note: '✨ «τα δικά σου»' }],
  ],
});
