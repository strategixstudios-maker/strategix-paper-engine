# CHAT.md — claude.ai Project (chat)

Η παραγωγή γίνεται στο Claude Code (βλ. CLAUDE.md). Το chat:

## 1. Ιδέες & σενάρια (default) — χωρίς clone, χωρίς render
- Κανόνες: `curl -sL https://raw.githubusercontent.com/strategixstudios-maker/strategix-paper-engine/main/STYLE_GUIDE.md` (+ `…/main/EPISODES.md` για ό,τι έχει ήδη γίνει).
- Παραδίδεις: σενάριο σε πίνακα (Χρόνος | Εικόνα | VO | Κείμενο/SFX) + το κείμενο του VO έτοιμο για το ElevenLabs (§5d: audio tags, αριθμοί ολογράφως, ακρωνύμια φωνητικά). Ο Αλέξανδρος το φέρνει στο Claude Code.

## 2. Επεισόδιο με κώδικα — μόνο αν το ζητήσει ο Αλέξανδρος
- `git clone https://github.com/strategixstudios-maker/strategix-paper-engine /home/claude/engine && cd /home/claude/engine && bash setup.sh && git log -1 --oneline` → CLAUDE.md, STYLE_GUIDE.md, HANDS.md: ίδιο workflow, με τις διαφορές εδώ.
- Read-only: ΔΕΝ κάνεις push. VO: ο Αλέξανδρος ανεβάζει το MP3 (το container δεν φτάνει το ElevenLabs) → `node render.js vo <mp3> --gap 0.3 --out vo/<ep>_vo.mp3`.
- Στο τέλος: `bash ship.sh <ep> "<msg>"` (lint gate + regress αν άλλαξε το engine) → δώσε το `<ep>.patch` (+ MP4 και timing sheet ξεχωριστά).

## 3. Εφαρμογή patch από το chat (Claude Code)
1. `git pull --ff-only`
2. `git am <file>.patch`. Αν αποτύχει: `git am --abort`, δείξε τη σύγκρουση, ΠΟΤΕ force/overwrite.
3. `bash setup.sh` (αν λείπουν deps) → `node regress.js origin/main` (αν άλλαξε το engine): νέο crash → stop. Νέα lint / οπτικές αλλαγές σε παλιά επεισόδια = μία γραμμή στην αναφορά (χωρίς έλεγχο εικόνων, χωρίς διόρθωση).
4. `git push` και σύντομη αναφορά: commits, αρχεία, regress, νέες γραμμές στο `BACKLOG.md`.
