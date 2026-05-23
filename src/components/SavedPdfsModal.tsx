import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Search, Trash2, Edit3, ExternalLink, Library, Layers, ChevronRight, Plus, Check, Play, BookOpen } from 'lucide-react';
import { SavedPdf, AppTheme } from '../types';
import { getArcaneStyles } from '../utils/arcaneThemes';

interface SavedPdfsModalProps {
  theme: AppTheme;
  savedPdfs: SavedPdf[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onReopen: (pdf: SavedPdf) => void;
  onCombine: (ids: string[], newName: string) => void;
  onClose: () => void;
}

export const SavedPdfsModal: React.FC<SavedPdfsModalProps> = ({
  theme,
  savedPdfs,
  onDelete,
  onRename,
  onReopen,
  onCombine,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCombining, setIsCombining] = useState(false);
  const [combineName, setCombineName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isArcane = theme.visualStyle === 'arcane' || theme.visualStyle === 'virus';
  const arcane = isArcane 
    ? getArcaneStyles(theme.accentColor) 
    : { border: 'border-slate-200 dark:border-slate-800', glow: '', text: 'text-indigo-600', bg: 'bg-white dark:bg-slate-900' };

  const filtered = savedPdfs.filter(pdf => 
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCombine = () => {
    if (selectedIds.length < 2) return;
    const name = combineName || `Combined PDF ${new Date().toLocaleDateString()}`;
    onCombine(selectedIds, name);
    setSelectedIds([]);
    setIsCombining(false);
    setCombineName('');
  };

  const startEditing = (pdf: SavedPdf) => {
    setEditingId(pdf.id);
    setEditName(pdf.name);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const confirmDeletion = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const activeColor = isArcane ? arcane.text : 'text-indigo-500';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border-2 transition-all duration-500 flex flex-col max-h-[90vh] overflow-hidden ${arcane.border} ${arcane.glow}`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 ${arcane.border}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isArcane ? arcane.bg : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
              <Library className={`w-6 h-6 ${activeColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-black uppercase tracking-tight ${isArcane ? arcane.text : 'text-slate-900 dark:text-white'}`}>Saved PDFs</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{savedPdfs.length} Documents in Library</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            {selectedIds.length >= 2 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsCombining(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" /> Combine ({selectedIds.length})
              </motion.button>
            )}
            <button 
              onClick={() => setSelectedIds([])}
              disabled={selectedIds.length === 0}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">No documents found</h3>
              <p className="text-sm text-slate-500 mt-2">Saved documents will appear here for quick access.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(pdf => (
                <motion.div
                  layout
                  key={pdf.id}
                  className={`group relative p-5 rounded-3xl border-2 transition-all duration-300 ${selectedIds.includes(pdf.id) ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl'}`}
                >
                  <button 
                    onClick={() => handleToggleSelect(pdf.id)}
                    className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(pdf.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-0 group-hover:opacity-100'}`}
                  >
                    {selectedIds.includes(pdf.id) && <Check className="w-4 h-4" />}
                  </button>

                  <div 
                    className="flex flex-col gap-4 cursor-pointer"
                    onClick={() => handleToggleSelect(pdf.id)}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isArcane ? arcane.bg : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                      <FileText className={`w-6 h-6 ${activeColor}`} />
                    </div>
                    
                    <div className="space-y-1">
                      {editingId === pdf.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                            onBlur={confirmRename}
                            className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black outline-none border border-indigo-500"
                          />
                        </div>
                      ) : (
                        <h4 className="font-black text-slate-900 dark:text-white line-clamp-1 leading-tight">{pdf.name}</h4>
                      )}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(pdf.date).toLocaleDateString()} • {pdf.documents.length} Chapters
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReopen(pdf);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <BookOpen className="w-3 h-3" /> Open
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(pdf);
                        }}
                        className={`p-2.5 rounded-xl transition-colors ${editingId === pdf.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(pdf.id);
                        }}
                        className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Combine Modal Overlay */}
        <AnimatePresence>
          {isCombining && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="max-w-sm w-full space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Combine PDFs</h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Merging {selectedIds.length} Selected Documents</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Combined Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. My Study Bundle"
                      value={combineName}
                      onChange={(e) => setCombineName(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-3xl border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleCombine}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform"
                    >
                      Combine Now
                    </button>
                    <button
                      onClick={() => setIsCombining(false)}
                      className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-3xl font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deletion Confirmation Overlay */}
        <AnimatePresence>
          {deletingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="max-w-xs w-full space-y-6">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-2 text-rose-600">
                  <Trash2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">Delete PDF?</h3>
                  <p className="text-xs text-rose-300 font-bold uppercase tracking-widest mt-1">This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDeletion}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 transition-transform"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 py-4 bg-white/10 text-white rounded-3xl font-black uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
