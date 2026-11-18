import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BoardCategory } from '../../types';
import { PostDetailModal } from './PostDetailModal';
import { CreatePostModal } from './CreatePostModal';
import { 
  Pin, 
  Search, 
  PenSquare, 
  EyeOff, 
  Heart, 
  MessageCircle, 
  Eye, 
  Lock, 
  Shield,
  FileText
} from 'lucide-react';

interface BoardListProps {
  initialPostId?: string;
}

export const BoardList: React.FC<BoardListProps> = ({ initialPostId }) => {
  const { 
    currentUser, 
    posts, 
    selectedBoardCategory, 
    setSelectedBoardCategory,
    showToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<BoardCategory>(selectedBoardCategory || 'notice');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (selectedBoardCategory) {
      setActiveCategory(selectedBoardCategory);
    }
  }, [selectedBoardCategory]);

  useEffect(() => {
    if (initialPostId) {
      setSelectedPostId(initialPostId);
    }
  }, [initialPostId]);

  const selectedPost = selectedPostId ? (posts.find(p => p.id === selectedPostId) || null) : null;

  const isManager = Boolean(currentUser && (currentUser.role === 'manager' || currentUser.role === 'operator'));
  const canViewAllComplaints = Boolean(currentUser && ['manager', 'operator', 'dong_rep'].includes(currentUser.role));

  const canWriteInCategory = (cat: BoardCategory): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    switch (cat) {
      case 'notice':
        return role === 'manager' || role === 'operator';
      case 'rep_meeting':
        return role === 'manager' || role === 'operator' || role === 'dong_rep';
      case 'election_board':
        return role === 'manager' || role === 'operator' || role === 'election_comm';
      case 'advisory_board':
        return role === 'manager' || role === 'operator' || role === 'advisory';
      case 'free':
      case 'complaint':
      case 'suggestion':
      case 'debate':
        return true;
      default:
        return false;
    }
  };

  // Board categories (전체글 is exclusively inside Back Office)
  const categories: Array<{ id: BoardCategory; label: string }> = [
    { id: 'notice', label: '공지사항' },
    { id: 'free', label: '자유게시판' },
    { id: 'complaint', label: '민원접수' },
    { id: 'suggestion', label: '건의사항' },
    { id: 'rep_meeting', label: '입대의(대표회의)' },
    { id: 'election_board', label: '선관위' },
    { id: 'advisory_board', label: '자문위원' },
    { id: 'debate', label: '주민토론방' },
  ];

  const isCurrentWritable = canWriteInCategory(activeCategory);

  // Filtering
  const filteredPosts = posts.filter(post => {
    if (post.category !== activeCategory) {
      return false;
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(kw);
      const isPrivateComplaint = post.category === 'complaint' && !canViewAllComplaints && post.authorId !== currentUser?.id;
      const matchContent = !isPrivateComplaint && post.content.toLowerCase().includes(kw);
      const matchAuthor = post.authorName.toLowerCase().includes(kw) || post.authorDongHo.toLowerCase().includes(kw);
      if (!matchTitle && !matchContent && !matchAuthor) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>아파트 커뮤니티 게시판</span>
          </h1>
          <p className="hidden md:block text-xs text-slate-500">
            공지, 자유, 민원, 건의, 입대의, 선관위, 자문위원 및 주민 토론방 (분과별 열람·작성 권한 적용)
          </p>
        </div>

        {isCurrentWritable ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <PenSquare className="w-4 h-4" />
            <span>게시글 작성</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>현재 분과는 댓글 작성만 가능합니다</span>
          </div>
        )}
      </div>

      {/* Category Segmented Tabs (No '전체글' here; '전체글' is Back Office only) */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1">
        {categories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedBoardCategory(cat.id);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Info Notice Banners for Special Categories */}
      {activeCategory === 'complaint' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>민원 개인정보 보호 안내:</strong> 민원의 세부 내역과 처리 결과는 <strong>작성자 본인</strong>과 관리사무소(관리자/운영자)·입대의만 확인할 수 있습니다. 타 세대의 민원 본문은 비공개 보호됩니다.
          </div>
        </div>
      )}

      {activeCategory === 'rep_meeting' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>입주자대표회의(입대의) 공간:</strong> 동대표 및 관리주체가 회의 안건·결과를 공지하며, 일반 입주민은 열람 및 댓글 의견 개진이 가능합니다.
          </div>
        </div>
      )}

      {activeCategory === 'election_board' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>선거관리위원회(선관위) 공간:</strong> 선관위원 및 관리사무소가 선거·전자투표 관련 공고를 게시하며, 입주민은 열람 및 댓글 문의가 가능합니다.
          </div>
        </div>
      )}

      {activeCategory === 'advisory_board' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>단지 자문위원회 공간:</strong> 자문위원(법률·세무·건축 등) 및 관리사무소가 전문 검토 의견을 게시하며, 입주민은 열람 및 댓글 의견 개진이 가능합니다.
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="게시글 제목, 내용, 작성자(동/호수)로 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      {/* Post List Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            해당 분과에 등록된 게시글이 없습니다.
          </div>
        ) : (
          filteredPosts.map(post => {
            const isBlind = post.isHidden && !isManager && currentUser?.role !== 'dong_rep';
            const isLockedComplaint =
              post.category === 'complaint' &&
              !canViewAllComplaints &&
              post.authorId !== currentUser?.id;

            return (
              <div
                key={post.id}
                onClick={() => {
                  if (isBlind) return;
                  if (isLockedComplaint) {
                    showToast('민원 세부내역은 작성자 본인만 확인할 수 있습니다.');
                    return;
                  }
                  setSelectedPostId(post.id);
                }}
                className={`p-4 transition-colors ${
                  isBlind
                    ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                    : isLockedComplaint
                    ? 'bg-slate-50/50 hover:bg-slate-100/70 cursor-pointer'
                    : 'hover:bg-slate-50/80 cursor-pointer'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Label */}
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {categories.find(c => c.id === post.category)?.label || post.category}
                    </span>

                    {/* Pin badge */}
                    {post.isPinned && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Pin className="w-3 h-3" />
                        <span>고정</span>
                      </span>
                    )}

                    {/* Complaint Status Badge */}
                    {post.category === 'complaint' && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                        post.complaintStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : post.complaintStatus === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {post.complaintStatus === 'completed' ? '처리완료' : post.complaintStatus === 'in_progress' ? '처리중' : '접수대기'}
                      </span>
                    )}

                    {isLockedComplaint && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        <span>본인만 열람</span>
                      </span>
                    )}

                    {/* Hidden Badge for Manager / DongRep */}
                    {post.isHidden && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        <EyeOff className="w-3 h-3" />
                        <span>블라인드(숨김)</span>
                      </span>
                    )}

                    {/* Post Title */}
                    <h3 className="text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-1">
                      {isBlind
                        ? '관리자에 의해 숨김(블라인드) 처리된 게시글입니다.'
                        : isLockedComplaint
                        ? '비공개 민원 접수글 (작성자 본인만 세부내역 확인 가능)'
                        : post.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {post.createdAt.slice(0, 10)}
                  </span>
                </div>

                {/* Content snippet */}
                {!isBlind && (
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2.5">
                    {isLockedComplaint
                      ? '개인정보 및 세대 보호를 위해 민원 세부내역은 작성자 본인과 관리사무소·입대의에게만 공개됩니다.'
                      : post.content}
                  </p>
                )}

                {/* Meta details footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">
                      {isLockedComplaint ? '비공개 작성자' : post.authorNickname}
                    </span>
                    <span className="text-slate-400">
                      ({isLockedComplaint ? post.authorDongHo.split(' ')[0] + ' ***호' : post.authorDongHo})
                    </span>
                    {post.officialReply && (
                      <span className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">
                        관리소 공식답변 완료
                      </span>
                    )}
                  </div>

                  <div className="hidden md:flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.views}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>{post.comments.length}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
        />
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultCategory={activeCategory}
        />
      )}
    </div>
  );
};
