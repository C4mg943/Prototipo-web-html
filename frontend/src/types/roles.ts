/**
 * Tipos y constantes para el sistema de roles y permisos
 */

// Códigos de rol según la base de datos
export type RolCodigo = 'ESTUDIANTE' | 'VIGILANTE' | 'ADMINISTRADOR';

export interface Rol {
  id: number;
  codigo: RolCodigo;
  nombre: string;
}

// Enum para tipos de rol (usados en frontend)
export enum TipoRol {
  ESTUDIANTE = 'ESTUDIANTE',
  VIGILANTE = 'VIGILANTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

// Mapeo de códigos numéricos a strings
export const ROL_CODIGOS: Record<number, RolCodigo> = {
  1: 'ESTUDIANTE',
  2: 'VIGILANTE',
  3: 'ADMINISTRADOR',
};

// Mapeo inverso: string a número
export const ROL_A_ID: Record<RolCodigo, number> = {
  ESTUDIANTE: 1,
  VIGILANTE: 2,
  ADMINISTRADOR: 3,
};

// Nombres legibles para mostrar
export const ROL_NOMBRES: Record<RolCodigo, string> = {
  ESTUDIANTE: 'Estudiante',
  VIGILANTE: 'Vigilante',
  ADMINISTRADOR: 'Administrador',
};

// Permisos del sistema
export type Permiso =
  | 'reservas:create'
  | 'reservas:read'
  | 'reservas:update'
  | 'reservas:cancel'
  | 'reservas:read_own'
  | 'reservas:read_all'
  | 'reservas:read_day'
  | 'usuarios:create'
  | 'usuarios:read'
  | 'usuarios:update'
  | 'usuarios:delete'
  | 'instalaciones:create'
  | 'instalaciones:read'
  | 'instalaciones:update'
  | 'instalaciones:delete'
  | 'escenarios:create'
  | 'escenarios:read'
  | 'escenarios:update'
  | 'escenarios:delete'
  | 'deportes:create'
  | 'deportes:read'
  | 'deportes:update'
  | 'deportes:delete'
  | 'equipamiento:create'
  | 'equipamiento:read'
  | 'equipamiento:update'
  | 'equipamiento:delete'
  | 'bloqueos:create'
  | 'bloqueos:read'
  | 'bloqueos:update'
  | 'bloqueos:delete'
  | 'franjas:create'
  | 'franjas:read'
  | 'franjas:update'
  | 'franjas:delete'
  | 'reportes:read'
  | 'reportes:generate'
  | 'auditoria:read';

// Permisos por rol
export const PERMISOS_POR_ROL: Record<RolCodigo, Permiso[]> = {
  ESTUDIANTE: [
    'reservas:create',
    'reservas:read_own',
    'reservas:read', // para ver disponibilidad
    'reservas:update',
    'reservas:cancel',
  ],
  VIGILANTE: [
    'reservas:read',
    'reservas:read_all',
    'reservas:read_day',
    'usuarios:read',
    'instalaciones:read',
    'escenarios:read',
    'bloqueos:create',
    'bloqueos:read',
    'bloqueos:update',
  ],
  ADMINISTRADOR: [
    // Reservas
    'reservas:read',
    'reservas:read_all',
    'reservas:update',
    // Usuarios
    'usuarios:create',
    'usuarios:read',
    'usuarios:update',
    'usuarios:delete',
    // Instalaciones
    'instalaciones:create',
    'instalaciones:read',
    'instalaciones:update',
    'instalaciones:delete',
    // Escenarios
    'escenarios:create',
    'escenarios:read',
    'escenarios:update',
    'escenarios:delete',
    // Deportes
    'deportes:create',
    'deportes:read',
    'deportes:update',
    'deportes:delete',
    // Equipamiento
    'equipamiento:create',
    'equipamiento:read',
    'equipamiento:update',
    'equipamiento:delete',
    // Bloqueos
    'bloqueos:create',
    'bloqueos:read',
    'bloqueos:update',
    'bloqueos:delete',
    // Franjas
    'franjas:create',
    'franjas:read',
    'franjas:update',
    'franjas:delete',
    // Reportes
    'reportes:read',
    'reportes:generate',
    // Auditoría
    'auditoria:read',
  ],
};

// Funciones helper
export function esAdmin(rol: RolCodigo | number): boolean {
  const codigo = typeof rol === 'number' ? ROL_CODIGOS[rol] : rol;
  return codigo === 'ADMINISTRADOR';
}

export function esVigilante(rol: RolCodigo | number): boolean {
  const codigo = typeof rol === 'number' ? ROL_CODIGOS[rol] : rol;
  return codigo === 'VIGILANTE';
}

export function esEstudiante(rol: RolCodigo | number): boolean {
  const codigo = typeof rol === 'number' ? ROL_CODIGOS[rol] : rol;
  return codigo === 'ESTUDIANTE';
}

export function tienePermiso(rol: RolCodigo | number, permiso: Permiso): boolean {
  const codigo = typeof rol === 'number' ? ROL_CODIGOS[rol] : rol;
  const permisos = PERMISOS_POR_ROL[codigo];
  return permisos?.includes(permiso) ?? false;
}

export function getNombreRol(rol: RolCodigo | number): string {
  const codigo = typeof rol === 'number' ? ROL_CODIGOS[rol] : rol;
  return ROL_NOMBRES[codigo] ?? 'Desconocido';
}