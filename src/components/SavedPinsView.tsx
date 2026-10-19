import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Sparkles, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { PinItem } from '../types/trosky';
import { PinCard } from './PinCard';

interface SavedPinsViewProps {
  savedPins: PinItem[];
  onBackToFeed: () => void;
  onOpenDetail: (pin: PinItem) => void;
  onToggleSave: (e: React.MouseEvent, pin: PinItem) => void;
  onToggleLike: (e: React.MouseEvent, pin: PinItem) => void;
  onShare: (e: React.MouseEvent, pin: PinItem) => void;
}

export const SavedPinsView: React.FC<SavedPinsViewProps> = ({
  savedPins,
  onBackToFeed,
  onOpenDetail,
  onToggleSave,
  onToggleLike,
  onShare,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e8dfd5] mb-6">
        <div>
          <button
            onClick={onBackToFeed}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#827167] hover:text-[#2c2420] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Explorar</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2420] flex items-center gap-2">
            <span>Mi Álbum Familiar Guardado</span>
            <span className="text-xs bg-[#c94d3f] text-white px-2.5 py-0.5 rounded-full font-sans font-bold">
              {savedPins.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#736257] mt-1">
            Tus recuerdos, recetas y fotografías guardadas para consultar en cualquier momento.
          </p>
        </div>

        {/* Board summaries */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-[#eee5dc] text-xs font-medium text-[#4f423a]">
            {savedPins.filter((p) => p.category === 'receta').length} Recetas
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-[#eee5dc] text-xs font-medium text-[#4f423a]">
            {savedPins.filter((p) => p.category === 'relato').length} Relatos
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-[#eee5dc] text-xs font-medium text-[#4f423a]">
            {savedPins.filter((p) => p.category === 'foto').length} Fotografías
          </div>
        </div>
      </div>

      {/* Grid or Empty state */}
      {savedPins.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#f0e8de] flex items-center justify-center text-3xl shadow-xs">
            📑
          </div>
          <h3 className="font-display text-lg font-bold text-[#2c2420] mb-2">
            Aún no has guardado recuerdos
          </h3>
          <p className="text-xs text-[#736257] leading-relaxed mb-6">
            Pasa el cursor sobre cualquier tarjeta en el archivo comunitario y haz clic en el botón rojo <strong>"Guardar"</strong> para armar tu propio álbum familiar.
          </p>
          <button
            onClick={onBackToFeed}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#c94d3f] hover:bg-[#b03d30] rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Explorar historias ahora
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          <AnimatePresence>
            {savedPins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                onOpenDetail={onOpenDetail}
                onToggleSave={onToggleSave}
                onToggleLike={onToggleLike}
                onShare={onShare}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
