import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  ResidentUser, 
  UserRole, 
  Post, 
  BoardCategory, 
  ArchiveDocument, 
  VoteItem, 
  ChatRoom, 
  ChatMessage, 
  SmsLog, 
  FacilityItem,
  VisitorVehicle,
  VisitorStatus 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_POSTS, 
  INITIAL_ARCHIVES, 
  INITIAL_VOTES, 
  INITIAL_CHAT_ROOMS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_SMS_LOGS, 
  INITIAL_FACILITIES,
  INITIAL_VISITOR_VEHICLES 
} from '../data/mockInitialData';

interface AppContextType {
  // Auth & Device
  currentUser: ResidentUser | null;
  currentDeviceId: string;
  setDeviceUuid: (id: string) => void;
  users: ResidentUser[];
  loginWithPhone: (phone: string) => { success: boolean; message: string; requiresDeviceTransfer?: boolean };
  logout: () => void;
  registerUser: (data: Omit<ResidentUser, 'id' | 'status' | 'registeredAt' | 'deviceId'>) => { success: boolean; message: string };
  switchUserDemo: (userId: string, matchDevice?: boolean) => void;
  resetDeviceForUser: (userId: string) => void;
  
  // App Intro & Notice Popup
  showIntroSplash: boolean;
  dismissIntroSplash: () => void;
  mandatoryNoticeToDisplay: Post | null;
  dismissMandatoryNotice: (dontShowToday: boolean) => void;
  
  // Navigation / Views
  currentView: 'home' | 'board' | 'archive' | 'vote' | 'chat' | 'backoffice' | 'parking' | 'facilities';
  setCurrentView: (view: 'home' | 'board' | 'archive' | 'vote' | 'chat' | 'backoffice' | 'parking' | 'facilities') => void;
  selectedBoardCategory: BoardCategory;
  setSelectedBoardCategory: (cat: BoardCategory) => void;
  
  // Posts & Boards
  posts: Post[];
  addPost: (postData: { title: string; content: string; category: BoardCategory; isPinned?: boolean; isMandatory?: boolean }) => void;
  toggleLikePost: (postId: string) => void;
  addPostComment: (postId: string, content: string) => void;
  toggleHidePost: (postId: string) => void;
  replyToComplaint: (postId: string, replyContent: string, status: 'in_progress' | 'completed') => { success: boolean; message: string };
  
  // Archives
  archives: ArchiveDocument[];
  addArchiveDocument: (doc: Omit<ArchiveDocument, 'id' | 'downloadsCount' | 'uploadedAt'>) => void;
  incrementDownload: (docId: string) => void;
  
  // Votes
  votes: VoteItem[];
  castVote: (voteId: string, optionId: string) => { success: boolean; message: string };
  createVote: (voteData: Omit<VoteItem, 'id' | 'smsSentCount' | 'createdAt' | 'householdVotes'>) => void;
  closeVote: (voteId: string) => void;
  sendVoteGuideSms: (voteId: string) => { success: boolean; sentCount: number; message: string };
  
  // Chat
  chatRooms: ChatRoom[];
  chatMessages: Record<string, ChatMessage[]>;
  activeChatRoomId: string;
  setActiveChatRoomId: (id: string) => void;
  sendChatMessage: (roomId: string, text: string, imageUrl?: string) => void;
  
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  deleteUser: (userId: string) => void;
  smsLogs: SmsLog[];
  sendBulkSms: (params: { targetDong?: string; targetRole?: string; targetAudience: string; targetAge?: string; title: string; content: string }) => { success: boolean; sentCount: number };
  
  // Facilities
  facilities: FacilityItem[];
  addFacilityInspection: (facilityId: string, inspection: { inspector: string; result: '양호' | '요주의' | '불량'; notes: string; photos?: string[] }) => void;
  addFacilityRepair: (facilityId: string, repair: { vendor: string; cost: number; description: string; status: '완료' | '진행중' }) => void;
  
  // Parking & Visitor Vehicles
  visitorVehicles: VisitorVehicle[];
  monthlyParkingLimitHours: number;
  updateMonthlyParkingLimitHours: (hours: number) => { success: boolean; message: string };
  calculateVisitHours: (visit: Pick<VisitorVehicle, 'visitDate' | 'expectedEntryTime' | 'expectedExitTime' | 'entryTime' | 'exitTime' | 'status'>) => number;
  getHouseholdMonthlyParkingUsage: (dong: string, ho: string) => { usedHours: number; limitHours: number; remainingHours: number; monthLabel: string };
  registerVisitorVehicle: (data: Omit<VisitorVehicle, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string };
  cancelVisitorVehicle: (id: string) => void;
  updateVisitorStatus: (id: string, status: VisitorStatus, gate?: string) => void;
  
