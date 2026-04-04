import { Link } from 'react-router-dom';

export function UnderConstructionPage() {
  return (
    <section className="construction-page">
      <article className="construction-content">
        <div className="construction-icons" aria-hidden="true">
          <span>🚧</span>
          <span>🧱</span>
          <span>🚧</span>
        </div>

        <h1>Estamos trabajando para ti</h1>
        <p>
          Este escenario o módulo actualmente está en proceso de construcción y mantenimiento. Nos
          estamos asegurando de que todo quede perfecto.
        </p>

        <Link to="/" className="btn-reservar">
          Volver al inicio
        </Link>
      </article>
    </section>
  );
}
