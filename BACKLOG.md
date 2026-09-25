# Engine backlog

Ό,τι θέλει βελτίωση στο engine / στους κανόνες αλλά δεν χωράει στο τρέχον επεισόδιο. Μία γραμμή: `[πηγή] πρόβλημα → πρόταση`.
Το γράφει όποιος το βρει (chat ή Claude Code). Το Claude Code το υλοποιεί και **σβήνει τη γραμμή** (το ιστορικό μένει στο git). Βλ. «κανόνας 2ης φοράς» στο CLAUDE.md.

- [ad_plysi, pf01] Pre-v2: pip/CTA εκτός safe zone, χωρίς captionSeq / SFX cues, lint warnings (ad_plysi: thumb/point εκτός safe zone 14–19s · pf01: thumb δεν δείχνει πάνω 22,0s) → ένα pass θέσεων + captionSeq + SFX από το timing sheet πριν από νέο render (τα wipes έχουν ήδη auto whoosh).
- [DUCK, render.js] Οι φράσεις του VO βγαίνουν πλέον αυτόματα (`VO.phr`, ίδιο αποτέλεσμα με το silence detect του chat στα ad_afisa/pf02) → mode `node ep.js vo` που τυπώνει τους χρονισμούς για το σχόλιο/timing sheet, αντί για χειροκίνητο silence detect στο chat.
- [pf02, wallShelf] Caption 2 γραμμών κρύβει τα ρολά του `wallShelf` (5,2s), ίδιο με το ep01 που λύθηκε με `wallShelf(ctx, { y: 640 })` · στα 7,3s caption 3 γραμμών → default `y: 640` στο engine (2η φορά· αλλάζει και το pf01, έλεγχος με regress) + captionSeq στα 7,3s.
