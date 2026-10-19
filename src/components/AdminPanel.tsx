import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Clock, Eye, Trash2, 
  ArrowLeft, Search, MessageSquare, AlertCircle, FileText, Check, 
  Users, Shield, UserPlus, Sliders, ToggleLeft, ToggleRight,
  ClipboardList, Code, Lock, AlertTriangle, RefreshCw, KeyRound, ExternalLink, Flag
} from 'lucide-react';
import { PinItem, User, PinComment, UserRole, SubadminPermissions, AuditLogEntry, ReportItem } from '../types/trosky';
import { UserAvatar } from './UserAvatar';
import { ProjectCodeExplorer } from './ProjectCodeExplorer';

interface AdminPanelProps {
  currentUser: User;
  pins: PinItem[];
  allUsers: User[];
  auditLogs: AuditLogEntry[];
  reports: ReportItem[];
  onApprovePin: (pinId: string) => void;
  onRejectPin: (pinId: string, reason?: string) => void;
  onDeletePin: (pinId: string) => void;
  onDeleteComment: (pinId: string, commentId: string) => void;
  onBackToFeed: () => void;
  onPreviewPin: (pin: PinItem) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole) => void;
  onCreateSubadmin?: (subadminData: {
    name: string;
    email: string;
    password: string;
    permissions: SubadminPermissions;
  }) => void;
  onUpdateSubadminPermissions?: (userId: string, permissions: SubadminPermissions) => void;
  onToggleUserStatus?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onResolveReport?: (reportId: string, actionTaken: string) => void;
  onDismissReport?: (reportId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  pins,
  allUsers,
  auditLogs,
  reports,
  onApprovePin,
  onRejectPin,
  onDeletePin,
  onDeleteComment,
  onBackToFeed,
  onPreviewPin,
  onUpdateUserRole,
  onCreateSubadmin,
  onUpdateSubadminPermissions,
  onToggleUserStatus,
  onDeleteUser,
  onResolveReport,
  onDismissReport,
}) => {
  const isSuperadmin = currentUser.role === 'admin';
  const subadminPermissions: SubadminPermissions = currentUser.permissions || {
    moderatePins: true,
    deletePins: false,
    moderateComments: true,
    reviewReports: true,
    viewStats: true,
  };

  // Determine initial active tab based on role
  const [adminTab, setAdminTab] = useState<
    'pendientes' | 'todas' | 'comentarios' | 'reportes' | 'subadmins' | 'usuarios' | 'auditoria' | 'codigo'
  >('pendientes');

  const [searchAdmin, setSearchAdmin] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchAudit, setSearchAudit] = useState('');
  const [rejectionModalPin, setRejectionModalPin] = useState<PinItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create Subadmin Modal State
  const [isCreateSubadminOpen, setIsCreateSubadminOpen] = useState(false);
  const [newSubadminName, setNewSubadminName] = useState('');
  const [newSubadminEmail, setNewSubadminEmail] = useState('');
  const [newSubadminPassword, setNewSubadminPassword] = useState('');
  const [newSubadminPerms, setNewSubadminPerms] = useState<SubadminPermissions>({
    moderatePins: true,
    deletePins: false,
    moderateComments: true,
    reviewReports: true,
    viewStats: true,
  });

  // Edit Permissions Modal State
  const [editingSubadmin, setEditingSubadmin] = useState<User | null>(null);
  const [editPerms, setEditPerms] = useState<SubadminPermissions>({
    moderatePins: true,
    deletePins: false,
    moderateComments: true,
    reviewReports: true,
    viewStats: true,
  });

  const pendingPins = pins.filter((p) => p.status === 'pendiente');
  const approvedPins = pins.filter((p) => p.status === 'aprobado');
  const rejectedPins = pins.filter((p) => p.status === 'rechazado');

  const subadminsList = allUsers.filter((u) => u.role === 'subadmin');
  const commonUsersList = allUsers.filter((u) => u.role === 'usuario');

  // Collect all comments across all pins
  const allComments = pins.flatMap((p) =>
    p.comments.map((c) => ({
      ...c,
      pinId: p.id,
      pinTitle: p.title,
    }))
  );

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalPin) return;
    onRejectPin(rejectionModalPin.id, rejectionReason.trim() || 'No cumple con las pautas comunitarias');
    setRejectionModalPin(null);
    setRejectionReason('');
  };

  const handleCreateSubadminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubadminName.trim() || !newSubadminEmail.trim() || !newSubadminPassword.trim()) return;

    if (onCreateSubadmin) {
      onCreateSubadmin({
        name: newSubadminName.trim(),
        email: newSubadminEmail.toLowerCase().trim(),
        password: newSubadminPassword.trim(),
        permissions: newSubadminPerms,
      });
    }

    setIsCreateSubadminOpen(false);
    setNewSubadminName('');
    setNewSubadminEmail('');
    setNewSubadminPassword('');
  };

  const handleOpenEditPerms = (user: User) => {
    setEditingSubadmin(user);
    setEditPerms(
      user.permissions || {
        moderatePins: true,
        deletePins: false,
        moderateComments: true,
        reviewReports: true,
        viewStats: true,
      }
    );
  };

  const handleSaveEditedPerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubadmin || !onUpdateSubadminPermissions) return;
    onUpdateSubadminPermissions(editingSubadmin.id, editPerms);
    setEditingSubadmin(null);
  };

  // Helper to check if current tab is forbidden for subadmin
  const isTabBlockedForSubadmin = (tab: typeof adminTab) => {
    if (isSuperadmin) return false;
    if (tab === 'subadmins' || tab === 'usuarios' || tab === 'auditoria' || tab === 'codigo') return true;
    if (tab === 'comentarios' && !subadminPermissions.moderateComments) return true;
    if (tab === 'reportes' && !subadminPermissions.reviewReports) return true;
    if ((tab === 'pendientes' || tab === 'todas') && !subadminPermissions.moderatePins) return true;
    return false;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="bg-[#2c2420] text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 border border-[#443831] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                isSuperadmin
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isSuperadmin
                    ? 'Panel de Superadministrador (Control Total)'
                    : 'Panel de Sub-administrador (Permisos Asignados)'}
                </span>
              </span>

              <span className="text-xs text-[#a9998d]">
                Sesión: <strong>{currentUser.name}</strong> ({currentUser.email})
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {isSuperadmin ? 'Gestión Central y Curaduría de Memoria' : 'Moderación Comunitaria Autorizada'}
            </h1>
            <p className="text-xs sm:text-sm text-[#d4c6bb] mt-1 max-w-2xl font-light">
              {isSuperadmin
                ? 'Administra subadministradores, asigna permisos específicos, supervisa la auditoría de acciones, consulta el código del proyecto y modera relatos y recetas.'
                : 'Como sub-administrador, colaboras en la moderación de publicaciones, comentarios y reportes según las facultades que te otorgó el Superadministrador.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToFeed}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Galería</span>
            </button>
          </div>
        </div>

        {/* KPI stats row (if viewStats is true or isSuperadmin) */}
        {(isSuperadmin || subadminPermissions.viewStats) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#ffbe76] font-medium mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Historias Pendientes</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                {pendingPins.length}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aprobadas en Tablero</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {approvedPins.length}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comentarios</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {allComments.length}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Usuarios ({subadminsList.length} subadmins)</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {allUsers.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#e5dcd1] pb-3 mb-6 overflow-x-auto scrollbar-none">
        {/* Tab 1: Pendientes */}
        <button
          onClick={() => setAdminTab('pendientes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'pendientes'
              ? 'bg-[#2c2420] text-white shadow-xs'
              : 'bg-[#eee7de] text-[#55473f] hover:bg-[#e4ddd3]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Historias Pendientes</span>
          {pendingPins.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-mono">
              {pendingPins.length}
            </span>
          )}
        </button>

        {/* Tab 2: Todas */}
        <button
          onClick={() => setAdminTab('todas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'todas'
              ? 'bg-[#2c2420] text-white shadow-xs'
              : 'bg-[#eee7de] text-[#55473f] hover:bg-[#e4ddd3]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Archivo General ({pins.length})</span>
        </button>

        {/* Tab 3: Comentarios */}
        <button
          onClick={() => setAdminTab('comentarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'comentarios'
              ? 'bg-[#2c2420] text-white shadow-xs'
              : 'bg-[#eee7de] text-[#55473f] hover:bg-[#e4ddd3]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Moderación Comentarios ({allComments.length})</span>
        </button>

        {/* Tab 4: Reportes */}
        <button
          onClick={() => setAdminTab('reportes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'reportes'
              ? 'bg-[#2c2420] text-white shadow-xs'
              : 'bg-[#eee7de] text-[#55473f] hover:bg-[#e4ddd3]'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Reportes ({reports.filter((r) => r.status === 'pendiente').length})</span>
        </button>

        {/* Tab 5: Subadministradores (Exclusivo Superadmin o bloqueado para subadmin) */}
        <button
          onClick={() => setAdminTab('subadmins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'subadmins'
              ? 'bg-purple-900 text-white shadow-xs'
              : isSuperadmin
              ? 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              : 'bg-[#eee7de] text-[#7d6b62] hover:bg-[#e4ddd3] opacity-80'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-500" />
          <span>Sub-administradores ({subadminsList.length})</span>
          {!isSuperadmin && <Lock className="w-3 h-3 text-[#a8998d]" />}
        </button>

        {/* Tab 6: Directorio Usuarios (Exclusivo Superadmin) */}
        <button
          onClick={() => setAdminTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'usuarios'
              ? 'bg-[#2c2420] text-white shadow-xs'
              : 'bg-[#eee7de] text-[#55473f] hover:bg-[#e4ddd3]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Directorio Usuarios ({allUsers.length})</span>
          {!isSuperadmin && <Lock className="w-3 h-3 text-[#a8998d]" />}
        </button>

        {/* Tab 7: Auditoría (Exclusivo Superadmin) */}
        <button
          onClick={() => setAdminTab('auditoria')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'auditoria'
              ? 'bg-amber-900 text-white shadow-xs'
              : isSuperadmin
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-[#eee7de] text-[#7d6b62] hover:bg-[#e4ddd3] opacity-80'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
          <span>Registro de Auditoría ({auditLogs.length})</span>
          {!isSuperadmin && <Lock className="w-3 h-3 text-[#a8998d]" />}
        </button>

        {/* Tab 8: Explorador de Código (Exclusivo Superadmin) */}
        <button
          onClick={() => setAdminTab('codigo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'codigo'
              ? 'bg-[#1e1a17] text-amber-400 shadow-xs border border-amber-500/30'
              : 'bg-[#eee7de] text-[#55473f] hover:bg-[#e4ddd3]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Explorador de Código</span>
          {!isSuperadmin && <Lock className="w-3 h-3 text-[#a8998d]" />}
        </button>
      </div>

      {/* SECURITY BLOCK SCREEN: If Subadmin attempts to access restricted Superadmin functions */}
      {isTabBlockedForSubadmin(adminTab) && (
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-block mb-3">
            Acceso Restringido · Privilegios Insuficientes
          </span>
          <h3 className="font-display font-bold text-xl text-[#2c2420] mb-2">
            Función Exclusiva del Superadministrador
          </h3>
          <p className="text-xs text-[#6e5d53] leading-relaxed mb-6">
            Como <strong>Sub-administrador</strong>, el sistema protege las configuraciones críticas del sistema, la creación de administradores, el registro de auditoría y los archivos de código fuente.
          </p>

          <div className="p-4 rounded-2xl bg-[#faf6f1] border border-[#eee4d8] text-xs text-left mb-6 space-y-2">
            <div className="font-bold text-[#2c2420] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-700" />
              <span>Tus Permisos Activos Actuales:</span>
            </div>
            <ul className="list-disc pl-5 text-[11px] text-[#5c4e46] space-y-1">
              {subadminPermissions.moderatePins && <li>Moderar y aprobar publicaciones de familias</li>}
              {subadminPermissions.deletePins && <li>Eliminar publicaciones inapropiadas</li>}
              {subadminPermissions.moderateComments && <li>Moderar comentarios comunitarios</li>}
              {subadminPermissions.reviewReports && <li>Revisar y gestionar reportes</li>}
              {subadminPermissions.viewStats && <li>Consultar estadísticas de inventario</li>}
            </ul>
          </div>

          <button
            onClick={() => setAdminTab('pendientes')}
            className="px-5 py-2.5 bg-[#2c2420] hover:bg-black text-white text-xs font-bold rounded-full transition-all cursor-pointer"
          >
            Regresar a Historias Pendientes
          </button>
        </div>
      )}

      {/* TAB 1: PENDIENTES */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'pendientes' && (
        <div className="space-y-4">
          {pendingPins.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#e8dfd5] max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="font-display font-bold text-lg text-[#2c2420] mb-1">
                No hay publicaciones pendientes
              </h3>
              <p className="text-xs text-[#7d6b62] leading-relaxed mb-4">
                Todas las historias, fotografías y recetas enviadas por las familias han sido revisadas.
              </p>
              <button
                onClick={() => setAdminTab('todas')}
                className="px-4 py-2 rounded-full bg-[#f0e9df] hover:bg-[#e4dbcf] text-xs font-bold text-[#3d312a] transition-all cursor-pointer"
              >
                Ver archivo aprobado
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingPins.map((pin) => (
                <div
                  key={pin.id}
                  className="bg-white rounded-3xl border-2 border-amber-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#f4ede4]">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Esperando Revisión</span>
                      </span>
                      <span className="text-[11px] text-[#8e7e74]">{pin.createdAt}</span>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#eee5dc] shrink-0 border border-[#e5dcd1]">
                        <img
                          src={pin.imageUrl}
                          alt={pin.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-[#a85a4a]">
                          {pin.categoryLabel} · {pin.year}
                        </span>
                        <h3 className="font-display font-bold text-base text-[#2c2420] leading-snug line-clamp-2 mt-0.5 mb-1">
                          {pin.title}
                        </h3>
                        <p className="text-xs text-[#6e5d53] line-clamp-2 leading-relaxed">
                          {pin.description}
                        </p>
                        <div className="text-[11px] text-[#8e7e74] mt-2 flex items-center gap-2">
                          <span>Por: <strong>{pin.author.name}</strong></span>
                          <span>·</span>
                          <span className="truncate">{pin.location}</span>
                        </div>
                      </div>
                    </div>

                    {pin.fullStory && (
                      <div className="p-3 rounded-xl bg-[#faf7f3] border border-[#f0e8dc] text-xs text-[#5c4e46] leading-relaxed mb-4">
                        <strong className="block text-[11px] text-[#3d312a] mb-0.5">Relato completo:</strong>
                        <p className="line-clamp-3 italic">"{pin.fullStory}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#f4ede4]">
                    <button
                      onClick={() => onPreviewPin(pin)}
                      className="px-3 py-1.5 rounded-full bg-[#f4eee7] hover:bg-[#eae1d7] text-xs font-semibold text-[#4e4038] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Vista Previa</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectionModalPin(pin)}
                        className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200 flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>

                      <button
                        onClick={() => onApprovePin(pin.id)}
                        className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprobar y Publicar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TODAS LAS PUBLICACIONES */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'todas' && (
        <div className="bg-white rounded-3xl border border-[#e8dfd5] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#f0e9df]">
            <h3 className="font-display font-bold text-base text-[#2c2420]">
              Inventario de Historias en el Archivo ({pins.length})
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8a7a70] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchAdmin}
                onChange={(e) => setSearchAdmin(e.target.value)}
                placeholder="Filtrar por título o autor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[#f2ebe2] overflow-x-auto">
            {pins
              .filter(
                (p) =>
                  p.title.toLowerCase().includes(searchAdmin.toLowerCase()) ||
                  p.author.name.toLowerCase().includes(searchAdmin.toLowerCase())
              )
              .map((pin) => (
                <div key={pin.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#e5dcd1]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#2c2420] truncate">
                          {pin.title}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            pin.status === 'aprobado'
                              ? 'bg-emerald-50 text-emerald-700'
                              : pin.status === 'pendiente'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {pin.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7d6b62] truncate">
                        Por: {pin.author.name} · {pin.location} · {pin.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onPreviewPin(pin)}
                      className="p-2 rounded-xl bg-[#f4eee7] hover:bg-[#eae1d7] text-[#4e4038] text-xs transition-all cursor-pointer"
                      title="Ver publicación"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {(isSuperadmin || subadminPermissions.deletePins) && (
                      <button
                        onClick={() => onDeletePin(pin.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs transition-all cursor-pointer"
                        title="Eliminar publicación definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: MODERACIÓN DE COMENTARIOS */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'comentarios' && (
        <div className="bg-white rounded-3xl border border-[#e8dfd5] p-5 shadow-xs">
          <h3 className="font-display font-bold text-base text-[#2c2420] mb-4 pb-3 border-b border-[#f0e9df]">
            Testimonios y Comentarios de la Comunidad ({allComments.length})
          </h3>

          {allComments.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7d6b62]">
              No hay comentarios registrados en las historias.
            </div>
          ) : (
            <div className="space-y-3">
              {allComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-[#faf7f3] border border-[#f0e8dc] flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <UserAvatar avatar={comment.avatar} name={comment.author} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-[#2c2420]">{comment.author}</strong>
                        <span className="text-[10px] text-[#8e7e74]">{comment.date}</span>
                      </div>
                      <p className="text-xs text-[#5c4e46] mt-1 leading-relaxed">{comment.text}</p>
                      <p className="text-[10px] text-[#a85a4a] mt-1.5 font-medium">
                        En historia: "{comment.pinTitle}"
                      </p>
                    </div>
                  </div>

                  {(isSuperadmin || subadminPermissions.moderateComments) && (
                    <button
                      onClick={() => onDeleteComment(comment.pinId, comment.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Eliminar comentario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REPORTES COMUNITARIOS */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'reportes' && (
        <div className="bg-white rounded-3xl border border-[#e8dfd5] p-5 shadow-xs">
          <h3 className="font-display font-bold text-base text-[#2c2420] mb-2">
            Revisión de Contenido Reportado ({reports.length})
          </h3>
          <p className="text-xs text-[#7d6b62] mb-5">
            Atiende las inquietudes de autenticidad histórica o pautas comunitarias reportadas por usuarios.
          </p>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7d6b62]">
              No hay reportes comunitarios pendientes en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    report.status === 'resuelto'
                      ? 'bg-[#f8f9fa] border-emerald-200'
                      : 'bg-[#fffaf0] border-amber-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        report.status === 'resuelto' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-[11px] text-[#8e7e74]">{report.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#2c2420]">
                      Historia: "{report.pinTitle}"
                    </h4>
                    <p className="text-xs text-[#5c4e46] mt-0.5">
                      <strong>Motivo:</strong> {report.reason}
                    </p>
                    <p className="text-[10px] text-[#8e7e74] mt-1">
                      Reportado por: {report.reportedBy}
                    </p>
                  </div>

                  {report.status !== 'resuelto' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onResolveReport && onResolveReport(report.id, 'Verificado por moderación')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar Resuelto</span>
                      </button>
                      <button
                        onClick={() => onDismissReport && onDismissReport(report.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#eee5dc] hover:bg-[#e0d6cb] text-[#55473f] text-xs font-semibold transition-all cursor-pointer"
                      >
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GESTIÓN DE SUB-ADMINISTRADORES (Superadministrador ONLY) */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'subadmins' && isSuperadmin && (
        <div className="bg-white rounded-3xl border border-[#e8dfd5] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#f0e9df]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold uppercase tracking-wider">
                  Nivel de Autorización
                </span>
                <span className="text-xs text-[#7d6b62]">Exclusivo Superadministrador</span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#2c2420]">
                Cuentas de Sub-administradores y Permisos
              </h3>
              <p className="text-xs text-[#7d6b62] mt-0.5 max-w-xl">
                Crea credenciales individuales para nuevos subadministradores, asigna permisos específicos y desactiva o elimina cuentas cuando sea necesario.
              </p>
            </div>

            <button
              onClick={() => setIsCreateSubadminOpen(true)}
              className="px-4 py-2.5 rounded-full bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Crear Nuevo Sub-administrador</span>
            </button>
          </div>

          {/* Subadmins List */}
          {subadminsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7d6b62] bg-[#faf7f3] rounded-2xl border border-[#eee5dc] p-6">
              No hay subadministradores registrados actualmente. Pulsa en <strong>"+ Crear Nuevo Sub-administrador"</strong> para añadir uno.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subadminsList.map((sub) => {
                const perms = sub.permissions || {
                  moderatePins: true,
                  deletePins: false,
                  moderateComments: true,
                  reviewReports: true,
                  viewStats: true,
                };
                const isActive = sub.status !== 'inactivo';

                return (
                  <div
                    key={sub.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                      isActive
                        ? 'bg-[#faf7f3] border-[#eee4d8]'
                        : 'bg-[#f4efe9] border-rose-200 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#f0e8de]">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            <span>{isActive ? 'Cuenta Activa' : 'Desactivada'}</span>
                          </span>

                          <span className="text-[10px] text-[#8e7e74]">
                            2FA QR Activo
                          </span>
                        </div>

                        <span className="text-[10px] text-[#8e7e74]">
                          {sub.createdAt}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <UserAvatar avatar={sub.avatar} name={sub.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-[#2c2420] truncate">
                            {sub.name}
                          </h4>
                          <p className="text-xs text-[#7d6b62] truncate">{sub.email}</p>
                          <p className="text-[10px] text-[#8e7e74] mt-0.5">
                            Creado por: <strong>{sub.createdBy || 'Superadministrador'}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Permissions checklist */}
                      <div className="mt-4 pt-3 border-t border-[#f0e8de]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d6b62] block mb-2">
                          Permisos Concedidos:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {perms.moderatePins && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-medium">
                              ✓ Moderar Historias
                            </span>
                          )}
                          {perms.deletePins && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-medium">
                              ✓ Eliminar Historias
                            </span>
                          )}
                          {perms.moderateComments && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-medium">
                              ✓ Moderar Comentarios
                            </span>
                          )}
                          {perms.reviewReports && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium">
                              ✓ Revisar Reportes
                            </span>
                          )}
                          {perms.viewStats && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                              ✓ Ver Estadísticas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="pt-3 border-t border-[#f0e8de] flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenEditPerms(sub)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#ede5dc] text-xs font-semibold text-[#3d312a] border border-[#d8ccc0] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-700" />
                        <span>Editar Permisos</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleUserStatus && onToggleUserStatus(sub.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Desactivar' : 'Reactivar'}
                        </button>

                        <button
                          onClick={() => onDeleteUser && onDeleteUser(sub.id)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar cuenta de subadministrador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DIRECTORIO DE USUARIOS (Superadministrador ONLY) */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'usuarios' && isSuperadmin && (
        <div className="bg-white rounded-3xl border border-[#e8dfd5] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#f0e9df]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#2c2420]">
                Directorio y Asignación de Roles
              </h3>
              <p className="text-xs text-[#7d6b62] mt-0.5">
                Los usuarios que se registran en la página ingresan automáticamente como <strong>Usuario Común</strong>. Como Superadministrador, puedes designar quién es <strong>Sub-administrador</strong> o <strong>Superadministrador</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                Comunes: {commonUsersList.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
                Sub-admins: {subadminsList.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                Admins: {allUsers.filter((u) => u.role === 'admin').length}
              </span>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#8a7a70] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allUsers
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchUser.toLowerCase())
              )
              .map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[#faf7f3] border border-[#f0e8dc] flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar avatar={u.avatar} name={u.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-[#2c2420] truncate">
                          {u.name}
                        </h4>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'subadmin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {u.role === 'admin' ? 'Superadmin' : u.role === 'subadmin' ? 'Sub-admin' : 'Usuario Común'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7d6b62] truncate mt-0.5">{u.email}</p>
                      {u.family && (
                        <p className="text-[10px] text-[#a85a4a] truncate font-medium">
                          {u.family} {u.community ? `· ${u.community}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role Switcher Controls */}
                  <div className="pt-2.5 border-t border-[#eee5dc] flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#7d6b62] uppercase tracking-wider">
                      Asignar Rol:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateUserRole && onUpdateUserRole(u.id, 'usuario')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          u.role === 'usuario'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-[#ede5dc] hover:bg-[#e2d8cd] text-[#55473f]'
                        }`}
                      >
                        Común
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateUserRole && onUpdateUserRole(u.id, 'subadmin')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          u.role === 'subadmin'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-[#ede5dc] hover:bg-[#e2d8cd] text-[#55473f]'
                        }`}
                      >
                        Sub-admin
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateUserRole && onUpdateUserRole(u.id, 'admin')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          u.role === 'admin'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-[#ede5dc] hover:bg-[#e2d8cd] text-[#55473f]'
                        }`}
                      >
                        Superadmin
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 7: REGISTRO DE AUDITORÍA (Superadministrador ONLY) */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'auditoria' && isSuperadmin && (
        <div className="bg-white rounded-3xl border border-[#e8dfd5] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#f0e9df]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                  Auditoría Inmutable
                </span>
                <span className="text-xs text-[#7d6b62]">Supervisión de Actividad</span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#2c2420]">
                Registro de Acciones Administrativas
              </h3>
              <p className="text-xs text-[#7d6b62] mt-0.5">
                Historial cronológico de acciones ejecutadas por el Superadministrador y los Sub-administradores.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8a7a70] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                placeholder="Filtrar por acción o autor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {auditLogs
              .filter(
                (log) =>
                  log.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
                  log.userName.toLowerCase().includes(searchAudit.toLowerCase()) ||
                  (log.details && log.details.toLowerCase().includes(searchAudit.toLowerCase()))
              )
              .map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#faf7f3] border border-[#f0e8dc] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[11px] text-[#8e7e74]">{log.timestamp}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        log.userRole === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {log.userRole === 'admin' ? 'Superadmin' : 'Subadmin'}: {log.userName}
                      </span>
                    </div>

                    <p className="font-bold text-[#2c2420] text-sm">{log.action}</p>
                    {log.details && (
                      <p className="text-[#6e5d53] text-[11px] mt-0.5 leading-relaxed">{log.details}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 8: EXPLORADOR DE CÓDIGO (Superadministrador ONLY) */}
      {!isTabBlockedForSubadmin(adminTab) && adminTab === 'codigo' && isSuperadmin && (
        <ProjectCodeExplorer />
      )}

      {/* MODAL: Crear Sub-administrador (Superadmin) */}
      {isCreateSubadminOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e8dfd5]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0e8de]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#2c2420] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-700" />
                  <span>Crear Cuenta de Sub-administrador</span>
                </h3>
                <p className="text-xs text-[#7d6b62]">
                  Establece sus credenciales de acceso y selecciona las funciones que podrá realizar.
                </p>
              </div>
              <button
                onClick={() => setIsCreateSubadminOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#f0e8de] text-[#7d6b62] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubadminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d312a] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newSubadminName}
                  onChange={(e) => setNewSubadminName(e.target.value)}
                  placeholder="Ej. Andrés Camilo Parra"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-purple-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d312a] mb-1">
                  Correo Electrónico Individual *
                </label>
                <input
                  type="email"
                  required
                  value={newSubadminEmail}
                  onChange={(e) => setNewSubadminEmail(e.target.value)}
                  placeholder="andres.parra@trosky.org"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-purple-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#3d312a]">
                    Contraseña Inicial Segura *
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewSubadminPassword('subadminPass' + Math.floor(1000 + Math.random() * 9000) + '!')}
                    className="text-[10px] text-purple-700 hover:underline font-bold"
                  >
                    Generar Clave Aleatoria
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newSubadminPassword}
                  onChange={(e) => setNewSubadminPassword(e.target.value)}
                  placeholder="Contraseña robusta para su primer inicio de sesión"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#f5ede4] border border-transparent focus:border-purple-600 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              {/* Permisos Granulares */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#3d312a] mb-2 uppercase tracking-wider">
                  Permisos Autorizados:
                </label>

                <div className="space-y-2.5 bg-[#faf6f1] p-3.5 rounded-2xl border border-[#eee4d8]">
                  <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubadminPerms.moderatePins}
                      onChange={(e) =>
                        setNewSubadminPerms((prev) => ({ ...prev, moderatePins: e.target.checked }))
                      }
                      className="rounded accent-purple-700 w-4 h-4"
                    />
                    <span>Moderar y aprobar publicaciones de familias</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubadminPerms.deletePins}
                      onChange={(e) =>
                        setNewSubadminPerms((prev) => ({ ...prev, deletePins: e.target.checked }))
                      }
                      className="rounded accent-purple-700 w-4 h-4"
                    />
                    <span>Eliminar publicaciones inapropiadas</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubadminPerms.moderateComments}
                      onChange={(e) =>
                        setNewSubadminPerms((prev) => ({ ...prev, moderateComments: e.target.checked }))
                      }
                      className="rounded accent-purple-700 w-4 h-4"
                    />
                    <span>Moderar y eliminar comentarios comunitarios</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubadminPerms.reviewReports}
                      onChange={(e) =>
                        setNewSubadminPerms((prev) => ({ ...prev, reviewReports: e.target.checked }))
                      }
                      className="rounded accent-purple-700 w-4 h-4"
                    />
                    <span>Revisar y resolver reportes de contenido</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubadminPerms.viewStats}
                      onChange={(e) =>
                        setNewSubadminPerms((prev) => ({ ...prev, viewStats: e.target.checked }))
                      }
                      className="rounded accent-purple-700 w-4 h-4"
                    />
                    <span>Consultar estadísticas e inventario</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#f0e8de]">
                <button
                  type="button"
                  onClick={() => setIsCreateSubadminOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5c4e46] hover:bg-[#f0e8de] rounded-full transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-full shadow-md transition-all cursor-pointer"
                >
                  Crear Sub-administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Permisos de Sub-administrador (Superadmin) */}
      {editingSubadmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e8dfd5]">
            <h3 className="font-display font-bold text-lg text-[#2c2420] mb-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-700" />
              <span>Modificar Permisos</span>
            </h3>
            <p className="text-xs text-[#7d6b62] mb-4">
              Ajusta las atribuciones de <strong>{editingSubadmin.name}</strong> ({editingSubadmin.email}):
            </p>

            <form onSubmit={handleSaveEditedPerms} className="space-y-4">
              <div className="space-y-2.5 bg-[#faf6f1] p-4 rounded-2xl border border-[#eee4d8]">
                <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPerms.moderatePins}
                    onChange={(e) =>
                      setEditPerms((prev) => ({ ...prev, moderatePins: e.target.checked }))
                    }
                    className="rounded accent-purple-700 w-4 h-4"
                  />
                  <span>Moderar y aprobar publicaciones de familias</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPerms.deletePins}
                    onChange={(e) =>
                      setEditPerms((prev) => ({ ...prev, deletePins: e.target.checked }))
                    }
                    className="rounded accent-purple-700 w-4 h-4"
                  />
                  <span>Eliminar publicaciones inapropiadas</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPerms.moderateComments}
                    onChange={(e) =>
                      setEditPerms((prev) => ({ ...prev, moderateComments: e.target.checked }))
                    }
                    className="rounded accent-purple-700 w-4 h-4"
                  />
                  <span>Moderar y eliminar comentarios</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPerms.reviewReports}
                    onChange={(e) =>
                      setEditPerms((prev) => ({ ...prev, reviewReports: e.target.checked }))
                    }
                    className="rounded accent-purple-700 w-4 h-4"
                  />
                  <span>Revisar y resolver reportes</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#2c2420] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPerms.viewStats}
                    onChange={(e) =>
                      setEditPerms((prev) => ({ ...prev, viewStats: e.target.checked }))
                    }
                    className="rounded accent-purple-700 w-4 h-4"
                  />
                  <span>Consultar estadísticas e inventario</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubadmin(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5c4e46] hover:bg-[#f0e8de] rounded-full transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-full shadow-md transition-all cursor-pointer"
                >
                  Guardar Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalPin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e8dfd5]">
            <h3 className="font-display font-bold text-lg text-[#2c2420] mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Rechazar Publicación</span>
            </h3>
            <p className="text-xs text-[#7d6b62] mb-4">
              Indica el motivo por el cual no se publicará "{rejectionModalPin.title}":
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej. Requiere verificar la autoría de la fotografía o completar los pasos de la receta..."
                className="w-full text-xs p-3 rounded-xl bg-[#f5ede4] border border-transparent focus:border-[#c94d3f]/40 focus:bg-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalPin(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5c4e46] hover:bg-[#f0e8de] rounded-full transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-md transition-all cursor-pointer"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
