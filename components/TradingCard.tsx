import React, { useMemo, forwardRef } from 'react';
import { CardData } from '../types';

interface TradingCardProps {
  data: CardData;
  image: string | null;
}

// Helper to determine styling based on theme
const getThemeStyles = (themeName: string) => {
  const base = "relative w-[325px] h-[455px] rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] hover:shadow-3xl duration-500 select-none flex-shrink-0";
  
  let styles = {
    container: `${base} bg-gray-200 text-gray-900 font-sans border-[8px] border-yellow-500`,
    header: "bg-yellow-100/90 border-b-2 border-yellow-600/50",
    name: "text-slate-900 font-serif",
    statsBadge: "bg-red-500 text-white",
    artBorder: "border-4 border-yellow-600/30",
    abilityBox: "bg-yellow-50/80",
    footer: "bg-yellow-200/50 text-yellow-900",
    wishBox: "bg-yellow-200/40 border-yellow-600/20",
    foil: false,
    backGradient: "bg-gradient-to-br from-yellow-600 via-yellow-400 to-yellow-700",
    backPattern: "opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"
  };

  const lowerTheme = themeName.toLowerCase();

  if (lowerTheme.includes("dark") || lowerTheme.includes("legendary") || lowerTheme.includes("prestige")) {
    styles = {
      container: `${base} bg-slate-900 text-white border-[8px] border-indigo-900`,
      header: "bg-indigo-950/90 border-b-2 border-purple-500/50",
      name: "text-purple-100 font-serif tracking-wider",
      statsBadge: "bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]",
      artBorder: "border-2 border-purple-500/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]",
      abilityBox: "bg-slate-800/60 border border-white/5",
      footer: "bg-slate-950/80 text-purple-300 italic",
      wishBox: "bg-indigo-900/40 border-purple-500/30",
      foil: true,
      backGradient: "bg-gradient-to-br from-indigo-900 via-purple-900 to-black",
      backPattern: "opacity-30 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-purple-500"
    };
  } else if (lowerTheme.includes("modern") || lowerTheme.includes("energy") || lowerTheme.includes("elemental")) {
    styles = {
      container: `${base} bg-zinc-900 text-white border-[8px] border-cyan-500`,
      header: "bg-cyan-900/80 border-b border-cyan-400",
      name: "text-cyan-50 font-sans font-bold uppercase tracking-widest",
      statsBadge: "bg-cyan-500 text-black font-bold",
      artBorder: "border-2 border-cyan-400",
      abilityBox: "bg-black/40 border border-cyan-500/20 backdrop-blur-sm",
      footer: "bg-cyan-950/90 text-cyan-200",
      wishBox: "bg-cyan-900/30 border-cyan-500/30",
      foil: true,
      backGradient: "bg-gradient-to-br from-cyan-900 via-black to-cyan-800",
      backPattern: "opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,cyan_10px,cyan_11px)]"
    };
  } else if (lowerTheme.includes("soft") || lowerTheme.includes("mythic") || lowerTheme.includes("dream")) {
    styles = {
      container: `${base} bg-pink-50 text-slate-800 border-[8px] border-pink-200`,
      header: "bg-white/60 border-b border-pink-100",
      name: "text-pink-900 font-serif italic",
      statsBadge: "bg-pink-300 text-white",
      artBorder: "border-4 border-white/80 shadow-sm rounded-lg",
      abilityBox: "bg-white/40 border border-white/60",
      footer: "bg-pink-100/50 text-pink-800",
      wishBox: "bg-white/50 border-pink-200/50",
      foil: false,
      backGradient: "bg-gradient-to-br from-pink-200 via-white to-pink-100",
      backPattern: "opacity-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-400 to-transparent"
    };
  } else if (lowerTheme.includes("rainbow") || lowerTheme.includes("celebration")) {
    styles = {
      container: `${base} bg-white text-slate-900 border-[8px] border-transparent bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100`,
      header: "bg-white/80 backdrop-blur-md",
      name: "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-bold",
      statsBadge: "bg-gradient-to-r from-orange-400 to-pink-500 text-white",
      artBorder: "border-4 border-white shadow-lg",
      abilityBox: "bg-white/60",
      footer: "bg-white/80 text-slate-600",
      wishBox: "bg-white/50 border-purple-200",
      foil: true,
      backGradient: "bg-gradient-to-tr from-pink-300 via-purple-300 to-cyan-300",
      backPattern: "opacity-50 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-white via-transparent to-white"
    };
  }

  return styles;
};

