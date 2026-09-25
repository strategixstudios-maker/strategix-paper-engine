// render.js — shared runner for every episode.
// Usage in an episode file:  require('./render.js')({ SCENES: [[fn, seconds], ...], WIPES: [sceneIndex, ...] | 'all', name: 'ep01' })
// CLI:  node ep.js sheet            -> <name>_sheet.png (12 evenly spaced frames, cheap review)
//       node ep.js preview 1.2 5.0  -> <name>_<t>.png
//       node ep.js render [out.mp4] -> 1080x1920 30fps H.264
//       node ep.js lint             -> anatomy/safe-zone warnings for the whole video (10 samples/s), exit 1 if any
//       node ep.js sfx              -> μόνο ήχος: <n>_sfx.wav + <n>_sfx.md και remux στο υπάρχον MP4 (χωρίς νέο video render)
//       node ep.js vo               -> φράσεις του VO_FILE σε χρόνο video (σχόλιο στην κορυφή / timing sheet / SFX cues), χωρίς render
//       node render.js vo <mp3> [--at 0.2] [--gap 0.3 [--keep 4,7:0.5] [--out vo/<ep>_vo.mp3]] -> ίδιο πριν γραφτεί το επεισόδιο ·
//                                      --gap: κάθε παύση > gap γίνεται gap (+ ουρά) · --keep N = η παύση πριν τη φράση N μένει ως έχει, N:s = s (punchlines)
// LOOP: true → ουρά 0,3s με wipe που καταλήγει ακριβώς στο frame 0 (το lint ελέγχει ότι τέλος = αρχή: caption + εικόνα)
//       'cut' → seamless, χωρίς wipe: η τελευταία σκηνή καταλήγει στην κατάσταση του frame 0 (ουρά 2 frames· το lint ελέγχει το τελευταίο frame της σκηνής)
// SFX: auto whoosh σε κάθε wipe + ep.SFX = [[t, 'preset', {gain, pan, seed, dur, note}], ...] (βλ. sfx.js). AUTO_SFX:false → μόνο τα χειροκίνητα.
// VO:  ep.VO_FILE = 'vo/<ep>_vo.mp3' (στο repo), VO_AT = offset s, VO_GAIN. → <n>_vo.wav stem + <n>_mix.wav (VO+SFX) στο MP4, lip-sync από την ένταση (ST.VOENV).
// DUCK (default με VO): όλα τα SFX ×mix 0.5 (−6 dB) και όσα πέφτουν πάνω σε φράση ×duck 0.45 (άλλα −7 dB). Φράσεις αυτόματα από την ένταση του VO.
//      DUCK: { phrases: [[a, b], ...], mix, duck } → χειροκίνητα · DUCK: false → χωρίς.
const L = require('./lib.js');
const { C, ST, W, H, FPS, cut, rng, lerp, easeInOut } = L;
const SFX = require('./sfx.js');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');

