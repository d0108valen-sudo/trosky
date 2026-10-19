import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon, ShieldCheck, Clock, Upload, Check } from 'lucide-react';
import { PinItem, CategoryType, User } from '../types/trosky';
import { GALLERY_PRESET_IMAGES } from '../data/initialPins';

interface CreatePinModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onCreatePin: (pin: PinItem) => void;
  onOpenAuth: () => void;
}

export const CreatePinModal: React.FC<CreatePinModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onCreatePin,
  onOpenAuth,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('relato');
  const [description, setDescription] = useState('');
  const [fullStory, setFullStory] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [familyName, setFamilyName] = useState(currentUser?.family || '');
  const [year, setYear] = useState('1970');
  const [location, setLocation] = useState(currentUser?.community || 'Vereda El Roble');
  
  // Photo selection state
  const [selectedImage, setSelectedImage] = useState(GALLERY_PRESET_IMAGES[0].url);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('Memoria, Familia, Historia Viva');

  useEffect(() => {
    if (currentUser) {
      setAuthorName(currentUser.name);
      if (currentUser.family) setFamilyName(currentUser.family);
      if (currentUser.community) setLocation(currentUser.community);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImagePreview(result);
        setCustomImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const activePhotoUrl = uploadedImagePreview || customImageUrl.trim() || selectedImage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !authorName.trim()) return;

    const categoryLabels: Record<CategoryType, string> = {
      todos: 'Archivo General',
      receta: 'Receta Tradicional',
      relato: 'Relato Oral',
      foto: 'Fotografía de Época',
      oficio: 'Oficio Ancestral',
      familia: 'Espacio Familiar',
      carta: 'Carta y Archivo',
      tradicion: 'Tradición Comunitaria',
    };

    const isApprovedImmediately = currentUser?.role === 'admin';

    const newPin: PinItem = {
      id: `pin-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      fullStory: fullStory.trim() || description.trim(),
      category,
      categoryLabel: categoryLabels[category] || 'Memoria',
      imageUrl: activePhotoUrl,
      aspectRatio: 'tall',
      status: isApprovedImmediately ? 'aprobado' : 'pendiente',
      author: {
        name: authorName.trim(),
        role: familyName ? `Guardián de la ${familyName}` : 'Guardián de la Memoria',
        avatar: currentUser?.avatar || (category === 'receta' ? '👩‍🍳' : category === 'oficio' ? '🧵' : category === 'foto' ? '📷' : '👵'),
        family: familyName.trim() || undefined,
        community: location.trim(),
        userId: currentUser?.id,
      },
      year: year.trim() || 'Época dorada',
      location: location.trim() || 'Colombia',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      likes: 1,
      isLiked: true,
      isSaved: true,
      comments: [],
      createdAt: new Date().toISOString().split('T')[0],
      audioSnippet: {
        speaker: authorName.trim(),
        narrative: description.trim(),
        duration: '1:10 min',
      },
    };

    onCreatePin(newPin);
    onClose();
  };

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee5dc] bg-[#faf8f5]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <h3 className="font-display font-bold text-lg text-[#2c2420]">
                Guardar Mi Historia en Trosky
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#eae1d7] text-[#5c4e46]"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Role Notice */}
            {currentUser?.role === 'admin' ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Publicando como Administrador:</strong> Esta historia se publicará directamente en el tablero público.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#faf4ec] border border-[#e8dfd5] text-xs text-[#5c4e46] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c94d3f] shrink-0" />
                <span>
                  <strong>Aviso de Moderación:</strong> Como usuario familiar, tu historia será enviada al <strong>Administrador</strong> para su revisión y aprobación comunitaria.
                </span>
              </div>
            )}

            {/* Photo Selection Section (Enhanced as requested) */}
            <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#eee4d8]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#3d312a] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#c94d3f]" />
                  <span>Foto de la Publicación (Elige o Sube tu Imagen) *</span>
                </label>
                <label className="px-3 py-1 rounded-full bg-[#c94d3f] hover:bg-[#b03d30] text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs">
                  <Upload className="w-3 h-3" />
                  <span>Subir Mi Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Active Photo Preview */}
              <div className="flex flex-col sm:flex-row gap-4 items-center mb-3 p-3 bg-white rounded-xl border border-[#e5dcd1]">
                <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-[#dfd2c4] bg-[#eee5dc] relative shadow-xs">
                  <img
                    src={activePhotoUrl}
                    alt="Vista previa de la publicación"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xs text-[#6e5d53] space-y-1">
                  <p className="font-semibold text-[#2c2420]">Foto seleccionada para esta publicación</p>
                  <p className="text-[11px] text-[#8e7e74]">
                    Puedes elegir una de las fotografías patrimoniales de abajo, subir una foto de tu propio archivo familiar o pegar un enlace web.
                  </p>
                </div>
              </div>

              {/* Gallery of Preset Authentic Images */}
              <div>
                <span className="block text-[11px] font-bold text-[#7d6b62] uppercase tracking-wider mb-1.5">
                  Galería del Archivo Trosky (Haz clic para cambiar la foto):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {GALLERY_PRESET_IMAGES.map((img, idx) => {
                    const isSelected = activePhotoUrl === img.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedImage(img.url);
                          setUploadedImagePreview(null);
                          setCustomImageUrl('');
                        }}
                        title={img.label}
                        className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#c94d3f] ring-2 ring-[#c94d3f]/40 scale-105 shadow-sm'
                            : 'border-transparent opacity-75 hover:opacity-100 hover:scale-102'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#c94d3f]/20 flex items-center justify-center">
                            <span className="w-4 h-4 rounded-full bg-[#c94d3f] text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL fallback option */}
              <div className="mt-2.5">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    setUploadedImagePreview(null);
                  }}
                  placeholder="O pega el enlace de una foto en internet..."
                  className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e5dcd1] focus:border-[#c94d3f]/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#3d312a] mb-1">
                Título del Pin / Historia *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. El secreto del arequipe de la bisabuela Marina"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#3d312a] mb-1">
                  Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                >
                  <option value="relato">Relato Oral / Historia</option>
                  <option value="receta">Receta Tradicional</option>
                  <option value="foto">Fotografía de Época</option>
                  <option value="oficio">Oficio Ancestral</option>
                  <option value="familia">Espacio Familiar / Árbol</option>
                  <option value="carta">Carta o Documento</option>
                  <option value="tradicion">Tradición Comunitaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d312a] mb-1">
                  Año o Época
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ej. 1965, Década de 1970"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Author & Family */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#3d312a] mb-1">
                  Nombre del Protagonista / Autor *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej. Doña Marina Gómez"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d312a] mb-1">
                  Familia o Apellidos
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Ej. Familia Gómez Restrepo"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-[#3d312a] mb-1">
                Lugar de Origen (Vereda, Municipio, Región)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Vereda El Roble, Boyacá"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-[#3d312a] mb-1">
                Resumen de la Memoria (Extracto para la tarjeta) *
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve reseña que aparecerá en el tablero de Pinterest..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Extended Narrative */}
            <div>
              <label className="block text-xs font-bold text-[#3d312a] mb-1">
                Relato Completo o Pasos de la Receta
              </label>
              <textarea
                rows={3}
                value={fullStory}
                onChange={(e) => setFullStory(e.target.value)}
                placeholder="Cuéntanos con detalle la historia, los secretos, los ingredientes o las anécdotas..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-[#3d312a] mb-1">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Recetas, Vereda, Abuelos, Oficios"
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#f0e9df] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#5c4e46] hover:bg-[#f0e8de] rounded-full transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#c94d3f] hover:bg-[#b03d30] rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {currentUser?.role === 'admin' ? 'Publicar Directamente' : 'Enviar para Aprobación'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
