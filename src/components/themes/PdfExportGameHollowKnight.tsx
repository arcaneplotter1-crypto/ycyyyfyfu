import React from 'react';
import { PdfDocument, PdfBlock } from '../../types';
import { Document, Page, Text, View, Image, Svg, Path, Line, Circle, Rect, Polygon, Font, Defs, LinearGradient, Stop, G } from '@react-pdf/renderer';
import { THEMES } from '../../constants/themes';

// Register Cinzel for elegant headings
Font.register({
  family: 'Cinzel',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnfY3lCA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-jHgfY3lCA.ttf', fontWeight: 700 }
  ]
});

// Register Cormorant Garamond for main body text
Font.register({
  family: 'Cormorant Garamond',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnTOjw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jD-iNM5.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_hg9KnTOjw.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd5FTf-iNM5.ttf', fontWeight: 700, fontStyle: 'italic' }
  ]
});

// Cairo for Arabic
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-a1PiKQ.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5a1PiKQ.ttf', fontWeight: 700 }
  ]
});

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
const getHeadingFont = (text: string) => isArabic(text) ? 'Cairo' : 'Cinzel';
const getBodyFont = (text: string) => isArabic(text) ? 'Cairo' : 'Cormorant Garamond';

const prepareInteractiveSyntax = (text: string) => {
  if (!text) return "";
  let t = String(text);
  t = t.replace(/<term\s+title=(?:'|")([^'"]+)(?:'|")[^>]*>([\s\S]*?)<\/term>/g, "**$2**");
  t = t.replace(/<term[^>]*>([\s\S]*?)<\/term>/g, "**$1**");
  t = t.replace(/\{\{(.*?)\|(.*?)\}\}/g, "**$1** ($2)");
  t = t.replace(/!!(.*?)\|(.*?)!!/g, "**$1** ($2)");
  t = t.replace(/>>(.*?)\|(.*?)<</g, "**$1**: $2");
  t = t.replace(/\(\((.*?)\|(.*?)\)\)/g, "_$2_");
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

const HollowKnightRichText = ({ text, baseStyle, isHeading = false, docColors }: { text: string; baseStyle: any; isHeading?: boolean; docColors?: any }): any => {
  if (!text) return <Text style={baseStyle}>{" "}</Text>;
  const processed = prepareInteractiveSyntax(text);
  const parts = processed.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==)/g);

  const defaultFont = isHeading ? getHeadingFont(processed) : getBodyFont(processed);

  if (parts.length === 1 && !processed.match(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|==.*?==)/)) {
    return <Text style={{ ...baseStyle, fontFamily: defaultFont }}>{processed}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {parts.filter(Boolean).map((part, i) => {
        let style: any = {
          ...baseStyle,
          fontWeight: baseStyle?.fontWeight || 400,
          color: baseStyle?.color || '#D8DCE6', 
          fontFamily: isHeading ? getHeadingFont(part) : getBodyFont(part)
        };

        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
          const content = part.slice(2, -2);
          return <HollowKnightRichText key={i} isHeading={isHeading} text={content} baseStyle={{ ...style, fontWeight: 700, color: '#FFFFFF' }} docColors={docColors} />;
        } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
          const content = part.slice(1, -1);
          return <HollowKnightRichText key={i} isHeading={isHeading} text={content} baseStyle={{ ...style, fontStyle: 'italic', color: '#B0C4DE' }} docColors={docColors} />;
        } else if (part.startsWith('==') && part.endsWith('==')) {
          const content = part.slice(2, -2);
          return <HollowKnightRichText key={i} isHeading={isHeading} text={content} baseStyle={{ ...style, backgroundColor: docColors?.primary || '#A1B5C1', color: '#0F141E', paddingVertical: 1, paddingHorizontal: 4 }} docColors={docColors} />;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          const content = part.slice(1, -1);
          style.fontFamily = 'Courier';
          style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          style.color = docColors?.secondary || '#E2E8F0';
          return <Text key={i} style={style}>{content}</Text>;
        }

        return <Text key={i} style={style}>{part}</Text>;
      })}
    </Text>
  );
};

const FiligreeCorner = ({ x, y, rotation = 0, scale = 1, color = "#4A5568" }: { x: number, y: number, rotation?: number, scale?: number, color?: string }) => (
  <G transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
    {/* Inspired by hollow knight's ornate cast iron / filigree designs */}
    <Path d="M0,0 C10,-10 20,-5 25,10 C27,15 25,25 20,30 C12,38 0,35 -5,25 C-10,15 -5,5 0,0 Z" fill="none" stroke={color} strokeWidth="1" />
    <Path d="M0,0 C15,0 30,10 40,25 C45,32 42,45 35,50 C25,58 10,50 5,35" fill="none" stroke={color} strokeWidth="1.5" />
    <Path d="M0,0 C-10,-5 -20,5 -15,20 C-10,35 5,40 15,35" fill="none" stroke={color} strokeWidth="1" />
    <Circle cx="20" cy="18" r="2" fill={color} />
    <Circle cx="8" cy="35" r="1.5" fill={color} />
  </G>
);

const FiligreeDivider = ({ color = "#4A5568", width = 200 }: { color?: string, width?: number }) => (
  <Svg width={width} height="30" viewBox={`0 0 ${width} 30`}>
    <Path d={`M${width/2 - 50},15 Q${width/2},5 ${width/2 + 50},15 Q${width/2},25 ${width/2 - 50},15 Z`} fill="none" stroke={color} strokeWidth="1" />
    <Line x1="0" y1="15" x2={width/2 - 60} y2="15" stroke={color} strokeWidth="0.5" />
    <Line x1={width/2 + 60} y1="15" x2={width} y2="15" stroke={color} strokeWidth="0.5" />
    <Circle cx={width/2} cy="15" r="3" fill={color} />
    <Circle cx={width/2 - 80} cy="15" r="1.5" fill={color} />
    <Circle cx={width/2 + 80} cy="15" r="1.5" fill={color} />
  </Svg>
);

const GothicArch = ({ x, y, scale = 1, color = "#2C3545", opacity = 0.3, rotation = 0 }: any) => (
  <G transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`}>
     <Path d="M 0 0 L 0 -100 C 20 -150 50 -150 70 -100 L 70 0 Z" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
     <Path d="M 10 0 L 10 -95 C 25 -140 45 -140 60 -95 L 60 0 Z" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity} />
     <Line x1="35" y1="0" x2="35" y2="-120" stroke={color} strokeWidth="1" opacity={opacity} />
     <Circle cx="35" cy="-120" r="5" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
     <Path d="M 35 -120 L 25 -100 L 45 -100 Z" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity} />
  </G>
);

const HangingLamp = ({ x, y, scale = 1, color = "#A8B9C8", glow = "#D4E4F0" }: any) => (
  <G transform={`translate(${x}, ${y}) scale(${scale})`}>
     <Line x1="0" y1="0" x2="0" y2="80" stroke={color} strokeWidth="1" opacity="0.3" />
     <Line x1="-2" y1="20" x2="2" y2="20" stroke={color} strokeWidth="1" opacity="0.5" />
     <Line x1="-3" y1="50" x2="3" y2="50" stroke={color} strokeWidth="1" opacity="0.5" />
     
     {/* Lamp Housing */}
     <Path d="M -10 80 L 10 80 L 14 100 L 10 115 L -10 115 L -14 100 Z" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
     <Path d="M -10 80 L 0 70 L 10 80" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
     <Circle cx="0" cy="68" r="2" fill={color} opacity="0.6"/>
     <Line x1="-10" y1="80" x2="-10" y2="115" stroke={color} strokeWidth="0.5" opacity="0.5" />
     <Line x1="10" y1="80" x2="10" y2="115" stroke={color} strokeWidth="0.5" opacity="0.5" />
     
     {/* Glow */}
     <Circle cx="0" cy="100" r="8" fill={glow} opacity="0.4" />
     <Circle cx="0" cy="100" r="25" fill={glow} opacity="0.08" />
     <Circle cx="0" cy="100" r="45" fill={glow} opacity="0.03" />
  </G>
);

const Thorns = ({ x, y, scale = 1, flip = false, color = "#2C3545", opacity = 0.6 }: any) => (
  <G transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`}>
     <Path d="M 0 0 C 20 50 10 100 30 150 C 40 180 20 250 50 300 C 70 340 40 400 80 450 C 90 480 60 520 100 550" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity} />
     <Path d="M -5 -20 C 10 40 -5 90 15 140 C 25 180 0 240 30 290 C 45 330 15 390 60 440" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 0.7} />
     
     {/* Thorns */}
     <Path d="M 5 25 L 15 15 M 15 70 L 25 55 M 12 110 L -2 115 M 25 150 L 35 135 M 23 180 L 12 195 M 35 250 L 45 235 M 35 280 L 20 295 M 50 340 L 65 325 M 45 370 L 30 380 M 65 420 L 78 405 M 70 480 L 50 495" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
  </G>
);

