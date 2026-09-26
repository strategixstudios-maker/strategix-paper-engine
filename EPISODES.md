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
