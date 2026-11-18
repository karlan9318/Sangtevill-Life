#Requires -Version 5.1
<#
.SYNOPSIS
  상떼빌라이프(Santeville Life) Windows 서버 자동 설치 스크립트
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\install-server.ps1
#>

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = if ($env:PORT) { $env:PORT } else { "3000" }
$DataDir = Join-Path $AppDir "data"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  상떼빌라이프(Santeville Life) Windows 서버 설치" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "설치 경로: $AppDir"
Write-Host "서비스 포트: $Port"
Write-Host "데이터 저장소: $DataDir`n"

# 1. Check Node.js 22+
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "[오류] Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "https://nodejs.org 에서 Node.js 22 LTS 이상을 먼저 설치한 뒤 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

$nodeVersion = (& node -v).TrimStart("v")
$nodeMajor = [int]($nodeVersion.Split(".")[0])
if ($nodeMajor -lt 22) {
    Write-Host "[경고] 현재 Node.js v$nodeVersion 입니다. Node.js 22 LTS 이상을 권장합니다." -ForegroundColor Yellow
} else {
    Write-Host "[1/5] Node.js v$nodeVersion 확인 완료." -ForegroundColor Green
}

# 2. Prepare data dir & .env
Write-Host "[2/5] 환경 설정 파일(.env) 및 데이터 디렉토리 생성..."
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

$envFile = Join-Path $AppDir ".env"
if (-not (Test-Path $envFile)) {
@"
PORT=$Port
NODE_ENV=production
DATA_DIR=$DataDir
APP_URL=http://localhost:$Port
GEMINI_API_KEY=
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "  -> .env 파일 생성 완료."
} else {
    Write-Host "  -> 기존 .env 파일 유지."
}

# 3. Install dependencies
Write-Host "[3/5] npm 패키지 설치 중..."
Set-Location $AppDir
npm install

# 4. Build frontend & PWA
Write-Host "[4/5] 프로덕션 웹/PWA 빌드 중..."
npm run build

# 5. Create Windows start-server.bat
Write-Host "[5/5] 서버 실행 배치파일(start-server.bat) 생성 중..."
$batFile = Join-Path $AppDir "start-server.bat"
@"
@echo off
cd /d "%~dp0"
set NODE_ENV=production
set PORT=$Port
echo [상떼빌라이프 서버 시작] http://localhost:$Port
node server.ts
pause
"@ | Out-File -FilePath $batFile -Encoding ascii

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  설치 완료!" -ForegroundColor Green
Write-Host "  - 서버 실행: start-server.bat 더블클릭 또는 'npm start'"
Write-Host "  - 접속 주소: http://localhost:$Port"
Write-Host "  - 방화벽 포트 허용: Windows Defender 방화벽에서 TCP $Port 인바운드 허용"
Write-Host "========================================================" -ForegroundColor Green
