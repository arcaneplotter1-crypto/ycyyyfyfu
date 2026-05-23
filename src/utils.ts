import { Question, EssayFeedback, ExamSettings, AppTheme } from './types';
import Typo from 'typo-js';
import affData from '../node_modules/dictionary-en/index.aff?raw';
import dicData from '../node_modules/dictionary-en/index.dic?raw';

export const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'is', 'was', 'are', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'it', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

let dictionary: Typo | null = null;
let isDictionaryLoading = false;

export async function initSpellChecker() {
  if (dictionary || isDictionaryLoading) return;
  isDictionaryLoading = true;
  try {
    dictionary = new Typo("en_US", affData, dicData);
  } catch (e) {
    console.error("Failed to load dictionary", e);
  } finally {
    isDictionaryLoading = false;
  }
}

export function checkSpelling(text: string): string[] {
  if (!dictionary) return [];
  const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").split(/\s+/);
  const misspelled = new Set<string>();
  for (const word of words) {
    if (word.length > 2 && isNaN(Number(word))) {
      if (!dictionary.check(word)) {
        misspelled.add(word);
      }
    }
  }
  return Array.from(misspelled);
}

export function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stem(word: string): string {
  return word.replace(/(ing|ed|s|ly|es|ies)$/, "");
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

export function isFuzzyMatch(s1: string, s2: string): boolean {
  if (s1 === s2) return true;
  if (Math.abs(s1.length - s2.length) > 1) return false;
  
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  
  // Stricter threshold logic:
  // - 0 errors allowed for words length < 5
  // - 1 error allowed for words length 5-9
  // - 2 errors allowed for words length 10+
  let threshold = 0;
  if (maxLength >= 10) threshold = 2;
  else if (maxLength >= 5) threshold = 1;
  
  return distance <= threshold;
}

export function extractKeyTerms(text: string): string[] {
  const cleaned = cleanText(text);
  const words = cleaned.split(" ");
  return words
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w) && isNaN(Number(w)))
    .map(stem);
}

export function gradeEssay(studentAnswer: string, correctAnswer: string): EssayFeedback {
  const studentTermsList = extractKeyTerms(studentAnswer);
  const correctTermsList = extractKeyTerms(correctAnswer);
  
  const studentTerms = new Set(studentTermsList);
  const correctTerms = new Set(correctTermsList);

  // Use fuzzy matching for intersection
  const usedTermsList: string[] = [];
  const correctTermsArray = Array.from(correctTerms);
  const studentTermsArray = Array.from(studentTerms);

  for (const correctTerm of correctTermsArray) {
    // Check if any student term matches this correct term fuzzily
    const hasMatch = studentTermsArray.some(studentTerm => isFuzzyMatch(studentTerm, correctTerm));
    if (hasMatch) {
      usedTermsList.push(correctTerm);
    }
  }

  const intersection = new Set(usedTermsList);
  const union = new Set([...studentTerms, ...correctTerms]);

  const similarity = union.size === 0 ? 0 : intersection.size / union.size;
  const coverage = correctTerms.size === 0 ? 0 : intersection.size / correctTerms.size;

  const baseScore = (similarity * 0.4 + coverage * 0.6) * 100;
  
  const lengthBonus = Math.min(studentAnswer.length / 150, 25);
  const hasParagraphs = studentAnswer.includes("\n\n");
  const structureBonus = hasParagraphs ? 5 : 0;

  const finalScore = Math.round(Math.min(baseScore + lengthBonus + structureBonus, 100));
  
  let grade = "";
  let feedback = "";

  if (finalScore >= 90) {
    grade = "Excellent";
    feedback = "Outstanding answer! Covers all key concepts and demonstrates deep understanding.";
  } else if (finalScore >= 80) {
    grade = "Very Good";
    feedback = "Strong answer. Covers most key points with good detail.";
  } else if (finalScore >= 70) {
    grade = "Good";
    feedback = "Good effort. Covers main concepts but could benefit from more detail.";
  } else if (finalScore >= 60) {
    grade = "Satisfactory";
    feedback = "Addresses the question but misses some important points.";
  } else if (finalScore >= 50) {
    grade = "Needs Improvement";
    feedback = "Partially correct but missing major concepts.";
  } else {
    grade = "Poor";
    feedback = "Does not adequately address the question.";
  }

  const usedTerms = Array.from(intersection);
  const missingTerms = Array.from(correctTerms).filter(x => !studentTerms.has(x)).slice(0, 10);
  const misspelledWords = checkSpelling(studentAnswer);

  return {
    score: finalScore,
    grade,
    feedback,
    usedTerms,
    missingTerms,
    misspelledWords,
    length: studentAnswer.length,
    hasParagraphs
  };
}

