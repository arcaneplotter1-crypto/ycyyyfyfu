export type PdfBlockType = 'high_yield' | 'note' | 'paragraph' | 'text' | 'plain' | 'subtitle' | 'caption' | 'heading' | 'subheading' | 'list' | 'warning' | 'code' | 'quote' | 'table' | 'summary' | 'step' | 'vocabulary' | 'image' | 'expandable' | 'reveal' | 'example' | 'explanation' | 'clinical_correlation' | 'tip' | 'reference' | 'dialogue' | 'bento' | 'flashcard' | 'container' | 'horizontal_rule' | 'page_break' | 'essay_area' | 'disease' | 'disease_subtype';

export type PdfBlockLayout = 'stack' | 'grid' | 'columns' | 'bento' | 'split' | 'timeline';
export type PdfBlockRole = 'primary' | 'secondary' | 'accent' | 'meta';

export type PdfColorCycleTrigger = 'group' | 'document' | 'heading' | 'subheading';

export interface PdfBlock {
  type: PdfBlockType;
  content: string;
  items?: string[]; // for list, step
  language?: string; // for code
  term?: string; // for vocabulary
  definition?: string; // for vocabulary
  columns?: string[]; // for table
  rows?: string[][]; // for table
  imageUrl?: string; // for image
  imageWidth?: number; // for image (percentage)
  imageAlignment?: 'left' | 'center' | 'right'; // for image
  imageCaption?: string; // for image
  imageBlocks?: number; // how many blocks to pull alongside the image in PDF
  imageAspectRatio?: number; // for image height estimation
  blocks?: PdfBlock[]; // for bento
  front?: string; // for flashcard
  back?: string; // for flashcard
  subType?: string;
  layout?: PdfBlockLayout;
  role?: PdfBlockRole;
  title?: string;
  children?: PdfBlock[];
  icon?: string;
  color?: string;
}

export interface PdfAugmentation {
  term: string;
  type: 'explanation' | 'photo' | 'exam' | 'teacher' | 'note' | 'warning' | 'flashcard' | 'lab' | 'mechanism' | 'root' | 'highlight' | 'underline';
  value: string;
  occurrenceIndex?: number;
  color?: string;
  localImage?: string;
  page?: number;
  questions?: Question[];
  teacherScript?: string;
  teacherClinicalCase?: string;
  teacherMiniQuiz?: { question: string; answer: string };
  teacherMnemonics?: string[];
  teacherImage?: string;
  warningError?: string;
  flashcardFront?: string;
  flashcardBack?: string;
  labNormalRange?: string;
  labUnit?: string;
  labHypo?: string;
  labHyper?: string;
  mechanismLevels?: { level1: string; level2: string; level3: string };
  rootSlices?: { prefix: string; meaning: string; color: string }[];
}

export interface DrawingPath {
  id: string;
  page: number;
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface HighlightInfo {
  id: string;
  page: number;
  wordIdx: number;
  color: string;
}

export type ToolMode = 'none' | 'pen' | 'eraser' | 'highlight' | 'note';

export interface PdfAugmentedDocument {
  pdfUrl: string;
  name: string;
  augmentations: PdfAugmentation[];
}

export interface OverlaySettings {
  showIcons: boolean;
  lineOpacity: number;
  lineHeight: number;
  readerMode: boolean;
  enableTools?: boolean;
  responsiveFit?: boolean;
}

export interface PdfDocument {
  title: string;
  group?: string;
  blocks: PdfBlock[];
}

export type QuestionType = 'mcq' | 'essay' | 'true_false' | 'matching' | 'fill_in_blanks' | 'multi_select' | 'locate_on_image' | 'multi_essay';

export interface ImageTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  label?: string;
}

export interface EssayFeedback {
  score: number;
  grade: string;
  feedback: string;
  usedTerms: string[];
  missingTerms: string[];
  misspelledWords?: string[];
  length: number;
  hasParagraphs: boolean;
  subFeedbacks?: Record<string, EssayFeedback>;
}

