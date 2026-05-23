import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Users,
  Star,
  ArrowRight,
  Home,
  Layout,
  Medal,
  Crown,
  Timer,
  Target,
} from "lucide-react";
import { Question, EssayFeedback, AppTheme, ExamSettings } from "../types";
import { PeerSocket as Socket } from "../utils/peerSocket";
import { AvatarIcon } from "./MultiplayerChat";
import { calculateQuestionPoints } from "../utils/scoreUtils";

export const calculateTotalPossibleScore = (questions: Question[]) => {
  return questions.reduce((acc, q) => {
    if (q.type === 'mcq') return acc + 1;
    if (q.type === 'essay') return acc + 2;
    if (q.type === 'fill_in_blanks') return acc + (q.blanks?.length || 0) * 0.5;
    if (q.type === 'matching') return acc + ((q.matchingPairs?.length || 0) * 0.5);
    if (q.type === 'locate_on_image') return acc + 1.5;
    if (q.type === 'true_false') {
      return acc + (q.correctAnswer === 'False' && q.wrongPart ? 1.5 : 1);
    }
    if (q.type === 'multi_select') return acc + 1;
    return acc + 1;
  }, 0);
};

interface MultiplayerLeaderboardProps {
  questions: Question[];
  answers: Record<string, string>;
  essayFeedback: Record<string, EssayFeedback>;
  wrongPartSelections?: Record<string, string>;
  onReview: () => void;
  onRestart: () => void;
  theme: AppTheme;
  settings: ExamSettings;
  multiplayerSocket?: Socket | null;
  multiplayerRoomId?: string | null;
}

