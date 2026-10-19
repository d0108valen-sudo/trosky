import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Heart, Bookmark, Share2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'save' | 'like' | 'share' | 'success';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#2c2420] text-white shadow-xl text-sm font-medium border border-white/10"
            onClick={() => onDismiss(toast.id)}
          >
            {toast.type === 'save' && <Bookmark className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
            {toast.type === 'like' && <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />}
            {toast.type === 'share' && <Share2 className="w-4 h-4 text-sky-400" />}
            {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
            <span>{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
