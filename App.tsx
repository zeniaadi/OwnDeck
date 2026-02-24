import React, { useState, useCallback, useRef } from 'react';
import { CardForm } from './components/CardForm';
import { TradingCard } from './components/TradingCard';
import { LoadingScreen } from './components/LoadingScreen';
import { CardData, UserInput } from './types';
import { generateCardContent, generateCardImage } from './services/geminiService';
// @ts-ignore
import { toPng, toBlob } from 'html-to-image';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'generating_text' | 'generating_image' | 'complete'>('input');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async (input: UserInput) => {
    setError(null);
    setStep('generating_text');

    try {
      // Step 1: Generate Card Text/Data
      const data = await generateCardContent(input);
      
      if (!data || !data.card_copy) {
        throw new Error("Received empty data from the generator.");
      }

      setCardData(data);
      
      setStep('generating_image');

      // Step 2: Generate Card Image
      // We prioritize the art_prompt from the AI, but fallback to a simple description if missing
      // Safe access using optional chaining and defaults to prevent crashes
      const promptToUse = data.art_prompt_package?.art_prompt || `Abstract trading card art for ${data.card_copy?.card_title || 'a mystery card'}`;
      const themeToUse = data.card_spec?.selected_design_theme || 'Classic Vintage Holo';
      
      const imageBase64 = await generateCardImage(promptToUse, themeToUse);
      setCardImage(imageBase64);
      
      setStep('complete');
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "Something went wrong while forging your card.");
      setStep('input');
    }
  }, []);

  const handleReset = useCallback(() => {
    setStep('input');
    setCardData(null);
    setCardImage(null);
    setError(null);
  }, []);

  const handleDownload = useCallback(async () => {
    if (cardRef.current && !isExporting) {
      setIsExporting(true);
      try {
        // First attempt with fonts
        const dataUrl = await toPng(cardRef.current, { 
          pixelRatio: 2,
          filter: (node: any) => node.tagName !== 'SCRIPT' && node.tagName !== 'IFRAME'
        });
        const link = document.createElement('a');
        link.download = `owndeck-${cardData?.card_spec.recipient_name || 'card'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.warn('Download with fonts failed, retrying without fonts...', err);
        try {
          // Retry without fonts if "URI malformed" occurs
          const dataUrl = await toPng(cardRef.current, { 
            pixelRatio: 2,
            skipFonts: true,
            filter: (node: any) => node.tagName !== 'SCRIPT' && node.tagName !== 'IFRAME'
          });
          const link = document.createElement('a');
          link.download = `owndeck-${cardData?.card_spec.recipient_name || 'card'}.png`;
          link.href = dataUrl;
          link.click();
        } catch (retryErr) {
            console.error('Failed to download image', retryErr);
            alert('Could not generate image download. Please try again.');
        }
      } finally {
        setIsExporting(false);
      }
    }
  }, [cardData, isExporting]);

  const handleCopy = useCallback(async () => {
    if (cardRef.current && !isExporting) {
        setIsExporting(true);
        try {
            // First attempt with fonts
            const blob = await toBlob(cardRef.current, { 
              pixelRatio: 2,
              filter: (node: any) => node.tagName !== 'SCRIPT' && node.tagName !== 'IFRAME'
            });
            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('Cards copied to clipboard!');
            }
        } catch (err) {
            console.warn('Copy with fonts failed, retrying without fonts...', err);
            try {
                // Retry without fonts
                const blob = await toBlob(cardRef.current, { 
                  pixelRatio: 2,
                  skipFonts: true,
                  filter: (node: any) => node.tagName !== 'SCRIPT' && node.tagName !== 'IFRAME'
                });
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    alert('Cards copied to clipboard!');
                }
            } catch (retryErr) {
                console.error('Failed to copy image', retryErr);
                alert('Could not copy to clipboard. Try downloading instead.');
            }
        } finally {
          setIsExporting(false);
        }
    }
  }, [isExporting]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-950 via-gray-900 to-black flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-orange-500 to-rose-600 shadow-lg shadow-orange-500/50"></div>
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-rose-300">
            OWN<span className="font-extrabold text-white">DECK</span>
          </h1>
        </div>
      </header>

      <main className="w-full flex flex-col items-center justify-center min-h-[80vh]">
        {step === 'input' && (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <CardForm onSubmit={handleGenerate} isSubmitting={false} />
            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {(step === 'generating_text' || step === 'generating_image') && (
          <LoadingScreen stage={step} />
        )}

        {step === 'complete' && cardData && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
            {/* Wrapper allows scrolling if screen is too small, but centers on large screens */}
            <div className="w-full overflow-x-auto flex justify-center pb-4 px-4">
              <TradingCard ref={cardRef} data={cardData} image={cardImage} />
            </div>
            
            <div className="flex gap-4 mt-4 flex-wrap justify-center px-4">
                <button
                onClick={handleReset}
                disabled={isExporting}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all hover:scale-105 active:scale-95 backdrop-blur-sm disabled:opacity-50"
                >
                Forge Another
                </button>
                <button
                onClick={handleCopy}
                disabled={isExporting}
                className="px-6 py-3 rounded-full bg-rose-600/80 hover:bg-rose-500/80 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/50 disabled:opacity-50 disabled:cursor-wait"
                >
                {isExporting ? 'Copying...' : 'Copy Both'}
                </button>
                <button
                onClick={handleDownload}
                disabled={isExporting}
                className="px-6 py-3 rounded-full bg-orange-600/80 hover:bg-orange-500/80 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/50 disabled:opacity-50 disabled:cursor-wait"
                >
                {isExporting ? 'Saving...' : 'Download Both'}
                </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-4 text-xs text-stone-500 text-center w-full">
        Powered by Gemini • AI Generated Content may vary
      </footer>
    </div>
  );
};

export default App;