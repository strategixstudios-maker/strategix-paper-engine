// publish.js — δημοσίευση μέσω Postiz (hosted) σε Instagram · TikTok · Facebook · YouTube: ένα βίντεο κάθε 3 μέρες, 19:00 ώρα Ελλάδας (STYLE_GUIDE §9)
// ΠΟΤΕ schedule χωρίς το «προχώρα» του Αλέξανδρου για το συγκεκριμένο βίντεο (CLAUDE.md βήμα 6). Login: `postiz auth:login` (credentials στο ~/.postiz, εκτός git).
// Φάκελοι (MP4 εκτός git): ρίζα = σε έλεγχο · publish/scheduled/ = στο Postiz με ημερομηνία · publish/posted/ = live. Log: publish/log.json (στο git, Postiz IDs → analytics).
// CLI:  node publish.js [status]                        → sync + ουρά + επόμενο slot
//       node publish.js next                            → επόμενο slot: τελευταίο post (Postiz + log) + 3 μέρες στις 19:00 · αν έχει περάσει → το νωρίτερο 19:00 ≥ 2 ώρες από τώρα
//       node publish.js schedule <ep> <caption.json> [--at ISO] [--dry]  → upload + post στα 4 κανάλια στο επόμενο ελεύθερο slot (τέλος ουράς) + MP4 → publish/scheduled/ + log (--dry: μόνο εμφάνιση)
//       node publish.js schedule <ep> <caption.json> --date YYYY-MM-DD   → μόνο όταν ο Αλέξανδρος ορίσει ημερομηνία: μπαίνει εκείνη τη μέρα 19:00, όσα είναι από εκεί και μετά +3 μέρες
//       node publish.js move <ep> YYYY-MM-DD [--dry]   → ήδη scheduled επεισόδιο σε ημερομηνία του Αλέξανδρου: το κενό του κλείνει (όσα ήταν μετά −3), όσα είναι από τη νέα μέρα και μετά +3
//       node publish.js sync                            → ό,τι βγήκε live → publish/posted/ (+ URLs στο log) · σφάλματα πλατφόρμας → αναφορά
//       node publish.js cancel <ep>                     → σβήνει τα posts από το Postiz (μόνο αν δεν έχουν βγει), MP4 πίσω στη ρίζα
//       node publish.js manual <ep> [ISO]               → post που έγινε εκτός Postiz (με το χέρι): μετράει για το επόμενο slot, MP4 → publish/posted/
//       node publish.js skip <αρχείο.mp4>               → δεν δημοσιεύεται ποτέ (demo κ.λπ.)
//       node publish.js batch [--dry]                   → schedule με τη σειρά του publish/plan.txt όσα δεν είναι ακόμα στο log (λεζάντα: publish/captions/<ep>.json)
// CAROUSEL (ka01 →): κάρτες <ep>_01.jpg … στη ρίζα (χωρίς MP4) → το ίδιο `schedule` τις ανεβάζει ως IG carousel · FB πολλές φωτογραφίες · TikTok photo (όχι YouTube)
//       στη δική τους ουρά ΑΝΑΜΕΣΑ στα reels: μέρα reel + 1, 19:00, μετά το τελευταίο carousel · τα reels δεν μετακινούνται ποτέ για carousel (ούτε το αντίστροφο) · move / --date / cancel όπως στα reels
// ΣΕΙΡΑ (Αλέξανδρος, 2026-10-01): ό,τι ετοιμάζεται μπαίνει στο τέλος της ουράς · καμία αναδιάταξη ανά είδος (ο κύκλος §9 καταργήθηκε) · μετακίνηση ΜΟΝΟ με --date / move όταν το ζητήσει ο ίδιος.
// caption.json: { "text": "λεζάντα + hashtags (IG · TikTok · FB)", "title": "τίτλος YouTube (≤100)", "youtube"?: "περιγραφή YT", "instagram"?|"tiktok"?|"facebook"?: override,
//                 "tags"?: [...] (YouTube · default = τα hashtags του text) }
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');

