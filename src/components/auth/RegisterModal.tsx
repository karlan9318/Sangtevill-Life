import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResidentType } from '../../types';
import { UserPlus, X, CheckCircle2, Shield, Info } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { registerUser, currentDeviceId } = useApp();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [dong, setDong] = useState('101동');
  const [ho, setHo] = useState('');
  const [residentType, setResidentType] = useState<ResidentType>('owner');
  const [ageGroup, setAgeGroup] = useState<'20대' | '30대' | '40대' | '50대' | '60대 이상'>('30대');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !dong || !ho.trim()) {
      setError('성명, 휴대전화번호, 동, 호수는 필수 입력 사항입니다.');
      return;
    }

    const res = registerUser({
      name: name.trim(),
      nickname: nickname.trim() || `${dong}_${ho}주민`,
      phone: phone.trim(),
      dong,
      ho: ho.includes('호') ? ho.trim() : `${ho.trim()}호`,
      role: 'resident',
      residentType,
      ageGroup,
    });

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.message);
    }
  };

  const resetForm = () => {
    setName('');
    setNickname('');
    setPhone('');
    setHo('');
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              상떼빌라이프 입주민 가입 신청
            </h3>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              가입 신청이 정상 접수되었습니다!
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 text-left mb-6 space-y-1.5">
              <p><strong>신청자:</strong> {name} ({dong} {ho})</p>
              <p><strong>연락처:</strong> {phone}</p>
              <p><strong>거주형태:</strong> {residentType === 'owner' ? '등기 소유자' : '세입자 입주민'}</p>
              <p><strong>접속 단말기:</strong> <span className="font-mono">{currentDeviceId}</span></p>
              <div className="pt-2 border-t border-slate-200 text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>관리사무소의 입주자 명부 대조 확인 승인 후 즉시 앱 로그인이 가능합니다.</span>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>안심 입주민 인증 안내:</strong> 입주자 명부 일치 여부를 관리사무소에서 검증한 후 사용 승인이 완료됩니다.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  성명 (실명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  placeholder="예: 햇살마을"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                핸드폰 번호 (로그인 ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  동 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={dong}
                  onChange={(e) => setDong(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="101동">101동</option>
                  <option value="102동">102동</option>
                  <option value="103동">103동</option>
                  <option value="104동">104동</option>
                  <option value="105동">105동</option>
                  <option value="106동">106동</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  호수 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 1204"
                  value={ho}
                  onChange={(e) => setHo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  거주 구분
                </label>
                <select
                  value={residentType}
                  onChange={(e) => setResidentType(e.target.value as ResidentType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="owner">소유자 (등기 명의인)</option>
                  <option value="tenant">입주민 (세입자/전월세)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  연령대
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="50대">50대</option>
                  <option value="60대 이상">60대 이상</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer mt-2"
            >
              입주민 가입 신청서 제출
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              <span>이미 등록 승인된 회원이신가요? </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                로그인 화면으로
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
