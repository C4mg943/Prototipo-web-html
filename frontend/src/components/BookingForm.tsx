import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { facilitiesBySport, slotOptions } from '../data/sports';
import { createReserva } from '../services/reservas';
import type { SportSlug } from '../types/domain';
import { formatDayLabel, formatWeekdayLabel, getWeekDays, startOfWeek, toIsoDate } from '../utils/weekPicker';

const maxLoanHours = 3;

interface BookingFormProps {
  sportSlug: SportSlug;
  selectedFacilityId?: number;
  onFacilityChange?: (facilityId: number) => void;
}

interface BookingState {
  idInstalacion: number;
  fechaReserva: string;
  idFranjaInicio: number;
  idFranjaFin: number;
  equipoSolicitado: boolean;
  notas: string;
}

function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function BookingForm({ sportSlug, selectedFacilityId, onFacilityChange }: BookingFormProps) {
  const facilities = facilitiesBySport[sportSlug];
  const hasFacilities = facilities.length > 0;
  const weekDates = useMemo(() => getWeekDays(startOfWeek(new Date())), []);
  const weekDateIds = useMemo(() => weekDates.map((date) => toIsoDate(date)), [weekDates]);
  const fallbackDate = weekDateIds[0] ?? todayIso();

  const [form, setForm] = useState<BookingState>({
    idInstalacion: selectedFacilityId ?? facilities[0]?.id ?? 1,
    fechaReserva: weekDateIds.includes(todayIso()) ? todayIso() : fallbackDate,
    idFranjaInicio: 1,
    idFranjaFin: 2,
    equipoSolicitado: false,
    notas: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const duration = useMemo(() => form.idFranjaFin - form.idFranjaInicio, [form.idFranjaFin, form.idFranjaInicio]);

  const normalizedSelectedFacilityId = selectedFacilityId ?? facilities[0]?.id ?? 1;
  useEffect(() => {
    setForm((prev) => ({ ...prev, idInstalacion: normalizedSelectedFacilityId }));
  }, [normalizedSelectedFacilityId]);

  if (!hasFacilities) {
    return (
      <div className="booking-card">
        <div className="booking-header">
          <h2>Disponibilidad</h2>
          <p>No hay instalaciones disponibles para este deporte.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.idFranjaFin <= form.idFranjaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    if (duration < 1 || duration > maxLoanHours) {
      setError(`La reserva debe durar entre 1 y ${maxLoanHours} horas.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await createReserva({
        idInstalacion: form.idInstalacion,
        fechaReserva: form.fechaReserva,
        idFranjaInicio: form.idFranjaInicio,
        idFranjaFin: form.idFranjaFin,
        equipoSolicitado: form.equipoSolicitado,
        notas: form.notas || undefined,
      });
      setSuccess('Reserva creada exitosamente. Revisa “Mis Reservas”.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo crear la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <h2>Disponibilidad</h2>
        <p>Selecciona fecha y hora</p>
      </div>

      <form className="booking-body" onSubmit={handleSubmit}>
        <div className="field-section">
          <label className="field-label" htmlFor="instalacion">
            Escenario
          </label>
          <select
            id="instalacion"
            className="form-control"
            value={form.idInstalacion}
            onChange={(event) => {
              const nextFacilityId = Number(event.target.value);
              setForm((prev) => ({ ...prev, idInstalacion: nextFacilityId }));
              onFacilityChange?.(nextFacilityId);
            }}
          >
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name} — {facility.scenario}
              </option>
            ))}
          </select>
        </div>

        <div className="field-section">
          <span className="field-label" id="fechaReservaLabel">
            Fechas:
          </span>
          <fieldset className="week-picker" aria-labelledby="fechaReservaLabel">
            {weekDates.map((date) => {
              const isoDate = toIsoDate(date);
              const isSelected = form.fechaReserva === isoDate;
              return (
                <button
                  key={isoDate}
                  type="button"
                  className={isSelected ? 'week-day-btn week-day-btn-active' : 'week-day-btn'}
                  onClick={() => {
                    setError('');
                    setForm((prev) => ({ ...prev, fechaReserva: isoDate }));
                  }}
                >
                  <span className="week-day-name">{formatWeekdayLabel(date)}</span>
                  <span className="week-day-date">{formatDayLabel(date)}</span>
                </button>
              );
            })}
          </fieldset>
          <input id="fechaReserva" type="hidden" value={form.fechaReserva} required readOnly />
        </div>

        <div className="field-row">
          <div className="field-section">
            <label className="field-label" htmlFor="franjaInicio">
              Inicio
            </label>
            <select
              id="franjaInicio"
              className="form-control"
              value={form.idFranjaInicio}
              onChange={(event) => setForm((prev) => ({ ...prev, idFranjaInicio: Number(event.target.value) }))}
            >
              {slotOptions.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-section">
            <label className="field-label" htmlFor="franjaFin">
              Fin
            </label>
            <select
              id="franjaFin"
              className="form-control"
              value={form.idFranjaFin}
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
                <option key={slot.id} value={slot.id}>
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
              onChange={(event) => setForm((prev) => ({ ...prev, equipoSolicitado: event.target.checked }))}
            />
            Solicitar implementos deportivos
          </label>
        </div>

        <div className="field-section">
          <label className="field-label" htmlFor="notas">
            Notas
          </label>
          <textarea
            id="notas"
            className="form-control"
            rows={3}
            maxLength={500}
            value={form.notas}
            onChange={(event) => setForm((prev) => ({ ...prev, notas: event.target.value }))}
            placeholder="Notas opcionales para tu reserva"
          />
        </div>

        <p className="duration-text">
          Duración seleccionada: {Math.max(duration, 0)} hora(s) — máximo {maxLoanHours} horas.
        </p>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Agendando...' : 'Agendar reserva'}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">{success}</p> : null}
      </form>
    </div>
  );
}
