#!/bin/bash
# Complete eerste setup voor Skylabs
# Run dit op de Skylabs server

set -e

echo "🚀 Voyage Skylabs First Setup"
echo "=============================="

# 1. Update system
echo "📦 Updating system..."
sudo apt update
sudo apt upgrade -y

# 2. Install basis tools
echo "📦 Installing basic tools..."
sudo apt install -y git curl wget build-essential

# 3. Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# 4. Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# 5. Install Nginx (optioneel)
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 6. Maak directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/voyage
sudo mkdir -p /var/log/voyage
sudo chown -R $USER:$USER /var/www/voyage
sudo chown -R $USER:$USER /var/log/voyage

# 7. Clone repository (als nog niet gedaan)
if [ ! -d "/var/www/voyage/.git" ]; then
    echo "📥 Cloning repository..."
    cd /var/www/voyage
    git clone https://github.com/sedie02/voyage.git .
else
    echo "✅ Repository already exists, pulling latest..."
    cd /var/www/voyage
    git pull origin main || echo "⚠️  Git pull failed"
fi

# 8. Check .env.local
if [ ! -f "/var/www/voyage/.env.local" ]; then
    echo "⚠️  .env.local niet gevonden!"
    echo "Maak .env.local aan met:"
    echo "  cd /var/www/voyage"
    echo "  nano .env.local"
    echo ""
    echo "Vul in:"
    echo "  NODE_ENV=production"
    echo "  NEXT_PUBLIC_SUPABASE_URL=..."
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
    echo "  SUPABASE_SERVICE_ROLE_KEY=..."
    echo "  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=..."
    echo ""
    read -p "Druk Enter als je .env.local hebt aangemaakt..."
fi

# 9. Install dependencies
echo "📦 Installing dependencies..."
cd /var/www/voyage
npm ci --production

# 10. Build
echo "🔨 Building application..."
npm run build

# 11. Setup PM2
echo "🚀 Starting with PM2..."
pm2 start npm --name voyage -- start
pm2 save

# 12. PM2 startup (voor auto-start bij reboot)
echo "⚙️  Setting up PM2 startup..."
PM2_STARTUP=$(pm2 startup | grep -o 'sudo.*')
if [ ! -z "$PM2_STARTUP" ]; then
    echo "Run dit commando:"
    echo "$PM2_STARTUP"
fi

# 13. Firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw --force enable

# Done!
echo ""
echo "✅ Setup voltooid!"
echo ""
echo "📊 Check status:"
echo "   pm2 status"
echo ""
echo "📋 View logs:"
echo "   pm2 logs voyage"
echo ""
echo "🌐 Test app:"
echo "   curl http://localhost:3000/api/health"
echo ""

