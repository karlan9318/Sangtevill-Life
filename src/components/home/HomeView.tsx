import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Vote, 
  Bell, 
  MessageSquare, 
  FileText, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  Car,
  QrCode,
  PhoneCall
} from 'lucide-react';
import { EmergencyContactModal } from '../common/EmergencyContactModal';

interface HomeViewProps {
  onOpenNoticeDetail: (id: string) => void;
  onOpenVoteDetail: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenNoticeDetail, onOpenVoteDetail }) => {
  const { 
    currentUser, 
    setCurrentView, 
    setSelectedBoardCategory, 
    posts, 
    votes, 
    chatRooms, 
    facilities,
    visitorVehicles,
    getHouseholdMonthlyParkingUsage
  } = useApp();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const activeVotes = votes.filter(v => v.status === 'active');
  const latestNotices = posts.filter(p => p.category === 'notice' && !p.isHidden).slice(0, 4);
  const myHouseholdKey = currentUser ? `${currentUser.dong}_${currentUser.ho}` : '';

  const parkingUsage = currentUser
    ? getHouseholdMonthlyParkingUsage(currentUser.dong, currentUser.ho)
    : { usedHours: 0, limitHours: 100, remainingHours: 100, monthLabel: '' };

  // Back Office is only visible to manager, operator, dong_rep (read-only), election_comm (vote management)
  const canAccessBackOffice = Boolean(
    currentUser && ['manager', 'operator', 'dong_rep', 'election_comm'].includes(currentUser.role)
  );

  const getBackOfficeLabel = () => {
    if (!currentUser) return '관리사무소 백오피스';
    if (currentUser.role === 'dong_rep') return '백오피스 (입대의 조회)';
    if (currentUser.role === 'election_comm') return '백오피스 (투표 관리)';
    return '관리사무소 백오피스';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Apartment Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>상떼빌라이프 스마트 입주민 포털</span>
              <span aria-hidden="true">·</span>
              <span>동작상떼빌 520세대 거주단지</span>
            </div>

            {/* Emergency Contact Quick Button in Logged-in Home */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-400/50"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>비상 연락망 확인</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 md:mb-3">
            {currentUser ? (
              <span>안녕하세요, {currentUser.dong} {currentUser.ho} {currentUser.name}님!</span>
            ) : (
              <span>행복하고 안전한 우리 아파트 커뮤니티</span>
            )}
          </h1>

          <p className="hidden md:block text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            모바일 전자투표, 동대표·선관위·자문위원 소통 게시판, 시설 점검 이력 조회 및 단지 전용 메신저 채팅까지 원스톱으로 지원합니다.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentView('vote')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Vote className="w-4 h-4" />
              <span>진행 중인 전자투표 ({activeVotes.length}건)</span>
            </button>
            <button
              onClick={() => setCurrentView('chat')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>단지 메신저 채팅 열기</span>
            </button>
            <button
              onClick={() => setCurrentView('parking')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Car className="w-4 h-4" />
              <span>방문차량 등록 & 주차현황</span>
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-4 py-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>단지 비상 연락망</span>
            </button>
            {canAccessBackOffice && (
              <button
                onClick={() => setCurrentView('backoffice')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{getBackOfficeLabel()}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Parking Access & Visitor Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                LPR 스마트 방문차량 사전 등록 & 세대 주차 현황
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                정·후문 LPR 정상연동
              </span>
              {currentUser && (
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">
                  {currentUser.dong} {currentUser.ho} · 월 남은시간 {parkingUsage.remainingHours}시간 / {parkingUsage.limitHours}시간
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-slate-500 mt-0.5">
              차량번호 사전 등록 시 차단기 자동 통과 · 세대별 월 {parkingUsage.limitHours}시간 무료 방문주차 · 우리 세대 등록 {visitorVehicles.filter(v => currentUser && v.hostDong === currentUser.dong && v.hostHo === currentUser.ho).length}건
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setCurrentView('parking')}
            className="w-full sm:w-auto px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>방문차량 관리 / 등록</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Active Voting & Important Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Active Votes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">진행 중인 모바일 전자투표</h3>
                <span className="hidden md:inline text-[11px] text-slate-500">동호수별 1세대 1표 기준 중복 방지</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('vote')}
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>전체보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeVotes.map(vote => {
              const hasHouseholdVoted = currentUser && Boolean(vote.householdVotes[myHouseholdKey]);
              const totalVotedCount = Math.max(
                vote.options.reduce((sum, opt) => sum + opt.votes, 0),
                Object.keys(vote.householdVotes).length
              );
              const percentage = Math.min(100, Math.round((totalVotedCount / Math.max(1, vote.totalEligibleHouseholds)) * 100));

              return (
                <div
                  key={vote.id}
                  onClick={() => onOpenVoteDetail(vote.id)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {vote.title}
                    </span>
                    {hasHouseholdVoted ? (
                      <span className="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        우리 세대 투표완료
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        투표 미참여
                      </span>
                    )}
                  </div>

                  <p className="hidden md:block text-[11px] text-slate-500 line-clamp-1 mb-2.5">
                    {vote.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="hidden md:inline">
                      투표율: <strong className="text-slate-800 font-mono">{percentage}%</strong> ({totalVotedCount}/{vote.totalEligibleHouseholds}세대)
                    </span>
                    <span>마감: {vote.endDate}</span>
                  </div>

                  <div className="hidden md:block w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Latest Notice Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">관리사무소 주요 공지사항</h3>
                <span className="hidden md:inline text-[11px] text-slate-500">필수 열람 공람 및 단지 일정</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedBoardCategory('notice');
                setCurrentView('board');
              }}
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>전체보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {latestNotices.map(notice => (
              <div
                key={notice.id}
                onClick={() => onOpenNoticeDetail(notice.id)}
                className="py-2.5 first:pt-0 last:pb-0 hover:bg-slate-50/80 px-1 rounded transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1 hover:text-blue-600">
                    {notice.isMandatory && (
                      <span className="text-rose-600 font-bold mr-1">[필수]</span>
                    )}
                    {notice.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {notice.createdAt.slice(5, 10)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{notice.authorNickname}</span>
                  <span className="hidden md:inline" aria-hidden="true">·</span>
                  <span className="hidden md:inline">조회 {notice.views}</span>
                  <span className="hidden md:inline" aria-hidden="true">·</span>
                  <span className="hidden md:inline">댓글 {notice.comments.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 3 Shortcuts (Community boards, Standalone Chat rooms, Facilities) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shortcut 1: Board Hub */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>커뮤니티 게시판</span>
              </span>
              <span className="hidden md:inline text-[11px] text-slate-500">8개 분과</span>
            </div>
            <p className="hidden md:block text-xs text-slate-600 leading-relaxed mb-4">
              공지, 자유게시판, 민원/건의, 입대의, 선관위, 자문위원 및 주민 토론방
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-4">
              <button
                onClick={() => {
                  setSelectedBoardCategory('free');
                  setCurrentView('board');
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-left border border-slate-100 cursor-pointer"
              >
                자유게시판
              </button>
              <button
                onClick={() => {
                  setSelectedBoardCategory('complaint');
                  setCurrentView('board');
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-left border border-slate-100 cursor-pointer"
              >
                민원 접수함
              </button>
              <button
                onClick={() => {
                  setSelectedBoardCategory('rep_meeting');
                  setCurrentView('board');
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-left border border-slate-100 cursor-pointer"
              >
                입대의 회의록
              </button>
              <button
                onClick={() => {
                  setSelectedBoardCategory('election_board');
                  setCurrentView('board');
                }}
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-left border border-slate-100 cursor-pointer"
              >
                선관위 공고
              </button>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('board')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>게시판 이동</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcut 2: Chat App Hub */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>단지 전용 메신저 채팅</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                독립 App 연동
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-600 leading-relaxed mb-4">
              카카오톡 형식의 독립 모바일 메신저. 우리동 단톡방, 관리사무소 1:1 상담톡 및 나눔 장터
            </p>
            <div className="space-y-2 mb-4">
              {chatRooms.slice(0, 2).map(r => (
                <div 
                  key={r.id} 
                  onClick={() => setCurrentView('chat')}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100/60 cursor-pointer hover:bg-amber-100/50 transition-colors"
                >
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-800 block line-clamp-1">{r.name}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{r.lastMessage}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{r.lastMessageTime}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentView('chat')}
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
          >
            <span>채팅 앱 실행</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcut 3: Archive & Facilities */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>시설물 & 단지 자료실</span>
              </span>
              <span className="text-[11px] text-slate-500">투명 운영</span>
            </div>
            <p className="hidden md:block text-xs text-slate-600 leading-relaxed mb-4">
              관리규약, 공사/용역계약서 열람 및 특고압 변압기, 승강기, 급수펌프 등 정기 점검·수리 이력 조회
            </p>
            <div className="hidden md:block bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">등록 주요 시설물:</span>
                <strong className="text-slate-900 font-mono">{facilities.length}개소</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">최근 점검 상태:</span>
                <span className="text-emerald-600 font-semibold text-[11px]">
                  양호 {facilities.filter(f => f.status === '양호').length} / 전체 {facilities.length}개소
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('archive')}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              자료실 열람
            </button>
            <button
              onClick={() => setCurrentView('facilities')}
              className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              시설물 현황·이력
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contact Modal */}
      <EmergencyContactModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};