const ROOT = __dirname, DIR = path.join(ROOT, 'publish'), LOG = path.join(DIR, 'log.json');
const SLOT = { every: 3, hour: 19, tz: 'Europe/Athens', lead: 2 };  // κάθε 3 μέρες · 19:00 · τουλάχιστον 2 ώρες από τώρα (upload/επεξεργασία στις πλατφόρμες)
// κανάλια = providerIdentifier του Postiz (τα IDs έρχονται από το `integrations:list`, ώστε μια επανασύνδεση να μη σπάει τίποτα) · key = πεδίο override στο caption.json
const CH = { instagram: 'instagram', 'tiktok-business': 'tiktok', facebook: 'facebook', youtube: 'youtube' };
// ρυθμίσεις ανά πλατφόρμα (από `postiz integrations:settings <id>` · ό,τι δεν ισχύει το Postiz το πετάει σιωπηλά → έλεγχος εκεί αν αλλάξει κάτι)
const SETTINGS = {
  instagram: () => ({ post_type: 'post',                              // βίντεο post = Reel
    is_trial_reel: true, graduation_strategy: 'SS_PERFORMANCE' }),    // trial: πρώτα σε μη-followers, το IG το βγάζει στο feed μόνο αν πάει καλά (~72h) · Αλέξανδρος 2026-10-02
  'tiktok-business': () => ({ content_posting_method: 'DIRECT_POST', // UPLOAD = μόνο draft στο inbox του TikTok, δεν δημοσιεύει
    privacy_level: 'PUBLIC_TO_EVERYONE', duet: true, stitch: true, comment: true, autoAddMusic: 'no',
    brand_content_toggle: false, brand_organic_toggle: false,       // χωρίς δήλωση commercial content: οργανικά βίντεο από το δικό μας account (Αλέξανδρος, 2026-09-29)
    video_made_with_ai: false }),                                     // animation = κώδικας (όχι AI) · αλλαγή μόνο αν το ζητήσει ο Αλέξανδρος
  facebook: () => ({ post_type: 'post' }),
  youtube: c => ({ title: c.title, type: 'public', selfDeclaredMadeForKids: 'no',
    tags: (c.tags || hashtags(c.text)).map(t => ({ value: t, label: t })) }),
};

// carousel (Αλέξανδρος 2026-10-03: «μια βίντεο, μια ποστ καρουζέλ»): κανάλια + ρυθμίσεις για εικόνες · YouTube δεν δέχεται εικόνες
const CAR_CH = ['instagram', 'tiktok-business', 'facebook'];
const CAR_SETTINGS = {
  instagram: () => ({ post_type: 'post' }),                          // πολλές εικόνες = carousel · trial μόνο στα reels
  'tiktok-business': c => ({ content_posting_method: 'DIRECT_POST', title: c.title, privacy_level: 'PUBLIC_TO_EVERYONE', comment: true,
    autoAddMusic: 'no',                                                // σιωπηλό (Αλέξανδρος 2026-10-05: με 'yes' το TikTok διαλέγει μόνο του κομμάτι, ka01 βγήκε με πιάνο · το API δεν αφήνει επιλογή κομματιού)
    duet: false, stitch: false,                                        // δεν ισχύουν σε photo post, αλλά το Postiz τα θέλει boolean (400 χωρίς αυτά, ka01)
    brand_content_toggle: false, brand_organic_toggle: false }),
  facebook: () => ({ post_type: 'post' }),
};
const isCar = e => e.kind === 'carousel';
const slidesOf = ep => fs.readdirSync(ROOT).filter(f => f.startsWith(ep + '_') && /_\d{2}\.jpg$/.test(f)).sort(); // κάρτες carousel στη ρίζα
const filesOf = e => e.files || (e.file ? [e.file] : []);

