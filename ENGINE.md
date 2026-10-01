# ENGINE — χάρτης σε 2 λεπτά (διάβασέ το στη φάση 2 αντί για παλιό επεισόδιο)

Κάθε frame = συνάρτηση του χρόνου `t` (stateless) → `preview t` = ίδιο με το render, παράλληλο render/lint, regress. Καμία μεταβλητή που «θυμάται» από frame σε frame.

## Επίπεδα
| Αρχείο | Τι κάνει |
|---|---|
| `lib.js` | `cut()` σκισμένο χαρτί (boil 12fps) · `cutGroup` · `txt` · captions · `pop`/`spring` · `lipsync` · `cam` · **`voText()`** = χρόνοι λέξεων + captions από το VO |
| `motion.js` | φυσική: `springTo`/`springKeys` (ελαφριά) · `trapez`/`raster`/`pathMove` (βαριά) · `lag` · `shake` · `fall` · `particles` · **`kf`** keyframes · **`rewindTau`** |
| `stratos.js` · `crew.js` · `hands.js` | χαρακτήρες + χέρια (HANDS.md) · `poseSpring(POSES, t)` · lint ανατομίας |
| `diorama.js` + `props/diorama.js` | χάρτινη μακέτα 3D (§1d): `D.tex` υφές · `D.camera` · `D.frame(ctx, t, build)` · `roomItems` · `stratosItem` · `mixCam` · `behindDesk` |
| `props/*.js` (`require('./props.js')`) | έτοιμα αντικείμενα ανά θέμα · `node api.js` |
| `render.js` | runner: σκηνές, wipes, grain, captions/ετικέτα, lint, sheet/preview, render MP4 + ήχος (VO · μουσική · SFX · ducking) |
| `sfx.js` · `vo.js` · `music.js` · `photos.js` · `publish.js` | ήχοι-κώδικας · VO + Scribe · μουσική · φωτογραφίες · Postiz |
| `next.js` · `new.js` · `wrap.js` | οδηγός φάσεων · σκελετός επεισοδίου · timing sheet + EPISODES |

## Ανατομία επεισοδίου (όπως τη γράφει το `node new.js <ep>_<όνομα>`)
```js
const VT = L.voText('vo/pf07_vo.mp3', 0.2);         // VT.W('λέξη') = αρχή λέξης σε χρόνο video · VT.E() = τέλος
const TAG = 'Πώς φτιάχνεται;', TOTAL = 29.8, LOOP_AT = 29.0;
const CUTS = [0, 2.6, 7.45, …, TOTAL];               // αλλαγές σκηνής (wipe)
const CAPS = VT.caps();                               // captions ≤ 2 γραμμές · διορθώσεις: VT.caps({ text: { 3: '«…»' } })
function build(t) { return { cam: D.camera(camAt(t)), items: [...roomItems(R), stratosItem(cam, t, { pos, pose: poseSpring(POSES, t) })], …LIGHT }; }
function SCENE(ctx, t) { D.frame(ctx, t, build, { mb: MB(t) }); /* 2D από πάνω: stepChip, stamp, ctaButton */ }
module.exports = require('./render.js')({ name: 'pf07_…', CUTS, SCENE, LOOP: 'cut', LOOP_AT, TAG, CAPS,
  VO_FILE: 'vo/pf07_vo.mp3', VO_AT: 0.2, MUSIC_FILE: 'music/pf07.mp3', SFX: [[VT.W('πλατς'), 'thud', { note: '…' }]] });
```
- **Captions + ετικέτα σειράς** τα ζωγραφίζει το render (πάνω από τη σκηνή): στο hook (ως την 1η αλλαγή σκηνής, `HOOK_END`) και από το `LOOP_AT` (seamless loop). Μην τα ξαναγράφεις στη σκηνή.
- Χρόνοι **πάντα από λέξεις** (`VT.W`), όχι αριθμοί αντιγραμμένοι από τον πίνακα του VO.
- Γρήγορη κίνηση → motion blur `MB(t)` 3–5 μόνο εκεί · κάμερα στο χέρι 0 στο frame 0 και στο loop.
- Παλιά επεισόδια (`SCENES: [[fn, s], …]`, χειροποίητα `T`/`CAPS`) δουλεύουν όπως πριν.

## Εντολές
`node <ep>.js check` (lint + sheet) · `preview 1.2 5 9` (ένα grid) · `preview 5 --crop x,y,w,h` · `render` · `sfx` (μόνο ήχος) · `vo` (φράσεις) · `info`
`node api.js` (κατάλογος) → `node api.js <λέξη>` → `sed -n 'a,bp' αρχείο` · `node regress.js` μετά από αλλαγή engine · `node next.js` = τι κάνω τώρα
