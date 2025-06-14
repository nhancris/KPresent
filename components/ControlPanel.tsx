
import React, { useState, useEffect, ChangeEvent, FocusEventHandler } from 'react';
import { KPresent, Slide, /*SlideElement,*/ Theme, AnimationType } from '../types'; // SlideElement less relevant for direct control
import { AVAILABLE_ANIMATIONS, DEFAULT_FONTS } from '../constants';
// import { generateSlideDataWithGemini } from '../services/GeminiService'; // For re-generation

interface ControlPanelProps {
  presentation: KPresent;
  activeSlide: Slide | undefined;
  // selectedElement: SlideElement | undefined; // Element selection likely removed/re-scoped
  onSlideUpdate: (slideId: string, updatedData: Partial<Slide>) => void;
  // onElementUpdate: (slideId: string, elementId: string, updatedData: Partial<SlideElement>) => void; // Less relevant
  onThemeChange: (newTheme: Theme) => void;
  themes: Theme[];
  // Add a function to trigger slide regeneration
  onRegenerateSlide?: (slideId: string, newPromptFocus?: string) => void;
}

enum Tab {
  SLIDE = 'Slide',
  // ELEMENT = 'Element', // Removing as SVG content is primary
  THEME = 'Theme',
  NOTES = 'Notes',
  AI_TOOLS = 'AI Tools', 
  SVG_CODE = 'SVG Code' // New tab for direct SVG editing
}

interface ControlInputProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  children?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  rows?: number;
}

