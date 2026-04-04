import type { ReservaDto } from '../types/domain';
import { formatTimeRange } from '../utils/timeSlots';

interface ReservationCardProps {
  reserva: ReservaDto;
  onEdit: (reserva: ReservaDto) => void;
}

const estadoClassMap: Record<string, string> = {
  PENDIENTE: 'estado-pendiente',
  CONFIRMADA: 'estado-confirmada',
  CANCELADA: 'estado-cancelada',
  COMPLETADA: 'estado-completada',
  NO_PRESENTO: 'estado-no-presento',
};

function formatDate(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ReservationCard({ reserva, onEdit }: ReservationCardProps) {
  const estadoClass = estadoClassMap[reserva.estado.codigo] ?? 'estado-pendiente';
  const isEditable = reserva.estado.codigo === 'PENDIENTE' || reserva.estado.codigo === 'CONFIRMADA';
  const timeRangeLabel = formatTimeRange(reserva.franja.idInicio, reserva.franja.idFin);

  return (
    <article className="reserva-card">
      <div className="reserva-header">
        <span className="deporte-badge">{reserva.instalacion.nombre}</span>
        <span className={`estado-badge ${estadoClass}`}>{reserva.estado.nombre}</span>
      </div>

      <div className="reserva-info">
        <h3>{reserva.instalacion.nombre}</h3>
        <p className="reserva-date">📅 {formatDate(reserva.comienzaEn)}</p>
        <p className="reserva-time">🕒 {timeRangeLabel}</p>
      </div>

      <div className="reserva-details">
        <div className="detail-item">
          <span className="detail-label">Duración</span>
          <span className="detail-value">{reserva.duracionHoras}h</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Implementos</span>
          <span className="detail-value">{reserva.equipoSolicitado ? 'Sí' : 'No'}</span>
        </div>
      </div>

      {isEditable ? (
        <button type="button" className="btn-editar" onClick={() => onEdit(reserva)}>
          Editar reserva
        </button>
      ) : null}
    </article>
  );
}
