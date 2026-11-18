export type UserRole = 
  | 'resident'      // 일반입주민
  | 'dong_rep'      // 동대표
  | 'election_comm' // 선관위 (선거관리위원회)
  | 'advisory'      // 자문위원
  | 'manager'       // 관리자 (관리사무소장/직원)
  | 'operator';     // 운영자 (시스템 총괄운영자)

export type ResidentType = 'owner' | 'tenant'; // 소유자 vs 세입자/입주민

export type UserStatus = 'approved' | 'pending' | 'rejected' | 'suspended';

export interface ResidentUser {
  id: string;
  phone: string;            // 로그인 키 (예: 010-1234-5678)
  name: string;             // 실명
  nickname: string;         // 닉네임
  dong: string;             // 예: 101동
  ho: string;               // 예: 1204호
  role: UserRole;
  residentType: ResidentType;
  status: UserStatus;
  deviceId: string;         // 등록된 핸드폰 기기 고유 ID
  registeredAt: string;
  approvedAt?: string;
  ageGroup: '20대' | '30대' | '40대' | '50대' | '60대 이상';
  avatar?: string;
}

export type BoardCategory = 
  | 'notice'        // 공지
  | 'free'          // 자유게시판
  | 'complaint'     // 민원
  | 'suggestion'    // 건의
  | 'rep_meeting'   // 입대의 (입주자대표회의)
  | 'election_board'// 선관위 (선거관리위원회)
  | 'advisory_board'// 자문위원
  | 'debate';       // 토론방

export type ComplaintStatus = 'pending' | 'in_progress' | 'completed';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorDongHo: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  category: BoardCategory;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorNickname: string;
  authorDongHo: string;
  authorRole: UserRole;
  createdAt: string;
  views: number;
  likes: number;
  likedUserIds: string[];
  comments: PostComment[];
  isHidden: boolean;        // 백오피스 게시글 숨김 처리 기능
  isPinned?: boolean;       // 상단 고정
  isMandatory?: boolean;    // App 시작 시 필수 공지사항 팝업 대상
  complaintStatus?: ComplaintStatus;
  officialReply?: {
    replierName: string;
    replierRole: string;
    replyContent: string;
    repliedAt: string;
  };
}

export interface ArchiveDocument {
  id: string;
  category: '관리규약' | '공사계약서' | '용역계약서' | '장기수선/도면' | '회의록/회계';
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  downloadsCount: number;
  securityLevel: '전체공개' | '입주민전용' | '입대의/관리자전용';
}

export type VoteType = 'agree_disagree' | 'multiple_choice';
export type VoteTargetAudience = 'all' | 'owner_only'; // 전체 입주민 vs 소유자 전용

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface VoteRecord {
  votedAt: string;
  voterPhone: string;
  voterName: string;
  dong: string;
  ho: string;
  optionId: string;
}

export interface VoteItem {
  id: string;
  title: string;
  description: string;
  targetAudience: VoteTargetAudience;
  voteType: VoteType;
  options: VoteOption[];
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
  totalEligibleHouseholds: number; // 대상 세대수 (예: 500)
  // 세대별 최초 투표 기록: Key는 `${dong}_${ho}`
  householdVotes: Record<string, VoteRecord>;
  smsSentCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderNickname: string;
  senderDongHo: string;
  senderRole: UserRole;
  text: string;
  imageUrl?: string;
  createdAt: string;
  readCount: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'official'; // 1:1, 단체방, 관리소상담
  targetDong?: string; // 특정 동 전용
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participantCount: number;
  participants: string[]; // user phone or ids
  avatar?: string;
}

export interface SmsLog {
  id: string;
  targetGroup: string;      // 예: 전체 입주민, 101동 입주민, 소유자 전체 등
  targetCount: number;
  messageTitle: string;
  messageContent: string;
  sentAt: string;
  sentBy: string;
  status: 'sent' | 'scheduled';
}

export interface FacilityItem {
  id: string;
  category: '전기/수변전' | '승강기' | '급수/펌프' | '소방설비' | '주차/보안' | '건축/조경';
  name: string;             // 예: 수변전설비 메인 변압기 #1
  location: string;         // 예: 지하 2층 전기실
  installDate: string;
  lastInspectionDate: string;
  nextInspectionDate: string;
  status: '양호' | '요주의' | '수리필요';
  managerContact: string;
  inspections: Array<{
    id: string;
    date: string;
    inspector: string;
    result: '양호' | '요주의' | '불량';
    notes: string;
    photos?: string[]; // 현장 점검 사진 (카메라 촬영 / 첨부)
  }>;
  repairs: Array<{
    id: string;
    date: string;
    vendor: string;
    cost: number;
    description: string;
    status: '완료' | '진행중';
  }>;
}

export type VisitorStatus = 'reserved' | 'parked' | 'completed' | 'cancelled';

export interface VisitorVehicle {
  id: string;
  vehicleNumber: string;       // 차량번호 (예: 12가 3456)
  visitorName: string;         // 방문자 성명
  visitorPhone: string;        // 방문자 연락처
  hostUserId: string;          // 신청 입주민 ID
  hostDong: string;            // 입주민 동 (예: 101동)
  hostHo: string;              // 입주민 호 (예: 1204호)
  hostName: string;            // 입주민 성명
  visitPurpose: string;        // 방문 목적 (친인척, 택배, 공사 등)
  visitDate: string;           // 방문 예정일
  expectedEntryTime: string;   // 입차 예정 시간
  expectedExitTime: string;    // 출차 예정 시간
  status: VisitorStatus;       // 'reserved' (예약접수) | 'parked' (입차중) | 'completed' (출차완료) | 'cancelled' (취소)
  entryTime?: string;          // 실제 입차 일시
  exitTime?: string;           // 실제 출차 일시
  parkingGate: string;         // 출입 게이트 (예: 정문 차단기, 후문 차단기)
  allocatedFreeHours: number;  // 부여된 무료주차 시간 (예: 24시간)
  memo?: string;               // 비고/특이사항
  createdAt: string;
}
