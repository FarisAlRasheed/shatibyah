#!/bin/bash
# Usage: tools/timing/whisper_all.sh <src_dir> <out_dir>
# Transcribes every 0814*_NN_*.mp3 (NN 01..29) once with whisper.cpp large-v3-turbo, word timestamps,
# writing <out_dir>/NN.json (full JSON, one word per segment). Skips files already done.
SRC="$1"; OUT="$2"; mkdir -p "$OUT/wav"
for f in "$SRC"/0814AsShaatibiyyah_[0-2][0-9]_*.mp3; do
  nn=$(basename "$f" | sed -E 's/0814AsShaatibiyyah_([0-9]+)_.*/\1/')
  [ "$nn" = "30" ] && continue
  [ -f "$OUT/$nn.json" ] && continue
  ffmpeg -v error -y -i "$f" -ar 16000 -ac 1 "$OUT/wav/$nn.wav"
  whisper-cli -m ~/.cache/whisper/ggml-large-v3-turbo.bin -f "$OUT/wav/$nn.wav" -l ar -ml 1 -sow -ojf -of "$OUT/$nn" >/dev/null 2>&1
done
echo done > "$OUT/ALLDONE"
