import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';

const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/usuarios', label: 'Usuarios' },
  { path: '/admin/escenarios', label: 'Escenarios' },
  { path: '/admin/instalaciones', label: 'Instalaciones' },
  { path: '/admin/deportes', label: 'Deportes' },
  { path: '/admin/equipamiento', label: 'Equipamiento' },
  { path: '/admin/bloqueos', label: 'Bloqueos' },
  { path: '/admin/franjas', label: 'Franjas Horarias' },
  { path: '/admin/reservas', label: 'Reservas' },
];

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener el ítem aktivo basadas en la ruta actual
  const activeItem = ADMIN_NAV_ITEMS.find((item) =>
    item.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.path),
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        items={ADMIN_NAV_ITEMS}
        activePath={activeItem?.path ?? '/admin'}
        onNavigate={(path) => navigate(path)}
      />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col">
        <AdminHeader
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
