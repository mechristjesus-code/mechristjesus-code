#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
#  Creator DNA OS — Termux Installer
#  Run this in Termux on your Android phone:
#    curl -fsSL https://mechristjesus-code.github.io/mechristjesus-code/install.sh | bash
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "  ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗     ██████╗ ███╗   ██╗ █████╗ "
echo "  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗████╗  ██║██╔══██╗"
echo "  ██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝    ██║  ██║██╔██╗ ██║███████║"
echo "  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗    ██║  ██║██║╚██╗██║██╔══██║"
echo "  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║ ╚████║██║  ██║"
echo "   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${BOLD}  Creator DNA OS — Termux Setup Script${NC}"
echo -e "  AI Creator Platform for Android / Termux"
echo ""

# ── Step 1: Update packages ──────────────────────────────────
echo -e "${YELLOW}[1/6] Updating Termux packages...${NC}"
pkg update -y && pkg upgrade -y

# ── Step 2: Install core dependencies ───────────────────────
echo -e "${YELLOW}[2/6] Installing dependencies (git, python, nodejs, curl)...${NC}"
pkg install -y git python nodejs curl openssl

# ── Step 3: Install pip packages ────────────────────────────
echo -e "${YELLOW}[3/6] Installing Python packages...${NC}"
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose httpx redis alembic python-multipart

# ── Step 4: Clone the repository ────────────────────────────
echo -e "${YELLOW}[4/6] Cloning Creator DNA OS...${NC}"
INSTALL_DIR="$HOME/creator-dna-os"

if [ -d "$INSTALL_DIR" ]; then
  echo -e "${CYAN}  Directory already exists — pulling latest changes...${NC}"
  git -C "$INSTALL_DIR" pull
else
  git clone https://github.com/mechristjesus-code/mechristjesus-code.git "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# ── Step 5: Set up environment ───────────────────────────────
echo -e "${YELLOW}[5/6] Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo -e "${RED}  ⚠️  ACTION REQUIRED:${NC}"
  echo -e "  Edit your .env file and set:"
  echo -e "  ${BOLD}OPENAI_API_KEY${NC} = your OpenAI key"
  echo -e "  ${BOLD}SECRET_KEY${NC}     = a long random string"
  echo ""
  echo -e "  Run:  ${CYAN}nano $INSTALL_DIR/.env${NC}"
fi

# ── Step 6: Install frontend deps ───────────────────────────
echo -e "${YELLOW}[6/6] Installing Node.js frontend dependencies...${NC}"
if command -v npm &>/dev/null; then
  cd "$INSTALL_DIR/apps/web" && npm install --legacy-peer-deps
  cd "$INSTALL_DIR"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✅ Installation complete!${NC}"
echo ""
echo -e "  ${BOLD}To start the API Gateway (backend):${NC}"
echo -e "  ${CYAN}cd ~/creator-dna-os && uvicorn services.gateway.main:app --host 0.0.0.0 --port 8000 --reload${NC}"
echo ""
echo -e "  ${BOLD}To start the frontend dev server:${NC}"
echo -e "  ${CYAN}cd ~/creator-dna-os/apps/web && npm run dev${NC}"
echo ""
echo -e "  Then open ${BOLD}http://localhost:3000${NC} in your browser."
echo ""
echo -e "  ${YELLOW}Tip: Install 'Termux:Widget' from F-Droid to add a launcher shortcut.${NC}"
echo ""
