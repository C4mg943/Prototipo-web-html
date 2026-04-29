import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ROL_CODIGOS,
  type Permiso,
  type RolCodigo,
  PERMISOS_POR_ROL,
  esAdmin,
  esVigilante,
  esEstudiante,
  tienePermiso as checkPermiso,
  getNombreRol,
} from '../types/roles';

/**
 * Hook para verificar permisos y roles del usuario actual
 */
export function usePermissions() {
  const { user } = useAuth();

  // Obtener el código de rol del usuario actual
  const rolActual = useMemo((): RolCodigo | null => {
    if (!user?.idRol) return null;
    return ROL_CODIGOS[user.idRol] ?? null;
  }, [user?.idRol]);

  // Verificar si es admin
  const isAdmin = useCallback((): boolean => {
    if (!user?.idRol) return false;
    return esAdmin(user.idRol);
  }, [user?.idRol]);

  // Verificar si es vigilante
  const isVigilante = useCallback((): boolean => {
    if (!user?.idRol) return false;
    return esVigilante(user.idRol);
  }, [user?.idRol]);

  // Verificar si es estudiante
  const isEstudiante = useCallback((): boolean => {
    if (!user?.idRol) return false;
    return esEstudiante(user.idRol);
  }, [user?.idRol]);

  // Verificar si tiene un rol específico
  const hasRole = useCallback(
    (rol: RolCodigo | RolCodigo[]): boolean => {
      if (!user?.idRol) return false;
      const rolCodigo = ROL_CODIGOS[user.idRol];
      if (!rolCodigo) return false;

      if (Array.isArray(rol)) {
        return rol.includes(rolCodigo);
      }
      return rolCodigo === rol;
    },
    [user?.idRol],
  );

  // Verificar si tiene un permiso específico
  const hasPermission = useCallback(
    (permiso: Permiso | Permiso[]): boolean => {
      if (!user?.idRol) return false;
      const rolCodigo = ROL_CODIGOS[user.idRol];
      if (!rolCodigo) return false;

      if (Array.isArray(permiso)) {
        return permiso.some((p) => checkPermiso(rolCodigo, p));
      }
      return checkPermiso(rolCodigo, permiso);
    },
    [user?.idRol],
  );

  // Obtener nombre del rol
  const nombreRol = useMemo((): string => {
    if (!user?.idRol) return '';
    return getNombreRol(user.idRol);
  }, [user?.idRol]);

  // Obtener lista de permisos del usuario
  const permisos = useMemo((): Permiso[] => {
    if (!user?.idRol) return [];
    const rolCodigo = ROL_CODIGOS[user.idRol];
    return PERMISOS_POR_ROL[rolCodigo] ?? [];
  }, [user?.idRol]);

  return {
    rolActual,
    isAdmin,
    isVigilante,
    isEstudiante,
    hasRole,
    hasPermission,
    nombreRol,
    permisos,
  };
}