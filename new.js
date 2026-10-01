// new.js — σκελετός νέου επεισοδίου με ό,τι ισχύει σήμερα στο engine (φάση 2 του workflow, CLAUDE.md): δεν διαβάζεις παλιό επεισόδιο ως πρότυπο.
// CLI:  node new.js <ep>_<όνομα> [--look diorama|flat] [--tag 'Πώς φτιάχνεται;'] [--force]     π.χ. node new.js pf07_kouppes --tag 'Πώς φτιάχνεται;'
//       → <ep>_<όνομα>.js: VO (vo/<ep>_vo.mp3 + λέξεις) → CAPS = V.caps() · CUTS από τις προτάσεις του VO · TOTAL/LOOP_AT από το τέλος του VO
//         · seamless loop (LOOP: 'cut') · TAG στο hook + στο loop · μουσική αν υπάρχει · μακέτα (diorama, default) ή 2D (flat) με τον Στράτο που μιλάει
//       Σενάριο (φάση 1): scripts/<ep>.md (πίνακας Χρόνος | Εικόνα | VO | Κείμενο/SFX + αποφάσεις) → μπαίνει ως αναφορά στην κορυφή.
//       Μετά: συμπλήρωσε κάμερα/πλάνα/props ανά σκηνή → node <ep>.js check → preview → render (node next.js <ep> λέει πάντα το επόμενο βήμα).
const fs = require('fs'), path = require('path');
const [file, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
if (!file || !/^[a-z]+\d*_[\w]+$/.test(file.replace(/\.js$/, ''))) { console.log("usage: node new.js <ep>_<όνομα> [--look diorama|flat] [--tag 'Σειρά'] [--force]   π.χ. node new.js pf07_kouppes"); process.exit(1); }
const name = file.replace(/\.js$/, ''), ep = /^ad_/.test(name) ? name : name.split('_')[0], out = path.join(__dirname, name + '.js'), look = opt('look') || 'diorama';
if (fs.existsSync(out) && !rest.includes('--force')) { console.log(`new: υπάρχει ήδη το ${name}.js (--force για αντικατάσταση)`); process.exit(1); }
const SERIES = { pf: 'Πώς φτιάχνεται;', ms: 'Μάθε με τον Στράτο', pm: 'Πριν / Μετά', ep: 'Ο πελάτης είπε…', er: 'Το Εργαστήριο' }; // ad → χωρίς ετικέτα
const tag = opt('tag') ?? SERIES[ep.replace(/\d+$/, '')] ?? '';
const voFile = `vo/${ep}_vo.mp3`, hasVO = fs.existsSync(voFile), hasWords = fs.existsSync(`vo/${ep}_vo.words.json`), music = `music/${ep}.mp3`;
const L = require('./lib.js'), f2 = x => x.toFixed(2);
let VT = null; if (hasWords) VT = L.voText(voFile, 0.2);
// σκηνές: αρχή κάθε πρότασης του VO (τελεία/ερωτηματικό) → πρόταση για CUTS (wipe) · hook = ως τη 2η πρόταση
const sentences = []; if (VT) { let cur = []; for (const w of VT.words) { cur.push(w); if (/[.!?;…]["»]?$/.test(w[2])) { sentences.push(cur); cur = []; } } if (cur.length) sentences.push(cur); }
const END = VT ? VT.end : 20, LOOP_AT = +(END + 0.05).toFixed(2), TOTAL = +(END + 0.75).toFixed(2);
const cuts = [0, ...sentences.slice(1).map(s => +(s[0][0] - 0.12).toFixed(2)).filter((t, i, a) => t > 1.5 && (i === 0 || t - a[i - 1] > 1.5)), TOTAL];
const phrases = sentences.map(s => `// ${f2(s[0][0])}–${f2(s[s.length - 1][1])}  ${s.map(w => w[2]).join(' ')}`).join('\n');
const script = fs.existsSync(`scripts/${ep}.md`) ? `scripts/${ep}.md` : null;

const head = `// ${tag ? `«${tag}» — ` : ''}<τίτλος> · host: Στράτος · VO ElevenLabs «Stratos» + μουσική + SFX · seamless loop (LOOP: 'cut') · look: ${look === 'diorama' ? 'χάρτινη μακέτα (diorama.js, §1d)' : '2D paper cut-out'}
// Σενάριο: ${script || `scripts/${ep}.md (λείπει: ο πίνακας της φάσης 1 μπαίνει εκεί)`} · σκελετός: node new.js ${name} (${new Date().toISOString().slice(0, 10)})
// VO = ${voFile} @ 0,2s${hasVO ? '' : ' (ΔΕΝ υπάρχει ακόμα → φάση 1: node vo.js ' + ep + ')'} · χρόνοι λέξεων: VT.W('λέξη') (αρχή) / VT.E('λέξη') (τέλος), όχι πίνακας με το χέρι
${phrases || '// (χωρίς λέξεις VO: node render.js vo <take>.mp3 --gap 0.3 --out ' + voFile + ' --at 0.2 → .words.json)'}`;

const common = `const L = require('./lib.js');
const { C, W, H, ST, cut, rectPts, rrPts, circlePts, txt, clamp, lerp, prog, easeIn, easeOut, easeInOut, rng, mixHex, lipsync, blinkNow } = L;
const M = require('./motion.js');                     // springTo · springKeys · kf · rewindTau · shake · lag · particles … (node api.js motion)
const { stratos, poseSpring } = require('./stratos.js');
const P = require('./props.js');                      // node api.js → κατάλογος · node api.js <λέξη> → λεπτομέρειες
const { BRAND, stamp, stepChip, checkChip, ctaButton, reach } = P;

${hasWords ? `const VT = L.voText('${voFile}', 0.2);` : `const VT = { W: () => 0, E: () => 0, caps: () => [[-1, '<hook caption>']], end: ${END} };  // → L.voText('${voFile}', 0.2) μόλις υπάρχει το VO`}
const TAG = ${JSON.stringify(tag)}, TOTAL = ${TOTAL}, LOOP_AT = ${LOOP_AT};      // LOOP_AT: από εδώ η εικόνα γυρίζει στο frame 0 (caption + ετικέτα του hook μπαίνουν αυτόματα)
const CUTS = ${JSON.stringify(cuts)};   // αλλαγές σκηνής με wipe (πρόταση: αρχή κάθε πρότασης του VO) · hook ≥ 2 αλλαγές εικόνας στα πρώτα 3s (§5.1)
const CAPS = VT.caps();                 // captions από το VO (≤ 2 γραμμές) · διόρθωση: VT.caps({ text: { 3: '«…»' }, at: { 3: 7.5 } }) · ατάκα πελάτη σε «»
`;

const dio = `const D = require('./diorama.js'), { V } = D;
const { ROOM, roomItems, behindDesk, stratosItem, mixCam, handCam } = P;

// ---------- κόσμος (cm) · φως παραθύρου (ένα φως, §1d) ----------
const R = ROOM, LIGHT = { light: { dir: [0.8, -0.55, -0.22], soft: 0.045, shadow: 0.5 }, window: { c: [-120, 82, 38], a: [0, 0, 28], b: [0, 36, 0], panes: [2, 2] } };
const ST_POS = [-6, R.floor.y, 84], HEAD = [-6, 68, 84], DESK = [0, 0, -14];   // Στράτος πίσω από το γραφείο · σημείο δράσης στο γραφείο

// ---------- κάμερα: στησίματα + πλάνα (focus ΠΑΝΤΑ στον πρωταγωνιστή του πλάνου, §1d) ----------
const CAM = {
  desk: { pos: [12, 50, -86], look: [-1, 4, 0], fov: 34, ap: 30, focusAt: DESK },       // πάνω από το γραφείο (το αντικείμενο)
  med: { pos: [-2, 46, -88], look: [-5, 60, 84], fov: 40, ap: 22, focusAt: HEAD },       // Στράτος μέση
  wide: { pos: [-4, 95, -215], look: [-4, 34, 50], fov: 36, ap: 14, focusAt: HEAD },     // Στράτος πίσω από το γραφείο (CTA)
};
const SHOTS = [[0, 'desk', 'desk'], [CUTS[1] ?? 3, 'med', 'med'], [LOOP_AT - 1.2, 'wide', 'wide'], [LOOP_AT, 'desk', 'desk']]; // [t, από, προς] · τελευταίο = frame 0 (loop)
function camAt(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const [t0, a, b] = SHOTS[i], t1 = SHOTS[i + 1] ? SHOTS[i + 1][0] : TOTAL, o = mixCam(CAM[a], CAM[b], easeInOut(prog(t, t0, t1)));
  const k = Math.min(1, t / 0.6, Math.max(0, (LOOP_AT - t) / 0.6)); o.pos = V.add(o.pos, handCam(t, 0.6 * k)); // κάμερα στο χέρι: 0 στο frame 0 και στο loop
  return o;
}

// ---------- Στράτος: πόζες με spring (HANDS.md: συνταγές πόζας) ----------
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.3 }],
  [LOOP_AT, { aL: 0.12, aR: 0.12, brows: 0.3 }],                                       // πίσω στο frame 0
];

function build(t) {
  const cam = D.camera(camAt(t));
  const items = [
    ...roomItems(R, { mat: [0, -24, 0.07], shelf: [-18, 96] }),
    stratosItem(cam, t, { pos: ST_POS, pose: poseSpring(POSES, t), clip: behindDesk(cam, R) }),
    // + αντικείμενα: { t: D.tex('όνομα', w, h, (x, w, h) => { … cut()/props … }), w, h (cm), pos, rot, anchor, surface, lift, zBias, dofAt }
  ];
  return { cam, items, R, ...LIGHT, patch: 0.9, shaft: 0.8, dust: 90, grade: { from: [0, H * 0.3], warm: 0.24, bloom: 0.12 } };
}
const MB = t => 1;                      // motion blur μόνο στις γρήγορες κινήσεις (whip, πτήση, rewind): 3–5

function SCENE(ctx, t) {
  D.frame(ctx, t, build, { mb: MB(t) });
  // 2D από πάνω (πάντα καθαρά): stepChip / stamp / ctaButton … · τα captions + η ετικέτα μπαίνουν από το render.js (CAPS · TAG)
}
`;

const flat = `const { tiles } = P;
const S0 = 1.0, POS = [540, 1080];                    // Στράτος: θέση ώμων, κλίμακα
const POSES = [
  [0, { aL: 0.12, aR: 0.12, brows: 0.3 }],
  [LOOP_AT, { aL: 0.12, aR: 0.12, brows: 0.3 }],                                       // πίσω στο frame 0
];

function SCENE(ctx, t) {
  tiles(ctx);
  stratos(ctx, POS[0], POS[1], S0, { legs: false, mouth: lipsync([]), blink: blinkNow(), ...poseSpring(POSES, t) });
  // + props / κάμερα (L.cam) / pops · τα captions + η ετικέτα μπαίνουν από το render.js (CAPS · TAG)
}
`;

const run = `
module.exports = require('./render.js')({
  name: '${name}', CUTS, SCENE, LOOP: 'cut', LOOP_AT, TAG, CAPS,
  VO_FILE: '${voFile}', VO_AT: 0.2,${fs.existsSync(music) ? ` MUSIC_FILE: '${music}',` : ` // MUSIC_FILE: '${music}' → node music.js ${ep}`}
  SFX: [                                // [t, 'preset', { gain, dur, seed, note }] · χρόνοι από λέξεις: [VT.W('πλατς'), 'thud'] · wipes → whoosh αυτόματα
  ],
});
`;
fs.writeFileSync(out, head + '\n' + common + '\n' + (look === 'flat' ? flat : dio) + run);
console.log(`✔ ${name}.js (${look}${tag ? ', «' + tag + '»' : ''}) · ${VT ? `${sentences.length} προτάσεις VO, ${CAPS_N()} captions, ${cuts.length - 1} σκηνές` : 'χωρίς VO ακόμα'} · TOTAL ${TOTAL}s`);
function CAPS_N() { return VT.caps().length; }
try { require('./next.js').after(name, 'new', true); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
