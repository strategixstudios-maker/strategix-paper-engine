// music.js — μουσικό χαλί από το ElevenLabs Music API (Eleven Music, instrumental) στη διάρκεια του επεισοδίου (STYLE_GUIDE §5e)
// Εμπορική χρήση online (IG/TikTok/YouTube/FB) επιτρέπεται σε όλα τα paid πλάνα, χωρίς attribution (Eleven Music Model-Specific Terms, έλεγχος 2026-09-28).
// Key: export ELEVENLABS_API_KEY=… στο ~/.zshrc (ΠΟΤΕ στο git).
// CLI:  node music.js <ep> [--force] [--len s] [--out file]  → music/<ep>.mp3 (στο git, όπως τα vo/) → στο επεισόδιο: MUSIC_FILE: 'music/<ep>.mp3'
//       διάρκεια = `node <ep>.js info` + 1s (το render κάνει fade out στο τέλος του video) · ύφος = STYLE (κλειδωμένο) + διάθεση: music/<ep>.txt ή MOOD της σειράς
//       ένταση/ducking → render.js (MUSIC_RMS, MUSIC_GAIN) · αλλαγή διάρκειας > αρχείο → lint warning → ξανά `node music.js <ep> --force`
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

// ---------- ίδιο ύφος σε κάθε επεισόδιο (αλλαγή = άλλος ήχος brand) ----------
const STYLE = 'Instrumental background music for a short vertical social media video with paper cut-out stop-motion animation. ' +
  'Warm, light and friendly, small acoustic ensemble, steady tempo, no vocals, no big drops, builds or sudden stops: it sits quietly under a voiceover. Mood: ';
const MOOD = {  // ανά σειρά (prefix αρχείου) · music/<ep>.txt → υπερισχύει
  er: 'quirky comedic mockumentary office sitcom, pizzicato strings and light percussion, playful and deadpan.',
  ep: 'playful cartoon comedy, pizzicato strings, woodblock and light glockenspiel, cheeky and bouncy, deadpan pauses.',
  pf: 'calm, curious workshop craft process, soft lo-fi groove with gentle guitar and mallets.',
  ms: 'friendly upbeat learning moment, bright ukulele and claps, optimistic.',
  pm: 'before and after makeover, light anticipation that resolves into a satisfying warm reveal.',
  ad: 'confident upbeat commercial, clean and modern, positive energy.',
};
const MODEL = 'music_v2_5', FORMAT = 'mp3_44100_128';

const die = m => { console.error('✖ ' + m); process.exit(1); };

// επεισόδιο = <ep>.js ή <ep>_*.js στη ρίζα που καλεί το render (ίδιο κριτήριο με το regress.js)
function epFile(ep) {
  const hits = fs.readdirSync(__dirname).filter(f => (f === ep + '.js' || f.startsWith(ep + '_')) && f.endsWith('.js') && !f.includes('_legacy')
    && /^[^/\n]*require\('\.\/render\.js'\)\(/m.test(fs.readFileSync(path.join(__dirname, f), 'utf8')));
  if (hits.length !== 1) die(`${ep}: ${hits.length} αρχεία επεισοδίου (${hits.join(', ') || '—'})`);
  return hits[0];
}

async function main() {
  const [ep, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (!ep) die('node music.js <ep> [--force] [--len s] [--out file]');
  const key = process.env.ELEVENLABS_API_KEY; if (!key) die('λείπει το ELEVENLABS_API_KEY (~/.zshrc)');
  const out = opt('out') || `music/${ep}.mp3`;
  if (fs.existsSync(out) && !rest.includes('--force')) die(`${out} υπάρχει ήδη → --force για νέο κομμάτι`);
  const file = opt('len') ? null : epFile(ep);
  const total = file ? JSON.parse(execFileSync('node', [file, 'info'], { cwd: __dirname, encoding: 'utf8' }).trim().split('\n').pop()).total : +opt('len');
  const txt = `music/${ep}.txt`, mood = fs.existsSync(txt) ? fs.readFileSync(txt, 'utf8').trim() : MOOD[(ep.match(/^[a-z]+/) || [''])[0]] || MOOD.ms;
  const body = { prompt: STYLE + mood, music_length_ms: Math.max(3000, Math.ceil((total + 1) * 1000)), model_id: MODEL, force_instrumental: true };
  console.log(`${ep} · ${total.toFixed(2)}s video → ${(body.music_length_ms / 1000).toFixed(1)}s μουσική · ${MODEL}\nMood: ${mood}`);
  const r = await fetch(`https://api.elevenlabs.io/v1/music?output_format=${FORMAT}`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify(body) });
  if (!r.ok) die(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 400)}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  console.log(`✔ ${out} → στο επεισόδιο: MUSIC_FILE: '${out}'` + (file ? ` · render / \`node ${file} sfx\` (μόνο ήχος)` : ''));
}

main();
