#!/bin/bash

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}--- Removing Aegis CLI ---${NC}"

# Remove the command from the system
echo "Removing the 'aegis' command from your system..."
npm unlink -g

# Ask if the user wants to delete the downloaded libraries
echo -e "\n${YELLOW}Do you also want to delete the 'node_modules' folder?${NC}"
echo "(These are the helper files we downloaded. Deleting them saves space.)"
read -p "Type 'y' for Yes, or 'n' for No: " choice

if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo "Cleaning up files..."
    rm -rf node_modules
    echo -e "${GREEN}✔ Helper files deleted.${NC}"
else
    echo "Okay, we'll keep the files there."
fi

echo -e "\n${GREEN}✔ Aegis CLI has been successfully removed.${NC}"