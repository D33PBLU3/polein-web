#!/bin/sh
# Compress photos for the blog (macOS `sips`, no extra installs).
#   scripts/optimize-blog-photos.sh <input-dir>
# Every .jpg/.jpeg/.png/.heic in <input-dir> becomes a 600x450 JPEG at
# quality 60 (~30-60 KB) in public/img/blog/, keeping its file name.
# 4:3 is center-cropped so before/after pairs line up side by side.
set -e
IN="$1"; OUT="$(cd "$(dirname "$0")/.." && pwd)/public/img/blog"
[ -d "$IN" ] || { echo "usage: $0 <input-dir>"; exit 1; }
mkdir -p "$OUT"
for f in "$IN"/*; do
  case "$(echo "$f" | tr 'A-Z' 'a-z')" in *.jpg|*.jpeg|*.png|*.heic) ;; *) continue ;; esac
  name="$(basename "$f")"; name="${name%.*}.jpg"; tmp="$OUT/.tmp-$name"
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')
  # crop to 4:3 landscape around the center, then resize to 600x450
  if [ $((w * 3)) -gt $((h * 4)) ]; then cw=$((h * 4 / 3)); ch=$h; else cw=$w; ch=$((w * 3 / 4)); fi
  sips -s format jpeg --cropToHeightWidth "$ch" "$cw" "$f" --out "$tmp" >/dev/null
  sips -s format jpeg -s formatOptions 60 -z 450 600 "$tmp" --out "$OUT/$name" >/dev/null
  rm -f "$tmp"
  echo "$name  $(du -k "$OUT/$name" | cut -f1) KB"
done