// είδος ανά σειρά (prefix αρχείου) · ep = «Ο πελάτης είπε...» (κωμικό)
const KIND = { ms: 'Μάθηση', pf: 'Πώς φτιάχνεται', er: 'Γέλιο', ep: 'Γέλιο', pm: 'Πριν/Μετά', ad: 'Πώληση', ka: 'Carousel' };
const kind = ep => KIND[(ep.match(/^[a-z]+/) || [''])[0]] || '?';

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

// ημερομηνίες των reels: log + posts στο Postiz (και όσα μπήκαν από το site με το χέρι) · DRAFT/ERROR δεν βγαίνουν → δεν μετράνε · τα carousels δεν μετράνε
function reelDates(log) {
  const now = Date.now(), car = new Set(log.posts.filter(isCar).flatMap(e => Object.values(e.postiz || {})));
  const dates = log.posts.filter(p => p.date && !isCar(p)).map(p => +new Date(p.date));
  for (const p of postizPosts(now - 60 * 864e5, now + 365 * 864e5)) if (!/DRAFT|ERROR/.test(p.state) && !car.has(p.id)) dates.push(+new Date(p.publishDate));
  return dates;
}

function nextSlot(log) {
  const now = Date.now(), dates = reelDates(log);
  const last = dates.length ? Math.max(...dates) : 0, earliest = now + SLOT.lead * 3600e3;
  let t = last ? slotAt(addDays(day(last), SLOT.every)) : 0;
  if (t < earliest) { t = slotAt(day(now)); if (t < earliest) t = slotAt(addDays(day(now), 1)); }
  return { t, last };
}

// slot carousel: η πρώτη μέρα «reel + 1» (19:00) μετά το τελευταίο carousel και ≥ 2 ώρες από τώρα · μετά το τελευταίο reel συνεχίζει στο ίδιο πλέγμα των 3 ημερών
function carSlot(log) {
  const now = Date.now(), earliest = now + SLOT.lead * 3600e3, reels = [...new Set(reelDates(log).map(day))].sort();
  const cars = log.posts.filter(p => isCar(p) && p.date).map(p => +new Date(p.date)), taken = new Set(cars.map(day)), lastCar = Math.max(0, ...cars);
  const end = reels.length ? reels[reels.length - 1] : day(now), grid = [...reels, ...Array.from({ length: 60 }, (_, i) => addDays(end, SLOT.every * (i + 1)))];
  for (const d of grid) { const c = addDays(d, 1), t = slotAt(c); if (t >= earliest && t > lastCar && !taken.has(c) && !reels.includes(c)) return { t, reel: d }; }
  die('carousel: δεν βρέθηκε ελεύθερο slot');
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
// car = carousel: media = [κάρτες με τη σειρά] → IG · TikTok · FB με ρυθμίσεις εικόνων
function createPosts(cap, media, t, ids, car) {
  const chs = car ? CAR_CH : Object.keys(CH), S = car ? CAR_SETTINGS : SETTINGS, image = Array.isArray(media) ? media : [media];
  const body = { type: 'schedule', date: iso(t), shortLink: false, tags: [],
    posts: chs.map(k => ({ integration: { id: ids[k] }, value: [{ content: capText(cap, k), image }], settings: { __type: k, ...S[k](cap) } })) };
  const tmp = path.join(os.tmpdir(), `publish_${process.pid}.json`);
  fs.writeFileSync(tmp, JSON.stringify(body));
  const res = pz('posts:create', '--json', tmp), byInt = Object.fromEntries(Object.entries(ids).map(([k, id]) => [id, k]));
  return Object.fromEntries(res.map(r => [byInt[r.integration], r.postId]));
}


// θέση σε ημερομηνία του Αλέξανδρου: νέες ημερομηνίες της ουράς → [{ e, nt }] μόνο για όσα αλλάζουν (σβήνονται και ξαναμπαίνουν στο Postiz)
// from = παλιά θέση του επεισοδίου που μετακινείται (move) → όσα ήταν μετά −3 μέρες (κλείνει το κενό) · μετά όσα πέφτουν στη νέα μέρα ή αργότερα +3
function shiftPlan(log, t, skipEp, from) {
  const out = [];
  for (const e of log.posts.filter(p => p.status === 'scheduled' && p.ep !== skipEp && !isCar(p))) { // τα carousels μένουν στη μέρα τους
    let d = day(+new Date(e.date));
    if (from && +new Date(e.date) > from) d = addDays(d, -SLOT.every);
    if (slotAt(d) >= t) d = addDays(d, SLOT.every);
    if (d !== day(+new Date(e.date))) out.push({ e, nt: slotAt(d) });
  }
  return out.sort((a, b) => a.nt - b.nt);
}
function applyShift(log, shift, ids) {
  sync(log);
  const busy = shift.filter(({ e }) => Object.values(e.state || {}).some(s => s !== 'QUEUE'));
  if (busy.length) die(`δεν είναι πια σε αναμονή: ${busy.map(({ e }) => `${e.ep} ${JSON.stringify(e.state)}`).join(' · ')} → καμία αλλαγή`);
  for (const { e, nt } of shift) { // νέα posts με το ίδιο media, μετά σβήσιμο των παλιών
    const old = Object.values(e.postiz);
    e.postiz = createPosts(e.caption, e.media, nt, ids, isCar(e)); e.date = iso(nt); delete e.state;
    for (const id of old) pz('posts:delete', id);
    save(log); console.log(`  ${e.ep} → ${fmt(nt)}`);
  }
}
const dateArg = d => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '')) die(`ημερομηνία YYYY-MM-DD: ${d}`); const t = slotAt(d); if (t < Date.now() + SLOT.lead * 3600e3) die(`${d} 19:00: παρελθόν ή < ${SLOT.lead} ώρες από τώρα`); return t; };
const showShift = shift => console.log(shift.length ? `μετακινούνται: ${shift.map(({ e, nt }) => `${e.ep} ${day(+new Date(e.date))} → ${day(nt)}`).join(' · ')}` : 'καμία άλλη μετακίνηση');

