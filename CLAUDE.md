# Strategix Paper Engine — οδηγίες για Claude Code

Πηγή αλήθειας για κώδικα ΚΑΙ κανόνες = αυτό το repo. Κανόνες:
@STYLE_GUIDE.md
@HANDS.md

## Ρόλοι
- **Claude Code** (τοπικά, με git credentials): **όλη η παραγωγή** — επεισόδια από το σενάριο ως το MP4, engine (lib/stratos/hands/props/render/sfx), κανόνες (STYLE_GUIDE/HANDS), `BACKLOG.md`, commit + push.
- **claude.ai Project (chat)**: ιδέες και σενάρια, χωρίς clone/render. Επεισόδιο με κώδικα εκεί μόνο αν το ζητήσει ο Αλέξανδρος → `.patch` → εφαρμογή κατά το **CHAT.md**.

## Workflow επεισοδίου — 1 επεισόδιο = 1 session
1. `/clear` → σενάριο σε πίνακα (Χρόνος | Εικόνα | VO | Κείμενο/SFX) → έγκριση. Σενάριο, διάρκεια (§5.9) και VO κλειδώνουν **πριν** από τον κώδικα (αλλαγή μετά = ξανά χρονισμοί παντού).
2. VO (§5d): `node render.js vo` → σφίξιμο παυσών → `vo/<ep>_vo.mp3` + χρονισμοί φράσεων σε σχόλιο στην κορυφή του επεισοδίου.
3. Κώδικας (`node api.js`) → `node <ep>.js lint` ως «lint ✔ καθαρό» → ένα `sheet` → `preview t` μόνο εκεί που αλλάζει κάτι.
4. `node <ep>.js render` → MP4 στη ρίζα (εκτός git) → ο Αλέξανδρος το βλέπει και στέλνει **όλες τις σημειώσεις σε ένα μήνυμα** → ένας γύρος διορθώσεων + ένα render. Μόνο ήχος → `node <ep>.js sfx`.
5. `<ep>_timing_sheet.md` + εγγραφή στο `EPISODES.md` (+ `BACKLOG.md`) → `node regress.js` αν άλλαξε το engine → commit + push → αναφορά: όνομα MP4, commits. Μουσική: ο Αλέξανδρος στο CapCut.
- Παραδοτέο, safe zones, captions, Στράτος, κοινό, ισχυρισμοί → STYLE_GUIDE. Ελληνικά, σύντομα, μεθοδικά, English τεχνικοί όροι.

## Engine που βελτιώνεται — κανόνας 2ης φοράς
**Τα παλιά επεισόδια μένουν όπως παραδόθηκαν**: διόρθωση, render ή οπτικός έλεγχος σε παλιό επεισόδιο μόνο όταν το ζητήσει ο Αλέξανδρος. Κάθε ζητούμενη διόρθωση → στο επεισόδιο που ζητήθηκε + στο engine/κανόνες/lint, ώστε να ισχύει στα νέα. (Ο έλεγχος όλων των παλιών σε κάθε αλλαγή δεν κλιμακώνεται σε tokens.)

Ό,τι γράφεται ή διορθώνεται **2η φορά** πάει στο engine, ώστε το επόμενο επεισόδιο να το έχει έτοιμο:
- ίδιος κώδικας σε 2 επεισόδια → prop/helper στο engine (π.χ. `kostasLogo` → props, `duck()` → `DUCK` default στο render.js)
- ίδια ρύθμιση/διόρθωση 2 φορές → default στο engine, όχι copy-paste στο επεισόδιο
- ίδιο λάθος 2 φορές → lint rule (render/hands) ή κανόνας στο STYLE_GUIDE/HANDS
- νέο prop: 1η χρήση μέσα στο επεισόδιο · 2η → `props/<θέμα>.js` με σχόλιο περιγραφής (`node api.js --check`)
- ό,τι δεν χωράει τώρα → μία γραμμή στο `BACKLOG.md` (`[πηγή] πρόβλημα → πρόταση`)
- κάθε αλλαγή engine: συμβατή με τα παλιά επεισόδια (νέα option με default, όχι rename) + `node regress.js` → κανένα crash

## Οικονομία tokens
- Μοντέλο ανά session (`/model`): Opus για νέο επεισόδιο/engine · Sonnet για διορθώσεις, ήχο, render, git. Αλλαγή στην αρχή της session (στη μέση χάνεται το cache).
- Engine: `node api.js` (κατάλογος) → `node api.js <όνομα>` (αρχείο:γραμμή) → διάβασε μόνο αυτή τη συνάρτηση. Όχι ολόκληρα αρχεία του engine.
- `EPISODES.md` (log) και `BACKLOG.md` μόνο όταν χρειάζονται. `sheet` σε checkpoints, `preview t1 t2` για διορθώσεις.
- Ιδέες που πατάνε σε υπάρχοντα σκηνικά/props κοστίζουν λιγότερο από νέο σκηνικό.

## Κανόνες κώδικα
- Μόνο με το engine (lib.js, stratos.js, hands.js, props/, render.js, sfx.js). VO sources στο `vo/` (τα μόνα mp3 στο git). Νέο SFX preset → sfx.js (`P` + `GAIN`) + `node sfx.js demo`. Νέος τύπος χεριού → hands.js σε ΟΛΕΣ τις όψεις + `node hands.js sheet`.
- Αλλαγή στο engine → `node regress.js` (crash check σε όλα τα επεισόδια vs HEAD, συνοπτικό output).
- Αλλαγή κανόνα → STYLE_GUIDE/HANDS στο ΙΔΙΟ commit.
- Όχι render outputs στο git (MP4, sheets, previews, `regress/`) — βλ. .gitignore.
