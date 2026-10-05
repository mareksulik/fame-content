#!/bin/sh
# Vyrenderuje sériu „Našich 10 princípov“ do posts/2026-10-remotion-principy/out
# a prekóduje ju na štandardný farebný rozsah (Remotion kóduje yuvj420p).
set -e
cd "$(dirname "$0")"
OUT=../posts/2026-10-remotion-principy/out
mkdir -p "$OUT"
for n in 01 02 03 04 05 06 07 08 09 10; do
  npx remotion render src/index.ts "Princip$n" "$OUT/raw-$n.mp4" --public-dir ../system --codec h264 --crf 18 --log=error
  ffmpeg -v error -y -i "$OUT/raw-$n.mp4" -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -color_range tv \
    -c:v libx264 -crf 18 -preset slow -movflags +faststart "$OUT/fame-princip-$n.mp4"
  rm "$OUT/raw-$n.mp4"
  echo "Princíp $n hotový"
done
