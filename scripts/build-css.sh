#!/bin/bash
set -e
cd "$(dirname "$0")/.."
mkdir -p project/assets/css
for f in src/tailwind/*.css; do
  slug=$(basename "$f" .css)
  npx tailwindcss -i "$f" -o "project/assets/css/${slug}.css"
done
echo "Built $(ls src/tailwind/*.css | wc -l) stylesheets."
