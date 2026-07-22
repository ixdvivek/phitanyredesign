#!/bin/bash
# Extracts a page's embedded <style> block into src/tailwind/<slug>.css
# (wrapped for Tailwind's @layer components) and builds it to
# project/assets/css/<slug>.css. Usage: port-page.sh "<Page File.html>" <slug>
set -e
cd "$(dirname "$0")/.."
FILE="project/$1"
SLUG="$2"

START=$(grep -n "^<style>$" "$FILE" | head -1 | cut -d: -f1)
END=$(grep -n "^</style>$" "$FILE" | head -1 | cut -d: -f1)
if [ -z "$START" ] || [ -z "$END" ]; then
  echo "Could not find <style> block in $FILE" >&2
  exit 1
fi
BODY_START=$((START + 1))
BODY_END=$((END - 1))

mkdir -p src/tailwind
{
  echo "@tailwind base;"
  echo "@tailwind components;"
  echo "@tailwind utilities;"
  echo
  echo "@layer components {"
  sed -n "${BODY_START},${BODY_END}p" "$FILE"
  echo "}"
} > "src/tailwind/${SLUG}.css"

echo "Extracted lines ${START}-${END} of $FILE -> src/tailwind/${SLUG}.css"
echo "Now: 1) fix any relative url(...) paths (prepend ../) 2) build 3) swap style->link"
