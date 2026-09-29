// render.js — shared runner for every episode.
// Usage in an episode file:  require('./render.js')({ SCENES: [[fn, seconds], ...], WIPES: [sceneIndex, ...] | 'all', name: 'ep01' })
// CLI:  node ep.js sheet            -> <name>_sheet.png (12 evenly spaced frames, cheap review)
//       node ep.js preview 1.2 5.0  -> <name>_<t>.png
//       node ep.js render [out.mp4] -> 1080x1920 30fps H.264
//       node ep.js lint             -> anatomy/safe-zone warnings for the whole video (10 samples/s), exit 1 if any
//       node ep.js sfx              -> μόνο ήχος: <n>_sfx.wav + <n>_sfx.md και remux στο υπάρχον MP4 (χωρίς νέο video render)
//       node ep.js vo               -> φράσεις του VO_FILE σε χρόνο video (σχόλιο στην κορυφή / timing sheet / SFX cues), χωρίς render
//       node render.js vo <mp3> [--at 0.2] [--gap 0.3 [--keep 4,7:0.5] [--out vo/<ep>_vo.mp3]] -> ίδιο πριν γραφτεί το επεισόδιο ·
//                                      --gap: κάθε παύση > gap γίνεται gap (+ ουρά) · --keep N = η παύση πριν τη φράση N μένει ως έχει, N:s = s (0.03 = κολλητά, punchline · 0.45 = αλλαγή σκηνής · > παύσης = σιωπή για σκηνή χωρίς VO)
//       μονόλογος: <mp3>.words.json (vo.js) → κείμενο ανά φράση στο `vo` (+ --words: χρόνος κάθε λέξης) · μεταφέρεται στο --cut/--gap → vo/<ep>_vo.words.json
//       node render.js vo <mp3> --cut 13.83-14.98[,a-b] [--out …] -> κόβει κομμάτια (χρόνος αρχείου) από το ίδιο take, crossfade 10ms, + .who.json (λέξη/φράση που περισσεύει, er02)
//       node render.js vo <mp3> --splice <new.mp3> --from N [--to M] [--tempo 1.06] [--out …] -> οι φράσεις N..M (αρίθμηση του `vo <mp3>`) γίνονται το new.mp3
//       node render.js vo <mp3> --tempo 1.08 [--gap 0.3 …] --out … -> όλο το take πιο γρήγορα (atempo, ίδιος τόνος) πριν το σφίξιμο (λέξεις/ατάκες ακολουθούν)
//                                      (νέο take μόνο μιας ατάκας · ίδια ένταση με το υπόλοιπο VO · μετά, αν δοθεί, το --gap σφίγγει και τις παύσεις του)
//       διάλογος: <mp3>.who.json (από το vo.js) → ομιλητής ανά φράση στο `vo` · το --gap γράφει και το <out>.who.json → ST.VOWHO → lipsync(VO, rest, 'rena')
// LOOP: true → ουρά 0,3s με wipe που καταλήγει ακριβώς στο frame 0 (το lint ελέγχει ότι τέλος = αρχή: caption + εικόνα)
//       false → ρητά χωρίς loop (μόνο κατ' απαίτηση, π.χ. pf04): το lint δεν ελέγχει τέλος = αρχή · χωρίς LOOP → ο έλεγχος τρέχει (warning)
//       'cut' → seamless, χωρίς wipe: η τελευταία σκηνή καταλήγει στην κατάσταση του frame 0 (ουρά 2 frames· το lint ελέγχει το τελευταίο frame της σκηνής)
// SFX: auto whoosh σε κάθε wipe + ep.SFX = [[t, 'preset', {gain, pan, seed, dur, note}], ...] (βλ. sfx.js). AUTO_SFX:false → μόνο τα χειροκίνητα.
// VO:  ep.VO_FILE = 'vo/<ep>_vo.mp3' (στο repo), VO_AT = offset s, VO_GAIN. → <n>_vo.wav stem + <n>_mix.wav (VO+SFX) στο MP4, lip-sync από την ένταση (ST.VOENV).
// DUCK (default με VO): όλα τα SFX ×mix 0.5 (−6 dB) και όσα πέφτουν πάνω σε φράση ×duck 0.45 (άλλα −7 dB). Φράσεις αυτόματα από την ένταση του VO.
//      DUCK: { phrases: [[a, b], ...], mix, duck } → χειροκίνητα · DUCK: false → χωρίς.
// MUSIC (§5e): ep.MUSIC_FILE = 'music/<ep>.mp3' (από το `node music.js <ep>`, στο repo), MUSIC_GAIN (1 = default). Χαλί πολύ χαμηλά: κανονικοποίηση σε MUSIC_RMS
//      (≈ 15 dB κάτω από το VO, ίδια ένταση σε κάθε επεισόδιο) · άλλα −6 dB κάτω από τις φράσεις του VO · fade in 0,3s / out 0,8s → <n>_music.wav stem + στο <n>_mix.wav.
// `node <ep>.js info` → {"name","total"} (διάρκεια για το music.js)
const L = require('./lib.js');
const { C, ST, W, H, FPS, cut, rng, lerp, easeInOut } = L;
const SFX = require('./sfx.js');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');