export interface SubQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  keywords?: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  badge?: string;
  question: string;
  imageUrl?: string;
  options?: string[]; // For MCQ, Multi-Select
  correctAnswer?: string; // For MCQ/Essay
  correctAnswers?: string[]; // For Multi-Select
  wrongPart?: string; // For True/False questions where answer is False
  explanation?: string;
  matchingPairs?: { term: string; definition: string }[]; // For Matching
  matchingDistractors?: string[]; // Extra definitions/matches for Matching
  blanks?: string[]; // For Fill in the Blanks (correct words)
  wordBank?: string[]; // For Fill in the Blanks (available words)
  imageTargets?: ImageTarget[]; // For locate_on_image
  keywords?: string[]; // For Essay hints
  subQuestions?: SubQuestion[]; // For multi_essay
}

export type AccentColor = 
  | 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'lime' 
  | 'brutal-red' | 'brutal-blue' | 'brutal-yellow' | 'brutal-green'
  | 'creeper-green' | 'enderman-purple'
  | 'tadc-kinger' | 'tadc-caine'
  | 'duck-yellow' | 'duck-orange' | 'duck-blue' | 'duck-white'
  | 'undertale-red' | 'undertale-blue'
  | 'saidi-white' | 'saidi-cream' | 'saidi-dark' | 'saidi-gold'
  | 'arcane-violet' | 'arcane-red' | 'arcane-blue' | 'arcane-gold' | 'arcane-green' | 'arcane-neon-pink' | 'arcane-plasma-cyan' | 'arcane-void-purple' | 'arcane-solar-flare'
  | 'finn-blue' | 'jake-yellow'
  | 'ultimate-cosmic' | 'ultimate-easter'
  | 'superhero-spiderman' | 'superhero-batman' | 'superhero-superman'
  | 'hollow-knight-pale' | 'hollow-knight-silksong' | 'hollow-knight-white' | 'hollow-knight-black' | 'silksong-red' | 'silksong-gold'
  | 'kitler' | 'virus-marburg' | 'virus-rabies' | 'virus-hiv' | 'virus-smallpox' | 'virus-influenza'
  | 'liquid-glass-blue'
  | 'fluid-blue' | 'fluid-neon' | 'fluid-dark' | 'fluid-gold' | 'fluid-emerald' | 'fluid-crimson' | 'fluid-violet' | 'black-hole-dark' | 'space-black-hole-orange' | 'bubbles-blackhole' | 'emissive-black-hole' | 'geometric-aura-black-hole'
  | (string & {});
export type VisualStyle = 'modern' | 'brutalist' | 'game-minecraft' | 'tadc' | 'duck' | 'undertale' | 'saidi' | 'minimal' | 'arcane' | 'adventure-time' | 'ultimate' | 'superhero' | 'hollow-knight' | 'kitler' | 'virus' | 'liquid-glass' | 'fluid' | 'black-hole' | 'space-black-hole';

export type TextAnimationType = 'typewriter' | 'scramble' | 'fade-up' | 'blur-in' | 'glitch' | 'reveal' | 'bounce' | 'wave' | 'flip' | 'shimmer' | 'pop' | 'elastic';

export type LiquidGlassShape = 'convex_squircle' | 'convex_circle' | 'concave' | 'lip';

