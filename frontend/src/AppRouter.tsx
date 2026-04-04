import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { CanchaPage } from './pages/CanchaPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyReservationsPage } from './pages/MyReservationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnderConstructionPage } from './pages/UnderConstructionPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="canchas/:sportSlug" element={<CanchaPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="en-construccion" element={<UnderConstructionPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<Navigate to="/login" replace />} />
        <Route
          path="mis-reservas"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
