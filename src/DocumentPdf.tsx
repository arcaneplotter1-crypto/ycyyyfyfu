import React, { useState } from 'react';
import { DocumentNode } from './DocumentMode';
import { FileText, Loader2 } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, Font, pdf, Svg, Circle, Path } from '@react-pdf/renderer';

const FONT_SRC_REGULAR = 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf';
const FONT_SRC_BOLD = 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf';
const FONT_SRC_EXTRABOLD = 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf';
const FONT_SRC_ITALIC = 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf';
const FONT_SRC_BOLD_ITALIC = 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKaMZg.ttf';

Font.register({
  family: 'InterPdf',
  fonts: [
    { src: FONT_SRC_REGULAR, fontWeight: 400 },
    { src: FONT_SRC_BOLD, fontWeight: 700 }, // bold
    { src: FONT_SRC_EXTRABOLD, fontWeight: 900 }, // extrabold
    { src: FONT_SRC_ITALIC, fontWeight: 400, fontStyle: 'italic' },
    { src: FONT_SRC_BOLD_ITALIC, fontWeight: 700, fontStyle: 'italic' }
  ]
});

// Create styles identical to visual layout
const styles = StyleSheet.create({
  page: { 
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 60,
    fontFamily: 'InterPdf', 
    backgroundColor: '#ffffff', 
    position: 'relative' 
  },
  topicBox: {
    backgroundColor: '#312e81',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 30,
    marginBottom: 32,
    marginTop: 0,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  topicText: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'InterPdf',
    fontWeight: 900,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  headerBox: {
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 30,
    marginBottom: 20,
    marginTop: 20,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    color: '#312e81',
    fontSize: 22,
    fontFamily: 'InterPdf',
    fontWeight: 900,
    textAlign: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
    alignItems: 'flex-start'
  },
  bulletMarker: {
    color: '#ec4899', // Pinkish color from image
    marginRight: 12,
    fontSize: 14,
    fontWeight: 700,
    marginTop: 1,
  },
  bulletText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 1.6,
    flex: 1
  },
  table: {
    width: '100%',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 700,
    flex: 1,
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tableHeaderCellInner: {
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#475569',
    fontSize: 11,
    flex: 1,
    lineHeight: 1.4
  },
  tableCellInner: {
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9'
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 700,
    color: '#1e293b',
    lineHeight: 1.5,
  },
  textbox: {
     borderWidth: 2,
     borderColor: '#f97316',
     borderStyle: 'dashed',
     borderRadius: 24,
     paddingTop: 36,
     paddingBottom: 24,
     paddingHorizontal: 24,
     marginTop: 32,
     marginBottom: 24,
     position: 'relative'
  },
  textboxTitleContainer: {
     position: 'absolute',
     top: -20,
     left: 0,
     right: 0,
     alignItems: 'center',
     zIndex: 10,
  },
  textboxTitleBox: {
     backgroundColor: '#fff7ed',
     borderWidth: 2,
     borderColor: '#f97316',
     borderRadius: 40,
     paddingVertical: 6,
     paddingHorizontal: 24,
  },
  textboxTitle: {
     fontSize: 16,
     fontWeight: 900,
     color: '#ea580c',
     textAlign: 'center'
  }
});

const renderWave = (color: string = '#ffffff', opacity: number = 0.1) => (
    <Svg style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 40 }} viewBox="0 0 500 40" preserveAspectRatio="none">
        <Path d="M0,20 C150,0 350,40 500,20 L500,40 L0,40 Z" fill={color} opacity={opacity} />
    </Svg>
);

const colorMap: Record<string, string> = {
  g: '#10b981',
  r: '#ef4444',
  b: '#3b82f6',
  y: '#f59e0b',
  p: '#8b5cf6',
  o: '#f97316',
};

