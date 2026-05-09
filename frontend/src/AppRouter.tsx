import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, UnauthorizedPage } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { VigilanteLayout } from './layouts/VigilanteLayout';
import { CanchaPage } from './pages/CanchaPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyReservationsPage } from './pages/MyReservationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnderConstructionPage } from './pages/UnderConstructionPage';
// Importar páginas de Admin
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsuariosPage } from './pages/admin/AdminUsuariosPage';
import { AdminReservasPage } from './pages/admin/AdminReservasPage';
import { AdminInstalacionesPage } from './pages/admin/AdminInstalacionesPage';
import { AdminEscenariosPage } from './pages/admin/AdminEscenariosPage';
import { AdminDeportesPage } from './pages/admin/AdminDeportesPage';
import { AdminEquipamientoPage } from './pages/admin/AdminEquipamientoPage';
import { AdminBloqueosPage } from './pages/admin/AdminBloqueosPage';
import { AdminFranjasPage } from './pages/admin/AdminFranjasPage';
// Importar páginas de Vigilante
import { VigilanteDashboardPage } from './pages/vigilante/VigilanteDashboardPage';
import { VigilanteReservasPage } from './pages/vigilante/VigilanteReservasPage';
import { UserProfilePage } from './pages/UserProfilePage';

export function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="canchas/:sportSlug" element={<CanchaPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="en-construccion" element={<UnderConstructionPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route
          path="mis-reservas"
          element={
            <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute allowedRoles={['ESTUDIANTE', 'VIGILANTE', 'ADMINISTRADOR']}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* RUTAS DE ADMINISTRADOR */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboardPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
        <Route path="reservas" element={<AdminReservasPage />} />
        <Route path="instalaciones" element={<AdminInstalacionesPage />} />
        <Route path="escenarios" element={<AdminEscenariosPage />} />
        <Route path="deportes" element={<AdminDeportesPage />} />
        <Route path="equipamiento" element={<AdminEquipamientoPage />} />
        <Route path="bloqueos" element={<AdminBloqueosPage />} />
        <Route path="franjas" element={<AdminFranjasPage />} />
      </Route>

      {/* RUTAS DE VIGILANTE */}
      <Route path="/vigilante" element={
        <ProtectedRoute allowedRoles={['VIGILANTE']}>
          <VigilanteLayout />
        </ProtectedRoute>
      }>
        <Route index element={<VigilanteDashboardPage />} />
        <Route path="reservas" element={<VigilanteReservasPage />} />
        <Route path="reporte" element={<UnderConstructionPage />} />
      </Route>
    </Routes>
  );
}
