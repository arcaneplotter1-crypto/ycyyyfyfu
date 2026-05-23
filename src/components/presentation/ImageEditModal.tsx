import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Image as ImageIcon, Maximize, Target } from 'lucide-react';
import { SlideStyleSettings } from '../../presentationTypes';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrls: string[];
  maxImages?: number;
  settings: SlideStyleSettings;
  onSave: (urls: string[], newSettings: Partial<SlideStyleSettings>) => void;
}

export const ImageEditModal: React.FC<ImageEditModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUrls, 
  maxImages = 1,
  settings,
  onSave
}) => {
  const [urls, setUrls] = useState<string[]>(currentUrls.length > 0 ? currentUrls : []);
  const [imageFit, setImageFit] = useState<'cover' | 'contain' | 'fill'>(settings.imageFit || 'cover');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxImages);
    if (files.length > 0) {
      const newUrls: string[] = [];
      let loadedCount = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newUrls.push(event.target?.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setUrls(newUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, maxImages);
    if (files.length > 0) {
      const newUrls: string[] = [];
      let loadedCount = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newUrls.push(event.target?.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setUrls(newUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSave = () => {
    onSave(urls, { ...settings, imageFit });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white text-slate-900">
            <h2 className="text-xl font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" /> Image Settings
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-8 text-slate-900">
            {/* Upload Area */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Media ({urls.length}/{maxImages})</label>
              <div 
                className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${urls.length > 0 ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                  multiple={maxImages > 1}
                />
                
                {urls.length > 0 ? (
                  <div className={`grid gap-4 w-full ${urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {urls.map((url, i) => (
                      <div key={i} className="relative aspect-video bg-black/5 rounded-xl overflow-hidden">
                        <img src={url} alt={`Upload ${i}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                    <div className="col-span-full pt-4 text-center">
                      <p className="text-sm font-medium text-indigo-600">Click or drag here to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 text-indigo-500">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-700 mb-1">Upload images</p>
                    <p className="text-sm">Drag and drop or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Area */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4" /> Layout Fit
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setImageFit('cover')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${imageFit === 'cover' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                >
                  <div className="w-16 h-10 bg-slate-200 rounded border border-slate-300 overflow-hidden relative mb-3 mx-auto">
                    <div className="absolute inset-0 bg-indigo-500 opacity-20"></div>
                    <div className="w-full h-full bg-indigo-500 scale-125 opacity-40"></div>
                  </div>
                  <span className={`font-bold text-sm ${imageFit === 'cover' ? 'text-indigo-600' : 'text-slate-600'}`}>Fill Frame</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Crops to fit</span>
                </button>
                
                <button 
                  onClick={() => setImageFit('contain')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${imageFit === 'contain' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                >
                  <div className="w-16 h-10 bg-slate-200 rounded border border-slate-300 overflow-hidden relative mb-3 mx-auto flex items-center justify-center">
                    <div className="w-10 h-8 bg-indigo-500 opacity-60 rounded-sm"></div>
                  </div>
                  <span className={`font-bold text-sm ${imageFit === 'contain' ? 'text-indigo-600' : 'text-slate-600'}`}>Keep Margins</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Shows full image</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-full font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-2.5 rounded-full font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
