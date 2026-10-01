# Μουσική — λεπτομέρειες (STYLE_GUIDE §5e)

Μεταφέρθηκε αυτούσιο από το STYLE_GUIDE.md (2026-10-01) για να μη φορτώνεται σε κάθε βήμα. Ισχύει όπως και ο πυρήνας· όπου το STYLE_GUIDE λέει κάτι νεότερο, ισχύει το STYLE_GUIDE.

## 5e. Μουσική — ElevenLabs Music (`music.js`)
- Instrumental χαλί σε **κάθε νέο επεισόδιο**, πολύ χαμηλά κάτω από τη φωνή (από το 2026-09-28· πριν: CapCut). Τα παλιά επεισόδια μένουν χωρίς, εκτός αν το ζητήσει ο Αλέξανδρος.
- `node music.js <ep>` → `music/<ep>.mp3` (στο git) στη διάρκεια του επεισοδίου (`node <ep>.js info`) + 1s. Ύφος **κλειδωμένο** (`STYLE` στο music.js: ζεστό, ελαφρύ, ακουστικό, χωρίς φωνητικά/drops) + διάθεση ανά σειρά (`MOOD`: er κωμικό mockumentary · pf ήρεμο lo-fi εργαστηρίου · ms φωτεινό · pm before/after reveal · ad upbeat) ή `music/<ep>.txt` για ένα επεισόδιο. Μοντέλο `music_v2_5`, `force_instrumental`.
- Στο επεισόδιο: `MUSIC_FILE: 'music/<ep>.mp3'` (+ `MUSIC_GAIN`, 1 = default). Το render κανονικοποιεί την ένταση (≈ −32 dBFS, ~15 dB κάτω από το VO) → ίδια σε κάθε επεισόδιο, άλλα −6 dB κάτω από τις φράσεις του VO, fade in 0,3s / out 0,8s. Ο Αλέξανδρος την ακούει στο κανονικό render, μαζί με τις υπόλοιπες σημειώσεις. «Πιο δυνατά / πιο σιγά» → `MUSIC_GAIN` · άλλη αίσθηση → `music/<ep>.txt` + `node music.js <ep> --force` · μόνο ήχος → `node <ep>.js sfx`.
- Αλλαγή διάρκειας μετά τη μουσική → lint warning (το αρχείο τελειώνει πριν το video) → ξανά `node music.js <ep> --force`.
- Εμπορική χρήση online (IG/TikTok/YouTube/FB) επιτρέπεται σε όλα τα **paid** πλάνα του ElevenLabs, χωρίς attribution (Eleven Music Model-Specific Terms· εξαιρούνται film/TV/radio/games).
