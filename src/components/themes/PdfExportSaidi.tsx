import React from 'react';
import { PdfDocument, PdfBlock } from '../../types';
import { Document, Page, Text, View, Image, Svg, Path, Line, Circle, Rect, Polygon, Font, Defs, LinearGradient, Stop, G } from '@react-pdf/renderer';

// Register Inter for body text
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 }
  ]
});

// (Playfair Display removed, using native Inter)

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
const getTitleFontFamily = (text: string) => isArabic(text) ? 'Cairo' : 'Inter';

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

const SaidiRichText = ({ text, baseStyle }: { text: string; baseStyle: any }): any => {
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
          color: baseStyle?.color || '#334155', // darker text for light background
          fontFamily: getFontFamily(part, baseStyle?.fontFamily)
        };

        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
          const content = part.slice(2, -2);
          return <SaidiRichText key={i} text={content} baseStyle={{ ...style, fontWeight: 700, color: '#0f172a' }} />;
        } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
          const content = part.slice(1, -1);
          return <SaidiRichText key={i} text={content} baseStyle={{ ...style, color: '#475569' }} />;
        } else if (part.startsWith('==') && part.endsWith('==')) {
          const content = part.slice(2, -2);
          return <SaidiRichText key={i} text={content} baseStyle={{ ...style, backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#b45309', paddingVertical: 1, paddingHorizontal: 4, borderRadius: 2 }} />;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          const content = part.slice(1, -1);
          style.color = '#c2410c';
          style.fontFamily = isArabic(content) ? 'Cairo' : 'Courier';
          style.backgroundColor = 'rgba(194, 65, 12, 0.05)';
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

const SaidiBlockRenderer = ({ block, docColors, isExam }: { block: PdfBlock, docColors: any, isExam: boolean }) => {
  if (!block) return <View />;
  const content = block.content || '';
  const isRtl = isArabic(prepareInteractiveSyntax(content));

  switch (block.type) {
    case 'disease': {
      const subtypes = (block as any).children || block.blocks || [];
      return (
        <View style={{
          marginVertical: 15,
          padding: 24,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: docColors.border,
          borderTopWidth: 6,
          borderTopColor: docColors.main,
        }}>
          <View wrap={false} style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
            justifyContent: isRtl ? 'flex-end' : 'flex-start',
          }}>
            <Text style={{
              fontSize: 22,
              color: docColors.dark,
              fontFamily: getTitleFontFamily((block as any).title || block.content || "Disease Focus"),
              fontWeight: 700,
              letterSpacing: 0.5,
              textAlign: isRtl ? 'right' : 'left',
              flex: 1,
            }}>
              {(block as any).title || block.content || "Disease Focus"}
            </Text>
            <Svg width="24" height="24" viewBox="0 0 24 24" style={{ marginLeft: isRtl ? 0 : 15, marginRight: isRtl ? 15 : 0 }}>
              <Circle cx="12" cy="12" r="10" fill="none" stroke={docColors.main} strokeWidth="1.5" />
              <Circle cx="12" cy="12" r="6" fill="none" stroke={docColors.light} strokeWidth="1" strokeDasharray="2,2" />
              <Circle cx="12" cy="12" r="2" fill={docColors.dark} />
            </Svg>
          </View>

          {subtypes.map((subBlock: any, idx: number) => {
            const subtypeKey = matchSubtype(subBlock.subType);
            const label = subBlock.label || subBlock.subType || '';
            const subContent = subBlock.content || '';
            const isSubRtl = isArabic(prepareInteractiveSyntax(subContent));

            const renderSubContent = (customColor?: string) => (
              <SaidiRichText 
                text={subContent} 
                baseStyle={{ 
                  fontSize: 11, 
                  color: customColor || '#334155', 
                  fontFamily: 'Inter', 
                  textAlign: isSubRtl ? 'right' : 'left', 
                  lineHeight: 1.7 
                }} 
              />
            );
            
            const renderIcon = (color: string) => (
              <View style={{ width: 6, height: 6, transform: 'rotate(45deg)', backgroundColor: color, marginTop: 4, marginRight: isSubRtl ? 0 : 10, marginLeft: isSubRtl ? 10 : 0 }} />
            );

            const ElegantView = ({ color, bgColor, icon, children }: any) => (
              <View wrap={false} style={{ 
                marginBottom: 16, 
                backgroundColor: bgColor, 
                padding: 16, 
                borderRadius: 4,
                borderLeftWidth: isSubRtl ? 0 : 3,
                borderRightWidth: isSubRtl ? 3 : 0,
                borderColor: color 
              }}>
                <View style={{ 
                  flexDirection: isSubRtl ? 'row-reverse' : 'row', 
                  alignItems: 'flex-start', 
                  marginBottom: 8 
                }}>
                  {icon}
                  <Text style={{ 
                    fontSize: 10, 
                    color: color, 
                    fontFamily: 'Inter', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: 1 
                  }}>{label}</Text>
                </View>
                {children}
              </View>
            );

            switch (subtypeKey) {
              case 'definition':
                return (
                  <View wrap={false} key={idx} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 10, color: docColors.main, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                    <View style={{ paddingLeft: isSubRtl ? 0 : 12, paddingRight: isSubRtl ? 12 : 0, borderLeftWidth: isSubRtl ? 0 : 2, borderRightWidth: isSubRtl ? 2 : 0, borderColor: docColors.border }}>
                      <SaidiRichText text={subContent} baseStyle={{ fontSize: 13, color: '#0f172a', fontFamily: getTitleFontFamily(subContent), fontWeight: 500, textAlign: isSubRtl ? 'right' : 'left', lineHeight: 1.6 }} />
                    </View>
                  </View>
                );
              case 'classification':
                return <ElegantView key={idx} color={docColors.main} bgColor="#fdfbf7" icon={renderIcon(docColors.main)}>{renderSubContent()}</ElegantView>;
              case 'etiology':
                return <ElegantView key={idx} color="#b45309" bgColor="#fffbeb" icon={renderIcon("#b45309")}>{renderSubContent()}</ElegantView>;
              case 'riskFactors':
                return <ElegantView key={idx} color="#be123c" bgColor="#fff1f2" icon={renderIcon("#be123c")}>{renderSubContent()}</ElegantView>;
              case 'clinicalFeatures':
                return <ElegantView key={idx} color="#0f766e" bgColor="#f0fdfa" icon={renderIcon("#0f766e")}>{renderSubContent()}</ElegantView>;
              case 'signs':
                return <ElegantView key={idx} color="#0369a1" bgColor="#f0f9ff" icon={renderIcon("#0369a1")}>{renderSubContent()}</ElegantView>;
              case 'symptoms':
                return <ElegantView key={idx} color="#6d28d9" bgColor="#f5f3ff" icon={renderIcon("#6d28d9")}>{renderSubContent()}</ElegantView>;
              case 'diagnosis':
                return (
                  <View wrap={false} key={idx} style={{ 
                    marginBottom: 16, 
                    borderWidth: 1, 
                    borderColor: docColors.border, 
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor: '#ffffff'
                  }}>
                     <View style={{ flexDirection: isSubRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 }}>
                       <Text style={{ fontSize: 11, color: docColors.dark, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                     </View>
                     {renderSubContent()}
                  </View>
                );
              case 'differentialDiagnosis':
                return (
                  <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' }}>
                    <Text style={{ fontSize: 10, color: '#475569', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign: 'center' }}>:: {label} ::</Text>
                    {renderSubContent()}
                  </View>
                );
              case 'complications':
                return <ElegantView key={idx} color="#9f1239" bgColor="#fff1f2" icon={<Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: isSubRtl ? 0 : 8, marginLeft: isSubRtl ? 8 : 0, marginTop: 1 }}><Path d="M12 2L1 21H23L12 2ZM12 16C11.45 16 11 15.55 11 15V10C11 9.45 11.45 9 12 9C12.55 9 13 9.45 13 10V15C13 15.55 12.55 16 12 16ZM13 19H11V17H13V19Z" fill="#9f1239" /></Svg>}>{renderSubContent()}</ElegantView>;
              case 'management':
                return <ElegantView key={idx} color="#1d4ed8" bgColor="#eff6ff" icon={renderIcon("#1d4ed8")}>{renderSubContent()}</ElegantView>;
              case 'treatment':
                return <ElegantView key={idx} color="#15803d" bgColor="#f0fdf4" icon={renderIcon("#15803d")}>{renderSubContent()}</ElegantView>;
              case 'traps':
                return (
                  <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, backgroundColor: docColors.main, borderRadius: 4 }}>
                     <View style={{ flexDirection: isSubRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 8 }}>
                       <Svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: isSubRtl ? 0 : 8, marginLeft: isSubRtl ? 8 : 0 }}>
                         <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ffffff" />
                       </Svg>
                       <Text style={{ fontSize: 10, color: '#ffffff', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
                     </View>
                     {renderSubContent('#ffffff')}
                  </View>
                );
              default:
                return (
                  <View wrap={false} key={idx} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 10, color: docColors.dark, fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
                    {renderSubContent()}
                  </View>
                );
            }
          })}
        </View>
      );
    }

    case ('disease_subtype' as any): {
      const subtypeKey = matchSubtype(block.subType);
      const label = (block as any).label || block.subType || '';
      const subContent = block.content || '';
      const isSubRtl = isArabic(prepareInteractiveSyntax(subContent));

      const renderSubContent = (customColor?: string) => (
        <SaidiRichText 
          text={subContent} 
          baseStyle={{ 
            fontSize: 11, 
            color: customColor || '#334155', 
            fontFamily: 'Inter', 
            textAlign: isSubRtl ? 'right' : 'left', 
            lineHeight: 1.7 
          }} 
        />
      );
      
      const renderIcon = (color: string) => (
        <View style={{ width: 6, height: 6, transform: 'rotate(45deg)', backgroundColor: color, marginTop: 4, marginRight: isSubRtl ? 0 : 10, marginLeft: isSubRtl ? 10 : 0 }} />
      );

      const ElegantView = ({ color, bgColor, icon, children }: any) => (
        <View wrap={false} style={{ 
          marginBottom: 16, 
          backgroundColor: bgColor, 
          padding: 16, 
          borderRadius: 4,
          borderLeftWidth: isSubRtl ? 0 : 3,
          borderRightWidth: isSubRtl ? 3 : 0,
          borderColor: color 
        }}>
          <View style={{ 
            flexDirection: isSubRtl ? 'row-reverse' : 'row', 
            alignItems: 'flex-start', 
            marginBottom: 8 
          }}>
            {icon}
            <Text style={{ 
              fontSize: 10, 
              color: color, 
              fontFamily: 'Inter', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: 1 
            }}>{label}</Text>
          </View>
          {children}
        </View>
      );

      switch (subtypeKey) {
        case 'definition':
          return (
            <View wrap={false} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 10, color: docColors.main, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
              <View style={{ paddingLeft: isSubRtl ? 0 : 12, paddingRight: isSubRtl ? 12 : 0, borderLeftWidth: isSubRtl ? 0 : 2, borderRightWidth: isSubRtl ? 2 : 0, borderColor: docColors.border }}>
                <SaidiRichText text={subContent} baseStyle={{ fontSize: 13, color: '#0f172a', fontFamily: getTitleFontFamily(subContent), fontWeight: 500, textAlign: isSubRtl ? 'right' : 'left', lineHeight: 1.6 }} />
              </View>
            </View>
          );
        case 'classification':
          return <ElegantView color={docColors.main} bgColor="#fdfbf7" icon={renderIcon(docColors.main)}>{renderSubContent()}</ElegantView>;
        case 'etiology':
          return <ElegantView color="#b45309" bgColor="#fffbeb" icon={renderIcon("#b45309")}>{renderSubContent()}</ElegantView>;
        case 'riskFactors':
          return <ElegantView color="#be123c" bgColor="#fff1f2" icon={renderIcon("#be123c")}>{renderSubContent()}</ElegantView>;
        case 'clinicalFeatures':
          return <ElegantView color="#0f766e" bgColor="#f0fdfa" icon={renderIcon("#0f766e")}>{renderSubContent()}</ElegantView>;
        case 'signs':
          return <ElegantView color="#0369a1" bgColor="#f0f9ff" icon={renderIcon("#0369a1")}>{renderSubContent()}</ElegantView>;
        case 'symptoms':
          return <ElegantView color="#6d28d9" bgColor="#f5f3ff" icon={renderIcon("#6d28d9")}>{renderSubContent()}</ElegantView>;
        case 'diagnosis':
          return (
            <View wrap={false} style={{ 
              marginBottom: 16, 
              borderWidth: 1, 
              borderColor: docColors.border, 
              borderRadius: 8,
              padding: 16,
              backgroundColor: '#ffffff'
            }}>
               <View style={{ flexDirection: isSubRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 }}>
                 <Text style={{ fontSize: 11, color: docColors.dark, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
               </View>
               {renderSubContent()}
            </View>
          );
        case 'differentialDiagnosis':
          return (
            <View wrap={false} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' }}>
              <Text style={{ fontSize: 10, color: '#475569', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign: 'center' }}>:: {label} ::</Text>
              {renderSubContent()}
            </View>
          );
        case 'complications':
          return <ElegantView color="#9f1239" bgColor="#fff1f2" icon={<Svg width="12" height="12" viewBox="0 0 24 24" style={{ marginRight: isSubRtl ? 0 : 8, marginLeft: isSubRtl ? 8 : 0, marginTop: 1 }}><Path d="M12 2L1 21H23L12 2ZM12 16C11.45 16 11 15.55 11 15V10C11 9.45 11.45 9 12 9C12.55 9 13 9.45 13 10V15C13 15.55 12.55 16 12 16ZM13 19H11V17H13V19Z" fill="#9f1239" /></Svg>}>{renderSubContent()}</ElegantView>;
        case 'management':
          return <ElegantView color="#1d4ed8" bgColor="#eff6ff" icon={renderIcon("#1d4ed8")}>{renderSubContent()}</ElegantView>;
        case 'treatment':
          return <ElegantView color="#15803d" bgColor="#f0fdf4" icon={renderIcon("#15803d")}>{renderSubContent()}</ElegantView>;
        case 'traps':
          return (
            <View wrap={false} style={{ marginBottom: 16, padding: 16, backgroundColor: docColors.main, borderRadius: 4 }}>
               <View style={{ flexDirection: isSubRtl ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 8 }}>
                 <Svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: isSubRtl ? 0 : 8, marginLeft: isSubRtl ? 8 : 0 }}>
                   <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ffffff" />
                 </Svg>
                 <Text style={{ fontSize: 10, color: '#ffffff', fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
               </View>
               {renderSubContent('#ffffff')}
            </View>
          );
        default:
          return (
            <View wrap={false} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 10, color: docColors.dark, fontFamily: 'Inter', fontWeight: 700, marginBottom: 4, textAlign: isSubRtl ? 'right' : 'left' }}>{label}</Text>
              {renderSubContent()}
            </View>
          );
      }
    }

    case 'heading':
      return (
        <View wrap={false} style={{ marginBottom: 24, marginTop: 32, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: docColors.main, paddingBottom: 8 }}>
            <SaidiRichText text={content} baseStyle={{ fontSize: 24, fontFamily: getTitleFontFamily(content), fontWeight: 700, color: docColors.main, lineHeight: 1.3, letterSpacing: 0.5 }} />
          </View>
        </View>
      );
    case 'subheading':
      return (
        <View wrap={false} style={{ marginTop: 24, marginBottom: 12, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: docColors.bgLight, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: docColors.main }}>
            <SaidiRichText text={content} baseStyle={{ fontSize: 16, fontFamily: getTitleFontFamily(content), fontWeight: 700, color: docColors.dark, textAlign: isRtl ? 'right' : 'left', letterSpacing: 0.5 }} />
          </View>
        </View>
      );
    case 'subtitle':
      return (
        <View wrap={false} style={{ marginTop: 16, marginBottom: 8, alignSelf: isRtl ? 'flex-end' : 'flex-start' }}>
          <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 500, color: docColors.main, textAlign: isRtl ? 'right' : 'left', letterSpacing: 1.5, textTransform: 'uppercase' }} />
        </View>
      );
    case 'paragraph':
    case 'text':
    case 'plain':
      if (content.trim() === '') return <View style={{ height: 10 }} />;
      return (
        <View style={{ marginBottom: 14 }}>
           <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', lineHeight: 1.8, color: '#334155', textAlign: isRtl ? 'right' : 'left' }} />
        </View>
      );
    case 'example': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, borderTopWidth: 3, borderTopColor: docColors.light }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: '#64748b', fontFamily: 'Inter', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Example</Text>
               <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#334155', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'explanation': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed' }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: docColors.main, fontFamily: 'Inter', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Explanation</Text>
               <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#475569', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'note': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: docColors.bgLight, borderRadius: 8, borderWidth: 0, borderLeftWidth: 4, borderLeftColor: docColors.dark }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: docColors.dark, fontFamily: 'Inter', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Note</Text>
               <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#1e293b', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'warning': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
             <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: '#dc2626', fontFamily: 'Inter', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Warning</Text>
               <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#991b1b', fontWeight: 500, lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'tip': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 8 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
             <View style={{ flex: 1 }}>
               <Text style={{ fontSize: 9, color: '#16a34a', fontFamily: 'Inter', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Pro Tip</Text>
               <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#166534', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'high_yield': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 24, backgroundColor: '#ffffff', borderWidth: 2, borderColor: docColors.main, borderRadius: 12, position: 'relative' }}>
          <View style={{ position: 'absolute', top: -10, left: 24, backgroundColor: '#ffffff', paddingHorizontal: 8 }}>
             <Text style={{ color: docColors.dark, fontSize: 10, fontWeight: 700, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 2 }}>High Yield</Text>
          </View>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginTop: 4 }}>
               <SaidiRichText text={content} baseStyle={{ fontSize: 12, fontFamily: 'Inter', color: '#0f172a', fontWeight: 500, lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'clinical_correlation': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 16, padding: 20, backgroundColor: '#f0f9ff', borderWidth: 0, borderLeftWidth: 4, borderLeftColor: '#0ea5e9', borderRadius: 0 }}>
          <View style={{ flexDirection: isBoxRtl ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
             <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: '#0284c7', fontFamily: 'Inter', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Clinical Correlation</Text>
               <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#075985', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} />
            </View>
          </View>
        </View>
      );
    }
    case 'list':
      const isOrdered = (block as any).style === 'ordered';
      return (
        <View style={{ marginVertical: 12 }}>
          {(block.items || []).map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={{ flexDirection: isItemRtl ? 'row-reverse' : 'row', marginBottom: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 24, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 }}>
                  {isOrdered ? (
                    <Text style={{ fontSize: 11, fontWeight: 500, color: docColors.main, fontFamily: 'Inter' }}>{i + 1}.</Text>
                  ) : (
                    <View style={{ width: 4, height: 4, backgroundColor: docColors.main, transform: 'rotate(45deg)', marginTop: 4 }} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: isItemRtl ? 0 : 8, marginRight: isItemRtl ? 8 : 0 }}>
                   <SaidiRichText text={item} baseStyle={{ fontSize: 11, fontFamily: 'Inter', lineHeight: 1.6, color: '#334155', textAlign: isItemRtl ? 'right' : 'left' }} />
                </View>
              </View>
            );
          })}
        </View>
      );
    case 'step':
      return (
        <View style={{ marginVertical: 20, flexDirection: 'column' }}>
          {(block.items || []).map((item, i) => {
            const isItemRtl = isArabic(prepareInteractiveSyntax(item));
            return (
              <View wrap={false} key={i} style={{ flexDirection: isItemRtl ? 'row-reverse' : 'row', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12, alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: docColors.light, borderWidth: 1, borderColor: docColors.main, justifyContent: 'center', alignItems: 'center', marginLeft: isItemRtl ? 16 : 0, marginRight: isItemRtl ? 0 : 16 }}>
                  <Text style={{ color: docColors.dark, fontWeight: 700, fontSize: 12, fontFamily: 'Inter' }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                   <SaidiRichText text={item} baseStyle={{ fontSize: 11, fontFamily: 'Inter', lineHeight: 1.5, color: '#1e293b', textAlign: isItemRtl ? 'right' : 'left' }} />
                </View>
              </View>
            );
          })}
        </View>
      );
    case 'quote':
      const isQuoteRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 24, padding: 24, backgroundColor: '#fdfbf7', borderWidth: 1, borderColor: '#e5e7eb', borderTopWidth: 4, borderTopColor: docColors.main }}>
          <View style={{ flexDirection: isQuoteRtl ? 'row-reverse' : 'row' }}>
             <Text style={{ fontSize: 40, fontFamily: 'Inter', color: docColors.main, opacity: 0.3, marginTop: -10 }}>&quot;</Text>
             <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
                <SaidiRichText text={content} baseStyle={{ fontSize: 14, fontFamily: 'Inter', fontStyle: 'italic', color: '#1e293b', textAlign: isQuoteRtl ? 'right' : 'left', lineHeight: 1.8 }} />
             </View>
          </View>
        </View>
      );
    case 'vocabulary':
      const vocabIsRtl = isArabic(prepareInteractiveSyntax(block.term || '') + prepareInteractiveSyntax(block.definition || ''));
      return (
        <View wrap={false} style={{ marginVertical: 12, flexDirection: vocabIsRtl ? 'row-reverse' : 'row', alignItems: 'stretch', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <View style={{ width: '30%', backgroundColor: '#f8fafc', padding: 16, justifyContent: 'center', alignItems: vocabIsRtl ? 'flex-end' : 'flex-start', borderRightWidth: vocabIsRtl ? 0 : 1, borderLeftWidth: vocabIsRtl ? 1 : 0, borderColor: '#e2e8f0' }}>
             <SaidiRichText text={block.term || ''} baseStyle={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: docColors.dark, textAlign: vocabIsRtl ? 'right' : 'left', letterSpacing: 0.5 }} />
          </View>
          <View style={{ width: '70%', backgroundColor: '#ffffff', padding: 16, justifyContent: 'center' }}>
             <SaidiRichText text={block.definition || ''} baseStyle={{ fontFamily: 'Inter', fontSize: 11, lineHeight: 1.6, color: '#334155', textAlign: vocabIsRtl ? 'right' : 'left' }} />
          </View>
        </View>
      );
    case 'code':
      return (
        <View wrap={false} style={{ marginVertical: 16, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Text style={{ fontFamily: 'Courier', fontSize: 10, color: '#0369a1', lineHeight: 1.6 }}>
            {content}
          </Text>
        </View>
      );
    case 'summary':
      return (
        <View wrap={false} style={{ marginVertical: 24, padding: 24, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: docColors.main }}>
          <Text style={{ fontSize: 12, color: docColors.dark, fontFamily: getTitleFontFamily(content), fontWeight: 700, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Summary</Text>
           <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#334155', lineHeight: 1.6 }} />
        </View>
      );
    case 'reference':
      return (
        <View wrap={false} style={{ marginVertical: 8, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: '#cbd5e1' }}>
          <Text style={{ fontSize: 9, fontFamily: 'Inter', color: '#64748b' }}>
            Ref: {content}
          </Text>
        </View>
      );
    case 'dialogue':
      return (
        <View wrap={false} style={{ marginVertical: 12, padding: 16, backgroundColor: '#f8fafc', borderRadius: 8, alignSelf: 'flex-start', maxWidth: '80%', borderWidth: 1, borderColor: '#e2e8f0' }}>
           <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#1e293b', lineHeight: 1.5 }} />
        </View>
      );
    case 'flashcard': {
      const frontContent = block.front || content || 'Flashcard';
      const backContent = block.back || '';
      const isCardRtl = isArabic(prepareInteractiveSyntax(frontContent + backContent));
      return (
        <View wrap={false} style={{ marginVertical: 24, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <View style={{ padding: 24, paddingBottom: 16, alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
            <Text style={{ fontSize: 8, color: docColors.main, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontFamily: 'Inter', fontWeight: 700 }}>Flashcard Front</Text>
             <SaidiRichText text={frontContent} baseStyle={{ fontSize: 14, fontFamily: 'Inter', color: '#0f172a', textAlign: 'center', fontWeight: 500, lineHeight: 1.5 }} />
          </View>
          {backContent ? (
            <View style={{ padding: 24, paddingTop: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#f8fafc', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
               <Text style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontFamily: 'Inter', fontWeight: 500 }}>Flashcard Back</Text>
               <SaidiRichText text={backContent} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#475569', textAlign: isCardRtl ? 'right' : 'center', lineHeight: 1.6 }} />
            </View>
          ) : <View />}
        </View>
      );
    }
    case 'caption':
      return (
        <View wrap={false} style={{ marginTop: 8, marginBottom: 16, alignItems: 'center' }}>
           <SaidiRichText text={content} baseStyle={{ fontSize: 9, fontFamily: 'Inter', color: '#475569', textAlign: 'center' }} />
        </View>
      );
    case 'horizontal_rule':
      return <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 32 }} />;
    case 'page_break':
      return <View break />;
    case 'essay_area':
      return (
        <View wrap={false} style={{ marginVertical: 24 }}>
          <Text style={{ fontSize: 11, color: docColors.dark, fontFamily: 'Inter', fontWeight: 700, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{content || "Notes"}</Text>
          <View style={{ height: 200, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', padding: 16 }}>
             {Array.from({ length: 9 }).map((_, i) => (
                <View key={i} style={{ height: 1, backgroundColor: '#f1f5f9', marginTop: Math.max(18, (200 - 32) / 8) }} />
             ))}
          </View>
        </View>
      );
    case 'bento':
    case 'expandable':
    case 'reveal':
    case 'container':
      return (
        <View wrap={false} style={{ marginVertical: 24, padding: 24, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' }}>
          <View style={{ flexDirection: 'column' }}>
            {block.blocks?.map((child, idx) => (
              <View key={idx} style={{ marginBottom: idx === block.blocks!.length - 1 ? 0 : 16 }}>
                 <SaidiBlockRenderer block={child} docColors={docColors} isExam={isExam} />
              </View>
            ))}
          </View>
        </View>
      );
    case 'table':
      return (
        <View wrap={false} style={{ marginVertical: 24, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' }}>
          {block.columns && block.columns.length > 0 ? (
            <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' }}>
              {block.columns.map((col, cIdx) => (
                <View key={cIdx} style={{ flex: 1, paddingHorizontal: 4 }}>
                   <SaidiRichText text={col} baseStyle={{ fontSize: 9, fontWeight: 700, color: docColors.dark, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 1 }} />
                </View>
              ))}
            </View>
          ) : []}
          <View style={{ flexDirection: 'column' }}>
            {(block.rows || []).map((row, rIdx) => (
              <View key={rIdx} style={{ flexDirection: 'row', backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc', padding: 16, borderBottomWidth: rIdx === block.rows!.length - 1 ? 0 : 1, borderColor: '#e2e8f0' }}>
                {row.map((cell, cIdx) => (
                  <View key={cIdx} style={{ flex: 1, paddingHorizontal: 4 }}>
                     <SaidiRichText text={cell} baseStyle={{ fontSize: 11, color: '#334155', fontFamily: 'Inter', lineHeight: 1.5 }} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      );
    case 'image':
      if (!block.imageUrl) return <View />;
      return (
        <View wrap={false} style={{ marginVertical: 24, alignItems: 'center' }}>
          <View style={{ borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Image src={block.imageUrl} style={{ width: 480, height: 'auto', objectFit: 'cover' }} />
          </View>
          {block.imageCaption ? (
            <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 9, color: '#64748b', fontFamily: 'Inter' }}>{block.imageCaption}</Text>
            </View>
          ) : <View />}
        </View>
      );
    default:
      return (
        <View style={{ marginBottom: 8 }}>
           <SaidiRichText text={content} baseStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#334155' }} />
        </View>
      );
  }
};

const SaidiTableOfContents = ({ documents, docColors }: { documents: PdfDocument[], docColors: any }) => {
  const tocItems: { title: string; page: number }[] = [];
  let currentPage = 2; // Cover is 1, TOC is 2

  documents.forEach((doc, idx) => {
    tocItems.push({ title: doc.title || `Document ${idx + 1}`, page: currentPage });
    const blocksCount = doc.blocks.length;
    currentPage += Math.ceil(blocksCount / 5) || 1; 
  });

  return (
    <Page size="A4" style={{ backgroundColor: '#fafaf9', padding: 60, position: 'relative' }}>
      <SaidiBackgroundGraphics colors={docColors} />
      <View style={{ marginBottom: 60, alignItems: 'center' }}>
        <Text style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 500, color: docColors.dark, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>Contents</Text>
        <Text style={{ fontSize: 32, fontFamily: 'Inter', fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Table of Contents</Text>
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
          <Svg width="120" height="15" viewBox="0 0 120 15">
            <Line x1="0" y1="7.5" x2="45" y2="7.5" stroke={docColors.main} strokeWidth="0.5" />
            <Polygon points="60,0 67.5,7.5 60,15 52.5,7.5" fill="none" stroke={docColors.main} strokeWidth="0.5" />
            <Circle cx="60" cy="7.5" r="2" fill={docColors.main} />
            <Line x1="75" y1="7.5" x2="120" y2="7.5" stroke={docColors.main} strokeWidth="0.5" />
          </Svg>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {tocItems.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'dashed', borderColor: '#cbd5e1' }}>
             <Text style={{ fontSize: 14, color: '#334155', fontWeight: 400, fontFamily: 'Inter' }}>{prepareInteractiveSyntax(item.title)}</Text>
            <View style={{ flex: 1 }} />
             <Text style={{ fontSize: 14, fontWeight: 700, color: docColors.main, fontFamily: 'Inter' }}>{String(i + (tocItems.length > 0 ? 3 : 2)).padStart(2, '0')}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
};

const SaidiBackgroundGraphics = ({ colors, isCover = false }: { colors: any, isCover?: boolean }) => (
  <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
    <Defs>
      <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#fafafa" />
        <Stop offset="0.5" stopColor="#ffffff" />
        <Stop offset="1" stopColor="#f8f9fa" />
      </LinearGradient>
      <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={colors.main} stopOpacity="0.4" />
        <Stop offset="0.5" stopColor={colors.light} stopOpacity="1" />
        <Stop offset="1" stopColor={colors.dark} stopOpacity="0.6" />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="595" height="842" fill="url('#bgGrad')" />
    
    {/* Geometric interlocking lines */}
    {/* Full Page lattice mesh */}
    <G opacity="0.04" stroke={colors.main} strokeWidth="0.5">
      {[...Array(20)].map((_, i) => (
        <Line key={`h-${i}`} x1="0" y1={i * 45} x2="595" y2={i * 45 + 15} />
      ))}
      {[...Array(20)].map((_, i) => (
        <Line key={`h2-${i}`} x1="0" y1={i * 45 + 15} x2="595" y2={i * 45} />
      ))}
      {[...Array(15)].map((_, i) => (
        <Line key={`v-${i}`} x1={i * 45} y1="0" x2={i * 45 + 15} y2="842" />
      ))}
      {[...Array(15)].map((_, i) => (
        <Line key={`v2-${i}`} x1={i * 45 + 15} y1="0" x2={i * 45} y2="842" />
      ))}
    </G>
    <Line x1="0" y1="200" x2="595" y2="200" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
    <Line x1="0" y1="642" x2="595" y2="642" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
    <Line x1="150" y1="0" x2="150" y2="842" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
    <Line x1="445" y1="0" x2="445" y2="842" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />

    {/* Intricate Background grids and faint circles */}
    <Circle cx="297.5" cy="421" r="350" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.05" strokeDasharray="1, 8" />
    <Circle cx="297.5" cy="421" r="300" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.1" strokeDasharray="2, 6" />
    <Circle cx="297.5" cy="421" r="280" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.15" />
    <Circle cx="297.5" cy="421" r="260" fill="none" stroke={colors.border} strokeWidth="1" opacity="0.05" />
    <Circle cx="297.5" cy="421" r="240" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.1" strokeDasharray="10,20" />
    
    <Circle cx="0" cy="0" r="200" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.15" strokeDasharray="10,5" />
    <Circle cx="0" cy="0" r="150" fill="none" stroke="url('#goldGrad')" strokeWidth="1" opacity="0.3" />
    <Circle cx="0" cy="0" r="130" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.15" strokeDasharray="4,4" />
    <Circle cx="0" cy="0" r="100" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.2" />
    <Circle cx="0" cy="0" r="80" fill="none" stroke={colors.main} strokeWidth="1" opacity="0.1" strokeDasharray="2,8" />
    <Circle cx="0" cy="0" r="50" fill="none" stroke={colors.dark} strokeWidth="0.5" opacity="0.2" />

    <Circle cx="595" cy="842" r="250" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.1" strokeDasharray="5,15" />
    <Circle cx="595" cy="842" r="200" fill="none" stroke={colors.main} strokeWidth="1" opacity="0.1" />
    <Circle cx="595" cy="842" r="180" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3" strokeDasharray="3,6" />
    <Circle cx="595" cy="842" r="160" fill="none" stroke="url('#goldGrad')" strokeWidth="0.5" opacity="0.2" />
    <Circle cx="595" cy="842" r="120" fill="none" stroke={colors.main} strokeWidth="0.75" opacity="0.15" strokeDasharray="4,12" />
    <Circle cx="595" cy="842" r="80" fill="none" stroke={colors.dark} strokeWidth="0.5" opacity="0.2" />

    <Circle cx="595" cy="0" r="160" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.15" strokeDasharray="4,8" />
    <Circle cx="595" cy="0" r="150" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.1" strokeDasharray="2,10" />
    <Circle cx="595" cy="0" r="120" fill="none" stroke="url('#goldGrad')" strokeWidth="1" opacity="0.2" />
    <Circle cx="595" cy="0" r="100" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
    <Circle cx="595" cy="0" r="70" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2" />
    
    <Circle cx="0" cy="842" r="180" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.15" strokeDasharray="4,8" />
    <Circle cx="0" cy="842" r="150" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.1" strokeDasharray="2,10" />
    <Circle cx="0" cy="842" r="120" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
    <Circle cx="0" cy="842" r="100" fill="none" stroke="url('#goldGrad')" strokeWidth="1" opacity="0.2" />
    <Circle cx="0" cy="842" r="60" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.2" strokeDasharray="1,5" />

    {/* Arch shapes */}
    {isCover && (
      <>
        <Path d="M 50,842 L 50,700 C 50,600 150,550 297.5,550 C 445,550 545,600 545,700 L 545,842" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.6" />
        <Path d="M 70,842 L 70,720 C 70,630 160,580 297.5,580 C 435,580 525,630 525,720 L 525,842" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" strokeDasharray="4,4" />
        <Path d="M 90,842 L 90,740 C 90,660 170,610 297.5,610 C 425,610 505,660 505,740 L 505,842" fill="none" stroke={colors.dark} strokeWidth="1" opacity="0.1" />
        
        {/* Top arches */}
        <Path d="M 50,0 L 50,142 C 50,242 150,292 297.5,292 C 445,292 545,242 545,142 L 545,0" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
        <Path d="M 80,0 L 80,122 C 80,202 165,242 297.5,242 C 430,242 515,202 515,122 L 515,0" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.2" strokeDasharray="6,6" />
      </>
    )}
    
    {/* Frame lines inside */}
    <Rect x="20" y="20" width="555" height="802" fill="none" stroke="url('#goldGrad')" strokeWidth="2" opacity="0.4" />
    <Rect x="23" y="23" width="549" height="796" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" />
    <Rect x="26" y="26" width="543" height="790" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />
    <Rect x="30" y="30" width="535" height="782" fill="none" stroke={colors.border} strokeWidth="1" opacity="0.4" />
    <Rect x="34" y="34" width="527" height="774" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.15" />
    <Rect x="40" y="40" width="515" height="762" fill="none" stroke={colors.dark} strokeWidth="0.5" opacity="0.1" />
    <Rect x="44" y="44" width="507" height="754" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.05" strokeDasharray="3,3" />
    
    {/* Diagonal lines in corner */}
    <Path d="M 15,35 L 35,15" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 20,40 L 40,20" fill="none" stroke="url('#goldGrad')" strokeWidth="1.5" opacity="0.7" />
    <Path d="M 25,45 L 45,25" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    
    <Path d="M 580,35 L 560,15" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 575,40 L 555,20" fill="none" stroke="url('#goldGrad')" strokeWidth="1.5" opacity="0.7" />
    <Path d="M 570,45 L 550,25" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    
    <Path d="M 15,807 L 35,827" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 20,802 L 40,822" fill="none" stroke="url('#goldGrad')" strokeWidth="1.5" opacity="0.7" />
    <Path d="M 25,797 L 45,817" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    
    <Path d="M 580,807 L 560,827" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 575,802 L 555,822" fill="none" stroke="url('#goldGrad')" strokeWidth="1.5" opacity="0.7" />
    <Path d="M 570,797 L 550,817" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />

    <Path d="M 15,45 L 45,15" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 580,45 L 550,15" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 15,797 L 45,827" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
    <Path d="M 580,797 L 550,827" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
    
    {/* Double corner accents */}
    <Path d="M 26,46 L 46,26" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" />
    <Path d="M 569,46 L 549,26" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" />
    <Path d="M 26,796 L 46,816" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" />
    <Path d="M 569,796 L 549,816" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" />

    {/* Islamic / Arabesque inspired star patterns (Subtle background tile) */}
    {[0, 1, 2, 3, 4, 5].map((y) => (
      [0, 1, 2, 3].map((x) => (
        <G key={`star-${x}-${y}`} transform={`translate(${x * 150 + 75}, ${y * 150 + 46})`} opacity="0.05">
          <Polygon points="0,-30 10,-10 30,0 10,10 0,30 -10,10 -30,0 -10,-10" fill="none" stroke={colors.main} strokeWidth="1" />
          <Polygon points="-21,-21 0,-15 21,-21 15,0 21,21 0,15 -21,21 -15,0" fill="none" stroke={colors.border} strokeWidth="0.5" />
          <Circle cx="0" cy="0" r="15" fill="none" stroke={colors.dark} strokeWidth="0.5" strokeDasharray="2,2" />
          <Circle cx="0" cy="0" r="4" fill={colors.main} />
        </G>
      ))
    ))}

    {/* Extra decorative elements */}
    <Circle cx="150" cy="200" r="3" fill={colors.main} opacity="0.5" />
    <Circle cx="150" cy="200" r="6" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.6" />
    <Circle cx="150" cy="200" r="12" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.4" strokeDasharray="1,2" />
    <Circle cx="150" cy="200" r="20" fill="none" stroke={colors.border} strokeWidth="0.25" opacity="0.2" />
    <Line x1="130" y1="200" x2="170" y2="200" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Line x1="150" y1="180" x2="150" y2="220" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Path d="M 140,190 L 160,210 M 140,210 L 160,190" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />

    <Circle cx="445" cy="200" r="3" fill={colors.main} opacity="0.5" />
    <Circle cx="445" cy="200" r="6" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.6" />
    <Circle cx="445" cy="200" r="12" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.4" strokeDasharray="1,2" />
    <Circle cx="445" cy="200" r="20" fill="none" stroke={colors.border} strokeWidth="0.25" opacity="0.2" />
    <Line x1="425" y1="200" x2="465" y2="200" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Line x1="445" y1="180" x2="445" y2="220" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Path d="M 435,190 L 455,210 M 435,210 L 455,190" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />

    <Circle cx="150" cy="642" r="3" fill={colors.main} opacity="0.5" />
    <Circle cx="150" cy="642" r="6" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.6" />
    <Circle cx="150" cy="642" r="12" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.4" strokeDasharray="1,2" />
    <Circle cx="150" cy="642" r="20" fill="none" stroke={colors.border} strokeWidth="0.25" opacity="0.2" />
    <Line x1="130" y1="642" x2="170" y2="642" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Line x1="150" y1="622" x2="150" y2="662" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Path d="M 140,632 L 160,652 M 140,652 L 160,632" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />

    <Circle cx="445" cy="642" r="3" fill={colors.main} opacity="0.5" />
    <Circle cx="445" cy="642" r="6" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.6" />
    <Circle cx="445" cy="642" r="12" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.4" strokeDasharray="1,2" />
    <Circle cx="445" cy="642" r="20" fill="none" stroke={colors.border} strokeWidth="0.25" opacity="0.2" />
    <Line x1="425" y1="642" x2="465" y2="642" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Line x1="445" y1="622" x2="445" y2="662" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
    <Path d="M 435,632 L 455,652 M 435,652 L 455,632" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />

    {/* Elegant Content framing when not a cover page */}
    {!isCover && (
      <>
        <Path d="M 30,50 L 565,50" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
        <Path d="M 30,792 L 565,792" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
        <Line x1="150" y1="20" x2="150" y2="40" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
        <Line x1="445" y1="20" x2="445" y2="40" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
        <Line x1="150" y1="802" x2="150" y2="822" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
        <Line x1="445" y1="802" x2="445" y2="822" stroke={colors.main} strokeWidth="0.5" opacity="0.4" />
        <Circle cx="297.5" cy="40" r="10" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.4" strokeDasharray="2,2" />
        <Circle cx="297.5" cy="40" r="15" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
        <Circle cx="297.5" cy="802" r="10" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.4" strokeDasharray="2,2" />
        <Circle cx="297.5" cy="802" r="15" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
        <Line x1="282.5" y1="40" x2="312.5" y2="40" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
        <Line x1="282.5" y1="802" x2="312.5" y2="802" stroke={colors.main} strokeWidth="0.25" opacity="0.4" />
      </>
    )}

    {/* Concentric diamond in center for cover only */}
    {isCover && (
      <>
        {/* Outer complex star/diamond */}
        <Polygon points="297.5,100 490,300 297.5,500 105,300" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.1" />
        <Polygon points="297.5,120 475,300 297.5,480 120,300" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
        <Polygon points="297.5,140 460,300 297.5,460 135,300" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.3" />
        
        {/* Intersecting squares and inner diamond */}
        <Polygon points="247.5,250 347.5,250 347.5,350 247.5,350" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />
        <Polygon points="262.5,265 332.5,265 332.5,335 262.5,335" fill="none" stroke={colors.dark} strokeWidth="0.5" opacity="0.1" />
        
        <Polygon points="297.5,200 400,300 297.5,400 195,300" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.6" />
        <Polygon points="297.5,180 420,300 297.5,420 175,300" fill="none" stroke="url('#goldGrad')" strokeWidth="1" opacity="0.3" strokeDasharray="3,3" />
        <Polygon points="297.5,220 380,300 297.5,380 215,300" fill="none" stroke={colors.dark} strokeWidth="0.5" opacity="0.15" />
        
        {/* Intricate surrounding circles */}
        <Circle cx="297.5" cy="300" r="140" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.2" strokeDasharray="5,10" />
        <Circle cx="297.5" cy="300" r="120" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
        <Circle cx="297.5" cy="300" r="110" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.15" strokeDasharray="2,4" />
        <Circle cx="297.5" cy="300" r="100" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.15" />
        
        {/* Subtle center cross extending out */}
        <Line x1="297.5" y1="80" x2="297.5" y2="520" stroke={colors.main} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,8" />
        <Line x1="50" y1="300" x2="545" y2="300" stroke={colors.main} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,8" />
        
        <Line x1="297.5" y1="120" x2="297.5" y2="480" stroke={colors.border} strokeWidth="1" opacity="0.15" />
        <Line x1="100" y1="300" x2="495" y2="300" stroke={colors.border} strokeWidth="1" opacity="0.15" />
        
        {/* Starburst rays */}
        <Line x1="170" y1="172.5" x2="425" y2="427.5" stroke={colors.main} strokeWidth="0.25" opacity="0.2" strokeDasharray="2,6" />
        <Line x1="170" y1="427.5" x2="425" y2="172.5" stroke={colors.main} strokeWidth="0.25" opacity="0.2" strokeDasharray="2,6" />
        <Line x1="227.5" y1="230" x2="367.5" y2="370" stroke={colors.main} strokeWidth="0.5" opacity="0.3" strokeDasharray="1,4" />
        <Line x1="227.5" y1="370" x2="367.5" y2="230" stroke={colors.main} strokeWidth="0.5" opacity="0.3" strokeDasharray="1,4" />
        
        <Circle cx="297.5" cy="300" r="4" fill={colors.main} opacity="0.7" />
        <Circle cx="297.5" cy="300" r="8" fill="none" stroke={colors.border} strokeWidth="1" opacity="0.8" />
        <Circle cx="297.5" cy="300" r="12" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" strokeDasharray="1,2" />
        <Circle cx="297.5" cy="300" r="20" fill="none" stroke={colors.main} strokeWidth="0.25" opacity="0.2" />
        
        {/* Lower intricate border area for cover details */}
        <Polygon points="197.5,600 397.5,600 397.5,620 197.5,620" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.4" />
        <Line x1="207.5" y1="610" x2="387.5" y2="610" stroke={colors.main} strokeWidth="0.5" opacity="0.6" strokeDasharray="4,4" />
        <Circle cx="297.5" cy="610" r="8" fill="#ffffff" />
        <Circle cx="297.5" cy="610" r="4" fill="none" stroke={colors.main} strokeWidth="1" opacity="0.8" />
        <Circle cx="297.5" cy="610" r="8" fill="none" stroke={colors.border} strokeWidth="0.5" />
      </>
    )}
  </Svg>
);

export const ReactPdfOutputSaidi = ({ 
  documents, 
  themeColor, 
  includeToc = true,
  includeCover = true,
  isExam = false
}: { 
  documents: PdfDocument[]; 
  themeColor: string; 
  includeToc?: boolean;
  includeCover?: boolean;
  isExam?: boolean;
}) => {
  // Saidi relies heavily on Gold/Bronze accents. We can adapt if necessary, but force Gold/Silver/Bronze tones.
  const getColorsForDoc = () => {
    // Light premium tones
    return { main: "#b45309", light: "#fef3c7", dark: "#78350f", bgLight: "#fffbeb", border: "#fde68a" };
  };

  const tColors = getColorsForDoc();

  return (
    <Document title="Document Export" author="System">
      {includeCover ? (
        <Page size="A4" style={{ backgroundColor: '#ffffff', position: 'relative' }}>
          {/* Subtle premium textures/gradients */}
          <SaidiBackgroundGraphics colors={tColors} isCover={true} />
          
          <View style={{ flex: 1, padding: 60, justifyContent: 'center', alignItems: 'center' }}>
             <View style={{ width: '100%', alignItems: 'center', marginBottom: 50, marginTop: 180 }}>
                <Svg width="60" height="60" viewBox="0 0 60 60">
                  <Path d="M 30,0 L 40,20 L 60,30 L 40,40 L 30,60 L 20,40 L 0,30 L 20,20 Z" fill={tColors.light} fillOpacity="0.4" stroke={tColors.main} strokeWidth="1" />
                  <Path d="M 30,10 L 35,25 L 50,30 L 35,35 L 30,50 L 25,35 L 10,30 L 25,25 Z" fill={tColors.main} fillOpacity="0.8" />
                  <Circle cx="30" cy="30" r="5" fill="#ffffff" />
                  <Circle cx="30" cy="30" r="2" fill={tColors.dark} />
                </Svg>
             </View>

            <View style={{ width: '100%', alignItems: 'center', backgroundColor: '#ffffff90', padding: 30, borderTopWidth: 1, borderBottomWidth: 1, borderColor: tColors.border, position: 'relative' }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
                 <Svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <Line x1="10" y1="10" x2="490" y2="10" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="2,4" opacity="0.3" />
                    <Line x1="10" y1="190" x2="490" y2="190" stroke={tColors.main} strokeWidth="0.5" strokeDasharray="2,4" opacity="0.3" />
                    <Rect x="5" y="5" width="490" height="190" fill="none" stroke={tColors.border} strokeWidth="1" opacity="0.2" />
                 </Svg>
              </View>

              <Text style={{ fontSize: 10, color: tColors.dark, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 6, marginBottom: 24, textAlign: 'center' }}>
                {isExam ? 'Official Assessment' : 'Executive Module'}
              </Text>
              <Text style={{ fontSize: 44, color: '#0f172a', fontFamily: 'Inter', fontWeight: 700, lineHeight: 1.1, textAlign: 'center', marginBottom: 32 }}>
                {documents.length > 0 ? documents[0].title : 'Untitled Document'}
              </Text>
              
              <View style={{ width: '100%', alignItems: 'center', marginBottom: 32 }}>
                <Svg width="120" height="15" viewBox="0 0 120 15">
                  <Line x1="0" y1="7.5" x2="45" y2="7.5" stroke={tColors.main} strokeWidth="0.5" />
                  <Polygon points="60,0 67.5,7.5 60,15 52.5,7.5" fill="none" stroke={tColors.main} strokeWidth="0.5" />
                  <Circle cx="60" cy="7.5" r="2" fill={tColors.main} />
                  <Line x1="75" y1="7.5" x2="120" y2="7.5" stroke={tColors.main} strokeWidth="0.5" />
                </Svg>
              </View>
              {(documents[0] as any)?.metadata?.description ? (
                <Text style={{ fontSize: 13, color: '#475569', fontFamily: 'Inter', lineHeight: 1.6, textAlign: 'center', paddingHorizontal: 40 }}>
                   {(documents[0] as any).metadata.description}
                </Text>
              ) : <View />}
            </View>
          </View>
        </Page>
      ) : []}

      {includeToc && documents.length > 1 ? <SaidiTableOfContents documents={documents} docColors={tColors} /> : null}

      {documents.map((doc, dIdx) => (
        <Page key={dIdx} size="A4" style={{ backgroundColor: '#ffffff', padding: 60, paddingBottom: 80, position: 'relative' }}>
          <SaidiBackgroundGraphics colors={tColors} />
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
             <Text style={{ fontSize: 9, color: tColors.dark, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12 }}>
              Chapter {String((dIdx + 1)).padStart(2, '0')}
            </Text>
             <Text style={{ fontSize: 28, color: '#0f172a', fontFamily: 'Inter', fontWeight: 700, textAlign: 'center', marginBottom: 20 }}>
              {doc.title}
             </Text>
             <View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
                <Svg width="160" height="15" viewBox="0 0 160 15">
                  <Line x1="0" y1="7.5" x2="65" y2="7.5" stroke={tColors.main} strokeWidth="0.5" />
                  <Polygon points="80,0 87.5,7.5 80,15 72.5,7.5" fill="none" stroke={tColors.main} strokeWidth="0.5" />
                  <Circle cx="80" cy="7.5" r="2" fill={tColors.main} />
                  <Line x1="95" y1="7.5" x2="160" y2="7.5" stroke={tColors.main} strokeWidth="0.5" />
                </Svg>
             </View>
          </View>

          {doc.blocks.map((block, bIdx) => (
             <SaidiBlockRenderer key={bIdx} block={block} docColors={tColors} isExam={isExam} />
          ))}

          {/* Footer */}
          <View fixed style={{ position: 'absolute', bottom: 40, left: 60, right: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16 }}>
              <Text style={{ fontSize: 9, color: '#64748b', fontFamily: 'Inter', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>{doc.title}</Text>
              <Text style={{ fontSize: 10, color: tColors.main, fontFamily: 'Inter', fontWeight: 700 }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
};
