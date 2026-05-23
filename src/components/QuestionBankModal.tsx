import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Map as MapIcon, X, Trash2, Check, Search } from 'lucide-react';
import { Question, AppTheme } from '../types';

interface QuestionBankModalProps {
  bank: Question[];
  onDeleteFromBank: (ids: string[]) => void;
  onStartExam: (questions: Question[]) => void;
  onClose: () => void;
  theme: AppTheme;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({ 
  bank, 
  onDeleteFromBank, 
  onStartExam, 
  onClose,
  theme
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const isArcane = theme.visualStyle === 'arcane' || theme.visualStyle === 'virus';

  const getArcaneStyles = () => {
    if (!isArcane) return { border: 'border-slate-100 dark:border-slate-800', glow: '', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', accent: 'bg-brand-primary', buttonText: 'text-white' };
    
    switch (theme.accentColor) {
      case 'arcane-red': return { border: 'border-red-500/50', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', text: 'text-red-500', bg: 'bg-red-500/10', accent: 'bg-red-600', buttonText: 'text-white' };
      case 'arcane-blue': return { border: 'border-blue-500/50', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', text: 'text-blue-500', bg: 'bg-blue-500/10', accent: 'bg-blue-600', buttonText: 'text-white' };
      case 'arcane-gold': return { border: 'border-amber-500/50', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', text: 'text-amber-500', bg: 'bg-amber-500/10', accent: 'bg-amber-600', buttonText: 'text-white' };
      case 'arcane-green': return { border: 'border-emerald-500/50', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', text: 'text-emerald-500', bg: 'bg-emerald-500/10', accent: 'bg-emerald-600', buttonText: 'text-white' };
      default: return { border: 'border-purple-500/50', glow: 'shadow-[0_0_20px_rgba(138,43,226,0.3)]', text: 'text-purple-500', bg: 'bg-purple-500/10', accent: 'bg-purple-600', buttonText: 'text-white' };
    }
  };

  const arcane = getArcaneStyles();

  const filteredBank = bank.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    const inQuestion = q.question.toLowerCase().includes(searchLower);
    const inOptions = q.options?.some(opt => opt.toLowerCase().includes(searchLower)) || false;
    const inCorrectAnswer = q.correctAnswer?.toLowerCase().includes(searchLower) || false;
    return inQuestion || inOptions || inCorrectAnswer;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBank.length && filteredBank.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBank.map(q => q.id)));
    }
  };

  const handleStart = () => {
    const selected = bank.filter(q => selectedIds.has(q.id));
    if (selected.length > 0) {
      onStartExam(selected);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    onDeleteFromBank(Array.from(selectedIds));
    setSelectedIds(new Set());
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
        className={`brutal-modal bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl w-full max-w-3xl p-5 sm:p-8 border-2 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-500 ${arcane.border} ${arcane.glow}`}
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
              <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <h3 className={`text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-none transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-900 dark:text-white'}`}>Question Bank</h3>
              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isArcane ? arcane.text : 'text-amber-500'}`}>Your saved questions collection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors no-hat">
            <X className={`w-5 h-5 sm:w-6 sm:h-6 ${isArcane ? arcane.text : 'text-slate-600 dark:text-slate-400'}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative group">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isArcane ? arcane.text : 'text-slate-400 group-focus-within:text-indigo-500'}`}>
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search questions or options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 transition-all duration-500 text-xs sm:text-sm font-bold outline-none no-hat ${
              isArcane 
                ? `${arcane.border} ${arcane.bg} ${arcane.text} placeholder:${arcane.text}/50 focus:border-opacity-100` 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/50 text-slate-900 dark:text-white placeholder:text-slate-400'
            }`}
          />
        </div>

        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-500 gap-4 mb-6 sm:mb-8 ${isArcane ? `${arcane.bg} ${arcane.border}` : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700'}`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={toggleSelectAll}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all no-hat ${isArcane ? `${arcane.border} ${arcane.text} bg-white/10` : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
            >
              {selectedIds.size === filteredBank.length && filteredBank.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isArcane ? arcane.text : 'text-slate-400'}`}>{selectedIds.size} Selected</span>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest transition-colors no-hat"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
          <button
            onClick={handleStart}
            disabled={selectedIds.size === 0}
            className={`px-6 py-2.5 font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl disabled:opacity-50 transition-all shadow-lg active:scale-[0.98] no-hat ${arcane.accent} ${arcane.buttonText} ${isArcane ? arcane.glow : 'shadow-indigo-500/20 hover:bg-indigo-700'}`}
          >
            Start Exam with Selected
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {filteredBank.length > 0 ? (
              filteredBank.map((q) => (
                <button
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-4 sm:p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 no-hat relative group ${
                    selectedIds.has(q.id)
                      ? (isArcane ? `${arcane.border} ${arcane.bg}` : 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20')
                      : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedIds.has(q.id) 
                      ? (isArcane ? `${arcane.accent} border-transparent text-white` : 'bg-indigo-600 border-indigo-600 text-white') 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {selectedIds.has(q.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-3 h-3 sm:w-4 sm:h-4" /></motion.div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isArcane ? arcane.bg + ' ' + arcane.text : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40'}`}>
                        {q.type}
                      </span>
                      {q.imageUrl && <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">Image</span>}
                    </div>
                    <p className={`text-xs sm:text-sm font-bold line-clamp-2 leading-relaxed ${isArcane ? arcane.text : 'text-slate-800 dark:text-slate-200'}`}>{q.question}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className={`text-center py-12 rounded-[2rem] border-2 border-dashed transition-colors duration-500 ${isArcane ? arcane.border + ' ' + arcane.bg : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'}`}>
                <MapIcon className={`w-12 h-12 mx-auto mb-4 ${isArcane ? arcane.text : 'text-slate-300 dark:text-slate-600'}`} />
                <p className={`text-xs font-bold uppercase tracking-widest ${isArcane ? arcane.text : 'text-slate-400'}`}>
                  {searchTerm ? 'No questions match your search' : 'Your question bank is empty'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Save questions during exams to see them here!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
