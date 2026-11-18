import React, { useState } from 'react';
import { Post } from '../../types';
import { AlertTriangle, CheckCircle, ArrowRight, Eye, Calendar, User } from 'lucide-react';

interface MandatoryNoticeModalProps {
  notice: Post;
  onDismiss: (dontShowToday: boolean) => void;
  onGoToNoticeDetail: () => void;
}

export const MandatoryNoticeModal: React.FC<MandatoryNoticeModalProps> = ({
  notice,
  onDismiss,
  onGoToNoticeDetail,
}) => {
  const [dontShowToday, setDontShowToday] = useState(true);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header with mandatory badge */}
        <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-100" />
            <span className="font-bold text-sm tracking-wide">
              [필수 공지사항] 입주민 필독 안내
            </span>
          </div>
          <span className="text-[11px] bg-amber-600/60 px-2 py-0.5 rounded text-amber-100 font-mono">
            중요도: 최상
          </span>
        </div>

        {/* Notice Body */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 leading-snug mb-3">
            {notice.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{notice.authorNickname} ({notice.authorName})</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{notice.createdAt}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>조회 {notice.views}회</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
            {notice.content}
          </div>

          {/* Quick Action Link */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onGoToNoticeDetail}
              className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>게시글 전문 및 댓글 보러가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer controls: "오늘 하루 보지 않기" & "확인" */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>오늘 하루 이 창을 다시 열지 않음 (읽음 처리)</span>
          </label>

          <button
            onClick={() => onDismiss(dontShowToday)}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>확인 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
};
