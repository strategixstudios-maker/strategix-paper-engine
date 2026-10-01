# Strategix Paper Engine — οδηγίες για Claude Code

Πηγή αλήθειας για κώδικα ΚΑΙ κανόνες = αυτό το repo. Κανόνες:
@STYLE_GUIDE.md
@HANDS.md

## Ρόλοι
- **Claude Code** (τοπικά, με git credentials): **όλη η παραγωγή** — επεισόδια από το σενάριο ως το MP4, engine (lib/stratos/hands/props/render/sfx · χάρτης: `ENGINE.md`), κανόνες (STYLE_GUIDE/HANDS + `docs/`), `BACKLOG.md`, commit + push, δημοσίευση (Postiz · `publish.js` · skill `postiz`).
- **claude.ai Project (chat)**: ιδέες και σενάρια, χωρίς clone/render. Επεισόδιο με κώδικα εκεί μόνο αν το ζητήσει ο Αλέξανδρος → `.patch` → εφαρμογή κατά το **CHAT.md**.

## Workflow επεισοδίου — φάσεις = μικρά sessions (/clear ανάμεσα)
Κάθε βήμα ξαναδιαβάζει ΟΛΟ το context· μετά το 1ο render ήταν ~337K tokens ανά βήμα = το μισό κόστος του επεισοδίου (μέτρηση 2026-10-01). Ό,τι χρειάζεται η επόμενη φάση ζει σε αρχεία (`scripts/<ep>.md`, `vo/`, σκελετός `<ep>.js`), όχι στη συζήτηση → `/clear` ανάμεσα στις φάσεις, χωρίς απώλεια ποιότητας.
**Ο οδηγός είναι το engine**: render · check · sfx · vo · new · wrap · publish τυπώνουν «▶ ΕΠΟΜΕΝΟ» (/clear · /effort · τι γράφει ο Αλέξανδρος) → **μετέφερέ το αυτούσιο στο τέλος της απάντησης** (ο Αλέξανδρος δεν θυμάται τα βήματα). «Τι κάνω τώρα;» → `node next.js [ep]`.

| Φάση | Ο Αλέξανδρος γράφει (μετά από /clear) | /effort | Τι κάνει ο Claude | Τέλος |
|---|---|---|---|---|
| 1 Σενάριο + VO | «νέο επεισόδιο: <ιδέα>» | high | `docs/scripts.md` (δομή/formats) → σενάριο σε πίνακα (Χρόνος · Εικόνα · VO · Κείμενο/SFX) + διάρκεια (§5.9) → έγκριση → `scripts/<ep>.md` (πίνακας + αποφάσεις) → `vo/<ep>.txt` → `node vo.js <ep>` (2 takes + Scribe) → «take N» → `node render.js vo <ep>_takeN.mp3 --gap 0.3 --out vo/<ep>_vo.mp3 --at 0.2` → `node new.js <ep>_<όνομα>` → `node music.js <ep>` | ▶ /clear → «<ep>: κώδικας» |
| 2 Κώδικας | «<ep>: κώδικας» | high | `scripts/<ep>.md` + σκελετός `<ep>.js` + `ENGINE.md` (όχι παλιό επεισόδιο) → style frames (2–4 βασικά καρέ σε ένα `preview` grid) όπου το πλάνο είναι νέο/δύσκολο → κώδικας → `check` ως «lint ✔ καθαρό» → `preview` μόνο όπου άλλαξε κάτι → `render` | ▶ /clear → «<ep>: σημειώσεις: …» ή «<ep>: προχώρα» |
| 3 Σημειώσεις | «<ep>: σημειώσεις: …» (ΟΛΕΣ σε ένα μήνυμα) | medium · high αν ζητάνε νέα σκηνή/κίνηση | `node next.js <ep>` + μόνο τα κομμάτια του κώδικα που αφορούν οι σημειώσεις (`grep -n`, `sed -n`) → ένας γύρος διορθώσεων + ένα render (μόνο ήχος: `node <ep>.js sfx`) | ▶ «σημειώσεις» ξανά ή «προχώρα» |
| 3 Προχώρα | «<ep>: προχώρα» | medium | `node wrap.js <ep>` (timing sheet: συμπλήρωσε μόνο τη στήλη «Εικόνα» · εγγραφή EPISODES + BACKLOG) → `node regress.js` αν άλλαξε το engine → commit + push → λεζάντα (§9) → `node publish.js schedule <ep> publish/captions/<ep>.json` (επόμενο ελεύθερο slot, τέλος ουράς) → commit `publish/log.json` → αναφορά: MP4, commits, ημερομηνία + λεζάντα | ▶ /clear → «νέο επεισόδιο: …» |
| Engine | «engine: <τι>» | high | **πάντα σε δικό του session**, ποτέ μέσα σε επεισόδιο (εκεί: μία γραμμή στο `BACKLOG.md`) → `node regress.js` → commit | — |