function schedule(ep, capFile, at, dry, date) {
  if (!ep || !capFile) die('node publish.js schedule <ep> <caption.json> [--date YYYY-MM-DD] [--at ISO] [--dry]');
  const log = load(), old = log.posts.find(p => p.ep === ep);
  if (old) die(`${ep}: υπάρχει ήδη στο log (${old.status}${old.date ? ', ' + fmt(old.date) : ''}) → cancel πρώτα αν είναι νέα έκδοση`);
  const files = fs.readdirSync(ROOT).filter(f => (f === ep + '.mp4' || f.startsWith(ep + '_')) && f.endsWith('.mp4')), slides = slidesOf(ep);
  const car = !files.length && slides.length > 0; // carousel: κάρτες <ep>_NN.jpg χωρίς MP4
  if (car && (slides.length < 2 || slides.length > 20)) die(`${ep}: ${slides.length} κάρτες · carousel = 2–20`);
  if (!car && files.length !== 1) die(`${ep}: ${files.length} MP4 στη ρίζα (${files.join(', ') || '—'}) · χρειάζεται ακριβώς 1 (ή κάρτες ${ep}_01.jpg … για carousel)`);
  const file = files[0], cap = JSON.parse(fs.readFileSync(capFile, 'utf8')), chs = car ? CAR_CH : Object.keys(CH);
  const text = k => capText(cap, k);
  if (!cap.text) die('caption.json: λείπει το "text"');
  if (!car && (!cap.title || cap.title.length < 2 || cap.title.length > 100)) die('caption.json: "title" (YouTube) 2–100 χαρακτήρες');
  if (car && cap.title && cap.title.length > 90) die('caption.json: "title" (TikTok photo) ≤ 90 χαρακτήρες');
  for (const k of ['instagram', 'tiktok-business']) if (text(k).length > 2200) die(`${k}: λεζάντα > 2200 χαρακτήρες`);
  const t = date ? dateArg(date) : at ? +new Date(at) : car ? carSlot(log).t : nextSlot(log).t, shift = date && !car ? shiftPlan(log, t) : [];
  if (!(t > Date.now())) die(`ημερομηνία στο παρελθόν: ${at}`);

  console.log(`${ep} (${car ? 'carousel' : kind(ep)}) · ${car ? `${slides.length} κάρτες (${slides[0]} …)` : file} → ${fmt(t)} (ώρα Ελλάδας) · ${chs.join(' · ')}`);
  if (date && !car) showShift(shift);
  for (const k of chs) console.log(`\n[${k}]${k === 'youtube' || (car && k === 'tiktok-business' && cap.title) ? ' «' + cap.title + '»' : ''}\n${text(k)}`);
  if (dry) return console.log('\n(--dry: τίποτα δεν ανέβηκε)');

  const ids = integrations();
  if (shift.length) applyShift(log, shift, ids);
  const upload = f => { const up = pz('upload', path.join(ROOT, f)); if (!up.path) die(`upload ${f}: ${JSON.stringify(up)}`); return { id: up.id, path: up.path }; };
  const media = car ? slides.map(upload) : upload(file), postiz = createPosts(cap, media, t, ids, car);
  for (const f of car ? slides : [file]) move(f, ROOT, path.join(DIR, 'scheduled'));
  log.posts.push(car ? { ep, kind: 'carousel', files: slides, status: 'scheduled', date: iso(t), caption: cap, media, postiz } : { ep, file, status: 'scheduled', date: iso(t), caption: cap, media, postiz });
  save(log);
  console.log(`\n✔ scheduled ${fmt(t)} · ${Object.keys(postiz).length} posts · ${car ? 'κάρτες' : 'MP4'} → publish/scheduled/`);
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
      for (const f of filesOf(e)) if (fs.existsSync(path.join(DIR, 'scheduled', f))) move(f, path.join(DIR, 'scheduled'), path.join(DIR, 'posted'));
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
    for (const p of ps) console.log(`  ${p.ep.padEnd(9)} ${(isCar(p) ? 'Carousel' : kind(p.ep)).padEnd(15)} ${p.date ? fmt(p.date) : '— χωρίς ημερομηνία'}${p.manual ? ' · με το χέρι' : ''}${p.state ? ' · ' + Object.entries(p.state).map(([k, v]) => `${k} ${v}`).join(' ') : ''}`);
  }
  const wait = fs.readdirSync(ROOT).filter(f => f.endsWith('.mp4') && !log.posts.some(p => p.file === f) && !(log.skip || []).includes(f));
  const done = new Set(log.posts.flatMap(filesOf));
  for (const n of new Set(fs.readdirSync(ROOT).filter(f => /_\d{2}\.jpg$/.test(f) && !done.has(f)).map(f => f.replace(/_\d{2}\.jpg$/, '')))) wait.push(`${n} (carousel)`);
  console.log(`\nστη ρίζα, χωρίς δημοσίευση (${wait.length}): ${wait.join(' · ') || '—'}`);
  console.log(`\nεπόμενο slot: ${fmt(t)}${last ? ` (τελευταίο post ${fmt(last)})` : ''}`);
  console.log(`επόμενο slot carousel: ${fmt(carSlot(log).t)} (reel + 1 μέρα)`);
}

