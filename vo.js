// vo.js — VO «Stratos» από το ElevenLabs API με ΣΤΑΘΕΡΕΣ ρυθμίσεις (ίδια φωνή σε κάθε επεισόδιο · STYLE_GUIDE §5d)
// Ο connector του ElevenLabs δεν δέχεται stability / seed και το site θέλει χειροκίνητες ρυθμίσεις κάθε φορά → εδώ είναι κλειδωμένες.
// Key: export ELEVENLABS_API_KEY=… στο ~/.zshrc (ΠΟΤΕ στο git).
// CLI:  node vo.js <ep> [--takes 2] [--seed N] [--tempo 1.12]  → κείμενο από vo/<ep>.txt → <ep>_take<k>.mp3 (μονόλογος: ήδη σε STRATOS.tempo) + .words.json (χρόνοι λέξεων) στη ρίζα (εκτός git)
//       μετά: node render.js vo <ep>_take1.mp3 --gap 0.3 [--keep …] --out vo/<ep>_vo.mp3 --at 0.2 (βλ. §5d)
// Διάλογος («Το Εργαστήριο»): κάθε γραμμή `ΟΝΟΜΑ: κείμενο` (ΣΤΡΑΤΟΣ · ΦΟΙΒΟΣ · ΡΕΝΑ) → default (er02): TTS ανά ομιλητή = όλες οι ατάκες του σε ΕΝΑ generation
//       (η φωνή όπως στο voice test — το text-to-dialogue του er01 δεν έμοιαζε με τις επιλεγμένες) → κόψιμο ανά ατάκα (timestamps) → σειρά σεναρίου με παύση --turn 0.3
//       · --each = κάθε ατάκα σε δικό της generation (αν η φωνή «θυμάται» κείμενο ανάμεσα στις ατάκες, er02) · --dialogue = όλος ο διάλογος σε ένα text-to-dialogue (er01) · guest ενός επεισοδίου: `ΒΑΣΙΛΗΣ: @vo/<ep>_vasilis1.mp3` = έτοιμο κλιπ (π.χ. τσιρίγματα
//       καρτούν από ElevenLabs SFX) στην ίδια ένταση με τις φωνές, key = λατινικά του ονόματος ('vasilis')
//       + <ep>_take<k>.who.json = [[a, b, 'rena'], ...] (ποιος μιλάει πότε) → το `render.js vo --gap` το μεταφέρει στο vo/<ep>_vo.who.json → lipsync(VO, rest, who)
// Έλεγχος (§5d): κάθε take μεταγράφεται αυτόματα (Scribe) και συγκρίνεται με το κείμενο → ⚠ λέξεις που περισσεύουν / λείπουν (το eleven_v3 προσθέτει λέξεις, er02)
//       · node vo.js <ep> --check [take.mp3 …] = μόνο ο έλεγχος σε υπάρχοντα takes · --no-check = χωρίς · requests με retry σε 429/5xx
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
// fetch με retry (429 / 5xx / δίκτυο): 3 προσπάθειες, αναμονή 2s → 6s
async function fetchRetry(url, opt) {
  for (let k = 0; ; k++) {
    try { const r = await fetch(url, opt); if ((r.status === 429 || r.status >= 500) && k < 2) { await new Promise(z => setTimeout(z, 2000 * (2 * k + 1))); continue; } return r; }
    catch (e) { if (k >= 2) throw e; await new Promise(z => setTimeout(z, 2000 * (2 * k + 1))); }
  }
}

// ---------- ρυθμίσεις «Stratos» — ΜΗΝ αλλάζουν ανά επεισόδιο (αλλαγή = άλλη φωνή σε σχέση με τα προηγούμενα) ----------
const STRATOS = {
  voice: '4djcgN1Upzan46ZOCATJ',                   // Voice Design «Stratos»
  model: 'eleven_v3',
  // v3 stability: 0 = Creative (εκφραστικό, αλλάζει ανά generation) · 0.5 = Natural (πιο κοντά στην αρχική φωνή) · 1 = Robust (το πιο σταθερό, ακούει λιγότερο τα tags)
  settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1 },
  seed: 1000,                                      // take k → seed + k − 1 (ίδιο κείμενο + ίδιο seed ≈ ίδιο αποτέλεσμα)
  lang: 'el',
  format: 'mp3_44100_128',
  tempo: 1.12,                                     // μονόλογος: atempo στα takes (ad_xeimonas 1.08 → pf06 1.12, «λίγο πιο γρήγορα» · ίδιος τόνος φωνής) → ο Αλέξανδρος ακούει την τελική ταχύτητα · --tempo 1 = όπως βγαίνει από το API
};

