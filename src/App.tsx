import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PinItem, CategoryType, User, UserRole, SubadminPermissions, AuditLogEntry, ReportItem } from './types/trosky';
import { INITIAL_PINS, INFINITE_STORIES_POOL, DEFAULT_USERS, INITIAL_AUDIT_LOGS, INITIAL_REPORTS } from './data/initialPins';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { PinCard } from './components/PinCard';
import { PinDetailModal } from './components/PinDetailModal';
import { CreatePinModal } from './components/CreatePinModal';
import { AboutModal } from './components/AboutModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { SavedPinsView } from './components/SavedPinsView';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ConfirmLogoutModal } from './components/ConfirmLogoutModal';
import { InfiniteScrollLoader } from './components/InfiniteScrollLoader';
import { ToastContainer, ToastMessage } from './components/Toast';
import { generateBase32Secret } from './utils/totp';

export default function App() {
  // Users state with local storage hydration
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('trosky_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          for (const def of DEFAULT_USERS) {
            if (!merged.some((u: User) => u.email.toLowerCase() === def.email.toLowerCase())) {
              merged.push(def);
            }
          }
          return merged;
        }
      }
    } catch {}
    return DEFAULT_USERS;
  });

  // Current session user (hydrated from localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('trosky_current_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Main pins state with local storage hydration
  const [pins, setPins] = useState<PinItem[]>(() => {
    try {
      const stored = localStorage.getItem('trosky_pins');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((p: PinItem) => {
            const fresh = INITIAL_PINS.find((init) => init.id === p.id);
            return {
              ...p,
              status: p.status || fresh?.status || 'aprobado',
              imageUrl: fresh?.imageUrl || p.imageUrl,
              title: fresh?.title || p.title,
            };
          });

          for (const init of INITIAL_PINS) {
            if (!merged.some((m: PinItem) => m.id === init.id)) {
              merged.push(init);
            }
          }
          return merged;
        }
      }
    } catch {}
    return INITIAL_PINS;
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem('trosky_audit_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const stored = localStorage.getItem('trosky_reports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REPORTS;
  });

  // Navigation & View state
  const [activeView, setActiveView] = useState<'feed' | 'saved' | 'about' | 'admin'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('todos');

  // Modals state
  const [selectedPin, setSelectedPin] = useState<PinItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'publications'>('profile');
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  // Infinite Scroll state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const maxLoads = 6;
  const hasMore = loadCount < maxLoads;

  // Toasts notification system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit logging helper
  const addAuditLog = useCallback(
    (action: string, details?: string, targetId?: string) => {
      const newEntry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'Sistema Trosky',
        userRole: currentUser?.role || 'usuario',
        action,
        details,
        targetId,
      };
      setAuditLogs((prev) => [newEntry, ...prev]);
    },
    [currentUser]
  );

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trosky_pins', JSON.stringify(pins));
    } catch {}
  }, [pins]);

  useEffect(() => {
    try {
      localStorage.setItem('trosky_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('trosky_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('trosky_reports', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('trosky_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('trosky_current_user');
      }
    } catch {}
  }, [currentUser]);

  // Keep selectedPin in sync if modified
  useEffect(() => {
    if (selectedPin) {
      const updated = pins.find((p) => p.id === selectedPin.id);
      if (updated) setSelectedPin(updated);
    }
  }, [pins]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      addToast(`Autenticado con 2FA: Bienvenido Superadministrador (${user.name})`, 'success');
      addAuditLog('Inicio de sesión de Superadministrador', `Acceso autenticado con 2FA QR para ${user.email}`);
    } else if (user.role === 'subadmin') {
      addToast(`Autenticado con 2FA: Bienvenido Sub-administrador (${user.name})`, 'success');
      addAuditLog('Inicio de sesión de Sub-administrador', `Acceso autenticado con 2FA QR para ${user.email}`);
    } else {
      addToast(`Autenticado con 2FA: Bienvenido a Trosky, ${user.name}`, 'success');
    }
  };

  const handleRegister = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast('¡Cuenta registrada y verificada con 2FA QR con éxito!', 'success');
    addAuditLog('Registro de nuevo usuario común', `Cuenta creada para ${newUser.name} (${newUser.email})`);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    const roleLabels: Record<UserRole, string> = {
      admin: 'Superadministrador',
      subadmin: 'Sub-administrador',
      usuario: 'Usuario Común',
    };
    addAuditLog(
      'Modificación de rol de usuario',
      `Rol de ${target?.name || userId} actualizado a "${roleLabels[newRole]}".`
    );
    addToast(`Rol actualizado a "${roleLabels[newRole]}" correctamente`, 'success');
  };

  // Create Subadmin (Superadmin action)
  const handleCreateSubadmin = (subadminData: {
    name: string;
    email: string;
    password: string;
    permissions: SubadminPermissions;
  }) => {
    const newSubadmin: User = {
      id: `user-subadmin-${Date.now()}`,
      name: subadminData.name,
      email: subadminData.email,
      password: subadminData.password,
      totpSecret: generateBase32Secret(16),
      role: 'subadmin',
      status: 'activo',
      permissions: subadminData.permissions,
      avatar: '🛡️',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser ? `${currentUser.name} (Superadministrador)` : 'Superadministrador',
    };

    setUsers((prev) => [...prev, newSubadmin]);
    addAuditLog(
      'Creó cuenta de Sub-administrador',
      `Superadministrador creó a ${subadminData.name} (${subadminData.email}) con credenciales individuales y permisos asignados.`
    );
    addToast(`Sub-administrador ${subadminData.name} creado exitosamente con credenciales y 2FA QR`, 'success');
  };

  // Update Subadmin Permissions (Superadmin action)
  const handleUpdateSubadminPermissions = (userId: string, permissions: SubadminPermissions) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, permissions } : null));
    }
    addAuditLog(
      'Modificó permisos de Sub-administrador',
      `Superadministrador ajustó permisos para ${target?.name || userId}.`
    );
    addToast('Permisos de sub-administrador actualizados correctamente', 'success');
  };

  // Toggle User Status: activate / deactivate (Superadmin action)
  const handleToggleUserStatus = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const newStatus: 'activo' | 'inactivo' = target?.status === 'inactivo' ? 'activo' : 'inactivo';

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    addAuditLog(
      newStatus === 'activo' ? 'Reactivó cuenta' : 'Desactivó cuenta',
      `Estado de ${target?.name || userId} establecido en "${newStatus}".`
    );
    addToast(`Cuenta ${newStatus === 'activo' ? 'reactivada' : 'desactivada'} correctamente`, 'success');
  };

  // Delete User (Superadmin action)
  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAuditLog('Eliminó cuenta de usuario', `Se eliminó definitivamente a ${target?.name || userId}`);
    addToast('Cuenta eliminada del sistema', 'success');
  };

  // Profile update handler: updates user profile, author info on their pins, and comments
  const handleUpdateProfile = (updatedData: {
    name: string;
    family?: string;
    community?: string;
    avatar: string;
  }) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      ...updatedData,
    };

    // 1. Update current session
    setCurrentUser(updatedUser);

    // 2. Update user in directory
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updatedData } : u))
    );

    // 3. Update author info across all pins created by this user
    setPins((prev) =>
      prev.map((p) => {
        const isAuthor =
          (p.author.userId && p.author.userId === currentUser.id) ||
          p.author.name.toLowerCase() === currentUser.name.toLowerCase();

        const updatedAuthor = isAuthor
          ? {
              ...p.author,
              name: updatedData.name,
              avatar: updatedData.avatar,
              family: updatedData.family || p.author.family,
              community: updatedData.community || p.author.community,
              userId: currentUser.id,
            }
          : p.author;

        // Also update comment author if matching user
        const updatedComments = p.comments.map((c) =>
          c.userId === currentUser.id || c.author.toLowerCase() === currentUser.name.toLowerCase()
            ? { ...c, author: updatedData.name, avatar: updatedData.avatar, userId: currentUser.id }
            : c
        );

        return {
          ...p,
          author: updatedAuthor,
          comments: updatedComments,
        };
      })
    );

    addAuditLog('Actualizó perfil de usuario', `Modificó nombre a "${updatedData.name}" y actualizó foto de perfil.`);
    addToast('¡Perfil y foto guardados correctamente en la base de datos!', 'success');
  };

  // Confirm logout modal handlers
  const handleConfirmLogout = () => {
    const prevName = currentUser?.name || 'Usuario';
    setIsConfirmLogoutOpen(false);
    setCurrentUser(null);
    localStorage.removeItem('trosky_current_user');
    if (activeView === 'admin') setActiveView('feed');
    addToast(`Sesión cerrada para ${prevName}. Formulario listo para ingresar con otra cuenta.`, 'success');
    setIsAuthOpen(true);
  };

  // Toggle Save / Bookmark
  const handleToggleSave = useCallback((e: React.MouseEvent, targetPin: PinItem) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      addToast('Inicia sesión para guardar recuerdos en tu álbum familiar', 'save');
      return;
    }

    setPins((prev) =>
      prev.map((p) => {
        if (p.id === targetPin.id) {
          const nextSaved = !p.isSaved;
          addToast(
            nextSaved
              ? 'Guardado en tu Álbum Familiar'
              : 'Eliminado de tus guardados',
            'save'
          );
          return { ...p, isSaved: nextSaved };
        }
        return p;
      })
    );
  }, [currentUser]);

  // Toggle Like
  const handleToggleLike = useCallback((e: React.MouseEvent, targetPin: PinItem) => {
    e.stopPropagation();
    setPins((prev) =>
      prev.map((p) => {
        if (p.id === targetPin.id) {
          const nextLiked = !p.isLiked;
          const nextLikes = nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
          addToast(
            nextLiked ? 'Te ha gustado este recuerdo' : 'Me gusta retirado',
            'like'
          );
          return { ...p, isLiked: nextLiked, likes: nextLikes };
        }
        return p;
      })
    );
  }, []);

  // Share story
  const handleShare = useCallback((e: React.MouseEvent, pin: PinItem) => {
    e.stopPropagation();
    const shareUrl = window.location.href.split('#')[0] + `#pin-${pin.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        addToast('Enlace de la historia copiado al portapapeles', 'share');
      }).catch(() => {
        addToast('Enlace listo para compartir', 'share');
      });
    } else {
      addToast('Enlace listo para compartir', 'share');
    }
  }, []);

  // Add Comment (Normal User or Admin)
  const handleAddComment = useCallback((pinId: string, text: string, author: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      author,
      avatar: currentUser?.avatar || '💬',
      text,
      date: 'Justo ahora',
      userId: currentUser?.id,
    };

    setPins((prev) =>
      prev.map((p) => {
        if (p.id === pinId) {
          return {
            ...p,
            comments: [newComment, ...p.comments],
          };
        }
        return p;
      })
    );
    addToast('Tu comentario ha sido publicado en la memoria comunitaria', 'success');
  }, [currentUser]);

  // Delete Comment (Admin or Subadmin privilege)
  const handleDeleteComment = useCallback((pinId: string, commentId: string) => {
    setPins((prev) =>
      prev.map((p) => {
        if (p.id === pinId) {
          return {
            ...p,
            comments: p.comments.filter((c) => c.id !== commentId),
          };
        }
        return p;
      })
    );
    addAuditLog('Eliminó comentario', `Se moderó un comentario en la historia ID ${pinId}`);
    addToast('Comentario eliminado por moderación', 'success');
  }, [addAuditLog]);

  // Create new Pin Handler
  const handleCreatePin = (newPin: PinItem) => {
    setPins((prev) => [newPin, ...prev]);
    if (newPin.status === 'aprobado') {
      addToast('¡Historia publicada directamente en la cuadrícula!', 'success');
      addAuditLog('Publicó historia directa', `Historia "${newPin.title}" aprobada por rol administrativo.`);
    } else {
      addToast('¡Historia enviada! Queda pendiente de aprobación por el Administrador.', 'success');
      addAuditLog('Envió historia para revisión', `Historia "${newPin.title}" enviada por ${newPin.author.name}.`);
    }
  };

  // Admin Actions: Approve, Reject, Delete Pin
  const handleApprovePin = (pinId: string) => {
    const target = pins.find((p) => p.id === pinId);
    setPins((prev) =>
      prev.map((p) => (p.id === pinId ? { ...p, status: 'aprobado' } : p))
    );
    addAuditLog('Aprobó historia comunitaria', `Aprobó "${target?.title || pinId}" para el tablero público.`, pinId);
    addToast('✅ Historia aprobada y visible en el tablero público', 'success');
  };

  const handleRejectPin = (pinId: string, reason?: string) => {
    const target = pins.find((p) => p.id === pinId);
    setPins((prev) =>
      prev.map((p) =>
        p.id === pinId
          ? { ...p, status: 'rechazado', rejectionReason: reason }
          : p
      )
    );
    addAuditLog('Rechazó historia comunitaria', `Motivo: ${reason || 'Pautas comunitarias'} en "${target?.title || pinId}".`, pinId);
    addToast('❌ Historia rechazada por moderación', 'success');
  };

  const handleDeletePin = (pinId: string) => {
    const target = pins.find((p) => p.id === pinId);
    setPins((prev) => prev.filter((p) => p.id !== pinId));
    if (selectedPin?.id === pinId) setSelectedPin(null);
    addAuditLog('Eliminó historia del archivo', `Historia eliminada: "${target?.title || pinId}".`, pinId);
    addToast('Historia eliminada definitivamente del archivo', 'success');
  };

  // Resolve / Dismiss Reports
  const handleResolveReport = (reportId: string, actionTaken: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resuelto' } : r))
    );
    addAuditLog('Resolvió reporte comunitario', `Acción tomada: ${actionTaken} en reporte ${reportId}.`);
    addToast('Reporte marcado como resuelto', 'success');
  };

  const handleDismissReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'descartado' } : r))
    );
    addAuditLog('Descartó reporte comunitario', `Reporte ${reportId} descartado por moderación.`);
    addToast('Reporte descartado', 'success');
  };

  // Infinite Scroll Handler
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      setPins((prev) => {
        const poolIndex = (loadCount * 2) % INFINITE_STORIES_POOL.length;
        const item1 = INFINITE_STORIES_POOL[poolIndex];
        const item2 = INFINITE_STORIES_POOL[(poolIndex + 1) % INFINITE_STORIES_POOL.length];

        const newGeneratedPins: PinItem[] = [
          {
            id: `pin-inf-${Date.now()}-1`,
            title: item1.title,
            description: item1.description,
            fullStory: `Historia recuperada del archivo comunal de ${item1.location}. Narrada con devoción para preservar los saberes de nuestras familias.`,
            category: item1.category,
            categoryLabel: item1.categoryLabel,
            imageUrl: item1.image,
            aspectRatio: 'tall',
            status: 'aprobado',
            author: {
              name: item1.author,
              role: item1.role,
              avatar: item1.avatar,
              community: item1.location,
            },
            year: item1.year,
            location: item1.location,
            tags: item1.tags,
            likes: Math.floor(Math.random() * 80) + 40,
            isLiked: false,
            isSaved: false,
            comments: [],
            createdAt: '2026-10-16',
          },
          {
            id: `pin-inf-${Date.now()}-2`,
            title: item2.title,
            description: item2.description,
            fullStory: `Testimonio recogido durante los talleres intergeneracionales de memoria viva en ${item2.location}.`,
            category: item2.category,
            categoryLabel: item2.categoryLabel,
            imageUrl: item2.image,
            aspectRatio: 'wide',
            status: 'aprobado',
            author: {
              name: item2.author,
              role: item2.role,
              avatar: item2.avatar,
              community: item2.location,
            },
            year: item2.year,
            location: item2.location,
            tags: item2.tags,
            likes: Math.floor(Math.random() * 90) + 50,
            isLiked: false,
            isSaved: false,
            comments: [],
            createdAt: '2026-10-16',
          },
        ];

        return [...prev, ...newGeneratedPins];
      });

      setLoadCount((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 700);
  }, [hasMore, isLoadingMore, loadCount]);

  // Main Feed Pins
  const visibleFeedPins = useMemo(() => {
    return pins.filter((pin) => {
      const isApproved = !pin.status || pin.status === 'aprobado';
      const isAuthor = currentUser && (
        (pin.author.userId && pin.author.userId === currentUser.id) ||
        pin.author.name.toLowerCase() === currentUser.name.toLowerCase()
      );
      const isVisibleStatus = isApproved || isAuthor;
      if (!isVisibleStatus) return false;

      if (selectedCategory !== 'todos' && pin.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = pin.title.toLowerCase().includes(query);
        const matchesDesc = pin.description.toLowerCase().includes(query);
        const matchesAuthor = pin.author.name.toLowerCase().includes(query);
        const matchesLocation = pin.location.toLowerCase().includes(query);
        const matchesTag = pin.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesAuthor || matchesLocation || matchesTag;
      }
      return true;
    });
  }, [pins, currentUser, selectedCategory, searchQuery]);

  const savedPins = useMemo(() => pins.filter((p) => p.isSaved && (!p.status || p.status === 'aprobado')), [pins]);
  const pendingPinsCount = useMemo(() => pins.filter((p) => p.status === 'pendiente').length, [pins]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#2c2420]">
      {/* Top Bar Navigation */}
      <Navbar
        activeView={activeView}
        savedCount={savedPins.length}
        pendingCount={pendingPinsCount}
        currentUser={currentUser}
        onSelectView={setActiveView}
        onOpenCreate={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
            addToast('Inicia sesión o regístrate para publicar tu historia', 'save');
          } else {
            setIsCreateOpen(true);
          }
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfileSettings={() => {
          setProfileInitialTab('profile');
          setIsProfileOpen(true);
        }}
        onOpenMyPosts={() => {
          setProfileInitialTab('publications');
          setIsProfileOpen(true);
        }}
        onLogout={() => setIsConfirmLogoutOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 pb-16">
        {(activeView === 'admin' && (currentUser?.role === 'admin' || currentUser?.role === 'subadmin')) ? (
          /* Dedicated Administrator / Moderation Interface */
          <AdminPanel
            currentUser={currentUser}
            pins={pins}
            allUsers={users}
            auditLogs={auditLogs}
            reports={reports}
            onApprovePin={handleApprovePin}
            onRejectPin={handleRejectPin}
            onDeletePin={handleDeletePin}
            onDeleteComment={handleDeleteComment}
            onBackToFeed={() => setActiveView('feed')}
            onPreviewPin={setSelectedPin}
            onUpdateUserRole={handleUpdateUserRole}
            onCreateSubadmin={handleCreateSubadmin}
            onUpdateSubadminPermissions={handleUpdateSubadminPermissions}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onResolveReport={handleResolveReport}
            onDismissReport={handleDismissReport}
          />
        ) : activeView === 'saved' ? (
          /* Saved Pins Board */
          <SavedPinsView
            savedPins={savedPins}
            onBackToFeed={() => setActiveView('feed')}
            onOpenDetail={setSelectedPin}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLike}
            onShare={handleShare}
          />
        ) : (
          /* Pinterest Feed View */
          <>
            {/* Pinterest Hero Banner */}
            <HeroBanner
              onOpenCreate={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                  addToast('Inicia sesión para publicar tu historia familiar', 'save');
                } else {
                  setIsCreateOpen(true);
                }
              }}
              onOpenAbout={() => setIsAboutOpen(true)}
              totalStories={pins.filter((p) => p.status === 'aprobado').length}
            />

            {/* User Session Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#f2eae0] border border-[#e5dcd0] text-xs text-[#55473f]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>👤 Sesión:</span>
                  <strong>{currentUser ? currentUser.name : 'Visitante (Sin autenticar)'}</strong>
                  {currentUser ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : currentUser.role === 'subadmin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Rol: {currentUser.role === 'admin' ? 'Superadministrador' : currentUser.role === 'subadmin' ? 'Sub-administrador' : 'Usuario Común'} · 2FA QR Activo
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                      Inicia sesión con correo, contraseña y código QR
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {currentUser && (
                    <>
                      <button
                        onClick={() => {
                          setProfileInitialTab('profile');
                          setIsProfileOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-[#ede3d8] text-[#3d312a] font-semibold border border-[#d8ccc0] transition-all cursor-pointer text-xs"
                      >
                        Ajustes de Perfil y Foto
                      </button>

                      <button
                        onClick={() => {
                          setProfileInitialTab('publications');
                          setIsProfileOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#ede5dc] hover:bg-[#e2d8cd] text-[#3d312a] font-semibold border border-[#d8ccc0] transition-all cursor-pointer text-xs"
                      >
                        Mis Publicaciones
                      </button>
                    </>
                  )}

                  {(currentUser?.role === 'admin' || currentUser?.role === 'subadmin') && (
                    <button
                      onClick={() => setActiveView('admin')}
                      className={`px-3.5 py-1.5 rounded-full text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs ${
                        currentUser.role === 'admin' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-700 hover:bg-purple-800'
                      }`}
                    >
                      <span>{currentUser.role === 'admin' ? 'Abrir Panel de Superadministrador' : 'Abrir Panel de Moderación'}</span>
                      {pendingPinsCount > 0 && (
                        <span className="bg-white text-[#2c2420] px-1.5 rounded-full text-[10px]">
                          {pendingPinsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {!currentUser && (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-[#c94d3f] hover:bg-[#b03d30] text-white font-bold transition-all shadow-xs cursor-pointer text-xs"
                    >
                      Identificarme (Correo + 2FA QR)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pinterest Search and Category Pills Bar */}
            <SearchAndFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalVisible={visibleFeedPins.length}
            />

            {/* Masonry Responsive Pinterest Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              {visibleFeedPins.length === 0 ? (
                <div className="py-20 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#eee5dc] flex items-center justify-center text-3xl">
                    🔍
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#2c2420] mb-1">
                    No encontramos historias con esos términos
                  </h3>
                  <p className="text-xs text-[#7d6b62] mb-5">
                    Intenta buscar con palabras más generales como "receta", "abuelo", "telar" o cambia de categoría.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('todos');
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#2c2420] hover:bg-black rounded-full transition-all cursor-pointer"
                  >
                    Ver todas las historias
                  </button>
                </div>
              ) : (
                <>
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                    <AnimatePresence>
                      {visibleFeedPins.map((pin) => (
                        <PinCard
                          key={pin.id}
                          pin={pin}
                          onOpenDetail={setSelectedPin}
                          onToggleSave={handleToggleSave}
                          onToggleLike={handleToggleLike}
                          onShare={handleShare}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Infinite Scroll Sentinel & Loader */}
                  {selectedCategory === 'todos' && !searchQuery && (
                    <InfiniteScrollLoader
                      isLoading={isLoadingMore}
                      hasMore={hasMore}
                      onLoadMore={handleLoadMore}
                      onOpenCreate={() => {
                        if (!currentUser) {
                          setIsAuthOpen(true);
                        } else {
                          setIsCreateOpen(true);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8dfd5] bg-[#f4eee7] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
              <span className="text-xl">🌸</span>
              <span className="font-display font-bold text-lg text-[#2c2420]">
                Trosky
              </span>
              <span className="text-xs text-[#7d6b62]">· Entre Generaciones</span>
            </div>
            <p className="text-xs text-[#6e5d53] max-w-md">
              Archivo digital de preservación de saberes, memorias familiares y recetas tradicionales.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6e5d53] font-medium">
            <button
              onClick={() => {
                setActiveView('feed');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#2c2420] transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#2c2420] transition-colors cursor-pointer"
            >
              ¿Qué es Trosky?
            </button>
            <button
              onClick={() => {
                if (!currentUser) setIsAuthOpen(true);
                else setIsCreateOpen(true);
              }}
              className="hover:text-[#2c2420] transition-colors cursor-pointer"
            >
              Guardar Historia
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  setProfileInitialTab('publications');
                  setIsProfileOpen(true);
                }}
                className="hover:text-[#2c2420] transition-colors cursor-pointer"
              >
                Mis Publicaciones
              </button>
            )}
            {(currentUser?.role === 'admin' || currentUser?.role === 'subadmin') && (
              <button
                onClick={() => setActiveView('admin')}
                className="hover:text-amber-800 font-bold transition-colors cursor-pointer"
              >
                Panel de {currentUser.role === 'admin' ? 'Superadministrador' : 'Moderación'}
              </button>
            )}
            <button
              onClick={() => {
                if (currentUser) {
                  setProfileInitialTab('profile');
                  setIsProfileOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="hover:text-[#2c2420] transition-colors cursor-pointer"
            >
              {currentUser ? 'Mi Perfil' : 'Iniciar Sesión (2FA QR)'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-[#e2d6c8] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8e7e74] gap-2">
          <span>© 2026 Trosky · Sistema de Roles (Superadmin, Subadmin, Usuario Común), 2FA QR y Auditoría</span>
          <span>Preservando la memoria oral y familiar</span>
        </div>
      </footer>

      {/* Pin Detail Lightbox Modal */}
      <PinDetailModal
        pin={selectedPin}
        currentUser={currentUser}
        onClose={() => setSelectedPin(null)}
        onToggleSave={handleToggleSave}
        onToggleLike={handleToggleLike}
        onShare={handleShare}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onApprovePin={handleApprovePin}
      />

      {/* Create Pin Modal */}
      <CreatePinModal
        isOpen={isCreateOpen}
        currentUser={currentUser}
        onClose={() => setIsCreateOpen(false)}
        onCreatePin={handleCreatePin}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* About Trosky Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenCreate={() => {
          if (!currentUser) setIsAuthOpen(true);
          else setIsCreateOpen(true);
        }}
      />

      {/* Auth & 2FA QR Verification Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        existingUsers={users}
        onRegister={handleRegister}
      />

      {/* Profile Settings & My Publications Modal */}
      <ProfileSettingsModal
        isOpen={isProfileOpen}
        currentUser={currentUser}
        userPins={pins}
        initialTab={profileInitialTab}
        onClose={() => setIsProfileOpen(false)}
        onUpdateProfile={handleUpdateProfile}
        onSelectPin={setSelectedPin}
        onDeletePin={handleDeletePin}
        onOpenCreate={() => setIsCreateOpen(true)}
        onRequestLogout={() => setIsConfirmLogoutOpen(true)}
      />

      {/* Confirm Logout Modal */}
      <ConfirmLogoutModal
        isOpen={isConfirmLogoutOpen}
        userName={currentUser?.name}
        userEmail={currentUser?.email}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsConfirmLogoutOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
