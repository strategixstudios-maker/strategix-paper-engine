# Επεισόδια — log

Ένα block ανά επεισόδιο (νεότερο κάτω). **Δεν φορτώνεται αυτόματα**: άνοιξέ το όταν χρειάζεσαι το επόμενο ID αρχείου (`pf03`…), προηγούμενο επεισόδιο ή ιδέες που έχουν ήδη γίνει.

Μορφή νέας εγγραφής (3–6 γραμμές, χωρίς πίνακα VO — οι χρονισμοί ζουν στο timing sheet):
```
### <ΣΕΙΡΑ> — «Τίτλος» · vX (διάρκεια) · `<ep>.js`
Hook / τι δείχνει · landing + CTA · νέα props ή αλλαγές engine · ό,τι μάθαμε (αν θέλει engine → BACKLOG.md).
Timing sheet: `<ep>_timing_sheet.md`.
```

### AD — Κονκάρδες προσωπικού (30,5s) · `ad_konkardes_legacy.js`
Πρώτο βίντεο, πριν τον Στράτο (χαρακτήρες Μαρία/πελάτης). Landing: strategixstudios.com/konkardes-prosopikou — από 10,90€, μαγνήτης, laser, 1–2 εργάσιμες.

### AD — «Η πλύση» φούτερ DTF (19s) · `ad_plysi.js`
Pre-v2 (βλ. BACKLOG.md). Χωρίς timing sheet — VO:
| Χρόνος | VO |
|---|---|
| 0,25–2,35 | 200 φούτερ με λογότυπο... άντεξαν μία πλύση. |
| 2,8–4,9 | Ξεβαμμένο. Σκασμένο. Ξεκολλημένο. |
| 5,3–6,0 | Εκτός αν... |
| 6,35–8,7 | ...τα φτιάξεις με DTF, στο εργαστήριό μας. |
| 10,6–13,6 | Πλύση... ξανά... και ξανά... |
| 14,1–15,6 | ...και μένει σαν καινούργιο. |
| 15,95–18,5 | Φούτερ με το λογότυπό σου. Πάρε προσφορά στο strategixstudios.com. |

### ORGANIC — «Ο πελάτης είπε...» · Το λογότυπο από WhatsApp · v2 (24,9s) · `ep01_whatsapp_logo.js`
Πρώτο επεισόδιο με VO ElevenLabs «Stratos» (`vo/ep01_vo.mp3`) + SFX, safe zones διορθωμένα. «Minecraft» → «χάλια» (stamp «ΧΑΛΙΑ»). Tip: λογότυπο σε PDF/SVG/AI (vector) · comment bait σε γραφίστες.
Timing sheet: `ep01_timing_sheet.md`. v2.1: ρολά/μηνύματα/ρολόι 80px πιο κάτω (δεν πέφτουν στο caption, 6,2s) · «φωτό της ταμπέλας» χωράει στο συννεφάκι (`msgBubble` αυτόματο πλάτος) · νέο render με ducking.

### ORGANIC/AD — «Πώς φτιάχνεται;» · Χάραξη σε notebook (27,6s) · `pf01_notebook_laser.js`
Laser CO2, navy δερματίνη + ANNA CAFÉ, CTA «Στείλε μήνυμα». Νέα props: `notebook` (NB geometry), `laserMachine`, `laserFX`, `smoke`, `honeycomb`, `laserHeadTop`, `uiSlider`, `giftBox`, `stratosBack`, `msgOut`. `cafeLogo(..., col)`. Pre-v2 (βλ. BACKLOG.md).
Timing sheet: `pf01_timing_sheet.md`.

### AD — «Θολή αφίσα» online εκτύπωση αφίσας · v2 (20,0s) · `ad_afisa.js`
Landing: strategixstudios.com/ektyposi-afisas — από 13 €, ματ 250gr, έλεγχος ανάλυσης πριν πληρώσεις, σωλήνας. CTA «Ανέβασε φωτογραφία» (online παραγγελία, όχι quote) + τιμή από τη landing. Ποιότητα ανά μέγεθος από το FAQ (12MP: πράσινο ως 40×50, κίτρινο ως 70×100). Νέα props: `poster` (sharp/blur, ξετύλιγμα down/left), `POSTER`, `posterTube`, `phoneFrame`.
v2: κόπηκε το «Γνωστό σενάριο» (+facepalm) για ≤ 20s · SFX −6 dB + ducking −7 dB πάνω στις φράσεις — τα SFX «πατούσαν» το VO (ήταν μόλις ~3 dB κάτω). Το `duck()` έγινε default του engine (`DUCK` στο render.js).
Timing sheet: `ad_afisa_timing_sheet.md`.