- **Σειρά δημοσίευσης**: ό,τι τελειώνει μπαίνει στο τέλος της ουράς. **Καμία μετακίνηση/αναδιάταξη** (ούτε ανά είδος). Μόνο όταν ο Αλέξανδρος πει «βάλε το <ep> στις <ημερομηνία>» → `schedule … --date YYYY-MM-DD` (νέο) ή `node publish.js move <ep> YYYY-MM-DD` (ήδη scheduled), πρώτα με `--dry`.
- Σενάριο, διάρκεια και VO κλειδώνουν **πριν** από τον κώδικα (αλλαγή μετά = ξανά χρονισμοί παντού). Δημοσίευση **μόνο μετά το «προχώρα» για το συγκεκριμένο MP4**.
- Αν μια φάση τραβήξει πολύ (πολλοί γύροι, μεγάλο context) → πρότεινε `/clear` και συνέχεια με την ίδια φράση· όλα είναι ήδη στα αρχεία.
- Παραδοτέο, safe zones, captions, Στράτος, κοινό, ισχυρισμοί → STYLE_GUIDE (+ `docs/` όταν το βήμα το χρειάζεται). Ελληνικά, σύντομα, μεθοδικά, English τεχνικοί όροι.

## Engine που βελτιώνεται — κανόνας 2ης φοράς
**Τα παλιά επεισόδια μένουν όπως παραδόθηκαν**: διόρθωση, render ή οπτικός έλεγχος σε παλιό επεισόδιο μόνο όταν το ζητήσει ο Αλέξανδρος. Κάθε ζητούμενη διόρθωση → στο επεισόδιο που ζητήθηκε + στο engine/κανόνες/lint, ώστε να ισχύει στα νέα. (Ο έλεγχος όλων των παλιών σε κάθε αλλαγή δεν κλιμακώνεται σε tokens.)

Ό,τι γράφεται ή διορθώνεται **2η φορά** πάει στο engine, ώστε το επόμενο επεισόδιο να το έχει έτοιμο:
- ίδιος κώδικας σε 2 επεισόδια → prop/helper στο engine (π.χ. `kostasLogo` → props, `duck()` → `DUCK` default στο render.js)
- ίδια ρύθμιση/διόρθωση 2 φορές → default στο engine, όχι copy-paste στο επεισόδιο
- ίδιο λάθος 2 φορές → lint rule (render/hands) ή κανόνας στο STYLE_GUIDE/HANDS
- νέο prop: 1η χρήση μέσα στο επεισόδιο · 2η → `props/<θέμα>.js` με σχόλιο περιγραφής (`node api.js --check`)
- ό,τι δεν χωράει τώρα → μία γραμμή στο `BACKLOG.md` (`[πηγή] πρόβλημα → πρόταση`)
- κάθε αλλαγή engine: συμβατή με τα παλιά επεισόδια (νέα option με default, όχι rename) + `node regress.js` → κανένα crash

## Οικονομία tokens (χωρίς έκπτωση στην ποιότητα)
- **Μοντέλο**: Opus σε όλες τις φάσεις (ποιότητα)· η διαφορά γίνεται με το `/effort` ανά φάση (πίνακας πάνω). Το Sonnet 5.5 έχει ίδια τιμή cache read με το Opus 5.5 → γλιτώνει μόνο output, και μόνο σε νέο session (αλλαγή στη μέση = χάνεται το cache).
- **Engine**: `node api.js` (συνοπτικός, ~4KB) → `node api.js <όνομα>` (αρχείο:γραμμή) → διάβασε μόνο αυτή τη συνάρτηση. Όχι ολόκληρα αρχεία του engine, όχι παλιό επεισόδιο ως πρότυπο (σκελετός `new.js` + `ENGINE.md`).
- **Εικόνες** (κάθε εικόνα μένει στο context ως το τέλος του session): `check` (lint + sheet) σε checkpoints · `preview t1 t2 t3` = ΕΝΑ grid · `preview t --crop x,y,w,h` για λεπτομέρεια (χέρια, κείμενο).
- `EPISODES.md`, `BACKLOG.md`, `docs/*.md`: μόνο όταν χρειάζονται, με `grep`/`tail` όπου γίνεται. Ανεξάρτητες εντολές σε ένα Bash call.
- Ιδέες που πατάνε σε υπάρχοντα σκηνικά/props κοστίζουν λιγότερο από νέο σκηνικό.

## Κανόνες κώδικα
- Μόνο με το engine (lib.js, stratos.js, hands.js, props/, render.js, sfx.js). VO sources στο `vo/`, μουσική στο `music/` (τα μόνα mp3 στο git, μαζί με το `sfx/`). Νέο SFX preset → sfx.js (`P` + `GAIN`) + `node sfx.js demo`. Νέος τύπος χεριού → hands.js σε ΟΛΕΣ τις όψεις + `node hands.js sheet`.
- Αλλαγή στο engine → `node regress.js` (crash check σε όλα τα επεισόδια vs HEAD, συνοπτικό output).
- `render` / `lint` τρέχουν παράλληλα (`JOBS`, default πυρήνες − 1, max 6 · `JOBS=1` = σειριακά): τα frames είναι stateless (§1b), άρα κάθε frame βγαίνει ίδιο σε όποιο process κι αν ζωγραφιστεί. Στη μακέτα το lint παραλείπει σκιές/DOF/φως (ίδια warnings, ~7× γρηγορότερο · `LINT_FULL=1` = πλήρες).
- Αλλαγή κανόνα → STYLE_GUIDE/HANDS στο ΙΔΙΟ commit.
- Όχι render outputs στο git (MP4, sheets, previews, `regress/`) — βλ. .gitignore.
