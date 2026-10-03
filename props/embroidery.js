// props/embroidery.js — κέντημα (pf04 → ka03): καπέλο baseball · «S» Strategix σε satin βελονιές με πρόοδο ραφής · οποιοδήποτε λογότυπο κεντημένο (stitched)
// pf04 μένει ως έχει (inline αντίγραφο) · εδώ η 2η χρήση (ka03) με o.logoFn στο καπέλο
const L = require('../lib.js');
const { cut, circlePts, lerp, clamp, mixHex: mixC } = L;

const THREAD = '#F4F1E9';                          // λευκή κλωστή
const CAPC = '#1D2F6B', CAPL = '#26397E';          // navy καπέλο (ύφασμα · πάνω όψη γείσου)

// ---------- κέντημα satin: «S» (Poppins, όπως brandMark) + κύκλος — γεωμετρία μία φορά, την 1η φορά που χρειάζεται (όχι στο require) ----------
// Βελονιές = [x0, y0, x1, y1, sheen] σε font-px (F = 600, origin = κέντρο του brandMark). Σειρά = σειρά ραφής: «S» από πάνω προς τα κάτω, μετά ο κύκλος.
let EMB_ = null;
const emb = () => EMB_ || (EMB_ = (() => {
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
})());

// «S» Strategix κεντημένο: (x, y) = κέντρο · r = ακτίνα κύκλου (όπως brandMark) · o.p 0..1 = πρόοδος ραφής · o.col κλωστή · επιστρέφει το σημείο της βελόνας
function embroidery(ctx, x, y, r, o = {}) {
  const EMB = emb();
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
const CAP = { hw: 300, base: 112, dip: 34, top: -222, vis: 318, visD: 150, r: 116 };   // γεωμετρία καπέλου (μονάδες s = 1) · r = χώρος για λογότυπο
const bez3 = (p0, p1, p2, p3, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); });
const capBase = (xx, hw = CAP.hw) => CAP.base + CAP.dip * (1 - (xx / hw) ** 2);
// καπέλο baseball (pf04 → ka03): (x, y) = κέντρο του κεντήματος · s = κλίμακα (s 1 ≈ 640px πλάτος με το γείσο) · CAP.r = ακτίνα του χώρου για λογότυπο
// o.logoFn(ctx) = λογότυπο στο μπροστινό φύλλο (origin = κέντρο κεντήματος, μονάδες καπέλου, π.χ. stitched) · αλλιώς «S» με o.emb 0..1 πρόοδο (false = χωρίς) · o.thread · o.wrinkle 0..1 ζάρες · o.visor false · o.seed
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
  if (o.logoFn) { ctx.save(); o.logoFn(ctx); ctx.restore(); }
  else if (o.emb !== false) needle = embroidery(ctx, 0, 0, CAP.r, { p: o.emb ?? 1, col: o.thread });
  ctx.restore();
  return needle && [x + (needle[0] - x) * s, y + (needle[1] - y) * s];
}

