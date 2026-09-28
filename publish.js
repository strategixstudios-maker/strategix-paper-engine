// publish.js — δημοσίευση μέσω Postiz (hosted) σε Instagram · TikTok · Facebook · YouTube: ένα βίντεο κάθε 3 μέρες, 19:00 ώρα Ελλάδας (STYLE_GUIDE §9)
// ΠΟΤΕ schedule χωρίς το «προχώρα» του Αλέξανδρου για το συγκεκριμένο βίντεο (CLAUDE.md βήμα 6). Login: `postiz auth:login` (credentials στο ~/.postiz, εκτός git).
// Φάκελοι (MP4 εκτός git): ρίζα = σε έλεγχο · publish/scheduled/ = στο Postiz με ημερομηνία · publish/posted/ = live. Log: publish/log.json (στο git, Postiz IDs → analytics).
// CLI:  node publish.js [status]                        → sync + ουρά + επόμενο slot
//       node publish.js next                            → επόμενο slot: τελευταίο post (Postiz + log) + 3 μέρες στις 19:00 · αν έχει περάσει → το νωρίτερο 19:00 ≥ 2 ώρες από τώρα
//       node publish.js schedule <ep> <caption.json> [--at ISO] [--dry]  → upload + post στα 4 κανάλια + MP4 → publish/scheduled/ + log (--dry: μόνο εμφάνιση)
//       node publish.js sync                            → ό,τι βγήκε live → publish/posted/ (+ URLs στο log) · σφάλματα πλατφόρμας → αναφορά
//       node publish.js cancel <ep>                     → σβήνει τα posts από το Postiz (μόνο αν δεν έχουν βγει), MP4 πίσω στη ρίζα
//       node publish.js manual <ep> [ISO]               → post που έγινε εκτός Postiz (με το χέρι): μετράει για το επόμενο slot, MP4 → publish/posted/
//       node publish.js skip <αρχείο.mp4>               → δεν δημοσιεύεται ποτέ (demo κ.λπ.)
// Κύκλος περιεχομένου (§9): Μάθηση → Πώς φτιάχνεται → Γέλιο → Πριν/Μετά → Πώληση · ποτέ ίδιο είδος στη σειρά · Πώληση το πολύ 1 στα 5 → warning στο schedule.
//       schedule … --insert → νέο επεισόδιο στην πρώτη θέση της ουράς που ταιριάζει στον κύκλο· όσα έρχονται μετά μετακινούνται +3 μέρες (σβήνονται και ξαναμπαίνουν στο Postiz)
// caption.json: { "text": "λεζάντα + hashtags (IG · TikTok · FB)", "title": "τίτλος YouTube (≤100)", "youtube"?: "περιγραφή YT", "instagram"?|"tiktok"?|"facebook"?: override,
//                 "tags"?: [...] (YouTube · default = τα hashtags του text) }
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');

const ROOT = __dirname, DIR = path.join(ROOT, 'publish'), LOG = path.join(DIR, 'log.json');
const SLOT = { every: 3, hour: 19, tz: 'Europe/Athens', lead: 2 };  // κάθε 3 μέρες · 19:00 · τουλάχιστον 2 ώρες από τώρα (upload/επεξεργασία στις πλατφόρμες)
// κανάλια = providerIdentifier του Postiz (τα IDs έρχονται από το `integrations:list`, ώστε μια επανασύνδεση να μη σπάει τίποτα) · key = πεδίο override στο caption.json
const CH = { instagram: 'instagram', 'tiktok-business': 'tiktok', facebook: 'facebook', youtube: 'youtube' };
// ρυθμίσεις ανά πλατφόρμα (από `postiz integrations:settings <id>` · ό,τι δεν ισχύει το Postiz το πετάει σιωπηλά → έλεγχος εκεί αν αλλάξει κάτι)
const SETTINGS = {
  instagram: () => ({ post_type: 'post', is_trial_reel: false }),   // βίντεο post = Reel
  'tiktok-business': () => ({ content_posting_method: 'DIRECT_POST', // UPLOAD = μόνο draft στο inbox του TikTok, δεν δημοσιεύει
    privacy_level: 'PUBLIC_TO_EVERYONE', duet: true, stitch: true, comment: true, autoAddMusic: 'no',
    brand_content_toggle: false, brand_organic_toggle: true,        // «Your brand»: διαφημίζει τη δική μας επιχείρηση (κανόνας TikTok)
    video_made_with_ai: false }),                                     // animation = κώδικας (όχι AI) · αλλαγή μόνο αν το ζητήσει ο Αλέξανδρος
  facebook: () => ({ post_type: 'post' }),
  youtube: c => ({ title: c.title, type: 'public', selfDeclaredMadeForKids: 'no',
    tags: (c.tags || hashtags(c.text)).map(t => ({ value: t, label: t })) }),
};

