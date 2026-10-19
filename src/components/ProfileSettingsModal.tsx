import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Camera, Upload, Link as LinkIcon, Check, 
  User as UserIcon, MapPin, Users, LogOut, Shield, 
  BookOpen, Eye, Trash2, PlusCircle, AlertCircle, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { User, PinItem } from '../types/trosky';
import { UserAvatar } from './UserAvatar';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  currentUser: User | null;
  userPins: PinItem[];
  initialTab?: 'profile' | 'publications';
  onClose: () => void;
  onUpdateProfile: (updatedData: { name: string; family?: string; community?: string; avatar: string }) => void;
  onSelectPin: (pin: PinItem) => void;
  onDeletePin?: (pinId: string) => void;
  onOpenCreate?: () => void;
  onRequestLogout: () => void;
}

const PRESET_PHOTO_OPTIONS = [
  {
    label: 'Campesina Tradicional',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Abuela Tejedora',
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Artesano Rural',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Cultivador de Campo',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Líder Comunitaria',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Joven Campesino',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  },
];

const EMOJI_OPTIONS = ['👩‍🌾', '👨‍🌾', '👵', '👴', '👩‍🍳', '🧵', '📜', '🌻', '🌸', '🐎', '👑', '🛡️'];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  currentUser,
  userPins,
  initialTab = 'profile',
  onClose,
  onUpdateProfile,
  onSelectPin,
  onDeletePin,
  onOpenCreate,
  onRequestLogout,
}) => {
  if (!isOpen || !currentUser) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'publications'>(initialTab);
  const [name, setName] = useState(currentUser.name);
  const [family, setFamily] = useState(currentUser.family || '');
  const [community, setCommunity] = useState(currentUser.community || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [photoTab, setPhotoTab] = useState<'upload' | 'presets' | 'emojis'>('upload');
  const [confirmDeletePinId, setConfirmDeletePinId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when current user changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setFamily(currentUser.family || '');
      setCommunity(currentUser.community || '');
      setAvatar(currentUser.avatar);
      setActiveTab(initialTab);
    }
  }, [currentUser, isOpen, initialTab]);

  // Filter pins belonging to this user
  const myPosts = userPins.filter(
    (pin) =>
      (pin.author.userId && pin.author.userId === currentUser.id) ||
      (pin.author.name && pin.author.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProfile({
      name: name.trim(),
      family: family.trim() || undefined,
      community: community.trim() || undefined,
      avatar,
    });
    onClose();
  };

  const handleDeletePost = (pinId: string) => {
    if (onDeletePin) {
      onDeletePin(pinId);
      setConfirmDeletePinId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#e8dfd5]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-[#fbf8f5] border-b border-[#eee5dc] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar avatar={avatar} name={name} size="lg" className="shadow-xs" />
              <div>
                <h3 className="font-display font-bold text-xl text-[#2c2420]">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-[#7d6b62]">
                  {currentUser.email} ·{' '}
                  <span className="font-semibold text-[#a85a4a]">
                    {currentUser.role === 'admin'
                      ? 'Superadministrador'
                      : currentUser.role === 'subadmin'
                      ? 'Sub-administrador'
                      : 'Usuario Común'}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#eae1d7] text-[#5c4e46] cursor-pointer"
              aria-label="Cerrar ajustes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs: Perfil vs Mis Publicaciones */}
          <div className="flex border-b border-[#eee5dc] bg-[#f7f2eb] px-6 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#c94d3f] text-[#c94d3f]'
                  : 'border-transparent text-[#7d6b62] hover:text-[#2c2420]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Editar Mi Perfil y Foto</span>
            </button>

            <button
              onClick={() => setActiveTab('publications')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'publications'
                  ? 'border-[#c94d3f] text-[#c94d3f]'
                  : 'border-transparent text-[#7d6b62] hover:text-[#2c2420]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mis Publicaciones</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-white text-[#2c2420] border border-[#e5dcd1]">
                {myPosts.length}
              </span>
            </button>
          </div>

          {/* TAB 1: EDIT PROFILE & PHOTO */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Foto de Perfil Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7d6b62] mb-3">
                  Foto de Perfil Actual
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#faf6f1] border border-[#eee4d8]">
                  <div className="relative group shrink-0">
                    <UserAvatar
                      avatar={avatar}
                      name={name}
                      size="xl"
                      className="ring-4 ring-white shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#c94d3f] hover:bg-[#b03d30] text-white shadow-md transition-transform active:scale-90 cursor-pointer"
                      title="Subir foto desde dispositivo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <p className="text-sm font-bold text-[#2c2420]">{name || 'Mi Perfil'}</p>
                    <p className="text-xs text-[#7d6b62]">{currentUser.email}</p>
                    <p className="text-[11px] text-[#8e7e74]">
                      Esta foto y nombre aparecerán en tus publicaciones, comentarios y en la barra superior.
                    </p>
                  </div>
                </div>

                {/* Sub-tabs to choose avatar source */}
                <div className="mt-4">
                  <div className="flex rounded-xl bg-[#ede4d8] p-1 mb-3">
                    <button
                      type="button"
                      onClick={() => setPhotoTab('upload')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        photoTab === 'upload'
                          ? 'bg-white text-[#2c2420] shadow-xs'
                          : 'text-[#6e5d53] hover:text-[#2c2420]'
                      }`}
                    >
                      Subir Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoTab('presets')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        photoTab === 'presets'
                          ? 'bg-white text-[#2c2420] shadow-xs'
                          : 'text-[#6e5d53] hover:text-[#2c2420]'
                      }`}
                    >
                      Fotos Tradicionales
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoTab('emojis')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        photoTab === 'emojis'
                          ? 'bg-white text-[#2c2420] shadow-xs'
                          : 'text-[#6e5d53] hover:text-[#2c2420]'
                      }`}
                    >
                      Iconos / Emojis
                    </button>
                  </div>

                  {/* Sub-tab 1: Upload from device */}
                  {photoTab === 'upload' && (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-5 border-2 border-dashed border-[#d8ccc0] hover:border-[#c94d3f] rounded-2xl bg-[#faf7f3] text-center cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 text-[#a85a4a] mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#2c2420]">
                          Haz clic para seleccionar una foto de tu celular o computador
                        </p>
                        <p className="text-[11px] text-[#7d6b62] mt-0.5">
                          Formatos PNG, JPG, JPEG o WebP (hasta 5 MB)
                        </p>
                      </div>

                      {/* Custom URL toggler */}
                      <div className="pt-1 text-center">
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-xs text-[#a85a4a] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>{showUrlInput ? 'Ocultar enlace web' : 'O pegar enlace web de foto'}</span>
                        </button>
                      </div>

                      {showUrlInput && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            placeholder="https://ejemplo.com/mi-foto.jpg"
                            className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCustomUrl}
                            className="px-4 py-2 bg-[#2c2420] text-white text-xs font-bold rounded-xl hover:bg-black transition-all cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 2: Presets */}
                  {photoTab === 'presets' && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {PRESET_PHOTO_OPTIONS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setAvatar(preset.url)}
                          className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                            avatar === preset.url
                              ? 'border-[#c94d3f] scale-105 shadow-md'
                              : 'border-transparent hover:border-[#dfd3c5]'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                          {avatar === preset.url && (
                            <div className="absolute inset-0 bg-[#c94d3f]/30 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sub-tab 3: Emojis */}
                  {photoTab === 'emojis' && (
                    <div className="flex flex-wrap gap-2.5 justify-center p-3 rounded-2xl bg-[#faf6f1] border border-[#eee4d8]">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setAvatar(em)}
                          className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                            avatar === em
                              ? 'bg-[#c94d3f] text-white shadow-md scale-110'
                              : 'bg-white hover:bg-[#ede3d8] border border-[#e5dcd1]'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info Form Fields */}
              <div className="space-y-4 pt-4 border-t border-[#f0e8de]">
                <div>
                  <label className="block text-xs font-bold text-[#3d312a] mb-1">
                    Nombre Completo (Visible en tu perfil y publicaciones) *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#8a7a70] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre y apellidos"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3d312a] mb-1">
                      Familia / Apellidos Familiares
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#8a7a70] absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={family}
                        onChange={(e) => setFamily(e.target.value)}
                        placeholder="Ej. Familia Restrepo Gómez"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3d312a] mb-1">
                      Comunidad o Vereda
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#8a7a70] absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        placeholder="Ej. Vereda El Roble, Boyacá"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#f0e8de] space-y-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#c94d3f] hover:bg-[#b03d30] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios de Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestLogout();
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MIS PUBLICACIONES */}
          {activeTab === 'publications' && (
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eee5dc]">
                <div>
                  <h4 className="font-display font-bold text-base text-[#2c2420]">
                    Historias en tu Archivo Personal
                  </h4>
                  <p className="text-xs text-[#7d6b62]">
                    Consulta tus publicaciones, su estado de aprobación y accede a su detalle completo.
                  </p>
                </div>

                {onOpenCreate && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreate();
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#c94d3f] hover:bg-[#b03d30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Nueva Historia</span>
                  </button>
                )}
              </div>

              {myPosts.length === 0 ? (
                <div className="py-12 text-center bg-[#faf7f3] rounded-2xl border border-[#eee5dc] p-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#efe8df] flex items-center justify-center text-2xl">
                    📜
                  </div>
                  <h4 className="font-display font-bold text-base text-[#2c2420] mb-1">
                    Aún no has compartido publicaciones
                  </h4>
                  <p className="text-xs text-[#7d6b62] max-w-sm mx-auto mb-4">
                    Comparte una receta de tus abuelos, una fotografía antigua o un relato tradicional para preservarlo en Trosky.
                  </p>
                  {onOpenCreate && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCreate();
                      }}
                      className="px-4 py-2 rounded-full bg-[#2c2420] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Crear mi primera historia
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((pin) => (
                    <div
                      key={pin.id}
                      className="p-4 rounded-2xl bg-[#faf7f3] border border-[#eee5dc] hover:border-[#dfd3c5] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={pin.imageUrl}
                          alt={pin.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#e5dcd1]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] uppercase font-bold text-[#a85a4a]">
                              {pin.categoryLabel} · {pin.year}
                            </span>

                            {/* Status badge */}
                            {pin.status === 'aprobado' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Aprobado en Tablero</span>
                              </span>
                            ) : pin.status === 'pendiente' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pendiente de Aprobación</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Rechazado: {pin.rejectionReason || 'Revisar contenido'}</span>
                              </span>
                            )}
                          </div>

                          <h5 className="font-display font-bold text-xs sm:text-sm text-[#2c2420] truncate">
                            {pin.title}
                          </h5>
                          <p className="text-[11px] text-[#6e5d53] line-clamp-1 mt-0.5">
                            {pin.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-[#8e7e74] mt-1">
                            <span>❤️ {pin.likes} me gusta</span>
                            <span>💬 {pin.comments.length} testimonios</span>
                            <span>📅 {pin.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectPin(pin);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#ede3d8] text-xs font-semibold text-[#2c2420] border border-[#d8ccc0] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#c94d3f]" />
                          <span>Ver</span>
                        </button>

                        {confirmDeletePinId === pin.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                            <button
                              type="button"
                              onClick={() => handleDeletePost(pin.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePinId(null)}
                              className="px-2 py-1.5 rounded-xl bg-[#eee5dc] text-[11px] font-semibold text-[#55473f] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePinId(pin.id)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar mi historia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
