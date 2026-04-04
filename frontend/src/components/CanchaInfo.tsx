import { sports } from '../data/sports';
import type { FacilityOption, SportSlug } from '../types/domain';

interface CanchaInfoProps {
  sportSlug: SportSlug;
  selectedFacility?: FacilityOption;
}

export function CanchaInfo({ sportSlug, selectedFacility }: CanchaInfoProps) {
  const sport = sports.find((item) => item.slug === sportSlug);

  if (!sport) {
    return null;
  }

  return (
    <section className="cancha-left" aria-label="Información de la cancha">
      <div className="header-image-card">
        <img src={selectedFacility?.image ?? sport.image} alt={selectedFacility?.imageAlt ?? sport.alt} className="cancha-cover" />
        <div className="header-image-overlay">
          <h1>{sport.name}</h1>
          <p>{selectedFacility?.name ?? sport.description}</p>
        </div>
      </div>

      <article className="info-card">
        <div className="info-card-header-row">
          <h2 className="info-card-header">Información y Contacto</h2>
          <h2 className="info-card-header">Administración</h2>
        </div>
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

          <div className="info-col info-admin-col">
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
