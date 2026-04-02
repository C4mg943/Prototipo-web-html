import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAuthSession,
  type LoginPayload,
  login as loginRequest,
  me,
  readAuthToken,
  readAuthUser,
  type RegisterPayload,
  register as registerRequest,
  saveAuthSession,
} from '../services/auth';
import type { AuthUser } from '../types/domain';
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [error, isLoading, login, logout, refreshProfile, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
