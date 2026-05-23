import * as pdfjsLib from 'pdfjs-dist';
import { Question } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function normalizeArabicNumerals(str: string) {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, function (w) {
    return arabicNumbers.indexOf(w).toString();
  });
}

function normalizeWhitespace(text: string) {
  // Collapse multiple spaces
  let normalized = text.replace(/[ \t]+/g, ' ');
  // Remove line breaks within sentences, but preserve double line breaks
  normalized = normalized.replace(/(?<!\n)\n(?!\n)/g, ' ');
  // Ensure multiple line breaks stay as double line breaks
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  return normalized;
}

interface TextBlock {
  pageIndex: number;
  text: string;
  isSpecialPage: boolean;
}

export async function smartExtractPdfQuestions(file: File): Promise<Question[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const pagesData: TextBlock[] = [];
  
  // Phase 0: Text Preprocessing & Normalization
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];
    
    // Sort items by Y (top to bottom) then X (left to right)
    items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
    
    let pageText = "";
    let lastY: number | null = null;
    
    for (const item of items) {
      if (lastY !== null) {
        const yDiff = lastY - item.transform[5];
        if (yDiff > item.height * 1.5) {
          pageText += "\n\n";
        } else if (yDiff > item.height * 0.2) {
          pageText += "\n";
        } else {
          pageText += " ";
        }
      }
      pageText += item.str.trim();
      lastY = item.transform[5];
    }
    
    pageText = normalizeArabicNumerals(pageText);
    pageText = normalizeWhitespace(pageText);
    
    // Phase 1: Document Partitioning
    const isAnswerKey = /answer\s*key/i.test(pageText) || (pageText.match(/\b\d+\s*[\.\-\:]?\s*[A-E]\b/gi)?.length || 0) > 10;
    
    pagesData.push({
      pageIndex: i,
      text: pageText,
      isSpecialPage: isAnswerKey
    });
  }
  
  const contentPages = pagesData.filter(p => !p.isSpecialPage);
  const specialPages = pagesData.filter(p => p.isSpecialPage);
  
  const combinedContentText = contentPages.map(p => p.text).join('\n\n');
  const rawBlocks = combinedContentText.split(/\n\n+/);
  
  const questionBlocks: string[] = [];
  let currentBlock = "";
  // More robust Question identifier Regex
  const qIdentifierRegex = /^((?:Q|Question|السؤال)?\s*\.?\s*\d+[\.\-\:\)]?\s*)/i;
  
  for (let block of rawBlocks) {
    if (qIdentifierRegex.test(block)) {
      if (currentBlock) questionBlocks.push(currentBlock);
      currentBlock = block;
    } else {
      if (currentBlock) {
        currentBlock += "\n" + block;
      } else {
        // Might be a block before the first question, or a very poorly formatted question
        currentBlock = block;
      }
    }
  }
  if (currentBlock) questionBlocks.push(currentBlock);

  // Phase 5: Answer map parsing (Pass 1)
  const answerKeyMap: Record<number, string> = {};
  const specialText = specialPages.map(p => p.text).join('\n');
  const answerMatch = specialText.matchAll(/(?:Q(?:uestion)?\.?\s*)?(\d+)\s*[\-\:\.]?\s*([A-E]|True|False|T|F)(?=\s|$)/gi);
  for (const am of answerMatch) {
    const qn = parseInt(am[1], 10);
    let ans = am[2].toUpperCase();
    if (ans === 'T') ans = 'TRUE';
    if (ans === 'F') ans = 'FALSE';
    answerKeyMap[qn] = ans;
  }
  
  // Try to find answers scattered at bottom of content pages too if no special page
  if (Object.keys(answerKeyMap).length === 0) {
      const fallbackAnsMatch = combinedContentText.matchAll(/Answer\s*Key[\s\S]*?(?:Q(?:uestion)?\.?\s*)?(\d+)\s*[\-\:\.]?\s*([A-E]|True|False|T|F)(?=\s|$)/gi);
      for (const am of fallbackAnsMatch) {
        const qn = parseInt(am[1], 10);
        let ans = am[2].toUpperCase();
        if (ans === 'T') ans = 'TRUE';
        if (ans === 'F') ans = 'FALSE';
        answerKeyMap[qn] = ans;
      }
  }

  const results: Question[] = [];
  const questionHashSet = new Set<string>();
  
  // Phases 2, 3, 4, 5 (Pass 2), 6
  for (let block of questionBlocks) {
    block = block.trim();
    if (block.length < 5) continue;
    
    // Phase 2: Initial Parsing & Type Classification
    let type = "OPEN_ENDED";
    if (/(?:True\s*\/\s*False|T\s*\/\s*F)\s*\)?$/i.test(block)) {
      type = "TRUE_FALSE";
    } else if (/Match(?:ing)?\b/i.test(block) && (/\.{4,}/.test(block) || block.includes("Column A"))) {
      type = "MATCHING";
    } else if (/([A-E])[\)\.\-]\s+/.test(block) || /\n\s*\d+\.\s+/.test(block)) {
      type = "MCQ";
    }

    // Checking for Imperative Verbs
    const withoutQNum = block.replace(qIdentifierRegex, '').trim();
    if (/^(?:Enumerate|List|Define|Describe|Discuss|Compare|Explain|Mention|Outline|Formulate|What\s+are)\b/i.test(withoutQNum)) {
       type = "OPEN_ENDED"; // overrides if matching previously
    }

    // Phase 3: Detailed Multi-Pattern Question Number Extraction
    let qNum = -1;
    const match = block.match(qIdentifierRegex);
    if (match) {
      const numStr = match[1].replace(/[^\d]/g, '');
      qNum = parseInt(numStr, 10);
      block = block.substring(match[1].length).trim();
    } else {
      const fallbackMatch = block.match(/^(\d+)/);
      if (fallbackMatch && parseInt(fallbackMatch[1], 10) <= 1000) {
        qNum = parseInt(fallbackMatch[1], 10);
        block = block.substring(fallbackMatch[1].length).trim();
      }
    }
    
    const clean_question = block.replace(/^[\:\-\.]\s*/, ''); // strip leading noise
    let rootQuestion = clean_question;
    let finalOptions: string[] = [];
    let finalCorrectAnswer = "";

    // Phase 4: Specialized Parsers
    if (type === "MCQ") {
      const optRegex = /(?:^|\s|\n)([A-E])[\)\.\-]\s*(.*?)(?=(?:\s|\n)[A-E][\)\.\-]|$)/gi;
      let optMatch;
      let firstOptIndex = clean_question.length;
      const optionLetters = [];
      
      while ((optMatch = optRegex.exec(clean_question)) !== null) {
        if (optMatch.index < firstOptIndex) firstOptIndex = optMatch.index;
        optionLetters.push(optMatch[1].toUpperCase());
        finalOptions.push(optMatch[2].trim());
      }
      
      if (finalOptions.length >= 2) {
        rootQuestion = clean_question.substring(0, firstOptIndex).trim();
        // Phase 5 pass 2: link answer
        const ansLetter = answerKeyMap[qNum];
        if (ansLetter) {
            const letterIdx = optionLetters.indexOf(ansLetter);
            if (letterIdx !== -1) {
                finalCorrectAnswer = finalOptions[letterIdx];
            } else {
                finalCorrectAnswer = "Unknown (key mismatch)";
            }
        } else {
             // Try inline answer
             const answerTextSplit = clean_question.split(/Answer:/i);
             if (answerTextSplit.length > 1) {
                 const rawAns = answerTextSplit[1].trim();
                 rootQuestion = rootQuestion.replace(new RegExp(`Answer:\\s*${rawAns.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}`, 'i'), '').trim();
                 const letterMatch = rawAns.match(/^[A-E]/i);
                 if (letterMatch) {
                    const lIdx = optionLetters.indexOf(letterMatch[0].toUpperCase());
                    if (lIdx !== -1) finalCorrectAnswer = finalOptions[lIdx];
                    else finalCorrectAnswer = rawAns;
                 } else {
                    finalCorrectAnswer = rawAns;
                 }
             } else {
                 finalCorrectAnswer = finalOptions[0]; // fallback
             }
        }
      } else {
        type = "OPEN_ENDED";
      }
    } else if (type === "TRUE_FALSE") {
        rootQuestion = clean_question;
        finalOptions = ["True", "False"];
        const ansStr = answerKeyMap[qNum];
        if (ansStr === 'TRUE') finalCorrectAnswer = "True";
        else if (ansStr === 'FALSE') finalCorrectAnswer = "False";
        else finalCorrectAnswer = "True"; // fallback
    } else {
        // MATCHING or OPEN_ENDED
        rootQuestion = clean_question;
        const answerTextSplit = clean_question.split(/Answer:/i);
        if (answerTextSplit.length > 1) {
             finalCorrectAnswer = answerTextSplit[1].trim();
             rootQuestion = answerTextSplit[0].trim();
        } else {
             finalCorrectAnswer = "Open Ended Answer";
        }
    }

    // Phase 6: Post-Validation & De-duplication
    const hash = rootQuestion.trim().toLowerCase();
    if (!hash || questionHashSet.has(hash)) continue;
    questionHashSet.add(hash);
    
    // Check if it's a continuation (missing options or very short)
    if (results.length > 0 && hash.length < 15 && type === "OPEN_ENDED") {
        // Append to previous question
        const prev = results[results.length - 1];
        prev.question += "\n" + rootQuestion;
        continue;
    }

    results.push({
      id: Math.random().toString(36).substring(7),
      type: type === "MCQ" ? "mcq" : (type === "TRUE_FALSE" ? "mcq" : "essay"),
      question: rootQuestion,
      options: finalOptions.length > 0 ? finalOptions : undefined,
      correctAnswer: finalCorrectAnswer,
      explanation: ''
    });
  }

  return results;
}
