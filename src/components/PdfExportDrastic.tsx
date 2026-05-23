import React from 'react';
import { PdfDocument, PdfBlock } from '../types';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Rect, Line, Polyline, Polygon, Circle, Ellipse, Font, G } from '@react-pdf/renderer';

const lightBlend = (hex: string, alpha: number) => {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return hex;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const bg = 255;
  const newR = Math.round(r * alpha + bg * (1 - alpha));
  const newG = Math.round(g * alpha + bg * (1 - alpha));
  const newB = Math.round(b * alpha + bg * (1 - alpha));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

const darkBlend = (hex: string, alpha: number) => {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return hex;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const bg = 0;
  const newR = Math.round(r * alpha + bg * (1 - alpha));
  const newG = Math.round(g * alpha + bg * (1 - alpha));
  const newB = Math.round(b * alpha + bg * (1 - alpha));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

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

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
const getFontFamily = (text: string, defaultFont = 'Inter') => isArabic(text) ? 'Cairo' : defaultFont;

const renderDiseaseSubtypeDrastic = (subtype: string, children: React.ReactNode, docColors: any, isRtl: boolean, isExam: boolean) => {
  const label = subtype.replace(/([A-Z])/g, ' $1').toUpperCase();
  const labelFontSize = isExam ? 9 : 11;
  const mb = isExam ? 12 : 20;
  
  switch (subtype) {
    case 'definition':
      return (
        <View style={{ marginBottom: mb }}>
          <View style={{ backgroundColor: docColors.dark, paddingHorizontal: 12, paddingVertical: 4, alignSelf: isRtl ? 'flex-end' : 'flex-start', borderBottomWidth: 4, borderColor: docColors.main }}>
            <Text style={{ fontWeight: 800, fontSize: labelFontSize, color: '#fff', letterSpacing: 3 }}>{label}</Text>
          </View>
          <View style={{ borderLeftWidth: isRtl ? 0 : 2, borderRightWidth: isRtl ? 2 : 0, borderColor: docColors.dark, padding: 12, backgroundColor: lightBlend(docColors.dark, 0.02) }}>
            <View>{children}</View>
          </View>
        </View>
      );
    case 'etiology':
      return (
        <View style={{ marginBottom: mb }}>
          <View style={{ borderTopWidth: 2, borderBottomWidth: 2, borderColor: docColors.main, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: docColors.main, opacity: 0.3 }} />
            <Text style={{ fontWeight: 800, fontSize: labelFontSize, color: docColors.main, letterSpacing: 2, paddingHorizontal: 15 }}>{`// ${label} //`}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: docColors.main, opacity: 0.3 }} />
          </View>
          <View style={{ padding: 12 }}>{children}</View>
        </View>
      );
    case 'classification':
      return (
        <View style={{ borderWidth: 3, borderColor: docColors.dark, marginBottom: mb, marginTop: 15 }}>
          <View style={{ position: 'absolute', top: -14, left: isRtl ? 'auto' : 12, right: isRtl ? 12 : 'auto', backgroundColor: '#fff', paddingHorizontal: 8 }}>
            <Text style={{ color: docColors.dark, fontWeight: 900, fontSize: 10, letterSpacing: 2 }}>[CLASS.CODE]</Text>
          </View>
          <View style={{ padding: 15, paddingTop: 18 }}>
            <Text style={{ fontWeight: 800, fontSize: labelFontSize - 1, color: docColors.dark, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: lightBlend(docColors.dark, 0.2), paddingBottom: 4 }}>{label}_SPECIFICATION</Text>
            <View>{children}</View>
          </View>
        </View>
      );
    case 'riskFactors':
      return (
        <View style={{ backgroundColor: '#fff1f2', borderWidth: 2, borderColor: '#be123c', marginBottom: mb }}>
          <View style={{ backgroundColor: '#be123c', paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ color: '#fff', fontWeight: 900, fontSize: labelFontSize, letterSpacing: 2 }}>HAZARD: {label}</Text>
          </View>
          <View style={{ padding: 12 }}>{children}</View>
        </View>
      );
    case 'clinicalFeatures':
      return (
        <View style={{ borderLeftWidth: isRtl ? 0 : 3, borderRightWidth: isRtl ? 3 : 0, borderColor: docColors.main, marginBottom: mb }}>
          <View style={{ padding: 12, backgroundColor: lightBlend(docColors.main, 0.04) }}>
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 12, height: 12, backgroundColor: docColors.main, borderRadius: 0, marginRight: isRtl ? 0 : 8, marginLeft: isRtl ? 8 : 0 }} />
              <Text style={{ color: docColors.dark, fontWeight: 800, fontSize: labelFontSize + 1, letterSpacing: 1.5 }}>{label}_DATA</Text>
            </View>
            <View>{children}</View>
          </View>
        </View>
      );
    case 'signs':
    case 'symptoms':
      return (
        <View style={{ marginBottom: mb }}>
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', borderBottomWidth: 2, borderColor: docColors.dark, paddingBottom: 3, marginBottom: 8 }}>
            <Text style={{ fontWeight: 800, color: docColors.dark, fontSize: labelFontSize, letterSpacing: 3 }}>{label}</Text>
            <View style={{ flex: 1 }} />
            <Text style={{ fontWeight: 800, color: docColors.dark, fontSize: 8 }}>LVL.01</Text>
          </View>
          <View style={{ paddingLeft: isRtl ? 0 : 15, paddingRight: isRtl ? 15 : 0 }}>{children}</View>
        </View>
      );
    case 'diagnosis':
      return (
        <View style={{ borderWidth: 2, borderColor: '#166534', marginBottom: mb }}>
           <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', borderBottomWidth: 1, borderBottomColor: '#166534', backgroundColor: '#f0fdf4' }}>
             <View style={{ width: 40, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center' }}>
               <Text style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>+</Text>
             </View>
             <View style={{ padding: 6, flex: 1 }}>
               <Text style={{ color: '#166534', fontWeight: 800, fontSize: labelFontSize, letterSpacing: 1 }}>{label}_CRITERIA</Text>
             </View>
           </View>
           <View style={{ padding: 12 }}>{children}</View>
        </View>
      );
    case 'differentialDiagnosis':
      return (
        <View style={{ borderWidth: 2, borderColor: '#6b21a8', borderStyle: 'dotted', marginBottom: mb, padding: 15, backgroundColor: '#faf5ff' }}>
           <View style={{ alignSelf: 'center', borderBottomWidth: 2, borderBottomColor: '#6b21a8', paddingHorizontal: 15, paddingBottom: 4, marginBottom: 10 }}>
             <Text style={{ color: '#6b21a8', fontWeight: 900, fontSize: labelFontSize, letterSpacing: 4 }}>COMPARE.{label}</Text>
           </View>
           <View>{children}</View>
        </View>
      );
    case 'complications':
      return (
        <View style={{ backgroundColor: '#fffbeb', borderLeftWidth: isRtl ? 0 : 10, borderRightWidth: isRtl ? 10 : 0, borderColor: '#f59e0b', marginBottom: mb, padding: 15 }}>
           <Text style={{ color: '#92400e', fontWeight: 900, fontSize: labelFontSize, letterSpacing: 2, marginBottom: 8, textDecoration: 'underline' }}>WARNING: {label}</Text>
           <View>{children}</View>
        </View>
      );
    case 'management':
    case 'treatment':
      return (
        <View style={{ borderWidth: 4, borderColor: docColors.dark, marginBottom: mb }}>
           <View style={{ backgroundColor: docColors.dark, padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 900, fontSize: labelFontSize, letterSpacing: 2 }}>{label}_PHASE</Text>
              <View style={{ width: 6, height: 6, backgroundColor: docColors.main }} />
           </View>
           <View style={{ padding: 15 }}>{children}</View>
        </View>
      );
    case 'traps':
      return (
        <View style={{ marginBottom: mb }}>
          <View style={{ backgroundColor: '#000', padding: 12, borderTopLeftRadius: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>[!] </Text>
              <Text style={{ color: '#fff', fontWeight: 900, fontSize: labelFontSize, letterSpacing: 4 }}>{label}</Text>
            </View>
            <View style={{ height: 2, backgroundColor: '#fff', width: '30%', marginTop: 2 }} />
          </View>
          <View style={{ borderWidth: 2, borderColor: '#000', padding: 15, borderBottomRightRadius: 10 }}>
            <View>{children}</View>
          </View>
        </View>
      );
    default:
      return (
        <View style={{ borderLeftWidth: isRtl ? 0 : 4, borderRightWidth: isRtl ? 4 : 0, borderColor: docColors.main, paddingLeft: isRtl ? 0 : 12, paddingRight: isRtl ? 12 : 0, marginBottom: mb }}>
           <Text style={{ fontWeight: 800, color: docColors.main, fontSize: labelFontSize, letterSpacing: 2, marginBottom: 6, textAlign: isRtl ? 'right' : 'left' }}>{label}</Text>
           <View>{children}</View>
        </View>
      );
  }
};

const DrasticRichText = ({ text, baseStyle }: { text: string; baseStyle: any }): any => {
  if (!text) return <Text style={baseStyle}>{" "}</Text>;
  const processed = prepareInteractiveSyntax(text);
  const parts = processed.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==|@@[^@]+@@)/g);

  if (parts.length === 1 && !processed.match(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==|@@[^@]+@@)/)) {
    return <Text style={{ ...baseStyle, fontFamily: getFontFamily(processed, baseStyle?.fontFamily) }}>{processed}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.filter(Boolean).map((part, i) => {
        
        let style: any = {
          ...baseStyle,
          fontWeight: baseStyle?.fontWeight || 400,
          color: baseStyle?.color || '#334155',
          backgroundColor: 'transparent',
          fontFamily: getFontFamily(part, baseStyle?.fontFamily)
        };

        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
          const content = part.slice(2, -2);
          return <DrasticRichText key={i} text={content} baseStyle={{ ...style, fontWeight: 700, color: '#0f172a' }} />;
        } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
          const content = part.slice(1, -1);
          return <DrasticRichText key={i} text={content} baseStyle={{ ...style, color: '#64748b' }} />;
        } else if (part.startsWith('==') && part.endsWith('==')) {
          const content = part.slice(2, -2);
          return <DrasticRichText key={i} text={content} baseStyle={{ ...style, backgroundColor: '#bfdbfe', color: '#1e3a8a', padding: '0 2px' }} />;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          const content = part.slice(1, -1);
          style.color = '#0284c7';
          style.fontFamily = isArabic(content) ? 'Cairo' : 'Courier';
          style.backgroundColor = '#f1f5f9';
          return <Text key={i} style={style}>{content}</Text>;
        } else if (part.startsWith('@@') && part.endsWith('@@')) {
          const innerText = part.slice(2, -2);
          const photoParts = innerText.split('|');
          const caption = photoParts[0];
          style.fontWeight = 700;
          style.color = '#059669';
          return <Text key={i} style={style}>{`[Photo: ${caption.trim()}]`}</Text>;
        }

        return <Text key={i} style={style}>{part}</Text>;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    backgroundColor: '#ffffff', 
    fontFamily: 'Inter', 
    paddingBottom: 60 
  },
  coverPage: { 
    padding: 0, 
    backgroundColor: '#ffffff', 
    fontFamily: 'Inter', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  coverTitle: { 
    fontSize: 54, 
    fontWeight: 700, 
    marginBottom: 20, 
    textAlign: 'left',
    letterSpacing: -2,
    lineHeight: 1,
    color: '#0f172a',
    textTransform: 'uppercase'
  },
  coverSubtitle: { 
    fontSize: 14, 
    fontWeight: 400,
    color: '#64748b', 
    textAlign: 'left',
    marginTop: 10,
    letterSpacing: 4,
    textTransform: 'uppercase'
  },
  tocPage: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
  },
  tocTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 40,
    borderLeftWidth: 8,
    paddingLeft: 15,
    color: '#0f172a',
    textTransform: 'uppercase'
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tocText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  tocPageNum: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0ea5e9',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 700, 
    marginBottom: 24, 
    textAlign: 'left', 
    paddingBottom: 15, 
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginTop: 10,
    color: '#0f172a',
    letterSpacing: -1,
    textTransform: 'uppercase'
  },
  heading: { 
    fontSize: 22, 
    fontWeight: 700, 
    marginTop: 20, 
    marginBottom: 10,
    color: '#1e293b',
    textTransform: 'uppercase'
  },
  paragraph: { 
    fontSize: 12, 
    marginBottom: 8, 
    lineHeight: 1.6,
    color: '#475569'
  },
  listItem: { 
    fontSize: 12, 
    marginBottom: 6, 
    marginLeft: 15, 
    display: 'flex', 
    flexDirection: 'row' 
  },
  bullet: { 
    width: 20, 
    fontSize: 14, 
    fontWeight: 700, 
    color: '#64748b' 
  },
  boxContent: { 
    padding: 16, 
    marginBottom: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    backgroundColor: '#f8fafc',
    borderTopColor: '#cbd5e1',
    borderLeftColor: '#cbd5e1'
  },
  vocabContainer: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    padding: 12, 
    backgroundColor: '#f8fafc', 
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  codeBlock: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 12,
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.6,
  },
  flashcard: {
    marginVertical: 12,
    padding: 20,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#cbd5e1',
    shadowOpacity: 0.5,
    shadowOffset: { width: 4, height: 4 }
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    fontSize: 8, 
    color: '#94a3b8', 
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
    letterSpacing: 4,
    fontWeight: 700,
    textTransform: 'uppercase'
  }
});

