# 🚀 Voyage Deployment Guide

Dit document beschrijft hoe je Voyage deployt naar productie. We gebruiken momenteel een Skylabs VM met PM2 en Nginx.

## Overzicht

**Huidige setup:**

- **Server:** Skylabs VM (Ubuntu)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **Database:** Supabase (cloud)
- **Domain:** (jouw domain hier)

## Vereisten

- Ubuntu server (20.04 of hoger)
- Node.js 18+ geïnstalleerd
- Nginx geïnstalleerd
- PM2 geïnstalleerd
- Domain met DNS configuratie
- Supabase project (cloud)

## Stap 1: Server Setup

### Node.js Installeren

```bash
# Update package list
sudo apt update

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installatie
node --version  # Should be v20.x.x
npm --version
```

### PM2 Installeren

```bash
sudo npm install -g pm2
```

### Nginx Installeren

```bash
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Stap 2: Code Deployen

### Clone Repository

```bash
# Maak app directory
sudo mkdir -p /var/www/voyage
sudo chown $USER:$USER /var/www/voyage

# Clone repo
cd /var/www/voyage
git clone <repository-url> .

# Of als je al code hebt, pull latest
git pull origin main
```

### Install Dependencies

```bash
cd /var/www/voyage
npm ci --production
```

**Note:** `npm ci` is sneller en betrouwbaarder voor productie dan `npm install`.

### Environment Variables

Maak `.env.local` bestand:

```bash
nano /var/www/voyage/.env.local
```

Vul in:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://jouw-domain.nl

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Security
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://jouw-domain.nl
```

**Belangrijk:** Zorg dat `.env.local` niet in git staat (staat al in `.gitignore`).

## Stap 3: Build Application

```bash
cd /var/www/voyage
npm run build
```

Dit maakt een productie build in `.next/` folder.

**Troubleshooting:**

- Als build faalt, check environment variables
- Zorg dat alle dependencies geïnstalleerd zijn
- Check TypeScript errors: `npm run type-check`

## Stap 4: PM2 Setup

### PM2 Configuratie

Maak `ecosystem.config.js` in de root:

```javascript
module.exports = {
  apps: [
    {
      name: 'voyage',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/voyage',
      instances: 2, // Run 2 instances voor load balancing
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/voyage/error.log',
      out_file: '/var/log/voyage/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

### Start PM2

```bash
# Maak log directory
sudo mkdir -p /var/log/voyage
sudo chown $USER:$USER /var/log/voyage

# Start applicatie
pm2 start ecosystem.config.js

# Save PM2 config (start automatisch bij reboot)
pm2 save
pm2 startup  # Volg de instructies die dit commando geeft
```

### PM2 Commands

```bash
pm2 status              # Check status
pm2 logs voyage         # View logs
pm2 restart voyage      # Restart app
pm2 stop voyage         # Stop app
pm2 reload voyage       # Zero-downtime reload
```

## Stap 5: Nginx Configuratie

### Nginx Config

Maak configuratie bestand:

```bash
sudo nano /etc/nginx/sites-available/voyage
```

Plaats deze configuratie:

```nginx
server {
    listen 80;
    server_name jouw-domain.nl www.jouw-domain.nl;

    # Redirect HTTP to HTTPS (als je SSL hebt)
    # return 301 https://$server_name$request_uri;

    # Voor nu, proxy naar Next.js
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

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/voyage /etc/nginx/sites-enabled/

# Test configuratie
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Stap 6: SSL Certificate (Let's Encrypt)

Voor HTTPS (aanbevolen voor productie):

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d jouw-domain.nl -d www.jouw-domain.nl

# Auto-renewal (automatisch geconfigureerd)
sudo certbot renew --dry-run
```

Certbot past automatisch je Nginx config aan voor HTTPS.

## Stap 7: Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Deployment Workflow

### Update Deployen

```bash
# SSH naar server
ssh user@jouw-server

# Ga naar app directory
cd /var/www/voyage

# Pull latest code
git pull origin main

# Install nieuwe dependencies (als die er zijn)
npm ci --production

# Rebuild
npm run build

# Reload PM2 (zero-downtime)
pm2 reload voyage

# Check logs
pm2 logs voyage --lines 50
```

### Rollback (als iets misgaat)

```bash
# Ga terug naar vorige commit
cd /var/www/voyage
git checkout <previous-commit-hash>
npm ci --production
npm run build
pm2 reload voyage
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit  # Real-time monitoring
pm2 logs   # View all logs
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Logs

```bash
# PM2 logs
pm2 logs voyage

# Of direct
tail -f /var/log/voyage/out.log
tail -f /var/log/voyage/error.log
```

## Troubleshooting

### App start niet

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs voyage`
3. Check environment variables: `cat .env.local`
4. Check build: `ls -la .next/`

### 502 Bad Gateway

- Check of PM2 draait: `pm2 status`
- Check of app luistert op poort 3000: `netstat -tulpn | grep 3000`
- Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`

### Database connectie errors

- Check Supabase URL en keys in `.env.local`
- Check of Supabase project actief is
- Check firewall (Supabase moet toegang hebben)

### Build errors

- Check Node.js versie: `node --version` (moet 18+ zijn)
- Check dependencies: `npm ci`
- Check TypeScript: `npm run type-check`

## Performance Tips

1. **PM2 Cluster Mode**: Gebruik `exec_mode: 'cluster'` voor multi-core gebruik
2. **Nginx Caching**: Cache static files (`/_next/static`)
3. **CDN**: Overweeg Cloudflare voor static assets
4. **Database**: Supabase heeft al connection pooling, maar check je query performance

## Security Checklist

- [ ] Environment variables zijn niet in git
- [ ] HTTPS is geconfigureerd (Let's Encrypt)
- [ ] Firewall is actief (UFW)
- [ ] PM2 draait als non-root user
- [ ] Nginx is up-to-date
- [ ] Node.js is up-to-date
- [ ] Supabase RLS policies zijn correct
- [ ] Google Maps API heeft restricties (domain/IP whitelist)

## Backup Strategy

**Database:**

- Supabase heeft automatische backups (cloud)
- Voor extra backup: gebruik Supabase dashboard → Database → Backups

**Code:**

- Code staat in Git, dus altijd terug te halen
- Overweeg periodieke backups van `.env.local` (encrypted!)

## Scaling

Als je meer traffic krijgt:

1. **Horizontal Scaling**: Meer PM2 instances (`instances: 'max'`)
2. **Load Balancer**: Meerdere servers achter load balancer
3. **Database**: Supabase schaalt automatisch, maar check je plan limits
4. **CDN**: Cloudflare voor static assets

---

**Laatste update:** December 2025
**Auteurs:** Yassine & Sedäle

**Note:** Deze guide is gebaseerd op onze huidige setup. Als je andere hosting gebruikt (Vercel, Railway, etc.), pas dan aan waar nodig.
