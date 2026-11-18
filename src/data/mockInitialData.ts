import type { 
  ResidentUser, 
  Post, 
  ArchiveDocument, 
  VoteItem, 
  ChatRoom, 
  ChatMessage, 
  SmsLog, 
  FacilityItem,
  VisitorVehicle 
} from '../types/index.ts';

export const INITIAL_USERS: ResidentUser[] = [
  {
    id: 'user-manager',
    phone: '010-1111-2222',
    name: '이관리',
    nickname: '관리사무소장',
    dong: '관리동',
    ho: '101호',
    role: 'manager',
    residentType: 'owner',
    status: 'approved',
    deviceId: 'DEV-PHONE-MGR',
    registeredAt: '2025-01-01',
    approvedAt: '2025-01-01',
    ageGroup: '50대',
  },
  {
    id: 'user-operator',
    phone: '010-9999-8888',
    name: '박운영',
    nickname: '시스템운영자',
    dong: '101동',
    ho: '1001호',
    role: 'operator',
    residentType: 'owner',
    status: 'approved',
    deviceId: 'DEV-PHONE-ADMIN',
    registeredAt: '2025-01-02',
    approvedAt: '2025-01-02',
    ageGroup: '40대',
  },
  {
    id: 'user-dongrep',
    phone: '010-3333-4444',
    name: '최대표',
    nickname: '101동대표',
    dong: '101동',
    ho: '502호',
    role: 'dong_rep',
    residentType: 'owner',
    status: 'approved',
    deviceId: 'DEV-PHONE-REP',
    registeredAt: '2025-01-10',
    approvedAt: '2025-01-11',
    ageGroup: '50대',
  },
  {
    id: 'user-election',
    phone: '010-5555-6666',
    name: '정선관',
    nickname: '선관위원장',
    dong: '102동',
    ho: '1103호',
    role: 'election_comm',
    residentType: 'owner',
    status: 'approved',
    deviceId: 'DEV-PHONE-ELEC',
    registeredAt: '2025-01-15',
    approvedAt: '2025-01-16',
    ageGroup: '60대 이상',
  },
  {
    id: 'user-advisory',
    phone: '010-7777-8888',
    name: '강자문',
    nickname: '자문위원(변호사)',
    dong: '103동',
    ho: '704호',
    role: 'advisory',
    residentType: 'owner',
    status: 'approved',
    deviceId: 'DEV-PHONE-ADVIS',
    registeredAt: '2025-01-20',
    approvedAt: '2025-01-21',
    ageGroup: '40대',
  },
  {
    id: 'user-demo-resident',
    phone: '010-1234-5678',
    name: '김철수',
    nickname: '햇살1204',
    dong: '101동',
    ho: '1204호',
    role: 'resident',
    residentType: 'owner',
    status: 'approved',
    deviceId: 'DEV-PHONE-DEMO',
    registeredAt: '2025-02-01',
    approvedAt: '2025-02-02',
    ageGroup: '30대',
  },
  {
    id: 'user-tenant',
    phone: '010-2345-6789',
    name: '이영희',
    nickname: '초록숲801',
    dong: '104동',
    ho: '801호',
    role: 'resident',
    residentType: 'tenant',
    status: 'approved',
    deviceId: 'DEV-PHONE-TENANT',
    registeredAt: '2025-02-10',
    approvedAt: '2025-02-11',
    ageGroup: '20대',
  },
  {
    id: 'user-pending',
    phone: '010-8765-4321',
    name: '장신규',
    nickname: '새이웃302',
    dong: '105동',
    ho: '302호',
    role: 'resident',
    residentType: 'tenant',
    status: 'pending',
    deviceId: 'DEV-PHONE-PENDING',
    registeredAt: '2026-11-08',
    ageGroup: '30대',
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    category: 'notice',
    title: '[필수공지] 2026년도 공동주택 관리규약 개정안 공람 및 모바일 전자투표 일정 안내',
    content: `입주민 여러분의 안녕과 행복을 기원합니다.

공동주택관리법 시행령 개정에 따른 단지 관리규약 개정안을 다음과 같이 공람하오니 확인 후 모바일 전자투표에 적극 참여하여 주시기 바랍니다.

1. 주요 개정 안건:
 - 층간소음 관리위원회 설치 및 분쟁 조정 절차 신설
 - 단지 내 지하주차장 전기차 충전구역 안전관리 기준 강화
 - 동별 대표자 및 임원 선출 시 모바일 전자투표 도입 명문화

2. 전자투표 기간: 2026. 11. 10(화) 09:00 ~ 2026. 11. 16(월) 18:00
3. 투표 대상: 단지 등기 소유자 (동호수별 1세대 1표 최초 투표 기준)`,
    authorId: 'user-manager',
    authorName: '이관리',
    authorNickname: '관리사무소장',
    authorDongHo: '관리동 101호',
    authorRole: 'manager',
    createdAt: '2026-11-08 09:30',
    views: 482,
    likes: 42,
    likedUserIds: [],
    isHidden: false,
    isPinned: true,
    isMandatory: true, // App 시작 시 필수 공지 모달
    comments: [
      {
        id: 'c-1',
        authorId: 'user-dongrep',
        authorName: '최대표',
        authorDongHo: '101동 502호',
        authorRole: 'dong_rep',
        content: '101동 주민 여러분, 이번 규약 개정은 우리 단지의 쾌적한 주거환경을 위한 중요한 안건입니다. 투표에 꼭 참여 부탁드립니다.',
        createdAt: '2026-11-08 10:15'
      }
    ]
  },
  {
    id: 'post-2',
    category: 'notice',
    title: '[공지] 101동~106동 승강기 정기 안전검사 및 지하주차장 바닥 세척 작업 일정',
    content: `한국승강기안전공단 주관 승강기 정기 정밀검사를 실시합니다.
검사 시간 중에는 1개 호기씩 순차 정지되오니 양해 바랍니다.
또한 지하 1~2층 주차장 바닥 물청소 기간 동안 차량 이동 주차에 협조해 주시기 바랍니다.`,
    authorId: 'user-manager',
    authorName: '이관리',
    authorNickname: '관리사무소장',
    authorDongHo: '관리동 101호',
    authorRole: 'manager',
    createdAt: '2026-11-07 14:00',
    views: 310,
    likes: 18,
    likedUserIds: [],
    isHidden: false,
    isPinned: true,
    comments: []
  },
  {
    id: 'post-3',
    category: 'free',
    title: '단지 내 작은도서관 주말 나눔 도서 기증해주신 분들 감사드립니다!',
    content: `지난 주말 단지 커뮤니티센터 작은도서관에 아이들 동화책과 베스트셀러 50여 권을 기증해 주신 103동 이웃님께 진심으로 감사드립니다. 주민 여러분 모두 따뜻한 주말 보내세요 :)`,
    authorId: 'user-demo-resident',
    authorName: '김철수',
    authorNickname: '햇살1204',
    authorDongHo: '101동 1204호',
    authorRole: 'resident',
    createdAt: '2026-11-06 17:20',
    views: 189,
    likes: 27,
    likedUserIds: [],
    isHidden: false,
    comments: [
      {
        id: 'c-2',
        authorId: 'user-tenant',
        authorName: '이영희',
        authorDongHo: '104동 801호',
        authorRole: 'resident',
        content: '아이와 함께 자주 이용하는데 너무 유익하고 좋네요!',
        createdAt: '2026-11-06 18:05'
      }
    ]
  },
  {
    id: 'post-4',
    category: 'complaint',
    title: '[민원] 지하 1층 102동 출입구 앞 장애인 주차구역 침범 차량 단속 요청',
    content: `지하 1층 102동 앞 장애인 전용주차구역에 식별표지가 없는 일반 차량이 상습적으로 주차되고 있습니다.
거동이 불편하신 어르신과 휠체어 이용 주민들을 위해 관리사무소의 신속한 스티커 부착 및 계도 조치를 부탁드립니다.`,
    authorId: 'user-demo-resident',
    authorName: '김철수',
    authorNickname: '햇살1204',
    authorDongHo: '101동 1204호',
    authorRole: 'resident',
    createdAt: '2026-11-07 11:20',
    views: 145,
    likes: 12,
    likedUserIds: [],
    isHidden: false,
    complaintStatus: 'completed',
    officialReply: {
      replierName: '이관리',
      replierRole: '관리사무소장',
      replyContent: '접수 확인 즉시 경비반장이 현장 출동하여 해당 차주(외부 방문차량)에게 즉시 이동 조치 및 불법주차 경고장을 부착하였습니다. 앞으로 매일 야간 순찰 시 집중 단속하겠습니다.',
      repliedAt: '2026-11-07 13:40'
    },
    comments: []
  },
  {
    id: 'post-5',
    category: 'complaint',
    title: '[민원] 101동 12층 복도 비상구 앞 센서등 점등 불량',
    content: `101동 12층 복도 끝 비상계단 출입구 쪽 센서등이 사람이 지나가도 켜지지 않거나 깜빡거립니다. 야간 통행 시 안전사고 위험이 있으니 교체 점검 부탁드립니다.`,
    authorId: 'user-demo-resident',
    authorName: '김철수',
    authorNickname: '햇살1204',
    authorDongHo: '101동 1204호',
    authorRole: 'resident',
    createdAt: '2026-11-08 08:40',
    views: 78,
    likes: 4,
    likedUserIds: [],
    isHidden: false,
    complaintStatus: 'in_progress',
    officialReply: {
      replierName: '이관리',
      replierRole: '관리사무소장',
      replyContent: '시설관리 주임이 센서 모듈 고장을 확인하였으며, 금일 오후 2시 호환 부품 입고 즉시 LED 일체형 센서등으로 교체 작업 완료 예정입니다.',
      repliedAt: '2026-11-08 10:00'
    },
    comments: []
  },
  {
    id: 'post-6',
    category: 'suggestion',
    title: '[건의] 단지 지하 2층 전기차 충전기 화재 예방 질식소화포 및 전용 소화기 비치 제안',
    content: `최근 지하주차장 전기차 배터리 화재 이슈가 많은데, 우리 단지 충전구역 바로 옆에 리튬이온 특화 전용 소화기와 질식소화포 보관함을 비치해주시면 주민들의 불안감이 크게 해소될 것 같습니다.`,
    authorId: 'user-tenant',
    authorName: '이영희',
    authorNickname: '초록숲801',
    authorDongHo: '104동 801호',
    authorRole: 'resident',
    createdAt: '2026-11-05 15:30',
    views: 260,
    likes: 38,
    likedUserIds: [],
    isHidden: false,
    comments: []
  },
  {
    id: 'post-7',
    category: 'rep_meeting',
    title: '[입대의] 제48차 입주자대표회의 정기회의 결과 공고 (2026년 시설수선 계획 심의)',
    content: `입주자대표회의 정기회의가 2026년 11월 4일 관리사무소 회의실에서 개최되었습니다.
- 심의안건 1: 옥상 방수 및 외벽 재도색 공사 발주 승인의 건 (원안 가결)
- 심의안건 2: 2026년도 경비·미화 용역 수수료 정산 및 재계약 조건 심의 (조건부 가결)
- 심의안건 3: 모바일 전자투표 시스템 전면 도입의 건 (원안 가결)`,
    authorId: 'user-dongrep',
    authorName: '최대표',
    authorNickname: '101동대표',
    authorDongHo: '101동 502호',
    authorRole: 'dong_rep',
    createdAt: '2026-11-05 10:00',
    views: 312,
    likes: 29,
    likedUserIds: [],
    isHidden: false,
    comments: []
  },
  {
    id: 'post-10',
    category: 'election_board',
    title: '[선관위] 제8기 입주자대표회의 동별 대표자 보궐선거 및 전자투표 공정관리 공고',
    content: `동작상떼빌 아파트 선거관리위원회에서 공고합니다.
1. 투표 공정관리 원칙: 모든 전자투표는 동·호수별 세대당 최초 1회 투표만을 유효표로 인정하며 중복 투표를 원천 차단합니다.
2. 현재 진행 중인 외벽·방수공사 및 커뮤니티 연장 운영 전자투표에 입주민 여러분의 소중한 한 표를 행사해 주시기 바랍니다.
3. 투표 관련 이의신청 및 참관 문의는 선관위 게시판을 이용해 주시기 바랍니다.`,
    authorId: 'user-election',
    authorName: '정선관',
    authorNickname: '선관위원장',
    authorDongHo: '102동 1103호',
    authorRole: 'election_comm',
    createdAt: '2026-11-06 11:30',
    views: 215,
    likes: 24,
    likedUserIds: [],
    isHidden: false,
    comments: []
  },
  {
    id: 'post-11',
    category: 'complaint',
    title: '[민원] 104동 세대 앞 복도 적치물(유모차·자전거) 정리 계도 요청',
    content: `104동 8층 엘리베이터 홀 앞 공용 복도에 개인 적치물이 놓여 있어 화재 대피 통로 확보가 우려됩니다. 해당 세대에 안내문 부착 부탁드립니다.`,
    authorId: 'user-tenant',
    authorName: '이영희',
    authorNickname: '초록숲801',
    authorDongHo: '104동 801호',
    authorRole: 'resident',
    createdAt: '2026-11-09 09:45',
    views: 54,
    likes: 3,
    likedUserIds: [],
    isHidden: false,
    complaintStatus: 'pending',
    comments: []
  },
  {
    id: 'post-8',
    category: 'advisory_board',
    title: '[자문위원] 공동주택 공사계약 및 장기수선충당금 집행 절차에 관한 법률 검토 보고서',
    content: `단지 외벽 보수 및 방수 공사 발주 시 국토교통부 고시 '주택관리업자 및 사업자 선정지침' 준수 여부와 입찰 담합 방지를 위한 계약특수조건 조항에 대한 법률 자문 검토 의견서 전문을 공유합니다.`,
    authorId: 'user-advisory',
    authorName: '강자문',
    authorNickname: '자문위원(변호사)',
    authorDongHo: '103동 704호',
    authorRole: 'advisory',
    createdAt: '2026-11-04 14:20',
    views: 180,
    likes: 22,
    likedUserIds: [],
    isHidden: false,
    comments: []
  },
  {
    id: 'post-9',
    category: 'debate',
    title: '[토론방] 단지 내 무인 택배함 중앙 집중 설치 vs 각 동 현관별 분산 배치',
    content: `현재 택배 기사님들의 배송 편의와 주민들의 이동 동선, 그리고 설치 및 유지보수 비용을 고려할 때 중앙광장 통합 택배함과 동별 1층 분산 배치 중 어떤 방식이 더 효율적일지 다양한 의견을 들려주세요.`,
    authorId: 'user-dongrep',
    authorName: '최대표',
    authorNickname: '101동대표',
    authorDongHo: '101동 502호',
    authorRole: 'dong_rep',
    createdAt: '2026-11-06 09:10',
    views: 420,
    likes: 31,
    likedUserIds: [],
    isHidden: false,
    comments: []
  }
];

