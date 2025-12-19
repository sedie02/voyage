# 🔐 SSH Toegang tot Skylabs

## Stap 1: Op je lokale Mac

Run dit script om SSH key te genereren/kopiëren:

```bash
cd /Users/safouane/Documents/code/voyage
./setup-ssh.sh
```

Dit toont je public key. **Kopieer deze key**.

## Stap 2: Op Skylabs server

Run deze commands om de SSH key toe te voegen:

```bash
# Maak .ssh directory
mkdir -p ~/.ssh

# Voeg key toe
nano ~/.ssh/authorized_keys
# Plak je public key hier, save (Ctrl+X, Y, Enter)

# Set correcte permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Stap 3: Test SSH connectie

Op je lokale Mac:

```bash
ssh student@jouw-skylabs-ip
```

Als het werkt, kun je nu zonder password inloggen!

## Stap 4: Run setup script op Skylabs

```bash
# Upload script naar Skylabs (of clone repo)
cd /var/www/voyage
# Of als je repo al hebt:
git pull origin main

# Run setup script
chmod +x skylabs-first-setup.sh
./skylabs-first-setup.sh
```

## Alternatief: Direct commands op Skylabs

Als je liever handmatig doet, run deze commands op Skylabs:

```bash
# 1. Update & install basics
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repo
sudo mkdir -p /var/www/voyage
sudo chown $USER:$USER /var/www/voyage
cd /var/www/voyage
git clone https://github.com/sedie02/voyage.git .

# 5. Maak .env.local
nano .env.local
# (Vul environment variables in)

# 6. Install & build
npm ci --production
npm run build

# 7. Start PM2
sudo mkdir -p /var/log/voyage
sudo chown $USER:$USER /var/log/voyage
pm2 start npm --name voyage -- start
pm2 save
pm2 startup  # Volg instructies
```

## SSH Config (optioneel, voor makkelijke toegang)

Op je lokale Mac, maak `~/.ssh/config`:

```
Host skylabs
    HostName jouw-skylabs-ip
    User student
    IdentityFile ~/.ssh/id_ed25519
```

Dan kun je gewoon `ssh skylabs` typen!
