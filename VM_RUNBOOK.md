# VM Runbook - Voyage Deployment

Korte referentie voor VM-deployment (bijv. Skylabs). 

**Note**: Productie draait op Vercel (voyagetravel.nl). Deze configuratie is voor VM-hosting en toont aan dat de app generiek deploybaar is zonder vendor-lock-in.

## Nginx Config

`/etc/nginx/sites-available/voyage`:

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

Enable: `sudo ln -s /etc/nginx/sites-available/voyage /etc/nginx/sites-enabled/`

## PM2 Config

`ecosystem.config.js` (root):

```javascript
module.exports = {
  apps: [
    {
      name: 'voyage',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/voyage',
      instances: 2,
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

## Deployment Commands

```bash
# Pull latest code
cd /var/www/voyage
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Restart PM2
pm2 reload voyage

# Check status
pm2 status

# View logs
pm2 logs voyage --lines 50
```

## Health Check

```bash
curl http://localhost:3000/api/health
```

Returns: `{"status":"ok","timestamp":"...","uptime":...}`

## Quick Deploy

```bash
cd /var/www/voyage
./deploy.sh
```
