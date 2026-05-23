import React from 'react';
import { TextAnimator } from '../components/TextAnimator';
import { AppTheme } from '../types';

interface AnimationContext {
  cumulativeDelay: number;
}

const processNode = (node: React.ReactNode, theme: AppTheme, context: AnimationContext): React.ReactNode => {
  if (typeof node === 'string' || typeof node === 'number') {
    const text = String(node);
    const currentDelay = context.cumulativeDelay;
    
    // Estimate duration for sequential flow (per character now)
    let charDuration = 0;
    const speed = theme.textAnimationSpeed || 1.0;
    if (theme.textAnimationType === 'typewriter') charDuration = 0.03 / speed;
    else if (theme.textAnimationType === 'scramble') charDuration = 0.08 / speed;
    else if (theme.textAnimationType === 'glitch') charDuration = 0.05 / speed;
    else charDuration = 0.04 / speed;
    
    context.cumulativeDelay += text.length * charDuration;
    return <TextAnimator text={text} type={theme.textAnimationType} enabled={theme.textAnimationEnabled} baseDelay={currentDelay} speed={speed} />;
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    // If the node has children, process them recursively
    if (element.props && element.props.children) {
      const children = React.Children.map(element.props.children, child => processNode(child, theme, context));
      return React.cloneElement(element, { children });
    }
  }

  return node;
};

export const animateChildren = (children: React.ReactNode, theme: AppTheme) => {
  const context: AnimationContext = { cumulativeDelay: 0 };
  return React.Children.map(children, child => processNode(child, theme, context));
};
