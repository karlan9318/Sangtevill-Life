import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Users, 
  Search, 
  Phone, 
  Building, 
  ShieldCheck, 
  MoreVertical,
  Check,
  User,
  ArrowLeft,
  X
} from 'lucide-react';

export const ChatAppView: React.FC = () => {
  const { 
    currentUser, 
    chatRooms, 
    chatMessages, 
    activeChatRoomId, 
    setActiveChatRoomId, 
    sendChatMessage, 
    setCurrentView 
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [mobileShowRoom, setMobileShowRoom] = useState(false);
  const [showEmoticons, setShowEmoticons] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const activeRoom = chatRooms.find(r => r.id === activeChatRoomId) || chatRooms[0];
  const messages = chatMessages[activeChatRoomId] || [];

  const emoticons = ['👍', '😊', '🙏', '👏', '💡', '🚗', '🐶', '☕', '❤️', '✅'];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, mobileShowRoom, activeChatRoomId]);

  // Lock background screen scroll on mobile while chat full-screen window is open
  useEffect(() => {
    const applyMobileLock = () => {
      if (window.innerWidth < 768) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
      }
    };

    applyMobileLock();
    window.addEventListener('resize', applyMobileLock);
    return () => {
      window.removeEventListener('resize', applyMobileLock);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(activeChatRoomId, inputText.trim());
    setInputText('');
    setShowEmoticons(false);
  };

  const handleSendSimulatedImage = () => {
    // Send simulated photo
    const sampleImages = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60', // apartment exterior
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=60'
    ];
    sendChatMessage(activeChatRoomId, '단지 사진 공유합니다.', sampleImages[0]);
  };

  const filteredRooms = chatRooms.filter(r => 
    r.name.toLowerCase().includes(searchRoom.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-slate-100 overflow-hidden overscroll-none flex flex-col md:static md:z-auto md:max-w-5xl md:mx-auto md:h-[780px] md:rounded-2xl md:border md:border-slate-300 md:shadow-xl">
      {/* KakaoTalk Style Top Bar Indicator */}
      <div className="bg-[#3A1D1D] text-[#FEE500] px-4 py-2.5 md:py-2 flex items-center justify-between text-xs font-bold tracking-tight shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-[#FEE500] text-[#3A1D1D] flex items-center justify-center text-[10px] font-black shrink-0">
            톡
          </div>
          <span className="truncate">상떼빌라이프 입주민 메신저</span>
          <span className="hidden sm:inline font-normal text-amber-200">(독립형 단지 톡)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-normal text-amber-100 shrink-0">
          <span className="hidden sm:inline">연동 계정: {currentUser?.name} ({currentUser?.dong} {currentUser?.ho})</span>
          <span className="hidden sm:inline w-2 h-2 rounded-full bg-emerald-400" />
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            aria-label="채팅창 닫기"
            className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FEE500] text-xs font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>닫기</span>
          </button>
        </div>
      </div>

      {/* Main Messenger Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden bg-white">
        {/* Left Sidebar: Room List */}
        <div className={`w-full md:w-80 min-h-0 border-r border-slate-200 flex flex-col bg-slate-50 ${mobileShowRoom ? 'hidden md:flex' : 'flex'}`}>
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="채팅방 및 이웃 검색..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100">
            {filteredRooms.map(room => {
              const isSelected = room.id === activeChatRoomId;
              const roomMessages = chatMessages[room.id] || [];
              const lastMsg = roomMessages[roomMessages.length - 1]?.text || room.lastMessage || '대화가 없습니다.';

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setActiveChatRoomId(room.id);
                    setMobileShowRoom(true);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-100/60' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-xs ${
                    room.type === 'official' 
                      ? 'bg-blue-600' 
                      : room.targetDong 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-600'
                  }`}>
                    {room.type === 'official' ? <Building className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {room.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {room.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-500 truncate pr-2">
                        {lastMsg}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom user quick card */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                {currentUser?.name.slice(0, 1)}
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-800 block truncate">{currentUser?.name}</span>
                <span className="text-[10px] text-slate-400">{currentUser?.dong} {currentUser?.ho}</span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
              {currentUser?.residentType === 'owner' ? '소유자' : '세입자'}
            </span>
          </div>
        </div>

        {/* Right Area: Active Chat Conversation */}
        <div className={`flex-1 flex flex-col min-h-0 bg-[#BACEE0] ${!mobileShowRoom ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="bg-[#BACEE0] border-b border-[#a9bed0] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileShowRoom(false)}
                className="md:hidden text-slate-700 p-1 rounded hover:bg-black/10 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {activeRoom?.type === 'official' ? <Building className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {activeRoom?.name}
                </h3>
                <span className="text-[10px] text-slate-600">
                  참여자 {activeRoom?.participantCount}명 · 실시간 입주민 대화방
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeRoom?.type === 'official' && (
                <span className="hidden sm:inline text-[11px] bg-white/80 text-blue-800 px-2 py-0.5 rounded font-medium">
                  관리소 전담 응대 채널
                </span>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5"
          >
            {/* Safe conversation notice */}
            <div className="text-center my-2">
              <span className="text-[10px] bg-black/15 text-slate-700 px-3 py-1 rounded-full">
                이웃간 배려와 존중의 대화를 나누어 주세요. (동호수 인증 회원 전용)
              </span>
            </div>

            {messages.map(msg => {
              const isMe = currentUser && msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar if other */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5 border border-slate-200">
                      {msg.senderName.slice(0, 1)}
                    </div>
                  )}

                  <div className={`max-w-[75%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender name for others */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 mb-1">
                        <span className="font-bold">{msg.senderNickname}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({msg.senderDongHo})</span>
                        {msg.senderRole === 'manager' && (
                          <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">
                            관리소장
                          </span>
                        )}
                        {msg.senderRole === 'dong_rep' && (
                          <span className="text-[9px] bg-blue-200 text-blue-900 px-1 rounded font-bold">
                            동대표
                          </span>
                        )}
                      </div>
                    )}

                    {/* Speech bubble */}
                    <div className="flex items-end gap-1.5">
                      {isMe && (
                        <div className="text-right text-[10px] text-slate-500 font-mono leading-none pb-0.5">
                          <span className="text-amber-800 font-bold block">1</span>
                          <span>{msg.createdAt}</span>
                        </div>
                      )}

                      <div className={`p-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe 
                          ? 'bg-[#FEE500] text-slate-950 rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-tl-none'
                      }`}>
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="첨부 이미지"
                            className="rounded-lg max-h-48 w-auto mb-1.5 object-cover"
                          />
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {!isMe && (
                        <div className="text-left text-[10px] text-slate-500 font-mono leading-none pb-0.5">
                          <span className="text-amber-800 font-bold block">1</span>
                          <span>{msg.createdAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emoticons Quick Bar */}
          {showEmoticons && (
            <div className="bg-white px-4 py-2 border-t border-slate-200 flex items-center gap-3 overflow-x-auto">
              {emoticons.map((emo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prev => prev + emo);
                  }}
                  className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  {emo}
                </button>
              ))}
            </div>
          )}

          {/* Chat Composer Input */}
          <div className="bg-white p-3 border-t border-slate-200 shrink-0">
            <form onSubmit={handleSend} className="space-y-2">
              <textarea
                rows={2}
                placeholder="메시지를 입력하세요 (Enter: 전송)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmoticons(!showEmoticons)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="이모티콘"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSimulatedImage}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="사진 공유"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    inputText.trim()
                      ? 'bg-[#FEE500] hover:bg-[#ebd300] text-slate-900 shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>전송</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
