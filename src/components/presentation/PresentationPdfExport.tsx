import React from 'react';
import { PresentationData, SlideData } from '../../presentationTypes';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Circle,
  Rect,
  Line
} from '@react-pdf/renderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Register Fonts (using standard built-in fonts, no registration needed)

const styles = StyleSheet.create({
  page: { 
    padding: 60, 
    backgroundColor: '#ffffff', 
    fontFamily: 'Helvetica', 
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  title: { 
    fontSize: 48, 
    fontWeight: 700, 
    marginBottom: 40,
    color: '#0f172a',
    letterSpacing: -1
  },
  subtitle: {
    fontSize: 24,
    color: '#64748b',
    marginBottom: 20
  },
  content: {
    fontSize: 24,
    lineHeight: 1.6,
    color: '#334155'
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 16
  },
  bulletPoint: {
    width: 30,
    fontSize: 24,
    color: '#6366f1'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20
  },
  footerText: {
    fontSize: 16,
    color: '#94a3b8'
  }
});

export const hexToRgbA = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  if (hex.startsWith('#') && hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PdfMarkdown = ({ children, style, textStyle, primaryColor = '#4f46e5' }: { children: string, style?: any, textStyle?: any, primaryColor?: string }) => {
  const markColor = hexToRgbA(primaryColor, 0.3);
  return (
    <View style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({node, ...props}) => <Text style={textStyle ? textStyle : { marginBottom: 16 }}>{props.children}</Text>,
          strong: ({node, ...props}) => <Text style={{ fontWeight: 'bold', ...textStyle }}>{props.children}</Text>,
          em: ({node, ...props}) => <Text style={{ fontStyle: 'italic', ...textStyle }}>{props.children}</Text>,
          h1: ({node, ...props}) => <Text style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 16, ...textStyle }}>{props.children}</Text>,
          h2: ({node, ...props}) => <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12, ...textStyle }}>{props.children}</Text>,
          h3: ({node, ...props}) => <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 12, ...textStyle }}>{props.children}</Text>,
          li: ({node, ...props}) => <Text style={{ marginBottom: 8, ...textStyle }}><Text style={{ fontWeight: 'bold' }}>• </Text>{props.children}</Text>,
          ul: ({node, ...props}) => <View style={{ marginLeft: 16, marginBottom: 16 }}>{props.children}</View>,
          ol: ({node, ...props}) => <View style={{ marginLeft: 16, marginBottom: 16 }}>{props.children}</View>,
          span: ({node, style: s, ...props}) => <Text style={{ ...(s as any), ...textStyle }}>{props.children}</Text>,
          mark: ({node, ...props}) => <Text style={{ backgroundColor: markColor, ...textStyle }}>{props.children}</Text>,
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </View>
  );
};