const DrasticBlockRenderer: React.FC<{ 
  block: PdfBlock, 
  docColors: { main: string, light: string, dark: string },
  isExam?: boolean
}> = ({ block, docColors, isExam }) => {
  const content = block.content || '';
  const isRtl = isArabic(prepareInteractiveSyntax(content));
  const textStyle = { 
    ...styles.paragraph, 
    textAlign: isRtl ? 'right' : 'left' 
  } as const;

  const renderContent = () => {
    switch (block.type) {
      case 'disease':
        return (
          <View style={{
            marginVertical: 16,
            borderWidth: 4,
            borderColor: docColors.dark,
            backgroundColor: '#ffffff'
          }}>
            {block.title && (
              <View style={{ backgroundColor: docColors.dark, padding: 12, borderBottomWidth: 2, borderBottomColor: docColors.main }}>
                <Text style={{ ...styles.heading, color: docColors.main, marginTop: 0, marginBottom: 0, textAlign: isArabic(block.title) ? 'right' : 'left', letterSpacing: 2, fontSize: 18 }}>
                  [ {block.title} ]
                </Text>
              </View>
            )}
            <View style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {block.content && (
                <View style={{ marginBottom: 8 }}>
                   <DrasticRichText text={block.content} baseStyle={textStyle} />
                </View>
              )}
              {block.children?.map((child, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <DrasticBlockRenderer block={child} docColors={docColors} isExam={isExam} />
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
            marginTop: 20, 
            marginBottom: 15,
            padding: 12,
            borderLeftWidth: 6,
            borderLeftColor: docColors.main,
            backgroundColor: '#f8fafc',
            flexDirection: 'row',
            alignItems: 'center'
          }}>
             <DrasticRichText 
               text={content} 
               baseStyle={{ 
                 ...styles.heading, 
                 fontSize: 16,
                 color: '#0f172a',
                 textAlign: isRtl ? 'right' : 'left',
                 marginTop: 0,
                 marginBottom: 0,
                 flex: 1
               }} 
             />
          </View>
        );
      }
      
      return (
        <View wrap={false} style={{
          marginTop: isSubtitle ? 10 : 25,
          marginBottom: isSubtitle ? 10 : 15,
          borderBottomWidth: isSubtitle ? 0 : 2,
          borderBottomColor: docColors.main,
          paddingBottom: isSubtitle ? 0 : 5
        }}>
          <DrasticRichText 
            text={content} 
            baseStyle={{ 
              ...styles.heading, 
              fontSize: isSubtitle ? 14 : 24,
              color: isSubtitle ? docColors.main : '#0f172a',
              textAlign: isRtl ? 'right' : 'left',
              marginTop: 0,
              marginBottom: 0
            }} 
          />
        </View>
      );
      
    case 'high_yield':
      return (
        <View wrap={false} style={[{
          marginBottom: 16,
          borderWidth: 2,
          borderColor: docColors.main,
          backgroundColor: docColors.light,
          borderRadius: 4,
          overflow: 'hidden'
        }]}>
          <View style={{ backgroundColor: docColors.main, paddingVertical: 8, paddingHorizontal: 16 }}>
            <Text style={{ fontWeight: 800, fontSize: 11, letterSpacing: 2, color: '#ffffff', textTransform: 'uppercase', textAlign: isRtl ? 'right' : 'left' }}>
              *** HIGH YIELD ***
            </Text>
          </View>
          <View style={{ padding: 16 }}>
            <DrasticRichText text={content} baseStyle={{ ...textStyle, color: docColors.dark, fontSize: 13, fontWeight: 700 }} />
          </View>
        </View>
      );

    case 'warning':
      return (
        <View wrap={false} style={[{
          padding: 16,
          marginBottom: 16,
          borderWidth: 3,
          borderColor: docColors.main,
          backgroundColor: docColors.light,
          position: 'relative'
        }]}>
          <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: docColors.main, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: '#ffffff', fontSize: 8, fontWeight: 800, letterSpacing: 1 }}>WARNING_</Text>
          </View>
          <Text style={{ fontWeight: 800, fontSize: 14, color: docColors.dark, marginBottom: 8, textTransform: 'uppercase' }}>
            !! ATTENTION !!
          </Text>
          <DrasticRichText text={content} baseStyle={{ ...textStyle, color: docColors.dark, fontWeight: 500 }} />
        </View>
      );

    case 'clinical_correlation':
      return (
        <View wrap={false} style={[{
          padding: 12,
          paddingLeft: 24,
          marginBottom: 16,
          borderLeftWidth: 2,
          borderLeftColor: docColors.main,
          backgroundColor: '#ffffff',
          position: 'relative'
        }]}>
          <View style={{ position: 'absolute', left: -5, top: 15, width: 8, height: 8, borderRadius: 4, backgroundColor: docColors.main }} />
          <Text style={{ fontWeight: 700, fontSize: 10, color: docColors.main, marginBottom: 4, letterSpacing: 2, textTransform: 'uppercase' }}>
            + CLINICAL CORRELATION
          </Text>
          <DrasticRichText text={content} baseStyle={{ ...textStyle, color: '#334155' }} />
        </View>
      );
      
    case 'tip':
      return (
        <View wrap={false} style={[{
          padding: 16,
          marginBottom: 16,
          backgroundColor: docColors.light,
          borderRadius: 4,
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: docColors.main
        }]}>
          <Text style={{ fontSize: 24, fontWeight: 800, color: docColors.main, marginRight: 12 }}>*</Text>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontWeight: 800, fontSize: 9, color: docColors.dark, letterSpacing: 1, marginBottom: 2 }}>PRO_TIP</Text>
            <DrasticRichText text={content} baseStyle={{ ...textStyle, color: docColors.dark, fontWeight: 600 }} />
          </View>
        </View>
      );

    case 'note':
      return (
        <View wrap={false} style={[{
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: docColors.main,
          borderStyle: 'dashed',
          backgroundColor: docColors.light
        }]}>
          <Text style={{ fontFamily: 'Courier', fontSize: 10, color: docColors.dark, marginBottom: 6, fontWeight: 700 }}>
            {'>'} NOTE:
          </Text>
          <DrasticRichText text={content} baseStyle={{ ...textStyle, fontFamily: 'Courier', color: docColors.dark, fontSize: 11 }} />
        </View>
      );

    case 'summary':
      return (
        <View wrap={false} style={[{
          padding: 20,
          marginBottom: 16,
          backgroundColor: docColors.main,
          color: '#ffffff',
          position: 'relative'
        }]}>
          <Text style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', marginBottom: 12, letterSpacing: -0.5 }}>
            SUMMARY_
          </Text>
          <DrasticRichText text={content} baseStyle={{ ...textStyle, color: '#ffffff', fontSize: 13, lineHeight: 1.6 }} />
        </View>
      );

    case 'example':
      return (
        <View wrap={false} style={[{
          paddingLeft: 16,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: docColors.main
        }]}>
          <Text style={{ fontWeight: 800, fontSize: 10, color: docColors.main, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
            E.G. //
          </Text>
          <DrasticRichText text={content} baseStyle={{ ...textStyle, color: '#334155' }} />
        </View>
      );

    case 'explanation':
      return (
        <View wrap={false} style={[styles.boxContent, { 
          borderTopColor: docColors.main, 
          borderLeftColor: docColors.main,
          borderTopWidth: 4,
          borderLeftWidth: 4,
          backgroundColor: docColors.light
        }]}>
          <Text style={{ fontWeight: 700, fontSize: 10, marginBottom: 8, letterSpacing: 2, color: docColors.dark, textAlign: isRtl ? 'right' : 'left', textTransform: 'uppercase' }}>
            EXPLANATION
          </Text>
          <DrasticRichText text={content} baseStyle={{...textStyle, color: docColors.dark}} />
        </View>
      );

    case 'list':
      const isListSplit = block.layout === 'split';
      return (
        <View style={{ marginBottom: 12, flexDirection: isListSplit ? 'row' : 'column', flexWrap: 'wrap', paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: docColors.light }}>
          {block.items?.map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={{ 
                flexDirection: isItemRtl ? 'row-reverse' : 'row',
                width: isListSplit ? '45%' : 'auto',
                marginLeft: isListSplit ? 0 : (isItemRtl ? 0 : 5),
                marginRight: isListSplit ? 20 : (isItemRtl ? 5 : 0),
                marginBottom: 8,
                alignItems: 'flex-start'
              }}>
                <View style={{ width: 12, height: 12, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 4, height: 4, backgroundColor: docColors.main, borderRadius: 2 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <DrasticRichText text={item} baseStyle={{ fontSize: 12, lineHeight: 1.6, textAlign: isItemRtl ? 'right' : 'left', color: '#334155' }} />
                </View>
              </View>
            );
          })}
        </View>
      );

    case 'step':
      const isStepSplit = block.layout === 'split';
      return (
        <View style={{ marginBottom: 16, flexDirection: isStepSplit ? 'row' : 'column', flexWrap: 'wrap' }}>
          {block.items?.map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={{ 
                flexDirection: isItemRtl ? 'row-reverse' : 'row',
                width: isStepSplit ? '45%' : 'auto',
                marginLeft: isStepSplit ? 0 : (isItemRtl ? 0 : 0),
                marginRight: isStepSplit ? 20 : (isItemRtl ? 0 : 0),
                backgroundColor: block.items!.length > 3 ? '#ffffff' : docColors.light,
                borderWidth: 1,
                borderColor: docColors.light,
                borderLeftWidth: 4,
                borderLeftColor: docColors.main,
                padding: 12,
                marginBottom: 8,
                alignItems: 'flex-start'
              }}>
                <View style={{ 
                  backgroundColor: docColors.main, 
                  paddingHorizontal: 6, 
                  paddingVertical: 2, 
                  marginRight: 10, 
                  borderRadius: 2
                }}>
                  <Text style={{ color: '#ffffff', fontWeight: 800, fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <DrasticRichText text={item} baseStyle={{ fontSize: 12, lineHeight: 1.6, textAlign: isItemRtl ? 'right' : 'left', color: '#0f172a', fontWeight: 500 }} />
                </View>
              </View>
            );
          })}
        </View>
      );

    case 'vocabulary':
      const vocabIsRtl = isArabic(prepareInteractiveSyntax(block.term || '') + prepareInteractiveSyntax(block.definition || ''));
      return (
        <View wrap={false} style={[{ 
            flexDirection: vocabIsRtl ? 'row-reverse' : 'row', 
            marginBottom: 12,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: docColors.light,
            position: 'relative'
        }]}>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: vocabIsRtl ? 'auto' : 0, right: vocabIsRtl ? 0 : 'auto', width: 4, backgroundColor: docColors.main }} />
          <View style={{ width: '35%', padding: 12, backgroundColor: docColors.light, paddingLeft: vocabIsRtl ? 12 : 16, paddingRight: vocabIsRtl ? 16 : 12 }}>
            <Text style={{ fontSize: 8, color: docColors.dark, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>VOCAB // TERM</Text>
            <DrasticRichText text={block.term || ''} baseStyle={{ fontWeight: 800, fontSize: 13, textAlign: vocabIsRtl ? 'right' : 'left', color: docColors.dark }} />
          </View>
          <View style={{ width: '65%', padding: 12, borderLeftWidth: vocabIsRtl ? 0 : 1, borderRightWidth: vocabIsRtl ? 1 : 0, borderColor: docColors.light, justifyContent: 'center' }}>
            <DrasticRichText text={block.definition || ''} baseStyle={{ fontSize: 12, textAlign: vocabIsRtl ? 'right' : 'left', color: '#334155' }} />
          </View>
        </View>
      );
      
    case 'quote':
      const isQuoteRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 24, padding: 24, backgroundColor: docColors.dark, position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
          <View style={{ position: 'absolute', top: -5, left: 10 }}>
            <Text style={{ fontSize: 64, color: docColors.main, opacity: 0.4, fontFamily: 'Times-Roman', fontWeight: 700, lineHeight: 1 }}>"</Text>
          </View>
          <View style={{ position: 'relative', zIndex: 1, marginLeft: isQuoteRtl ? 0 : 20, marginRight: isQuoteRtl ? 20 : 0 }}>
            <DrasticRichText text={content} baseStyle={{ fontSize: 15, color: '#f8fafc', fontWeight: 500, lineHeight: 1.6, textAlign: isQuoteRtl ? 'right' : 'left' }} />
          </View>
        </View>
      );
      
    case 'container':
      return (
        <View wrap={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'column', gap: 10 }}>
            {block.children?.map((child, idx) => (
              <View key={idx} style={{ width: '100%', marginBottom: 10 }}>
                 <DrasticBlockRenderer block={child} docColors={docColors} isExam={isExam} />
              </View>
            ))}
          </View>
        </View>
      );
      
    case 'table':
      return (
        <View wrap={false} style={{ marginBottom: 16, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: docColors.main }}>
          {block.columns && block.columns.length > 0 ? (
            <View style={{ flexDirection: 'row', backgroundColor: docColors.main }}>
              {block.columns.map((col, i) => (
                <View key={i} style={{ flex: 1, padding: 10, borderRightWidth: i !== block.columns!.length - 1 ? 1 : 0, borderColor: docColors.dark }}>
                  <DrasticRichText text={col} baseStyle={{ fontSize: 10, fontWeight: 800, textAlign: isArabic(prepareInteractiveSyntax(col)) ? 'right' : 'left', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1 }} />
                </View>
              ))}
            </View>
          ) : []}
          {block.rows && block.rows.map((row, rI) => (
            <View key={rI} style={{ flexDirection: 'row', backgroundColor: rI % 2 === 0 ? docColors.light : '#ffffff', borderBottomWidth: rI !== block.rows!.length - 1 ? 1 : 0, borderColor: docColors.light }}>
              {row.map((cell, cI) => (
                <View key={cI} style={{ flex: 1, padding: 10, borderRightWidth: cI !== row.length - 1 ? 1 : 0, borderColor: docColors.light }}>
                  <DrasticRichText text={cell} baseStyle={{ fontSize: 11, textAlign: isArabic(prepareInteractiveSyntax(cell)) ? 'right' : 'left', color: '#1e293b' }} />
                </View>
              ))}
            </View>
          ))}
        </View>
      );

    case 'code':
      return (
        <View wrap={false} style={[{ 
            backgroundColor: '#0f172a', 
            padding: 16, 
            borderRadius: 6, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: docColors.dark
        }]}>
          <View style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 6, marginRight: 15 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f43f5e' }} />
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fbbf24' }} />
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
            </View>
            {block.language ? <Text style={{ fontSize: 9, color: docColors.main, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>SYS.{block.language}</Text> : null}
          </View>
          <Text style={{ fontFamily: isArabic(content) ? 'Cairo' : 'Courier', fontSize: 11, lineHeight: 1.6, color: '#e2e8f0' }}>{content}</Text>
        </View>
      );

    case 'flashcard':
      return (
        <View wrap={false} style={[{ 
            marginBottom: 16,
            flexDirection: 'row',
            borderWidth: 2,
            borderColor: docColors.main,
            backgroundColor: '#ffffff'
        }]}>
           <View style={{ width: 36, backgroundColor: docColors.main, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 800, transform: 'rotate(-90deg)', transformOrigin: 'center center', width: 80, textAlign: 'center', letterSpacing: 2, left: -22, position: 'absolute' }}>FLASHCARD</Text>
           </View>
           <View style={{ flex: 1, padding: 16 }}>
             <Text style={{ fontSize: 8, color: docColors.dark, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>QUESTION // FRONT</Text>
             <DrasticRichText text={block.front || ''} baseStyle={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 12 }} />
             <View style={{ height: 2, backgroundColor: docColors.light, marginBottom: 12 }} />
             <Text style={{ fontSize: 8, color: docColors.dark, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>ANSWER // BACK</Text>
             <DrasticRichText text={block.back || ''} baseStyle={{ fontSize: 13, color: '#334155' }} />
           </View>
        </View>
      );

    case 'essay_area':
      return (
        <View wrap={false} style={{ 
            marginTop: 15, 
            marginBottom: 20, 
            borderWidth: 2, 
            borderColor: docColors.main, 
            backgroundColor: docColors.light, 
            padding: 20 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 10, color: docColors.dark, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>[ INPUT RESPONSE REQUIRED ]</Text>
            <View style={{ width: 30, height: 4, backgroundColor: docColors.dark }} />
          </View>
          <View style={{ height: 150, flexDirection: 'column', gap: 28 }}>
            {[1, 2, 3, 4, 5].map(line => (
              <View key={line} style={{ height: 1, backgroundColor: docColors.dark, opacity: 0.3 }} />
            ))}
          </View>
        </View>
      );

    case 'image':
      if (block.imageUrl) {
        return (
          <View wrap={false} style={{ marginVertical: 16, alignSelf: 'center', width: block.imageWidth ? `${block.imageWidth}%` : '100%', maxWidth: '100%', borderWidth: 4, borderColor: docColors.light, padding: 4, backgroundColor: '#ffffff' }}>
            <Image 
              src={block.imageUrl} 
              style={{ width: '100%' }} 
            />
            {block.imageCaption ? (
              <View style={{ backgroundColor: docColors.light, padding: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 9, color: docColors.dark, textAlign: 'center', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>
                  FIG // {block.imageCaption}
                </Text>
              </View>
            ) : []}
          </View>
        );
      }
      return <View />;

    case 'horizontal_rule':
      return (
        <View wrap={false} style={{ marginVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ height: 2, flex: 1, backgroundColor: docColors.light }} />
            <Text style={{ marginHorizontal: 15, color: docColors.main, fontWeight: 800, fontSize: 14 }}>***</Text>
            <View style={{ height: 2, flex: 1, backgroundColor: docColors.light }} />
        </View>
      );

    case 'page_break':
      return (
        <View break />
      );

    case 'plain':
    default:
      if (!content) return <View />;
      if (block.type === 'plain') {
        return <Text style={{ marginBottom: 8, color: '#475569' }}>{content}</Text>;
      }
      return <DrasticRichText text={content} baseStyle={textStyle} />;
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
    return renderDiseaseSubtypeDrastic(matchedSubType, renderContent(), docColors, isRtl, isExam || false);
  }

  return renderContent();
};

const TableOfContentsDrastic = ({ documents, docColors }: { documents: PdfDocument[], docColors: { main: string, light: string, dark: string } }) => {
  const tocItems: { title: string; page: number }[] = [];
  let currentPage = 2;

  documents.forEach((doc, idx) => {
    const title = prepareInteractiveSyntax(doc.title || `Document ${idx + 1}`);
    tocItems.push({ title, page: currentPage });
    const blocksCount = doc.blocks.length;    
    currentPage += Math.ceil(blocksCount / 5) || 1; 
  });

  return (
    <Page size="A4" style={[styles.tocPage, { position: 'relative' }]}>
      <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
         {Array.from({ length: 20 }).map((_, i) => (
           <Line key={`h${i}`} x1="0" y1={String(i * 42.1)} x2="595" y2={String(i * 42.1)} stroke="#f1f5f9" strokeWidth="1" />
         ))}
         {Array.from({ length: 14 }).map((_, i) => (
           <Line key={`v${i}`} x1={String(i * 42.5)} y1="0" x2={String(i * 42.5)} y2="842" stroke="#f1f5f9" strokeWidth="1" />
         ))}
         {/* Graphic layer */}
         {/* Sub-grid system */}
         {Array.from({ length: 60 }).map((_, i) => (
           <Line key={`sh${i}`} x1="0" y1={String(i * 14.03)} x2="595" y2={String(i * 14.03)} stroke={docColors.main} strokeWidth="0.5" opacity="0.1" />
         ))}
         {/* Waveform graphic */}
         <Path d="M 0 400 Q 150 200 300 400 T 595 400" fill="none" stroke={docColors.light} strokeWidth="2" opacity="0.4" />
         
         <Line x1="20" y1="20" x2="60" y2="20" stroke={docColors.main} strokeWidth="2" opacity="0.6" />
         <Line x1="20" y1="20" x2="20" y2="60" stroke={docColors.main} strokeWidth="2" opacity="0.6" />
         <Rect x="25" y="25" width="6" height="6" fill={docColors.main} opacity="0.8" />
         
         <Line x1="575" y1="822" x2="535" y2="822" stroke={docColors.main} strokeWidth="2" opacity="0.6" />
         <Line x1="575" y1="822" x2="575" y2="782" stroke={docColors.main} strokeWidth="2" opacity="0.6" />
         <Rect x="564" y="811" width="6" height="6" fill={docColors.main} opacity="0.8" />
         
         <Circle cx="595" cy="421" r="250" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 15" opacity="0.5" />
         <Circle cx="595" cy="421" r="230" fill="none" stroke={docColors.light} strokeWidth="2" opacity="0.4" />
         <Circle cx="595" cy="421" r="260" fill="none" stroke={docColors.main} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
         
         {/* Technical scale on the left */}
         {Array.from({ length: 50 }).map((_, i) => (
           <Line 
             key={`scale-${i}`} 
             x1="0" y1={String(i * 15 + 50)} 
             x2={i % 5 === 0 ? "15" : i % 2 === 0 ? "10" : "5"} y2={String(i * 15 + 50)} 
             stroke={docColors.dark} 
             strokeWidth={i % 5 === 0 ? "1" : "0.5"} 
             opacity="0.4" 
           />
         ))}
      </Svg>

      <Text style={[styles.tocTitle, { borderLeftColor: docColors.main }]}>INDEX_</Text>
      <View>
        {tocItems.map((item, i) => (
          <View key={i} style={styles.tocItem}>
            <Text style={{ ...styles.tocText, fontFamily: getFontFamily(item.title) }}>{`${String(i + 1).padStart(2, '0')} // ${item.title}`}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.tocPageNum, { color: docColors.main }]}>{String(item.page).padStart(3, '0')}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
};

export const ReactPdfOutputDrastic = ({ 
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
      const hex = '#' + themeColor.replace('custom-', '');
      return { main: hex, light: lightBlend(hex, 0.15), dark: darkBlend(hex, 0.8) };
    }
    const colorMap: Record<string, { main: string, light: string, dark: string }> = {
      indigo: { main: "#6366f1", light: "#e0e7ff", dark: "#3730a3" },
      emerald: { main: "#10b981", light: "#d1fae5", dark: "#064e3b" },
      rose: { main: "#f43f5e", light: "#ffe4e6", dark: "#881337" },
      amber: { main: "#f59e0b", light: "#fef3c7", dark: "#78350f" },
      violet: { main: "#8b5cf6", light: "#ede9fe", dark: "#4c1d95" },
      cyan: { main: "#06b6d4", light: "#cffafe", dark: "#164e63" },
    };
    return colorMap[themeColor] || { main: "#0ea5e9", light: "#e0f2fe", dark: "#0c4a6e" };
  };

  const tColors = getColorsForDoc();

  return (
    <Document title="Document Export" author="System">
      {includeCover ? (
        <Page size="A4" style={[styles.coverPage, { padding: 50, position: 'relative' }]}>
          <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
            <Rect x="0" y="0" width="595" height="842" fill="#ffffff" />
            
            {/* Fine Grid background */}
            {Array.from({ length: 42 }).map((_, i) => (
               <Line key={`grid-h-${i}`} x1="0" y1={String(i * 20)} x2="595" y2={String(i * 20)} stroke="#f1f5f9" strokeWidth={i % 5 === 0 ? "1.5" : "0.5"} opacity={i % 5 === 0 ? "1" : "0.5"} />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
               <Line key={`grid-v-${i}`} x1={String(i * 20)} y1="0" x2={String(i * 20)} y2="842" stroke="#f1f5f9" strokeWidth={i % 5 === 0 ? "1.5" : "0.5"} opacity={i % 5 === 0 ? "1" : "0.5"} />
            ))}

            {/* Corner motifs */}
            <Path d="M20 20 L60 20 M20 20 L20 60" fill="none" stroke={tColors.main} strokeWidth="3" opacity="0.8" />
            <Path d="M575 20 L535 20 M575 20 L575 60" fill="none" stroke={tColors.main} strokeWidth="3" opacity="0.8" />
            <Path d="M20 822 L60 822 M20 822 L20 782" fill="none" stroke={tColors.main} strokeWidth="3" opacity="0.8" />
            <Path d="M575 822 L535 822 M575 822 L575 782" fill="none" stroke={tColors.main} strokeWidth="3" opacity="0.8" />

            {/* Inner frame corner crosshairs */}
            <Path d="M40 40 L60 40 M40 40 L40 60" fill="none" stroke={tColors.dark} strokeWidth="1" opacity="0.4" />
            <Path d="M555 40 L535 40 M555 40 L555 60" fill="none" stroke={tColors.dark} strokeWidth="1" opacity="0.4" />
            <Path d="M40 802 L60 802 M40 802 L40 782" fill="none" stroke={tColors.dark} strokeWidth="1" opacity="0.4" />
            <Path d="M555 802 L535 802 M555 802 L555 782" fill="none" stroke={tColors.dark} strokeWidth="1" opacity="0.4" />

            {/* Large background typography elements */}
            <Rect x="450" y="50" width="100" height="20" fill={tColors.light} opacity="0.3" />
            <Rect x="470" y="75" width="80" height="4" fill={tColors.main} opacity="0.2" />
            
            <Path d="M450 100 L490 100 L500 110 L500 150" fill="none" stroke={tColors.main} strokeWidth="1.5" opacity="0.3" />
            
            {/* Hexagon cluster overlay on left */}
            {Array.from({length: 3}).map((_, r) => (
              Array.from({length: 4}).map((_, c) => {
                const cx = 50 + c * 30 + (r % 2) * 15;
                const cy = 600 + r * 26;
                return (
                  <Polygon 
                    key={`hex-${r}-${c}`}
                    points={`${cx},${cy-10} ${cx+9},${cy-5} ${cx+9},${cy+5} ${cx},${cy+10} ${cx-9},${cy+5} ${cx-9},${cy-5}`} 
                    fill={c % 2 === 0 ? tColors.light : 'none'} 
                    stroke={tColors.main} 
                    strokeWidth="0.5" 
                    opacity="0.3" 
                  />
                );
              })
            ))}

            {/* Side tech bars */}
            <Rect x="20" y="300" width="6" height="150" fill={tColors.light} />
            <Rect x="20" y="460" width="6" height="50" fill={tColors.main} opacity="0.8" />
            <Rect x="20" y="520" width="6" height="20" fill={tColors.main} opacity="0.4" />

            <Rect x="569" y="100" width="6" height="80" fill={tColors.main} opacity="0.3" />
            <Rect x="569" y="190" width="6" height="60" fill={tColors.main} opacity="0.5" />
            <Rect x="569" y="260" width="6" height="200" fill={tColors.light} />

            {/* Diagonal cuts / Geometric shapes */}
            <Polygon points="595,0 400,0 595,195" fill={tColors.light} opacity="0.3" />
            <Polygon points="0,842 195,842 0,647" fill={tColors.main} opacity="0.1" />
            <Polygon points="595,842 595,700 453,842" fill={tColors.dark} opacity="0.1" />

            {/* Massive Blueprint Circles / Technical Arcs */}
            <Circle cx="0" cy="421" r="300" fill="none" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="2 10" opacity="0.3" />
            <Circle cx="0" cy="421" r="320" fill="none" stroke={tColors.light} strokeWidth="1" strokeDasharray="30 10 5 10" opacity="0.4" />
            <Circle cx="0" cy="421" r="280" fill="none" stroke={tColors.dark} strokeWidth="2" opacity="0.1" />
            <Circle cx="0" cy="421" r="100" fill="none" stroke={tColors.main} strokeWidth="0.25" opacity="0.5" />
            {Array.from({length: 48}).map((_, i) => {
              const ang = i * Math.PI * 2 / 48;
              return (
                <Line
                  key={`ray-${i}`}
                  x1={String(0 + Math.cos(ang) * 110)}
                  y1={String(421 + Math.sin(ang) * 110)}
                  x2={String(0 + Math.cos(ang) * 130)}
                  y2={String(421 + Math.sin(ang) * 130)}
                  stroke={tColors.main}
                  strokeWidth="0.5"
                  opacity={i % 6 === 0 ? "0.6" : "0.2"}
                />
              )
            })}

            {/* Moiré effect patterns */}
            {Array.from({ length: 30 }).map((_, i) => (
              <Circle 
                key={`moire-1-${i}`}
                cx="595"
                cy="0"
                r={String(i * 15)}
                fill="none"
                stroke={tColors.main}
                strokeWidth="0.2"
                opacity="0.1"
              />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <Circle 
                key={`moire-2-${i}`}
                cx="580"
                cy="15"
                r={String(i * 15)}
                fill="none"
                stroke={tColors.dark}
                strokeWidth="0.2"
                opacity="0.05"
              />
            ))}

            {/* Technical Waveforms Bottom */}
            {Array.from({ length: 12 }).map((_, i) => {
              const xStart = 50 + i * 40;
              const height = 10 + Math.sin(i) * 20 + 30;
              return (
                <G key={`tech-wave-${i}`}>
                   <Rect x={String(xStart)} y={String(800 - height)} width="2" height={String(height)} fill={tColors.main} opacity="0.2" />
                   <Rect x={String(xStart + 4)} y={String(800 - height * 0.6)} width="2" height={String(height * 0.6)} fill={tColors.light} opacity="0.3" />
                </G>
              );
            })}

            {/* Dense diagonal hatching at bottom right */}
            {Array.from({ length: 40 }).map((_, i) => (
              <Line 
                key={`chash-${i}`} 
                x1={String(595 - i * 8)} 
                y1="842" 
                x2="595" 
                y2={String(842 - i * 8)} 
                stroke={tColors.main} 
                strokeWidth="0.5" 
                opacity="0.2" 
              />
            ))}

            {/* Micro horizontal ticks along right edge */}
            {Array.from({ length: 160 }).map((_, i) => (
              <Line 
                key={`rtick-${i}`} 
                x1={i % 10 === 0 ? "585" : "590"} 
                y1={String(i * 5.26)} 
                x2="595" 
                y2={String(i * 5.26)} 
                stroke={tColors.dark} 
                strokeWidth="0.5" 
                opacity={i % 10 === 0 ? "0.6" : "0.2"} 
              />
            ))}

            {/* Concentric rings and radar details */}
            <Circle cx="300" cy="421" r="280" fill="none" stroke={tColors.light} strokeWidth="2" strokeDasharray="10 20" opacity="0.6" />
            <Circle cx="300" cy="421" r="200" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <Circle cx="300" cy="421" r="150" fill="none" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="5 15" />
            <Circle cx="300" cy="421" r="50" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.2" />

            {/* Crosshairs */}
            <Line x1="150" y1="421" x2="450" y2="421" stroke={tColors.dark} strokeWidth="0.5" opacity="0.5" />
            <Line x1="300" y1="271" x2="300" y2="571" stroke={tColors.dark} strokeWidth="0.5" opacity="0.5" />

            {/* Interactive nodes */}
            <Circle cx="150" cy="421" r="3" fill={tColors.main} />
            <Circle cx="450" cy="421" r="3" fill={tColors.main} />
            <Circle cx="300" cy="271" r="3" fill={tColors.main} />
            <Circle cx="300" cy="571" r="3" fill={tColors.main} />
            <Circle cx="300" cy="421" r="4" fill="none" stroke={tColors.main} strokeWidth="1" />

            {/* Extra Visual Geometry */}
            <Path d="M0 100 Q 150 150 300 100 T 595 100" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.3" />
            <Path d="M0 120 Q 150 170 300 120 T 595 120" fill="none" stroke={tColors.dark} strokeWidth="0.5" opacity="0.2" />
            
            {/* Binary data block abstraction */}
            {Array.from({ length: 8 }).map((_, r) => (
              Array.from({ length: 12 }).map((_, c) => (
                <Rect 
                  key={`data-${r}-${c}`} 
                  x={String(480 + c * 6)} 
                  y={String(50 + r * 6)} 
                  width="4" 
                  height="4" 
                  fill={Math.random() > 0.5 ? tColors.main : tColors.light} 
                  opacity={Math.random() > 0.3 ? "0.6" : "0.1"} 
                />
              ))
            ))}

            {/* Wireframe globe abstraction */}
            <Circle cx="100" cy="150" r="50" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />
            <Ellipse cx="100" cy="150" rx="50" ry="20" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />
            <Ellipse cx="100" cy="150" rx="20" ry="50" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />
            <Line x1="50" y1="150" x2="150" y2="150" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />
            <Line x1="100" y1="100" x2="100" y2="200" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />

            {/* Technical Detail: Exploded View abstraction top-center */}
            <G opacity="0.2">
              <Rect x="280" y="50" width="30" height="30" fill="none" stroke={tColors.main} strokeWidth="0.5" transform="rotate(45, 295, 65)" />
              <Rect x="275" y="45" width="40" height="40" fill="none" stroke={tColors.light} strokeWidth="0.2" transform="rotate(45, 295, 65)" />
              <Line x1="295" y1="40" x2="295" y2="100" stroke={tColors.main} strokeWidth="0.2" />
              <Line x1="260" y1="65" x2="330" y2="65" stroke={tColors.main} strokeWidth="0.2" />
              <Circle cx="295" cy="65" r="5" fill="none" stroke={tColors.dark} strokeWidth="0.5" />
            </G>

            {/* Micro-dot clusters scattering */}
            {Array.from({length: 10}).map((_, i) => (
              <Circle 
                key={`m-dot-${i}`} 
                cx={String(150 + (i * 47) % 300)} 
                cy={String(200 + (i * 91) % 500)} 
                r="0.5" 
                fill={tColors.main} 
                opacity="0.6" 
              />
            ))}
            
            {/* Tech nodes connecting lines */}
            <Polyline points="50,700 100,650 200,650 250,600 300,600" fill="none" stroke={tColors.main} strokeWidth="1.5" opacity="0.5" />
            
            {/* Angle Gauge Graphic bottom-right quadrant */}
            <G opacity="0.2">
               <Circle cx="500" cy="500" r="100" fill="none" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="2 10" />
               <Line x1="500" y1="500" x2="570" y2="430" stroke={tColors.dark} strokeWidth="1" />
               <Path d="M 500 450 A 50 50 0 0 1 550 500" fill="none" stroke={tColors.main} strokeWidth="1" />
               {Array.from({length: 12}).map((_, i) => (
                 <Line key={`gauge-${i}`} x1="500" y1="400" x2="500" y2="410" stroke={tColors.main} strokeWidth="0.5" transform={`rotate(${i * 30}, 500, 500)`} />
               ))}
            </G>

            <Circle cx="50" cy="700" r="4" fill={tColors.main} opacity="0.8" />
            <Circle cx="100" cy="650" r="3" fill={tColors.light} />
            <Circle cx="200" cy="650" r="3" fill={tColors.light} />
            <Circle cx="250" cy="600" r="3" fill={tColors.light} />
            <Circle cx="300" cy="600" r="5" fill="none" stroke={tColors.main} strokeWidth="2" />
            <Circle cx="300" cy="600" r="2" fill={tColors.dark} />

            {/* Random cross markers */}
            {Array.from({ length: 15 }).map((_, i) => {
              const cx = 50 + (i * 37) % 500;
              const cy = 100 + (i * 83) % 700;
              return (
                <G key={`crossm-${i}`}>
                   <Line x1={String(cx - 3)} y1={String(cy)} x2={String(cx + 3)} y2={String(cy)} stroke={tColors.main} strokeWidth="0.5" opacity="0.5" />
                   <Line x1={String(cx)} y1={String(cy - 3)} x2={String(cx)} y2={String(cy + 3)} stroke={tColors.main} strokeWidth="0.5" opacity="0.5" />
                </G>
              );
            })}

            {/* Decorative block */}
            <Rect x="400" y="300" width="100" height="150" fill="none" stroke={tColors.light} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <Rect x="410" y="310" width="80" height="130" fill={tColors.main} opacity="0.05" />
            <Line x1="400" y1="330" x2="500" y2="330" stroke={tColors.light} strokeWidth="1" opacity="0.4" />
            <Line x1="400" y1="430" x2="500" y2="430" stroke={tColors.light} strokeWidth="1" opacity="0.4" />
            
            {/* Graphical Barcode */}
            {Array.from({ length: 40 }).map((_, i) => (
                <Line 
                    key={`barcode-${i}`} 
                    x1={String(480 + i * 2)} 
                    y1="760" 
                    x2={String(480 + i * 2)} 
                    y2={i % 3 === 0 ? "785" : i % 2 === 0 ? "780" : "775"} 
                    stroke={tColors.dark} 
                    strokeWidth={i % 5 === 0 ? "1.5" : "0.5"} 
                    opacity="0.3" 
                />
            ))}
          </Svg>
          
          <View style={{ flex: 1, justifyContent: 'center' }}>
             <View style={{ borderLeftWidth: 10, borderLeftColor: tColors.main, paddingLeft: 20 }}>
               <Text style={[styles.coverTitle, { color: '#0f172a', fontFamily: getFontFamily(documents[0]?.title || '') }]}>{prepareInteractiveSyntax(documents[0]?.title || 'Document_Export')}</Text>
               <View style={{ backgroundColor: tColors.main, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, marginTop: 10 }}>
                 <Text style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                   SYSTEM READY // v1.0
                 </Text>
               </View>
             </View>
          </View>

          <View style={{ position: 'absolute', bottom: 50, left: 50 }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Courier', letterSpacing: 2 }}>
              GENERATED: {new Date().toISOString().split('T')[0]}
            </Text>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Courier', letterSpacing: 2 }}>
              ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </Text>
          </View>
        </Page>
      ) : null}

      {includeToc && documents.length > 0 ? <TableOfContentsDrastic documents={documents} docColors={tColors} /> : null}

      {documents.map((doc, docIdx) => {
        const titleText = prepareInteractiveSyntax(doc.title || `Section ${docIdx + 1}`);
        return (
          <Page key={docIdx} size="A4" style={[styles.page, { position: 'relative' }]}>
            <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
              <Line x1="25" y1="0" x2="25" y2="842" stroke="#f1f5f9" strokeWidth="20" />
              <Line x1="45" y1="0" x2="45" y2="842" stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Faded Document Grid */}
              {Array.from({ length: 42 }).map((_, i) => (
                 <Line key={`grid-h-${i}`} x1="0" y1={String(i * 20)} x2="595" y2={String(i * 20)} stroke="#f1f5f9" strokeWidth="0.5" opacity="0.5" />
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                 <Line key={`grid-v-${i}`} x1={String(i * 20)} y1="0" x2={String(i * 20)} y2="842" stroke="#f1f5f9" strokeWidth="0.5" opacity="0.5" />
              ))}

              {/* Corner crosshairs left-top */}
              <Line x1="30" y1="30" x2="60" y2="30" stroke={tColors.main} strokeWidth="1.5" opacity="0.6" />
              <Line x1="45" y1="15" x2="45" y2="45" stroke={tColors.main} strokeWidth="1.5" opacity="0.6" />
              <Circle cx="45" cy="30" r="10" stroke={tColors.main} strokeWidth="0.5" fill="none" opacity="0.4" />
              
              {/* Corner crosshairs right-bottom */}
              <Line x1="535" y1="807" x2="565" y2="807" stroke={tColors.main} strokeWidth="1.5" opacity="0.6" />
              <Line x1="550" y1="792" x2="550" y2="822" stroke={tColors.main} strokeWidth="1.5" opacity="0.6" />
              <Circle cx="550" cy="807" r="10" stroke={tColors.main} strokeWidth="0.5" fill="none" opacity="0.5" />
              <Circle cx="550" cy="807" r="16" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="2 2" fill="none" opacity="0.4" />

              {/* Hexagons at Top Center */}
              <Polygon points="297,10 307,15 307,25 297,30 287,25 287,15" fill={tColors.light} opacity="0.3" stroke={tColors.main} strokeWidth="0.5" />
              <Polygon points="297,14 303,17 303,23 297,26 291,23 291,17" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.5" />

              {/* Large Abstract Geometric Backdrop */}
              <Polygon points="50,150 200,80 350,120 400,300 250,400 100,300" fill={tColors.light} opacity="0.1" />
              <Polyline points="50,150 200,80 350,120 400,300" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.15" />
              
              {/* Radar rings fading out */}
              <Circle cx="300" cy="421" r="350" fill="none" stroke={tColors.light} strokeWidth="2" strokeDasharray="5 45" opacity="0.5" />
              
              {/* Complex diagonal hashing overlay */}
              {Array.from({length: 60}).map((_, i) => (
                <Line 
                  key={`bg-hash-${i}`} 
                  x1={String(600 - i * 15)} 
                  y1="842" 
                  x2="595" 
                  y2={String(842 - i * 15)} 
                  stroke={tColors.main} 
                  strokeWidth="0.5" 
                  opacity={i % 5 === 0 ? "0.15" : "0.05"} 
                />
              ))}

              {/* Decorative side ticks on the left margin */}
              {Array.from({ length: 42 }).map((_, i) => (
                <Line 
                   key={`tick-${i}`} 
                   x1="10" 
                   y1={String(20 + i * 20)} 
                   x2={i % 5 === 0 ? "20" : "15"} 
                   y2={String(20 + i * 20)} 
                   stroke={tColors.main} 
                   strokeWidth="1" 
                   opacity={i % 5 === 0 ? "0.5" : "0.2"} 
                />
              ))}

              {/* Small dot grid cluster */}
              {Array.from({length: 4}).map((_, i) => (
                Array.from({length: 4}).map((_, j) => (
                  <Circle key={`dg-${i}-${j}`} cx={String(530 + i * 8)} cy={String(50 + j * 8)} r="1" fill={tColors.main} opacity="0.3" />
                ))
              ))}

              {/* Extra dot grid lower down */}
              {Array.from({length: 2}).map((_, i) => (
                Array.from({length: 10}).map((_, j) => (
                  <Circle key={`dg2-${i}-${j}`} cx={String(560 + i * 8)} cy={String(500 + j * 8)} r="0.5" fill={tColors.dark} opacity="0.5" />
                ))
              ))}

              {/* Diagonal hashing in bottom-left edge */}
              {Array.from({length: 10}).map((_, i) => (
                <Line 
                  key={`hash-${i}`} 
                  x1="5" 
                  y1={String(700 + i * 5)} 
                  x2="20" 
                  y2={String(690 + i * 5)} 
                  stroke={tColors.main} 
                  strokeWidth="0.5" 
                  opacity="0.3" 
                />
              ))}

              {/* Hexagonal Node Graphic midway down right side */}
              <Polygon points="545,350 555,345 565,350 565,360 555,365 545,360" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.4" />
              <Polygon points="548,352 555,348 562,352 562,358 555,362 548,358" fill={tColors.main} opacity="0.1" />
              <Circle cx="555" cy="355" r="2" fill={tColors.main} opacity="0.6" />
              <Line x1="555" y1="365" x2="555" y2="390" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />

              {/* Massive topographic contour rings */}
              <Circle cx="150" cy="-50" r="300" fill="none" stroke={tColors.light} strokeWidth="0.5" opacity="0.4" />
              <Circle cx="150" cy="-50" r="320" fill="none" stroke={tColors.main} strokeWidth="0.25" opacity="0.3" strokeDasharray="10 5" />
              <Circle cx="150" cy="-50" r="350" fill="none" stroke={tColors.light} strokeWidth="1" opacity="0.1" />
              
              {/* Procedural Tech Tendrils */}
              {Array.from({length: 8}).map((_, i) => {
                const y = 100 + i * 80;
                const phase = i * 0.5;
                const pts = Array.from({length: 10}).map((__, j) => {
                  const xCur = j * 60;
                  const yCur = y + Math.sin(j * 0.8 + phase) * 15;
                  return `${xCur},${yCur}`;
                }).join(' ');
                return (
                  <Polyline 
                    key={`tendril-${i}`}
                    points={pts}
                    fill="none"
                    stroke={tColors.main}
                    strokeWidth="0.3"
                    opacity="0.08"
                  />
                );
              })}

              {/* HUD / Scanner motifs in corners */}
              <G opacity="0.15">
                <Circle cx="500" cy="700" r="60" fill="none" stroke={tColors.main} strokeWidth="0.5" />
                <Circle cx="500" cy="700" r="40" fill="none" stroke={tColors.dark} strokeWidth="1" strokeDasharray="2 10" />
                <Line x1="440" y1="700" x2="560" y2="700" stroke={tColors.main} strokeWidth="0.5" />
                <Line x1="500" y1="640" x2="500" y2="760" stroke={tColors.main} strokeWidth="0.5" />
              </G>

              {/* Interlocking technical frames */}
              <Rect x="50" y="50" width="500" height="742" fill="none" stroke={tColors.light} strokeWidth="0.2" opacity="0.2" />
              <Rect x="55" y="55" width="490" height="732" fill="none" stroke={tColors.main} strokeWidth="0.1" opacity="0.1" />
              
              {/* Circuit board traces */}
              <Path d="M565 600 L530 600 L520 610 L520 630 L510 640" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.5" />
              <Circle cx="510" cy="640" r="3" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.6" />
              <Path d="M520 620 L540 620 L550 630" fill="none" stroke={tColors.main} strokeWidth="0.25" opacity="0.4" />
              <Circle cx="550" cy="630" r="2" fill={tColors.light} opacity="0.8" />
              <Line x1="555" y1="390" x2="570" y2="400" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />

              {/* Digital Terrain / Landscape Background */}
              {Array.from({length: 4}).map((_, i) => {
                const yBase = 700 + i * 25;
                const d = `M 0 ${yBase} ` + Array.from({length: 12}).map((__, j) => {
                  const x = j * 55;
                  const h = 20 - (j % 3) * 10 - i * 5;
                  return `Q ${x + 27} ${yBase - h} ${x + 55} ${yBase}`;
                }).join(' ') + ` L 595 ${yBase}`;
                return (
                  <Path 
                    key={`topo-${i}`}
                    d={d}
                    fill="none"
                    stroke={tColors.main}
                    strokeWidth="0.4"
                    opacity={0.1 / (i + 1)}
                  />
                );
              })}

              {/* Technical signal spikes */}
              {Array.from({length: 20}).map((_, i) => {
                const x = 100 + i * 15;
                const h = (i % 4 === 0) ? 12 : (i % 2 === 0) ? 8 : 4;
                return (
                  <G key={`spike-${i}`}>
                    <Line x1={String(x)} y1="820" x2={String(x)} y2={String(820-h)} stroke={tColors.main} strokeWidth="0.5" opacity="0.3" />
                  </G>
                )
              })}
              
              {/* Sine Wave / Pulse graphic left margin */}
              <Path d="M15 400 Q 25 410 15 420 T 15 440 T 15 460" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.5" />
              <Circle cx="15" cy="400" r="1.5" fill={tColors.dark} opacity="0.6" />
              <Circle cx="15" cy="460" r="1.5" fill={tColors.dark} opacity="0.6" />

              {/* Geometric elements at bottom left */}
              <Path d="M70 780 L90 780 L100 790 L100 810" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.4" />
              <Rect x="75" y="785" width="20" height="20" fill={tColors.light} opacity="0.2" />
              <Circle cx="85" cy="795" r="5" stroke={tColors.main} strokeWidth="0.5" fill="none" opacity="0.5" />

              {/* Graphical barcode-like element on the right side */}
              <Rect x="560" y="200" width="4" height="60" fill={tColors.light} />
              <Rect x="566" y="210" width="2" height="40" fill={tColors.main} opacity="0.4" />
              <Rect x="570" y="220" width="3" height="30" fill={tColors.light} />
              <Rect x="575" y="225" width="1" height="20" fill={tColors.main} opacity="0.6" />
              
              {/* Technical diagram elements overlay */}
              <Path d="M560 300 L580 300 L580 320" fill="none" stroke={tColors.main} strokeWidth="0.5" opacity="0.5" />
              <Circle cx="560" cy="300" r="2" fill={tColors.main} />
              <Rect x="576" y="320" width="8" height="8" fill={tColors.light} opacity="0.5" />

              {/* Concentric rings at top right */}
              <Circle cx="580" cy="40" r="120" stroke={tColors.light} strokeWidth="1" fill="none" opacity="0.3" />
              <Circle cx="580" cy="40" r="140" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="5 10" fill="none" opacity="0.4" />
              
              {/* Complex Orbital System (Lower center) */}
              <G opacity="0.12">
                <Circle cx="300" cy="780" r="100" fill="none" stroke={tColors.main} strokeWidth="0.3" />
                <Ellipse cx="300" cy="780" rx="100" ry="30" fill="none" stroke={tColors.main} strokeWidth="0.5" transform="rotate(30, 300, 780)" />
                <Ellipse cx="300" cy="780" rx="100" ry="30" fill="none" stroke={tColors.main} strokeWidth="0.5" transform="rotate(-30, 300, 780)" />
                <Circle cx="300" cy="780" r="5" fill={tColors.main} />
              </G>

              {/* Data blocks at bottom right */}
              <Rect x="50" y="780" width="12" height="12" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.5" />
              <Rect x="54" y="784" width="4" height="4" fill={tColors.main} opacity="0.8" />
              <Rect x="66" y="780" width="40" height="4" fill={tColors.light} />
              <Rect x="66" y="788" width="25" height="4" fill={tColors.light} />
              
              <Path d="M66 800 L86 800 L86 810 L106 810" fill="none" stroke={tColors.main} strokeWidth="1" opacity="0.3" />
            </Svg>

            <View fixed style={{ position: 'absolute', top: 20, right: 40, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8, color: '#94a3b8', fontFamily: isArabic(titleText) ? 'Cairo' : 'Courier', letterSpacing: 2 }}>{isArabic(titleText) ? titleText : titleText.toUpperCase()} // SYS.SEC</Text>
              <View style={{ width: 40, height: 2, backgroundColor: tColors.main, marginTop: 4 }} />
            </View>

            <View style={{ marginTop: 20 }}>
               <Text style={[styles.title, { color: tColors.main, fontFamily: getFontFamily(titleText) }]}>{titleText}</Text>
            </View>
            
            {doc.blocks.map((block, idx) => (
              <DrasticBlockRenderer 
                key={idx} 
                block={block} 
                docColors={tColors}
                isExam={isExam}
              />
            ))}
            
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) => `P.${String(pageNumber).padStart(2, '0')} // TOTAL.${String(totalPages).padStart(2, '0')}`}
              fixed
            />
          </Page>
        );
      })}
    </Document>
  );
};
