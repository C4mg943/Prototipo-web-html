import { useMemo, useState, type FormEvent } from 'react';
import { slotOptions } from '../data/sports';
import type { ReservaDto, UpdateReservaPayload } from '../types/domain';
import {
  canNavigateBackward,
  canNavigateForward,
  formatDayLabel,
  formatWeekdayLabel,
  getNextWeek,
  getPrevWeek,
  getWeekDays,
  parseIsoDate,
  startOfWeek,
  toIsoDate,
} from '../utils/weekPicker';

const maxLoanHours = 3;
const maxWeeksForward = 4;

interface EditReservationModalProps {
  reserva: ReservaDto;
  isSubmitting: boolean;
  reservas: ReservaDto[];
  onSave: (reservaId: number, payload: UpdateReservaPayload) => Promise<void>;
  onCancelReservation: (reservaId: number, reason: string) => Promise<void>;
  onClose: () => void;
}

interface EditFormState {
  fechaReserva: string;
  idFranjaInicio: number;
  idFranjaFin: number;
  equipoSolicitado: boolean;
  notas: string;
}

export function EditReservationModal({
  reserva,
  isSubmitting,
  reservas,
  onSave,
  onCancelReservation,
  onClose,
}: EditReservationModalProps) {
  const initialWeekStartDate = startOfWeek(parseIsoDate(reserva.fechaReserva) ?? new Date());
  const [form, setForm] = useState<EditFormState>({
    fechaReserva: reserva.fechaReserva,
    idFranjaInicio: reserva.franja.idInicio,
    idFranjaFin: reserva.franja.idFin,
    equipoSolicitado: reserva.equipoSolicitado,
    notas: reserva.notas ?? '',
  });
  const [error, setError] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<Date>(initialWeekStartDate);

  const weekDays = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);
  const weekDayIds = useMemo(() => weekDays.map((date) => toIsoDate(date)), [weekDays]);
  const reserveWindowLabel = useMemo(() => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[weekDays.length - 1];

    if (!firstDay || !lastDay) {
      return '';
    }

    const startLabel = formatDayLabel(firstDay);
    const endLabel = formatDayLabel(lastDay);
    return `${startLabel} - ${endLabel}`;
  }, [weekDays]);

  const isEditable = reserva.estado.codigo === 'PENDIENTE' || reserva.estado.codigo === 'CONFIRMADA';
  const duration = form.idFranjaFin - form.idFranjaInicio;
  const canGoNextWeek = canNavigateForward(weekStartDate, maxWeeksForward);
  const canGoPrevWeek = canNavigateBackward(weekStartDate);

  const hasOverlap = reservas.some((existingReserva) => {
    if (existingReserva.id === reserva.id) {
      return false;
    }

    const isActive = existingReserva.estado.codigo === 'PENDIENTE' || existingReserva.estado.codigo === 'CONFIRMADA';
    if (!isActive) {
      return false;
    }

    const sameFacility = existingReserva.idInstalacion === reserva.idInstalacion;
    const sameDate = existingReserva.fechaReserva === form.fechaReserva;
    if (!sameFacility || !sameDate) {
      return false;
    }

    const existingStart = existingReserva.franja.idInicio;
    const existingEnd = existingReserva.franja.idFin;

    return form.idFranjaInicio < existingEnd && form.idFranjaFin > existingStart;
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isEditable) {
      setError('Esta reserva no se puede editar por su estado actual.');
      return;
    }

    if (form.idFranjaFin <= form.idFranjaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    if (duration < 1 || duration > maxLoanHours) {
      setError(`La reserva debe durar entre 1 y ${maxLoanHours} horas.`);
      return;
    }

    if (hasOverlap) {
      setError('Este horario ya está reservado para esta instalación.');
      return;
    }

    try {
      await onSave(reserva.id, {
        fechaReserva: form.fechaReserva,
        idFranjaInicio: form.idFranjaInicio,
        idFranjaFin: form.idFranjaFin,
        equipoSolicitado: form.equipoSolicitado,
        notas: form.notas.trim() || undefined,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo actualizar la reserva.');
    }
  };

  const handleCancelReservation = async () => {
    if (!isEditable) {
      setCancelError('Esta reserva no se puede cancelar por su estado actual.');
      return;
    }

    const reason = cancelReason.trim();

    if (!reason) {
      setCancelError('La razón de cancelación es obligatoria.');
      return;
    }

    setCancelError('');

    try {
      await onCancelReservation(reserva.id, reason);
    } catch (cancelSubmitError) {
      setCancelError(cancelSubmitError instanceof Error ? cancelSubmitError.message : 'No se pudo cancelar la reserva.');
    }
  };

  const activeDate = weekDayIds.includes(form.fechaReserva) ? form.fechaReserva : weekDayIds[0] ?? form.fechaReserva;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="editReservationTitle">
      <div className="modal-content modal-content-edit">
        <div className="modal-header">
          <h2 id="editReservationTitle">Editar reserva</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <p className="modal-helper-text">
            Instalación: <strong>{reserva.instalacion.nombre}</strong>
          </p>

          <div className="field-section">
            <div className="week-picker-controls">
              <div className="week-picker-title">
                <span className="field-label" id="editFechaReservaLabel">
                  Fechas:
                </span>
                {reserveWindowLabel ? <span className="week-range-label">{reserveWindowLabel}</span> : null}
              </div>
              <div className="week-picker-nav">
                <button
                  type="button"
                  className="btn-outline week-nav-btn"
                  onClick={() => {
                    setError('');
                    setWeekStartDate((prev) => getPrevWeek(prev));

                    const previousWeekDays = getWeekDays(getPrevWeek(weekStartDate));
                    const nextDate = previousWeekDays[0];

                    if (nextDate) {
                      setForm((prev) => ({ ...prev, fechaReserva: toIsoDate(nextDate) }));
                    }
                  }}
                  disabled={!canGoPrevWeek || isSubmitting}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="btn-outline week-nav-btn"
                  onClick={() => {
                    setError('');
                    setWeekStartDate((prev) => getNextWeek(prev));

                    const nextWeekDays = getWeekDays(getNextWeek(weekStartDate));
                    const nextDate = nextWeekDays[0];

                    if (nextDate) {
                      setForm((prev) => ({ ...prev, fechaReserva: toIsoDate(nextDate) }));
                    }
                  }}
                  disabled={!canGoNextWeek || isSubmitting}
                >
                  →
                </button>
              </div>
            </div>

            <fieldset className="week-picker week-picker-edit" aria-labelledby="editFechaReservaLabel">
              {weekDays.map((date) => {
                const isoDate = toIsoDate(date);
                const isSelected = activeDate === isoDate;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    className={isSelected ? 'week-day-btn week-day-btn-active' : 'week-day-btn'}
                    onClick={() => {
                      setError('');
                      setForm((prev) => ({ ...prev, fechaReserva: isoDate }));
                    }}
                    disabled={isSubmitting}
                  >
                    <span className="week-day-name">{formatWeekdayLabel(date)}</span>
                    <span className="week-day-date">{formatDayLabel(date)}</span>
                  </button>
                );
              })}
            </fieldset>
          </div>

          <div className="field-row field-row-time">
            <div className="field-section">
              <label className="field-label" htmlFor="editFranjaInicio">
                Inicio
              </label>
              <select
                id="editFranjaInicio"
                className="form-control form-control-time"
                value={form.idFranjaInicio}
                disabled={isSubmitting}
                onChange={(event) => {
                  setError('');
                  setForm((prev) => ({ ...prev, idFranjaInicio: Number(event.target.value) }));
                }}
              >
                {slotOptions.map((slot) => (
                  <option key={`edit-start-${slot.id}`} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-section">
              <label className="field-label" htmlFor="editFranjaFin">
                Fin
              </label>
              <select
                id="editFranjaFin"
                className="form-control form-control-time"
                value={form.idFranjaFin}
                disabled={isSubmitting}
                onChange={(event) => {
                  const nextEnd = Number(event.target.value);

                  if (nextEnd - form.idFranjaInicio > maxLoanHours) {
                    setError(`Máximo ${maxLoanHours} horas por reserva.`);
                    setForm((prev) => ({ ...prev, idFranjaFin: prev.idFranjaInicio + maxLoanHours }));
                    return;
                  }

                  setError('');
                  setForm((prev) => ({ ...prev, idFranjaFin: nextEnd }));
                }}
              >
                {slotOptions.map((slot) => (
                  <option key={`edit-end-${slot.id}`} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-section">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.equipoSolicitado}
                disabled={isSubmitting}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, equipoSolicitado: event.target.checked }));
                }}
              />
              Solicitar implementos deportivos
            </label>
          </div>

          <div className="field-section">
            <label className="field-label" htmlFor="editNotas">
              Notas
            </label>
            <textarea
              id="editNotas"
              className="form-control"
              rows={3}
              maxLength={500}
              value={form.notas}
              disabled={isSubmitting}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, notas: event.target.value }));
              }}
              placeholder="Notas opcionales para tu reserva"
            />
          </div>

          <p className="duration-text">
            Duración seleccionada: {Math.max(duration, 0)} hora(s) — máximo {maxLoanHours} horas.
          </p>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cerrar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !isEditable}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          <div className="cancel-section">
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                setShowCancelSection((prev) => !prev);
                setCancelError('');
              }}
              disabled={isSubmitting || !isEditable}
            >
              {showCancelSection ? 'Ocultar cancelación' : 'Cancelar reserva'}
            </button>

            {showCancelSection ? (
              <div className="cancel-section-body">
                <label className="field-label" htmlFor="cancelReasonInline">
                  Razón de cancelación
                </label>
                <textarea
                  id="cancelReasonInline"
                  className="form-control"
                  rows={3}
                  value={cancelReason}
                  disabled={isSubmitting}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Escribe una razón breve..."
                />
                {cancelError ? <p className="error-text">{cancelError}</p> : null}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={isSubmitting}
                    onClick={() => {
                      void handleCancelReservation();
                    }}
                  >
                    {isSubmitting ? 'Cancelando...' : 'Confirmar cancelación'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
