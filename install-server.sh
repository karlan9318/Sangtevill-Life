#!/usr/bin/env bash
set -euo pipefail

APP_NAME="santeville-life"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3000}"
DATA_DIR="${DATA_DIR:-${APP_DIR}/data}"

echo "========================================================"
echo "  상떼빌라이프(Santeville Life) 서버 자동 설치 스크립트"
echo "========================================================"
echo "설치 경로: ${APP_DIR}"
echo "서비스 포트: ${PORT}"
echo "데이터 저장소: ${DATA_DIR}"
echo ""

# 1. Check / Install Node.js 22+
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
else
  NODE_MAJOR=0
fi

if [ "${NODE_MAJOR}" -lt 22 ]; then
  echo "[1/5] Node.js 22 LTS 설치를 진행합니다..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif command -v dnf >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    sudo dnf install -y nodejs
  elif command -v brew >/dev/null 2>&1; then
    brew install node@22
  else
    echo "오류: Node.js 22 이상을 수동으로 먼저 설치해 주세요. (https://nodejs.org)"
    exit 1
  fi
else
  echo "[1/5] Node.js $(node -v) 확인 완료."
fi

# 2. Prepare environment file & persistent data directory
echo "[2/5] 환경 설정 파일(.env) 및 데이터 디렉토리 생성..."
mkdir -p "${DATA_DIR}"
if [ ! -f "${APP_DIR}/.env" ]; then
  cat > "${APP_DIR}/.env" <<EOF
PORT=${PORT}
NODE_ENV=production
DATA_DIR=${DATA_DIR}
APP_URL=http://localhost:${PORT}
GEMINI_API_KEY=
EOF
  echo "  -> .env 파일이 생성되었습니다."
else
  echo "  -> 기존 .env 파일을 유지합니다."
fi

# 3. Install dependencies
echo "[3/5] 서버 및 프론트엔드 패키지 설치 (npm install)..."
cd "${APP_DIR}"
npm install

# 4. Build production frontend & PWA bundle
echo "[4/5] 프로덕션 웹/PWA 번들 빌드 (npm run build)..."
npm run build

# 5. Optional systemd service registration on Linux
echo "[5/5] 서버 서비스 등록 확인..."
if command -v systemctl >/dev/null 2>&1 && [ -d /etc/systemd/system ]; then
  SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"
  RUN_USER="${SUDO_USER:-$(whoami)}"
  NODE_BIN="$(command -v node)"

  echo "Linux systemd 백그라운드 서비스(${APP_NAME}.service)를 등록하시겠습니까? [y/N]"
  read -r INSTALL_SVC || INSTALL_SVC="n"
  if [[ "${INSTALL_SVC}" =~ ^[Yy]$ ]]; then
    sudo tee "${SERVICE_FILE}" >/dev/null <<EOF
[Unit]
Description=Santeville Life Apartment Community Server
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
Environment=NODE_ENV=production
ExecStart=${NODE_BIN} ${APP_DIR}/server.ts
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable "${APP_NAME}"
    sudo systemctl restart "${APP_NAME}"
    echo "  -> systemd 서비스가 시작되었습니다! (상태 확인: sudo systemctl status ${APP_NAME})"
  else
    echo "  -> 수동 실행 방법: NODE_ENV=production npm start"
  fi
else
  echo "  -> 수동 실행 방법: NODE_ENV=production npm start"
fi

# Firewall hint
if command -v ufw >/dev/null 2>&1; then
  echo ""
  echo "방화벽(UFW) 사용 시 아래 명령으로 포트를 허용하세요:"
  echo "  sudo ufw allow ${PORT}/tcp"
fi

LOCAL_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || echo '127.0.0.1')"
echo ""
echo "========================================================"
echo "  설치 완료!"
echo "  - 로컬 접속: http://localhost:${PORT}"
echo "  - 사설망 접속: http://${LOCAL_IP}:${PORT}"
echo "  - 서버 상태 API: http://${LOCAL_IP}:${PORT}/api/health"
echo "  - 모바일 앱 설치: 모바일 브라우저로 접속 후 상단 [앱 설치] 클릭"
echo "    (HTTPS 도메인 연결 시 Android/iOS 홈 화면 앱 설치 및 카메라 사용 가능)"
echo "========================================================"
