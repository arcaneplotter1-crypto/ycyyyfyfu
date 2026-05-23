import { Question } from '../types';

export const calculateQuestionPoints = (
  q: Question,
  answer: string,
  wrongPartSelection?: string,
  essayFb?: any,
  isRpg?: boolean
): number => {
  if (!answer && q.type !== 'essay') return 0;

  if (q.type === 'mcq') {
    return answer === q.correctAnswer ? 1 : 0;
  }
  
  if (q.type === 'true_false') {
    if (q.correctAnswer === 'True') {
      return answer === 'True' ? 1 : 0;
    } else {
      if (isRpg && answer === 'False') {
        return 1.5; // Always full points in RPG mode
      }
      let pts = 0;
      if (answer === 'False') pts += 0.5;
      if (q.wrongPart && wrongPartSelection === q.wrongPart) pts += 1;
      return pts;
    }
  }

  if (q.type === 'essay') {
    return (essayFb?.score ?? 0) >= 50 ? 2 : 0;
  }

  if (q.type === 'multi_essay') {
    if (!essayFb?.subFeedbacks) return 0;
    let pts = 0;
    Object.values(essayFb.subFeedbacks).forEach((fb: any) => {
      if ((fb.score ?? 0) >= 50) pts += 2;
    });
    return pts;
  }

  if (q.type === 'fill_in_blanks') {
    const selected = (answer || '').split('|');
    const correct = q.blanks || [];
    let pts = 0;
    for (let i = 0; i < correct.length; i++) {
        if (selected[i] === correct[i]) pts += 0.5;
    }
    return pts;
  }

  if (q.type === 'matching') {
    const selected = (answer || '').split('|').filter(Boolean);
    const pairs = q.matchingPairs || [];
    let pts = 0;
    
    const selectedObj: Record<string, string> = {};
    selected.forEach(s => {
      const idx = s.indexOf(':');
      if (idx > -1) {
        selectedObj[s.substring(0, idx)] = s.substring(idx + 1);
      }
    });

    pairs.forEach(p => {
      if (selectedObj[p.term] === p.definition) {
        pts += 0.5;
      }
    });
    return pts;
  }

  if (q.type === 'locate_on_image') {
    try {
      const selected = JSON.parse(answer || '[]');
      const correct = q.imageTargets || [];
      if (selected.length === correct.length && correct.length > 0) {
        const allMatch = correct.every((target: any) => {
          const sel = selected.find((s: any) => s.targetId === target.id);
          if (!sel) return false;
          const dx = sel.x - target.x;
          const dy = sel.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist <= target.radius;
        });
        return allMatch ? 1.5 : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  if (q.type === 'multi_select') {
    const selected = (answer || '').split('|').filter(Boolean).sort();
    const correct = (q.correctAnswers || []).slice().sort();
    return JSON.stringify(selected) === JSON.stringify(correct) ? 1 : 0;
  }

  return 0;
};
