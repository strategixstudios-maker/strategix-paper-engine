// next.js — «τι κάνω τώρα;»: βρίσκει σε ποια φάση είναι ένα επεισόδιο και λέει το επόμενο βήμα: εντολή, /clear (νέο session), /effort, τι να γράψει ο Αλέξανδρος.
// CLI:  node next.js [ep]      → κατάσταση + ▶ επόμενο (χωρίς ep: το επεισόδιο που άλλαξε τελευταίο)
// API:  require('./next.js').after(name, mode, ok) → το ίδιο μπλοκ στο τέλος των εργαλείων (render · check · lint · sfx · vo · new · wrap · publish) · NO_HINT=1 = σιωπή
// Φάσεις (CLAUDE.md): 1 σενάριο + VO · 2 κώδικας ως το 1ο render · 3 σημειώσεις → διόρθωση → «προχώρα» → wrap + commit + publish. Κάθε φάση = νέο session (/clear):
//   το context μένει μικρό (μέτρηση 2026-10-01: μετά το 1ο render ~337K tokens context σε κάθε βήμα = το μισό κόστος του επεισοδίου).
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ROOT = __dirname;
const isEp = f => /^[a-z]+\d+[\w]*\.js$/.test(f) && !f.includes('_legacy') && /^[^/\n]*require\('\.\/render\.js'\)\(/m.test(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const idOf = n => n.replace(/\.js$/, '').split('_')[0];
const mt = f => fs.existsSync(path.join(ROOT, f)) ? fs.statSync(path.join(ROOT, f)).mtimeMs : 0;
const git = (...a) => { const r = spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : ''; };

// ---------- κατάσταση ενός επεισοδίου ----------
function state(id) {
  const files = fs.readdirSync(ROOT), epFile = files.find(f => (f === id + '.js' || f.startsWith(id + '_')) && f.endsWith('.js') && isEp(f));
  const name = epFile ? epFile.replace(/\.js$/, '') : null, takes = files.filter(f => new RegExp(`^${id}_take\\d+\\.mp3$`).test(f));
  const mp4 = name && [`${name}.mp4`, `publish/scheduled/${name}.mp4`, `publish/posted/${name}.mp4`].find(f => fs.existsSync(path.join(ROOT, f)));
  const log = fs.existsSync(path.join(ROOT, 'publish/log.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'publish/log.json'), 'utf8')).posts : [];
  const post = log.find(p => p.ep === id || (name && p.file === name + '.mp4'));
  const dirty = name ? git('status', '--porcelain', '--', epFile, `${name}_timing_sheet.md`, `vo/${id}_vo.mp3`, `music/${id}.mp3`) : '';
  return {
    id, name, epFile, script: fs.existsSync(path.join(ROOT, `scripts/${id}.md`)), txt: fs.existsSync(path.join(ROOT, `vo/${id}.txt`)), takes,
    vo: fs.existsSync(path.join(ROOT, `vo/${id}_vo.mp3`)), music: fs.existsSync(path.join(ROOT, `music/${id}.mp3`)),
    mp4, fresh: !!(mp4 && mt(mp4) >= mt(epFile)), timing: !!(name && fs.existsSync(path.join(ROOT, `${name}_timing_sheet.md`))),
    tracked: !!(epFile && git('ls-files', epFile)), dirty: !!dirty, logged: !!(name && fs.readFileSync(path.join(ROOT, 'EPISODES.md'), 'utf8').includes(epFile)), post,
  };
}
const latest = () => { // το επεισόδιο που άλλαξε τελευταίο (αρχείο επεισοδίου · vo/<ep>.txt · scripts/<ep>.md)
  const c = [...fs.readdirSync(ROOT).filter(isEp).map(f => [idOf(f), mt(f)]),
    ...fs.readdirSync(path.join(ROOT, 'vo')).filter(f => /^[a-z]+\d+\.txt$/.test(f)).map(f => [f.replace('.txt', ''), mt('vo/' + f)]),
    ...(fs.existsSync(path.join(ROOT, 'scripts')) ? fs.readdirSync(path.join(ROOT, 'scripts')).filter(f => f.endsWith('.md')).map(f => [f.replace('.md', ''), mt('scripts/' + f)]) : [])];
  return c.sort((a, b) => b[1] - a[1])[0]?.[0];
};

// ---------- το μπλοκ «▶ Επόμενο» ----------
// clear: νέο session (/clear στο ίδιο terminal) · effort: /effort … · say: τι γράφει ο Αλέξανδρος μετά · run: εντολή που τρέχει ο Claude στο ίδιο session
function block(title, o) {
  const L = [`\n▶ ΕΠΟΜΕΝΟ — ${title}`];
  if (o.run) L.push(`  • ${o.run}`);
  let k = 1;
  if (o.clear) L.push(`  ${k++}. /clear   ← νέο session (μικρό context = φθηνότερο κάθε βήμα από εδώ)`);
  if (o.effort) L.push(`  ${k++}. /effort ${o.effort}`);
  if (o.say) L.push(`  ${k++}. Γράψε: ${o.say}`);
  if (o.note) L.push(`  (${o.note})`);
  L.push('  [Claude: μετέφερε αυτό το μπλοκ αυτούσιο στο τέλος της απάντησής σου]');
  return L.join('\n');
}
function advise(s) {
  const id = s.id, ep = s.name || id;
  if (!s.script && !s.txt && !s.epFile) return block(`${id}: φάση 1 · σενάριο`, { clear: true, effort: 'high', say: `«νέο επεισόδιο ${id}: <ιδέα / σενάριο>»`, note: 'σενάριο σε πίνακα → έγκριση → scripts/' + id + '.md + vo/' + id + '.txt · node publish.js status → τι είδος χρειάζεται' });
  if (!s.vo) {
    if (!s.txt) return block(`${id}: φάση 1 · κείμενο VO`, { run: `κείμενο → vo/${id}.txt (§5d) → node vo.js ${id}` });
    if (!s.takes.length) return block(`${id}: φάση 1 · VO`, { run: `node vo.js ${id}   (2 takes + αυτόματος έλεγχος Scribe)` });
    return block(`${id}: φάση 1 · διάλεξε take`, { say: `«take 1» ή «take 2» (άκου ${s.takes.join(', ')})`, note: `μετά ο Claude: node render.js vo ${id}_takeN.mp3 --gap 0.3 --out vo/${id}_vo.mp3 --at 0.2` });
  }
  if (!s.epFile) return block(`${id}: τέλος φάσης 1 → φάση 2 · κώδικας`, { run: `node new.js ${id}_<όνομα>   (σκελετός με VO, captions, σκηνές)`, clear: true, effort: 'high', say: `«${id}: κώδικας»` });
  if (s.post) return block(`${ep}: ${s.post.status === 'posted' ? 'δημοσιεύτηκε' : 'στο Postiz ' + (s.post.date || '').slice(0, 10)} ✔ → επόμενο επεισόδιο`, { clear: true, effort: 'high', say: '«νέο επεισόδιο: <ιδέα>»', note: 'node publish.js status → ποιο είδος χρειάζεται (κύκλος §9) · αλλαγή σε αυτό: «' + id + ': σημειώσεις: …» (πριν βγει: node publish.js cancel ' + id + ')' });
  if (!s.mp4 && s.tracked && !s.dirty && s.logged) return block(`${ep}: παλιό επεισόδιο (στο git, χωρίς MP4 εδώ) · μένει όπως παραδόθηκε`, { note: 'αλλαγή μόνο αν τη ζητήσεις: «' + id + ': σημειώσεις: …»' });
  if (!s.mp4) return block(`${ep}: φάση 2 · κώδικας ως το 1ο render`, { run: `${s.music ? '' : `node music.js ${id} · `}node ${ep}.js check → preview → node ${ep}.js render` });
  if (!s.fresh && (!s.tracked || s.dirty)) return block(`${ep}: ο κώδικας άλλαξε μετά το MP4`, { run: `node ${ep}.js check → node ${ep}.js render  (μόνο ήχος: node ${ep}.js sfx)` });
  if (!s.tracked || s.dirty || !s.timing || !s.logged) return block(`${ep}.mp4 έτοιμο → φάση 3 · σημειώσεις`, {
    clear: true, effort: 'medium', say: `«${id}: σημειώσεις: …» (ΟΛΕΣ σε ένα μήνυμα) ή «${id}: προχώρα» αν είναι εντάξει`,
    note: 'high αντί για medium μόνο αν οι σημειώσεις ζητάνε νέα σκηνή/κίνηση · στο «προχώρα»: node wrap.js ' + id + ' → commit + push → publish' });
  return block(`${ep}: έτοιμο, όχι στο Postiz`, { say: `«${id}: προχώρα» → node publish.js schedule ${id} publish/captions/${id}.json --insert`, effort: 'low' });
}

// ---------- στο τέλος των εργαλείων ----------
function after(name, mode, ok = true) {
  if (process.env.NO_HINT) return;
  const id = idOf(name), ep = name.includes('_') ? name : (state(id).name || name); let m;
  if (mode === 'render') m = block(`🎬 ${ep}.mp4 έτοιμο → δες το`, { clear: true, effort: 'medium', say: `«${id}: σημειώσεις: …» (ΟΛΕΣ σε ένα μήνυμα) ή «${id}: προχώρα»`, note: 'high μόνο αν οι σημειώσεις ζητάνε νέα σκηνή/κίνηση' });
  else if (mode === 'sfx') m = block(`🔊 ο ήχος μπήκε στο ${ep}.mp4 → άκουσέ το`, { say: `«${id}: σημειώσεις: …» ή «${id}: προχώρα»` });
  else if (mode === 'check' || mode === 'lint') m = ok ? block(`${ep}: lint ✔`, { run: `preview μόνο όπου άλλαξε κάτι → node ${ep}.js render` }) : block(`${ep}: lint ✘`, { run: 'διόρθωσε τα warnings πάνω → ξανά check' });
  else if (mode === 'vo') m = block(`${id}: takes έτοιμα (Scribe πάνω ↑)`, { say: '«take 1» ή «take 2»', note: `μετά ο Claude: node render.js vo ${id}_takeN.mp3 --gap 0.3 --out vo/${id}_vo.mp3 --at 0.2 → node new.js ${id}_<όνομα>` });
  else if (mode === 'vo-tight') m = block(`${id}: VO έτοιμο (vo/${id}_vo.mp3 + λέξεις)`, { run: `node new.js ${id}_<όνομα> → node music.js ${id}`, clear: true, effort: 'high', say: `«${id}: κώδικας»`, note: 'το /clear αφού γίνει το new.js (ο σκελετός κρατάει VO + σενάριο)' });
  else if (mode === 'new') m = block(`${ep}.js σκελετός έτοιμος`, { run: state(id).music ? '' : `node music.js ${id}`, clear: true, effort: 'high', say: `«${id}: κώδικας»`, note: 'αν είσαι ήδη στη φάση 2 (λίγο context), συνέχισε χωρίς /clear' });
  else if (mode === 'wrap') m = block(`${ep}: timing sheet + EPISODES`, { run: 'commit + push (Claude) → publish μόνο μετά το «προχώρα» για αυτό το MP4' });
  else if (mode === 'publish') m = block(`${id} στο Postiz ✔`, { clear: true, effort: 'high', say: '«νέο επεισόδιο: <ιδέα>»', note: 'node publish.js status → ποιο είδος χρειάζεται μετά' });
  if (m) console.log(m);
}

if (require.main === module) {
  const id = (process.argv[2] || latest() || '').replace(/\.js$/, '').split('_')[0];
  if (!id) { console.log(block('κανένα επεισόδιο σε εξέλιξη', { clear: true, effort: 'high', say: '«νέο επεισόδιο: <ιδέα>»' })); process.exit(0); }
  const s = state(id), y = b => b ? '✔' : '·';
  console.log(`${s.name || id}: σενάριο ${y(s.script)} · vo txt ${y(s.txt)} · takes ${s.takes.length || '·'} · VO ${y(s.vo)} · κώδικας ${y(s.epFile)} · μουσική ${y(s.music)} · MP4 ${s.mp4 ? (s.fresh ? '✔' : 'παλιό') : '·'}`
    + ` · timing ${y(s.timing)} · EPISODES ${y(s.logged)} · git ${s.tracked ? (s.dirty ? 'αλλαγές' : '✔') : '·'} · Postiz ${s.post ? s.post.status : '·'}`);
  console.log(advise(s));
}
module.exports = { state, advise, after, block };
