import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="not-found-code">404</p>
      <h2>Página no encontrada</h2>
      <p>La ruta que intentas abrir no existe en este momento.</p>
      <Link to="/" className="btn-reservar">
        Volver al inicio
      </Link>
    </section>
  );
}
