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
Timing sheet: `pf02_timing_sheet.md`.

### ORGANIC — «Πριν / Μετά» · Η τζαμαρία (16,8s) · `pm01_vitrina.js`
Split Α (άδειο τζάμι) | Β (ANNA CAFÉ σε βινύλιο) → montage plotter → weeding → transfer tape → τζάμι → περαστικός σταματάει στο Β, μέρα → νύχτα (φωτισμένο τζάμι) → CTA comment bait «Α ή Β; Και γιατί;» πάνω στο ίδιο split (αόρατο loop). Ξεκίνησε ως «Weeding ASMR» — ο ψίθυρος στο VO βγήκε cringe, κράτησα μόνο assets + ήχους.
Νέα SFX presets: `plotter`, `peel` (`speed`), `squeegee` (`strokes`). Νέα props στο επεισόδιο (1η χρήση): vinyl layers (`logoC`/`accOnly`/`wasteLayer`/`tapeLayer`), γενικό `peel()` (καθρεφτισμένο flap), `sheet`, `plotterRail`, `squeegee`, `pencil`, `shopfront`/`onGlass`, `shop`/`street`/`awning`, `splitLabels`, `walker`.
Timing sheet: `pm01_timing_sheet.md`.
