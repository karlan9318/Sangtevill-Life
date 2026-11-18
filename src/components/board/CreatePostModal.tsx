import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BoardCategory } from '../../types';
import { PenSquare, X, AlertCircle } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory: BoardCategory;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, defaultCategory }) => {
  const { currentUser, addPost } = useApp();

  const isManager = Boolean(currentUser && (currentUser.role === 'manager' || currentUser.role === 'operator'));
  const isDongRep = Boolean(currentUser && (currentUser.role === 'dong_rep' || isManager));
  const isElectionComm = Boolean(currentUser && (currentUser.role === 'election_comm' || isManager));
  const isAdvisory = Boolean(currentUser && (currentUser.role === 'advisory' || isManager));

  const isCategoryAllowed = (cat: BoardCategory): boolean => {
    if (cat === 'notice') return isManager;
    if (cat === 'rep_meeting') return isDongRep;
    if (cat === 'election_board') return isElectionComm;
    if (cat === 'advisory_board') return isAdvisory;
    return true;
  };

  const [category, setCategory] = useState<BoardCategory>(
    isCategoryAllowed(defaultCategory) ? defaultCategory : 'free'
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isMandatory, setIsMandatory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategory(isCategoryAllowed(defaultCategory) ? defaultCategory : 'free');
  }, [defaultCategory, isOpen, currentUser?.role]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    if (category === 'notice' && !isManager) {
      setError('공지사항은 관리사무소(관리자/운영자)만 작성할 수 있습니다.');
      return;
    }

    if (category === 'rep_meeting' && !isDongRep) {
      setError('입대의 게시판은 동대표 및 관리자만 작성할 수 있습니다.');
      return;
    }

    if (category === 'election_board' && !isElectionComm) {
      setError('선관위 게시판은 선관위원 및 관리자만 작성할 수 있습니다.');
      return;
    }

    if (category === 'advisory_board' && !isAdvisory) {
      setError('자문위원 게시판은 자문위원 및 관리자만 작성할 수 있습니다.');
      return;
    }

    addPost({
      title: title.trim(),
      content: content.trim(),
      category,
      isPinned: isManager ? isPinned : false,
      isMandatory: isManager ? isMandatory : false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <PenSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              새 게시글 작성
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              게시판 분과 선택
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BoardCategory)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {isManager && <option value="notice">공지사항 (관리사무소 공식)</option>}
              <option value="free">자유게시판 (전체 입주민)</option>
              <option value="complaint">민원 접수함 (작성자 본인·관리소 열람)</option>
              <option value="suggestion">건의사항 (아파트 환경개선)</option>
              {isDongRep && <option value="rep_meeting">입대의 (입주자대표회의 전용)</option>}
              {isElectionComm && <option value="election_board">선관위 (선거관리위원회 전용)</option>}
              {isAdvisory && <option value="advisory_board">자문위원 (전문 자문위원회 전용)</option>}
              <option value="debate">주민 토론방 (주요 안건 찬반토론)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              제목
            </label>
            <input
              type="text"
              required
              placeholder="게시글 제목을 간결하고 명확하게 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              본문 내용
            </label>
            <textarea
              required
              rows={6}
              placeholder="이웃을 배려하는 품격 있는 언어로 내용을 작성해 주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Admin options for pin and mandatory notice */}
          {isManager && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>게시판 상단 고정 등록</span>
              </label>

              {category === 'notice' && (
                <label className="flex items-center gap-2 text-xs text-amber-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>[필수 공지] 앱 실행 시 모든 입주민에게 팝업으로 강제 노출</span>
                </label>
              )}
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              게시글 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