const ControlInput: React.FC<ControlInputProps> = 
  ({label, id, type="text", value, onChange, children, onBlur, rows, ...props}) => (
  <div className="mb-3">
    <label htmlFor={id} className="block text-xs font-medium text-purple-300 mb-1">{label}</label>
    {children ? (
       <select id={id} value={value} onChange={onChange} onBlur={onBlur} className="w-full bg-slate-600 border-slate-500 text-slate-100 text-xs rounded p-1.5 focus:ring-purple-500 focus:border-purple-500">
         {children}
       </select>
    ) : (
      type === 'textarea' ? (
        <textarea id={id} value={String(value)} onChange={onChange} onBlur={onBlur} rows={rows || 4} className="w-full bg-slate-600 border-slate-500 text-slate-100 text-xs rounded p-1.5 focus:ring-purple-500 focus:border-purple-500 resize-y" />
      ) : (
        <input type={type} id={id} value={value} onChange={onChange} onBlur={onBlur} {...props} className="w-full bg-slate-600 border-slate-500 text-slate-100 text-xs rounded p-1.5 focus:ring-purple-500 focus:border-purple-500" />
      )
    )}
  </div>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  presentation,
  activeSlide,
  onSlideUpdate,
  onThemeChange,
  themes,
  onRegenerateSlide,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SLIDE);
  const [currentSpeakerNotes, setCurrentSpeakerNotes] = useState('');
  const [slideRegenPrompt, setSlideRegenPrompt] = useState('');
  const [currentSvgContent, setCurrentSvgContent] = useState('');


  useEffect(() => {
    if (activeSlide) {
      setCurrentSpeakerNotes(activeSlide.speakerNotes || '');
      setSlideRegenPrompt(activeSlide.title || ''); // Default regen prompt to slide title
      setCurrentSvgContent(activeSlide.svgContent || '');
    } else {
      setCurrentSvgContent(''); // Clear if no active slide
    }
  }, [activeSlide]);

  const handleSpeakerNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentSpeakerNotes(e.target.value);
  };
  
  const handleSpeakerNotesBlur = () => {
    if (activeSlide) {
      onSlideUpdate(activeSlide.id, { speakerNotes: currentSpeakerNotes });
    }
  };

  const handleSvgContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentSvgContent(e.target.value);
  };

  const handleApplySvgChanges = () => {
    if (activeSlide) {
      onSlideUpdate(activeSlide.id, { svgContent: currentSvgContent });
    }
  };
  
  const handleRegenerateClick = () => {
    if (activeSlide && onRegenerateSlide) {
        onRegenerateSlide(activeSlide.id, slideRegenPrompt);
    }
  };

  const renderSlideControls = () => {
    if (!activeSlide) return <p className="text-xs text-slate-400 p-2">No slide selected.</p>;
    return (
      <>
        <ControlInput label="Slide Title (for reference)" id="slideTitle" value={activeSlide.title || ''} onChange={(e) => onSlideUpdate(activeSlide.id, { title: e.target.value })} />
        <ControlInput label="Background Color (Fallback)" id="slideBgColor" type="color" value={activeSlide.backgroundColor || presentation.theme.colorPalette.slideBackground || '#FFFFFF'} onChange={(e) => onSlideUpdate(activeSlide.id, { backgroundColor: e.target.value })} />
        <p className="text-xs text-slate-400 mb-2">Note: SVG content typically defines its own background. This color is a fallback.</p>
        <ControlInput label="Transition" id="slideTransition" value={activeSlide.slideTransition} onChange={(e) => onSlideUpdate(activeSlide.id, { slideTransition: e.target.value as AnimationType })}>
          {AVAILABLE_ANIMATIONS.map(anim => <option key={anim.value} value={anim.value}>{anim.name}</option>)}
        </ControlInput>
      </>
    );
  };

  const renderThemeControls = () => (
    <>
      <ControlInput label="Presentation Theme" id="globalTheme" value={presentation.theme.id} onChange={(e) => {
          const newTheme = themes.find(t => t.id === e.target.value);
          if (newTheme) onThemeChange(newTheme);
        }}>
        {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </ControlInput>
      <div className="mt-2 p-2 border border-slate-600 rounded">
        <h4 className="text-xs font-semibold text-purple-400 mb-1">Customize Current Theme:</h4>
        <p className="text-xs text-slate-400 mb-2">Changes here will update the theme description sent to the AI for new/regenerated slides.</p>
        <ControlInput label="Heading Font" id="headingFont" value={presentation.theme.fontPairing.heading} onChange={(e) => onThemeChange({...presentation.theme, fontPairing: {...presentation.theme.fontPairing, heading: e.target.value}})}>
            {DEFAULT_FONTS.map(f => <option key={f.heading} value={f.heading}>{f.heading.split(',')[0].replace(/"/g, '')}</option>)}
        </ControlInput>
        <ControlInput label="Body Font" id="bodyFont" value={presentation.theme.fontPairing.body} onChange={(e) => onThemeChange({...presentation.theme, fontPairing: {...presentation.theme.fontPairing, body: e.target.value}})}>
            {DEFAULT_FONTS.map(f => <option key={f.body} value={f.body}>{f.body.split(',')[0].replace(/"/g, '')}</option>)}
        </ControlInput>
        <ControlInput label="Primary Color" id="primaryColor" type="color" value={presentation.theme.colorPalette.primary} onChange={(e) => onThemeChange({...presentation.theme, colorPalette: {...presentation.theme.colorPalette, primary: e.target.value}})} />
        <ControlInput label="Accent Color" id="accentColor" type="color" value={presentation.theme.colorPalette.accent} onChange={(e) => onThemeChange({...presentation.theme, colorPalette: {...presentation.theme.colorPalette, accent: e.target.value}})} />
         <ControlInput label="Default Slide Background (Fallback)" id="slideDefaultBgColor" type="color" value={presentation.theme.colorPalette.slideBackground || presentation.theme.colorPalette.background} onChange={(e) => onThemeChange({...presentation.theme, colorPalette: {...presentation.theme.colorPalette, slideBackground: e.target.value}})} />
      </div>
    </>
  );

  const renderNotesControls = () => {
    if (!activeSlide) return <p className="text-xs text-slate-400 p-2">No slide selected.</p>;
    return (
        <ControlInput label="Speaker Notes" id="speakerNotes" type="textarea" value={currentSpeakerNotes} onChange={handleSpeakerNotesChange} onBlur={handleSpeakerNotesBlur} />
    );
  };
  
  const renderAiToolsControls = () => {
    if (!activeSlide) return <p className="text-xs text-slate-400 p-2">No slide selected.</p>;
    if (!onRegenerateSlide) return <p className="text-xs text-slate-400 p-2">Regeneration not configured.</p>;

    return (
      <>
        <ControlInput 
            label="Refine Slide Focus (Prompt for AI)" 
            id="slideRegenPrompt" 
            type="textarea" 
            value={slideRegenPrompt} 
            onChange={(e) => setSlideRegenPrompt(e.target.value)} 
        />
        <button
          onClick={handleRegenerateClick}
          className="w-full mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          ✨ Regenerate Slide with AI
        </button>
        <p className="text-xs text-slate-400 mt-2">The AI will attempt to generate new SVG content for this slide based on the theme and the refined focus above.</p>
      </>
    );
  };

  const renderSvgCodeControls = () => {
    if (!activeSlide) return <p className="text-xs text-slate-400 p-2">No slide selected.</p>;
    return (
      <>
        <ControlInput 
            label="SVG Markup (Edit with caution)" 
            id="svgCodeEditor" 
            type="textarea" 
            value={currentSvgContent} 
            onChange={handleSvgContentChange} 
            rows={15}
        />
        <button
            onClick={handleApplySvgChanges}
            className="w-full mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
            Apply SVG Changes
        </button>
        <p className="text-xs text-slate-400 mt-2">Modifying SVG directly can break slide rendering if not valid. Changes are applied to the current slide.</p>
      </>
    );
  };


  const TabButton: React.FC<{tab: Tab; children: React.ReactNode}> = ({tab, children}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${activeTab === tab ? 'bg-slate-600 text-purple-300' : 'bg-slate-700 text-slate-400 hover:bg-slate-650 hover:text-slate-200'}`}
    >
        {children}
    </button>
  );

  return (
    <aside className="w-72 bg-slate-800 p-3 border-l border-slate-700 flex flex-col overflow-y-auto">
      <div className="flex border-b border-slate-600 mb-2 flex-wrap">
        <TabButton tab={Tab.SLIDE}>Slide</TabButton>
        <TabButton tab={Tab.THEME}>Theme</TabButton>
        <TabButton tab={Tab.NOTES}>Notes</TabButton>
        {onRegenerateSlide && <TabButton tab={Tab.AI_TOOLS}>AI Tools</TabButton>}
        <TabButton tab={Tab.SVG_CODE}>SVG Code</TabButton>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
        {activeTab === Tab.SLIDE && renderSlideControls()}
        {activeTab === Tab.THEME && renderThemeControls()}
        {activeTab === Tab.NOTES && renderNotesControls()}
        {activeTab === Tab.AI_TOOLS && onRegenerateSlide && renderAiToolsControls()}
        {activeTab === Tab.SVG_CODE && renderSvgCodeControls()}
      </div>
    </aside>
  );
};