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

**Λογότυπο Strategix** μέσα στη σκηνή (τύπωμα, χάραξη, film, στένσιλ…) → `brandMark(ctx, x, y, r, col)`: «S» (Poppins) σε κύκλο, όπως στην ποδιά. Το `logoMark()` είναι γενικό demo σήμα (φύλλο), **όχι** το λογότυπό μας.

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
3. **Open loop** νωρίς → **reward** στο τέλος. Το reveal του αποτελέσματος φαίνεται **καθαρό**: τίποτα ημιδιάφανο από πάνω του (φύλλο, heat-press, τζάμι, φως) τη στιγμή που αποκαλύπτεται.
4. **Μία ιδέα** ανά βίντεο.
5. **Captions πάντα**: πάνω strip, Hand **76px**, **max 2 γραμμές** (3+ → lint warning). Μακρύ VO → `captionSeq(ctx, lt, [[t,'κομμάτι'],...])` σε chunks.
6. Ads: προϊόν μέσα στα πρώτα 3s. Οργανικά: αξία/γέλιο πριν από οτιδήποτε.
7. **Loop** τέλος → αρχή: το τελευταίο frame = το πρώτο (ίδιο caption, ίδια εικόνα). **Προτίμηση: seamless** → `LOOP: 'cut'`, χωρίς σκίσιμο: το frame 0 είναι η στιγμή λίγο *πριν* από τη δράση του hook (π.χ. η σπάτουλα έτοιμη να τυπώσει) και η τελευταία σκηνή καταλήγει ακριβώς εκεί. Caption + seriesTag του hook φαίνονται ήδη στο frame 0 (`caption(ctx, '…', lt, -1)`, `seriesTag(ctx, lt + 1, …)`) και το ίδιο caption μπαίνει ως τελευταίο chunk της τελευταίας σκηνής. `LOOP: true` (wipe 0,3s → frame 0) μόνο όταν το τέλος δεν μπορεί να καταλήξει στην αρχή. Το lint το ελέγχει.
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
- `seriesTag()` κολλάει αυτόματα στην κάτω-δεξιά γωνία του caption — **μόνο στο hook** (δηλώνει το είδος του βίντεο, δεν ακολουθεί κάθε caption). Σε seamless loop ξαναμπαίνει στο τέλος μαζί με το caption του hook. Αλλού → lint.
- PiP: `P.PIP = [200, 1325, 130]` (κάτω-αριστερά, πάνω από το username).
- CTA κουμπί: y ≤ 1400, x στο κέντρο (540).
- `node ep.js sheet` δείχνει τις κόκκινες ζώνες (`sheet clean` χωρίς αυτές). `preview t1 t2 guide` επίσης. Το render βγαίνει πάντα καθαρό.

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
| `laser` · `lid` · `slide` | CO2 laser (loop με `dur`) · καπάκι μηχανήματος · χαρτί/αντικείμενο που σέρνεται |
| `spray` | πιεστικό νερό / ψεκασμός (με `dur`) |

- `node sfx.js demo` → όλα τα presets στη σειρά (ακρόαση). Νέο preset → `P` + default στο `GAIN` + demo.
- Levels: stem peak ≈ −3 dB, μέσος ≈ −23 dB (χώρος για VO + μουσική), limiter στο master. Με VO + ducking: stem peak ≈ −12…−15 dB.
- Διόρθωση μόνο ήχου: `node ep.js sfx` → νέο stem + `_sfx.md` + remux στο υπάρχον MP4 σε ~1s, χωρίς video render.
- CapCut: είτε ο ήχος του MP4, είτε mute + `<ep>_sfx.wav` για ξεχωριστό balance.

