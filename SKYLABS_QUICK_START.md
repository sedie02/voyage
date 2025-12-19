# 🚀 Skylabs Quick Start (Zonder Internet)

Als je geen internet hebt op Skylabs, gebruik deze handmatige setup:

## Check Internet

```bash
# Test internet connectie
ping -c 3 8.8.8.8

# Test DNS
ping -c 3 google.com

# Check network interface
ip addr show

# Check routing
ip route
```

## Als er GEEN internet is:

### Optie 1: Via SCP (van je Mac naar Skylabs)

**Op je Mac:**

```bash
cd /Users/safouane/Documents/code/voyage
scp skylabs-auto-setup.sh student@jouw-skylabs-ip:~/
```

**Dan op Skylabs:**

```bash
chmod +x skylabs-auto-setup.sh
./skylabs-auto-setup.sh
```

### Optie 2: Handmatig script maken op Skylabs

Run deze commands één voor één op Skylabs:

```bash
# 1. Maak script bestand
cat > setup.sh << 'SCRIPT_END'
#!/bin/bash
set -e

echo "🚀 Voyage Setup"

# SSH key
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINRpqChGw4qvyUQp5QeGiFNCNT4NYdcKJd1Yr2+X4Twh skylabs-voyage" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Update
sudo apt update && sudo apt upgrade -y

# Install basics
sudo apt install -y git curl wget build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Directories
sudo mkdir -p /var/www/voyage /var/log/voyage
sudo chown -R $USER:$USER /var/www/voyage /var/log/voyage

# Clone repo (als je internet hebt)
cd /var/www/voyage
git clone https://github.com/sedie02/voyage.git . || echo "Git clone failed"

# .env.local moet je handmatig maken
echo "⚠️  Maak .env.local aan met: nano .env.local"

SCRIPT_END

chmod +x setup.sh
./setup.sh
```

### Optie 3: Fix DNS eerst

```bash
# Check DNS config
cat /etc/resolv.conf

# Fix DNS (tijdelijk)
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf

# Test opnieuw
ping -c 3 google.com
```

## Als er WEL internet is maar DNS niet werkt:

```bash
# Fix DNS
sudo systemd-resolve --flush-caches
sudo systemd-resolve --status

# Of handmatig
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf
```

## Handmatige Setup (Zonder Script)

Als niets werkt, run deze commands handmatig:

```bash
# 1. SSH key
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Plak: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINRpqChGw4qvyUQp5QeGiFNCNT4NYdcKJd1Yr2+X4Twh skylabs-voyage
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 2. Update
sudo apt update
sudo apt upgrade -y

# 3. Install tools
sudo apt install -y git curl wget build-essential

# 4. Node.js (als internet werkt)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. PM2
sudo npm install -g pm2

# 6. Directories
sudo mkdir -p /var/www/voyage
sudo chown $USER:$USER /var/www/voyage
```
