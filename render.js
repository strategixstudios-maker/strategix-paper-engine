// render.js — shared runner for every episode.
// Usage in an episode file:  require('./render.js')({ SCENES: [[fn, seconds], ...], WIPES: [sceneIndex, ...] | 'all', name: 'ep01' })
// CLI:  node ep.js sheet            -> <name>_sheet.png (12 evenly spaced frames, cheap review)
//       node ep.js preview 1.2 5.0  -> <name>_<t>.png
//       node ep.js render [out.mp4] -> 1080x1920 30fps H.264
const L = require('./lib.js');
const { C, ST, W, H, FPS, cut, rng, lerp, easeInOut } = L;
const { spawn } = require('child_process');
const fs = require('fs');

const NOISE = [0, 1, 2].map(k => { const c = L.createCanvas(360, 640), x = c.getContext('2d'), im = x.createImageData(360, 640), r = rng(k + 5); for (let i = 0; i < im.data.length; i += 4) { const v = 205 + r() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; });

module.exports = function run(ep) {
  const STARTS = []; let acc = 0; for (const [, d] of ep.SCENES) { STARTS.push(acc); acc += d; }
  const TOTAL = acc, TR = ep.TR || 0.22, name = ep.name || 'video';
  const wipes = ep.WIPES === 'all' ? STARTS.map((_, i) => i).slice(1) : (ep.WIPES || []);
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
    const draw = t => { ST.FRAME = Math.round(t * FPS); ST.capBottom = null; ctx.clearRect(0, 0, W, H); frame(ctx, t); if (guide && mode !== 'render') L.safeGuide(ctx); };
    if (mode === 'preview') { for (const t of process.argv.slice(3).filter(a => a !== 'guide').map(Number)) { draw(t); fs.writeFileSync(`${name}_${t}.png`, cv.toBuffer('image/png')); } return; }
    if (mode === 'sheet') {
      const n = 12, sw = 270, sh = 480, sheet = L.createCanvas(sw * 6, sh * 2), sx = sheet.getContext('2d');
      for (let i = 0; i < n; i++) { const t = (i + 0.5) * TOTAL / n; draw(t); sx.drawImage(cv, (i % 6) * sw, Math.floor(i / 6) * sh, sw, sh); sx.fillStyle = '#000'; sx.fillRect((i % 6) * sw, Math.floor(i / 6) * sh, 70, 30); sx.fillStyle = '#fff'; sx.font = '22px Round'; sx.fillText(t.toFixed(1) + 's', (i % 6) * sw + 6, Math.floor(i / 6) * sh + 22); }
      fs.writeFileSync(`${name}_sheet.png`, sheet.toBuffer('image/png')); console.log(`${name}_sheet.png`); return;
    }
    const out = process.argv[3] || `${name}.mp4`, N = Math.round(TOTAL * FPS);
    const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'ignore'] });
    for (let f = 0; f < N; f++) { draw(f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', out, TOTAL + 's');
  })();
};
