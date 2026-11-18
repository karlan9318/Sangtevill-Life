# 상떼빌라이프(Santeville Life) 서버 및 모바일 앱 설치 가이드

동작상떼빌 아파트 입주민 커뮤니티 & 관리사무소 백오피스 통합 시스템(**상떼빌라이프**)의 자체 서버 구축 및 모바일 앱 설치 안내서입니다.

---

## 1. 서버 시스템 구성 및 요구 사양

| 항목 | 최소 사양 | 권장 사양 |
| :--- | :--- | :--- |
| **OS** | Ubuntu 22.04+ / Debian 12+ / Windows Server 2019+ / Docker | Ubuntu 24.04 LTS 또는 Docker |
| **런타임** | Node.js v22 LTS 이상 | Node.js v22.x LTS |
| **CPU / RAM** | 2 vCPU / 2 GB RAM | 2~4 vCPU / 4 GB RAM |
| **디스크** | 10 GB 여유 공간 | 20 GB 이상 (점검 사진 및 DB 백업 포함) |
| **네트워크** | TCP 3000 (내부) / TCP 80, 443 (외부 HTTPS) | 도메인 + Let's Encrypt SSL 인증서 적용 |

---

## 2. 서버 설치 방법 (3가지 중 선택)

### 방법 A. Linux / macOS 원클릭 자동 설치 (`install-server.sh`)
```bash
chmod +x install-server.sh
./install-server.sh
```
- Node.js 22 확인/설치, `.env` 생성, `npm install`, `npm run build`, `data/` 저장소 생성을 자동 수행합니다.
- 설치 마지막 단계에서 **`systemd` 백그라운드 자동 실행 서비스(`santeville-life.service`)** 등록 여부를 선택할 수 있습니다.

### 방법 B. Windows 서버 / PC 설치 (`install-server.ps1`)
1. [Node.js 공식 사이트](https://nodejs.org)에서 **v22 LTS**를 설치합니다.
2. PowerShell을 열고 프로젝트 폴더에서 아래 명령을 실행합니다.
```powershell
powershell -ExecutionPolicy Bypass -File .\install-server.ps1
```
3. 생성된 **`start-server.bat`** 파일을 실행하거나 `npm start`로 서버를 가동합니다.

### 방법 C. Docker / Docker Compose 설치 (`docker-compose.yml`)
```bash
docker compose up -d --build
```
- 컨테이너가 `3000` 포트로 자동 기동되며, 데이터는 영구 볼륨(`santeville_data:/app/data/santeville-db.json`)에 안전하게 보관됩니다.

---

## 3. 환경 변수 (`.env`) 및 도메인(HTTPS) 연결

```env
PORT=3000
NODE_ENV=production
DATA_DIR=./data
APP_URL=https://apt.santeville.kr
```

### HTTPS(SSL) 적용 필수 안내
모바일 브라우저의 **PWA 앱 설치 기능**, **서비스 워커(오프라인 캐시)**, **시설점검 현장 카메라 촬영(`getUserMedia`)**은 보안상 `https://` 또는 `localhost` 환경에서만 정상 동작합니다.  
실서버 도메인 운영 시 `deploy/nginx.conf.example`을 참고하여 Nginx + Certbot(Let's Encrypt) HTTPS 리버스 프록시를 연결해 주세요.

---

## 4. 서버 API 및 데이터 백업/복구

- **헬스체크**: `GET /api/health`
- **전체 상태 조회**: `GET /api/state`
- **항목별 실시간 저장**: `PUT /api/state/:key` (`users`, `posts`, `archives`, `votes`, `chatRooms`, `chatMessages`, `smsLogs`, `facilities`, `visitorVehicles`, `monthlyParkingLimitHours`)
- **DB 백업 파일 다운로드**: 브라우저 또는 `curl`로 `GET /api/backup` 호출 시 `santeville-backup-YYYY-MM-DD.json` 즉시 다운로드
- **실서버 데이터 저장 경로**: `${DATA_DIR}/santeville-db.json` (일일 정기 백업 권장)

---

## 5. 모바일 앱 설치 방법 (2가지 제공)

### 방식 1. 별도 스토어 심사 없는 즉시 앱 설치 (PWA — Android & iOS 모두 지원)
상떼빌라이프는 표준 **Progressive Web App(PWA)** 규격과 오프라인 캐시, 앱 아이콘(`192x192`, `512x512`, `apple-touch-icon.png`)이 모두 내장되어 있습니다.

1. 스마트폰 브라우저(Android: **Chrome / 삼성 인터넷**, iPhone: **Safari**)로 구축된 서버 주소(`https://도메인`)에 접속합니다.
2. 상단 헤더 또는 로그인 화면의 **`앱 설치`** 버튼을 누릅니다.
   - **Android**: 즉시 네이티브 설치 팝업이 뜨며, 홈 화면과 앱 서랍에 **상떼빌라이프** 독립 앱 아이콘이 생성됩니다. (주소창 없는 `standalone` 풀스크린 실행)
   - **iOS (iPhone / iPad)**: 화면 안내에 따라 Safari 하단 **공유(□↑)** → **홈 화면에 추가**를 누르면 앱으로 설치됩니다.

### 방식 2. Android `.apk` 설치 파일 직접 생성 (Capacitor 패키징)
구글 플레이스토어 또는 아파트 관리사무소 배포용 **`.apk` 설치 파일**이 필요한 경우 제공된 `capacitor.config.json` 및 `scripts/build-mobile-app.sh`를 사용합니다.

**사전 준비**: Android Studio 또는 Android SDK Build Tools & JDK 17 설치

```bash
chmod +x scripts/build-mobile-app.sh
SERVER_URL="https://apt.santeville.kr" ./scripts/build-mobile-app.sh
```
- 빌드가 완료되면 `android/app/build/outputs/apk/debug/app-debug.apk` (및 웹 배포 경로 `public/downloads/santeville-life.apk`) 파일이 생성됩니다.
- 배포용 서명 릴리스 파일(`.apk` / `.aab`)은 `android/` 폴더를 Android Studio에서 열어 **Build > Generate Signed Bundle / APK**로 생성할 수 있습니다.