export interface UICustomization {
  enabled: boolean;
  uiSize: number;
  customFontUrl: string | null;
  performanceMode: boolean;
  previousPerformanceMode?: boolean;
  optimizationMode: boolean;
  dynamicBackgroundEnabled: boolean;
  dynamicBackgroundIntensity: number;
  borderRadius: number;
  spacing: number;
  blurEnabled: boolean;
  shadowsEnabled: boolean;
  textFontSize: number;
  textFontWeight: number;
  textLetterSpacing: number;
  textLineHeight: number;
  particleMaxConnections?: number;
  particleConnectionDistance?: number;
  particleMaxSize?: number;
  particleCount?: number;
  particleReduceLag?: boolean;
  liquidGlassThickness?: number;
  liquidGlassBezel?: number;
  liquidGlassIOR?: number;
  liquidGlassBlur?: number;
  liquidGlassSpecular?: number;
  liquidGlassTint?: number;
  liquidGlassShadow?: number;
  liquidGlassTintColor?: string;
  liquidGlassIridescence?: number;
  liquidGlassIridescenceSpeed?: number;
  liquidGlassLightDirX?: number;
  liquidGlassLightDirY?: number;
  liquidGlassShape?: LiquidGlassShape;
  liquidGlassScaleRatio?: number;
  liquidGlassShadowColor?: string;
  liquidGlassInnerShadowSpread?: number;
  liquidGlassOuterShadowBlur?: number;
  liquidGlassChromatic?: number;
  liquidGlassNoise?: number;
  liquidGlassEdgeGlow?: number;
  liquidGlassSaturation?: number;
  fluidBorderThickness?: number;
  fluidAnimationSpeed?: number;
  fluidBlobCount?: number;
  spaceBlackHoleColor?: string;
  spaceBlackHoleLensing?: number;
  spaceBlackHoleDiskSpeed?: number;
  spaceBlackHoleNoiseScale?: number;
  spaceBlackHoleX?: number;
  spaceBlackHoleY?: number;
  spaceBlackHoleZ?: number;
  spaceBlackHoleAutoRotate?: boolean;
  spaceBlackHoleRotateSpeed?: number;
  puddleSpeed?: number;
  puddlePower?: number;
  puddleDamping?: number;
  puddleHardness?: number;
  puddleSize?: number;
  puddleCustomBackground?: string;
  puddleCustomBackgroundType?: 'image' | 'video';
  puddleRaindrops?: boolean;
  puddleRaindropsIntensity?: number;
  puddleSpecular?: number;
  puddleRefraction?: number;
  neuralBaseColor?: string;
  neuralPulseSpeed?: number;
  neuralDensity?: number;
  neuralCameraSpeed?: number;
  neuralGlowStrength?: number;
  neuralPulseGlow?: number;
  neuralRainbowMode?: number;
  neuralShape?: 'neuron' | 'tree' | 'spiral';
  neuralScale?: number;
  bubblesHue?: number;
  bubblesSize?: number;
  bubblesBlur?: number;
  bubblesSpeed?: number;
  bubblesOrbCount?: number;
  bubblesPushing?: boolean;
}

export type OverlayShape = 'circle' | 'rect' | 'triangle' | 'diamond' | 'blob';
export type BackgroundShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'heart' | 'hexagon' | 'pentagon';
export type ShapeAnimation = 'none' | 'hover' | 'spin' | 'pulse' | 'float' | 'bounce' | 'shake' | 'swing' | 'slide' | 'zoom' | 'glitch';

export interface BackgroundOverlay {
  id: string;
  shape: OverlayShape;
  color: string;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  animation?: ShapeAnimation;
  animationSpeed?: number;
  animationDuration?: number;
  animationDelay?: number;
  blur?: number;
  zIndex?: number;
}

export interface BackgroundShape {
  id: string;
  type: BackgroundShapeType;
  color: string;
  opacity: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  animation: ShapeAnimation;
  animationSpeed: number;
  animationDuration: number;
  animationDelay?: number;
  blur?: number;
  zIndex?: number;
}

export interface ButtonConfig {
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: number;
  paddingX: number;
  paddingY: number;
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
  hoverScale: number;
  activeScale: number;
  animation: 'none' | 'pulse' | 'shimmer' | 'bounce' | 'glow';
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  italic: boolean;
}

