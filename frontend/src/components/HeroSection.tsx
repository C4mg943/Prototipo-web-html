import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1 className="hero-title">Reserva tus escenarios
en minutos...</h1>
        <p className="hero-desc">Consulta disponibilidad en tiempo real y agenda sin complicaciones.</p>
        <div className="hero-actions">
          <Link to="/login" className="btn-agendar">
            Agendar
          </Link>
          <a
            className="btn-como"
            href="https://sistemabienestar.unimagdalena.edu.co/Modulos/ReservasEscenariosGruposCD/Reservas.aspx"
            target="_blank"
            rel="noreferrer"
          >
            Cómo funciona
          </a>
        </div>
      </div>
    </section>
  );
}