export function matchStudyAnswer(typed: string, options: string[]): { 
  match: string | null; 
  isAmbiguous: boolean; 
  matches: string[] 
} {
  const cleanTyped = cleanText(typed);
  if (!cleanTyped) return { match: null, isAmbiguous: false, matches: [] };

  const matches = options.filter(option => {
    const cleanOption = cleanText(option);
    // Substring match
    if (cleanOption.includes(cleanTyped)) return true;
    // Fuzzy match (only if typed is long enough to avoid too many false positives)
    if (cleanTyped.length >= 3 && isFuzzyMatch(cleanTyped, cleanOption)) return true;
    return false;
  });

  if (matches.length === 1) {
    return { match: matches[0], isAmbiguous: false, matches };
  } else if (matches.length > 1) {
    // Check if one match is an exact match (ignoring case/spaces)
    const exactMatch = matches.find(m => cleanText(m) === cleanTyped);
    if (exactMatch) return { match: exactMatch, isAmbiguous: false, matches: [exactMatch] };
    
    return { match: null, isAmbiguous: true, matches };
  } else {
    return { match: null, isAmbiguous: false, matches: [] };
  }
}

function mapJsonToQuestion(q: any, index: number): Question {
  let questionText = q.question || 'Untitled Question';
  let imageUrl = q.imageUrl || q.image || q.photo || '';

  try {
    const vaultStr = localStorage.getItem('arcane_image_vault');
    if (vaultStr) {
      const vault = JSON.parse(vaultStr);
      const matchTag = (text: string) => vault.find((v: any) => text.includes(v.tag));
      
      let foundImg = matchTag(imageUrl);
      if (foundImg) {
        imageUrl = foundImg.dataUrl;
      } else {
        foundImg = matchTag(questionText);
        if (foundImg) {
          imageUrl = foundImg.dataUrl;
          questionText = questionText.replace(foundImg.tag, '').trim();
        }
      }
    }
  } catch (e) {
    console.warn("Failed to check image vault for JSON parsing", e);
  }

  if (!imageUrl) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = questionText.match(urlRegex);
    if (urls && urls.length > 0) {
      const imgUrl = urls.find((u: string) => /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(u) || u.includes('unsplash.com') || u.includes('images.'));
      if (imgUrl) {
        imageUrl = imgUrl;
        questionText = questionText.replace(imgUrl, '').trim();
      }
    }
  }

  const type = q.type?.toLowerCase();
  let questionType: import('./types').QuestionType = 'mcq';
  
  const rawCorrectAnswer = q.correctAnswer || '';
  const rawCorrectAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : (typeof rawCorrectAnswer === 'string' && rawCorrectAnswer.includes('|') ? rawCorrectAnswer.split('|').map((s: string) => s.trim()) : []);

  if (type === 'essay' || q.type === 'essay') questionType = 'essay';
  else if (type === 'multi_essay' || q.type === 'multi_essay' || (q.subQuestions && q.subQuestions.length > 0)) questionType = 'multi_essay';
  else if (type === 'true_false' || type === 'tf' || q.type === 'true_false') questionType = 'true_false';
  else if (type === 'matching' || (q.matchingPairs && q.matchingPairs.length > 0)) questionType = 'matching';
  else if (type === 'fill_in_blanks' || type === 'fib' || (q.blanks && q.blanks.length > 0) || questionText.includes('__________')) questionType = 'fill_in_blanks';
  else if (type === 'multi_select' || type === 'multiselect' || type === 'multiple_selection' || rawCorrectAnswers.length > 1) questionType = 'multi_select';
  else if (type === 'locate_on_image' || (q.imageTargets && q.imageTargets.length > 0)) questionType = 'locate_on_image';
  
  if (questionType === 'mcq' && Array.isArray(q.options) && q.options.length === 2 && 
      q.options.some((o: string) => o.toLowerCase() === 'true') && 
      q.options.some((o: string) => o.toLowerCase() === 'false')) {
    questionType = 'true_false';
  }

  const finalCorrectAnswers = rawCorrectAnswers.length > 0 ? rawCorrectAnswers : (rawCorrectAnswer ? [rawCorrectAnswer] : []);

  return {
    id: q.id || `q-${index}-${Math.random().toString(36).substr(2, 5)}`,
    type: questionType,
    badge: q.badge || '',
    question: questionText,
    imageUrl: imageUrl,
    options: questionType === 'true_false' ? ['True', 'False'] : (Array.isArray(q.options) ? q.options : []),
    correctAnswer: typeof rawCorrectAnswer === 'string' ? rawCorrectAnswer : '',
    correctAnswers: finalCorrectAnswers,
    wrongPart: q.wrongPart || '',
    explanation: q.explanation || '',
    matchingPairs: Array.isArray(q.matchingPairs) ? q.matchingPairs : [],
    matchingDistractors: Array.isArray(q.matchingDistractors) ? q.matchingDistractors : [],
    blanks: Array.isArray(q.blanks) ? q.blanks : [],
    wordBank: Array.isArray(q.wordBank) ? q.wordBank : [],
    imageTargets: Array.isArray(q.imageTargets) ? q.imageTargets : [],
    subQuestions: Array.isArray(q.subQuestions) ? q.subQuestions : []
  };
}

