#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
#  Creator DNA OS — UNIFIED INSTALLER (All 3 Options)
#  Installs: Termux backend + PWA browser shortcut + APK build
#
#  Run in Termux:
#    curl -fsSL https://raw.githubusercontent.com/mechristjesus-code/mechristjesus-code/main/setup-all.sh | bash
# ============================================================
set -e

# ── Colors ───────────────────────────────────────────────────
R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m'
C='\033[0;36m' B='\033[1m' N='\033[0m'
OK="${G}✔${N}" FAIL="${R}✘${N}" INFO="${C}→${N}"

REPO="https://github.com/mechristjesus-code/mechristjesus-code.git"
INSTALL_DIR="$HOME/creator-dna-os"
LOG="$HOME/creator-dna-install.log"

step() { echo -e "\n${Y}${B}[$1/7] $2${N}"; }
ok()   { echo -e "  ${OK} $1"; }
info() { echo -e "  ${INFO} $1"; }
fail() { echo -e "  ${FAIL} $1"; }

banner() {
echo -e "${C}${B}"
cat << 'EOF'
  ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗     ██████╗ ███╗   ██╗ █████╗
 ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗████╗  ██║██╔══██╗
 ██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝    ██║  ██║██╔██╗ ██║███████║
 ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗    ██║  ██║██║╚██╗██║██╔══██║
 ╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║ ╚████║██║  ██║
  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝╚═╝  ╚═══╝╚═╝  ╚═╝
EOF
echo -e "${N}"
echo -e "  ${B}UNIFIED INSTALLER — Sets up all 3 options at once${N}"
echo -e "  ${C}PWA  +  Termux Backend  +  Android APK Builder${N}"
echo ""
echo "  Log: $LOG"
echo ""
}

banner
exec > >(tee -a "$LOG") 2>&1

# ── Step 1: Update & core deps ───────────────────────────────
step 1 "Updating Termux & installing core packages"
pkg update -y && pkg upgrade -y
pkg install -y git python nodejs curl openssl wget unzip openjdk-17
ok "Core packages installed"

# ── Step 2: Clone / update repo ──────────────────────────────
step 2 "Cloning Creator DNA OS repository"
if [ -d "$INSTALL_DIR/.git" ]; then
  info "Repo exists — pulling latest..."
  git -C "$INSTALL_DIR" pull --ff-only
  ok "Repository updated"
else
  git clone "$REPO" "$INSTALL_DIR"
  ok "Repository cloned to $INSTALL_DIR"
fi

# ── Step 3: Python backend deps ──────────────────────────────
step 3 "Installing Python backend dependencies"
pip install --upgrade pip --quiet
pip install --quiet \
  fastapi uvicorn sqlalchemy pydantic "pydantic[email]" \
  passlib "python-jose[cryptography]" httpx redis \
  alembic python-multipart aiofiles python-dotenv
ok "Python packages installed"

# ── Step 4: Node / frontend deps ─────────────────────────────
step 4 "Installing Node.js frontend dependencies"
cd "$INSTALL_DIR/apps/web"
npm install --legacy-peer-deps --silent
ok "Frontend (React/Vite) dependencies installed"
cd "$INSTALL_DIR"

# ── Step 5: Environment setup ────────────────────────────────
step 5 "Setting up environment variables"
if [ ! -f "$INSTALL_DIR/.env" ]; then
  cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
  info "Created .env from template"
  info "You MUST set OPENAI_API_KEY and SECRET_KEY before starting"
else
  ok ".env already exists — skipping"
fi

# ── Step 6: PWA — create browser shortcut HTML ───────────────
step 6 "Setting up PWA shortcut"
SHORTCUT_DIR="$HOME/storage/downloads/CreatorDNA"
mkdir -p "$SHORTCUT_DIR" 2>/dev/null || mkdir -p "$HOME/CreatorDNA-PWA"
TARGET="${SHORTCUT_DIR:-$HOME/CreatorDNA-PWA}"