async function tts(text, seed, key, voice = STRATOS.voice) {
  const body = { text, model_id: STRATOS.model, voice_settings: STRATOS.settings, seed, language_code: STRATOS.lang };
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=${STRATOS.format}`;
  const post = b => fetchRetry(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify(b) });
  let r = await post(body);
  if (r.status === 400 && /language/i.test(await r.clone().text())) { delete body.language_code; r = await post(body); } // αν το μοντέλο δεν δέχεται language_code
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return Buffer.from(await r.arrayBuffer());
}
// μονόλογος (ms02 →): ίδιο TTS μέσω with-timestamps → { audio, words: [[a, b, λέξη], ...] } (χωρίς τα audio tags) → <ep>_take<k>.words.json
// το `render.js vo` τα μεταφέρει στο --cut/--gap και τυπώνει το κείμενο κάθε φράσης (χρονισμοί λέξεων χωρίς εικασίες · δεν χρειάζεται forced alignment)
async function ttsWords(text, seed, key, voice = STRATOS.voice) {
  const body = { text, model_id: STRATOS.model, voice_settings: STRATOS.settings, seed, language_code: STRATOS.lang };
  const post = b => fetchRetry(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=${STRATOS.format}`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  let r = await post(body);
  if (r.status === 400 && /language/i.test(await r.clone().text())) { delete body.language_code; r = await post(body); }
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json(), al = j.alignment || j.normalized_alignment, ch = al.characters, A = al.character_start_times_seconds, B = al.character_end_times_seconds, words = [];
  let w = '', a = 0;
  for (let i = 0; i <= ch.length; i++) {
    if (i === ch.length || /\s/.test(ch[i])) { if (w && !/^\[.*\]$/.test(w)) words.push([+a.toFixed(3), +B[i - 1].toFixed(3), w]); w = ''; continue; }
    if (!w) a = A[i]; w += ch[i];
  }
  return { audio: Buffer.from(j.audio_base64, 'base64'), words };
}

// ---------- ομάδα (STYLE_GUIDE §4b) — voice design, ίδιο μοντέλο / stability / seed με τον STRATOS · ΜΗΝ αλλάζουν ανά επεισόδιο ----------
// key = όνομα του χαρακτήρα στον κώδικα (stratos() · phoebus() · rena()) → lipsync(VO, rest, key)
const CAST = {
  'ΣΤΡΑΤΟΣ': { key: 'stratos', voice: STRATOS.voice },
  'ΦΟΙΒΟΣ': { key: 'phoebus', voice: '48Mn5ho3B0CDODzikmfy' },  // Voice Design «Phoebus»: ~20, Αθηναίος, γρήγορος, σοβαροφανής «υπεύθυνος»
  'ΡΕΝΑ': { key: 'rena', voice: 'VKm16zQTtl8iH09WCHsB' },      // Voice Design «Rena» v2 (er02, 2026-09-27): Αθηναία ~25, ζωηρή, φυσικός ρυθμός τηλεφώνου (remix) · η παλιά uyMSqzPImYXUvpPePfRo μόνο στο er01
};
const castName = s => s.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().trim();
const isClip = t => t.trim().startsWith('@');                                   // guest: έτοιμο κλιπ αντί για TTS
const LAT = { Α: 'a', Β: 'v', Γ: 'g', Δ: 'd', Ε: 'e', Ζ: 'z', Η: 'i', Θ: 'th', Ι: 'i', Κ: 'k', Λ: 'l', Μ: 'm', Ν: 'n', Ξ: 'x', Ο: 'o', Π: 'p', Ρ: 'r', Σ: 's', Τ: 't', Υ: 'y', Φ: 'f', Χ: 'ch', Ψ: 'ps', Ω: 'o' };
const keyOf = n => CAST[n] ? CAST[n].key : [...n].map(c => LAT[c] ?? c.toLowerCase()).join('');
// `ΟΝΟΜΑ: κείμενο` ανά γραμμή → [[ΟΝΟΜΑ, κείμενο], ...] · συνεχόμενες γραμμές του ίδιου ενώνονται · null αν δεν είναι διάλογος
function parseDialogue(text) {
  const rows = text.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^([^\s:]+)\s*:\s*(.+)$/); return m && (CAST[castName(m[1])] || isClip(m[2])) ? [castName(m[1]), m[2].trim()] : [null, l]; });
  if (!rows.some(([n]) => n)) return null;
  const bad = rows.filter(([n]) => !n); if (bad.length) throw new Error(`vo: γραμμή χωρίς ομιλητή (${Object.keys(CAST).join(' · ')} ή guest με @αρχείο): «${bad[0][1]}»`);
  const out = []; for (const [n, t] of rows) { const p = out[out.length - 1]; if (p && p[0] === n && !isClip(t) && !isClip(p[1])) p[1] += ' ' + t; else out.push([n, t]); }
  for (const [n, t] of out) if (isClip(t) ? !fs.existsSync(t.slice(1).trim()) : !CAST[n].voice) throw new Error(isClip(t) ? `vo: δεν υπάρχει το ${t.slice(1).trim()}` : `vo: λείπει voice_id για ${n} (CAST στο vo.js)`);
  return out;
}

