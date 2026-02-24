import React from 'react';

interface LoadingScreenProps {
  stage: 'generating_text' | 'generating_image';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ stage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-mint/10 blur-3xl rounded-full animate-pulse"></div>

      <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
        {/* Spinning Rings */}
        <div className="absolute inset-0 border-4 border-mint/30 rounded-full animate-spin-slow" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-4 border-4 border-coral/30 rounded-full animate-spin-slow" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-8 border-4 border-blush/80 rounded-full animate-spin-slow" style={{ animationDuration: '7s' }}></div>
        
        {/* Center Star/Orb */}
        <div className="absolute w-16 h-16 bg-gradient-to-br from-mint to-teal-400 rounded-full shadow-[0_0_20px_rgba(0,201,167,0.4)] animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full blur-sm animate-ping"></div>
        </div>
      </div>

      <h3 className="text-3xl font-display text-text-dark mb-2 tracking-wide drop-shadow-sm">
        {stage === 'generating_text' ? 'DOWNLOADING WISHES...' : 'RENDERING DREAMSCAPE...'}
      </h3>
      <p className="text-gray-500 font-mono text-sm max-w-sm tracking-widest uppercase">
        {stage === 'generating_text' 
          ? 'Connecting to the astral mainframe...' 
          : 'Applying holographic filters...'}
      </p>
    </div>
  );
};