# Strategix Paper Video Engine

## Αρχεία
| Αρχείο | Τι είναι |
|---|---|
| `CLAUDE.md` | Οδηγίες για το Claude Code: φάσεις επεισοδίου (μικρά sessions με /clear), κανόνας 2ης φοράς, οικονομία tokens |
| `ENGINE.md` | Χάρτης του engine σε 2 λεπτά + ανατομία επεισοδίου |
| `STYLE_GUIDE.md` + `docs/` | Η «βίβλος» (πυρήνας) + λεπτομέρειες ανά βήμα: vo · sfx · music · photos · crew · publish |
| `HANDS.md` | Κανόνες χεριών/πόζας + lint |
| `PROJECT_INSTRUCTIONS.md` · `CHAT.md` | claude.ai Project: ιδέες/σενάρια χωρίς clone · επεισόδιο κατ' εξαίρεση → `.patch` |
| `EPISODES.md` · `BACKLOG.md` | Log επεισοδίων · βελτιώσεις engine σε αναμονή (δεν φορτώνονται αυτόματα) |
| `next.js` | **Τι κάνω τώρα;** Φάση κάθε επεισοδίου + «▶ ΕΠΟΜΕΝΟ» (/clear · /effort · τι γράφεις) |
| `new.js` · `wrap.js` | Σκελετός νέου επεισοδίου (VO → captions, σκηνές, loop) · timing sheet + EPISODES στο κλείσιμο |
| `lib.js` | Πυρήνας: torn-paper `cut()`, captions, pops, easing, lip-sync, `voText()` (χρόνοι λέξεων + captions από το VO), fonts, `SAFE` |
| `motion.js` | Κίνηση με φυσική: springs, trapez/raster, lag, shake, fall, particles, `kf`, `rewindTau` |
| `stratos.js` · `crew.js` · `hands.js` | Στράτος (rig v2) · Φοίβος & Ρένα · χέρια v4 (`node hands.js sheet`) |
| `diorama.js` | Χάρτινη μακέτα 3D: κάμερα, φως, σκιές, βάθος πεδίου, motion blur |
| `props.js` + `props/` | Props ανά θέμα (`props/<θέμα>.js`)· όλα μαζί με `require('./props.js')` |
| `render.js` | Runner: check / sheet / preview / lint / render MP4 (+VO, μουσική, SFX, ducking) / sfx / vo |
| `sfx.js` · `vo.js` · `music.js` · `photos.js` · `publish.js` | Procedural SFX · VO «Stratos» + έλεγχος Scribe · μουσική · φωτογραφίες προϊόντων · Postiz |
| `api.js` · `regress.js` | Κατάλογος του engine (`node api.js [λέξη]`) · έλεγχος όλων των επεισοδίων μετά από αλλαγή engine |
| `setup.sh` · `ship.sh` | Εγκατάσταση canvas + fonts · chat → `.patch` |
| `<ep>.js` + `<ep>_timing_sheet.md` | Επεισόδια — λίστα στο `EPISODES.md` |
| `scripts/` · `vo/` · `music/` · `sfx/` · `photos/` | Σενάρια (φάση 1) · VO sources · μουσική · ήχοι-αρχεία · φωτογραφίες (στο git) |

## Ροή δουλειάς
- **Claude Code** (τοπικά): όλη η παραγωγή — σενάριο → VO → κώδικας → MP4 → commit + push, 1 επεισόδιο = 1 session (βλ. CLAUDE.md).
- **claude.ai Project**: ιδέες/σενάρια χωρίς clone· επεισόδιο με κώδικα μόνο κατ' εξαίρεση → `<ep>.patch` → Claude Code: `git am` + push (βλ. CHAT.md).

## Γρήγορη χρήση
```bash
bash setup.sh                     # μία φορά σε νέο μηχάνημα (canvas + fonts)
node next.js                      # τι κάνω τώρα; (φάση + επόμενο βήμα)
node vo.js pf07                   # VO: 2 takes + έλεγχος Scribe
node render.js vo pf07_take1.mp3 --gap 0.3 --out vo/pf07_vo.mp3 --at 0.2
node new.js pf07_kouppes          # σκελετός επεισοδίου (μακέτα · --look flat)
node pf07_kouppes.js check        # lint + sheet → «lint ✔ καθαρό»
node pf07_kouppes.js preview 1.2 5 9      # ένα grid · --crop x,y,w,h για λεπτομέρεια
node pf07_kouppes.js render       # MP4 + ήχος · μόνο ήχος: sfx
node wrap.js pf07                 # timing sheet + EPISODES
node api.js                       # κατάλογος του engine (node api.js <λέξη> → λεπτομέρειες)
node regress.js                   # μετά από αλλαγή στο engine
```
Ανατομία επεισοδίου → `ENGINE.md`.
