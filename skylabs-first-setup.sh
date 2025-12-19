#!/bin/bash
# eerste setup voor skylabs
# run op skylabs server

set -e

echo "voyage skylabs setup"
echo ""

# 1. system update
echo "system updaten..."
sudo apt update
sudo apt upgrade -y

# 2. basis tools
echo "basis tools installeren..."
sudo apt install -y git curl wget build-essential

# 3. node.js 20
echo "node.js 20 installeren..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "node.js $(node --version)"
echo "npm $(npm --version)"

# 4. pm2
echo "pm2 installeren..."
sudo npm install -g pm2

# 5. nginx (optioneel)
echo "nginx installeren..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 6. directories
echo "directories maken..."
sudo mkdir -p /var/www/voyage
sudo mkdir -p /var/log/voyage
sudo chown -R $USER:$USER /var/www/voyage
sudo chown -R $USER:$USER /var/log/voyage

# 7. repo clonen
if [ ! -d "/var/www/voyage/.git" ]; then
    echo "repository clonen..."
    cd /var/www/voyage
    git clone https://github.com/sedie02/voyage.git .
else
    echo "repository bestaat al, pulling latest..."
    cd /var/www/voyage
    git pull origin main || echo "git pull gefaald"
fi

# 8. .env.local check
if [ ! -f "/var/www/voyage/.env.local" ]; then
    echo ".env.local niet gevonden!"
    echo "maak .env.local aan:"
    echo "  cd /var/www/voyage"
    echo "  nano .env.local"
    echo ""
    echo "vul in:"
    echo "  NODE_ENV=production"
    echo "  NEXT_PUBLIC_SUPABASE_URL=..."
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
    echo "  SUPABASE_SERVICE_ROLE_KEY=..."
    echo "  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=..."
    echo ""
    read -p "druk enter als je .env.local hebt aangemaakt..."
fi

# 9. dependencies
echo "dependencies installeren..."
cd /var/www/voyage
npm ci --production

# 10. build
echo "builden..."
npm run build

# 11. pm2 start
echo "pm2 starten..."
pm2 start npm --name voyage -- start
pm2 save

# 12. pm2 startup
echo "pm2 startup configureren..."
PM2_STARTUP=$(pm2 startup | grep -o 'sudo.*')
if [ ! -z "$PM2_STARTUP" ]; then
    echo "run dit commando:"
    echo "$PM2_STARTUP"
fi

# 13. firewall
echo "firewall configureren..."
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw --force enable

# klaar
echo ""
echo "setup klaar!"
echo ""
echo "check status: pm2 status"
echo "check logs: pm2 logs voyage"
echo "test app: curl http://localhost:3000/api/health"


