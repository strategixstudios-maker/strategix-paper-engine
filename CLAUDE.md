# Strategix Paper Engine — οδηγίες για Claude (Claude Code & claude.ai Project)

Πηγή αλήθειας για κώδικα ΚΑΙ κανόνες = αυτό το repo. Κανόνες:
@STYLE_GUIDE.md
@HANDS.md

## Ρόλοι
- **Claude Code** (τοπικά, με git credentials): αλλαγές engine (lib/stratos/hands/props/render), κανόνες (STYLE_GUIDE/HANDS), εφαρμογή patches από το chat, commit + push.
- **claude.ai Project (chat)**: `git clone` read-only → επεισόδια. ΔΕΝ κάνει push. Στο τέλος: `bash ship.sh <ep> "<msg>"` → ένα `<ep>.patch`.

## Εφαρμογή patch από το chat (Claude Code)
1. `git pull --ff-only`
2. `git am <file>.patch`. Αν αποτύχει: `git am --abort`, δείξε τη σύγκρουση, ΠΟΤΕ force/overwrite.
3. `bash setup.sh` (αν λείπουν deps) → `node <ep>.js lint` για όσα επεισόδια άλλαξαν → «lint ✔ καθαρό».
4. `git push` και σύντομη αναφορά: commits, αρχεία, lint.

## Κανόνες κώδικα
- Μόνο με το engine (lib.js, stratos.js, hands.js, props.js, render.js, sfx.js). VO sources στο `vo/` (τα μόνα mp3 στο git). Νέο SFX preset → sfx.js (`P` + `GAIN`) + `node sfx.js demo`. Νέα reusable props → props.js. Νέος τύπος χεριού → hands.js σε ΟΛΕΣ τις όψεις + `node hands.js sheet`.
- Αλλαγή στο engine → τρέξε `lint`/`sheet` στα επεισόδια που επηρεάζονται, να μη σπάσει κάτι παλιό.
- Αλλαγή κανόνα → STYLE_GUIDE/HANDS στο ΙΔΙΟ commit.
- Όχι render outputs στο git (MP4, sheets, previews) — βλ. .gitignore.

## Workflow επεισοδίου (chat)
Σενάριο (Χρόνος | Εικόνα | VO | Κείμενο/SFX) → έγκριση → VO στη φωνή Stratos → upload MP3 → κώδικας → `sheet` (safe zones + lint) → `lint` καθαρό → `render` MP4 με SFX + timing sheet VO (+ auto `_sfx.md`) → episode log στο STYLE_GUIDE §8 → `ship.sh`.
- MP4 1080×1920 30fps με VO (ElevenLabs «Stratos», `vo/<ep>_vo.mp3`, STYLE_GUIDE §5d) + SFX από `sfx.js` (§5c) + stems `_vo.wav`/`_sfx.wav`· μουσική την κάνει ο Αλέξανδρος.
- Κείμενα/CTA/πρόσωπο/προϊόν μέσα στο safe box· captions max 2 γραμμές (`captionSeq`).
- Host ο Στράτος (mascot, όχι ο Αλέξανδρος). Κοινό: πιθανοί πελάτες & γραφίστες, όχι τυπογραφεία. Όχι ανεπιβεβαίωτοι ισχυρισμοί/αριθμοί.
- Ελληνικά, σύντομα, μεθοδικά, English τεχνικοί όροι.