// ---------- διάλογος με TTS ανά ομιλητή (default από er02) ----------
const SR = 44100;
function decode(src) { // mp3 (Buffer ή αρχείο) → mono Float32 @ SR
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', Buffer.isBuffer(src) ? 'pipe:0' : src, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { input: Buffer.isBuffer(src) ? src : undefined, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`vo: ffmpeg decode: ${r.stderr}`);
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
}
// atempo στο ίδιο αρχείο (ίδιος τόνος, μόνο ταχύτητα)
function atempo(file, k) {
  const tmp = file.replace(/\.mp3$/, '.tmp.mp3'), r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-af', `atempo=${k}`, '-c:a', 'libmp3lame', '-b:a', '192k', tmp]);
  if (r.status !== 0) throw new Error(`vo: atempo ${file}: ${r.stderr}`); fs.renameSync(tmp, file);
}

function encode(pcm, out) {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', out], { input: Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength) });
  if (r.status !== 0) throw new Error(`vo: δεν γράφεται το ${out}: ${r.stderr}`);
}
const win = (x, f) => { const h = Math.round(0.01 * SR), e = []; for (let i = 0; i + h <= x.length; i += h) { let s = 0; for (let j = 0; j < h; j++) s += x[i + j] ** 2; e.push(s / h); } return f(e, h); };
// σιωπή στις άκρες έξω (παράθυρα 10ms κάτω από −30 dB του peak) + pad
const trim = (x, pad = 0.04) => win(x, (e, h) => { const m = Math.max(...e), on = e.map(v => v > m * 1e-3); const a = on.indexOf(true), b = on.lastIndexOf(true) + 1, p = Math.round(pad * SR); return x.subarray(Math.max(0, a * h - p), Math.min(x.length, b * h + p)); });
const loud = x => win(x, e => { const m = Math.max(...e), act = e.filter(v => v > m * 0.01); return Math.sqrt(act.reduce((a, v) => a + v, 0) / act.length); }); // RMS όσων μιλάνε