export const INITIAL_ARCHIVES: ArchiveDocument[] = [
  {
    id: 'doc-1',
    category: '관리규약',
    title: '2026년도 제8차 개정 아파트 관리규약 표준안 전문',
    description: '공동주택관리법 제18조에 따른 단지 제반 운영 규칙, 입대의 및 선관위 운영규정, 층간소음 관리위원회 운영세칙 포함',
    fileName: '2026_Apartment_Bylaws_Final.pdf',
    fileSize: '4.2 MB',
    uploadedAt: '2026-11-01',
    downloadsCount: 142,
    securityLevel: '전체공개'
  },
  {
    id: 'doc-2',
    category: '공사계약서',
    title: '단지 외벽 균열보수 및 친환경 실리콘 페인트 재도색 공사 표준 도급계약서',
    description: '공사 범위, 품질보증기간 5년 하자보수보증금율 10%, 지체상금율 등 특수계약조건 명시',
    fileName: 'Exterior_Repaint_Contract_2026.pdf',
    fileSize: '8.5 MB',
    uploadedAt: '2026-10-25',
    downloadsCount: 96,
    securityLevel: '입주민전용'
  },
  {
    id: 'doc-3',
    category: '용역계약서',
    title: '승강기 1~12호기 종합유지관리(FM) 위탁용역 계약서 및 정기점검표',
    description: '현대엘리베이터 종합보증(FM) 계약, 24시간 원격고장감시 및 긴급출동 30분 이내 보장 조건',
    fileName: 'Elevator_FM_Contract_Hyundai.pdf',
    fileSize: '3.1 MB',
    uploadedAt: '2026-09-15',
    downloadsCount: 78,
    securityLevel: '입주민전용'
  },
  {
    id: 'doc-4',
    category: '장기수선/도면',
    title: '2026~2030년도 장기수선계획 조정안 및 수선충당금 적립 적정성 검토서',
    description: '건축, 기계, 전기설비 대수선 주기 및 공종별 예상 소요 예산 산출 총괄 내역서',
    fileName: 'LongTerm_Maintenance_Plan_2026_2030.pdf',
    fileSize: '12.4 MB',
    uploadedAt: '2026-10-10',
    downloadsCount: 115,
    securityLevel: '입주민전용'
  },
  {
    id: 'doc-5',
    category: '회의록/회계',
    title: '2025 회계연도 관리비 부과·징수·집행 결산 회계감사 보고서',
    description: '외부 공인회계사 감사보고서, 관리비 계정별 세부 지출 증빙 및 장기수선충당금 예치금 잔액 증명서',
    fileName: '2025_Annual_Financial_Audit_Report.pdf',
    fileSize: '5.8 MB',
    uploadedAt: '2026-03-20',
    downloadsCount: 204,
    securityLevel: '전체공개'
  }
];

