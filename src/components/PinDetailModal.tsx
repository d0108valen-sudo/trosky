import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Bookmark, Heart, Share2, Volume2, Play, Pause, 
  MapPin, Calendar, UtensilsCrossed, Send, ShieldCheck, Trash2, CheckCircle2 
} from 'lucide-react';
import { PinItem, PinComment, User } from '../types/trosky';
import { UserAvatar } from './UserAvatar';

interface PinDetailModalProps {
  pin: PinItem | null;
  currentUser: User | null;
  onClose: () => void;
  onToggleSave: (e: React.MouseEvent, pin: PinItem) => void;
  onToggleLike: (e: React.MouseEvent, pin: PinItem) => void;
  onShare: (e: React.MouseEvent, pin: PinItem) => void;
  onAddComment: (pinId: string, commentText: string, authorName: string) => void;
  onDeleteComment?: (pinId: string, commentId: string) => void;
  onApprovePin?: (pinId: string) => void;
}

export const PinDetailModal: React.FC<PinDetailModalProps> = ({
  pin,
  currentUser,
  onClose,
  onToggleSave,
  onToggleLike,
  onShare,
  onAddComment,
  onDeleteComment,
  onApprovePin,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState(currentUser?.name || '');
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setCommenterName(currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pin?.id]);

  if (!pin) return null;

  const handleAudioPlayback = () => {
    if (!pin.audioSnippet && !pin.description) return;

    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      const textToSpeak = pin.audioSnippet?.narrative || `${pin.title}. ${pin.description}. ${pin.fullStory || ''}`;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        
        utterance.onboundary = (event) => {
          const estimatedTotal = textToSpeak.length;
          const current = event.charIndex;
          setAudioProgress(Math.min(100, Math.round((current / estimatedTotal) * 100)));
        };

        utterance.onend = () => {
          setIsPlayingAudio(false);
          setAudioProgress(100);
          setTimeout(() => setAudioProgress(0), 1000);
        };

        utterance.onerror = () => {
          setIsPlayingAudio(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      } else {
        setIsPlayingAudio(true);
        const interval = setInterval(() => {
          setAudioProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsPlayingAudio(false);
              return 0;
            }
            return prev + 10;
          });
        }, 600);
      }
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const author = commenterName.trim() || currentUser?.name || 'Visitante de la Comunidad';
    onAddComment(pin.id, newComment.trim(), author);
    setNewComment('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 lg:p-10">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[92vh] border border-[#e8dfd5]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#2c2420] shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: High Quality Image */}
          <div className="md:w-1/2 bg-[#2c2420] relative flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
            <img
              src={pin.imageUrl}
              alt={pin.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[50vh] md:max-h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
              <span className="text-xs uppercase tracking-wider text-[#ffbe76] font-semibold">
                {pin.categoryLabel}
              </span>
              <p className="text-sm font-medium drop-shadow-sm">{pin.location}</p>
            </div>
          </div>

          {/* Right Side: Narrative, Audio & Comments */}
          <div className="md:w-1/2 flex flex-col p-6 sm:p-8 overflow-y-auto">
            {/* Admin Bar if currentUser is admin */}
            {currentUser?.role === 'admin' && (
              <div className="mb-4 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Modo Curador Admin · Estado: {pin.status}</span>
                </span>
                {pin.status === 'pendiente' && onApprovePin && (
                  <button
                    onClick={() => onApprovePin(pin.id)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[11px] font-bold hover:bg-emerald-700 transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobar ya</span>
                  </button>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0e9df] gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => onToggleLike(e, pin)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    pin.isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-[#f4eee7] hover:bg-[#e9e1d8] text-[#3d312a]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${pin.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{pin.likes}</span>
                </button>

                <button
                  onClick={(e) => onShare(e, pin)}
                  className="p-2 rounded-full bg-[#f4eee7] hover:bg-[#e9e1d8] text-[#3d312a] transition-all cursor-pointer"
                  title="Compartir enlace"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={(e) => onToggleSave(e, pin)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                  pin.isSaved
                    ? 'bg-[#2c2420] text-white hover:bg-black'
                    : 'bg-[#c94d3f] text-white hover:bg-[#b03d30]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${pin.isSaved ? 'fill-white' : ''}`} />
                <span>{pin.isSaved ? 'Guardado en Álbum' : 'Guardar Pin'}</span>
              </button>
            </div>

            {/* Unboxed Metadata Hierarchy */}
            <div className="flex items-center gap-2 text-xs text-[#827167] mt-5 mb-2">
              <span className="font-semibold text-[#a85a4a]">{pin.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {pin.year}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />
                {pin.location}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2420] leading-tight mb-3">
              {pin.title}
            </h2>

            {/* Author Badge */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf6f1] border border-[#eee4d8] mb-5">
              <UserAvatar
                avatar={pin.author.avatar}
                name={pin.author.name}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[#2c2420] truncate">
                  {pin.author.name}
                </h4>
                <p className="text-xs text-[#7b695e] truncate">
                  {pin.author.role} {pin.author.family ? `· ${pin.author.family}` : ''}
                </p>
              </div>
            </div>

            {/* Narrative Story */}
            <div className="prose prose-sm text-[#4d4038] leading-relaxed mb-6 space-y-3">
              <p className="font-medium text-[#2c2420]">{pin.description}</p>
              {pin.fullStory && (
                <p className="text-sm text-[#5a4c44] border-l-2 border-[#e8dfd5] pl-3 py-1 italic bg-[#fcfbfa]">
                  "{pin.fullStory}"
                </p>
              )}
            </div>

            {/* Audio Narrative Feature */}
            <div className="p-4 rounded-2xl bg-[#f7f2eb] border border-[#e8dfd5] mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎙️</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#2c2420]">
                      Memoria Sonora y Testimonio Oral
                    </h4>
                    <p className="text-[11px] text-[#7d6b62]">
                      {pin.audioSnippet?.speaker || pin.author.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAudioPlayback}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c94d3f] hover:bg-[#b03d30] text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-white" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Escuchar Voz</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#e3dad0] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#c94d3f] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${isPlayingAudio ? (audioProgress || 45) : 0}%` }}
                />
              </div>

              {pin.audioSnippet && (
                <p className="text-xs text-[#5c4e46] mt-2 italic">
                  {pin.audioSnippet.narrative}
                </p>
              )}
            </div>

            {/* Recipe Details if applicable */}
            {pin.recipeDetails && (
              <div className="p-4 rounded-2xl bg-[#fffcf8] border border-[#eedecb] mb-6">
                <div className="flex items-center gap-2 text-[#a85a4a] text-xs font-bold mb-3">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Ingredientes y Preparación Tradicional</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#7d6b62] mb-3 pb-3 border-b border-[#f0e4d5]">
                  <div><strong>Porciones:</strong> {pin.recipeDetails.servings}</div>
                  <div><strong>Tiempo de cocción:</strong> {pin.recipeDetails.time}</div>
                </div>
                <ul className="space-y-1.5 text-xs text-[#52443c]">
                  {pin.recipeDetails.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#c94d3f] font-bold">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {pin.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#f0eae1] text-[#605047] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Comments & Family Tributes Section */}
            <div className="mt-auto pt-5 border-t border-[#f0e9df]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7d6b62] mb-3 flex items-center justify-between">
                <span>Comentarios y Recuerdos ({pin.comments.length})</span>
                <span className="text-[11px] font-normal lowercase">Memoria comunitaria</span>
              </h4>

              {/* Comment list */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4 scrollbar-thin">
                {pin.comments.length === 0 ? (
                  <p className="text-xs text-[#8f7e75] italic py-2">
                    Aún no hay testimonios en esta historia. Comparte un recuerdo familiar.
                  </p>
                ) : (
                  pin.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 items-start text-xs bg-[#faf7f3] p-2.5 rounded-xl group/com">
                      <UserAvatar
                        avatar={comment.avatar}
                        name={comment.author}
                        size="xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-[#2c2420]">{comment.author}</strong>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#9a8980]">{comment.date}</span>
                            {currentUser?.role === 'admin' && onDeleteComment && (
                              <button
                                onClick={() => onDeleteComment(pin.id, comment.id)}
                                className="text-rose-500 opacity-60 hover:opacity-100 p-0.5"
                                title="Eliminar como administrador"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[#55463e] mt-0.5 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                {!currentUser && (
                  <input
                    type="text"
                    placeholder="Tu nombre o parentesco (ej. Nieto de Don Eusebio)"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg bg-[#f0e9df] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                  />
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      currentUser
                        ? `Comentar como ${currentUser.name}...`
                        : "Escribe tu anécdota o recuerdo..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#f0e9df] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-3.5 py-2 bg-[#2c2420] disabled:opacity-40 text-white rounded-xl text-xs font-semibold hover:bg-black transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Comentar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
