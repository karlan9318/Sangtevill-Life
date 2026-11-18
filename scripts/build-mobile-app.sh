#!/usr/bin/env bash
set -euo pipefail

# 상떼빌라이프(Santeville Life) 모바일 앱(.apk / iOS) 설치파일 빌드 스크립트
# 사용법:
#   SERVER_URL="https://apt.yourdomain.kr" ./scripts/build-mobile-app.sh
#   (SERVER_URL 미지정 시 오프라인 번들(dist) 모드로 패키징됩니다)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_URL="${SERVER_URL:-}"

echo "========================================================"
echo "  상떼빌라이프 모바일 앱(Android APK / iOS) 빌드 준비"
echo "========================================================"

cd "${ROOT_DIR}"

# 1. Build latest web bundle
echo "[1/4] 프론트엔드 웹 자산 빌드 (npm run build)..."
npm run build

# 2. Install Capacitor CLI/Android if not yet installed
if [ ! -d "${ROOT_DIR}/node_modules/@capacitor/core" ]; then
  echo "[2/4] Capacitor 모바일 패키징 도구 설치 중..."
  npm install --save-dev @capacitor/cli
  npm install @capacitor/core @capacitor/android
else
  echo "[2/4] Capacitor 패키지 확인 완료."
fi

# 3. Optionally bind live server URL into capacitor.config.json
if [ -n "${SERVER_URL}" ]; then
  echo "[3/4] 운영 서버 URL(${SERVER_URL})을 모바일 앱 설정에 연결합니다..."
  node -e "
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
    cfg.server = { ...(cfg.server || {}), url: '${SERVER_URL}', cleartext: '${SERVER_URL}'.startsWith('http://') };
    fs.writeFileSync('capacitor.config.json', JSON.stringify(cfg, null, 2));
  "
else
  echo "[3/4] 로컬 번들(dist) 모드로 동기화합니다. (운영 서버 연동 시 SERVER_URL 환경변수 지정)"
fi

# 4. Initialize Android project & sync
if [ ! -d "${ROOT_DIR}/android" ]; then
  npx cap add android
fi
npx cap sync android

# 5. Build Debug/Release APK if Android SDK/Gradle is present
if [ -x "${ROOT_DIR}/android/gradlew" ]; then
  echo "[4/4] Android APK 빌드 실행 중 (gradlew assembleDebug)..."
  cd "${ROOT_DIR}/android"
  ./gradlew assembleDebug
  APK_PATH="${ROOT_DIR}/android/app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "${APK_PATH}" ]; then
    mkdir -p "${ROOT_DIR}/public/downloads"
    cp "${APK_PATH}" "${ROOT_DIR}/public/downloads/santeville-life.apk"
    echo ""
    echo "========================================================"
    echo "  모바일 APK 설치파일 생성 완료!"
    echo "  - 출력 경로: ${APK_PATH}"
    echo "  - 웹 배포용 경로: ${ROOT_DIR}/public/downloads/santeville-life.apk"
    echo "========================================================"
  fi
else
  echo "안내: Android 프로젝트(/android)가 생성되었습니다. Android Studio 또는 Android SDK 설치 후 ./android/gradlew assembleRelease 로 서명된 APK를 생성하세요."
fi
