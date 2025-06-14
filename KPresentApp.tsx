
import React, { useState, useCallback, useEffect } from 'react';
import { KPresent, AppState, Slide, SlideLayout, GenerationMode } from './types';
import { KPresentInputSection } from './components/KPresentInputSection';
import { KPresentLoadingSection } from './components/KPresentLoadingSection';
import { KPresentEditorSection } from './components/KPresentEditorSection';
import { generateMockKPresent } from './services/KPresentService';
import { generateSlideDataWithGemini } from './services/KPresentGeminiService'; // For regeneration
import { INITIAL_SLIDE_PROMPT } from './constants';

const agenticLoadingMessagesBase = [
  "Interpreting your core KPresent goals...",
  "Consulting Narrative Strategy Agent for content flow...",
  "Sketching slide-by-slide storyboard concepts...",
  "Engaging AI Design Agent for visual language definition...",
  "Generating thematic descriptions for advanced SVG generation...",
  "Layout Agent drafting initial compositions for slide {i}...",
  "Typography Engine selecting optimal font pairings for theme...",
  "Color Palette Analyst ensuring WCAG AA contrast ratios...",
  "Visual Cortex Agent refining primary color harmonies...",
  "SVG Vector Engine initializing path data for slide {i}...",
  "Content Synthesis Agent drafting speaker notes for topic: {topic}...",
  "Animation Logic Unit considering subtle entrance effects...",
  "Aesthetic AI evaluating current design draft of slide {i}...",
  "Narrative Agent refining speaker notes for clarity and impact...",
  "Detailing Agent adding subtle textures and gradients to SVG for slide {i}...",
  "Composition Agent adjusting element balance on slide {i}...",
  "Readability Agent checking font sizes and contrasts...",
  "Interaction Agent planning potential animated transitions...",
  "Knowledge Graph Agent cross-referencing content for accuracy (simulated)...",
  "Finalizing vector paths for slide {i} visuals...",
  "Polishing speaker notes, adding emphasis points...",
  "Assembling AI-generated slide components...",
  "Performing final coherence and aesthetic review pass..."
];

const advancedLoadingMessagesExtras = [
  "Advanced Model: Deeper semantic analysis of topic: {topic}...",
  "Advanced Model: Exploring sophisticated visual metaphors for slide {i}...",
  "Advanced Model: Employing generative design principles for SVG structures...",
  "Advanced Model: Cross-correlating design elements with narrative intent...",
  "Advanced Model: Optimizing SVG complexity for aesthetic impact on slide {i}...",
];


const KPresentApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [kpresent, setKPresent] = useState<KPresent | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>('');
  const [completedLoadingSteps, setCompletedLoadingSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentGenerationMode, setCurrentGenerationMode] = useState<GenerationMode>(GenerationMode.NORMAL);


  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    if (appState === AppState.LOADING) {
      setCurrentLoadingMessage(`Initiating KPresent Architect (${currentGenerationMode} mode)...`);
      setCompletedLoadingSteps([`Initiating KPresent Architect (${currentGenerationMode} mode)...`]);
      
      let messageIndex = 0;
      let currentSlideSim = 1;
      const numSlidesForSim = kpresent?.slides?.length || 5;

      const currentMessagesPool = currentGenerationMode === GenerationMode.ADVANCED 
        ? [...agenticLoadingMessagesBase, ...advancedLoadingMessagesExtras] 
        : agenticLoadingMessagesBase;

      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % currentMessagesPool.length;
        let newMessage = currentMessagesPool[messageIndex];
        
        newMessage = newMessage.replace("{i}", String(currentSlideSim));
        if (kpresent?.originalTopic) {
          newMessage = newMessage.replace("{topic}", kpresent.originalTopic.substring(0, 20) + "...");
        } else {
           newMessage = newMessage.replace(" for topic: {topic}", "");
           newMessage = newMessage.replace(" of topic: {topic}", "");
        }

        setCurrentLoadingMessage(newMessage);
        if (Math.random() > (currentGenerationMode === GenerationMode.ADVANCED ? 0.6 : 0.7) ) { 
            setCompletedLoadingSteps(prev => [...prev, newMessage.length > 50 ? newMessage.substring(0,47)+"..." : newMessage]);
            if (newMessage.includes("slide {i}")) currentSlideSim = (currentSlideSim % numSlidesForSim) + 1;
        }
      }, currentGenerationMode === GenerationMode.ADVANCED ? 3500 : 3000); // Slightly longer interval for advanced
    }
    return () => clearInterval(messageInterval);
  }, [appState, kpresent?.slides?.length, kpresent?.originalTopic, currentGenerationMode]);

  const handleKPresentGenerate = useCallback(async (prompt: string, numSlides: number, tone: string | undefined, style: string | undefined, files: File[] | undefined, mode: GenerationMode) => {
    setAppState(AppState.LOADING);
    setCurrentGenerationMode(mode);
    setError(null);
    setCompletedLoadingSteps([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const tempKPresentShell = { 
        originalTopic: prompt.substring(0, Math.min(prompt.length, 60)).split(',')[0].trim(), 
        slides: Array(numSlides).fill(null),
        generationMode: mode 
      } as Partial<KPresent>;
      setKPresent(tempKPresentShell as KPresent);


      const generatedKPresent = await generateMockKPresent(prompt, numSlides, mode, tone, style, files);
      
      setKPresent(generatedKPresent);
      setCompletedLoadingSteps(prev => [...prev, "AI-crafted KPresent is ready!"]);
      setCurrentLoadingMessage("AI-crafted KPresent is ready!");
      setTimeout(() => setAppState(AppState.EDITING), 1200); 
    } catch (e) {
      console.error("Error generating KPresent:", e);
      setError("An unexpected issue occurred while crafting your KPresent with AI. Please try again.");
      setCurrentLoadingMessage("Error encountered.");
      setAppState(AppState.INPUT);
    }
  }, []);

  const handleKPresentUpdate = useCallback((updatedKPresent: KPresent) => {
    setKPresent(updatedKPresent);
  }, []);

  const handleStartOver = useCallback(() => {
    setKPresent(null);
    setCompletedLoadingSteps([]);
    setCurrentLoadingMessage('');
    setError(null);
    setAppState(AppState.INPUT);
    setCurrentGenerationMode(GenerationMode.NORMAL); // Reset mode
  }, []);

  const handleRegenerateSlide = useCallback(async (slideId: string, newPromptFocus?: string) => {
    if (!kpresent) return;

    const targetSlide = kpresent.slides.find(s => s.id === slideId);
    if (!targetSlide) return;
    
    const originalLoadingMsg = currentLoadingMessage;
    const originalCompletedSteps = [...completedLoadingSteps];

    setCurrentLoadingMessage(`AI (${kpresent.generationMode} mode) is re-imagining slide: ${targetSlide.title || slideId}...`);
    setCompletedLoadingSteps(prev => [...prev, `Re-generating slide (${kpresent.generationMode} mode): ${targetSlide.title || 'untitled'}...`]);


    try {
      const newSlideData = await generateSlideDataWithGemini(
        newPromptFocus || targetSlide.title || "Untitled Slide Focus",
        targetSlide.layout, 
        kpresent.theme,
        kpresent.slides.indexOf(targetSlide) + 1,
        kpresent.userPrompt,
        kpresent.generationMode // Pass current KPresent's generation mode
      );

      const updatedSlides = kpresent.slides.map(s => {
        if (s.id === slideId) {
          return {
            ...s,
            title: newSlideData.titleSuggestion,
            svgContent: newSlideData.svgContent,
            speakerNotes: newSlideData.speakerNotes,
            themeDescription: `Theme: ${kpresent.theme.name}. Mode: ${kpresent.generationMode}. Primary: ${kpresent.theme.colorPalette.primary}, Accent: ${kpresent.theme.colorPalette.accent}. Heading: ${kpresent.theme.fontPairing.heading}, Body: ${kpresent.theme.fontPairing.body}. Regenerated with focus: ${newPromptFocus || targetSlide.title}`
          };
        }
        return s;
      });
      setKPresent(prev => prev ? ({ ...prev, slides: updatedSlides }) : null);
      
      setCurrentLoadingMessage(`Slide "${newSlideData.titleSuggestion}" updated by AI (${kpresent.generationMode} mode).`);
      setCompletedLoadingSteps(prev => [...prev, `Slide "${newSlideData.titleSuggestion}" successfully re-imagined!`]);
      setTimeout(() => { 
          setCurrentLoadingMessage(originalLoadingMsg); 
          setCompletedLoadingSteps(originalCompletedSteps);
      }, 3000);


    } catch (e) {
      console.error("Error regenerating slide:", e);
      setError(`Failed to regenerate slide "${targetSlide.title || slideId}".`);
      setCurrentLoadingMessage("Error during slide regeneration.");
       setTimeout(() => {
          setCurrentLoadingMessage(originalLoadingMsg);
          setCompletedLoadingSteps(originalCompletedSteps);
      }, 3000);
    }

  }, [kpresent, currentLoadingMessage, completedLoadingSteps]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-gray-100 flex flex-col items-center p-4">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
          KPresent Architect
        </h1>
        <p className="text-xl text-slate-300 mt-2">Crafting intelligent SVG-based KPresents with AI agents.</p>
      </header>

      {error && (
        <div className="w-full max-w-2xl p-4 mb-4 text-center text-red-400 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
          {error} <button onClick={() => setError(null)} className="ml-2 text-xs underline">(Dismiss)</button>
        </div>
      )}

      {appState === AppState.INPUT && (
        <KPresentInputSection
          onGenerate={handleKPresentGenerate}
          initialPrompt={INITIAL_SLIDE_PROMPT}
        />
      )}
      {appState === AppState.LOADING && (
        <KPresentLoadingSection currentMessage={currentLoadingMessage} completedSteps={completedLoadingSteps} />
      )}
      {appState === AppState.EDITING && kpresent && kpresent.slides && kpresent.slides.length > 0 && (
        <KPresentEditorSection
          kpresent={kpresent}
          onKPresentUpdate={handleKPresentUpdate}
          onStartOver={handleStartOver}
          onRegenerateSlide={handleRegenerateSlide}
        />
      )}
       {appState === AppState.EDITING && kpresent && (!kpresent.slides || kpresent.slides.length === 0) && (
        <div className="text-center p-10 bg-slate-800 rounded-lg shadow-xl">
            <h2 className="text-2xl text-amber-400 mb-4">KPresent Generation Issue</h2>
            <p className="text-slate-300 mb-6">It seems the AI wasn't able to generate any slides for your KPresent. This can sometimes happen with very abstract prompts or unexpected issues.</p>
            <button 
                onClick={handleStartOver}
                className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:outline-none focus:ring-purple-400 font-medium rounded-lg text-lg"
            >
                Please Try Again
            </button>
        </div>
      )}
    </div>
  );
};

export default KPresentApp;
