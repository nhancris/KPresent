
import React from 'react';
import { Slide, Theme, SlideLayout } from '../types';
import { AVAILABLE_LAYOUTS } from '../constants';

interface KPresentSlideListPanelProps {
  slides: Slide[];
  activeSlideId: string | null;
  onSlideSelect: (slideId: string) => void;
  theme: Theme;
  onAddSlide: (layout: SlideLayout) => void;
  onDeleteSlide: (slideId: string) => void;
}

const SlideThumbnail: React.FC<{ slide: Slide; isActive: boolean; onSelect: () => void; theme: Theme; onDelete: () => void; index: number }> = ({ slide, isActive, onSelect, theme, onDelete, index }) => {
  return (
    <div
      onClick={onSelect}
      className={`mb-3 p-1.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out group relative ${
        isActive ? 'bg-purple-600 shadow-lg ring-2 ring-purple-400' : 'bg-slate-700 hover:bg-slate-600'
      }`}
    >
      <div className="flex items-start space-x-2">
        <span className={`text-xs font-semibold w-6 text-center pt-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>{index + 1}</span>
        <div 
            className="w-full h-16 rounded-md overflow-hidden slide-aspect-ratio bg-gray-500 flex items-center justify-center text-xs p-1"
            style={{ 
                backgroundColor: slide.backgroundColor || theme.colorPalette.slideBackground || theme.colorPalette.background,
                color: theme.colorPalette.textOnBackground,
                fontFamily: theme.fontPairing.body,
            }}
        >
          <span className={`truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
            {slide.title || `Slide ${index + 1}`}
          </span>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs w-4 h-4 flex items-center justify-center"
        title="Delete slide"
      >
        &#x2715; 
      </button>
    </div>
  );
};


export const KPresentSlideListPanel: React.FC<KPresentSlideListPanelProps> = ({ slides, activeSlideId, onSlideSelect, theme, onAddSlide, onDeleteSlide }) => {
  const [showLayoutPicker, setShowLayoutPicker] = React.useState(false);

  return (
    <aside className="w-64 bg-slate-800 p-4 overflow-y-auto border-r border-slate-700 flex flex-col">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Slides</h3>
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            isActive={slide.id === activeSlideId}
            onSelect={() => onSlideSelect(slide.id)}
            theme={theme}
            onDelete={() => onDeleteSlide(slide.id)}
            index={index}
          />
        ))}
      </div>
      <div className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={() => setShowLayoutPicker(!showLayoutPicker)}
          className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          + Add Slide
        </button>
        {showLayoutPicker && (
          <div className="absolute bottom-16 left-4 bg-slate-700 p-2 rounded-lg shadow-xl border border-slate-600 z-10 w-56 max-h-60 overflow-y-auto">
            <p className="text-xs text-slate-400 mb-1 px-1">Choose layout:</p>
            {AVAILABLE_LAYOUTS.map(layout => (
              <button
                key={layout.value}
                onClick={() => { onAddSlide(layout.value as SlideLayout); setShowLayoutPicker(false); }}
                className="block w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-purple-500 rounded-md"
              >
                {layout.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
