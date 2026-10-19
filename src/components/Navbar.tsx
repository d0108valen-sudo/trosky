import React, { useState } from 'react';
import { Bookmark, Plus, Sparkles, ShieldCheck, LogIn, LogOut, User as UserIcon, ChevronDown, Settings, BookOpen } from 'lucide-react';
import { User } from '../types/trosky';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  activeView: 'feed' | 'saved' | 'about' | 'admin';
  savedCount: number;
  pendingCount: number;
  currentUser: User | null;
  onSelectView: (view: 'feed' | 'saved' | 'about' | 'admin') => void;
  onOpenCreate: () => void;
  onOpenAbout: () => void;
  onOpenAuth: () => void;
  onOpenProfileSettings?: () => void;
  onOpenMyPosts?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  savedCount,
  pendingCount,
  currentUser,
  onSelectView,
  onOpenCreate,
  onOpenAbout,
  onOpenAuth,
  onOpenProfileSettings,
  onOpenMyPosts,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8dfd5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectView('feed')}
          className="text-xl font-bold tracking-tight text-[#2c2420] whitespace-nowrap shrink-0 flex items-center gap-2 text-left group cursor-pointer"
        >
          <span className="text-2xl transition-transform group-hover:rotate-12 duration-200">🌸</span>
          <span className="font-display tracking-wide text-2xl font-bold text-[#352520]">Trosky</span>
          <span className="hidden sm:inline text-xs font-medium text-[#7d6b62] bg-[#f0e9df] px-2 py-0.5 rounded-full">
            Entre Generaciones
          </span>
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5c4e46]">
          <button
            onClick={() => onSelectView('feed')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
              activeView === 'feed'
                ? 'text-[#c94d3f] border-[#c94d3f] font-semibold'
                : 'border-transparent hover:text-[#2c2420]'
            }`}
          >
            Explorar Historias
          </button>

          <button
            onClick={() => onSelectView('saved')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeView === 'saved'
                ? 'text-[#c94d3f] border-[#c94d3f] font-semibold'
                : 'border-transparent hover:text-[#2c2420]'
            }`}
          >
            <span>Mis Guardados</span>
            {savedCount > 0 && (
              <span className="text-xs bg-[#c94d3f] text-white px-1.5 py-0.2 rounded-full font-semibold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Dedicated Admin/Moderation view link if user is admin or subadmin */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'subadmin') && (
            <button
              onClick={() => onSelectView('admin')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeView === 'admin'
                  ? 'text-amber-700 border-amber-600 font-bold'
                  : 'border-transparent text-amber-800 hover:text-amber-950'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{currentUser.role === 'admin' ? 'Panel Administrador' : 'Panel Moderación'}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenAbout}
            className="transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent hover:text-[#2c2420] flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a85a4a]" />
            <span>Nuestra Historia</span>
          </button>
        </nav>

        {/* Zone 3: Actions & User Auth */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Create Pin Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-[#c94d3f] rounded-full hover:bg-[#b33d30] active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Guardar mi Historia</span>
            <span className="sm:hidden">Publicar</span>
          </button>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : currentUser.role === 'subadmin'
                    ? 'bg-purple-50/80 border-purple-300 text-purple-900 hover:bg-purple-100'
                    : 'bg-white border-[#e0d6cb] text-[#2c2420] hover:bg-[#f6eee5]'
                }`}
              >
                <UserAvatar avatar={currentUser.avatar} name={currentUser.name} size="xs" />
                <span className="max-w-[100px] truncate font-semibold hidden md:inline">
                  {currentUser.name}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                    Admin
                  </span>
                )}
                {currentUser.role === 'subadmin' && (
                  <span className="text-[10px] bg-purple-700 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                    Sub-admin
                  </span>
                )}
                {currentUser.role === 'usuario' && (
                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                    Común
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-[#7d6b62]" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-[#e5dcd1] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#f0e8de] flex items-center gap-3">
                    <UserAvatar avatar={currentUser.avatar} name={currentUser.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#2c2420] truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-[#7d6b62] truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-0.5 text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.2 rounded-full bg-[#f0e9df] text-[#55473f]">
                        Rol: {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'subadmin' ? 'Sub-admin' : 'Usuario Común'}
                      </span>
                    </div>
                  </div>

                  {onOpenProfileSettings && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenProfileSettings();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#2c2420] hover:bg-[#faf6f1] flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#c94d3f]" />
                      <span>Ajustes de mi Perfil y Foto</span>
                    </button>
                  )}

                  {onOpenMyPosts && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenMyPosts();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#2c2420] hover:bg-[#faf6f1] flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      <span>Mis Publicaciones e Historias</span>
                    </button>
                  )}

                  {(currentUser.role === 'admin' || currentUser.role === 'subadmin') && (
                    <button
                      onClick={() => onSelectView('admin')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>{currentUser.role === 'admin' ? 'Panel de Administrador' : 'Panel de Moderación'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectView('saved')}
                    className="w-full text-left px-4 py-2 text-xs text-[#4e4038] hover:bg-[#faf6f1] flex items-center gap-2 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-[#8a7a70]" />
                    <span>Mis Recuerdos Guardados</span>
                  </button>

                  <button
                    onClick={onOpenAuth}
                    className="w-full text-left px-4 py-2 text-xs text-[#4e4038] hover:bg-[#faf6f1] flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#8a7a70]" />
                    <span>Cambiar / Crear Cuenta</span>
                  </button>

                  <div className="border-t border-[#f0e8de] my-1" />

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f6eee5] text-[#2c2420] text-xs font-bold border border-[#e0d6cb] transition-all cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#c94d3f]" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
