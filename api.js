// api.js — κατάλογος του engine: τι υπάρχει και πού, χωρίς να διαβάζεις ολόκληρα αρχεία.
// node api.js           → όλα: lib · stratos · props/* (μία γραμμή ανά όνομα) + SFX presets + επιλογές render.js
// node api.js <λέξη>    → ό,τι ταιριάζει σε όνομα / περιγραφή / αρχείο, με πλήρη περιγραφή + αρχείο:γραμμή (μετά: sed -n 'a,bp' αρχείο)
// node api.js --check   → κάθε export του props/ έχει περιγραφή (gate στο ship.sh όταν αλλάζουν props)
// Περιγραφή = σχόλιο στην ίδια γραμμή (// ...) ή τα σχόλια ακριβώς από πάνω. Γραμμή «// ---- τίτλος ----» = ενότητα.
const fs = require('fs'), path = require('path');
const ROOT = __dirname, PDIR = path.join(ROOT, 'props');
const MODS = ['lib.js', 'stratos.js', ...fs.readdirSync(PDIR).filter(f => f.endsWith('.js')).sort().map(f => 'props/' + f)];

function parens(s, i) { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')' && --d === 0) return s.slice(i + 1, j); } return ''; }
function entries(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n'), names = Object.keys(require(path.join(ROOT, rel)));
  const title = src[0].replace(/^\/\/\s*/, '').replace(/^[\w/.]+\s*[—-]\s*/, '');
  return { rel, title, list: names.flatMap(n => {
    const re = new RegExp(`^(?:function\\s+${n}\\s*\\(|(?:const|let|var)\\s+(?:.*[\\s,])?${n}\\s*=(?!=))`), i = src.findIndex(l => re.test(l));
    if (i < 0) return []; // re-export από άλλο module
    const line = src[i], fi = line.indexOf(`function ${n}`);
    let sig = n;
    if (fi === 0) sig = `${n}(${parens(line, line.indexOf('(', fi))})`;
    else { const rest = line.slice(line.search(new RegExp(`${n}\\s*=`))).replace(new RegExp(`^${n}\\s*=\\s*`), '');
      if (/^\((?!\s*\(\))/.test(rest) && /^\([^)]*\)\s*=>/.test(rest)) sig = `${n}(${parens(rest, 0)})`;
      else if (/^\w+\s*=>/.test(rest)) sig = `${n}(${rest.match(/^\w+/)[0]})`;
      else { const v = rest.match(/^('[^']*'|\[[^\]]{0,30}\]|-?[\d.]+)/); if (v) sig = `${n} = ${v[1]}`; } }
    let desc = (line.match(/\s\/\/\s?(.*)$/) || [])[1] || '', sec = '';
    if (!desc) { const up = []; for (let k = i - 1; k >= 0 && /^\s*\/\//.test(src[k]) && !/^\/\/\s*-{3,}/.test(src[k]); k--) up.unshift(src[k].replace(/^\s*\/\/\s?/, '')); desc = up.join(' '); }
    for (let k = i - 1; k >= 0; k--) { const m = src[k].match(/^\/\/\s*-{3,}\s*(.*?)\s*-{3,}/); if (m) { sec = m[1]; break; } }
    desc = desc.trim().replace(new RegExp(`^${n}(\\([^)]*\\))?\\s*(:|→|—)\\s*`), ''); // χωρίς «όνομα:» στην αρχή
    return [{ n, sig, desc, sec, line: i + 1, at: `${rel}:${i + 1}` }];
  }).sort((a, b) => a.line - b.line) };
}

const arg = process.argv[2], mods = MODS.map(entries);
if (arg === '--check') {
  const miss = mods.filter(m => m.rel.startsWith('props/')).flatMap(m => m.list.filter(e => !e.desc).map(e => e.at + ' ' + e.n));
  if (miss.length) { console.log('✘ props χωρίς περιγραφή (σχόλιο // στην ίδια γραμμή ή από πάνω):\n  ' + miss.join('\n  ')); process.exitCode = 1; }
  else console.log(`api ✔ ${mods.reduce((s, m) => s + m.list.length, 0)} ονόματα, όλα τα props με περιγραφή`);
  return;
}
if (arg) {
  const q = arg.toLowerCase(); let hits = 0;
  for (const m of mods) for (const e of m.list) if ([e.n, e.desc, e.sec, m.rel].some(s => s.toLowerCase().includes(q))) { hits++; console.log(`${e.sig}  ${e.at}${e.desc ? '\n  ' + e.desc : ''}`); }
  if (!hits) console.log(`api: τίποτα για «${arg}» (node api.js για όλο τον κατάλογο)`);
  return;
}
const cut = s => s.length > 110 ? s.slice(0, 108) + '…' : s;
for (const m of mods) {
  console.log(`\n${m.rel} — ${m.title}`); let sec = null;
  for (const e of m.list) { if (e.sec !== sec && (sec = e.sec) && !m.rel.startsWith('props/')) console.log(`  · ${sec}`); console.log(`  ${e.sig}${e.desc ? ' — ' + cut(e.desc) : ''}`); }
}
console.log(`\nsfx.js presets (STYLE_GUIDE §5c): ${Object.keys(require('./sfx.js').P).join(' · ')}`);
const rh = fs.readFileSync(path.join(ROOT, 'render.js'), 'utf8').split('\n'), end = rh.findIndex(l => !/^\/\//.test(l));
console.log('render.js:\n' + rh.slice(1, end).map(l => '  ' + l.replace(/^\/\/\s?/, '')).join('\n'));
