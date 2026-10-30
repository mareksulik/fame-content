#!/bin/sh
# Vyrenderuje video „Zákony marketingu 01: double jeopardy“ (4:5 a 9:16) do posts/2026-10-remotion-double-jeopardy/out
# a prekóduje ho na štandardný farebný rozsah (Remotion kóduje yuvj420p).
set -e
cd "$(dirname "$0")"
OUT=../posts/2026-10-remotion-double-jeopardy/out
mkdir -p "$OUT"
for id in DoubleJeopardy-4x5 DoubleJeopardy-9x16; do
  name="fame-double-jeopardy-$(echo "$id" | sed "s/^DoubleJeopardy-//")"
  npx remotion render src/index.ts "$id" "$OUT/raw.mp4" --public-dir ../system --codec h264 --crf 18 --log=error
  ffmpeg -v error -y -i "$OUT/raw.mp4" -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -color_range tv \
    -c:v libx264 -crf 18 -preset slow -movflags +faststart "$OUT/$name.mp4"
  rm "$OUT/raw.mp4"
  ffmpeg -v error -y -ss 30 -i "$OUT/$name.mp4" -frames:v 1 -q:v 2 "$OUT/$name-nahlad.jpg"
  echo "Hotovo: $name"
done