// είδος ανά σειρά (prefix αρχείου) · ep = «Ο πελάτης είπε...» (κωμικό)
const KIND = { ms: 'Μάθηση', pf: 'Πώς φτιάχνεται', er: 'Γέλιο', ep: 'Γέλιο', pm: 'Πριν/Μετά', ad: 'Πώληση' };
const CYCLE = ['Μάθηση', 'Πώς φτιάχνεται', 'Γέλιο', 'Πριν/Μετά', 'Πώληση'], SALE = 'Πώληση', SALE_EVERY = 5;
const kind = ep => KIND[(ep.match(/^[a-z]+/) || [''])[0]] || '?';
// προβλήματα κύκλου για τη θέση i μιας σειράς ειδών (ίδιο είδος δίπλα · δύο Πωλήσεις σε λιγότερες από 5 θέσεις)
function cycleIssues(seq, i) {
  const k = seq[i], out = [];
  if (seq[i - 1] === k || seq[i + 1] === k) out.push(`ίδιο είδος (${k}) δίπλα`);
  if (k === SALE && seq.some((x, j) => j !== i && x === SALE && Math.abs(j - i) < SALE_EVERY)) out.push(`2 Πωλήσεις σε λιγότερα από ${SALE_EVERY} posts`);
  return out;
}