### ORGANIC/AD — «Πώς φτιάχνεται;» · Χάραξη σε θερμός (25,0s) · `pf02_thermos_laser.js`
CO2 laser + **rotary**, navy powder-coat θερμός → η δέσμη αφαιρεί τη βαφή, βγαίνει ασημί ανοξείδωτο. KOSTAS COFFEE, CTA «Στείλε μήνυμα». VO `vo/pf02_vo.mp3` (atempo 1.06). SFX −6 dB + ducking κάτω από το VO (2η φορά μετά το ad_afisa → `DUCK` στο engine).
Νέα props: `thermos` (κυλινδρική προβολή χάραξης: `engrave`, `phase`, `thermosPhase(p)`, `TH` geometry), `rotary` (πρόσοψη / `top` κάτοψη), `layersInset` (τομή βαφή → ανοξείδωτο), `kostasLogo` (μεταφέρθηκε από το ep01, `mono` για χάραξη).
Timing sheet: `pf02_timing_sheet.md`. v2.1: ρολά του ραφιού κάτω από το caption (5,2s) · caption 3 γραμμών (7,3s) → 2 κομμάτια στην παύση του VO.

### ORGANIC — «Πριν / Μετά» · Η τζαμαρία (16,8s) · `pm01_vitrina.js`
Split Α (άδειο τζάμι) | Β (ANNA CAFÉ σε βινύλιο) → montage plotter → weeding → transfer tape → τζάμι → περαστικός σταματάει στο Β, μέρα → νύχτα (φωτισμένο τζάμι) → CTA comment bait «Α ή Β; Και γιατί;» πάνω στο ίδιο split (αόρατο loop). Ξεκίνησε ως «Weeding ASMR» — ο ψίθυρος στο VO βγήκε cringe, κράτησα μόνο assets + ήχους.
Νέα SFX presets: `plotter`, `peel` (`speed`), `squeegee` (`strokes`). Νέα props στο επεισόδιο (1η χρήση): vinyl layers (`logoC`/`accOnly`/`wasteLayer`/`tapeLayer`), γενικό `peel()` (καθρεφτισμένο flap), `sheet`, `plotterRail`, `squeegee`, `pencil`, `shopfront`/`onGlass`, `shop`/`street`/`awning`, `splitLabels`, `walker`.
Timing sheet: `pm01_timing_sheet.md`. v2.1: caption 3 γραμμών (9,5s) → «Και ξαφνικά...» / «...η τζαμαρία σου δουλεύει για σένα.» (VO 9,46 / 10,50) · loop: `LOOP: true` (wipe → frame 0) αντί για σκηνή με «Μία διαφορά.» στο τέλος.

