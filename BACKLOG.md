# Engine backlog

Ό,τι θέλει βελτίωση στο engine / στους κανόνες αλλά δεν χωράει στο τρέχον επεισόδιο. Μία γραμμή: `[πηγή] πρόβλημα → πρόταση`.
Το γράφει όποιος το βρει (chat ή Claude Code). Το Claude Code το υλοποιεί και **σβήνει τη γραμμή** (το ιστορικό μένει στο git). Βλ. «κανόνας 2ης φοράς» στο CLAUDE.md.

- [ad_plysi, pf01] Pre-v2: pip/CTA εκτός safe zone, χωρίς captionSeq / SFX cues, lint warnings (ad_plysi: thumb/point εκτός safe zone 14–19s · pf01: thumb δεν δείχνει πάνω 22,0s + 7 captions με 3+ γραμμές) → ένα pass θέσεων + captionSeq + SFX από το timing sheet πριν από νέο render (τα wipes έχουν ήδη auto whoosh).
- [pf03] Στο engine από το pm02: `screenFrame()` (τελάρο με `inner` στένσιλ) + `cuttingMat()` (props/screenprint.js). Μένουν inline στο pf03: stencil με ink (`stencilInner`, `inkBead`, `press`), `grip`, squeegee κάτοψη (≠ `squeegee` του pm01 → άλλο όνομα), `filmPositive`, `washer` → στην επόμενη χρήση τους → props/screenprint.js.
- [studio] Σκηνικά του πραγματικού χώρου: υποδοχή ✔ (`reception()`, props/studio.js) → επόμενα δωμάτιο laser, Roland SP-300V κ.λπ. από φωτογραφία του Αλέξανδρου, στο ίδιο αρχείο με `persp()` + `camAt()` · στη 2η χρήση θερμοπρέσας/φυτού έξω από την υποδοχή → prop (`heatPress()` · `palm()` υπάρχει ήδη).
- [ms01] Κάμερα με keyframes πάνω στο `o.cam` → στη 2η χρήση `camPath([[t, cam], ...], t)` σε props/studio.js (οι πόζες έγιναν ήδη `poseAt(POSES, t)` στο stratos.js, pm02).
- [pm02] 1η χρήση μέσα στο επεισόδιο: `dtfPrinter` (πρόσοψη, CMYK + W, film που βγαίνει), `film` DTF (πούδρα + ξεκόλλημα), `platen` (θερμοπρέσα κάτοψη + ατμός), `artwork` (demo σχέδιο 4 χρωμάτων με separations/ντεγκραντέ), `regMark` → στη 2η χρήση → props/dtf.js · props/logos.js.
- [pm02] Σκίσιμο οθόνης (`tearFrom`: η προηγούμενη σκηνή παγωμένη σκίζεται στη μέση) → στη 2η χρήση μετάβαση του render.js (π.χ. `TEARS: [sceneIndex]` δίπλα στα `WIPES`, auto `tear` SFX).