const LOOP_BLOCKS = 12; // loop lint: max περιοχές 40×40 px που αλλάζουν > 20% ανάμεσα στο τελευταίο και το πρώτο frame (boil/grain/σπίθες μένουν κάτω)
const HOOK_BLOCKS = 60; // hook lint (§5.1): περιοχές 40×40 που αλλάζουν > 20% ανάμεσα σε δύο δείγματα (0,5s) = «αλλαγή εικόνας» (όχι αργό zoom)
const NOISE = [0, 1, 2].map(k => { const c = L.createCanvas(360, 640), x = c.getContext('2d'), im = x.createImageData(360, 640), r = rng(k + 5); for (let i = 0; i < im.data.length; i += 4) { const v = 205 + r() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; });

module.exports = function run(ep) {
  // LOOP (§5.7): ουρά που γυρίζει στο frame 0, ώστε το τέλος να δένει με την αρχή · true = torn-paper wipe (+ auto whoosh) · 'cut' = seamless κόψιμο · LOOP_DUR (default 0.3s = wipe + 2 frames · 'cut': 2 frames)
  const CUT = ep.LOOP === 'cut';
  if (ep.LOOP) {
    const s0 = ep.SCENES[0][0], n = ep.SCENES.length;
    if (ep.WIPES === 'all') ep.WIPES = ep.SCENES.map((_, i) => i).slice(1);
    ep.SCENES = [...ep.SCENES, [ctx => s0(ctx, 0), ep.LOOP_DUR || (CUT ? 2 / FPS : Math.max(0.3, (ep.TR || 0.22) + 0.08))]];
    if (ep.LOOP !== 'cut') ep.WIPES = [...(ep.WIPES || []), n];
  }
  const STARTS = []; let acc = 0; for (const [, d] of ep.SCENES) { STARTS.push(acc); acc += d; }
  const TOTAL = acc, TR = ep.TR || 0.22, name = ep.name || 'video';
  const wipes = ep.WIPES === 'all' ? STARTS.map((_, i) => i).slice(1) : (ep.WIPES || []);
  // VO: track στο μήκος του video + envelope για lip-sync + φράσεις για ducking (voLoad, κάτω)
  let VO = null;
  if (ep.VO_FILE) { VO = voLoad(ep.VO_FILE, ep.VO_AT || 0, ep.VO_GAIN ?? 1, TOTAL); ST.VOENV = VO.env; ST.VOWHO = VO.who = voWho(ep.VO_FILE, ep.VO_AT || 0); }
  const MU = ep.MUSIC_FILE && fs.existsSync(ep.MUSIC_FILE) ? musicLoad(ep.MUSIC_FILE, TOTAL, ep.MUSIC_GAIN ?? 1, VO ? VO.phr : []) : null;
  // SFX cues: whoosh με peak στην αλλαγή σκηνής (−0.27s) για κάθε wipe + τα χειροκίνητα του επεισοδίου → ducking κάτω από το VO
  const DK = ep.DUCK === false ? null : ep.DUCK || (VO ? {} : null), PHR = DK && (DK.phrases || (VO ? VO.phr : []));
  const duck = ([t, n, o = {}]) => { const e = t + (o.dur || 0.35), on = PHR.some(([a, b]) => t < b && e > a); return [t, n, { ...o, gain: (o.gain ?? 1) * (DK.mix ?? 0.5) * (on ? (DK.duck ?? 0.45) : 1), note: (o.note || '') + (on ? ' · duck' : '') }]; };
  const CUES = [...(ep.AUTO_SFX === false ? [] : wipes.map(k => [Math.max(0, STARTS[k] - 0.27), 'whoosh', { seed: k, note: 'wipe' }])), ...(ep.SFX || [])].sort((a, b) => a[0] - b[0]).map(c => DK ? duck(c) : c);
  const voWarn = () => VO && VO.end > TOTAL + 0.05 ? [[`VO: το αρχείο (${VO.end.toFixed(2)}s) βγαίνει εκτός video (${TOTAL.toFixed(2)}s)`, TOTAL]] : [];
  const muWarn = () => !ep.MUSIC_FILE ? [] : !MU ? [[`MUSIC: δεν υπάρχει το αρχείο «${ep.MUSIC_FILE}» → node music.js <ep>`, 0]] : MU.end < TOTAL - 0.05 ? [[`MUSIC: το αρχείο (${MU.end.toFixed(2)}s) τελειώνει πριν από το video (${TOTAL.toFixed(2)}s) → node music.js <ep>`, MU.end]] : [];
  const sfxWarn = () => [...voWarn(), ...muWarn(), ...CUES.flatMap(([t, nm, o = {}]) => [...(SFX.P[nm] ? [] : [`SFX: άγνωστο preset «${nm}»`]), ...(nm === 'file' && !fs.existsSync(o.src || '') ? [`SFX: δεν υπάρχει το αρχείο «${o.src}»`] : []), ...(t >= 0 && t < TOTAL ? [] : [`SFX: «${nm}» εκτός χρόνου`])].map(m => [m, t]))];
  const writeSfx = () => {
    const wav = `${name}_sfx.wav`, f = t => t.toFixed(2).replace('.', ','); SFX.writeWav(wav, SFX.mix(CUES, TOTAL));
    fs.writeFileSync(`${name}_sfx.md`, `# ${name} — SFX (auto από sfx.js)\n| Χρόνος | SFX | Σημείωση |\n|---|---|---|\n` + CUES.map(([t, nm, o = {}]) => `| ${f(t)}${o.dur ? '–' + f(t + o.dur) : ''} | ${nm} | ${o.note || ''} |`).join('\n') + '\n');
    if (!VO && !MU) return wav;
    const [L0, R0] = SFX.mix(CUES, TOTAL), lim = x => { const s = Math.abs(x); return s < 0.85 ? x : Math.sign(x) * (0.85 + 0.15 * Math.tanh((s - 0.85) / 0.15)); };
    const v = i => VO ? VO.v[i] : 0, Lm = L0.map((x, i) => lim(x + v(i) + (MU ? MU.L[i] : 0))), Rm = R0.map((x, i) => lim(x + v(i) + (MU ? MU.R[i] : 0)));
    if (VO) SFX.writeWav(`${name}_vo.wav`, [VO.v, VO.v]);
    if (MU) SFX.writeWav(`${name}_music.wav`, [MU.L, MU.R]);
    SFX.writeWav(`${name}_mix.wav`, [Lm, Rm]);
    const mix = [VO && 'VO', MU && 'μουσική', 'SFX'].filter(Boolean).join('+');
    fs.appendFileSync(`${name}_sfx.md`, (VO ? `\nVO: \`${ep.VO_FILE}\` @ ${f(ep.VO_AT || 0)}s → \`${name}_vo.wav\` (stem)` : '') + (MU ? `\nΜουσική: \`${ep.MUSIC_FILE}\` → \`${name}_music.wav\` (stem)` : '') + ` · \`${name}_mix.wav\` (${mix}, στο MP4)\n`);
    return `${name}_mix.wav`;
  };
  function frame(ctx, t) {
    ST.T = t; ST.B = Math.floor(t * 12);
    let i = STARTS.length - 1; while (i > 0 && t < STARTS[i]) i--; ST.SCENE = i;
    ctx.save(); ep.SCENES[i][0](ctx, t - STARTS[i]); ctx.restore();
    for (const k of wipes) { // torn-paper wipe
      const d = t - STARTS[k]; if (Math.abs(d) >= TR) continue;
      const col = k % 2 ? C.paper : C.sky; let top, bot;
      if (d < 0) { top = lerp(H + 120, -140, easeInOut(1 + d / TR)); bot = H + 200; } else { top = -200; bot = lerp(H + 120, -140, easeInOut(d / TR)); }
      if (bot > top) cut(ctx, [[-60, top], [W + 60, top], [W + 60, bot], [-60, bot]], col, { seed: 1000 + k, amp: 22, step: 26, edgeW: 14, sy: -12, scribble: col === C.sky ? '#A7C1F2' : '#E6E0D0' });
    }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.45; ctx.drawImage(NOISE[ST.B % 3], 0, 0, W, H); ctx.restore();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,20,0)'); g.addColorStop(1, 'rgba(0,0,20,0.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (require.main !== module.parent) return { frame, TOTAL };
  (async () => {
    const mode = process.argv[2] || 'render', cv = L.createCanvas(W, H), ctx = cv.getContext('2d'); ST.MODE = mode;
    if (mode === 'info') return console.log(JSON.stringify({ name, total: TOTAL }));
    if (mode === 'vo') return VO ? voPrint(ep.VO_FILE, VO, ep.VO_AT || 0, TOTAL, VO.who) : console.log('vo: το επεισόδιο δεν έχει VO_FILE');
    const guide = (mode === 'sheet' && process.argv[3] !== 'clean') || process.argv.includes('guide');
    ST.lint = mode !== 'render';
    const WARN = new Map(); // msg -> [firstT, lastT]
    for (const [m, t] of sfxWarn()) WARN.set(m, [t, t]);
    const drawWarn = () => { ctx.save(); for (const w of ST.warn) { ctx.strokeStyle = '#FF1E50'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(w.x, w.y, 70, 0, 7); ctx.stroke(); ctx.font = 'bold 30px Round'; const tw = Math.min(ctx.measureText(w.msg).width, 1000); const bx = Math.max(10, Math.min(W - tw - 30, w.x - tw / 2)); ctx.fillStyle = '#FF1E50'; ctx.fillRect(bx - 10, w.y + 78, tw + 20, 44); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(w.msg, bx, w.y + 100, 1000); } ctx.restore(); };
    const draw = t => { ST.FRAME = Math.round(t * FPS); ST.capBottom = null; ST.capText = null; ST.warn = []; ctx.clearRect(0, 0, W, H); frame(ctx, t); if (guide && mode !== 'render') { L.safeGuide(ctx); drawWarn(); } for (const w of ST.warn) { const r = WARN.get(w.msg); r ? (r[1] = t) : WARN.set(w.msg, [t, t]); } };
    const report = () => { if (!WARN.size) { console.log('lint ✔ καθαρό'); return 0; } console.log(`lint: ${WARN.size} warning(s)`); for (const [m, [a, b]] of WARN) console.log(`  ${a.toFixed(1)}–${b.toFixed(1)}s  ${m}`); return 1; };
    const avoidWipe = t => { for (const k of wipes) if (Math.abs(t - STARTS[k]) < TR + 0.05) return STARTS[k] + TR + 0.1; return t; };
    // loop (§5.7): το τελευταίο frame πρέπει να δένει με το πρώτο — ίδιο caption + ίδια εικόνα (μικρογραφία 27×48: χωρίς boil/grain) · 'cut': το τελευταίο frame της σκηνής πριν από την ουρά
    const snap = t => { draw(t); const d = ctx.getImageData(0, 0, W, H).data, g = new Float32Array(27 * 48 * 3);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, k = (Math.floor(y / 40) * 27 + Math.floor(x / 40)) * 3; g[k] += d[i]; g[k + 1] += d[i + 1]; g[k + 2] += d[i + 2]; }
      return { cap: ST.capText, g }; };
    const loopCheck = () => {
      const a = snap(0), b = snap((CUT ? STARTS[STARTS.length - 1] : TOTAL) - 1 / FPS), q = s => s ? `«${s.length > 24 ? s.slice(0, 24) + '…' : s}»` : 'χωρίς caption';
      let big = 0; for (let k = 0; k < a.g.length; k += 3) if (Math.abs(a.g[k] - b.g[k]) + Math.abs(a.g[k + 1] - b.g[k + 1]) + Math.abs(a.g[k + 2] - b.g[k + 2]) > 0.2 * 3 * 1600 * 255) big++;
      if (a.cap !== b.cap) WARN.set(`loop: caption στο τέλος ${q(b.cap)} ≠ αρχή ${q(a.cap)} → LOOP: true | 'cut'`, [TOTAL, TOTAL]);
      if (big > LOOP_BLOCKS) WARN.set(`loop: το τελευταίο frame δεν δένει με το πρώτο (${big} περιοχές αλλάζουν) → LOOP: true | 'cut'`, [TOTAL, TOTAL]);
    };
    // hook (§5.1): ≥ 2 αλλαγές εικόνας στα πρώτα 3s — αργό zoom / ίδιο κάδρο δεν μετράει (ad_event v1: 3s το ίδιο άδειο σκηνικό)
    const hookCheck = () => {
      const ts = [0, 0.5, 1, 1.5, 2, 2.5, 3].filter(t => t < TOTAL), sn = ts.map(t => snap(t).g), diffs = [];
      for (let i = 1; i < sn.length; i++) { let big = 0; for (let k = 0; k < sn[i].length; k += 3) if (Math.abs(sn[i][k] - sn[i - 1][k]) + Math.abs(sn[i][k + 1] - sn[i - 1][k + 1]) + Math.abs(sn[i][k + 2] - sn[i - 1][k + 2]) > 0.2 * 3 * 1600 * 255) big++; diffs.push(big); }
      if (process.env.HOOK_DEBUG) console.log('hook diffs', diffs.join(' '));
      const changes = diffs.filter(b => b > HOOK_BLOCKS).length;
      if (changes < 2) WARN.set(`hook: ${changes} αλλαγή εικόνας στα πρώτα 3s (θέλει ≥ 2 · κάθε ~1s: νέο κάδρο, snap, pop) → §5.1`, [0, 3]);
    };
    if (mode === 'lint') { for (let t = 0; t < TOTAL; t += 0.1) draw(t); if (ep.LOOP !== false) loopCheck(); hookCheck(); process.exitCode = report(); return; }
    if (mode === 'sfx') {
      const wav = writeSfx(), mp4 = process.argv[3] || `${name}.mp4`; console.log(wav, `${name}_sfx.md`, CUES.length + ' cues' + (VO ? ' + VO' : '') + (MU ? ' + μουσική' : ''));
      if (fs.existsSync(mp4)) { const tmp = mp4.replace(/\.mp4$/, '') + '.tmp.mp4'; const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', tmp]); if (r.status === 0) { fs.renameSync(tmp, mp4); console.log('remux', mp4); } else console.log('✘ remux', String(r.stderr)); }
      return;
    }
    if (mode === 'preview') { for (const t of process.argv.slice(3).filter(a => a !== 'guide').map(Number)) { draw(t); fs.writeFileSync(`${name}_${t}.png`, cv.toBuffer('image/png')); } return; }
    if (mode === 'sheet') {
      const n = 12, sw = 270, sh = 480, sheet = L.createCanvas(sw * 6, sh * 2), sx = sheet.getContext('2d');
      for (let i = 0; i < n; i++) { const t = avoidWipe((i + 0.5) * TOTAL / n); draw(t); sx.drawImage(cv, (i % 6) * sw, Math.floor(i / 6) * sh, sw, sh); sx.fillStyle = '#000'; sx.fillRect((i % 6) * sw, Math.floor(i / 6) * sh, 70, 30); sx.fillStyle = '#fff'; sx.font = '22px Round'; sx.fillText(t.toFixed(1) + 's', (i % 6) * sw + 6, Math.floor(i / 6) * sh + 22); }
      fs.writeFileSync(`${name}_sheet.png`, sheet.toBuffer('image/png')); console.log(`${name}_sheet.png`); loopCheck(); report(); return;
    }
    const out = process.argv[3] || `${name}.mp4`, N = Math.round(TOTAL * FPS);
    const wav = CUES.length || VO || MU ? writeSfx() : null; // πρώτα ο ήχος (1s): άγνωστο preset → σφάλμα πριν το video render
    const aIn = wav ? ['-i', wav] : [], aOut = wav ? ['-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
    const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', ...aIn, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', ...aOut, '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'ignore'] });
    for (let f = 0; f < N; f++) { draw(f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', out, TOTAL + 's', wav ? `+ ${wav}, ${name}_sfx.md (${CUES.length} SFX)` : '(silent)');
  })();
};

// VO: decode → track στο μήκος του video (total, default όλο το αρχείο) + envelope ανά frame (RMS / p95) για lip-sync + φράσεις για ducking / `vo`
function voLoad(file, at = 0, g = 1, total, af) {
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', file, ...(af ? ['-af', af] : []), '-ac', '1', '-ar', String(SFX.SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`VO: δεν διαβάζεται το ${file}`);
  const raw = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
  const TOTAL = total ?? at + raw.length / SFX.SR, N = Math.ceil(TOTAL * SFX.SR), v = new Float32Array(N), j0 = Math.round(at * SFX.SR);
  for (let i = 0; i < raw.length; i++) { const j = j0 + i; if (j >= 0 && j < N) v[j] = raw[i] * g; }
  const F = Math.ceil(TOTAL * FPS), hop = SFX.SR / FPS, env = new Float32Array(F);
  for (let f = 0; f < F; f++) { const a = Math.floor(f * hop), b = Math.min(N, Math.floor((f + 1) * hop)); let s = 0; for (let i = a; i < b; i++) s += v[i] * v[i]; env[f] = Math.sqrt(s / Math.max(1, b - a)); }
  const on = [...env].filter(x => x > 1e-3).sort((a, b) => a - b), ref = on[Math.floor(on.length * 0.95)] || 1;
  for (let f = 0; f < F; f++) env[f] = Math.min(1, env[f] / ref);
  const phr = []; for (let f = 0; f < F; f++) if (env[f] > 0.1) { const p = phr[phr.length - 1]; if (p && f / FPS - p[1] < 0.15) p[1] = (f + 1) / FPS; else phr.push([f / FPS, (f + 1) / FPS]); } // ένταση > 0.1, κενά < 0.15s ενώνονται
  return { raw, v, env, phr, end: at + raw.length / SFX.SR };
}

// MUSIC: stereo decode → κανονικοποίηση (RMS των μη σιωπηλών samples → MUSIC_RMS × g) · ducking κάτω από τις φράσεις του VO (attack 0,08s / release 0,35s) · fades
const MUSIC_RMS = 0.025, MUSIC_DUCK = 0.5; // ≈ −32 dBFS (VO ≈ −17 dBFS στις φράσεις → ~15 dB κάτω) · κάτω από φράση άλλα −6 dB
function musicLoad(file, total, g = 1, phr = []) {
  const SR = SFX.SR, r = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`MUSIC: δεν διαβάζεται το ${file}`);
  const raw = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length)), n = raw.length / 2, N = Math.ceil(total * SR);
  let s = 0, c = 0; for (let i = 0; i < raw.length; i++) if (Math.abs(raw[i]) > 1e-3) { s += raw[i] * raw[i]; c++; }
  const k = g * MUSIC_RMS / (Math.sqrt(s / Math.max(1, c)) || 1), F = Math.ceil(total * FPS), tgt = new Float32Array(F).fill(1);
  for (const [a, b] of phr) for (let f = Math.max(0, Math.floor((a - 0.1) * FPS)); f < Math.min(F, Math.ceil((b + 0.15) * FPS)); f++) tgt[f] = MUSIC_DUCK;
  const L = new Float32Array(N), R = new Float32Array(N), atk = 1 - Math.exp(-1 / (0.08 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR));
  for (let i = 0, d = 1; i < Math.min(N, n); i++) {
    const t = tgt[Math.min(F - 1, Math.floor(i / SR * FPS))]; d += (t - d) * (t < d ? atk : rel);
    const m = k * d * Math.min(1, i / (0.3 * SR), (N - i) / (0.8 * SR)); L[i] = raw[2 * i] * m; R[i] = raw[2 * i + 1] * m;
  }
  return { L, R, end: n / SR };
}

// διάλογος (er01): <mp3>.who.json = [[a, b, 'rena'], ...] σε χρόνο αρχείου → σε χρόνο video (+at) · null αν δεν υπάρχει
const whoFile = f => f.replace(/\.\w+$/, '.who.json');
function voWho(file, at = 0) { const w = whoFile(file); return fs.existsSync(w) ? JSON.parse(fs.readFileSync(w, 'utf8')).map(([a, b, n]) => [a + at, b + at, n]) : null; }
// χρόνοι λέξεων (μονόλογος, vo.js → .words.json) · ίδια μεταφορά με το .who.json στο --cut / --gap · στο `vo` κάθε φράση τυπώνεται με το κείμενό της
const wordsFile = f => f.replace(/\.\w+$/, '.words.json');
function voWords(file, at = 0) { const w = wordsFile(file); return fs.existsSync(w) ? JSON.parse(fs.readFileSync(w, 'utf8')).map(([a, b, x]) => [a + at, b + at, x]) : null; }
const wordsIn = (words, [a, b]) => (words || []).filter(([x, y]) => (x + y) / 2 >= a - 0.08 && (x + y) / 2 <= b + 0.08).map(w => w[2]).join(' ');
const whoOf = (who, [a, b]) => { let best = '', ov = 0; for (const [x, y, n] of who || []) { const o = Math.min(b, y) - Math.max(a, x); if (o > ov) { ov = o; best = n; } } return best; };

// `vo`: φράσεις σε χρόνο video → σχόλιο στην κορυφή του επεισοδίου / timing sheet / SFX cues (+ ομιλητής σε διάλογο)
function voPrint(file, VO, at, total, who, words = voWords(file, at)) {
  const f = x => x.toFixed(2), P = VO.phr;
  console.log(`VO ${file} @ ${f(at)}s → τέλος ${f(VO.end)}s` + (total ? ` · video ${f(total)}s` + (VO.end > total ? ' ✘ VO μεγαλύτερο από το video' : '') : '') + ` · ${P.length} φράσεις`);
  P.forEach(([a, b], i) => console.log(`${String(i + 1).padStart(3)}  ${f(a)}–${f(b)}` + (who ? `  ${whoOf(who, [a, b]).padEnd(8)}` : '') + (i ? `   παύση ${f(a - P[i - 1][1])}` : '            ') + (words ? `   ${wordsIn(words, [a, b])}` : '')));
  if (words && process.argv.includes('--words')) console.log(words.map(([a, b, x]) => `${f(a)} ${x}`).join(' · '));
}

// σφίξιμο παυσών: παύση > gap → gap (μένουν gap/2 μετά τη φράση + gap/2 πριν την επόμενη, crossfade 10ms) · ουρά → gap · keep { N: s | undefined }
// keep N:s μεγαλύτερο από την παύση → μπαίνει σιωπή στη μέση της (er02: σκηνή χωρίς VO, π.χ. κουδούνισμα τηλεφώνου)
function voTight(raw, phr, gap, keep = {}) {
  const SR = SFX.SR, X = Math.round(0.01 * SR), len = raw.length / SR, cuts = [], ins = [];
  for (let k = 2; k <= phr.length + 1; k++) { // παύση πριν τη φράση k · k = n+1 → ουρά μετά την τελευταία
    const e = phr[k - 2][1], tail = k > phr.length, s = tail ? len : phr[k - 1][0], g = s - e;
    const t = tail ? gap : k in keep ? (keep[k] ?? g) : gap;
    if (g > t + 0.02) cuts.push(tail ? [e + t, len] : [e + t / 2, s - t / 2]);
    else if (!tail && k in keep && t > g + 0.02) ins.push([(e + s) / 2, t - g]); // σιωπή μόνο με --keep N:s (§5d) · οι μικρές παύσεις του take μένουν (ad_xeimonas: το --gap τις μεγάλωνε → πιο αργό VO)
  }
  return { pcm: voApply(raw, cuts, ins), cuts, ins };
}
// κόβει τα cuts [[a, b], ...] (s) με crossfade 10ms και βάζει σιωπή στα ins [[t, d], ...] → νέο pcm
function voApply(raw, cuts, ins = []) {
  const SR = SFX.SR, X = Math.round(0.01 * SR);
  const out = new Float32Array(raw.length + Math.ceil(ins.reduce((a, [, d]) => a + d, 0) * SR) + 1); let n = 0, from = 0;
  for (const ev of [...cuts.map(c => ({ at: c[0], c })), ...ins.map(i => ({ at: i[0], d: i[1] }))].sort((x, y) => x.at - y.at)) {
    const a = Math.round(ev.at * SR);
    for (let i = from; i < a; i++) out[n++] = raw[i];
    if (ev.d) { from = a; n += Math.round(ev.d * SR); continue; } // σιωπή (το out είναι ήδη 0)
    const b = Math.min(raw.length, Math.round(ev.c[1] * SR));
    const m = Math.min(X, n, raw.length - b); for (let j = 0; j < m; j++) { const w = (j + 1) / (m + 1); out[n - m + j] = out[n - m + j] * (1 - w) + raw[b + j] * w; }
    from = b + m;
  }
  for (let i = from; i < raw.length; i++) out[n++] = raw[i];
  for (let j = 0; j < Math.min(X, n); j++) out[n - 1 - j] *= j / X; // fade-out στο τέλος
  return out.subarray(0, n);
}
// χρόνος πριν → μετά το σφίξιμο (για το .who.json του διαλόγου): αφαιρούνται τα κομμάτια των cuts πριν από το t, προστίθενται οι σιωπές (ins)
const tightT = (cuts, t, ins = []) => t - cuts.reduce((s, [a, b]) => s + Math.max(0, Math.min(t, b) - a), 0) + ins.reduce((s, [p, d]) => s + (p < t ? d : 0), 0);

// αλλαγή ατάκας (pf03 v3 → pf04 v2): οι φράσεις from..to του file → η ομιλία του add (χωρίς σιωπές στις άκρες, atempo αν δοθεί, ίδιο RMS ομιλίας με το file)
// η παύση πριν τη φράση from και μετά τη φράση to μένουν ως έχουν · crossfade 10ms στις ενώσεις
function voSplice(file, add, from, to = from, tempo) {
  const SR = SFX.SR, A = voLoad(file), B = voLoad(add, 0, 1, undefined, tempo ? `atempo=${tempo}` : undefined), n = A.phr.length;
  if (!(from >= 1 && to >= from && to <= n)) throw new Error(`vo --splice: φράσεις ${from}..${to} εκτός (το ${file} έχει ${n})`);
  const rms = V => { let s = 0, c = 0; for (const [a, b] of V.phr) for (let i = Math.floor(a * SR); i < Math.min(V.raw.length, b * SR); i++) { s += V.raw[i] ** 2; c++; } return Math.sqrt(s / Math.max(1, c)); };
  const g = rms(A) / (rms(B) || 1), I = t => Math.max(0, Math.round(t * SR));
  const a0 = I(A.phr[from - 1][0] - 0.03), a1 = Math.min(A.raw.length, I(A.phr[to - 1][1] + 0.03));
  const b0 = I(B.phr[0][0] - 0.03), b1 = Math.min(B.raw.length, I(B.phr[B.phr.length - 1][1] + 0.06));
  const parts = [A.raw.subarray(0, a0), B.raw.subarray(b0, b1).map(x => x * g), A.raw.subarray(a1)], X = Math.round(0.01 * SR);
  const out = new Float32Array(parts.reduce((k, p) => k + p.length, 0)); let o = 0;
  for (const [k, p] of parts.entries()) { const m = k ? Math.min(X, o, p.length) : 0; for (let j = 0; j < m; j++) { const w = (j + 1) / (m + 1); out[o - m + j] = out[o - m + j] * (1 - w) + p[j] * w; } out.set(p.subarray(m), o); o += p.length - m; }
  return { pcm: out.subarray(0, o), gain: 20 * Math.log10(g), dur: (b1 - b0) / SR, from: A.phr[from - 1][0] };
}
const voWrite = (pcm, out) => { const enc = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(SFX.SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', out], { input: Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength) }); if (enc.status !== 0) throw new Error(`vo: δεν γράφεται το ${out}: ${enc.stderr}`); };

// CLI χωρίς επεισόδιο (βήμα VO, πριν γραφτεί ο κώδικας) — βλ. usage στην κορυφή
if (require.main === module) {
  const [cmd, file, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (cmd !== 'vo' || !file) { console.log('usage: node render.js vo <mp3> [--at 0.2] [--splice <new.mp3> --from N [--to M] [--tempo 1.06]] [--tempo 1.08 (όλο το take)] [--gap 0.3 [--keep 4,7:0.5]] [--out vo/<ep>_vo.mp3]'); process.exit(1); }
  const at = Number(opt('at') || 0), gap = opt('gap');
  let src = file, who = voWho(file), words = voWords(file);
  const moveWords = (out, fn) => { if (!words) return; words = words.map(([a, b, x]) => [+fn(a).toFixed(3), +fn(b).toFixed(3), x]).filter(([a, b]) => b > a); fs.writeFileSync(wordsFile(out), JSON.stringify(words)); };
  if (opt('cut')) { // κόψιμο λέξεων/φράσεων από έτοιμο VO: ίδιο take = ίδια φωνή (pf05 v2 → er02) · --cut a-b[,c-d] σε χρόνο αρχείου (s)
    const out = opt('out') || file.replace(/(\.\w+)?$/, '_cut.mp3'), V = voLoad(src), cuts = opt('cut').split(',').map(r => r.split('-').map(Number)).sort((p, q) => p[0] - q[0]);
    const pcm = voApply(V.raw, cuts); voWrite(pcm, out);
    console.log(`cut: ${cuts.map(([a, b]) => a.toFixed(2) + '–' + b.toFixed(2)).join(', ')} (−${cuts.reduce((d, [a, b]) => d + b - a, 0).toFixed(2)}s) → ${out}`);
    if (who) { who = who.map(([a, b, n]) => [+tightT(cuts, a).toFixed(3), +tightT(cuts, b).toFixed(3), n]).filter(([a, b]) => b > a); fs.writeFileSync(whoFile(out), JSON.stringify(who)); }
    moveWords(out, t => tightT(cuts, t));
    src = out;
  }
  if (opt('splice')) {
    const out = opt('out') || file.replace(/(\.\w+)?$/, '_splice.mp3'), fr = Number(opt('from')), S = voSplice(file, opt('splice'), fr, Number(opt('to') || fr), opt('tempo'));
    voWrite(S.pcm, out); src = out;
    console.log(`splice: φράσεις ${fr}..${opt('to') || fr} → ${opt('splice')} (${S.dur.toFixed(2)}s, ${S.gain >= 0 ? '+' : ''}${S.gain.toFixed(1)} dB${opt('tempo') ? ', atempo ' + opt('tempo') : ''}) από ${S.from.toFixed(2)}s → ${out}`);
    if (who) { console.log('splice: διάλογος → το .who.json δεν μεταφέρεται (όλο το VO ξανά, §5d)'); who = null; } words = null;
  }
  if (opt('tempo') && !opt('splice')) { // ρυθμός όλου του take (pf02 1.06 → ad_xeimonas 1.08): atempo = ίδιος τόνος φωνής · λέξεις/ατάκες ÷ tempo · πριν το --gap
    const k = Number(opt('tempo')), out = opt('out') || src.replace(/(\.\w+)?$/, '_tempo.mp3'), V = voLoad(src, 0, 1, undefined, `atempo=${k}`);
    voWrite(V.raw, out);
    console.log(`tempo: atempo ${k} · ${(V.raw.length * k / SFX.SR).toFixed(2)}s → ${(V.raw.length / SFX.SR).toFixed(2)}s → ${out}`);
    if (who) { who = who.map(([a, b, n]) => [+(a / k).toFixed(3), +(b / k).toFixed(3), n]); fs.writeFileSync(whoFile(out), JSON.stringify(who)); }
    moveWords(out, t => t / k);
    src = out;
  }
  if (gap) {
    const keep = {}; for (const p of (opt('keep') || '').split(',').filter(Boolean)) { const [k, s] = p.split(':'); keep[Number(k)] = s === undefined ? undefined : Number(s); }
    const out = opt('out') || src.replace(/(\.\w+)?$/, '_tight.mp3'), V = voLoad(src), { pcm, cuts, ins } = voTight(V.raw, V.phr, Number(gap), keep);
    voWrite(pcm, out);
    console.log(`σφίξιμο: ${cuts.length} παύσεις → ${gap}s · ${(V.raw.length / SFX.SR).toFixed(2)}s → ${(pcm.length / SFX.SR).toFixed(2)}s → ${out}`);
    if (who) { who = who.map(([a, b, n]) => [+tightT(cuts, a, ins).toFixed(3), +tightT(cuts, b, ins).toFixed(3), n]); fs.writeFileSync(whoFile(out), JSON.stringify(who)); console.log(`διάλογος: ${who.length} ατάκες → ${whoFile(out)}`); }
    moveWords(out, t => tightT(cuts, t, ins));
    src = out;
  }
  voPrint(src, voLoad(src, at), at, undefined, who && who.map(([a, b, n]) => [a + at, b + at, n]), words && words.map(([a, b, x]) => [a + at, b + at, x]));
}
