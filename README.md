# Strategix Paper Video Engine

## Αρχεία
| Αρχείο | Τι είναι |
|---|---|
| `CLAUDE.md` | Οδηγίες για Claude (Code + chat): ρόλοι, εφαρμογή patch, κανόνες κώδικα, workflow |
| `PROJECT_INSTRUCTIONS.md` | Το κείμενο για τα Instructions του claude.ai Project (bootstrap μόνο) |
| `STYLE_GUIDE.md` | Η «βίβλος»: αισθητική, παλέτα, fonts, Στράτος, κανόνες social, safe zones, workflow, episode log |
| `HANDS.md` | Κανόνες χεριών/πόζας + lint |
| `lib.js` | Engine: torn-paper `cut()`, captions/`captionSeq`, pops, easing, lip-sync, fonts, `SAFE` |
| `stratos.js` | Ο Στράτος (rig v2). `node stratos.js` → character sheet PNG |
| `hands.js` | Χέρια v3: τύποι × όψεις, auto view, lint. `node hands.js sheet` → HANDS_SHEET.png |
| `props.js` | Επαναχρησιμοποιούμενα props |
| `render.js` | Runner: sheet / preview / lint / render MP4 |
| `setup.sh` | Εγκατάσταση canvas + fonts σε νέο container |
| `ship.sh` | chat → repo: lint gate + ένα `.patch` για `git am` στο Claude Code |
| `ad_plysi.js` | AD «Η πλύση» (φούτερ DTF) |
| `ep01_whatsapp_logo.js` | «Ο πελάτης είπε...» #1 |
| `pf01_notebook_laser.js` + `pf01_timing_sheet.md` | «Πώς φτιάχνεται;» #1 Χάραξη σε notebook |
| `ad_konkardes_legacy.js` | AD κονκάρδες (standalone, πριν τον Στράτο) |
| `ad_konkardes_test.js` | Test κονκάρδων |
| `stratos_character_sheet.png`, `stratos_v1_vs_v2.png` | Visual references του Στράτου |

## Ροή δουλειάς
- **Claude Code** (τοπικά): αλλαγές engine/κανόνων → commit → push.
- **claude.ai Project**: clone → επεισόδιο → `bash ship.sh <ep> "<msg>"` → `<ep>.patch` → Claude Code: `git am` + push.

## Γρήγορη χρήση
```bash
git clone https://github.com/strategixstudios-maker/strategix-paper-engine /home/claude/engine && cd /home/claude/engine && bash setup.sh
node ep01_whatsapp_logo.js sheet        # 12 frames + safe-zone overlay + lint (sheet clean = χωρίς overlay)
node ep01_whatsapp_logo.js lint         # πρέπει «lint ✔ καθαρό»
node ep01_whatsapp_logo.js render       # MP4
```

## Νέο επεισόδιο (template)
```js
const L = require('./lib.js'); const { lipsync, blinkNow } = L;
const { stratos } = require('./stratos.js'); const P = require('./props.js');
const VO = [[0.2, 2.0], [2.4, 4.5]];
function s1(ctx, lt) { P.tiles(ctx); stratos(ctx, 540, 1100, 1, { legs: false, mouth: lipsync(VO), blink: blinkNow() });
  L.captionSeq(ctx, lt, [[0.1, 'Hook εδώ'], [2.4, 'Δεύτερο κομμάτι']]); P.seriesTag(ctx, lt, 'Σειρά #N'); }
require('./render.js')({ name: 'ep02', SCENES: [[s1, 4.5]], WIPES: 'all' });
```
