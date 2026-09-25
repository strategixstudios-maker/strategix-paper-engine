// props/studio.js — ο πραγματικός χώρος της Strategix (σκηνικά για σκετσάκια): υποδοχή · επόμενα: laser, Roland SP-300V…
// Σκηνικό = δωμάτιο → o.behind(ctx) (ηθοποιοί πίσω από τον πάγκο) → μπροστινά (πάγκος, φυτό) → o.front(ctx). Όλα σε συντεταγμένες σκηνικού, κάτω από την κάμερα o.cam.
// Demo: node props/studio.js sheet | preview 0.5 2 | lint → studio_*.png στη ρίζα (εκτός git)
const L = require('../lib.js');
const { C, W, H, cut, rectPts, rrPts, circlePts, starPts, txt, clamp } = L;
const { BRAND } = require('./core.js');
const { clock } = require('./objects.js');

const K = { // χρώματα χώρου: λευκή αρχιτεκτονική, λεβάντα ταβάνι, περιβάνκλ τοίχοι, γκρι-μπλε πάτωμα
  white: '#F5F3EE', whiteS: '#E8E5DC', shade: '#DADEEC', ceil: '#C9D0EB', ceilS: '#BDC5E3', wallL: '#D9E0F6', wallLS: '#CCD5F1', wallB: '#D1D9F3', wallBS: '#C5CEEE',
  wallR: '#C1CAEA', wallRS: '#B6C0E5', floor: '#6D7290', floorS: '#63688A', leaf: '#5F8F6C', leafD: '#46735A', pot: '#4A4F60', steel: '#C7CDD8', steelD: '#9AA3B3', glass: '#B9C9EF',
};
const E = { amp: 2, step: 34, edgeW: 6 }; // αρχιτεκτονική: ήπιο σκίσιμο