export function parseInput(text: string): Question[] {
  text = text.trim();
  if (!text) return [];

  const jsonQuestions: Question[] = [];

  const processJsonData = (data: any) => {
    const questionsArray = Array.isArray(data) ? data : (data.questions || []);
    if (Array.isArray(questionsArray)) {
      questionsArray.forEach((q: any) => {
        jsonQuestions.push(mapJsonToQuestion(q, jsonQuestions.length));
      });
    }
  };

  // Try JSON first - Full text
  try {
    const data = JSON.parse(text);
    processJsonData(data);
  } catch (e) {
    // If full parse failed, try to extract multiple JSON blocks (stacking)
    let braceLevel = 0;
    let bracketLevel = 0;
    let start = -1;
    let inString = false;
    let escape = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (char === '{' || char === '[') {
            if (braceLevel === 0 && bracketLevel === 0) start = i;
            if (char === '{') braceLevel++;
            else bracketLevel++;
        } else if (char === '}' || char === ']') {
            if (char === '}') braceLevel--;
            else bracketLevel--;
            
            if (braceLevel === 0 && bracketLevel === 0 && start !== -1) {
                const block = text.substring(start, i + 1);
                try {
                    const parsed = JSON.parse(block);
                    processJsonData(parsed);
                } catch (err) {}
                start = -1;
            }
        }
    }
  }

  if (jsonQuestions.length > 0) return jsonQuestions;

  // Fallback to CSV
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 1 && !text.includes('{') && !text.includes('[')) {
      // Simple CSV parsing (Question, Type, Options, CorrectAnswer, ImageUrl, Explanation, WrongPart, CorrectAnswers, Blanks, WordBank, MatchingPairs, MatchingDistractors, Badge)
      return lines.slice(1).map((line, index) => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma but ignore commas inside quotes
        const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, ''));
        const type = cleanParts[1]?.toLowerCase();
        let questionType: import('./types').QuestionType = 'mcq';
        if (type === 'essay') questionType = 'essay';
        else if (type === 'true_false' || type === 'tf') questionType = 'true_false';
        else if (type === 'matching' || cleanParts[10]) questionType = 'matching';
        else if (type === 'fill_in_blanks' || type === 'fib' || cleanParts[8] || cleanParts[0].includes('__________')) questionType = 'fill_in_blanks';
        else if (type === 'multi_select' || type === 'multiselect' || type === 'multiple_selection' || (cleanParts[7] && cleanParts[7].includes('|'))) questionType = 'multi_select';
        
        const options = questionType === 'true_false' ? ['True', 'False'] : (cleanParts[2] ? cleanParts[2].split('|').map(o => o.trim()) : []);
        const correctAnswers = cleanParts[7] ? cleanParts[7].split('|').map(o => o.trim()) : (cleanParts[3] ? cleanParts[3].split('|').map(o => o.trim()) : []);

        let imageUrl = cleanParts[4] || '';
        let questionText = cleanParts[0] || 'Untitled Question';
        
        try {
          const vaultStr = localStorage.getItem('arcane_image_vault');
          if (vaultStr) {
            const vault = JSON.parse(vaultStr);
            const matchTag = (text: string) => vault.find((v: any) => text.includes(v.tag));
            
            let foundImg = matchTag(imageUrl);
            if (foundImg) {
              imageUrl = foundImg.dataUrl;
            } else {
              foundImg = matchTag(questionText);
              if (foundImg) {
                imageUrl = foundImg.dataUrl;
                questionText = questionText.replace(foundImg.tag, '').trim();
              }
            }
          }
        } catch (e) {
          console.warn("Failed to check image vault for CSV parsing", e);
        }

        return {
          id: `q-csv-${index}`,
          question: questionText,
          type: questionType,
          badge: cleanParts[12] || '',
          options: options,
          correctAnswer: cleanParts[3] || (correctAnswers.length === 1 ? correctAnswers[0] : ''),
          imageUrl: imageUrl,
          explanation: cleanParts[5] || '',
          wrongPart: cleanParts[6] || '',
          correctAnswers: correctAnswers,
          blanks: cleanParts[8] ? cleanParts[8].split('|').map(o => o.trim()) : [],
          wordBank: cleanParts[9] ? cleanParts[9].split('|').map(o => o.trim()) : [],
          matchingPairs: cleanParts[10] ? cleanParts[10].split('|').map(pair => {
            const [term, def] = pair.split(':');
            return { term: term?.trim() || '', definition: def?.trim() || '' };
          }).filter(p => p.term && p.definition) : [],
          matchingDistractors: cleanParts[11] ? cleanParts[11].split('|').map(o => o.trim()) : [],
          imageTargets: []
        };
      });
    }

  // Final fallback: Try plain text parsing
  const questions: Question[] = [];
  const blocks = text.split(/\n\s*\n/);
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n').map(l => l.trim());
    const questionText = lines[0];
    const options: string[] = [];
    const correctAnswers: string[] = [];
    let type: import('./types').QuestionType = 'mcq';
    let explanation = '';
    let badge = '';

    for (let j = 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('correct:')) {
        const ans = line.split(':')[1].trim();
        if (ans.includes('|')) {
          correctAnswers.push(...ans.split('|').map(s => s.trim()));
          type = 'multi_select';
        } else {
          correctAnswers.push(ans);
        }
      } else if (line.toLowerCase().startsWith('explanation:')) {
        explanation = line.split(':')[1].trim();
      } else if (line.toLowerCase().startsWith('badge:') || line.toLowerCase().startsWith('sticker:')) {
        badge = line.split(':')[1].trim();
      } else if (/^[a-eA-E][\)\.]/.test(line) || /^[\-\*]/.test(line)) {
        options.push(line.replace(/^[a-eA-E][\)\.]\s*/, '').replace(/^[\-\*]\s*/, '').trim());
      }
    }

    if (options.length > 0 || questionText.includes('__________')) {
      if (questionText.includes('__________')) type = 'fill_in_blanks';
      
      let finalImageUrl = '';
      let finalQuestionText = questionText;
      try {
        const vaultStr = localStorage.getItem('arcane_image_vault');
        if (vaultStr) {
          const vault = JSON.parse(vaultStr);
          const matchTag = (text: string) => vault.find((v: any) => text.includes(v.tag));
          
          let foundImg = matchTag(finalQuestionText);
          if (foundImg) {
            finalImageUrl = foundImg.dataUrl;
            finalQuestionText = finalQuestionText.replace(foundImg.tag, '').trim();
          } else if (explanation && matchTag(explanation)) {
              foundImg = matchTag(explanation);
              finalImageUrl = foundImg.dataUrl;
          }
        }
      } catch (e) {}

      questions.push({
        id: `q-text-${i}`,
        question: finalQuestionText,
        type: type,
        badge: badge,
        options: options,
        correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : '',
        correctAnswers: correctAnswers,
        explanation: explanation,
        imageUrl: finalImageUrl,
        wrongPart: '',
        matchingPairs: [],
        matchingDistractors: [],
        blanks: [],
        wordBank: [],
        imageTargets: []
      });
    }
  }

  return questions;
}

