#!/bin/bash

# Colors to make text look nice
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}--- Setting up Aegis CLI ---${NC}"

# Check if Node.js is installed (it's the engine needed to run this)
if ! command -v node &> /dev/null; then
    echo -e "${RED}Oops! I couldn't find Node.js on your computer.${NC}"
    echo "You need to install Node.js first to run this tool."
    exit 1
fi

echo "Downloading the necessary parts (dependencies)..."
npm install

echo "Getting everything ready..."
chmod +x index.js
npm link

echo -e "\n${GREEN}✔ All done! Aegis CLI is installed.${NC}"
echo "You can now use it by typing: aegis"
