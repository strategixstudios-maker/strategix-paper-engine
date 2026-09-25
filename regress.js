// regress.js — τι αλλάζει σε ΟΛΑ τα επεισόδια μια αλλαγή στο engine ή ένα patch: base commit vs working tree.
// node regress.js [base=HEAD] [ep ...] [--fresh]     π.χ. node regress.js origin/main  ·  node regress.js HEAD pf02_thermos_laser
//   ανά επεισόδιο: lint (νέα / λυμένα warnings) · 12 frames του sheet (pixel diff) · SFX stem (ίδιο ή Δ dB)
//   οπτική αλλαγή → regress/<ep>.png (πάνω base · μέση νέο · κάτω diff σε κόκκινο)
//   exit 1 μόνο για ΝΕΟ crash ή ΝΕΟ lint warning. Οπτικές/ηχητικές αλλαγές = αναφορά (σκόπιμες; αλλιώς διόρθωσε).
// Τρέχει σε αντίγραφα στο tmp (δεν αγγίζει outputs/MP4 του repo). Τα αποτελέσματα του base μένουν σε cache ανά commit.
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { execSync, spawn } = require('child_process');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const ROOT = __dirname, TMP = path.join(os.tmpdir(), 'strategix-regress');
const sh = (cmd, cwd = ROOT) => execSync(cmd, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 });
// επεισόδιο = .js στη ρίζα που καλεί το render (γραμμή που δεν είναι σχόλιο), όχι _legacy — χωρίς λίστα prefixes: νέα σειρά μπαίνει αυτόματα · ίδιο κριτήριο με το ship.sh
const isEp = (f, dir = ROOT) => /^[^/]+\.js$/.test(f) && !f.includes('_legacy') && fs.existsSync(path.join(dir, f)) && /^[^/\n]*require\('\.\/render\.js'\)\(/m.test(fs.readFileSync(path.join(dir, f), 'utf8'));
const argv = process.argv.slice(2), fresh = argv.includes('--fresh'), only = [], refs = [];
for (const a of argv.filter(a => a !== '--fresh')) { const f = a.endsWith('.js') ? a : a + '.js'; isEp(f) ? only.push(f) : refs.push(a); }
const base = refs[0] || 'HEAD', hash = sh(`git rev-parse --verify "${base}^{commit}"`).trim();

// ---------- δύο αντίγραφα: base (git archive, cache) + working tree (tracked + νέα αρχεία, χωρίς ignored) ----------
const link = dir => { for (const d of ['node_modules', 'fonts']) if (fs.existsSync(path.join(ROOT, d)) && !fs.existsSync(path.join(dir, d))) fs.symlinkSync(path.join(ROOT, d), path.join(dir, d)); };
fs.mkdirSync(TMP, { recursive: true });
const B = path.join(TMP, hash.slice(0, 12)), CUR = path.join(TMP, 'cur-' + process.pid);
if (fresh || !fs.existsSync(path.join(B, '.tree'))) {
  fs.rmSync(B, { recursive: true, force: true }); fs.mkdirSync(path.join(B, '.res'), { recursive: true });
  sh(`git archive ${hash} | tar -x -C "${B}"`); link(B); fs.writeFileSync(path.join(B, '.tree'), base);
}
fs.utimesSync(B, new Date(), new Date());
for (const [d] of fs.readdirSync(TMP).filter(d => !d.startsWith('cur-')).map(d => [d, fs.statSync(path.join(TMP, d)).mtimeMs]).sort((a, b) => b[1] - a[1]).slice(3)) fs.rmSync(path.join(TMP, d), { recursive: true, force: true }); // κρατάει 3 base caches
fs.rmSync(CUR, { recursive: true, force: true });
for (const f of sh('git ls-files -co --exclude-standard -z').split('\0').filter(Boolean)) {
  const src = path.join(ROOT, f); if (!fs.existsSync(src) || !fs.statSync(src).isFile()) continue;
  fs.mkdirSync(path.dirname(path.join(CUR, f)), { recursive: true }); fs.copyFileSync(src, path.join(CUR, f));
}
link(CUR);
const eps = [...new Set([...fs.readdirSync(B).filter(f => isEp(f, B)), ...fs.readdirSync(CUR).filter(f => isEp(f, CUR))])].filter(f => !only.length || only.includes(f)).sort();

// ---------- ένα επεισόδιο σε ένα tree: lint → sheet clean → sfx ----------
const run = (dir, args) => new Promise(res => {
  const p = spawn(process.execPath, args, { cwd: dir }); let out = '', err = '';
  const kill = setTimeout(() => p.kill('SIGKILL'), 180e3);
  p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
  p.on('close', code => { clearTimeout(kill); res({ code, out, err }); });
});
const errLine = r => (r.err.split('\n').find(s => /Error/.test(s)) || r.err.trim().split('\n')[0] || `exit ${r.code}`).trim().slice(0, 160);
function wavStat(f) {
  const b = fs.readFileSync(f), n = (b.length - 44) >> 1, s16 = new Int16Array(b.buffer.slice(b.byteOffset + 44, b.byteOffset + 44 + n * 2));
  let sq = 0, pk = 0; for (const v of s16) { sq += v * v; pk = Math.max(pk, Math.abs(v)); }
  const db = x => x > 0 ? +(20 * Math.log10(x / 32768)).toFixed(1) : -99;
  return { hash: crypto.createHash('sha1').update(b).digest('hex'), rms: db(Math.sqrt(sq / Math.max(1, n))), peak: db(pk), dur: +(n / 2 / 48000).toFixed(2) };
}
async function probe(dir, ep) {
  const r = { lint: null, crash: null, sheet: null, sfx: null };
  const l = await run(dir, [ep, 'lint']);
  if (!/lint( ✔|: \d+ warning)/.test(l.out)) { r.crash = errLine(l); return r; }
  r.lint = l.out.split('\n').slice(1).map(s => s.replace(/^\s*[\d.]+–[\d.]+s\s+/, '').trim()).filter(Boolean);
  const s = await run(dir, [ep, 'sheet', 'clean']), png = (s.out.match(/^(\S+_sheet\.png)$/m) || [])[1];
  if (png) r.sheet = path.join(dir, png); else r.crash = 'sheet: ' + errLine(s);
  const a = await run(dir, [ep, 'sfx']), nm = (a.out.match(/^(\S+?)_(?:sfx|mix)\.wav/m) || [])[1];
  if (nm && fs.existsSync(path.join(dir, nm + '_sfx.wav'))) { r.sfx = wavStat(path.join(dir, nm + '_sfx.wav')); for (const k of ['_sfx.wav', '_vo.wav', '_mix.wav']) fs.rmSync(path.join(dir, nm + k), { force: true }); }
  else r.crash = r.crash || 'sfx: ' + errLine(a);
  return r;
}

// ---------- σύγκριση frames (sheet 6×2) + εικόνα diff ----------
async function pixels(f) { const im = await loadImage(fs.readFileSync(f)), c = createCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; }
async function frames(bf, cf, ep) {
  const a = await pixels(bf), b = await pixels(cf); if (a.w !== b.w || a.h !== b.h) return 12;
  const tw = a.w / 6, th = a.h / 2, cnt = new Array(12).fill(0), diff = new Uint8Array(a.w * a.h);
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) { const i = (y * a.w + x) * 4; if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2]) { diff[y * a.w + x] = 1; cnt[Math.floor(y / th) * 6 + Math.floor(x / tw)]++; } }
  const n = cnt.filter(Boolean).length; if (!n) return 0;
  const c = createCanvas(a.w, a.h * 3), x = c.getContext('2d');
  x.drawImage(await loadImage(fs.readFileSync(bf)), 0, 0); x.drawImage(await loadImage(fs.readFileSync(cf)), 0, a.h);
  const im = x.createImageData(a.w, a.h);
  for (let p = 0; p < a.w * a.h; p++) { const i = p * 4, g = 175 + (b.d[i] + b.d[i + 1] + b.d[i + 2]) / 9; im.data[i] = diff[p] ? 255 : g; im.data[i + 1] = im.data[i + 2] = diff[p] ? 30 : g; im.data[i + 3] = 255; }
  x.putImageData(im, 0, a.h * 2); fs.mkdirSync(path.join(ROOT, 'regress'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'regress', ep.replace(/\.js$/, '.png')), c.toBuffer('image/png'));
  return n;
}

