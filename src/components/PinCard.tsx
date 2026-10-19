import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Heart, Share2, Volume2, ArrowUpRight } from 'lucide-react';
import { PinItem } from '../types/trosky';
import { UserAvatar } from './UserAvatar';

interface PinCardProps {
  pin: PinItem;
  onOpenDetail: (pin: PinItem) => void;
  onToggleSave: (e: React.MouseEvent, pin: PinItem) => void;
  onToggleLike: (e: React.MouseEvent, pin: PinItem) => void;
  onShare: (e: React.MouseEvent, pin: PinItem) => void;
}

export const PinCard: React.FC<PinCardProps> = ({
  pin,
  onOpenDetail,
  onToggleSave,
  onToggleLike,
  onShare,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="masonry-item mb-5 group cursor-pointer"
      onClick={() => onOpenDetail(pin)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#eee7de] shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1">
        {/* Main Visual Image with Fallback */}
        <div className="relative overflow-hidden w-full">
          {!imageError ? (
            <img
              src={pin.imageUrl}
              alt={pin.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 block"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-[#e6ded5] to-[#d8cec2] flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl mb-2">{pin.author.avatar || '🌸'}</span>
              <p className="text-xs font-semibold text-[#5c4e46]">{pin.title}</p>
            </div>
          )}

          {/* Audio Snippet Badge */}
          {pin.audioSnippet && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Volume2 className="w-3 h-3 text-[#ffbe76]" />
              <span>Relato oral</span>
            </div>
          )}

          {/* Pinterest-style Hover Overlay */}
          <div
            className={`absolute inset-0 bg-black/35 transition-opacity duration-200 p-3 flex flex-col justify-between ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Top Row: Save Button */}
            <div className="flex justify-end">
              <button
                onClick={(e) => onToggleSave(e, pin)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${
                  pin.isSaved
                    ? 'bg-[#2c2420] text-white hover:bg-black'
                    : 'bg-[#c94d3f] text-white hover:bg-[#b03d30]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${pin.isSaved ? 'fill-white' : ''}`} />
                <span>{pin.isSaved ? 'Guardado' : 'Guardar'}</span>
              </button>
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex items-center justify-between">
              {/* Like Button */}
              <button
                onClick={(e) => onToggleLike(e, pin)}
                className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 flex items-center gap-1 text-xs font-semibold ${
                  pin.isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/80 hover:bg-white text-[#2c2420]'
                }`}
                title="Me gusta"
              >
                <Heart className={`w-3.5 h-3.5 ${pin.isLiked ? 'fill-white' : ''}`} />
                <span>{pin.likes}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {/* Share Button */}
                <button
                  onClick={(e) => onShare(e, pin)}
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-[#2c2420] backdrop-blur-md transition-all active:scale-90"
                  title="Compartir historia"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* Open Pin Detail Button */}
                <div className="p-2 rounded-full bg-white/80 text-[#2c2420] backdrop-blur-md">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body - Content */}
        <div className="p-3.5 sm:p-4 bg-white/95">
          {/* Metadata Discipline: Clean unboxed text with '·' separators */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#7d6b62] mb-1.5">
            <span className="font-semibold text-[#a85a4a]">{pin.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{pin.year}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[110px]">{pin.location.split(',')[0]}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-sm sm:text-base text-[#2c2420] group-hover:text-[#c94d3f] transition-colors line-clamp-2 leading-snug mb-1.5">
            {pin.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs text-[#5c4e46] line-clamp-2 leading-relaxed mb-3">
            {pin.description}
          </p>

          {/* Author Footprint */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f0e9e1]">
            <UserAvatar
              avatar={pin.author.avatar}
              name={pin.author.name}
              size="xs"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#3b302a] truncate leading-tight">
                {pin.author.name}
              </p>
              {pin.author.community && (
                <p className="text-[10px] text-[#8a7a70] truncate leading-tight">
                  {pin.author.community}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
