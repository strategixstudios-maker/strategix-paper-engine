// vo.js — VO «Stratos» από το ElevenLabs API με ΣΤΑΘΕΡΕΣ ρυθμίσεις (ίδια φωνή σε κάθε επεισόδιο · STYLE_GUIDE §5d)
// Ο connector του ElevenLabs δεν δέχεται stability / seed και το site θέλει χειροκίνητες ρυθμίσεις κάθε φορά → εδώ είναι κλειδωμένες.
// Key: export ELEVENLABS_API_KEY=… στο ~/.zshrc (ΠΟΤΕ στο git).
// CLI:  node vo.js <ep> [--takes 2] [--seed N]  → κείμενο από vo/<ep>.txt → <ep>_take<k>.mp3 στη ρίζα (εκτός git)
//       μετά: node render.js vo <ep>_take1.mp3 --gap 0.3 [--keep …] --out vo/<ep>_vo.mp3 --at 0.2 (βλ. §5d)
// Διάλογος («Το Εργαστήριο»): κάθε γραμμή `ΟΝΟΜΑ: κείμενο` (ΣΤΡΑΤΟΣ · ΦΟΙΒΟΣ · ΡΕΝΑ) → όλος ο διάλογος σε ΕΝΑ generation (text-to-dialogue)
//       + <ep>_take<k>.who.json = [[a, b, 'rena'], ...] (ποιος μιλάει πότε) → το `render.js vo --gap` το μεταφέρει στο vo/<ep>_vo.who.json → lipsync(VO, rest, who)
const fs = require('fs');

// ---------- ρυθμίσεις «Stratos» — ΜΗΝ αλλάζουν ανά επεισόδιο (αλλαγή = άλλη φωνή σε σχέση με τα προηγούμενα) ----------
const STRATOS = {
  voice: '4djcgN1Upzan46ZOCATJ',                   // Voice Design «Stratos»
  model: 'eleven_v3',
  // v3 stability: 0 = Creative (εκφραστικό, αλλάζει ανά generation) · 0.5 = Natural (πιο κοντά στην αρχική φωνή) · 1 = Robust (το πιο σταθερό, ακούει λιγότερο τα tags)
  settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1 },
  seed: 1000,                                      // take k → seed + k − 1 (ίδιο κείμενο + ίδιο seed ≈ ίδιο αποτέλεσμα)
  lang: 'el',
  format: 'mp3_44100_128',
};

