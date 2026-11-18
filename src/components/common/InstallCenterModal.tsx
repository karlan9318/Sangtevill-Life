import React, { useEffect, useState } from 'react';
import {
  Server,
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  Terminal,
  HardDrive,
  ShieldCheck,
  Globe,
  FileCode
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthInfo {
  ok: boolean;
  service: string;
  version: string;
  nodeVersion: string;
  port: number;
  dataFile: string;
  updatedAt: string;
}

interface InstallInfo {
  currentOrigin: string;
  networkUrls: string[];
  port: number;
  dataDirectory: string;
}

export const InstallCenterModal: React.FC<InstallCenterModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'mobile' | 'server'>('mobile');
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [installInfo, setInstallInfo] = useState<InstallInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/health')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setHealth(data);
      })
      .catch(() => {});

    fetch('/api/install-info')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setInstallInfo(data);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const copyCommand = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const serverDownloadFiles = [
    { id: 'install-server.sh', label: 'Linux / macOS 자동 설치 스크립트', desc: 'Node 22 + 빌드 + systemd 서비스 등록' },
    { id: 'install-server.ps1', label: 'Windows PowerShell 설치 스크립트', desc: 'Windows 서버 설치 및 start-server.bat 생성' },
    { id: 'docker-compose.yml', label: 'Docker Compose 배포 설정', desc: '컨테이너 실행 + 영구 데이터 볼륨 구성' },
    { id: 'Dockerfile', label: '운영용 Dockerfile', desc: 'Node 22 Alpine 이미지 빌드 정의' },
    { id: 'santeville-life.service', label: 'Linux systemd 서비스 유닛', desc: '부팅 시 자동 시작 및 장애 시 자동 복구' },
    { id: 'nginx.conf.example', label: 'Nginx HTTPS 리버스 프록시 설정', desc: 'SSL 인증서 연결 (모바일 PWA·카메라 필수)' },
    { id: 'SERVER_AND_MOBILE_INSTALL.md', label: '서버·모바일 전체 설치 매뉴얼', desc: '요구사양, 방화벽, 백업, 앱 배포 가이드' },
  ];

  const mobileDownloadFiles = [
    { id: 'capacitor.config.json', label: 'Capacitor 모바일 앱 설정 파일', desc: 'Android/iOS 패키지명(kr.santeville.life) 및 서버 연동' },
    { id: 'build-mobile-app.sh', label: 'Android APK 자동 빌드 스크립트', desc: '자체 서버 URL 연결형 .apk 설치파일 생성' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                상떼빌라이프 서버 & 모바일 앱 설치 센터
              </h2>
              <p className="text-[11px] text-slate-300">
                자체 서버 설치 파일 다운로드 및 Android · iOS 모바일 앱 설치
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Server Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold text-slate-800">
              {health?.ok ? `서버 정상 가동 중 (Node ${health.nodeVersion} · 포트 ${health.port})` : '오프라인 / 로컬 캐시 모드'}
            </span>
          </div>
          {health?.ok && (
            <a
              href="/api/backup"
              download
              className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>서버 DB 백업 다운로드 (.json)</span>
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex gap-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mobile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>모바일 앱 설치 (PWA / APK)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('server')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'server'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>자체 서버 설치 파일 & 정보</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {activeTab === 'mobile' ? (
            <>
              {/* 1. Immediate PWA Mobile App Installation */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>1. 즉시 설치형 모바일 앱 (PWA — 스토어 설치 불필요)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Android(Chrome/삼성 인터넷) 및 iPhone(Safari)에서 홈 화면에 독립 앱으로 바로 설치됩니다.
                    </p>
                  </div>
                  {isInstalled ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                      이미 앱으로 실행 중
                    </span>
                  ) : isInstallable ? (
                    <button
                      type="button"
                      onClick={install}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>지금 바로 앱 설치하기</span>
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                    <strong className="text-slate-900 block">Android (Chrome / 삼성 인터넷)</strong>
                    <p className="text-slate-600 leading-relaxed">
                      브라우저 메뉴(⋮) → <strong>&quot;앱 설치&quot;</strong> 또는 <strong>&quot;홈 화면에 추가&quot;</strong>를 누르면 상떼빌라이프 앱 아이콘이 생성됩니다.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                    <strong className="text-slate-900 block">
                      iPhone / iPad (Safari) {isIOS ? '· 현재 iOS 접속' : ''}
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      Safari 하단 <strong>공유(□↑)</strong> 버튼 → <strong>&quot;홈 화면에 추가&quot;</strong> 선택 시 풀스크린 독립 앱으로 실행됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Android APK Packaging Files */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    <span>2. Android APK 설치 파일 생성 패키지 (Capacitor)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    관리사무소 배포용 <code>.apk</code> 파일이 필요한 경우 아래 설정 파일과 빌드 스크립트로 즉시 생성할 수 있습니다.
                  </p>
                </div>

                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] flex items-center justify-between gap-2">
                  <span className="overflow-x-auto whitespace-nowrap">
                    SERVER_URL=&quot;{installInfo?.currentOrigin || 'https://apt.yourdomain.kr'}&quot; ./scripts/build-mobile-app.sh
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyCommand(
                        'apk',
                        `SERVER_URL="${installInfo?.currentOrigin || 'https://apt.yourdomain.kr'}" ./scripts/build-mobile-app.sh`
                      )
                    }
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === 'apk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>복사</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mobileDownloadFiles.map(file => (
                    <a
                      key={file.id}
                      href={`/api/download/${file.id}`}
                      download={file.id}
                      className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <strong className="text-slate-900 block truncate">{file.label}</strong>
                        <span className="text-[11px] text-slate-500 block truncate">{file.desc}</span>
                      </div>
                      <Download className="w-4 h-4 text-blue-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Server Info Summary */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>서버 구성 및 접속 정보</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <span className="text-slate-400 block text-[10px]">런타임 / 포트</span>
                    <strong className="font-mono text-slate-800">Node.js v22+ · TCP {installInfo?.port || 3000}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <span className="text-slate-400 block text-[10px]">데이터 영구 저장소</span>
                    <strong className="font-mono text-slate-800 break-all">
                      {health?.dataFile || './data/santeville-db.json'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quick Install Commands */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span>원클릭 서버 설치 명령어</span>
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'linux', label: 'Linux / Ubuntu', cmd: 'chmod +x install-server.sh && ./install-server.sh' },
                    { key: 'win', label: 'Windows PowerShell', cmd: 'powershell -ExecutionPolicy Bypass -File .\\install-server.ps1' },
                    { key: 'docker', label: 'Docker Compose', cmd: 'docker compose up -d --build' },
                  ].map(item => (
                    <div key={item.key} className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-blue-300 font-semibold block">{item.label}</span>
                        <code className="text-[11px] font-mono break-all">{item.cmd}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCommand(item.key, item.cmd)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>복사</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloadable Server Installer Artifacts */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">서버 설치 파일 개별 다운로드</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {serverDownloadFiles.map(file => (
                    <a
                      key={file.id}
                      href={`/api/download/${file.id}`}
                      download={file.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <strong className="text-slate-900 block truncate">{file.label}</strong>
                        <span className="text-[11px] text-slate-500 block truncate">{file.desc}</span>
                      </div>
                      <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