// ---------- κοινά ----------
// κάμερα σκηνικού: το σημείο (x, y) του σκηνικού στο κέντρο της οθόνης, zoom z ≥ 1 (clamp ώστε το σκηνικό να γεμίζει πάντα την οθόνη) · camAt(ctx, ...[x, y, z])
function camAt(ctx, x = W / 2, y = H / 2, z = 1) {
  z = Math.max(1, z); x = clamp(x, W / 2 / z, W - W / 2 / z); y = clamp(y, H / 2 / z, H - H / 2 / z);
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-x, -y);
}
// προοπτική 2 σημείων φυγής (οι κάθετες μένουν κάθετες): κόσμος σε cm, u → αριστερό σημείο φυγής, v → δεξί, y = ύψος από το πάτωμα
// eye = [r, d, h]: η αρχή (u = v = 0) είναι r cm δεξιά και d cm μπροστά από την κάμερα, κάμερα σε ύψος h · P(u, v, y) → [x, y, k = px/cm]
function persp(f, hy, [r, d, h], beta, x0 = W / 2) {
  const sb = Math.sin(beta), cb = Math.cos(beta);
  return (u, v, y = 0) => { const k = f / (d + u * cb + v * sb); return [x0 + (r - u * sb + v * cb) * k, hy + (h - y) * k, k]; };
}
const face = (P, pts) => pts.map(p => P(...p).slice(0, 2));
// πολυγραμμή → λωρίδα πάχους w (μοχλοί, λαβές, μπάρες) για cut()
function strip(pts, w) {
  const L0 = [], R0 = [], h = w / 2;
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    L0.push([p[0] - dy / l * h, p[1] + dx / l * h]); R0.push([p[0] + dy / l * h, p[1] - dx / l * h]); });
  return [...L0, ...R0.reverse()];
}
// όρθιο μικρό αντικείμενο πάνω σε επιφάνεια: origin = σημείο βάσης, 1 μονάδα = 1 cm (cut με edge/shadow σε cm)
function upright(ctx, P, u, v, y, fn) { const [x, yy, k] = P(u, v, y); ctx.save(); ctx.translate(x, yy); ctx.scale(k, k); fn(); ctx.restore(); }
const SMALL = { amp: 0.25, step: 5, edgeW: 1.1, sx: 0.8, sy: 1.1 };
// κείμενο πάνω σε κάθετη έδρα v = v0 (βινύλιο), γράμμα-γράμμα με την τοπική προοπτική · (u, y) = αρχή baseline της 1ης γραμμής, fs / lh σε cm
function faceText(ctx, P, lines, u, v, y, fs, lh, col) {
  ctx.save(); ctx.fillStyle = col; ctx.font = `${fs * 10}px Brand`; ctx.textBaseline = 'alphabetic';
  lines.forEach((s, li) => {
    let a = 0; const yy = y - li * lh;
    for (const ch of s) {
      const uu = u - a, [x0, y0] = P(uu, v, yy), [x1, y1] = P(uu - 1, v, yy), [x2, y2] = P(uu, v, yy - 1);
      ctx.save(); ctx.transform((x1 - x0) / 10, (y1 - y0) / 10, (x2 - x0) / 10, (y2 - y0) / 10, x0, y0); ctx.fillText(ch, 0, 0); ctx.restore();
      a += ctx.measureText(ch).width / 10;
    }
  });
  ctx.restore();
}
// λάμπα φθορισμού (λευκή ράβδος + λάμψη) από (x0,y0) σε (x1,y1), πάχος t
function tube(ctx, [x0, y0], [x1, y1], t, seed) {
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = t * 3.2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * t / 2, ny = Math.cos(a) * t / 2;
  cut(ctx, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], '#FFFFFF', { seed, amp: 1, step: 40, edgeW: 4, sx: 3, sy: 5 });
}
// φοίνικας σε γλάστρα (paper cut-out) · (x, y) = βάση γλάστρας, s = κλίμακα (1 ≈ γλάστρα 92px, φύλλα ~210px), lt → ελαφρύ λίκνισμα
function palm(ctx, x, y, s = 1, lt = 0, seed = 8600) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const FR = [[-2.85, 190, 1], [-0.3, 185, 1], [-2.45, 240, 0], [-0.7, 235, 0], [-2.1, 250, 1], [-1.05, 250, 1], [-1.75, 245, 0], [-1.4, 240, 0], [-2.65, 215, 0], [-0.5, 210, 0]]; // [γωνία, μήκος, σκούρο]
  FR.forEach(([a0, len, dk], i) => {
    const a = a0 + Math.sin(lt * 1.7 + i * 1.3) * 0.03, dx = Math.cos(a), dy = Math.sin(a), n = 14, sp = [];
    for (let j = 0; j <= n; j++) { const t = j / n; sp.push([dx * len * t, -92 + dy * len * t + 0.5 * len * t * t]); }
    const side = sg => { const out = []; for (let j = 1; j <= n; j++) { // φυλλαράκια: στενά, προς τα εμπρός και κάτω (βαρύτητα)
      const [px, py] = sp[j], [qx, qy] = sp[j - 1], tl = Math.hypot(px - qx, py - qy), tx = (px - qx) / tl, ty = (py - qy) / tl, w = 30 * Math.sin(Math.PI * Math.pow(j / n, 0.7)) + 5;
      out.push([qx + (px - qx) * 0.6 + (-ty * sg) * 3, qy + (py - qy) * 0.6 + (tx * sg) * 3], [px + (-ty * sg) * w * 0.75 + tx * w * 0.8, py + (tx * sg) * w * 0.75 + ty * w * 0.8 + w * 0.45]); } return out; };
    const pts = [sp[0], ...side(1), sp[n], ...side(-1).reverse()];
    cut(ctx, pts, dk ? K.leafD : K.leaf, { seed: seed + i, amp: 1, step: 14, edgeW: 3, sx: 4, sy: 6 });
    ctx.save(); ctx.strokeStyle = 'rgba(30,60,40,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); sp.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); ctx.restore();
  });
  cut(ctx, circlePts(0, 2, 50, 9, 20), '#3B4050', { seed: seed + 20, amp: 1, edgeW: 4 });
  cut(ctx, [[-46, -92], [46, -92], [36, 0], [-36, 0]], K.pot, { seed: seed + 21, amp: 1.5, edgeW: 5, scribble: '#555B6D' });
  cut(ctx, rrPts(-51, -104, 102, 18, 7), '#5A6073', { seed: seed + 22, amp: 1, edgeW: 4 });
  ctx.restore();
}
function sprout(ctx, x, y, seed) { // μικρό φυτό σε navy γλαστράκι (ράφι)
  for (const [a, l] of [[-2.5, 44], [-2.0, 52], [-1.55, 56], [-1.1, 50], [-0.65, 42]]) {
    const dx = Math.cos(a), dy = Math.sin(a), nx = -dy * 7, ny = dx * 7, bx = x, by = y - 38;
    cut(ctx, [[bx, by], [bx + dx * l * 0.5 + nx, by + dy * l * 0.5 + ny], [bx + dx * l, by + dy * l], [bx + dx * l * 0.5 - nx, by + dy * l * 0.5 - ny]], a < -1.6 ? K.leafD : K.leaf, { seed: seed++, amp: 0.8, step: 10, edgeW: 3, sx: 3, sy: 4 });
  }
  cut(ctx, [[x - 22, y - 40], [x + 22, y - 40], [x + 18, y], [x - 18, y]], C.navy, { seed, amp: 1, edgeW: 4, sx: 4, sy: 5 });
}

