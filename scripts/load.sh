#!/bin/bash
# Generates traffic so Grafana has data. Usage: bash scripts/load.sh [base-url]
URL=${1:-http://localhost:30080}
for i in $(seq 1 300); do
  curl -s "$URL/api/titles" > /dev/null
  curl -s "$URL/api/recommendations" > /dev/null
  if [ $((i % 5)) -eq 0 ]; then curl -s "$URL/chaos/error" > /dev/null; fi
  sleep 0.5
done
echo "load finished"