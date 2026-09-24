// render.js — shared runner for every episode.
// Usage in an episode file:  require('./render.js')({ SCENES: [[fn, seconds], ...], WIPES: [sceneIndex, ...] | 'all', name: 'ep01' })
// CLI:  node ep.js sheet            -> <name>_sheet.png (12 evenly spaced frames, cheap review)
//       node ep.js preview 1.2 5.0  -> <name>_<t>.png
//       node ep.js render [out.mp4] -> 1080x1920 30fps H.264
//       node ep.js lint             -> anatomy/safe-zone warnings for the whole video (10 samples/s), exit 1 if any
//       node ep.js sfx              -> μόνο ήχος: <n>_sfx.wav + <n>_sfx.md και remux στο υπάρχον MP4 (χωρίς νέο video render)
// SFX: auto whoosh σε κάθε wipe + ep.SFX = [[t, 'preset', {gain, pan, seed, dur, note}], ...] (βλ. sfx.js). AUTO_SFX:false → μόνο τα χειροκίνητα.
const L = require('./lib.js');
const { C, ST, W, H, FPS, cut, rng, lerp, easeInOut } = L;
const SFX = require('./sfx.js');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');

const NOISE = [0, 1, 2].map(k => { const c = L.createCanvas(360, 640), x = c.getContext('2d'), im = x.createImageData(360, 640), r = rng(k + 5); for (let i = 0; i < im.data.length; i += 4) { const v = 205 + r() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; });

module.exports = function run(ep) {
  const STARTS = []; let acc = 0; for (const [, d] of ep.SCENES) { STARTS.push(acc); acc += d; }
  const TOTAL = acc, TR = ep.TR || 0.22, name = ep.name || 'video';
  const wipes = ep.WIPES === 'all' ? STARTS.map((_, i) => i).slice(1) : (ep.WIPES || []);
  // SFX cues: whoosh με peak στην αλλαγή σκηνής (−0.27s) για κάθε wipe + τα χειροκίνητα του επεισοδίου
  const CUES = [...(ep.AUTO_SFX === false ? [] : wipes.map(k => [Math.max(0, STARTS[k] - 0.27), 'whoosh', { seed: k, note: 'wipe' }])), ...(ep.SFX || [])].sort((a, b) => a[0] - b[0]);
  const sfxWarn = () => CUES.flatMap(([t, nm]) => [...(SFX.P[nm] ? [] : [`SFX: άγνωστο preset «${nm}»`]), ...(t >= 0 && t < TOTAL ? [] : [`SFX: «${nm}» εκτός χρόνου`])].map(m => [m, t]));
  const writeSfx = () => {
    const wav = `${name}_sfx.wav`, f = t => t.toFixed(2).replace('.', ','); SFX.writeWav(wav, SFX.mix(CUES, TOTAL));
    fs.writeFileSync(`${name}_sfx.md`, `# ${name} — SFX (auto από sfx.js)\n| Χρόνος | SFX | Σημείωση |\n|---|---|---|\n` + CUES.map(([t, nm, o = {}]) => `| ${f(t)}${o.dur ? '–' + f(t + o.dur) : ''} | ${nm} | ${o.note || ''} |`).join('\n') + '\n');
    return wav;
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
    const guide = (mode === 'sheet' && process.argv[3] !== 'clean') || process.argv.includes('guide');
    ST.lint = mode !== 'render';
    const WARN = new Map(); // msg -> [firstT, lastT]
    for (const [m, t] of sfxWarn()) WARN.set(m, [t, t]);
    const drawWarn = () => { ctx.save(); for (const w of ST.warn) { ctx.strokeStyle = '#FF1E50'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(w.x, w.y, 70, 0, 7); ctx.stroke(); ctx.font = 'bold 30px Round'; const tw = Math.min(ctx.measureText(w.msg).width, 1000); const bx = Math.max(10, Math.min(W - tw - 30, w.x - tw / 2)); ctx.fillStyle = '#FF1E50'; ctx.fillRect(bx - 10, w.y + 78, tw + 20, 44); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(w.msg, bx, w.y + 100, 1000); } ctx.restore(); };
    const draw = t => { ST.FRAME = Math.round(t * FPS); ST.capBottom = null; ST.warn = []; ctx.clearRect(0, 0, W, H); frame(ctx, t); if (guide && mode !== 'render') { L.safeGuide(ctx); drawWarn(); } for (const w of ST.warn) { const r = WARN.get(w.msg); r ? (r[1] = t) : WARN.set(w.msg, [t, t]); } };
    const report = () => { if (!WARN.size) { console.log('lint ✔ καθαρό'); return 0; } console.log(`lint: ${WARN.size} warning(s)`); for (const [m, [a, b]] of WARN) console.log(`  ${a.toFixed(1)}–${b.toFixed(1)}s  ${m}`); return 1; };
    const avoidWipe = t => { for (const k of wipes) if (Math.abs(t - STARTS[k]) < TR + 0.05) return STARTS[k] + TR + 0.1; return t; };
    if (mode === 'lint') { for (let t = 0; t < TOTAL; t += 0.1) draw(t); process.exitCode = report(); return; }
    if (mode === 'sfx') {
      const wav = writeSfx(), mp4 = process.argv[3] || `${name}.mp4`; console.log(wav, `${name}_sfx.md`, CUES.length + ' cues');
      if (fs.existsSync(mp4)) { const tmp = mp4.replace(/\.mp4$/, '') + '.tmp.mp4'; const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', tmp]); if (r.status === 0) { fs.renameSync(tmp, mp4); console.log('remux', mp4); } else console.log('✘ remux', String(r.stderr)); }
      return;
    }
    if (mode === 'preview') { for (const t of process.argv.slice(3).filter(a => a !== 'guide').map(Number)) { draw(t); fs.writeFileSync(`${name}_${t}.png`, cv.toBuffer('image/png')); } return; }
    if (mode === 'sheet') {
      const n = 12, sw = 270, sh = 480, sheet = L.createCanvas(sw * 6, sh * 2), sx = sheet.getContext('2d');
      for (let i = 0; i < n; i++) { const t = avoidWipe((i + 0.5) * TOTAL / n); draw(t); sx.drawImage(cv, (i % 6) * sw, Math.floor(i / 6) * sh, sw, sh); sx.fillStyle = '#000'; sx.fillRect((i % 6) * sw, Math.floor(i / 6) * sh, 70, 30); sx.fillStyle = '#fff'; sx.font = '22px Round'; sx.fillText(t.toFixed(1) + 's', (i % 6) * sw + 6, Math.floor(i / 6) * sh + 22); }
      fs.writeFileSync(`${name}_sheet.png`, sheet.toBuffer('image/png')); console.log(`${name}_sheet.png`); report(); return;
    }
    const out = process.argv[3] || `${name}.mp4`, N = Math.round(TOTAL * FPS);
    const wav = CUES.length ? writeSfx() : null; // πρώτα ο ήχος (1s): άγνωστο preset → σφάλμα πριν το video render
    const aIn = wav ? ['-i', wav] : [], aOut = wav ? ['-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
    const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', ...aIn, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', ...aOut, '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'ignore'] });
    for (let f = 0; f < N; f++) { draw(f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', out, TOTAL + 's', wav ? `+ ${wav}, ${name}_sfx.md (${CUES.length} SFX)` : '(silent)');
  })();
};
