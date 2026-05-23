import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, ChevronRight, Copy, Check, FileText, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

import { copyToClipboard } from '../utils';

// Configure pdf.js worker locally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ExtractedImage {
  id: string;
  tag: string;
  dataUrl: string;
}

export const EasyQuestionWizard = ({ onBack, onExtractedData }: { onBack: () => void, onExtractedData?: (images: ExtractedImage[]) => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [extractedText, setExtractedText] = useState('');
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prompt options
  const [questionTypes, setQuestionTypes] = useState<string[]>(['Multiple Choice', 'True/False', 'Essay', 'Multi-Essay', 'Multi-Select', 'Fill in the Blanks', 'Matching']);
  const [enableBadges, setEnableBadges] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      
      let fullText = "";
      const internalImages: { id: string, tag: string, dataUrl: string, pages: Set<number> }[] = [];
      let imageCounter = 1;
      
      // Generate a unique session ID for this upload to prevent cross-contamination
      const sessionId = Math.random().toString(36).substring(2, 6).toUpperCase();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const imageElements: { tag: string, x: number, y: number, w: number, h: number, dataUrl: string }[] = [];
        
        if (ctx) {
            // Intercept canvas drawing to extract individual images!
            const originalDrawImage = ctx.drawImage;
            ctx.drawImage = function(image: any, ...args: any[]) {
                try {
                    // Ignore tiny UI artifacts or icons, expect real photos/diagrams
                    if (image && image.width > 50 && image.height > 50) {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = image.width;
                        tempCanvas.height = image.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        if (tempCtx) {
                            // @ts-ignore
                            tempCtx.drawImage(image, 0, 0, image.width, image.height);
                            const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
                            
                            const existingDuplicate = internalImages.find(img => img.dataUrl === dataUrl);
                            let tag = "";
                            if (!existingDuplicate) {
                                tag = `[IMAGEM-${sessionId}: ${imageCounter}]`;
                                internalImages.push({
                                    id: Math.random().toString(36).substring(2, 9),
                                    tag,
                                    dataUrl,
                                    pages: new Set([i])
                                });
                                imageCounter++;
                            } else {
                                tag = existingDuplicate.tag;
                                existingDuplicate.pages.add(i);
                            }
                            
                            // Check if this specific tag was ALREADY printed on THIS page
                            const alreadyOnPage = imageElements.some(ie => ie.tag === tag);
                            if (!alreadyOnPage) {
                                let yPos = 0;
                                let xPos = 0;
                                let w = image.width;
                                let h = image.height;
                                if (typeof ctx.getTransform === 'function') {
                                    const mat = ctx.getTransform();
                                    const corner1Y = mat.f;
                                    const corner2Y = mat.f + (image.height * mat.d) + (image.width * mat.b);
                                    yPos = Math.min(corner1Y, corner2Y);
                                    
                                    const corner1X = mat.e;
                                    const corner2X = mat.e + (image.width * mat.a) + (image.height * mat.c);
                                    xPos = Math.min(corner1X, corner2X);
                                    
                                    w = Math.abs(image.width * mat.a) + Math.abs(image.height * mat.c);
                                    h = Math.abs(image.height * mat.d) + Math.abs(image.width * mat.b);
                                }
                                
                                // Ignore images that span almost the entire page (backgrounds)
                                const isFullPage = Math.abs(w) > canvas.width * 0.8 && Math.abs(h) > canvas.height * 0.8;
                                if (!isFullPage) {
                                    imageElements.push({ tag, x: xPos, y: yPos, w: Math.abs(w), h: Math.abs(h), dataUrl });
                                } else {
                                    // Remove the page from the duplicate tracker since we're dropping the image on this page
                                    if (existingDuplicate) {
                                        existingDuplicate.pages.delete(i);
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Failed to extract image piece", e);
                }
                
                // @ts-ignore
                return originalDrawImage.apply(this, [image, ...args]);
            };

            const originalPutImageData = ctx.putImageData;
            ctx.putImageData = function(imageData: ImageData, dx: number, dy: number, ...args: any[]) {
                try {
                    if (imageData && imageData.width > 50 && imageData.height > 50) {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = imageData.width;
                        tempCanvas.height = imageData.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        if (tempCtx) {
                            tempCtx.putImageData(imageData, 0, 0);
                            const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
                            
                            const existingDuplicate = internalImages.find(img => img.dataUrl === dataUrl);
                            let tag = "";
                            if (!existingDuplicate) {
                                tag = `[IMAGEM-${sessionId}: ${imageCounter}]`;
                                internalImages.push({
                                    id: Math.random().toString(36).substring(2, 9),
                                    tag,
                                    dataUrl,
                                    pages: new Set([i])
                                });
                                imageCounter++;
                            } else {
                                tag = existingDuplicate.tag;
                                existingDuplicate.pages.add(i);
                            }
                            
                            const alreadyOnPage = imageElements.some(ie => ie.tag === tag);
                            if (!alreadyOnPage) {
                                const isFullPage = imageData.width > canvas.width * 0.8 && imageData.height > canvas.height * 0.8;
                                if (!isFullPage) {
                                    imageElements.push({ tag, x: dx, y: dy, w: imageData.width, h: imageData.height, dataUrl });
                                } else {
                                    if (existingDuplicate) existingDuplicate.pages.delete(i);
                                }
                            }
                        }
                    }
                } catch(e) {}
                
                // @ts-ignore
                return originalPutImageData.apply(this, [imageData, dx, dy, ...args]);
            };

            await page.render({ canvasContext: ctx, viewport }).promise;
        }
        
        // After rendering, combine text and images based on their spatial location
        // Extract text items with canvas bounding boxes
        const textItems = textContent.items.map((item: any) => {
            const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
            return { str: item.str, x, y };
        });
        
        const MARGIN_Y = 12; // Tolerance for grouping text into identical lines
        
        // Step 1: Group text chunks into contiguous horizontal lines
        const sortedTextItems = [...textItems].sort((a: any, b: any) => a.y - b.y || a.x - b.x);
        
        type TextLine = { id: number, x: number, y: number, text: string };
        const textLines: TextLine[] = [];
        let currentLine: any[] = [];
        let currentLineY = -1;
        let lineIdCounter = 0;

        sortedTextItems.forEach((item: any) => {
            if (currentLine.length === 0) {
                currentLine.push(item);
                currentLineY = item.y;
            } else {
                if (Math.abs(item.y - currentLineY) < MARGIN_Y) {
                    currentLine.push(item);
                } else {
                    currentLine.sort((a, b) => a.x - b.x);
                    const textContentStr = currentLine.map(t => t.str.trim()).filter(Boolean).join(' ');
                    if (textContentStr) {
                        textLines.push({ id: lineIdCounter++, x: currentLine[0].x, y: currentLineY, text: textContentStr });
                    }
                    currentLine = [item];
                    currentLineY = item.y;
                }
            }
        });
        
        if (currentLine.length > 0) {
            currentLine.sort((a, b) => a.x - b.x);
            const textContentStr = currentLine.map(t => t.str.trim()).filter(Boolean).join(' ');
            if (textContentStr) {
                textLines.push({ id: lineIdCounter++, x: currentLine[0].x, y: currentLineY, text: textContentStr });
            }
        }

        // Step 2: Group lines into Paragraphs
        type LayoutBlock = { id: number, text: string, topY: number, bottomY: number, leftX: number, rightX: number, isImage: boolean };
        const paragraphs: LayoutBlock[] = [];
        let currentPara: any = null;
        
        textLines.forEach(line => {
            const approxCharWidth = 6;
            const lineRightX = line.x + line.text.length * approxCharWidth;
            
            if (!currentPara) {
                currentPara = { 
                    id: lineIdCounter++, text: line.text, 
                    topY: line.y - 15, bottomY: line.y + 5, 
                    leftX: line.x, rightX: lineRightX, isImage: false 
                };
            } else {
                const yDiff = line.y - (currentPara.bottomY - 5);
                
                // If line is vertically close and horizontally aligned/contained
                const isCloseY = yDiff > -10 && yDiff < 40;
                const isCloseX = Math.abs(line.x - currentPara.leftX) < 150;
                
                if (isCloseY && isCloseX) {
                    currentPara.text += '\n' + line.text;
                    currentPara.bottomY = line.y + 5;
                    currentPara.leftX = Math.min(currentPara.leftX, line.x);
                    currentPara.rightX = Math.max(currentPara.rightX, lineRightX);
                } else {
                    paragraphs.push(currentPara);
                    currentPara = { 
                        id: lineIdCounter++, text: line.text, 
                        topY: line.y - 15, bottomY: line.y + 5, 
                        leftX: line.x, rightX: lineRightX, isImage: false 
                    };
                }
            }
        });
        if (currentPara) paragraphs.push(currentPara);

        // Step 3: Create image blocks
        const imageBlocks: LayoutBlock[] = imageElements.map(img => {
            return { 
                id: lineIdCounter++, 
                text: `\n\n[IMAGE-${sessionId}-TAG: ${img.tag}]\n\n`, 
                topY: img.y, 
                bottomY: img.y + (img.h || 50),
                leftX: img.x,
                rightX: img.x + (img.w || 50),
                isImage: true
            };
        });
        
        // Step 4: Structurally sort blocks
        const allBlocks = [...paragraphs, ...imageBlocks];
        
        allBlocks.sort((a, b) => {
            // Find vertical overlap
            const overlapStart = Math.max(a.topY, b.topY);
            const overlapEnd = Math.min(a.bottomY, b.bottomY);
            const overlap = overlapEnd - overlapStart;
            
            if (overlap > 0) {
                const heightA = Math.max(1, a.bottomY - a.topY);
                const heightB = Math.max(1, b.bottomY - b.topY);
                
                const overlapRatioA = overlap / heightA;
                const overlapRatioB = overlap / heightB;
                
                // If they have significant vertical overlap, sort left-to-right
                if (overlapRatioA > 0.3 || overlapRatioB > 0.3) {
                    return a.leftX - b.leftX;
                }
            }
            
            // Otherwise, sort top to bottom
            return a.topY - b.topY;
        });

        // Step 4: Refine flow. If an image is placed adjacent to text in a 2-column layout, it will flow naturally.
        const pageText = allBlocks.map(b => b.text).join('\n').replace(/\[IMAGE-[A-Za-z0-9]+-TAG:\s(.*?)]/g, '$1');
        let pageStr = `\n--- Page ${i} ---\n${pageText}\n`;

        
        fullText += pageStr;
      }
      
      // Post-process to remove background images (those that appear on many pages)
      const backgroundTags = new Set(
          internalImages
              .filter(img => img.pages.size > 1 && img.pages.size >= Math.max(3, pdf.numPages * 0.1))
              .map(img => img.tag)
      );
      
      for (const tag of backgroundTags) {
          fullText = fullText.split(`\n\n${tag}\n\n`).join("");
          fullText = fullText.split(`\n${tag}\n`).join("");
          fullText = fullText.split(tag).join("");
      }

      const images: ExtractedImage[] = internalImages
          .filter(img => !backgroundTags.has(img.tag))
          .map(img => ({ id: img.id, tag: img.tag, dataUrl: img.dataUrl }));

      setExtractedText(fullText);
      setExtractedImages(images);
      if (onExtractedData) {
          onExtractedData(images);
      }
      
      // Overwrite local storage vault to avoid old tags persisting across uploads
      try {
          localStorage.setItem('arcane_image_vault', JSON.stringify(images));
      } catch (e) {
          console.warn('Image vault could not be saved to local storage', e);
      }

      setStep(2);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process the PDF. Please try a different file.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyPrompt = () => {
    const typesStr = questionTypes.join(', ');
    
    // Build context-aware snippets for selected types
    const essaySnippet = questionTypes.includes('Essay') ? `
### Essay Questions Specifics
For Essay questions, the expected answer in the "correctAnswer" property MUST be super brief. Provide exactly only the core answer with the minimum amount of text possible. Do NOT include full sentences. E.g., if the question is "Who was the first person to walk on the Moon?", the answer must be "Neil Armstrong", NOT "Neil Armstrong was the first person to walk on the Moon."` : '';

    const multiEssaySnippet = questionTypes.includes('Multi-Essay') ? `
### Multi-Essay Questions Specifics
For Multi-Essay questions, you use the "multi_essay" type. These questions consist of a main case study, scenario, or context text, followed by multiple sub-questions that each require an essay response.
Supply a "subQuestions" array of objects. Each object should have an "id" (a unique string like "sq1"), a "question" string, and a "correctAnswer" string. The "correctAnswer" MUST be super brief, using the minimum amount of text possible, just like standard Essay questions.` : '';

    const trueFalseSnippet = questionTypes.includes('True/False') ? `
### True/False Questions Specifics
For True/False questions where the answer is **False**, you MUST identify the specific word or phrase in the question that makes it false. Provide this in a property called **wrongPart**. This must be an EXACT substring of the question text.` : '';

    const multiSelectSnippet = questionTypes.includes('Multi-Select') ? `
### Multi-Select Questions Specifics
For Multi-Select questions, provide the options in the "options" array. Provide the correct answers in a "correctAnswers" array.` : '';

    const fillSnippet = questionTypes.includes('Fill in the Blanks') ? `
### Fill in the Blanks Questions Specifics
For Fill in the Blanks questions, use "__________" (10 underscores) to represent each blank in the question text. Provide the correct answers in a "blanks" array in the order they appear. Provide a "wordBank" array containing correct answers and some distractors.` : '';

    const matchingSnippet = questionTypes.includes('Matching') ? `
### Matching Questions Specifics
For Matching questions, provide a "matchingPairs" array of objects, each with a "term" and a "definition".` : '';

    const formatSnippet = `Format the output as a JSON array of objects. Each object represents a question. 
Only include fields that are relevant to the question type.

Common Fields:
- "question": string (The question text. Use **bold** for negative constraints like **NOT**, **EXCEPT**, etc.)
- "type": "mcq" | "essay" | "multi_essay" | "true_false" | "multi_select" | "fill_in_blanks" | "matching"
- "imageUrl": string (Optional. Include the tag ONLY if the question requires it!)${enableBadges ? '\n- "badge": string (Optional badge text like "Important", "هام")' : ''}${includeExplanations ? '\n- "explanation": string (Detailed explanation with Markdown formatting)' : ''}

${questionTypes.some(t => ['Multiple Choice', 'Multi-Select', 'True/False', 'Multi-Essay', 'Fill in the Blanks', 'Matching', 'Essay'].includes(t)) ? `Type Specific Fields:
${questionTypes.includes('Multiple Choice') || questionTypes.includes('Multi-Select') ? '- "options": string[] (The available choices)\n' : ''}${questionTypes.includes('True/False') ? '- "options": ["True", "False"]\n' : ''}${questionTypes.includes('Multi-Select') ? '- "correctAnswers": string[] (List of correct options)\n' : ''}${questionTypes.includes('Multiple Choice') || questionTypes.includes('True/False') || questionTypes.includes('Essay') ? '- "correctAnswer": string (The correct option text, or a MINIMAL SUMMARY for Essay)\n' : ''}${questionTypes.includes('Multi-Essay') ? '- "subQuestions": { id: string, question: string, correctAnswer: string }[] (Used for Multi-Essay)\n' : ''}${questionTypes.includes('Fill in the Blanks') ? '- "blanks": string[] (The answers in order)\n- "wordBank": string[] (Answers and distractors)\n' : ''}${questionTypes.includes('Matching') ? '- "matchingPairs": { term: string, definition: string }[]\n- "matchingDistractors": string[]\n' : ''}${questionTypes.includes('True/False') ? '- "wrongPart": string (The specific word/phrase making it false)\n' : ''}` : ''}`;

    const prompt = `I am providing you with extracted text from a document. The text contains markers indicating where images were located, formatted as [IMAGEM-XXXX: Z].

Generate an exam in JSON format based on this text.
The exam should include ONLY the following Question Types: ${typesStr}.

CRITICAL INSTRUCTION FOR IMAGES AND CONTEXT:
Identify SMARTLY which images belong to which parts of the text. Use the proximity of the [IMAGEM-XXXX: Z] tags to the surrounding text to understand the context. 
If a question refers to or requires a specific image, you ABSOLUTELY MUST output the exact entire image tag as it appears in the text (e.g., [IMAGEM-XXXX: Z]) inside the question's 'imageUrl' field. Ensure the question content is directly related to what is shown in or described near that specific image tag.${essaySnippet}${multiEssaySnippet}${trueFalseSnippet}${multiSelectSnippet}${fillSnippet}${matchingSnippet}

### Question Formatting
Questions can also use Markdown for emphasis. Specifically:
- Use **bold** or *italics* for negative constraints like **NOT**, **EXCEPT**, or **INCORRECT**.
- Use **bold** for specific numbers or key identifiers in the question.

${includeExplanations ? `### IMPORTANT: Explanation Formatting
It is ESSENTIAL that each question includes a detailed, correct explanation. The explanation MUST use Markdown for better readability and emphasis:
- Use **bold** for key terms and concepts.
- Use *italics* for emphasis or secondary points.
- Use <mark>highlight</mark> tags for the most critical takeaways or the final answer.
- Use \`<term title="Definition here">unfamiliar word</term>\` for technical terms or complex vocabulary that students might not know. This will create an interactive tooltip in the app.
Explanations without these Markdown elements are considered incomplete.` : '### IMPORTANT: Skip Explanations\nDo NOT provide explanations for the questions. Keep the "explanation" field empty or omit it.'}

### Output JSON Format
${formatSnippet}

Here is the document text:
` + extractedText;

    copyToClipboard(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const toggleQuestionType = (type: string) => {
    setQuestionTypes(prev => 
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Easy Photo Mode</h2>
          <p className="text-sm font-bold text-slate-500">Perfectly sync PDF images with your AI-generated questions.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center py-12 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50">
            <Upload className="w-16 h-16 text-slate-400 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 mb-2">Upload your PDF</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md">We'll scan the document, securely extract text, and automatically detect any images to tag them for precise AI generation.</p>
            
            <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handlePdfUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isLoading}
              className="px-8 py-4 bg-amber-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl shadow-[0_4px_0_theme(colors.amber.700)] hover:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3 disabled:opacity-75 disabled:cursor-wait"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {isLoading ? "Extrating Data..." : "Select PDF Document"}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" /> Extracted Images ({extractedImages.length})
                </h3>
                {extractedImages.length === 0 ? (
                  <p className="text-slate-500 italic">No images detected in this document.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {extractedImages.map(img => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm border-2 border-slate-200 dark:border-slate-700">
                        <img src={img.dataUrl} alt={img.tag} className="w-full h-24 object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-black text-xs tracking-wider px-2 text-center">{img.tag}</span>
                        </div>
                        <div className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md">
                          {img.tag.replace(/[\[\]]/g, '')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-4">Prompt Configuration</h3>
                
                <div className="space-y-3 mb-6">
                    <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Question Types</p>
                    <div className="flex flex-wrap gap-2">
                        {['Multiple Choice', 'True/False', 'Identify from Image', 'Essay', 'Multi-Essay', 'Multi-Select', 'Fill in the Blanks', 'Matching'].map(type => (
                            <button
                                key={type}
                                onClick={() => toggleQuestionType(type)}
                                className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${questionTypes.includes(type) ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <p className="text-xs font-black uppercase text-slate-500 tracking-widest mt-4">Extra Options</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={enableBadges} onChange={(e) => setEnableBadges(e.target.checked)} />
                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Generate tags like "Important" or "هام"</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={includeExplanations} onChange={(e) => setIncludeExplanations(e.target.checked)} />
                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Include detailed AI explanations</span>
                    </label>
                </div>
                
                <button 
                  onClick={handleCopyPrompt} 
                  className={`w-full py-4 font-black uppercase text-sm tracking-widest rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-3 ${copied ? 'bg-emerald-500 text-white shadow-[0_4px_0_theme(colors.emerald.700)]' : 'bg-indigo-600 text-white shadow-[0_4px_0_theme(colors.indigo.800)]'}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? "Prompt Copied!" : "Copy AI Prompt"}
                </button>
                <p className="text-[10px] text-slate-500 mt-4 text-center">Paste this into Gemini or ChatGPT, then paste the resulting JSON/text back into the Parse Code tab.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl flex flex-col h-[500px]">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Document Text Viewer
              </h3>
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {extractedText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
