#!/usr/bin/env bash
#
# Build both colour editions of the Crooked Nightstand Ghost theme.
#   ./build.sh
#
# Output: dist/crooked-nightstand-pink.zip  (accent follows Ghost Branding)
#         dist/crooked-nightstand-blue.zip  (accent locked to navy #21395B)
#
# Each edition = the shared theme in theme/ + the matching favicon from brand/<edition>/.
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
mkdir -p dist

build () {
  local edition="$1"
  local tmp; tmp="$(mktemp -d)"
  cp -R theme/. "$tmp/"
  # swap in the edition's favicon
  cp "brand/$edition/favicon.svg" "$tmp/assets/favicon.svg"
  # the blue edition hard-codes the navy accent (so it's blue regardless of
  # Ghost's Branding colour); pink stays Branding-driven.
  if [ "$edition" = "blue" ]; then
    perl -0pi -e 's/\Qvar(--ghost-accent-color, #21395B)\E/#21395B/g' "$tmp/assets/css/screen.css"
  fi
  rm -f "dist/crooked-nightstand-$edition.zip"
  ( cd "$tmp" && zip -r -q "$ROOT/dist/crooked-nightstand-$edition.zip" . -x ".*" -x "__MACOSX*" )
  rm -rf "$tmp"
  echo "built  dist/crooked-nightstand-$edition.zip"
}

build pink
build blue
