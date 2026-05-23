import React, { useState } from 'react';
import { PresentationHome } from './components/presentation/PresentationHome';
import { PresentationParser } from './components/presentation/PresentationParser';
import { PresentationBlockParser } from './components/presentation/PresentationBlockParser';
import { PresentationViewer } from './components/presentation/PresentationViewer';
import { BlockPresentationViewer } from './components/presentation/BlockPresentationViewer';
import { PresentationData } from './presentationTypes';
import { MindmapView } from './components/presentation/MindmapView';

interface PresentationModeProps {
  view: 'home' | 'parser' | 'viewer' | 'mindmap' | 'blocks' | 'block-viewer';
  setView: (view: 'home' | 'parser' | 'viewer' | 'mindmap' | 'blocks' | 'block-viewer') => void;
  onMindmapStateChange?: (state: 'parser' | 'map') => void;
}

export function PresentationMode({ view, setView, onMindmapStateChange }: PresentationModeProps) {
  const [presentation, setPresentation] = useState<PresentationData | null>(null);

  if (view === 'home') {
    return (
      <PresentationHome 
        onStart={() => setView('parser')} 
        onStartMindmap={() => setView('mindmap')}
        onStartBlocks={() => setView('blocks')}
      />
    );
  }
  
  if (view === 'parser') {
    return (
      <PresentationParser 
        onParsed={(data) => { 
          setPresentation(data); 
          setView('viewer'); 
        }} 
        onCancel={() => setView('home')} 
      />
    );
  }

  if (view === 'blocks') {
    return (
      <PresentationBlockParser 
        onParsed={(data) => { 
          setPresentation(data); 
          setView('block-viewer'); 
        }} 
        onCancel={() => setView('home')} 
      />
    );
  }

  if (view === 'viewer' && presentation) {
    return (
      <PresentationViewer 
        presentation={presentation} 
        onUpdatePresentation={setPresentation}
        onClose={() => setView('parser')} 
      />
    );
  }

  if (view === 'block-viewer' && presentation) {
    return (
      <BlockPresentationViewer 
        presentation={presentation} 
        onUpdatePresentation={setPresentation}
        onClose={() => setView('blocks')} 
      />
    );
  }

  if (view === 'mindmap') {
    return (
      <MindmapView 
        onClose={() => setView('home')}
        onStateChange={onMindmapStateChange}
      />
    );
  }

  return null;
}
