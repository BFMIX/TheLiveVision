#!/bin/bash
# Script d’application automatique d’un patch Git

if [ -z "$1" ]; then
  echo "Usage: ./apply_patch.sh nom_du_patch.diff 'Message de commit'"
  exit 1
fi

PATCH_FILE="$1"
COMMIT_MSG="$2"

git apply "$PATCH_FILE"

if [ $? -eq 0 ]; then
  git add .
  git commit -m "${COMMIT_MSG:-Applied patch automatically}"
  git push origin $(git branch --show-current)
  echo "✅ Patch appliqué et push avec succès."
else
  echo "❌ Erreur: le patch ne s'applique pas proprement."
fi

