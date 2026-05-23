export type SlideType = 'title' | 'agenda' | 'text' | 'image-text' | 'split-text' | 'quote' | 'bullets' | 'images' | 'chart' | 'grid' | 'process' | 'timeline' | 'team' | 'medical-title' | 'medical-contents' | 'medical-split' | 'medical-columns' | 'block-slide';

export interface SlideStyleSettings {
  titleSize?: number; // percentage
  contentSize?: number; // percentage
  titleAlignment?: 'left' | 'center' | 'right';
  contentAlignment?: 'left' | 'center' | 'right';
  titleLetterSpacing?: number; // em
  contentLetterSpacing?: number; // em
  titleLineHeight?: number; // relative
  contentLineHeight?: number; // relative
  // Image Specific
  imageRadius?: number; // px
  imageShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  imageOpacity?: number; // 0-1
  imageSize?: number; // percentage of container
  imageFit?: 'cover' | 'contain' | 'fill';
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
  // Layout Specific
  columnGap?: number; // px
  itemSpacing?: number; // px
  showDivider?: boolean;
  disableAnimations?: boolean;
  primaryColor?: string;
  // Split Specific
  splitRatio?: number; // 0-100
  leftAlignment?: 'left' | 'center' | 'right';
  rightAlignment?: 'left' | 'center' | 'right';
  // Multi-Image Specific
  imageLayout?: 'grid' | 'horizontal' | 'vertical' | 'stacked';
  imageCount?: number; // 1-4
  // Bullet/Agenda Specific
  bulletsLayout?: 'list' | 'grid' | 'columns' | 'split';
  bulletsColumns?: number;
  bulletSpacing?: number;
  uiSize?: number; // percentage
  // Text Specific
  textLayout?: 'single' | 'columns';
  // Chart Specific
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  chartThickness?: number;
  // New Layout Specifics
  gridColumns?: number;
  showIcons?: boolean;
  stepStyle?: 'rounded' | 'square' | 'circle';
  timelineStyle?: 'horizontal' | 'vertical';
  cardStyle?: 'minimal' | 'glass' | 'bold';
  blockLayout?: 'split' | 'horizontal' | 'vertical' | 'grid' | 'sidebar' | 'staggered';
  showLayoutSwitcher?: boolean;
  slideTheme?: 'modern' | 'midnight' | 'cyberpunk' | 'clinical' | 'academic' | 'terminal';
}

export interface BaseSlide {
  id: string;
  type: SlideType;
  settings?: SlideStyleSettings;
}

export interface TitleSlideData extends BaseSlide {
  type: 'title';
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
}

export interface AgendaSlideData extends BaseSlide {
  type: 'agenda';
  title: string;
  items: string[];
}

export interface TextSlideData extends BaseSlide {
  type: 'text';
  title: string;
  content: string;
}

export interface SplitTextSlideData extends BaseSlide {
  type: 'split-text';
  title: string;
  leftContent: string;
  rightContent: string;
}

export interface ImageTextSlideData extends BaseSlide {
  type: 'image-text';
  title: string;
  textContent: string;
  imageUrl: string;
  imageUrls?: string[];
  imagePosition: 'left' | 'right' | 'top' | 'bottom';
}

export interface ImageSlideData extends BaseSlide {
  type: 'images';
  title?: string;
  images: string[];
}

export interface QuoteSlideData extends BaseSlide {
  type: 'quote';
  quote: string;
  author: string;
}

export interface BulletSlideData extends BaseSlide {
  type: 'bullets';
  title: string;
  bullets: string[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ChartSlideData extends BaseSlide {
  type: 'chart';
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
}

export interface GridItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface GridSlideData extends BaseSlide {
  type: 'grid';
  title: string;
  items: GridItem[];
}

export interface ProcessItem {
  id: string;
  label: string;
  description: string;
}

export interface ProcessSlideData extends BaseSlide {
  type: 'process';
  title: string;
  items: ProcessItem[];
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface TimelineSlideData extends BaseSlide {
  type: 'timeline';
  title: string;
  items: TimelineItem[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
}

export interface TeamSlideData extends BaseSlide {
  type: 'team';
  title: string;
  members: TeamMember[];
}

export interface MedicalTitleSlideData extends BaseSlide {
  type: 'medical-title';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  categories?: string[];
  themeBackground?: 'sky' | 'classic';
}

export interface MedicalContentsItem {
  id: string;
  number?: string;
  title: string;
  description?: string;
}

export interface MedicalContentsSlideData extends BaseSlide {
  type: 'medical-contents';
  eyebrow?: string;
  title: string;
  items: MedicalContentsItem[];
}

export interface MedicalSplitProgressItem {
  label: string;
  value: number;
}

export interface MedicalSplitIconItem {
  text: string;
  icon?: string;
}

export interface MedicalSplitSubCard {
  id: string;
  type: 'list' | 'progress' | 'icons' | 'keypoint' | 'text';
  title?: string;
  items?: string[];
  progressItems?: MedicalSplitProgressItem[];
  iconItems?: MedicalSplitIconItem[];
  text?: string;
}

export interface MedicalSplitSlideData extends BaseSlide {
  type: 'medical-split';
  eyebrow?: string;
  title: string;
  leftCard: {
    title: string;
    imageUrl: string;
    caption?: string;
  };
  rightCards: MedicalSplitSubCard[];
}

export interface MedicalColumnCard {
  id: string;
  title: string;
  icon?: string;
  imageUrl?: string;
  bullets?: string[];
  description?: string;
  management?: string;
}

export interface MedicalColumnsSlideData extends BaseSlide {
  type: 'medical-columns';
  eyebrow?: string;
  title: string;
  columns: MedicalColumnCard[];
  keypoint?: string;
}

export interface BlockSlideBlock {
  id: string;
  type: 'container' | 'photo' | 'textbox' | 'keypoint' | 'list' | 'progress' | 'icons' | 'comparison' | 'timeline' | 'mediaSplit';
  title?: string;
  text?: string;
  imageUrl?: string;
  caption?: string;
  bullets?: string[];
  progressItems?: { label: string; value: number }[];
  iconItems?: { text: string; icon?: string }[];
  // comparison block support
  pros?: string[];
  cons?: string[];
  prosTitle?: string;
  consTitle?: string;
  // timeline block support
  timelineItems?: { date?: string; title: string; description?: string }[];
  icon?: string;
  color?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

export interface BlockSlideData extends BaseSlide {
  type: 'block-slide';
  eyebrow?: string;
  title: string;
  blocks: BlockSlideBlock[];
}

export type SlideData = 
  | TitleSlideData 
  | AgendaSlideData 
  | TextSlideData 
  | SplitTextSlideData 
  | ImageTextSlideData 
  | ImageSlideData
  | QuoteSlideData 
  | BulletSlideData
  | ChartSlideData
  | GridSlideData
  | ProcessSlideData
  | TimelineSlideData
  | TeamSlideData
  | MedicalTitleSlideData
  | MedicalContentsSlideData
  | MedicalSplitSlideData
  | MedicalColumnsSlideData
  | BlockSlideData;

export interface PresentationData {
  id: string;
  title: string;
  slides: SlideData[];
  createdAt: number;
}
