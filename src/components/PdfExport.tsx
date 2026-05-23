import React, { useState } from 'react';
import { DownloadCloud, FileText, Loader2, Settings2 } from 'lucide-react';
import { PdfDocument, PdfBlock } from '../types';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Image,
  Link,
  Svg,
  Path,
  Circle,
  Rect,
  Line,
  Polygon
} from '@react-pdf/renderer';

// Register Fonts
// Cairo for Arabic & general use
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5W1Q.ttf', fontWeight: 700 }
  ]
});

// Inter for modern clean look
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 }
  ]
});

// Color Maps matching Standard themes
const colorMap: Record<string, { main: string, light: string, dark: string }> = {
  indigo: { main: "#6366f1", light: "#e0e7ff", dark: "#3730a3" },
  blue: { main: "#3b82f6", light: "#dbeafe", dark: "#1e3a8a" },
  emerald: { main: "#10b981", light: "#d1fae5", dark: "#064e3b" },
  rose: { main: "#f43f5e", light: "#ffe4e6", dark: "#881337" },
  amber: { main: "#f59e0b", light: "#fef3c7", dark: "#78350f" },
  purple: { main: "#a855f7", light: "#f3e8ff", dark: "#581c87" },
  teal: { main: "#14b8a6", light: "#ccfbf1", dark: "#134e4a" },
  pink: { main: "#ec4899", light: "#fce7f3", dark: "#831843" },
  cyan: { main: "#06b6d4", light: "#cffafe", dark: "#164e63" },
  fuchsia: { main: "#d946ef", light: "#fae8ff", dark: "#701a75" },
  violet: { main: "#8b5cf6", light: "#ede9fe", dark: "#4c1d95" },
  sky: { main: "#0ea5e9", light: "#e0f2fe", dark: "#0c4a6e" },
  lime: { main: "#84cc16", light: "#ecfccb", dark: "#3f6212" },
  orange: { main: "#f97316", light: "#ffedd5", dark: "#7c2d12" },
  zinc: { main: "#71717a", light: "#f4f4f5", dark: "#27272a" },
  slate: { main: "#475569", light: "#f1f5f9", dark: "#1e293b" },
  red: { main: "#dc2626", light: "#fee2e2", dark: "#7f1d1d" },
  yellow: { main: "#eab308", light: "#fef9c3", dark: "#854d0e" },
  mint: { main: "#2dd4bf", light: "#f0fdfa", dark: "#0f766e" },
  lavender: { main: "#c084fc", light: "#faf5ff", dark: "#6b21a8" },
  crimson: { main: "#dc143c", light: "#fff1f2", dark: "#881337" },
  forest: { main: "#228b22", light: "#f0fdf4", dark: "#14532d" },
  midnight: { main: "#191970", light: "#eff6ff", dark: "#1e1b4b" },
  gold: { main: "#fbbf24", light: "#fffbeb", dark: "#78350f" },
  coral: { main: "#ff7f50", light: "#fff7ed", dark: "#7c2d12" },
  aqua: { main: "#00ffff", light: "#ecfeff", dark: "#164e63" },
  plum: { main: "#dda0dd", light: "#fdf4ff", dark: "#581c87" },
  // Standard Themes
  'theme-violet': { main: "#a855f7", light: "#f3e8ff", dark: "#581c87" },
  'theme-red': { main: "#dc2626", light: "#fee2e2", dark: "#7f1d1d" },
  'theme-blue': { main: "#06b6d4", light: "#cffafe", dark: "#164e63" },
  'theme-gold': { main: "#f59e0b", light: "#fef3c7", dark: "#78350f" },
  'theme-green': { main: "#10b981", light: "#d1fae5", dark: "#064e3b" },
  'theme-neon-pink': { main: "#ec4899", light: "#fce7f3", dark: "#831843" },
  'theme-plasma-cyan': { main: "#22d3ee", light: "#ecfeff", dark: "#083344" },
  'theme-void-purple': { main: "#4f46e5", light: "#e0e7ff", dark: "#1e1b4b" },
  'theme-solar-flare': { main: "#f97316", light: "#ffedd5", dark: "#7c2d12" },
  // Virus Themes
  'virus-marburg': { main: "#dc2626", light: "#fee2e2", dark: "#7f1d1d" },
  'virus-rabies': { main: "#22c55e", light: "#f0fdf4", dark: "#14532d" },
  'virus-hiv': { main: "#d946ef", light: "#fae8ff", dark: "#701a75" },
  'virus-smallpox': { main: "#f59e0b", light: "#fef3c7", dark: "#78350f" },
  'virus-influenza': { main: "#06b6d4", light: "#cffafe", dark: "#164e63" },
  custom: { main: "#0f172a", light: "#f8fafc", dark: "#020617" },
};

// Replace interactive syntaxes with Markdown formatting
const prepareInteractiveSyntax = (text: string) => {
  if (!text) return "";
  let t = String(text);
  t = t.replace(/<term\s+title=(?:'|")([^'"]+)(?:'|")[^>]*>([\s\S]*?)<\/term>/g, "**$2**"); // HTML Terms with title
  t = t.replace(/<term[^>]*>([\s\S]*?)<\/term>/g, "**$1**"); // HTML terms without title
  t = t.replace(/\{\{(.*?)\|(.*?)\}\}/g, "**$1** ($2)"); // Tooltips
  t = t.replace(/!!(.*?)\|(.*?)!!/g, "**$1** ($2)"); // Reveal
  t = t.replace(/>>(.*?)\|(.*?)<</g, "**$1**: $2"); // Expandable
  t = t.replace(/\(\((.*?)\|(.*?)\)\)/g, "**$2**"); // Badges
  t = t.replace(/\?\?(.*?)\|(.*?)\?\?/g, "**$1**"); // Quiz
  // @@ (Photo) is purposefully kept for PdfBlockRenderer to intercept and wrap text
  t = t.replace(/%%(.*?)\|(.*?)%%/g, "**$1** ($2)"); // Translation
  t = t.replace(/~~(.*?)\|(.*?)~~/g, "**$2**"); // Correction
  t = t.replace(/\^\^(.*?)\|(.*?)\^\^/g, "**$1** [$2]"); // Pronunciation
  t = t.replace(/\*\*([^*|]+)\|([^*|]+)\*\*/g, "**$1** ($2)"); // Deep Dive
  t = t.replace(/\[\[Match\|(.*?)\]\]/g, "__________"); // Matcher removed/replaced with blank for pdf
  t = t.replace(/\(\(\(\w+\|(.*?)\)\)\)/g, "**$1**"); // Voice
  t = t.replace(/§§(.*?)\|([\s\S]*?)§§/g, ""); // Remove Teacher/Interactive blocks entirely for PDF to avoid mess
  return t;
};

// Simple Arabic RTL detection
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

