# SFX — λεπτομέρειες (STYLE_GUIDE §5c)

Μεταφέρθηκε αυτούσιο από το STYLE_GUIDE.md (2026-10-01) για να μη φορτώνεται σε κάθε βήμα. Ισχύει όπως και ο πυρήνας· όπου το STYLE_GUIDE λέει κάτι νεότερο, ισχύει το STYLE_GUIDE.

## 5c. SFX — `sfx.js` (procedural, χωρίς assets)
Οι ήχοι είναι **κώδικας** (συνταγή + `seed`), όχι αρχεία: μικρό repo, μία διόρθωση ωφελεί όλα τα επεισόδια, παραλλαγές με `seed` (τα whoosh δεν ακούγονται copy-paste). Τα WAV είναι render outputs (εκτός git).
- **Auto**: κάθε wipe → `whoosh` με peak στην αλλαγή σκηνής (seed = index σκηνής). `AUTO_SFX: false` για απενεργοποίηση.
- **Ducking** (default όταν υπάρχει VO): όλα τα SFX −6 dB και όσα πέφτουν πάνω σε φράση άλλα −7 dB (≈ −13 dB κάτω από τη φωνή). Φράσεις αυτόματα από την ένταση του VO — ίδιο αποτέλεσμα με το χειροκίνητο silence detect. `DUCK: false` → χωρίς · `DUCK: { phrases, mix, duck }` → χειροκίνητα.
- **Χειροκίνητα** στο `render.js({...})`: `SFX: [[t, 'preset', { gain, pan, seed, dur, note }], ...]`. `gain` σχετικό (1 = default) · `pan` −1…1 · `dur` για ήχους με διάρκεια (laser loop, slide, tear, whoosh) · `note` → στήλη στο `_sfx.md`.
- Άγνωστο preset / χρόνος εκτός βίντεο → warning στο `lint`, και το `render` σταματάει πριν το video.

| Preset | Χρήση |
|---|---|
| `whoosh` · `swoosh` · `zoom` · `air` | wipes · γρήγορη κίνηση (thumb up) · zoom-in · αέρας/καπνός |
| `tear` | σκίσιμο χαρτιού / σκίσιμο οθόνης |
| `pop` · `blip` · `boing` | εμφάνιση (spring pop) · κείμενο/caption · κωμικό ελατήριο |
| `click` · `beep` · `ticks` | κουμπί/ποντίκι · μηχάνημα (`count`) · slider (`count`, `rise`) |
| `ding` · `shimmer` · `sent` | ✓ επιτυχία · αποτέλεσμα ✨ · μήνυμα στάλθηκε |
| `thud` · `stamp` | κάτι ακουμπάει · σφραγίδα / «κλακ» |
| `laser` · `galvo` · `lid` · `slide` | CO2 laser XY (loop με `dur`, `pass` = διάρκεια γραμμής raster) · galvo scanner (τσίριγμα καθρεφτών, `dur`, `rate`) · καπάκι μηχανήματος · χαρτί/αντικείμενο που σέρνεται |
| `spray` | πιεστικό νερό / ψεκασμός (με `dur`) |
| `drop` · `flow` | σταγόνα μελανιού/υγρού (`rate` + `rise` = επιτάχυνση ως βουητό: «χιλιάδες φορές») · υγρό σε σωληνάκι (με `dur`) |
| `ring` | τηλέφωνο που χτυπάει (`count` = ζευγάρια «ντριν-ντριν») |
| `file` | ήχος από αρχείο (`src: 'sfx/<ep>_<όνομα>.mp3'`, `dur`) — μόνο για ό,τι δεν βγαίνει procedural (jingle, από ElevenLabs Sound Effects API)· πηγές στο `sfx/` (στο git) |

- `node sfx.js demo` → όλα τα presets στη σειρά (ακρόαση). Νέο preset → `P` + default στο `GAIN` + demo.
- Levels: stem peak ≈ −3 dB, μέσος ≈ −23 dB (χώρος για VO + μουσική), limiter στο master. Με VO + ducking: stem peak ≈ −12…−15 dB.
- Διόρθωση μόνο ήχου: `node ep.js sfx` → νέο stem + `_sfx.md` + remux στο υπάρχον MP4 σε ~1s, χωρίς video render.
- Stems (`_vo.wav`, `_music.wav`, `_sfx.wav`) για ξεχωριστό balance αν χρειαστεί· το MP4 έχει ήδη το τελικό mix.
