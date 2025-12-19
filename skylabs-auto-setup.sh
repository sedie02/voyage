#!/bin/bash
# Complete automatische setup voor Skylabs
# Run dit ALLEEN op Skylabs server!

set -e

echo "🚀 Voyage Auto Setup voor Skylabs"
echo "=================================="
echo ""

# 1. SSH key toevoegen
echo "🔑 [1/13] Setting up SSH access..."
mkdir -p ~/.ssh
if ! grep -q "skylabs-voyage" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINRpqChGw4qvyUQp5QeGiFNCNT4NYdcKJd1Yr2+X4Twh skylabs-voyage" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    echo "✅ SSH key toegevoegd"
else
    echo "✅ SSH key bestaat al"
fi

# 2. Update system
echo ""
echo "📦 [2/13] Updating system..."
sudo apt update -qq
sudo apt upgrade -y -qq

# 3. Install basics
echo ""
echo "📦 [3/13] Installing basic tools..."
sudo apt install -y git curl wget build-essential > /dev/null 2>&1

# 4. Install Node.js
echo ""
echo "📦 [4/13] Installing Node.js 20..."
if ! command -v node &> /dev/null || [ "$(node --version | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
fi
echo "✅ Node.js $(node --version)"

# 5. Install PM2
echo ""
echo "📦 [5/13] Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
fi
echo "✅ PM2 geïnstalleerd"

# 6. Maak directories
echo ""
echo "📁 [6/13] Creating directories..."
sudo mkdir -p /var/www/voyage
sudo mkdir -p /var/log/voyage
sudo chown -R $USER:$USER /var/www/voyage
sudo chown -R $USER:$USER /var/log/voyage
echo "✅ Directories gemaakt"

# 7. Clone repository
echo ""
echo "📥 [7/13] Cloning repository..."
cd /var/www/voyage
if [ ! -d ".git" ]; then
    git clone https://github.com/sedie02/voyage.git . > /dev/null 2>&1
    echo "✅ Repository gecloned"
else
    git pull origin main > /dev/null 2>&1 || echo "⚠️  Git pull failed, maar we gaan door..."
    echo "✅ Repository bijgewerkt"
fi

# 8. Check .env.local
echo ""
echo "⚙️  [8/13] Checking .env.local..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local niet gevonden!"
    echo ""
    echo "Maak .env.local aan met deze waardes:"
    echo ""
    cat << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://jouw-skylabs-ip:3000

NEXT_PUBLIC_SUPABASE_URL=https://kslkoizgefalcxvtjeqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGtvaXpnZWZhbGN4dnRqZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjI1NjMsImV4cCI6MjA3NDc5ODU2M30.I2QE4PoC48dr3UavQUmEMsHQLg5HzC1U1TJtUGjd-8k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGtvaXpnZWZhbGN4dnRqZXFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMjI1NjMsImV4cCI6MjA3NDc5ODU2M30.QIkgSdv4yJDfmpaaOF9KVjJ5EQSbGWyog9J5k9ZafvE

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYak-2uSDvX8K63127eLHYklyxk1t_J2A
EOF
    echo ""
    echo "Run: nano .env.local"
    echo "Plak bovenstaande, pas NEXT_PUBLIC_APP_URL aan, save (Ctrl+X, Y, Enter)"
    echo ""
    read -p "Druk Enter als je .env.local hebt aangemaakt..."
fi

# 9. Install dependencies
echo ""
echo "📦 [9/13] Installing dependencies..."
npm ci --production > /dev/null 2>&1
echo "✅ Dependencies geïnstalleerd"

# 10. Build
echo ""
echo "🔨 [10/13] Building application..."
npm run build
echo "✅ Build voltooid"

# 11. PM2 setup
echo ""
echo "🚀 [11/13] Starting with PM2..."
if pm2 list | grep -q "voyage"; then
    pm2 reload voyage > /dev/null 2>&1
    echo "✅ App gereloaded"
else
    pm2 start npm --name voyage -- start > /dev/null 2>&1
    echo "✅ App gestart"
fi
pm2 save > /dev/null 2>&1

# 12. PM2 startup
echo ""
echo "⚙️  [12/13] Setting up PM2 startup..."
STARTUP_CMD=$(pm2 startup 2>&1 | grep "sudo" || echo "")
if [ ! -z "$STARTUP_CMD" ]; then
    echo "Run dit commando:"
    echo "$STARTUP_CMD"
    echo ""
    read -p "Druk Enter als je het commando hebt gerund..."
fi

# 13. Firewall
echo ""
echo "🔥 [13/13] Configuring firewall..."
sudo ufw allow 3000/tcp > /dev/null 2>&1 || echo "⚠️  UFW al geconfigureerd"
sudo ufw allow OpenSSH > /dev/null 2>&1 || true
sudo ufw --force enable > /dev/null 2>&1 || true
echo "✅ Firewall geconfigureerd"

# Done!
echo ""
echo "=================================="
echo "✅ SETUP VOLTOOID!"
echo "=================================="
echo ""
echo "📊 Check status:"
echo "   pm2 status"
echo ""
echo "📋 View logs:"
echo "   pm2 logs voyage --lines 50"
echo ""
echo "🌐 Test app:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "💡 Vanaf je Mac kun je nu inloggen met:"
echo "   ssh student@jouw-skylabs-ip"
echo ""
