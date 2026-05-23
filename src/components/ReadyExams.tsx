import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, FileText, Link as LinkIcon, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Question, AppTheme } from '../types';
import { parseInput } from '../utils';

interface ReadyExamsProps {
  onGenerate: (questions: Question[]) => void;
  onSaveExam: (name: string, questions: Question[]) => void;
  savedExams: any[];
  setView: (view: any) => void;
  theme: AppTheme;
  overrideOnStart?: (questions: Question[]) => void;
}

interface ExamRow {
  name: string;
  content: string;
}

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1gxAe5IwhKuEUI6EffScx7blSOnZ6wDI-4KHPQoaUSyA/edit?usp=drivesdk';

function parseCSV(text: string) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let val = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        val += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(val);
      val = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(val);
      result.push(row);
      row = [];
      val = '';
    } else {
      val += char;
    }
  }
  row.push(val);
  result.push(row);
  return result;
}

export const ReadyExams: React.FC<ReadyExamsProps> = ({ onGenerate, onSaveExam, savedExams, setView, theme, overrideOnStart }) => {
  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem('ready_exams_sheet_url') || DEFAULT_SHEET_URL;
  });
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAlreadySaved = (examName: string) => {
    return savedExams.some(e => e.name === examName);
  };

  const fetchExams = async (url: string) => {
    setLoading(true);
    setError('');
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('Invalid Google Sheets URL. Could not find document ID.');
      }
      const docId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets. Make sure the sheet is public.');
      }
      const csvText = await response.text();
      
      const rows = parseCSV(csvText).filter(row => row.length >= 2);

      // Skip header row if it looks like "Exam name", "Content"
      let startIndex = 0;
      if (rows.length > 0 && rows[0][0].toLowerCase().includes('name')) {
        startIndex = 1;
      }

      const parsedExams: ExamRow[] = rows.slice(startIndex).map(row => ({
        name: row[0].trim(),
        content: row[1].trim()
      })).filter(exam => exam.name && exam.content);

      setExams(parsedExams);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching exams.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (questions: Question[]) => {
    if (overrideOnStart) {
      overrideOnStart(questions);
    } else {
      onGenerate(questions);
    }
  };

  useEffect(() => {
    fetchExams(sheetUrl);
  }, []);

  const handleSaveUrl = () => {
    localStorage.setItem('ready_exams_sheet_url', sheetUrl);
    fetchExams(sheetUrl);
  };

  const handleResetUrl = () => {
    setSheetUrl(DEFAULT_SHEET_URL);
    localStorage.setItem('ready_exams_sheet_url', DEFAULT_SHEET_URL);
    fetchExams(DEFAULT_SHEET_URL);
  };

  const parseContent = async (content: string) => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      try {
        let fetchUrl = content;
        // Convert Google Drive view links to direct download links
        const driveMatch = content.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (driveMatch) {
          fetchUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to fetch file content');
        const text = await response.text();
        return text;
      } catch (err) {
        console.error(err);
        throw new Error('Failed to load content from URL. If it is a Google Drive link, make sure it is accessible to anyone with the link.');
      }
    }
    return content;
  };

  const handleStartExam = async (exam: ExamRow) => {
    try {
      setLoading(true);
      const text = await parseContent(exam.content);
      
      // Check if it's an exported HTML file
      const match = text.match(/const EXAM_DATA = (\[.*?\]);\s*const THEME =/s);
      if (match && match[1]) {
        const parsedQuestions = JSON.parse(match[1]);
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          handleAction(parsedQuestions);
          return;
        } else {
          throw new Error('No valid questions found in the HTML file.');
        }
      }

      const questions = parseInput(text);
      if (questions.length > 0) {
        handleAction(questions);
      } else {
        setError('No valid questions found in this exam.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] p-4 sm:p-8 max-w-6xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setView('home')}
          className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">Ready Exams</h1>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 mb-8 group-[.visual-liquid-glass]/liquid-glass:liquid-glass-modal group-[.visual-liquid-glass]/liquid-glass:!bg-transparent group-[.visual-liquid-glass]/liquid-glass:!border-none group-[.visual-liquid-glass]/liquid-glass:!shadow-none">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200 group-[.visual-liquid-glass]/liquid-glass:!text-white">
          <LinkIcon className="w-5 h-5 text-indigo-500" />
          Data Source
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Google Sheets URL..."
            className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-slate-800 dark:text-slate-200 font-medium"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSaveUrl}
              className="px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-5 h-5" /> <span className="hidden sm:inline">Save & Load</span>
            </button>
            <button
              onClick={handleResetUrl}
              className="px-5 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-md"
              title="Reset to default"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xl animate-pulse">Loading exams...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exams.map((exam, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all group group-[.visual-liquid-glass]/liquid-glass:liquid-glass-item group-[.visual-liquid-glass]/liquid-glass:!bg-white/5 group-[.visual-liquid-glass]/liquid-glass:!border-white/10 group-[.visual-liquid-glass]/liquid-glass:hover:!border-white/30"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-black mb-3 line-clamp-2 text-slate-800 dark:text-slate-100">{exam.name}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 flex items-center gap-2">
                {exam.content.startsWith('http') ? (
                  <><LinkIcon className="w-4 h-4" /> External Link</>
                ) : (
                  <><FileText className="w-4 h-4" /> Text Content</>
                )}
              </p>
              <div className="mt-auto space-y-2">
                <button
                  onClick={() => handleStartExam(exam)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-wider rounded-2xl hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Exam
                </button>
                <button
                  disabled={isAlreadySaved(exam.name)}
                  onClick={async () => {
                    if (isAlreadySaved(exam.name)) return;
                    try {
                      setLoading(true);
                      const text = await parseContent(exam.content);
                      let questions: Question[] = [];
                      const match = text.match(/const EXAM_DATA = (\[.*?\]);\s*const THEME =/s);
                      if (match && match[1]) {
                        questions = JSON.parse(match[1]);
                      } else {
                        questions = parseInput(text);
                      }
                      if (questions.length > 0) {
                        onSaveExam(exam.name, questions);
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className={`w-full py-3 border-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isAlreadySaved(exam.name)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 cursor-default'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500'
                  }`}
                >
                  {isAlreadySaved(exam.name) ? (
                    <><CheckCircle2 className="w-4 h-4" /> Exam Saved</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
          {exams.length === 0 && !error && (
            <div className="col-span-full text-center py-32">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Exams Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We couldn't find any valid exams in the provided Google Sheet. Make sure it has at least two columns: Name and Content.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