export interface BackgroundConfig {
  backgroundColor: string;
  backgroundGradient?: {
    enabled: boolean;
    type: 'linear' | 'radial' | 'conic';
    colors: string[];
    angle: number;
    animation?: 'none' | 'spin' | 'shift' | 'pulse';
    animationSpeed?: number;
  };
  pattern?: {
    type: 'none' | 'dots' | 'grid' | 'stripes' | 'waves' | 'zigzag' | 'crosshatch' | 'polka' | 'chevrons';
    color: string;
    opacity: number;
    size: number;
    thickness: number;
    animation?: 'none' | 'slide' | 'fade' | 'zoom';
    animationSpeed?: number;
  };
  overlays: BackgroundOverlay[];
  shapes: BackgroundShape[];
}

export interface CustomTheme {
  id: string;
  name: string;
  backgroundColor: string;
  buttonColor: string;
  interfaceName: string;
  fontStyle: string;
  backgroundConfig?: BackgroundConfig;
  buttonConfig?: ButtonConfig;
}

export interface BlackHoleSettings {
  colors: string[];
  colorChangeOnClick: boolean;
  shape: 'infinity' | 'circle' | 'flower' | 'chaos' | 'spiral' | 'orbit' | 'wave' | 'cyclone' | 'hypnotic' | 'pulsar';
  interactWithCursor: boolean;
  strandCount?: number;
  strandLength?: number;
  animationSpeed?: number;
  bubblesPullPower?: number;
  bubblesPushPower?: number;
  bubblesSquishPower?: number;
  bubblesMicroParticles?: number;
  emissiveFrequency?: number;
  emissiveAmplitude?: number;
  emissiveEdgeWidth?: number;
  emissiveSpeed?: number;
  emissiveBloom?: number;
  emissiveBloomThreshold?: number;
  emissiveBloomRadius?: number;
  emissiveParticleVisible?: boolean;
  emissiveParticleBaseSize?: number;
  emissiveParticleSpeedFactor?: number;
  emissiveVelocityFactorX?: number;
  emissiveVelocityFactorY?: number;
  emissiveWaveAmplitude?: number;
  emissiveCustomBackground?: string;
  emissiveCustomBackgroundType?: 'none' | 'image' | 'video';
  emissiveShape?: 'torusKnot' | 'torus' | 'sphere' | 'icosahedron' | 'cube' | 'cylinder' | 'cone';
  geometricAuraStarCount?: number;
  geometricAuraSpeed?: number;
  geometricAuraScale?: number;
  geometricAuraCoreColor?: string;
  geometricAuraWireColor?: string;
  geometricAuraStarColor?: string;
  geometricAuraInnerRingColor?: string;
  geometricAuraOuterRingColor?: string;
  geometricAuraGasColor?: string;
  geometricAuraGridColor?: string;
  geometricAuraGridVisible?: boolean;
  geometricAuraBloomStrength?: number;
  geometricAuraWireOpacity?: number;
  geometricAuraSmartColorEnabled?: boolean;
  geometricAuraBaseColor?: string;
  geometricAuraRainbowMode?: boolean;
  geometricAuraRainbowSpeed?: number;
  geometricAuraShape?: 'icosahedron' | 'torusKnot' | 'torus' | 'sphere' | 'octahedron' | 'dodecahedron' | 'brain' | 'heart';
}

export interface AppTheme {
  visualStyle: VisualStyle;
  accentColor: AccentColor;
  textAnimationEnabled: boolean;
  textAnimationType: TextAnimationType;
  textAnimationSpeed: number;
  uiCustomization?: UICustomization;
  superheroAttackIndex?: number;
  customTheme?: CustomTheme;
  blackHoleSettings?: BlackHoleSettings;
}

export type PowerType = 'advantage' | 'offensive' | 'interactive';

export interface Power {
  id: string;
  name: string;
  type: PowerType;
  description: string;
  icon: string; // Lucide icon name
  supportedQuestionTypes?: QuestionType[];
}

