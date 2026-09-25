# Strategix Paper Video Engine

## Αρχεία
| Αρχείο | Τι είναι |
|---|---|
| `CLAUDE.md` | Οδηγίες για το Claude Code: ρόλοι, workflow επεισοδίου (1 session), κανόνας 2ης φοράς, οικονομία tokens |
| `PROJECT_INSTRUCTIONS.md` | Το κείμενο για τα Instructions του claude.ai Project (bootstrap → `CHAT.md`) |
| `CHAT.md` | chat: ιδέες/σενάρια χωρίς clone · επεισόδιο κατ' εξαίρεση → `.patch` · εφαρμογή patch στο Claude Code |
| `STYLE_GUIDE.md` | Η «βίβλος»: αισθητική, παλέτα, fonts, Στράτος, κανόνες social, safe zones, SFX/VO, workflow |
| `HANDS.md` | Κανόνες χεριών/πόζας + lint |
| `EPISODES.md` | Log επεισοδίων (δεν φορτώνεται αυτόματα) |
| `BACKLOG.md` | Βελτιώσεις engine που περιμένουν |
| `lib.js` | Engine: torn-paper `cut()`, captions/`captionSeq`, pops, easing, lip-sync, fonts, `SAFE` |
| `stratos.js` | Ο Στράτος (rig v2). `node stratos.js` → character sheet PNG |
| `hands.js` | Χέρια v3: τύποι × όψεις, auto view, lint. `node hands.js sheet` → HANDS_SHEET.png |
| `props.js` + `props/` | Props ανά θέμα (`props/<θέμα>.js`)· όλα μαζί με `require('./props.js')` |
| `render.js` | Runner: sheet / preview / lint / render MP4 (+SFX, VO, ducking) / sfx (μόνο ήχος + remux) / vo (φράσεις + σφίξιμο παυσών του VO) |
| `sfx.js` | Procedural SFX: presets + mixer + WAV. `node sfx.js demo` → sfx_demo.wav |
| `api.js` | Κατάλογος του engine: `node api.js [λέξη]` · `--check` (περιγραφές props) |
| `regress.js` | Τι αλλάζει σε ΟΛΑ τα επεισόδια (lint · frames · ήχος) σε σχέση με ένα commit |
| `setup.sh` | Εγκατάσταση canvas + fonts σε νέο container |
| `ship.sh` | chat → repo: lint (+ regress αν άλλαξε το engine) + ένα `.patch` για `git am` στο Claude Code |
| `<ep>.js` + `<ep>_timing_sheet.md` | Επεισόδια — λίστα και σημειώσεις στο `EPISODES.md` |
| `vo/` | VO sources (τα μόνα mp3 στο git) |
| `stratos_character_sheet.png`, `stratos_v1_vs_v2.png` | Visual references του Στράτου |

## Ροή δουλειάς
- **Claude Code** (τοπικά): όλη η παραγωγή — σενάριο → VO → κώδικας → MP4 → commit + push, 1 επεισόδιο = 1 session (βλ. CLAUDE.md).
- **claude.ai Project**: ιδέες/σενάρια χωρίς clone· επεισόδιο με κώδικα μόνο κατ' εξαίρεση → `<ep>.patch` → Claude Code: `git am` + push (βλ. CHAT.md).

## Γρήγορη χρήση
```bash
bash setup.sh                           # μία φορά σε νέο μηχάνημα/container (canvas + fonts)
node api.js                             # τι υπάρχει στο engine (node api.js thermos → λεπτομέρειες + αρχείο:γραμμή)
node render.js vo ~/Downloads/vo.mp3    # φράσεις + παύσεις του VO (πριν γραφτεί το επεισόδιο)
node render.js vo ~/Downloads/vo.mp3 --gap 0.3 --keep 4 --out vo/ep02_vo.mp3 --at 0.2   # σφίξιμο παυσών → vo/ + χρονισμοί σε χρόνο video
node ep01_whatsapp_logo.js sheet        # 12 frames + safe-zone overlay + lint (sheet clean = χωρίς overlay)
node ep01_whatsapp_logo.js lint         # πρέπει «lint ✔ καθαρό»
node ep01_whatsapp_logo.js render       # MP4 με SFX + _sfx.wav + _sfx.md
node ep01_whatsapp_logo.js sfx          # μόνο ήχος (~1s) + remux στο MP4
node ep01_whatsapp_logo.js vo           # φράσεις του VO_FILE σε χρόνο video
node regress.js                         # μετά από αλλαγή στο engine: τι άλλαξε σε όλα τα επεισόδια vs HEAD
```

## Νέο επεισόδιο (template)
```js
const L = require('./lib.js'); const { lipsync, blinkNow } = L;
const { stratos } = require('./stratos.js'); const P = require('./props.js');
const VO = []; // lip-sync από την ένταση του VO_FILE
function s1(ctx, lt) { P.tiles(ctx); stratos(ctx, 540, 1100, 1, { legs: false, mouth: lipsync(VO), blink: blinkNow() });
  L.captionSeq(ctx, lt, [[0.1, 'Hook εδώ'], [2.4, 'Δεύτερο κομμάτι']]); P.seriesTag(ctx, lt, 'Όνομα σειράς'); } // χωρίς #N (STYLE_GUIDE §7)
require('./render.js')({ name: 'ep02', SCENES: [[s1, 4.5]], WIPES: 'all', VO_FILE: 'vo/ep02_vo.mp3', VO_AT: 0.2,
  SFX: [[0.3, 'pop'], [2.4, 'ding']] }); // wipes → auto whoosh · με VO → auto ducking των SFX
```