export const INITIAL_VOTES: VoteItem[] = [
  {
    id: 'vote-1',
    title: '2026년도 단지 외벽 균열보수 및 옥상 친환경 우레탄 방수공사 승인의 건',
    description: '준공 7년차를 맞아 외벽 미세균열 및 옥상 방수층 마모에 대한 보수 공사를 장기수선충당금(1억 8천만원)으로 집행하는 안건입니다. 공동주택관리법령에 따라 소유자 과반수 찬성 동의가 필수적입니다.',
    targetAudience: 'owner_only', // 소유자 대상
    voteType: 'agree_disagree',  // 찬반투표
    options: [
      { id: 'opt-agree', text: '찬성 (공사 진행 동의)', votes: 184 },
      { id: 'opt-disagree', text: '반대 (공사 보류 또는 재검토)', votes: 23 },
      { id: 'opt-abstain', text: '기권', votes: 9 }
    ],
    startDate: '2026-11-05',
    endDate: '2026-11-20',
    status: 'active',
    totalEligibleHouseholds: 520,
    smsSentCount: 520,
    createdAt: '2026-11-05',
    householdVotes: {
      '101동_502호': {
        votedAt: '2026-11-05 10:30',
        voterPhone: '010-3333-4444',
        voterName: '최대표',
        dong: '101동',
        ho: '502호',
        optionId: 'opt-agree'
      },
      '102동_1103호': {
        votedAt: '2026-11-05 11:20',
        voterPhone: '010-5555-6666',
        voterName: '정선관',
        dong: '102동',
        ho: '1103호',
        optionId: 'opt-agree'
      },
      '103동_704호': {
        votedAt: '2026-11-06 14:15',
        voterPhone: '010-7777-8888',
        voterName: '강자문',
        dong: '103동',
        ho: '704호',
        optionId: 'opt-agree'
      }
    }
  },
  {
    id: 'vote-2',
    title: '단지 커뮤니티센터(피트니스·골프·사우나) 주말 및 공휴일 연장 운영안 선호도 조사',
    description: '입주민 여러분의 라이프스타일 편의 증진을 위해 커뮤니티센터 주말 마감시간 연장 및 신규 GX(요가/필라테스) 프로그램 도입 방안을 투표합니다. (소유자 및 세입자 전 세대 참여 가능)',
    targetAudience: 'all', // 입주민 전체
    voteType: 'multiple_choice', // 선택형
    options: [
      { id: 'opt-1', text: '1안: 주말 마감시간 22시까지 연장 + 월 이용료 5,000원 인상', votes: 142 },
      { id: 'opt-2', text: '2안: 현행 20시 마감 유지 + 주말 무인 키오스크 자율 입장', votes: 98 },
      { id: 'opt-3', text: '3안: 일요일 휴무를 월요일 정기휴무로 전환', votes: 45 },
      { id: 'opt-4', text: '4안: 현행 체제 유지 (변동 없음)', votes: 20 }
    ],
    startDate: '2026-11-07',
    endDate: '2026-11-25',
    status: 'active',
    totalEligibleHouseholds: 520,
    smsSentCount: 520,
    createdAt: '2026-11-07',
    householdVotes: {
      '101동_502호': {
        votedAt: '2026-11-07 15:40',
        voterPhone: '010-3333-4444',
        voterName: '최대표',
        dong: '101동',
        ho: '502호',
        optionId: 'opt-1'
      }
    }
  }
];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-101dong',
    name: '101동 입주민 소통방',
    type: 'group',
    targetDong: '101동',
    lastMessage: '101동 이웃님들, 오늘 오후 승강기 점검 양해 부탁드립니다.',
    lastMessageTime: '10:45',
    unreadCount: 0,
    participantCount: 84,
    participants: ['user-manager', 'user-dongrep', 'user-demo-resident']
  },
  {
    id: 'room-official-mgt',
    name: '관리사무소 1:1 실시간 상담톡',
    type: 'official',
    lastMessage: '네 입주민님, 문의주신 차량 등록 서류 접수되었습니다.',
    lastMessageTime: '09:12',
    unreadCount: 0,
    participantCount: 2,
    participants: ['user-manager', 'user-demo-resident']
  },
  {
    id: 'room-market',
    name: '상떼빌 나눔 & 중고장터',
    type: 'group',
    lastMessage: '아동용 자전거 무료 나눔합니다. 104동 앞이에요.',
    lastMessageTime: '어제',
    unreadCount: 2,
    participantCount: 165,
    participants: ['user-demo-resident', 'user-tenant']
  },
  {
    id: 'room-council',
    name: '입주자대표회의 & 자문위원 협의방',
    type: 'group',
    lastMessage: '법률 검토의견서 자료실에 업로드 완료했습니다.',
    lastMessageTime: '11/04',
    unreadCount: 0,
    participantCount: 12,
    participants: ['user-manager', 'user-dongrep', 'user-advisory', 'user-election']
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'room-101dong': [
    {
      id: 'm-1',
      roomId: 'room-101dong',
      senderId: 'user-dongrep',
      senderName: '최대표',
      senderNickname: '101동대표',
      senderDongHo: '101동 502호',
      senderRole: 'dong_rep',
      text: '안녕하세요 101동 주민 여러분! 이번 관리규약 개정 전자투표가 진행 중입니다. 많은 참여 부탁드립니다.',
      createdAt: '어제 19:20',
      readCount: 68
    },
    {
      id: 'm-2',
      roomId: 'room-101dong',
      senderId: 'user-demo-resident',
      senderName: '김철수',
      senderNickname: '햇살1204',
      senderDongHo: '101동 1204호',
      senderRole: 'resident',
      text: '대표님 고생 많으십니다! 저희 세대도 방금 앱으로 투표 완료했습니다^^',
      createdAt: '어제 19:25',
      readCount: 54
    },
    {
      id: 'm-3',
      roomId: 'room-101dong',
      senderId: 'user-manager',
      senderName: '이관리',
      senderNickname: '관리사무소장',
      senderDongHo: '관리동 101호',
      senderRole: 'manager',
      text: '101동 이웃님들, 오늘 오후 승강기 정기검사로 일시 순차 정지가 있으니 이용에 참고해 주십시오.',
      createdAt: '10:45',
      readCount: 42
    }
  ],
  'room-official-mgt': [
    {
      id: 'om-1',
      roomId: 'room-official-mgt',
      senderId: 'user-demo-resident',
      senderName: '김철수',
      senderNickname: '햇살1204',
      senderDongHo: '101동 1204호',
      senderRole: 'resident',
      text: '소장님 안녕하세요! 지난번 신규 전기차 입주민 차량등록 신청건 확인 부탁드립니다.',
      createdAt: '09:05',
      readCount: 1
    },
    {
      id: 'om-2',
      roomId: 'room-official-mgt',
      senderId: 'user-manager',
      senderName: '이관리',
      senderNickname: '관리사무소장',
      senderDongHo: '관리동 101호',
      senderRole: 'manager',
      text: '네 입주민님, 문의주신 차량 등록 서류 접수되어 주차차단기 자동 통과 등록 완료되었습니다.',
      createdAt: '09:12',
      readCount: 1
    }
  ],
  'room-market': [
    {
      id: 'mk-1',
      roomId: 'room-market',
      senderId: 'user-tenant',
      senderName: '이영희',
      senderNickname: '초록숲801',
      senderDongHo: '104동 801호',
      senderRole: 'resident',
      text: '아동용 4발 자전거(16인치) 상태 깨끗한데 필요하신 이웃분께 무료 나눔합니다. 104동 1층 로비로 오시면 됩니다.',
      createdAt: '어제 16:30',
      readCount: 120
    }
  ],
  'room-council': [
    {
      id: 'rc-1',
      roomId: 'room-council',
      senderId: 'user-advisory',
      senderName: '강자문',
      senderNickname: '자문위원(변호사)',
      senderDongHo: '103동 704호',
      senderRole: 'advisory',
      text: '방수공사 입찰 공고안 검토 완료하여 자료실에 보고서 업로드 완료했습니다.',
      createdAt: '11/04 15:00',
      readCount: 8
    }
  ]
};