// ---------- υποδοχή ----------
const RP = persp(1512, 700, [45, 349, 207], Math.asin(0.652));
const STRATOS_CM = 190 / 1238; // stratos(): κορυφή σκούφου −370 → σόλα +868 μονάδες ≈ 190 cm
// υποδοχή σε cm: P(u, v, y) → [x, y, k] (u = κατά μήκος του πάγκου προς τα αριστερά από τη μπροστινή γωνία, v = προς τα πίσω, y = ύψος)
// spot(u, v) → [x, shoulderY, s] για stratos() όρθιο στο πάτωμα · desk = Στράτος πίσω από τον πάγκο (legs:false)
// cams: wide (όλο) · desk (medium: Στράτος + λογότυπο) · close (Στράτος από το στήθος, για VO) — κίνηση κάμερας = lerp ανάμεσα σε δύο cams
const RECEPTION = {
  P: RP,
  spot: (u, v) => { const [x, y, k] = RP(u, v, 0), s = k * STRATOS_CM; return [x, y - 868 * s, s]; },
  counter: { u: 290, v: 68, h: 103, top: 112 },
  cams: { wide: [540, 960, 1], desk: [560, 960, 1.7], close: [534, 880, 2.4] },
};
RECEPTION.desk = RECEPTION.spot(200, 110);

