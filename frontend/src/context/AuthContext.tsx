import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAuthSession,
  type LoginPayload,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  me,
  readAuthToken,
  readAuthUser,
  type RegisterPayload,
  register as registerRequest,
  saveAuthSession,
} from '../services/auth';
import type { AuthUser } from '../types/domain';
import { ROL_CODIGOS, esAdmin, esEstudiante, esVigilante, type RolCodigo } from '../types/roles';
import { AuthContext, type AuthContextValue } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => readAuthUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProfile = useCallback(async () => {
    const token = readAuthToken();

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await me();
      setUser(profile);
      localStorage.setItem('auth_user', JSON.stringify(profile));
      setError('');
    } catch (refreshError) {
      clearAuthSession();
      setUser(null);
      setError(refreshError instanceof Error ? refreshError.message : 'No se pudo validar la sesión.');
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshProfile();
      setIsLoading(false);
    })();
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    setError('');
    const response = await loginRequest(payload);
    saveAuthSession(response.data);
    setUser(response.data.usuario);
  }, []);

  const loginWithGoogle = useCallback(async (token: string) => {
    setError('');
    const response = await loginWithGoogleRequest(token);
    saveAuthSession(response.data);
    setUser(response.data.usuario);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setError('');
    const response = await registerRequest(payload);
    saveAuthSession(response.data);
    setUser(response.data.usuario);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setError('');
  }, []);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback(
    (roles: RolCodigo | RolCodigo[]): boolean => {
      if (!user?.idRol) return false;
      const codigo = ROL_CODIGOS[user.idRol];
      if (!codigo) return false;

      if (Array.isArray(roles)) {
        return roles.includes(codigo);
      }
      return codigo === roles;
    },
    [user?.idRol],
  );

  // Verificar si es administrador
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshProfile,
      hasRole,
      isAdmin,
      isVigilante,
      isEstudiante,
    }),
    [error, hasRole, isAdmin, isEstudiante, isLoading, isVigilante, login, loginWithGoogle, logout, refreshProfile, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
