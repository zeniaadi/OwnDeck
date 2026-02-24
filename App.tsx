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
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-blush to-white flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden relative text-text-dark">
      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-mint rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-coral rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-blush rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float" style={{ animationDelay: '4s' }}></div>

      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-mint to-coral shadow-[0_0_15px_rgba(0,201,167,0.4)] border-2 border-white"></div>
          <h1 className="text-3xl font-display tracking-wider text-text-dark drop-shadow-sm">
            OWN<span className="text-mint">DECK</span>
          </h1>
        </div>
      </header>

      <main className="w-full flex flex-col items-center justify-center min-h-[80vh] relative z-10">
        {step === 'input' && (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <CardForm onSubmit={handleGenerate} isSubmitting={false} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold shadow-sm">
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
            <div className="w-full overflow-x-auto flex justify-center pb-8 px-4 pt-4">
              <TradingCard ref={cardRef} data={cardData} image={cardImage} />
            </div>
            
            <div className="flex gap-4 mt-4 flex-wrap justify-center px-4">
                <button
                onClick={handleReset}
                disabled={isExporting}
                className="px-8 py-3 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-text-dark font-bold tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                FORGE ANOTHER
                </button>
                <button
                onClick={handleCopy}
                disabled={isExporting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-mint to-teal-400 hover:from-mint/90 hover:to-teal-400/90 text-white font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(0,201,167,0.4)] disabled:opacity-50 disabled:cursor-wait border-2 border-white/20"
                >
                {isExporting ? 'COPYING...' : 'COPY BOTH'}
                </button>
                <button
                onClick={handleDownload}
                disabled={isExporting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-coral to-orange-400 hover:from-coral/90 hover:to-orange-400/90 text-white font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(255,107,107,0.4)] disabled:opacity-50 disabled:cursor-wait border-2 border-white/20"
                >
                {isExporting ? 'SAVING...' : 'DOWNLOAD BOTH'}
                </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 text-xs text-text-dark/60 font-bold tracking-widest text-center w-full relative z-10 uppercase">
        Powered by Gemini • AI Generated Content may vary
      </footer>
    </div>
  );
};

export default App;