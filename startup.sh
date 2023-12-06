#!/bin/bash
pm2 start ./keep_alive.sh --interpreter bash --name keep-alive-script
pm2 start ./server.js
sleep infinity