### ORGANIC/AD — «Πώς φτιάχνεται;» · Μεταξοτυπία / screen printing (27,9s · v3) · `pf03_metaxotypia.js`
Εκπαιδευτικό, όλο **top-down** σε cutting mat (navy + grid, στα χρώματά μας). Hook: τελάρο κάτω στο λευκό tee → σηκώνεται → μπλε «S» → ημιδιάφανο heat-press + shimmer (cure). Μετά η διαδικασία: film (μαύρο «S») → emulsion coat → έκθεση σε φως → ξέπλυμα (ανοίγει το «S» στο πλέγμα) → πέρασμα σπάτουλας στο tee. Host ο Στράτος με `reach()` + `pip()`. CTA = τελευταία ατάκα VO (όχι button, κατ' απαίτηση): «...από τους πιο γερούς».
Loop: τελειώνει με τελάρο **κάτω** (= frame 0) → η αποκάλυψη γίνεται στην αρχή (`LOOP: true`). Νέα props (1η χρήση, inline — βλ. BACKLOG για engine): cutting mat, teeFlat, screen frame με states, squeegee top-down, filmPositive, heat-press platen, water spray. VO `vo/pf03_vo.mp3` (χωρίς atempo, 22,05s).
Timing sheet: `pf03_metaxotypia_timing_sheet.md`. v2 (22,6s): hook = η σπάτουλα τυπώνει → σήκωμα → «S» → cure· στένσιλ (emulsion + ανοιχτό «S» που γεμίζει μπλε) + ink bead· τελευταία σκηνή: πέρασμα → σήκωμα → νέο tee → τελάρο κάτω → «έτοιμο» = frame 0 → **seamless loop** `LOOP: 'cut'` (χωρίς σκίσιμο στο τέλος). Σχέδιο = το «S» μας (`brandMark()`, όχι το demo `logoMark()`). Ετικέτα σειράς μόνο στο hook (+ στο τέλος με το caption του hook, για το loop). Χωρίς heat-press στο reveal (καθαρό αποτέλεσμα). Ξέπλυμα με πιστόλι πιεστικού νερού: ο πίδακας ανοίγει το «S» εκεί που περνάει. Νέο SFX `spray`. T-shirt → engine: `tshirt()` στο props/textile.js (crew neck με ribbed γιακά, κεκλιμένοι ώμοι, στριφώματα).
v3 (27,9s, 2026-09-26, κατ' αίτηση: το βήμα 3 δεν το καταλάβαιναν θεατές): **βήμα 3 αναλυτικό** — φιλμ πάνω στο τελάρο → σκοτάδι + UV λάμπες (μωβ, χρονόμετρο «UV») → το emulsion σκουραίνει = σκληραίνει (ετικέτα) → το φιλμ ξεκολλάει → ανοιχτό «S» = μαλακό (ετικέτα + βελάκι). Βήμα 2 με πιο ανοιχτό (φρέσκο) emulsion, βήμα 4 ξεκινά με το λανθάνον «S». VO: νέο take μόνο του βήματος 3 κολλημένο στο `vo/pf03_vo.mp3` (atempo 1.06, +1,5 dB). Κανόνας «τι + γιατί» στο STYLE_GUIDE §7. 1η χρήση inline: `acetate`, `uvLamps`, `uvTimer`.

### ORGANIC — «Μάθε με τον Στράτο» · Τι κάνει ένα λογότυπο καλό; (25,3s) · `ms01_kalo_logo.js`
Πρώτο επεισόδιο στο σκηνικό της υποδοχής (`reception()`) και πρώτο της σειράς. Hook: wide υποδοχή → απότομο zoom στον Στράτο. 5 στοιχεία (Απλό · Αξέχαστο · Διαχρονικό · Ευέλικτο · Ταιριαστό) ως ✓ chips + καρουζέλ με σιλουέτες διαχρονικών λογοτύπων (Nike, Shell, Apple, Mercedes, McDonald's) σε χαμηλή αντίθεση. Gag: «ΝΟΜΙΚΟ ΓΡΑΦΕΙΟ» σε στυλ παιδότοπου → «ΟΧΙ». CTA: like + «Γράψε στα σχόλια» (comment bait: ποιο είναι το καλύτερο λογότυπο;). Seamless loop με zoom out σε wide.
VO από τον ElevenLabs connector (2 takes, ~8 cents). Κάμερα = keyframes πάνω στο `o.cam` · πόζες Στράτου = keyframes με blend 0,28s (`poseAt`). 1η χρήση μέσα στο επεισόδιο: καρουζέλ λογοτύπων, `poseAt`, `bubbly` (γράμματα παιδότοπου). 25,3s: λίγο πάνω από το όριο των 25s — για λιγότερο θα έπρεπε πιο σφιχτό VO.
Timing sheet: `ms01_kalo_logo_timing_sheet.md`. Παράπλευρα: εικόνα προφίλ Instagram 1080×1080 (brand blue + λευκό «S» μονόγραμμα, `brandMark`) → `~/Downloads/strategix_ig_profile_1080.png` (εκτός git).

### ORGANIC — «Πριν / Μετά» · Πώς το DTF άλλαξε την εκτύπωση σε ύφασμα (23,0s) · `pm02_dtf.js`
Hook: υποδοχή, κάρτα παραγγελίας με σχέδιο 4 χρωμάτων → Στράτος σοκ. ΤΟΤΕ (παλιό εργαστήριο μεταξοτυπίας, κιτρινισμένο χαρτί): πανικός με υπαλλήλους που τρέχουν με τελάρα → 4 τελάρα (ένα ανά χρώμα) → στραβή ταύτιση → κλακ → ρολόι/χαρτονομίσματα → ένα μπλουζάκι → facepalm. ΤΩΡΑ: σκίσιμο οθόνης → DTF εκτυπωτής (CMYK + W, ένα κλικ, film με ντεγκραντέ) → πούδρα · θερμοπρέσα · ξεκόλλημα (top-down cutting mat). CTA comment bait «Μεταξοτυπία ή DTF; Εσύ τι θα διάλεγες; Και γιατί;» + «Γράψε στα σχόλια», seamless loop (η κάρτα παραγγελίας ξαναγλιστράει = frame 0). Ο πόνος είναι τα πολλά χρώματα σε λίγα κομμάτια, όχι η μεταξοτυπία (το pf03 την προβάλλει). «Ακόμα και για ένα κομμάτι» επιβεβαιωμένο από τον Αλέξανδρο.
Engine (2η χρήση): `screenFrame()` + `cuttingMat()` → props/screenprint.js · `walker()` (περπάτημα/τρέξιμο, `carry`) → props/people.js · `poseAt(POSES, t)` → stratos.js. 1η χρήση μέσα στο επεισόδιο: `dtfPrinter`, `film` (πούδρα + ξεκόλλημα), `platen` (θερμοπρέσα κάτοψη), `artwork` (sunset 4 χρωμάτων, separations), `tearFrom` (σκίσιμο οθόνης), `regMark`.
v2: καμία παύση πριν το «πανικό» (ο θεατής χάνει το ενδιαφέρον στη σιωπή) → κανόνας στο STYLE_GUIDE §5d (όχι «...» πριν από punchline στο κείμενο του VO, `--keep N:0.03`).
Timing sheet: `pm02_dtf_timing_sheet.md`.

### ORGANIC/AD — «Πώς φτιάχνεται;» · Κέντημα σε καπέλο · v3 (21,45s) · `pf04_kentima.js`
Hook: ο Στράτος κρατάει navy καπέλο με κεντημένο «S» (satin με ρεαλιστικές βελονιές, γυαλάδα ανά κατεύθυνση κλωστής, ανάγλυφο) → η μηχανή σε μαύρο περίγραμμα + μεγάλο «?» (περιέργεια) → 1 over-the-shoulder στο software: το σχέδιο γίνεται βελονιές, «η μηχανή δεν διαβάζει εικόνες, μόνο συντεταγμένες» (άξονες X/Y) → 2 τελάρο καπέλου: λουρί + μάνταλο, οι ζάρες σβήνουν → 3 κλακ στη μηχανή: το «?» σκίζεται, η μηχανή γεμίζει χρώματα (reveal), zoom στη βελόνα, το καπέλο κινείται από κάτω της και το «S» ράβεται → CTA «Στείλε μας το λογότυπό σου, και ας φτιάξουμε τα δικά σου.» (μήνυμα «Το λογότυπό μου» στέλνεται).
Βελονιές από τη γραμματοσειρά (σκελετός Zhang–Suen → zigzag satin): ίδια διαδρομή στην οθόνη και στη μηχανή. 1η χρήση μέσα στο επεισόδιο: `cap` (baseball 6 φύλλων, πρόσοψη), `embroidery`, `capHoop`, κεντητική μηχανή (`machineBack`/`machineFront`, λειτουργία περιγράμματος → χρώμα), `stepChip`, `qmark`. Engine: νέο SFX `stitch` · `LOOP: false` στο render.js (χωρίς loop, χωρίς loop lint) · `node render.js vo … --splice` (αλλαγή ατάκας, 2η φορά μετά το pf03 v3).
v2 (κατ' απαίτηση): χωρίς loop. Το seamless «…και» → «Αυτό είναι ένα καπέλο με κέντημα» δεν έδενε καλά, οπότε το τέλος είναι πλέον CTA (νέο take μόνο της τελευταίας φράσης). VO από τον connector (δουλεύει ξανά).
v3 (κατ' απαίτηση): η CTA της v2 (take μόνο της φράσης, κολλημένο) ακουγόταν άλλη φωνή, και ο Αλέξανδρος παρατήρησε μικρές διαφορές στη φωνή από βίντεο σε βίντεο. Αιτία: ο connector και το site δεν κλειδώνουν stability/seed. Λύση: `vo.js` (ElevenLabs API, κλειδωμένες ρυθμίσεις «Stratos»: stability 0.5 Natural, seed 1000) + κείμενο στο `vo/<ep>.txt` · όλο το VO ξανά σε ένα generation (take 1) → νέοι χρονισμοί. STYLE_GUIDE §5d + CLAUDE.md βήμα 2.
Timing sheet: `pf04_kentima_timing_sheet.md`.

### ORGANIC — «Το Εργαστήριο» · Ποιο είναι το τελικό; (29,9s) · `er01_teliko.js`
Πρώτο skit της σειράς, με Στράτο + Φοίβο + Ρένα. Φόρμα «ο ειδικός του τίποτα» + running gag «υπεύθυνος όταν λείπει ο Στράτος». Hook: WhatsApp «Πελάτης» με `logo_final.pdf` / `final2` / `FINAL_final` → ο Φοίβος: «όσα περισσότερα final, τόσο πιο τελικό» → laser (`final_FINAL_αυτό`, `ΣΙΓΟΥΡΑ_final`) → Στράτος «Στοπ! Ρώτησε κανείς τον πελάτη;» → Ρένα: «Θέλει το πρώτο.» → snap βλέμμα Φοίβου → tip Στράτου «όχι final, ημερομηνία στο όνομα · ελέγχουμε κάθε αρχείο» → tag «Νέος κανόνας: το πρώτο κερδίζει.» → CTA «Κάνε tag τον Φοίβο της δουλειάς σου», seamless loop (νέο `logo_final.pdf` = frame 0).
Engine: VO διαλόγου (`vo.js`: `ΟΝΟΜΑ: ατάκα` → text-to-dialogue σε ένα generation + `.who.json` · `lipsync(VO, rest, who)`) · φωνές Phoebus / Rena (voice design από άλλο session). 1η χρήση μέσα στο επεισόδιο: `fileChip`/`pdfIcon`, `chat` (WhatsApp με αρχεία), `dialogCaps` (ταμπελάκι ομιλητή), `lowerThird`, `snap` zoom, `laserRoom` (σκηνικό pf01 με `camAt`). VO από το API τοπικά (το cloud container δεν φτάνει το ElevenLabs).
Timing sheet: `er01_teliko_timing_sheet.md`.

### ORGANIC/AD — «Πώς φτιάχνεται;» · Πώς τυπώνει ένας εκτυπωτής μεγάλου φορμά · v2 (50,4s) · `pf05_ektypotis.js`
Eco-solvent print & cut (το Roland SP-300V του εργαστηρίου, χωρίς μάρκα στο βίντεο). Ισχυρισμοί από το datasheet/manual (piezo, 4 φυσίγγια CMYK, variable droplet, print heater + dryer, contour cut) + κεφαλή DX4 (~8 kHz → «χιλιάδες»). Hook: μακροπλάνο κουκκίδων → zoom out στο αυτοκόλλητο του Στράτου · «μόνο 4 μελάνια, πώς βγάζει όλα τα χρώματα;» → 1 RIP (separations) → 2 one-take «μικροσκόπιο» (κατ' απαίτηση): η κάμερα ακολουθεί το κυανό μελάνι φυσίγγιο → σωληνάκι → αλυσίδα → damper → ακροφύσιο → βουτιά στην πλάκα ακροφυσίων → 3 piezo → 4 περάσματα → 5 θερμαντήρας → 6 contour cut → φακός στον σκούφο: κίτρινο + λίγο ματζέντα = μουσταρδί (reward) → CTA «Στείλε μας το σχέδιό σου» → zoom στις κουκκίδες = frame 0 (seamless). Διάρκεια > 25s κατ' απαίτηση («αν βγαίνει σωστό, τα δευτερόλεπτα δεν πειράζουν»).
Engine (2η χρήση): `cam`, `hexRGB`, `mixHex` → lib.js · `qmark`, `stepChip` → props/ui.js · νέα SFX `drop`, `flow`. 1η χρήση μέσα στο επεισόδιο: halftone CMYK (`printArt`/`inkDots`, LOD λεία εικόνα ↔ κουκκίδες), contour αυτοκόλλητου (`CONT`), `printerFront`, `cartridge`, διαδρομή σωλήνων (`RP`/`tubeAt`), `damper`, τομή κεφαλής / piezo, κάτοψη πλατό (`platenTop`/`railTop`).
v2 (κατ' απαίτηση): κόπηκε η ενότητα «μικρή/μεγάλη σταγόνα» (29–33s, −3,9s από το ίδιο take με ffmpeg) · το περίγραμμα κοπής ήταν στραμμένο 90° (bug στη γωνία) · η κοπή δουλεύει όπως το τύπωμα: μαχαίρι στο X, βινύλιο στο Y (+ υπόμνημα) → κανόνας στο STYLE_GUIDE §7 · one-take → §5.2.
Timing sheet: `pf05_ektypotis_timing_sheet.md`.

### ORGANIC — «Το Εργαστήριο» · Ο Βασίλης (26,6s) · `er02_vasilis.js`
Ιδέα του Αλέξανδρου: ο ανυπόμονος πελάτης. Φόρμα «το τηλεφώνημα». Hook: οθόνη επιλογής χαρακτήρα (video game) με τον Βασίλη (~48, μάστορας γυψοσανίδας, σαλοπέτα, μυστρί) σε χάρτινη βάση που γυρίζει 360 (στενεύει ως την κόψη του χαρτιού → πλάτη) · στατιστικά ΜΥΣΤΡΙ 10 · ΓΥΨΟΣΑΝΙΔΑ 10 · **ΥΠΟΜΟΝΗ 1**. Αφήγηση Στράτου: παρήγγειλε προχθές 30 μπλούζες (μαύρες, δίχρωμο λογότυπο πλάτης κίτρινο + λευκό) → «Δύο μέρες μετά» το κινητό της Ρένας χτυπάει → τσιρίγματα καρτούν με υπότιτλο κάτω → «custom, η προσφορά γράφει 7–10 εργάσιμες» (επιβεβαιωμένο από τον Αλέξανδρο) → θερμοπρέσα (auto-open, 12/30) → «Μη γίνεις Βασίλης.» → ξαναχτυπάει, η Ρένα πίνει καφέ → CTA «Κάνε tag τον Βασίλη που ξέρεις.» → zoom στο κινητό = frame 0 (seamless).
Κανόνας: εξαίρεση στο §4b (ο πελάτης φαίνεται, ως συμπαθής guest). Βγήκε το αστείο «δουλεύω και Κυριακή» (δεν άρεσε).
VO: voice test πρώτα (το er01 απορρίφθηκε για τις φωνές) → **TTS ανά ομιλητή** γίνεται το default του `vo.js` (όχι text-to-dialogue) · guest με `@κλιπ` · **νέα φωνή Ρένας** (Rena v2 `VKm16zQTtl8iH09WCHsB`: voice design → remix «πιο αληθοφανές», για κάθε επεισόδιο από εδώ και πέρα) · τσιρίγματα Βασίλη + jingle από ElevenLabs Sound Effects API.
Engine: `snap`/`lerpArr` + `blinkNow(off)` → lib.js (2η χρήση μετά το er01) · `tshirt({ back })` · SFX `ring` + `file` (πηγές στο `sfx/`) · `--keep N:s` μεγαλύτερο από την παύση = σιωπή. 1η χρήση μέσα στο επεισόδιο: `vasilis`/`vasilisBack`/`turntable` (360), `selectScreen`, `vasLogo`, `trowel`, κινητό με εισερχόμενη κλήση + zoom στην οθόνη, `squeak` + `subtitle` (φωνή από τηλέφωνο), `quote`, `dayChip`, `heatPress` (clamshell πρόσοψη), `foldedStack`.
v1 → διορθώσεις (κατ' απαίτηση): πράσινη τελεία στο πρόσωπο της Ρένας (λαμπάκι headset) έφυγε · «εργάσιμες» έξω από το χαρτί της προσφοράς · πλάνο πρέσας: μόνο ο Στράτος, μπλούζα απλωμένη στην πρέσα, πιο ρεαλιστικό · νέα φωνή Ρένας.
Timing sheet: `er02_vasilis_timing_sheet.md`.

