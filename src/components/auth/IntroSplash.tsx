import React, { useEffect, useState, useRef } from 'react';
import { Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface IntroSplashProps {
  onDismiss: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onDismiss }) => {
  const [secondsLeft, setSecondsLeft] = useState(2);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDismissRef.current();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none animate-fadeIn">
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center">
        {/* Animated Brand Emblem */}
        <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
          <Building2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          상떼빌라이프
        </h1>
        <p className="text-sm text-blue-200/90 mb-1">
          동작상떼빌 스마트 입주민 커뮤니티
        </p>
        <p className="text-xs text-slate-400 mb-8">
          동호수 세대 인증 · 모바일 전자투표 · 실시간 단지 소통
        </p>

        {/* Security badge indicator */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1.5 rounded-full mb-8">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>본인 등록 단말기 보안 인증 완료 (자동 로그인)</span>
        </div>

        {/* Progress indicator & Skip */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-1000"
            style={{ width: `${((3 - secondsLeft) / 3) * 100}%` }}
          />
        </div>

        <button
          onClick={onDismiss}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer"
        >
          <span>건너뛰기 ({secondsLeft}초)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