  // Notifications toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize device ID
  const [currentDeviceId, setCurrentDeviceId] = useState<string>(() => {
    return localStorage.getItem('apt_device_id') || 'DEV-PHONE-DEMO';
  });

  // Users state
  const [users, setUsers] = useState<ResidentUser[]>(() => {
    const saved = localStorage.getItem('apt_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState<ResidentUser | null>(() => {
    const savedUserId = localStorage.getItem('apt_current_user_id');
    const autoLogin = localStorage.getItem('apt_auto_login') !== 'false';
    if (savedUserId && autoLogin) {
      const allUsers = localStorage.getItem('apt_users') ? JSON.parse(localStorage.getItem('apt_users')!) : INITIAL_USERS;
      const found = allUsers.find((u: ResidentUser) => u.id === savedUserId);
      if (found && found.status === 'approved') return found;
    }
    // Not logged in yet: only login and registration are active
    return null;
  });

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'board' | 'archive' | 'vote' | 'chat' | 'backoffice' | 'parking' | 'facilities'>('home');
  const [selectedBoardCategory, setSelectedBoardCategory] = useState<BoardCategory>('notice');

  // Intro splash screen (2~3 seconds)
  const [showIntroSplash, setShowIntroSplash] = useState<boolean>(() => {
    // Show on initial load if logged in
    return true;
  });

  // Dismissed mandatory notices today
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('apt_dismissed_notices');
    return saved ? JSON.parse(saved) : [];
  });

  // Posts state
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('apt_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  // Archives state
  const [archives, setArchives] = useState<ArchiveDocument[]>(() => {
    const saved = localStorage.getItem('apt_archives');
    return saved ? JSON.parse(saved) : INITIAL_ARCHIVES;
  });

  // Votes state
  const [votes, setVotes] = useState<VoteItem[]>(() => {
    const saved = localStorage.getItem('apt_votes');
    return saved ? JSON.parse(saved) : INITIAL_VOTES;
  });

  // Chat state
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem('apt_chat_rooms');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_ROOMS;
  });
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('apt_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });
  const [activeChatRoomId, setActiveChatRoomId] = useState<string>('room-101dong');

  // SMS Logs
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(() => {
    const saved = localStorage.getItem('apt_sms_logs');
    return saved ? JSON.parse(saved) : INITIAL_SMS_LOGS;
  });

  // Facilities
  const [facilities, setFacilities] = useState<FacilityItem[]>(() => {
    const saved = localStorage.getItem('apt_facilities');
    return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
  });

  // Visitor Vehicles & Monthly Free Parking Quota (default 100h/month)
  const [visitorVehicles, setVisitorVehicles] = useState<VisitorVehicle[]>(() => {
    const saved = localStorage.getItem('apt_visitor_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VISITOR_VEHICLES;
  });

  const [monthlyParkingLimitHours, setMonthlyParkingLimitHours] = useState<number>(() => {
    const saved = localStorage.getItem('apt_monthly_parking_limit');
    const parsed = saved ? Number(saved) : 100;
    return !Number.isNaN(parsed) && parsed > 0 ? parsed : 100;
  });

  // Server sync tracking refs (prevents echoing hydrated server state back as PUT)
  const isHydratedRef = useRef<boolean>(false);
  const lastSyncedSnapshotsRef = useRef<Record<string, string>>({});
  const lastServerUpdatedAtRef = useRef<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const syncSliceToServer = useCallback((key: string, value: unknown) => {
    if (!isHydratedRef.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const serialized = JSON.stringify(value);
    if (lastSyncedSnapshotsRef.current[key] === serialized) return;
    lastSyncedSnapshotsRef.current[key] = serialized;

    fetch(`/api/state/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.updatedAt) {
          lastServerUpdatedAtRef.current = data.updatedAt;
        }
      })
      .catch(() => {
        // Offline / transient network errors fall back gracefully to localStorage cache
      });
  }, []);

  const hydrateFromServer = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      isHydratedRef.current = true;
      return;
    }
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || typeof data !== 'object') return;

      if (
        isHydratedRef.current &&
        data.updatedAt &&
        lastServerUpdatedAtRef.current === data.updatedAt
      ) {
        return;
      }

      if (typeof data.updatedAt === 'string') {
        lastServerUpdatedAtRef.current = data.updatedAt;
      }

      const applySlice = <T,>(
        key: string,
        val: unknown,
        setter: React.Dispatch<React.SetStateAction<T>>
      ) => {
        if (val === undefined) return;
        const serialized = JSON.stringify(val);
        if (lastSyncedSnapshotsRef.current[key] !== serialized) {
          lastSyncedSnapshotsRef.current[key] = serialized;
          setter(val as T);
        }
      };

      applySlice('users', data.users, setUsers);
      applySlice('posts', data.posts, setPosts);
      applySlice('archives', data.archives, setArchives);
      applySlice('votes', data.votes, setVotes);
      applySlice('chatRooms', data.chatRooms, setChatRooms);
      applySlice('chatMessages', data.chatMessages, setChatMessages);
      applySlice('smsLogs', data.smsLogs, setSmsLogs);
      applySlice('facilities', data.facilities, setFacilities);
      applySlice('visitorVehicles', data.visitorVehicles, setVisitorVehicles);
      if (typeof data.monthlyParkingLimitHours === 'number' && data.monthlyParkingLimitHours > 0) {
        applySlice('monthlyParkingLimitHours', data.monthlyParkingLimitHours, setMonthlyParkingLimitHours);
      }

      // Refresh logged-in user record if role/status was changed by admin on another device
      if (Array.isArray(data.users)) {
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const updated = (data.users as ResidentUser[]).find((u) => u.id === prev.id);
          if (!updated || updated.status !== 'approved') return null;
          return JSON.stringify(updated) === JSON.stringify(prev) ? prev : updated;
        });
      }
    } catch {
      // Offline / dev restart fallback: continue seamlessly with localStorage cache
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    void hydrateFromServer();
    const intervalId = window.setInterval(() => {
      if (typeof navigator === 'undefined' || navigator.onLine) {
        void hydrateFromServer();
      }
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [hydrateFromServer]);

  // Sync state to local storage & backend Express server
  useEffect(() => {
    localStorage.setItem('apt_device_id', currentDeviceId);
  }, [currentDeviceId]);

  useEffect(() => {
    localStorage.setItem('apt_users', JSON.stringify(users));
    syncSliceToServer('users', users);
  }, [users, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_posts', JSON.stringify(posts));
    syncSliceToServer('posts', posts);
  }, [posts, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_votes', JSON.stringify(votes));
    syncSliceToServer('votes', votes);
  }, [votes, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_archives', JSON.stringify(archives));
    syncSliceToServer('archives', archives);
  }, [archives, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_chat_rooms', JSON.stringify(chatRooms));
    syncSliceToServer('chatRooms', chatRooms);
  }, [chatRooms, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_chat_messages', JSON.stringify(chatMessages));
    syncSliceToServer('chatMessages', chatMessages);
  }, [chatMessages, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_sms_logs', JSON.stringify(smsLogs));
    syncSliceToServer('smsLogs', smsLogs);
  }, [smsLogs, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_facilities', JSON.stringify(facilities));
    syncSliceToServer('facilities', facilities);
  }, [facilities, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_visitor_vehicles', JSON.stringify(visitorVehicles));
    syncSliceToServer('visitorVehicles', visitorVehicles);
  }, [visitorVehicles, syncSliceToServer]);

  useEffect(() => {
    localStorage.setItem('apt_monthly_parking_limit', String(monthlyParkingLimitHours));
    syncSliceToServer('monthlyParkingLimitHours', monthlyParkingLimitHours);
  }, [monthlyParkingLimitHours, syncSliceToServer]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('apt_current_user_id', currentUser.id);
      localStorage.setItem('apt_auto_login', 'true');
    } else {
      localStorage.removeItem('apt_current_user_id');
      localStorage.setItem('apt_auto_login', 'false');
    }
  }, [currentUser]);

  // Set device ID
  const setDeviceUuid = (id: string) => {
    setCurrentDeviceId(id);
    showToast(`접속 단말기 식별자가 [${id}]로 설정되었습니다.`);
  };

  // Handle Intro Splash timeout
  useEffect(() => {
    if (showIntroSplash) {
      const timer = setTimeout(() => {
        setShowIntroSplash(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showIntroSplash]);

  const dismissIntroSplash = () => {
    setShowIntroSplash(false);
  };

  // Compute mandatory notice to pop up after intro
  const mandatoryNoticeToDisplay = React.useMemo(() => {
    if (showIntroSplash || !currentUser) return null;
    const mandatory = posts.find(p => p.isMandatory && !p.isHidden && !dismissedNoticeIds.includes(p.id));
    return mandatory || null;
  }, [showIntroSplash, currentUser, posts, dismissedNoticeIds]);

  const dismissMandatoryNotice = (dontShowToday: boolean) => {
    if (mandatoryNoticeToDisplay) {
      if (dontShowToday) {
        const next = [...dismissedNoticeIds, mandatoryNoticeToDisplay.id];
        setDismissedNoticeIds(next);
        localStorage.setItem('apt_dismissed_notices', JSON.stringify(next));
        showToast('오늘 하루 동안 이 필수 공지가 다시 표시되지 않습니다.');
      } else {
        const next = [...dismissedNoticeIds, mandatoryNoticeToDisplay.id];
        setDismissedNoticeIds(next);
      }
    }
  };

  // Login with phone check & device check
  const loginWithPhone = (phone: string): { success: boolean; message: string; requiresDeviceTransfer?: boolean } => {
    const cleanPhone = phone.trim().replace(/-/g, '');
    const user = users.find(u => u.phone.replace(/-/g, '') === cleanPhone);

    if (!user) {
      return { 
        success: false, 
        message: '등록되지 않은 전화번호입니다. 회원가입 신청 후 관리사무소 승인을 받으세요.' 
      };
    }

    if (user.status === 'pending') {
      return { 
        success: false, 
        message: '관리사무소 확인 승인 대기 중입니다. 관리자 승인 완료 후 앱을 사용할 수 있습니다.' 
      };
    }

    if (user.status === 'rejected') {
      return { 
        success: false, 
        message: '입주민 가입 신청이 반려되었습니다. 관리사무소로 문의해 주십시오.' 
      };
    }

    if (user.status === 'suspended') {
      return { 
        success: false, 
        message: '이용이 정지된 계정입니다. 관리사무소로 문의해 주십시오.' 
      };
    }

    // CHECK PHONE DEVICE RESTRICTION (타 핸드폰에서의 로그인 거절)
    if (user.deviceId && user.deviceId !== currentDeviceId) {
      return {
        success: false,
        requiresDeviceTransfer: true,
        message: `[로그인 거절] 등록된 본인 핸드폰(기기: ${user.deviceId})이 아닙니다. 타 핸드폰에서의 로그인은 보안상 차단됩니다.`
      };
    }

    // Auto update deviceId if newly set
    if (!user.deviceId) {
      const updatedUser = { ...user, deviceId: currentDeviceId };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUser(updatedUser);
    } else {
      setCurrentUser(user);
    }

    setShowIntroSplash(true);
    showToast(`${user.name}님 환영합니다! (${user.dong} ${user.ho})`);
    return { success: true, message: '로그인 성공' };
  };

  // Reset/Transfer device for user
  const resetDeviceForUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, deviceId: currentDeviceId } : u));
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser({ ...targetUser, deviceId: currentDeviceId });
      showToast(`단말기 등록이 현재 기기(${currentDeviceId})로 갱신되었습니다.`);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('apt_current_user_id');
    localStorage.setItem('apt_auto_login', 'false');
    showToast('로그아웃되었습니다. 다시 로그인하려면 전화번호를 입력하세요.');
  };

  const registerUser = (data: Omit<ResidentUser, 'id' | 'status' | 'registeredAt' | 'deviceId'>) => {
    const cleanPhone = data.phone.trim().replace(/-/g, '');
    const exists = users.some(u => u.phone.replace(/-/g, '') === cleanPhone);
    if (exists) {
      return { success: false, message: '이미 가입 신청되었거나 등록된 전화번호입니다.' };
    }

    const newUser: ResidentUser = {
      ...data,
      id: `user-${Date.now()}`,
      status: 'pending', // 관리자 확인 승인 후 사용 가능
      deviceId: currentDeviceId,
      registeredAt: new Date().toISOString().slice(0, 10),
      role: 'resident',
    };

    setUsers(prev => [newUser, ...prev]);
    showToast('회원가입 신청이 완료되었습니다. 관리사무소 승인 후 알림톡이 발송됩니다.');
    return { success: true, message: '가입 신청 완료' };
  };

  const switchUserDemo = (userId: string, matchDevice: boolean = true) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    if (matchDevice && target.deviceId) {
      setCurrentDeviceId(target.deviceId);
    }
    setCurrentUser(target);
    setShowIntroSplash(false);
    showToast(`[데모 전환] ${target.name} (${target.nickname} / ${target.role}) 계정으로 전환되었습니다.`);
  };

  const isAdminRole = (role?: UserRole) => role === 'manager' || role === 'operator';

  // Post Actions
  const addPost = (postData: { title: string; content: string; category: BoardCategory; isPinned?: boolean; isMandatory?: boolean }) => {
    if (!currentUser) return;

    const role = currentUser.role;
    const cat = postData.category;
    if (cat === 'notice' && !isAdminRole(role)) {
      showToast('공지사항은 관리자 및 운영자만 작성할 수 있습니다.');
      return;
    }
    if (cat === 'rep_meeting' && !isAdminRole(role) && role !== 'dong_rep') {
      showToast('입대의 게시판은 동대표 및 관리자만 작성할 수 있습니다.');
      return;
    }
    if (cat === 'election_board' && !isAdminRole(role) && role !== 'election_comm') {
      showToast('선관위 게시판은 선관위원 및 관리자만 작성할 수 있습니다.');
      return;
    }
    if (cat === 'advisory_board' && !isAdminRole(role) && role !== 'advisory') {
      showToast('자문위원 게시판은 자문위원 및 관리자만 작성할 수 있습니다.');
      return;
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      category: postData.category,
      title: postData.title,
      content: postData.content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorNickname: currentUser.nickname,
      authorDongHo: `${currentUser.dong} ${currentUser.ho}`,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      views: 1,
      likes: 0,
      likedUserIds: [],
      comments: [],
      isHidden: false,
      isPinned: isAdminRole(role) ? (postData.isPinned || false) : false,
      isMandatory: isAdminRole(role) ? (postData.isMandatory || false) : false,
      complaintStatus: postData.category === 'complaint' ? 'pending' : undefined,
    };
    setPosts(prev => [newPost, ...prev]);
    showToast('게시글이 등록되었습니다.');
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const already = p.likedUserIds.includes(currentUser.id);
      return {
        ...p,
        likes: already ? p.likes - 1 : p.likes + 1,
        likedUserIds: already ? p.likedUserIds.filter(id => id !== currentUser.id) : [...p.likedUserIds, currentUser.id]
      };
    }));
  };

  const addPostComment = (postId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorDongHo: `${currentUser.dong} ${currentUser.ho}`,
      authorRole: currentUser.role,
      content: content.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, newComment]
      };
    }));
    showToast('댓글이 작성되었습니다.');
  };

  const toggleHidePost = (postId: string) => {
    if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'operator')) {
      showToast('게시글 숨김/블라인드 처리는 관리자 및 운영자만 가능합니다.');
      return;
    }
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const nextHidden = !p.isHidden;
      showToast(nextHidden ? '게시글이 블라인드(숨김) 처리되었습니다.' : '게시글 숨김이 해제되었습니다.');
      return { ...p, isHidden: nextHidden };
    }));
  };

  // Reply to complaint (Manager only, Dong rep and Advisory can only read!)
  const replyToComplaint = (postId: string, replyContent: string, status: 'in_progress' | 'completed') => {
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };

    // Strict role check:
    // "민원은 관리자가 관리하며 동대표와 자문위원은 확인만 가능하다"
    if (currentUser.role !== 'manager' && currentUser.role !== 'operator') {
      return { 
        success: false, 
        message: '민원 공식 답변 및 처리상태 변경은 관리자(관리사무소) 권한입니다. (동대표와 자문위원은 열람만 가능)' 
      };
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        complaintStatus: status,
        officialReply: {
          replierName: currentUser.name,
          replierRole: currentUser.role === 'manager' ? '관리사무소장' : '총괄운영자',
          replyContent,
          repliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      };
    }));

    showToast(`민원 처리 상태가 [${status === 'completed' ? '처리완료' : '처리중'}]로 업데이트되었습니다.`);
    return { success: true, message: '답변 등록 완료' };
  };

  // Archives
  const addArchiveDocument = (doc: Omit<ArchiveDocument, 'id' | 'downloadsCount' | 'uploadedAt'>) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('자료 등록은 관리자 및 운영자만 가능합니다.');
      return;
    }
    const newDoc: ArchiveDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      downloadsCount: 0,
      uploadedAt: new Date().toISOString().slice(0, 10)
    };
    setArchives(prev => [newDoc, ...prev]);
    showToast('자료실에 새로운 문서가 등록되었습니다.');
  };

  const incrementDownload = (docId: string) => {
    setArchives(prev => prev.map(d => d.id === docId ? { ...d, downloadsCount: d.downloadsCount + 1 } : d));
  };

  // Vote System with Household Duplicate Prevention
  const castVote = (voteId: string, optionId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };

    const targetVote = votes.find(v => v.id === voteId);
    if (!targetVote) return { success: false, message: '투표를 찾을 수 없습니다.' };

    if (targetVote.status === 'closed') {
      return { success: false, message: '이미 마감된 투표입니다.' };
    }

    // Target audience check (소유자 or 입주민 대상)
    if (targetVote.targetAudience === 'owner_only' && currentUser.residentType !== 'owner') {
      return { 
        success: false, 
        message: '본 투표는 등기 소유자 전용 투표 안건입니다. 세입자/입주민 계정은 투표 권한이 없습니다.' 
      };
    }

    // Household key for duplicate vote prevention: `${dong}_${ho}`
    const householdKey = `${currentUser.dong}_${currentUser.ho}`;
    const existingVote = targetVote.householdVotes[householdKey];

    // "동호수별로 최초 투표한것이 기준으로 중복 투표가 되지 않게 한다."
    if (existingVote) {
      return {
        success: false,
        message: `[중복 투표 차단] 이미 [${currentUser.dong} ${currentUser.ho}] 세대에서 ${existingVote.voterName}님이 투표를 완료하셨습니다. (동호수별 최초 1회 투표만 유효)`
      };
    }

    // Record the vote
    const newRecord = {
      votedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      voterPhone: currentUser.phone,
      voterName: currentUser.name,
      dong: currentUser.dong,
      ho: currentUser.ho,
      optionId
    };

    setVotes(prev => prev.map(v => {
      if (v.id !== voteId) return v;
      const updatedOptions = v.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
      return {
        ...v,
        options: updatedOptions,
        householdVotes: {
          ...v.householdVotes,
          [householdKey]: newRecord
        }
      };
    }));

    showToast(`[${currentUser.dong} ${currentUser.ho}] 세대 투표가 정상적으로 제출되었습니다.`);
    return { success: true, message: '투표가 완료되었습니다.' };
  };

  const canManageVotes = () => Boolean(currentUser && (isAdminRole(currentUser.role) || currentUser.role === 'election_comm'));

  const createVote = (voteData: Omit<VoteItem, 'id' | 'smsSentCount' | 'createdAt' | 'householdVotes'>) => {
    if (!canManageVotes()) {
      showToast('전자투표 개설은 선관위 및 관리자/운영자만 가능합니다.');
      return;
    }
    const newVote: VoteItem = {
      ...voteData,
      id: `vote-${Date.now()}`,
      smsSentCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      householdVotes: {}
    };
    setVotes(prev => [newVote, ...prev]);
    showToast('새로운 전자투표가 개설되었습니다.');
  };

  const closeVote = (voteId: string) => {
    if (!canManageVotes()) {
      showToast('투표 마감 처리는 선관위 및 관리자/운영자만 가능합니다.');
      return;
    }
    setVotes(prev => prev.map(v => v.id === voteId ? { ...v, status: 'closed' } : v));
    showToast('투표가 조기 마감되었습니다.');
  };

  const sendVoteGuideSms = (voteId: string) => {
    if (!canManageVotes()) {
      return { success: false, sentCount: 0, message: '투표 안내 문자 발송은 선관위 및 관리자/운영자만 가능합니다.' };
    }
    const vote = votes.find(v => v.id === voteId);
    if (!vote) return { success: false, sentCount: 0, message: '투표를 찾을 수 없습니다.' };

    const targetHouseholds = vote.targetAudience === 'owner_only' ? '등기 소유자 420세대' : '전체 520세대';
    const sentCount = vote.targetAudience === 'owner_only' ? 420 : 520;

    const newSms: SmsLog = {
      id: `sms-${Date.now()}`,
      targetGroup: `${vote.title} 대상 (${targetHouseholds})`,
      targetCount: sentCount,
      messageTitle: `[전자투표 안내] ${vote.title}`,
      messageContent: `[상떼빌라이프 관리사무소]\n전자투표가 진행 중입니다. (${vote.startDate} ~ ${vote.endDate})\n세대별(동호수) 최초 1회 투표가 인정되오니 앱에서 즉시 참여해 주십시오.\n투표: ${vote.title}`,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sentBy: currentUser?.name || '관리사무소',
      status: 'sent'
    };

    setSmsLogs(prev => [newSms, ...prev]);
    setVotes(prev => prev.map(v => v.id === voteId ? { ...v, smsSentCount: v.smsSentCount + sentCount } : v));

    showToast(`투표 안내 문자가 대상 세대(${sentCount}건)로 발송 완료되었습니다.`);
    return { success: true, sentCount, message: '문자 발송 완료' };
  };

  // Chat actions
  const sendChatMessage = (roomId: string, text: string, imageUrl?: string) => {
    if (!currentUser || (!text.trim() && !imageUrl)) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderNickname: currentUser.nickname,
      senderDongHo: `${currentUser.dong} ${currentUser.ho}`,
      senderRole: currentUser.role,
      text: text.trim(),
      imageUrl,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      readCount: 1
    };

    setChatMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg]
    }));

    setChatRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        lastMessage: text.trim() || '[사진]',
        lastMessageTime: newMsg.createdAt
      };
    }));
  };

  // Back Office Resident Approvals & Role Assignment
  const approveUser = (userId: string) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('입주민 가입 승인은 관리자 및 운영자만 가능합니다.');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        status: 'approved',
        approvedAt: new Date().toISOString().slice(0, 10)
      };
    }));
    showToast('입주민 가입 신청이 승인되었습니다. 승인 알림톡이 전송됩니다.');
  };

  const rejectUser = (userId: string) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('입주민 가입 반려는 관리자 및 운영자만 가능합니다.');
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
    showToast('입주민 가입 신청이 반려 처리되었습니다.');
  };

  // 동대표, 선관위, 자문위원은 관리자가 지정 해지
  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('직무등급 지정 및 해지는 관리자 및 운영자만 가능합니다.');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return { ...u, role: newRole };
    }));
    // Also update currentUser if it's currently selected
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
    const roleLabels: Record<UserRole, string> = {
      resident: '일반입주민',
      dong_rep: '동대표',
      election_comm: '선관위(선거관리위원)',
      advisory: '자문위원',
      manager: '관리자(관리소장)',
      operator: '운영자'
    };
    showToast(`해당 입주민 직무 등급이 [${roleLabels[newRole]}]으로 변경되었습니다.`);
  };

  const deleteUser = (userId: string) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('입주민 정보 삭제는 관리자 및 운영자만 가능합니다.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('해당 입주민 정보가 삭제(퇴거 처리)되었습니다.');
  };

  // Back Office SMS Broadcast
  const sendBulkSms = (params: { targetDong?: string; targetRole?: string; targetAudience: string; targetAge?: string; title: string; content: string }) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('대량 문자 발송은 관리자 및 운영자만 가능합니다.');
      return { success: false, sentCount: 0 };
    }
    let count = 520;
    let label = '전체 입주민 (520세대)';

    if (params.targetAudience === 'owner') {
      count = 420;
      label = '등기 소유자 (420세대)';
    } else if (params.targetAudience === 'tenant') {
      count = 100;
      label = '세입자 입주민 (100세대)';
    }

    if (params.targetDong && params.targetDong !== 'all') {
      count = Math.round(count / 6);
      label = `${params.targetDong} 입주민 (${count}세대)`;
    }

    if (params.targetAge && params.targetAge !== 'all') {
      count = Math.round(count * 0.3);
      label += ` [${params.targetAge}]`;
    }

    const newLog: SmsLog = {
      id: `sms-${Date.now()}`,
      targetGroup: label,
      targetCount: count,
      messageTitle: params.title,
      messageContent: params.content,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sentBy: currentUser?.name || '관리사무소',
      status: 'sent'
    };

    setSmsLogs(prev => [newLog, ...prev]);
    showToast(`문자 발송 완료: ${label} 총 ${count}건 즉시 전송되었습니다.`);
    return { success: true, sentCount: count };
  };

  // Facility Inspections & Repairs
  const addFacilityInspection = (facilityId: string, inspection: { inspector: string; result: '양호' | '요주의' | '불량'; notes: string; photos?: string[] }) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('시설 점검 기록 등록은 관리자 및 운영자만 가능합니다.');
      return;
    }
    const newInspection = {
      id: `ins-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      photos: inspection.photos || [],
      ...inspection
    };
    setFacilities(prev => prev.map(f => {
      if (f.id !== facilityId) return f;
      return {
        ...f,
        lastInspectionDate: newInspection.date,
        status: inspection.result === '불량' ? '수리필요' : inspection.result === '요주의' ? '요주의' : '양호',
        inspections: [newInspection, ...f.inspections]
      };
    }));
    showToast('시설물 점검 기록 및 현장 사진이 정상 등록되었습니다.');
  };

  const addFacilityRepair = (facilityId: string, repair: { vendor: string; cost: number; description: string; status: '완료' | '진행중' }) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      showToast('시설 수리 이력 등록은 관리자 및 운영자만 가능합니다.');
      return;
    }
    const newRepair = {
      id: `rep-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      ...repair
    };
    setFacilities(prev => prev.map(f => {
      if (f.id !== facilityId) return f;
      return {
        ...f,
        repairs: [newRepair, ...f.repairs]
      };
    }));
    showToast('시설물 수리/보수 이력이 등록되었습니다.');
  };

  // Parking & Visitor Vehicle Management + Monthly Quota Calculation
  const calculateVisitHours = (visit: Pick<VisitorVehicle, 'visitDate' | 'expectedEntryTime' | 'expectedExitTime' | 'entryTime' | 'exitTime' | 'status'>): number => {
    if (visit.status === 'cancelled') return 0;

    if (visit.status === 'completed' && visit.entryTime && visit.exitTime) {
      const start = new Date(visit.entryTime.replace(' ', 'T'));
      const end = new Date(visit.exitTime.replace(' ', 'T'));
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
        const hrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return Math.max(0.5, Math.round(hrs * 10) / 10);
      }
    }

    const [eh, em] = (visit.expectedEntryTime || '09:00').split(':').map(Number);
    const [xh, xm] = (visit.expectedExitTime || '18:00').split(':').map(Number);
    if (!Number.isNaN(eh) && !Number.isNaN(em) && !Number.isNaN(xh) && !Number.isNaN(xm)) {
      let startMin = eh * 60 + em;
      let endMin = xh * 60 + xm;
      if (endMin <= startMin) {
        endMin += 24 * 60; // overnight visit
      }
      const hrs = (endMin - startMin) / 60;
      return Math.max(0.5, Math.round(hrs * 10) / 10);
    }

    return 2;
  };

  const getHouseholdMonthlyParkingUsage = (dong: string, ho: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usedHoursRaw = visitorVehicles
      .filter(v => v.hostDong === dong && v.hostHo === ho && v.status !== 'cancelled' && v.visitDate.startsWith(currentMonth))
      .reduce((acc, v) => acc + calculateVisitHours(v), 0);
    const usedHours = Math.round(usedHoursRaw * 10) / 10;
    const remainingHours = Math.max(0, Math.round((monthlyParkingLimitHours - usedHours) * 10) / 10);
    return {
      usedHours,
      limitHours: monthlyParkingLimitHours,
      remainingHours,
      monthLabel: currentMonth
    };
  };

  const updateMonthlyParkingLimitHours = (hours: number) => {
    if (!currentUser || !isAdminRole(currentUser.role)) {
      return { success: false, message: '월 방문주차 할당시간 변경은 관리자 및 운영자만 가능합니다.' };
    }
    if (!Number.isFinite(hours) || hours < 1 || hours > 744) {
      return { success: false, message: '유효한 월 방문주차 시간(1~744시간)을 입력해 주세요.' };
    }
    const rounded = Math.round(hours);
    setMonthlyParkingLimitHours(rounded);
    showToast(`세대별 월 방문주차 할당시간이 ${rounded}시간으로 변경되었습니다.`);
    return { success: true, message: '월 방문주차 할당시간 변경 완료' };
  };

  const registerVisitorVehicle = (data: Omit<VisitorVehicle, 'id' | 'createdAt' | 'status'>) => {
    const cleanVehNum = data.vehicleNumber.trim().replace(/\s+/g, ' ');
    // Check if already active
    const exists = visitorVehicles.some(v => 
      v.vehicleNumber.replace(/\s+/g, '') === cleanVehNum.replace(/\s+/g, '') &&
      v.visitDate === data.visitDate &&
      (v.status === 'reserved' || v.status === 'parked')
    );
    if (exists) {
      return { success: false, message: `차량번호 [${cleanVehNum}]는 해당 방문일에 이미 예약 또는 입차되어 있습니다.` };
    }

    const requestedHours = calculateVisitHours({ ...data, status: 'reserved' });
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (data.visitDate.startsWith(currentMonth)) {
      const usage = getHouseholdMonthlyParkingUsage(data.hostDong, data.hostHo);
      if (requestedHours > usage.remainingHours) {
        return {
          success: false,
          message: `[월 방문주차 시간 초과] ${data.hostDong} ${data.hostHo}의 이번 달 남은 방문주차 시간은 ${usage.remainingHours}시간입니다. (요청: ${requestedHours}시간)`
        };
      }
    }

    const newVisitor: VisitorVehicle = {
      ...data,
      vehicleNumber: cleanVehNum,
      id: `vis-${Date.now()}`,
      status: 'reserved',
      allocatedFreeHours: requestedHours,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setVisitorVehicles(prev => [newVisitor, ...prev]);
    showToast(`방문차량 [${cleanVehNum}] 등록 완료 (${requestedHours}시간 예약 · LPR 정·후문 자동 통과)`);
    return { success: true, message: '방문차량 등록 완료' };
  };

  const cancelVisitorVehicle = (id: string) => {
    setVisitorVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'cancelled' } : v));
    showToast('방문차량 예약이 취소되어 월 방문주차 잔여 시간이 복구되었습니다.');
  };

  const updateVisitorStatus = (id: string, status: VisitorStatus, gate?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setVisitorVehicles(prev => prev.map(v => {
      if (v.id !== id) return v;
      if (status === 'parked') {
        return {
          ...v,
          status,
          entryTime: nowStr,
          parkingGate: gate || v.parkingGate
        };
      }
      if (status === 'completed') {
        return {
          ...v,
          status,
          exitTime: nowStr
        };
      }
      return { ...v, status };
    }));
    showToast(`방문차량 상태가 [${status === 'parked' ? '입차완료' : status === 'completed' ? '출차완료' : '예약'}](으)로 업데이트되었습니다.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentDeviceId,
        setDeviceUuid,
        users,
        loginWithPhone,
        logout,
        registerUser,
        switchUserDemo,
        resetDeviceForUser,
        showIntroSplash,
        dismissIntroSplash,
        mandatoryNoticeToDisplay,
        dismissMandatoryNotice,
        currentView,
        setCurrentView,
        selectedBoardCategory,
        setSelectedBoardCategory,
        posts,
        addPost,
        toggleLikePost,
        addPostComment,
        toggleHidePost,
        replyToComplaint,
        archives,
        addArchiveDocument,
        incrementDownload,
        votes,
        castVote,
        createVote,
        closeVote,
        sendVoteGuideSms,
        chatRooms,
        chatMessages,
        activeChatRoomId,
        setActiveChatRoomId,
        sendChatMessage,
        approveUser,
        rejectUser,
        updateUserRole,
        deleteUser,
        smsLogs,
        sendBulkSms,
        facilities,
        addFacilityInspection,
        addFacilityRepair,
        visitorVehicles,
        monthlyParkingLimitHours,
        updateMonthlyParkingLimitHours,
        calculateVisitHours,
        getHouseholdMonthlyParkingUsage,
        registerVisitorVehicle,
        cancelVisitorVehicle,
        updateVisitorStatus,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
