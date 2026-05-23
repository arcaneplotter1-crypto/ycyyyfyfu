import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, Play, UserPlus, PlayCircle, Settings, Library, FileText, ArrowLeft, Shuffle, ChevronRight, Gamepad2, Settings2, User, Cat, Dog, Ghost, Skull, Star, Heart, Crown, Flame, Zap, Smile, Coffee, MessageSquare, X, ChevronUp, ChevronDown, QrCode } from 'lucide-react';
import { PeerSocket as Socket } from '../utils/peerSocket';
import { AppTheme, Question, ExamSettings, SavedExam } from '../types';
import { copyToClipboard } from '../utils';
import { ReadyExams } from './ReadyExams';
import { SavedExams } from './SavedExams';
import { AVATAR_OPTIONS, AvatarIcon } from './MultiplayerChat';

interface MultiplayerLobbyProps {
  socket: Socket | null;
  onBack: () => void;
  onJoinRoom: (roomId: string, mode: string, exam: Question[], settings: ExamSettings) => void;
  onStartParsing?: () => void;
  onConfigureSettings?: (settings: ExamSettings, exam: Question[], mode: string) => void;
  initialRoomId: string | null;
  onRoomCreated: (roomId: string) => void;
  theme: AppTheme;
  savedExams: SavedExam[];
}

import { QRCodeSVG } from 'qrcode.react';

