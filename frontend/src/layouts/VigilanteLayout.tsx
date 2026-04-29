import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { VigilanteSidebar } from '../components/vigilante/VigilanteSidebar';
import { VigilanteHeader } from '../components/vigilante/VigilanteHeader';

const VIGILANTE_NAV_ITEMS = [
  { path: '/vigilante', label: 'Dashboard', icon: '📊' },
  { path: '/vigilante/reservas', label: 'Reservas', icon: '📋' },
  { path: '/vigilante/reporte', label: 'Reportar Disponibilidad', icon: '📋' },
];

export function VigilanteLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = VIGILANTE_NAV_ITEMS.find((item) =>
    item.path === '/vigilante'
      ? location.pathname === '/vigilante'
      : location.pathname.startsWith(item.path),
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <VigilanteSidebar
        items={VIGILANTE_NAV_ITEMS}
        activePath={activeItem?.path ?? '/vigilante'}
        onNavigate={(path) => navigate(path)}
      />
      <div className="flex flex-1 flex-col">
        <VigilanteHeader
          userName={`${user?.nombres} ${user?.apellidos}`}
          userEmail={user?.correo ?? ''}
        />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}