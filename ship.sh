#!/bin/bash
# chat → repo: commit τοπικά + ΕΝΑ .patch για `git am` στο Claude Code (το chat δεν κάνει push)
# usage: bash ship.sh <name> "<commit msg>"      π.χ. bash ship.sh ep02 "ep02: <τίτλος>"
set -e
cd "$(dirname "$0")"
NAME=${1:?usage: bash ship.sh <name> "<commit msg>"}; MSG=${2:-$NAME}
OUT=${OUT:-/mnt/user-data/outputs}
git config user.name  >/dev/null || git config user.name  "Claude (chat)"
git config user.email >/dev/null || git config user.email "chat@strategix.local"
BASE=$(git rev-parse origin/main)
git add -A
# lint gate: κάθε επεισόδιο που άλλαξε πρέπει να βγαίνει «lint ✔ καθαρό»
# επεισόδιο = .js στη ρίζα που καλεί το render.js, όχι _legacy (χωρίς λίστα prefixes: νέα σειρά μπαίνει αυτόματα · ίδιο κριτήριο με το regress.js)
for f in $(git diff --cached --name-only --diff-filter=AM "$BASE" | grep -E '^[^/]+\.js$' | grep -v '_legacy' || true); do
  grep -qE "^[^/]*require\('\./render\.js'\)\(" "$f" || continue
  echo "lint $f"; node "$f" lint || { [ -n "$FORCE" ] || { echo "✘ $f όχι καθαρό (FORCE=1 για παράκαμψη)"; exit 1; }; }
done
# engine gate: άλλαξε engine/props → περιγραφές props + regress σε ΟΛΑ τα επεισόδια (νέο crash / νέο lint warning = stop)
if git diff --cached --name-only "$BASE" | grep -qE '^(lib|stratos|hands|props|render|sfx)\.js$|^props/'; then
  node api.js --check || [ -n "$FORCE" ] || exit 1
  node regress.js "$BASE" || { [ -n "$FORCE" ] || { echo "✘ regress: η αλλαγή στο engine χαλάει παλιό επεισόδιο (FORCE=1 για παράκαμψη)"; exit 1; }; }
fi
git diff --cached --quiet || git commit -qm "$MSG"
[ "$(git rev-list --count "$BASE"..HEAD)" -gt 0 ] || { echo "τίποτα να σταλεί"; exit 1; }
mkdir -p "$OUT"; git format-patch "$BASE" --stdout > "$OUT/$NAME.patch"
git diff --stat "$BASE" HEAD
echo "→ $OUT/$NAME.patch   (Claude Code: «εφάρμοσε το $NAME.patch»)"