const SlidePdfBackground = ({ type, primaryColor }: { type: string, primaryColor: string }) => {
  switch (type) {
    case 'title':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: -300, right: -200, width: 800, height: 800, borderRadius: 400, backgroundColor: primaryColor, opacity: 0.08 }} />
          <View style={{ position: 'absolute', bottom: -250, left: -100, width: 700, height: 700, borderRadius: 350, backgroundColor: primaryColor, opacity: 0.04 }} />
          <View style={{ position: 'absolute', top: '5%', right: '10%', width: 600, height: 600, borderRadius: 300, borderWidth: 3, borderColor: primaryColor, borderStyle: 'solid', opacity: 0.12 }} />
          <View style={{ position: 'absolute', top: '30%', left: '5%', width: 250, height: 250, borderRadius: 125, borderWidth: 1, borderColor: primaryColor, borderStyle: 'dashed', opacity: 0.1 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.02 }} height="100%" width="100%">
             {[...Array(20)].map((_, i) => (
                <Line key={`grid-h-${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke={primaryColor} strokeWidth={0.5} />
             ))}
             {[...Array(20)].map((_, i) => (
                <Line key={`grid-v-${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke={primaryColor} strokeWidth={0.5} />
             ))}
          </Svg>

          <Svg style={{ position: 'absolute', top: 80, left: 80, opacity: 0.2 }} height="300" width="300">
            <Path d="M20 20 L120 20 L120 120 L20 120 Z" fill="none" stroke={primaryColor} strokeWidth={4} />
            <Path d="M60 60 L160 60 L160 160 L60 160 Z" fill="none" stroke={primaryColor} strokeWidth={4} opacity={0.5} />
            <Line x1="20" y1="20" x2="60" y2="60" stroke={primaryColor} strokeWidth={2} />
            <Line x1="120" y1="20" x2="160" y2="60" stroke={primaryColor} strokeWidth={2} />
            <Line x1="120" y1="120" x2="160" y2="160" stroke={primaryColor} strokeWidth={2} />
            <Line x1="20" y1="120" x2="60" y2="160" stroke={primaryColor} strokeWidth={2} />
            
            <Circle cx="220" cy="220" r="30" fill="none" stroke={primaryColor} strokeWidth={1} />
            <Circle cx="220" cy="220" r="15" fill={primaryColor} opacity={0.3} />
            <Path d="M150 0 L150 300 M0 150 L300 150" stroke={primaryColor} strokeWidth={0.5} opacity={0.2} />
            <Circle cx="150" cy="150" r="140" fill="none" stroke={primaryColor} strokeWidth={0.5} strokeDasharray="4,8" />
          </Svg>

          <Svg style={{ position: 'absolute', bottom: 100, right: 100, opacity: 0.1 }} height="200" width="200">
            <Line x1="0" y1="100" x2="200" y2="100" stroke={primaryColor} strokeWidth={1} strokeDasharray="5,5" />
            <Line x1="100" y1="0" x2="100" y2="200" stroke={primaryColor} strokeWidth={1} strokeDasharray="5,5" />
            <Circle cx="100" cy="100" r="40" fill="none" stroke={primaryColor} strokeWidth={2} />
            <Circle cx="100" cy="100" r="60" fill="none" stroke={primaryColor} strokeWidth={1} strokeDasharray="3,3" />
            <Circle cx="100" cy="100" r="80" fill="none" stroke={primaryColor} strokeWidth={0.5} />
            <Rect x="85" y="85" width="30" height="30" fill="none" stroke={primaryColor} strokeWidth={1} transform="rotate(45, 100, 100)" />
            <Path d="M100 0 L100 200 M0 100 L200 100" stroke={primaryColor} strokeWidth={0.2} opacity={0.5} />
          </Svg>

          <View style={{ position: 'absolute', top: '60%', left: '25%', width: 30, height: 30, borderRadius: 4, transform: 'rotate(25deg)', borderWidth: 2, borderColor: primaryColor, borderStyle: 'solid', opacity: 0.2 }} />
          <View style={{ position: 'absolute', top: '65%', left: '30%', width: 15, height: 15, borderRadius: 2, transform: 'rotate(45deg)', backgroundColor: primaryColor, opacity: 0.3 }} />
          
          <Svg style={{ position: 'absolute', top: '45%', right: '10%', opacity: 0.08 }} height="120" width="120">
            <Path d="M10 10 L110 10 L60 100 Z" fill="none" stroke={primaryColor} strokeWidth={2} />
            <Path d="M30 30 L90 30 L60 80 Z" fill="none" stroke={primaryColor} strokeWidth={1} />
            <Circle cx="60" cy="40" r="10" fill="none" stroke={primaryColor} strokeWidth={0.5} opacity={0.5} />
          </Svg>

          <Svg style={{ position: 'absolute', top: 200, right: '40%', opacity: 0.05 }} height="100" width="100">
             {[...Array(10)].map((_, i) => (
                <Line key={`h2-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke={primaryColor} strokeWidth={1} />
             ))}
             {[...Array(10)].map((_, i) => (
                <Line key={`v2-${i}`} x1={i * 10} y1="0" x2={i * 10} y2={100} stroke={primaryColor} strokeWidth={1} opacity={0.5} />
             ))}
          </Svg>

          <View style={{ position: 'absolute', top: '30%', right: '25%', width: 15, height: 15, backgroundColor: primaryColor, borderRadius: 7.5, opacity: 0.4 }} />
          <View style={{ position: 'absolute', bottom: '40%', right: '10%', width: 12, height: 12, backgroundColor: primaryColor, borderRadius: 6, opacity: 0.3 }} />
          <View style={{ position: 'absolute', bottom: '20%', left: '20%', width: 20, height: 20, backgroundColor: primaryColor, borderRadius: 10, opacity: 0.2 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, width: 40, height: '100%', backgroundColor: primaryColor, opacity: 0.02 }} />
          <View style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: 20, backgroundColor: primaryColor, opacity: 0.02 }} />
          <View style={{ position: 'absolute', bottom: 40, left: 40, right: 40, height: 1, backgroundColor: primaryColor, opacity: 0.1 }} />
        </View>
      );
    case 'text':
    case 'quote':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: 0, right: 0, width: 350, height: '100%', backgroundColor: primaryColor, opacity: 0.03 }} />
          <View style={{ position: 'absolute', top: 0, right: 350, width: 2, height: '100%', backgroundColor: primaryColor, opacity: 0.1 }} />
          
          <View style={{ position: 'absolute', top: '50%', left: '50%', width: 900, height: 900, borderRadius: 450, transform: 'translate(-450px, -450px)', borderWidth: 1, borderColor: primaryColor, borderStyle: 'solid', opacity: 0.04 }} />
          <View style={{ position: 'absolute', top: '50%', left: '50%', width: 700, height: 700, borderRadius: 350, transform: 'translate(-350px, -350px)', borderWidth: 1, borderColor: primaryColor, borderStyle: 'dashed', opacity: 0.07 }} />
          
          <Svg style={{ position: 'absolute', top: 40, left: 40, opacity: 0.2 }} height="200" width="200">
            <Line x1="0" y1="0" x2="180" y2="0" stroke={primaryColor} strokeWidth={3} />
            <Line x1="0" y1="30" x2="120" y2="30" stroke={primaryColor} strokeWidth={2} />
            <Line x1="0" y1="60" x2="60" y2="60" stroke={primaryColor} strokeWidth={1} />
            <Line x1="0" y1="0" x2="0" y2="180" stroke={primaryColor} strokeWidth={3} />
            <Line x1="30" y1="0" x2="30" y2="120" stroke={primaryColor} strokeWidth={2} />
            
            <Rect x="170" y="-10" width="20" height="20" fill={primaryColor} transform="rotate(45, 180, 0)" />
            <Rect x="-10" y="170" width="20" height="20" fill={primaryColor} transform="rotate(45, 0, 180)" />
            
            <Path d="M180 180 L220 220" stroke={primaryColor} strokeWidth={1} opacity={0.5} />
            <Circle cx="220" cy="220" r="4" fill={primaryColor} />
          </Svg>
          
          <Svg style={{ position: 'absolute', bottom: 60, right: 60 }} height="300" width="300">
            {[...Array(5)].map((_, i) => (
              <Circle key={`c-${i}`} cx="150" cy="150" r={100 + i * 40} fill="none" stroke={primaryColor} strokeWidth={1} opacity={0.1 / (i + 1)} />
            ))}
            {[...Array(24)].map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x1 = 150 + 120 * Math.cos(angle);
              const y1 = 150 + 120 * Math.sin(angle);
              const x2 = 150 + 135 * Math.cos(angle);
              const y2 = 150 + 135 * Math.sin(angle);
              return <Line key={`tick-l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={primaryColor} strokeWidth={1.5} opacity={0.2} />;
            })}
            <Path d="M150 20 L150 280 M20 150 L280 150" stroke={primaryColor} strokeWidth={0.5} opacity={0.15} />
            <Circle cx="150" cy="150" r="130" fill="none" stroke={primaryColor} strokeWidth={0.5} strokeDasharray="10,20" opacity={0.25} />
          </Svg>
          
          <View style={{ position: 'absolute', top: 100, left: 100, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: primaryColor, opacity: 0.15 }} />
          <View style={{ position: 'absolute', bottom: 100, right: 100, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: primaryColor, opacity: 0.15 }} />
        </View>
      );

    case 'agenda':
    case 'bullets':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, width: 160, height: '100%', backgroundColor: primaryColor, opacity: 0.04 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, width: 16, height: '100%', backgroundColor: primaryColor, opacity: 0.8 }} />
          <View style={{ position: 'absolute', top: 0, left: 160, width: 2, height: '100%', backgroundColor: primaryColor, opacity: 0.15 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.03 }} height="100%" width="160">
             {[...Array(40)].map((_, i) => (
                <Line key={`h-dot-${i}`} x1="0" y1={i * 20} x2="160" y2={i * 20} stroke={primaryColor} strokeWidth={0.5} />
             ))}
          </Svg>

          <Svg style={{ position: 'absolute', bottom: 60, right: 60, opacity: 0.2 }} height="200" width="200">
            {[...Array(10)].map((_, i) => (
               <Circle key={`c1-${i}`} cx="100" cy="100" r={i * 20} fill="none" stroke={primaryColor} strokeWidth={1} opacity={0.1} />
            ))}
            <Path d="M0 100 L200 100 M100 0 L100 200" stroke={primaryColor} strokeWidth={1} opacity={0.5} />
            <Rect x="80" y="80" width="40" height="40" fill="none" stroke={primaryColor} strokeWidth={2} transform="rotate(45, 100, 100)" />
          </Svg>
          
          <Svg style={{ position: 'absolute', top: 60, right: 100, opacity: 0.1 }} height="120" width="120">
             {[...Array(8)].map((_, r) => (
                [...Array(8)].map((_, c) => (
                  <Circle key={`dot-${r}-${c}`} cx={c * 15} cy={r * 15} r="2" fill={primaryColor} />
                ))
             ))}
          </Svg>
          
          <View style={{ position: 'absolute', top: '15%', right: 0, width: 200, height: 1, backgroundColor: primaryColor, opacity: 0.1 }} />
          <View style={{ position: 'absolute', top: '25%', right: 0, width: 150, height: 1, backgroundColor: primaryColor, opacity: 0.08 }} />
          <View style={{ position: 'absolute', top: '35%', right: 0, width: 100, height: 1, backgroundColor: primaryColor, opacity: 0.05 }} />
          
          <View style={{ position: 'absolute', top: 0, left: 16, width: 8, height: '100%', backgroundColor: primaryColor, opacity: 0.15 }} />
          <View style={{ position: 'absolute', bottom: 40, left: 180, width: 400, height: 2, backgroundColor: primaryColor, opacity: 0.1 }} />
        </View>
      );

    case 'split-text':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: 0, left: '50%', width: 4, height: '100%', backgroundColor: primaryColor, opacity: 0.2, transform: 'translateX(-2px)' }} />
          {[...Array(20)].map((_, i) => (
            <View key={`div-${i}`} style={{ position: 'absolute', top: `${i * 5}%`, left: '50%', width: 20, height: 1, backgroundColor: primaryColor, opacity: 0.3, transform: 'translateX(-10px)' }} />
          ))}
          
          <View style={{ position: 'absolute', top: -100, left: '50%', width: 200, height: 200, borderRadius: 100, transform: 'translateX(-100px)', borderWidth: 8, borderColor: primaryColor, opacity: 0.05 }} />
          <View style={{ position: 'absolute', bottom: -100, left: '50%', width: 200, height: 200, borderRadius: 100, transform: 'translateX(-100px)', borderWidth: 8, borderColor: primaryColor, opacity: 0.05 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.02 }} height="100%" width="100%">
             {[...Array(10)].map((_, i) => (
                <Line key={`h-split-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke={primaryColor} strokeWidth={1} />
             ))}
          </Svg>

          <Svg style={{ position: 'absolute', top: '15%', left: '5%', opacity: 0.1 }} height="150" width="150">
             <Rect x="10" y="10" width="130" height="130" fill="none" stroke={primaryColor} strokeWidth={2} />
             <Path d="M0 75 L150 75 M75 0 L150 75 L75 150 L0 75 Z" fill="none" stroke={primaryColor} strokeWidth={1} />
          </Svg>
          
          <Svg style={{ position: 'absolute', bottom: '15%', right: '5%', opacity: 0.1 }} height="150" width="150">
             <Circle cx="75" cy="75" r="60" fill="none" stroke={primaryColor} strokeWidth={2} />
             <Circle cx="75" cy="75" r="40" fill="none" stroke={primaryColor} strokeWidth={1} strokeDasharray="5,5" />
             <Path d="M15 15 L135 135 M135 15 L15 135" stroke={primaryColor} strokeWidth={1} />
          </Svg>
          
          <View style={{ position: 'absolute', top: '50%', left: '50%', width: 60, height: 60, borderRadius: 30, transform: 'translate(-30px, -30px)', backgroundColor: primaryColor, opacity: 0.1 }} />
          <View style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: 1, backgroundColor: primaryColor, opacity: 0.05 }} />
        </View>
      );

    case 'image-text':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: '45%', height: '100%', backgroundColor: primaryColor, borderTopLeftRadius: 200, opacity: 0.06 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '50%', backgroundColor: primaryColor, borderBottomRightRadius: 150, opacity: 0.03 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.05 }} height="100%" width="100%">
             {[...Array(12)].map((_, i) => (
                <Path key={`wave-${i}`} d={`M0 ${100 + i * 40} Q 200 ${50 + i * 40} 400 ${100 + i * 40} T 800 ${100 + i * 40}`} fill="none" stroke={primaryColor} strokeWidth={1.5} opacity={0.2} />
             ))}
          </Svg>

          <Svg style={{ position: 'absolute', top: 120, right: 60, opacity: 0.1 }} height="200" width="200">
             <Rect x="20" y="20" width="160" height="160" fill="none" stroke={primaryColor} strokeWidth={4} />
             <Rect x="40" y="40" width="120" height="120" fill="none" stroke={primaryColor} strokeWidth={2} strokeDasharray="10,10" />
             <Circle cx="100" cy="100" r="10" fill={primaryColor} />
          </Svg>
          
          <View style={{ position: 'absolute', bottom: 60, left: 40, width: 250, height: 4, backgroundColor: primaryColor, opacity: 0.4 }} />
          <View style={{ position: 'absolute', bottom: 70, left: 40, width: 120, height: 2, backgroundColor: primaryColor, opacity: 0.2 }} />
          
          <Svg style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.15 }} height="100" width="150">
             <Path d="M0 50 L150 50 M25 0 L25 100 M125 0 L125 100" stroke={primaryColor} strokeWidth={2} />
          </Svg>
        </View>
      );

    case 'grid':
    case 'images':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, backgroundColor: primaryColor, opacity: 0.04 }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: primaryColor, opacity: 0.03 }} />
          <View style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 2, backgroundColor: primaryColor, opacity: 0.15 }} />
          <View style={{ position: 'absolute', bottom: 120, left: 0, right: 0, height: 1, backgroundColor: primaryColor, opacity: 0.08 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.03 }} height="100%" width="100%">
            {[...Array(20)].map((_, i) => (
              <Line key={`bg-grid-v-${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke={primaryColor} strokeWidth={0.5} />
            ))}
            {[...Array(20)].map((_, i) => (
              <Line key={`bg-grid-h-${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke={primaryColor} strokeWidth={0.5} />
            ))}
          </Svg>
          
          <Svg style={{ position: 'absolute', top: 60, right: 40, opacity: 0.18 }} height="140" width="140">
            {[...Array(8)].map((_, i) => (
              <Line key={`h-${i}`} x1="0" y1={i * 20} x2="140" y2={i * 20} stroke={primaryColor} strokeWidth={1} />
            ))}
            {[...Array(8)].map((_, i) => (
              <Line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="140" stroke={primaryColor} strokeWidth={1} />
            ))}
            <Circle cx="40" cy="40" r="10" fill={primaryColor} opacity={0.3} />
            <Rect x="80" y="80" width="20" height="20" fill={primaryColor} opacity={0.2} />
            <Path d="M0 0 L140 140" stroke={primaryColor} strokeWidth={0.5} opacity={0.4} />
          </Svg>
          
          <View style={{ position: 'absolute', top: 150, left: 40, width: 60, height: 6, backgroundColor: primaryColor, opacity: 0.9 }} />
          <View style={{ position: 'absolute', top: 150, left: 110, width: 12, height: 6, backgroundColor: primaryColor, opacity: 0.4 }} />
          <View style={{ position: 'absolute', top: 150, left: 130, width: 6, height: 6, backgroundColor: primaryColor, opacity: 0.2 }} />
          
          <Svg style={{ position: 'absolute', bottom: 60, right: 120, opacity: 0.25 }} height="60" width="60">
            <Line x1="0" y1="0" x2="60" y2="60" stroke={primaryColor} strokeWidth={3} />
            <Line x1="60" y1="0" x2="0" y2="60" stroke={primaryColor} strokeWidth={3} />
            <Circle cx="30" cy="30" r="15" fill="none" stroke={primaryColor} strokeWidth={2} opacity={0.6} />
            <Circle cx="30" cy="30" r="22" fill="none" stroke={primaryColor} strokeWidth={1} opacity={0.3} />
          </Svg>
          
          <View style={{ position: 'absolute', bottom: 0, left: '50%', width: 2, height: 140, backgroundColor: primaryColor, opacity: 0.08 }} />
        </View>
      );

    case 'timeline':
    case 'process':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 160, backgroundColor: primaryColor, opacity: 0.04, transform: 'translateY(-80px)' }} />
          <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, backgroundColor: primaryColor, opacity: 0.3 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.08 }} height="100%" width="100%">
             {[...Array(10)].map((_, i) => (
                <Line key={`tm-v-${i}`} x1={`${10 + i * 10}%`} y1="0" x2={`${10 + i * 10}%`} y2="100%" stroke={primaryColor} strokeWidth={1} strokeDasharray="10,20" />
             ))}
             {[...Array(6)].map((_, i) => (
                <Circle key={`tm-c-${i}`} cx={`${15 + i * 15}%`} cy="50%" r="20" fill="none" stroke={primaryColor} strokeWidth={1.5} />
             ))}
          </Svg>

          <Svg style={{ position: 'absolute', top: 60, left: 60, opacity: 0.15 }} height="100" width="200">
             <Path d="M0 50 L200 50" stroke={primaryColor} strokeWidth={1} />
             {[...Array(5)].map((_, i) => (
                <Rect key={`tm-r-${i}`} x={i * 40} y="40" width="20" height="20" fill={primaryColor} />
             ))}
          </Svg>
          
          <View style={{ position: 'absolute', top: 40, left: 40, width: 120, height: 120, borderTopWidth: 2, borderLeftWidth: 2, borderColor: primaryColor, opacity: 0.2 }} />
          <View style={{ position: 'absolute', bottom: 40, right: 40, width: 120, height: 120, borderBottomWidth: 2, borderRightWidth: 2, borderColor: primaryColor, opacity: 0.2 }} />

          <Svg style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-250px)', opacity: 0.1 }} height="40" width="500">
             <Line x1="0" y1="20" x2="500" y2="20" stroke={primaryColor} strokeWidth={2} />
             {[...Array(26)].map((_, i) => (
                <Line key={`mark-${i}`} x1={i * 20} y1="10" x2={i * 20} y2="30" stroke={primaryColor} strokeWidth={1} />
             ))}
          </Svg>
        </View>
      );

    case 'chart':
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: primaryColor, opacity: 0.01 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1 }} height="100%" width="100%">
            {[...Array(20)].map((_, i) => (
               <Line key={`ch-grid-h-${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke={primaryColor} strokeWidth={0.5} />
            ))}
            {[...Array(20)].map((_, i) => (
               <Line key={`ch-grid-v-${i}`} x1={`${i * i * 0.25}%`} y1="0" x2={`${i * i * 0.25}%`} y2="100%" stroke={primaryColor} strokeWidth={0.5} />
            ))}
          </Svg>
          
          <Svg style={{ position: 'absolute', bottom: '15%', left: '10%', opacity: 0.2 }} height="300" width="500">
             <Path d="M0 300 L50 220 L100 250 L150 120 L200 180 L250 60 L300 100 L350 20 L400 40 L500 0" fill="none" stroke={primaryColor} strokeWidth={4} />
             <Path d="M0 300 L50 220 L100 250 L150 120 L200 180 L250 60 L300 100 L350 20 L400 40 L500 0 L500 300 Z" fill={primaryColor} opacity={0.15} />
             {[0, 50, 100, 150, 200, 250, 300, 350, 400, 500].map((x, i) => (
               <Circle key={`pt-${i}`} cx={x} cy={300 - (i * 25 + Math.random() * 50)} r="5" fill={primaryColor} />
             ))}
          </Svg>
          
          <View style={{ position: 'absolute', top: 60, right: 60, width: 250, height: 250, borderRadius: 125, borderWidth: 20, borderColor: primaryColor, opacity: 0.05 }} />
          <View style={{ position: 'absolute', top: 60, right: 60, width: 250, height: 250, borderRadius: 125, borderWidth: 2, borderColor: primaryColor, borderStyle: 'dashed', opacity: 0.2 }} />
          
          <Svg style={{ position: 'absolute', top: '10%', left: '40%', opacity: 0.1 }} height="100" width="100">
             <Rect x="0" y="0" width="100" height="20" fill={primaryColor} />
             <Rect x="0" y="30" width="80" height="20" fill={primaryColor} opacity={0.7} />
             <Rect x="0" y="60" width="60" height="20" fill={primaryColor} opacity={0.4} />
          </Svg>
        </View>
      );

    default:
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: primaryColor, opacity: 0.01 }} />
          
          <Svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.03 }} height="100%" width="100%">
             {[...Array(40)].map((_, i) => (
                <Line key={`bg-h-${i}`} x1="0" y1={`${i * 2.5}%`} x2="100%" y2={`${i * 2.5}%`} stroke={primaryColor} strokeWidth={0.2} />
             ))}
             {[...Array(40)].map((_, i) => (
                <Line key={`bg-v-${i}`} x1={`${i * 2.5}%`} y1="0" x2={`${i * 2.5}%`} y2="100%" stroke={primaryColor} strokeWidth={0.2} />
             ))}
          </Svg>

          <View style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: 300, backgroundColor: primaryColor, opacity: 0.05 }} />
          <View style={{ position: 'absolute', bottom: -150, right: -150, width: 500, height: 500, borderRadius: 250, backgroundColor: primaryColor, opacity: 0.04 }} />
          
          <Svg style={{ position: 'absolute', top: '50%', left: '50%', width: 800, height: 800, transform: 'translate(-400px, -400px)', opacity: 0.1 }} height="800" width="800">
             <Circle cx="400" cy="400" r="380" fill="none" stroke={primaryColor} strokeWidth={1} strokeDasharray="10,10" />
             <Circle cx="400" cy="400" r="300" fill="none" stroke={primaryColor} strokeWidth={0.5} />
             <Path d="M400 0 L400 800 M0 400 L800 400" stroke={primaryColor} strokeWidth={0.5} opacity={0.3} />
          </Svg>

          <View style={{ position: 'absolute', top: 80, right: 80, width: 100, height: 100, borderTopWidth: 6, borderRightWidth: 6, borderColor: primaryColor, opacity: 0.1 }} />
          <View style={{ position: 'absolute', bottom: 80, left: 80, width: 100, height: 100, borderBottomWidth: 6, borderLeftWidth: 6, borderColor: primaryColor, opacity: 0.1 }} />
          
          <Svg style={{ position: 'absolute', top: '20%', left: '15%', opacity: 0.15 }} height="100" width="100">
             <Rect x="0" y="0" width="50" height="50" fill={primaryColor} opacity={0.4} />
             <Rect x="50" y="50" width="50" height="50" fill={primaryColor} opacity={0.2} />
          </Svg>
        </View>
      );

  }
};