const LOOP_BLOCKS = 12; // loop lint: max περιοχές 40×40 px που αλλάζουν > 20% ανάμεσα στο τελευταίο και το πρώτο frame (boil/grain/σπίθες μένουν κάτω)
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
  if (ep.VO_FILE) { VO = voLoad(ep.VO_FILE, ep.VO_AT || 0, ep.VO_GAIN ?? 1, TOTAL); ST.VOENV = VO.env; }
  // SFX cues: whoosh με peak στην αλλαγή σκηνής (−0.27s) για κάθε wipe + τα χειροκίνητα του επεισοδίου → ducking κάτω από το VO
  const DK = ep.DUCK === false ? null : ep.DUCK || (VO ? {} : null), PHR = DK && (DK.phrases || (VO ? VO.phr : []));
  const duck = ([t, n, o = {}]) => { const e = t + (o.dur || 0.35), on = PHR.some(([a, b]) => t < b && e > a); return [t, n, { ...o, gain: (o.gain ?? 1) * (DK.mix ?? 0.5) * (on ? (DK.duck ?? 0.45) : 1), note: (o.note || '') + (on ? ' · duck' : '') }]; };
  const CUES = [...(ep.AUTO_SFX === false ? [] : wipes.map(k => [Math.max(0, STARTS[k] - 0.27), 'whoosh', { seed: k, note: 'wipe' }])), ...(ep.SFX || [])].sort((a, b) => a[0] - b[0]).map(c => DK ? duck(c) : c);
  const voWarn = () => VO && VO.end > TOTAL + 0.05 ? [[`VO: το αρχείο (${VO.end.toFixed(2)}s) βγαίνει εκτός video (${TOTAL.toFixed(2)}s)`, TOTAL]] : [];
  const sfxWarn = () => [...voWarn(), ...CUES.flatMap(([t, nm]) => [...(SFX.P[nm] ? [] : [`SFX: άγνωστο preset «${nm}»`]), ...(t >= 0 && t < TOTAL ? [] : [`SFX: «${nm}» εκτός χρόνου`])].map(m => [m, t]))];
  const writeSfx = () => {
    const wav = `${name}_sfx.wav`, f = t => t.toFixed(2).replace('.', ','); SFX.writeWav(wav, SFX.mix(CUES, TOTAL));
    fs.writeFileSync(`${name}_sfx.md`, `# ${name} — SFX (auto από sfx.js)\n| Χρόνος | SFX | Σημείωση |\n|---|---|---|\n` + CUES.map(([t, nm, o = {}]) => `| ${f(t)}${o.dur ? '–' + f(t + o.dur) : ''} | ${nm} | ${o.note || ''} |`).join('\n') + '\n');
    if (!VO) return wav;
    const [L0, R0] = SFX.mix(CUES, TOTAL), lim = x => { const s = Math.abs(x); return s < 0.85 ? x : Math.sign(x) * (0.85 + 0.15 * Math.tanh((s - 0.85) / 0.15)); };
    const Lm = L0.map((x, i) => lim(x + VO.v[i])), Rm = R0.map((x, i) => lim(x + VO.v[i]));
    SFX.writeWav(`${name}_vo.wav`, [VO.v, VO.v]); SFX.writeWav(`${name}_mix.wav`, [Lm, Rm]);
    fs.appendFileSync(`${name}_sfx.md`, `\nVO: \`${ep.VO_FILE}\` @ ${f(ep.VO_AT || 0)}s → \`${name}_vo.wav\` (stem) · \`${name}_mix.wav\` (VO+SFX, στο MP4)\n`);
    return `${name}_mix.wav`;
  };
  function frame(ctx, t) {
    ST.T = t; ST.B = Math.floor(t * 12);
    let i = STARTS.length - 1; while (i > 0 && t < STARTS[i]) i--;
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
    const mode = process.argv[2] || 'render', cv = L.createCanvas(W, H), ctx = cv.getContext('2d');
    if (mode === 'vo') return VO ? voPrint(ep.VO_FILE, VO, ep.VO_AT || 0, TOTAL) : console.log('vo: το επεισόδιο δεν έχει VO_FILE');
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
    if (mode === 'lint') { for (let t = 0; t < TOTAL; t += 0.1) draw(t); loopCheck(); process.exitCode = report(); return; }
    if (mode === 'sfx') {
      const wav = writeSfx(), mp4 = process.argv[3] || `${name}.mp4`; console.log(wav, `${name}_sfx.md`, CUES.length + ' cues' + (VO ? ' + VO' : ''));
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
    const wav = CUES.length || VO ? writeSfx() : null; // πρώτα ο ήχος (1s): άγνωστο preset → σφάλμα πριν το video render
    const aIn = wav ? ['-i', wav] : [], aOut = wav ? ['-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
    const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', ...aIn, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', ...aOut, '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'ignore'] });
    for (let f = 0; f < N; f++) { draw(f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', out, TOTAL + 's', wav ? `+ ${wav}, ${name}_sfx.md (${CUES.length} SFX)` : '(silent)');
  })();
};

// VO: decode → track στο μήκος του video (total, default όλο το αρχείο) + envelope ανά frame (RMS / p95) για lip-sync + φράσεις για ducking / `vo`
function voLoad(file, at = 0, g = 1, total) {
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(SFX.SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
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

// `vo`: φράσεις σε χρόνο video → σχόλιο στην κορυφή του επεισοδίου / timing sheet / SFX cues
function voPrint(file, VO, at, total) {
  const f = x => x.toFixed(2), P = VO.phr;
  console.log(`VO ${file} @ ${f(at)}s → τέλος ${f(VO.end)}s` + (total ? ` · video ${f(total)}s` + (VO.end > total ? ' ✘ VO μεγαλύτερο από το video' : '') : '') + ` · ${P.length} φράσεις`);
  P.forEach(([a, b], i) => console.log(`${String(i + 1).padStart(3)}  ${f(a)}–${f(b)}` + (i ? `   παύση ${f(a - P[i - 1][1])}` : '')));
}

// σφίξιμο παυσών: παύση > gap → gap (μένουν gap/2 μετά τη φράση + gap/2 πριν την επόμενη, crossfade 10ms) · ουρά → gap · keep { N: s | undefined }
function voTight(raw, phr, gap, keep = {}) {
  const SR = SFX.SR, X = Math.round(0.01 * SR), len = raw.length / SR, cuts = [];
  for (let k = 2; k <= phr.length + 1; k++) { // παύση πριν τη φράση k · k = n+1 → ουρά μετά την τελευταία
    const e = phr[k - 2][1], tail = k > phr.length, s = tail ? len : phr[k - 1][0], g = s - e;
    const t = tail ? gap : k in keep ? (keep[k] ?? g) : gap;
    if (g > t + 0.02) cuts.push(tail ? [e + t, len] : [e + t / 2, s - t / 2]);
  }
  const out = new Float32Array(raw.length); let n = 0, from = 0;
  for (const [ca, cb] of cuts) {
    const a = Math.round(ca * SR), b = Math.min(raw.length, Math.round(cb * SR));
    for (let i = from; i < a; i++) out[n++] = raw[i];
    const m = Math.min(X, n, raw.length - b); for (let j = 0; j < m; j++) { const w = (j + 1) / (m + 1); out[n - m + j] = out[n - m + j] * (1 - w) + raw[b + j] * w; }
    from = b + m;
  }
  for (let i = from; i < raw.length; i++) out[n++] = raw[i];
  for (let j = 0; j < Math.min(X, n); j++) out[n - 1 - j] *= j / X; // fade-out στο τέλος
  return { pcm: out.subarray(0, n), cuts };
}

// CLI χωρίς επεισόδιο (βήμα VO, πριν γραφτεί ο κώδικας) — βλ. usage στην κορυφή
if (require.main === module) {
  const [cmd, file, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (cmd !== 'vo' || !file) { console.log('usage: node render.js vo <mp3> [--at 0.2] [--gap 0.3 [--keep 4,7:0.5] [--out vo/<ep>_vo.mp3]]'); process.exit(1); }
  const at = Number(opt('at') || 0), gap = opt('gap');
  let src = file;
  if (gap) {
    const keep = {}; for (const p of (opt('keep') || '').split(',').filter(Boolean)) { const [k, s] = p.split(':'); keep[Number(k)] = s === undefined ? undefined : Number(s); }
    const out = opt('out') || file.replace(/(\.\w+)?$/, '_tight.mp3'), V = voLoad(file), { pcm, cuts } = voTight(V.raw, V.phr, Number(gap), keep);
    const enc = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(SFX.SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', out], { input: Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength) });
    if (enc.status !== 0) throw new Error(`vo: δεν γράφεται το ${out}: ${enc.stderr}`);
    console.log(`σφίξιμο: ${cuts.length} παύσεις → ${gap}s · ${(V.raw.length / SFX.SR).toFixed(2)}s → ${(pcm.length / SFX.SR).toFixed(2)}s → ${out}`);
    src = out;
  }
  voPrint(src, voLoad(src, at), at);
}
