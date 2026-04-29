import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';
import type { RolCodigo } from '../types/roles';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles permitidos. Si no se especifica, cualquier usuario autenticado puede acceder */
  allowedRoles?: RolCodigo[];
  /** Ruta a redireccionar si no tiene permisos (por defecto /unauthorized) */
  fallbackPath?: string;
}

/**
 * Componente de ruta protegida que verifica autenticación y opcionalmente roles
 * 
 * Uso básico (solo autenticación):
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 * 
 * Uso con roles específicos:
 * ```tsx
 * <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Estado de carga - mostrar spinner
  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
          Cargando tu sesión...
        </div>
      </section>
    );
  }

  // No autenticado - redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Verificar roles si se especificaron
  if (allowedRoles && allowedRoles.length > 0) {
    // Si no tiene el rol requerido, redirigir
    if (!hasRole(allowedRoles)) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
}

/**
 * Componente para mostrar cuando el usuario no tiene permisos
 */
export function UnauthorizedPage() {
  const { isAdmin, isVigilante, isAuthenticated, user } = useAuth();
  
  // Determinar la ruta correcta según el rol
  let redirectPath = '/';
  if (isAuthenticated) {
    if (isAdmin()) {
      redirectPath = '/admin';
    } else if (isVigilante()) {
      redirectPath = '/vigilante';
    } else {
      redirectPath = '/mis-reservas';
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Acceso Denegado</h1>
        <p className="mt-2 text-red-600">
          No tienes permisos para acceder a esta página.
        </p>
        {user && (
          <p className="mt-1 text-sm text-red-500">
            Tu rol: {user.idRol === 1 ? 'Estudiante' : user.idRol === 2 ? 'Vigilante' : 'Administrador'}
          </p>
        )}
        <a
          href={redirectPath}
          className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Ir a mi Dashboard
        </a>
      </div>
    </section>
  );
}