// Helper function to extract initials
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const TradingCard = forwardRef<HTMLDivElement, TradingCardProps>(({ data, image }, ref) => {
  const { card_spec, card_copy } = data;
  const styles = useMemo(() => getThemeStyles(card_spec.selected_design_theme), [card_spec.selected_design_theme]);

  // Determine back of card text
  let deckTitle = card_spec.deck_title && card_spec.deck_title.trim() !== '' 
    ? card_spec.deck_title 
    : getInitials(card_spec.recipient_name);

  // If the logic falls back to initials, we still treat it as a monogram if it is short (<= 3 chars)
  const isMonogram = deckTitle.length <= 3 && !card_spec.deck_title;

  // Clean icons to simple strings if they contain markdown or weird formatting
  const cleanIcon = (icon: string) => icon.replace(/\[|\]/g, '').trim();

  return (
    // The ref is placed on a wrapper containing both cards to capture them together
    <div ref={ref} className="flex gap-4 p-4 items-center justify-center flex-wrap">
      
      {/* --- FRONT OF CARD --- */}
      <div className={`${styles.container} id-card-front`}>
        {/* Foil Overlay */}
        {styles.foil && (
          <div className="absolute inset-0 foil-overlay opacity-30 z-20 pointer-events-none animate-shimmer"></div>
        )}

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Header */}
          <div className={`min-h-[40px] px-3 py-1 flex items-center justify-between gap-2 flex-shrink-0 ${styles.header}`}>
            <span className={`text-xs font-bold leading-tight break-words ${styles.name}`}>{card_copy.card_title}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[8px] uppercase font-bold tracking-wider opacity-70 text-right leading-tight max-w-[100px]">{card_spec.card_archetype}</span>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${styles.statsBadge}`}></div>
            </div>
          </div>

          {/* Art Area - Reduced height to fit text */}
          <div className="px-3 pt-2 relative flex-shrink-0">
            <div className={`w-full h-[200px] bg-slate-300 relative overflow-hidden ${styles.artBorder} z-0`}>
              {image ? (
                <img src={image} alt="Card Art" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                  Manifesting...
                </div>
              )}
            </div>
            
            {/* Stat Badge - Floating */}
            <div className={`absolute top-4 right-4 px-2 py-1 rounded shadow-md flex flex-col items-center justify-center min-w-[50px] ${styles.statsBadge}`}>
               <span className="text-[8px] uppercase font-bold leading-none mb-0.5">{card_copy.primary_stat_name}</span>
               <span className="text-xl font-black leading-none">{card_copy.primary_stat_value}</span>
            </div>
          </div>

          {/* Abilities Area - Flexible height, no scroll needed due to stricter prompts */}
          <div className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-hidden">
             {/* Tagline Bar */}
             <div className="flex items-center gap-2 mb-1 flex-shrink-0">
                <div className="h-[2px] bg-current opacity-20 flex-1"></div>
                <span className="text-[9px] uppercase font-bold opacity-60 italic whitespace-nowrap">{card_spec.short_tagline}</span>
                <div className="h-[2px] bg-current opacity-20 flex-1"></div>
             </div>

             {/* Content Container - Tightened padding to prevent overflow */}
             <div className={`flex-1 rounded p-1.5 flex flex-col gap-1 ${styles.abilityBox}`}>
                
                {/* The Wish Section - Reduced padding and spacing */}
                {card_spec.wish_text && (
                  <div className={`p-1.5 rounded border border-dashed flex-shrink-0 ${styles.wishBox}`}>
                    <span className="text-[7px] uppercase font-bold opacity-70 block mb-0 tracking-wider">Description</span>
                    <p className="text-[9px] italic leading-tight opacity-90 line-clamp-3">"{card_spec.wish_text}"</p>
                  </div>
                )}

                {/* Abilities List - Tightened gap */}
                <div className="flex flex-col gap-1.5 justify-start">
                  {card_copy.abilities.map((ability, idx) => (
                    <div key={idx} className="flex flex-col gap-0">
                      <div className="flex items-center gap-1.5">
                        {/* Cost Icons */}
                        <div className="flex items-center -space-x-1 flex-shrink-0">
                          {ability.cost_icons.slice(0, 2).map((icon, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-white/20 border border-current flex items-center justify-center text-[8px] font-bold shadow-sm z-10">
                              {cleanIcon(icon).charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold leading-none truncate">{ability.name}</span>
                        {ability.power_value && (
                          <span className="ml-auto text-[10px] font-black opacity-80">{ability.power_value}</span>
                        )}
                      </div>
                      <p className="text-[9px] leading-[1.1] opacity-90 pl-1">{ability.description}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className={`px-3 py-1 text-[8px] h-[30px] flex items-center justify-center text-center leading-tight flex-shrink-0 ${styles.footer}`}>
            <span className="line-clamp-2">"{card_copy.flavor_quote}"</span>
          </div>
          
          {/* Bottom copyright/meta - INCREASED VISIBILITY */}
          <div className="px-3 pb-1 pt-0.5 flex justify-between text-[7px] font-bold opacity-80 uppercase tracking-widest flex-shrink-0 drop-shadow-sm">
            <span>{card_spec.sender_name} &rarr; {card_spec.recipient_name}</span>
            <span>Gen-2025 • AI-ART</span>
          </div>

        </div>
      </div>

      {/* --- BACK OF CARD --- */}
      <div className={`${styles.container} id-card-back`}>
        {/* Back Background */}
        <div className={`absolute inset-0 ${styles.backGradient}`}></div>
        <div className={`absolute inset-0 ${styles.backPattern}`}></div>
        
        {/* Foil Overlay */}
        {styles.foil && (
          <div className="absolute inset-0 foil-overlay opacity-30 z-20 pointer-events-none animate-shimmer"></div>
        )}

        {/* Center Logo Area */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
           
           {isMonogram ? (
             // MONOGRAM LAYOUT
             <div className={`w-40 h-40 rounded-full border-4 border-white/20 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl`}>
                <div className="w-32 h-32 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10">
                    <span className="text-7xl font-serif font-black text-white/90 tracking-tighter">{deckTitle}</span>
                </div>
             </div>
           ) : (
             // TITLE LAYOUT
             <>
                <div className={`w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl`}>
                    <div className="w-16 h-16 flex items-center justify-center">
                        <span className="text-4xl">✨</span>
                    </div>
                </div>
                <h2 className="text-2xl font-black tracking-wider text-white/90 mb-2 text-center uppercase break-words max-w-full leading-tight drop-shadow-lg">
                    {deckTitle}
                </h2>
             </>
           )}
           
           <div className="w-16 h-1 bg-white/30 rounded-full mb-6"></div>

           <div className="text-center opacity-70 text-[10px] font-mono tracking-widest uppercase">
              <p>Authentic Digital</p>
              <p>Collectible</p>
           </div>
           
           <div className="absolute bottom-8 text-[8px] opacity-50 tracking-widest font-mono">
              SERIES 2025 // {card_spec.selected_design_theme.toUpperCase().replace(/ /g, '-')}
           </div>
        </div>
      </div>

    </div>
  );
});

TradingCard.displayName = 'TradingCard';