const styles = StyleSheet.create({
  page: { 
    padding: 50, 
    backgroundColor: '#ffffff', 
    fontFamily: 'Cairo', 
    paddingBottom: 80 
  },
  coverPage: { 
    padding: 0, 
    backgroundColor: '#f8fafc', 
    fontFamily: 'Cairo', 
    display: 'flex',
    flexDirection: 'column'
  },
  coverTitle: { 
    fontSize: 48, 
    fontWeight: 700, 
    marginBottom: 20, 
    textAlign: 'left',
    letterSpacing: -1.5,
    lineHeight: 1.1,
    color: '#0f172a'
  },
  coverSubtitle: { 
    fontSize: 16, 
    fontWeight: 400,
    color: '#64748b', 
    textAlign: 'left',
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  tocPage: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Cairo',
  },
  tocTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 15,
    color: '#0f172a'
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  tocText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 700,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderStyle: 'dotted',
    marginHorizontal: 12,
  },
  tocPageNum: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
  },
  title: { 
    fontSize: 32, 
    fontWeight: 700, 
    marginBottom: 24, 
    textAlign: 'left', 
    paddingBottom: 15, 
    borderBottomWidth: 2,
    marginTop: 10,
    color: '#0f172a',
    letterSpacing: -1
  },
  heading: { 
    fontSize: 20, 
    fontWeight: 700, 
    marginTop: 10, 
    marginBottom: 4,
    letterSpacing: -0.5,
    color: '#0f172a'
  },
  paragraph: { 
    fontSize: 11, 
    marginBottom: 4, 
    lineHeight: 1.5,
    color: '#334155'
  },
  listItem: { 
    fontSize: 11, 
    marginBottom: 3, 
    marginLeft: 15, 
    display: 'flex', 
    flexDirection: 'row' 
  },
  bullet: { 
    width: 20, 
    fontSize: 14, 
    fontWeight: 700, 
    color: '#94a3b8' 
  },
  boxContent: { 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8,
    borderLeftWidth: 4,
    backgroundColor: '#f8fafc'
  },
  highYieldBox: { 
    backgroundColor: '#fef2f2', 
    borderRadius: 8,
    borderLeftWidth: 4, 
    borderLeftColor: '#ef4444',
    padding: 12,
    marginBottom: 8
  },
  vocabContainer: { 
    flexDirection: 'row', 
    marginBottom: 6, 
    padding: 8, 
    backgroundColor: '#f8fafc', 
    borderRadius: 8,
    borderLeftWidth: 4
  },
  vocabTerm: { 
    fontWeight: 700, 
    width: '35%', 
    fontSize: 11 
  },
  vocabDef: { 
    width: '65%', 
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.5
  },
  codeBlock: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontFamily: 'Courier',
    fontSize: 9,
    lineHeight: 1.5,
  },
  codeHeader: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  flashcard: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  flashcardLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  flashcardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    fontSize: 8, 
    color: '#64748b', 
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
    letterSpacing: 3,
    fontWeight: 700,
  }
});

const RichText = ({ text, baseStyle }: { text: string; baseStyle: any }): any => {
  if (!text) return <Text style={baseStyle}>{" "}</Text>;
  const processed = prepareInteractiveSyntax(text);
  // Match bold (** or __), italics (* or _), code (`), highlight (==), and fallback photo (@@)
  const parts = processed.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==|@@[^@]+@@)/g);

  if (parts.length === 1 && !processed.match(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==|@@[^@]+@@)/)) {
    return <Text style={baseStyle}>{processed}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.filter(Boolean).map((part, i) => {
        
        let style: any = {
          fontWeight: baseStyle.fontWeight || 400,
          color: baseStyle.color || '#334155',
          backgroundColor: 'transparent'
        };

        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
          const content = part.slice(2, -2);
          return <RichText key={i} text={content} baseStyle={{ ...style, fontWeight: 700 }} />;
        } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
          const content = part.slice(1, -1);
          return <RichText key={i} text={content} baseStyle={{ ...style, color: '#64748b' }} />;
        } else if (part.startsWith('==') && part.endsWith('==')) {
          const content = part.slice(2, -2);
          return <RichText key={i} text={content} baseStyle={{ ...style, backgroundColor: '#fef3c7', color: '#92400e', padding: '0 2px' }} />;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          const content = part.slice(1, -1);
          style.color = '#ef4444';
          style.fontFamily = 'Courier';
          style.backgroundColor = '#fff1f2';
          style.padding = '0 2px';
          return <Text key={i} style={style}>{content}</Text>;
        } else if (part.startsWith('@@') && part.endsWith('@@')) {
          const innerText = part.slice(2, -2);
          const photoParts = innerText.split('|');
          const caption = photoParts[0];
          style.fontWeight = 700;
          style.color = '#6366f1';
          return <Text key={i} style={style}>{`[Photo: ${caption.trim()}]`}</Text>;
        }

        return <Text key={i} style={style}>{part}</Text>;
      })}
    </Text>
  );
};

