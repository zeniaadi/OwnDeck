import React from 'react';

interface LoadingScreenProps {
  stage: 'generating_text' | 'generating_image';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ stage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
      <div className="relative w-32 h-48 mb-8">
        {/* Card Outline Animation */}
        <div className="absolute inset-0 border-2 border-orange-500/30 rounded-xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-rose-500/10 rounded-xl animate-spin-slow" style={{ animationDuration: '4s' }}></div>
        
        {/* Center Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-12 h-12 rounded-full border-4 border-t-orange-400 border-r-rose-400 border-b-transparent border-l-transparent animate-spin`}></div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">
        {stage === 'generating_text' ? 'Consulting the Oracles...' : 'Painting the Ethereal...'}
      </h3>
      <p className="text-stone-400 max-w-sm">
        {stage === 'generating_text' 
          ? 'Agents are analyzing your wish, determining archetype, and writing legends.' 
          : 'The visual artist agent is materializing your concept into a digital collectible.'}
      </p>
    </div>
  );
};