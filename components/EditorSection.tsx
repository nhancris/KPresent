
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { KPresent, Slide, SlideElement, Theme, SlideLayout } from '../types';
import { SlideListPanel } from './SlideListPanel';
import { ActiveSlideDisplay } from './ActiveSlideDisplay';
import { ControlPanel } from './ControlPanel';
import { DEFAULT_THEMES }  from '../constants';
import { generateSlideDataWithGemini } from '../services/GeminiService'; // Needed for adding new slide with AI content


interface EditorSectionProps {
  presentation: KPresent;
  onPresentationUpdate: (updatedPresentation: KPresent) => void;
  onStartOver: () => void;
  onRegenerateSlide?: (slideId: string, newPromptFocus?: string) => void; // Optional for now
}

export const EditorSection: React.FC<EditorSectionProps> = ({ 
    presentation: initialPresentation, 
    onPresentationUpdate, 
    onStartOver,
    onRegenerateSlide 
}) => {
  const [presentation, setPresentation] = useState<KPresent>(initialPresentation);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(initialPresentation.slides[0]?.id || null);
  // selectedElementId might be less relevant if SVGs are primary and not deeply interactive
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  useEffect(() => {
    // This effect should ideally only run if initialPresentation prop *identity* changes,
    // not just its content if it's being updated from parent via onPresentationUpdate.
    // If initialPresentation is truly meant to reset state, this is fine.
    setPresentation(initialPresentation);
    if (initialPresentation.slides.length > 0) {
      // Ensure activeSlideId is valid after potential changes to initialPresentation
      const currentActiveExists = initialPresentation.slides.find(s => s.id === activeSlideId);
      if (!currentActiveExists) {
        setActiveSlideId(initialPresentation.slides[0].id);
      }
    } else {
      setActiveSlideId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPresentation]); // Rerun if initialPresentation prop instance changes

  const handleSlideSelect = useCallback((slideId: string) => {
    setActiveSlideId(slideId);
    setSelectedElementId(null); 
  }, []);

  const handleElementSelect = useCallback((elementId: string | null) => {
    // This is for potential future SVG hotspots or overlays
    setSelectedElementId(elementId);
  }, []);

  const updatePresentation = useCallback((updatedData: Partial<KPresent> | ((prev: KPresent) => KPresent)) => {
    setPresentation(prev => {
      const newState = typeof updatedData === 'function' ? updatedData(prev) : { ...prev, ...updatedData };
      onPresentationUpdate(newState); 
      return newState;
    });
  }, [onPresentationUpdate]);

  const handleSlideUpdate = useCallback((slideId: string, updatedSlideData: Partial<Slide>) => {
    updatePresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === slideId ? { ...s, ...updatedSlideData } : s),
    }));
  }, [updatePresentation]);

  // handleElementUpdate might be simplified or used for non-visual metadata or hotspots
  // const handleElementUpdate = useCallback((slideId: string, elementId: string, updatedElementData: Partial<SlideElement>) => {
  //   updatePresentation(prev => ({
  //     ...prev,
  //     slides: prev.slides.map(s => {
  //       if (s.id === slideId) {
  //         return {
  //           ...s,
  //           elements: s.elements?.map(el => el.id === elementId ? { ...el, ...updatedElementData } : el) || []
  //         };
  //       }
  //       return s;
  //     }),
  //   }));
  // }, [updatePresentation]);
  
  const handleThemeChange = useCallback((newTheme: Theme) => {
    updatePresentation(prev => {
      const updatedSlides = prev.slides.map(slide => ({
        ...slide,
        // Update themeDescription for each slide so AI gets new context if regenerated
        themeDescription: `Theme: ${newTheme.name}. Primary: ${newTheme.colorPalette.primary}, Accent: ${newTheme.colorPalette.accent}. Heading: ${newTheme.fontPairing.heading}, Body: ${newTheme.fontPairing.body}.`
      }));
      return { ...prev, theme: newTheme, slides: updatedSlides };
    });
  }, [updatePresentation]);

  const handleAddSlide = useCallback(async (layout: SlideLayout) => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlideNumber = presentation.slides.length + 1;
    const focus = `New ${layout.replace(/_/g, ' ')} Slide`;

    // Generate content for the new slide using AI
    const aiResponse = await generateSlideDataWithGemini(
        focus,
        layout,
        presentation.theme,
        newSlideNumber,
        presentation.userPrompt
    );

    const newSlide: Slide = {
      id: newSlideId,
      layout: layout,
      title: aiResponse.titleSuggestion,
      svgContent: aiResponse.svgContent,
      elements: [], // Start with no discrete elements; SVG is primary
      speakerNotes: aiResponse.speakerNotes,
      slideTransition: presentation.theme.defaultSlideTransition,
      themeDescription: `Theme: ${presentation.theme.name}. Primary: ${presentation.theme.colorPalette.primary}, Accent: ${presentation.theme.colorPalette.accent}. Heading: ${presentation.theme.fontPairing.heading}, Body: ${presentation.theme.fontPairing.body}.`,
      backgroundColor: presentation.theme.colorPalette.slideBackground,
    };
     updatePresentation(prev => ({ ...prev, slides: [...prev.slides, newSlide], activeSlideId: newSlideId }));
     setActiveSlideId(newSlideId);
  }, [updatePresentation, presentation.theme, presentation.userPrompt, presentation.slides.length]);

  const handleDeleteSlide = useCallback((slideId: string) => {
    updatePresentation(prev => {
        const newSlides = prev.slides.filter(s => s.id !== slideId);
        let newActiveSlideId = activeSlideId;
        if (activeSlideId === slideId) {
            const currentIndex = prev.slides.findIndex(s => s.id === slideId);
            if (newSlides.length > 0) {
                newActiveSlideId = newSlides[Math.max(0, currentIndex -1)].id;
            } else { // No slides left
                newActiveSlideId = null; 
            }
        }
        // If newActiveSlideId is null and newSlides is not empty (e.g. deleted last slide, select new last)
        if (newActiveSlideId === null && newSlides.length > 0) {
            newActiveSlideId = newSlides[newSlides.length - 1].id;
        }
        
        setActiveSlideId(newActiveSlideId);
        return { ...prev, slides: newSlides, activeSlideId: newActiveSlideId };
    });
  }, [updatePresentation, activeSlideId]);


  const activeSlide = useMemo(() => presentation.slides.find(s => s.id === activeSlideId), [presentation.slides, activeSlideId]);
  // const selectedElement = useMemo(() => activeSlide?.elements.find(el => el.id === selectedElementId), [activeSlide, selectedElementId]);

  if (!presentation) return <div className="text-center text-xl">Loading presentation data...</div>;

  const handleDownload = () => {
    console.log("Downloading Presentation (JSON with SVGs):", JSON.stringify(presentation, null, 2));
    alert("Presentation JSON (with SVGs) logged to console. A real app would send this to a backend for .PPTX conversion using the SVGs as images per slide.");
  };

  return (
    <div className="w-full max-w-7xl h-[calc(100vh-200px)] flex flex-col bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
      <div className="p-3 bg-slate-900 flex justify-between items-center border-b border-slate-700">
        <h2 className="text-2xl font-semibold text-purple-300 truncate" title={presentation.title}>
          Editing: {presentation.title}
        </h2>
        <div>
          <button 
            onClick={onStartOver}
            className="mr-2 px-4 py-2 text-sm font-medium text-amber-300 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors"
          >
            Start Over
          </button>
          <button 
            onClick={handleDownload}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg transition-all"
          >
            Download .PPTX
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <SlideListPanel
          slides={presentation.slides}
          activeSlideId={activeSlideId}
          onSlideSelect={handleSlideSelect}
          theme={presentation.theme}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
        />
        <main className="flex-1 flex flex-col bg-slate-700 overflow-hidden">
          {activeSlide ? (
            <ActiveSlideDisplay
              slide={activeSlide}
              theme={presentation.theme}
              // onElementUpdate={handleElementUpdate} // Removed: Type mismatch and prop not used in ActiveSlideDisplay
              onElementSelect={handleElementSelect}
              selectedElementId={selectedElementId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-4 text-center">
              {presentation.slides.length === 0 ? "Your presentation is empty. Add a slide to begin!" : "Select a slide to view or add a new one."}
            </div>
          )}
        </main>
        <ControlPanel
          presentation={presentation}
          activeSlide={activeSlide}
          // selectedElement={selectedElement} // Element selection may not be relevant
          onSlideUpdate={handleSlideUpdate}
          // onElementUpdate={handleElementUpdate} // Element update may not be relevant
          onThemeChange={handleThemeChange}
          themes={DEFAULT_THEMES}
          onRegenerateSlide={onRegenerateSlide}
        />
      </div>
    </div>
  );
};