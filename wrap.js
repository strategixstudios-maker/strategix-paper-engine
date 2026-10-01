// wrap.js — κλείσιμο επεισοδίου (φάση 3, μετά το «προχώρα»): timing sheet από τα δεδομένα του επεισοδίου + σκελετός εγγραφής για το EPISODES.md
// CLI:  node wrap.js <ep> [--force]  → <name>_timing_sheet.md (αν δεν υπάρχει · --force = ξανά): ανά σκηνή χρόνος · VO (φράσεις με χρόνους) · captions · SFX
//       + στήλη «Εικόνα» με «…» → τη συμπληρώνει ο Claude με μία φράση ανά σκηνή (όχι ολόκληρο κείμενο από την αρχή)
//       + τυπώνει σκελετό εγγραφής για το EPISODES.md (3–6 γραμμές) · μετά: commit + push
// Θέλει το επεισόδιο να κάνει module.exports = require('./render.js')({...}) (σκελετός new.js · pf06 →).
const fs = require('fs'), path = require('path');
const id = ((a) => /^ad_/.test(a) ? a : a.split('_')[0])((process.argv[2] || '').replace(/\.js$/, ''));
if (!id) { console.log('usage: node wrap.js <ep> [--force]'); process.exit(1); }
const f = fs.readdirSync(__dirname).find(x => (x === id + '.js' || x.startsWith(id + '_')) && x.endsWith('.js') && /require\('\.\/render\.js'\)\(/.test(fs.readFileSync(path.join(__dirname, x), 'utf8')) && !x.includes('_legacy'));
if (!f) { console.log(`wrap: δεν βρέθηκε επεισόδιο ${id}`); process.exit(1); }
process.env.NO_HINT = '1';
const R = require(path.join(__dirname, f)); delete process.env.NO_HINT;
if (!R || !R.STARTS) { console.log(`wrap: το ${f} δεν κάνει module.exports = require('./render.js')({...}) → πρόσθεσέ το (μία λέξη) και ξανά`); process.exit(1); }
const L = require('./lib.js'), { ep, name, STARTS, CUES, CAPS, TOTAL } = R;
const c = x => x.toFixed(2).replace('.', ','), out = `${name}_timing_sheet.md`;
const words = ep.VO_FILE && fs.existsSync(ep.VO_FILE.replace(/\.\w+$/, '.words.json')) ? L.voText(ep.VO_FILE, ep.VO_AT || 0).words : [];
// φράσεις = ίδιες με το `node <ep>.js vo` (ένταση της φωνής, R.VO.phr) + οι λέξεις τους · «0,27 Έλα να δεις… (–2,60)»
const phr = (R.VO ? R.VO.phr : []).map(([a, b]) => ({ a, b, w: words.filter(([x, y]) => (x + y) / 2 >= a - 0.08 && (x + y) / 2 <= b + 0.08).map(w => w[2]) }));
const head = fs.readFileSync(path.join(__dirname, f), 'utf8').split('\n')[0].replace(/^\/\/\s*/, '');
const ends = [...STARTS.slice(1), TOTAL], loop = ep.LOOP ? STARTS.length - 1 : -1;
const rows = STARTS.map((a, i) => {
  if (i === loop) return null; const b = ends[i], inR = t => t >= a - 1e-6 && t < b - 1e-6;
  const vo = phr.filter(p => inR(p.a)).map(p => `${c(p.a)} ${p.w.join(' ')} (–${c(p.b)})`).join(' · ') || '—';
  const cap = (CAPS || []).filter(([t]) => inR(Math.max(0, t))).map(([t, s]) => `${t < 0 ? '0' : c(t)} «${s}»`).join(' · ') || '—';
  const sfx = CUES.filter(([t]) => inR(t)).map(([t, n, o = {}]) => `${c(t)} ${n}${o.note && !/duck/.test(o.note) ? ' (' + o.note.replace(/ · duck$/, '') + ')' : ''}`).join(' · ') || '—';
  return `| ${i ? i : 'Hook'} | ${c(a)}–${c(b)} | … | ${vo} | ${cap} | ${sfx} |`;
}).filter(Boolean);
const md = `# ${head} · ${TOTAL.toFixed(1).replace('.', ',')}s · 1080×1920 30fps
VO: \`${ep.VO_FILE || '—'}\` @ ${c(ep.VO_AT || 0)}s${fs.existsSync(`${name}.mp4`) ? '' : ''} · ${ep.MUSIC_FILE ? `μουσική \`${ep.MUSIC_FILE}\`` : 'χωρίς μουσική'} · SFX: ${CUES.length} cues (ducking default) → \`${name}_sfx.md\`
Loop: ${ep.LOOP === 'cut' ? 'seamless (`LOOP: \'cut\'`)' : ep.LOOP ? 'wipe → frame 0' : 'χωρίς'}${ep.TAG ? ` · ετικέτα «${ep.TAG}»` : ''} · πηγή: \`${f}\` (χρόνοι λέξεων από \`${(ep.VO_FILE || '').replace(/\.\w+$/, '.words.json')}\`)

| Σκηνή | Χρόνος | Εικόνα | VO | Caption | SFX |
|---|---|---|---|---|---|
${rows.join('\n')}
`;
if (fs.existsSync(out) && !process.argv.includes('--force')) console.log(`wrap: υπάρχει ήδη το ${out} (--force = ξανά από τα δεδομένα · χάνονται οι περιγραφές «Εικόνα»)`);
else { fs.writeFileSync(out, md); console.log(`✔ ${out}: ${rows.length} σκηνές · συμπλήρωσε τη στήλη «Εικόνα» (μία φράση ανά σκηνή)`); }
const logged = fs.readFileSync('EPISODES.md', 'utf8').includes(f);
console.log(logged ? `EPISODES.md: υπάρχει ήδη εγγραφή για ${f} → μία γραμμή «vN: …» αν άλλαξε κάτι` : `EPISODES.md → πρόσθεσε στο τέλος (3–6 γραμμές):
### <ΣΕΙΡΑ> — «<Τίτλος>» · v1 (${TOTAL.toFixed(1).replace('.', ',')}s) · \`${f}\`
<Hook / τι δείχνει> · CTA · <νέα props ή αλλαγές engine> · <ό,τι μάθαμε (αν θέλει engine → BACKLOG.md)>.
Timing sheet: \`${out}\`.`);
try { require('./next.js').after(name, 'wrap', true); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
