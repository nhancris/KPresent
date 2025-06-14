
import { Theme, AnimationType, FontPairing, ColorPalette, SlideLayout } from './types';

export const INITIAL_SLIDE_PROMPT = "Create a KPresent about the future of AI in education, highlighting benefits, challenges, and potential applications in K-12 and higher education.";

export const DEFAULT_FONTS: FontPairing[] = [
  { heading: '"Georgia", serif', body: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { heading: '"Roboto Slab", serif', body: '"Roboto", sans-serif' },
  { heading: '"Playfair Display", serif', body: '"Lato", sans-serif' },
  { heading: '"Montserrat", sans-serif', body: '"Open Sans", sans-serif' },
  { heading: '"Arial Black", Gadget, sans-serif', body: '"Arial", Helvetica, sans-serif' },
];

export const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  { // Deep Ocean
    primary: '#0A2463', secondary: '#3E92CC', accent: '#FF5733',
    textOnPrimary: '#FFFFFF', textOnSecondary: '#FFFFFF', background: '#F0F4F8', textOnBackground: '#102A43',
    slideBackground: '#FFFFFF', titleText: '#0A2463', bodyText: '#334E68'
  },
  { // Forest Canopy
    primary: '#2F5233', secondary: '#5C821A', accent: '#E4A010',
    textOnPrimary: '#FFFFFF', textOnSecondary: '#FFFFFF', background: '#F5F5F5', textOnBackground: '#1D2A1F',
    slideBackground: '#FBFFF1', titleText: '#2F5233', bodyText: '#4A5B50'
  },
  { // Modern Tech
    primary: '#1A202C', secondary: '#2D3748', accent: '#4299E1', // slate-800, slate-700, blue-500
    textOnPrimary: '#E2E8F0', textOnSecondary: '#CBD5E0', background: '#0F172A', textOnBackground: '#E2E8F0', // slate-200, slate-300, slate-900, slate-200
    slideBackground: '#1E293B', titleText: '#90CDF4', bodyText: '#A0AEC0' // slate-800, blue-300, gray-400
  },
  { // Sunrise Glow
    primary: '#FF8C42', secondary: '#FFD36E', accent: '#FC4A1A',
    textOnPrimary: '#FFFFFF', textOnSecondary: '#402E32', background: '#FFF8F0', textOnBackground: '#59402C',
    slideBackground: '#FFFFFF', titleText: '#D95A13', bodyText: '#734031' // Corrected typo here from 734J31
  },
  { // Minimalist Grey
    primary: '#333333', secondary: '#555555', accent: '#007AFF', // Apple Blue
    textOnPrimary: '#FFFFFF', textOnSecondary: '#FFFFFF', background: '#F8F8F8', textOnBackground: '#222222',
    slideBackground: '#FFFFFF', titleText: '#111111', bodyText: '#444444'
  }
];

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'theme-deep-ocean', name: 'Deep Ocean',
    fontPairing: DEFAULT_FONTS[0], colorPalette: DEFAULT_COLOR_PALETTES[0],
    defaultSlideTransition: AnimationType.FADE_IN,
  },
  {
    id: 'theme-forest-canopy', name: 'Forest Canopy',
    fontPairing: DEFAULT_FONTS[1], colorPalette: DEFAULT_COLOR_PALETTES[1],
    defaultSlideTransition: AnimationType.WIPE_RIGHT,
  },
  {
    id: 'theme-modern-tech', name: 'Modern Tech (Dark)',
    fontPairing: DEFAULT_FONTS[2], colorPalette: DEFAULT_COLOR_PALETTES[2],
    defaultSlideTransition: AnimationType.ZOOM_IN,
  },
   {
    id: 'theme-sunrise-glow', name: 'Sunrise Glow',
    fontPairing: DEFAULT_FONTS[3], colorPalette: DEFAULT_COLOR_PALETTES[3],
    defaultSlideTransition: AnimationType.FLY_IN_UP,
  },
  {
    id: 'theme-minimalist-grey', name: 'Minimalist Grey',
    fontPairing: DEFAULT_FONTS[4], colorPalette: DEFAULT_COLOR_PALETTES[4],
    defaultSlideTransition: AnimationType.FADE_IN,
  }
];

export const AVAILABLE_FONTS_FOR_SELECT = DEFAULT_FONTS.map(fp => [
    { name: `Heading: ${fp.heading.split(',')[0].replace(/"/g, '')}`, value: fp.heading }, 
    { name: `Body: ${fp.body.split(',')[0].replace(/"/g, '')}`, value: fp.body }
]).flat();

export const AVAILABLE_ANIMATIONS = Object.entries(AnimationType).map(([key, value]) => ({
  name: key.replace(/_/g, ' '),
  value: value,
}));

export const AVAILABLE_LAYOUTS = Object.entries(SlideLayout).map(([key, value]) => ({
  name: key.replace(/_/g, ' '),
  value: value,
}));

export const TONES = ["Formal", "Casual", "Persuasive", "Informative", "Inspirational", "Humorous"];
export const STYLES = ["Minimalist", "Corporate", "Playful", "Artistic", "Bold", "Elegant"];

export const SLIDE_COUNT_OPTIONS = [3, 5, 7, 10, 12, 15];

export const ELEMENT_TYPE_ICON_MAP: Record<string, string> = {
  text: "M7 4a.75.75 0 01.75.75V17h1.5a.75.75 0 010 1.5H4.25a.75.75 0 010-1.5H5.75V4.75A.75.75 0 016.5 4H7zm7.25 1.5a.75.75 0 000-1.5H15a.75.75 0 000 1.5h-.75V11h.005a.75.75 0 01.75.75v.005h.005a.75.75 0 01.75.75v.005h.005a.75.75 0 01.75.75V14a.75.75 0 01-.75.75h-.005v.005a.75.75 0 01-.75.75h-.005v.005a.75.75 0 01-.75.75H14.5a.75.75 0 010-1.5h.75V14h-.005a.75.75 0 01-.75-.75v-.005h-.005a.75.75 0 01-.75-.75v-.005h-.005a.75.75 0 01-.75-.75V5.5h-.75z", // Path for 'T' icon for text
  image: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z", // Path for image icon
  chart_placeholder: "M3 13.5H4.5V10.5H3V13.5ZM6 13.5H7.5V4.5H6V13.5ZM9 13.5H10.5V7.5H9V13.5ZM12 13.5H13.5V1.5H12V13.5ZM15 13.5H16.5V9H15V13.5ZM18 13.5H19.5V6H18V13.5Z" // Path for chart icon
};