## 5d. VO — ElevenLabs «Stratos»
- Φωνή: **Stratos** (ElevenLabs voice design, voice_id `4djcgN1Upzan46ZOCATJ`, νέος Αθηναίος 25–35, χιουμοριστικός μάστορας). Ίδια σε ΟΛΑ τα επεισόδια.
- Μοντέλο `eleven_v3` με audio tags (`[casual]`, `[sighs]`, `[chuckles]`, `[amused]`, `[friendly]`, `[playful]`). Αριθμοί ολογράφως («Ογδόντα»), ακρωνύμια φωνητικά για το TTS («πι ντι εφ, ες βι τζι, ή έι άι») — στα captions γράφονται κανονικά.
- **Ένα αρχείο ανά επεισόδιο** (όλο το VO σε ένα generation, max 2 takes: το πλάνο επιτρέπει 2 ταυτόχρονα). Ο Αλέξανδρος το βγάζει στο ElevenLabs και λέει πού είναι το MP3 (π.χ. `~/Downloads`). Δοκιμή: generation από το Claude Code με τον ElevenLabs connector (`creative_generate_speech`, `eleven_v3`, voice_id παραπάνω, **`generations_count` 1–2** — το default 4 = 4× κόστος) → download του MP3 → ίδια ροή.
- `node render.js vo <mp3>` → φράσεις + παύσεις → `node render.js vo <mp3> --gap 0.3 --keep N --out vo/<ep>_vo.mp3 --at 0.2`: κάθε παύση > 0,3s γίνεται 0,3s, εκτός από την παύση πριν από punchline (`--keep N` = μένει ως έχει, `N:0.45` = 0,45s) → `vo/<ep>_vo.mp3` (μπαίνει στο git) + χρονισμοί φράσεων σε χρόνο video → σχόλιο στην κορυφή του επεισοδίου. Μετά: `node ep.js vo` (ίδιος πίνακας από το `VO_FILE`).
- Επεισόδιο: `render.js({ ..., VO_FILE: 'vo/<ep>_vo.mp3', VO_AT: 0.2, VO_GAIN })` → `_vo.wav` stem + `_mix.wav` (VO+SFX) στο MP4. Το `lipsync()` ακολουθεί αυτόματα την ένταση της φωνής (`ST.VOENV`)· το `VO` array μένει κενό. Τα SFX κάνουν αυτόματα ducking κάτω από τη φωνή (§5c). VO μεγαλύτερο από το video → warning στο lint.

## 6. Workflow
Βήματα → **CLAUDE.md** (Claude Code: 1 επεισόδιο = 1 session) · **CHAT.md** (chat: ιδέες/σενάρια). Πριν το render το `lint` πρέπει να βγει **«lint ✔ καθαρό»**: ανατομία χεριών (HANDS.md), χέρι πίσω από κεφάλι, χειρονομίες εκτός safe zone, «#N» σε κείμενο, seriesTag εκτός hook, caption 3+ γραμμών, loop τέλος ≠ αρχή, SFX/VO εκτός video.

## 7. Σειρές
**Χωρίς αριθμό επεισοδίου στο βίντεο** (ούτε «#2» στο `seriesTag`, ούτε στα captions, ούτε στο VO): ο Αλέξανδρος ανεβάζει τα επεισόδια με όποια σειρά θέλει. Στο βίντεο μπαίνει μόνο το όνομα της σειράς, π.χ. `seriesTag(ctx, lt, 'Πώς φτιάχνεται;')`. Ο αριθμός υπάρχει μόνο στο όνομα αρχείου (`pf03_…`). Αν γράψεις «#N» σε κείμενο, το lint βγάζει warning.
- **ADS** — προϊόν/υπηρεσία, CTA «Πάρε προσφορά» + strategixstudios.com.
- **«Ο πελάτης είπε...»** — κωμικό, καταστάσεις με πελάτες/αρχεία, tip + comment bait σε γραφίστες.
- **«Πώς φτιάχνεται;»** — η διαδικασία βήμα-βήμα (laser κ.λπ.) με τον Στράτο, CTA «Στείλε μήνυμα». Κάθε βήμα δείχνει το **πραγματικό εργαλείο** να κάνει τη δουλειά (πιστόλι πιεστικού νερού, σπάτουλα, laser) και το αποτέλεσμα να εμφανίζεται εκεί που περνάει. Όχι σκέτο χέρι που δείχνει.
- **«Πριν / Μετά»** — ίδιο μαγαζί/προϊόν: Α χωρίς, Β με τη δουλειά μας, η διαδικασία στη μέση, CTA comment bait «Α ή Β; Και γιατί;».
- **«Μάθε με τον Στράτο»** — ένα tip σχεδιασμού/εκτύπωσης σε λίστα (π.χ. 5 στοιχεία καλού λογοτύπου), ο Στράτος στην υποδοχή (`reception()`), ✓ chips ανά στοιχείο, CTA like + comment bait «ποιο είναι το καλύτερο…;». Αρχεία `ms<NN>_…`.
- Ιδέες σε αναμονή: «Μύθος ή αλήθεια;», «Το λάθος των 500€», «Κέντημα vs DTF vs Μεταξοτυπία», «POV: είσαι ο plotter».

## 8. Επεισόδια & backlog
- Log επεισοδίων → **`EPISODES.md`** (δεν φορτώνεται αυτόματα· άνοιξέ το για το επόμενο ID αρχείου / προηγούμενα επεισόδια). Χρονισμοί VO → `<ep>_timing_sheet.md`.
- Βελτιώσεις engine που περιμένουν (και τα pre-v2 επεισόδια) → **`BACKLOG.md`**.
