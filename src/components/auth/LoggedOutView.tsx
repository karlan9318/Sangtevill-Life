import React from 'react';
import { 
  Building2, 
  Lock, 
  UserCheck, 
  UserPlus, 
  Vote, 
  MessageSquare, 
  Car, 
  FileText, 
  Wrench, 
  ShieldCheck, 
  ArrowRight,
  PhoneCall,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoggedOutViewProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenInstallCenter?: () => void;
}

export const LoggedOutView: React.FC<LoggedOutViewProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenInstallCenter,
}) => {
  const { switchUserDemo } = useApp();

  const handleQuickDemoLogin = () => {
    switchUserDemo('user-demo-resident', true);
  };

  const handleQuickManagerLogin = () => {
    switchUserDemo('user-manager', true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Restricted Access Announcement Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-center sm:text-left">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>입주민 인증 제한 구역 · 로그인 및 입주민 등록만 활성화</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            동작상떼빌 입주민 커뮤니티 & <br className="hidden sm:inline" />
            스마트 관리사무소 포털
          </h1>

          <p className="hidden md:block text-xs sm:text-sm text-slate-300 leading-relaxed mb-8 max-w-2xl">
            동작상떼빌 아파트는 입주민의 프라이버시 보호와 1세대 1표 모바일 전자투표의 공정성을 위해 
            <strong className="text-white font-semibold"> 로그인이 안되어 있을 경우 &apos;로그인&apos;과 &apos;입주민 등록&apos; 기능만 활성화</strong>됩니다. 
            아래 버튼을 통해 로그인하거나 신규 입주민 등록을 진행해 주시기 바랍니다.
          </p>

          {/* Primary Action Buttons: Only Login & Register are active */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <UserCheck className="w-5 h-5" />
              <span>입주민 로그인하기</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>신규 입주민 가입신청 (등록)</span>
            </button>
          </div>

          {/* Fast Evaluation Quick Demo Login Buttons */}
          <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">빠른 테스트 체험:</span>
            <button
              onClick={handleQuickDemoLogin}
              className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 cursor-pointer font-medium transition-colors"
            >
              101동 1204호 김철수 (일반 입주민)
            </button>
            <button
              onClick={handleQuickManagerLogin}
              className="px-3 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 cursor-pointer font-medium transition-colors"
            >
              관리사무소장 (백오피스 전체 권한)
            </button>
            {onOpenInstallCenter && (
              <button
                onClick={onOpenInstallCenter}
                className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 cursor-pointer font-medium transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>모바일 앱·서버 설치파일</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Locked Features Preview with Lock Badges */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>로그인 후 활성화되는 입주민 전용 서비스</span>
            </h3>
            <p className="hidden md:block text-xs text-slate-500 mt-0.5">
              입주민 확인(동·호수 승인)이 완료되면 단지 내 모든 스마트 서비스를 자유롭게 이용하실 수 있습니다.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            비활성화 (로그인 필요)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={onOpenLogin}
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
                <Vote className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>로그인 필요</span>
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">모바일 전자투표 (1세대 1표)</h4>
            <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed">
              동호수별 중복 투표 방지 및 소유자/입주자 대상 찬반 및 선택형 전자투표
            </p>
          </div>

          <div 
            onClick={onOpenLogin}
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>로그인 필요</span>
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">스마트 LPR 방문차량 등록</h4>
            <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed">
              정문/후문 번호인식 차단기 자동통과 및 세대별 24시간 모바일 무료 방문증 발급
            </p>
          </div>

          <div 
            onClick={onOpenLogin}
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>로그인 필요</span>
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">단지 전용 메신저 채팅</h4>
            <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed">
              카카오톡 형식의 우리동 단톡방, 관리사무소 1:1 민원상담톡 및 나눔장터
            </p>
          </div>

          <div 
            onClick={onOpenLogin}
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>로그인 필요</span>
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">8개 분과 커뮤니티 게시판</h4>
            <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed">
              공지, 자유게시판, 민원/건의, 입대의, 선관위, 자문위원실, 주민 토론방
            </p>
          </div>

          <div 
            onClick={onOpenLogin}
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>로그인 필요</span>
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">시설물 점검기록 및 자료실</h4>
            <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed">
              수배전반, 승강기, 급수펌프 정기점검 사진기록 및 관리규약, 공사계약서 열람
            </p>
          </div>

          <div 
            onClick={onOpenLogin}
            className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>관리자 전용</span>
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">관리사무소 백오피스</h4>
            <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed">
              입주민 승인 및 직무등급 지정, 타겟 대량 SMS 문자 발송, 민원 답변 및 시설물 관리
            </p>
          </div>
        </div>
      </div>

      {/* 3. Official Apartment Notice & Helpdesk Card */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              동작상떼빌 관리사무소 안내
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              [07072] 서울특별시 동작구 신대방1가길 38 | Tel. 02) 3289-1113 | Fax. 02) 3289-1114
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLogin}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          입주민 로그인하기
        </button>
      </div>
    </div>
  );
};
