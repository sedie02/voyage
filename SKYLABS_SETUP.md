# Skylabs Setup

Setup voor een nieuwe Ubuntu server op Skylabs.

## Stap 1: Basis Setup

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl wget build-essential
```

## Stap 2: Node.js Installeren

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node --version  # moet v20.x.x zijn
npm --version
```

## Stap 3: PM2 Installeren

```bash
sudo npm install -g pm2
pm2 --version
```

## Stap 4: Nginx Installeren (optioneel)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Stap 5: Git Repository Clonen

### Optie A: Via HTTPS

```bash
sudo mkdir -p /var/www/voyage
sudo chown $USER:$USER /var/www/voyage
cd /var/www/voyage
git clone https://github.com/sedie02/voyage.git .
```

### Optie B: Via SSH

**SSH key genereren:**

```bash
# Genereer SSH key (als je die nog niet hebt)
ssh-keygen -t ed25519 -C "your_email@example.com"
# Druk Enter voor default locatie
# Druk Enter voor geen passphrase (of typ er een)

# Toon public key
cat ~/.ssh/id_ed25519.pub
```

**SSH key toevoegen aan GitHub:**

1. Kopieer output van `cat ~/.ssh/id_ed25519.pub`
2. GitHub → Settings → SSH and GPG keys
3. New SSH key
4. Plak en save

**Clone met SSH:**

```bash
cd /var/www/voyage
git clone git@github.com:sedie02/voyage.git .
```

## Stap 6: Environment Variables

```bash
cd /var/www/voyage
nano .env.local
```

**Vul dit in:**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://jouw-skylabs-ip:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kslkoizgefalcxvtjeqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGtvaXpnZWZhbGN4dnRqZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjI1NjMsImV4cCI6MjA3NDc5ODU2M30.I2QE4PoC48dr3UavQUmEMsHQLg5HzC1U1TJtUGjd-8k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGtvaXpnZWZhbGN4dnRqZXFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMjU2MywiZXhwIjoyMDc0Nzk4NTYzfQ.QIkgSdv4yJDfmpaaOF9KVjJ5EQSbGWyog9J5k9ZafvE

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYak-2uSDvX8K63127eLHYklyxk1t_J2A
```

**Save:** `Ctrl+X`, dan `Y`, dan `Enter`

## Stap 7: Dependencies

```bash
cd /var/www/voyage
npm ci --production
```

## Stap 8: Build

```bash
npm run build
```

## Stap 9: PM2 Starten

```bash
sudo mkdir -p /var/log/voyage
sudo chown $USER:$USER /var/log/voyage
pm2 start npm --name voyage -- start
pm2 save
pm2 startup
# volg instructies (kopieer en run sudo commando)
```

## Stap 10: Check Status

```bash
pm2 status
pm2 logs voyage --lines 50
curl http://localhost:3000/api/health
```

## Stap 11: Firewall

```bash
# Allow poort 3000 (of 80/443 als je Nginx gebruikt)
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

## Stap 12: Nginx Configuratie (optioneel)

```bash
sudo nano /etc/nginx/sites-available/voyage
```

**Config:**

```nginx
server {
    listen 80;
    server_name _;  # Of jouw domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable:**

```bash
sudo ln -s /etc/nginx/sites-available/voyage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Updates Deployen

```bash
cd /var/www/voyage
./deploy.sh
```

**Of handmatig:**

```bash
cd /var/www/voyage
git pull origin main
npm ci --production
npm run build
pm2 reload voyage
```

## Troubleshooting

**Git clone vraagt om password:**

- gebruik SSH key (stap 5 optie B)
- of GitHub Personal Access Token

**npm ci faalt:**

```bash
node --version  # moet 20+ zijn
rm -rf node_modules package-lock.json
npm install
```

**Build faalt:**

```bash
npm run build 2>&1 | tee build.log
npm run type-check
```

**PM2 start niet:**

```bash
pm2 logs voyage
sudo lsof -i :3000
cd /var/www/voyage
npm start
```

**App niet bereikbaar:**

```bash
pm2 status
sudo ufw status
curl http://localhost:3000/api/health
```

## Handige Commands

```bash
# PM2
pm2 status
pm2 logs voyage
pm2 restart voyage
pm2 stop voyage
pm2 reload voyage

# Git
git pull origin main
git status
git log --oneline -5

# System
df -h
free -h
top
```

**Klaar!** App draait op `http://jouw-skylabs-ip:3000`
