#!/bin/bash
# Voyage Deployment Script voor Skylabs
# Gebruik: ./deploy.sh

set -e  # Stop bij errors

echo "🚀 Voyage Deployment Script"
echo "============================"

# Check of we in de juiste directory zijn
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json niet gevonden. Zorg dat je in de voyage directory bent."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js niet gevonden. Installeer eerst Node.js 20+"
    exit 1
fi

echo "📦 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, maar we gaan door..."

echo "📥 Installing dependencies..."
npm ci --production

echo "🔨 Building application..."
npm run build

echo "🔄 Reloading PM2..."
if command -v pm2 &> /dev/null; then
    pm2 reload voyage || pm2 start npm --name voyage -- start
    pm2 save
    echo "✅ PM2 reloaded"
else
    echo "⚠️  PM2 niet gevonden. Start handmatig met: npm start"
fi

echo ""
echo "✅ Deployment voltooid!"
echo ""
echo "📊 Check status:"
echo "   pm2 status"
echo ""
echo "📋 View logs:"
echo "   pm2 logs voyage --lines 50"
echo ""

