import { sports } from '../data/sports';
import type { SportSlug } from '../types/domain';

interface CanchaInfoProps {
  sportSlug: SportSlug;
}

export function CanchaInfo({ sportSlug }: CanchaInfoProps) {
  const sport = sports.find((item) => item.slug === sportSlug);

  if (!sport) {
    return null;
  }

  return (
    <section className="cancha-left" aria-label="Información de la cancha">
      <div className="header-image-card">
        <img src={sport.image} alt={sport.alt} className="cancha-cover" />
        <div className="header-image-overlay">
          <h1>{sport.name}</h1>
          <p>{sport.description}</p>
        </div>
      </div>

      <article className="info-card">
        <div className="info-card-header">Información y Contacto</div>

        <div className="info-card-body">
          <div className="info-col">
            <h3>Especificaciones</h3>
            <ul className="specs-list">
              <li>
                <span className="dot" /> Seguridad privada
              </li>
              <li>
                <span className="dot" /> Gradas disponibles
              </li>
              <li>
                <span className="dot" /> Baños cercanos
              </li>
            </ul>
          </div>

          <div className="info-col">
            <h3>Administración</h3>
            <p className="phone">+57 (605) 438-1000 Ext. 3050</p>
            <p className="desc">
              Para eventos especiales o torneos, por favor contactar directamente con administración.
            </p>
            <a
              className="btn-outline"
              href="https://sistemabienestar.unimagdalena.edu.co/Modulos/ReservasEscenariosGruposCD/Reservas.aspx"
              target="_blank"
              rel="noreferrer"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}
