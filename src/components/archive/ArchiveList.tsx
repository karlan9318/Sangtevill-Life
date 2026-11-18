import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArchiveDocument } from '../../types';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Plus, 
  X, 
  ShieldCheck, 
  Calendar, 
  HardDrive,
  FileCheck
} from 'lucide-react';

export const ArchiveList: React.FC = () => {
  const { 
    currentUser, 
    archives, 
    addArchiveDocument, 
    incrementDownload, 
    showToast 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [previewDoc, setPreviewDoc] = useState<ArchiveDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Document Upload State (for manager)
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'관리규약' | '공사계약서' | '용역계약서' | '장기수선/도면' | '회의록/회계'>('관리규약');
  const [newDesc, setNewDesc] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('3.5 MB');
  const [newSecurity, setNewSecurity] = useState<'전체공개' | '입주민전용' | '입대의/관리자전용'>('전체공개');

  const isManager = currentUser && (currentUser.role === 'manager' || currentUser.role === 'operator');

  const categories = [
    { id: 'all', label: '전체 자료' },
    { id: '관리규약', label: '관리규약' },
    { id: '공사계약서', label: '공사계약서' },
    { id: '용역계약서', label: '용역계약서' },
    { id: '장기수선/도면', label: '장기수선/도면' },
    { id: '회의록/회계', label: '회의록/회계' },
  ];

  const filteredArchives = archives.filter(doc => {
    if (activeCategory !== 'all' && doc.category !== activeCategory) {
      return false;
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(kw);
      const matchDesc = doc.description.toLowerCase().includes(kw);
      const matchFile = doc.fileName.toLowerCase().includes(kw);
      if (!matchTitle && !matchDesc && !matchFile) return false;
    }
    return true;
  });

  const handleDownload = (doc: ArchiveDocument) => {
    incrementDownload(doc.id);
    showToast(`'${doc.fileName}' 파일 다운로드가 시작되었습니다.`);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    addArchiveDocument({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      fileName: newFileName.trim() || `${newTitle.trim()}.pdf`,
      fileSize: newFileSize,
      securityLevel: newSecurity
    });

    setNewTitle('');
    setNewDesc('');
    setNewFileName('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>아파트 투명 자료실</span>
          </h1>
          <p className="hidden md:block text-xs text-slate-500">
            관리규약 전문, 각종 공사 및 용역 도급 계약서, 장기수선계획서 및 외부 회계감사 보고서
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>자료 등록 (관리자)</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="문서명, 세부 내용, 파일명으로 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArchives.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            조건에 일치하는 등록 문서가 없습니다.
          </div>
        ) : (
          filteredArchives.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{doc.uploadedAt}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {doc.description}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-mono text-slate-700 truncate">{doc.fileName}</span>
                  </div>
                  <span className="font-mono shrink-0 text-slate-400 text-[11px]">{doc.fileSize}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end md:justify-between">
                <span className="hidden md:flex text-[11px] text-slate-400 items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>다운로드 {doc.downloadsCount}회</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 text-xs text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>미리보기</span>
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>다운로드</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm truncate max-w-md">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p><strong>문서 분류:</strong> {previewDoc.category}</p>
                <p><strong>파일명:</strong> {previewDoc.fileName} ({previewDoc.fileSize})</p>
                <p><strong>등록일:</strong> {previewDoc.uploadedAt}</p>
                <p><strong>공개 등급:</strong> {previewDoc.securityLevel}</p>
              </div>

              {/* Simulated PDF Document Viewer Canvas */}
              <div className="border border-slate-300 rounded-xl bg-slate-100 p-8 shadow-inner min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-indigo-600 mb-4 border border-slate-200">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  [공식 열람본] {previewDoc.title}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                  본 문서는 공동주택관리법령 및 단지 관리규약에 따라 입주민의 알 권리 보장과 투명한 관리비 집행을 위해 공개된 공식 전자 문서입니다.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(previewDoc)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF 전문 다운로드 ({previewDoc.fileSize})</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal (for manager) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  새 공시 자료 등록 (관리자)
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  문서 분류
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="관리규약">관리규약</option>
                  <option value="공사계약서">공사계약서</option>
                  <option value="용역계약서">용역계약서</option>
                  <option value="장기수선/도면">장기수선/도면</option>
                  <option value="회의록/회계">회의록/회계</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  문서 명칭
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026년도 단지 조경관리 위탁용역 계약서"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  문서 설명 및 주요 내용
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="계약 금액, 용역 기간, 주요 특수 조건 등을 요약 기재하세요"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    첨부 파일명
                  </label>
                  <input
                    type="text"
                    placeholder="Landscape_Contract_2026.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    파일 크기
                  </label>
                  <input
                    type="text"
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  자료 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