/**
 * Robust copy to clipboard function with fallback for non-focused documents or unsupported environments.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try the modern Clipboard API first
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, attempting fallback:', err);
  }

  // Fallback: Use a hidden textarea and execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Ensure the textarea is part of the DOM but hidden
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) return true;
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }

  return false;
}

/**
 * Encodes the given questions, settings, and theme into a compact, URL-safe Base64 string.
 * Uses native Gzip compression if supported.
 */
export async function encodeExamData(questions: Question[], settings: ExamSettings, theme: AppTheme): Promise<string> {
  const payload = {
    q: questions.map(q => ({
      id: q.id,
      t: q.type,
      b: q.badge,
      q: q.question,
      i: q.imageUrl,
      o: q.options,
      c: q.correctAnswer,
      cs: q.correctAnswers,
      w: q.wrongPart,
      e: q.explanation,
      m: q.matchingPairs,
      md: q.matchingDistractors,
      bl: q.blanks,
      wb: q.wordBank,
      it: q.imageTargets,
      k: q.keywords,
      sq: q.subQuestions
    })),
    s: {
      tl: settings.timeLimitType,
      tv: settings.timeLimitValue,
      if: settings.instantFeedback,
      el: settings.essaysLast,
      il: settings.imagesLast,
      rq: settings.randomizeQuestions,
      ps: settings.powerSystemEnabled,
      gp: settings.guaranteedPowerPerCorrect,
      rpg: settings.rpgModeEnabled
    },
    th: {
      v: theme.visualStyle,
      a: theme.accentColor,
    }
  };
  
  const jsonStr = JSON.stringify(payload);

  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(jsonStr));
          controller.close();
        }
      });
      const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
      const chunks: Uint8Array[] = [];
      const reader = compressedStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      let binaryStr = "";
      for (let i = 0; i < result.length; i++) {
        binaryStr += String.fromCharCode(result[i]);
      }
      // URL-safe base64
      const b64 = btoa(binaryStr)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return 'gz:' + b64;
    } catch (err) {
      console.warn("Compression failed, falling back to uncompressed Base64", err);
    }
  }
  
  // Fallback (UTF-8 safe Base64)
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  let binaryStr = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStr += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binaryStr);
}

