#!/bin/bash
# deploy script voor skylabs
# run: ./deploy.sh

set -e

if [ ! -f "package.json" ]; then
    echo "fout: package.json niet gevonden"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "fout: node.js niet gevonden"
    exit 1
fi

echo "pulling latest code..."
git pull origin main || echo "git pull gefaald, maar we gaan door"

echo "installing dependencies..."
npm ci --production

echo "building..."
npm run build

echo "reloading pm2..."
if command -v pm2 &> /dev/null; then
    pm2 reload voyage || pm2 start npm --name voyage -- start
    pm2 save
    echo "pm2 reloaded"
else
    echo "pm2 niet gevonden, start handmatig: npm start"
fi

echo ""
echo "klaar!"
echo ""
echo "check status: pm2 status"
echo "check logs: pm2 logs voyage --lines 50"