export const INITIAL_SMS_LOGS: SmsLog[] = [
  {
    id: 'sms-1',
    targetGroup: '등기 소유자 전체 (101동~106동)',
    targetCount: 420,
    messageTitle: '[상떼빌라이프] 2026 단지 외벽 및 옥상방수공사 전자투표 안내',
    messageContent: `[상떼빌라이프 입주자대표회의]
2026년도 장기수선계획 외벽보수 및 방수공사 승인 전자투표가 진행 중입니다.
동호수별 1세대 1표 모바일 투표에 적극 참여해 주시기 바랍니다.
투표링크: https://apt-santeville.kr/vote/1`,
    sentAt: '2026-11-05 10:00',
    sentBy: '관리사무소장 (이관리)',
    status: 'sent'
  },
  {
    id: 'sms-2',
    targetGroup: '101동 전체 입주민',
    targetCount: 96,
    messageTitle: '[안내] 101동 승강기 정기검사 안내',
    messageContent: `[관리사무소] 금일 14:00~16:00 101동 승강기 정밀안전검사로 호기별 20분간 운행이 일시 정지됩니다. 계단 이용 등 양해 바랍니다.`,
    sentAt: '2026-11-07 09:30',
    sentBy: '관리사무소장 (이관리)',
    status: 'sent'
  }
];

