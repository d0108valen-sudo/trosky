import React from 'react';
import { Sparkles, Plus, BookOpen, Heart, ArrowDown } from 'lucide-react';

interface HeroBannerProps {
  onOpenCreate: () => void;
  onOpenAbout: () => void;
  totalStories: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenCreate,
  onOpenAbout,
  totalStories,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c2420] via-[#3a2f2a] to-[#261f1c] text-white p-6 sm:p-10 shadow-lg border border-[#483c35]">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-[180px] pointer-events-none select-none">
          🌸
        </div>

        <div className="relative z-10 max-w-3xl">
          {/* Metadata kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ffbe76] tracking-wider uppercase mb-3">
            <span>MEMORIA FAMILIAR</span>
            <span aria-hidden="true">·</span>
            <span>IDENTIDAD COMUNITARIA</span>
            <span aria-hidden="true">·</span>
            <span>SABERES ANCESTRALES</span>
          </div>

          {/* Headline with text-wrap: balance */}
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3 [text-wrap:balance]">
            Cada familia tiene una historia. <span className="text-[#ffbe76]">Trosky ayuda a conservarla.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#d8cbc1] leading-relaxed mb-6 max-w-2xl font-light">
            Un archivo digital colaborativo para proteger fotografías de época, recetas de leña, oficios que perduran y relatos contados por nuestros abuelos.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#c94d3f] hover:bg-[#b03d30] text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar mi Historia</span>
            </button>

            <button
              onClick={onOpenAbout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/15 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#ffbe76]" />
              <span>¿Qué es Trosky?</span>
            </button>

            {/* Quick count indicator */}
            <div className="hidden lg:flex items-center gap-2 ml-4 text-xs text-[#b8a79b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffbe76]" />
              <span><strong>{totalStories}</strong> memorias archivadas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