function moveTo(ep, date, dry) {
  if (!ep || !date) die('node publish.js move <ep> YYYY-MM-DD [--dry]');
  const log = load(), e = log.posts.find(p => p.ep === ep && p.status === 'scheduled');
  if (!e) die(`${ep}: δεν υπάρχει scheduled post στο log`);
  const t = dateArg(date), from = +new Date(e.date), shift = isCar(e) ? [] : shiftPlan(log, t, ep, from); // carousel: μόνο το ίδιο
  console.log(`${ep}: ${fmt(from)} → ${fmt(t)}`); showShift(shift);
  if (dry) return console.log('(--dry: τίποτα δεν άλλαξε)');
  applyShift(log, [{ e, nt: t }, ...shift], integrations());
}

function cancel(ep) {
  const log = load(), e = log.posts.find(p => p.ep === ep && p.status === 'scheduled');
  if (!e) die(`${ep}: δεν υπάρχει scheduled post στο log`);
  sync(log);
  if (e.status !== 'scheduled' || Object.values(e.state).some(s => s === 'PUBLISHED')) die(`${ep}: έχει ήδη βγει σε κάποιο κανάλι (${JSON.stringify(e.state)}) → διαγραφή από την ίδια την πλατφόρμα`);
  for (const id of Object.values(e.postiz)) pz('posts:delete', id);
  for (const f of filesOf(e)) {
    const src = path.join(DIR, 'scheduled', f);
    if (!fs.existsSync(src)) continue;
    if (fs.existsSync(path.join(ROOT, f))) { fs.unlinkSync(src); console.log(`(νέο render ${f} στη ρίζα → το παλιό αντίγραφο σβήστηκε)`); }
    else move(f, path.join(DIR, 'scheduled'), ROOT);
  }
  log.posts = log.posts.filter(p => p !== e);
  save(log);
  console.log(`✔ ${ep}: ${Object.keys(e.postiz).length} posts σβήστηκαν από το Postiz · ${isCar(e) ? 'κάρτες' : 'MP4'} στη ρίζα`);
}

