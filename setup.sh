#!/bin/bash
# One-time setup in a fresh container: engine deps + fonts
set -e
cd "$(dirname "$0")"
[ -d node_modules/@napi-rs/canvas ] || (npm init -y >/dev/null && npm i @napi-rs/canvas >/dev/null 2>&1)
mkdir -p fonts
G=https://raw.githubusercontent.com/google/fonts/main/ofl
[ -f fonts/Mynerve-Regular.ttf ] || curl -sfL -o fonts/Mynerve-Regular.ttf $G/mynerve/Mynerve-Regular.ttf
[ -f fonts/Comfortaa.ttf ]       || curl -sfL -o fonts/Comfortaa.ttf "$G/comfortaa/Comfortaa%5Bwght%5D.ttf"
[ -f fonts/Poppins-Bold.ttf ]    || curl -sfL -o fonts/Poppins-Bold.ttf $G/poppins/Poppins-Bold.ttf
which ffmpeg >/dev/null && echo "ready ✔"
