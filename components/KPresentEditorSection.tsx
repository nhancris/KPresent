
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { KPresent, Slide, SlideElement, Theme, SlideLayout } from '../types';
import { KPresentSlideListPanel } from './KPresentSlideListPanel';
import { KPresentActiveSlideDisplay } from './KPresentActiveSlideDisplay';
import { KPresentControlPanel } from './KPresentControlPanel';
import { DEFAULT_THEMES }  from '../constants';
import { generateSlideDataWithGemini } from '../services/KPresentGeminiService'; // Needed for adding new slide with AI content


interface KPresentEditorSectionProps {
  kpresent: KPresent;
  onKPresentUpdate: (updatedKPresent: KPresent) => void;
  onStartOver: () => void;
  onRegenerateSlide?: (slideId: string, newPromptFocus?: string) => void; // Optional for now
}

export const KPresentEditorSection: React.FC<KPresentEditorSectionProps> = ({ 
    kpresent: initialKPresent, 
    onKPresentUpdate, 
    onStartOver,
    onRegenerateSlide 
}) => {
  const [kpresent, setKPresent] = useState<KPresent>(initialKPresent);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(initialKPresent.slides[0]?.id || null);
  // selectedElementId might be less relevant if SVGs are primary and not deeply interactive
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  useEffect(() => {
    // This effect should ideally only run if initialKPresent prop *identity* changes,
    // not just its content if it's being updated from parent via onKPresentUpdate.
    // If initialKPresent is truly meant to reset state, this is fine.
    setKPresent(initialKPresent);
    if (initialKPresent.slides.length > 0) {
      // Ensure activeSlideId is valid after potential changes to initialKPresent
      const currentActiveExists = initialKPresent.slides.find(s => s.id === activeSlideId);
      if (!currentActiveExists) {
        setActiveSlideId(initialKPresent.slides[0].id);
      }
    } else {
      setActiveSlideId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKPresent]); // Rerun if initialKPresent prop instance changes

  const handleSlideSelect = useCallback((slideId: string) => {
    setActiveSlideId(slideId);
    setSelectedElementId(null); 
  }, []);

  const handleElementSelect = useCallback((elementId: string | null) => {
    // This is for potential future SVG hotspots or overlays
    setSelectedElementId(elementId);
  }, []);

  const updateKPresent = useCallback((updatedData: Partial<KPresent> | ((prev: KPresent) => KPresent)) => {
    setKPresent(prev => {
      const newState = typeof updatedData === 'function' ? updatedData(prev) : { ...prev, ...updatedData };
      onKPresentUpdate(newState); 
      return newState;
    });
  }, [onKPresentUpdate]);

  const handleSlideUpdate = useCallback((slideId: string, updatedSlideData: Partial<Slide>) => {
    updateKPresent(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === slideId ? { ...s, ...updatedSlideData } : s),
    }));
  }, [updateKPresent]);

  // handleElementUpdate might be simplified or used for non-visual metadata or hotspots
  // const handleElementUpdate = useCallback((slideId: string, elementId: string, updatedElementData: Partial<SlideElement>) => {
  //   updateKPresent(prev => ({
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
  // }, [updateKPresent]);
  
  const handleThemeChange = useCallback((newTheme: Theme) => {
    updateKPresent(prev => {
      const updatedSlides = prev.slides.map(slide => ({
        ...slide,
        // Update themeDescription for each slide so AI gets new context if regenerated
        themeDescription: `Theme: ${newTheme.name}. Primary: ${newTheme.colorPalette.primary}, Accent: ${newTheme.colorPalette.accent}. Heading: ${newTheme.fontPairing.heading}, Body: ${newTheme.fontPairing.body}.`
      }));
      return { ...prev, theme: newTheme, slides: updatedSlides };
    });
  }, [updateKPresent]);

  const handleAddSlide = useCallback(async (layout: SlideLayout) => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlideNumber = kpresent.slides.length + 1;
    const focus = `New ${layout.replace(/_/g, ' ')} Slide`;

    // Generate content for the new slide using AI
    const aiResponse = await generateSlideDataWithGemini(
        focus,
        layout,
        kpresent.theme,
        newSlideNumber,
        kpresent.userPrompt
    );

    const newSlide: Slide = {
      id: newSlideId,
      layout: layout,
      title: aiResponse.titleSuggestion,
      svgContent: aiResponse.svgContent,
      elements: [], // Start with no discrete elements; SVG is primary
      speakerNotes: aiResponse.speakerNotes,
      slideTransition: kpresent.theme.defaultSlideTransition,
      themeDescription: `Theme: ${kpresent.theme.name}. Primary: ${kpresent.theme.colorPalette.primary}, Accent: ${kpresent.theme.colorPalette.accent}. Heading: ${kpresent.theme.fontPairing.heading}, Body: ${kpresent.theme.fontPairing.body}.`,
      backgroundColor: kpresent.theme.colorPalette.slideBackground,
    };
     updateKPresent(prev => ({ ...prev, slides: [...prev.slides, newSlide], activeSlideId: newSlideId }));
     setActiveSlideId(newSlideId);
  }, [updateKPresent, kpresent.theme, kpresent.userPrompt, kpresent.slides.length]);

  const handleDeleteSlide = useCallback((slideId: string) => {
    updateKPresent(prev => {
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
  }, [updateKPresent, activeSlideId]);


  const activeSlide = useMemo(() => kpresent.slides.find(s => s.id === activeSlideId), [kpresent.slides, activeSlideId]);
  // const selectedElement = useMemo(() => activeSlide?.elements.find(el => el.id === selectedElementId), [activeSlide, selectedElementId]);

  if (!kpresent) return <div className="text-center text-xl">Loading KPresent data...</div>;

  const handleDownload = () => {
    console.log("Downloading KPresent (JSON with SVGs):", JSON.stringify(kpresent, null, 2));
    alert("KPresent JSON (with SVGs) logged to console. A real app would send this to a backend for .PPTX conversion using the SVGs as images per slide.");
  };

  return (
    <div className="w-full max-w-7xl h-[calc(100vh-200px)] flex flex-col bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
      <div className="p-3 bg-slate-900 flex justify-between items-center border-b border-slate-700">
        <h2 className="text-2xl font-semibold text-purple-300 truncate" title={kpresent.title}>
          Editing: {kpresent.title}
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
        <KPresentSlideListPanel
          slides={kpresent.slides}
          activeSlideId={activeSlideId}
          onSlideSelect={handleSlideSelect}
          theme={kpresent.theme}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
        />
        <main className="flex-1 flex flex-col bg-slate-700 overflow-hidden">
          {activeSlide ? (
            <KPresentActiveSlideDisplay
              slide={activeSlide}
              theme={kpresent.theme}
              // onElementUpdate={handleElementUpdate} // Removed: Type mismatch and prop not used in KPresentActiveSlideDisplay
              onElementSelect={handleElementSelect}
              selectedElementId={selectedElementId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-4 text-center">
              {kpresent.slides.length === 0 ? "Your KPresent is empty. Add a slide to begin!" : "Select a slide to view or add a new one."}
            </div>
          )}
        </main>
        <KPresentControlPanel
          kpresent={kpresent}
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
