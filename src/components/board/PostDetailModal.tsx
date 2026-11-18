import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Post } from '../../types';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  Eye, 
  User, 
  Calendar, 
  Pin, 
  ShieldCheck, 
  EyeOff, 
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock
} from 'lucide-react';

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  const { 
    currentUser,
    posts,
    toggleLikePost, 
    addPostComment, 
    toggleHidePost, 
    replyToComplaint 
  } = useApp();

  // Always read the live post from context so comments, likes, and replies refresh immediately
  const livePost = posts.find(p => p.id === post.id) || post;

  const [commentText, setCommentText] = useState('');
  const [complaintReplyText, setComplaintReplyText] = useState(livePost.officialReply?.replyContent || '');
  const [complaintStatus, setComplaintStatus] = useState<'in_progress' | 'completed'>('completed');
  const [isReplying, setIsReplying] = useState(false);

  const isLiked = currentUser ? livePost.likedUserIds.includes(currentUser.id) : false;
  const isManager = Boolean(currentUser && (currentUser.role === 'manager' || currentUser.role === 'operator'));
  const isDongRep = Boolean(currentUser && currentUser.role === 'dong_rep');
  const canViewAllComplaints = Boolean(currentUser && ['manager', 'operator', 'dong_rep'].includes(currentUser.role));

  const isRestrictedComplaint =
    livePost.category === 'complaint' &&
    !canViewAllComplaints &&
    livePost.authorId !== currentUser?.id;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addPostComment(livePost.id, commentText);
    setCommentText('');
  };

  const handleComplaintReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintReplyText.trim()) return;
    const res = replyToComplaint(livePost.id, complaintReplyText, complaintStatus);
    if (res.success) {
      setIsReplying(false);
    }
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'notice': return '공지사항';
      case 'free': return '자유게시판';
      case 'complaint': return '민원접수';
      case 'suggestion': return '건의사항';
      case 'rep_meeting': return '입주자대표회의(입대의)';
      case 'election_board': return '선관위(선거관리위원회)';
      case 'advisory_board': return '자문위원 게시판';
      case 'debate': return '주민 토론방';
      default: return cat;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
              {getCategoryName(livePost.category)}
            </span>
            {livePost.isPinned && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                <Pin className="w-3 h-3" />
                <span>상단고정</span>
              </span>
            )}
            {livePost.isHidden && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                <EyeOff className="w-3 h-3" />
                <span>숨김(블라인드)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Manager hidden toggle */}
            {isManager && (
              <button
                onClick={() => toggleHidePost(livePost.id)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                  livePost.isHidden 
                    ? 'bg-rose-100 border-rose-300 text-rose-800' 
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>{livePost.isHidden ? '블라인드 해제' : '게시글 숨김'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isRestrictedComplaint ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">민원 세부내역 열람 권한 제한</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              민원의 세부내역 및 처리 답변은 개인정보 보호를 위해 작성자 본인과 관리사무소(관리자/운영자)·입대의만 확인할 수 있습니다.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Title & Author Meta */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {livePost.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{livePost.authorNickname} ({livePost.authorName})</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{livePost.authorDongHo}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{livePost.createdAt}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>조회 {livePost.views}</span>
                  </span>
                </div>
              </div>

              {/* Post Body */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                {livePost.content}
              </div>

              {/* Special Section: 민원 (Complaint) Status & Official Reply */}
              {livePost.category === 'complaint' && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">민원 처리 진행상태:</span>
                      {livePost.complaintStatus === 'completed' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>처리완료</span>
                        </span>
                      ) : livePost.complaintStatus === 'in_progress' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5" />
                          <span>처리중</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>접수대기</span>
                        </span>
                      )}
                    </div>

                    {/* Manager official reply action button */}
                    {isManager && (
                      <button
                        onClick={() => {
                          setComplaintReplyText(livePost.officialReply?.replyContent || '');
                          setIsReplying(!isReplying);
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded transition-colors cursor-pointer"
                      >
                        {livePost.officialReply ? '공식 답변 수정' : '관리소 답변 등록'}
                      </button>
                    )}
                  </div>

                  {/* DongRep Read-Only mode indicator */}
                  {isDongRep && (
                    <div className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        <strong>입대의(동대표) 조회 전용 모드:</strong> 민원 사항을 열람하실 수 있습니다. (처리 상태 변경 및 공식 답변 등록은 관리자/운영자 전용입니다.)
                      </span>
                    </div>
                  )}

                  {/* Existing Official Reply */}
                  {livePost.officialReply && !isReplying && (
                    <div className="bg-white rounded-lg p-3.5 border border-slate-200/90 text-xs">
                      <div className="flex items-center justify-between text-slate-600 mb-1.5 font-medium">
                        <span className="text-blue-700 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>{livePost.officialReply.replierRole} ({livePost.officialReply.replierName}) 공식 답변</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {livePost.officialReply.repliedAt}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {livePost.officialReply.replyContent}
                      </p>
                    </div>
                  )}

                  {/* Manager Reply Composer Form */}
                  {isReplying && isManager && (
                    <form onSubmit={handleComplaintReplySubmit} className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-slate-700">처리상태 변경:</label>
                        <select
                          value={complaintStatus}
                          onChange={(e) => setComplaintStatus(e.target.value as 'in_progress' | 'completed')}
                          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1"
                        >
                          <option value="in_progress">처리중 (부품 수급 및 일정 조율)</option>
                          <option value="completed">처리완료 (현장 조치 완료)</option>
                        </select>
                      </div>

                      <textarea
                        rows={3}
                        required
                        placeholder="입주민 민원에 대한 공식 답변 내용을 작성하세요..."
                        value={complaintReplyText}
                        onChange={(e) => setComplaintReplyText(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReplying(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs cursor-pointer"
                        >
                          답변 저장 및 입주민 통보
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Like and Stats Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleLikePost(livePost.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isLiked 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>공감 {livePost.likes}</span>
                </button>

                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>댓글 {livePost.comments.length}개</span>
                </span>
              </div>

              {/* Comment List */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">
                  이웃 입주민 댓글 ({livePost.comments.length})
                </h4>

                {livePost.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    아직 등록된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {livePost.comments.map(c => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <span>{c.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({c.authorDongHo})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{c.createdAt}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="따뜻한 이웃 존중 댓글을 남겨주세요..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>등록</span>
                  </button>
                </form>
              ) : (
                <p className="text-xs text-center text-slate-500 py-1">
                  댓글을 작성하려면 먼저 입주민 로그인을 진행해 주세요.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