function donePoster(ctx, x, y, lt) { // αφίσα «GET IT DONE» στον τοίχο · 170×282, (x, y) = πάνω-αριστερά
  ctx.save(); ctx.translate(x, y);
  cut(ctx, rectPts(0, 0, 170, 282), C.navy, { seed: 8101, amp: 1.5, step: 30, edgeW: 6 });
  cut(ctx, rectPts(9, 9, 152, 264), '#3A60D4', { seed: 8102, amp: 1, edge: false, shadow: false, scribble: '#4A6FDC' });
  ctx.save(); ctx.beginPath(); ctx.rect(9, 9, 152, 264); ctx.clip();
  txt(ctx, 'GET IT', 85, 50, { font: '40px Brand', color: C.paper });
  for (const [sx, sy, r, k] of [[34, 104, 7, 0], [140, 128, 6, 1], [52, 140, 5, 2], [126, 160, 5, 3], [40, 176, 4, 4]]) cut(ctx, starPts(sx, sy, r * (0.8 + 0.25 * Math.sin(lt * 4 + k * 1.7))), C.paper, { seed: 8110 + k, amp: 0.4, edge: false, shadow: false });
  cut(ctx, [[166, 70], [166, 94], [124, 110], [116, 92]], C.paper, { seed: 8103, amp: 0.8, edgeW: 3, sx: 2, sy: 3 });           // μανίκι / χέρι
  cut(ctx, circlePts(118, 104, 13, 11, 14), '#F2C29C', { seed: 8104, amp: 0.6, edgeW: 3, sx: 2, sy: 3 });
  ctx.save(); ctx.translate(86, 128); ctx.rotate(-0.22);
  cut(ctx, circlePts(0, 0, 44, 14, 24), C.paper, { seed: 8105, amp: 0.8, edgeW: 3, sx: 2, sy: 3 });
  cut(ctx, rrPts(-7, -20, 14, 10, 4), C.paper, { seed: 8106, amp: 0.5, edgeW: 2, shadow: false });
  txt(ctx, 'DONE', 0, 2, { font: '19px Brand', color: C.navy }); ctx.restore();
  cut(ctx, circlePts(86, 212, 50, 7, 20), 'rgba(11,27,63,0.35)', { seed: 8107, amp: 0.5, edge: false, shadow: false });
  cut(ctx, [[42, 164], [130, 164], [122, 210], [50, 210]], C.paper, { seed: 8108, amp: 0.8, edgeW: 3, sx: 2, sy: 3 });  // κατσαρόλα
  cut(ctx, circlePts(86, 164, 44, 7, 20), C.navy, { seed: 8109, amp: 0.5, edge: false, shadow: false });
  for (const sg of [-1, 1]) cut(ctx, rrPts(86 + sg * 48 - 7, 170, 14, 8, 4), C.paper, { seed: 8115 + sg, amp: 0.4, edgeW: 2, shadow: false });
  txt(ctx, 'IDEAS TASTE BETTER', 85, 238, { font: '13px Brand', color: C.paper });
  txt(ctx, 'WHEN FINISHED.', 85, 256, { font: '13px Brand', color: C.paper });
  ctx.restore(); ctx.restore();
}
function recPresses(ctx) { // εργαστήριο (από τη φωτογραφία): πινακίδα εργαλείων · θερμοπρέσα clamshell ανοιχτή · καπελιέρα
  const MS = { amp: 0.5, step: 16, edgeW: 2.5, sx: 3, sy: 4 }, STL = '#C9CDD6', STD = '#A4ABBA', BAR = '#B7BDC8';
  cut(ctx, rrPts(783, 732, 100, 95, 3), '#1C2E66', { seed: 8082, amp: 1, edgeW: 4 });                                  // πινακίδα εργαλείων
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 2.5; ctx.strokeStyle = '#D5DAE4';
  for (let i = 0; i < 4; i++) { const x = 828 + i * 7; ctx.beginPath(); ctx.arc(x, 744, 2.2, 0, 7); ctx.moveTo(x, 746); ctx.lineTo(x, 766 - (i % 2) * 4); ctx.stroke(); }
  ctx.fillStyle = '#D5DAE4'; ctx.fillRect(790, 758, 20, 4); ctx.fillRect(798, 758, 4, 12); ctx.beginPath(); ctx.ellipse(863, 757, 5, 10, 0, 0, 7); ctx.fill(); ctx.fillRect(836, 782, 18, 8);
  ctx.strokeStyle = '#C9A274'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(816, 741); ctx.lineTo(816, 770); ctx.moveTo(878, 752); ctx.lineTo(878, 770); ctx.moveTo(822, 792); ctx.lineTo(815, 812); ctx.stroke();
  ctx.fillStyle = '#C9A274'; ctx.beginPath(); ctx.ellipse(878, 746, 3.5, 6, 0, 0, 7); ctx.fill(); ctx.restore();
  // θερμοπρέσα: σώμα-κολόνα, βάση, κάτω πλατό (μπλε), πάνω πλατό ανοιχτό (navy με ανοιχτό περίγραμμα), μοχλός με navy λαβή
  cut(ctx, [[668, 906], [668, 832], [673, 821], [683, 815], [699, 815], [709, 822], [713, 848], [724, 858], [724, 906]], STL, { seed: 8090, ...MS, edgeW: 3 });
  cut(ctx, [[668, 832], [673, 821], [679, 818], [679, 906], [668, 906]], STD, { seed: 8091, amp: 0.4, edge: false, shadow: false });
  cut(ctx, rrPts(719, 846, 10, 17, 2), C.navy, { seed: 8092, amp: 0.3, edgeW: 2, shadow: false });
  cut(ctx, [[668, 897], [812, 894], [814, 914], [670, 918]], STL, { seed: 8093, ...MS });
  cut(ctx, [[742, 906], [812, 904], [812, 922], [742, 924]], STD, { seed: 8094, ...MS });
  for (const [fx, fy] of [[676, 916], [764, 922], [800, 921]]) cut(ctx, rectPts(fx, fy, 10, 5), '#2A3558', { seed: 8095 + fx, amp: 0.3, edge: false, shadow: false });
  cut(ctx, rectPts(720, 886, 80, 10), '#6F7A8E', { seed: 8096, amp: 0.4, edge: false, shadow: false });
  cut(ctx, [[690, 882], [862, 880], [862, 891], [694, 893]], '#E4E7EE', { seed: 8097, ...MS });
  cut(ctx, [[690, 882], [710, 868], [864, 866], [862, 880]], BRAND, { seed: 8098, ...MS, shadow: false });
  cut(ctx, [[684, 846], [747, 764], [850, 771], [787, 846]], '#DDE1E8', { seed: 8100, ...MS, edgeW: 3 });
  cut(ctx, [[692, 845], [754, 773], [843, 778], [786, 845]], C.navy, { seed: 8101, amp: 0.5, step: 16, edge: false, shadow: false, scribble: '#1B2D62' });
  cut(ctx, strip([[700, 821], [733, 786], [744, 742], [756, 694]], 6), BAR, { seed: 8102, ...MS });
  cut(ctx, strip([[748, 780], [789, 698]], 6), BAR, { seed: 8103, ...MS });
  cut(ctx, strip([[755, 692], [790, 697]], 11), C.navy, { seed: 8104, ...MS });
  cut(ctx, circlePts(741, 782, 3.5, 3.5, 10), '#2A3558', { seed: 8105, amp: 0.2, edge: false, shadow: false });
  // καπελιέρα: βάση, κορμός, U-λαβή, καμπύλη κεφαλή με χερούλι, κάτω καλούπι καπέλου σε βάση
  cut(ctx, [[855, 886], [944, 884], [946, 898], [855, 900]], '#1C2E66', { seed: 8110, ...MS });
  cut(ctx, strip([[893, 806], [896, 758], [910, 758], [905, 806]], 5), C.navy, { seed: 8111, ...MS });
  cut(ctx, [[856, 800], [887, 800], [896, 810], [896, 838], [891, 842], [891, 888], [856, 888]], C.navy, { seed: 8112, ...MS, scribble: '#1B2D62' });
  cut(ctx, strip([[926, 824], [951, 827]], 4), C.navy, { seed: 8113, ...MS });
  cut(ctx, circlePts(954, 827, 4.5, 4.5, 10), C.navy, { seed: 8114, amp: 0.3, edgeW: 2, shadow: false });
  cut(ctx, rrPts(889, 810, 42, 23, 10), C.navy, { seed: 8115, ...MS });
  cut(ctx, [[897, 831], [925, 831], [922, 836], [899, 836]], '#8E97A6', { seed: 8116, amp: 0.3, edge: false, shadow: false });
  cut(ctx, rrPts(916, 864, 24, 24, 8), C.navy, { seed: 8117, ...MS });
  cut(ctx, [[906, 858], [940, 857], [937, 864], [909, 865]], '#8E97A6', { seed: 8118, ...MS });
  cut(ctx, strip([[914, 852], [914, 860]], 4), C.navy, { seed: 8119, amp: 0.3, edge: false, shadow: false });
  cut(ctx, [[900, 846], [912, 842], [926, 845], [929, 852], [904, 855]], C.navy, { seed: 8129, ...MS });
}
function recRoom(ctx, lt) { // πίσω πλάνο: ταβάνι, τοίχοι, κολόνα, δοκάρι, φωτιστικά, αφίσες, ράφι, εργαστήριο με πρέσα, τραπέζι δεξιά
  cut(ctx, rectPts(-40, -80, W + 80, 720), K.ceil, { seed: 8001, edge: false, shadow: false, scribble: K.ceilS });
  cut(ctx, rectPts(-40, 985, W + 80, 1000), K.floor, { seed: 8002, ...E, shadow: false, scribble: K.floorS });
  // εργαστήριο δεξιά: τοίχος, παράθυρο με ρολόι, φωτιστικό
  cut(ctx, rectPts(935, 430, 200, 590), K.wallR, { seed: 8003, ...E, scribble: K.wallRS });
  cut(ctx, rectPts(958, 650, 170, 226), C.navy, { seed: 8004, ...E });
  cut(ctx, rectPts(970, 662, 160, 202), K.glass, { seed: 8005, amp: 1, edge: false, shadow: false });
  clock(ctx, 1030, 722, 25, lt, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(970, 662, 160, 202); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.32)';
  for (const [a, w] of [[1040, 34], [1092, 16]]) { ctx.beginPath(); ctx.moveTo(a, 662); ctx.lineTo(a + w, 662); ctx.lineTo(a + w - 150, 864); ctx.lineTo(a - 150, 864); ctx.fill(); }
  ctx.restore();
  cut(ctx, rectPts(952, 870, 180, 12), K.white, { seed: 8006, amp: 1, edgeW: 4 });
  ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(968, 430); ctx.lineTo(968, 486); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 30; i++) { const t = i / 30; ctx.lineTo(990 + t * 110 + Math.sin(t * 40) * 5, 522 + t * 52 + Math.cos(t * 40) * 5); } ctx.stroke(); ctx.restore();
  cut(ctx, [[935, 482], [1120, 500], [1120, 530], [935, 508]], C.navy, { seed: 8007, ...E });
  tube(ctx, [978, 522], [1120, 536], 11, 8008);
  // τοίχος πίσω από τον πάγκο (χώρισμα: δεξιά κατεβαίνει, από πάνω φαίνεται το ταβάνι) · αριστερός τοίχος · κολόνα · δοκάρι
  cut(ctx, [[690, 492], [952, 424], [952, 566]], '#B3BCDD', { seed: 8009, amp: 1, edge: false, shadow: false, scribble: '#A9B3D7' });
  cut(ctx, [[296, 378], [700, 378], [700, 488], [945, 560], [945, 1010], [296, 1010]], K.wallB, { seed: 8010, ...E, scribble: K.wallBS });
  cut(ctx, [[939, 558], [951, 556], [951, 1010], [939, 1010]], K.white, { seed: 8011, amp: 1, edgeW: 4 });
  cut(ctx, [[-40, 314], [300, 380], [300, 1312], [-40, 1354]], K.wallL, { seed: 8012, ...E, scribble: K.wallLS });
  cut(ctx, [[254, 378], [272, 372], [272, 1000], [256, 1000]], K.shade, { seed: 8013, ...E, edgeW: 4 });
  cut(ctx, [[272, 372], [334, 378], [334, 1000], [272, 1000]], K.white, { seed: 8014, ...E, scribble: K.whiteS });
  // δοκάρι: η πλευρά του έρχεται προς την κάμερα (φυγή αριστερά) → φαρδαίνει προς τα δεξιά, λωρίδα ταβανιού ως τη λάμπα · + λεπτή κάτω όψη
  cut(ctx, [[380, 566], [1120, 382], [1120, 396], [384, 579]], '#B9C2E2', { seed: 8015, amp: 1, step: 34, edgeW: 4 });
  cut(ctx, [[376, 415], [1120, 105], [1120, 384], [380, 568]], K.white, { seed: 8016, ...E, scribble: K.whiteS });
  // navy κανάλι στο ταβάνι + λάμπες + ντίζες
  ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; for (const [x, y0, y1] of [[325, 188, 282], [438, 176, 280]]) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); } ctx.restore();
  cut(ctx, [[-40, 176], [394, 300], [394, 352], [-40, 222]], C.navy, { seed: 8020, ...E, scribble: '#1B2D62' });
  cut(ctx, [[380, 306], [1120, -74], [1120, 24], [394, 356]], C.navy, { seed: 8021, ...E, scribble: '#1B2D62' });
  tube(ctx, [-40, 238], [284, 334], 14, 8022);
  tube(ctx, [486, 330], [950, 118], 16, 8023);
  tube(ctx, [976, 106], [1120, 40], 18, 8024);
  // αφίσες
  cut(ctx, rectPts(-40, 524, 48, 284), C.navy, { seed: 8030, amp: 1.5, step: 30, edgeW: 6 });
  donePoster(ctx, 30, 526, lt);
  // χαμηλό ράφι αριστερά: φυτό, βιβλία
  cut(ctx, [[-40, 1178], [236, 1124], [236, 1296], [-40, 1352]], '#DADFF0', { seed: 8040, ...E, scribble: '#CED4EB' });
  cut(ctx, [[-40, 1150], [196, 1106], [236, 1124], [-40, 1178]], '#EFF1F8', { seed: 8041, ...E });
  sprout(ctx, 52, 1146, 8042);
  [[C.navy, 112, -3], [C.paper, 104, 4], ['#F4D98A', 108, -1], [C.ink, 100, 3], [C.sky, 94, -4]].forEach(([c, w, dx], i) =>
    cut(ctx, rectPts(150 - w / 2 + dx, 1116 - i * 13, w, 13), c, { seed: 8050 + i, amp: 1, step: 20, edgeW: 3, sx: 3, sy: 4 }));
  // εργαστήριο: σακούλες, κούτα, τρίποδα, τραπέζι, θερμοπρέσα, πινακίδα εργαλείων, πρέσα κούπας
  for (const [bx, k] of [[972, 0], [1012, 1]]) { cut(ctx, rectPts(bx, 934, 36, 52), C.navy, { seed: 8060 + k, amp: 1, edgeW: 4 }); cut(ctx, rectPts(bx + 7, 946, 22, 14), C.paper, { seed: 8062 + k, amp: 0.6, edge: false, shadow: false }); }
  cut(ctx, [[785, 984], [900, 978], [906, 1050], [790, 1054]], '#AEB8D8', { seed: 8064, ...E, edgeW: 4 });
  cut(ctx, [[792, 960], [840, 954], [852, 984], [800, 988]], C.navy, { seed: 8065, amp: 1, edgeW: 3 });
  cut(ctx, circlePts(868, 972, 20), K.white, { seed: 8066, amp: 1, edgeW: 3 });
  for (const [ax, ay, l, r] of [[672, 926, 655, 705], [748, 924, 732, 770], [905, 918, 878, 944]]) for (const bx of [l, r]) {
    const by = ay + 120, nx = 5, ny = 0; cut(ctx, [[ax - nx, ay], [ax + nx, ay], [bx + nx, by], [bx - nx, by - ny]], C.navy, { seed: 8070 + bx, amp: 0.8, step: 30, edgeW: 3, sx: 4, sy: 5 });
  }
  cut(ctx, [[598, 910], [1120, 890], [1120, 904], [600, 926]], '#C4CAE0', { seed: 8080, amp: 1, step: 40, edgeW: 4 });
  cut(ctx, [[612, 894], [1120, 876], [1120, 890], [598, 910]], '#EDEFF6', { seed: 8081, amp: 1, step: 40, edgeW: 4 });
  recPresses(ctx);
  cut(ctx, rectPts(996, 858, 16, 24), C.navy, { seed: 8099, amp: 0.6, edgeW: 3 });
  cut(ctx, rrPts(1030, 862, 46, 20, 4), K.white, { seed: 8089, amp: 0.6, edgeW: 3 });
  // τραπέζι δεξιά (πιο κοντά): πόδια, κούτα, χαρτιά
  for (const [x, y0, y1] of [[935, 1060, 1302], [1046, 1070, 1345]]) cut(ctx, rectPts(x, y0, 21, y1 - y0), C.navy, { seed: 8100 + x, amp: 1, step: 40, edgeW: 4 });
  cut(ctx, [[962, 1176], [1120, 1154], [1120, 1330], [962, 1302]], '#2A4290', { seed: 8120, ...E, scribble: '#33509E' });  // κούτα
  cut(ctx, [[962, 1176], [1004, 1150], [1120, 1136], [1120, 1154]], '#4462B4', { seed: 8121, amp: 1, step: 30, edgeW: 4 });
  cut(ctx, [[984, 1206], [1030, 1200], [1030, 1234], [984, 1240]], C.paper, { seed: 8126, amp: 0.6, edgeW: 3, shadow: false });
  cut(ctx, [[902, 1062], [1120, 1004], [1120, 1020], [902, 1078]], '#C9CFE3', { seed: 8122, amp: 1, step: 40, edgeW: 4 });
  cut(ctx, [[880, 1048], [1120, 988], [1120, 1004], [902, 1062]], '#EEF0F7', { seed: 8123, amp: 1, step: 40, edgeW: 4 });
  cut(ctx, [[910, 1046], [1012, 1020], [1048, 1034], [946, 1062]], '#FFFFFF', { seed: 8124, amp: 0.8, edgeW: 3 });
  cut(ctx, [[978, 1034], [1048, 1016], [1080, 1028], [1010, 1046]], BRAND, { seed: 8125, amp: 0.8, edgeW: 3 });
  // σκιά του πάγκου στο πάτωμα
  ctx.save(); ctx.fillStyle = 'rgba(12,18,52,0.22)'; L.path(ctx, face(RP, [[0, 0, 0], [0, 68, 0], [-60, 150, 0], [-70, 20, 0]])); ctx.fill(); ctx.restore();
}
function recCounter(ctx, lt, o) { // πάγκος υποδοχής (προοπτική RP) + λογότυπο + αντικείμενα + φοίνικας
  const P = RP, { u: CU, v: CV, h: CH, top: CT } = RECEPTION.counter;
  cut(ctx, face(P, [[0, 0, 0], [0, CV, 0], [0, CV, CH], [0, 0, CH]]), '#E1E4EF', { seed: 8300, ...E, edgeW: 7, scribble: '#D5D9E8' });
  cut(ctx, face(P, [[0, 0, 0], [CU, 0, 0], [CU, 0, CH], [0, 0, CH]]), '#F7F5F0', { seed: 8301, ...E, edgeW: 7, scribble: '#ECE9E0' });
  faceText(ctx, P, ['Strategix', 'Studios'], 86, 0, 74, 15.5, 15, o.logoCol || BRAND);
  cut(ctx, face(P, [[-3, -4, CH], [-3, CV + 2, CH], [-3, CV + 2, CT], [-3, -4, CT]]), '#DADEEB', { seed: 8302, amp: 1, step: 30, edgeW: 5 });
  cut(ctx, face(P, [[-3, -4, CH], [CU + 3, -4, CH], [CU + 3, -4, CT], [-3, -4, CT]]), '#FFFFFF', { seed: 8303, amp: 1, step: 30, edgeW: 5 });
  cut(ctx, face(P, [[-3, -4, CT], [CU + 3, -4, CT], [CU + 3, CV + 2, CT], [-3, CV + 2, CT]]), '#ECEEF5', { seed: 8304, amp: 1, step: 30, edgeW: 5, shadow: false });
  // πάνω στον πάγκο (πίσω → μπροστά): κάρτες, QR, μολυβοθήκη, μολύβια, στοίβα χαρτιά
  upright(ctx, P, 266, 24, CT, () => { cut(ctx, rrPts(-4, -11, 8, 11, 0.8), BRAND, { seed: 8310, ...SMALL }); cut(ctx, rectPts(-2.5, -8, 5, 0.7), C.paper, { seed: 8311, amp: 0.1, edge: false, shadow: false }); cut(ctx, circlePts(0, -4, 1.4), C.paper, { seed: 8312, amp: 0.1, edge: false, shadow: false }); });
  upright(ctx, P, 248, 28, CT, () => { cut(ctx, rectPts(-4.5, -12, 9, 12), '#F4F6FB', { seed: 8313, ...SMALL });
    ctx.fillStyle = C.navy; for (const [qx, qy] of [[-3, -10], [1, -10], [-3, -6]]) ctx.fillRect(qx, qy, 2, 2); for (let i = 0; i < 7; i++) ctx.fillRect(-0.5 + (i * 7 % 4) * 0.8, -7 + (i * 3 % 5) * 0.7, 0.6, 0.6); });
  upright(ctx, P, 222, 30, CT, () => {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 0.9; for (const [dx, c] of [[-1.5, '#F6D25A'], [0.5, C.navy], [2, BRAND]]) { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(dx * 0.6, -8); ctx.lineTo(dx, -17 + Math.abs(dx)); ctx.stroke(); } ctx.restore();
    cut(ctx, rrPts(-3.6, -10, 7.2, 10, 1), C.navy, { seed: 8314, ...SMALL }); });
  ctx.save(); ctx.lineCap = 'round';
  for (const [a, b, c, w] of [[[46, 36], [66, 31], C.navy, 1.2], [[50, 42], [71, 38], '#F6D25A', 1.2]]) { const [x0, y0, k] = P(a[0], a[1], CT + 0.6), [x1, y1] = P(b[0], b[1], CT + 0.6); ctx.strokeStyle = c; ctx.lineWidth = w * k; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  ctx.restore();
  const PS = [6, 22, CT, 30, 21, 8]; // στοίβα χαρτιά (u, v, y, du, dv, dy)
  cut(ctx, face(P, [[PS[0], PS[1], PS[2]], [PS[0], PS[1] + PS[4], PS[2]], [PS[0], PS[1] + PS[4], PS[2] + PS[5]], [PS[0], PS[1], PS[2] + PS[5]]]), '#E6E8F0', { seed: 8320, ...E, amp: 0.8, edgeW: 3 });
  cut(ctx, face(P, [[PS[0], PS[1], PS[2]], [PS[0] + PS[3], PS[1], PS[2]], [PS[0] + PS[3], PS[1], PS[2] + PS[5]], [PS[0], PS[1], PS[2] + PS[5]]]), '#F4F5F9', { seed: 8321, ...E, amp: 0.8, edgeW: 3 });
  ctx.save(); ctx.strokeStyle = '#C9CDD8'; ctx.lineWidth = 1.5; for (const yy of [2, 4, 6]) { const [x0, y0] = P(PS[0], PS[1], CT + yy), [x1, y1] = P(PS[0] + PS[3], PS[1], CT + yy), [x2, y2] = P(PS[0], PS[1] + PS[4], CT + yy); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x0, y0); ctx.lineTo(x2, y2); ctx.stroke(); } ctx.restore();
  cut(ctx, face(P, [[PS[0], PS[1], CT + 8], [PS[0] + PS[3], PS[1], CT + 8], [PS[0] + PS[3], PS[1] + PS[4], CT + 8], [PS[0], PS[1] + PS[4], CT + 8]]), '#FFFFFF', { seed: 8322, amp: 0.8, step: 30, edgeW: 3, shadow: false });
  palm(ctx, 196, 1342, 1, lt);
}
// υποδοχή Strategix Studios (από τη φωτογραφία του χώρου): πάγκος με λογότυπο, κολόνα, δοκάρι, αφίσα «GET IT DONE», φοίνικας, πίσω το εργαστήριο με τη θερμοπρέσα
// o.cam = [x, y, z] (camAt · RECEPTION.cams) · o.behind(ctx) = πίσω από τον πάγκο (Στράτος στο RECEPTION.desk, legs:false) · o.front(ctx) = μπροστά από όλα · o.logoCol
function reception(ctx, lt = 0, o = {}) {
  ctx.save(); if (o.cam) camAt(ctx, ...o.cam);
  recRoom(ctx, lt); if (o.behind) o.behind(ctx); recCounter(ctx, lt, o); if (o.front) o.front(ctx);
  ctx.restore();
}

