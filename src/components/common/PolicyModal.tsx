import React from 'react';
import { X, Shield, FileText, Phone, Building2, CheckCircle2 } from 'lucide-react';

export type PolicyType = 'terms' | 'rules' | 'privacy' | 'contact';

interface PolicyModalProps {
  type: PolicyType;
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: PolicyType) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  type,
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                동작상떼빌 아파트 단지 관리 규정 및 안내
              </h3>
              <p className="text-xs text-slate-400">
                공동주택관리법 시행령 및 단지 관리규약 준수
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => onSelectType('terms')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              type === 'terms'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            홈페이지 이용약관
          </button>
          <button
            onClick={() => onSelectType('rules')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              type === 'rules'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            운영원칙
          </button>
          <button
            onClick={() => onSelectType('privacy')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              type === 'privacy'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            개인정보처리방침
          </button>
          <button
            onClick={() => onSelectType('contact')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              type === 'contact'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            고객센터 & 관리사무소
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {type === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">동작상떼빌 아파트 홈페이지 이용약관</h4>
              <p className="text-slate-500 text-xs font-mono">제정일: 2026년 1월 1일 | 시행일: 2026년 1월 1일</p>
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <p><strong>제1조 (목적)</strong> 본 약관은 동작상떼빌 아파트 입주자대표회의 및 관리사무소가 제공하는 상떼빌라이프 입주민 전용 서비스의 이용조건 및 절차, 입주민과 관리사무소 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                <p><strong>제2조 (회원 자격 및 승인)</strong> 서비스는 동작상떼빌에 실거주 중이거나 소유한 입주민에 한하여 가입 신청할 수 있으며, 관리사무소의 동·호수 및 명부 확인 절차를 거쳐 승인된 회원에 한하여 정상 서비스가 개시됩니다.</p>
                <p><strong>제3조 (단말기 인증 및 1세대 1표 투표권)</strong> 회원의 로그인 단말기(핸드폰)는 보안 인증을 거쳐 1인 1단말기로 제한되며, 모바일 전자투표는 동·호수별 1세대 1표 원칙을 준수하여 중복 투표가 엄격히 차단됩니다.</p>
                <p><strong>제4조 (회원의 의무)</strong> 회원은 커뮤니티 게시판 및 단지 채팅방에서 공동주택 거주자 간의 상호 배려를 준수해야 하며, 비방, 허위사실 유포, 층간소음 갈등 조장 등의 행위 적발 시 이용이 제한될 수 있습니다.</p>
              </div>
            </div>
          )}

          {type === 'rules' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">동작상떼빌 커뮤니티 운영원칙</h4>
              <p className="text-slate-500 text-xs font-mono">적용 대상: 전 세대 입주민, 동대표, 선관위원, 자문위원, 관리사무소</p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <p><strong>1. 투명한 정보 공개 원칙</strong>: 관리비 부과 내역, 입대의 정기회의록, 장기수선충당금 집행 내역, 설비 보수 계약서는 모든 입주민에게 실시간 열람 가능하도록 자료실에 상시 게시합니다.</p>
                <p><strong>2. 민원 접수 및 처리 원칙</strong>: 접수된 민원은 관리사무소에서 24시간 이내 1차 접수 확인 답변을 등록하고, 처리 완료 시 현장 사진과 함께 조치 결과를 통보합니다. 동대표 및 자문위원은 민원 현황을 모니터링합니다.</p>
                <p><strong>3. 건전한 게시판 소통</strong>: 광고성 홍보, 상업적 거래, 입주민 명예훼손 글은 운영자 및 관리자에 의해 블라인드(숨김) 처리될 수 있습니다.</p>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">개인정보처리방침</h4>
              <p className="text-slate-500 text-xs font-mono">개인정보보호법 제30조에 따른 처리방침 고지</p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <p><strong>1. 수집하는 개인정보 항목</strong>: 성명, 동/호수, 휴대전화번호, 닉네임, 거주형태(소유자/세입자), 단말기 식별자(UUID/고유키), 방문차량 번호(선택 등록 시).</p>
                <p><strong>2. 개인정보 수집 및 이용 목적</strong>: 입주민 자격 확인, 전자투표 참여 및 중복방지 확인, 긴급 단지 알림 문자 발송, LPR 주차관제 차단기 자동 통과 승인.</p>
                <p><strong>3. 보유 및 이용 기간</strong>: 회원 탈퇴 시 또는 입주민 이사(퇴거) 확인 즉시 안전하게 파기합니다.</p>
                <p><strong>4. 개인정보의 안전성 확보 조치</strong>: 단말기 인증 체크, 암호화 저장 및 관리자 접근 통제를 엄격히 수행합니다.</p>
              </div>
            </div>
          )}

          {type === 'contact' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">동작상떼빌 고객센터 & 관리사무소</h4>
              
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/60 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>동작상떼빌 관리사무소 안내</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <p><strong>소재지:</strong> [07072] 서울특별시 동작구 신대방1가길 38</p>
                  <p><strong>전화번호:</strong> Tel. 02) 3289-1113</p>
                  <p><strong>팩스번호:</strong> Fax. 02) 3289-1114</p>
                  <p><strong>이메일:</strong> djstv111300@naver.com</p>
                  <p><strong>업무시간:</strong> 평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</p>
                  <p><strong>방재실 24시간 긴급전화:</strong> 02) 3289-1113 (내선 9번 또는 방재실 직통 연결)</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>동작상떼빌 입주민 지원센터</span>
                <span className="text-[11px] font-mono text-slate-500">24시간 안전 단지 모니터링 가동중</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 text-[11px]">
            Copyright ⓒ 동작상떼빌 관리사무소 All Rights Reserved.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
