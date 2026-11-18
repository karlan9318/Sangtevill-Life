import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserRole, 
  ResidentUser, 
  BoardCategory,
  VoteType,
  VoteTargetAudience
} from '../../types';
import { 
  Users, 
  Send, 
  Vote, 
  FileText, 
  HelpCircle, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Smartphone, 
  Plus, 
  Search, 
  Shield, 
  Lock,
  Car,
  LayoutGrid,
  List,
  AlertCircle,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { FacilityDashboard } from './FacilityDashboard';
import { ParkingManagementView } from '../parking/ParkingManagementView';

type BackOfficeTab = 'users' | 'sms' | 'vote' | 'board' | 'complaints' | 'facilities' | 'parking';

export const BackOfficeView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    approveUser, 
    rejectUser, 
    updateUserRole, 
    deleteUser,
    resetDeviceForUser,
    smsLogs, 
    sendBulkSms, 
    votes, 
    createVote,
    closeVote, 
    sendVoteGuideSms,
    posts, 
    toggleHidePost, 
    replyToComplaint,
    visitorVehicles,
    showToast 
  } = useApp();

  const isManager = Boolean(currentUser && (currentUser.role === 'manager' || currentUser.role === 'operator'));
  const isDongRep = Boolean(currentUser && currentUser.role === 'dong_rep');
  const isElectionComm = Boolean(currentUser && currentUser.role === 'election_comm');
  const canManageVotes = isManager || isElectionComm;

  const [activeTab, setActiveTab] = useState<BackOfficeTab>(
    currentUser?.role === 'election_comm' ? 'vote' : 'users'
  );

  // Sync activeTab when switching user roles via simulator
  useEffect(() => {
    if (currentUser?.role === 'election_comm') {
      setActiveTab('vote');
    } else if (activeTab === 'vote' && isManager) {
      // keep current tab
    }
  }, [currentUser?.role]);

  // Role Edit Modal
  const [editingUser, setEditingUser] = useState<ResidentUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // User Search & Filter & View Mode
  const [userSearch, setUserSearch] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<string>('all');
  const [userViewMode, setUserViewMode] = useState<'cards' | 'table'>('cards');

  // Board All-Posts Filter (Back Office only)
  const [boardFilterCategory, setBoardFilterCategory] = useState<string>('all');
  const [boardSearch, setBoardSearch] = useState<string>('');

  // SMS Broadcast Composer State
  const [smsTargetAudience, setSmsTargetAudience] = useState<string>('all');
  const [smsTargetDong, setSmsTargetDong] = useState<string>('all');
  const [smsTargetAge, setSmsTargetAge] = useState<string>('all');
  const [smsTitle, setSmsTitle] = useState('[상떼빌라이프] 입주민 안내');
  const [smsContent, setSmsContent] = useState('');

  // Complaint reply modal in back office
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [complaintReplyText, setComplaintReplyText] = useState('');
  const [complaintStatusChange, setComplaintStatusChange] = useState<'in_progress' | 'completed'>('completed');

  // Create Vote Modal inside Back Office (for manager, operator, election_comm)
  const [isCreateVoteOpen, setIsCreateVoteOpen] = useState(false);
  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteDesc, setNewVoteDesc] = useState('');
  const [newVoteAudience, setNewVoteAudience] = useState<VoteTargetAudience>('owner_only');
  const [newVoteType, setNewVoteType] = useState<VoteType>('agree_disagree');
  const [newVoteEndDate, setNewVoteEndDate] = useState('2026-11-30');
  const [newVoteCustomOptions, setNewVoteCustomOptions] = useState<string[]>(['1안: ', '2안: ']);

  // Guard if somehow mounted for unauthorized roles
  if (!currentUser || (!isManager && !isDongRep && !isElectionComm)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <Lock className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">백오피스 접근 권한이 없습니다</h2>
        <p className="text-xs text-slate-500">
          백오피스는 관리자, 운영자, 입대의(조회 전용) 및 선관위(투표관리 전용)만 이용할 수 있습니다.
        </p>
      </div>
    );
  }

  const pendingUsers = users.filter(u => u.status === 'pending');

  const filteredUsers = users.filter(u => {
    if (userFilterRole === 'pending' && u.status !== 'pending') return false;
    if (userFilterRole !== 'all' && userFilterRole !== 'pending' && u.role !== userFilterRole) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchPhone = u.phone.includes(q);
      const matchDongHo = `${u.dong} ${u.ho}`.includes(q);
      if (!matchName && !matchPhone && !matchDongHo) return false;
    }
    return true;
  });

  const getCategoryLabel = (cat: BoardCategory) => {
    const map: Record<BoardCategory, string> = {
      notice: '공지사항',
      free: '자유게시판',
      complaint: '민원접수',
      suggestion: '건의사항',
      rep_meeting: '입대의',
      election_board: '선관위',
      advisory_board: '자문위원',
      debate: '주민토론방'
    };
    return map[cat] || cat;
  };

  const filteredBoardPosts = posts.filter(post => {
    if (boardFilterCategory !== 'all' && post.category !== boardFilterCategory) return false;
    if (boardSearch.trim()) {
      const q = boardSearch.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.authorName.toLowerCase().includes(q) ||
        post.authorDongHo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRoleChangeSubmit = () => {
    if (!isManager) return;
    if (editingUser) {
      updateUserRole(editingUser.id, selectedRole);
      setEditingUser(null);
    }
  };

  const handleSendBulkSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) {
      showToast('조회 전용 모드에서는 문자 발송이 불가합니다.');
      return;
    }
    if (!smsContent.trim()) {
      showToast('발송할 문자 내용을 입력해 주세요.');
      return;
    }

    sendBulkSms({
      targetAudience: smsTargetAudience,
      targetDong: smsTargetDong,
      targetAge: smsTargetAge,
      title: smsTitle,
      content: smsContent,
    });

    setSmsContent('');
  };

  const handleCreateVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageVotes) return;
    if (!newVoteTitle.trim() || !newVoteDesc.trim()) return;

    const options =
      newVoteType === 'agree_disagree'
        ? [
            { id: 'opt-agree', text: '찬성 (안건 가결에 동의)', votes: 0 },
            { id: 'opt-disagree', text: '반대 (안건 부결에 동의)', votes: 0 },
            { id: 'opt-abstain', text: '기권', votes: 0 },
          ]
        : newVoteCustomOptions
            .filter(o => o.trim().length > 0)
            .map((text, idx) => ({ id: `opt-${idx + 1}`, text: text.trim(), votes: 0 }));

    createVote({
      title: newVoteTitle.trim(),
      description: newVoteDesc.trim(),
      targetAudience: newVoteAudience,
      voteType: newVoteType,
      options,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: newVoteEndDate,
      status: 'active',
      totalEligibleHouseholds: newVoteAudience === 'owner_only' ? 420 : 520,
    });

    setIsCreateVoteOpen(false);
    setNewVoteTitle('');
    setNewVoteDesc('');
  };

  const handleApplySmsTemplate = (type: string) => {
    if (!isManager) return;
    switch (type) {
      case 'vote':
        setSmsTitle('[상떼빌라이프] 2026 단지 안건 전자투표 참여 안내');
        setSmsContent(`[상떼빌라이프 관리사무소]\n우리 단지 외벽 및 방수공사 승인 전자투표가 진행 중입니다.\n동호수별 1세대 1표 모바일 투표에 적극 동참해 주십시오.\n투표 참여: 앱 > 전자투표 메뉴`);
        break;
      case 'water':
        setSmsTitle('[단수안내] 지하저수조 세척 소독 및 옥상물탱크 점검');
        setSmsContent(`[관리사무소 단수공지]\n일시: 11월 18일(화) 09:00 ~ 13:00 (4시간)\n단수구역: 101동~106동 전 세대\n사전에 식수 및 생활용수를 충분히 확보해 주시기 바랍니다.`);
        break;
      case 'parking':
        setSmsTitle('[안내] 지하 1층 및 2층 주차장 바닥 고압 물청소');
        setSmsContent(`[관리사무소] 지하주차장 바닥 물청소 작업으로 인해 금일 오전 10시까지 지정 구역 차량을 지상 및 인근 주차면으로 이동 주차 부탁드립니다.`);
        break;
      case 'fire':
        setSmsTitle('[소방점검] 2026년도 상반기 소방시설 종합정밀점검');
        setSmsContent(`[관리사무소] 소방시설법에 따라 세대 내 화재감지기 및 스프링클러 점검을 실시합니다. 세대 방문 점검 시 문을 개방해 주시기 바랍니다.`);
        break;
    }
  };

  const getEstimatedTargetCount = () => {
    let count = 520;
    if (smsTargetAudience === 'owner') count = 420;
    if (smsTargetAudience === 'tenant') count = 100;
    if (smsTargetDong !== 'all') count = Math.round(count / 6);
    if (smsTargetAge !== 'all') count = Math.round(count * 0.3);
    return count;
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'manager': return '관리자(관리사무소장)';
      case 'operator': return '운영자';
      case 'dong_rep': return '입대의(동대표) · 조회 전용';
      case 'election_comm': return '선관위 · 투표관리 전용';
      case 'advisory': return '자문위원';
      default: return '일반입주민';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Office Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>상떼빌라이프 관리사무소 백오피스 통합 콘솔</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            {isElectionComm ? '선거관리위원회 투표 관리 콘솔' : '단지 운영 및 시설 관리 시스템'}
          </h1>
          <p className="text-xs text-slate-400">
            접속자: <strong>{currentUser.name}</strong> ({getRoleDisplay(currentUser.role)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isDongRep && (
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl px-3.5 py-2 text-blue-200 text-xs flex items-center gap-2 font-semibold">
              <Eye className="w-4 h-4 text-blue-300" />
              <span>입대의 조회 전용 모드 (수정 불가)</span>
            </div>
          )}

          {!isElectionComm && pendingUsers.length > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 text-amber-200 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>신규 입주민 가입 승인 대기 <strong>{pendingUsers.length}건</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Read-Only Banner for 입대위 (dong_rep) */}
      {isDongRep && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>입주자대표회의(입대의) 조회 전용 모드:</strong> 관리자와 동일하게 백오피스 전체 메뉴(입주민, 문자이력, 투표, 게시판 전체글, 민원, 시설물, 방문주차)를 투명하게 열람하실 수 있습니다. 단, 데이터 변경·승인·발송·숨김 처리는 관리자/운영자 권한입니다.
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        {!isElectionComm && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>입주민 관리</span>
              {pendingUsers.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'sms' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>입주민 문자(SMS) {isDongRep ? '이력 조회' : '발송'}</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('vote')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'vote' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>투표 관리</span>
        </button>

        {!isElectionComm && (
          <>
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'board' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>게시판 전체글 관리</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'complaints' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>민원 관리</span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'facilities' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>시설물 관리 & 대시보드</span>
            </button>

            <button
              onClick={() => setActiveTab('parking')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'parking' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>방문차량 주차관제 ({visitorVehicles.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ==================== TAB 1: 입주민 관리 ==================== */}
      {!isElectionComm && activeTab === 'users' && (
        <div className="space-y-4">
          {/* Sub Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setUserFilterRole('all')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                  userFilterRole === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체 ({users.length})
              </button>
              <button
                onClick={() => setUserFilterRole('pending')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                  userFilterRole === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                승인대기 ({pendingUsers.length})
              </button>
              <button
                onClick={() => setUserFilterRole('dong_rep')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                  userFilterRole === 'dong_rep' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                동대표
              </button>
              <button
                onClick={() => setUserFilterRole('election_comm')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                  userFilterRole === 'election_comm' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                선관위
              </button>
              <button
                onClick={() => setUserFilterRole('advisory')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                  userFilterRole === 'advisory' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                자문위원
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUserViewMode('cards')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    userViewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>여러줄 카드 보기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserViewMode('table')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    userViewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>표 형식</span>
                </button>
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="이름, 동호수, 연락처 검색..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* User List: Responsive Multi-line Cards (Default) */}
          {userViewMode === 'cards' ? (
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                  검색 조건에 일치하는 입주민 정보가 없습니다.
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className={`bg-white rounded-xl border transition-all p-4 shadow-xs space-y-3 hover:shadow-md ${
                      u.status === 'pending'
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* 줄 1 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                          {u.dong} {u.ho}
                        </span>

                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                          {u.name}
                          <span className="text-xs text-slate-500 font-normal">({u.nickname})</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.residentType === 'owner' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.residentType === 'owner' ? '등기소유자' : '세입거주자'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          u.role === 'manager' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          u.role === 'operator' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          u.role === 'dong_rep' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                          u.role === 'election_comm' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          u.role === 'advisory' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role === 'manager' ? '관리사무소장 (관리자)' :
                           u.role === 'operator' ? '총괄운영자' :
                           u.role === 'dong_rep' ? '동대표' :
                           u.role === 'election_comm' ? '선거관리위원' :
                           u.role === 'advisory' ? '단지자문위원' : '일반입주민'}
                        </span>
                      </div>

                      <div>
                        {u.status === 'approved' ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>승인완료</span>
                          </span>
                        ) : u.status === 'pending' ? (
                          <span className="text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                            <span>가입 승인대기</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            가입 반려됨
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 줄 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400">연락처:</span>
                        <strong className="font-mono text-slate-900">{u.phone}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400">인증단말기:</span>
                        <span className="font-mono text-[11px] text-slate-700 font-semibold truncate max-w-[150px]">
                          {u.deviceId || '단말기 미등록'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400">등록일:</span>
                        <span className="font-mono text-slate-700">{u.registeredAt || '2026-03-01'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400">전자투표 세대키:</span>
                        <span className="font-mono text-indigo-700 font-bold">{u.dong}_{u.ho}</span>
                      </div>
                    </div>

                    {/* 줄 3: Actions (Manager & Operator ONLY) */}
                    {isManager && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500">
                          {u.status === 'pending' ? (
                            <span className="text-amber-700 font-medium">관리사무소 세대 명부 확인 후 승인해 주세요.</span>
                          ) : (
                            <span>동대표, 선관위원, 자문위원 등 직무 등급을 관리자·운영자가 지정/해지할 수 있습니다.</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {u.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => approveUser(u.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>입주민 가입 승인</span>
                              </button>
                              <button
                                onClick={() => rejectUser(u.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              >
                                가입 반려
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setSelectedRole(u.role);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>직무등급 지정/해지</span>
                              </button>

                              <button
                                onClick={() => resetDeviceForUser(u.id)}
                                title="단말기 분실 및 핸드폰 기기 변경 시 인증 초기화"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                <span>단말기 초기화</span>
                              </button>

                              {confirmDeleteUserId === u.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      deleteUser(u.id);
                                      setConfirmDeleteUserId(null);
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                                  >
                                    퇴거 삭제 확인
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteUserId(null)}
                                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteUserId(u.id)}
                                  title="세대 퇴거 또는 정보 삭제"
                                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* User Table Mode */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">성명 (닉네임)</th>
                      <th className="py-3 px-4">동 · 호수</th>
                      <th className="py-3 px-4">핸드폰 번호</th>
                      <th className="py-3 px-4">거주구분</th>
                      <th className="py-3 px-4">직무 등급</th>
                      <th className="py-3 px-4">등록 단말기</th>
                      <th className="py-3 px-4">가입상태</th>
                      {isManager && <th className="py-3 px-4 text-right">관리 작업</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {u.name} <span className="text-slate-400 font-normal">({u.nickname})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono font-bold">
                          {u.dong} {u.ho}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {u.phone}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            u.residentType === 'owner' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.residentType === 'owner' ? '소유자' : '세입자'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === 'manager' ? 'bg-amber-100 text-amber-900' :
                            u.role === 'operator' ? 'bg-purple-100 text-purple-900' :
                            u.role === 'dong_rep' ? 'bg-blue-100 text-blue-900' :
                            u.role === 'election_comm' ? 'bg-emerald-100 text-emerald-900' :
                            u.role === 'advisory' ? 'bg-indigo-100 text-indigo-900' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === 'manager' ? '관리사무소장' :
                             u.role === 'operator' ? '총괄운영자' :
                             u.role === 'dong_rep' ? '동대표' :
                             u.role === 'election_comm' ? '선관위원' :
                             u.role === 'advisory' ? '자문위원' : '일반입주민'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {u.deviceId || '미등록'}
                        </td>
                        <td className="py-3 px-4">
                          {u.status === 'approved' ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>승인완료</span>
                            </span>
                          ) : u.status === 'pending' ? (
                            <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                              승인대기
                            </span>
                          ) : (
                            <span className="text-rose-600 text-[11px]">반려됨</span>
                          )}
                        </td>
                        {isManager && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {u.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => approveUser(u.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs"
                                  >
                                    승인
                                  </button>
                                  <button
                                    onClick={() => rejectUser(u.id)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                                  >
                                    반려
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingUser(u);
                                      setSelectedRole(u.role);
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                                  >
                                    직무등급 변경
                                  </button>
                                  <button
                                    onClick={() => resetDeviceForUser(u.id)}
                                    title="단말기 분실 및 기기 변경 초기화"
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded text-[11px] cursor-pointer"
                                  >
                                    기기재설정
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: 입주민 문자(SMS) 발송 ==================== */}
      {!isElectionComm && activeTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SMS Sender Form (Disabled/Hidden for dong_rep read-only) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>입주민 타겟 문자(SMS/알림톡) {isManager ? '일괄 발송' : '발송 설정 조회'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  소유자, 입주자, 동별, 연령대 등 맞춤 필터링 발송 지원
                </p>
              </div>
              {!isManager && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                  조회 전용 (발송 불가)
                </span>
              )}
            </div>

            {isManager && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  자주 쓰는 공지 템플릿:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleApplySmsTemplate('vote')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 cursor-pointer"
                  >
                    투표 참여 독려
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySmsTemplate('water')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 cursor-pointer"
                  >
                    단수 공지
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySmsTemplate('parking')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 cursor-pointer"
                  >
                    주차장 물청소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySmsTemplate('fire')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 cursor-pointer"
                  >
                    소방 종합점검
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendBulkSmsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    발송 대상 (거주구분)
                  </label>
                  <select
                    disabled={!isManager}
                    value={smsTargetAudience}
                    onChange={(e) => setSmsTargetAudience(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg disabled:opacity-60"
                  >
                    <option value="all">전체 입주민 (520세대)</option>
                    <option value="owner">등기 소유자만 (420세대)</option>
                    <option value="tenant">세입자(임차인)만 (100세대)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    특정 동 선택
                  </label>
                  <select
                    disabled={!isManager}
                    value={smsTargetDong}
                    onChange={(e) => setSmsTargetDong(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg disabled:opacity-60"
                  >
                    <option value="all">전체 동 (101~106동)</option>
                    <option value="101동">101동만</option>
                    <option value="102동">102동만</option>
                    <option value="103동">103동만</option>
                    <option value="104동">104동만</option>
                    <option value="105동">105동만</option>
                    <option value="106동">106동만</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    연령대 필터
                  </label>
                  <select
                    disabled={!isManager}
                    value={smsTargetAge}
                    onChange={(e) => setSmsTargetAge(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg disabled:opacity-60"
                  >
                    <option value="all">전 연령대</option>
                    <option value="20대">20대</option>
                    <option value="30대">30대</option>
                    <option value="40대">40대</option>
                    <option value="50대">50대</option>
                    <option value="60대 이상">60대 이상</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  문자 제목
                </label>
                <input
                  type="text"
                  required
                  disabled={!isManager}
                  value={smsTitle}
                  onChange={(e) => setSmsTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  문자 메시지 내용
                </label>
                <textarea
                  required
                  disabled={!isManager}
                  rows={6}
                  placeholder={isManager ? '입주민에게 전달할 긴급 안내 및 공지 내용을 작성하세요...' : '조회 전용 모드에서는 문자 발송이 제한됩니다.'}
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed focus:bg-white disabled:opacity-60"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">발송 예정 세대수: </span>
                  <strong className="text-blue-600 text-sm font-mono">{getEstimatedTargetCount()}세대</strong>
                </div>
                <span className="text-[11px] text-slate-400">발신번호: 02-3289-1113 (관리사무소)</span>
              </div>

              {isManager && (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>선택 대상 {getEstimatedTargetCount()}세대로 문자 즉시 발송</span>
                </button>
              )}
            </form>
          </div>

          {/* Right: Phone Simulator Preview & SMS Logs */}
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border-4 border-slate-800 shadow-xl max-w-xs mx-auto text-white">
              <div className="text-center text-[10px] text-slate-400 mb-3 pb-2 border-b border-slate-800">
                입주민 수신 단말기 미리보기
              </div>
              <div className="bg-slate-800 rounded-xl p-3.5 text-xs text-slate-200 min-h-[160px] flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white mb-1.5 leading-snug">
                    {smsTitle}
                  </div>
                  <div className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {smsContent || '(메시지를 작성하시면 수신 단말 화면이 실시간으로 표시됩니다.)'}
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-700 text-[10px] text-slate-400 font-mono flex justify-between">
                  <span>동작상떼빌</span>
                  <span>무료수신거부 080</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 mb-2">
                최근 문자 발송 이력 ({smsLogs.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {smsLogs.map(log => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg text-[11px] border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-800 mb-0.5">
                      <span className="truncate pr-1">{log.messageTitle}</span>
                      <span className="font-mono text-blue-600 shrink-0">{log.targetCount}건</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">{log.targetGroup} · {log.sentAt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: 투표 관리 (관리자/운영자/선관위 관리, 입대의 조회) ==================== */}
      {activeTab === 'vote' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  개설된 전자투표 관리 및 세대별 투표 참여 현황
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {canManageVotes
                    ? '선거관리위원회 및 관리사무소에서 전자투표 개설, 안내문자 발송 및 마감 처리를 관리합니다.'
                    : '입대의 조회 전용 모드: 개설된 전자투표의 투표율과 세대별 참여 현황을 열람합니다.'}
                </p>
              </div>

              {canManageVotes && (
                <button
                  onClick={() => setIsCreateVoteOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 전자투표 개설</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {votes.map(v => {
                const totalVoted = Math.max(
                  v.options.reduce((sum, opt) => sum + opt.votes, 0),
                  Object.keys(v.householdVotes).length
                );
                const rate = Math.min(100, Math.round((totalVoted / Math.max(1, v.totalEligibleHouseholds)) * 100));

                return (
                  <div key={v.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          v.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {v.status === 'active' ? '진행중' : '마감'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{v.title}</span>
                      </div>

                      {canManageVotes && v.status === 'active' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => sendVoteGuideSms(v.id)}
                            className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 cursor-pointer"
                          >
                            안내문자 발송 ({v.smsSentCount}건)
                          </button>
                          <button
                            onClick={() => closeVote(v.id)}
                            className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 cursor-pointer"
                          >
                            투표 마감
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[11px] block">대상 세대</span>
                        <strong className="text-slate-800 font-mono">{v.totalEligibleHouseholds}세대</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[11px] block">참여 세대수</span>
                        <strong className="text-blue-600 font-mono">{totalVoted}세대</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[11px] block">현재 투표율</span>
                        <strong className="text-emerald-600 font-mono">{rate}%</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[11px] block">투표 기한</span>
                        <strong className="text-slate-700 font-mono text-[11px]">{v.endDate}</strong>
                      </div>
                    </div>

                    {/* Voted Households List Preview */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        세대별 최초 투표자 기록 (중복 방지 로그):
                      </span>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {Object.entries(v.householdVotes).length === 0 ? (
                          <span className="text-slate-400">아직 투표 참여 기록이 없습니다.</span>
                        ) : (
                          Object.entries(v.householdVotes).map(([hhKey, record]) => (
                            <span key={hhKey} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                              {hhKey} ({record.voterName} · {record.votedAt.slice(5, 16)})
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: 게시판 전체글 관리 (Back Office 전용) ==================== */}
      {!isElectionComm && activeTab === 'board' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>게시판 전체글 통합 조회 및 숨김(블라인드) 제어</span>
              </h2>
              <p className="text-xs text-slate-500">
                모든 분과 게시글(전체글)은 백오피스에서만 통합 조회되며, {isManager ? '관리자·운영자는 부적절한 글을 숨김 처리할 수 있습니다.' : '입대의는 조회 전용으로 열람 가능합니다.'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="전체글 제목, 작성자 검색..."
                value={boardSearch}
                onChange={(e) => setBoardSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Category Filter inside Back Office (전체글 included here ONLY) */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
            {[
              { id: 'all', label: `전체글 (${posts.length})` },
              { id: 'notice', label: '공지사항' },
              { id: 'free', label: '자유게시판' },
              { id: 'complaint', label: '민원접수' },
              { id: 'suggestion', label: '건의사항' },
              { id: 'rep_meeting', label: '입대의' },
              { id: 'election_board', label: '선관위' },
              { id: 'advisory_board', label: '자문위원' },
              { id: 'debate', label: '주민토론방' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setBoardFilterCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  boardFilterCategory === cat.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">분과</th>
                  <th className="py-2.5 px-3">제목</th>
                  <th className="py-2.5 px-3">작성자 (동호수)</th>
                  <th className="py-2.5 px-3">등록일시</th>
                  <th className="py-2.5 px-3">상태</th>
                  {isManager && <th className="py-2.5 px-3 text-right">숨김 제어</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBoardPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 whitespace-nowrap">
                        {getCategoryLabel(post.category)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {post.authorName} ({post.authorDongHo})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {post.createdAt}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {post.isHidden ? (
                        <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded text-[10px]">
                          숨김(블라인드)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[10px]">정상 노출</span>
                      )}
                    </td>
                    {isManager && (
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggleHidePost(post.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            post.isHidden
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {post.isHidden ? '노출 복구' : '게시글 숨김'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: 민원 관리 ==================== */}
      {!isElectionComm && activeTab === 'complaints' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>입주민 민원 관리 및 처리 현황</span>
              </h2>
              <p className="text-xs text-slate-500">
                주차, 소음, 승강기, 누수 등 시설 및 생활 불편 민원 처리
              </p>
            </div>

            {isDongRep ? (
              <div className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>입대의 확인 모드 (조회 전용)</span>
              </div>
            ) : (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>관리자/운영자 처리 및 공식 답변 모드</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {posts.filter(p => p.category === 'complaint').map(comp => (
              <div key={comp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      comp.complaintStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      comp.complaintStatus === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {comp.complaintStatus === 'completed' ? '처리완료' : comp.complaintStatus === 'in_progress' ? '처리중' : '접수대기'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{comp.title}</h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({comp.authorName} · {comp.authorDongHo})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{comp.createdAt}</span>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-wrap">{comp.content}</p>

                {comp.officialReply ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-blue-700 font-semibold mb-1">
                      <span>{comp.officialReply.replierRole} ({comp.officialReply.replierName}) 공식 답변:</span>
                      <span className="text-[10px] text-slate-400 font-mono">{comp.officialReply.repliedAt}</span>
                    </div>
                    <p className="text-slate-800">{comp.officialReply.replyContent}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">아직 등록된 공식 답변이 없습니다.</p>
                )}

                {isManager && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedComplaintId(comp.id);
                        setComplaintReplyText(comp.officialReply?.replyContent || '');
                        setComplaintStatusChange(comp.complaintStatus === 'in_progress' ? 'completed' : 'in_progress');
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                    >
                      {comp.officialReply ? '답변 수정 및 상태 변경' : '공식 답변 작성 및 상태 업데이트'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 6: 시설물 관리 대시보드 ==================== */}
      {!isElectionComm && activeTab === 'facilities' && (
        <div className="space-y-4">
          <FacilityDashboard readOnly={!isManager} inBackOffice={true} />
        </div>
      )}

      {/* ==================== TAB 7: 방문차량 주차관제 시스템 ==================== */}
      {!isElectionComm && activeTab === 'parking' && (
        <div className="space-y-4">
          <ParkingManagementView readOnly={!isManager} inBackOffice={true} />
        </div>
      )}

      {/* Role Assignment Modal */}
      {isManager && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                입주민 직무 등급 지정 및 해지
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <p><strong>대상자:</strong> {editingUser.name} ({editingUser.nickname})</p>
                <p><strong>동 · 호수:</strong> {editingUser.dong} {editingUser.ho}</p>
                <p><strong>현재 직무:</strong> {editingUser.role}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  변경할 직무 등급 선택:
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'resident', label: '일반입주민 (기본 등급으로 해지)' },
                    { id: 'dong_rep', label: '동대표 (입주자대표회의 조회 및 게시판 권한)' },
                    { id: 'election_comm', label: '선관위 (선거관리위원회 투표 관리 권한)' },
                    { id: 'advisory', label: '자문위원 (자문위원 게시판 글 작성 권한)' },
                  ].map(r => (
                    <label
                      key={r.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs ${
                        selectedRole === r.id ? 'bg-blue-50 border-blue-500 font-bold text-blue-900' : 'bg-white border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role_choice"
                        value={r.id}
                        checked={selectedRole === r.id}
                        onChange={() => setSelectedRole(r.id as UserRole)}
                        className="text-blue-600"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleRoleChangeSubmit}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  직무 등급 반영 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Reply Modal in Backoffice */}
      {isManager && selectedComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                관리소 공식 민원 답변 작성
              </h3>
              <button onClick={() => setSelectedComplaintId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  민원 처리 상태
                </label>
                <select
                  value={complaintStatusChange}
                  onChange={(e) => setComplaintStatusChange(e.target.value as 'in_progress' | 'completed')}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="in_progress">처리중 (부품 수급 및 기술점검 진행)</option>
                  <option value="completed">처리완료 (현장 보수 및 시정 조치 완료)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  공식 답변 내용
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="입주민에게 신뢰를 드리는 구체적인 조치 경과를 기재하세요..."
                  value={complaintReplyText}
                  onChange={(e) => setComplaintReplyText(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    replyToComplaint(selectedComplaintId, complaintReplyText, complaintStatusChange);
                    setSelectedComplaintId(null);
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  답변 저장 및 입주민 알림
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Vote Modal inside Back Office */}
      {canManageVotes && isCreateVoteOpen && (
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
                onClick={() => setIsCreateVoteOpen(false)}
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
                  value={newVoteTitle}
                  onChange={(e) => setNewVoteTitle(e.target.value)}
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
                  placeholder="사업비 소요 예산, 기대 효과 및 투표 관련 근거를 설명해 주세요..."
                  value={newVoteDesc}
                  onChange={(e) => setNewVoteDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    투표 대상자 지정
                  </label>
                  <select
                    value={newVoteAudience}
                    onChange={(e) => setNewVoteAudience(e.target.value as VoteTargetAudience)}
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
                  {newVoteCustomOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`문항 ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newVoteCustomOptions];
                        updated[idx] = e.target.value;
                        setNewVoteCustomOptions(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  ))}
                  {newVoteCustomOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setNewVoteCustomOptions([...newVoteCustomOptions, ''])}
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
                  value={newVoteEndDate}
                  onChange={(e) => setNewVoteEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateVoteOpen(false)}
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
