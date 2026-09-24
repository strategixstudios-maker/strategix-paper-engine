# Strategix Paper Engine — οδηγίες για Claude (Claude Code & claude.ai Project)

Πηγή αλήθειας για κώδικα ΚΑΙ κανόνες = αυτό το repo. Κανόνες:
@STYLE_GUIDE.md
@HANDS.md

## Ρόλοι
- **Claude Code** (τοπικά, με git credentials): αλλαγές engine (lib/stratos/hands/props/render/sfx), κανόνες (STYLE_GUIDE/HANDS), `BACKLOG.md`, εφαρμογή patches από το chat, commit + push.
- **claude.ai Project (chat)**: `git clone` read-only → επεισόδια (+ μικρές, συμβατές αλλαγές engine που χρειάζεται το επεισόδιο). ΔΕΝ κάνει push. Στο τέλος: `bash ship.sh <ep> "<msg>"` → ένα `<ep>.patch`.

## Εφαρμογή patch από το chat (Claude Code)
1. `git pull --ff-only`
2. `git am <file>.patch`. Αν αποτύχει: `git am --abort`, δείξε τη σύγκρουση, ΠΟΤΕ force/overwrite.
3. `bash setup.sh` (αν λείπουν deps) → `node regress.js origin/main` = τι άλλαξε το patch σε ΟΛΑ τα επεισόδια (lint · frames · ήχος). Νέο crash / νέο lint warning → stop. Οπτική/ηχητική αλλαγή σε επεισόδιο που δεν αφορά το patch → δείξ' τη (`regress/<ep>.png`) πριν το push.
4. `git push` και σύντομη αναφορά: commits, αρχεία, regress, νέες γραμμές στο `BACKLOG.md`.

## Engine που βελτιώνεται — κανόνας 2ης φοράς
Ό,τι γράφεται ή διορθώνεται **2η φορά** πάει στο engine, ώστε το επόμενο επεισόδιο να το έχει έτοιμο:
- ίδιος κώδικας σε 2 επεισόδια → prop/helper στο engine (π.χ. `kostasLogo` → props, `duck()` → `DUCK` default στο render.js)
- ίδια ρύθμιση/διόρθωση 2 φορές → default στο engine, όχι copy-paste στο επεισόδιο
- ίδιο λάθος 2 φορές → lint rule (render/hands) ή κανόνας στο STYLE_GUIDE/HANDS
- νέο prop: 1η χρήση μέσα στο επεισόδιο · 2η → `props/<θέμα>.js` με σχόλιο περιγραφής (`node api.js --check`)
- ό,τι δεν χωράει τώρα → μία γραμμή στο `BACKLOG.md` (`[πηγή] πρόβλημα → πρόταση`)
- κάθε αλλαγή engine: συμβατή με τα παλιά επεισόδια (νέα option με default, όχι rename) + `node regress.js` → καμία ακούσια αλλαγή

## Οικονομία context
- Engine: `node api.js` (κατάλογος) → `node api.js <όνομα>` (αρχείο:γραμμή) → διάβασε μόνο αυτή τη συνάρτηση. Όχι ολόκληρα αρχεία του engine.
- `EPISODES.md` (log) και `BACKLOG.md` μόνο όταν χρειάζονται. Μία συνομιλία ανά επεισόδιο. `sheet` σε checkpoints, `preview t1 t2` για διορθώσεις.

## Κανόνες κώδικα
- Μόνο με το engine (lib.js, stratos.js, hands.js, props/, render.js, sfx.js). VO sources στο `vo/` (τα μόνα mp3 στο git). Νέο SFX preset → sfx.js (`P` + `GAIN`) + `node sfx.js demo`. Νέος τύπος χεριού → hands.js σε ΟΛΕΣ τις όψεις + `node hands.js sheet`.
- Αλλαγή στο engine → `node regress.js` (όλα τα επεισόδια vs HEAD: lint, frames, ήχος).
- Αλλαγή κανόνα → STYLE_GUIDE/HANDS στο ΙΔΙΟ commit.
- Όχι render outputs στο git (MP4, sheets, previews, `regress/`) — βλ. .gitignore.

## Workflow επεισοδίου (chat)
Σενάριο (Χρόνος | Εικόνα | VO | Κείμενο/SFX) → έγκριση → VO στη φωνή Stratos → upload MP3 → κώδικας (`node api.js`) → `sheet` (safe zones + lint) → `lint` καθαρό → `render` MP4 με SFX + timing sheet VO (+ auto `_sfx.md`) → εγγραφή στο `EPISODES.md` → `ship.sh` (lint + regress αν άλλαξε το engine).
- MP4 1080×1920 30fps με VO (ElevenLabs «Stratos», `vo/<ep>_vo.mp3`, STYLE_GUIDE §5d) + SFX από `sfx.js` (§5c, ducking αυτόματα κάτω από το VO) + stems `_vo.wav`/`_sfx.wav`· μουσική την κάνει ο Αλέξανδρος.
- Κείμενα/CTA/πρόσωπο/προϊόν μέσα στο safe box· captions max 2 γραμμές (`captionSeq`).
- Host ο Στράτος (mascot, όχι ο Αλέξανδρος). Κοινό: πιθανοί πελάτες & γραφίστες, όχι τυπογραφεία. Όχι ανεπιβεβαίωτοι ισχυρισμοί/αριθμοί.
- Ελληνικά, σύντομα, μεθοδικά, English τεχνικοί όροι.