const GeoCrystal = ({ x, y, scale = 1, color = "#D4E4F0", opacity = 0.4, rotation = 0 }: any) => (
  <G transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`} opacity={opacity}>
     <Path d="M 0 -20 L 10 0 L 0 30 L -10 0 Z" fill="none" stroke={color} strokeWidth="1" />
     <Line x1="0" y1="-20" x2="0" y2="30" stroke={color} strokeWidth="0.5" />
     <Line x1="-10" y1="0" x2="10" y2="0" stroke={color} strokeWidth="0.5" />
     
     <Path d="M 12 -5 L 20 5 L 10 20 L 5 5 Z" fill="none" stroke={color} strokeWidth="0.5" />
     <Path d="M -15 2 L -8 15 L -20 25 L -25 10 Z" fill="none" stroke={color} strokeWidth="0.5" />
  </G>
);

const OrganicRoots = ({ x, y, scale = 1, color = "#2C3545", opacity = 0.5 }: any) => (
  <G transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
     <Path d="M 0 0 C 10 30 -10 60 20 100 C 40 130 10 180 30 220 C 20 250 40 280 15 320" fill="none" stroke={color} strokeWidth="2" />
     <Path d="M 5 10 C 25 40 5 80 35 120 C 50 140 20 200 45 240 C 35 270 55 300 30 340" fill="none" stroke={color} strokeWidth="1" />
     <Path d="M 0 0 C -20 40 -40 60 -30 100 C -20 140 -50 180 -40 230 C -50 260 -30 290 -55 330" fill="none" stroke={color} strokeWidth="1.5" />
     
     {/* small branches */}
     <Path d="M 15 70 Q 30 80 40 70 M -12 40 Q -30 50 -45 40 M 25 160 Q 40 170 55 150 M -35 150 Q -50 160 -60 140" fill="none" stroke={color} strokeWidth="0.5" />
  </G>
);

const WroughtIronGate = ({ x, y, width = 100, height = 300, color = "#2C3545", opacity = 0.15 }: any) => {
  const bars = Array.from({ length: Math.floor(width / 20) }, (_, i) => i * 20);
  return (
    <G transform={`translate(${x}, ${y})`} opacity={opacity}>
      {bars.map((bx) => (
        <G key={`bar_${bx}`} transform={`translate(${bx}, 0)`}>
          <Line x1="0" y1="0" x2="0" y2={height} stroke={color} strokeWidth="2" />
          <Path d="M -4 10 L 0 0 L 4 10 Z" fill={color} />
          <Circle cx="0" cy="40" r="3" fill="none" stroke={color} strokeWidth="1" />
          <Circle cx="0" cy={height - 40} r="3" fill="none" stroke={color} strokeWidth="1" />
        </G>
      ))}
      <Line x1="-10" y1="40" x2={width + 10} y2="40" stroke={color} strokeWidth="3" />
      <Line x1="-10" y1={height - 40} x2={width + 10} y2={height - 40} stroke={color} strokeWidth="3" />
      
      {/* Decorative crosses between bars */}
      {bars.slice(0, -1).map((bx) => (
        <G key={`cross_${bx}`} transform={`translate(${bx + 10}, 80)`}>
           <Path d="M -6 -6 L 6 6 M -6 6 L 6 -6" stroke={color} strokeWidth="1" />
        </G>
      ))}
      {bars.slice(0, -1).map((bx) => (
        <G key={`cross2_${bx}`} transform={`translate(${bx + 10}, ${height - 80})`}>
           <Path d="M -6 -6 L 6 6 M -6 6 L 6 -6" stroke={color} strokeWidth="1" />
        </G>
      ))}
    </G>
  );
};

const HKBackgroundGraphics = ({ colors, isCover = false }: { colors: any, isCover?: boolean }) => {
  return (
    <Svg fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.bgDarker || "#0A0B10"} />
          <Stop offset="0.4" stopColor={colors.bgLight || "#151821"} />
          <Stop offset="1" stopColor={colors.bgDarker || "#0A0B10"} />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width="595" height="842" fill="url('#bgGrad')" />
      
      {/* Background Gate / Fences */}
      <WroughtIronGate x="60" y="200" width="160" height="400" color={colors.border} opacity="0.1" />
      <WroughtIronGate x="400" y="250" width="140" height="350" color={colors.border} opacity="0.1" />

      {/* Structural Arches */}
      <G opacity="0.3">
        <GothicArch x="40" y="842" scale={1.5} color={colors.border} />
        <GothicArch x="250" y="842" scale={1.5} color={colors.border} />
        <GothicArch x="450" y="842" scale={1.5} color={colors.border} />
      </G>
      <G opacity="0.15">
        <GothicArch x="150" y="842" scale={2} color={colors.border} />
        <GothicArch x="350" y="842" scale={2} color={colors.border} />
      </G>

      {/* Creeping Thorns / Vines on the edges */}
      <Thorns x="25" y="0" color={colors.border} opacity="0.4" />
      <Thorns x="570" y="200" flip={true} color={colors.border} opacity="0.3" />
      
      {/* Organic Roots hanging from the ceiling */}
      <OrganicRoots x="120" y="-50" color={colors.border} opacity="0.3" />
      <OrganicRoots x="450" y="-80" scale={0.8} color={colors.border} opacity="0.25" />
      <OrganicRoots x="300" y="-20" scale={0.6} color={colors.border} opacity="0.2" />

      {/* Crystals on the ground */}
      <GeoCrystal x="80" y="800" scale={1.5} color={colors.highlight} opacity={0.15} />
      <GeoCrystal x="120" y="820" scale={0.8} color={colors.highlight} opacity={0.1} />
      <GeoCrystal x="500" y="790" scale={1.2} color={colors.highlight} opacity={0.15} rotation={15} />

      {/* Floating particles/wisps in background */}
      <Circle cx="150" cy="200" r="1.5" fill={colors.primary} opacity="0.3" />
      <Circle cx="80" cy="450" r="2.5" fill={colors.secondary} opacity="0.2" />
      <Circle cx="400" cy="120" r="1" fill="#FFFFFF" opacity="0.4" />
      <Circle cx="500" cy="600" r="3" fill={colors.secondary} opacity="0.15" />
      <Circle cx="250" cy="750" r="2" fill={colors.highlight} opacity="0.25" />
      <Circle cx="350" cy="350" r="1.5" fill="#FFFFFF" opacity="0.2" />
      <Circle cx="480" cy="300" r="2" fill={colors.highlight} opacity="0.15" />
      <Circle cx="120" cy="650" r="1" fill={colors.primary} opacity="0.2" />
      <Circle cx="300" cy="150" r="2" fill={colors.secondary} opacity="0.25" />
      <Circle cx="180" cy="380" r="1.5" fill="#FFFFFF" opacity="0.3" />
      <Circle cx="450" cy="480" r="2.5" fill={colors.primary} opacity="0.2" />
      <Circle cx="380" cy="700" r="1" fill={colors.secondary} opacity="0.15" />
      <Circle cx="550" cy="100" r="2" fill={colors.highlight} opacity="0.3" />
      <Circle cx="50" cy="550" r="1.5" fill={colors.primary} opacity="0.25" />
      <Circle cx="220" cy="280" r="3" fill={colors.secondary} opacity="0.1" />
      
      {/* Background Cobwebs / Lines */}
      <Path d="M 20 20 Q 80 50 150 20 M 20 60 Q 70 80 120 60 M 20 100 Q 50 110 80 100" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
      <Path d="M 575 20 Q 515 50 445 20 M 575 60 Q 525 80 475 60" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3" />
      <Path d="M 20 780 Q 90 730 140 820 M 20 740 Q 60 710 100 780" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.25" />
      <Path d="M 575 750 Q 500 700 450 820 M 575 710 Q 510 680 470 750" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.25" />

      {/* Ambient Lamps */}
      {!isCover && (
        <G>
           <HangingLamp x="65" y="0" scale={0.7} color={colors.secondary} glow={colors.highlight} />
           <HangingLamp x="530" y="250" scale={0.5} color={colors.secondary} glow={colors.highlight} />
           <HangingLamp x="380" y="0" scale={0.4} color={colors.secondary} glow={colors.highlight} />
        </G>
      )}

      {/* Frame Border */}
      <Rect x="20" y="20" width="555" height="802" fill="none" stroke={colors.border || "#2C3545"} strokeWidth="1" />
      <Rect x="25" y="25" width="545" height="792" fill="none" stroke={colors.border || "#2C3545"} strokeWidth="0.5" />
      
      {/* Corner Filigrees */}
      <FiligreeCorner x={35} y={35} rotation={0} color={colors.primary} scale={0.8} />
      <FiligreeCorner x={560} y={35} rotation={90} color={colors.primary} scale={0.8} />
      <FiligreeCorner x={560} y={807} rotation={180} color={colors.primary} scale={0.8} />
      <FiligreeCorner x={35} y={807} rotation={270} color={colors.primary} scale={0.8} />

      {isCover && (
        <G strokeLinecap="round" strokeLinejoin="round">
          {/* Detailed elaborate mandala behind the cover art */}
          <G transform="translate(297.5, 421)">
            {[...Array(12)].map((_, i) => (
              <Path key={`mandala_${i}`} d="M 0 -130 C 20 -170 30 -160 0 -220 C -30 -160 -20 -170 0 -130 Z" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.2" transform={`rotate(${i * 30})`} />
            ))}
            {[...Array(24)].map((_, i) => (
              <Line key={`radiance_${i}`} x1="0" y1="-140" x2="0" y2="-160" stroke={colors.primary} strokeWidth="0.5" opacity="0.3" transform={`rotate(${i * 15})`} />
            ))}
            {[...Array(8)].map((_, i) => (
              <Path key={`petals_${i}`} d="M 0 -180 C 40 -200 40 -260 0 -280 C -40 -260 -40 -200 0 -180 Z" fill="none" stroke={colors.secondary} strokeWidth="0.5" opacity="0.15" transform={`rotate(${i * 45})`} />
            ))}
            {[...Array(16)].map((_, i) => (
              <Path key={`sharp_petals_${i}`} d="M 0 -150 L 15 -180 L 0 -240 L -15 -180 Z" fill="none" stroke={colors.border} strokeWidth="1" opacity="0.2" transform={`rotate(${i * 22.5})`} />
            ))}
            {[...Array(36)].map((_, i) => (
              <Circle key={`dots_${i}`} cx="0" cy="-210" r="2" fill={colors.highlight} opacity="0.4" transform={`rotate(${i * 10})`} />
            ))}
            
            <Circle cx="0" cy="0" r="140" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.5" />
            <Circle cx="0" cy="0" r="150" fill="none" stroke={colors.border} strokeWidth="1" opacity="0.4" />
            <Circle cx="0" cy="0" r="155" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.2" />
            <Circle cx="0" cy="0" r="220" fill="none" stroke={colors.border} strokeWidth="0.2" opacity="0.3" strokeDasharray="5 5" />
            <Circle cx="0" cy="0" r="280" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.1" />
            <Circle cx="0" cy="0" r="300" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.05" strokeDasharray="10 20" />
            
            {/* Corner diamond accents in mandala */}
            <Path d="M 0 -320 L 20 -300 L 0 -280 L -20 -300 Z" fill={colors.secondary} opacity="0.2" />
            <Path d="M 0 320 L 20 300 L 0 280 L -20 300 Z" fill={colors.secondary} opacity="0.2" />
            <Path d="M 320 0 L 300 20 L 280 0 L 300 -20 Z" fill={colors.secondary} opacity="0.2" />
            <Path d="M -320 0 L -300 20 L -280 0 L -300 -20 Z" fill={colors.secondary} opacity="0.2" />
          </G>
        </G>
      )}
    </Svg>
  );
};

const matchSubtype = (subType: string = '') => {
  const normalized = subType.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('definition')) return 'definition';
  if (normalized.includes('etiology')) return 'etiology';
  if (normalized.includes('classification')) return 'classification';
  if (normalized.includes('risk') || normalized.includes('factor')) return 'riskFactors';
  if (normalized.includes('clinical') || normalized.includes('feature')) return 'clinicalFeatures';
  if (normalized.includes('sign')) return 'signs';
  if (normalized.includes('symptom')) return 'symptoms';
  if (normalized.includes('differential')) return 'differentialDiagnosis';
  if (normalized.includes('diagnos')) return 'diagnosis';
  if (normalized.includes('complication')) return 'complications';
  if (normalized.includes('manage')) return 'management';
  if (normalized.includes('treat')) return 'treatment';
  if (normalized.includes('trap')) return 'traps';
  return 'unknown';
};

const HollowKnightBlockRenderer = ({ block, docColors, index }: { block: PdfBlock, docColors: any, index: number }) => {
  if (!block) return <View />;
  const content = block.content || '';
  const isRtl = isArabic(prepareInteractiveSyntax(content));

  // Base container for normal content, subtle border and dark bg
  const CardContainer = ({ children, style = {} }: { children: any, style?: any }) => (
    <View wrap={false} style={{ 
      marginBottom: 16, 
      backgroundColor: 'rgba(20, 24, 34, 0.6)', 
      border: `1px solid ${docColors.border}`, 
      borderRadius: 4, 
      padding: 16, 
      position: 'relative',
      ...style 
    }}>
      {children}
    </View>
  );

  switch (block.type) {
    case 'disease': {
      const subtypes = (block as any).children || block.blocks || [];
      return (
        <View style={{
          marginVertical: 16,
          padding: 2,
          backgroundColor: docColors.bgDarkest || '#0A0B10',
          border: `1px solid ${docColors.border}`,
          borderRadius: 4,
          position: 'relative'
        }}>
          {/* Main Disease Banner */}
          <View style={{
            backgroundColor: docColors.bgLight || '#151821',
            padding: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: docColors.primary,
            position: 'relative'
          }}>
            <View style={{ position: 'absolute', top: 5, left: 10 }}>
               <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path d="M 10 0 C 20 10 0 10 10 20" fill="none" stroke={docColors.primary} strokeWidth="1" opacity="0.6"/>
               </Svg>
            </View>
            <View style={{ position: 'absolute', top: 5, right: 10 }}>
               <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path d="M 10 0 C 0 10 20 10 10 20" fill="none" stroke={docColors.primary} strokeWidth="1" opacity="0.6"/>
               </Svg>
            </View>
            <Text style={{ fontSize: 24, color: '#FFFFFF', fontFamily: 'Cinzel', fontWeight: 700, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' }}>
              {(block as any).title || block.content || "Pathological Entry"}
            </Text>
            <Text style={{ fontSize: 10, color: docColors.secondary, fontFamily: 'Cinzel', marginTop: 4, letterSpacing: 3, textTransform: 'uppercase' }}>
              Hunter's Journal
            </Text>
          </View>

          <View style={{ padding: 12 }}>
            {subtypes.map((subBlock: any, idx: number) => {
              const subtypeKey = matchSubtype(subBlock.subType);
              const label = subBlock.label || subBlock.subType || '';
              const renderChild = () => <HollowKnightBlockRenderer block={subBlock} docColors={docColors} index={0} />;
              
              switch (subtypeKey) {
                case 'definition':
                  // Pale Ore / Pure Theme
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, position: 'relative', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#E8EDF2' }}>
                      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#E8EDF2', opacity: 0.05 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' }}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                           <Path d="M 12 2 L 15 10 L 23 12 L 15 14 L 12 22 L 9 14 L 1 12 L 9 10 Z" fill="none" stroke="#E8EDF2" strokeWidth="1" />
                           <Circle cx="12" cy="12" r="3" fill="#FFFFFF" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#FFFFFF', fontFamily: 'Cinzel', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 4 }}>
                        {renderChild()}
                      </View>
                    </View>
                  );

                case 'etiology':
                  // Silver Nails/Spikes Theme
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, position: 'relative' }}>
                      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: '#A0AAB5' }} />
                      <View style={{ position: 'absolute', left: 4, top: '20%', bottom: '20%', width: 1, backgroundColor: '#D1D8E0', opacity: 0.5 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingLeft: 12 }}>
                        <Svg width="18" height="18" viewBox="0 0 20 20" style={{ marginRight: 8 }}>
                           <Path d="M 10 0 L 14 20 L 10 16 L 6 20 Z" fill="#D1D8E0" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#D1D8E0', fontFamily: 'Cinzel', fontWeight: 700 }}>{label}</Text>
                      </View>
                      <View style={{ paddingLeft: 12 }}>{renderChild()}</View>
                    </View>
                  );

                case 'classification':
                  // White Palace Tablet Theme
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderWidth: 1, borderColor: '#B0B8C1', borderStyle: 'dotted', opacity: 0.6 }} />
                      <View style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#B0B8C1', paddingBottom: 6, marginBottom: 10, marginHorizontal: 20 }}>
                         <Text style={{ fontSize: 12, color: '#CBD5E1', fontFamily: 'Cinzel', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>+ {label} +</Text>
                      </View>
                      <View style={{ paddingHorizontal: 12 }}>{renderChild()}</View>
                    </View>
                  );

                case 'riskFactors':
                  // Shattered Silver Focus Theme
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 12, position: 'relative', backgroundColor: 'rgba(232, 237, 242, 0.04)' }}>
                      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, backgroundColor: '#8792A1' }} />
                      <View style={{ position: 'absolute', right: 4, top: 0, bottom: 0, width: 1, backgroundColor: '#8792A1', borderStyle: 'dashed' }} />
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8, paddingRight: 12 }}>
                        <Text style={{ fontSize: 13, color: '#E8EDF2', fontFamily: 'Cinzel', fontWeight: 700, marginRight: 8, letterSpacing: 1 }}>{label}</Text>
                        <Svg width="16" height="16" viewBox="0 0 20 20">
                          <Path d="M 0 0 L 20 20 M 20 0 L 0 20" stroke="#8792A1" strokeWidth="2" />
                          <Circle cx="10" cy="10" r="3" fill="#FFFFFF" />
                        </Svg>
                      </View>
                      <View style={{ paddingRight: 10 }}>{renderChild()}</View>
                    </View>
                  );

                case 'clinicalFeatures':
                  // Pale King Aura / Crown (Silver/White)
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', opacity: 0.05, borderRadius: 8 }} />
                      <View style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#FFFFFF', borderTopLeftRadius: 8 }} />
                      <View style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#FFFFFF', borderBottomRightRadius: 8 }} />
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' }}>
                         <Svg width="30" height="15" viewBox="0 0 30 15" style={{ marginRight: 10 }}>
                            <Path d="M 0 15 L 5 0 L 15 10 L 25 0 L 30 15 Z" fill="none" stroke="#E8EDF2" strokeWidth="1" />
                            <Circle cx="15" cy="5" r="2" fill="#FFFFFF" />
                         </Svg>
                         <Text style={{ fontSize: 13, color: '#FFFFFF', fontFamily: 'Cinzel', fontWeight: 700, letterSpacing: 1 }}>{label}</Text>
                      </View>
                      {renderChild()}
                    </View>
                  );

                case 'signs':
                case 'symptoms':
                  const isSigns = subtypeKey === 'signs';
                  // Elegant pale drops
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 14, padding: 12, position: 'relative' }}>
                      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: '#CFD8E3', opacity: 0.5 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingLeft: 10 }}>
                         <Svg width="12" height="12" viewBox="0 0 20 20" style={{ marginRight: 6 }}>
                            <Path d={isSigns ? "M 10 0 C 15 10 20 20 10 20 C 0 20 5 10 10 0 Z" : "M 10 0 L 20 10 L 10 20 L 0 10 Z"} fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                            <Circle cx="10" cy={isSigns ? 13 : 10} r={isSigns ? 2 : 3} fill="#FFFFFF" opacity="0.8" />
                         </Svg>
                         <Text style={{ fontSize: 12, color: '#F1F5F9', fontFamily: 'Cinzel', fontWeight: 700 }}>{label}</Text>
                      </View>
                      <View style={{ paddingLeft: 12 }}>{renderChild()}</View>
                    </View>
                  );

                case 'diagnosis':
                   // Silver Bench / Iron Gates Theme
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, backgroundColor: '#94A3B8' }} />
                      <View style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1, backgroundColor: '#94A3B8' }} />
                      <View style={{ alignItems: 'center', marginBottom: 12 }}>
                        <Svg width="40" height="15" viewBox="0 0 40 15">
                           <Line x1="0" y1="7" x2="40" y2="7" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
                           <Circle cx="20" cy="7" r="4" fill="#FFFFFF" />
                           <Circle cx="20" cy="7" r="1.5" fill="#0A0B10" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#E2E8F0', fontFamily: 'Cinzel', fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>{label}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10 }}>{renderChild()}</View>
                    </View>
                  );

                case 'differentialDiagnosis':
                  // Faint White Web Theme / Dreamcatcher
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 1, backgroundColor: '#E2E8F0', opacity: 0.4 }} />
                      <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 1, backgroundColor: '#E2E8F0', opacity: 0.4 }} />
                      
                      <View style={{ alignItems: 'center', marginBottom: 10 }}>
                         <Svg width="40" height="15" viewBox="0 0 40 15" style={{ opacity: 0.7, marginBottom: 4 }}>
                            <Path d="M 0 0 L 20 15 L 40 0" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
                            <Path d="M 10 0 L 20 10 L 30 0" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
                         </Svg>
                         <Text style={{ fontSize: 13, color: '#F1F5F9', fontFamily: 'Cinzel', fontWeight: 700 }}>{label}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10 }}>{renderChild()}</View>
                    </View>
                  );

                case 'complications':
                  // Silver Thorns / Ruined Vines
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, position: 'relative', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4 }}>
                         <Svg width="100%" height="4" viewBox="0 0 100 4" preserveAspectRatio="none">
                            <Path d="M 0 2 Q 10 0 20 2 T 40 2 T 60 2 T 80 2 T 100 2" fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.6" />
                            <Path d="M 5 2 L 10 0 M 25 2 L 30 4 M 45 2 L 50 0 M 65 2 L 70 4 M 85 2 L 90 0" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
                         </Svg>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingLeft: 10 }}>
                         <Text style={{ fontSize: 13, color: '#E8EDF2', fontFamily: 'Cinzel', fontWeight: 700 }}>{label}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10, paddingBottom: 6 }}>{renderChild()}</View>
                    </View>
                  );

                case 'management':
                  // Silver Notches / Charms
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, borderWidth: 1, borderColor: '#CBD5E1', opacity: 0.3, borderRadius: 2 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingLeft: 4 }}>
                        <Svg width="16" height="16" viewBox="0 0 20 20" style={{ marginRight: 8 }}>
                           <Circle cx="10" cy="10" r="9" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
                           <Circle cx="10" cy="10" r="4" fill="none" stroke="#FFFFFF" strokeWidth="1" />
                           <Circle cx="10" cy="10" r="1" fill="#FFFFFF" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#F1F5F9', fontFamily: 'Cinzel', fontWeight: 700, letterSpacing: 1 }}>{label}</Text>
                      </View>
                      <View style={{ paddingLeft: 10 }}>{renderChild()}</View>
                    </View>
                  );

                case 'treatment':
                  // Silver Soul/Focus Container
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 16, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', opacity: 0.04, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }} />
                      <View style={{ alignItems: 'center', marginBottom: 10 }}>
                        <Svg width="20" height="20" viewBox="0 0 20 20" style={{ marginBottom: 4 }}>
                           <Circle cx="10" cy="10" r="8" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
                           <Path d="M 10 4 L 14 10 L 10 16 L 6 10 Z" fill="#FFFFFF" opacity="0.8" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#FFFFFF', fontFamily: 'Cinzel', fontWeight: 700, letterSpacing: 1 }}>{label}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 6 }}>{renderChild()}</View>
                    </View>
                  );

                case 'traps':
                  // Shade / Void Theme but inverted to Silver/Ash
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 16, padding: 14, position: 'relative' }}>
                      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', opacity: 0.4 }} />
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: '#94A3B8', opacity: 0.8 }} />
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, zIndex: 1, paddingLeft: 10 }}>
                        <Svg width="18" height="18" viewBox="0 0 20 20" style={{ marginRight: 8 }}>
                          <Path d="M 10 2 C 16 2 18 10 15 18 C 5 18 2 10 8 2 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1 2" />
                          <Circle cx="7" cy="10" r="1.5" fill="#FFFFFF" />
                          <Circle cx="13" cy="10" r="1.5" fill="#FFFFFF" />
                        </Svg>
                        <Text style={{ fontSize: 13, color: '#FFFFFF', fontFamily: 'Cinzel', fontWeight: 700, letterSpacing: 1 }}>{label}</Text>
                      </View>
                      <View style={{ zIndex: 1, paddingLeft: 10 }}>{renderChild()}</View>
                    </View>
                  );

                default:
                  // generic
                  return (
                    <View wrap={false} key={idx} style={{ marginBottom: 14 }}>
                      <Text style={{ fontSize: 13, color: docColors.primary, fontFamily: 'Cinzel', fontWeight: 700, marginBottom: 8, opacity: 0.8 }}>— {label}</Text>
                      {renderChild()}
                    </View>
                  );
              }
            })}
          </View>
        </View>
      );
    }

    case 'heading':
      return (
        <View wrap={false} style={{ marginBottom: 20, marginTop: 30, alignItems: 'center' }}>
           <HollowKnightRichText isHeading text={content} baseStyle={{ fontSize: 26, color: docColors.primary, textAlign: 'center', letterSpacing: 2 }} docColors={docColors} />
           <View style={{ marginTop: 10 }}>
              <FiligreeDivider color={docColors.primary} width={150} />
           </View>
        </View>
      );
    case 'subheading':
      return (
        <View wrap={false} style={{ marginTop: 24, marginBottom: 16, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 15, height: 15, marginRight: isRtl ? 0 : 8, marginLeft: isRtl ? 8 : 0 }}>
               <Svg width="15" height="15" viewBox="0 0 20 20">
                  <Path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill="none" stroke={docColors.primary} strokeWidth="2" />
                  <Circle cx="10" cy="10" r="3" fill={docColors.highlight} />
               </Svg>
            </View>
            <View style={{ borderBottomWidth: 1, borderBottomColor: docColors.secondary, paddingBottom: 4 }}>
               <HollowKnightRichText isHeading text={content} baseStyle={{ fontSize: 18, color: '#FFFFFF', textAlign: isRtl ? 'right' : 'left', letterSpacing: 1 }} docColors={docColors} />
            </View>
          </View>
        </View>
      );
    case 'subtitle':
      return (
        <View wrap={false} style={{ marginTop: 12, marginBottom: 16, alignSelf: 'center' }}>
          <HollowKnightRichText text={content} baseStyle={{ fontSize: 14, fontStyle: 'italic', color: docColors.secondary, textAlign: 'center' }} docColors={docColors} />
        </View>
      );
    case 'paragraph':
    case 'text':
    case 'plain':
      if (content.trim() === '') return <View style={{ height: 10 }} />;
      const pMod = index % 5;
      
      if (pMod === 0) {
        // Prominent wrought iron pole left
        return (
          <View wrap={false} style={{ marginBottom: 16, paddingLeft: 20, paddingRight: isRtl ? 20 : 0, position: 'relative' }}>
             <View style={{ position: 'absolute', top: 0, bottom: 0, left: isRtl ? 'auto' : 0, right: isRtl ? 0 : 'auto', width: 6 }}>
                <Svg width="6" height="100%" viewBox="0 0 6 100" preserveAspectRatio="none">
                    <Line x1="3" y1="0" x2="3" y2="100" stroke={docColors.secondary} strokeWidth="1" opacity="0.6" />
                    <Circle cx="3" cy="20" r="2" fill={docColors.primary} />
                    <Circle cx="3" cy="80" r="2" fill={docColors.primary} />
                    <Path d="M 0 50 L 6 50" stroke={docColors.highlight} strokeWidth="1" />
                </Svg>
             </View>
             <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, lineHeight: 1.6, color: '#D8DCE6', textAlign: isRtl ? 'right' : 'left' }} docColors={docColors} />
          </View>
        );
      } else if (pMod === 1) {
        // "Floating" block surrounded by small wisps
        return (
          <View wrap={false} style={{ marginBottom: 16, backgroundColor: 'rgba(20, 24, 34, 0.4)', padding: 16, borderRadius: 5, position: 'relative' }}>
             <View style={{ position: 'absolute', top: -4, right: 10 }}>
                 <Svg width="15" height="25" viewBox="0 0 15 25">
                     <Path d="M 7 0 C 15 8 0 16 7 25" fill="none" stroke={docColors.highlight} strokeWidth="1" opacity="0.6" />
                     <Circle cx="7" cy="5" r="2" fill={docColors.highlight} />
                 </Svg>
             </View>
             <View style={{ position: 'absolute', bottom: -4, left: 10 }}>
                 <Svg width="15" height="15" viewBox="0 0 20 20">
                     <Path d="M 10 0 C 20 10 0 10 10 20" fill="none" stroke={docColors.secondary} strokeWidth="1" opacity="0.4" />
                     <Circle cx="10" cy="10" r="2" fill={docColors.secondary} opacity="0.8" />
                 </Svg>
             </View>
             <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, lineHeight: 1.6, color: '#D8DCE6', textAlign: isRtl ? 'right' : 'left' }} docColors={docColors} />
          </View>
        );
      } else if (pMod === 2) {
        // Faint frame with top and bottom thorns
        return (
          <View wrap={false} style={{ marginBottom: 16, padding: 16, position: 'relative', backgroundColor: 'rgba(10, 11, 16, 0.3)' }}>
             <View style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 6 }}>
                 <Svg width="100%" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                     <Path d="M 0 3 L 20 3 L 25 0 L 30 3 L 70 3 L 75 6 L 80 3 L 100 3" fill="none" stroke={docColors.border} strokeWidth="1" opacity="0.5" />
                 </Svg>
             </View>
             <View style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 6 }}>
                 <Svg width="100%" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                     <Path d="M 0 3 L 30 3 L 35 6 L 40 3 L 60 3 L 65 0 L 70 3 L 100 3" fill="none" stroke={docColors.border} strokeWidth="1" opacity="0.5" />
                 </Svg>
             </View>
             <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, lineHeight: 1.6, color: '#D8DCE6', textAlign: isRtl ? 'right' : 'left' }} docColors={docColors} />
          </View>
        );
      } else if (pMod === 3) {
        // Block with large faint background symbol (nail/mask outline)
        return (
          <View wrap={false} style={{ marginBottom: 16, padding: 12, position: 'relative' }}>
             <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1 }}>
                 <Svg width="50" height="80" viewBox="0 0 50 150">
                    <Path d="M 25 0 L 30 20 L 30 120 L 25 150 L 20 120 L 20 20 Z" fill={docColors.primary} opacity="0.05" />
                    <Path d="M 10 110 L 40 110 L 45 115 L 5 115 Z" fill={docColors.primary} opacity="0.05" />
                    <Circle cx="25" cy="130" r="5" fill={docColors.primary} opacity="0.05" />
                 </Svg>
             </View>
             <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, lineHeight: 1.6, color: '#D8DCE6', textAlign: isRtl ? 'right' : 'left' }} docColors={docColors} />
          </View>
        );
      } else {
         // Bracketed with sharp edges
         return (
          <View wrap={false} style={{ marginBottom: 16, position: 'relative', paddingHorizontal: 16, paddingVertical: 10 }}>
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 10 }}>
                <Svg width="100%" height="100%" viewBox="0 0 10 100" preserveAspectRatio="none">
                    <Path d="M 10 0 L 0 0 L 0 100 L 10 100" fill="none" stroke={docColors.border} strokeWidth="1.5" opacity="0.6" />
                </Svg>
            </View>
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 10 }}>
                <Svg width="100%" height="100%" viewBox="0 0 10 100" preserveAspectRatio="none">
                    <Path d="M 0 0 L 10 0 L 10 100 L 0 100" fill="none" stroke={docColors.border} strokeWidth="1.5" opacity="0.6" />
                </Svg>
            </View>
            <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, lineHeight: 1.6, color: '#D8DCE6', textAlign: isRtl ? 'right' : 'left' }} docColors={docColors} />
          </View>
        );
      }
    case 'example': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginBottom: 16, backgroundColor: 'rgba(26, 35, 48, 0.4)', padding: 16, borderLeftWidth: 4, borderLeftColor: docColors.secondary, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 5, left: -4, bottom: 5, justifyContent: 'space-between', alignItems: 'center', width: 4 }}>
             {[...Array(5)].map((_, i) => (
                <View key={i} style={{ width: 8, height: 2, backgroundColor: docColors.secondary, transform: 'translateX(-2px)' }} />
             ))}
          </View>
          <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
             <Svg width="20" height="20" viewBox="0 0 100 100" style={{ marginRight: 8 }}>
                <Path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="none" stroke={docColors.secondary} strokeWidth="4" />
                <Circle cx="50" cy="50" r="15" fill={docColors.highlight} opacity="0.4" />
             </Svg>
             <Text style={{ fontSize: 11, fontFamily: 'Cinzel', color: docColors.secondary, letterSpacing: 2, textTransform: 'uppercase' }}>Chronicle</Text>
          </View>
          <HollowKnightRichText text={content} baseStyle={{ fontSize: 12, color: '#D8DCE6', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} docColors={docColors} />
        </View>
      );
    }
    case 'explanation':
    case 'note': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ position: 'relative', marginBottom: 16, padding: 20, backgroundColor: 'rgba(10, 15, 20, 0.6)' }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10 }}>
             <Svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <Path d="M 0 5 Q 10 10 20 5 T 40 5 T 60 5 T 80 5 T 100 5" fill="none" stroke={docColors.primary} strokeWidth="1" />
                 <Path d="M 0 5 Q 10 0 20 5 T 40 5 T 60 5 T 80 5 T 100 5" fill="none" stroke={docColors.primary} strokeWidth="1" />
             </Svg>
          </View>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10 }}>
             <Svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <Path d="M 0 5 Q 10 10 20 5 T 40 5 T 60 5 T 80 5 T 100 5" fill="none" stroke={docColors.primary} strokeWidth="1" />
                 <Path d="M 0 5 Q 10 0 20 5 T 40 5 T 60 5 T 80 5 T 100 5" fill="none" stroke={docColors.primary} strokeWidth="1" />
             </Svg>
          </View>
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Svg width="30" height="20" viewBox="0 0 60 40">
               <Path d="M 30 5 C 40 5 50 15 50 20 C 50 20 40 25 30 25 C 20 25 10 20 10 20 C 10 20 20 5 30 5 Z" fill="none" stroke={docColors.primary} strokeWidth="2" />
               <Circle cx="30" cy="15" r="5" fill="none" stroke={docColors.primary} strokeWidth="2" />
               <Circle cx="30" cy="15" r="2" fill={docColors.highlight} />
            </Svg>
          </View>
          <HollowKnightRichText text={content} baseStyle={{ fontSize: 12, fontStyle: 'italic', color: '#B0C4DE', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} docColors={docColors} />
        </View>
      );
    }
    case 'warning': {
        const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
        return (
          <View wrap={false} style={{ marginBottom: 16, position: 'relative', padding: 16, borderWidth: 2, borderColor: '#8B0000', backgroundColor: 'rgba(25, 5, 5, 0.6)' }}>
            <View style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-15px)', backgroundColor: '#0A0B10', padding: 4, borderRadius: 15 }}>
               <Svg width="30" height="30" viewBox="0 0 100 100">
                  <Path d="M 50 10 L 90 85 L 10 85 Z" fill="none" stroke="#FF5555" strokeWidth="6" />
                  <Line x1="50" y1="35" x2="50" y2="60" stroke="#FF5555" strokeWidth="6" />
                  <Circle cx="50" cy="74" r="5" fill="#FF5555" />
               </Svg>
            </View>
            <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, color: '#FFCCCC', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left', marginTop: 10 }} docColors={docColors} />
          </View>
        );
      }
    case 'tip': {
        const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
        return (
          <View wrap={false} style={{ marginBottom: 16, padding: 16, backgroundColor: 'rgba(20, 35, 30, 0.5)', borderStyle: 'dashed', borderWidth: 1, borderColor: docColors.highlight, borderRadius: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: isBoxRtl ? 'flex-end' : 'flex-start' }}>
              <Svg width="24" height="24" viewBox="0 0 100 100">
                 <Path d="M 50 10 C 20 10 20 50 50 50 C 80 50 80 90 50 90" fill="none" stroke={docColors.highlight} strokeWidth="6" />
                 <Circle cx="50" cy="10" r="8" fill={docColors.highlight} />
                 <Circle cx="50" cy="90" r="8" fill={docColors.highlight} />
              </Svg>
              <Text style={{ fontSize: 11, fontFamily: 'Cinzel', color: docColors.highlight, marginLeft: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Wisdom</Text>
            </View>
            <HollowKnightRichText text={content} baseStyle={{ fontSize: 12, color: '#E0F2F1', lineHeight: 1.6, textAlign: isBoxRtl ? 'right' : 'left' }} docColors={docColors} />
          </View>
        );
      }
    case 'high_yield': {
      const isBoxRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginBottom: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
          {/* Ethereal background aura */}
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: docColors.primary, opacity: 0.1, borderRadius: 10 }} />
          <View style={{ position: 'absolute', top: 10, bottom: 10, left: 10, right: 10, borderWidth: 1, borderColor: docColors.highlight, opacity: 0.15, borderRadius: 5 }} />
          
          {/* Top/Bottom ornamental wisps */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' }}>
             <Svg width="160" height="20" viewBox="0 0 160 20">
                <Path d="M 0 10 Q 40 10 70 0 Q 80 15 90 0 Q 120 10 160 10" fill="none" stroke={docColors.highlight} strokeWidth="1" opacity="0.8" />
                <Circle cx="80" cy="15" r="3" fill={docColors.highlight} />
                <Circle cx="65" cy="5" r="1.5" fill={docColors.highlight} />
                <Circle cx="95" cy="5" r="1.5" fill={docColors.highlight} />
             </Svg>
          </View>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' }}>
             <Svg width="160" height="20" viewBox="0 0 160 20">
                <Path d="M 0 10 Q 40 10 70 20 Q 80 5 90 20 Q 120 10 160 10" fill="none" stroke={docColors.highlight} strokeWidth="1" opacity="0.8" />
                <Circle cx="80" cy="5" r="3" fill={docColors.highlight} />
                <Circle cx="65" cy="15" r="1.5" fill={docColors.highlight} />
                <Circle cx="95" cy="15" r="1.5" fill={docColors.highlight} />
             </Svg>
          </View>
          
          {/* Graphical Emblem instead of text */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
             <Svg width="60" height="60" viewBox="0 0 60 60">
                {/* Outer halo */}
                <Circle cx="30" cy="30" r="25" fill="none" stroke={docColors.secondary} strokeWidth="0.5" strokeDasharray="2 4" />
                <Circle cx="30" cy="30" r="20" fill="none" stroke={docColors.highlight} strokeWidth="1" opacity="0.5" />
                {/* Core */}
                <Path d="M 30 10 L 40 25 L 30 50 L 20 25 Z" fill="none" stroke={docColors.highlight} strokeWidth="2" />
                <Path d="M 15 30 L 25 30 L 30 10 L 35 30 L 45 30" fill="none" stroke={docColors.highlight} strokeWidth="1" />
                <Circle cx="30" cy="25" r="4" fill={docColors.highlight} />
                <Circle cx="30" cy="40" r="2" fill={docColors.highlight} />
             </Svg>
          </View>
          
          <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700, lineHeight: 1.6, textAlign: 'center' }} docColors={docColors} />
        </View>
      );
    }
    case 'list': {
      const isOrdered = (block as any).style === 'ordered';
      const firstItemRtl = (block.items && block.items.length > 0) ? isArabic(prepareInteractiveSyntax(block.items[0])) : false;
      
      return (
        <View wrap={false} style={{ marginBottom: 24, marginTop: 8, position: 'relative', paddingLeft: firstItemRtl ? 0 : 12, paddingRight: firstItemRtl ? 12 : 0 }}>
          {/* Subtle vertical accent line */}
          <View style={{ 
            position: 'absolute', 
            top: 4, 
            bottom: 4, 
            left: firstItemRtl ? 'auto' : 0, 
            right: firstItemRtl ? 0 : 'auto', 
            width: 2, 
            backgroundColor: docColors.primary, 
            opacity: 0.25,
            borderRadius: 1
          }} />
          
          <View style={{ flexDirection: 'column' }}>
            {(block.items || []).map((item, i) => {
              const isItemRtl = isArabic(prepareInteractiveSyntax(item));
              return (
                <View wrap={false} key={i} style={{ 
                  flexDirection: isItemRtl ? 'row-reverse' : 'row', 
                  marginBottom: 16, 
                  alignItems: 'flex-start'
                }}>
                  <View style={{ width: 34, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 }}>
                    {isOrdered ? (
                       <View style={{ position: 'relative', width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
                          <Svg width="22" height="22" viewBox="0 0 30 30" style={{ position: 'absolute' }}>
                             <Path d="M 15 2 L 28 8 L 28 22 L 15 28 L 2 22 L 2 8 Z" fill="none" stroke={docColors.highlight} strokeWidth="1" opacity="0.8" />
                          </Svg>
                          <Text style={{ fontSize: 10, fontFamily: 'Cinzel', color: docColors.highlight, fontWeight: 'bold' }}>{i + 1}</Text>
                       </View>
                    ) : (
                      <Svg width="12" height="12" viewBox="0 0 20 20">
                        {/* Soul fragment / geo inspired shape */}
                        <Path d="M 10 2 L 17 7 L 17 13 L 10 18 L 3 13 L 3 7 Z" fill="none" stroke={docColors.primary} strokeWidth="1.5" />
                        <Circle cx="10" cy="10" r="3.5" fill={docColors.highlight} opacity="0.6" />
                        <Circle cx="10" cy="10" r="1.5" fill="#FFFFFF" />
                      </Svg>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: isItemRtl ? 0 : 8, marginRight: isItemRtl ? 8 : 0 }}>
                     <HollowKnightRichText text={item} baseStyle={{ fontSize: 13, lineHeight: 1.6, color: '#D8DCE6', textAlign: isItemRtl ? 'right' : 'left' }} docColors={docColors} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    case 'quote':
      const isQuoteRtl = isArabic(prepareInteractiveSyntax(content));
      return (
        <View wrap={false} style={{ marginVertical: 24, paddingHorizontal: 40, alignItems: 'center', position: 'relative' }}>
          <View style={{ position: 'absolute', top: -10, left: '50%', marginLeft: -15 }}>
            <Svg width="30" height="20" viewBox="0 0 100 50">
              <Path d="M30,0 C50,20 20,40 20,50 L 0,50 C 0,30 20,20 10,0 Z" fill={docColors.primary} opacity="0.4" />
              <Path d="M80,0 C100,20 70,40 70,50 L 50,50 C 50,30 70,20 60,0 Z" fill={docColors.primary} opacity="0.4" />
              <Circle cx="50" cy="25" r="4" fill={docColors.highlight} opacity="0.6" />
            </Svg>
          </View>
          <HollowKnightRichText text={content} baseStyle={{ fontSize: 16, fontStyle: 'italic', fontFamily: 'Cormorant Garamond', color: '#FFFFFF', textAlign: 'center', lineHeight: 1.6 }} docColors={docColors} />
          <View style={{ position: 'absolute', bottom: -10, left: '50%', marginLeft: -15, transform: 'rotate(180deg)' }}>
            <Svg width="30" height="20" viewBox="0 0 100 50">
              <Path d="M30,0 C50,20 20,40 20,50 L 0,50 C 0,30 20,20 10,0 Z" fill={docColors.primary} opacity="0.4" />
              <Path d="M80,0 C100,20 70,40 70,50 L 50,50 C 50,30 70,20 60,0 Z" fill={docColors.primary} opacity="0.4" />
              <Circle cx="50" cy="25" r="4" fill={docColors.highlight} opacity="0.6" />
            </Svg>
          </View>
        </View>
      );
    case 'code':
      return (
        <View wrap={false} style={{ marginBottom: 16, backgroundColor: '#050608', borderColor: docColors.primary, borderWidth: 1, padding: 12, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20 }}>
             <Svg width="100%" height="100%" viewBox="0 0 20 20">
                <Path d="M 0 10 L 10 0 L 20 0 L 0 20 Z" fill={docColors.secondary} opacity="0.4" />
             </Svg>
          </View>
          <Text style={{ fontFamily: 'Courier', fontSize: 11, color: docColors.highlight, lineHeight: 1.5, marginLeft: 10 }}>
            {content}
          </Text>
        </View>
      );
    case 'table':
        return (
          <View wrap={false} style={{ marginBottom: 20, position: 'relative', padding: 8, backgroundColor: 'rgba(20, 24, 34, 0.4)', borderRadius: 4 }}>
            <View style={{ position: 'absolute', top: -5, right: -5, zIndex: 1 }}>
               <Svg width="15" height="15" viewBox="0 0 20 20">
                  <Path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill={docColors.primary} />
               </Svg>
            </View>
            <View style={{ position: 'absolute', bottom: -5, left: -5, zIndex: 1 }}>
               <Svg width="15" height="15" viewBox="0 0 20 20">
                  <Path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill={docColors.primary} />
               </Svg>
            </View>
            {block.columns && block.columns.length > 0 ? (
              <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: docColors.secondary, paddingBottom: 8, marginBottom: 8 }}>
                {block.columns.map((col, cIdx) => (
                  <View key={cIdx} style={{ flex: 1, paddingHorizontal: 8 }}>
                     <HollowKnightRichText isHeading text={col} baseStyle={{ fontSize: 11, fontFamily: 'Cinzel', color: docColors.primary, textTransform: 'uppercase', letterSpacing: 1 }} docColors={docColors} />
                  </View>
                ))}
              </View>
            ) : []}
            <View style={{ flexDirection: 'column' }}>
              {(block.rows || []).map((row, rIdx) => (
                <View key={rIdx} style={{ flexDirection: 'row', paddingVertical: 8, backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)', borderBottomWidth: rIdx === block.rows!.length - 1 ? 0 : 1, borderBottomColor: docColors.border }}>
                  {row.map((cell, cIdx) => (
                    <View key={cIdx} style={{ flex: 1, paddingHorizontal: 8 }}>
                       <HollowKnightRichText text={cell} baseStyle={{ fontSize: 12, color: '#D8DCE6', lineHeight: 1.5 }} docColors={docColors} />
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
        <View wrap={false} style={{ marginBottom: 24, alignItems: 'center' }}>
          <View style={{ padding: 4, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${docColors.border}`, borderRadius: 2 }}>
            <Image src={block.imageUrl} style={{ width: 480, height: 'auto', objectFit: 'cover' }} />
          </View>
        </View>
      );
    case 'page_break':
      return <View break />;
    default:
      return (
        <View wrap={false} style={{ marginBottom: 12 }}>
           <HollowKnightRichText text={content} baseStyle={{ fontSize: 13, color: '#D8DCE6' }} docColors={docColors} />
        </View>
      );
  }
};

