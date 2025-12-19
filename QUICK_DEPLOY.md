# 🚀 Quick Deploy naar Skylabs

## Stap 1: Code naar server krijgen

**Optie A: Via Git (aanbevolen)**

```bash
# Op Skylabs server:
cd /var/www/voyage  # of waar je code staat
git pull origin main
```

**Optie B: Via SCP (als Git niet werkt)**

```bash
# Op je lokale machine:
cd /Users/safouane/Documents/code/voyage
scp -r . student@jouw-skylabs-ip:/var/www/voyage/
```

## Stap 2: Deploy script uitvoeren

```bash
# Op Skylabs server:
cd /var/www/voyage
chmod +x deploy.sh
./deploy.sh
```

## Stap 3: Check of het werkt

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs voyage --lines 50

# Check of app draait
curl http://localhost:3000/api/health
```

## Handmatige deploy (als script niet werkt)

```bash
cd /var/www/voyage
git pull origin main
npm ci --production
npm run build
pm2 reload voyage
```

## Troubleshooting

**App start niet:**

```bash
pm2 logs voyage
# Check errors in logs
```

**Build faalt:**

```bash
npm run type-check
npm run lint
# Fix errors eerst
```

**PM2 niet geïnstalleerd:**

```bash
sudo npm install -g pm2
pm2 startup  # Volg instructies
```

**Port 3000 al in gebruik:**

```bash
# Check wat er draait
sudo lsof -i :3000
# Stop andere processen of verander PORT in .env.local
```