const renderFormattedText = (text: string | null | undefined): React.ReactNode => {
  if (!text) return null;
  const regex = /(\*\*)(.*?)\1|(\*)(.*?)\3|(<u\s*>)(.*?)<\/u>|(==)(.*?)\7|\((g|r|b|y|p|o|#[0-9a-fA-F]{3,8})\((.*?)\)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Text key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</Text>);
    }
    
    if (match[1] === '**') {
      parts.push(<Text key={`b-${match.index}`} style={{ fontWeight: 700 }}>{renderFormattedText(match[2])}</Text>);
    } else if (match[3] === '*') {
      parts.push(<Text key={`i-${match.index}`} style={{ fontStyle: 'italic' }}>{renderFormattedText(match[4])}</Text>);
    } else if (match[5] && match[5].startsWith('<u')) {
      parts.push(<Text key={`u-${match.index}`} style={{ textDecoration: 'underline' }}>{renderFormattedText(match[6])}</Text>);
    } else if (match[7] === '==') {
      parts.push(<Text key={`h-${match.index}`} style={{ backgroundColor: '#fef08a' }}>{renderFormattedText(match[8])}</Text>);
    } else if (match[9]) {
      const colorCode = match[9];
      const content = match[10];
      const color = colorMap[colorCode] || colorCode;
      parts.push(<Text key={`c-${match.index}`} style={{ color, fontWeight: 700 }}>{renderFormattedText(content)}</Text>);
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(<Text key={`text-${lastIndex}`}>{text.substring(lastIndex)}</Text>);
  }
  
  return parts.length === 1 ? parts[0] : parts;
};

const renderDots = () => {
    const dots = [];
    for (let y = 10; y < 100; y += 22) {
        for (let x = 15; x < 500; x += 30) {
           dots.push(<Circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="#ffffff" opacity="0.1" />);
        }
    }
    return (
        <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} viewBox="0 0 500 100" preserveAspectRatio="none">
            {dots}
        </Svg>
    );
};