export const ReactPdfOutputGameHollowKnight = ({ 
  documents, 
  themeColor, 
  includeToc = true,
  includeCover = true,
  colorSequence,
  isExam = false
}: { 
  documents: PdfDocument[], 
  themeColor?: string,
  includeToc?: boolean,
  includeCover?: boolean,
  colorSequence?: string[],
  isExam?: boolean
}) => {

  const processTextStr = (text: string) => {
    return text.replace(/<[^>]*>/g, '').replace(/[*_~`=^]/g, '');
  };

  const tocItems = documents.flatMap(doc => {
    return (doc.blocks || []).filter(b => b.type === 'heading').map(b => processTextStr(b.content));
  });

  const getColorsForDoc = (groupName: string) => {
    // Determine variation from themeColor or colorSequence
    const themeStr = themeColor || colorSequence?.[0] || 'hollow-knight-pale';
    let palette = {
      primary: '#A8B9C8',    // Pale blue/silver
      secondary: '#6E8B9E',  // Muted steel blue
      highlight: '#D4E4F0',  // Bright glow
      bgDarkest: '#0A0B10',  // Deep void
      bgLight: '#151821',    // Foggy dark
      border: '#2C3545',     // Ornate metal tone
    };

    if (themeStr.includes('silksong')) {
      palette = {
        primary: '#FFD700',    // Silksong gold
        secondary: '#E63946',  // Needle red
        highlight: '#FFFACD',  // Bright glow
        bgDarkest: '#1A0B0B',  // Deep crimson/black
        bgLight: '#2D1414',    // Foggy dark red
        border: '#4A2A2A',     // Ornate metal tone
      };
    }

    return palette;
  };

  return (
    <Document>
      {includeCover && (
        <Page size="A4" style={{ backgroundColor: '#0A0B10' }}>
          <HKBackgroundGraphics colors={getColorsForDoc("Cover")} isCover={true} />
          
          <View style={{ flex: 1, padding: 60, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
             
             {/* Frame around the cover content */}
             <View style={{ position: 'absolute', top: 40, bottom: 40, left: 40, right: 40, border: `2px solid ${getColorsForDoc("Cover").border}`, opacity: 0.3 }} />
             <View style={{ position: 'absolute', top: 46, bottom: 46, left: 46, right: 46, border: `1px solid ${getColorsForDoc("Cover").border}`, opacity: 0.15 }} />

             <Svg style={{ position: 'absolute', top: 60, left: '50%', marginLeft: -40 }} width="80" height="40" viewBox="0 0 80 40">
                 <Path d="M 0 40 Q 40 0 80 40" fill="none" stroke={getColorsForDoc("Cover").secondary} strokeWidth="1" />
                 <Path d="M 10 40 Q 40 10 70 40" fill="none" stroke={getColorsForDoc("Cover").secondary} strokeWidth="2" />
                 <Circle cx="40" cy="20" r="4" fill={getColorsForDoc("Cover").primary} />
             </Svg>

             {/* Emblem / Mask abstraction */}
             <View style={{ marginBottom: 40, alignItems: 'center', marginTop: 40 }}>
                <Svg width="240" height="280" viewBox="0 0 240 280">
                   {/* Back glow */}
                   <Circle cx="120" cy="140" r="100" fill={getColorsForDoc("Cover").primary} opacity="0.1" />
                   <Circle cx="120" cy="140" r="80" fill={getColorsForDoc("Cover").primary} opacity="0.2" />
                   <Circle cx="120" cy="140" r="50" fill={getColorsForDoc("Cover").highlight} opacity="0.1" />
                   
                   {/* Intricate wrought iron cage background */}
                   <Path d="M 120 20 C 170 20 220 50 220 140 C 220 230 170 260 120 260 C 70 260 20 230 20 140 C 20 50 70 20 120 20 Z" fill="none" stroke={getColorsForDoc("Cover").border} strokeWidth="2" />
                   <Path d="M 120 40 C 160 40 190 70 190 140 C 190 210 160 240 120 240 C 80 240 50 210 50 140 C 50 70 80 40 120 40 Z" fill="none" stroke={getColorsForDoc("Cover").border} strokeWidth="1" />
                   
                   {/* Additional web lines */}
                   <Line x1="120" y1="20" x2="120" y2="260" stroke={getColorsForDoc("Cover").border} strokeWidth="1" opacity="0.5" />
                   <Line x1="20" y1="140" x2="220" y2="140" stroke={getColorsForDoc("Cover").border} strokeWidth="1" opacity="0.5" />
                   <Line x1="50" y1="70" x2="190" y2="210" stroke={getColorsForDoc("Cover").border} strokeWidth="1" opacity="0.3" />
                   <Line x1="50" y1="210" x2="190" y2="70" stroke={getColorsForDoc("Cover").border} strokeWidth="1" opacity="0.3" />

                   <Path d="M 40 100 Q 120 120 200 100" fill="none" stroke={getColorsForDoc("Cover").border} strokeWidth="1" opacity="0.5" />
                   <Path d="M 40 180 Q 120 160 200 180" fill="none" stroke={getColorsForDoc("Cover").border} strokeWidth="1" opacity="0.5" />

                   {/* Abstract bug mask shape centered at 120, 140 */}
                   <G transform="translate(60, 60) scale(1.2)">
                      {/* Cape / Mantle behind mask */}
                      <Path d="M 30 130 C 10 160 10 200 50 180 C 80 160 90 200 70 130 Z" fill={getColorsForDoc("Cover").border} opacity="0.8" />

                      <Path d="M 20 40 Q 50 10 80 40 Q 100 80 80 120 C 60 130 40 130 20 120 Q 0 80 20 40 Z" fill={getColorsForDoc("Cover").highlight} />
                      {/* Eyes */}
                      <G transform="translate(35, 75) scale(1, 2.2)"><Circle cx="0" cy="0" r="10" fill={getColorsForDoc("Cover").bgDarkest} /></G>
                      <G transform="translate(65, 75) scale(1, 2.2)"><Circle cx="0" cy="0" r="10" fill={getColorsForDoc("Cover").bgDarkest} /></G>
                      {/* Horns */}
                      <Path d="M 30 46 C 10 0 25 -20 30 -25 C 35 -15 35 15 45 35 Z" fill={getColorsForDoc("Cover").highlight} />
                      <Path d="M 70 46 C 90 0 75 -20 70 -25 C 65 -15 65 15 55 35 Z" fill={getColorsForDoc("Cover").highlight} />
                      
                      {/* Forehead mark */}
                      <Path d="M 45 40 L 50 30 L 55 40 Z" fill={getColorsForDoc("Cover").bgDarkest} opacity="0.3" />
                   </G>
                </Svg>
             </View>

             <Text style={{ fontSize: 48, fontFamily: 'Cinzel', color: '#FFF', textAlign: 'center', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>
                {documents[0]?.title || 'Chronicle'}
             </Text>

             <View style={{ position: 'relative', width: 300, alignItems: 'center' }}>
                <FiligreeDivider width={250} color="#A8B9C8" />
                <Svg style={{ position: 'absolute', top: -10 }} width="20" height="20" viewBox="0 0 20 20">
                   <Path d="M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z" fill={getColorsForDoc("Cover").highlight} />
                </Svg>
             </View>
             
             {isExam && (
               <View style={{ marginTop: 30, alignItems: 'center' }}>
                 <Svg width="120" height="40" viewBox="0 0 120 40">
                   {/* Exam/Trial graphic substitute */}
                   <Path d="M 60 5 L 80 20 L 60 35 L 40 20 Z" fill="none" stroke="#E63946" strokeWidth="2" />
                   <Circle cx="60" cy="20" r="4" fill="#E63946" />
                   <Line x1="10" y1="20" x2="35" y2="20" stroke="#E63946" strokeWidth="1" />
                   <Line x1="85" y1="20" x2="110" y2="20" stroke="#E63946" strokeWidth="1" />
                   
                   <Path d="M 20 15 L 30 20 L 20 25" fill="none" stroke="#E63946" strokeWidth="1" />
                   <Path d="M 100 15 L 90 20 L 100 25" fill="none" stroke="#E63946" strokeWidth="1" />
                   
                   {/* Spikes */}
                   <Path d="M 50 12 L 60 0 L 70 12" fill="none" stroke={getColorsForDoc("Cover").border} strokeWidth="1" />
                   <Path d="M 50 28 L 60 40 L 70 28" fill="none" stroke={getColorsForDoc("Cover").border} strokeWidth="1" />
                 </Svg>
               </View>
             )}

             <Svg style={{ position: 'absolute', bottom: 60, left: '50%', marginLeft: -40 }} width="80" height="40" viewBox="0 0 80 40">
                 <Path d="M 0 0 Q 40 40 80 0" fill="none" stroke={getColorsForDoc("Cover").secondary} strokeWidth="1" />
                 <Path d="M 10 0 Q 40 30 70 0" fill="none" stroke={getColorsForDoc("Cover").secondary} strokeWidth="2" />
                 <Circle cx="40" cy="20" r="4" fill={getColorsForDoc("Cover").primary} />
             </Svg>
          </View>
        </Page>
      )}

      {includeToc && tocItems.length > 0 && (
        <Page size="A4" style={{ backgroundColor: '#0A0B10', padding: 50 }}>
          <HKBackgroundGraphics colors={getColorsForDoc("TOC")} />
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontFamily: 'Cinzel', color: '#FFF', letterSpacing: 2 }}>Table of Contents</Text>
            <View style={{ marginTop: 10 }}>
               <FiligreeDivider color="#6E8B9E" width={100} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            {tocItems.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2C3545', borderStyle: 'dotted' }}>
                 <View style={{ flex: 1, paddingRight: 20 }}>
                   <Text style={{ fontSize: 14, fontFamily: 'Cormorant Garamond', color: '#D8DCE6' }}>{item}</Text>
                 </View>
                 <Text style={{ fontSize: 12, fontFamily: 'Cinzel', color: '#6E8B9E' }}>{(i + 1).toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {documents.map((doc, docIndex) => {
        const tColors = getColorsForDoc(doc.group || "Ungrouped");
        
        return (
          <Page key={docIndex} size="A4" style={{ backgroundColor: '#0A0B10', paddingVertical: 50, paddingHorizontal: 45 }}>
            <HKBackgroundGraphics colors={tColors} />
            
            <View style={{ marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: tColors.border, alignItems: 'center' }}>
               <Text style={{ fontSize: 22, fontFamily: 'Cinzel', color: '#FFF', letterSpacing: 2, textAlign: 'center' }}>
                 {doc.title || 'Untitled Document'}
               </Text>
               <View style={{ marginTop: 8 }}>
                 <Text style={{ fontSize: 12, fontFamily: 'Cormorant Garamond', fontStyle: 'italic', color: tColors.secondary, textAlign: 'center' }}>
                   Journal Entry
                 </Text>
               </View>
            </View>

            {doc.blocks.map((block, bIdx) => (
              <HollowKnightBlockRenderer key={bIdx} block={block} docColors={tColors} index={bIdx} />
            ))}
            
            <View fixed style={{ position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' }}>
               <Text render={({ pageNumber, totalPages }) => (
                 `${pageNumber}`
               )} style={{ fontSize: 10, fontFamily: 'Cinzel', color: tColors.secondary, opacity: 0.8 }} />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
