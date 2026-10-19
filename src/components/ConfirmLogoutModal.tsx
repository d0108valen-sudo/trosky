import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, AlertCircle, UserCheck } from 'lucide-react';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  userName?: string;
  userEmail?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  isOpen,
  userName = 'Usuario',
  userEmail,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="fixed inset-0" onClick={onCancel} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#e8dfd5] p-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#f0e9df] text-[#7d6b62] cursor-pointer"
            aria-label="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning Icon */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-[#c94d3f] flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <LogOut className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h3 className="font-display font-bold text-lg text-[#2c2420] mb-2">
            ¿Estás seguro de cerrar sesión?
          </h3>

          <p className="text-xs text-[#6e5d53] leading-relaxed mb-4">
            Saldrás de la cuenta de <strong>{userName}</strong>
            {userEmail ? ` (${userEmail})` : ''}.
          </p>

          <div className="p-3 bg-[#faf6f1] rounded-2xl border border-[#eee5dc] text-[11px] text-[#7d6b62] text-left flex items-start gap-2 mb-5">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Al confirmar, el formulario quedará listo para ingresar con el correo y contraseña de otra persona.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-2.5 bg-[#c94d3f] hover:bg-[#b03d30] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sí, cerrar sesión</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 bg-[#f0e8de] hover:bg-[#e4ddd2] text-[#3d312a] font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
