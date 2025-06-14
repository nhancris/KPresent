
import React from 'react';

interface LoadingSectionProps {
  currentMessage: string;
  completedSteps: string[];
}

export const LoadingSection: React.FC<LoadingSectionProps> = ({ currentMessage, completedSteps }) => {
  return (
    <div className="w-full max-w-xl p-8 bg-slate-800 shadow-2xl rounded-xl flex flex-col items-center text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
      <h2 className="text-2xl font-semibold text-purple-300 mb-1">Crafting Your Masterpiece...</h2>
      <p className="text-lg text-purple-400 mb-4 h-12 flex items-center justify-center">
        {currentMessage || "Initializing..."}
      </p>
      
      <div className="w-full h-56 overflow-y-auto bg-slate-700 p-3 rounded-lg border border-slate-600 text-left text-xs">
        {completedSteps.slice().reverse().map((step, index) => ( // Show newest first
          <div key={index} className={`flex items-start p-1.5 ${index === 0 ? 'text-green-300 font-medium' : 'text-slate-400 opacity-70'}`}>
            <svg className={`w-3 h-3 mr-2 mt-0.5 ${index === 0 ? 'text-green-400' : 'text-purple-500'} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
              {index === 0 && completedSteps.length > 1 ? ( // Checkmark for the latest completed step if not the first overall message
                 <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              ) : ( // Dot for older steps or initial step
                <circle cx="10" cy="10" r="4" />
              )}
            </svg>
            <span className="break-words">{step}</span>
          </div>
        ))}
         {completedSteps.length === 0 && <p className="text-slate-500">Waiting for AI agents to report status...</p>}
      </div>
      <p className="mt-6 text-slate-400 text-sm">The AI is weaving together content and design. Please be patient.</p>
    </div>
  );
};