module.exports = { camAt, palm, RECEPTION, reception };

if (require.main === module) { // demo: άδειο wide · Στράτος χαιρετάει · push-in στο desk
  const { stratos } = require('../stratos.js'), { lerp, prog, easeInOut, lipsync, blinkNow } = L, [dx, dy, ds] = RECEPTION.desk;
  const st = o => ctx => stratos(ctx, dx, dy, ds, { seed: 1000, legs: false, blink: blinkNow(), mouth: lipsync([[0.3, 1.2]], 'smile'), ...o });
  const { wide, desk } = RECEPTION.cams;
  require('../render.js')({ name: 'studio', LOOP: true, SCENES: [
    [(ctx, lt) => reception(ctx, lt), 1.5],
    [(ctx, lt) => reception(ctx, lt, { behind: st({ arms: [0.12, 2.2 + Math.sin(lt * 7) * 0.2], elbowR: -0.6, handR: 'wave', eyes: 'happy', brows: 0.6 }) }), 1.5],
    [(ctx, lt) => { const p = easeInOut(prog(lt, 0.1, 1.3)); reception(ctx, lt, { cam: wide.map((v, i) => lerp(v, desk[i], p)), behind: st({ arms: [0.12, 0.12], eyes: 'dot', brows: 0.3, look: -6 }) }); }, 2],
    [(ctx, lt) => reception(ctx, lt, { cam: RECEPTION.cams.close, behind: st({ arms: [0.5, 0.5], elbowL: -1.1, elbowR: -1.1, handL: 'open', handR: 'open', hintL: 'shrug', hintR: 'shrug', brows: 0.9 }) }), 1.5],
  ] });
}
