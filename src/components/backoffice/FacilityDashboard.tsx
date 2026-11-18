import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FacilityItem } from '../../types';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Camera, 
  Upload, 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  X, 
  Eye, 
  ImageIcon, 
  Layers, 
  TrendingUp,
  FileCheck,
  Building2,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface FacilityDashboardProps {
  readOnly?: boolean;
  inBackOffice?: boolean;
  onOpenNewInspection?: (facilityId: string) => void;
  onOpenNewRepair?: (facilityId: string) => void;
}

export const FacilityDashboard: React.FC<FacilityDashboardProps> = ({ readOnly = false, inBackOffice = false }) => {
  const { facilities, addFacilityInspection, addFacilityRepair, showToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'inspections' | 'repairs'>('all');
  const [searchEquipment, setSearchEquipment] = useState('');
  
  // Selected Facility for detailed history display
  const [selectedFacilityForHistory, setSelectedFacilityForHistory] = useState<FacilityItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleSelectFacility = (fac: FacilityItem) => {
    setSelectedFacilityForHistory(fac);
    setIsHistoryModalOpen(true);
    showToast(`[${fac.name}]의 상세 점검 및 수리 이력이 표시됩니다.`);
  };

  // Photo capture & inspection modal state
  const [isPhotoInspectionModalOpen, setIsPhotoInspectionModalOpen] = useState(false);
  const [targetFacilityId, setTargetFacilityId] = useState<string>(facilities[0]?.id || '');
  const [inspectorName, setInspectorName] = useState('김전기 (선임안전관리자)');
  const [inspectionResult, setInspectionResult] = useState<'양호' | '요주의' | '불량'>('양호');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  
  // Live Camera Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Photo Lightbox modal
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  // Repair Registration modal state
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairFacilityId, setRepairFacilityId] = useState<string>(facilities[0]?.id || '');
  const [repairVendor, setRepairVendor] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [repairDescription, setRepairDescription] = useState('');
  const [repairStatus, setRepairStatus] = useState<'완료' | '진행중'>('완료');

  // Stats calculation
  const totalEquipment = facilities.length;
  const healthyCount = facilities.filter(f => f.status === '양호').length;
  const attentionCount = facilities.filter(f => f.status === '요주의').length;
  const repairNeededCount = facilities.filter(f => f.status === '수리필요').length;
  const overallHealthScore = totalEquipment > 0 ? Math.round((healthyCount / totalEquipment) * 100) : 100;

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (searchEquipment.trim()) {
      const q = searchEquipment.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q);
    }
    return true;
  });

  // Collect aggregated history items across all facilities
  interface HistoryItem {
    id: string;
    type: 'inspection' | 'repair';
    facilityName: string;
    facilityCategory: string;
    facilityId: string;
    date: string;
    title: string;
    status: '양호' | '요주의' | '불량' | '완료' | '진행중';
    operator: string; // inspector or vendor
    cost?: number;
    notes: string;
    photos?: string[];
  }

  const allHistory: HistoryItem[] = [];

  facilities.forEach(fac => {
    fac.inspections.forEach(ins => {
      allHistory.push({
        id: `h-ins-${ins.id}`,
        type: 'inspection',
        facilityName: fac.name,
        facilityCategory: fac.category,
        facilityId: fac.id,
        date: ins.date,
        title: `정기 안전점검 (${ins.result})`,
        status: ins.result,
        operator: ins.inspector,
        notes: ins.notes,
        photos: ins.photos
      });
    });

    fac.repairs.forEach(rep => {
      allHistory.push({
        id: `h-rep-${rep.id}`,
        type: 'repair',
        facilityName: fac.name,
        facilityCategory: fac.category,
        facilityId: fac.id,
        date: rep.date,
        title: `수리/보수: ${rep.description}`,
        status: rep.status,
        operator: rep.vendor,
        cost: rep.cost,
        notes: `소요비용: ₩${rep.cost.toLocaleString()} · 시공사: ${rep.vendor}`
      });
    });
  });

  // Sort history chronologically descending
  allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = allHistory.filter(item => {
    if (selectedFacilityForHistory && item.facilityId !== selectedFacilityForHistory.id) return false;
    if (historyFilter === 'inspections' && item.type !== 'inspection') return false;
    if (historyFilter === 'repairs' && item.type !== 'repair') return false;
    if (selectedCategory !== 'all' && item.facilityCategory !== selectedCategory) return false;
    return true;
  });

  // Camera handling functions
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        showToast('이 브라우저는 카메라 인터페이스를 지원하지 않습니다.');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      showToast('카메라 장치에 접근할 수 없습니다. 파일 첨부 버튼을 이용하세요.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotos(prev => [...prev, dataUrl]);
      showToast('현장 사진이 카메라로 촬영되었습니다.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast(`${files.length}장의 사진이 첨부되었습니다.`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddSampleInspectionPhoto = (sampleUrl: string) => {
    setCapturedPhotos(prev => [...prev, sampleUrl]);
    showToast('샘플 점검 사진이 첨부되었습니다.');
  };

  const handleRemovePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFacilityId) return;

    addFacilityInspection(targetFacilityId, {
      inspector: inspectorName.trim() || '관리소 기술주임',
      result: inspectionResult,
      notes: inspectionNotes.trim() || '현장 점검 완료 및 특이사항 없음.',
      photos: capturedPhotos
    });

    stopCamera();
    setIsPhotoInspectionModalOpen(false);
    setCapturedPhotos([]);
    setInspectionNotes('');
  };

  const handleSubmitRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairFacilityId || !repairVendor.trim() || !repairDescription.trim()) return;

    addFacilityRepair(repairFacilityId, {
      vendor: repairVendor.trim(),
      cost: Number(repairCost) || 0,
      description: repairDescription.trim(),
      status: repairStatus,
    });

    setIsRepairModalOpen(false);
    setRepairVendor('');
    setRepairCost('');
    setRepairDescription('');
    setRepairStatus('완료');
  };

  const sampleInspectionImages = [
    { title: '변압기 온도계', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60' },
    { title: '승강기 제어반', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60' },
    { title: '급수 펌프 밸브', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Quick Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>Facility Maintenance Dashboard</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            단지 시설물 종합 현황 및 정기점검 관리
          </h2>
          <p className={`${inBackOffice ? 'block' : 'hidden md:block'} text-xs text-slate-500`}>
            장비별 가동 상태 지표, 주기별 점검 진척도, 현장 카메라 사진 기록 및 정비 이력
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!readOnly ? (
            <>
              <button
                onClick={() => {
                  setIsPhotoInspectionModalOpen(true);
                  setTargetFacilityId(facilities[0]?.id || '');
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>현장 점검 & 사진 촬영</span>
              </button>
              <button
                onClick={() => {
                  setRepairFacilityId(facilities[0]?.id || '');
                  setIsRepairModalOpen(true);
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>수리 이력 등록</span>
              </button>
            </>
          ) : (
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold">
              입주민 조회 전용 (설비 상태·점검/수리 이력 열람)
            </span>
          )}
        </div>
      </div>

      {/* 2. Visual Status Overview KPIs with Progress Bar */}
      <div className={`${inBackOffice ? 'grid' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
        {/* KPI 1: Overall Health Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>설비 정상 운용률</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{overallHealthScore}%</span>
            <span className="text-xs text-slate-500">({healthyCount}/{totalEquipment}개 정상)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${overallHealthScore}%` }} 
            />
          </div>
        </div>

        {/* KPI 2: Healthy Equipment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>양호 (정상 가동)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mb-1">{healthyCount}개소</div>
          <p className="text-[11px] text-slate-400">기준치 이내 주기 점검 정상 통과</p>
        </div>

        {/* KPI 3: Attention Needed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>요주의 (관찰 필요)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mb-1">{attentionCount}개소</div>
          <p className="text-[11px] text-slate-400">미세 누수 및 부품 마모 주의 항목</p>
        </div>

        {/* KPI 4: Urgent Repair Needed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>수리필요 (조치 요망)</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mb-1">{repairNeededCount}개소</div>
          <p className="text-[11px] text-slate-400">즉시 부품 발주 및 보수반 투입</p>
        </div>
      </div>

      {/* 3. Progress Tracker: Equipment Status By Category */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              시설물 카테고리별 상태 모니터링 & 주기 점검 현황
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>정기검사 기준 주기: 30일/90일</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map(fac => {
            const lastIns = fac.inspections[0];
            const hasPhotos = fac.inspections.some(i => i.photos && i.photos.length > 0);
            
            return (
              <div 
                key={fac.id} 
                onClick={() => handleSelectFacility(fac)}
                className={`p-4 rounded-xl transition-all flex flex-col justify-between cursor-pointer group ${
                  selectedFacilityForHistory?.id === fac.id 
                    ? 'bg-indigo-50/40 border-2 border-indigo-600 ring-2 ring-indigo-200 shadow-md' 
                    : 'bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:shadow-xs'
                }`}
                title="클릭하여 해당 설비의 전체 점검 및 수리 이력 보기"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {fac.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {selectedFacilityForHistory?.id === fac.id && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded animate-pulse">
                          이력 선택됨
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        fac.status === '양호' ? 'bg-emerald-100 text-emerald-800' :
                        fac.status === '요주의' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fac.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                    <span>{fac.name}</span>
                    <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">{fac.location}</p>

                  {/* Progress Tracker Strip */}
                  <div className={`${inBackOffice ? 'block' : 'hidden md:block'} space-y-1.5 mb-3`}>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">점검 상태 지표:</span>
                      <strong className={`font-mono ${fac.status === '양호' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {fac.status === '양호' ? '98% (정상범위)' : fac.status === '요주의' ? '72% (주의관찰)' : '45% (수리필요)'}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          fac.status === '양호' ? 'bg-emerald-500' :
                          fac.status === '요주의' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: fac.status === '양호' ? '98%' : fac.status === '요주의' ? '72%' : '45%' }}
                      />
                    </div>
                  </div>

                  {/* Date details */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-100 text-[11px] space-y-1 mb-3">
                    <div className="flex justify-between text-slate-600">
                      <span>최근 점검일:</span>
                      <strong className="font-mono text-slate-800">{fac.lastInspectionDate}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>차기 예정일:</span>
                      <strong className="font-mono text-indigo-600">{fac.nextInspectionDate}</strong>
                    </div>
                  </div>

                  {/* Recent Inspection Note snippet */}
                  {lastIns && (
                    <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200 mb-3">
                      <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                        <span>점검자: {lastIns.inspector}</span>
                        {lastIns.photos && lastIns.photos.length > 0 && (
                          <span className="text-[10px] text-indigo-600 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>사진 {lastIns.photos.length}장</span>
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 leading-relaxed text-slate-600">{lastIns.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFacility(fac);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>이력 상세 확인 ({fac.inspections.length + fac.repairs.length}건)</span>
                  </button>

                  {!readOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetFacilityId(fac.id);
                        setIsPhotoInspectionModalOpen(true);
                      }}
                      className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      title="현장 카메라 사진 점검 촬영"
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>점검기록</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Equipment Maintenance History List (Timeline & Detailed Records) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Selected Equipment History Filter Notification Banner */}
        {selectedFacilityForHistory && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                    [{selectedFacilityForHistory.name}] 해당 설비의 점검 및 보수 이력
                  </h4>
                  <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                    {filteredHistory.length}건
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  설치 위치: {selectedFacilityForHistory.location} · 최근 점검일: {selectedFacilityForHistory.lastInspectionDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>모달 팝업으로 상세 보기</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFacilityForHistory(null)}
                className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium cursor-pointer"
              >
                전체 설비 이력 보기
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>설비 점검 및 보수 이력 타임라인 (History List)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              현장 카메라 점검 사진, 시공업체 내역 및 집행 비용 상세
            </p>
          </div>

          {/* Filter segment */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                historyFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({allHistory.length})
            </button>
            <button
              onClick={() => setHistoryFilter('inspections')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                historyFilter === 'inspections' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              정기점검만
            </button>
            <button
              onClick={() => setHistoryFilter('repairs')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                historyFilter === 'repairs' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              수리/보수만
            </button>
          </div>
        </div>

        {/* History items stream */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              조회 조건에 해당하는 이력 내역이 없습니다.
            </div>
          ) : (
            filteredHistory.map(item => (
              <div 
                key={item.id} 
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.type === 'inspection' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'inspection' ? '점검기록' : '수리이력'}
                    </span>

                    <span className="text-[10px] text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded font-mono">
                      {item.facilityCategory}
                    </span>

                    <h4 className="text-xs font-bold text-slate-900">
                      {item.facilityName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.date}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === '양호' || item.status === '완료' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === '요주의' || item.status === '진행중' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mb-2 leading-relaxed whitespace-pre-wrap">
                  {item.notes}
                </p>

                {/* Operator and photos footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>
                    담당자/업체: <strong className="text-slate-700">{item.operator}</strong>
                    {item.cost && <span className="ml-2 font-mono text-purple-700 font-semibold">(₩{item.cost.toLocaleString()})</span>}
                  </span>

                  {/* Attached Photos Gallery */}
                  {item.photos && item.photos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>현장 촬영 사진 ({item.photos.length})</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.photos.map((photoUrl, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setActivePhotoPreview(photoUrl)}
                            className="w-8 h-8 rounded-md overflow-hidden border border-slate-300 hover:border-indigo-500 transition-all cursor-pointer relative group"
                            title="사진 크게보기"
                          >
                            <img src={photoUrl} alt="현장 사진" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Inspection & Camera Capture Modal */}
      {!readOnly && isPhotoInspectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  시설물 정기점검 & 현장 카메라 사진 촬영
                </h3>
              </div>
              <button 
                onClick={() => {
                  stopCamera();
                  setIsPhotoInspectionModalOpen(false);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmitInspection} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Select Equipment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  점검 대상 시설물 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetFacilityId}
                  onChange={(e) => setTargetFacilityId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      [{fac.category}] {fac.name} ({fac.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inspector & Result */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    점검자 성명
                  </label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    점검 판정 결과
                  </label>
                  <select
                    value={inspectionResult}
                    onChange={(e) => setInspectionResult(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="양호">양호 (정상 운용)</option>
                    <option value="요주의">요주의 (관찰 필요)</option>
                    <option value="불량">불량 (수리 요망)</option>
                  </select>
                </div>
              </div>

              {/* Camera Interface Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>현장 증빙 사진 촬영/첨부 (디바이스 카메라 연동)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {capturedPhotos.length}장 첨부됨
                  </span>
                </div>

                {/* Camera Live Viewfinder */}
                {isCameraActive ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-700">
                    <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhotoFromCamera}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>사진 캡처</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs rounded-full cursor-pointer"
                      >
                        카메라 닫기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>기기 카메라 켜기 (실시간 촬영)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>앨범/파일에서 사진 선택</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Quick Sample Presets (for desktop testing convenience) */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                    빠른 테스트용 샘플 현장 사진 프리셋:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sampleInspectionImages.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddSampleInspectionPhoto(s.url)}
                        className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md cursor-pointer transition-colors"
                      >
                        + {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnails of Captured Photos */}
                {capturedPhotos.length > 0 && (
                  <div className="pt-2">
                    <div className="grid grid-cols-4 gap-2">
                      {capturedPhotos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                          <img src={photo} alt={`첨부사진 ${pIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                            title="사진 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Inspection Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  점검 세부 소견 및 조치 메모
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="계측치, 이상 진동/소음 여부, 부품 노후 상태를 작성하세요..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Modal Submit Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsPhotoInspectionModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>점검 기록 & 사진 최종 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.2 Repair History Registration Modal (새창) */}
      {!readOnly && isRepairModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  시설물 수리·보수 이력 등록
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRepairModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRepair} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  수리 대상 시설물 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={repairFacilityId}
                  onChange={(e) => setRepairFacilityId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  {facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      [{fac.category}] {fac.name} ({fac.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    시공/정비 업체 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: (주)상떼전기안전"
                    value={repairVendor}
                    onChange={(e) => setRepairVendor(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    진행 상태
                  </label>
                  <select
                    value={repairStatus}
                    onChange={(e) => setRepairStatus(e.target.value as '완료' | '진행중')}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="완료">수리 완료</option>
                    <option value="진행중">보수 진행중</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  집행 비용 (원)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="예: 350000"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  수리/교체 작업 상세 내역 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="교체 부품명, 고장 원인, 조치 결과를 상세히 입력하세요..."
                  value={repairDescription}
                  onChange={(e) => setRepairDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRepairModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>수리 이력 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.5 Facility Equipment History Detail Modal (Triggered on Equipment Click) */}
      {isHistoryModalOpen && selectedFacilityForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-300 mb-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700 font-mono">
                    {selectedFacilityForHistory.category}
                  </span>
                  <span>{selectedFacilityForHistory.location}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedFacilityForHistory.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    selectedFacilityForHistory.status === '양호' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    selectedFacilityForHistory.status === '요주의' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {selectedFacilityForHistory.status}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs strip */}
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">설비 위치</span>
                <strong className="text-slate-800">{selectedFacilityForHistory.location}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">최근 점검일</span>
                <strong className="font-mono text-slate-800">{selectedFacilityForHistory.lastInspectionDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">차기 점검 예정</span>
                <strong className="font-mono text-indigo-600">{selectedFacilityForHistory.nextInspectionDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">등록 이력 건수</span>
                <strong className="font-mono text-slate-800">
                  점검 {selectedFacilityForHistory.inspections.length}건 / 수리 {selectedFacilityForHistory.repairs.length}건
                </strong>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Section 1: Inspections */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>정기 안전점검 이력 ({selectedFacilityForHistory.inspections.length}건)</span>
                </h4>

                {selectedFacilityForHistory.inspections.length === 0 ? (
                  <p className="text-slate-400 text-xs py-3 text-center">등록된 점검 이력이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedFacilityForHistory.inspections.map((ins, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-slate-800 text-xs">{ins.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ins.result === '양호' ? 'bg-emerald-100 text-emerald-800' :
                            ins.result === '요주의' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            점검결과: {ins.result}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{ins.notes}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                          <span>점검 담당자: <strong className="text-slate-700">{ins.inspector}</strong></span>
                          {ins.photos && ins.photos.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-indigo-600 font-semibold text-[10px]">현장 실사 사진:</span>
                              {ins.photos.map((p, pIdx) => (
                                <button
                                  key={pIdx}
                                  onClick={() => setActivePhotoPreview(p)}
                                  className="w-7 h-7 rounded overflow-hidden border border-slate-300 hover:border-indigo-600 cursor-pointer"
                                  title="사진 확대"
                                >
                                  <img src={p} alt="점검 사진" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Repairs */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <span>수리 및 정비/보수 이력 ({selectedFacilityForHistory.repairs.length}건)</span>
                </h4>

                {selectedFacilityForHistory.repairs.length === 0 ? (
                  <p className="text-slate-400 text-xs py-3 text-center">등록된 보수/수리 이력이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedFacilityForHistory.repairs.map((rep, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-slate-800 text-xs">{rep.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.status === '완료' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rep.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{rep.description}</p>

                        <div className="flex justify-between items-center text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                          <span>시공업체: <strong>{rep.vendor}</strong></span>
                          <span className="font-mono text-purple-700 font-bold">소요비용: ₩{rep.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => {
                    setTargetFacilityId(selectedFacilityForHistory.id);
                    setIsHistoryModalOpen(false);
                    setIsPhotoInspectionModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>이 설비 현장점검 & 사진촬영</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500">조회 전용 모드</span>
              )}

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Photo Lightbox Modal */}
      {activePhotoPreview && (
        <div 
          onClick={() => setActivePhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-2">
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-4 right-4 text-white bg-slate-800/80 hover:bg-rose-600 p-1.5 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={activePhotoPreview} 
              alt="현장 점검 확대 사진" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-2 text-center text-xs text-slate-300">
              현장 정기점검 실사 기록 증빙 사진
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
