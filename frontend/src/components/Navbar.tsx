import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const publicNavItems = [
  { to: '/', label: 'Canchas', end: true },
  { to: '/mis-reservas', label: 'Mis Reservas' },
  { to: '/contacto', label: 'Contacto' },
];

function initials(fullName: string): string {
  const pieces = fullName
    .split(' ')
    .map((piece) => piece.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (pieces.length === 0) {
    return 'U';
  }

  return pieces.map((piece) => piece.charAt(0).toUpperCase()).join('');
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user ? `${user.nombres} ${user.apellidos}` : 'Invitado';
  const avatarText = initials(displayName);

  return (
    <header className="navbar-shell">
      <nav className="navbar-inner" aria-label="Navegación principal">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-icon" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="nav-logo-text">UniDeportes</span>
        </Link>

        <div className="nav-right">
          <ul className="nav-links">
            {publicNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {isAuthenticated ? (
            <button type="button" onClick={logout} className="btn-reservar">
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="btn-reservar">
              Reservar
            </Link>
          )}

          <div className="avatar-placeholder" title={displayName}>
            {avatarText}
          </div>
        </div>
      </nav>
    </header>
  );
}
