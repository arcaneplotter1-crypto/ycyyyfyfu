import React from 'react';
import { motion } from 'motion/react';
import { History, X, Trash2, PlayCircle, Edit3, Check, Save } from 'lucide-react';
import { ExamHistoryItem, AppTheme, Question } from '../types';

interface HistoryModalProps {
  history: ExamHistoryItem[];
  onDeleteHistory: (id: string) => void;
  onRenameHistory: (id: string, newName: string) => void;
  onRetakeHistory: (item: ExamHistoryItem) => void;
  onSaveExam: (name: string, questions: Question[]) => void;
  onClose: () => void;
  theme: AppTheme;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  history, 
  onDeleteHistory,
  onRenameHistory,
  onRetakeHistory,
  onSaveExam,
  onClose,
  theme
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const isArcane = theme.visualStyle === 'arcane' || theme.visualStyle === 'virus';

  const getArcaneStyles = () => {
    if (!isArcane) return { border: 'border-slate-100 dark:border-slate-800', glow: '', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', accent: 'bg-brand-primary' };
    
    switch (theme.accentColor) {
      case 'arcane-red': return { border: 'border-red-500/50', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', text: 'text-red-500', bg: 'bg-red-500/10', accent: 'bg-red-600' };
      case 'arcane-blue': return { border: 'border-blue-500/50', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', text: 'text-blue-500', bg: 'bg-blue-500/10', accent: 'bg-blue-600' };
      case 'arcane-gold': return { border: 'border-amber-500/50', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', text: 'text-amber-500', bg: 'bg-amber-500/10', accent: 'bg-amber-600' };
      case 'arcane-green': return { border: 'border-emerald-500/50', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', text: 'text-emerald-500', bg: 'bg-emerald-500/10', accent: 'bg-emerald-600' };
      default: return { border: 'border-purple-500/50', glow: 'shadow-[0_0_20px_rgba(138,43,226,0.3)]', text: 'text-purple-500', bg: 'bg-purple-500/10', accent: 'bg-purple-600' };
    }
  };

  const arcane = getArcaneStyles();

  const handleStartRename = (item: ExamHistoryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameHistory(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`brutal-modal bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-5 sm:p-8 border-2 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-500 ${arcane.border} ${arcane.glow}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arcane Decorative Elements */}
        {isArcane && (
          <>
            <div className={`absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 rounded-tl-[2.5rem] pointer-events-none opacity-50 ${arcane.border}`} />
            <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 rounded-br-[2.5rem] pointer-events-none opacity-50 ${arcane.border}`} />
          </>
        )}

        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${arcane.bg} ${arcane.text}`}>
              <History className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <h3 className={`text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-none transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-900 dark:text-white'}`}>Exam History</h3>
              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isArcane ? arcane.text : 'text-indigo-500'}`}>Your past performance records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors no-hat">
            <X className={`w-5 h-5 sm:w-6 sm:h-6 ${isArcane ? arcane.text : 'text-slate-600 dark:text-slate-400'}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className={`p-4 sm:p-6 rounded-2xl border transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(item.id)}
                          onBlur={() => handleSaveRename(item.id)}
                          className={`w-full bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-bold outline-none shadow-lg border-2 ${isArcane ? arcane.border + ' ' + arcane.text : 'border-indigo-500 text-slate-700 dark:text-slate-200'}`}
                        />
                        <button onClick={() => handleSaveRename(item.id)} className={`p-2 rounded-xl ${arcane.accent} text-white`}>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isArcane ? arcane.bg + ' ' + arcane.text : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40'}`}>
                            {item.totalQuestions} Questions
                          </span>
                        </div>
                        <h4 className={`font-bold truncate ${isArcane ? arcane.text : 'text-slate-800 dark:text-slate-200'}`}>{item.name || 'Exam Session'}</h4>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className={`flex items-center gap-1 mb-0.5 ${isArcane ? arcane.text : 'text-amber-500'}`}>
                        <PlayCircle className="w-3 h-3" />
                        <span className="text-xs font-black">{item.score}%</span>
                      </div>
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRetakeHistory(item)}
                        className={`p-2 text-white rounded-xl transition-all shadow-lg no-hat hover:scale-110 ${arcane.accent} ${isArcane ? arcane.glow : 'shadow-indigo-500/20'}`}
                        title="Retake Exam"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSaveExam(item.name, item.questions)}
                        className={`p-2 rounded-xl transition-colors no-hat ${isArcane ? 'hover:bg-white/10 ' + arcane.text : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Save to Saved Exams"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartRename(item)}
                        className={`p-2 rounded-xl transition-colors no-hat ${isArcane ? 'hover:bg-white/10 ' + arcane.text : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Rename"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteHistory(item.id)}
                        className={`p-2 text-rose-500 rounded-xl transition-colors no-hat ${isArcane ? 'hover:bg-rose-500/20' : 'hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 rounded-[2rem] border-2 border-dashed transition-colors duration-500 ${isArcane ? arcane.border + ' ' + arcane.bg : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'}`}>
                <History className={`w-12 h-12 mx-auto mb-4 ${isArcane ? arcane.text : 'text-slate-300 dark:text-slate-600'}`} />
                <p className={`text-xs font-bold uppercase tracking-widest ${isArcane ? arcane.text : 'text-slate-400'}`}>No exam history found</p>
                <p className="text-[10px] text-slate-500 mt-1">Complete an exam to see your results here!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
