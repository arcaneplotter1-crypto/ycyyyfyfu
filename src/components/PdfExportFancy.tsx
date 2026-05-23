import React from 'react';
import { PdfDocument, PdfBlock } from '../types';
import { Document, Page, Text, View, Image, Svg, Path, Line, Circle, Rect, Polygon, Font } from '@react-pdf/renderer';

// Register Inter for reading text
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 }
  ]
});

// Cairo for Arabic
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5W1Q.ttf', fontWeight: 700 }
  ]
});

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
const getFontFamily = (text: string, defaultFont = 'Inter') => isArabic(text) ? 'Cairo' : defaultFont;
const getTitleFontFamily = (text: string) => isArabic(text) ? 'Cairo' : 'Times-Roman';

const prepareInteractiveSyntax = (text: string) => {
  if (!text) return "";
  let t = String(text);
  t = t.replace(/<term\s+title=(?:'|")([^'"]+)(?:'|")[^>]*>([\s\S]*?)<\/term>/g, "**$2**");
  t = t.replace(/<term[^>]*>([\s\S]*?)<\/term>/g, "**$1**");
  t = t.replace(/\{\{(.*?)\|(.*?)\}\}/g, "**$1** ($2)");
  t = t.replace(/!!(.*?)\|(.*?)!!/g, "**$1** ($2)");
  t = t.replace(/>>(.*?)\|(.*?)<</g, "**$1**: $2");
  t = t.replace(/\(\((.*?)\|(.*?)\)\)/g, "**$2**");
  t = t.replace(/\?\?(.*?)\|(.*?)\?\?/g, "**$1**");
  t = t.replace(/%%(.*?)\|(.*?)%%/g, "**$1** ($2)");
  t = t.replace(/~~(.*?)\|(.*?)~~/g, "**$2**");
  t = t.replace(/\^\^(.*?)\|(.*?)\^\^/g, "**$1** [$2]");
  t = t.replace(/\*\*([^*|]+)\|([^*|]+)\*\*/g, "**$1** ($2)");
  t = t.replace(/\[\[Match\|(.*?)\]\]/g, "__________");
  t = t.replace(/\(\(\(\w+\|(.*?)\)\)\)/g, "**$1**");
  t = t.replace(/§§(.*?)\|([\s\S]*?)§§/g, ""); // Remove Teacher/Interactive blocks entirely for PDF to avoid mess
  return t;
};

const FancyRichText = ({ text, baseStyle }: { text: string; baseStyle: any }): any => {
  if (!text) return <Text style={baseStyle}>{" "}</Text>;
  const processed = prepareInteractiveSyntax(text);
  const parts = processed.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==|@@[^@]+@@)/g);

  if (parts.length === 1 && !processed.match(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==|@@[^@]+@@)/)) {
    return <Text style={{ ...baseStyle, fontFamily: getFontFamily(processed, baseStyle.fontFamily) }}>{processed}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.filter(Boolean).map((part, i) => {
        let style: any = {
          ...baseStyle,
          fontWeight: baseStyle?.fontWeight || 400,
          color: baseStyle?.color || '#374151',
          fontFamily: getFontFamily(part, baseStyle?.fontFamily)
        };

        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
          const content = part.slice(2, -2);
          return <FancyRichText key={i} text={content} baseStyle={{ ...style, fontWeight: 700, color: '#111827' }} />;
        } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
          const content = part.slice(1, -1);
          return <FancyRichText key={i} text={content} baseStyle={{ ...style, color: '#6b7280' }} />;
        } else if (part.startsWith('==') && part.endsWith('==')) {
          const content = part.slice(2, -2);
          return <FancyRichText key={i} text={content} baseStyle={{ ...style, backgroundColor: '#fcd34d', color: '#92400e', padding: '1px 3px', borderRadius: 4 }} />;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          const content = part.slice(1, -1);
          style.color = '#be185d';
          style.fontFamily = isArabic(content) ? 'Cairo' : 'Courier';
          style.backgroundColor = '#fdf2f8';
          return <Text key={i} style={style}>{content}</Text>;
        } else if (part.startsWith('@@') && part.endsWith('@@')) {
          const innerText = part.slice(2, -2);
          const photoParts = innerText.split('|');
          const caption = photoParts[0];
          style.fontWeight = 700;
          style.color = '#047857';
          return <Text key={i} style={style}>{`[Photo: ${caption.trim()}]`}</Text>;
        }

        return <Text key={i} style={style}>{part}</Text>;
      })}
    </Text>
  );
};

const matchSubtype = (subType: string = '') => {
  const norm = subType.toLowerCase().replace(/[^a-z]/g, '');
  if (norm.includes('def') || norm.includes('intro')) return 'definition';
  if (norm.includes('class') || norm.includes('type')) return 'classification';
  if (norm.includes('etiolog') || norm.includes('cause')) return 'etiology';
  if (norm.includes('risk') || norm.includes('predispos')) return 'riskFactors';
  if (norm.includes('clinical') || norm.includes('presentation')) return 'clinicalFeatures';
  if (norm === 'sign' || norm.includes('signs')) return 'signs';
  if (norm.includes('symptom')) return 'symptoms';
  if (norm.includes('diagnos') || norm.includes('investigation') || norm.includes('workup')) return 'diagnosis';
  if (norm.includes('differential')) return 'differentialDiagnosis';
  if (norm.includes('complication') || norm.includes('prognosis')) return 'complications';
  if (norm.includes('manage') || norm.includes('approach')) return 'management';
  if (norm.includes('treat') || norm.includes('therap') || norm.includes('medication')) return 'treatment';
  if (norm.includes('trap') || norm.includes('pitfall') || norm.includes('pearl')) return 'traps';
  return 'default';
};

