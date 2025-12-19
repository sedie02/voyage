# Voyage Deployment

Hoe je Voyage deployt op een VM (bijv. Skylabs) met PM2 en Nginx.

**Note**: Productie draait op Vercel (voyagetravel.nl). Deze guide is voor VM-deployment en toont aan dat de app generiek deploybaar is zonder vendor-lock-in.

## Setup

- Server: Skylabs VM (Ubuntu)
- Process Manager: PM2
- Reverse Proxy: Nginx
- Database: Supabase (cloud)

## Vereisten

- Ubuntu server (20.04+)
- Node.js 18+
- Nginx
- PM2
- Supabase project

## Stap 1: Server Setup

### Node.js Installeren

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
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
sudo mkdir -p /var/www/voyage
sudo chown $USER:$USER /var/www/voyage
cd /var/www/voyage
git clone https://github.com/sedie02/voyage.git .

# of als je al code hebt
git pull origin main
```

### Install Dependencies

```bash
cd /var/www/voyage
npm ci --production
```

### Environment Variables

```bash
nano /var/www/voyage/.env.local
```

Vul in:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://jouw-skylabs-ip:3000

NEXT_PUBLIC_SUPABASE_URL=https://kslkoizgefalcxvtjeqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGtvaXpnZWZhbGN4dnRqZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjI1NjMsImV4cCI6MjA3NDc5ODU2M30.I2QE4PoC48dr3UavQUmEMsHQLg5HzC1U1TJtUGjd-8k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGtvaXpnZWZhbGN4dnRqZXFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMjU2MywiZXhwIjoyMDc0Nzk4NTYzfQ.QIkgSdv4yJDfmpaaOF9KVjJ5EQSbGWyog9J5k9ZafvE

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYak-2uSDvX8K63127eLHYklyxk1t_J2A
```

`.env.local` staat al in `.gitignore`.

## Stap 3: Build

```bash
cd /var/www/voyage
npm run build
```

**Als build faalt:**

- check environment variables
- check dependencies: `npm ci`
- check TypeScript: `npm run type-check`

## Stap 4: PM2 Setup

### PM2 Starten

```bash
sudo mkdir -p /var/log/voyage
sudo chown $USER:$USER /var/log/voyage
pm2 start npm --name voyage -- start
pm2 save
pm2 startup  # volg instructies
```

### PM2 Commands

```bash
pm2 status
pm2 logs voyage
pm2 restart voyage
pm2 stop voyage
pm2 reload voyage
```

## Stap 5: Nginx Configuratie (optioneel)

```bash
sudo nano /etc/nginx/sites-available/voyage
```

**Config:**

```nginx
server {
    listen 80;
    server_name _;

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

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable:**

```bash
sudo ln -s /etc/nginx/sites-available/voyage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Stap 6: Firewall

```bash
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

## Deployment Workflow

### Update Deployen

```bash
cd /var/www/voyage
git pull origin main
npm ci --production
npm run build
pm2 reload voyage
pm2 logs voyage --lines 50
```

**Of gebruik deploy script:**

```bash
cd /var/www/voyage
./deploy.sh
```

### Rollback

```bash
cd /var/www/voyage
git checkout <previous-commit-hash>
npm ci --production
npm run build
pm2 reload voyage
```

## Monitoring

```bash
pm2 monit
pm2 logs voyage
sudo tail -f /var/log/nginx/error.log
tail -f /var/log/voyage/out.log
```

## Troubleshooting

**App start niet:**

```bash
pm2 status
pm2 logs voyage
cat .env.local
ls -la .next/
```

**502 Bad Gateway:**

```bash
pm2 status
netstat -tulpn | grep 3000
sudo tail -f /var/log/nginx/error.log
```

**Database connectie errors:**

- check Supabase URL en keys in `.env.local`
- check of Supabase project actief is

**Build errors:**

```bash
node --version  # moet 18+ zijn
npm ci
npm run type-check
```

## Security

- environment variables niet in git
- firewall actief (UFW)
- PM2 als non-root user
- Supabase RLS policies correct
