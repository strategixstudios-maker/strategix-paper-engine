// vo.js — VO «Stratos» από το ElevenLabs API με ΣΤΑΘΕΡΕΣ ρυθμίσεις (ίδια φωνή σε κάθε επεισόδιο · STYLE_GUIDE §5d)
// Ο connector του ElevenLabs δεν δέχεται stability / seed και το site θέλει χειροκίνητες ρυθμίσεις κάθε φορά → εδώ είναι κλειδωμένες.
// Key: export ELEVENLABS_API_KEY=… στο ~/.zshrc (ΠΟΤΕ στο git).
// CLI:  node vo.js <ep> [--takes 2] [--seed N]  → κείμενο από vo/<ep>.txt → <ep>_take<k>.mp3 στη ρίζα (εκτός git)
//       μετά: node render.js vo <ep>_take1.mp3 --gap 0.3 [--keep …] --out vo/<ep>_vo.mp3 --at 0.2 (βλ. §5d)
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

if (require.main === module) (async () => {
  const [ep, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (!ep) { console.log('usage: node vo.js <ep> [--takes 2] [--seed N]   (κείμενο: vo/<ep>.txt)'); process.exit(1); }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) { console.log('vo: λείπει το ELEVENLABS_API_KEY → export ELEVENLABS_API_KEY=… στο ~/.zshrc και νέο terminal'); process.exit(1); }
  const txtFile = `vo/${ep}.txt`; if (!fs.existsSync(txtFile)) { console.log(`vo: δεν υπάρχει το ${txtFile}`); process.exit(1); }
  const text = fs.readFileSync(txtFile, 'utf8').trim(), takes = Number(opt('takes') || 2), seed0 = Number(opt('seed') ?? STRATOS.seed);
  console.log(`vo: ${ep} · ${text.length} χαρακτήρες · ${STRATOS.model} · stability ${STRATOS.settings.stability} · seed ${seed0}${takes > 1 ? '…' + (seed0 + takes - 1) : ''}`);
  for (let k = 1; k <= takes; k++) {
    const out = `${ep}_take${k}.mp3`; fs.writeFileSync(out, await tts(text, seed0 + k - 1, key));
    console.log(`  take ${k} (seed ${seed0 + k - 1}) → ${out}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { STRATOS, tts };
