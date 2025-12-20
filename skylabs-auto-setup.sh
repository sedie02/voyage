#!/bin/bash
# auto setup voor skylabs
# run alleen op skylabs server

set -e

echo "voyage setup voor skylabs"
echo ""

# 1. ssh key
echo "[1/13] ssh key toevoegen..."
mkdir -p ~/.ssh
if ! grep -q "skylabs-voyage" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINRpqChGw4qvyUQp5QeGiFNCNT4NYdcKJd1Yr2+X4Twh skylabs-voyage" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    echo "ssh key toegevoegd"
else
    echo "ssh key bestaat al"
fi

# 2. system update
echo ""
echo "[2/13] system updaten..."
sudo apt update -qq
sudo apt upgrade -y -qq

# 3. basis tools
echo ""
echo "[3/13] basis tools installeren..."
sudo apt install -y git curl wget build-essential > /dev/null 2>&1

# 4. node.js
echo ""
echo "[4/13] node.js 20 installeren..."
if ! command -v node &> /dev/null || [ "$(node --version | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
fi
echo "node.js $(node --version) geïnstalleerd"

# 5. pm2
echo ""
echo "[5/13] pm2 installeren..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
fi
echo "pm2 geïnstalleerd"

# 6. directories
echo ""
echo "[6/13] directories maken..."
sudo mkdir -p /var/www/voyage
sudo mkdir -p /var/log/voyage
sudo chown -R $USER:$USER /var/www/voyage
sudo chown -R $USER:$USER /var/log/voyage
echo "directories gemaakt"

# 7. repo clonen
echo ""
echo "[7/13] repository clonen..."
cd /var/www/voyage
if [ ! -d ".git" ]; then
    git clone https://github.com/sedie02/voyage.git . > /dev/null 2>&1
    echo "repository gecloned"
else
    git pull origin main > /dev/null 2>&1 || echo "git pull gefaald, maar we gaan door"
    echo "repository bijgewerkt"
fi

# 8. .env.local check
echo ""
echo "[8/13] .env.local checken..."
if [ ! -f ".env.local" ]; then
    echo ".env.local niet gevonden!"
    echo ""
    echo "maak .env.local aan met:"
    echo ""
    cat << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://jouw-skylabs-ip:3000

NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_supabase_anon_key_hier
SUPABASE_SERVICE_ROLE_KEY=jouw_supabase_service_role_key_hier

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=jouw_google_maps_api_key_hier
EOF
    echo ""
    echo "run: nano .env.local"
    echo "plak bovenstaande, pas NEXT_PUBLIC_APP_URL aan, save (Ctrl+X, Y, Enter)"
    echo ""
    read -p "druk enter als je .env.local hebt aangemaakt..."
fi

# 9. dependencies
echo ""
echo "[9/13] dependencies installeren..."
npm ci --production > /dev/null 2>&1
echo "dependencies geïnstalleerd"

# 10. build
echo ""
echo "[10/13] builden..."
npm run build
echo "build klaar"

# 11. pm2 start
echo ""
echo "[11/13] pm2 starten..."
if pm2 list | grep -q "voyage"; then
    pm2 reload voyage > /dev/null 2>&1
    echo "app gereloaded"
else
    pm2 start npm --name voyage -- start > /dev/null 2>&1
    echo "app gestart"
fi
pm2 save > /dev/null 2>&1

# 12. pm2 startup
echo ""
echo "[12/13] pm2 startup configureren..."
STARTUP_CMD=$(pm2 startup 2>&1 | grep "sudo" || echo "")
if [ ! -z "$STARTUP_CMD" ]; then
    echo "run dit commando:"
    echo "$STARTUP_CMD"
    echo ""
    read -p "druk enter als je het commando hebt gerund..."
fi

# 13. firewall
echo ""
echo "[13/13] firewall configureren..."
sudo ufw allow 3000/tcp > /dev/null 2>&1 || echo "ufw al geconfigureerd"
sudo ufw allow OpenSSH > /dev/null 2>&1 || true
sudo ufw --force enable > /dev/null 2>&1 || true
echo "firewall geconfigureerd"

# klaar
echo ""
echo "setup klaar!"
echo ""
echo "check status: pm2 status"
echo "check logs: pm2 logs voyage --lines 50"
echo "test app: curl http://localhost:3000/api/health"
echo ""
echo "vanaf je mac inloggen: ssh student@jouw-skylabs-ip"
