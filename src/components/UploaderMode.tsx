import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, ChevronLeft, Layers, Loader2, AlertCircle } from 'lucide-react';
import { AppTheme, Question } from '../types';
import { getArcaneStyles } from '../utils/arcaneThemes';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';
import { decompress } from 'fzstd';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface UploaderModeProps {
  theme: AppTheme;
  setParsedQuestions: (questions: Question[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const UploaderMode: React.FC<UploaderModeProps> = ({ theme, setParsedQuestions, onBack, onContinue }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const ankiInputRef = useRef<HTMLInputElement>(null);

  const isArcane = theme.visualStyle === 'arcane' || theme.visualStyle === 'virus';
  const arcane = isArcane ? getArcaneStyles(theme.accentColor) : { bg: '', border: '', text: '', glow: '' };
  
  const parsePDF = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const { smartExtractPdfQuestions } = await import('../utils/pdfQuestionExtractor');
      const questions = await smartExtractPdfQuestions(file);
      
      if (questions.length === 0) {
        throw new Error('Could not find any structured questions in the PDF.');
      }

      setParsedQuestions(questions);
      onContinue();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse PDF.');
    } finally {
      setLoading(false);
    }
  };

  const parseAnki = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const SQL = await initSqlJs({ 
        locateFile: () => sqlWasm
      });
      
      const zip = new JSZip();
      let zipContent;
      try {
        zipContent = await zip.loadAsync(file);
      } catch (e) {
        throw new Error("The uploaded file is not a valid Anki package (.apkg). Please ensure you are uploading a .apkg file.");
      }

      // Log files for debugging
      console.log("Anki package contents:", Object.keys(zipContent.files));

      let dbFile = zipContent.file("collection.anki21") || zipContent.file("collection.anki2");
      
      if (!dbFile) {
        // Some newer or different exports might have differently named files or be in subdirectories
        const possibleDbFiles = Object.keys(zipContent.files).filter(f => f.endsWith(".anki2") || f.endsWith(".anki21"));
        if (possibleDbFiles.length > 0) {
           console.log("Found alternative database files, using first one:", possibleDbFiles);
           dbFile = zipContent.file(possibleDbFiles[0]);
        }
      }

      if (!dbFile) {
        throw new Error("Could not find Anki database (collection.anki2 or collection.anki21) in the .apkg file. Please ensure you exported the deck correctly from the latest version of Anki.");
      }
      
      let dbBuffer = await dbFile.async("uint8array");
      
      // Check for Zstandard compression (starts with 0x28 0xB5 0x2F 0xFD)
      if (dbBuffer[0] === 0x28 && dbBuffer[1] === 0xB5 && dbBuffer[2] === 0x2F && dbBuffer[3] === 0xFD) {
        try {
          dbBuffer = decompress(dbBuffer);
        } catch (e) {
          throw new Error("This Anki deck uses a compressed format that failed to decompress. Please export your deck with 'Support older Anki versions' or 'Compatibility mode' enabled in Anki if this continues.");
        }
      }

      let db;
      try {
        db = new SQL.Database(dbBuffer);
      } catch (e) {
        throw new Error("Failed to open Anki database. The file might be corrupted or in an unsupported format.");
      }
      
      const questions: Question[] = [];

      const mediaFile = zipContent.file("media");
      const mediaMap: Record<string, { url: string, regexes: RegExp[] }> = {};
      if (mediaFile) {
        try {
          const mediaStr = await mediaFile.async("string");
          const mediaMapping = JSON.parse(mediaStr);
          const attrs = ['src', 'href', 'data-src', 'data-url', 'poster'];
          const mediaTags = ['sound', 'video'];

          for (const [key, filename] of Object.entries(mediaMapping)) {
            const fileData = zipContent.file(key);
            if (fileData) {
              const blob = await fileData.async("blob");
              const blobUrl = URL.createObjectURL(blob);
              const name = filename as string;
              
              const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const encodedName = encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              
              const regexes: RegExp[] = [];
              
              // Attribute regexes
              for (const attr of attrs) {
                // Modified regex to capture the attribute name
                regexes.push(new RegExp(`(${attr})\\s*=\\s*(['"]?)(?:[^'"]*?)${escapedName}\\2`, 'gi'));
                if (encodedName !== escapedName) {
                  regexes.push(new RegExp(`(${attr})\\s*=\\s*(['"]?)(?:[^'"]*?)${encodedName}\\2`, 'gi'));
                }
              }
              
              // Tag regexes
              for (const tag of mediaTags) {
                regexes.push(new RegExp(`\\[${tag}:${escapedName}\\]`, 'gi'));
              }
              
              mediaMap[name] = { url: blobUrl, regexes };
            }
          }
        } catch (e) {
          console.warn("Failed to parse media map", e);
        }
      }

      const processHtml = (html: string) => {
        if (!html) return "";
        let processed = html;
        
        // Sort filenames by length descending to handle partial overlaps
        const filenames = Object.keys(mediaMap).sort((a, b) => b.length - a.length);

        for (const filename of filenames) {
           const media = mediaMap[filename];
           if (!media || !media.url) continue;

           for (const regex of media.regexes) {
              if (regex.source.includes('\\[sound:') || regex.source.includes('\\[video:')) {
                 const isVideo = regex.source.includes('video');
                 processed = processed.replace(regex, isVideo 
                    ? `<br/><video controls src="${media.url}" className="max-w-full h-auto rounded-lg shadow-sm my-2"></video>` 
                    : `<br/><audio controls src="${media.url}" className="my-2"></audio>`);
              } else {
                 // Use capturing groups to preserve the attribute name
                 // We also want to inject some styling classes for images
                 processed = processed.replace(regex, (match, attrName) => {
                    if (attrName.toLowerCase() === 'src') {
                       // If we are replacing a src, we also try to ensure it's responsive
                       // This is a bit tricky with raw replace, but we can append classes later or use a more complex regex
                       return `${attrName}="${media.url}"`;
                    }
                    return `${attrName}="${media.url}"`;
                 });
              }
           }
        }

        // Post-process to ensure all <img> tags are responsive
        processed = processed.replace(/<img\s+/gi, '<img className="max-w-full h-auto rounded-lg shadow-sm my-2 block mx-auto" ');

        return processed;
      };

      const colRes = db.exec("SELECT models FROM col");
      let models: any = {};
      if (colRes.length > 0 && colRes[0].values.length > 0) {
        try {
          models = JSON.parse(colRes[0].values[0][0] as string);
        } catch (e) {
          console.error("Failed to parse models json from col", e);
        }
      }

      const cardsRes = db.exec("SELECT c.id, c.nid, c.ord, n.mid, n.flds FROM cards c INNER JOIN notes n ON c.nid = n.id");
      if (cardsRes.length === 0 || !cardsRes[0].values) {
        throw new Error("No cards found in Anki deck.");
      }

      for (const row of cardsRes[0].values) {
        const ord = row[2] as number;
        const mid = row[3] as string | number;
        const flds = row[4] as string;

        if (!flds) continue;

        const model = models[String(mid)];
        const fields = flds.split('\x1f'); 

        let frontRaw = fields[0]?.trim() || "";
        let backRaw = fields.slice(1).join('\n<hr/>\n').trim();

        if (model && model.flds && model.tmpls) {
          const fieldMap: Record<string, string> = {};
          model.flds.forEach((fld: any) => {
             fieldMap[fld.name] = fields[fld.ord] || "";
          });

          const isCloze = model.type === 1;
          const tmpls = model.tmpls;
          let template = isCloze ? tmpls[0] : tmpls[ord];
          if (!template && tmpls.length > 0) template = tmpls[0];

          if (template) {
            let frontStr = template.qfmt || "";
            let backStr = template.afmt || "";
            
            for (const [fName, fValue] of Object.entries(fieldMap)) {
               // Replace any {{Field}} or {{type:Field}} etc 
               frontStr = frontStr.replace(new RegExp(`\\{\\{[^}]*?${fName}\\}\\}`, 'g'), fValue);
               backStr = backStr.replace(new RegExp(`\\{\\{[^}]*?${fName}\\}\\}`, 'g'), fValue);
            }
            
            backStr = backStr.replace(/\{\{FrontSide\}\}/g, frontStr);

            if (isCloze) {
               const clozeRegex = /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g;
               frontStr = frontStr.replace(clozeRegex, (match, cNum, cText, cHint) => {
                   if (parseInt(cNum) === ord + 1) return `[${cHint || "..."}]`;
                   return cText;
               });
               backStr = backStr.replace(clozeRegex, (match, cNum, cText, cHint) => {
                   if (parseInt(cNum) === ord + 1) return `<span class="text-indigo-500 font-bold">${cText}</span>`;
                   return cText;
               });
            }

            // Strip leftover {{...}}
            frontStr = frontStr.replace(/\{\{[^}]+\}\}/g, '');
            backStr = backStr.replace(/\{\{[^}]+\}\}/g, '');

            frontRaw = frontStr.trim() || frontRaw;
            backRaw = backStr.trim() || backRaw;
          }
        }
        
        let front = processHtml(frontRaw);
        let back = processHtml(backRaw);

        // Extract a primary image URL for the question's imageUrl field if one exists
        let primaryImageUrl = "";
        const m = front.match(/src="([^"]+)"/i);
        if (m) {
          primaryImageUrl = m[1];
        } else if (back.match(/src="([^"]+)"/i)) {
          // If front has no image but back has one, maybe it's useful? 
          // Usually we want the front image for the question.
        }

        // We accept flashcards with images/audio even if they lack textual content.
        if (front.trim() || back.trim()) {
          questions.push({
            id: Math.random().toString(36).substring(7),
            type: 'essay',
            question: front || "[No Question Text]",
            imageUrl: primaryImageUrl || undefined,
            correctAnswer: back || "[No Answer Text]",
            options: [],
            explanation: ''
          });
        }
      }
      
      db.close();

      if (questions.length === 0) {
        throw new Error('Could not find any flashcards in the Anki deck.');
      }

      setParsedQuestions(questions);
      onContinue();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse Anki file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden ${isArcane ? `border-2 ${arcane.border} ${arcane.glow}` : 'border border-slate-200 dark:border-slate-800'}`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isArcane ? arcane.text : 'text-slate-800 dark:text-slate-100'}`}>
            <Upload className="w-6 h-6" />
            Uploader Mode
          </h2>
        </div>
        
        <div className="p-8">
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-center">
            Upload your files to automatically extract questions without using AI.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => pdfInputRef.current?.click()}
              disabled={loading}
              className={`relative p-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-4 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 ${isArcane ? arcane.border : 'border-indigo-200 dark:border-indigo-800'}`}
            >
              <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transform rotate-12 z-10 leading-tight flex flex-col items-center justify-center border border-amber-600">
                <span>Still under</span>
                <span>development</span>
              </div>
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Upload PDF</h3>
                <p className="text-xs text-slate-500 mt-1">Extract MCQs & Essays</p>
              </div>
              <input
                type="file"
                ref={pdfInputRef}
                className="hidden"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) parsePDF(file);
                }}
              />
            </button>

            <button
              onClick={() => ankiInputRef.current?.click()}
              disabled={loading}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-4 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 ${isArcane ? arcane.border : 'border-emerald-200 dark:border-emerald-800'}`}
            >
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                <Layers className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Upload Anki</h3>
                <p className="text-xs text-slate-500 mt-1">.apkg files (Flashcards)</p>
              </div>
              <input
                type="file"
                ref={ankiInputRef}
                className="hidden"
                accept=".apkg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) parseAnki(file);
                }}
              />
            </button>
          </div>

          {loading && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium animate-pulse">Extracting questions...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