const FancyBlockRenderer = ({ block, docColors, isExam }: { block: PdfBlock, docColors: any, isExam: boolean }) => {
  if (!block) return <View />;
  const content = block.content || '';
  const isRtl = isArabic(prepareInteractiveSyntax(content));

  switch (block.type) {
    case 'disease':
    case 'disease_subtype': {
      const isContainer = block.type === 'disease';
      const subtypes = isContainer ? ((block as any).children || block.blocks || []) : [block];
      
      const renderSubtype = (subBlock: any, idx: number) => {
        const subtypeKey = matchSubtype(subBlock.subType);
        const label = subBlock.label || subBlock.subType || '';
        const subContent = subBlock.content || '';
        const isSubRtl = isArabic(prepareInteractiveSyntax(subContent));

        const renderContent = (customColor?: string) => (
          <FancyRichText 
            text={subContent} 
            baseStyle={{ 
              fontSize: 11, 
              color: customColor || '#4b5563', 
              fontFamily: 'Inter', 
              fontWeight: 400,
              textAlign: isSubRtl ? 'right' : 'left', 
              lineHeight: 1.6 
            }} 
          />
        );

        switch (subtypeKey) {
          case 'definition':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 4, borderLeftColor: docColors.main, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: docColors.main, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                {renderContent()}
              </View>
            );
          case 'classification':
          case 'etiology':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, backgroundColor: '#f8fafc', borderTopWidth: 2, borderTopColor: docColors.dark }}>
                <Text style={{ fontSize: 11, color: docColors.dark, fontFamily: 'Times-Roman', fontWeight: 700, textTransform: 'capitalize', marginBottom: 6, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                {renderContent()}
              </View>
            );
          case 'riskFactors':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, backgroundColor: '#fff7ed', borderRadius: 6 }}>
                <View style={{ flexDirection: isSubRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ea580c', marginRight: isSubRtl ? 0 : 8, marginLeft: isSubRtl ? 8 : 0 }} />
                  <Text style={{ fontSize: 10, color: '#9a3412', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
                </View>
                {renderContent('#7c2d12')}
              </View>
            );
          case 'clinicalFeatures':
          case 'signs':
          case 'symptoms':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#ffffff' }}>
                <Text style={{ fontSize: 12, color: '#111827', fontFamily: 'Inter', fontWeight: 700, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 6, marginBottom: 8, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                {renderContent()}
              </View>
            );
          case 'diagnosis':
          case 'differentialDiagnosis':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f3f4f6', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#9ca3af' }}>
                <Text style={{ fontSize: 10, color: '#374151', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, textAlign: 'center' }}>{label}</Text>
                {renderContent()}
              </View>
            );
          case 'complications':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, backgroundColor: '#fef2f2', borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
                <Text style={{ fontSize: 10, color: '#b91c1c', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                {renderContent('#7f1d1d')}
              </View>
            );
          case 'management':
          case 'treatment':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: docColors.light, borderRadius: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } } as any}>
                <View style={{ backgroundColor: docColors.bg, padding: 4, alignSelf: 'flex-start', borderRadius: 4, marginBottom: 8 }}>
                  <Text style={{ fontSize: 9, color: docColors.main, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
                </View>
                {renderContent()}
              </View>
            );
          case 'traps':
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, backgroundColor: '#111827', borderRadius: 6 }}>
                <Text style={{ fontSize: 10, color: '#fbbf24', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                {renderContent('#f3f4f6')}
              </View>
            );
          default:
            return (
              <View wrap={false} key={idx} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                <View style={{ paddingLeft: isSubRtl ? 0 : 12, paddingRight: isSubRtl ? 12 : 0, borderLeftWidth: isSubRtl ? 0 : 1, borderRightWidth: isSubRtl ? 1 : 0, borderColor: '#e5e7eb' }}>
                  {renderContent()}
                </View>
              </View>
            );
        }
      };

      if (isContainer) {
        return (
          <View style={{ marginVertical: 20 }}>
            {/* Elegant Header */}
            <View style={{ marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: docColors.light, alignItems: 'center' }}>
              <Text style={{ fontFamily: getTitleFontFamily((block as any).title || block.content), fontSize: 20, fontWeight: 700, color: docColors.dark, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>
                {(block as any).title || block.content || "Clinical Profile"}
              </Text>
            </View>
            <View style={{ padding: 10 }}>
              {subtypes.map((sub: any, idx: number) => renderSubtype(sub, idx))}
            </View>
          </View>
        );
      }

      // Standalone subtype
      return renderSubtype(block, 0);
    }

    case 'heading':
      return (
        <View wrap={false} style={{ marginBottom: 30, marginTop: 40, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: docColors.main, marginRight: 16 }} />
            <FancyRichText text={content} baseStyle={{ fontSize: 24, fontFamily: getTitleFontFamily(content), fontWeight: 700, color: docColors.dark, textAlign: 'center', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: 2 }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: docColors.main, marginLeft: 16 }} />
          </View>
          <View style={{ width: 80, height: 1, backgroundColor: docColors.main, marginTop: 16, opacity: 0.5 }} />
        </View>
      );
    case 'subheading':
      return (
        <View wrap={false} style={{ marginTop: 24, marginBottom: 16, borderBottomWidth: 2, borderBottomColor: docColors.light, paddingBottom: 8 }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 20, fontFamily: getTitleFontFamily(content), fontWeight: 700, color: docColors.main, textAlign: isRtl ? 'right' : 'left' }} />
        </View>
      );
    case 'subtitle':
      return (
        <View wrap={false} style={{ marginTop: 20, marginBottom: 12, backgroundColor: docColors.main, paddingVertical: 4, paddingHorizontal: 12, alignSelf: isRtl ? 'flex-end' : 'flex-start', borderRadius: 4 }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: '#ffffff', textAlign: isRtl ? 'right' : 'left', letterSpacing: 1.5, textTransform: 'uppercase' }} />
        </View>
      );
    case 'paragraph':
    case 'text':
    case 'plain':
      if (content.trim() === '') return <View style={{ height: 10 }} />;
      return (
        <View style={{ marginBottom: 12 }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', lineHeight: 1.7, color: '#4b5563', textAlign: isRtl ? 'right' : 'justify' }} />
        </View>
      );
    case 'example': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 16, backgroundColor: '#f8fafc', borderLeftWidth: 4, borderLeftColor: '#64748b', borderRadius: 4 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: '#475569', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Example</Text>
              <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#334155', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'explanation': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 16, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: '#166534', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Explanation</Text>
              <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#14532d', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'note': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 16, backgroundColor: '#f0f9ff', borderLeftWidth: 4, borderLeftColor: '#0ea5e9', borderRadius: 6 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginLeft: isBoxRtl ? 12 : 0, marginRight: isBoxRtl ? 0 : 12 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Times-Roman' }}>i</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#0369a1', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'warning': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 16, backgroundColor: '#fff1f2', borderWidth: 2, borderColor: '#e11d48', borderRadius: 8 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 28, height: 28, backgroundColor: '#e11d48', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: isBoxRtl ? 12 : 0, marginRight: isBoxRtl ? 0 : 12 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Times-Roman' }}>!</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, color: '#be123c', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Warning</Text>
              <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#881337', fontWeight: 700, lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'tip': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: '#fefce8', borderRadius: 20, borderBottomWidth: 4, borderBottomColor: '#eab308' }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eab308', justifyContent: 'center', alignItems: 'center', marginLeft: isBoxRtl ? 12 : 0, marginRight: isBoxRtl ? 0 : 12 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'Times-Roman' }}>*</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
               <Text style={{ fontSize: 10, color: '#ca8a04', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Pro Tip</Text>
              <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#854d0e', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'high_yield': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 18, backgroundColor: '#faf5ff', borderWidth: 1, borderColor: '#d8b4fe', borderRadius: 4, position: 'relative' }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#7e22ce', justifyContent: 'center', alignItems: 'center', marginLeft: isBoxRtl ? 16 : 0, marginRight: isBoxRtl ? 0 : 16, borderWidth: 2, borderColor: '#e9d5ff' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Times-Roman' }}>HY</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
               <Text style={{ fontSize: 10, color: '#6b21a8', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>High Yield</Text>
              <FancyRichText text={content} baseStyle={{ fontSize: 12, fontFamily: 'Inter', color: '#4c1d95', fontWeight: 700, lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left', letterSpacing: 0.5 }} />
            </View>
          </View>
        </View>
      );
    }
    case 'clinical_correlation': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 16, backgroundColor: '#ecfdf5', borderLeftWidth: 6, borderLeftColor: '#059669', borderRightWidth: 6, borderRightColor: '#059669', borderRadius: 8 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 28, height: 28, backgroundColor: '#059669', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: isBoxRtl ? 12 : 0, marginRight: isBoxRtl ? 0 : 12 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'Times-Roman' }}>+</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, color: '#047857', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Correlation</Text>
              <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#065f46', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'list':
      const isOrdered = (block as any).style === 'ordered';
      return (
        <View style={{ marginVertical: 16 }}>
          {(block.items || []).map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={{ flexDirection: isItemRtl ? 'row-reverse' : 'row', marginBottom: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 24, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 }}>
                  {isOrdered ? (
                    <Text style={{ fontSize: 11, fontWeight: 700, color: docColors.main, fontFamily: 'Times-Roman' }}>{i + 1}.</Text>
                  ) : (
                    <Svg width="6" height="6" viewBox="0 0 6 6">
                      <Circle cx="3" cy="3" r="3" fill={docColors.main} />
                    </Svg>
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: isItemRtl ? 0 : 8, marginRight: isItemRtl ? 8 : 0 }}>
                  <FancyRichText text={item} baseStyle={{ fontSize: 11, fontFamily: 'Inter', lineHeight: 1.6, color: '#374151', textAlign: isItemRtl ? 'right' : 'left' }} />
                </View>
              </View>
            );
          })}
        </View>
      );
    case 'step':
      return (
        <View style={{ marginVertical: 24, flexDirection: 'column' }}>
          {(block.items || []).map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={{ flexDirection: isItemRtl ? 'row-reverse' : 'row', backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 4, borderLeftColor: docColors.main, alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: docColors.bgLight, justifyContent: 'center', alignItems: 'center', marginLeft: isItemRtl ? 16 : 0, marginRight: isItemRtl ? 0 : 16 }}>
                  <Text style={{ color: docColors.main, fontWeight: 700, fontSize: 16, fontFamily: 'Times-Roman' }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <FancyRichText text={item} baseStyle={{ fontSize: 12, fontFamily: 'Inter', lineHeight: 1.5, color: '#1f2937', textAlign: isItemRtl ? 'right' : 'left' }} />
                </View>
              </View>
            );
          })}
        </View>
      );
    case 'quote':
      const isQuoteRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 24, padding: 24, backgroundColor: '#fafaf9', borderLeftWidth: 6, borderLeftColor: docColors.main, borderRadius: 0 }}>
          <Text style={{ fontSize: 32, color: docColors.main, fontFamily: 'Times-Roman', opacity: 0.3, marginBottom: -10, marginTop: -10 }}>"</Text>
          <FancyRichText text={content} baseStyle={{ fontSize: 14, fontFamily: 'Times-Roman', fontStyle: 'italic', color: '#44403c', textAlign: isQuoteRtl ? 'right' : 'justify', lineHeight: 1.6 }} />
        </View>
      );
    case 'vocabulary':
      const vocabIsRtl = isArabic(prepareInteractiveSyntax(block.term || '') + prepareInteractiveSyntax(block.definition || ''));
      return (
        <View wrap={false} style={{ marginVertical: 12, flexDirection: vocabIsRtl ? 'row-reverse' : 'row', alignItems: 'stretch', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: docColors.light }}>
          <View style={{ width: '35%', backgroundColor: docColors.bgLight, padding: 16, justifyContent: 'center', alignItems: vocabIsRtl ? 'flex-end' : 'flex-start' }}>
            <FancyRichText text={block.term || ''} baseStyle={{ fontFamily: 'Times-Roman', fontWeight: 700, fontSize: 14, color: docColors.dark, textAlign: vocabIsRtl ? 'right' : 'left' }} />
          </View>
          <View style={{ width: '65%', backgroundColor: '#ffffff', padding: 16, justifyContent: 'center' }}>
            <FancyRichText text={block.definition || ''} baseStyle={{ fontFamily: 'Inter', fontSize: 11, lineHeight: 1.6, color: '#475569', textAlign: vocabIsRtl ? 'right' : 'left' }} />
          </View>
        </View>
      );
    case 'code':
      return (
        <View wrap={false} style={{ marginVertical: 16, backgroundColor: '#1e293b', borderRadius: 8, padding: 16 }}>
          <Text style={{ fontFamily: 'Courier', fontSize: 10, color: '#e2e8f0', lineHeight: 1.5 }}>
            {content}
          </Text>
        </View>
      );
    case 'summary':
      return (
        <View wrap={false} style={{ marginVertical: 20, padding: 20, backgroundColor: docColors.main, borderRadius: 12 }}>
          <Text style={{ fontSize: 14, color: '#ffffff', fontFamily: getTitleFontFamily(content), fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Summary</Text>
          <FancyRichText text={content} baseStyle={{ fontSize: 12, fontFamily: 'Inter', color: '#f8fafc', lineHeight: 1.6 }} />
        </View>
      );
    case 'reference':
      return (
        <View wrap={false} style={{ marginVertical: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#cbd5e1' }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 9, fontFamily: 'Times-Roman', fontStyle: 'italic', color: '#64748b' }} />
        </View>
      );
    case 'dialogue':
      return (
        <View wrap={false} style={{ marginVertical: 12, padding: 14, backgroundColor: '#fdf4ff', borderRadius: 16, borderBottomLeftRadius: 4, alignSelf: 'flex-start', maxWidth: '85%' }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#701a75', lineHeight: 1.5 }} />
        </View>
      );
    case 'flashcard': {
      const frontContent = block.front || content || 'Flashcard';
      const backContent = block.back || '';
      const isCardRtl = isArabic(prepareInteractiveSyntax(frontContent + backContent));
      return (
        <View wrap={false} style={{ marginVertical: 24, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: docColors.light }}>
          {/* Front */}
          <View style={{ backgroundColor: docColors.main, borderTopLeftRadius: 11, borderTopRightRadius: 11, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
            <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontFamily: 'Inter', fontWeight: 700 }}>Flashcard</Text>
            <FancyRichText text={frontContent} baseStyle={{ fontSize: 16, fontFamily: 'Times-Roman', color: '#ffffff', textAlign: 'center', fontWeight: 700, lineHeight: 1.4 }} />
          </View>
          {/* Back */}
          {backContent ? (
            <View style={{ padding: 24, paddingVertical: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfcfc', borderBottomLeftRadius: 11, borderBottomRightRadius: 11 }}>
              <FancyRichText text={backContent} baseStyle={{ fontSize: 13, fontFamily: 'Inter', color: '#334155', textAlign: isCardRtl ? 'right' : 'center', lineHeight: 1.6 }} />
            </View>
          ) : []}
        </View>
      );
    }
    case 'caption':
      return (
        <View wrap={false} style={{ marginTop: 4, marginBottom: 16, alignItems: 'center' }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 9, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' }} />
        </View>
      );
    case 'horizontal_rule':
      return <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 24 }} />;
    case 'page_break':
      return <View break />;
    case 'essay_area':
      return (
        <View wrap={false} style={{ marginVertical: 20 }}>
          <Text style={{ fontSize: 11, color: '#475569', fontFamily: 'Inter', fontWeight: 700, marginBottom: 8 }}>{content || "Notes / Essay"}</Text>
          <View style={{ height: 150, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, borderStyle: 'dashed' }} />
        </View>
      );
    case 'bento':
    case 'expandable':
    case 'reveal':
    case 'container':
      return (
        <View wrap={false} style={{ marginVertical: 24, padding: 24, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: docColors.light, borderRightWidth: 4, borderRightColor: docColors.main }}>
          <View style={{ flexDirection: 'column' }}>
            {block.blocks?.map((child, idx) => (
              <View key={idx} style={{ marginBottom: idx === block.blocks!.length - 1 ? 0 : 16 }}>
                 <FancyBlockRenderer block={child} docColors={docColors} isExam={isExam} />
              </View>
            ))}
          </View>
        </View>
      );
    case 'table':
      return (
        <View wrap={false} style={{ marginVertical: 20 }}>
          {block.columns && block.columns.length > 0 ? (
            <View style={{ flexDirection: 'row', backgroundColor: docColors.dark, borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: 12 }}>
              {block.columns.map((col, cIdx) => (
                <View key={cIdx} style={{ flex: 1, paddingHorizontal: 6 }}>
                  <FancyRichText text={col} baseStyle={{ fontSize: 11, fontWeight: 700, color: '#ffffff', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 1 }} />
                </View>
              ))}
            </View>
          ) : []}
          <View style={{ flexDirection: 'column', borderWidth: 1, borderColor: docColors.light, borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden' }}>
            {(block.rows || []).map((row, rIdx) => (
              <View key={rIdx} style={{ flexDirection: 'row', backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc', padding: 12, borderTopWidth: rIdx === 0 ? 0 : 1, borderColor: '#e2e8f0' }}>
                {row.map((cell, cIdx) => (
                  <View key={cIdx} style={{ flex: 1, paddingHorizontal: 6 }}>
                    <FancyRichText text={cell} baseStyle={{ fontSize: 11, color: '#334155', fontFamily: 'Inter', lineHeight: 1.5 }} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      );
    case 'image':
      return (
        <View wrap={false} style={{ marginVertical: 24, alignItems: 'center' }}>
          <View style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Image src={block.imageUrl || ''} style={{ width: 450, height: 'auto', objectFit: 'cover', borderRadius: 2 }} />
          </View>
          {block.imageCaption ? (
            <View style={{ marginTop: 12, backgroundColor: docColors.bgLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ fontSize: 10, color: docColors.dark, fontFamily: 'Times-Roman', fontStyle: 'italic' }}>{block.imageCaption}</Text>
            </View>
          ) : <View />}
        </View>
      );
    default:
      return (
        <View style={{ marginBottom: 8 }}>
          <FancyRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#1f2937' }} />
        </View>
      );
  }
};

// Table of Contents for Fancy
const FancyTableOfContents = ({ documents, docColors }: { documents: PdfDocument[], docColors: any }) => {
  const tocItems: { title: string; page: number }[] = [];
  let currentPage = 2; // Cover is 1, TOC is 2

  documents.forEach((doc, idx) => {
    tocItems.push({ title: doc.title || `Document ${idx + 1}`, page: currentPage });
    const blocksCount = doc.blocks.length;
    currentPage += Math.ceil(blocksCount / 5) || 1; 
  });

  return (
    <Page size="A4" style={{ backgroundColor: '#ffffff', padding: 50, position: 'relative' }}>
      <View style={{ marginBottom: 40, borderBottomWidth: 2, borderBottomColor: docColors.main, paddingBottom: 10 }}>
        <Text style={{ fontSize: 28, fontFamily: 'Times-Roman', fontWeight: 700, color: docColors.dark }}>Contents</Text>
      </View>

      <View>
        {tocItems.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, fontFamily: 'Inter' }}>{prepareInteractiveSyntax(item.title)}</Text>
            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', borderStyle: 'dotted', marginHorizontal: 12 }} />
            <Text style={{ fontSize: 13, fontWeight: 700, color: docColors.main, fontFamily: 'Inter' }}>{i + (tocItems.length > 0 ? 3 : 2)}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
};

export const ReactPdfOutputFancy = ({ 
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
  const getColorsForDoc = () => {
    if (themeColor && themeColor.startsWith('custom-')) {
      return { main: '#4f46e5', light: '#c7d2fe', dark: '#1e1b4b', bgLight: '#e0e7ff' };
    }
    const colorMap: Record<string, { main: string, light: string, dark: string, bgLight: string }> = {
      indigo: { main: "#4f46e5", light: "#a5b4fc", dark: "#312e81", bgLight: "#e0e7ff" },
      emerald: { main: "#059669", light: "#6ee7b7", dark: "#064e3b", bgLight: "#d1fae5" },
      rose: { main: "#e11d48", light: "#fda4af", dark: "#881337", bgLight: "#ffe4e6" },
      amber: { main: "#d97706", light: "#fcd34d", dark: "#78350f", bgLight: "#fef3c7" },
      violet: { main: "#7c3aed", light: "#c4b5fd", dark: "#4c1d95", bgLight: "#ede9fe" },
      cyan: { main: "#0891b2", light: "#67e8f9", dark: "#164e63", bgLight: "#cffafe" },
    };
    return colorMap[themeColor] || { main: "#4f46e5", light: "#a5b4fc", dark: "#312e81", bgLight: "#e0e7ff" };
  };

  const tColors = getColorsForDoc();

  return (
    <Document title="Document Export" author="System">
      {includeCover ? (
        <Page size="A4" style={{ backgroundColor: tColors.dark, position: 'relative' }}>
          <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
            {/* Base Background Layer */}
            <Rect x="0" y="0" width="595" height="842" fill={tColors.dark} />
            
            {/* Extremely Dense Geometric System Layer */}
            {Array.from({ length: 120 }).map((_, i) => (
              <Line key={`grid-h-${i}`} x1="0" y1={i * 7.016} x2="595" y2={i * 7.016} stroke={tColors.light} strokeWidth={i % 10 === 0 ? "0.8" : "0.15"} opacity={i % 10 === 0 ? "0.15" : "0.06"} />
            ))}
            {Array.from({ length: 85 }).map((_, i) => (
              <Line key={`grid-v-${i}`} x1={i * 7.0} y1="0" x2={i * 7.0} y2="842" stroke={tColors.light} strokeWidth={i % 10 === 0 ? "0.8" : "0.15"} opacity={i % 10 === 0 ? "0.15" : "0.06"} />
            ))}
            
            {/* Diagonal Hatching in specific areas */}
            {Array.from({ length: 60 }).map((_, i) => (
              <Line key={`diag-1-${i}`} x1={-200 + i * 15} y1="0" x2={i * 15} y2="200" stroke={tColors.main} strokeWidth="0.5" opacity="0.15" />
            ))}
            {Array.from({ length: 80 }).map((_, i) => (
              <Line key={`diag-2-${i}`} x1={400 + i * 10} y1="842" x2={200 + i * 10} y2="642" stroke={tColors.main} strokeWidth="0.25" opacity="0.2" />
            ))}

            {/* Expansive Abstract Blobs - Accent Colors */}
            <Path d="M-100,600 C100,200 350,900 800,300 L800,950 L-100,950 Z" fill={tColors.main} opacity="0.35" />
            <Path d="M-50,700 C250,500 500,950 900,450 L900,1050 L-50,1050 Z" fill={tColors.main} opacity="0.5" />
            <Path d="M-200,100 C150,-50 450,400 750,-100 L750,-250 L-200,-250 Z" fill={tColors.main} opacity="0.25" />
            <Path d="M300,842 C200,500 600,300 750,100 L850,100 L850,842 Z" fill={tColors.light} opacity="0.04" />
            
            <Circle cx="100" cy="800" r="400" fill={tColors.main} opacity="0.1" />
            <Circle cx="500" cy="50" r="300" fill={tColors.main} opacity="0.1" />

            {/* Architectural & Constructivist Shapes */}
            <Path d="M0,842 L400,400 L0,400 Z" fill={tColors.light} opacity="0.03" />
            <Path d="M595,0 L200,400 L595,400 Z" fill={tColors.main} opacity="0.2" />
            <Path d="M0,0 L300,0 L150,200 Z" fill={tColors.main} opacity="0.25" />
            <Path d="M595,842 L300,842 L450,650 Z" fill={tColors.main} opacity="0.3" />
            
            <Polygon points="100,100 150,50 200,100 150,150" fill={tColors.main} opacity="0.3" />
            <Polygon points="450,700 500,650 550,700 500,750" fill="none" stroke={tColors.light} strokeWidth="1" opacity="0.3" />

            {/* Intense Circular Radar & Orbital Rings */}
            <Circle cx="450" cy="150" r="320" fill={tColors.bgLight} opacity="0.02" />
            <Circle cx="450" cy="150" r="318" stroke={tColors.light} strokeWidth="1.5" opacity="0.1" fill="none" />
            <Circle cx="450" cy="150" r="240" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" strokeDasharray="3,3" fill="none" />
            <Circle cx="450" cy="150" r="180" stroke={tColors.light} strokeWidth="1" opacity="0.2" strokeDasharray="15,5,2,5" fill="none" />
            <Circle cx="450" cy="150" r="130" stroke={tColors.main} strokeWidth="2" opacity="0.25" strokeDasharray="1,12" fill="none" />
            <Circle cx="450" cy="150" r="80" fill={tColors.light} opacity="0.04" />
            <Circle cx="450" cy="150" r="40" stroke={tColors.main} strokeWidth="0.5" opacity="0.7" fill="none" />

            <Circle cx="50" cy="450" r="220" fill={tColors.main} opacity="0.05" />
            <Circle cx="50" cy="450" r="218" stroke={tColors.light} strokeWidth="1" opacity="0.12" fill="none" />
            <Circle cx="50" cy="450" r="160" stroke={tColors.main} strokeWidth="1" opacity="0.3" strokeDasharray="8,4" fill="none" />
            <Circle cx="50" cy="450" r="100" stroke={tColors.light} strokeWidth="0.5" opacity="0.3" strokeDasharray="2,6" fill="none" />
            <Circle cx="50" cy="450" r="40" fill={tColors.main} opacity="0.2" />
            
            <Circle cx="450" cy="700" r="180" stroke={tColors.light} strokeWidth="1" opacity="0.08" fill="none" />
            <Circle cx="450" cy="700" r="160" stroke={tColors.main} strokeWidth="0.5" opacity="0.3" fill="none" />
            <Circle cx="450" cy="700" r="120" stroke={tColors.light} strokeWidth="2" opacity="0.1" strokeDasharray="5,15" fill="none" />
            <Circle cx="450" cy="700" r="70" stroke={tColors.main} strokeWidth="1.5" opacity="0.4" strokeDasharray="1,6" fill="none" />
            <Circle cx="450" cy="700" r="25" fill={tColors.main} opacity="0.2" />

            {/* Precision Schematic Scale Markers */}
            <Line x1="70" y1="0" x2="70" y2="842" stroke={tColors.light} strokeWidth="1.5" opacity="0.2" />
            <Line x1="85" y1="0" x2="85" y2="842" stroke={tColors.main} strokeWidth="0.5" opacity="0.3" />
            {Array.from({ length: 80 }).map((_, i) => (
               <Line key={`scale-v-${i}`} x1="65" y1={i * 10.525} x2="70" y2={i * 10.525} stroke={tColors.light} strokeWidth="0.5" opacity="0.4" />
            ))}
            
            <Line x1="0" y1="720" x2="595" y2="720" stroke={tColors.light} strokeWidth="1.5" opacity="0.15" />
            <Line x1="0" y1="735" x2="595" y2="735" stroke={tColors.main} strokeWidth="0.5" opacity="0.25" />
            {Array.from({ length: 60 }).map((_, i) => (
               <Line key={`scale-h-${i}`} x1={i * 10} y1="715" x2={i * 10} y2="720" stroke={tColors.light} strokeWidth="0.5" opacity="0.3" />
            ))}
            
            {/* Intense Data Nodes and Scatters */}
            {Array.from({ length: 25 }).map((_, i) => (
              <Path 
                key={`cross-top-${i}`} 
                d={`M ${40 + i * 20} ${80 + (Math.sin(i) * 30)} L ${50 + i * 20} ${80 + (Math.sin(i) * 30)} M ${45 + i * 20} ${75 + (Math.sin(i) * 30)} L ${45 + i * 20} ${85 + (Math.sin(i) * 30)}`} 
                stroke={tColors.main} 
                strokeWidth="1.5" 
                opacity="0.5" 
              />
            ))}
            {Array.from({ length: 45 }).map((_, i) => (
              <Circle 
                key={`dot-scatter-${i}`}
                cx={200 + Math.cos(i * 1.8) * 350}
                cy={450 + Math.sin(i * 1.1) * 350}
                r={i % 4 === 0 ? "2.5" : "1"}
                fill={i % 3 === 0 ? tColors.main : tColors.light}
                opacity={(i % 2 === 0) ? "0.8" : "0.4"}
              />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <Rect 
                key={`rect-scatter-${i}`}
                x={300 + Math.cos(i * 2.3) * 200}
                y={600 + Math.sin(i * 1.4) * 200}
                width="4" height="4"
                fill={tColors.main}
                opacity="0.6"
              />
            ))}

            {/* Thick Graphical Marker Bars */}
            <Rect x="85" y="450" width="80" height="25" fill={tColors.main} opacity="0.35" />
            <Rect x="85" y="485" width="40" height="8" fill={tColors.main} opacity="0.6" />
            <Rect x="85" y="500" width="20" height="4" fill={tColors.light} opacity="0.3" />
            
            <Rect x="420" y="70" width="10" height="50" fill={tColors.main} opacity="0.5" />
            <Rect x="440" y="70" width="4" height="30" fill={tColors.light} opacity="0.3" />

            {/* Overlapping Frame Geometries */}
            <Rect x="20" y="20" width="555" height="802" fill="none" stroke={tColors.light} strokeWidth="0.5" opacity="0.1" />
            <Rect x="30" y="30" width="535" height="782" fill="none" stroke={tColors.main} strokeWidth="1.5" opacity="0.15" />
            <Rect x="40" y="40" width="515" height="762" fill="none" stroke={tColors.light} strokeWidth="0.25" opacity="0.2" strokeDasharray="10,10" />
          </Svg>
          
          <View style={{ flex: 1, padding: 60, justifyContent: 'center' }}>
            <View style={{ padding: 40, backgroundColor: 'transparent', borderRadius: 20 }}>
              <Text style={{ fontSize: 12, color: tColors.light, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 20 }}>
                {isExam ? 'Official Examination' : 'ARCANE PDF'}
              </Text>
              <Text style={{ fontSize: 48, color: '#ffffff', fontFamily: 'Times-Roman', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
                {documents.length > 0 ? documents[0].title : 'Untitled Document'}
              </Text>
              {(documents[0] as any)?.metadata?.description ? (
                <Text style={{ fontSize: 14, color: '#d1d5db', fontFamily: 'Inter', lineHeight: 1.6 }}>
                  {(documents[0] as any).metadata.description}
                </Text>
              ) : <View />}
              <View style={{ marginTop: 40, width: 60, height: 2, backgroundColor: tColors.light }} />
            </View>
          </View>
        </Page>
      ) : <View />}

      {includeToc && documents.length > 1 ? <FancyTableOfContents documents={documents} docColors={tColors} /> : <View />}

      {documents.map((doc, dIdx) => (
        <Page key={dIdx} size="A4" style={{ backgroundColor: '#ffffff', padding: 50, paddingBottom: 80, position: 'relative' }}>
          {/* Subtle Complex Background for Content Pages */}
          <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
            <Rect x="0" y="0" width="595" height="842" fill="#ffffff" />
            
            {/* Fine Technical Blueprint Grid */}
            {Array.from({ length: 120 }).map((_, i) => (
              <Line key={`pg-grid-h-${i}`} x1="0" y1={i * 7.016} x2="595" y2={i * 7.016} stroke={tColors.light} strokeWidth="0.2" opacity="0.3" />
            ))}
            {Array.from({ length: 85 }).map((_, i) => (
              <Line key={`pg-grid-v-${i}`} x1={i * 7.0} y1="0" x2={i * 7.0} y2="842" stroke={tColors.light} strokeWidth="0.2" opacity="0.3" />
            ))}

            {/* Bold Abstract Fluid Graphics in background */}
            <Path d="M0,842 L250,550 L0,550 Z" fill={tColors.main} opacity="0.08" />
            <Path d="M595,0 L350,250 L595,250 Z" fill={tColors.main} opacity="0.08" />
            <Path d="M-50,400 C100,300 200,600 400,400 L0,200 Z" fill={tColors.main} opacity="0.06" />
            <Path d="M595,600 C480,500 400,750 200,600 L595,400 Z" fill={tColors.main} opacity="0.06" />
            
            {/* Massive Tech Orbital Rings */}
            <Circle cx="595" cy="0" r="240" fill={tColors.main} fillOpacity="0.04" stroke={tColors.main} strokeWidth="1" opacity="0.2" />
            <Circle cx="595" cy="0" r="200" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.3" strokeDasharray="5,10" />
            <Circle cx="595" cy="0" r="140" fill="none" stroke={tColors.light} strokeWidth="2" opacity="0.15" />
            <Circle cx="595" cy="0" r="80" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" strokeDasharray="2,4" />
            
            <Circle cx="0" cy="842" r="300" fill={tColors.main} fillOpacity="0.04" stroke={tColors.main} strokeWidth="1" opacity="0.2" />
            <Circle cx="0" cy="842" r="250" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.3" strokeDasharray="10,15" />
            <Circle cx="0" cy="842" r="180" fill="none" stroke={tColors.light} strokeWidth="2" opacity="0.12" strokeDasharray="1,6" />
            <Circle cx="0" cy="842" r="100" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.3" />

            {/* Strong Structured Margin Architecture */}
            <Line x1="35" y1="0" x2="35" y2="842" stroke={tColors.main} strokeWidth="1.5" opacity="0.3" />
            <Line x1="42" y1="0" x2="42" y2="842" stroke={tColors.light} strokeWidth="0.5" opacity="0.5" />
            <Line x1="47" y1="0" x2="47" y2="842" stroke={tColors.main} strokeWidth="0.2" opacity="0.4" strokeDasharray="5,5" />
            
            <Line x1="560" y1="0" x2="560" y2="842" stroke={tColors.main} strokeWidth="1.5" opacity="0.2" />
            <Line x1="553" y1="0" x2="553" y2="842" stroke={tColors.light} strokeWidth="0.5" opacity="0.4" />
            
            <Rect x="20" y="20" width="15" height="15" fill={tColors.main} opacity="0.25" />
            <Rect x="20" y="807" width="15" height="15" fill={tColors.main} opacity="0.25" />
            <Rect x="560" y="20" width="15" height="15" fill={tColors.main} opacity="0.25" />
            <Rect x="560" y="807" width="15" height="15" fill={tColors.main} opacity="0.25" />
            
            {/* Tech nodes ascending margins */}
            {Array.from({ length: 25 }).map((_, i) => (
              <Circle key={`margin-node-l-${i}`} cx="38.5" cy={60 + i * 30} r={i % 3 === 0 ? "1.5" : "0.75"} fill={tColors.main} opacity={i % 3 === 0 ? "0.7" : "0.4"} />
            ))}
            {Array.from({ length: 25 }).map((_, i) => (
              <Circle key={`margin-node-r-${i}`} cx="556.5" cy={60 + i * 30} r={i % 5 === 0 ? "1.5" : "0.75"} fill={tColors.main} opacity={i % 5 === 0 ? "0.6" : "0.3"} />
            ))}
            
            {/* Horizontal Data bars */}
            <Rect x="50" y="25" width="100" height="4" fill={tColors.main} opacity="0.3" />
            <Rect x="50" y="32" width="60" height="2" fill={tColors.light} opacity="0.3" />
            <Rect x="445" y="813" width="100" height="4" fill={tColors.main} opacity="0.3" />
            <Rect x="485" y="820" width="60" height="2" fill={tColors.light} opacity="0.3" />
          </Svg>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottomWidth: 1, borderColor: tColors.light, paddingBottom: 10 }}>
            <Text style={{ fontSize: 9, color: tColors.main, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 2 }}>
              {doc.title}
            </Text>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: tColors.main, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Times-Roman', fontWeight: 700 }}>{String(dIdx + 1)}</Text>
            </View>
          </View>

          {doc.blocks.map((block, bIdx) => (
            <FancyBlockRenderer key={bIdx} block={block} docColors={tColors} isExam={isExam} />
          ))}

          {/* Footer */}
          <View fixed style={{ position: 'absolute', bottom: 30, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: tColors.light, paddingTop: 10 }}>
             <Text style={{ fontSize: 8, color: tColors.main, opacity: 0.5, fontFamily: 'Inter' }}>ARCANE PDF</Text>
             <Text style={{ fontSize: 8, color: tColors.main, opacity: 0.5, fontFamily: 'Inter' }} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
};
