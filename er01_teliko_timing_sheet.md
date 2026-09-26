# «Το Εργαστήριο» — Ποιο είναι το τελικό; · 29,9s · 1080×1920 30fps
VO: `vo/er01_vo.mp3` @ 0,2s — ElevenLabs `eleven_v3` **text-to-dialogue** (όλος ο διάλογος σε ένα generation), φωνές **Rena** (uyMSqzPImYXUvpPePfRo) · **Phoebus** (48Mn5ho3B0CDODzikmfy) · **Stratos** (4djcgN1Upzan46ZOCATJ), take 2/2 (`node vo.js er01`, κείμενο `vo/er01.txt`). Παύσεις → 0,3s (`--gap 0.3 --keep 18:0.03,19:0.6`): punchline κολλητά, 0,6s βλέμμα μετά. Ποιος μιλάει πότε: `vo/er01_vo.who.json` → `lipsync(VO, rest, 'rena' | 'phoebus' | 'stratos')`. Μουσική: CapCut.
SFX: ducking = default του render.js. Λίστα: `er01_teliko_sfx.md`.
Σκηνικά: κινητό της Ρένας (WhatsApp «Πελάτης», μόνο εικονίδιο) · υποδοχή (`reception()`) · δωμάτιο laser (`wallShelf` + `laserMachine` + notebook, όπως pf01). Mockumentary: hard cuts, snap zoom (0,12s), talking heads σε σταθερό κάδρο ανά χαρακτήρα (Φοίβος: laser `[700, 900, 1.6]` · Ρένα: `RECEPTION.cams.close` · Στράτος: `[390, 900, 2.05]`).
Captions διαλόγου: ταμπελάκι ομιλητή κάτω-αριστερά (Ρένα sky · Φοίβος brand blue · Στράτος navy) · seriesTag «Το Εργαστήριο» μόνο στο hook + στο τέλος.
Loop (§5.7) **seamless** (`LOOP: 'cut'`): frame 0 = κινητό με το `logo_final.pdf` + caption του hook + seriesTag · στο τέλος (νέα μέρα, άδειο chat) φτάνει ξανά ένα `logo_final.pdf`.

| Λήψη | Χρόνος | VO | Caption / εικόνα |
|---|---|---|---|
| A · Hook | 0,00–1,95 | 0,30 Ρ Ποιο απ' όλα είναι το τελικό; | κινητό: `logo_final.pdf` (17:52, από το frame 0) · `logo_final2.pdf` 0,55 · `logo_FINAL_final.pdf` 1,05 (`blip`) |
| B · TH Φοίβου | 1,95–4,30 | 2,07 Φ Όταν λείπει ο Στράτος, · 3,27 υπεύθυνος είμαι εγώ. | snap zoom (`zoom`) · δείχνει τον εαυτό του · lower third «Φοίβος · ο υπεύθυνος» |
| C1 · Ρένα | 4,30–5,42 | 4,47 Ρ Έστειλε τρία. | Ρένα στον πάγκο σηκώνει το κινητό |
| C2 · Κανόνας | 5,42–8,55 | 5,53 Φ Κανόνας: · 6,30 όσα περισσότερα final, · 7,73 τόσο πιο τελικό. | Φοίβος στον πάγκο, δάχτυλο ψηλά · «ΚΑΝΟΝΑΣ» (`stamp`) · 3 κάρτες αρχείων 6,30 · ✓ στο `FINAL_final` 7,73 (`ding`) |
| D1 · Laser | 8,55–11,45 | 8,73 Ρ Ήρθε κι άλλο! · 9,90 Φ Πιο τελικό. · 10,77 Αλλάζουμε! | κάρτα πάνω από το laser: `FINAL_final` → `final_FINAL_αυτό` 9,9 (`click`) · δείχνει · γροθιά |
| R · Ρένα insert | 11,45–12,20 | 11,57 Ρ Κι άλλο. | κούπα, βλέμμα στην κάμερα (deadpan) |
| D2 · Laser | 12,20–15,62 | 12,27 Ρ Σίγουρα final. · 13,60 Φ Το σίγουρα κερδίζει. · 14,80 Πάμε, μωρό μου! | κάρτα → `logo_ΣΙΓΟΥΡΑ_final.pdf` 12,27 (`blip`) · γυαλιά στα μάτια 13,6 · thumb · δείχνει το laser 14,8 (`beep`) |
| E · Στράτος | 15,62–17,72 | 15,73 Σ Στοπ! · 16,37 Ρώτησε κανείς τον πελάτη; | μπαίνει (`swoosh`) · παλάμη «stop» (`thud`) → shrug |
| F · Punchline | 17,72–19,18 | 17,87 Ρ Ρώτησα. Θέλει το πρώτο. (–19,13) | Ρένα με το κινητό · κάρτα `logo_final.pdf` ✓ 18,45 (`ding`) |
| G · Βλέμμα | 19,18–19,70 | — (0,6s) | snap zoom στον Φοίβο: σοκ, γυαλιά στο μέτωπο, βλέμμα στην κάμερα (`zoom` + `boing`) |
| H · Tip | 19,70–24,72 | 19,73 Σ Όχι final. · 20,77 Βάλε ημερομηνία στο όνομα. · 22,57 Κι εμείς ελέγχουμε κάθε αρχείο. (–24,50) | ✗ `logo_FINAL_final.pdf` 19,73 · ✓ `logo_26-09.pdf` 21,1 · ✓ «Ελέγχουμε» 22,8 · δάχτυλο → δείχνει → thumb |
| I · Tag | 24,72–26,92 | 24,83 Φ Νέος κανόνας: · 25,83 το πρώτο κερδίζει. | TH Φοίβου (snap zoom) · «ΝΕΟΣ ΚΑΝΟΝΑΣ» (`stamp`) · δάχτυλο ψηλά |
| J · CTA | 26,92–29,90 | 27,03 Ρ Κάνε tag τον Φοίβο της δουλειάς σου. (–28,90) | κινητό, άδειο chat · κουμπί «Κάνε tag» 27,43 (`click`) · 29,10 φεύγει το κουμπί, φτάνει `logo_final.pdf` (`blip`) + caption του hook + seriesTag |
| loop | 29,90–29,97 | — | 2 frames = frame 0 → κόψιμο (seamless) |

Stems: `er01_teliko_vo.wav` · `er01_teliko_sfx.wav` · `er01_teliko_mix.wav` (= ήχος του MP4).
