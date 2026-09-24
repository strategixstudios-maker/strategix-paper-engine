# STRATEGIX STUDIOS — Paper Cut-out Video Bible · engine v2

Όλα τα βίντεο Strategix (ads + οργανικά) γίνονται σε **paper cut-out** αισθητική, σχεδιασμένα frame-by-frame σε JavaScript (Node + @napi-rs/canvas → ffmpeg). VO = ElevenLabs, φωνή **«Stratos»** (βλ. §5d)· ο Αλέξανδρος βάζει μόνο μουσική στο CapCut. Εμείς παραδίδουμε **MP4 1080×1920, 30fps με VO + SFX** + stems (`_vo.wav`, `_sfx.wav`) + timing sheet.

---

## 1. Αισθητική (δεν αλλάζει)
- Κάθε στοιχείο = κομμάτι **σκισμένου χαρτιού**: λευκή ακανόνιστη άκρη, απαλή σκιά (7,9 px), scribble texture (κυματιστά «m m m») σε μεγάλες επιφάνειες.
- **Boil 12fps**: οι άκρες «τρέμουν» ελαφρώς (seed αλλάζει κάθε 1/12s) → stop-motion αίσθηση.
- **Grain** (multiply noise) + **vignette** σε κάθε frame.
- Μεταβάσεις: **torn-paper wipe** (χαρτί ανεβαίνει και καλύπτει), ή σκίσιμο οθόνης, ή iris.
- Κάμερα επίπεδη, χωρίς 3D. Pops με spring overshoot.

## 2. Παλέτα
| Όνομα | Hex | Χρήση |
|---|---|---|
| navy | #0B1B3F | σκούρα φόντα, ποδιά Στράτου, κείμενα |
| blue | #1E3A8A | φόντα |
| **brand blue** | **#2854F3** | CTA κουμπιά, έμφαση (από το λογότυπο) |
| mid | #2F5FD0 | δευτερεύον μπλε |
| sky | #8FB0EE | ανοιχτό μπλε |
| pale | #DCE7FA | ανοιχτά φόντα |
| paper | #F7F4EC | χαρτί, κάρτες, captions |
| gold | #D8A93B | μόνο προϊόντα (κονκάρδες) |
| beanie | #E8B04A | **μόνο** ο σκούφος του Στράτου |
| ink | #101A33 | κείμενο |

## 3. Fonts
| Alias | Font | Χρήση | Ελληνικά |
|---|---|---|---|
| `Brand` | Poppins Bold | λογότυπο, «S», URL, Latin logos | **ΟΧΙ** |
| `Round` | Comfortaa | τίτλοι, κουμπιά, stickers | ναι |
| `Hand` | Mynerve | captions, χειρόγραφα | ναι |

⚠️ Poppins δεν έχει ελληνικά → λογότυπα πελατών στα demo γράφονται Latin (ANNA CAFÉ, KOSTAS COFFEE).

## 4. Ο ΣΤΡΑΤΟΣ — mascot / host
«Ο μάστορας της Strategix Studios». **Δεν** είναι ο Αλέξανδρος — ανεξάρτητος χαρακτήρας του brand, σε κάθε βίντεο.

**Signature (ποτέ δεν αλλάζουν):** μουσταρδί σκουφάκι με ribbed cuff + navy ταμπελάκι «S» (Poppins) · χοντρό σκούρο μουστάκι · navy ποδιά με κύκλο «S» + τσέπη με ραφή · λευκό t-shirt · μολύβι στο αυτί · jeans + λευκά sneakers.

**Rig v2 (stratos.js):** `stratos(ctx, x, shoulderY, scale, opts)`
- `mouth`: smile · closed · A · E · O · grin · flat · shock → lip-sync με `lipsync(VO, rest)`
- `eyes`: dot · happy · shock · tired ; `blink: blinkNow()`
- `brows`: -0.5 (συνοφρυωμένος) … 1.2 (σοκ) ; `look`: -15…15 (βλέμμα)
- `arms: [left, right]` σε rad (0 = κάτω, ~2.75 = ψηλά, -2.65 = facepalm με `armRFront:true`)
- `elbowL / elbowR` (rad, + = προς το σώμα, − = πήχης προς τα έξω/πάνω). Ο πήχης κοιτάει στη γωνία **`ang − elbow`** (0 = κάτω, π = πάνω). Thumb up: `ang 1.4, elbow −1.6`.
- `handL/handR`: relaxed · open · fist · point · thumb · grip · wave · ok (default `relaxed`).
- `viewL/viewR`: `auto` (default) · palm · back · side. Το **auto** διαλέγει ανατομικά σωστή όψη από τη γωνία του πήχη. Δες **HANDS.md** + `HANDS_SHEET.png`.
- `hintL/hintR`: `'shrug'` / `'stop'` όταν θες σκόπιμα παλάμη προς θεατή (μόνο με λυγισμένο αγκώνα).
- `legs:false` για medium shot. `handPos(side, ang, s, x, y, elbow)` → θέση χεριού για props (λαμβάνει υπόψη τον αγκώνα).
- `stratosBack(ctx, x, y, s)` (props.js) → Στράτος από πίσω για over-the-shoulder.
- `reach(ctx, tipX, tipY, dx, dy, {hand})` (props.js) → χέρι που μπαίνει στο κάδρο από (dx,dy).
- `pip(ctx, ...PIP, VO)` → talking-head κύκλος όταν ο Στράτος δεν είναι στη σκηνή (βλ. §5b).

