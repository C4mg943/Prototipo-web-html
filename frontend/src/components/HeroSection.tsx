import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero">
      <div className="hero-text">
        <h1 className="hero-title">Reserva tus escenarios
en minutos...</h1>
        <p className="hero-desc">Consulta disponibilidad en tiempo real y agenda sin complicaciones.</p>
        <div className="hero-actions">
          <Link to={isAuthenticated ? '/en-construccion' : '/login'} className="btn-agendar">
            Agendar
          </Link>
          <Link className="btn-como" to="/en-construccion">
            Cómo funciona
          </Link>
        </div>
      </div>
    </section>
  );
}
