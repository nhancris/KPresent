
export enum AppState {
  INPUT = 'input',
  LOADING = 'loading',
  EDITING = 'editing',
}

export enum SlideLayout {
  TITLE_SLIDE = 'title_slide',
  TITLE_CONTENT = 'title_content',
  SECTION_HEADER = 'section_header',
  TWO_CONTENT = 'two_content',
  COMPARISON = 'comparison', // Similar to two_content but might have specific styling
  TITLE_ONLY = 'title_only',
  BLANK = 'blank',
  CONTENT_WITH_CAPTION = 'content_with_caption',
  PICTURE_WITH_CAPTION = 'picture_with_caption',
  QUOTE_SLIDE = 'quote_slide',
  BIG_NUMBER = 'big_number',
  SVG_CONTENT = 'svg_content', // New layout type for AI generated SVG
}

export enum AnimationType {
  NONE = 'none',
  FADE_IN = 'fade_in',
  FLY_IN_LEFT = 'fly_in_left',
  FLY_IN_RIGHT = 'fly_in_right',
  FLY_IN_UP = 'fly_in_up',
  FLY_IN_DOWN = 'fly_in_down',
  WIPE_LEFT = 'wipe_left',
  WIPE_RIGHT = 'wipe_right',
  WIPE_UP = 'wipe_up',
  WIPE_DOWN = 'wipe_down',
  ZOOM_IN = 'zoom_in',
}

export interface SlideElement { // May become less visually relevant or used for metadata/hotspots
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart_placeholder' | 'hotspot'; 
  content: string; 
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  fontSize?: number; 
  fontWeight?: 'normal' | 'bold' | 'semibold' | 'light';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string; 
  color?: string; 
  fontStyle?: 'normal' | 'italic' | 'oblique';
  lineHeight?: number | string; 
  textShadow?: string; 
  altText?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number | string;
  action?: string; // For hotspots on SVG
}

export interface Slide {
  id: string;
  layout: SlideLayout;
  title?: string; 
  elements?: SlideElement[]; // Now optional, SVG is primary for visuals
  svgContent?: string | null; // ADDED: For AI-generated SVG
  speakerNotes: string;
  slideTransition: AnimationType;
  backgroundColor?: string; 
  backgroundImage?: string;
  themeDescription?: string; // ADDED: Context for AI if regenerating slide
  notes?: string;
}

export interface ColorPalette {
  primary: string; 
  secondary: string; 
  accent: string; 
  textOnPrimary: string;
  textOnSecondary: string;
  background: string; 
  textOnBackground: string;
  slideBackground?: string; 
  titleText?: string;
  bodyText?: string;
}

export interface FontPairing {
  heading: string; 
  body: string;    
}
export interface Theme {
  id: string;
  name: string;
  fontPairing: FontPairing;
  colorPalette: ColorPalette;
  defaultSlideTransition: AnimationType;
}

export enum GenerationMode {
  NORMAL = 'normal',
  ADVANCED = 'advanced',
}

export interface KPresent {
  id: string;
  title: string;
  slides: Slide[];
  theme: Theme;
  userPrompt: string;
  originalTopic: string;
  requestedTone?: string;
  requestedStyle?: string;
  activeSlideId?: string | null;
  generationMode: GenerationMode; // ADDED
}

export interface KPresentUserPreferences {
  prompt: string;
  numSlides: number;
  tone?: string;
  style?: string;
  uploadedFiles?: File[];
  generationMode: GenerationMode; // ADDED
}

// For AI response structure
export interface KPresentAISlideResponse {
  svgContent: string;
  speakerNotes: string;
  titleSuggestion: string;
}