async function tts(text, seed, key) {
  const body = { text, model_id: STRATOS.model, voice_settings: STRATOS.settings, seed, language_code: STRATOS.lang };
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${STRATOS.voice}?output_format=${STRATOS.format}`;
  const post = b => fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify(b) });
  let r = await post(body);
  if (r.status === 400 && /language/i.test(await r.clone().text())) { delete body.language_code; r = await post(body); } // αν το μοντέλο δεν δέχεται language_code
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return Buffer.from(await r.arrayBuffer());
}

// ---------- ομάδα (STYLE_GUIDE §4b) — voice design, ίδιο μοντέλο / stability / seed με τον STRATOS · ΜΗΝ αλλάζουν ανά επεισόδιο ----------
// key = όνομα του χαρακτήρα στον κώδικα (stratos() · phoebus() · rena()) → lipsync(VO, rest, key)
const CAST = {
  'ΣΤΡΑΤΟΣ': { key: 'stratos', voice: STRATOS.voice },
  'ΦΟΙΒΟΣ': { key: 'phoebus', voice: '48Mn5ho3B0CDODzikmfy' },  // Voice Design «Phoebus»: ~20, Αθηναίος, γρήγορος, σοβαροφανής «υπεύθυνος»
  'ΡΕΝΑ': { key: 'rena', voice: 'uyMSqzPImYXUvpPePfRo' },      // Voice Design «Rena»: ~30, Αθηναία, χαμηλή, deadpan
};
const castName = s => s.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().trim();
// `ΟΝΟΜΑ: κείμενο` ανά γραμμή → [[ΟΝΟΜΑ, κείμενο], ...] · συνεχόμενες γραμμές του ίδιου ενώνονται · null αν δεν είναι διάλογος
function parseDialogue(text) {
  const rows = text.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^([^\s:]+)\s*:\s*(.+)$/); return m && CAST[castName(m[1])] ? [castName(m[1]), m[2]] : [null, l]; });
  if (!rows.some(([n]) => n)) return null;
  const bad = rows.filter(([n]) => !n); if (bad.length) throw new Error(`vo: γραμμή χωρίς ομιλητή (${Object.keys(CAST).join(' · ')}): «${bad[0][1]}»`);
  const out = []; for (const [n, t] of rows) { const p = out[out.length - 1]; if (p && p[0] === n) p[1] += ' ' + t; else out.push([n, t]); }
  for (const [n] of out) if (!CAST[n].voice) throw new Error(`vo: λείπει voice_id για ${n} (CAST στο vo.js)`);
  return out;
}

// διάλογος σε ένα generation (eleven_v3 text-to-dialogue): { audio, who } · who = [[a, b, key], ...] ανά ατάκα (χρόνος αρχείου)
// ο διάλογος δέχεται μόνο stability (όχι similarity/style) · with-timestamps → voice_segments (ποιος μιλάει πότε)
async function dialogue(lines, seed, key) {
  const body = { inputs: lines.map(([n, text]) => ({ text, voice_id: CAST[n].voice })), model_id: STRATOS.model, settings: { stability: STRATOS.settings.stability }, seed, language_code: STRATOS.lang };
  const post = (b, ts) => fetch(`https://api.elevenlabs.io/v1/text-to-dialogue${ts ? '/with-timestamps' : ''}?output_format=${STRATOS.format}`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  let r = await post(body, true);
  if (r.status === 400 && /language/i.test(await r.clone().text())) { delete body.language_code; r = await post(body, true); }
  if (r.status === 404) { // χωρίς timestamps: μόνο ήχος, ο ομιλητής ανά φράση μπαίνει με το χέρι
    r = await post(body, false); if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
    console.log('  ⚠ χωρίς timestamps → δεν γράφεται .who.json'); return { audio: Buffer.from(await r.arrayBuffer()), who: null };
  }
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json(), byVoice = Object.fromEntries(Object.values(CAST).map(c => [c.voice, c.key]));
  const who = (j.voice_segments || []).map(s => [+s.start_time_seconds.toFixed(3), +s.end_time_seconds.toFixed(3), s.dialogue_input_index != null ? CAST[lines[s.dialogue_input_index][0]].key : byVoice[s.voice_id]]);
  return { audio: Buffer.from(j.audio_base64, 'base64'), who };
}

if (require.main === module) (async () => {
  const [ep, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (!ep) { console.log('usage: node vo.js <ep> [--takes 2] [--seed N]   (κείμενο: vo/<ep>.txt)'); process.exit(1); }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) { console.log('vo: λείπει το ELEVENLABS_API_KEY → export ELEVENLABS_API_KEY=… στο ~/.zshrc και νέο terminal'); process.exit(1); }
  const txtFile = `vo/${ep}.txt`; if (!fs.existsSync(txtFile)) { console.log(`vo: δεν υπάρχει το ${txtFile}`); process.exit(1); }
  const text = fs.readFileSync(txtFile, 'utf8').trim(), takes = Number(opt('takes') || 2), seed0 = Number(opt('seed') ?? STRATOS.seed), lines = parseDialogue(text);
  console.log(`vo: ${ep} · ${text.length} χαρακτήρες · ${STRATOS.model}${lines ? ` · διάλογος ${lines.length} ατάκες (${[...new Set(lines.map(l => l[0]))].join(' · ')})` : ''} · stability ${STRATOS.settings.stability} · seed ${seed0}${takes > 1 ? '…' + (seed0 + takes - 1) : ''}`);
  for (let k = 1; k <= takes; k++) {
    const out = `${ep}_take${k}.mp3`;
    if (!lines) fs.writeFileSync(out, await tts(text, seed0 + k - 1, key));
    else { const D = await dialogue(lines, seed0 + k - 1, key); fs.writeFileSync(out, D.audio); if (D.who) fs.writeFileSync(out.replace(/\.mp3$/, '.who.json'), JSON.stringify(D.who)); }
    console.log(`  take ${k} (seed ${seed0 + k - 1}) → ${out}${lines ? ' + .who.json' : ''}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { STRATOS, CAST, tts, dialogue, parseDialogue };