**Κανόνες σχεδίου (v2, δεν σπάνε):**
- Σειρά σχεδίασης χεριού: μπράτσο → πήχης → χέρι → **μανίκι από πάνω**. Το χέρι βγαίνει πάντα μέσα από το μανίκι (με ποδόγυρο `teeD`). Το ίδιο ισχύει και στο `reach()`.
- Ώμοι t-shirt στρογγυλεμένοι. Το μανίκι έχει «καπάκι» στον ώμο.
- Λαιμός κοντός, στο χρώμα του δέρματος, με σκιά κάτω από το πηγούνι. V γιακάς με λευκό ρέλι (όχι σκούρο τρίγωνο).
- Ανάγνωση χεριού: **ράχη = νύχια + κόμποι** (point, fist, thumb), **παλάμη = γραμμές παλάμης, χωρίς νύχια** (open). Τα διπλωμένα δάχτυλα στο thumb είναι οριζόντιες «ρολό» λωρίδες.

## 5. Κανόνες δυνατού social video
1. **Hook 0–1,5s**: εικόνα + caption + VO λένε το ίδιο, ανοίγουν ερώτημα.
2. Κάτι αλλάζει **κάθε 1,5–2,5s** (σκηνή, pop, ήχος).
3. **Open loop** νωρίς → **reward** στο τέλος.
4. **Μία ιδέα** ανά βίντεο.
5. **Captions πάντα**: πάνω strip, Hand **76px**, **max 2 γραμμές**. Μακρύ VO → `captionSeq(ctx, lt, [[t,'κομμάτι'],...])` σε chunks.
6. Ads: προϊόν μέσα στα πρώτα 3s. Οργανικά: αξία/γέλιο πριν από οτιδήποτε.
7. **Loop** τέλος → αρχή.
8. **Ένα CTA.** Ads: «Πάρε προσφορά» (όχι τιμή, εκτός αν δοθεί). Οργανικά: comment bait.
9. Διάρκεια: ads 15–20s, οργανικά 15–25s.
10. Κοινό = **πιθανοί πελάτες & γραφίστες**, ΟΧΙ άλλα τυπογραφεία. Το αστείο είναι η κατάσταση, ποτέ ο πελάτης.
11. Όχι αριθμοί/ισχυρισμοί που δεν επιβεβαίωσε ο Αλέξανδρος (π.χ. «50 πλύσεις» → «ξανά και ξανά»).

## 5b. Safe zones (IG Reels + TikTok) — `L.SAFE`
Canvas 1080×1920. Το UI της εφαρμογής καλύπτει:
| Ζώνη | px | Τι κρύβεται |
|---|---|---|
| Πάνω | 0–250 | header, back, camera (IG) |
| Κάτω | 1480–1920 | username, caption, audio, CTA ads |
| Πλάγια | 0–60 / 1020–1080 | crop σε ψηλές οθόνες |
| Δεξιά icons | x > 920 όταν y > 1150 | like, comment, share, save |

Κανόνες:
- Κείμενο, CTA, πρόσωπο Στράτου και προϊόν **μόνο μέσα στο safe box** (x 60–1020, y 250–1480, και x ≤ 920 κάτω από y 1150). Background, πόδια και διακοσμητικά μπορούν να βγαίνουν.
- Caption: `CAP.y = 258` (αμέσως κάτω από το header).
- `seriesTag()` κολλάει αυτόματα στην κάτω-δεξιά γωνία του caption.
- PiP: `P.PIP = [200, 1325, 130]` (κάτω-αριστερά, πάνω από το username).
- CTA κουμπί: y ≤ 1400, x στο κέντρο (540).
- `node ep.js sheet` δείχνει τις κόκκινες ζώνες (`sheet clean` χωρίς αυτές). `preview t1 t2 guide` επίσης. Το render βγαίνει πάντα καθαρό.

