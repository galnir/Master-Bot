#!/bin/bash
git pull
npm install
pm2-runtime index.js