// Utility to blend hex color with white (alpha 0-1) to produce a solid 6-digit hex and avoid failing react-pdf parser on 8-digit hex transparency
const lightBlend = (hex: string, alpha: number) => {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return hex; // Fallback
  
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  
  const bg = 255; // White background
  const newR = Math.round(r * alpha + bg * (1 - alpha));
  const newG = Math.round(g * alpha + bg * (1 - alpha));
  const newB = Math.round(b * alpha + bg * (1 - alpha));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

const darkBlend = (hex: string, alpha: number) => {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return hex; // Fallback
  
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  
  const bg = 0; // Black background
  const newR = Math.round(r * alpha + bg * (1 - alpha));
  const newG = Math.round(g * alpha + bg * (1 - alpha));
  const newB = Math.round(b * alpha + bg * (1 - alpha));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

const renderDiseaseSubtype = (subtype: string, children: React.ReactNode, docColors: any, isRtl: boolean, isExam: boolean) => {
  const label = subtype.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  const labelFontSize = isExam ? 8 : 10;
  const mb = isExam ? 4 : 8;

  switch (subtype) {
    case 'definition':
      return (
        <View style={{ backgroundColor: lightBlend(docColors.main, 0.05), borderLeftWidth: isRtl ? 0 : 4, borderRightWidth: isRtl ? 4 : 0, borderColor: docColors.main, padding: 8, marginBottom: mb, borderRadius: 2 }}>
          <Text style={{ fontWeight: 700, color: docColors.dark, fontSize: labelFontSize, textTransform: 'uppercase', marginBottom: 4, textAlign: isRtl ? 'right' : 'left' }}>{label}</Text>
          <View>{children}</View>
        </View>
      );
    case 'classification':
      return (
        <View wrap={false} style={{ borderWidth: 1, borderColor: lightBlend(docColors.main, 0.5), borderRadius: 4, marginBottom: mb, overflow: 'hidden' }}>
          <View style={{ backgroundColor: lightBlend(docColors.main, 0.15), paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: lightBlend(docColors.main, 0.5) }}>
            <Text style={{ color: docColors.dark, fontWeight: 700, fontSize: labelFontSize, textAlign: isRtl ? 'right' : 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
          </View>
          <View style={{ padding: 8, backgroundColor: '#fafafa' }}>{children}</View>
        </View>
      );
    case 'etiology':
      return (
        <View wrap={false} style={{ borderTopWidth: 2, borderBottomWidth: 2, borderColor: lightBlend(docColors.main, 0.4), borderStyle: 'dashed', paddingVertical: 8, paddingHorizontal: 4, marginBottom: mb }}>
          <Text style={{ color: docColors.main, fontWeight: 700, fontSize: labelFontSize, textAlign: 'center', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 2 }}>✦ {label} ✦</Text>
          <View>{children}</View>
        </View>
      );
    case 'riskFactors':
      return (
        <View style={{ backgroundColor: '#fff1f2', borderLeftWidth: isRtl ? 0 : 3, borderRightWidth: isRtl ? 3 : 0, borderLeftColor: '#fb7185', borderRightColor: '#fb7185', borderStyle: 'dotted', padding: 8, marginBottom: mb }}>
          <Text style={{ fontWeight: 700, color: '#e11d48', fontSize: labelFontSize, textTransform: 'uppercase', marginBottom: 4, textAlign: isRtl ? 'right' : 'left' }}>⚠ {label}</Text>
          <View>{children}</View>
        </View>
      );
    case 'clinicalFeatures':
      return (
        <View wrap={false} style={{ backgroundColor: lightBlend(docColors.main, 0.08), borderRadius: 8, padding: 8, paddingTop: 14, marginBottom: mb, position: 'relative', marginTop: 10, borderWidth: 1, borderColor: lightBlend(docColors.main, 0.2) }}>
          <View style={{ position: 'absolute', top: -10, left: isRtl ? 'auto' : 10, right: isRtl ? 10 : 'auto', backgroundColor: docColors.main, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: 700, fontSize: labelFontSize, textTransform: 'uppercase' }}>{label}</Text>
          </View>
          <View>{children}</View>
        </View>
      );
    case 'signs':
    case 'symptoms':
      return (
        <View style={{ paddingLeft: isRtl ? 0 : 12, paddingRight: isRtl ? 12 : 0, borderLeftWidth: isRtl ? 0 : 2, borderRightWidth: isRtl ? 2 : 0, borderColor: docColors.main, borderStyle: 'dotted', marginBottom: mb }}>
          <Text style={{ fontWeight: 700, color: lightBlend(docColors.dark, 0.8), fontSize: labelFontSize, textTransform: 'uppercase', marginBottom: 2, textAlign: isRtl ? 'right' : 'left' }}>⚬ {label}</Text>
          <View>{children}</View>
        </View>
      );
    case 'diagnosis':
      return (
        <View wrap={false} style={{ backgroundColor: '#f0fdf4', borderTopWidth: 3, borderTopColor: '#4ade80', borderRadius: 4, padding: 8, marginBottom: mb, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#bbf7d0' }}>
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: isRtl ? 0 : 6, marginLeft: isRtl ? 6 : 0 }} />
            <Text style={{ fontWeight: 700, color: '#166534', fontSize: labelFontSize, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
          </View>
          <View>{children}</View>
        </View>
      );
    case 'differentialDiagnosis':
      return (
        <View wrap={false} style={{ borderWidth: 2, borderColor: '#c084fc', borderStyle: 'dashed', padding: 8, marginBottom: mb, backgroundColor: '#faf5ff', borderRadius: 8 }}>
          <Text style={{ fontWeight: 800, color: '#7e22ce', fontSize: labelFontSize, textTransform: 'uppercase', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e9d5ff', paddingBottom: 4, textAlign: 'center' }}>↹ {label} ↹</Text>
          <View>{children}</View>
        </View>
      );
    case 'complications':
      return (
        <View wrap={false} style={{ backgroundColor: '#fffbeb', borderLeftWidth: isRtl ? 0 : 4, borderRightWidth: isRtl ? 4 : 0, borderColor: '#f59e0b', padding: 10, marginBottom: mb, borderRadius: 2 }}>
          <Text style={{ fontWeight: 800, color: '#b45309', fontSize: labelFontSize, textTransform: 'uppercase', marginBottom: 6, textAlign: isRtl ? 'right' : 'left' }}>⚠️ {label}</Text>
          <View>{children}</View>
        </View>
      );
    case 'management':
    case 'treatment':
      return (
        <View wrap={false} style={{ borderLeftWidth: isRtl ? 0 : 3, borderRightWidth: isRtl ? 3 : 0, borderBottomWidth: 3, borderColor: docColors.main, padding: 12, marginBottom: mb, borderBottomLeftRadius: isRtl ? 0 : 12, borderBottomRightRadius: isRtl ? 12 : 0, backgroundColor: lightBlend(docColors.main, 0.03) }}>
          <View style={{ backgroundColor: lightBlend(docColors.main, 0.15), alignSelf: isRtl ? 'flex-end' : 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 8, borderLeftWidth: isRtl ? 0 : 2, borderRightWidth: isRtl ? 2 : 0, borderColor: docColors.main }}>
            <Text style={{ fontWeight: 800, color: docColors.dark, fontSize: labelFontSize, textTransform: 'uppercase' }}>{label}</Text>
          </View>
          <View>{children}</View>
        </View>
      );
    case 'traps':
      return (
        <View wrap={false} style={{ borderWidth: 1, borderColor: '#ef4444', backgroundColor: '#fef2f2', padding: 10, borderRadius: 6, marginBottom: mb }}>
          <View style={{ backgroundColor: '#dc2626', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontWeight: 800, fontSize: labelFontSize, textTransform: 'uppercase', letterSpacing: 2 }}>🚨 {label} 🚨</Text>
          </View>
          <View>{children}</View>
        </View>
      );
    default:
      return (
        <View style={{ borderLeftWidth: isRtl ? 0 : 2, borderRightWidth: isRtl ? 2 : 0, borderColor: docColors.main, paddingLeft: isRtl ? 0 : 8, paddingRight: isRtl ? 8 : 0, marginBottom: mb }}>
          <Text style={{ fontWeight: 700, color: docColors.main, fontSize: labelFontSize, textTransform: 'uppercase', marginBottom: 4, textAlign: isRtl ? 'right' : 'left' }}>{label}</Text>
          <View>{children}</View>
        </View>
      );
  }
};

const PdfBlockRenderer: React.FC<{ 
  block: PdfBlock, 
  docColors: { main: string, light: string, dark: string },
  isExam?: boolean
}> = ({ block, docColors, isExam }) => {
  const content = block.content || '';
  const isRtl = isArabic(prepareInteractiveSyntax(content));
  
  // Use block-specific color if available, otherwise use theme color
  const blockColor = block.color || docColors.main;
  const blockColors = block.color ? {
    main: block.color,
    light: lightBlend(block.color, 0.1),
    dark: darkBlend(block.color, 0.8)
  } : docColors;

  const textStyle = { 
    ...styles.paragraph, 
    marginBottom: isExam ? 2 : styles.paragraph.marginBottom,
    fontSize: isExam ? 10 : styles.paragraph.fontSize,
    textAlign: isRtl ? 'right' : 'left' 
  } as const;

  const renderContent = () => {
    switch (block.type) {
      case 'disease':
        return (
          <View style={{
            marginVertical: 12,
            borderWidth: 2,
            borderColor: blockColors.main,
            borderRadius: 8,
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}>
            {block.title && (
              <View style={{ backgroundColor: blockColors.main, padding: 12 }}>
                <Text style={{ ...styles.heading, color: '#ffffff', marginTop: 0, marginBottom: 0, textAlign: isArabic(block.title) ? 'right' : 'left' }}>
                  {block.title}
                </Text>
              </View>
            )}
            <View style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {block.content && (
                <View style={{ marginBottom: 4 }}>
                   <RichText text={block.content} baseStyle={textStyle} />
                </View>
              )}
              {block.children?.map((child, idx) => (
                <View key={idx} style={{ marginBottom: 4 }}>
                  <PdfBlockRenderer block={child} docColors={blockColors} isExam={isExam} />
                </View>
              ))}
            </View>
          </View>
        );

      case 'heading':
    case 'subheading':
    case 'subtitle':
      const isSubtitle = block.type === 'subtitle';
      const isSubheading = block.type === 'subheading';
      
      if (isSubheading) {
        return (
          <View wrap={false} style={{ 
            marginTop: isExam ? 12 : 16, 
            marginBottom: isExam ? 6 : 8,
            paddingLeft: 10,
            paddingRight: 10,
            borderLeftWidth: 4,
            borderLeftColor: blockColors.main,
            backgroundColor: lightBlend(blockColors.main, 0.05),
            paddingVertical: 6,
            borderRadius: 4
          }}>
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
              <RichText 
                text={content} 
                baseStyle={{ 
                  ...styles.heading, 
                  fontSize: isExam ? 13 : 15,
                  color: darkBlend(blockColors.main, 0.7),
                  textAlign: isRtl ? 'right' : 'left',
                  marginTop: 0,
                  marginBottom: 0,
                  flex: 1
                }} 
              />
            </View>
          </View>
        );
      }
      
      return (
        <RichText 
          text={content} 
          baseStyle={{ 
            ...styles.heading, 
            fontSize: isSubtitle ? (isExam ? 11 : 13) : 18,
            color: isSubtitle ? '#334155' : blockColors.main,
            textAlign: isRtl ? 'right' : 'left',
            marginTop: isSubtitle ? (isExam ? 4 : 6) : 10,
            marginBottom: isSubtitle ? (isExam ? 2 : 2) : 4
          }} 
        />
      );
      
    case 'high_yield':
    case 'warning':
    case 'clinical_correlation':
    case 'tip':
    case 'note':
    case 'summary':
    case 'example':
    case 'explanation': {
      let boxColor = blockColors.main;
      let boxBg = blockColors.light;
      let borderStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
      let borderWidth = 4;
      let borderRadius = 8;
      let additionalStyles = {};

      switch (block.type) {
        case 'clinical_correlation':
          boxColor = blockColors.dark;
          boxBg = lightBlend(blockColors.main, 0.08);
          borderWidth = 5;
          break;
        case 'high_yield':
          boxColor = blockColors.main;
          boxBg = lightBlend(blockColors.main, 0.14);
          additionalStyles = { borderRightWidth: 4, borderRightColor: boxColor };
          break;
        case 'warning':
          boxColor = blockColors.dark;
          boxBg = lightBlend(blockColors.main, 0.1);
          borderStyle = 'dashed';
          borderWidth = 3;
          additionalStyles = { borderWidth: 3, borderColor: boxColor }; // Full dashed border
          break;
        case 'example':
          boxColor = blockColors.main;
          boxBg = lightBlend(blockColors.main, 0.06);
          borderWidth = 3;
          borderRadius = 4;
          additionalStyles = { borderLeftColor: blockColors.dark };
          break;
        case 'explanation':
          boxColor = blockColors.main;
          boxBg = '#f8fafc';
          borderWidth = 2;
          borderRadius = 10;
          break;
        case 'tip':
          boxColor = blockColors.dark;
          boxBg = blockColors.light;
          borderWidth = 4;
          additionalStyles = { borderTopWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderColor: lightBlend(blockColors.main, 0.3) };
          break;
        case 'note':
          boxColor = blockColors.main;
          boxBg = blockColors.light;
          borderRadius = 6;
          break;
        case 'summary':
          boxColor = blockColors.dark;
          boxBg = lightBlend(blockColors.main, 0.07);
          additionalStyles = { borderBottomWidth: 4, borderBottomColor: blockColors.main, borderLeftWidth: 0, paddingLeft: isExam ? 8 : 12 };
          break;
        default:
          boxColor = blockColors.main;
          boxBg = blockColors.light;
          break;
      }

      return (
        <View wrap={false} style={[styles.boxContent, { 
          borderLeftColor: boxColor, 
          backgroundColor: boxBg, 
          borderLeftWidth: borderWidth, 
          borderStyle: borderStyle as any,
          borderRadius: borderRadius,
          padding: isExam ? 10 : 14, 
          marginBottom: isExam ? 6 : 10,
          ...additionalStyles
        }]}>
          <Text style={{ fontWeight: 700, fontSize: isExam ? 8 : 10, marginBottom: 6, letterSpacing: 1.5, color: boxColor, textAlign: isRtl ? 'right' : 'left', textTransform: 'uppercase' }}>
            {block.type.replace('_', ' ')}
          </Text>
          <RichText text={content} baseStyle={textStyle} />
        </View>
      );
    }

    case 'list':
    case 'step':
      const isSplit = block.layout === 'split';
      return (
        <View style={{ marginBottom: isExam ? 4 : 8, flexDirection: isSplit ? 'row' : 'column', flexWrap: 'wrap' }}>
          {block.items?.map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={[styles.listItem, { 
                flexDirection: isItemRtl ? 'row-reverse' : 'row',
                width: isSplit ? '45%' : 'auto',
                marginLeft: isSplit ? (isItemRtl ? 0 : 5) : (isItemRtl ? 0 : 15),
                marginRight: isSplit ? (isItemRtl ? 5 : 0) : (isItemRtl ? 15 : 0),
                paddingRight: isSplit ? 10 : 0,
                marginBottom: isExam ? 2 : styles.listItem.marginBottom,
                fontSize: isExam ? 10 : styles.listItem.fontSize
              }]}>
                <Text style={[styles.bullet, { color: blockColors.main, textAlign: isItemRtl ? 'right' : 'left', fontSize: isExam ? 10 : 14 }]}>
                  {block.type === 'step' ? `${i+1}. ` : '•'}
                </Text>
                <View style={{ flex: 1 }}>
                  <RichText text={item} baseStyle={{ fontSize: isExam ? 10 : 11, lineHeight: isExam ? 1.3 : 1.6, textAlign: isItemRtl ? 'right' : 'left' }} />
                </View>
              </View>
            );
          })}
        </View>
      );

    case 'vocabulary':
      const vocabIsRtl = isArabic(prepareInteractiveSyntax(block.term || '') + prepareInteractiveSyntax(block.definition || ''));
      return (
        <View wrap={false} style={[styles.vocabContainer, { flexDirection: vocabIsRtl ? 'row-reverse' : 'row', borderLeftColor: blockColors.main, borderLeftWidth: 3, backgroundColor: lightBlend(blockColors.main, 0.06), padding: 12, borderRadius: 8, marginBottom: 8 }]}>
          <View style={[styles.vocabTerm, { width: '30%', paddingRight: vocabIsRtl ? 0 : 8, paddingLeft: vocabIsRtl ? 8 : 0 }]}>
            <RichText text={block.term || ''} baseStyle={{ fontWeight: 800, fontSize: 11, textAlign: vocabIsRtl ? 'right' : 'left', color: blockColors.dark }} />
          </View>
          <View style={[styles.vocabDef, { width: '70%', paddingLeft: vocabIsRtl ? 0 : 10, paddingRight: vocabIsRtl ? 10 : 0, borderLeftWidth: vocabIsRtl ? 0 : 1, borderRightWidth: vocabIsRtl ? 1 : 0, borderColor: lightBlend(blockColors.main, 0.3) }]}>
            <RichText text={block.definition || ''} baseStyle={{ fontSize: 11, textAlign: vocabIsRtl ? 'right' : 'left', color: '#334155' }} />
          </View>
        </View>
      );
      
    case 'quote':
      return (
        <View wrap={false} style={{ marginVertical: 20, paddingHorizontal: 25, borderLeftWidth: isRtl ? 0 : 4, borderRightWidth: isRtl ? 4 : 0, borderColor: lightBlend(blockColors.main, 0.5), borderStyle: 'solid', backgroundColor: lightBlend(blockColors.main, 0.02), paddingVertical: 10, borderRadius: 4 }}>
          <Text style={{ fontSize: 32, color: lightBlend(blockColors.main, 0.3), position: 'absolute', left: 8, top: -5, fontFamily: 'Times-Roman' }}>"</Text>
          <RichText text={content} baseStyle={{ ...textStyle, fontSize: 13, color: '#334155' }} />
        </View>
      );
      
    case 'container':
      return (
        <View style={{ marginBottom: isExam ? 10 : 20 }}>
          <View style={{ flexDirection: 'column', gap: isExam ? 5 : 10 }}>
            {block.children?.map((child, idx) => (
              <View key={idx} style={{ width: '100%', marginBottom: isExam ? 4 : 10 }}>
                 <PdfBlockRenderer block={child} docColors={blockColors} isExam={isExam} />
              </View>
            ))}
          </View>
        </View>
      );
      
    case 'table':
      return (
        <View wrap={false} style={{ marginBottom: 12, borderWidth: 1, borderColor: lightBlend(blockColors.main, 0.3), borderRadius: 8, overflow: 'hidden' }}>
          {block.columns && block.columns.length > 0 ? (
            <View style={{ flexDirection: 'row', backgroundColor: lightBlend(blockColors.main, 0.1), borderBottomWidth: 1, borderColor: lightBlend(blockColors.main, 0.3) }}>
              {block.columns.map((col, i) => (
                <View key={i} style={{ flex: 1, padding: 10, borderRightWidth: i !== block.columns!.length - 1 ? 1 : 0, borderColor: lightBlend(blockColors.main, 0.3) }}>
                  <RichText text={col} baseStyle={{ fontSize: 10, fontWeight: 800, textAlign: isArabic(prepareInteractiveSyntax(col)) ? 'right' : 'left', color: blockColors.dark }} />
                </View>
              ))}
            </View>
          ) : []}
          {block.rows && block.rows.map((row, rI) => (
            <View key={rI} style={{ flexDirection: 'row', borderBottomWidth: rI !== block.rows!.length - 1 ? 1 : 0, borderColor: lightBlend(blockColors.main, 0.2), backgroundColor: rI % 2 === 0 ? '#ffffff' : lightBlend(blockColors.main, 0.04) }}>
              {row.map((cell, cI) => (
                <View key={cI} style={{ flex: 1, padding: 10, borderRightWidth: cI !== row.length - 1 ? 1 : 0, borderColor: lightBlend(blockColors.main, 0.2) }}>
                  <RichText text={cell} baseStyle={{ fontSize: 10, textAlign: isArabic(prepareInteractiveSyntax(cell)) ? 'right' : 'left' }} />
                </View>
              ))}
            </View>
          ))}
        </View>
      );

    case 'code':
      return (
        <View wrap={false} style={[styles.codeBlock, { backgroundColor: '#1e293b', borderColor: lightBlend(blockColors.main, 0.5), borderWidth: 1 }]}>
          {block.language ? <Text style={[styles.codeHeader, { color: blockColors.light, borderBottomColor: '#334155' }]}>{block.language}</Text> : null}
          <Text style={{ fontFamily: 'Courier', fontSize: 9, lineHeight: 1.5, color: '#f1f5f9' }}>{content}</Text>
        </View>
      );

    case 'flashcard':
      return (
        <View wrap={false} style={[styles.flashcard, { borderLeftWidth: 5, borderLeftColor: blockColors.main, backgroundColor: lightBlend(blockColors.main, 0.07), borderRadius: 10, padding: 14 }]}>
          <Text style={[styles.flashcardLabel, { color: blockColors.dark, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }]}>Flashcard</Text>
          <RichText text={block.front || ''} baseStyle={{ fontWeight: 800, fontSize: 13, color: blockColors.dark, marginBottom: 8 }} />
          <View style={[styles.flashcardDivider, { backgroundColor: lightBlend(blockColors.main, 0.2), marginVertical: 8 }]} />
          <RichText text={block.back || ''} baseStyle={{ fontSize: 12, color: '#334155' }} />
        </View>
      );

    case 'essay_area':
      return (
        <View wrap={false} style={{ marginTop: 8, marginBottom: 12, borderWidth: 1, borderColor: lightBlend(blockColors.main, 0.5), borderRadius: 8, borderStyle: 'dashed', backgroundColor: lightBlend(blockColors.light, 0.2), padding: 12 }}>
          <Text style={{ fontSize: 8, color: blockColors.dark, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Essay Response Area</Text>
          <View style={{ height: 120, flexDirection: 'column', gap: 15 }}>
            {[1, 2, 3, 4, 5, 6].map(line => (
              <View key={line} style={{ height: 1.5, backgroundColor: lightBlend(blockColors.main, 0.2) }} />
            ))}
          </View>
        </View>
      );

    case 'image':
      if (block.imageUrl) {
        const alignment = block.imageAlignment || 'center';
        return (
          <View wrap={false} style={{ marginVertical: 5, alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start' }}>
            <Image 
              src={block.imageUrl} 
              style={{ 
                width: block.imageWidth ? `${block.imageWidth}%` : '100%', 
                maxWidth: '100%',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#f1f5f9'
              }} 
            />
            {block.imageCaption ? (
              <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4, textAlign: 'center', width: '100%' }}>
                {block.imageCaption}
              </Text>
            ) : []}
          </View>
        );
      }
      return <View />;

    case 'horizontal_rule':
      return (
        <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 6, width: '100%' }} />
      );

    case 'page_break':
      return (
        <View break />
      );

    case 'plain':
    default:
      if (!content) return <View />;
      
      if (block.type === 'plain') {
        return <Text style={{ marginBottom: 4 }}>{content}</Text>;
      }
      
      return <RichText text={content} baseStyle={textStyle} />;
    }
  };

  const diseaseSubtypes = [
    'definition', 'etiology', 'classification', 'riskFactors', 'clinicalFeatures', 
    'signs', 'symptoms', 'diagnosis', 'differentialDiagnosis', 'complications', 
    'management', 'treatment', 'traps'
  ];

  let matchedSubType = block.subType;
  if (block.subType) {
    const normalized = block.subType.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = diseaseSubtypes.find(s => s.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
    if (found) {
      matchedSubType = found;
    } else {
      if (normalized.includes('trap')) matchedSubType = 'traps';
      else if (normalized.includes('clinical')) matchedSubType = 'clinicalFeatures';
      else if (normalized.includes('differential')) matchedSubType = 'differentialDiagnosis';
      else if (normalized.includes('overview') || normalized.includes('definition')) matchedSubType = 'definition';
      else if (normalized.includes('risk')) matchedSubType = 'riskFactors';
      else if (normalized.includes('symptom')) matchedSubType = 'symptoms';
      else if (normalized.includes('sign')) matchedSubType = 'signs';
      else if (normalized.includes('manage') || normalized.includes('treat')) matchedSubType = 'management';
      else if (normalized.includes('complic')) matchedSubType = 'complications';
      else if (normalized.includes('diagnos')) matchedSubType = 'diagnosis';
      else if (normalized.includes('etiolog')) matchedSubType = 'etiology';
      else if (normalized.includes('classif')) matchedSubType = 'classification';
    }
  }

  if (matchedSubType && diseaseSubtypes.includes(matchedSubType)) {
    return renderDiseaseSubtype(matchedSubType, renderContent(), docColors, isRtl, isExam || false);
  }

  return renderContent();
};

const TableOfContents = ({ documents, mainColor, lightColor, fontFamily }: { documents: PdfDocument[], mainColor: string, lightColor: string, fontFamily?: string }) => {
  const tocItems: { title: string; page: number }[] = [];
  let currentPage = 2; // Assuming cover is page 0, TOC is page 1

  documents.forEach((doc, idx) => {
    const title = prepareInteractiveSyntax(doc.title || `Document ${idx + 1}`);
    tocItems.push({ title, page: currentPage });
    
    // Estimate page count
    const blocksCount = doc.blocks.length;
    currentPage += Math.ceil(blocksCount / 5) || 1; 
  });

  return (
    <Page size="A4" style={[styles.tocPage, { position: 'relative', fontFamily }]}>
      <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
        <Path d="M0 0 L595 0 L595 100 C400 200 150 50 0 150 Z" fill={mainColor} opacity="0.05" />
        <Path d="M595 842 L0 842 L0 700 C200 600 400 800 595 700 Z" fill={lightColor} opacity="0.4" />
        
        <Circle cx="550" cy="50" r="150" fill="none" stroke={mainColor} strokeWidth="1" opacity="0.1" />
        <Circle cx="550" cy="50" r="100" fill="none" stroke={mainColor} strokeWidth="1" opacity="0.1" strokeDasharray="3,3" />
        
        <Line x1="40" y1="0" x2="40" y2="842" stroke={mainColor} strokeWidth="1" opacity="0.2" />
        <Line x1="50" y1="0" x2="50" y2="842" stroke={mainColor} strokeWidth="1" opacity="0.05" />
      </Svg>

      <Text style={[styles.tocTitle, { borderBottomColor: mainColor }]}>Table of Contents</Text>
      <View>
        {tocItems.map((item, i) => (
          <View key={i} style={styles.tocItem}>
            <Text style={styles.tocText}>{item.title}</Text>
            <View style={styles.tocDots} />
            <Text style={[styles.tocPageNum, { color: mainColor }]}>{i + 3}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
};

import { ReactPdfOutputDrastic } from './PdfExportDrastic';
import { ReactPdfOutputFancy } from './PdfExportFancy';
import { ReactPdfOutputModern } from './themes/PdfExportModern';
import { ReactPdfOutputBrutalist } from './themes/PdfExportBrutalist';
import { ReactPdfOutputGameMinecraft } from './themes/PdfExportGameMinecraft';
import { ReactPdfOutputTADC } from './themes/PdfExportTADC';
import { ReactPdfOutputDuck } from './themes/PdfExportDuck';
import { ReactPdfOutputUndertale } from './themes/PdfExportUndertale';
import { ReactPdfOutputSaidi } from './themes/PdfExportSaidi';
import { ReactPdfOutputArcane } from './themes/PdfExportArcane';
import { ReactPdfOutputUltimate } from './themes/PdfExportUltimate';
import { ReactPdfOutputSuperhero } from './themes/PdfExportSuperhero';
import { ReactPdfOutputGameAdventureTime } from './themes/PdfExportGameAdventureTime';
import { ReactPdfOutputGameHollowKnight } from './themes/PdfExportGameHollowKnight';

const ReactPdfOutputTheme = ({
  documents,
  themeColor,
  includeToc = true,
  includeCover = true,
  customTheme,
  colorSequence = ['indigo'],
  isExam = false,
  appTheme,
}: {
  documents: PdfDocument[];
  themeColor: string;
  includeToc?: boolean;
  includeCover?: boolean;
  customTheme?: any;
  colorSequence?: string[];
  isExam?: boolean;
  appTheme?: string;
}) => {
  if (appTheme === 'modern') {
    return (
      <ReactPdfOutputModern
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        customTheme={customTheme}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'brutalist') {
    return (
      <ReactPdfOutputBrutalist
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        customTheme={customTheme}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'game-minecraft') {
    return (
      <ReactPdfOutputGameMinecraft
        documents={documents}
        includeToc={includeToc}
        includeCover={includeCover}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'tadc') {
    return (
      <ReactPdfOutputTADC
        documents={documents}
        includeToc={includeToc}
        includeCover={includeCover}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'duck') {
    return (
      <ReactPdfOutputDuck
        documents={documents}
        includeToc={includeToc}
        includeCover={includeCover}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'undertale') {
    return (
      <ReactPdfOutputUndertale
        documents={documents}
        includeToc={includeToc}
        includeCover={includeCover}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'saidi') {
    return (
      <ReactPdfOutputSaidi
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'arcane') {
    return (
      <ReactPdfOutputArcane
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'ultimate') {
    return (
      <ReactPdfOutputUltimate
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'superhero') {
    return (
      <ReactPdfOutputSuperhero
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'adventure-time') {
    return (
      <ReactPdfOutputGameAdventureTime
        documents={documents}
        includeToc={includeToc}
        includeCover={includeCover}
        isExam={isExam}
      />
    );
  }

  if (appTheme === 'hollow-knight' || customTheme === 'hollow-knight') {
    return (
      <ReactPdfOutputGameHollowKnight
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }

  // Fallback
  return (
    <ReactPdfOutputStandard
      documents={documents}
      themeColor={themeColor}
      includeToc={includeToc}
      includeCover={includeCover}
      customTheme={customTheme}
      colorSequence={colorSequence}
      isExam={isExam}
    />
  );
};

export const ReactPdfOutputStandard = ({ 
  documents, 
  themeColor, 
  includeToc = true,
  includeCover = true,
  customTheme,
  colorSequence = ['indigo'],
  isExam = false
}: { 
  documents: PdfDocument[]; 
  themeColor: string; 
  includeToc?: boolean;
  includeCover?: boolean;
  customTheme?: any;
  colorSequence?: string[];
  isExam?: boolean;
}) => {
  const groupsOrder = Array.from(new Set(documents.map(d => d.group || "Ungrouped")));
  
  const getColorsForDoc = (groupName: string) => {
    if (customTheme?.enabled) {
      return {
        main: customTheme.primaryColor,
        light: lightBlend(customTheme.primaryColor, 0.1),
        dark: darkBlend(customTheme.primaryColor, 0.8)
      };
    }
    const gIdx = groupsOrder.indexOf(groupName || "Ungrouped");
    const colorName = colorSequence[gIdx % colorSequence.length] || themeColor || 'indigo';
    
    if (colorName && colorName.startsWith('custom-')) {
      const hex = '#' + colorName.replace('custom-', '');
      return {
        main: hex,
        light: lightBlend(hex, 0.15),
        dark: darkBlend(hex, 0.8)
      };
    }
    
    return colorMap[colorName] || colorMap['indigo'];
  };

  const tColors = getColorsForDoc(documents[0]?.group || "Ungrouped");

  const isCustomUploadedFont = customTheme?.customUploadedFont && customTheme?.headingFont === customTheme?.customUploadedFont.fontFamilyName;
  const fontFam = isCustomUploadedFont ? customTheme.customUploadedFont.fontFamilyName : 'Cairo';
  
  if (isCustomUploadedFont) {
    try {
      Font.register({
        family: customTheme.customUploadedFont.fontFamilyName,
        src: customTheme.customUploadedFont.dataUrl
      });
    } catch (e) {
      // Ignored if already registered
    }
  }
  
  return (
    <Document title="Document Export" author="Reader">
      {/* Cover Page */}
      {includeCover ? (
        <Page size="A4" style={{ backgroundColor: customTheme?.enabled ? customTheme.backgroundColor : '#ffffff', padding: 0, position: 'relative', fontFamily: fontFam }}>
          <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
            <Path d="M0 0 L595 0 L595 250 C400 350 200 150 0 350 Z" fill={tColors.light} opacity="0.4" />
            <Path d="M0 0 L595 0 L595 200 C450 300 150 100 0 300 Z" fill={tColors.main} opacity="0.1" />
            
            <Path d="M595 842 L0 842 L0 600 C200 500 400 700 595 500 Z" fill={tColors.light} opacity="0.4" />
            <Path d="M595 842 L0 842 L0 650 C150 550 450 750 595 550 Z" fill={tColors.main} opacity="0.15" />

            <Circle cx="520" cy="180" r="120" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.2" strokeDasharray="4,8" />
            <Circle cx="520" cy="180" r="150" fill="none" stroke={tColors.main} strokeWidth="2" opacity="0.1" />
            <Circle cx="520" cy="180" r="180" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.15" />
            
            <Circle cx="50" cy="650" r="200" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.15" />
            <Circle cx="50" cy="650" r="120" fill={tColors.main} opacity="0.04" />

            <Line x1="45" y1="0" x2="45" y2="842" stroke={tColors.main} strokeWidth="1" opacity="0.15" />
            <Line x1="550" y1="0" x2="550" y2="842" stroke={tColors.main} strokeWidth="1" opacity="0.15" />
            <Line x1="0" y1="45" x2="595" y2="45" stroke={tColors.main} strokeWidth="1" opacity="0.15" />
            <Line x1="0" y1="797" x2="595" y2="797" stroke={tColors.main} strokeWidth="1" opacity="0.15" />
            
            <Circle cx="45" cy="45" r="4" fill={tColors.main} opacity="0.5" />
            <Circle cx="550" cy="45" r="4" fill={tColors.main} opacity="0.5" />
            <Circle cx="45" cy="797" r="4" fill={tColors.main} opacity="0.5" />
            <Circle cx="550" cy="797" r="4" fill={tColors.main} opacity="0.5" />

            <Rect x="50" y="250" width="8" height="8" fill={tColors.main} opacity="0.2" />
            <Rect x="50" y="270" width="8" height="8" fill={tColors.main} opacity="0.2" />
            <Rect x="50" y="290" width="8" height="8" fill={tColors.main} opacity="0.2" />
          </Svg>
          
          <View style={{ flex: 1, padding: 60, display: 'flex', flexDirection: 'column' }}>
            {/* Header section */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ width: 48, height: 48, backgroundColor: tColors.main, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>A</Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4, marginTop: 4 }}>{isExam ? 'EXAM' : 'PDF DOCUMENT'}</Text>
                {/* Tech Barcode Motif */}
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 3 }}>
                   <View style={{ width: 2, height: 12, backgroundColor: tColors.main, opacity: 0.8 }} />
                   <View style={{ width: 4, height: 12, backgroundColor: tColors.main, opacity: 0.4 }} />
                   <View style={{ width: 1, height: 12, backgroundColor: tColors.main, opacity: 0.7 }} />
                   <View style={{ width: 6, height: 12, backgroundColor: tColors.main, opacity: 0.2 }} />
                   <View style={{ width: 2, height: 12, backgroundColor: tColors.main, opacity: 0.9 }} />
                   <View style={{ width: 1, height: 12, backgroundColor: tColors.main, opacity: 0.5 }} />
                   <View style={{ width: 3, height: 12, backgroundColor: tColors.main, opacity: 0.3 }} />
                   <View style={{ width: 2, height: 12, backgroundColor: tColors.main, opacity: 0.8 }} />
                </View>
              </View>
            </View>

            {/* Centered Title section */}
            <View style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <View style={{ width: 60, height: 6, backgroundColor: tColors.main, borderRadius: 3, marginBottom: 30 }} />
              <Text style={{ fontSize: 56, fontWeight: 700, color: customTheme?.enabled ? customTheme.textColor : '#0f172a', lineHeight: 1.1, letterSpacing: -2, marginBottom: 20 }}>
                {prepareInteractiveSyntax(documents[0]?.title || 'Exported Document')}
              </Text>
              <Text style={{ fontSize: 16, color: '#64748b', letterSpacing: 0.5, lineHeight: 1.6, textTransform: 'uppercase', fontWeight: 700 }}>
                 Precision Learning Guide
              </Text>
            </View>

            {/* Footer Metadata */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                 <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Generated On</Text>
                 <Text style={{ fontSize: 12, color: customTheme?.enabled ? customTheme.textColor : '#0f172a', marginTop: 8, fontWeight: 700 }}>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                 <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>System Engine</Text>
                 <Text style={{ fontSize: 12, color: customTheme?.enabled ? customTheme.textColor : '#0f172a', marginTop: 8, fontWeight: 700 }}>{isExam ? 'EXAM' : 'PDF DOCUMENT'}</Text>
              </View>
            </View>
          </View>
          
          {/* Bottom decorative geometric accent */}
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 250, height: 250, backgroundColor: tColors.light, borderTopLeftRadius: 300, zIndex: -2 }} />
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 150, height: 150, backgroundColor: tColors.main, opacity: 0.1, borderTopLeftRadius: 300, zIndex: -1 }} />
        </Page>
      ) : null}

      {/* TOC */}
      {includeToc && documents.length > 1 ? <TableOfContents documents={documents} mainColor={tColors.main} lightColor={tColors.light} /> : null}

      {/* Document Pages */}
      {documents.map((doc, docIdx) => {
        const docTitle = prepareInteractiveSyntax(doc.title || `Document ${docIdx + 1}`);
        const isTitleRtl = isArabic(docTitle);
        const docColors = getColorsForDoc(doc.group || "Ungrouped");        // Group text blocks so they visually wrap alongside images
        const groupedBlocks: any[] = [];
        let r = 0;
        while (r < doc.blocks.length) {
            const block = doc.blocks[r];
            const content = block.content || '';
            
            // Check for photo in text OR a dedicated image block
            const photoMatch = content && content.match(/@@([^@]+)@@/);
            const isDedicatedImage = block.type === 'image' && block.imageUrl;

            if (photoMatch || isDedicatedImage) {
                let photoInfo: { url: string; caption: string; fullMatch: string } = { url: '', caption: '', fullMatch: '' };

                if (isDedicatedImage) {
                    photoInfo = { 
                      url: block.imageUrl || '', 
                      caption: block.imageCaption || '', 
                      fullMatch: '' 
                    };
                } else if (photoMatch) {
                    const innerText = photoMatch[1];
                    const parts = innerText.split('|').map(p => p.trim());
                    let caption = parts[0];
                    let url = '';
                    if (parts.length >= 3) {
                       url = parts[2];
                       caption = parts[1] || parts[0]; 
                    } else if (parts.length === 2 && (parts[1].startsWith('http') || parts[1].startsWith('data:image'))) {
                       url = parts[1];
                    }
                    photoInfo = { url, caption, fullMatch: photoMatch[0] };
                }

                if (photoInfo.url) {
                    const combined = [block];
                    let j = r + 1;
                    
                    // Cap the look-ahead to avoid pushing too many blocks into a single column
                    let sideBlockCount = 0;
                    
                    // User requested fixed 1 blocks regardless of size by default
                    const manualBlocks = block.imageBlocks;
                    const MAX_SIDE_BLOCKS = manualBlocks !== undefined ? manualBlocks : 1;

                    while (j < doc.blocks.length && sideBlockCount < MAX_SIDE_BLOCKS) {
                        const nextBlock = doc.blocks[j];
                        
                        // Terminals that SHOULD break a sidebar group
                        const isTerminal = [
                          'heading', 'subtitle', 'horizontal_rule', 'page_break', 'container'
                        ].includes(nextBlock.type);
                        if (isTerminal) break;
                        
                        // Break if we hit another image
                        const hasAnotherImage = (nextBlock.type === 'plain' && nextBlock.content && nextBlock.content.match(/@@([^@]+)@@/)) || 
                                               (nextBlock.type === 'image' && nextBlock.imageUrl);
                        if (hasAnotherImage) break;
                        
                        combined.push(nextBlock);
                        j++;
                        sideBlockCount++;
                    }

                    groupedBlocks.push({ 
                      isPhotoGroup: true, 
                      blocks: combined, 
                      photo: photoInfo,
                      isFirstBlockImage: isDedicatedImage
                    });
                    r = j;
                    continue;
                }
            }
            
            groupedBlocks.push({ isPhotoGroup: false, block });
            r++;
        }

        return (
          <Page key={docIdx} size="A4" style={[styles.page, { padding: isExam ? 35 : 50 }, customTheme?.enabled && { backgroundColor: customTheme.backgroundColor }, { position: 'relative', paddingTop: isExam ? 40 : 60, paddingBottom: isExam ? 60 : 80, fontFamily: fontFam }]}>
            {/* Extended Page Background Visuals */}
            <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
              <Rect x="0" y="0" width="595" height="6" fill={docColors.main} opacity="0.9" />
              <Rect x="0" y="6" width="595" height="2" fill={docColors.main} opacity="0.2" />

              <Path d="M400 0 L595 200 L595 0 Z" fill={docColors.light} opacity="0.4" />
              <Path d="M0 650 L200 842 L0 842 Z" fill={docColors.main} opacity="0.05" />
              <Path d="M595 700 C500 750 550 842 595 842 Z" fill={docColors.main} opacity="0.08" />
              
              <Circle cx="550" cy="50" r="100" fill="none" stroke={docColors.main} strokeWidth="1" opacity="0.15" strokeDasharray="3,6" />
              <Circle cx="50" cy="800" r="150" fill="none" stroke={docColors.main} strokeWidth="1.5" opacity="0.05" />
              <Circle cx="50" cy="800" r="100" fill="none" stroke={docColors.light} strokeWidth="1" opacity="0.3" />

              <Line x1="25" y1="120" x2="25" y2="720" stroke={docColors.main} strokeWidth="1.5" opacity="0.15" />
              <Line x1="570" y1="200" x2="570" y2="650" stroke={docColors.main} strokeWidth="1" opacity="0.1" strokeDasharray="5,5" />

              <Rect x="23" y="120" width="4" height="4" fill={docColors.main} opacity="0.6" />
              <Rect x="23" y="720" width="4" height="4" fill={docColors.main} opacity="0.6" />
              
              <Polygon points="570,195 575,205 565,205" fill={docColors.main} opacity="0.4" />
              <Polygon points="570,655 575,645 565,645" fill={docColors.main} opacity="0.4" />
            </Svg>

            {/* Existing Title Rendering */}
            <Text style={{...styles.title, textAlign: isTitleRtl ? 'right' : 'left', borderBottomColor: docColors.main, color: customTheme?.enabled ? customTheme.textColor : '#0f172a'}}>{docTitle}</Text>
            {groupedBlocks.map((group, i) => {
               if (group.isPhotoGroup) {
                  const firstBlock = group.blocks[0];
                  
                  // Prep the text column content
                  let leftColumnContent: any[] = [];
                  if (!group.isFirstBlockImage) {
                    const modifiedFirst = { ...firstBlock, content: firstBlock.content.replace(group.photo.fullMatch, '').trim() };
                    if (modifiedFirst.content) leftColumnContent.push(modifiedFirst);
                  }
                  
                  // Add all subsequent blocks to the text column
                  leftColumnContent = [...leftColumnContent, ...group.blocks.slice(1)];
                  
                  return (
                    <View key={`g-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: isExam ? 6 : 12 }}>
                      <View style={{ flex: 1, paddingRight: 20 }}>
                        {leftColumnContent.map((b, bIdx) => (
                           <PdfBlockRenderer key={`lb-${i}-${bIdx}`} block={b} docColors={docColors} isExam={isExam} />
                        ))}
                      </View>
                      
                      <View style={{ width: '32%', flexShrink: 0, alignSelf: 'flex-start' }}>
                        <View style={{ borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' }}>
                          <Image src={group.photo.url.trim()} style={{ width: '100%' }} />
                        </View>
                        {group.photo.caption && group.photo.caption.trim() && (
                          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 8, textAlign: 'center', lineHeight: 1.4, paddingHorizontal: 4 }}>
                            {group.photo.caption.trim()}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
               }
               return <PdfBlockRenderer key={i} block={group.block} docColors={docColors} isExam={isExam} />;
            })}
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) => `PDF DOCUMENT  //  PAGE ${pageNumber} OF ${totalPages}`}
              fixed
            />
          </Page>
        );
      })}
    </Document>
  );
};

export const ReactPdfOutput = ({ 
  documents, 
  themeColor, 
  includeToc = true,
  includeCover = true,
  customTheme,
  colorSequence = ['indigo'],
  isExam = false,
  exportStyle = 'standard',
  appTheme,
}: { 
  documents: PdfDocument[]; 
  themeColor: string; 
  includeToc?: boolean;
  includeCover?: boolean;
  customTheme?: any;
  colorSequence?: string[];
  isExam?: boolean;
  exportStyle?: 'standard' | 'drastic' | 'fancy' | 'theme';
  appTheme?: string;
}) => {
  if (exportStyle === 'theme') {
    return (
      <ReactPdfOutputTheme 
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        customTheme={customTheme}
        colorSequence={colorSequence}
        isExam={isExam}
        appTheme={appTheme}
      />
    );
  }
  if (exportStyle === 'drastic') {
    return (
      <ReactPdfOutputDrastic 
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        customTheme={customTheme}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }
  if (exportStyle === 'fancy') {
    return (
      <ReactPdfOutputFancy 
        documents={documents}
        themeColor={themeColor}
        includeToc={includeToc}
        includeCover={includeCover}
        customTheme={customTheme}
        colorSequence={colorSequence}
        isExam={isExam}
      />
    );
  }
  return (
    <ReactPdfOutputStandard 
      documents={documents}
      themeColor={themeColor}
      includeToc={includeToc}
      includeCover={includeCover}
      customTheme={customTheme}
      colorSequence={colorSequence}
      isExam={isExam}
    />
  );
};

export const PdfNativeExportButton = ({ 
  documents, 
  themeColor, 
  includeToc = true,
  includeCover = true,
  customTheme,
  colorSequence,
  isExam = false,
  enableGradients = false,
  exportStyle = 'standard',
  appTheme,
  className,
  children
}: { 
  documents: PdfDocument[]; 
  themeColor?: string;
  includeToc?: boolean;
  includeCover?: boolean;
  customTheme?: any;
  colorSequence?: string[];
  isExam?: boolean;
  enableGradients?: boolean;
  exportStyle?: 'standard' | 'drastic' | 'fancy' | 'theme';
  appTheme?: string;
  className?: string;
  children?: React.ReactNode | ((isGenerating: boolean) => React.ReactNode);
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const blob = await pdf(
        <ReactPdfOutput 
          documents={documents} 
          themeColor={themeColor || 'indigo'} 
          includeToc={includeToc}
          includeCover={includeCover}
          customTheme={customTheme}
          colorSequence={colorSequence}
          isExam={isExam}
          exportStyle={exportStyle}
          appTheme={appTheme}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Export-${new Date().getTime()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate vector PDF", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={className || "export-remove w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"}
    >
      {children ? (typeof children === 'function' ? children(isGenerating) : children) : (
        <>
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <DownloadCloud className="w-4 h-4 text-indigo-600" />
          )}
          <div className="flex flex-col items-start">
            <span className="text-[13px] leading-tight">{isGenerating ? 'Generating PDF...' : 'Export Pro Document'}</span>
            <span className="text-[10px] text-slate-400 font-normal">Vector-based, high-fidelity PDF</span>
          </div>
        </>
      )}
    </button>
  );
};
