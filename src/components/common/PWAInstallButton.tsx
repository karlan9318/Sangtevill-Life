import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface PWAInstallButtonProps {
  compact?: boolean;
  onOpenInstallGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  onOpenInstallGuide,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>앱 설치</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>iOS 앱 설치</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>iPhone / iPad 앱 설치 방법</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Share className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    1. Safari 하단(또는 상단) 도구 모음의 <strong>공유</strong> 아이콘을 누르세요.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <PlusSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    2. 아래로 스크롤하여 <strong>홈 화면에 추가</strong>를 선택한 뒤 오른쪽 위 <strong>추가</strong>를 누르면 독립 앱으로 설치됩니다.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (onOpenInstallGuide) {
    return (
      <button
        type="button"
        onClick={onOpenInstallGuide}
        title="서버 및 모바일 앱 설치 안내"
        className={`hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer whitespace-nowrap ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>앱/서버 설치</span>
      </button>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>오프라인 모드 — 저장된 캐시 데이터를 표시 중입니다.</span>
    </div>
  );
};