const die = m => { console.error('✖ ' + m); process.exit(1); };
const hashtags = s => [...(s || '').matchAll(/#([\p{L}\p{N}_]+)/gu)].map(m => m[1]);
const load = () => fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : { posts: [] };
const byDate = ps => ps.filter(p => p.date).sort((a, b) => a.date.localeCompare(b.date));
const save = log => { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(LOG, JSON.stringify(log, null, 2) + '\n'); };
const move = (f, from, to) => { fs.mkdirSync(to, { recursive: true }); fs.renameSync(path.join(from, f), path.join(to, f)); };

// postiz CLI → JSON (το output έχει μια γραμμή «✅ …» πριν από το JSON)
function pz(...args) {
  const r = spawnSync('postiz', args, { encoding: 'utf8', maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.error) die(`postiz: ${r.error.message} (npm i -g postiz)`);
  if (r.status !== 0 || /❌|Error:/.test(out)) die(`postiz ${args[0]}: ${out.trim().slice(0, 500)}`);
  const i = out.search(/^[[{]/m);
  return i < 0 ? out.trim() : JSON.parse(out.slice(i));
}

// ---------- ώρα Ελλάδας (DST μέσω Intl) ----------
const day = t => new Intl.DateTimeFormat('en-CA', { timeZone: SLOT.tz }).format(t);   // 'YYYY-MM-DD' σε ώρα Ελλάδας
const offH = t => +new Intl.DateTimeFormat('en-US', { timeZone: SLOT.tz, timeZoneName: 'shortOffset' })
  .formatToParts(t).find(p => p.type === 'timeZoneName').value.replace('GMT', '') || 0;
const addDays = (d, n) => { const [y, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd + n)).toISOString().slice(0, 10); };
const slotAt = d => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd, SLOT.hour) - offH(Date.UTC(y, m - 1, dd, 12)) * 3600e3; };
const fmt = t => new Date(t).toLocaleString('el-GR', { timeZone: SLOT.tz, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const iso = t => new Date(t).toISOString();

function postizPosts(from, to) {
  return (pz('posts:list', '--startDate', iso(from), '--endDate', iso(to)).posts || []);
}

function nextSlot(log) {
  const now = Date.now(), dates = log.posts.filter(p => p.date).map(p => +new Date(p.date));
  // posts στο Postiz (και όσα μπήκαν από το site με το χέρι) · DRAFT/ERROR δεν βγαίνουν → δεν μετράνε
  for (const p of postizPosts(now - 60 * 864e5, now + 365 * 864e5)) if (!/DRAFT|ERROR/.test(p.state)) dates.push(+new Date(p.publishDate));
  const last = dates.length ? Math.max(...dates) : 0, earliest = now + SLOT.lead * 3600e3;
  let t = last ? slotAt(addDays(day(last), SLOT.every)) : 0;
  if (t < earliest) { t = slotAt(day(now)); if (t < earliest) t = slotAt(addDays(day(now), 1)); }
  return { t, last };
}

function integrations() {
  const ids = {};
  for (const i of pz('integrations:list')) if (!i.disabled && CH[i.identifier]) ids[i.identifier] = i.id;
  const miss = Object.keys(CH).filter(k => !ids[k]);
  if (miss.length) die(`κανάλια χωρίς σύνδεση στο Postiz: ${miss.join(', ')} (postiz integrations:list)`);
  return ids;
}

const capText = (cap, k) => (k === 'youtube' ? cap.youtube : cap[CH[k]]) || cap.text;
// ένα post σε όλα τα κανάλια (ίδιο uploaded media) → { κανάλι: postId }
function createPosts(cap, media, t, ids) {
  const body = { type: 'schedule', date: iso(t), shortLink: false, tags: [],
    posts: Object.keys(CH).map(k => ({ integration: { id: ids[k] }, value: [{ content: capText(cap, k), image: [media] }], settings: { __type: k, ...SETTINGS[k](cap) } })) };
  const tmp = path.join(os.tmpdir(), `publish_${process.pid}.json`);
  fs.writeFileSync(tmp, JSON.stringify(body));
  const res = pz('posts:create', '--json', tmp), byInt = Object.fromEntries(Object.entries(ids).map(([k, id]) => [id, k]));
  return Object.fromEntries(res.map(r => [byInt[r.integration], r.postId]));
}

// --insert: πρώτη θέση στην ουρά (scheduled, από τη 2η ώρα και μετά) όπου το νέο είδος δεν σπάει τον κύκλο → { j, t, shift: [entries που μετακινούνται] }
function insertPlan(log, ep) {
  const now = Date.now() + SLOT.lead * 3600e3, all = byDate(log.posts), queue = all.filter(p => p.status === 'scheduled' && +new Date(p.date) > now);
  for (let q = 0; q <= queue.length; q++) {
    const at = q < queue.length ? all.indexOf(queue[q]) : all.length, seq = all.map(p => kind(p.ep));
    seq.splice(at, 0, kind(ep));
    if (!cycleIssues(seq, at).length) return q < queue.length ? { t: +new Date(queue[q].date), shift: queue.slice(q) } : null;
  }
  return null; // καμία θέση μέσα στην ουρά → στο τέλος (κανονικό slot)
}

function schedule(ep, capFile, at, dry, insert) {
  if (!ep || !capFile) die('node publish.js schedule <ep> <caption.json> [--at ISO] [--dry]');
  const log = load(), old = log.posts.find(p => p.ep === ep);
  if (old) die(`${ep}: υπάρχει ήδη στο log (${old.status}${old.date ? ', ' + fmt(old.date) : ''}) → cancel πρώτα αν είναι νέα έκδοση`);
  const files = fs.readdirSync(ROOT).filter(f => (f === ep + '.mp4' || f.startsWith(ep + '_')) && f.endsWith('.mp4'));
  if (files.length !== 1) die(`${ep}: ${files.length} MP4 στη ρίζα (${files.join(', ') || '—'}) · χρειάζεται ακριβώς 1`);
  const file = files[0], cap = JSON.parse(fs.readFileSync(capFile, 'utf8'));
  const text = k => capText(cap, k);
  if (!cap.text) die('caption.json: λείπει το "text"');
  if (!cap.title || cap.title.length < 2 || cap.title.length > 100) die('caption.json: "title" (YouTube) 2–100 χαρακτήρες');
  for (const k of ['instagram', 'tiktok-business']) if (text(k).length > 2200) die(`${k}: λεζάντα > 2200 χαρακτήρες`);
  const plan = insert && !at ? insertPlan(log, ep) : null;
  const t = at ? +new Date(at) : plan ? plan.t : nextSlot(log).t;
  if (!(t > Date.now())) die(`ημερομηνία στο παρελθόν: ${at}`);
  const seq = byDate([...log.posts, { ep, date: iso(t) }]), i = seq.findIndex(p => p.ep === ep && !p.status);
  const issues = plan ? [] : cycleIssues(seq.map(p => kind(p.ep)), i);

  console.log(`${ep} (${kind(ep)}) · ${file} → ${fmt(t)} (ώρα Ελλάδας) · ${Object.keys(CH).join(' · ')}`);
  if (plan) console.log(`--insert: μπαίνει πριν από ${plan.shift.map(e => e.ep).join(', ')} → αυτά +${SLOT.every} μέρες`);
  if (issues.length) console.log(`⚠ κύκλος: ${issues.join(' · ')} (§9) → --insert ή άλλη σειρά`);
  for (const k of Object.keys(CH)) console.log(`\n[${k}]${k === 'youtube' ? ' «' + cap.title + '»' : ''}\n${text(k)}`);
  if (dry) return console.log('\n(--dry: τίποτα δεν ανέβηκε)');

  const ids = integrations();
  if (plan) { // από το τέλος προς τα πίσω: κάθε post της ουράς +3 μέρες (νέα posts με το ίδιο media, μετά σβήσιμο των παλιών)
    sync(log);
    for (const e of [...plan.shift].reverse()) {
      if (Object.values(e.state || {}).some(s => s !== 'QUEUE')) die(`${e.ep}: δεν είναι πια σε αναμονή (${JSON.stringify(e.state)}) → χωρίς --insert`);
      const nt = slotAt(addDays(day(+new Date(e.date)), SLOT.every)), old = Object.values(e.postiz);
      e.postiz = createPosts(e.caption, e.media, nt, ids); e.date = iso(nt); delete e.state;
      for (const id of old) pz('posts:delete', id);
      save(log); console.log(`  ${e.ep} → ${fmt(nt)}`);
    }
  }
  const up = pz('upload', path.join(ROOT, file));
  if (!up.path) die(`upload: ${JSON.stringify(up)}`);
  const media = { id: up.id, path: up.path }, postiz = createPosts(cap, media, t, ids);
  move(file, ROOT, path.join(DIR, 'scheduled'));
  log.posts.push({ ep, file, status: 'scheduled', date: iso(t), caption: cap, media, postiz });
  save(log);
  console.log(`\n✔ scheduled ${fmt(t)} · ${Object.keys(postiz).length} posts · MP4 → publish/scheduled/`);
}

// live → publish/posted/ · επιστρέφει τις γραμμές αναφοράς
function sync(log) {
  const pend = log.posts.filter(p => p.status === 'scheduled'), notes = [];
  if (!pend.length) return notes;
  const ds = pend.map(p => +new Date(p.date)), byId = new Map(postizPosts(Math.min(...ds) - 864e5, Math.max(...ds) + 864e5).map(p => [p.id, p]));
  for (const e of pend) {
    e.state = {};
    for (const [k, id] of Object.entries(e.postiz)) {
      const p = byId.get(id); e.state[k] = p ? p.state : 'MISSING';
      if (p && p.releaseURL) (e.urls = e.urls || {})[k] = p.releaseURL;
    }
    const st = Object.values(e.state), bad = Object.entries(e.state).filter(([, s]) => /ERROR|MISSING/.test(s));
    if (bad.length) notes.push(`⚠ ${e.ep}: ${bad.map(([k, s]) => `${k} ${s}`).join(' · ')} → έλεγχος στο postiz.com`);
    if (!st.includes('QUEUE') && st.includes('PUBLISHED')) {
      e.status = 'posted';
      if (fs.existsSync(path.join(DIR, 'scheduled', e.file))) move(e.file, path.join(DIR, 'scheduled'), path.join(DIR, 'posted'));
      notes.push(`✔ ${e.ep} live (${fmt(e.date)}) → publish/posted/`);
    }
  }
  save(log);
  return notes;
}

function status() {
  const log = load(), notes = sync(log), { t, last } = nextSlot(log);
  notes.forEach(n => console.log(n));
  for (const s of ['scheduled', 'posted']) {
    const ps = log.posts.filter(p => p.status === s).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    console.log(`\n${s} (${ps.length})`);
    for (const p of ps) console.log(`  ${p.ep.padEnd(9)} ${kind(p.ep).padEnd(15)} ${p.date ? fmt(p.date) : '— χωρίς ημερομηνία'}${p.manual ? ' · με το χέρι' : ''}${p.state ? ' · ' + Object.entries(p.state).map(([k, v]) => `${k} ${v}`).join(' ') : ''}`);
  }
  const wait = fs.readdirSync(ROOT).filter(f => f.endsWith('.mp4') && !log.posts.some(p => p.file === f) && !(log.skip || []).includes(f));
  console.log(`\nστη ρίζα, χωρίς δημοσίευση (${wait.length}): ${wait.join(' · ') || '—'}`);
  const seq = byDate(log.posts).map(p => kind(p.ep)), lastK = seq[seq.length - 1], sales = seq.slice(-(SALE_EVERY - 1)).includes(SALE);
  const want = lastK ? CYCLE[(CYCLE.indexOf(lastK) + 1) % CYCLE.length] : CYCLE[0];
  console.log(`\nεπόμενο slot: ${fmt(t)}${last ? ` (τελευταίο post ${fmt(last)})` : ''}`);
  console.log(`κύκλος: τελευταίο ${lastK || '—'} → επόμενο ιδανικά ${want === SALE && sales ? CYCLE[0] : want}${sales ? ' · Πώληση όχι πριν περάσουν 5' : ''}`);
}

function cancel(ep) {
  const log = load(), e = log.posts.find(p => p.ep === ep && p.status === 'scheduled');
  if (!e) die(`${ep}: δεν υπάρχει scheduled post στο log`);
  sync(log);
  if (e.status !== 'scheduled' || Object.values(e.state).some(s => s === 'PUBLISHED')) die(`${ep}: έχει ήδη βγει σε κάποιο κανάλι (${JSON.stringify(e.state)}) → διαγραφή από την ίδια την πλατφόρμα`);
  for (const id of Object.values(e.postiz)) pz('posts:delete', id);
  const src = path.join(DIR, 'scheduled', e.file);
  if (fs.existsSync(src)) {
    if (fs.existsSync(path.join(ROOT, e.file))) { fs.unlinkSync(src); console.log(`(νέο render ${e.file} στη ρίζα → το παλιό αντίγραφο σβήστηκε)`); }
    else move(e.file, path.join(DIR, 'scheduled'), ROOT);
  }
  log.posts = log.posts.filter(p => p !== e);
  save(log);
  console.log(`✔ ${ep}: ${Object.keys(e.postiz).length} posts σβήστηκαν από το Postiz · MP4 στη ρίζα`);
}

function skip(f) {
  if (!f) die('node publish.js skip <αρχείο.mp4>');
  const log = load(); log.skip = [...new Set([...(log.skip || []), f.endsWith('.mp4') ? f : f + '.mp4'])]; save(log);
  console.log(`✔ ${f}: δεν δημοσιεύεται`);
}

function manual(ep, at) {
  if (!ep) die('node publish.js manual <ep> [ISO]');
  const log = load();
  if (log.posts.some(p => p.ep === ep)) die(`${ep}: υπάρχει ήδη στο log`);
  const file = fs.readdirSync(ROOT).find(f => (f === ep + '.mp4' || f.startsWith(ep + '_')) && f.endsWith('.mp4'));
  if (file) move(file, ROOT, path.join(DIR, 'posted'));
  log.posts.push({ ep, file: file || null, status: 'posted', date: at ? iso(+new Date(at)) : null, manual: true });
  save(log);
  console.log(`✔ ${ep}: posted (με το χέρι${at ? ', ' + fmt(at) : ', χωρίς ημερομηνία → δεν μετράει για το slot'})${file ? ' · MP4 → publish/posted/' : ''}`);
}

if (require.main === module) {
  const [cmd = 'status', ...a] = process.argv.slice(2), opt = k => { const i = a.indexOf('--' + k); return i < 0 ? undefined : a[i + 1]; };
  const pos = a.filter((x, i) => !x.startsWith('--') && !(i && a[i - 1] === '--at'));
  if (cmd === 'status') status();
  else if (cmd === 'next') { const { t, last } = nextSlot(load()); console.log(`${fmt(t)}  ${iso(t)}${last ? `  (τελευταίο ${fmt(last)})` : ''}`); }
  else if (cmd === 'schedule') schedule(pos[0], pos[1], opt('at'), a.includes('--dry'), a.includes('--insert'));
  else if (cmd === 'sync') { const log = load(); const n = sync(log); console.log(n.join('\n') || 'τίποτα νέο'); }
  else if (cmd === 'cancel') cancel(pos[0]);
  else if (cmd === 'manual') manual(pos[0], pos[1]);
  else if (cmd === 'skip') skip(pos[0]);
  else die(`άγνωστη εντολή: ${cmd} (status · next · schedule · sync · cancel · manual · skip)`);
}
