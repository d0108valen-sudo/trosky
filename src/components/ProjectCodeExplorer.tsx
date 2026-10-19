import React, { useState } from 'react';
import { Code, FileCode, Check, Copy, Shield, Lock, Search } from 'lucide-react';

// Vite ?raw imports to load actual project source files directly
import htmlSource from '../../index.html?raw';
import cssSource from '../index.css?raw';
import appSource from '../App.tsx?raw';
import typesSource from '../types/trosky.ts?raw';
import adminPanelSource from './AdminPanel.tsx?raw';
import profileSettingsSource from './ProfileSettingsModal.tsx?raw';
import pinCardSource from './PinCard.tsx?raw';
import securitySource from '../utils/security.ts?raw';
import totpSource from '../utils/totp.ts?raw';

interface CodeFileItem {
  id: string;
  name: string;
  path: string;
  category: 'html' | 'css' | 'typescript' | 'security';
  description: string;
  content: string;
}

const PROJECT_FILES: CodeFileItem[] = [
  {
    id: 'html',
    name: 'index.html',
    path: '/index.html',
    category: 'html',
    description: 'Estructura HTML base, metadatos SEO y contenedor raíz de la aplicación',
    content: htmlSource,
  },
  {
    id: 'css',
    name: 'index.css',
    path: '/src/index.css',
    category: 'css',
    description: 'Estilos globales, fuentes tipográficas y diseño editorial Tailwind CSS',
    content: cssSource,
  },
  {
    id: 'app',
    name: 'App.tsx',
    path: '/src/App.tsx',
    category: 'typescript',
    description: 'Controlador principal de estados, sesiones, navegación e hidratación de base de datos',
    content: appSource,
  },
  {
    id: 'types',
    name: 'trosky.ts',
    path: '/src/types/trosky.ts',
    category: 'typescript',
    description: 'Definición de modelos de datos, roles (Admin, Subadmin, Usuario) y permisos granulares',
    content: typesSource,
  },
  {
    id: 'admin',
    name: 'AdminPanel.tsx',
    path: '/src/components/AdminPanel.tsx',
    category: 'typescript',
    description: 'Panel de control de Superadministrador y Subadministrador, roles y auditoría',
    content: adminPanelSource,
  },
  {
    id: 'profile',
    name: 'ProfileSettingsModal.tsx',
    path: '/src/components/ProfileSettingsModal.tsx',
    category: 'typescript',
    description: 'Gestor de perfil de usuario, actualización de foto y visor de publicaciones propias',
    content: profileSettingsSource,
  },
  {
    id: 'pin',
    name: 'PinCard.tsx',
    path: '/src/components/PinCard.tsx',
    category: 'typescript',
    description: 'Tarjeta de memoria visual estilo cuadrícula Pinterest con huella del autor',
    content: pinCardSource,
  },
  {
    id: 'security',
    name: 'security.ts',
    path: '/src/utils/security.ts',
    category: 'security',
    description: 'Utilidades de cifrado criptográfico Web Crypto SHA-256 para contraseñas seguras',
    content: securitySource,
  },
  {
    id: 'totp',
    name: 'totp.ts',
    path: '/src/utils/totp.ts',
    category: 'security',
    description: 'Algoritmo RFC 6238 de segunda verificación (2FA) compatible con Microsoft Authenticator',
    content: totpSource,
  },
];

export const ProjectCodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('app');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedFile = PROJECT_FILES.find((f) => f.id === selectedFileId) || PROJECT_FILES[0];

  const filteredFiles = PROJECT_FILES.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="bg-[#1e1a17] text-[#e6ded8] rounded-3xl border border-[#3e342d] shadow-xl overflow-hidden">
      {/* Top Warning Banner for Superadmin Only */}
      <div className="px-5 py-3.5 bg-[#2a221d] border-b border-[#3e342d] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <Shield className="w-4 h-4" />
          <span>Visor de Código Fuente del Proyecto · Exclusivo Superadministrador</span>
        </div>
        <div className="flex items-center gap-2 text-[#a8998d] text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso Restringido y Protegido (Sin exposición pública de credenciales)</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[580px]">
        {/* Left File List */}
        <div className="w-full lg:w-72 bg-[#171311] border-b lg:border-b-0 lg:border-r border-[#332b25] p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-[#88786e] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar archivo de código..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#231d19] border border-[#3e342e] text-[#e6ded8] placeholder-[#7d6e64] focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#88786e] px-1 mb-2 block">
              Archivos del Sistema ({filteredFiles.length})
            </span>

            <div className="space-y-1">
              {filteredFiles.map((file) => {
                const isSelected = file.id === selectedFile.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'hover:bg-[#231d19] text-[#c7bbb0]'
                    }`}
                  >
                    <FileCode
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-amber-400' : 'text-[#88786e]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold truncate">{file.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-white/10 text-[#a9998d]">
                          {file.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8e8076] truncate mt-0.5">
                        {file.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#332b25] text-[11px] text-[#8e8076]">
            <span>Entorno: <strong>Producción React + TypeScript</strong></span>
          </div>
        </div>

        {/* Right Code Display Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#14110f]">
          {/* File Header Details */}
          <div className="px-5 py-3 border-b border-[#332b25] bg-[#1a1613] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Code className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-white block truncate">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] text-[#9b8d82] block truncate">
                  {selectedFile.description} · {lines.length} líneas
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Code Container */}
          <div className="flex-1 overflow-auto max-h-[580px] p-4 font-mono text-xs leading-relaxed selection:bg-amber-500/30 selection:text-white">
            <pre className="table w-full">
              {lines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-white/5 transition-colors">
                  <span className="table-cell pr-4 text-right text-[#5f534a] select-none w-10 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre text-[#e2d8cf]">
                    {line || '\n'}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