cat > "$TARGET/open-creator-dna.html" << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Open Creator DNA OS</title>
  <style>
    body{margin:0;background:#030712;color:#fff;font-family:sans-serif;
         display:flex;align-items:center;justify-content:center;min-height:100vh;
         flex-direction:column;text-align:center;gap:1.5rem;padding:2rem}
    h1{font-size:1.8rem;background:linear-gradient(135deg,#fff,#a78bfa);
       -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0}
    p{color:#9ca3af;margin:0;font-size:.95rem}
    a{display:inline-block;padding:.85rem 2.5rem;background:#7c3aed;color:#fff;
      border-radius:.85rem;text-decoration:none;font-weight:700;font-size:1rem;
      margin:.5rem .25rem}
    a.sec{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15)}
  </style>
</head>
<body>
  <div style="font-size:3.5rem">🧬</div>
  <h1>Creator DNA OS</h1>
  <p>Your local app is running at localhost:3000<br>or connect to the web version below.</p>
  <a href="http://localhost:3000">Open Local App</a>
  <a class="sec" href="http://localhost:3000/download">📱 Install Guide</a>
  <script>setTimeout(()=>window.location='http://localhost:3000',1500)</script>
</body>
</html>
HTMLEOF

ok "PWA shortcut saved to $TARGET/open-creator-dna.html"
info "Open this file in Chrome → 'Add to Home Screen' for PWA install"

# ── Step 7: APK builder script ───────────────────────────────
step 7 "Creating APK build helper"
cat > "$INSTALL_DIR/build-apk.sh" << 'APKEOF'
#!/data/data/com.termux/files/usr/bin/bash
# Build the Android APK inside Termux using Gradle
# Requires: openjdk-17 (already installed by setup-all.sh)
set -e
echo "🔨 Building Creator DNA OS APK..."
cd "$(dirname "$0")/android"
chmod +x gradlew 2>/dev/null || true

# Download gradle wrapper if missing
if [ ! -f "gradlew" ]; then
  gradle wrapper --gradle-version=8.4
fi

./gradlew assembleDebug
APK=$(find . -name "*.apk" | head -1)
DEST="$HOME/storage/downloads/creator-dna-os.apk"
cp "$APK" "$DEST" 2>/dev/null || cp "$APK" "$HOME/creator-dna-os.apk"
echo "✅ APK built: ${DEST:-$HOME/creator-dna-os.apk}"
echo "   Open your Files app and tap it to install."
APKEOF
chmod +x "$INSTALL_DIR/build-apk.sh"
ok "APK build script ready at $INSTALL_DIR/build-apk.sh"

# ── Write launch script ───────────────────────────────────────
cat > "$INSTALL_DIR/start.sh" << 'STARTEOF'
#!/data/data/com.termux/files/usr/bin/bash
# Start all Creator DNA OS services
INSTALL_DIR="$(dirname "$0")"
cd "$INSTALL_DIR"

echo "🧬 Starting Creator DNA OS..."

# Start API Gateway in background
echo "  → Starting API Gateway on :8000"
uvicorn services.gateway.main:app --host 0.0.0.0 --port 8000 &
GW_PID=$!

# Start frontend
echo "  → Starting Frontend on :3000"
cd apps/web && npm run dev &
FE_PID=$!
cd "$INSTALL_DIR"

echo ""
echo "✅ Running! Open http://localhost:3000 in your browser."
echo "   Press Ctrl+C to stop all services."

trap "kill $GW_PID $FE_PID 2>/dev/null; exit" INT TERM
wait
STARTEOF
chmod +x "$INSTALL_DIR/start.sh"

# ── Summary ──────────────────────────────────────────────────
echo ""
echo -e "${G}${B}╔══════════════════════════════════════════════════╗${N}"
echo -e "${G}${B}║   ✅  INSTALLATION COMPLETE                      ║${N}"
echo -e "${G}${B}╚══════════════════════════════════════════════════╝${N}"
echo ""
echo -e "  ${B}NEXT STEPS:${N}"
echo ""
echo -e "  ${Y}1. Set your API key:${N}"
echo -e "     nano $INSTALL_DIR/.env"
echo -e "     (set OPENAI_API_KEY and SECRET_KEY)"
echo ""
echo -e "  ${Y}2. Start everything:${N}"
echo -e "     bash $INSTALL_DIR/start.sh"
echo ""
echo -e "  ${Y}3. Install as PWA:${N}"
echo -e "     Open $TARGET/open-creator-dna.html in Chrome"
echo -e "     → tap 'Add to Home Screen'"
echo ""
echo -e "  ${Y}4. Build APK (optional):${N}"
echo -e "     bash $INSTALL_DIR/build-apk.sh"
echo ""
echo -e "  Log saved to: ${C}$LOG${N}"
echo ""
