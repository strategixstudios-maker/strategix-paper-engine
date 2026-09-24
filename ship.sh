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
for f in $(git diff --cached --name-only --diff-filter=AM "$BASE" | grep -E '^(ad|ep|pf)[^/]*\.js$' | grep -v '_legacy' || true); do
  echo "lint $f"; node "$f" lint || { [ -n "$FORCE" ] || { echo "✘ $f όχι καθαρό (FORCE=1 για παράκαμψη)"; exit 1; }; }
done
git diff --cached --quiet || git commit -qm "$MSG"
[ "$(git rev-list --count "$BASE"..HEAD)" -gt 0 ] || { echo "τίποτα να σταλεί"; exit 1; }
mkdir -p "$OUT"; git format-patch "$BASE" --stdout > "$OUT/$NAME.patch"
git diff --stat "$BASE" HEAD
echo "→ $OUT/$NAME.patch   (Claude Code: «εφάρμοσε το $NAME.patch»)"