// ---------- οποιοδήποτε λογότυπο κεντημένο (ka03) ----------
const STITCH = new Map();                          // cache υφών (o.key)
// layers = [{ draw(c), col, kind, ang }] από κάτω προς τα πάνω · draw ζωγραφίζει τη μάσκα του layer (οποιοδήποτε χρώμα) με origin = (x, y), σε τοπικές μονάδες
// kind 'fill' = tatami (σειρές με κλίση ang, κλιμακωτές τρύπες βελόνας: μεγάλες επιφάνειες) · 'satin' = βελονιές κάθετα στη γραμμή (κύκλοι, γράμματα, λεπτά σχήματα)
// γυαλάδα ανά κατεύθυνση κλωστής · ανάγλυφο: σκιά κάτω από κάθε layer + σκούρες άκρες · (w, h) = πλαίσιο σε τοπικές μονάδες
// o.sp = πάχος κλωστής σε px οθόνης (3) · η υφή βγαίνει στην ανάλυση της οθόνης (getTransform) · o.key → cache (ίδιο κέντημα σε πολλά frames)
function stitched(ctx, x, y, w, h, layers, o = {}) {
  const m = ctx.getTransform(), k = Math.hypot(m.a, m.b), sp = o.sp || 3;
  const key = o.key && `${o.key}|${w}|${h}|${k.toFixed(3)}|${sp}`;
  let tex = key && STITCH.get(key);
  if (!tex) { tex = stitchTex(w, h, k, layers, sp, o); if (key) STITCH.set(key, tex); }
  ctx.drawImage(tex, x - tex.width / 2 / k, y - tex.height / 2 / k, tex.width / k, tex.height / k);
}
function boxBlur(a, W, H, r) { // 2 περάσματα box (≈ τρίγωνο) · in place
  const tmp = new Float32Array(a.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let j = 0; j < H; j++) { let s = 0; const o = j * W; for (let i = -r; i <= r; i++) s += a[o + clamp(i, 0, W - 1)];
      for (let i = 0; i < W; i++) { tmp[o + i] = s / (2 * r + 1); s += a[o + Math.min(W - 1, i + r + 1)] - a[o + Math.max(0, i - r)]; } }
    for (let i = 0; i < W; i++) { let s = 0; for (let j = -r; j <= r; j++) s += tmp[clamp(j, 0, H - 1) * W + i];
      for (let j = 0; j < H; j++) { a[j * W + i] = s / (2 * r + 1); s += tmp[Math.min(H - 1, j + r + 1) * W + i] - tmp[Math.max(0, j - r) * W + i]; } }
  }
  return a;
}
function stitchTex(w, h, k, layers, sp, o) {
  const pad = Math.ceil(4 * sp + 4), TW = Math.ceil(w * k) + 2 * pad, TH = Math.ceil(h * k) + 2 * pad, N = TW * TH;
  const out = L.createCanvas(TW, TH), oc = out.getContext('2d'), LA = -2.3, LX = 0.6, LY = 0.8;   // φως από πάνω-αριστερά
  const r = L.rng(o.seed || 4300);
  layers.forEach((ly, li) => {
    const mc = L.createCanvas(TW, TH), mx = mc.getContext('2d');
    mx.translate(TW / 2, TH / 2); mx.scale(k, k); ly.draw(mx);
    const md = mx.getImageData(0, 0, TW, TH).data, A = new Float32Array(N);
    for (let i = 0; i < N; i++) A[i] = md[i * 4 + 3] / 255;
    // απόσταση από την άκρη (chamfer, μέσα στη μάσκα)
    const D = new Float32Array(N); for (let i = 0; i < N; i++) D[i] = A[i] > 0.5 ? 1e6 : 0;
    for (let j = 1; j < TH - 1; j++) for (let i = 1; i < TW - 1; i++) { const q = j * TW + i; if (D[q]) D[q] = Math.min(D[q], D[q - 1] + 1, D[q - TW] + 1, D[q - TW - 1] + 1.41, D[q - TW + 1] + 1.41); }
    for (let j = TH - 2; j > 0; j--) for (let i = TW - 2; i > 0; i--) { const q = j * TW + i; if (D[q]) D[q] = Math.min(D[q], D[q + 1] + 1, D[q + TW] + 1, D[q + TW + 1] + 1.41, D[q + TW - 1] + 1.41); }
    // κλίση της μάσκας (άκρες) + κατεύθυνση βελονιάς: fill = σταθερή ang · satin = κάθετα στη γραμμή (structure tensor)
    const As = boxBlur(A.slice(), TW, TH, 1), GX = new Float32Array(N), GY = new Float32Array(N);
    for (let j = 1; j < TH - 1; j++) for (let i = 1; i < TW - 1; i++) { const q = j * TW + i; GX[q] = (As[q + 1] - As[q - 1]) / 2; GY[q] = (As[q + TW] - As[q - TW]) / 2; }
    const ang = ly.ang ?? 0.7, CO = new Float32Array(N), SI = new Float32Array(N);
    if (ly.kind === 'satin') {
      const rho = Math.max(2, Math.round(ly.rho ?? 2 * sp)), XX = new Float32Array(N), XY = new Float32Array(N), YY = new Float32Array(N);
      for (let q = 0; q < N; q++) { XX[q] = GX[q] * GX[q]; XY[q] = GX[q] * GY[q]; YY[q] = GY[q] * GY[q]; }
      boxBlur(XX, TW, TH, rho); boxBlur(XY, TW, TH, rho); boxBlur(YY, TW, TH, rho);
      let mx2 = 0; for (let q = 0; q < N; q++) mx2 = Math.max(mx2, Math.hypot(XX[q] - YY[q], 2 * XY[q]));
      const eps = mx2 * 0.04, c2 = Math.cos(2 * ang) * eps, s2 = Math.sin(2 * ang) * eps;
      for (let q = 0; q < N; q++) { const th = 0.5 * Math.atan2(2 * XY[q] + s2, XX[q] - YY[q] + c2); CO[q] = Math.cos(th); SI[q] = Math.sin(th); }
    } else { CO.fill(Math.cos(ang)); SI.fill(Math.sin(ang)); }
    // σχέδιο κλωστής t (1 = κορυφή κλωστής, 0 = αυλάκι)
    const T = new Float32Array(N);
    if (ly.kind === 'satin') {   // LIC: θόρυβος σε κελιά sp, θολωμένος κατά μήκος της βελονιάς → ίνες από άκρη σε άκρη
      const GW = Math.ceil(TW / sp) + 2, GH = Math.ceil(TH / sp) + 2, G = new Float32Array(GW * GH); for (let i = 0; i < G.length; i++) G[i] = r();
      const nz = (px, py) => { const gx = px / sp, gy = py / sp, i0 = Math.floor(gx), j0 = Math.floor(gy), fx = gx - i0, fy = gy - j0, a = j0 * GW + i0;
        return (G[a] * (1 - fx) + G[a + 1] * fx) * (1 - fy) + (G[a + GW] * (1 - fx) + G[a + GW + 1] * fx) * fy; };
      const Lh = Math.round(ly.len ?? 5 * sp);
      let S1 = 0, S2 = 0, n = 0;
      for (let j = 0; j < TH; j++) for (let i = 0; i < TW; i++) {
        const q = j * TW + i; if (A[q] < 0.02) continue;
        let sum = nz(i, j), cnt = 1;
        for (const dir of [1, -1]) {
          let px = i, py = j, vx = dir * CO[q], vy = dir * SI[q];
          for (let s = 0; s < Lh; s++) {
            px += vx; py += vy; const qi = Math.round(px), qj = Math.round(py);
            if (qi < 0 || qj < 0 || qi >= TW || qj >= TH) break; const p = qj * TW + qi; if (A[p] < 0.5) break;
            let nx = CO[p], ny = SI[p]; if (nx * vx + ny * vy < 0) { nx = -nx; ny = -ny; } vx = nx; vy = ny;
            sum += nz(px, py); cnt++;
          }
        }
        T[q] = sum / cnt; if (A[q] > 0.5) { S1 += T[q]; S2 += T[q] * T[q]; n++; }
      }
      const mean = S1 / (n || 1), sd = Math.sqrt(Math.max(1e-6, S2 / (n || 1) - mean * mean));
      for (let q = 0; q < N; q++) T[q] = clamp(0.5 + (T[q] - mean) / (2.4 * sd));
    } else {                     // tatami: παράλληλες σειρές, τρύπες βελόνας κλιμακωτά (τούβλο)
      const ca = Math.cos(ang), sa = Math.sin(ang), Ls = sp * 9, RB = new Map(), rowB = row => RB.get(row) ?? (RB.set(row, r()), RB.get(row));
      for (let j = 0; j < TH; j++) for (let i = 0; i < TW; i++) {
        const q = j * TW + i; if (A[q] < 0.02) continue;
        const rr = (-i * sa + j * ca) / sp, row = Math.floor(rr), fr = rr - row, aa = (i * ca + j * sa) / Ls + ((row * 0.382) % 1);
        let v = Math.pow(Math.sin(Math.PI * fr), 0.6) * (0.9 + 0.2 * rowB(row)); if (aa - Math.floor(aa) < 0.06) v *= 0.72;
        T[q] = clamp(v * (0.9 + 0.2 * r()));
      }
    }
    // χρώμα: αυλάκια σκούρα · γυαλάδα ανά κατεύθυνση στις κορυφές · άκρες: σκούρες (η κλωστή «βουτάει» στο ύφασμα), φωτεινές όσες κοιτάνε το φως
    const [cr, cg, cb] = L.hexRGB(ly.col), im = mx.createImageData(TW, TH), d = im.data, bev = 1.4 * sp;
    for (let q = 0; q < N; q++) {
      if (A[q] < 0.01) continue;
      const t = T[q], th = Math.atan2(SI[q], CO[q]), sh = 0.5 - 0.5 * Math.cos(2 * (th - LA));
      const e = Math.min(1, D[q] / bev), gl = Math.hypot(GX[q], GY[q]) || 1, face = (GX[q] * LX + GY[q] * LY) / gl * (1 - e);
      let f = (0.5 + 0.5 * t) * (0.62 + 0.38 * Math.sqrt(e)), hi = (0.05 + 0.5 * sh) * t * t + Math.max(0, face) * 0.3;
      f *= 1 - Math.max(0, -face) * 0.25;
      d[q * 4] = cr * f + (255 - cr * f) * hi; d[q * 4 + 1] = cg * f + (255 - cg * f) * hi; d[q * 4 + 2] = cb * f + (255 - cb * f) * hi; d[q * 4 + 3] = A[q] * 255;
    }
    mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, TW, TH); mx.putImageData(im, 0, 0);
    oc.save(); oc.shadowColor = `rgba(3,8,26,${li ? 0.4 : 0.5})`; oc.shadowBlur = 1.6 * sp; oc.shadowOffsetX = 0.5 * sp; oc.shadowOffsetY = 0.9 * sp;
    oc.drawImage(mc, 0, 0); oc.restore();
  });
  return out;
}

module.exports = { CAP, cap, embroidery, stitched };
