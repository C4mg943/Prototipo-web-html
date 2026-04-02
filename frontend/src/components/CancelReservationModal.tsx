import { useState } from 'react';
import type { ReservaDto } from '../types/domain';

interface CancelReservationModalProps {
  reserva: ReservaDto | null;
  isSubmitting: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelReservationModal({ reserva, isSubmitting, onConfirm, onClose }: CancelReservationModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!reserva) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reason.trim()) {
      setError('La razón de cancelación es obligatoria.');
      return;
    }

    setError('');
    await onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Cancelar reserva</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <p className="text-sm text-slate-700">
            Estás cancelando <strong>{reserva.instalacion.nombre}</strong>.
          </p>

          <div className="field-group">
            <label htmlFor="cancelReason">Razón de cancelación</label>
            <textarea
              id="cancelReason"
              className="form-control"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Escribe una razón breve..."
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Volver
            </button>
            <button type="submit" className="btn-danger" disabled={isSubmitting}>
              {isSubmitting ? 'Cancelando...' : 'Confirmar cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
