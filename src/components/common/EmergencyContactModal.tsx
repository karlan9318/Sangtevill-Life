import React from 'react';
import {
  Phone,
  ShieldAlert,
  Flame,
  Wrench,
  Zap,
  Building2,
  Droplets,
  X,
  Copy,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactEntry {
  category: string;
  name: string;
  phone: string;
  hours: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
}

export const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();

  if (!isOpen) return null;

  const contacts: ContactEntry[] = [
    {
      category: '단지 관리',
      name: '동작상떼빌 관리사무소',
      phone: '02-3289-1113',
      hours: '평일 09:00 ~ 18:00 (팩스 02-3289-1114)',
      description: '일반 민원, 관리비, 입주/퇴거, 시설 보수 접수',
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      category: '24시간 긴급',
      name: '단지 방재실 / 정문 경비실',
      phone: '02-3289-1115',
      hours: '연중무휴 24시간 상시 대기',
      description: '야간 누수, 정전, 주차 차단기 장애, 긴급 보안 출동',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      category: '재난/응급',
      name: '화재 · 구급 신고 (소방서) / 범죄 신고',
      phone: '119 / 112',
      hours: '24시간 긴급출동',
      description: '화재 발생, 응급 환자 이송, 침입 및 위급 상황',
      icon: <Flame className="w-4 h-4 text-orange-600" />,
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      category: '승강기',
      name: '현대엘리베이터 긴급상황실',
      phone: '1577-0603',
      hours: '24시간 원격관제 및 긴급출동',
      description: '승강기 갇힘 사고 및 운행 이상 즉시 출동 지원',
      icon: <Wrench className="w-4 h-4 text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      category: '전기/설비',
      name: '한국전력공사 / 단지 전기안전관리자',
      phone: '123 / 031-700-1122',
      hours: '24시간 정전 신고 및 기술 지원',
      description: '세대 분전반 차단기 이상, 공용 수변전 설비 장애',
      icon: <Zap className="w-4 h-4 text-amber-600" />,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      category: '가스/수도',
      name: '도시가스 누출신고 / 다산콜센터(상수도)',
      phone: '1544-4500 / 120',
      hours: '24시간 긴급점검 출동',
      description: '도시가스 냄새·누출 의심, 직수관 동파 및 단수 문의',
      icon: <Droplets className="w-4 h-4 text-emerald-600" />,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  const handleCopyPhone = (name: string, phone: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      showToast(`[${name}] 전화번호(${phone})가 복사되었습니다.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">동작상떼빌 아파트 비상 연락망</h3>
              <p className="text-[11px] text-rose-100">
                긴급 상황 발생 시 아래 연락처로 즉시 연결하세요 · [07072] 서울특별시 동작구 신대방1가길 38
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-rose-100 hover:text-white p-1.5 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3 bg-slate-50/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${item.badgeColor}`}>
                      {item.icon}
                      <span>{item.category}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.hours.split(' ')[0]}</span>
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    운영시간: {item.hours}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${item.phone.split('/')[0].trim().replace(/[^0-9]/g, '')}`}
                    className="font-mono text-sm font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.phone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyPhone(item.name, item.phone)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>복사</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
            <strong>야간 및 공휴일 비상 대응 안내:</strong> 평일 업무시간(09:00~18:00) 외 세대 내 급수 누수, 정전, 승강기 이상 등 긴급 사고 발생 시 <strong>단지 방재실/경비실(02-3289-1115)</strong>로 연락하시면 당직 근무자가 즉시 출동하여 초동 조치를 진행합니다.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">E-mail: djstv111300@naver.com</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            확인 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