export interface RpgItem {
  id: string; // unique generated ID
  name: string;
  icon: string;
  slot: "weapon" | "offhand" | "armor" | "boots" | "ring" | "charm";
  mods: {
    attack?: number;
    armor?: number;
    maxHp?: number;
    crit?: number;
    dodge?: number;
  };
  sellPrice: number;
}

export interface RpgProgression {
  totalCoins: number;
  stats: {
    maxHp: number;
    attack: number;
    defense: number;
  };
  unlockedUpgrades: Record<string, number>; // upgradeId -> level
  inventory: string[]; // static item IDs 
  backpack?: RpgItem[]; // Dynamic items
  dynamicEquipped?: {
    weapon: RpgItem | null;
    offhand: RpgItem | null;
    armor: RpgItem | null;
    boots: RpgItem | null;
    ring: RpgItem | null;
    charm: RpgItem | null;
  };
  equipped: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
    hero?: string | null;
  };
}

export interface ExamSettings {
  timeLimitType: 'per-question' | 'per-exam' | 'none';
  timeLimitValue: number; // in seconds
  instantFeedback: boolean;
  essaysLast: boolean;
  imagesLast: boolean;
  randomizeQuestions: boolean;
  powerSystemEnabled: boolean;
  guaranteedPowerPerCorrect: boolean;
  allowedPowerIds?: string[];
  powerDurations?: Record<string, number>;
  rpgModeEnabled?: boolean;
}

export interface ExamHistoryItem {
  id: string;
  name: string;
  date: number; // timestamp
  score: number;
  totalQuestions: number;
  questions: Question[];
  settings: ExamSettings;
  results: Record<string, string>;
  wrongPartSelections?: Record<string, string>;
  essayFeedback: Record<string, EssayFeedback>;
}

export interface SavedTerm {
  id: string;
  word: string;
  definition: string;
  date: number;
}

export interface SavedExam {
  id: string;
  name: string;
  questions: Question[];
  date: number;
}

export interface SavedPdf {
  id: string;
  name: string;
  documents: PdfDocument[];
  date: number;
}

export interface SavedAugmentation {
  id: string;
  name: string;
  document: PdfAugmentedDocument;
  date: number;
}

export interface ExamState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  essayFeedback?: Record<string, EssayFeedback>;
  wrongPartSelections?: Record<string, string>;
  isFinished: boolean;
  startTime: number;
  timeRemaining: number;
  questionTimes?: Record<string, number>;
  spentTimes?: Record<string, number>;
  lastActiveTime?: number;
  flags?: Record<string, { isFlagged: boolean; percentage?: number }>;
  obtainedPowers: Power[];
  activeOffensivePowers: string[];
  activeInteractivePowers: string[];
  powerEffects: {
    isFiftyFiftyActive?: boolean;
    isAbsolutelySmartActive?: boolean;
    isGlitchActive?: boolean;
    isInkSplashActive?: boolean;
    isMirrorActive?: boolean;
    isFogActive?: boolean;
    isEarthquakeActive?: boolean;
    isTimeWarpActive?: boolean;
    isHintActive?: boolean;
    isShieldActive?: boolean;
    isDoublePointsActive?: boolean;
    isAutoCompleteActive?: boolean;
    isClarityActive?: boolean;
    isStaticNoiseActive?: boolean;
    isUpsideDownActive?: boolean;
    isVibrationActive?: boolean;
    isColorShiftActive?: boolean;
    isClickChallengeActive?: boolean;
    isCircleHuntActive?: boolean;
    isSpinWheelActive?: boolean;
    isBugSquasherActive?: boolean;
    isPatternLockActive?: boolean;
    isSliderUnlockActive?: boolean;
    isPixelateActive?: boolean;
    isBlackoutActive?: boolean;
    isGravityActive?: boolean;
    isThermalActive?: boolean;
    isOldMovieActive?: boolean;
    isDrunkenActive?: boolean;
    isFrostActive?: boolean;
    isScannerActive?: boolean;
    isLowBatteryActive?: boolean;
    isJuiceActive?: boolean;
  };
}