export const INITIAL_FACILITIES: FacilityItem[] = [
  {
    id: 'fac-1',
    category: '전기/수변전',
    name: '특고압 메인 유입변압기 TR-1 (22.9kV / 1,500kVA)',
    location: '지하 2층 중앙 전기실',
    installDate: '2019-03-15',
    lastInspectionDate: '2026-10-15',
    nextInspectionDate: '2026-11-15',
    status: '양호',
    managerContact: '한국전기안전공사 / 전기주임 (031-700-1122)',
    inspections: [
      {
        id: 'ins-1',
        date: '2026-10-15',
        inspector: '김전기 (선임전기안전관리자)',
        result: '양호',
        notes: '절연유 온도(45℃) 및 유면계 정상, 열화상 측정 시 접속부 이상 발열 없음.',
        photos: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        id: 'ins-2',
        date: '2026-09-15',
        inspector: '김전기 (선임전기안전관리자)',
        result: '양호',
        notes: '누설전류 측정치 기준치(1mA) 이하 양호 판정.'
      }
    ],
    repairs: [
      {
        id: 'rep-1',
        date: '2025-04-10',
        vendor: '한전전기공사',
        cost: 1200000,
        description: '고압 VCB 진공차단기 보조 계전기 접점 세척 및 교체',
        status: '완료'
      }
    ]
  },
  {
    id: 'fac-2',
    category: '승강기',
    name: '101동 승강기 1호기 (15인승 고속 105m/min)',
    location: '101동 옥상 기계실',
    installDate: '2019-03-15',
    lastInspectionDate: '2026-10-20',
    nextInspectionDate: '2026-11-20',
    status: '양호',
    managerContact: '현대엘리베이터 긴급상황실 (1577-0603)',
    inspections: [
      {
        id: 'ins-3',
        date: '2026-10-20',
        inspector: '최점검 (한국승강기안전공단 검사원)',
        result: '양호',
        notes: '주로프 마모율 1.2%로 안전 기준치(10%) 이하, 도어인터록 스위치 정상 작동.'
      }
    ],
    repairs: [
      {
        id: 'rep-2',
        date: '2026-08-12',
        vendor: '현대엘리베이터 유지보수팀',
        cost: 650000,
        description: '카 도어 행거 롤러 마모품 일체 신품 교체 및 윤활 주유',
        status: '완료'
      }
    ]
  },
  {
    id: 'fac-3',
    category: '급수/펌프',
    name: '지하 저수조 가압 직결 급수 부스터펌프 4대 병렬 유닛',
    location: '지하 3층 기계실',
    installDate: '2019-03-15',
    lastInspectionDate: '2026-11-01',
    nextInspectionDate: '2026-12-01',
    status: '요주의',
    managerContact: '신영펌프엔지니어링 (02-555-4321)',
    inspections: [
      {
        id: 'ins-4',
        date: '2026-11-01',
        inspector: '박설비 (기계주임)',
        result: '요주의',
        notes: '3호 펌프 메카니컬 씰 미세 누수 발견. 압력 유지에는 지장 없으나 조기 패킹 교체 요망.',
        photos: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60'
        ]
      }
    ],
    repairs: [
      {
        id: 'rep-3',
        date: '2026-11-03',
        vendor: '신영펌프서비스',
        cost: 450000,
        description: '부스터 3호 펌프 메카니컬 씰 및 오링 신품 교체 작업 진행',
        status: '완료'
      }
    ]
  },
  {
    id: 'fac-4',
    category: '소방설비',
    name: '자동화재탐지설비 수신기 및 스프링클러 알람밸브실 1~6구역',
    location: '방재실 (관리사무소 내)',
    installDate: '2019-03-15',
    lastInspectionDate: '2026-10-28',
    nextInspectionDate: '2026-11-28',
    status: '양호',
    managerContact: '대성소방방재 (031-888-9900)',
    inspections: [
      {
        id: 'ins-5',
        date: '2026-10-28',
        inspector: '정소방 (소방안전관리자 1급)',
        result: '양호',
        notes: '지하주차장 프리액션밸브 솔레노이드 작동시험 및 방재실 감시반 연동 100% 정상.'
      }
    ],
    repairs: []
  },
  {
    id: 'fac-5',
    category: '주차/보안',
    name: '정문 및 후문 번호인식(LPR) 차량 출입통제 시스템',
    location: '정문 경비실 / 후문 차단기',
    installDate: '2020-05-10',
    lastInspectionDate: '2026-11-02',
    nextInspectionDate: '2026-12-02',
    status: '양호',
    managerContact: '아마노코리아 통합콜센터 (1588-5998)',
    inspections: [
      {
        id: 'ins-6',
        date: '2026-11-02',
        inspector: '이보안 (보안반장)',
        result: '양호',
        notes: '우천 야간 차량 번호인식률 99.4%, 차단봉 감응 루프코일 감도 테스트 정상.'
      }
    ],
    repairs: [
      {
        id: 'rep-4',
        date: '2026-06-18',
        vendor: '아마노코리아',
        cost: 250000,
        description: '정문 입구 차단봉 LED 바 파손품 교체',
        status: '완료'
      }
    ]
  }
];

