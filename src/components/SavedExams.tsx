import React, { useState, useMemo } from 'react';
import { Trash2, Edit2, Play, CheckSquare, Square, ArrowLeft, Save, Plus, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedExam, Question, AppTheme } from '../types';

interface SavedExamsProps {
  savedExams: SavedExam[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onStartExam: (questions: Question[]) => void;
  onBack: () => void;
  theme: AppTheme;
}

export const SavedExams: React.FC<SavedExamsProps> = ({
  savedExams,
  onDelete,
  onRename,
  onStartExam,
  onBack,
  theme
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExams = useMemo(() => {
    return savedExams.filter(exam => 
      exam.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedExams, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStartSelected = () => {
    const selectedExams = savedExams.filter(exam => selectedIds.includes(exam.id));
    const combinedQuestions = selectedExams.flatMap(exam => exam.questions);
    // Ensure unique IDs if needed, but flatMap should be fine if they are already unique
    onStartExam(combinedQuestions);
  };

  const startRename = (exam: SavedExam) => {
    setEditingId(exam.id);
    setEditName(exam.name);
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Saved Exams</h1>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleStartSelected}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              <Play className="w-4 h-4" /> Start ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {savedExams.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Save className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">No saved exams yet.</p>
          <p className="text-slate-400 dark:text-slate-500 mt-2">Save an exam from the results page to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredExams.map((exam) => (
              <motion.div
                key={exam.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative group p-6 rounded-3xl border-2 transition-all duration-300 ${
                  selectedIds.includes(exam.id)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-xl group-[.visual-liquid-glass]/liquid-glass:!bg-white/20 group-[.visual-liquid-glass]/liquid-glass:!border-white/40'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!border-white/30'
                } group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!border group-[.visual-liquid-glass]/liquid-glass:!shadow-none`}
              >
                <div className="flex justify-between items-start mb-4">
                  <button 
                    onClick={() => toggleSelect(exam.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedIds.includes(exam.id)
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-300 dark:text-slate-600 hover:text-indigo-400'
                    }`}
                  >
                    {selectedIds.includes(exam.id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                  </button>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => editingId === exam.id ? saveRename() : startRename(exam)}
                      className={`p-2 rounded-lg transition-all ${
                        editingId === exam.id 
                          ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      }`}
                      title={editingId === exam.id ? "Save Name" : "Rename"}
                    >
                      {editingId === exam.id ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => onDelete(exam.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingId === exam.id ? (
                  <div className="space-y-3">
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-indigo-500 rounded-xl focus:outline-none text-slate-900 dark:text-white font-bold"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{exam.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Plus className="w-3 h-3" /> {exam.questions.length} Questions
                      </span>
                      <span>{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                  </>
                )}

                {!editingId && (
                  <button
                    onClick={() => onStartExam(exam.questions)}
                    className="w-full mt-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Play className="w-4 h-4 group-hover/btn:fill-current" /> Start Exam
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