function batch(dry) {
  const plan = fs.readFileSync(path.join(DIR, 'plan.txt'), 'utf8').split('\n').map(l => l.replace(/#.*/, '').trim()).filter(Boolean);
  const todo = plan.filter(ep => !load().posts.some(p => p.ep === ep));
  if (!todo.length) return console.log('batch: όλα του plan.txt είναι ήδη στο log');
  const t0 = nextSlot(load()).t; // --dry: ημερομηνίες υπολογισμένες εδώ (το log δεν αλλάζει) · κανονικά: κάθε schedule ξαναδιαβάζει το Postiz
  todo.forEach((ep, i) => {
    const t = dry ? iso(slotAt(addDays(day(t0), SLOT.every * i))) : undefined;
    console.log(`\n── ${i + 1}/${todo.length}`); schedule(ep, path.join(DIR, 'captions', ep + '.json'), t, dry);
  });
  console.log(`\n✔ batch: ${todo.length} ${dry ? '(--dry)' : 'scheduled'}`);
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
  const pos = a.filter((x, i) => !x.startsWith('--') && !(i && /^--(at|date)$/.test(a[i - 1])));
  if (cmd === 'status') status();
  else if (cmd === 'next') { const log = load(), { t, last } = nextSlot(log), c = carSlot(log).t; console.log(`${fmt(t)}  ${iso(t)}${last ? `  (τελευταίο ${fmt(last)})` : ''}\ncarousel: ${fmt(c)}  ${iso(c)}`); }
  else if (cmd === 'schedule') { if (a.includes('--insert')) console.log('(--insert καταργήθηκε 2026-10-01 → τέλος ουράς · ημερομηνία μόνο με --date όταν τη ζητήσει ο Αλέξανδρος)'); schedule(pos[0], pos[1], opt('at'), a.includes('--dry'), opt('date')); if (!a.includes('--dry')) try { require('./next.js').after(pos[0], 'publish', true); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } }
  else if (cmd === 'sync') { const log = load(); const n = sync(log); console.log(n.join('\n') || 'τίποτα νέο'); }
  else if (cmd === 'cancel') cancel(pos[0]);
  else if (cmd === 'move') moveTo(pos[0], pos[1], a.includes('--dry'));
  else if (cmd === 'manual') manual(pos[0], pos[1]);
  else if (cmd === 'skip') skip(pos[0]);
  else if (cmd === 'batch') batch(a.includes('--dry'));
  else die(`άγνωστη εντολή: ${cmd} (status · next · schedule · move · batch · sync · cancel · manual · skip)`);
}
