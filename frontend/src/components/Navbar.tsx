import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const publicNavItems = [
  { to: '/', label: 'Canchas', end: true },
  { to: '/mis-reservas', label: 'Mis Reservas' },
  { to: '/en-construccion', label: 'Contacto' },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!avatarMenuRef.current) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (!avatarMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('touchstart', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('touchstart', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  const handleAvatarClick = () => {
    if (!isAuthenticated) {
      return;
    }

    setIsMenuOpen((previous) => !previous);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

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

          {!isAuthenticated ? (
            <Link to="/login" className="btn-reservar">
              Reservar
            </Link>
          ) : null}

          <div className="avatar-menu" ref={avatarMenuRef}>
            <button
              type="button"
              className={`avatar-trigger${!isAuthenticated ? ' avatar-trigger-disabled' : ''}`}
              title={displayName}
              onClick={handleAvatarClick}
              aria-haspopup={isAuthenticated ? 'menu' : undefined}
              aria-expanded={isAuthenticated ? isMenuOpen : undefined}
              aria-label="Abrir menú de perfil"
            >
              {avatarText}
            </button>

            {isAuthenticated && isMenuOpen ? (
              <div className="avatar-dropdown" role="menu" aria-label="Menú de perfil">
                <button
                  type="button"
                  className="avatar-dropdown-item"
                  role="menuitem"
                  disabled
                >
                  Mi perfil (próximamente)
                </button>
                <button
                  type="button"
                  className="avatar-dropdown-item avatar-dropdown-item-danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