const renderNodeToPdf = (node: DocumentNode, parentType: string = 'root', index: number = 0): React.ReactNode => {
    let contentElement = null;
    let containerStyle: any = { marginBottom: 4 };

    if (node.type === 'topic') {
        contentElement = (
            <View wrap={false} style={styles.topicBox}>
                {renderDots()}
                <Text style={styles.topicText}>{renderFormattedText(node.content)}</Text>
                {renderWave('#ffffff', 0.15)}
            </View>
        );
        containerStyle = { marginBottom: 0 };
    }
    else if (node.type === 'header') {
        contentElement = (
            <View wrap={false} style={styles.headerBox}>
                <Text style={styles.headerText}>{renderFormattedText(node.content)}</Text>
                {renderWave('#312e81', 0.12)}
            </View>
        );
        containerStyle = { marginBottom: 0 };
    }
    else if (node.type === 'item') {
        const isNumbered = parentType === 'textbox';
        contentElement = (
            <View wrap={false} style={styles.bulletRow}>
                <Text style={styles.bulletMarker}>{isNumbered ? `${index + 1})` : '•'}</Text>
                <Text style={styles.bulletText}>{renderFormattedText(node.content)}</Text>
            </View>
        );
        containerStyle = { marginBottom: 0 };
    }
    else if (node.type === 'paragraph') {
        if (node.content.startsWith('|')) {
            const lines = node.content.split('\n');
            const columns = lines[0].split('|').map(s => s.trim()).filter(Boolean);
            const rows: string[][] = [];
            let startIdx = 1;
            if (lines[1] && lines[1].includes('---')) startIdx = 2;
            for (let i = startIdx; i < lines.length; i++) {
                if (lines[i].trim()) {
                    rows.push(lines[i].split('|').map(s => s.trim()).filter(Boolean));
                }
            }
            
            contentElement = (
                <View wrap={false} style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        {columns.map((col, idx) => (
                            <View key={idx} style={[styles.tableHeaderCell, idx < columns.length - 1 ? styles.tableHeaderCellInner : { flex: 1 }]}>
                                <Text>{renderFormattedText(col)}</Text>
                            </View>
                        ))}
                    </View>
                    {rows.map((row, rIdx) => (
                        <View key={rIdx} style={styles.tableRow}>
                            {row.map((cell, cIdx) => (
                                <View key={cIdx} style={[styles.tableCell, cIdx < row.length - 1 ? styles.tableCellInner : { flex: 1 }]}>
                                   <Text>{renderFormattedText(cell)}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            );
            containerStyle = { marginBottom: 12 };
        } else {
            contentElement = <Text style={styles.sectionTitle}>{renderFormattedText(node.content)}</Text>;
            containerStyle = { marginBottom: 0 };
        }
    }
    else if (node.type === 'section') {
        contentElement = <Text style={styles.sectionTitle}>{node.marker ? node.marker + ' ' : ''}{renderFormattedText(node.content)}</Text>;
        containerStyle = { marginBottom: 0 };
    }
    else if (node.type === 'subheader') {
        contentElement = <Text style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b', marginTop: 14, marginBottom: 4 }}>{renderFormattedText(node.content)}</Text>;
        containerStyle = { marginBottom: 0 };
    }
    else if (node.type === 'textbox') {
        contentElement = (
            <View wrap={false} style={styles.textbox}>
                {node.content && (
                    <View style={styles.textboxTitleContainer}>
                        <View style={styles.textboxTitleBox}>
                             <Text style={styles.textboxTitle}>{renderFormattedText(node.content)}</Text>
                        </View>
                    </View>
                )}
                <View style={{ marginTop: node.content ? 12 : 0 }}>
                    {node.children && node.children.map((child, idx) => (
                        renderNodeToPdf(child, 'textbox', idx)
                    ))}
                </View>
            </View>
        );
    }

    const hasChildren = node.children && node.children.length > 0;
    
    return (
        <View key={`${parentType}-${node.type}-${index}`} style={containerStyle}>
            {contentElement}
            {hasChildren && node.type !== 'textbox' && (
                <View style={{ paddingLeft: node.type === 'root' ? 0 : 20 }}>
                    {node.children.map((child, cIdx) => (
                        renderNodeToPdf(child, node.type, cIdx)
                    ))}
                </View>
            )}
        </View>
    );
};

const CustomDocument = ({ rootNode }: { rootNode: DocumentNode }) => {
    const mainTopicNode = rootNode.children.find(c => c.type === 'topic');
    const mainTopic = mainTopicNode ? mainTopicNode.content : "Document";
    const otherNodes = rootNode.children.filter(c => c !== mainTopicNode);
    const hasOtherContent = otherNodes.length > 0 || (mainTopicNode?.children.length ?? 0) > 0;

    return (
        <Document>
            {mainTopicNode && (
                <Page size="A4" style={[styles.page, { padding: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#312e81' }]}>
                    {renderDots()}
                    <View style={{ padding: 60, alignItems: 'center' }}>
                        <Text style={{ fontSize: 40, color: '#ffffff', fontWeight: 900, textAlign: 'center', marginBottom: 24, lineHeight: 1.2 }}>
                            {renderFormattedText(mainTopic)}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#c7d2fe', fontWeight: 400, letterSpacing: 3, textTransform: 'uppercase' }}>
                            Document Export
                        </Text>
                    </View>
                    <Svg style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 }} viewBox="0 0 500 150" preserveAspectRatio="none">
                        <Path d="M0,100 C150,20 350,120 500,50 L500,150 L0,150 Z" fill="#ffffff" opacity="0.1" />
                        <Path d="M0,120 C200,50 300,150 500,80 L500,150 L0,150 Z" fill="#ffffff" opacity="0.05" />
                    </Svg>
                </Page>
            )}
            {hasOtherContent && (
                <Page size="A4" style={styles.page}>
                    <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} viewBox="0 0 595 842">
                        <Path d="M 350 450 L 550 350 L 650 700 L 400 800 Z" fill="#f8fafc" opacity="0.6" />
                        <Path d="M 400 550 L 500 500 L 600 750 Z" fill="#f1f5f9" opacity="0.4" />
                    </Svg>
                    
                    <View style={{ width: '100%' }}>
                        {mainTopicNode && mainTopicNode.children.map((child, idx) => renderNodeToPdf(child, 'main', idx))}
                        {otherNodes.map((child, idx) => renderNodeToPdf(child, 'other', idx))}
                        {mainTopicNode && mainTopicNode.children.length === 0 && otherNodes.length === 0 && (
                            <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 40 }}>No content in document.</Text>
                        )}
                    </View>
                </Page>
            )}
        </Document>
    );
};

export const DocumentPdfExport = ({ 
    rootNode, 
    customTrigger 
}: { 
    rootNode: DocumentNode, 
    themeColor?: string,
    customTrigger?: (onClick: () => void, isGenerating: boolean) => React.ReactNode
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
      try {
        setIsGenerating(true);
        const blob = await pdf(<CustomDocument rootNode={rootNode} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Document-Export-${new Date().getTime()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Failed to generate PDF", e);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    };

    if (customTrigger) {
        return <>{customTrigger(generatePDF, isGenerating)}</>;
    }

    return (
        <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white font-bold text-xs sm:text-sm tracking-wide rounded-xl shadow-[0_4px_0_theme(colors.indigo.800)] hover:shadow-[0_2px_0_theme(colors.indigo.800)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase shrink-0 disabled:opacity-50"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating PDF...</span>
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4 text-indigo-200" />
                    <span>Export PDF</span>
                </>
            )}
        </button>
    );
};
