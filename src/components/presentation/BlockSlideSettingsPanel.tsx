import React, { useState } from 'react';
import { SlideStyleSettings, SlideType } from '../../presentationTypes';
import { AlignLeft, AlignCenter, AlignRight, Sliders, Type, Layout, Image as ImageIcon, Check, Sparkles, Palette, Settings2, Download } from 'lucide-react';

interface BlockSlideSettingsPanelProps {
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

const THEME_DEFAULTS: Record<string, string[]> = {
  modern: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#10b981', '#475569'],
  midnight: ['#6366f1', '#a855f7', '#0ea5e9', '#10b981', '#f43f5e'],
  clinical: ['#0d9488', '#0ea5e9', '#4f46e5', '#f43f5e', '#7c3aed'],
  cyberpunk: ['#00ffff', '#ff007f', '#eab308', '#a855f7', '#10b981'],
  academic: ['#b45309', '#991b1b', '#15803d', '#1d4ed8', '#4c3d31'],
  terminal: ['#10b981', '#f59e0b', '#ea580c', '#38bdf8', '#ffffff'],
};

const THEME_COLOR_NAMES: Record<string, string> = {
  '#4f46e5': 'Indigo Modern',
  '#0ea5e9': 'Sky Crisp',
  '#8b5cf6': 'Violet Modern',
  '#10b981': 'Emerald Fresh',
  '#475569': 'Slate Modern',
  '#6366f1': 'Cosmic Indigo',
  '#a855f7': 'Nebula Violet',
  '#f43f5e': 'Supernova Rose',
  '#0d9488': 'Medical Teal',
  '#7c3aed': 'Healing Violet',
  '#00ffff': 'Laser Cyan',
  '#ff007f': 'Neon Pink',
  '#eab308': 'Cyber Yellow',
  '#b45309': 'Terracotta',
  '#991b1b': 'Burgundy Wine',
  '#15803d': 'Forest Green',
  '#1d4ed8': 'Classic Navy',
  '#4c3d31': 'Dark Mahogany',
  '#f59e0b': 'Phosphor Amber',
  '#ea580c': 'Cyber Orange',
  '#38bdf8': 'Terminal Blue',
  '#ffffff': 'Bright White',
};

const getThemeColors = (theme: string) => {
  const values = THEME_DEFAULTS[theme] || THEME_DEFAULTS.modern;
  return values.map(val => ({
    name: THEME_COLOR_NAMES[val] || 'Theme Accent',
    value: val
  }));
};

export const BlockSlideSettingsPanel: React.FC<BlockSlideSettingsPanelProps> = ({ type, settings, onUpdate, onExport, onExportPdf, isGeneratingPdf }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const updateSetting = (key: keyof SlideStyleSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleThemeChange = (themeId: string) => {
    const recommended = THEME_DEFAULTS[themeId] || THEME_DEFAULTS.modern;
    onUpdate({
      ...settings,
      slideTheme: themeId as any,
      primaryColor: recommended[0]
    });
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
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Block Slide Settings</h3>
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
            {/* CONTENT TAB: Custom fields for Clinical and block layouts */}
            <div className="p-4 bg-slate-50/50 rounded-2xl space-y-6 border border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" style={{ color: currentPrimaryColor }} />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Visual Controls</h4>
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
                  <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Card Shadow</label>
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
                     <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Main Block Weight</label>
                     <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{settings.splitRatio || 50}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" max="70" step="5"
                    value={settings.splitRatio || 50}
                    onChange={(e) => updateSetting('splitRatio', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: currentPrimaryColor }}
                  />
                </div>
              </div>
            </div>

            {/* Typography Sections */}
            <div className="space-y-8">
              {/* Section: Slide Headings */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slide Heading</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 font-bold">Text Scale</label>
                     <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{currentTitleSize}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="250" step="5"
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

              {/* Section: Blocks Text */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Block Subtext</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Subtext Scale</label>
                     <span className="text-[10px] font-mono font-bold" style={{ color: currentPrimaryColor }}>{currentContentSize}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="200" step="5"
                    value={currentContentSize}
                    onChange={(e) => updateSetting('contentSize', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: currentPrimaryColor }}
                  />
                </div>

                <AlignmentControl 
                  label="Block Alignment" 
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
            {/* DESIGN TAB: Color options and performance */}
            <div className="space-y-8">
              {/* SECTION: PRIMARY COLOR */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Theme Color Preset Picker</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-2">Recommended for {(settings.slideTheme || 'modern').toUpperCase()} Theme</span>
                    <div className="grid grid-cols-5 gap-3 p-4 bg-indigo-50/15 border border-indigo-100/30 rounded-2xl">
                      {getThemeColors(settings.slideTheme || 'modern').map((color) => (
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
                               <Check className="w-4 h-4 bg-black/35 rounded-md p-0.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-2">All Studio Colors</span>
                    <div className="grid grid-cols-5 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in">
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
                               <Check className="w-4 h-4 bg-black/35 rounded-md p-0.5" />
                            </div>
                          )}
                        </button>
                      ))}
                      <div className="col-span-5 pt-2">
                        <div className="flex items-center gap-2 px-2">
                          <div className="h-px flex-1 bg-slate-200" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Custom Hex</span>
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
                </div>
              </div>

              {/* SECTION: SLIDE THEME */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Slide Theme</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  {[
                    { id: 'modern', label: 'Modern (Default)' },
                    { id: 'midnight', label: 'Midnight Night' },
                    { id: 'clinical', label: 'Clinical Red' },
                    { id: 'cyberpunk', label: 'Cyberpunk' },
                    { id: 'academic', label: 'Academic Sepia' },
                    { id: 'terminal', label: 'Terminal Hacker' }
                  ].map(themeOption => (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id)}
                      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                        (settings.slideTheme || 'modern') === themeOption.id
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {themeOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: LAYOUT WIDGET TOGGLE */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Workspace Controls</h4>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-700 cursor-pointer select-none">
                      Show Layout Switcher
                    </label>
                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Floating layout widget</p>
                  </div>
                  <button 
                    onClick={() => updateSetting('showLayoutSwitcher', settings.showLayoutSwitcher !== false ? false : true)}
                    className={`w-12 h-6 rounded-full relative transition-[background-color] duration-300 ${settings.showLayoutSwitcher !== false ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    style={settings.showLayoutSwitcher !== false ? { backgroundColor: currentPrimaryColor } : {}}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md flex items-center justify-center transition-all duration-300 ${settings.showLayoutSwitcher !== false ? 'translate-x-[26px]' : 'translate-x-[2px]'}`}>
                       {settings.showLayoutSwitcher !== false ? <Check className="w-3 h-3" style={{ color: currentPrimaryColor }} /> : null}
                    </div>
                  </button>
                </div>
              </div>

              {/* Section: Interactive Animations */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Interactive Animations</h4>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-700 cursor-pointer select-none">
                      Dynamic Motion
                    </label>
                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Animations inside blocks</p>
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
              </div>

              {/* Export actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 opacity-60" style={{ color: currentPrimaryColor }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Export Block Deck</h4>
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
        <p className="text-[10px] text-slate-400 italic font-medium">Block settings apply instantly.</p>
      </div>
    </div>
  );
};
