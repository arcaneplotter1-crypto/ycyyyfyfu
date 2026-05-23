import { Question, PdfDocument, PdfBlock, AppTheme, QuestionType, EssayFeedback } from '../types';

/**
 * Converts a set of exam questions into a PdfDocument format
 * that can be rendered by the PdfExport component.
 */
export const convertQuestionsToPdfDocument = (
  questions: Question[],
  examName: string,
  theme: AppTheme,
  showAnswers: boolean = false,
  includeExplanations: boolean = false,
  photoPushBlocks: number = 1,
  userAnswers?: Record<string, string>,
  essayFeedback?: Record<string, EssayFeedback>
): PdfDocument => {
  const blocks: PdfBlock[] = [];

  // Sort questions by type: MCQ -> Multi-Select -> True/False -> Essay -> Fill -> Matching -> Multi-Essay
  const typeOrder: QuestionType[] = ['mcq', 'multi_select', 'true_false', 'essay', 'fill_in_blanks', 'matching', 'multi_essay'];
  const sortedQuestions = [...questions].sort((a, b) => {
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });

  // 1. Introduction Block
  blocks.push({
    type: 'heading',
    content: examName || 'Examination Report'
  });

  const isResultsMode = !!userAnswers;
  const stats = `Total Questions: ${questions.length} • Date: ${new Date().toLocaleDateString()}${showAnswers ? ' • [[Answered Version]]' : ''} ${isResultsMode ? ' • [[Report Card]]' : ''}`;
  blocks.push({
    type: 'paragraph',
    content: `**${stats}**`
  });

  // 2. Questions Section
  let currentType: QuestionType | null = null;
  
  const typeLabels: Record<string, string> = {
    mcq: 'Multiple Choice Questions',
    multi_select: 'Multiple Selection Questions',
    true_false: 'True or False',
    essay: 'Essay & Open Response',
    multi_essay: 'Structured Multi-Part Essays',
    fill_in_blanks: 'Fill in the Blanks',
    matching: 'Matching Exercises'
  };

  const typeColors: Record<string, string> = {
    mcq: '#3b82f6', // Blue
    multi_select: '#dc2626', // Red
    true_false: '#a855f7', // Purple
    essay: '#f97316', // Orange
    multi_essay: '#d946ef', // Magenta/Fuchsia
    fill_in_blanks: '#10b981', // Emerald/Green
    matching: '#d97706' // Amber
  };

  sortedQuestions.forEach((q, index) => {
    const qColor = typeColors[q.type] || '#6366f1';
    const userAnswer = userAnswers?.[q.id];
    const qFeedback = essayFeedback?.[q.id];

    // Add Section Header when type changes
    if (q.type !== currentType) {
      currentType = q.type;
      blocks.push({
        type: 'subheading',
        content: `SECTION: ${typeLabels[q.type] || q.type.toUpperCase()}`,
        color: qColor
      });
    }

    // Image if exists (User requested image ABOVE question)
    if (q.imageUrl) {
      blocks.push({
        type: 'image',
        content: '',
        imageUrl: q.imageUrl,
        imageWidth: 40, 
        imageAlignment: 'center',
        imageBlocks: photoPushBlocks
      });
    }

    // Question Text with Numbering
    if (q.question) {
      let qText = `**${index + 1})** ${q.question}`;
      if (q.badge) {
        qText += `  ==**[ ${q.badge} ]**==`;
      }
      if (q.type === 'multi_select' && q.correctAnswers) {
        qText += ` **(Select ${q.correctAnswers.length})**`;
      }
      blocks.push({
        type: 'paragraph',
        content: qText,
        color: qColor
      });
    }

    // Handle User Answer for common types
    if (isResultsMode && userAnswer && (q.type === 'mcq' || q.type === 'multi_select' || q.type === 'true_false' || q.type === 'matching' || q.type === 'fill_in_blanks')) {
      blocks.push({
        type: 'text',
        content: `**Your Answer:** ${userAnswer.replace(/\|/g, ', ')}`,
        color: qColor
      });
    }

    // Question Options/Details based on type
    switch (q.type) {
      case 'mcq':
        if (q.options) {
          blocks.push({
            type: 'list',
            content: '',
            items: q.options.map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const isCorrect = showAnswers && opt === q.correctAnswer;
              return isCorrect ? `==**${label}) ${opt} (CORRECT)**==` : `${label}) ${opt}`;
            }),
            layout: 'split',
            color: qColor
          });
        }
        break;
      case 'multi_select':
        if (q.options) {
          blocks.push({
            type: 'list',
            content: '',
            items: q.options.map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const isCorrect = showAnswers && q.correctAnswers?.includes(opt);
              return isCorrect ? `==**${label}) ${opt} (CORRECT)**==` : `${label}) ${opt}`;
            }),
            layout: 'split',
            color: qColor
          });
        }
        break;
      case 'true_false':
        blocks.push({
          type: 'list',
          content: '',
          items: [
            (showAnswers && q.correctAnswer === 'True') ? '==**A) True (CORRECT)**==' : 'A) True',
            (showAnswers && q.correctAnswer === 'False') ? '==**B) False (CORRECT)**==' : 'B) False'
          ],
          layout: 'split',
          color: qColor
        });
        if (showAnswers && q.correctAnswer === 'False' && q.wrongPart) {
          blocks.push({
            type: 'note',
            content: `**Correction:** The statement is false because: *${q.wrongPart}*`,
            color: qColor
          });
        }
        break;
      case 'essay':
        if (isResultsMode && userAnswer) {
          blocks.push({
            type: 'note',
            content: `**Your Response:**\n${userAnswer}`,
            color: qColor
          });
          if (qFeedback) {
             blocks.push({
               type: 'explanation',
               content: `**Evaluation:** Score: ${qFeedback.score}% (${qFeedback.grade})\n\n${qFeedback.feedback}`,
               color: qColor
             });
          }
        }

        if (showAnswers) {
          blocks.push({
            type: 'note',
            content: `**Sample Answer/Key Points:**\n${q.correctAnswer || `*Keywords: ${q.keywords?.join(', ') || 'None provided'}*`}`,
            color: qColor
          });
        } else if (!isResultsMode) {
          blocks.push({
            type: 'essay_area',
            content: 'Student Response Area',
            color: qColor
          });
        }
        break;
      case 'multi_essay':
        if (q.subQuestions) {
          let parsedAnswers: Record<string, string> = {};
          if (userAnswer) {
            try { parsedAnswers = JSON.parse(userAnswer); } catch(e) {}
          }

          q.subQuestions.forEach((sq: any, sIdx: number) => {
            blocks.push({
              type: 'subheading',
              content: `${index + 1}.${sIdx + 1}. ${sq.question}`,
              color: qColor
            });

            if (isResultsMode) {
              const subAns = parsedAnswers[sq.id];
              const subFeed = qFeedback?.subFeedbacks?.[sq.id];
              if (subAns) {
                blocks.push({
                  type: 'note',
                  content: `**Your Response:**\n${subAns}`,
                  color: qColor
                });
              }
              if (subFeed) {
                 blocks.push({
                   type: 'explanation',
                   content: `**Evaluation:** Score: ${subFeed.score}% (${subFeed.grade})\n\n${subFeed.feedback}`,
                   color: qColor
                 });
              }
            }

            if (showAnswers) {
              blocks.push({
                type: 'note',
                content: `**Sample Answer:**\n${sq.correctAnswer || `*Keywords: ${sq.keywords?.join(', ') || 'None provided'}*`}`,
                color: qColor
              });
            } else if (!isResultsMode) {
              blocks.push({
                type: 'essay_area',
                content: `Question ${index + 1}.${sIdx + 1} Response Area`,
                color: qColor
              });
            }
          });
        }
        break;
      case 'matching':
        if (q.matchingPairs) {
          const terms = q.matchingPairs.map(p => p.term);
          const defs = [...q.matchingPairs.map(p => p.definition), ...(q.matchingDistractors || [])].sort(() => Math.random() - 0.5);
          
          blocks.push({
            type: 'paragraph',
            content: '*Match the following terms with their definitions:*',
            color: qColor
          });

          blocks.push({
            type: 'table' as any,
            content: '',
            columns: ['Terms', 'Definitions'],
            rows: Array.from({ length: Math.max(terms.length, defs.length) }).map((_, i) => [
              terms[i] ? `${i + 1}. ${terms[i]}` : '',
              defs[i] ? `${String.fromCharCode(65 + i)}. ${defs[i]}` : ''
            ]),
            color: qColor
          });

          if (showAnswers) {
            blocks.push({
              type: 'note',
              content: `**Answers:** ${q.matchingPairs.map(p => `${p.term} → ${p.definition}`).join('; ')}`,
              color: qColor
            });
          }
        }
        break;
      case 'fill_in_blanks':
        if (q.wordBank && q.wordBank.length > 0) {
          blocks.push({
            type: 'note',
            content: `**Word Bank:** ${q.wordBank.join(', ')}`,
            color: qColor
          });
        }
        if (showAnswers) {
          blocks.push({
            type: 'note',
            content: `**Correct Answers:** ${q.blanks?.join(', ') || 'N/A'}`,
            color: qColor
          });
        }
        break;
    }

    // Explanation Block
    if (showAnswers && includeExplanations && q.explanation) {
      blocks.push({
        type: 'explanation',
        content: q.explanation,
        color: qColor
      });
    }
  });

  // 3. Answer Key Section (Only if not already shown in questions)
  if (!showAnswers) {
    if (questions.length > 8) {
      blocks.push({
        type: 'page_break',
        content: ''
      });
    } else {
      blocks.push({
        type: 'horizontal_rule',
        content: ''
      });
    }

    blocks.push({
      type: 'heading',
      content: 'Answer Key'
    });

    const answerItems: string[] = sortedQuestions.map((q, index) => {
      let answerText = '';
      
      switch (q.type) {
        case 'mcq':
          answerText = q.correctAnswer || 'N/A';
          break;
        case 'multi_select':
          answerText = (q.correctAnswers || []).join(', ');
          break;
        case 'true_false':
          answerText = q.correctAnswer || 'N/A';
          break;
        case 'matching':
          answerText = (q.matchingPairs || []).map(p => `${p.term} → ${p.definition}`).join('; ');
          break;
        case 'fill_in_blanks':
          answerText = (q.blanks || []).join(', ');
          break;
        case 'essay':
          answerText = q.correctAnswer || `[Keywords: ${q.keywords?.join(', ') || 'N/A'}]`;
          break;
        case 'multi_essay':
          answerText = (q.subQuestions || []).map((sq, i) => `${i + 1}: ${sq.correctAnswer || (sq.keywords?.join(', ') || 'N/A')}`).join(' | ');
          break;
        default:
          answerText = q.correctAnswer || 'N/A';
      }

      return `**Q${index + 1}**: ${answerText}`;
    });

    // Split answers into chunks for a more compact layout
    blocks.push({
      type: 'list',
      content: '',
      items: answerItems,
      layout: 'split'
    });
  }

  // 4. Footer marker
  blocks.push({
    type: 'horizontal_rule',
    content: ''
  });
  blocks.push({
    type: 'subtitle',
    content: 'END OF EXAMINATION'
  });

  return {
    title: examName || 'Exam Results',
    blocks
  };
};
