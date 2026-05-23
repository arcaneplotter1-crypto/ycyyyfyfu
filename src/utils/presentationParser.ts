import { SlideData, PresentationData, SlideType } from '../presentationTypes';

const parseCSV = (text: string): Record<string, string>[] => {
  // A basic reliable CSV parser handles quotes
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === '\n' && !insideQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !insideQuotes) {
      // skip \r
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values: string[] = [];
    let currentVal = '';
    let inQuote = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);

    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    result.push(obj);
  }

  return result;
};

export const parseFileToPresentation = async (file: File): Promise<PresentationData> => {
  const text = await file.text();
  let rawData: any = [];

  if (file.name.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        rawData = parsed;
      } else if (parsed && typeof parsed === 'object' && parsed.slides && Array.isArray(parsed.slides)) {
        rawData = parsed.slides;
      } else {
        rawData = [parsed];
      }
    } catch (e) {
      throw new Error('Invalid JSON file');
    }
  } else if (file.name.toLowerCase().endsWith('.csv')) {
    try {
      rawData = parseCSV(text);
    } catch (e) {
      throw new Error('Invalid CSV file');
    }
  } else {
    throw new Error('Unsupported file format. Please upload JSON or CSV.');
  }

  const slides: SlideData[] = rawData.map((item, index): SlideData => {
    const type = (item.type || 'text').toLowerCase() as SlideType;
    const base = { id: `slide-${index}-${Date.now()}`, type };

    switch (type) {
      case 'title':
        return { ...base, type: 'title', title: item.title || 'Untitled', subtitle: item.subtitle, author: item.author, date: item.date };
      case 'agenda':
        return { ...base, type: 'agenda', title: item.title || 'Agenda', items: Array.isArray(item.items) ? item.items : (item.items ? String(item.items).split('|') : []) };
      case 'split-text':
        return { ...base, type: 'split-text', title: item.title || '', leftContent: item.leftContent || '', rightContent: item.rightContent || '' };
      case 'image-text':
        return { ...base, type: 'image-text', title: item.title || '', textContent: item.textContent || item.content || '', imageUrl: item.imageUrl || '', imagePosition: (item.imagePosition === 'right' || item.imagePosition === 'top' || item.imagePosition === 'bottom') ? item.imagePosition : 'left' };
      case 'images':
        return { ...base, type: 'images', title: item.title || '', images: Array.isArray(item.images) ? item.images : (item.images ? String(item.images).split('|') : []) };
      case 'quote':
        return { ...base, type: 'quote', quote: item.quote || item.content || '', author: item.author || '' };
      case 'bullets':
        return { ...base, type: 'bullets', title: item.title || '', bullets: Array.isArray(item.bullets) ? item.bullets : (item.bullets ? String(item.bullets).split('|') : []) };
      case 'text':
      default:
        return { ...base, id: base.id, type: 'text', title: item.title || '', content: item.content || item.text || '' } as SlideData;
    }
  });

  return {
    id: `pres-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ''),
    slides,
    createdAt: Date.now()
  };
};
