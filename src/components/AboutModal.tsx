import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Shield, Sparkles, BookOpen, Clock, Users } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
}

const TIMELINE_STEPS = [
  {
    icon: '👵',
    title: 'Generaciones mayores',
    desc: 'Guardianas de saberes, oficios ancestrales y relatos que merecen permanecer intactos en el tiempo.',
  },
  {
    icon: '📖',
    title: 'Historias y conocimientos',
    desc: 'Recetas secretas, tradiciones de vereda, oficios y relatos orales contados en primera persona.',
  },
  {
    icon: '📷',
    title: 'Fotografías y recuerdos',
    desc: 'Álbumes familiares en blanco y negro, cartas manuscritas de amor y documentos que guardan memoria viva.',
  },
  {
    icon: '💻',
    title: 'Digitalización y Archivo Trosky',
    desc: 'Organizamos y protegemos esa riqueza cultural en una cuadrícula interactiva visual e infinita.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Nuevas generaciones',
    desc: 'Para que los jóvenes y niños de hoy y de mañana puedan conocer, amar y continuar su verdadera historia.',
  },
];

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenCreate }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#e8dfd5] max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-8 pb-6 bg-[#fbf8f5] border-b border-[#eee4d8]">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#eae0d4] text-[#5c4e46]"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#c94d3f]">
              <Sparkles className="w-4 h-4" />
              <span>MEMORIA FAMILIAR & COMUNITARIA</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2420] mb-2">
              Cada familia tiene una historia. Trosky ayuda a conservarla.
            </h2>
            <p className="text-sm text-[#66544a] leading-relaxed max-w-2xl">
              Trosky nace como una propuesta para evitar que las historias, conocimientos y recuerdos de nuestras generaciones mayores se pierdan en el olvido. Un espacio digital cálido para reunir recetas de leña, oficios que se resisten a desaparecer, relatos campesinos y fotografías de estudio.
            </p>
          </div>

          {/* Timeline & Philosophy */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#827167] mb-4">
                El puente entre generaciones
              </h3>

              <div className="space-y-4">
                {TIMELINE_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 items-start p-3.5 rounded-2xl bg-[#faf6f1] border border-[#eee4d8] hover:border-[#dfd0be] transition-all"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-xs shrink-0">
                      {step.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#2c2420] mb-0.5">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#5c4e46] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote banner */}
            <div className="p-5 rounded-2xl bg-[#2c2420] text-white flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#d6c7bc] italic mb-1 font-display">
                  "Quien olvida de dónde viene difícilmente sabrá hacia dónde camina."
                </p>
                <span className="text-[11px] text-[#ffbe76] font-semibold">
                  Sabiduría popular colombiana
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreate();
                }}
                className="px-4 py-2 bg-[#c94d3f] hover:bg-[#b03d30] text-white text-xs font-bold rounded-full whitespace-nowrap shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Sumar una historia
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