const SlideRenderer = ({ slide }: { slide: SlideData }) => {
  const settings = slide.settings || {};
  const primaryColor = settings.primaryColor || '#4f46e5';

  const renderTitle = (text?: string, customStyles?: any) => {
    if (!text) return null;
    return (
      <PdfMarkdown 
        style={customStyles || [styles.title, { color: primaryColor }]} 
        textStyle={{ color: primaryColor, fontSize: customStyles?.fontSize || 48, fontWeight: 700 }} 
        primaryColor={primaryColor}
      >
        {text}
      </PdfMarkdown>
    );
  };

  const renderContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {renderTitle(slide.title, [styles.title, { fontSize: 80, textAlign: 'center', color: primaryColor, marginBottom: 24 }])}
            {slide.subtitle && <PdfMarkdown style={[styles.subtitle, { textAlign: 'center' }]} textStyle={{ fontSize: 32, color: '#64748b' }} primaryColor={primaryColor}>{slide.subtitle}</PdfMarkdown>}
            {slide.author && <Text style={{ fontSize: 24, color: '#94a3b8', marginTop: 40 }}>{slide.author}</Text>}
          </View>
        );

      case 'text':
        return (
          <View style={{ flex: 1 }}>
            {renderTitle(slide.title)}
            <PdfMarkdown style={styles.content} textStyle={{ color: '#334155' }} primaryColor={primaryColor}>{slide.content || ''}</PdfMarkdown>
          </View>
        );

      case 'bullets':
      case 'agenda':
        const items = slide.type === 'bullets' ? slide.bullets : slide.items;
        return (
          <View style={{ flex: 1 }}>
            {renderTitle(slide.title)}
            <View style={{ marginTop: 20 }}>
              {items.map((item: string, i: number) => (
                <View key={i} style={styles.bullet}>
                  <Text style={[styles.bulletPoint, { color: primaryColor }]}>•</Text>
                  <PdfMarkdown style={{ ...styles.content, flex: 1 }} textStyle={{ color: '#334155' }} primaryColor={primaryColor}>{item}</PdfMarkdown>
                </View>
              ))}
            </View>
          </View>
        );

      case 'quote':
        return (
          <View style={{ flex: 1, justifyContent: 'center', padding: 80 }}>
            <PdfMarkdown style={{ marginBottom: 40 }} textStyle={{ fontSize: 48, fontWeight: 700, color: '#0f172a', fontStyle: 'italic', lineHeight: 1.4 }} primaryColor={primaryColor}>{`"${slide.quote}"`}</PdfMarkdown>
            <Text style={{ fontSize: 32, color: primaryColor, textAlign: 'right' }}>- {slide.author}</Text>
          </View>
        );

      case 'split-text':
        return (
          <View style={{ flex: 1 }}>
            {renderTitle(slide.title)}
            <View style={{ flexDirection: 'row', flex: 1, gap: 40, marginTop: 20 }}>
              <View style={{ flex: 1, paddingRight: 20 }}>
                <PdfMarkdown style={styles.content} textStyle={{ color: '#334155' }} primaryColor={primaryColor}>{slide.leftContent || ''}</PdfMarkdown>
              </View>
              <View style={{ width: 1, backgroundColor: '#e2e8f0' }} />
              <View style={{ flex: 1, paddingLeft: 20 }}>
                <PdfMarkdown style={styles.content} textStyle={{ color: '#334155' }} primaryColor={primaryColor}>{slide.rightContent || ''}</PdfMarkdown>
              </View>
            </View>
          </View>
        );

      case 'image-text':
        return (
          <View style={{ flex: 1 }}>
            {renderTitle(slide.title)}
            <View style={{ flexDirection: slide.imagePosition === 'right' ? 'row' : 'row-reverse', flex: 1, gap: 40, marginTop: 20 }}>
              <View style={{ flex: 1 }}>
                <PdfMarkdown style={styles.content} textStyle={{ color: '#334155' }} primaryColor={primaryColor}>{slide.textContent || ''}</PdfMarkdown>
              </View>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {slide.imageUrl && (
                  <Image src={slide.imageUrl} style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} />
                )}
              </View>
            </View>
          </View>
        );

      case 'grid':
        return (
          <View style={{ flex: 1 }}>
            {renderTitle(slide.title)}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
              {slide.items.map((item: any, i: number) => (
                <View key={i} style={{ width: '31%', backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: item.color || primaryColor, marginBottom: 12 }}>{item.title}</Text>
                  <PdfMarkdown style={{ fontSize: 18, color: '#475569', lineHeight: 1.5 }} textStyle={{ color: '#475569' }} primaryColor={primaryColor}>{item.description || ''}</PdfMarkdown>
                </View>
              ))}
            </View>
          </View>
        );
        
      case 'images':
        return (
          <View style={{ flex: 1 }}>
            {renderTitle(slide.title)}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, flex: 1, alignContent: 'flex-start' }}>
               {slide.images.map((img: string, i: number) => (
                <View key={i} style={{ width: slide.images.length === 1 ? '100%' : '48%', height: 300 }}>
                  <Image src={img} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
                </View>
               ))}
            </View>
          </View>
        );

      case 'medical-title':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            {slide.eyebrow ? <Text style={{ fontSize: 20, color: primaryColor, marginBottom: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>{slide.eyebrow}</Text> : null}
            {renderTitle(slide.title, [styles.title, { fontSize: 60, textAlign: 'center', color: primaryColor, marginBottom: 24 }])}
            {slide.subtitle ? <PdfMarkdown style={[styles.subtitle, { textAlign: 'center', marginBottom: 30 }]} textStyle={{ fontSize: 24, color: '#475569' }} primaryColor={primaryColor}>{slide.subtitle}</PdfMarkdown> : null}
            {slide.categories && slide.categories.length > 0 ? (
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                {slide.categories.map((cat: string, index: number) => (
                  <View key={index} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: primaryColor }}>
                    <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: 'bold' }}>{cat}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );

      case 'medical-contents':
        return (
          <View style={{ flex: 1, padding: 20 }}>
            {slide.eyebrow ? <Text style={{ fontSize: 18, color: primaryColor, textTransform: 'uppercase', marginBottom: 6, fontWeight: 'bold' }}>{slide.eyebrow}</Text> : null}
            {renderTitle(slide.title)}
            <View style={{ marginTop: 24, paddingLeft: 10 }}>
              {(slide.items || []).map((item: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <View style={{ width: 50, height: 40, backgroundColor: primaryColor, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>{item.number || `0${i+1}`}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>{item.title}</Text>
                    {item.description ? <PdfMarkdown textStyle={{ fontSize: 16, color: '#64748b' }} primaryColor={primaryColor}>{item.description}</PdfMarkdown> : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'medical-split':
        return (
          <View style={{ flex: 1, padding: 10 }}>
            {slide.eyebrow ? <Text style={{ fontSize: 16, color: primaryColor, textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' }}>{slide.eyebrow}</Text> : null}
            {renderTitle(slide.title)}
            
            <View style={{ flexDirection: 'row', flex: 1, gap: 40, marginTop: 20 }}>
              {/* Left Column (Visual Card) */}
              <View style={{ flex: 5, backgroundColor: '#fbfcff', borderLeftColor: primaryColor, borderLeftWidth: 4, borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16 }}>
                {slide.leftCard?.title ? <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>{slide.leftCard.title}</Text> : null}
                {slide.leftCard?.imageUrl ? <Image src={slide.leftCard.imageUrl} style={{ width: '100%', height: 260, borderRadius: 12, objectFit: 'cover', marginBottom: 12 }} /> : null}
                {slide.leftCard?.caption ? <PdfMarkdown textStyle={{ fontSize: 15, color: '#475569', fontStyle: 'italic' }} primaryColor={primaryColor}>{slide.leftCard.caption}</PdfMarkdown> : null}
              </View>

              {/* Right Column (Widget cards summary) */}
              <View style={{ flex: 7, gap: 16 }}>
                {(slide.rightCards || []).map((card: any, i: number) => (
                  <View key={i} style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderStyle: 'solid', borderWidth: 1, borderColor: '#f1f5f9' }}>
                    {card.title ? <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 8 }}>{card.title}</Text> : null}
                    
                    {card.type === 'list' && card.items ? (
                      <View style={{ gap: 8 }}>
                        {card.items.map((bullet: string, x: number) => (
                          <Text key={x} style={{ fontSize: 15, color: '#475569' }}>- {bullet}</Text>
                        ))}
                      </View>
                    ) : null}

                    {card.type === 'progress' && card.progressItems ? (
                      <View style={{ gap: 8 }}>
                        {card.progressItems.map((prog: any, x: number) => (
                          <View key={x} style={{ marginBottom: 6 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text style={{ fontSize: 14, color: '#475569', fontWeight: 'bold' }}>{prog.label}</Text>
                              <Text style={{ fontSize: 14, color: primaryColor, fontWeight: 'bold' }}>{prog.value}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
                              <View style={{ height: 6, backgroundColor: primaryColor, width: `${prog.value}%`, borderRadius: 3 }} />
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {card.type === 'icons' && card.iconItems ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {card.iconItems.map((icItem: any, x: number) => (
                          <View key={x} style={{ backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 14, color: '#475569' }}>{icItem.text}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {card.type === 'keypoint' ? (
                      <Text style={{ fontSize: 15, color: primaryColor, fontWeight: 'bold' }}>{card.text || ''}</Text>
                    ) : null}

                    {card.type === 'text' || !card.type ? (
                      <PdfMarkdown textStyle={{ fontSize: 15, color: '#475569' }} primaryColor={primaryColor}>{card.text || ''}</PdfMarkdown>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case 'medical-columns':
        return (
          <View style={{ flex: 1, padding: 10 }}>
            {slide.eyebrow ? <Text style={{ fontSize: 16, color: primaryColor, textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' }}>{slide.eyebrow}</Text> : null}
            {renderTitle(slide.title)}
            
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, flex: 1, alignItems: 'stretch' }}>
              {(slide.columns || []).map((col: any, i: number) => (
                <View key={i} style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>{col.title}</Text>
                  
                  {col.imageUrl ? <Image src={col.imageUrl} style={{ width: '100%', height: 100, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} /> : null}
                  
                  <View style={{ flexGrow: 1, gap: 6 }}>
                    {col.description ? <PdfMarkdown textStyle={{ fontSize: 13, color: '#475569', marginBottom: 6 }} primaryColor={primaryColor}>{col.description}</PdfMarkdown> : null}
                    {col.bullets && col.bullets.length > 0 ? (
                      <View style={{ gap: 4 }}>
                        {col.bullets.map((bullet: string, x: number) => (
                          <Text key={x} style={{ fontSize: 12, color: '#64748b' }}>• {bullet}</Text>
                        ))}
                      </View>
                    ) : null}
                  </View>

                  {col.management ? (
                    <View style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginTop: 8 }}>
                      <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 }}>Management</Text>
                      <PdfMarkdown textStyle={{ fontSize: 12, color: '#475569' }} primaryColor={primaryColor}>{col.management}</PdfMarkdown>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>

            {slide.keypoint ? (
              <View style={{ backgroundColor: '#fbfcff', borderLeftColor: primaryColor, borderLeftWidth: 4, borderRadius: 8, padding: 12, borderStyle: 'solid', marginTop: 16 }}>
                <PdfMarkdown textStyle={{ fontSize: 14, color: primaryColor }} primaryColor={primaryColor}>{slide.keypoint}</PdfMarkdown>
              </View>
            ) : null}
          </View>
        );

      default:
        return (
          <View style={{ flex: 1 }}>
            {renderTitle((slide as any).title || 'Slide')}
            <View style={{ padding: 20, backgroundColor: '#f8fafc', borderRadius: 8 }}>
               <Text style={{ fontSize: 20, color: '#64748b' }}>This slide type ({slide.type}) is rendered simplified in PDF export.</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <Page size={[1280, 720]} style={styles.page}>
      <SlidePdfBackground type={slide.type} primaryColor={primaryColor} />
      {renderContent()}
    </Page>
  );
};

export const PresentationPdfExport = ({ presentation }: { presentation: PresentationData }) => {
  return (
    <Document title={presentation.title} author="Arcane EXAMS">
      {presentation.slides.map((slide, index) => (
        <SlideRenderer key={slide.id || index} slide={slide} />
      ))}
    </Document>
  );
};
