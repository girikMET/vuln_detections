#!/bin/bash
pm2 start ./keep_alive.sh --interpreter bash
pm2 start ./server.js -- --port 3000
sleep infinity
