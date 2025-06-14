
import React, { useState, useCallback } from 'react';
import { TONES, STYLES, SLIDE_COUNT_OPTIONS } from '../constants';
import { KPresentUserPreferences, GenerationMode } from '../types';

interface InputSectionProps {
  onGenerate: (prompt: string, numSlides: number, tone: string | undefined, style: string | undefined, files: File[] | undefined, mode: GenerationMode) => void;
  initialPrompt?: string;
}

const InputField: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-purple-300">{label}</label>
    {children}
  </div>
);

const SelectField: React.FC<{ id: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: (string | number)[]; placeholder?: string }> = ({ id, value, onChange, options, placeholder }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => <option key={opt} value={opt}>{String(opt)}</option>)}
  </select>
);


export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, initialPrompt = "" }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [numSlides, setNumSlides] = useState<number>(SLIDE_COUNT_OPTIONS[1]); // Default to 5 slides
  const [tone, setTone] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.NORMAL);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      alert("Please enter a topic for your presentation.");
      return;
    }
    onGenerate(prompt, numSlides, tone, style, files, generationMode);
  }, [prompt, numSlides, tone, style, files, generationMode, onGenerate]);

  return (
    <div className="w-full max-w-2xl p-8 bg-slate-800 shadow-2xl rounded-xl">
      <form onSubmit={handleSubmit}>
        <InputField label="What is your presentation about?" id="prompt">
          <textarea
            id="prompt"
            rows={4}
            className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 placeholder-slate-400"
            placeholder="e.g., The impact of AI on modern healthcare, focusing on diagnostics and personalized medicine..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </InputField>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="numSlides" className="block mb-2 text-sm font-medium text-purple-300">Number of Slides</label>
            <SelectField id="numSlides" value={numSlides} onChange={(e) => setNumSlides(Number(e.target.value))} options={SLIDE_COUNT_OPTIONS} />
          </div>
          <div>
            <label htmlFor="tone" className="block mb-2 text-sm font-medium text-purple-300">Tone (Optional)</label>
            <SelectField id="tone" value={tone} onChange={(e) => setTone(e.target.value)} options={TONES} placeholder="Select Tone" />
          </div>
          <div>
            <label htmlFor="style" className="block mb-2 text-sm font-medium text-purple-300">Style (Optional)</label>
            <SelectField id="style" value={style} onChange={(e) => setStyle(e.target.value)} options={STYLES} placeholder="Select Style" />
          </div>
        </div>
        
        <InputField label="Generation Mode" id="generationMode">
          <div className="flex space-x-4">
            {(Object.values(GenerationMode) as GenerationMode[]).map(mode => (
              <label key={mode} className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="generationMode"
                  value={mode}
                  checked={generationMode === mode}
                  onChange={() => setGenerationMode(mode)}
                  className="form-radio h-4 w-4 text-purple-600 bg-slate-700 border-slate-600 focus:ring-purple-500"
                />
                <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </label>
            ))}
          </div>
        </InputField>

        <InputField label="Upload Supporting Files (Optional)" id="fileUpload">
            <input 
                type="file" 
                id="fileUpload"
                multiple 
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-purple-50 hover:file:bg-purple-700 cursor-pointer"
            />
            {files.length > 0 && (
                <ul className="mt-2 text-xs text-slate-400 list-disc list-inside">
                    {files.map(file => <li key={file.name}>{file.name} ({Math.round(file.size / 1024)} KB)</li>)}
                </ul>
            )}
        </InputField>

        <button
          type="submit"
          className="w-full text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:outline-none focus:ring-purple-400 font-medium rounded-lg text-lg px-5 py-3 text-center transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          ✨ Generate Presentation
        </button>
      </form>
    </div>
  );
};