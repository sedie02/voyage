#!/bin/bash
# Setup SSH key voor Skylabs toegang
# Run dit op je lokale Mac

echo "🔑 SSH Key Setup voor Skylabs"
echo "=============================="

# Check of SSH key al bestaat
if [ -f ~/.ssh/id_ed25519 ]; then
    echo "✅ SSH key bestaat al"
    echo ""
    echo "📋 Je public key:"
    cat ~/.ssh/id_ed25519.pub
    echo ""
    echo "Kopieer deze key en voeg toe aan Skylabs:"
    echo "1. Kopieer de key hierboven"
    echo "2. Op Skylabs: mkdir -p ~/.ssh && nano ~/.ssh/authorized_keys"
    echo "3. Plak de key en save (Ctrl+X, Y, Enter)"
    echo "4. chmod 600 ~/.ssh/authorized_keys"
    echo "5. chmod 700 ~/.ssh"
else
    echo "🔑 Genereer nieuwe SSH key..."
    ssh-keygen -t ed25519 -C "skylabs-voyage" -f ~/.ssh/id_ed25519 -N ""

    echo ""
    echo "✅ SSH key gegenereerd!"
    echo ""
    echo "📋 Je public key:"
    cat ~/.ssh/id_ed25519.pub
    echo ""
    echo "Kopieer deze key en voeg toe aan Skylabs:"
    echo "1. Kopieer de key hierboven"
    echo "2. Op Skylabs: mkdir -p ~/.ssh && nano ~/.ssh/authorized_keys"
    echo "3. Plak de key en save (Ctrl+X, Y, Enter)"
    echo "4. chmod 600 ~/.ssh/authorized_keys"
    echo "5. chmod 700 ~/.ssh"
fi

echo ""
echo "💡 Na het toevoegen van de key, test met:"
echo "   ssh student@jouw-skylabs-ip"


