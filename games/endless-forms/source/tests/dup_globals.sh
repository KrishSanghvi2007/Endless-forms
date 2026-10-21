#!/bin/sh
# Fails if two source files declare the same top-level name (one IIFE: a clash breaks the whole game).
cd "$(dirname "$0")/.." || exit 1
d=$(grep -ho "^\(const\|let\|var\|function\|class\) [A-Za-z_\$][A-Za-z0-9_\$]*" core.js hunt.js ui.js ch*.js v2/*.js boot.js | awk '{print $2}' | sort | uniq -d)
if [ -n "$d" ]; then echo "Duplicate top-level names: $d"; grep -n "^\(const\|let\|var\|function\|class\) \($(echo $d | tr ' ' '|' | sed 's/|/\\|/g')\)\b" core.js hunt.js ui.js ch*.js v2/*.js boot.js; exit 1; fi
echo "dup_globals: ok"