// το κέντρο της μεγαλύτερης σιωπής (παράθυρα 10ms κάτω από −35 dB του peak) στο [a, b] s · αν δεν υπάρχει, το πιο ήσυχο σημείο
function quiet(x, a, b) {
  return win(x, (e, h) => {
    const m = Math.max(...e), i0 = Math.max(0, Math.floor(a * SR / h)), i1 = Math.min(e.length, Math.ceil(b * SR / h));
    let best = [-1, 0], run = 0, lo = i0;
    for (let i = i0; i < i1; i++) { if (e[i] < m * 3e-4) { run++; if (run > best[1]) best = [i - run + 1, run]; } else run = 0; if (e[i] < e[lo]) lo = i; }
    return (best[0] >= 0 ? best[0] + best[1] / 2 : lo + 0.5) * h / SR;
  });
}
async function ttsDialogue(lines, seed, key, turn = 0.3, raw, each = false) {
  const seg = new Array(lines.length), inTag = t => { let d = 0; return [...t].map(c => (c === '[' ? ++d : c === ']' ? d-- : d) > 0); };
  for (const n of [...new Set(lines.map(l => l[0]))].filter(n => CAST[n])) {
    const idx = lines.flatMap(([m, t], i) => m === n && !isClip(t) ? [i] : []), text = idx.map(i => lines[i][1]).join('\n');
    if (each) { // --each: κάθε ατάκα σε δικό της generation (er02: η φωνή «θυμόταν» το κείμενο του voice design ανάμεσα σε δύο ατάκες)
      for (const i of idx) seg[i] = trim(decode(await tts(lines[i][1], seed, key, CAST[n].voice)));
      if (raw) { const G = new Float32Array(Math.round(0.3 * SR)); encode(Float32Array.from(idx.flatMap(i => [...seg[i], ...G])), raw.replace('%', keyOf(n))); }
      console.log(`    ${n}: ${idx.length} ατάκες, μία-μία (--each)`); continue;
    }
    const body = { text, model_id: STRATOS.model, voice_settings: STRATOS.settings, seed, language_code: STRATOS.lang };
    const post = b => fetchRetry(`https://api.elevenlabs.io/v1/text-to-speech/${CAST[n].voice}/with-timestamps?output_format=${STRATOS.format}`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    let r = await post(body);
    if (r.status === 400 && /language/i.test(await r.clone().text())) { delete body.language_code; r = await post(body); }
    if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json(), al = j.alignment, x = decode(Buffer.from(j.audio_base64, 'base64'));
    if (al.characters.join('') !== text) throw new Error(`vo: timestamps ≠ κείμενο για ${n} (δεν κόβεται ανά ατάκα)`);
    // όρια ατάκων: στη μέση ανάμεσα στο τέλος της μίας και την αρχή της επόμενης (χωρίς audio tags)
    const tag = inTag(text), wd = k => /[\p{L}\p{N}]/u.test(text[k]) && !tag[k], spans = []; let a = 0;
    for (const i of idx) { const b = a + lines[i][1].length; let f = a, l = b - 1; while (f < b && !wd(f)) f++; while (l > a && !wd(l)) l--; spans.push([al.character_start_times_seconds[f], al.character_end_times_seconds[l]]); a = b + 1; }
    // όριο = η μεγαλύτερη σιωπή του ήχου γύρω από το κενό των timestamps (er02: τα timestamps του v3 πέφτουν νωρίτερα → η ουρά μιας ατάκας περνούσε στην επόμενη)
    const cuts = spans.slice(1).map((s, k) => quiet(x, spans[k][1] - 0.12, s[0] + 0.5));
    idx.forEach((i, k) => { seg[i] = trim(x.subarray(k ? Math.round(cuts[k - 1] * SR) : 0, k < cuts.length ? Math.round(cuts[k] * SR) : x.length)); });
    if (raw) encode(x, raw.replace('%', keyOf(n)));                               // raw του ομιλητή (έλεγχος)
    console.log(`    ${n}: ${idx.length} ατάκες σε ένα generation (${(x.length / SR).toFixed(2)}s)`);
  }
  const voice = seg.filter(Boolean).map(loud), ref = voice.reduce((a, v) => a + v, 0) / voice.length;
  lines.forEach(([, t], i) => { if (isClip(t)) { const c = trim(decode(t.slice(1).trim())), g = ref / loud(c); seg[i] = c.map(v => v * g); } });
  const G = Math.round(turn * SR), N = seg.reduce((a, s) => a + s.length, 0) + G * (seg.length - 1), out = new Float32Array(N), who = []; let p = 0;
  lines.forEach(([n], i) => { out.set(seg[i], p); who.push([+(p / SR).toFixed(3), +((p + seg[i].length) / SR).toFixed(3), keyOf(n)]); p += seg[i].length + G; });
  let m = 0; for (const v of out) m = Math.max(m, Math.abs(v)); if (m > 0.98) out.forEach((v, i) => { out[i] = v * 0.98 / m; });
  return { pcm: out, who };
}

// διάλογος σε ένα generation (eleven_v3 text-to-dialogue): { audio, who } · who = [[a, b, key], ...] ανά ατάκα (χρόνος αρχείου)
// ο διάλογος δέχεται μόνο stability (όχι similarity/style) · with-timestamps → voice_segments (ποιος μιλάει πότε)
async function dialogue(lines, seed, key) {
  const body = { inputs: lines.map(([n, text]) => ({ text, voice_id: CAST[n].voice })), model_id: STRATOS.model, settings: { stability: STRATOS.settings.stability }, seed, language_code: STRATOS.lang };
  const post = (b, ts) => fetchRetry(`https://api.elevenlabs.io/v1/text-to-dialogue${ts ? '/with-timestamps' : ''}?output_format=${STRATOS.format}`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
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

// ---------- έλεγχος με μεταγραφή (Scribe · ElevenLabs speech-to-text) ----------
// θέλει το permission «Speech to Text» στο API key (elevenlabs.io → Developers → API keys → Edit) · χωρίς αυτό → ⚠ και ο έλεγχος γίνεται με τον connector όπως πριν
async function transcribe(file, key) {
  const fd = new FormData(); fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'el'); fd.append('tag_audio_events', 'false');
  fd.append('file', new Blob([fs.readFileSync(file)], { type: 'audio/mpeg' }), path.basename(file));
  const r = await fetchRetry('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: fd, signal: AbortSignal.timeout(300e3) });
  if (r.status === 401 || r.status === 403) return { denied: (await r.text()).slice(0, 160) };
  if (!r.ok) throw new Error(`Scribe ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json(); return { text: j.text, words: (j.words || []).filter(w => w.type === 'word').map(w => [w.start, w.end, w.text]) };
}
// σύγκριση κειμένου ↔ μεταγραφής: λέξεις χωρίς τόνους/στίξη, ελληνικά ≈ λατινικά («laptop» = «λάπτοπ»), 1 γράμμα διαφορά σε λέξεις ≥ 5 → ίδια · LCS
const GRL = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'i', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' };
const nw = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const lat = s => [...nw(s)].map(c => GRL[c] ?? c).join('').replace(/[^a-z0-9]/g, '').replace(/(.)\1+/g, '$1').replace(/[eiy]/g, 'i').replace(/[ou]/g, 'o');
function lev(a, b) { if (Math.abs(a.length - b.length) > 2) return 9; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
const same = (a, b) => { const x = lat(a), y = lat(b); return x === y || (Math.max(x.length, y.length) >= 5 && lev(x, y) <= (x.length >= 9 ? 2 : 1)); };
function wordDiff(text, heard) {
  const A = text.replace(/\[[^\]]*\]/g, ' ').replace(/^[^\s:]+\s*:\s*@\S+\s*$/gm, ' ').replace(/^[^\s:]+\s*:/gm, ' ').split(/\s+/).filter(w => nw(w)), B = heard;
  const n = A.length, m = B.length, D = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) D[i][j] = same(A[i], B[j][2]) ? D[i + 1][j + 1] + 1 : Math.max(D[i + 1][j], D[i][j + 1]);
  const extra = [], miss = []; let i = 0, j = 0;
  const push = (L, x) => { const p = L[L.length - 1]; if (p && p.k === x.k - 1) { p.w.push(x.w); p.k = x.k; } else L.push({ ...x, w: [x.w] }); };
  while (i < n || j < m) {
    if (i < n && j < m && same(A[i], B[j][2])) { i++; j++; }
    else if (j < m && (i >= n || D[i][j + 1] >= D[i + 1][j])) { push(extra, { k: j, t: B[j][0], w: B[j][2] }); j++; }
    else { push(miss, { k: i, t: j < m ? B[j][0] : null, w: A[i] }); i++; }
  }
  return { extra, miss, n, m };
}
async function checkTake(file, text, key) {
  const T = await transcribe(file, key);
  if (T.denied) { console.log(`  ⚠ Scribe: το API key δεν έχει «Speech to Text» → elevenlabs.io → Developers → API keys → Edit → Speech to Text: Access · ως τότε: έλεγχος με τον connector`); return null; }
  const d = wordDiff(text, T.words), at = t => t != null ? ' @' + t.toFixed(1).replace('.', ',') + 's' : '';
  // ίδιο σημείο: λέξη του κειμένου που ακούστηκε αλλιώς (Scribe ή προφορά) → «κείμενο → ακούστηκε» · μόνο + = λέξεις που ΠΡΟΣΘΕΣΕ η φωνή (ο κίνδυνος του v3)
  const sub = [], extra = d.extra.filter(e => { const m = d.miss.find(x => !x.used && x.t != null && Math.abs(x.t - e.t) < 1.5 && x.w.length <= 3 && e.w.length <= 3); if (!m) return true; m.used = 1; sub.push(`«${m.w.join(' ')}» → «${e.w.join(' ')}»${at(e.t)}`); return false; });
  const miss = d.miss.filter(x => !x.used);
  if (!extra.length && !miss.length && !sub.length) console.log(`  Scribe ✔ ${path.basename(file)}: ${d.m} λέξεις, όλες του κειμένου, καμία έξτρα`);
  else console.log(`  ${extra.length || miss.length ? '⚠' : '≈'} Scribe ${path.basename(file)}: ` + [...extra.map(r => `+«${r.w.join(' ')}»${at(r.t)}`), ...miss.map(r => `−«${r.w.join(' ')}»${at(r.t)}`), ...sub].join(' · ')
    + `\n    (+ = ακούγεται αλλά δεν υπάρχει στο κείμενο → άκου εκεί · − = λείπει · «α» → «β» = ακούστηκε αλλιώς, συνήθως λάθος της μεταγραφής ή ξένη λέξη · χρόνος = στο take)`);
  fs.writeFileSync(file.replace(/\.mp3$/, '.scribe.json'), JSON.stringify({ text: T.text, extra: d.extra, miss: d.miss }));
  return d;
}

if (require.main === module) (async () => {
  const [ep, ...rest] = process.argv.slice(2), opt = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : rest[i + 1]; };
  if (!ep) { console.log('usage: node vo.js <ep> [--takes 2] [--seed N] [--tempo 1.12] [--turn 0.3] [--each | --dialogue]   (κείμενο: vo/<ep>.txt)'); process.exit(1); }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) { console.log('vo: λείπει το ELEVENLABS_API_KEY → export ELEVENLABS_API_KEY=… στο ~/.zshrc και νέο terminal'); process.exit(1); }
  const txtFile = `vo/${ep}.txt`; if (!fs.existsSync(txtFile)) { console.log(`vo: δεν υπάρχει το ${txtFile}`); process.exit(1); }
  const text = fs.readFileSync(txtFile, 'utf8').trim(), takes = Number(opt('takes') || 2), seed0 = Number(opt('seed') ?? STRATOS.seed), lines = parseDialogue(text);
  if (rest.includes('--check')) { // μόνο έλεγχος σε υπάρχοντα takes
    const files = rest.filter(a => a.endsWith('.mp3')); if (!files.length) for (let k = 1; fs.existsSync(`${ep}_take${k}.mp3`); k++) files.push(`${ep}_take${k}.mp3`);
    for (const f of files) await checkTake(f, text, key); return;
  }
  console.log(`vo: ${ep} · ${text.length} χαρακτήρες · ${STRATOS.model}${lines ? ` · διάλογος ${lines.length} ατάκες (${[...new Set(lines.map(l => l[0]))].join(' · ')})` : ''} · stability ${STRATOS.settings.stability} · seed ${seed0}${takes > 1 ? '…' + (seed0 + takes - 1) : ''}`);
  for (let k = 1; k <= takes; k++) {
    const out = `${ep}_take${k}.mp3`;
    if (!lines) { const T = await ttsWords(text, seed0 + k - 1, key), tp = Number(opt('tempo') ?? STRATOS.tempo); fs.writeFileSync(out, T.audio); if (tp !== 1) atempo(out, tp); fs.writeFileSync(out.replace(/\.mp3$/, '.words.json'), JSON.stringify(T.words.map(([a, b, w]) => [+(a / tp).toFixed(3), +(b / tp).toFixed(3), w]))); }
    else if (rest.includes('--dialogue')) { const D = await dialogue(lines, seed0 + k - 1, key); fs.writeFileSync(out, D.audio); if (D.who) fs.writeFileSync(out.replace(/\.mp3$/, '.who.json'), JSON.stringify(D.who)); }
    else { const D = await ttsDialogue(lines, seed0 + k - 1, key, Number(opt('turn') ?? 0.3), out.replace(/\.mp3$/, '.%.raw.mp3'), rest.includes('--each')); encode(D.pcm, out); fs.writeFileSync(out.replace(/\.mp3$/, '.who.json'), JSON.stringify(D.who)); }
    console.log(`  take ${k} (seed ${seed0 + k - 1}) → ${out}${lines ? ' + .who.json' : ' + .words.json'}`);
    if (!rest.includes('--no-check')) { // διάλογος: κάθε φωνή χωριστά στο raw της (τα κλιπ guest / τσιρίγματα ο Scribe τα «διαβάζει» ως λέξεις)
      const jobs = lines && !rest.includes('--dialogue') ? [...new Set(lines.map(l => l[0]))].filter(n => CAST[n]).map(n => [out.replace(/\.mp3$/, `.${keyOf(n)}.raw.mp3`), lines.filter(l => l[0] === n && !isClip(l[1])).map(l => l[1]).join('\n')]) : [[out, text]];
      for (const [f, tx] of jobs) if (fs.existsSync(f)) await checkTake(f, tx, key).catch(e => console.log(`  ⚠ Scribe: ${e.message}`));
    }
  }
  try { require('./next.js').after(ep, 'vo', true); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
})().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { STRATOS, CAST, tts, ttsWords, dialogue, ttsDialogue, parseDialogue, transcribe, wordDiff, checkTake };
