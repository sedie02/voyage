# 🖥️ Skylabs Fresh Ubuntu Setup

Complete setup guide voor een nieuwe Ubuntu server op Skylabs.

## Stap 1: Basis Setup

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install basis tools
sudo apt install -y git curl wget build-essential
```

## Stap 2: Node.js Installeren

```bash
# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Moet v20.x.x zijn
npm --version
```

## Stap 3: PM2 Installeren

```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

## Stap 4: Nginx Installeren (optioneel, voor reverse proxy)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Stap 5: Git Repository Clonen

### Optie A: Via HTTPS (simpelste, vraagt om GitHub username/password)

```bash
# Maak app directory
sudo mkdir -p /var/www/voyage
sudo chown $USER:$USER /var/www/voyage

# Clone repository
cd /var/www/voyage
git clone https://github.com/sedie02/voyage.git .

# Als je private repo hebt, gebruik dan:
# git clone https://YOUR_USERNAME@github.com/sedie02/voyage.git .
```

### Optie B: Via SSH (aanbevolen, geen password nodig)

**Eerst SSH key genereren:**

```bash
# Genereer SSH key (als je die nog niet hebt)
ssh-keygen -t ed25519 -C "your_email@example.com"
# Druk Enter voor default locatie
# Druk Enter voor geen passphrase (of typ er een)

# Toon public key
cat ~/.ssh/id_ed25519.pub
```

**Voeg SSH key toe aan GitHub:**

1. Kopieer de output van `cat ~/.ssh/id_ed25519.pub`
2. Ga naar GitHub → Settings → SSH and GPG keys
3. Klik "New SSH key"
4. Plak de key en save

**Clone met SSH:**

```bash
cd /var/www/voyage
git clone git@github.com:sedie02/voyage.git .
```

## Stap 6: Environment Variables Instellen

```bash
cd /var/www/voyage

# Maak .env.local bestand
nano .env.local
```

**Vul dit in (pas aan met jouw waardes):**

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

**Save en exit:** `Ctrl+X`, dan `Y`, dan `Enter`

## Stap 7: Dependencies Installeren

```bash
cd /var/www/voyage
npm ci --production
```

## Stap 8: Build Application

```bash
npm run build
```

Dit kan een paar minuten duren.

## Stap 9: Start met PM2

```bash
# Maak log directory
sudo mkdir -p /var/log/voyage
sudo chown $USER:$USER /var/log/voyage

# Start applicatie
pm2 start npm --name voyage -- start

# Save PM2 config (start automatisch bij reboot)
pm2 save
pm2 startup
# Volg de instructies die dit commando geeft (kopieer en run het sudo commando)
```

## Stap 10: Check Status

```bash
# Check of app draait
pm2 status

# Check logs
pm2 logs voyage --lines 50

# Test health endpoint
curl http://localhost:3000/api/health
```

## Stap 11: Firewall (als je externe toegang wilt)

```bash
# Allow poort 3000 (of 80/443 als je Nginx gebruikt)
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

## Stap 12: Nginx Configuratie (optioneel, voor reverse proxy)

Als je Nginx gebruikt voor reverse proxy:

```bash
sudo nano /etc/nginx/sites-available/voyage
```

**Plaats deze config:**

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

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/voyage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Updates Deployen (na eerste setup)

```bash
cd /var/www/voyage
./deploy.sh
```

Of handmatig:

```bash
cd /var/www/voyage
git pull origin main
npm ci --production
npm run build
pm2 reload voyage
```

## Troubleshooting

**Git clone vraagt om password:**

- Gebruik SSH key (zie Stap 5 Optie B)
- Of gebruik GitHub Personal Access Token

**npm ci faalt:**

```bash
# Check Node.js versie
node --version  # Moet 20+ zijn

# Probeer opnieuw
rm -rf node_modules package-lock.json
npm install
```

**Build faalt:**

```bash
# Check errors
npm run build 2>&1 | tee build.log

# Check TypeScript errors
npm run type-check
```

**PM2 start niet:**

```bash
# Check logs
pm2 logs voyage

# Check of poort 3000 vrij is
sudo lsof -i :3000

# Start handmatig
cd /var/www/voyage
npm start
```

**App niet bereikbaar:**

```bash
# Check of app draait
pm2 status

# Check firewall
sudo ufw status

# Test lokaal
curl http://localhost:3000/api/health
```

## Handige Commands

```bash
# PM2
pm2 status              # Status checken
pm2 logs voyage         # Logs bekijken
pm2 restart voyage      # Restart
pm2 stop voyage         # Stop
pm2 reload voyage       # Zero-downtime reload

# Git
git pull origin main    # Pull latest code
git status              # Check status
git log --oneline -5    # Laatste 5 commits

# System
df -h                   # Disk usage
free -h                 # Memory usage
top                     # Process monitor
```

---

**Klaar!** Je app zou nu moeten draaien op `http://jouw-skylabs-ip:3000`