const MultiplayerLeaderboard: React.FC<MultiplayerLeaderboardProps> = ({
  questions,
  answers,
  essayFeedback,
  wrongPartSelections,
  onReview,
  onRestart,
  theme,
  settings,
  multiplayerSocket,
  multiplayerRoomId,
}) => {
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    if (multiplayerSocket && multiplayerRoomId) {
      const handleRoomUpdate = (data: any) => {
        // Deep clone to ensure a fresh reference so React always re-renders when host state changes
        setRoomData(JSON.parse(JSON.stringify(data)));
      };
      multiplayerSocket.on("room_update", handleRoomUpdate);
      // Trigger a room update to get the latest stats
      multiplayerSocket.emit(
        "join_room",
        {
          roomId: multiplayerRoomId,
          name: localStorage.getItem("participantName") || "Player",
          avatar: localStorage.getItem('participantAvatar') || 'User',
          participantId: localStorage.getItem('participantId') || null
        },
        () => {},
      );

      return () => {
        multiplayerSocket.off("room_update", handleRoomUpdate);
      };
    }
  }, [multiplayerSocket, multiplayerRoomId]);

  const score = questions.reduce((acc, q) => {
    return acc + calculateQuestionPoints(q, answers[q.id], wrongPartSelections?.[q.id], essayFeedback[q.id]);
  }, 0);

  const totalPossiblePoints = roomData?.exam ? calculateTotalPossibleScore(roomData.exam) : calculateTotalPossibleScore(questions);
  const percentage = Math.round((score / Math.max(totalPossiblePoints, 1)) * 100);

  const totalQuestions = roomData?.exam?.length || questions.length;

  const sortedParticipants =
    roomData?.participants?.sort((a: any, b: any) => {
      // Finished users always rank higher
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      // Then sort by score
      if (b.score !== a.score) return b.score - a.score;
      // Then sort by time (lower is better, assuming non-zero times mean finished or partial progress)
      if (a.time !== 0 && b.time !== 0) return a.time - b.time;
      // Finally, if both unfinished and similar score, we could rank by progress (number of answers)
      const aAnswers = Object.keys(
        roomData?.answers?.[a.participantId] || {},
      ).length;
      const bAnswers = Object.keys(
        roomData?.answers?.[b.participantId] || {},
      ).length;
      if (bAnswers !== aAnswers) return bAnswers - aAnswers;
      return 0;
    }) || [];

  const finishedParticipants = sortedParticipants.filter(
    (p: any) => p.finished,
  );
  const unfinishedParticipants = sortedParticipants.filter(
    (p: any) => !p.finished,
  );

  // No one gets added to the top 3 unless they finish the exam
  const top3 = finishedParticipants.slice(0, 3);
  const others = [...finishedParticipants.slice(3), ...unfinishedParticipants];

  const myRank =
    sortedParticipants.findIndex((p: any) => p.id === multiplayerSocket?.id) +
    1;

  const isArcane = theme.visualStyle === "arcane";

  const renderPodiumItem = (p: any, idx: number, positionOffset: number) => {
    if (!p) return null;
    const isMe = p.id === multiplayerSocket?.id;
    const rank = idx + 1;

    // 1st place in center (delay 0.8), 2nd place on left (delay 0.4), 3rd place on right (delay 0.6)
    const delay = rank === 1 ? 0.8 : rank === 2 ? 0.4 : 0.6;
    const height = rank === 1 ? "h-48" : rank === 2 ? "h-36" : "h-28";
    const bgOpacity =
      rank === 1
        ? "bg-amber-400"
        : rank === 2
          ? "bg-slate-300"
          : "bg-orange-400";
    const iconColor =
      rank === 1
        ? "text-amber-500"
        : rank === 2
          ? "text-slate-400"
          : "text-orange-500";

    return (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 80, damping: 12 }}
        className={`flex flex-col items-center justify-end z-${40 - rank * 10} relative`}
        style={{
          order: rank === 1 ? 2 : rank === 2 ? 1 : 3,
          transform: `translateY(${positionOffset}px)`,
        }}
      >
        {/* Confetti / Glow effect inside the podium item space */}
        {rank === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute -top-24 w-full h-full pointer-events-none"
          >
            <div className="absolute inset-x-0 top-0 h-32 bg-amber-400/20 blur-3xl rounded-full" />
          </motion.div>
        )}

        <div className="text-center mb-4 space-y-1 relative z-10 w-full px-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="flex justify-center mb-2 relative"
          >
            <div 
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-inner ${rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-slate-300' : 'border-orange-400'} ${!p.avatarBg1 ? 'bg-white/10 backdrop-blur-md text-amber-500' : 'text-white'}`}
              style={p.avatarBg1 ? { backgroundImage: `linear-gradient(to bottom right, ${p.avatarBg1}, ${p.avatarBg2})` } : {}}
            >
              <AvatarIcon name={p.avatar || 'User'} className="w-6 h-6" />
            </div>
            <div className="absolute -top-3 -right-3">
              {rank === 1 ? (
                <Crown
                  className={`w-8 h-8 ${iconColor} drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-bounce-soft`}
                />
              ) : (
                <Medal className={`w-6 h-6 ${iconColor} drop-shadow-lg`} />
              )}
            </div>
          </motion.div>
          <div
            className={`font-black italic truncate max-w-[100px] sm:max-w-xs ${isMe ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-100"}`}
          >
            {p.name}
          </div>
          <div className="text-xl font-black">{p.score}</div>
          <div className="text-xs font-bold text-slate-500">
            {p.time > 0 ? `${(p.time / 1000).toFixed(1)}s` : "--"}
          </div>
          {isMe && (
            <div className="text-[10px] bg-indigo-600 text-white rounded-full px-2 py-0.5 inline-block font-bold">
              YOU
            </div>
          )}
        </div>

        <div
          className={`w-28 sm:w-32 ${height} ${bgOpacity} rounded-t-2xl relative shadow-2xl flex flex-col items-center justify-start pt-4 border-2 border-white/20 overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
          <span className="text-5xl font-black text-white/50">{rank}</span>
          {!p.finished && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-4 py-12 ${isArcane ? "arcane-theme" : ""}`}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 font-black text-xs tracking-[0.2em] uppercase border border-indigo-600/20 dark:border-indigo-400/20 backdrop-blur-md"
          >
            <Trophy className="w-4 h-4" />
            BATTLE REPORT
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-6xl sm:text-8xl font-black italic tracking-tighter leading-none ${isArcane ? "text-glow-indigo" : ""}`}
            style={{
              textShadow: isArcane
                ? "0 0 20px var(--accent-color, #6366f1)"
                : "none",
              color: isArcane ? "var(--accent-color, #6366f1)" : "inherit",
            }}
          >
            GLORY{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              WAITING
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-xs"
          >
            ROOM{" "}
            <span className="font-mono text-indigo-500">
              {multiplayerRoomId}
            </span>{" "}
            • SECTOR {sortedParticipants.length}
          </motion.p>
        </div>{" "}
        {/* Leaderboard Section */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border-4 border-white/20 dark:border-slate-800/20 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
          <div className="p-10 border-b-4 border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between bg-gradient-to-r from-transparent via-indigo-50/10 to-transparent group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter">
                BATTLEFIELD STATUS
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <span>SCORE</span>
              <span className="w-20 text-right">TIME</span>
            </div>
          </div>

          <div className="px-4 py-4 space-y-3">
            {top3.length > 0 && (
              <div className="flex justify-center items-end gap-2 sm:gap-6 pt-12 pb-8 overflow-hidden min-h-[350px]">
                {top3.map((p, idx) => renderPodiumItem(p, idx, 0))}
              </div>
            )}

            {others.map((p: any, idx: number) => {
              const isMe = p.id === multiplayerSocket?.id;
              const globalIdx = top3.length + idx;
              const pAnswersCount = Object.keys(
                roomData?.answers?.[p.participantId] || {},
              ).length;
              const remaining = Math.max(0, totalQuestions - pAnswersCount);

              return (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.5 + idx * 0.08,
                    type: "spring",
                    stiffness: 100,
                  }}
                  key={p.id}
                  className={`flex items-center justify-between p-6 rounded-[2.5rem] transition-all relative overflow-hidden ${isMe ? "bg-indigo-600 text-white shadow-xl scale-[1.02] z-10" : "hover:bg-white/60 dark:hover:bg-slate-800/60"} group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!border-white/30`}
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center shrink-0 relative">
                        <span
                          className={`text-xl font-black italic mr-2 ${isMe ? "text-white/40" : "text-slate-400 dark:text-slate-600"} group-[.visual-liquid-glass]/liquid-glass:!text-white/40`}
                        >
                          {globalIdx + 1 < 10
                            ? `0${globalIdx + 1}`
                            : globalIdx + 1}
                        </span>
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${!p.avatarBg1 ? (isMe ? 'border border-slate-200/20 bg-slate-100/10 text-white' : 'border border-slate-200/20 bg-slate-100 text-indigo-600') : 'text-white shadow-inner'}`}
                          style={p.avatarBg1 ? { backgroundImage: `linear-gradient(to bottom right, ${p.avatarBg1}, ${p.avatarBg2})` } : {}}
                        >
                          <AvatarIcon name={p.avatar || 'User'} className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xl font-black italic tracking-tight ${isMe ? "text-white" : "text-slate-900 dark:text-slate-50"} group-[.visual-liquid-glass]/liquid-glass:!text-white`}
                        >
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="px-3 py-1 bg-white/20 text-[10px] font-black text-white rounded-full backdrop-blur-md border border-white/30">
                            OPERATOR
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${p.finished ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
                        />
                        <span
                          className={`text-[10px] font-black tracking-widest uppercase ${isMe ? "text-white/60" : "text-slate-400"} group-[.visual-liquid-glass]/liquid-glass:!text-white/40`}
                        >
                          {p.finished
                            ? "MISSION COMPLETE"
                            : `IN PROGRESS - ${remaining} REMAINING`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 relative z-10">
                    <div className="text-right">
                      <div
                        className={`text-3xl font-black italic leading-none ${isMe ? "text-white" : "text-indigo-600"} group-[.visual-liquid-glass]/liquid-glass:!text-white`}
                      >
                        {p.score}{" "}
                        <span
                          className={`text-[10px] font-black not-italic tracking-widest ${isMe ? "text-white/50" : "text-slate-400"} group-[.visual-liquid-glass]/liquid-glass:!text-white/50`}
                        >
                          PTS
                        </span>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <div
                        className={`flex items-center justify-end gap-1.5 font-mono text-sm font-bold ${isMe ? "text-white/80" : "text-slate-500"}`}
                      >
                        <Timer className="w-3.5 h-3.5" />
                        {p.time > 0 ? `${(p.time / 1000).toFixed(1)}s` : "--"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="p-10 bg-slate-50/30 dark:bg-slate-800/30 border-t-4 border-slate-100/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-center gap-6 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10">
            <button
              onClick={onReview}
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-black italic tracking-tight border-4 border-slate-200 dark:border-slate-700 rounded-[2rem] hover:border-indigo-600 hover:scale-105 transition-all flex items-center justify-center gap-3 group shadow-2xl group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!text-white group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/30 group-[.visual-liquid-glass]/liquid-glass:!shadow-none"
            >
              <Layout className="w-6 h-6 text-indigo-600 group-[.visual-liquid-glass]/liquid-glass:!text-white" />
              ARCHIVE REVIEW
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </button>
          </div>
        </div>
        {/* User Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="p-8 rounded-[3rem] bg-indigo-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] relative overflow-hidden group border-4 border-white/20 group-[.visual-liquid-glass]/liquid-glass:!bg-white/10 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/30 group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-500 group-[.visual-liquid-glass]/liquid-glass:!opacity-5">
              <Star className="w-20 h-20 fill-white" />
            </div>
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-black tracking-[0.3em] opacity-70 uppercase group-[.visual-liquid-glass]/liquid-glass:!text-white/60">
                FINAL RANK
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black italic">
                  #{myRank || "-"}
                </span>
                <span className="text-xl font-bold opacity-70 group-[.visual-liquid-glass]/liquid-glass:!text-white/60">
                  / {sortedParticipants.length}
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
          </div>

          <div className="p-8 rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-4 border-slate-100 dark:border-slate-800 shadow-2xl space-y-1 group hover:border-indigo-500/50 transition-colors group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase group-[.visual-liquid-glass]/liquid-glass:!text-white/40">
              PRECISION
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black italic text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 transition-colors group-[.visual-liquid-glass]/liquid-glass:!text-white/90">
                {percentage}%
              </span>
              <span className="text-xl font-bold text-slate-500 group-[.visual-liquid-glass]/liquid-glass:!text-white/40">
                {score}/{totalPossiblePoints} pts
              </span>
            </div>
          </div>

          <div className="p-8 rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-4 border-slate-100 dark:border-slate-800 shadow-2xl space-y-1 group hover:border-indigo-500/50 transition-colors group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase group-[.visual-liquid-glass]/liquid-glass:!text-white/40">
              INTEL CAPTURED
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black italic text-indigo-600 group-[.visual-liquid-glass]/liquid-glass:!text-white">
                {score}
              </span>
              <Target className="w-8 h-8 text-indigo-400 ml-2 animate-pulse group-[.visual-liquid-glass]/liquid-glass:!text-white/60" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-1/4 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default MultiplayerLeaderboard;
