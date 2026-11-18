import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceSwitcher } from './components/common/DeviceSwitcher';
import { Header } from './components/common/Header';
import { IntroSplash } from './components/auth/IntroSplash';
import { MandatoryNoticeModal } from './components/auth/MandatoryNoticeModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { HomeView } from './components/home/HomeView';
import { BoardList } from './components/board/BoardList';
import { ArchiveList } from './components/archive/ArchiveList';
import { VoteList } from './components/vote/VoteList';
import { ChatAppView } from './components/chat/ChatAppView';
import { BackOfficeView } from './components/backoffice/BackOfficeView';
import { FacilityDashboard } from './components/backoffice/FacilityDashboard';
import { ParkingManagementView } from './components/parking/ParkingManagementView';
import { LoggedOutView } from './components/auth/LoggedOutView';
import { PolicyModal, PolicyType } from './components/common/PolicyModal';
import { OfflineIndicator } from './components/common/PWAInstallButton';
import { InstallCenterModal } from './components/common/InstallCenterModal';
import { ShieldCheck, Server } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentUser,
    showIntroSplash, 
    dismissIntroSplash, 
    mandatoryNoticeToDisplay, 
    dismissMandatoryNotice,
    currentView, 
    setCurrentView,
    setSelectedBoardCategory,
    toastMessage 
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [targetNoticeId, setTargetNoticeId] = useState<string | undefined>(undefined);
  const [targetVoteId, setTargetVoteId] = useState<string | undefined>(undefined);

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<PolicyType>('terms');
  const [isInstallCenterOpen, setIsInstallCenterOpen] = useState(false);

  const handleOpenNoticeDetail = (id: string) => {
    setTargetNoticeId(id);
    setSelectedBoardCategory('notice');
    setCurrentView('board');
  };

  const handleOpenVoteDetail = (id: string) => {
    setTargetVoteId(id);
    setCurrentView('vote');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* 1. Device Switcher Bar for fast evaluation & testing */}
      <DeviceSwitcher />

      {/* 2. Top Bar Navigation (Strict Top Bar Contract) */}
      <Header
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onOpenInstallCenter={() => setIsInstallCenterOpen(true)}
      />

      {/* 3. Main Body Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser ? (
          <LoggedOutView
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
            onOpenInstallCenter={() => setIsInstallCenterOpen(true)}
          />
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                onOpenNoticeDetail={handleOpenNoticeDetail}
                onOpenVoteDetail={handleOpenVoteDetail}
              />
            )}

            {currentView === 'board' && (
              <BoardList initialPostId={targetNoticeId} />
            )}

            {currentView === 'archive' && (
              <ArchiveList />
            )}

            {currentView === 'vote' && (
              <VoteList
                initialVoteId={targetVoteId}
                onClearInitialVoteId={() => setTargetVoteId(undefined)}
              />
            )}

            {currentView === 'chat' && (
              <ChatAppView />
            )}

            {currentView === 'parking' && (
              <ParkingManagementView />
            )}

            {currentView === 'facilities' && (
              <FacilityDashboard
                readOnly={!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'operator')}
              />
            )}

            {currentView === 'backoffice' && (
              ['manager', 'operator', 'dong_rep', 'election_comm'].includes(currentUser.role) ? (
                <BackOfficeView />
              ) : (
                <HomeView
                  onOpenNoticeDetail={handleOpenNoticeDetail}
                  onOpenVoteDetail={handleOpenVoteDetail}
                />
              )
            )}
          </>
        )}
      </main>

      {/* 4. Official Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-7 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
          {/* Policy Links */}
          <div className="flex flex-wrap items-center gap-2 text-slate-300 font-medium text-xs border-b border-slate-800 pb-3">
            <button
              onClick={() => { setPolicyModalType('terms'); setIsPolicyModalOpen(true); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              동작상떼빌 아파트 홈페이지 이용약관
            </button>
            <span className="text-slate-600 select-none">|</span>
            <button
              onClick={() => { setPolicyModalType('rules'); setIsPolicyModalOpen(true); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              운영원칙
            </button>
            <span className="text-slate-600 select-none">|</span>
            <button
              onClick={() => { setPolicyModalType('privacy'); setIsPolicyModalOpen(true); }}
              className="hover:text-white font-semibold transition-colors cursor-pointer text-slate-200"
            >
              개인정보처리방침
            </button>
            <span className="text-slate-600 select-none">|</span>
            <button
              onClick={() => { setPolicyModalType('contact'); setIsPolicyModalOpen(true); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              고객센터
            </button>
            <span className="text-slate-600 select-none">|</span>
            <button
              onClick={() => setIsInstallCenterOpen(true)}
              className="hover:text-emerald-300 text-emerald-400 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Server className="w-3.5 h-3.5" />
              <span>서버·모바일 앱 설치</span>
            </button>
          </div>

          {/* Address, Contact & Copyright */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-slate-400">
            <p className="leading-relaxed">
              [07072]서울특별시 동작구 신대방1가길 38 | Tel. 02) 3289-1113 | Fax. 02) 3289-1114 | E-mail : djstv111300@naver.com
            </p>
            <p className="shrink-0 text-slate-400 font-medium">
              Copyright ⓒ 동작상떼빌 관리사무소 All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 5. App Launch Intro Splash (2~3 seconds) */}
      {showIntroSplash && (
        <IntroSplash onDismiss={dismissIntroSplash} />
      )}

      {/* 6. Mandatory Notice Popup after Intro (Dismissable once read or don't show today) */}
      {!showIntroSplash && mandatoryNoticeToDisplay && (
        <MandatoryNoticeModal
          notice={mandatoryNoticeToDisplay}
          onDismiss={(dontShowToday) => dismissMandatoryNotice(dontShowToday)}
          onGoToNoticeDetail={() => {
            handleOpenNoticeDetail(mandatoryNoticeToDisplay.id);
            dismissMandatoryNotice(false);
          }}
        />
      )}

      {/* 7. Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Policy & Terms Modal */}
      <PolicyModal
        isOpen={isPolicyModalOpen}
        type={policyModalType}
        onClose={() => setIsPolicyModalOpen(false)}
        onSelectType={(t) => setPolicyModalType(t)}
      />

      {/* Server & Mobile App Install Center Modal */}
      <InstallCenterModal
        isOpen={isInstallCenterOpen}
        onClose={() => setIsInstallCenterOpen(false)}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* 8. Global Floating Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-slideUp">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
