
import { KPresent, Slide, SlideLayout, Theme, AnimationType, GenerationMode } from '../types';
import { DEFAULT_THEMES, AVAILABLE_LAYOUTS } from '../constants';
import { generateSlideDataWithGemini } from './GeminiService';

const uid = () => `id-${Math.random().toString(36).substring(2, 11)}`;

const generateSlideFromAI = async (
  layoutHint: SlideLayout, 
  mainTopic: string, 
  slideSpecificFocus: string, 
  slideNumber: number, 
  theme: Theme,
  generationMode: GenerationMode
): Promise<Partial<Slide>> => {
  const aiResponse = await generateSlideDataWithGemini(
    slideSpecificFocus,
    layoutHint,
    theme,
    slideNumber,
    mainTopic,
    generationMode
  );
  
  return { 
    title: aiResponse.titleSuggestion, 
    svgContent: aiResponse.svgContent,
    speakerNotes: aiResponse.speakerNotes,
    slideTransition: theme.defaultSlideTransition,
    layout: layoutHint, 
    themeDescription: `Theme: ${theme.name}. Mode: ${generationMode}. Primary: ${theme.colorPalette.primary}, Accent: ${theme.colorPalette.accent}. Heading: ${theme.fontPairing.heading}, Body: ${theme.fontPairing.body}.`
  };
};

export const generateMockPresentation = async (
  prompt: string,
  numSlidesRequested: number = 5,
  generationMode: GenerationMode = GenerationMode.NORMAL, // Added mode
  tone?: string,
  style?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadedFiles?: File[] 
): Promise<KPresent> => {
  const baseDelayPerSlide = generationMode === GenerationMode.ADVANCED ? 350 : 250;
  const randomDelayPerSlide = generationMode === GenerationMode.ADVANCED ? 250 : 200;
  const baseDelay = baseDelayPerSlide * numSlidesRequested;
  await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * randomDelayPerSlide * numSlidesRequested));

  const selectedTheme = DEFAULT_THEMES[Math.floor(Math.random() * DEFAULT_THEMES.length)];
  const overallTopic = prompt.length > 5 ? prompt.substring(0, Math.min(prompt.length, 60)).split(',')[0].trim() : "AI Presentation";

  const slides: Slide[] = [];
  
  let slidePlan: {layoutHint: SlideLayout, focus: string}[] = [];

  if (numSlidesRequested === 1) {
    slidePlan.push({layoutHint: SlideLayout.TITLE_SLIDE, focus: `Introduction to ${overallTopic}`});
  } else {
    slidePlan.push({layoutHint: SlideLayout.TITLE_SLIDE, focus: overallTopic});

    const bodySlideCount = numSlidesRequested - 2; 

    const potentialFocuses = [
      `Key Aspect 1 of ${overallTopic}`,
      `Benefits and Advantages of ${overallTopic}`,
      `Challenges and Solutions for ${overallTopic}`,
      `Real-world Application of ${overallTopic}`,
      `Future Trends in ${overallTopic}`,
      `Data Insights on ${overallTopic}`,
      `A Compelling Statistic about ${overallTopic}`,
      `A Quote related to ${overallTopic}`
    ];
    
    const bodyLayoutHints = [
        SlideLayout.TITLE_CONTENT, 
        SlideLayout.TWO_CONTENT, 
        SlideLayout.PICTURE_WITH_CAPTION, 
        SlideLayout.BIG_NUMBER,
        SlideLayout.QUOTE_SLIDE,
        SlideLayout.CONTENT_WITH_CAPTION,
    ];


    for (let i = 0; i < bodySlideCount; i++) {
        let focus = potentialFocuses[i % potentialFocuses.length];
        if (i > 0 && bodySlideCount > 3 && i === Math.floor(bodySlideCount/2)) { 
            slidePlan.push({layoutHint: SlideLayout.SECTION_HEADER, focus: `Exploring ${overallTopic} Further`});
        }
        slidePlan.push({
            layoutHint: bodyLayoutHints[i % bodyLayoutHints.length], 
            focus: `${focus}`
        });
    }
  }

  for (let i = 0; i < slidePlan.length; i++) {
    const planItem = slidePlan[i];
    const slideDataFromAI = await generateSlideFromAI(
      planItem.layoutHint, 
      overallTopic,
      planItem.focus, 
      i + 1, 
      selectedTheme,
      generationMode
    );
    slides.push({
      id: uid(),
      layout: planItem.layoutHint, 
      title: slideDataFromAI.title || `Slide ${i + 1}`,
      svgContent: slideDataFromAI.svgContent,
      elements: [], 
      speakerNotes: slideDataFromAI.speakerNotes || `Default speaker notes for slide ${i + 1}.`,
      slideTransition: slideDataFromAI.slideTransition || selectedTheme.defaultSlideTransition,
      backgroundColor: selectedTheme.colorPalette.slideBackground, 
      themeDescription: slideDataFromAI.themeDescription,
    });
  }
  
  if (numSlidesRequested > 1 && slides.length < numSlidesRequested) { // Ensure conclusion is added if space allows
    const conclusionFocus = `Thank You & Q&A`;
    const conclusionData = await generateSlideFromAI(
        SlideLayout.TITLE_ONLY, 
        overallTopic,
        conclusionFocus,
        slides.length + 1,
        selectedTheme,
        generationMode
    );
    slides.push({
        id: uid(),
        layout: SlideLayout.TITLE_ONLY,
        title: conclusionData.title || "Thank You / Q&A",
        svgContent: conclusionData.svgContent,
        elements: [],
        speakerNotes: conclusionData.speakerNotes || "Conclude the presentation, summarize key takeaways, and open for questions.",
        slideTransition: AnimationType.FADE_IN,
        backgroundColor: selectedTheme.colorPalette.slideBackground,
        themeDescription: conclusionData.themeDescription,
    });
  }

  while (slides.length < numSlidesRequested && numSlidesRequested > 0) {
      const fillerFocus = `Additional detail on ${overallTopic}`;
      const fillerLayout = SlideLayout.CONTENT_WITH_CAPTION; 
       const fillerData = await generateSlideFromAI(
          fillerLayout,
          overallTopic,
          fillerFocus,
          slides.length + 1,
          selectedTheme,
          generationMode
      );
      slides.push({
          id: uid(),
          layout: fillerLayout,
          title: fillerData.title || `More on ${overallTopic}`,
          svgContent: fillerData.svgContent,
          elements: [],
          speakerNotes: fillerData.speakerNotes || `Further details on ${overallTopic}.`,
          slideTransition: selectedTheme.defaultSlideTransition,
          backgroundColor: selectedTheme.colorPalette.slideBackground,
          themeDescription: fillerData.themeDescription,
      });
  }
  
  if (slides.length > numSlidesRequested) {
    slides.splice(numSlidesRequested);
  }


  return {
    id: uid(),
    title: overallTopic,
    slides,
    theme: selectedTheme,
    userPrompt: prompt,
    originalTopic: overallTopic, 
    requestedTone: tone,
    requestedStyle: style,
    activeSlideId: slides[0]?.id || null,
    generationMode: generationMode, // Store the mode
  };
};