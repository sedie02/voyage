# 🚀 Deployment Guide - Voyage op Skylabs VM

Deze handleiding beschrijft hoe je Voyage deployed op een Skylabs Virtual Machine.

## 📋 Prerequisites

- Skylabs VM met SSH toegang
- Node.js >= 18.0.0 geïnstalleerd op VM
- PM2 (process manager) voor productie
- Nginx als reverse proxy
- SSL certificaat (Let's Encrypt)

## 🔧 VM Setup

### 1. Connecteer met de VM

```bash
ssh your-username@your-vm-ip
```

### 2. Installeer Node.js (als nog niet aanwezig)

```bash
# NodeSource repository toevoegen
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js installeren
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 3. Installeer PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Auto-start bij server reboot
pm2 startup systemd
```

### 4. Installeer Nginx (Reverse Proxy)

```bash
sudo apt update
sudo apt install nginx

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 📦 Applicatie Deployment

### 1. Clone Repository op VM

```bash
# Maak app directory
mkdir -p /var/www/voyage
cd /var/www/voyage

# Clone repo
git clone <your-repo-url> .

# Of via rsync vanaf lokaal
# rsync -avz --exclude 'node_modules' ./ user@vm:/var/www/voyage/
```

### 2. Install Dependencies

```bash
npm ci --production
```

### 3. Environment Variables

```bash
# Maak .env.local aan
nano .env.local
```

Vul in:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_secret_key

# APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
OPENWEATHER_API_KEY=your_key

# Security
NEXTAUTH_SECRET=your_secret
INVITE_TOKEN_SECRET=your_secret
```

### 4. Build de Applicatie

```bash
npm run build
```

### 5. Start met PM2

```bash
# Start applicatie
pm2 start npm --name "voyage" -- start

# Bewaar PM2 configuratie
pm2 save

# Check status
pm2 status
pm2 logs voyage
```

## 🌐 Nginx Configuratie

### 1. Maak Nginx Config

```bash
sudo nano /etc/nginx/sites-available/voyage
```

Voeg toe:

```nginx
# Voyage Next.js App
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificaten (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Root location
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

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # PWA files
    location ~* \.(webmanifest|json)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=3600";
    }

    # Service Worker
    location /sw.js {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache";
        add_header Service-Worker-Allowed "/";
    }
}
```

### 2. Enable Site

```bash
# Symlink maken
sudo ln -s /etc/nginx/sites-available/voyage /etc/nginx/sites-enabled/

# Test configuratie
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 🔒 SSL Certificate (Let's Encrypt)

```bash
# Installeer Certbot
sudo apt install certbot python3-certbot-nginx

# Verkrijg certificaat
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## 🔄 Update Workflow

### 1. Lokaal: Push naar repository

```bash
git add .
git commit -m "Update"
git push origin main
```

### 2. Op VM: Pull en rebuild

```bash
cd /var/www/voyage

# Pull laatste changes
git pull origin main

# Install nieuwe dependencies (indien nodig)
npm ci --production

# Rebuild
npm run build

# Restart PM2 process
pm2 restart voyage

# Check logs
pm2 logs voyage --lines 50
```

### 3. Zero-downtime deployment (optioneel)

Maak een deploy script `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting Voyage deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Reload PM2 (zero-downtime)
pm2 reload voyage

echo "✅ Deployment complete!"
```

Maak executable:

```bash
chmod +x deploy.sh
```

Gebruik:

```bash
./deploy.sh
```

## 📊 Monitoring

### PM2 Monitoring

```bash
# Status check
pm2 status

# Logs bekijken
pm2 logs voyage

# Memory/CPU usage
pm2 monit

# Restart als nodig
pm2 restart voyage
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Resources

```bash
# Disk usage
df -h

# Memory
free -h

# CPU
top
```

## 🔥 Firewall Setup

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 🆘 Troubleshooting

### App niet bereikbaar

1. Check PM2 status:

   ```bash
   pm2 status
   pm2 logs voyage
   ```

2. Check Nginx:

   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   ```

### Build errors

```bash
# Clear cache en rebuild
rm -rf .next
npm run build
```

### Memory issues

```bash
# Increase Node memory (in PM2)
pm2 delete voyage
pm2 start npm --name "voyage" --max-memory-restart 1G -- start
pm2 save
```

## 📝 Backup Strategie

### Database (Supabase)

Supabase heeft automatische backups. Voor extra zekerheid:

```bash
# Export via Supabase CLI
supabase db dump -f backup.sql
```

### Applicatie bestanden

```bash
# Maak backup van uploads/config
tar -czf voyage-backup-$(date +%Y%m%d).tar.gz /var/www/voyage
```

## 🔐 Security Checklist

- [ ] Firewall actief (ufw)
- [ ] SSL certificaat geïnstalleerd
- [ ] Environment variables veilig opgeslagen
- [ ] SSH key authentication (geen wachtwoorden)
- [ ] Fail2ban geïnstalleerd (optioneel)
- [ ] Regular system updates
- [ ] PM2 auto-restart bij crashes
- [ ] Nginx security headers enabled

---

**Support**: Voor vragen, neem contact op met het dev team.

**Laatst bijgewerkt**: 30 September 2025
