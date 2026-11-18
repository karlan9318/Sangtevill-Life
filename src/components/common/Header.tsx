import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, MessageSquare, LogOut, ShieldCheck, Car, Wrench } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenInstallCenter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenInstallCenter,
}) => {
  const { 
    currentUser, 
    currentView, 
    setCurrentView, 
    logout,
    showToast 
  } = useApp();

  const handleNavClick = (view: 'home' | 'board' | 'archive' | 'vote' | 'chat' | 'backoffice' | 'parking' | 'facilities') => {
    if (!currentUser) {
      showToast('로그인이 안되어있으면 로그인과 입주민 등록만 활성화됩니다. 먼저 로그인해 주세요.');
      onOpenLogin();
      return;
    }
    setCurrentView(view);
  };

  // Back Office is ONLY enabled/visible in menu for: manager, operator, dong_rep (read-only), election_comm (vote-only)
  const canAccessBackOffice = Boolean(
    currentUser && ['manager', 'operator', 'dong_rep', 'election_comm'].includes(currentUser.role)
  );

  return (
    <header className="bg-white border-b border-slate-200 sticky top-[37px] z-40 shadow-xs">
      {/* Strict 1-row 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div 
          onClick={() => setCurrentView('home')} 
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            상떼빌라이프
          </span>
          <span className="hidden xl:inline text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
            동작상떼빌 단지
          </span>
        </div>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-medium text-slate-600 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'home' 
                ? 'text-blue-600 font-semibold border-blue-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            홈
          </button>
          <button
            onClick={() => handleNavClick('board')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'board' 
                ? 'text-blue-600 font-semibold border-blue-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            게시판
          </button>
          <button
            onClick={() => handleNavClick('archive')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'archive' 
                ? 'text-blue-600 font-semibold border-blue-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            자료실
          </button>
          <button
            onClick={() => handleNavClick('vote')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'vote' 
                ? 'text-blue-600 font-semibold border-blue-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            전자투표
          </button>
          <button
            onClick={() => handleNavClick('parking')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'parking' 
                ? 'text-blue-600 font-semibold border-blue-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            <Car className="w-4 h-4 text-blue-500" />
            <span>방문주차</span>
          </button>
          <button
            onClick={() => handleNavClick('facilities')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'facilities' 
                ? 'text-indigo-600 font-semibold border-indigo-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            <Wrench className="w-4 h-4 text-indigo-500" />
            <span>시설현황</span>
          </button>
          <button
            onClick={() => handleNavClick('chat')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
              currentView === 'chat' 
                ? 'text-amber-600 font-semibold border-amber-600' 
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            } ${!currentUser ? 'opacity-60' : ''}`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>단지채팅</span>
          </button>

          {/* Back office navigation link (Removed from menu for regular residents & advisory) */}
          {canAccessBackOffice && (
            <button
              onClick={() => handleNavClick('backoffice')}
              className={`flex items-center gap-1 transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                currentView === 'backoffice' 
                  ? 'text-indigo-600 font-semibold border-indigo-600' 
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>백오피스</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Profile (single-line, shrink-0) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton compact onOpenInstallGuide={onOpenInstallCenter} />
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <div className="text-xs font-semibold text-slate-900 flex items-center justify-end gap-1 whitespace-nowrap">
                  <span>{currentUser.name}</span>
                  <span className="text-slate-500 font-normal">({currentUser.nickname})</span>
                </div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  {currentUser.dong} {currentUser.ho} · {currentUser.residentType === 'owner' ? '소유자' : '세입자'}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.slice(0, 1)}
              </div>

              <button
                onClick={logout}
                title="로그아웃"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                로그인
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                입주민 가입
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 px-1 bg-slate-50 text-[11px] overflow-x-auto">
        <button
          onClick={() => handleNavClick('home')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'home' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          홈
        </button>
        <button
          onClick={() => handleNavClick('board')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'board' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          게시판
        </button>
        <button
          onClick={() => handleNavClick('archive')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'archive' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          자료실
        </button>
        <button
          onClick={() => handleNavClick('vote')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'vote' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          투표
        </button>
        <button
          onClick={() => handleNavClick('parking')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'parking' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          주차
        </button>
        <button
          onClick={() => handleNavClick('facilities')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'facilities' ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          시설
        </button>
        <button
          onClick={() => handleNavClick('chat')}
          className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'chat' ? 'font-bold text-amber-600 bg-amber-50' : 'text-slate-600'} ${!currentUser ? 'opacity-60' : ''}`}
        >
          채팅
        </button>
        {canAccessBackOffice && (
          <button
            onClick={() => handleNavClick('backoffice')}
            className={`py-1 px-2 rounded whitespace-nowrap ${currentView === 'backoffice' ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
          >
            관리
          </button>
        )}
      </div>
    </header>
  );
};
