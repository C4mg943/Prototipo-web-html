import { useEffect, useState } from 'react';
import { CancelReservationModal } from '../components/CancelReservationModal';
import { ReservationCard } from '../components/ReservationCard';
import { cancelReserva, listMyReservas } from '../services/reservas';
import type { ReservaDto } from '../types/domain';

export function MyReservationsPage() {
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedReserva, setSelectedReserva] = useState<ReservaDto | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true);
        const response = await listMyReservas();
        setReservas(response);
        setError('');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar tus reservas.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleConfirmCancel = async (reason: string) => {
    if (!selectedReserva) {
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await cancelReserva(selectedReserva.id, { razonCancelacion: reason });
      setReservas((prev) => prev.map((reserva) => (reserva.id === updated.id ? updated : reserva)));
      setSelectedReserva(null);
      setError('');
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'No se pudo cancelar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="reservas-container">
      <header className="page-header">
        <h1 className="page-title">Mis Reservas</h1>
        <p className="page-subtitle">Gestiona tus reservas activas y consulta tu historial.</p>
      </header>

      {isLoading ? <p className="loading-text">Cargando reservas...</p> : null}

      {error ? <p className="error-text">{error}</p> : null}

      {!isLoading && reservas.length === 0 ? (
        <div className="empty-state">Aún no tienes reservas activas. Ve a canchas para agendar una.</div>
      ) : null}

      <div id="reservasGrid" className="reservas-grid">
        {reservas.map((reserva) => (
          <ReservationCard key={reserva.id} reserva={reserva} onCancel={setSelectedReserva} />
        ))}
      </div>

      <CancelReservationModal
        key={selectedReserva?.id ?? 'none'}
        reserva={selectedReserva}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmCancel}
        onClose={() => setSelectedReserva(null)}
      />
    </section>
  );
}
