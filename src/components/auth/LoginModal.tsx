import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Lock, AlertCircle, X, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { 
    loginWithPhone, 
    currentDeviceId, 
    users, 
    resetDeviceForUser 
  } = useApp();

  const [phone, setPhone] = useState('010-1234-5678');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceMismatchUser, setDeviceMismatchUser] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDeviceMismatchUser(null);

    const cleanInput = phone.trim().replace(/-/g, '');
    const matchedUser = users.find(u => u.phone.replace(/-/g, '') === cleanInput);

    const result = loginWithPhone(phone);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.message);
      if (result.requiresDeviceTransfer && matchedUser) {
        setDeviceMismatchUser(matchedUser.id);
      }
    }
  };

  const handleDeviceTransfer = (userId: string) => {
    resetDeviceForUser(userId);
    setErrorMessage(null);
    setDeviceMismatchUser(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              입주민 휴대전화 본인인증 로그인
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>현재 접속 단말기 식별자:</span>
              <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {currentDeviceId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              * 아파트 보안 정책: 본인 등록 휴대폰 번호 및 지정 단말기에서만 로그인이 허용됩니다.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                등록된 핸드폰 번호
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Error or Device Mismatch Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>

                {/* Device transfer option if device mismatched */}
                {deviceMismatchUser && (
                  <div className="mt-1 pt-2 border-t border-rose-200/80 flex flex-col gap-1.5">
                    <p className="text-[11px] text-rose-700">
                      휴대전화 기기를 변경하셨거나 테스트 중이신가요? 관리자 본인확인 후 현재 단말로 기기 변경 등록이 가능합니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeviceTransfer(deviceMismatchUser)}
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1.5 px-3 rounded-md transition-colors text-center cursor-pointer shadow-xs"
                    >
                      현재 핸드폰({currentDeviceId})으로 기기 변경 등록하기
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>핸드폰 번호 인증 및 로그인</span>
            </button>
          </form>

          {/* Quick Demo phone select */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              빠른 테스트용 등록 번호 선택:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPhone('010-1234-5678')}
                className="text-left px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-pointer"
              >
                <div className="font-medium">김철수 (일반/101동 1204)</div>
                <div className="text-[10px] text-slate-500 font-mono">010-1234-5678</div>
              </button>
              <button
                type="button"
                onClick={() => setPhone('010-1111-2222')}
                className="text-left px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-amber-900 cursor-pointer"
              >
                <div className="font-medium">이관리 (관리사무소장)</div>
                <div className="text-[10px] text-amber-700 font-mono">010-1111-2222</div>
              </button>
              <button
                type="button"
                onClick={() => setPhone('010-3333-4444')}
                className="text-left px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-900 cursor-pointer"
              >
                <div className="font-medium">최대표 (101동대표)</div>
                <div className="text-[10px] text-blue-700 font-mono">010-3333-4444</div>
              </button>
              <button
                type="button"
                onClick={() => setPhone('010-7777-8888')}
                className="text-left px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-indigo-900 cursor-pointer"
              >
                <div className="font-medium">강자문 (자문위원)</div>
                <div className="text-[10px] text-indigo-700 font-mono">010-7777-8888</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span>아직 등록된 입주민이 아니신가요?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              입주민 회원가입 신청
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
