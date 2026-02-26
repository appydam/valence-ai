#!/bin/bash
cd "$(dirname "$0")"
npm install --production
PORT=3002 node server.js
