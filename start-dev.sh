#!/usr/bin/env bash
cd /home/sprite/ga-bible-app
npm run dev -- --host 0.0.0.0 >> /tmp/vite-dev.log 2>&1 &
echo "Vite dev server started in background (PID: $!)"
