import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VisitorVehicle } from '../../types';
import { 
  Car, 
  Plus, 
  Clock, 
  Search, 
  CheckCircle2, 
  QrCode, 
  Share2, 
  Building, 
  User, 
  Zap,
  Settings,
  AlertTriangle,
  X
} from 'lucide-react';

interface ParkingManagementViewProps {
  readOnly?: boolean;
  inBackOffice?: boolean;
}

export const ParkingManagementView: React.FC<ParkingManagementViewProps> = ({ readOnly = false, inBackOffice = false }) => {
  const { 
    currentUser, 
    visitorVehicles, 
    monthlyParkingLimitHours,
    updateMonthlyParkingLimitHours,
    calculateVisitHours,
    getHouseholdMonthlyParkingUsage,
    registerVisitorVehicle, 
    cancelVisitorVehicle, 
    updateVisitorStatus,
    showToast 
  } = useApp();

  const isManager = Boolean(!readOnly && currentUser && (currentUser.role === 'manager' || currentUser.role === 'operator'));
  const canViewAllVisitors = Boolean(currentUser && ['manager', 'operator', 'dong_rep'].includes(currentUser.role));

  const [activeTab, setActiveTab] = useState<'my_visitors' | 'all_visitors'>(
    canViewAllVisitors && readOnly ? 'all_visitors' : 'my_visitors'
  );
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration Form State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('친인척 방문');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedEntryTime, setExpectedEntryTime] = useState('14:00');
  const [expectedExitTime, setExpectedExitTime] = useState('18:00');
  const [memo, setMemo] = useState('');

  // Manager monthly quota editor state
  const [limitInput, setLimitInput] = useState<string>(String(monthlyParkingLimitHours));
  useEffect(() => {
    setLimitInput(String(monthlyParkingLimitHours));
  }, [monthlyParkingLimitHours]);

  // Selected Visitor Detail / Digital Parking Pass Modal
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorVehicle | null>(null);

  const myDong = currentUser?.dong || '101동';
  const myHo = currentUser?.ho || '1204호';
  const myUsage = getHouseholdMonthlyParkingUsage(myDong, myHo);
  const usagePercent = myUsage.limitHours > 0
    ? Math.min(100, Math.round((myUsage.usedHours / myUsage.limitHours) * 100))
    : 100;

  const estimatedFormHours = calculateVisitHours({
    visitDate,
    expectedEntryTime,
    expectedExitTime,
    status: 'reserved'
  });

  // Filter list
  const userFilteredVehicles = visitorVehicles.filter(veh => {
    if (!canViewAllVisitors || activeTab === 'my_visitors') {
      if (currentUser && (veh.hostDong !== currentUser.dong || veh.hostHo !== currentUser.ho)) {
        return false;
      }
    }

    if (statusFilter !== 'all' && veh.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/\s+/g, '');
      const matchNum = veh.vehicleNumber.toLowerCase().replace(/\s+/g, '').includes(q);
      const matchName = veh.visitorName.toLowerCase().includes(q);
      const matchHost = `${veh.hostDong}${veh.hostHo}${veh.hostName}`.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchHost) return false;
    }

    return true;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) {
      showToast('조회 전용 모드에서는 방문차량 등록이 불가합니다.');
      return;
    }
    if (!currentUser) {
      showToast('입주민 로그인이 필요합니다.');
      return;
    }

    if (!vehicleNumber.trim() || !visitorName.trim()) {
      showToast('차량번호와 방문자 성명은 필수 입력 항목입니다.');
      return;
    }

    const res = registerVisitorVehicle({
      vehicleNumber: vehicleNumber.trim(),
      visitorName: visitorName.trim(),
      visitorPhone: visitorPhone.trim() || '010-0000-0000',
      hostUserId: currentUser.id,
      hostDong: currentUser.dong,
      hostHo: currentUser.ho,
      hostName: currentUser.name,
      visitPurpose,
      visitDate,
      expectedEntryTime,
      expectedExitTime,
      parkingGate: '정문 LPR 차단기',
      allocatedFreeHours: estimatedFormHours,
      memo: memo.trim()
    });

    if (res.success) {
      setVehicleNumber('');
      setVisitorName('');
      setVisitorPhone('');
      setMemo('');
      setIsRegisterModalOpen(false);
      setActiveTab('my_visitors');
    } else {
      showToast(res.message);
    }
  };

  const handleSaveMonthlyLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(limitInput);
    const res = updateMonthlyParkingLimitHours(num);
    if (!res.success) {
      showToast(res.message);
    }
  };

  const handleSharePass = (visitor: VisitorVehicle) => {
    const hrs = calculateVisitHours(visitor);
    const text = `[상떼빌라이프 모바일 방문증]\n차량번호: ${visitor.vehicleNumber}\n방문세대: ${visitor.hostDong} ${visitor.hostHo} (${visitor.hostName})\n방문일시: ${visitor.visitDate} ${visitor.expectedEntryTime}~${visitor.expectedExitTime} (${hrs}시간)\n정·후문 번호인식기 자동통과 등록 완료`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('방문차량 안내 메시지가 클립보드에 복사되었습니다.');
    } else {
      showToast('방문증 정보가 생성되었습니다.');
    }
  };

  // Complex Parking metrics
  const totalSpots = 780;
  const currentlyParkedCount = visitorVehicles.filter(v => v.status === 'parked').length + 610;
  const availableSpots = Math.max(0, totalSpots - currentlyParkedCount);
  const occupancyPercent = Math.round((currentlyParkedCount / totalSpots) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Household Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-blue-600 text-xs font-semibold mb-1">
            <Car className="w-4 h-4" />
            <span>상떼빌 스마트 주차관제 시스템 연동</span>
            {currentUser && (
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-mono text-[11px]">
                해당 세대: {currentUser.dong} {currentUser.ho} ({currentUser.name}님)
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
            방문차량 예약 등록 및 월 방문주차 현황
          </h1>
          <p className={`${inBackOffice ? 'block' : 'hidden md:block'} text-xs text-slate-500`}>
            정문/후문 번호인식(LPR) 차단기 실시간 자동 연동 · 세대별 월 무료 방문주차 할당시간 <strong className="text-slate-700">{monthlyParkingLimitHours}시간</strong>
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>새 방문차량 예약 등록</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Household Monthly Visitor Parking Remaining Hours + Complex Capacity KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Household Monthly Remaining Hours (Primary KPI) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
              <span>{myDong} {myHo} 월 방문주차 남은시간</span>
              <Clock className="w-4 h-4 text-blue-200" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-extrabold font-mono">{myUsage.remainingHours}시간</span>
              <span className="text-xs text-blue-200 font-mono">/ 월 {myUsage.limitHours}시간</span>
            </div>
            <p className="text-[11px] text-blue-100 mb-2">
              {myUsage.monthLabel} 누적 사용·예약: <strong>{myUsage.usedHours}시간</strong>
            </p>
          </div>
          <div className="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - usagePercent)}%` }}
            />
          </div>
        </div>

        <div className={`${inBackOffice ? 'block' : 'hidden md:block'} bg-white p-4 rounded-xl border border-slate-200 shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>단지 총 주차면수</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{totalSpots}면</div>
          <p className="text-[11px] text-slate-400 mt-1">지하 1층(420면) · 지하 2층(360면)</p>
        </div>

        <div className={`${inBackOffice ? 'block' : 'hidden md:block'} bg-white p-4 rounded-xl border border-slate-200 shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>현재 주차 점유 현황</span>
            <span className="text-xs font-bold text-blue-600 font-mono">{occupancyPercent}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-600 mb-1.5">{currentlyParkedCount}대 주차 중</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className={`${inBackOffice ? 'block' : 'hidden md:block'} bg-white p-4 rounded-xl border border-slate-200 shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>실시간 잔여 주차면</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600">{availableSpots}면 여유</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">LPR 입차 원활 (쾌적)</p>
        </div>
      </div>

      {/* Manager / Operator Monthly Quota Setting Panel */}
      {isManager && (
        <form
          onSubmit={handleSaveMonthlyLimit}
          className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-indigo-950">
                [관리자/운영자 설정] 세대별 월 방문주차 할당시간 변경
              </h3>
              <p className="text-[11px] text-indigo-700">
                현재 전 세대 월 기본 무료 방문주차 시간은 <strong>{monthlyParkingLimitHours}시간</strong>입니다. 필요 시 시간을 조정하여 즉시 반영할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={1}
              max={744}
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-24 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-indigo-900">시간/월</span>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              할당시간 변경 저장
            </button>
          </div>
        </form>
      )}

      {/* 3. Navigation Tabs & Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('my_visitors')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'my_visitors' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            우리 세대 예약현황 ({visitorVehicles.filter(v => currentUser && v.hostDong === currentUser.dong && v.hostHo === currentUser.ho).length})
          </button>

          {canViewAllVisitors && (
            <button
              onClick={() => setActiveTab('all_visitors')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all_visitors' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              전체 단지 방문차량 현황 ({visitorVehicles.length})
            </button>
          )}

          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            >
              + 방문주차 예약하기
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            {['all', 'parked', 'reserved', 'completed', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-slate-900 text-white font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? '전체' :
                 st === 'parked' ? '입차중' :
                 st === 'reserved' ? '예약접수' :
                 st === 'completed' ? '출차완료' : '취소됨'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-44">
            <input
              type="text"
              placeholder="차량번호 / 성명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Visitor List View */}
      <div className="space-y-4">
        {userFilteredVehicles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>해당 조건의 등록된 방문차량 내역이 없습니다.</p>
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs cursor-pointer"
              >
                새 방문차량 등록하기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userFilteredVehicles.map(veh => {
                const isMyHousehold = currentUser && veh.hostDong === currentUser.dong && veh.hostHo === currentUser.ho;
                const visitHours = calculateVisitHours(veh);

                return (
                  <div
                    key={veh.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status bar */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          veh.status === 'parked' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          veh.status === 'reserved' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          veh.status === 'completed' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            veh.status === 'parked' ? 'bg-emerald-500 animate-pulse' :
                            veh.status === 'reserved' ? 'bg-blue-500' :
                            veh.status === 'completed' ? 'bg-slate-400' : 'bg-rose-500'
                          }`} />
                          {veh.status === 'parked' ? '단지 내 주차중' :
                           veh.status === 'reserved' ? '방문 예약완료' :
                           veh.status === 'completed' ? '출차완료' : '예약취소'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {veh.status !== 'cancelled' && (
                            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {visitHours}시간
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {veh.visitDate}
                          </span>
                        </div>
                      </div>

                      {/* Vehicle Number Big Banner */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-600" />
                          <strong className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                            {veh.vehicleNumber}
                          </strong>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">
                          {veh.visitorName}
                        </span>
                      </div>

                      {/* Details Strip */}
                      <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">방문 목적:</span>
                          <span className="font-medium text-slate-800">{veh.visitPurpose}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400">초대 세대:</span>
                          <span className="font-medium text-slate-800">{veh.hostDong} {veh.hostHo} ({veh.hostName})</span>
                        </div>

                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-slate-400">예정 시간:</span>
                          <span>{veh.expectedEntryTime} ~ {veh.expectedExitTime}</span>
                        </div>

                        {veh.entryTime && (
                          <div className="flex justify-between font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            <span>실제 입차:</span>
                            <span>{veh.entryTime.slice(11)} ({veh.parkingGate})</span>
                          </div>
                        )}

                        {veh.exitTime && (
                          <div className="flex justify-between font-mono text-[11px] text-slate-500">
                            <span>실제 출차:</span>
                            <span>{veh.exitTime.slice(11)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedVisitor(veh)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>모바일 방문증 확인</span>
                      </button>

                      {!readOnly && (
                        <div className="flex items-center gap-1.5">
                          {/* Gate LPR control for managers or own household simulation */}
                          {veh.status === 'reserved' && (isManager || isMyHousehold) && (
                            <button
                              onClick={() => updateVisitorStatus(veh.id, 'parked', '정문 LPR 차단기')}
                              title="LPR 차단기 통과 시뮬레이션"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200 cursor-pointer flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3 text-emerald-600" />
                              <span>입차처리</span>
                            </button>
                          )}

                          {veh.status === 'parked' && (isManager || isMyHousehold) && (
                            <button
                              onClick={() => updateVisitorStatus(veh.id, 'completed')}
                              title="LPR 출차 시뮬레이션"
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              <span>출차처리</span>
                            </button>
                          )}

                          {veh.status === 'reserved' && (isMyHousehold || isManager) && (
                            <button
                              onClick={() => cancelVisitorVehicle(veh.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-medium cursor-pointer"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* 4.5 Visitor Vehicle Registration Modal (새창) */}
      {!readOnly && isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  방문차량 사전 예약 등록 (LPR 자동인식 연동)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>
                    방문 초대 세대: <strong>{currentUser ? `${currentUser.dong} ${currentUser.ho} (${currentUser.name} 님)` : '로그인 필요'}</strong>
                  </span>
                </div>
                <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded font-mono">
                  월 잔여: {myUsage.remainingHours}시간 / {myUsage.limitHours}시간
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    방문 차량번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 12가 3456"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold tracking-wide"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    방문자 성명 (또는 상호) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    방문자 연락처
                  </label>
                  <input
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    방문 목적
                  </label>
                  <select
                    value={visitPurpose}
                    onChange={(e) => setVisitPurpose(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="친인척 방문">친인척/가족 방문</option>
                    <option value="택배/가전가구 배송">택배/가전가구 배송 및 설치</option>
                    <option value="인테리어/시공 견적">인테리어/시공/수리 견적</option>
                    <option value="방문 과외/학습">방문 과외/학습/레슨</option>
                    <option value="업무/비즈니스 미팅">업무/비즈니스 미팅</option>
                    <option value="단순 배달/기타">단순 배달 및 기타 방문</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    방문 예정일
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    입차 예정 시간
                  </label>
                  <input
                    type="time"
                    required
                    value={expectedEntryTime}
                    onChange={(e) => setExpectedEntryTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    출차 예정 시간
                  </label>
                  <input
                    type="time"
                    required
                    value={expectedExitTime}
                    onChange={(e) => setExpectedExitTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                estimatedFormHours > myUsage.remainingHours && visitDate.startsWith(myUsage.monthLabel)
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-1.5">
                  {estimatedFormHours > myUsage.remainingHours && visitDate.startsWith(myUsage.monthLabel) ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-600" />
                  )}
                  <span>
                    이번 예약 차감 시간: <strong className="font-mono">{estimatedFormHours}시간</strong>
                  </span>
                </div>
                <span className="font-mono font-semibold">
                  예약 후 남은시간: {Math.max(0, Math.round((myUsage.remainingHours - estimatedFormHours) * 10) / 10)}시간
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  기타 메모 / 주차 위치 안내
                </label>
                <input
                  type="text"
                  placeholder="예: 지하 1층 101동 엘리베이터 앞 주차 예정"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>방문차량 등록 및 차단기 연동 완료</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Digital Mobile Visitor Pass Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden text-center">
            {/* Pass Header */}
            <div className="bg-blue-600 text-white p-5">
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-80 block mb-1">
                SANTEVILLE DIGITAL PARKING PASS
              </span>
              <h3 className="text-lg font-bold">
                상떼빌라이프 모바일 방문증
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                정문/후문 번호인식(LPR) 자동 통과 인증 완료
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Simulated QR Code Canvas */}
              <div className="w-36 h-36 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl mx-auto flex flex-col items-center justify-center p-2">
                <QrCode className="w-24 h-24 text-slate-800 mb-1" />
                <span className="font-mono text-[9px] text-slate-400">LPR-PASS-{selectedVisitor.id.toUpperCase()}</span>
              </div>

              {/* Vehicle Number Badge */}
              <div>
                <span className="text-2xl font-bold font-mono tracking-wider text-slate-900 bg-slate-100 px-4 py-1.5 rounded-lg border border-slate-200">
                  {selectedVisitor.vehicleNumber}
                </span>
                <span className="text-xs text-slate-500 block mt-1.5 font-medium">
                  방문자: {selectedVisitor.visitorName} ({selectedVisitor.visitorPhone})
                </span>
              </div>

              {/* Info Details */}
              <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-left space-y-1.5 border border-slate-200 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">초대 세대:</span>
                  <strong>{selectedVisitor.hostDong} {selectedVisitor.hostHo} ({selectedVisitor.hostName})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">방문 일시:</span>
                  <span className="font-mono">{selectedVisitor.visitDate} {selectedVisitor.expectedEntryTime} ~ {selectedVisitor.expectedExitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">방문 목적:</span>
                  <span>{selectedVisitor.visitPurpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">예약 주차시간:</span>
                  <strong className="text-blue-600 font-mono">{calculateVisitHours(selectedVisitor)}시간 (월 할당 내 무료)</strong>
                </div>
                {selectedVisitor.entryTime && (
                  <div className="flex justify-between text-emerald-700">
                    <span>입차 확인:</span>
                    <span className="font-mono">{selectedVisitor.entryTime}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSharePass(selectedVisitor)}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>방문자에게 문자 공유</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVisitor(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
