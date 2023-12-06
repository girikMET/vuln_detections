#!/bin/bash

# URL of your Render application
URL="https://met-cs-633-team1.onrender.com/"

INTERVAL=120

while true; do
  curl -s $URL > /dev/null
  echo "Ping sent to $URL"
  sleep $INTERVAL
done