import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface VigilanteHeaderProps {
  userName: string;
  userEmail: string;
}

export function VigilanteHeader({ userName, userEmail }: VigilanteHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}