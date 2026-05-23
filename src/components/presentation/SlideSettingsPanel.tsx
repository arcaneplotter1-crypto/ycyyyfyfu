import React, { useState } from 'react';
import { SlideStyleSettings, SlideType } from '../../presentationTypes';
import { AlignLeft, AlignCenter, AlignRight, Sliders, Type, Layout, Image as ImageIcon, Columns, List, Check, Sparkles, Palette, Settings2, BarChart3, Grid3X3, ArrowRightCircle, CalendarDays, Users, Download } from 'lucide-react';

interface SlideSettingsPanelProps {
  type: SlideType;
  settings: SlideStyleSettings;
  onUpdate: (settings: SlideStyleSettings) => void;
  onExport?: () => void;
  onExportPdf?: () => void;
  isGeneratingPdf?: boolean;
}

const PRIMARY_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Crimson', value: '#dc2626' },
  { name: 'Slate', value: '#475569' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Orange', value: '#ea580c' },
];

export const SlideSettingsPanel: React.FC<SlideSettingsPanelProps> = ({ type, settings, onUpdate, onExport, onExportPdf, isGeneratingPdf }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const updateSetting = (key: keyof SlideStyleSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const currentTitleSize = settings.titleSize || 100;
  const currentContentSize = settings.contentSize || 100;
  
  const currentTitleAlignment = settings.titleAlignment || 'left';
  const currentContentAlignment = settings.contentAlignment || 'left';
  
  const currentTitleLetterSpacing = settings.titleLetterSpacing || 0;
  const currentContentLetterSpacing = settings.contentLetterSpacing || 0;
  
  const currentTitleLineHeight = settings.titleLineHeight || 1.1;
  const currentContentLineHeight = settings.contentLineHeight || 1.6;

  const currentPrimaryColor = settings.primaryColor || '#4f46e5';

  const AlignmentControl = ({ label, value, onChange }: { label: string, value: string, onChange: (val: any) => void }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{label}</label>
      <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            onClick={() => onChange(align)}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${
              value === align 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
             style={value === align ? { color: currentPrimaryColor, borderColor: `${currentPrimaryColor}20` } : {}}
          >
            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>
    </div>
  );

  const SpacingControl = ({ label, value, onChange, min = -0.1, max = 0.5, step = 0.01, format = (v: number) => v.toFixed(2) }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 block">{label}</label>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold"
        >
          -
        </button>
        <div className="flex-1 text-center font-mono text-[10px] font-bold border border-slate-50 rounded-lg py-1" style={{ color: currentPrimaryColor }}>
          {format(value)}
        </div>
        <button 
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0 h-full overflow-hidden">
      {/* Header & Tab Switcher */}
      <div className="px-4 pt-4 md:px-6 md:pt-6 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-slate-400" style={{ color: currentPrimaryColor }} />
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Slide Designer</h3>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'content'
                ? 'bg-white shadow-sm border border-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            style={activeTab === 'content' ? { color: currentPrimaryColor } : {}}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'design'
                ? 'bg-white shadow-sm border border-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            style={activeTab === 'design' ? { color: currentPrimaryColor } : {}}
          >
            <Palette className="w-3.5 h-3.5" />
            Design
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 pb-10">
        {activeTab === 'content' ? (
          <>
            {/* CONTENT TAB: Layout specific controls */}
            {/* SECTION: IMAGE CONTROLS (CONDITIONAL) */}
            {(type === 'image-text' || type === 'images') && (
              <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Image Details</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <SpacingControl 
                    label="Corner Radius" 
                    value={settings.imageRadius || 32} 
                    min={0} max={100} step={4}
                    format={(v: number) => `${v}px`}
                    onChange={(val: any) => updateSetting('imageRadius', val)} 
                  />
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Shadow</label>
                    <select 
                      value={settings.imageShadow || 'xl'} 
                      onChange={(e) => updateSetting('imageShadow', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {['none', 'sm', 'md', 'lg', 'xl', '2xl'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                   <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Image Size</label>
                       <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{settings.imageSize || (type === 'images' ? 100 : 50)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" max="100" step="5"
                      value={settings.imageSize || (type === 'images' ? 100 : 50)}
                      onChange={(e) => updateSetting('imageSize', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: currentPrimaryColor }}
                    />
                  </div>

                  {type === 'image-text' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Position</label>
                      <div className="grid grid-cols-4 bg-slate-50 p-1 rounded-xl gap-1">
                        {(['left', 'right', 'top', 'bottom'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => updateSetting('imagePosition', pos)}
                            className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                              (settings.imagePosition || 'left') === pos 
                                ? 'bg-white shadow-sm border border-slate-100' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            style={(settings.imagePosition || 'left') === pos ? { color: currentPrimaryColor } : {}}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === 'images' && (
                    <div className="space-y-4">
                       <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Image Count</label>
                        <div className="grid grid-cols-4 bg-slate-50 p-1 rounded-xl gap-1">
                          {[1, 2, 3, 4].map((count) => (
                            <button
                              key={count}
                              onClick={() => updateSetting('imageCount', count)}
                              className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[10px] font-bold ${
                                (settings.imageCount || 1) === count 
                                  ? 'bg-white shadow-sm border border-slate-100' 
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              style={(settings.imageCount || 1) === count ? { color: currentPrimaryColor } : {}}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Layout</label>
                        <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl gap-1">
                          {(['grid', 'horizontal', 'vertical', 'stacked'] as const).map((l) => (
                            <button
                              key={l}
                              onClick={() => updateSetting('imageLayout', l)}
                              className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                                (settings.imageLayout || 'grid') === l 
                                  ? 'bg-white shadow-sm border border-slate-100' 
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              style={(settings.imageLayout || 'grid') === l ? { color: currentPrimaryColor } : {}}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: COLUMN CONTROLS (CONDITIONAL) */}
            {type === 'split-text' && (
              <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Columns className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Split Layout</h4>
                </div>
                
                <SpacingControl 
                  label="Column Gap" 
                  value={settings.columnGap || 80} 
                  min={20} max={200} step={10}
                  format={(v: number) => `${v}px`}
                  onChange={(val: any) => updateSetting('columnGap', val)} 
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Split Ratio (Left)</label>
                      <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{settings.splitRatio || 50}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="80" step="5"
                    value={settings.splitRatio || 50}
                    onChange={(e) => updateSetting('splitRatio', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: currentPrimaryColor }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <AlignmentControl 
                    label="Left Align" 
                    value={settings.leftAlignment || 'left'} 
                    onChange={(val) => updateSetting('leftAlignment', val)} 
                  />
                   <AlignmentControl 
                    label="Right Align" 
                    value={settings.rightAlignment || 'left'} 
                    onChange={(val) => updateSetting('rightAlignment', val)} 
                  />
                </div>
              </div>
            )}

            {/* SECTION: TEXT CONTROLS */}
            {type === 'text' && (
              <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Text Layout</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Mode</label>
                    <div className="grid grid-cols-2 bg-white p-1 rounded-xl gap-1 border border-slate-100 shadow-sm">
                      {(['single', 'columns'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => updateSetting('textLayout', l)}
                          className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                            (settings.textLayout || 'single') === l 
                              ? 'text-white shadow-md' 
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                          style={(settings.textLayout || 'single') === l ? { backgroundColor: currentPrimaryColor } : {}}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {settings.textLayout === 'columns' && (
                    <SpacingControl 
                      label="Layout Columns" 
                      value={settings.gridColumns || 2} 
                      min={1} max={3} step={1}
                      format={(v: number) => Math.round(v)}
                      onChange={(val: any) => updateSetting('gridColumns', Math.round(val))} 
                    />
                  )}
                </div>
              </div>
            )}

            {/* SECTION: LIST CONTROLS (CONDITIONAL) */}
            {(type === 'bullets' || type === 'agenda') && (
              <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
                <div className="flex items-center gap-2">
                  <List className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">List Items</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Layout Mode</label>
                    <div className="grid grid-cols-4 bg-white p-1 rounded-xl gap-1 border border-slate-100 shadow-sm">
                      {(['list', 'columns', 'grid', 'split'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => updateSetting('bulletsLayout', l)}
                          className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                            (settings.bulletsLayout || 'list') === l 
                              ? 'text-white shadow-md' 
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                          style={(settings.bulletsLayout || 'list') === l ? { backgroundColor: currentPrimaryColor } : {}}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {settings.bulletsLayout !== 'list' && (
                    <SpacingControl 
                      label="Layout Columns" 
                      value={settings.gridColumns || settings.bulletsColumns || 2} 
                      min={1} max={6} step={1}
                      format={(v: number) => Math.round(v)}
                      onChange={(val: any) => {
                        const count = Math.round(val);
                        updateSetting('gridColumns', count);
                        updateSetting('bulletsColumns', count); // Legacy support
                      }} 
                    />
                  )}

                  <SpacingControl 
                    label="Item Spacing" 
                    value={settings.bulletSpacing || settings.itemSpacing || 24} 
                    min={0} max={120} step={4}
                    format={(v: number) => `${v}px`}
                    onChange={(val: any) => updateSetting('bulletSpacing', val)} 
                  />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">UI Element Size</label>
                        <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{settings.uiSize || 100}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" max="200" step="5"
                      value={settings.uiSize || 100}
                      onChange={(e) => updateSetting('uiSize', parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: currentPrimaryColor }}
                    />
                  </div>
                  
                  <button 
                    onClick={() => updateSetting('showDivider', !settings.showDivider)}
                    className="flex items-center gap-2 w-full group pt-2"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${settings.showDivider ? 'border-transparent text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-slate-300'}`} style={settings.showDivider ? { backgroundColor: currentPrimaryColor } : {}}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Show Dividers</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: CHART CONTROLS (CONDITIONAL) */}
            {type === 'chart' && (
              <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Chart Settings</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Chart Type</label>
                    <div className="grid grid-cols-4 bg-white p-1 rounded-xl gap-1 border border-slate-100 shadow-sm">
                      {(['bar', 'line', 'pie', 'area'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSetting('chartType', t)}
                          className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                            (settings.chartType || 'bar') === t 
                              ? 'text-white shadow-md' 
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                          style={(settings.chartType || 'bar') === t ? { backgroundColor: currentPrimaryColor } : {}}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SpacingControl 
                    label="Chart Thickness" 
                    value={settings.chartThickness || 40} 
                    min={10} max={100} step={5}
                    format={(v: number) => `${v}px`}
                    onChange={(val: any) => updateSetting('chartThickness', val)} 
                  />

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button 
                      onClick={() => updateSetting('showGrid', settings.showGrid === false ? true : false)}
                      className="flex items-center gap-2 w-full group"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${settings.showGrid !== false ? 'border-transparent text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-slate-300'}`} style={settings.showGrid !== false ? { backgroundColor: currentPrimaryColor } : {}}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Show Grid</span>
                    </button>

                    <button 
                      onClick={() => updateSetting('showLegend', settings.showLegend === false ? true : false)}
                      className="flex items-center gap-2 w-full group"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${settings.showLegend !== false ? 'border-transparent text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-slate-300'}`} style={settings.showLegend !== false ? { backgroundColor: currentPrimaryColor } : {}}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Show Legend</span>
                    </button>

                     <button 
                      onClick={() => updateSetting('showTooltip', settings.showTooltip === false ? true : false)}
                      className="flex items-center gap-2 w-full group"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${settings.showTooltip !== false ? 'border-transparent text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-slate-300'}`} style={settings.showTooltip !== false ? { backgroundColor: currentPrimaryColor } : {}}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Show Tooltip</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: GRID/LAYOUT CONTROLS (SHARED) */}
            {(type === 'grid' || type === 'team' || type === 'process' || type === 'timeline') && (
              <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                    {type === 'grid' ? 'Grid Settings' : 
                     type === 'team' ? 'Team Layout' : 
                     type === 'process' ? 'Process Layout' : 'Timeline Layout'}
                  </h4>
                </div>
                <div className="space-y-4">
                  <SpacingControl 
                    label="Columns" 
                    value={settings.gridColumns || (type === 'grid' ? 2 : type === 'team' ? 4 : type === 'process' ? 3 : 4)} 
                    min={1} max={6} step={1}
                    format={(v: number) => Math.round(v)}
                    onChange={(val: any) => updateSetting('gridColumns', Math.round(val))} 
                  />
                  
                  {type === 'grid' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Card Style</label>
                      <div className="grid grid-cols-3 bg-white p-1 rounded-xl gap-1 border border-slate-100 shadow-sm">
                        {(['minimal', 'glass', 'bold'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateSetting('cardStyle', s)}
                            className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                              (settings.cardStyle || 'glass') === s 
                                ? 'text-white shadow-md' 
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                            style={(settings.cardStyle || 'glass') === s ? { backgroundColor: currentPrimaryColor } : {}}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === 'process' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Step Shape</label>
                      <div className="grid grid-cols-3 bg-white p-1 rounded-xl gap-1 border border-slate-100 shadow-sm">
                        {(['rounded', 'square', 'circle'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateSetting('stepStyle', s)}
                            className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                              (settings.stepStyle || 'circle') === s 
                                ? 'text-white shadow-md' 
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                            style={(settings.stepStyle || 'circle') === s ? { backgroundColor: currentPrimaryColor } : {}}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === 'timeline' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Timeline Style</label>
                      <div className="grid grid-cols-2 bg-white p-1 rounded-xl gap-1 border border-slate-100 shadow-sm">
                        {(['horizontal', 'vertical'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateSetting('timelineStyle', s)}
                            className={`flex items-center justify-center py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase ${
                              (settings.timelineStyle || 'horizontal') === s 
                                ? 'text-white shadow-md' 
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                            style={(settings.timelineStyle || 'horizontal') === s ? { backgroundColor: currentPrimaryColor } : {}}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Typography Sections (Always in Content) */}
            <div className="space-y-8">
              {/* Section: Title Styling */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Title Section</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Scale</label>
                     <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{currentTitleSize}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="400" step="5"
                    value={currentTitleSize}
                    onChange={(e) => updateSetting('titleSize', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: currentPrimaryColor }}
                  />
                </div>

                <AlignmentControl 
                  label="Alignment" 
                  value={currentTitleAlignment} 
                  onChange={(val) => updateSetting('titleAlignment', val)} 
                />

                <div className="grid grid-cols-2 gap-4">
                  <SpacingControl 
                    label="Letter Spacing" 
                    value={currentTitleLetterSpacing} 
                    onChange={(val: any) => updateSetting('titleLetterSpacing', val)} 
                  />
                  <SpacingControl 
                    label="Line Height" 
                    value={currentTitleLineHeight} 
                    min={0.8} max={2.5} step={0.1}
                    format={(v: number) => v.toFixed(1)}
                    onChange={(val: any) => updateSetting('titleLineHeight', val)} 
                  />
                </div>
              </div>

              {/* Section: Content Styling */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Content Section</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Scale</label>
                     <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{currentContentSize}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="300" step="5"
                    value={currentContentSize}
                    onChange={(e) => updateSetting('contentSize', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: currentPrimaryColor }}
                  />
                </div>

                <AlignmentControl 
                  label="Alignment" 
                  value={currentContentAlignment} 
                  onChange={(val) => updateSetting('contentAlignment', val)} 
                />

                <div className="grid grid-cols-2 gap-4">
                  <SpacingControl 
                    label="Letter Spacing" 
                    value={currentContentLetterSpacing} 
                    onChange={(val: any) => updateSetting('contentLetterSpacing', val)} 
                  />
                  <SpacingControl 
                    label="Line Height" 
                    value={currentContentLineHeight} 
                    min={1} max={3} step={0.1}
                    format={(v: number) => v.toFixed(1)}
                    onChange={(val: any) => updateSetting('contentLineHeight', val)} 
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* DESIGN TAB: Color picker and effects */}
            <div className="space-y-8">
              {/* SECTION: PRIMARY COLOR */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Color</h4>
                </div>

                <div className="grid grid-cols-5 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  {PRIMARY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSetting('primaryColor', color.value)}
                      className={`group relative w-full aspect-square rounded-xl transition-all duration-300 ${
                        currentPrimaryColor === color.value 
                          ? 'scale-110 shadow-lg ring-2 ring-white ring-offset-2' 
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {currentPrimaryColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                  <div className="col-span-5 pt-2">
                    <div className="flex items-center gap-2 px-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Custom Color</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-mono font-bold text-slate-700 flex items-center gap-2">
                        <span className="text-slate-400">#</span>
                        <input 
                          type="text" 
                          value={currentPrimaryColor.replace('#', '')}
                          onChange={(e) => {
                            const val = e.target.value.substring(0, 6);
                            if (/^[0-9A-Fa-f]*$/.test(val)) {
                              updateSetting('primaryColor', `#${val}`);
                            }
                          }}
                          className="w-full bg-transparent outline-none uppercase"
                          maxLength={6}
                        />
                      </div>
                      <label 
                        className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm cursor-pointer overflow-hidden relative shrink-0" 
                        style={{ backgroundColor: currentPrimaryColor }} 
                        title="Pick custom color"
                      >
                         <input 
                           type="color" 
                           value={currentPrimaryColor}
                           onChange={(e) => updateSetting('primaryColor', e.target.value)}
                           className="absolute opacity-0 w-[200%] h-[200%] top-[-50%] left-[-50%] cursor-pointer"
                         />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Effects */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transitions & Animation</h4>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner-sm">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-700 cursor-pointer select-none">
                      Scale Animations
                    </label>
                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Toggle entry/exit motion</p>
                  </div>
                  <button 
                    onClick={() => updateSetting('disableAnimations', settings.disableAnimations === false ? true : false)}
                    className={`w-12 h-6 rounded-full relative transition-[background-color] duration-300 ${settings.disableAnimations !== false ? 'bg-slate-300' : 'bg-indigo-500'}`}
                    style={settings.disableAnimations === false ? { backgroundColor: currentPrimaryColor } : {}}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md flex items-center justify-center transition-all duration-300 ${settings.disableAnimations !== false ? 'translate-x-[2px]' : 'translate-x-[26px]'}`}>
                       {settings.disableAnimations === false ? <Check className="w-3 h-3" style={{ color: currentPrimaryColor }} /> : null}
                    </div>
                  </button>
                </div>
                
                <div className="p-4 bg-indigo-50/30 border border-dashed border-indigo-100 rounded-2xl">
                   <p className="text-[10px] text-slate-500 italic leading-relaxed">
                     Disable animations if you experience lag or prefer a cleaner, static transition. Background elements will still have subtle parallax.
                   </p>
                </div>
              </div>

              {/* SECTION: EXPORT */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Export</h4>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onExport}
                    className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                    style={{ '--hover-color': currentPrimaryColor } as React.CSSProperties}
                  >
                    <Download className="w-4 h-4" />
                    Download HTML
                  </button>

                  <button
                    onClick={onExportPdf}
                    disabled={isGeneratingPdf}
                    className={`w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:text-indigo-600'}`}
                    style={{ '--hover-color': currentPrimaryColor } as React.CSSProperties}
                  >
                    {isGeneratingPdf ? (
                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                    ) : (
                       <Download className="w-4 h-4" />
                    )}
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-50 bg-white md:px-6">
        <p className="text-[10px] text-slate-400 italic font-medium">Settings apply instantly to current slide.</p>
      </div>
    </div>
  );
};

