import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Cat, Dog, Ghost, Skull, Star, Heart, Crown, Flame, Zap, Smile, Coffee, MessageSquare, X, ChevronUp, ChevronDown, Send, Gem, Trophy, Shield, Rocket, Target, Sword, Music, Sun, Moon, Cloud, Camera, Gamepad2, Anchor, Award, Sparkles } from 'lucide-react';
import { PeerSocket as Socket } from '../utils/peerSocket';

export const AVATAR_OPTIONS = [
  'User', 'Cat', 'Dog', 'Ghost', 'Skull', 'Star', 'Heart', 'Crown', 'Flame', 'Zap', 'Smile', 'Coffee',
  'Gem', 'Trophy', 'Shield', 'Rocket', 'Target', 'Sword', 'Music', 'Sun', 'Moon', 'Cloud', 'Camera', 'Gamepad2', 'Anchor', 'Award', 'Sparkles'
];

export const AvatarIcon = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'Cat': return <Cat className={className} />;
    case 'Dog': return <Dog className={className} />;
    case 'Ghost': return <Ghost className={className} />;
    case 'Skull': return <Skull className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Gem': return <Gem className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Rocket': return <Rocket className={className} />;
    case 'Target': return <Target className={className} />;
    case 'Sword': return <Sword className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Sun': return <Sun className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'Cloud': return <Cloud className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'Anchor': return <Anchor className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    default: return <User className={className} />;
  }
};

interface ChatMessage {
  id: string;
  name: string;
  avatar?: string;
  avatarBg1?: string;
  avatarBg2?: string;
  message: string;
  time: number;
  isSystem?: boolean;
}

interface MultiplayerChatProps {
  socket: Socket | null;
  roomData: any;
  currentUserId: string;
}

export const MultiplayerChat = ({ socket, roomData, currentUserId }: MultiplayerChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatMessages: ChatMessage[] = roomData?.chat || [];

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    } else {
      // Just a simple way to track unread if closed (though since roomData updates on every msg, it triggers render)
      // For precise unread, we'd compare length
    }
  }, [chatMessages.length, isOpen]);

  useEffect(() => {
    if (!isOpen && chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (!lastMsg.isSystem && lastMsg.id !== localStorage.getItem('lastReadMsgId')) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    
    const participant = roomData?.participants?.find((p: any) => p.id === socket.id);
    const name = participant?.name || localStorage.getItem('participantName') || 'Player';
    const avatar = participant?.avatar || localStorage.getItem('participantAvatar') || 'User';
    const avatarBg1 = participant?.avatarBg1 || localStorage.getItem('participantAvatarBg1') || '#4f46e5';
    const avatarBg2 = participant?.avatarBg2 || localStorage.getItem('participantAvatarBg2') || '#9333ea';
    
    socket.emit('send_chat', { name, avatar, avatarBg1, avatarBg2, message: message.trim() });
    setMessage('');
  };

  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
    if (chatMessages.length > 0) {
      localStorage.setItem('lastReadMsgId', chatMessages[chatMessages.length - 1].id);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none"
            style={{ maxHeight: 'calc(100vh - 120px)', height: '500px' }}
          >
            {/* Header */}
            <div className="bg-indigo-600 px-4 py-3 text-white flex items-center justify-between group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border-b group-[.visual-liquid-glass]/liquid-glass:!border-white/10">
              <div className="flex items-center gap-2 font-bold">
                <MessageSquare className="w-5 h-5 group-[.visual-liquid-glass]/liquid-glass:!text-white" />
                <span className="group-[.visual-liquid-glass]/liquid-glass:!text-white">Room Chat</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md transition-colors group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10">
                <ChevronDown className="w-5 h-5 group-[.visual-liquid-glass]/liquid-glass:!text-white" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No messages yet. Say hello!
                </div>
              ) : (
                chatMessages.map((msg: ChatMessage) => {
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 my-2">
                        — {msg.message} —
                      </div>
                    );
                  }
                  
                  const isMe = roomData?.participants?.find((p: any) => p.name === msg.name)?.id === currentUserId || msg.name === localStorage.getItem('participantName');
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div 
                          className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold shadow-inner ${!msg.avatarBg1 ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-white'}`}
                          style={msg.avatarBg1 ? { backgroundImage: `linear-gradient(to bottom right, ${msg.avatarBg1}, ${msg.avatarBg2})` } : {}}
                        >
                          <AvatarIcon name={msg.avatar || 'User'} className="w-4 h-4" />
                        </div>
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-xs text-slate-500 mb-1 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">{msg.name}</span>
                          <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10'}`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors group-[.visual-liquid-glass]/liquid-glass:!bg-black/20 group-[.visual-liquid-glass]/liquid-glass:!border-white/10"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors flex shrink-0 items-center justify-center group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:disabled:!opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={openChat}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl relative transition-transform hover:scale-105 active:scale-95 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!backdrop-blur-xl group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 group-[.visual-liquid-glass]/liquid-glass:!border-white/40">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