(async () => {
  const t0 = Date.now(), R = Object.fromEntries(eps.map(e => [e, {}])), jobs = [];
  for (const ep of eps) {
    fs.rmSync(path.join(ROOT, 'regress', ep.replace(/\.js$/, '.png')), { force: true });
    const cache = path.join(B, '.res', ep + '.json');
    if (fs.existsSync(path.join(B, ep))) jobs.push(async () => { R[ep].b = fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache)) : await probe(B, ep); fs.writeFileSync(cache, JSON.stringify(R[ep].b)); });
    if (fs.existsSync(path.join(CUR, ep))) jobs.push(async () => { R[ep].c = await probe(CUR, ep); });
  }
  let next = 0; await Promise.all(Array.from({ length: Math.min(os.cpus().length, jobs.length) }, async () => { while (next < jobs.length) await jobs[next++](); }));

  let fail = 0; const rows = [], notes = [], pad = Math.max(...eps.map(e => e.length - 3));
  for (const ep of eps) {
    const { b, c } = R[ep], name = ep.replace(/\.js$/, '');
    if (!c) { rows.push([name, 'αφαιρέθηκε', '', '']); continue; }
    if (c.crash && !(b && b.crash)) { fail = 1; notes.push(`✘ ${name}: crash — ${c.crash}`); }
    let lint;
    if (c.crash) lint = '✘ crash';
    else { const nw = c.lint.filter(m => !(b && b.lint || []).includes(m)), fx = (b && b.lint || []).filter(m => !c.lint.includes(m));
      lint = (c.lint.length ? String(c.lint.length) : '✔') + (nw.length ? ` ✘ +${nw.length} νέα` : c.lint.length && b ? ' (ίδια)' : '') + (fx.length ? ` −${fx.length} λύθηκαν` : '');
      if (nw.length) { fail = 1; for (const m of nw) notes.push(`✘ ${name}: νέο lint — ${m}`); } }
    if (!b) { rows.push([name, lint, 'νέο', 'νέο']); continue; }
    const fr = c.sheet && b.sheet ? await frames(b.sheet, c.sheet, ep) : null;
    if (fr) notes.push(`→ regress/${name}.png`);
    const au = !c.sfx || !b.sfx ? '—' : c.sfx.hash === b.sfx.hash ? '✔ ίδιο' : `Δ rms ${b.sfx.rms}→${c.sfx.rms} dB · peak ${b.sfx.peak}→${c.sfx.peak}` + (b.sfx.dur !== c.sfx.dur ? ` · ${b.sfx.dur}→${c.sfx.dur}s` : '');
    rows.push([name, lint, fr === null ? '—' : fr ? `Δ ${fr}/12` : '✔ ίδια', au]);
  }
  console.log(`regress: ${/^[0-9a-f]{40}$/.test(base) ? hash.slice(0, 7) : `${base} (${hash.slice(0, 7)})`} → working tree · ${eps.length} επεισόδια · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log(`${''.padEnd(pad)}  ${'lint'.padEnd(22)}${'frames'.padEnd(12)}SFX`);
  for (const [n, l, f, a] of rows) console.log(`${n.padEnd(pad)}  ${l.padEnd(22)}${f.padEnd(12)}${a}`);
  for (const n of notes) console.log(n);
  fs.rmSync(CUR, { recursive: true, force: true });
  process.exitCode = fail;
})();