## 5c. SFX — `sfx.js` (procedural, χωρίς assets)
Οι ήχοι είναι **κώδικας** (συνταγή + `seed`), όχι αρχεία: μικρό repo, μία διόρθωση ωφελεί όλα τα επεισόδια, παραλλαγές με `seed` (τα whoosh δεν ακούγονται copy-paste). Τα WAV είναι render outputs (εκτός git).
- **Auto**: κάθε wipe → `whoosh` με peak στην αλλαγή σκηνής (seed = index σκηνής). `AUTO_SFX: false` για απενεργοποίηση.
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
| `laser` · `lid` · `slide` | CO2 laser (loop με `dur`) · καπάκι μηχανήματος · χαρτί/αντικείμενο που σέρνεται |

- `node sfx.js demo` → όλα τα presets στη σειρά (ακρόαση). Νέο preset → `P` + default στο `GAIN` + demo.
- Levels: stem peak ≈ −3 dB, μέσος ≈ −23 dB (χώρος για VO + μουσική), limiter στο master.
- Διόρθωση μόνο ήχου: `node ep.js sfx` → νέο stem + `_sfx.md` + remux στο υπάρχον MP4 σε ~1s, χωρίς video render.
- CapCut: είτε ο ήχος του MP4, είτε mute + `<ep>_sfx.wav` για ξεχωριστό balance.

## 5d. VO — ElevenLabs «Stratos»
- Φωνή: **Stratos** (ElevenLabs voice design, voice_id `4djcgN1Upzan46ZOCATJ`, νέος Αθηναίος 25–35, χιουμοριστικός μάστορας). Ίδια σε ΟΛΑ τα επεισόδια.
- Μοντέλο `eleven_v3` με audio tags (`[casual]`, `[sighs]`, `[chuckles]`, `[amused]`, `[friendly]`, `[playful]`). Αριθμοί ολογράφως («Ογδόντα»), ακρωνύμια φωνητικά για το TTS («πι ντι εφ, ες βι τζι, ή έι άι») — στα captions γράφονται κανονικά.
- **Ένα αρχείο ανά επεισόδιο** (όλο το VO σε ένα generation, max 2 takes: το πλάνο επιτρέπει 2 ταυτόχρονα). Ο Αλέξανδρος κατεβάζει το MP3 και το ανεβάζει στο chat (το container δεν φτάνει το ElevenLabs storage).
- Στο chat: silence detect → σφίξιμο παύσεων (όχι πριν τα punchlines) → `vo/<ep>_vo.mp3` (μπαίνει στο git) → χρονισμοί φράσεων σε σχόλιο στην κορυφή του επεισοδίου.
- Επεισόδιο: `render.js({ ..., VO_FILE: 'vo/<ep>_vo.mp3', VO_AT: 0.2, VO_GAIN })` → `_vo.wav` stem + `_mix.wav` (VO+SFX) στο MP4. Το `lipsync()` ακολουθεί αυτόματα την ένταση της φωνής (`ST.VOENV`)· το `VO` array μένει κενό. VO μεγαλύτερο από το video → warning στο lint.

## 6. Workflow (για να μην καίμε tokens σε λάθη)
1. **Σενάριο** σε πίνακα: Χρόνος | Εικόνα | VO | Κείμενο/SFX → έγκριση.
2. Κώδικας επεισοδίου → `node ep.js sheet` (12 frames + safe-zone overlay + lint warnings σε κόκκινο) → έλεγχος: τίποτα σημαντικό στο κόκκινο.
3. `node ep.js lint` → πρέπει να βγει **«lint ✔ καθαρό»** πριν το render (ανατομία χεριών, χέρι πίσω από κεφάλι, χειρονομίες εκτός safe zone).
4. VO (§5d): generation στη φωνή Stratos → upload MP3 → `vo/<ep>_vo.mp3` + timings σκηνών/captions/SFX πάνω στις πραγματικές φράσεις.
5. `node ep.js render` → MP4 με VO + SFX + stems + `<ep>_sfx.md` + **timing sheet** (`<ep>_timing_sheet.md`). Αλλαγή μόνο στον ήχο → `node ep.js sfx`.
6. Episode log (§8) → `bash ship.sh <ep> "<msg>"` → ένα `<ep>.patch` (lint gate μέσα). Το chat δεν κάνει push· το Claude Code κάνει `git am` + push (βλ. CLAUDE.md).

## 7. Σειρές
- **ADS** — προϊόν/υπηρεσία, CTA «Πάρε προσφορά» + strategixstudios.com.
- **«Ο πελάτης είπε...» #N** — κωμικό, καταστάσεις με πελάτες/αρχεία, tip + comment bait σε γραφίστες.
- Ιδέες σε αναμονή: «Μύθος ή αλήθεια;», «Πώς φτιάχνεται;», «Το λάθος των 500€», «Κέντημα vs DTF vs Μεταξοτυπία», «POV: είσαι ο plotter».