export const MultiplayerLobby = ({ socket, onBack, onJoinRoom, onStartParsing, onConfigureSettings, initialRoomId, onRoomCreated, theme, savedExams }: MultiplayerLobbyProps) => {
  const [view, setView] = useState<'initial' | 'create' | 'join'>(() => {
    if (initialRoomId && !localStorage.getItem('participantName')) {
      return 'join';
    }
    return 'initial';
  });
  
  // Lobby state
  const [name, setName] = useState(localStorage.getItem('participantName') || '');
  const [avatar, setAvatar] = useState(localStorage.getItem('participantAvatar') || 'User');
  const [avatarBg1, setAvatarBg1] = useState(localStorage.getItem('participantAvatarBg1') || '#4f46e5');
  const [avatarBg2, setAvatarBg2] = useState(localStorage.getItem('participantAvatarBg2') || '#9333ea');
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [inRoom, setInRoom] = useState(() => {
    if (initialRoomId && !localStorage.getItem('participantName')) {
      return false;
    }
    return !!initialRoomId;
  });
  const [roomData, setRoomData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  // Host state
  const [hostView, setHostView] = useState<'lobby' | 'select-exam' | 'ready-exams' | 'saved-exams'>('lobby');
  const [showQR, setShowQR] = useState(false);

  // To prevent double join emitting on mount if we already are inRoom and have initialRoomId
  const [hasAutoJoined, setHasAutoJoined] = useState(false);

  useEffect(() => {
    if (!socket) return;
    
    const handleRoomUpdate = (data: any) => {
      setRoomData(data);
    };

    const handleExamStarted = () => {
      if (roomData?.exam) {
        onJoinRoom(roomData.id, roomData.mode, roomData.exam, roomData.settings);
      }
    };

    socket.on('room_update', handleRoomUpdate);
    socket.on('exam_started', handleExamStarted);

    if (initialRoomId && inRoom && !hasAutoJoined) {
       setHasAutoJoined(true);
       // Ask for room update from server since we just rejoined the component
       socket.emit('join_room', { roomId: initialRoomId, name: localStorage.getItem('participantName') || 'Player', avatar: localStorage.getItem('participantAvatar') || 'User', avatarBg1: localStorage.getItem('participantAvatarBg1') || '#4f46e5', avatarBg2: localStorage.getItem('participantAvatarBg2') || '#9333ea', participantId: localStorage.getItem('participantId') || null }, (res: any) => {
           if (res.success) {
               setInRoom(true);
           }
       });
    }

    return () => {
      socket.off('room_update', handleRoomUpdate);
      socket.off('exam_started', handleExamStarted);
    };
  }, [socket, roomData, onJoinRoom, initialRoomId, inRoom, hasAutoJoined]);

  const handleCreateRoom = () => {
    if (!name) return setError('Please enter your name');
    setError('');
    localStorage.setItem('participantName', name);
    localStorage.setItem('participantAvatar', avatar);
    localStorage.setItem('participantAvatarBg1', avatarBg1);
    localStorage.setItem('participantAvatarBg2', avatarBg2);
    socket?.emit('create_room', { name, avatar, avatarBg1, avatarBg2, participantId: localStorage.getItem('participantId') || null }, (res: any) => {
      if (res.success) {
        setRoomId(res.roomId);
        setInRoom(true);
        onRoomCreated(res.roomId);
      }
    });
  };

  const handleJoinRoom = () => {
    if (!name) return setError('Please enter your name');
    if (!roomId) return setError('Please enter a room ID');
    setError('');
    localStorage.setItem('participantName', name);
    localStorage.setItem('participantAvatar', avatar);
    localStorage.setItem('participantAvatarBg1', avatarBg1);
    localStorage.setItem('participantAvatarBg2', avatarBg2);
    socket?.emit('join_room', { roomId: roomId.toUpperCase(), name, avatar, avatarBg1, avatarBg2, participantId: localStorage.getItem('participantId') || null }, (res: any) => {
      if (res.success) {
        setInRoom(true);
        onRoomCreated(roomId.toUpperCase());
      } else {
        setError(res.error || 'Failed to join room');
      }
    });
  };

  const handleStartExam = () => {
    if (!roomData?.exam) {
      setError('Please select an exam first');
      return;
    }
    socket?.emit('start_exam', { roomId });
  };

  const copyRoomId = () => {
    copyToClipboard(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectExam = (qs: Question[], title?: string) => {
    // Generate basic settings if not present
    const settings = {
        timeLimitType: 'none',
        timeLimitValue: 60,
        instantFeedback: true,
        essaysLast: false,
        imagesLast: false,
        randomizeQuestions: false,
        powerSystemEnabled: false,
        guaranteedPowerPerCorrect: false
    };
    socket?.emit('update_settings', { roomId, exam: qs, settings, mode: 'independent' });
    setHostView('lobby');
  };

  if (!inRoom) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors group-[.visual-liquid-glass]/liquid-glass:!text-white/70 group-[.visual-liquid-glass]/liquid-glass:hover:!text-white">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-[.visual-liquid-glass]/liquid-glass:!text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:iridescent-text">Multiplayer Exam</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 group-[.visual-liquid-glass]/liquid-glass:!text-white/60">Take an exam together with friends</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center text-sm font-medium">{error}</div>}

        {view === 'initial' && (
          <div className="space-y-4">
            <button
              onClick={() => setView('create')}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-indigo-600/20 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/20"
            >
              <UserPlus className="w-5 h-5" /> Create a Room (Host)
            </button>
            <button
              onClick={() => setView('join')}
              className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center gap-3 transition-colors group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/15"
            >
              <Users className="w-5 h-5" /> Join a Room
            </button>
          </div>
        )}

        {view === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avatar</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {AVATAR_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAvatar(opt)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      avatar === opt
                        ? 'text-white shadow-lg scale-110'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                    }`}
                    style={avatar === opt ? { backgroundImage: `linear-gradient(to bottom right, ${avatarBg1}, ${avatarBg2})` } : {}}
                    title={opt}
                  >
                    <AvatarIcon name={opt} className="w-5 h-5" />
                  </button>
                ))}
              </div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avatar Colors</label>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <input type="color" value={avatarBg1} onChange={e => setAvatarBg1(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Color 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={avatarBg2} onChange={e => setAvatarBg2(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Color 2</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
              />
            </div>
            <button
              onClick={handleCreateRoom}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-5 h-5" /> Create Room
            </button>
            <button onClick={() => setView('initial')} className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm">Cancel</button>
          </div>
        )}

        {view === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Room Code</label>
              <input
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                placeholder="Enter 6-character code"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white uppercase font-mono tracking-widest text-center transition-all"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avatar</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {AVATAR_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAvatar(opt)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      avatar === opt
                        ? 'text-white shadow-lg scale-110'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                    }`}
                    style={avatar === opt ? { backgroundImage: `linear-gradient(to bottom right, ${avatarBg1}, ${avatarBg2})` } : {}}
                    title={opt}
                  >
                    <AvatarIcon name={opt} className="w-5 h-5" />
                  </button>
                ))}
              </div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avatar Colors</label>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <input type="color" value={avatarBg1} onChange={e => setAvatarBg1(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Color 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={avatarBg2} onChange={e => setAvatarBg2(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Color 2</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
              />
            </div>
            <button
              onClick={handleJoinRoom}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-5 h-5" /> Join Room
            </button>
            <button onClick={() => setView('initial')} className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm">Cancel</button>
          </div>
        )}
      </div>
    );
  }

  // Room Lobby View
  const isHost = roomData?.hostId === socket?.id;

  if (hostView === 'ready-exams') {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <ReadyExams 
                theme={theme} 
                onGenerate={() => {}} 
                onSaveExam={() => {}} 
                savedExams={savedExams} 
                setView={() => setHostView('lobby')} 
                overrideOnStart={(qs) => selectExam(qs)}
            />
        </div>
    );
  }

  if (hostView === 'saved-exams') {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <SavedExams 
                theme={theme} 
                savedExams={savedExams} 
                onDelete={() => {}} 
                onRename={() => {}} 
                onStartExam={(qs) => selectExam(qs)}
                onBack={() => setHostView('lobby')}
            />
        </div>
    )
  }

  if (hostView === 'select-exam') {
    return (
        <div className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none">
            <button onClick={() => setHostView('lobby')} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors group-[.visual-liquid-glass]/liquid-glass:!text-white/70 group-[.visual-liquid-glass]/liquid-glass:hover:!text-white">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center mb-8 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:iridescent-text">Select Exam for Lobby</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => {
                        if (onStartParsing) onStartParsing();
                    }}
                    className="p-6 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors text-indigo-700 dark:text-indigo-400 font-bold group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white"
                >
                    <FileText className="w-8 h-8" />
                    From Text/Data
                </button>
                <button
                    onClick={() => setHostView('ready-exams')}
                    className="p-6 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors text-amber-700 dark:text-amber-400 font-bold group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white"
                >
                    <Library className="w-8 h-8" />
                    From Ready Exams
                </button>
                <button
                    onClick={() => setHostView('saved-exams')}
                    className="p-6 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors text-emerald-700 dark:text-emerald-400 font-bold group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20 group-[.visual-liquid-glass]/liquid-glass:!text-white"
                >
                    <FileText className="w-8 h-8" />
                    From Saved Exams
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10">
        <div className="flex items-center gap-3">
            <button onClick={() => {
                socket?.emit('leave_room', { roomId });
                setInRoom(false);
                onBack();
            }} className="p-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors group-[.visual-liquid-glass]/liquid-glass:!text-white/70 group-[.visual-liquid-glass]/liquid-glass:hover:!text-white">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-[.visual-liquid-glass]/liquid-glass:!text-white" />
            </div>
            <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-[.visual-liquid-glass]/liquid-glass:!text-white">Exam Room</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 group-[.visual-liquid-glass]/liquid-glass:!text-white/60">Waiting for players...</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border-white/20">
            <span className="text-sm text-slate-500 font-medium group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Room Code:</span>
            <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase group-[.visual-liquid-glass]/liquid-glass:!text-white">{roomId}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={copyRoomId}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/70 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              {isHost && (
                <button
                  onClick={() => setShowQR(true)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/70 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-500" /> Join via QR
              </h3>
              <button onClick={() => setShowQR(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-4 border-indigo-50 dark:border-slate-800 shadow-sm">
               <QRCodeSVG 
                 value={`${process.env.APP_URL || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '')}?room=${roomId}`}
                 size={200}
                 bgColor="#ffffff"
                 fgColor="#000000"
                 level="H"
               />
            </div>

            <div className="text-center space-y-1">
              <p className="font-mono text-xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">{roomId}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Scan to join this room directly</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between group-[.visual-liquid-glass]/liquid-glass:!text-white">
                    Players ({roomData?.participants?.filter((p: any) => p.connected).length || 0})
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                    {roomData?.participants?.filter((p: any) => p.connected).map((p: any, idx: number) => (
                        <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!border-white/30"
                        >
                        <div className="flex items-center gap-3">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner shadow-black/20 ${!p.avatarBg1 ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-white'}`}
                              style={p.avatarBg1 ? { backgroundImage: `linear-gradient(to bottom right, ${p.avatarBg1}, ${p.avatarBg2})` } : {}}
                            >
                                <AvatarIcon name={p.avatar || 'User'} className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-[.visual-liquid-glass]/liquid-glass:!text-white">{p.name} {p.id === socket?.id && "(You)"}</span>
                        </div>
                        {p.id === roomData?.hostId && (
                            <span className="text-xs font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white/80 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/20">HOST</span>
                        )}
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none group-[.visual-liquid-glass]/liquid-glass:rounded-[2rem]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 group-[.visual-liquid-glass]/liquid-glass:!from-white/40 group-[.visual-liquid-glass]/liquid-glass:!to-white/10"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-[.visual-liquid-glass]/liquid-glass:!text-white">Exam Setup</h3>
                    </div>
                    {roomData?.exam ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Selected Exam</p>
                                        <p className="font-bold text-slate-900 dark:text-white group-[.visual-liquid-glass]/liquid-glass:!text-white">{roomData.exam.length} Questions</p>
                                    </div>
                                </div>
                                {isHost && (
                                    <button onClick={() => setHostView('select-exam')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10">
                                        Change
                                    </button>
                                )}
                            </div>
                            {isHost && onConfigureSettings && (
                                <div className="grid grid-cols-1 gap-3">
                                    <button 
                                      onClick={() => onConfigureSettings(roomData.settings, roomData.exam, roomData.mode)} 
                                      className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all text-left group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!border-white/30"
                                    >
                                        <div className="flex items-center gap-3">
                                           <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-indigo-500 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/20">
                                               <Settings className="w-4 h-4" />
                                           </div>
                                           <div>
                                               <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors group-[.visual-liquid-glass]/liquid-glass:!text-white">Exam Settings</p>
                                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 group-[.visual-liquid-glass]/liquid-glass:!text-white/50">Time limit, feedback, powers...</p>
                                           </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/40" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (socket) {
                                                socket.emit('update_settings', {
                                                    roomId: roomData.id,
                                                    exam: roomData.exam,
                                                    settings: roomData.settings,
                                                    mode: roomData.mode === 'independent' ? 'synchronized' : 'independent'
                                                });
                                            }
                                        }}
                                        className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all text-left group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!border-white/30"
                                    >
                                        <div className="flex items-center gap-3">
                                           <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-amber-500 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border-white/20">
                                               <Gamepad2 className="w-4 h-4" />
                                           </div>
                                           <div>
                                               <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors group-[.visual-liquid-glass]/liquid-glass:!text-white">Game Mode</p>
                                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium group-[.visual-liquid-glass]/liquid-glass:!text-white/50">
                                                   {roomData.mode === 'synchronized' ? 'Synchronized (Wait for all)' : 'Independent (Go at own pace)'}
                                               </p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                           <span className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded border border-amber-200/50 dark:border-amber-700/50 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white/80 group-[.visual-liquid-glass]/liquid-glass:!border-white/20">Switch</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No exam has been selected for this room yet.</p>
                            {isHost ? (
                                <button
                                    onClick={() => setHostView('select-exam')}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                                >
                                    <FileText className="w-5 h-5" /> Select Exam
                                </button>
                            ) : (
                                <div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">Waiting for host to select an exam...</div>
                            )}
                        </div>
                    )}
                </div>

                {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center text-sm font-medium">{error}</div>}

                {isHost ? (
                    <button
                        onClick={handleStartExam}
                        disabled={!roomData?.exam}
                        className={`w-full py-4 px-6 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl ${
                            roomData?.exam 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02] group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/30 group-[.visual-liquid-glass]/liquid-glass:!shadow-none' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!text-white/20 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10'
                        }`}
                    >
                        <PlayCircle className="w-6 h-6" /> Start Exam For All
                    </button>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white">
                        <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2 group-[.visual-liquid-glass]/liquid-glass:!border-white group-[.visual-liquid-glass]/liquid-glass:!border-t-transparent"></div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium group-[.visual-liquid-glass]/liquid-glass:!text-white/70">Waiting for host to start...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
