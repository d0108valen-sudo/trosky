import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CategoryType } from '../types/trosky';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  totalVisible: number;
}

const CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todo el archivo', icon: '✨' },
  { id: 'receta', label: 'Recetas de la Abuela', icon: '🍲' },
  { id: 'relato', label: 'Relatos y Leyendas', icon: '📖' },
  { id: 'foto', label: 'Fotos de Época', icon: '📷' },
  { id: 'oficio', label: 'Oficios y Saberes', icon: '🧵' },
  { id: 'familia', label: 'Familias y Raíces', icon: '🌳' },
  { id: 'carta', label: 'Cartas y Documentos', icon: '💌' },
];

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  totalVisible,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
      {/* Search Input - Pinterest Style centered bar */}
      <div className="relative max-w-2xl mx-auto mb-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8a7a70] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar recetas, relatos, tradiciones, oficios, pueblos..."
            className="w-full pl-11 pr-10 py-3 rounded-full bg-[#f0ebe3] hover:bg-[#eae3d9] focus:bg-white text-sm text-[#2c2420] placeholder:text-[#8a7a70] border border-transparent focus:border-[#c94d3f]/40 focus:ring-4 focus:ring-[#c94d3f]/10 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 p-1 rounded-full text-[#8a7a70] hover:text-[#2c2420] hover:bg-[#e4ded4]"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Interactive Filter Controls as per Section 1.A) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 justify-start md:justify-center">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2c2420] text-white shadow-sm ring-1 ring-[#2c2420]'
                  : 'bg-[#ede7df] hover:bg-[#e4ddd3] text-[#55473f]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result Indicator if filtering */}
      {(searchQuery || selectedCategory !== 'todos') && (
        <div className="flex items-center justify-between text-xs text-[#7d6b62] mt-2 pt-2 border-t border-[#e8dfd5]/60">
          <span>
            Mostrando <strong>{totalVisible}</strong> {totalVisible === 1 ? 'historia' : 'historias'}
            {searchQuery ? ` para "${searchQuery}"` : ''}
          </span>
          <button
            onClick={() => {
              onSearchChange('');
              onSelectCategory('todos');
            }}
            className="text-[#c94d3f] hover:underline font-medium"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
};