## 8. Episode log
### AD — Κονκάρδες προσωπικού (30,5s) · `ad_konkardes_legacy.js`
Πρώτο βίντεο, πριν τον Στράτο (χαρακτήρες Μαρία/πελάτης). Landing: strategixstudios.com/konkardes-prosopikou — από 10,90€, μαγνήτης, laser, 1–2 εργάσιμες.

### AD — «Η πλύση» φούτερ DTF (19s) · `ad_plysi.js`
| Χρόνος | VO |
|---|---|
| 0,25–2,35 | 200 φούτερ με λογότυπο... άντεξαν μία πλύση. |
| 2,8–4,9 | Ξεβαμμένο. Σκασμένο. Ξεκολλημένο. |
| 5,3–6,0 | Εκτός αν... |
| 6,35–8,7 | ...τα φτιάξεις με DTF, στο εργαστήριό μας. |
| 10,6–13,6 | Πλύση... ξανά... και ξανά... |
| 14,1–15,6 | ...και μένει σαν καινούργιο. |
| 15,95–18,5 | Φούτερ με το λογότυπό σου. Πάρε προσφορά στο strategixstudios.com. |

### ORGANIC — «Ο πελάτης είπε...» #1 Το λογότυπο από WhatsApp · v2 (24,9s) · `ep01_whatsapp_logo.js`
Πρώτο επεισόδιο με VO ElevenLabs «Stratos» (`vo/ep01_vo.mp3`) + SFX, safe zones διορθωμένα. «Minecraft» → «χάλια» (stamp «ΧΑΛΙΑ»). Timing sheet: `ep01_timing_sheet.md`.
| Χρόνος | VO |
|---|---|
| 0,30–5,56 | Ο πελάτης μου στέλνει το λογότυπο... από WhatsApp. [sigh] Ογδόντα pixel. |
| 5,96–7,99 | Και φυσικά... το θέλει για αύριο. |
| 8,49–10,83 | Αν το τυπώσω έτσι... θα βγει χάλια. |
| 11,28–20,04 | Tip: ζήτα από τον γραφίστα σου το λογότυπο σε PDF, SVG ή AI. Λέγεται vector, και μεγαλώνει όσο θες χωρίς να χαλάσει. |
| 20,49–23,89 | Γραφίστες, εμφανιστείτε στα σχόλια και πείτε μου τις εμπειρίες σας. |

### ORGANIC/AD — «Πώς φτιάχνεται;» #1 Χάραξη σε notebook (27,6s) · `pf01_notebook_laser.js`
Laser CO2, navy δερματίνη + ANNA CAFÉ, CTA «Στείλε μήνυμα». Νέα props: `notebook` (NB geometry), `laserMachine`, `laserFX`, `smoke`, `honeycomb`, `laserHeadTop`, `uiSlider`, `giftBox`, `stratosBack`, `msgOut`. `cafeLogo(..., col)`.
| Χρόνος | VO |
|---|---|
| 0,2–2,3 | Έλα μαζί μας να δεις πώς χαράζεται ένα notebook. |
| 2,6–4,6 | Πρώτα τοποθετούμε το σημειωματάριο στο laser. |
| 4,8–7,0 | Και το κεντράρουμε εκεί ακριβώς που θέλουμε να χαράξουμε. |
| 7,4–10,2 | Μετά ρυθμίζουμε την ισχύ και την ταχύτητα ανάλογα με το υλικό. |
| 10,4–11,4 | Και πατάμε «χάραξη». |
| 11,8–14,8 | Το laser καίει το υλικό και εμφανίζεται το λογότυπο του πελάτη. |
| 15,2–16,0 | Αποτέλεσμα; |
| 16,3–18,3 | Premium χάραξη που δεν φεύγει ποτέ. |
| 18,7–21,4 | Ιδανικό για δώρα σε πελάτες, σε συνεργάτες, ή για την ομάδα σου. |
| 21,8–26,8 | Στείλε μας μήνυμα με το λογότυπό σου και την ποσότητα που σε ενδιαφέρει, και φτιάξε τα δικά σου εταιρικά δώρα. |

> ⚠️ Τα επεισόδια πριν το engine v2 (ad_plysi, pf01 — το ep01 έγινε στο v2) έχουν pip/CTA σε θέσεις εκτός safe zone. Χρειάζονται μικρές αλλαγές θέσεων και captionSeq πριν από νέο render. Στο ίδιο pass: `SFX` cues από το timing sheet τους (τα wipes παίρνουν ήδη auto whoosh).