const currentYm = new Date().toISOString().slice(0, 7);

export const INITIAL_VISITOR_VEHICLES: VisitorVehicle[] = [
  {
    id: 'vis-1',
    vehicleNumber: '34나 7890',
    visitorName: '박친척',
    visitorPhone: '010-3333-7777',
    hostUserId: 'user-demo-resident',
    hostDong: '101동',
    hostHo: '1204호',
    hostName: '김철수',
    visitPurpose: '친인척 주말 방문',
    visitDate: `${currentYm}-11`,
    expectedEntryTime: '13:00',
    expectedExitTime: '18:00',
    status: 'parked',
    entryTime: `${currentYm}-11 13:08`,
    parkingGate: '정문 LPR 차단기',
    allocatedFreeHours: 24,
    memo: '지하 1층 B구역 주차 완료',
    createdAt: `${currentYm}-10 18:20`
  },
  {
    id: 'vis-2',
    vehicleNumber: '58구 1234',
    visitorName: '최인테리어',
    visitorPhone: '010-4444-8888',
    hostUserId: 'user-demo-resident',
    hostDong: '101동',
    hostHo: '1204호',
    hostName: '김철수',
    visitPurpose: '발코니 창호 시공 견적 실측',
    visitDate: `${currentYm}-12`,
    expectedEntryTime: '15:00',
    expectedExitTime: '17:00',
    status: 'reserved',
    parkingGate: '정문 LPR 차단기',
    allocatedFreeHours: 24,
    memo: '자재 샘플 운반 차량',
    createdAt: `${currentYm}-11 09:15`
  },
  {
    id: 'vis-3',
    vehicleNumber: '12가 5678',
    visitorName: '이배송',
    visitorPhone: '010-5555-9999',
    hostUserId: 'user-tenant',
    hostDong: '104동',
    hostHo: '801호',
    hostName: '이영희',
    visitPurpose: '가전제품(세탁기) 배송 및 설치',
    visitDate: `${currentYm}-10`,
    expectedEntryTime: '11:00',
    expectedExitTime: '13:00',
    status: 'completed',
    entryTime: `${currentYm}-10 11:15`,
    exitTime: `${currentYm}-10 12:15`,
    parkingGate: '후문 LPR 차단기',
    allocatedFreeHours: 24,
    memo: '104동 지하 하역장 출차 완료',
    createdAt: `${currentYm}-09 14:00`
  },
  {
    id: 'vis-4',
    vehicleNumber: '82허 4321',
    visitorName: '정과외',
    visitorPhone: '010-6666-1111',
    hostUserId: 'user-dongrep',
    hostDong: '101동',
    hostHo: '502호',
    hostName: '최대표',
    visitPurpose: '자녀 수학 방문 과외',
    visitDate: `${currentYm}-12`,
    expectedEntryTime: '18:00',
    expectedExitTime: '20:00',
    status: 'reserved',
    parkingGate: '정문 LPR 차단기',
    allocatedFreeHours: 24,
    memo: '매주 수요일 정기 방문',
    createdAt: `${currentYm}-10 20:30`
  }
];

