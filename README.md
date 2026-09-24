# Strategix Paper Video Engine

## Αρχεία
| Αρχείο | Τι είναι |
|---|---|
| `STYLE_GUIDE.md` | Η «βίβλος»: αισθητική, παλέτα, fonts, Στράτος, κανόνες social, workflow, episode log |
| `lib.js` | Engine: torn-paper `cut()`, captions, pops, easing, lip-sync, fonts |
| `stratos.js` | Ο Στράτος (rig v2: μανίκια, αγκώνες, χέρια παλάμη/ράχη). `node stratos.js` → character sheet PNG |
| `props.js` | Επαναχρησιμοποιούμενα props: φούτερ, πλυντήριο, κούπα, ρολόι, chat bubbles, stamps, CTA, PiP, χέρια |
| `render.js` | Runner: sheet / preview / render MP4 |
| `ad_plysi.js` | AD «Η πλύση» (φούτερ DTF) |
| `ep01_whatsapp_logo.js` | «Ο πελάτης είπε...» #1 |
| `ad_konkardes_legacy.js` | AD κονκάρδες (standalone, πριν τον Στράτο) |
| `setup.sh` | Εγκατάσταση canvas + fonts σε νέο container |
| `stratos_character_sheet.png` | Visual reference του Στράτου |

## Γρήγορη χρήση
```bash
mkdir -p /home/claude/engine && cd /home/claude/engine   # βάλε εδώ τα .js/.sh
bash setup.sh
node ep01_whatsapp_logo.js sheet        # 12 frames + safe-zone overlay (sheet clean = χωρίς)
node ep01_whatsapp_logo.js render       # MP4
```

## Νέο επεισόδιο (template)
```js
const L = require('./lib.js'); const { lipsync, blinkNow, caption } = L;
const { stratos } = require('./stratos.js'); const P = require('./props.js');
const VO = [[0.2, 2.0], [2.4, 4.5]];
function s1(ctx, lt) { P.tiles(ctx); stratos(ctx, 540, 1100, 1, { legs: false, mouth: lipsync(VO), blink: blinkNow() });
  L.captionSeq(ctx, lt, [[0.1, 'Hook εδώ'], [2.4, 'Δεύτερο κομμάτι']]); P.seriesTag(ctx, lt, 'Σειρά #N'); }
require('./render.js')({ name: 'ep02', SCENES: [[s1, 4.5]], WIPES: 'all' });
```

## Tip: μηδέν tokens για setup
Ανέβασε αυτό τον φάκελο σε **public GitHub repo**. Σε κάθε νέα συνομιλία αρκεί:
`git clone https://github.com/<user>/strategix-paper-engine && cd strategix-paper-engine && bash setup.sh`
(το github.com είναι επιτρεπτό domain στο container).