/**
 * Decodes a URL-safe Base64 string back into questions, settings, and theme objects.
 * Supports both modern Gzip compressed strings and uncompressed old formats.
 */
export async function decodeExamData(base64Str: string): Promise<{ questions: Question[], settings: ExamSettings, theme: AppTheme } | null> {
  try {
    let jsonStr: string;

    if (base64Str.startsWith('gz:')) {
      const b64Payload = base64Str.slice(3);
      // Restore standard base64 characters and padding
      let b64 = b64Payload.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) {
        b64 += '=';
      }
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      if (typeof DecompressionStream !== 'undefined') {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(bytes);
            controller.close();
          }
        });
        const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
        const chunks: Uint8Array[] = [];
        const reader = decompressedStream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }

        jsonStr = new TextDecoder().decode(result);
      } else {
        throw new Error("DecompressionStream not supported in this environment.");
      }
    } else {
      // Uncompressed old format
      const binaryStr = atob(base64Str);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    }

    const payload = JSON.parse(jsonStr);
    
    const questions: Question[] = payload.q.map((q: any) => ({
      id: q.id,
      type: q.t,
      badge: q.b,
      question: q.q,
      imageUrl: q.i,
      options: q.o,
      correctAnswer: q.c,
      correctAnswers: q.cs,
      wrongPart: q.w,
      explanation: q.e,
      matchingPairs: q.m,
      matchingDistractors: q.md,
      blanks: q.bl,
      wordBank: q.wb,
      imageTargets: q.it,
      keywords: q.k,
      subQuestions: q.sq
    }));
    
    const settings: ExamSettings = {
      timeLimitType: payload.s.tl || 'none',
      timeLimitValue: payload.s.tv || 60,
      instantFeedback: payload.s.if !== undefined ? payload.s.if : true,
      essaysLast: payload.s.el !== undefined ? payload.s.el : false,
      imagesLast: payload.s.il !== undefined ? payload.s.il : false,
      randomizeQuestions: payload.s.rq !== undefined ? payload.s.rq : false,
      powerSystemEnabled: payload.s.ps !== undefined ? payload.s.ps : false,
      guaranteedPowerPerCorrect: payload.s.gp !== undefined ? payload.s.gp : false,
      rpgModeEnabled: payload.s.rpg !== undefined ? payload.s.rpg : false,
    };
    
    const theme: AppTheme = {
      visualStyle: payload.th?.v || 'modern',
      accentColor: payload.th?.a || 'indigo',
      textAnimationEnabled: true,
      textAnimationType: 'fade-up',
      textAnimationSpeed: 1,
    };
    
    return { questions, settings, theme };
  } catch (e) {
    console.error("Failed to decode shared exam data", e);
    return null;
  }
}

