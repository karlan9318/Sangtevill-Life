import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VoteItem, VoteType, VoteTargetAudience } from '../../types';
import confetti from 'canvas-confetti';
import {
  Vote,
  Send,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Users,
  X,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface VoteListProps {
  initialVoteId?: string;
  onClearInitialVoteId?: () => void;
}

const getParticipantCount = (vote: VoteItem): number => {
  const optionsSum = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
  const householdCount = Object.keys(vote.householdVotes).length;
  return Math.max(optionsSum, householdCount);
};

export const VoteList: React.FC<VoteListProps> = ({ initialVoteId, onClearInitialVoteId }) => {
  const {
    currentUser,
    votes,
    castVote,
    createVote,
    closeVote,
    sendVoteGuideSms,
    showToast
  } = useApp();

  const [selectedVoteId, setSelectedVoteId] = useState<string>(initialVoteId || votes[0]?.id || '');
  const [isVoteModalOpen, setIsVoteModalOpen] = useState<boolean>(Boolean(initialVoteId));
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Vote Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState<VoteTargetAudience>('owner_only');
  const [newVoteType, setNewVoteType] = useState<VoteType>('agree_disagree');
  const [newEndDate, setNewEndDate] = useState('2026-11-30');
  const [customOptions, setCustomOptions] = useState<string[]>(['1안: ', '2안: ']);

  useEffect(() => {
    if (initialVoteId) {
      setSelectedVoteId(initialVoteId);
      setSelectedOptionId('');
      setIsVoteModalOpen(true);
      onClearInitialVoteId?.();
    }
  }, [initialVoteId, onClearInitialVoteId]);

  const activeVote = votes.find(v => v.id === selectedVoteId) || votes[0];
  const isManagerOrElec = Boolean(
    currentUser && ['manager', 'operator', 'election_comm'].includes(currentUser.role)
  );
  const myHouseholdKey = currentUser ? `${currentUser.dong}_${currentUser.ho}` : '';

  const openVoteWindow = (voteId: string) => {
    setSelectedVoteId(voteId);
    setSelectedOptionId('');
    setIsVoteModalOpen(true);
  };

  const isEligibleForVote = (vote?: VoteItem): boolean => {
    if (!currentUser || !vote) return false;
    if (vote.targetAudience === 'owner_only') {
      return currentUser.residentType === 'owner';
    }
    return true;
  };

  const handleVoteSubmit = () => {
    if (!activeVote || !selectedOptionId) {
      showToast('투표하실 문항을 선택해 주세요.');
      return;
    }

    const res = castVote(activeVote.id, selectedOptionId);
    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti error
      }
      setSelectedOptionId('');
    } else {
      showToast(res.message);
    }
  };

  const handleSendSms = (voteId: string) => {
    sendVoteGuideSms(voteId);
  };

  const handleCreateVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const options =
      newVoteType === 'agree_disagree'
        ? [
            { id: 'opt-agree', text: '찬성 (안건 가결에 동의)', votes: 0 },
            { id: 'opt-disagree', text: '반대 (안건 부결에 동의)', votes: 0 },
            { id: 'opt-abstain', text: '기권', votes: 0 }
          ]
        : customOptions
            .filter(o => o.trim().length > 0)
            .map((text, idx) => ({ id: `opt-${idx + 1}`, text: text.trim(), votes: 0 }));

    createVote({
      title: newTitle.trim(),
      description: newDesc.trim(),
      targetAudience: newTargetAudience,
      voteType: newVoteType,
      options,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: newEndDate,
      status: 'active',
      totalEligibleHouseholds: newTargetAudience === 'owner_only' ? 420 : 520
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Top progress banner stats for currently tracked vote
  const topVote = activeVote;
  const topVotedCount = topVote ? getParticipantCount(topVote) : 0;
  const topEligible = topVote ? Math.max(1, topVote.totalEligibleHouseholds) : 520;
  const topRate = Math.min(100, Math.round((topVotedCount / topEligible) * 100));

  const modalHouseholdRecord =
    activeVote && currentUser ? activeVote.householdVotes[myHouseholdKey] : null;
  const modalHasHouseholdVoted = Boolean(modalHouseholdRecord);
  const modalTotalVotedCount = activeVote ? getParticipantCount(activeVote) : 0;
  const modalRate = activeVote
    ? Math.min(100, Math.round((modalTotalVotedCount / Math.max(1, activeVote.totalEligibleHouseholds)) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
            <Vote className="w-5 h-5 text-blue-600" />
            <span>아파트 모바일 전자투표</span>
          </h1>
          <p className="hidden md:block text-xs text-slate-500">
            공동주택관리법 준수 · 동호수별 1세대 1표 최초 투표 기준 중복 방지 · 새창 투표 및 실시간 참여율 공시
          </p>
        </div>

        {isManagerOrElec && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>새 전자투표 개설 (선관위/관리소)</span>
          </button>
        )}
      </div>

      {/* 2. Top Live Participation Progress Bar & Real-Time Participant Count */}
      {topVote && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>실시간 투표 참여 현황</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {topVote.status === 'active' ? '투표 진행 중' : '투표 마감'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                {topVote.title}
              </h2>
            </div>

            {/* Real-time numeric participant counter */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 shrink-0">
              <div>
                <span className="block text-[10px] font-semibold text-slate-500">실시간 참여 인원</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono text-blue-600 tabular-nums">
                    {topVotedCount.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-700">명</span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {topEligible.toLocaleString()}세대
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div className="text-right">
                <span className="block text-[10px] font-semibold text-slate-500">현재 참여율</span>
                <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {topRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Horizontal Progress Bar */}
          <div className="space-y-1.5">
            <div className="relative w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${topRate}%` }}
              />
              {/* 50% majority marker line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80"
                style={{ left: '50%' }}
                title="과반수 기준 (50%)"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>0%</span>
              <span className="text-amber-700 font-semibold">과반수 기준 50% ({Math.ceil(topEligible / 2)}세대)</span>
              <span>100% ({topEligible}세대)</span>
            </div>
          </div>

          {/* Quick switch pills if multiple votes exist */}
          {votes.length > 1 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">안건별 참여율 보기:</span>
              {votes.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVoteId(v.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    v.id === topVote.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  안건 {idx + 1} ({Math.min(100, Math.round((getParticipantCount(v) / Math.max(1, v.totalEligibleHouseholds)) * 100))}%)
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Vote Cards Grid (Clicking opens the Voting Modal Window - 새창) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            전자투표 안건 목록 ({votes.length}건) · 항목을 선택하면 새창에서 투표가 진행됩니다
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {votes.map(vote => {
            const hasVotedThis = Boolean(currentUser && vote.householdVotes[myHouseholdKey]);
            const eligible = isEligibleForVote(vote);
            const totalVoted = getParticipantCount(vote);
            const rate = Math.min(100, Math.round((totalVoted / Math.max(1, vote.totalEligibleHouseholds)) * 100));

            return (
              <div
                key={vote.id}
                onClick={() => openVoteWindow(vote.id)}
                className="bg-white hover:border-blue-400 hover:shadow-md rounded-xl border border-slate-200 p-5 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          vote.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {vote.status === 'active' ? '투표진행중' : '투표마감'}
                      </span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {vote.targetAudience === 'owner_only' ? '소유자 전용' : '입주민 전체'}
                      </span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                        {vote.voteType === 'agree_disagree' ? '찬반투표' : '선택형'}
                      </span>
                    </div>

                    {hasVotedThis ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        우리세대 투표완료
                      </span>
                    ) : vote.status === 'active' && eligible ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        투표 미참여
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {vote.title}
                  </h3>

                  <p className="hidden md:block text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {vote.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vote.startDate} ~ {vote.endDate}</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600">
                      {totalVoted.toLocaleString()}명 참여 ({rate}%)
                    </span>
                  </div>

                  <div className="hidden md:block w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVoteWindow(vote.id);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      vote.status === 'active' && !hasVotedThis && eligible
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>
                      {vote.status === 'active' && !hasVotedThis && eligible
                        ? '새창 열어서 투표하기'
                        : '새창으로 투표 상세·결과 보기'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Voting Modal Window (새창) */}
      {isVoteModalOpen && activeVote && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Vote className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  모바일 전자투표 창
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="투표창 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Top Progress inside Modal */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-900">현재 투표 참여율</span>
                  <div className="text-xs font-mono text-blue-900">
                    실시간 참여 인원 <strong className="text-base font-extrabold text-blue-700">{modalTotalVotedCount.toLocaleString()}명</strong>
                    <span className="text-slate-500"> / {activeVote.totalEligibleHouseholds.toLocaleString()}세대</span>
                    <span className="ml-1.5 font-bold text-blue-700">({modalRate}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-blue-200">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${modalRate}%` }}
                  />
                </div>
              </div>

              {/* Vote Meta Badges & SMS button */}
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                        activeVote.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {activeVote.status === 'active' ? '투표 진행 중' : '마감된 투표'}
                    </span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {activeVote.voteType === 'agree_disagree' ? '찬반투표' : '선택형 투표'}
                    </span>
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {activeVote.targetAudience === 'owner_only' ? '등기 소유자 전용' : '입주민 전체'}
                    </span>
                  </div>

                  {isManagerOrElec && activeVote.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleSendSms(activeVote.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>투표 안내 문자 발송 ({activeVote.smsSentCount}건)</span>
                    </button>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {activeVote.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>투표 기간: {activeVote.startDate} ~ {activeVote.endDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>대상 세대: {activeVote.totalEligibleHouseholds}세대</span>
                  </span>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {activeVote.description}
              </div>

              {/* Ballot Section */}
              <div>
                {modalHasHouseholdVoted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>[투표 완료] 귀하의 세대 ({myHouseholdKey})는 이미 투표가 완료되었습니다!</span>
                    </div>
                    <div className="text-xs leading-relaxed text-emerald-800 bg-white/80 p-3 rounded-lg border border-emerald-200/80 space-y-1">
                      <p><strong>세대 식별:</strong> {modalHouseholdRecord?.dong} {modalHouseholdRecord?.ho}</p>
                      <p><strong>최초 투표자:</strong> {modalHouseholdRecord?.voterName} (휴대폰: {modalHouseholdRecord?.voterPhone})</p>
                      <p><strong>투표 일시:</strong> {modalHouseholdRecord?.votedAt}</p>
                      <p className="pt-1 text-slate-500 text-[11px]">
                        * 규정 준수: 동호수(세대)별 최초 1회 투표만 유효하므로 동일 세대 내 중복 투표는 자동 차단됩니다.
                      </p>
                    </div>
                  </div>
                ) : !isEligibleForVote(activeVote) ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="block text-sm mb-1">투표 참여 권한 제한 안내</strong>
                      본 안건은 공동주택관리법령에 따른 <strong>&apos;등기 소유자 전용 안건&apos;</strong>입니다. 현재 회원님의 계정은 <strong>세입자(임차인)</strong>로 등록되어 있어 열람만 가능하며 투표 참여 권한이 부여되지 않습니다.
                    </div>
                  </div>
                ) : activeVote.status === 'closed' ? (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-slate-700 text-xs text-center font-medium">
                    투표 기간이 종료되어 마감되었습니다. 아래 집계 결과를 확인하세요.
                  </div>
                ) : (
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Vote className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-sm text-slate-900">
                          {currentUser?.dong} {currentUser?.ho} 세대 전자투표 용지
                        </h4>
                      </div>
                      <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                        본인 인증 단말: {currentUser?.phone}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      선택하신 항목은 비밀 투표로 안전하게 집계되며, 제출 후 세대 기준 변경이 불가능합니다.
                    </p>

                    <div className="space-y-2.5">
                      {activeVote.options.map(option => (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                            selectedOptionId === option.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="vote_option_modal"
                              value={option.id}
                              checked={selectedOptionId === option.id}
                              onChange={() => setSelectedOptionId(option.id)}
                              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-xs sm:text-sm font-semibold">{option.text}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleVoteSubmit}
                      disabled={!selectedOptionId}
                      className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                        selectedOptionId
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>우리 세대 전자투표 최종 제출하기</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Real-Time Vote Results Statistics Breakdown */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      실시간 전자투표 집계 현황
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-600">
                    총 <strong className="text-slate-900">{modalTotalVotedCount.toLocaleString()}명</strong> 참여 ({modalRate}%)
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeVote.options.map(opt => {
                    const divisor = Math.max(1, modalTotalVotedCount);
                    const optPercent = Math.round((opt.votes / divisor) * 100);

                    return (
                      <div key={opt.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-800 mb-1.5 gap-2">
                          <span>{opt.text}</span>
                          <span className="font-mono text-slate-600 shrink-0">
                            {opt.votes}표 <span className="text-blue-600 font-bold">({optPercent}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, optPercent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isManagerOrElec && activeVote.status === 'active' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => closeVote(activeVote.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      투표 강제 마감 처리 (선관위)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsVoteModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                투표창 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create New Vote Modal (새창) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  새 모바일 전자투표 개설 (선관위/관리소)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  투표 안건 명칭
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 단지 내 무인 경비시스템 전면 교체 승인의 건"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  안건 상세 설명 및 제안 이유
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="사업비 소요 예산, 기대 효과 및 투표 관련 법적 근거를 설명해 주세요..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    투표 대상자 지정
                  </label>
                  <select
                    value={newTargetAudience}
                    onChange={(e) => setNewTargetAudience(e.target.value as VoteTargetAudience)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="owner_only">등기 소유자 전용 (420세대)</option>
                    <option value="all">입주민 전체 (520세대)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    투표 방식
                  </label>
                  <select
                    value={newVoteType}
                    onChange={(e) => setNewVoteType(e.target.value as VoteType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="agree_disagree">찬반투표 (찬성/반대/기권)</option>
                    <option value="multiple_choice">선택형 (다자택일 객관식)</option>
                  </select>
                </div>
              </div>

              {newVoteType === 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    선택지 문항 입력 (최대 4개)
                  </label>
                  {customOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`문항 ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...customOptions];
                        updated[idx] = e.target.value;
                        setCustomOptions(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  ))}
                  {customOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setCustomOptions([...customOptions, ''])}
                      className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      + 문항 추가하기
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  투표 마감 일시
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  전자투표 즉시 개설
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
