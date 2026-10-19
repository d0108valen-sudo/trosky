export type CategoryType = 
  | 'todos'
  | 'receta' 
  | 'relato' 
  | 'foto' 
  | 'oficio' 
  | 'familia' 
  | 'carta'
  | 'tradicion';

export type UserRole = 'admin' | 'subadmin' | 'usuario';

export interface SubadminPermissions {
  moderatePins: boolean;       // Aprobar y rechazar publicaciones
  deletePins: boolean;         // Eliminar publicaciones
  moderateComments: boolean;   // Eliminar comentarios inadecuados
  reviewReports: boolean;      // Revisar reportes comunitarios
  viewStats: boolean;          // Consultar estadísticas de la plataforma
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  totpSecret?: string;
  role: UserRole;
  status?: 'activo' | 'inactivo';
  permissions?: SubadminPermissions;
  avatar: string;
  family?: string;
  community?: string;
  createdAt: string;
  createdBy?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details?: string;
  targetId?: string;
}

export interface ReportItem {
  id: string;
  pinId: string;
  pinTitle: string;
  reportedBy: string;
  reason: string;
  date: string;
  status: 'pendiente' | 'resuelto' | 'descartado';
}

export interface PinAuthor {
  name: string;
  role: string;
  avatar: string;
  family?: string;
  community?: string;
  userId?: string;
}

export interface PinComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  date: string;
  userId?: string;
}

export type PinStatus = 'aprobado' | 'pendiente' | 'rechazado';

export interface PinItem {
  id: string;
  title: string;
  description: string;
  fullStory?: string;
  category: CategoryType;
  categoryLabel: string;
  imageUrl: string;
  aspectRatio?: 'tall' | 'square' | 'wide' | 'panoramic';
  author: PinAuthor;
  year: string;
  location: string;
  tags: string[];
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  status: PinStatus;
  rejectionReason?: string;
  boardName?: string;
  audioSnippet?: {
    speaker: string;
    narrative: string;
    duration: string;
  };
  recipeDetails?: {
    servings: string;
    time: string;
    ingredients: string[];
  };
  comments: PinComment[];
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  count: number;
  coverImage: string;
}
