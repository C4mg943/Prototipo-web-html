import { createContext } from 'react';
import type { LoginPayload, RegisterPayload } from '../services/auth';
import type { AuthUser } from '../types/domain';
import type { RolCodigo } from '../types/roles';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  // Métodos de rol
  hasRole: (roles: RolCodigo | RolCodigo[]) => boolean;
  isAdmin: () => boolean;
  isVigilante: () => boolean;
  isEstudiante: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
