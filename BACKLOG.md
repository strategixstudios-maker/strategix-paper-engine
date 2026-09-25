# Engine backlog

Ό,τι θέλει βελτίωση στο engine / στους κανόνες αλλά δεν χωράει στο τρέχον επεισόδιο. Μία γραμμή: `[πηγή] πρόβλημα → πρόταση`.
Το γράφει όποιος το βρει (chat ή Claude Code). Το Claude Code το υλοποιεί και **σβήνει τη γραμμή** (το ιστορικό μένει στο git). Βλ. «κανόνας 2ης φοράς» στο CLAUDE.md.

- [ad_plysi, pf01] Pre-v2: pip/CTA εκτός safe zone, χωρίς captionSeq / SFX cues, lint warnings (ad_plysi: thumb/point εκτός safe zone 14–19s · pf01: thumb δεν δείχνει πάνω 22,0s + 7 captions με 3+ γραμμές) → ένα pass θέσεων + captionSeq + SFX από το timing sheet πριν από νέο render (τα wipes έχουν ήδη auto whoosh).
- [pf03] Πρώτη μεταξοτυπία → όλα τα screenprint props μέσα στο επεισόδιο (matBG cutting mat, frame/screen states mesh|emulsion|film|stencil, stencilInner + inkBead + press (τελάρο στο tee, σηκώνεται μαζί με ό,τι έχει πάνω), grip (χέρι στη λαβή), squeegee (≠ `squeegee` του pm01 = ράκλα βινυλίου → άλλο όνομα στο props/), filmPositive, washer (πιστόλι πιεστικού + πίδακας + σταγόνες, reveal εκεί που περνάει)). Στη 2η μεταξοτυπία → `props/screenprint.js` (+ `node api.js --check`). Το t-shirt είναι ήδη στο engine: `tshirt()` (props/textile.js).
