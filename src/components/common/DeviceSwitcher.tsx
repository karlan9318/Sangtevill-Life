import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, RefreshCw, ChevronDown, ChevronUp, UserCheck, Shield, Key } from 'lucide-react';
import { UserRole } from '../../types';

export const DeviceSwitcher: React.FC = () => {
  const { 
    currentUser, 
    currentDeviceId, 
    setDeviceUuid, 
    users, 
    switchUserDemo, 
    logout 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [customDeviceInput, setCustomDeviceInput] = useState('');

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'manager': return '관리사무소장';
      case 'operator': return '운영자';
      case 'dong_rep': return '동대표';
      case 'election_comm': return '선관위원';
      case 'advisory': return '자문위원';
      default: return '일반입주민';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'manager': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'operator': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'dong_rep': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'election_comm': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'advisory': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <aside aria-label="데모 시뮬레이션 제어 바" className="bg-slate-900 text-white text-xs border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Device & Current User Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px] text-slate-400">단말 ID:</span>
            <span className="font-semibold">{currentDeviceId}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-400">접속 계정:</span>
            {currentUser ? (
              <span className="flex items-center gap-1.5 font-medium">
                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getRoleBadgeColor(currentUser.role)}`}>
                  {getRoleLabel(currentUser.role)}
                </span>
                <span>{currentUser.name} ({currentUser.dong} {currentUser.ho})</span>
                <span className="text-slate-400 text-[11px]">[{currentUser.residentType === 'owner' ? '소유자' : '세입자'}]</span>
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                로그아웃 상태 (로그인 및 입주민 등록만 활성화됨)
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Role Switcher Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>역할/단말 시뮬레이터</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Control Drawer */}
      {isOpen && (
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-3 text-slate-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Fast Role Switcher */}
            <div className="md:col-span-2">
              <div className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>테스트용 사용자 1초 전환 (역할별 권한 & 세대별 투표 테스트)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {users.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => switchUserDemo(u.id, true)}
                      className={`text-left p-2 rounded border transition-all text-[11px] ${
                        isCurrent 
                          ? 'bg-blue-900/60 border-blue-500 text-white shadow-sm' 
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{u.name}</span>
                        <span className={`px-1 py-0.2 rounded text-[9px] border ${getRoleBadgeColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-0.5">{u.dong} {u.ho} · {u.residentType === 'owner' ? '소유자' : '세입자'}</div>
                      <div className="text-slate-500 font-mono text-[10px]">{u.phone}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Phone Device Verification Tester */}
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>단말기 불일치(타 핸드폰) 검증</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                현재 접속 단말 ID를 임의로 변경하여 <strong>&quot;타 핸드폰에서의 로그인 거절&quot;</strong> 보안 정책을 테스트할 수 있습니다.
              </p>
              
              <div className="flex gap-1.5 mb-2">
                <button
                  onClick={() => setDeviceUuid('DEV-UNKNOWN-PHONE-99')}
                  className="flex-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 py-1.5 px-2 rounded text-[11px] transition-colors"
                >
                  타인 핸드폰으로 변조
                </button>
                <button
                  onClick={() => {
                    if (currentUser) setDeviceUuid(currentUser.deviceId);
                  }}
                  className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 py-1.5 px-2 rounded text-[11px] transition-colors"
                >
                  본인 정상 단말로 복구
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">직접 입력:</span>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={customDeviceInput}
                    onChange={(e) => setCustomDeviceInput(e.target.value)}
                    placeholder="예: DEV-PHONE-NEW"
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[11px] w-32 text-slate-200"
                  />
                  <button
                    onClick={() => {
                      if (customDeviceInput.trim()) {
                        setDeviceUuid(customDeviceInput.trim());
                        setCustomDeviceInput('');
                      }
                    }}
                    className="bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-[11px]"
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
