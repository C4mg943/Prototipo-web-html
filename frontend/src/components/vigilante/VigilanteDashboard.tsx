import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface ReservaDelDia {
  id: number;
  instalacion: string;
  horaInicio: string;
  horaFin: string;
  usuario: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'INICIADA';
  deportiva: string;
  codigo_verificacion?: string;
}

interface VigilanteDashboardProps {
  reservasDelDia: ReservaDelDia[];
  loading?: boolean;
  onIniciar?: (reserva: ReservaDelDia) => void;
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADA: 'bg-green-100 text-green-800',
    CANCELADA: 'bg-red-100 text-red-800',
    INICIADA: 'bg-blue-100 text-blue-800',
  };

  const labels = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    INICIADA: 'Iniciada',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[estado as keyof typeof styles] ?? 'bg-gray-100 text-gray-800'
      }`}
    >
      {labels[estado as keyof typeof labels] ?? estado}
    </span>
  );
}

export function VigilanteDashboard({
  reservasDelDia = [],
  loading = false,
  onIniciar,
}: VigilanteDashboardProps) {
  const [selectedReserva, setSelectedReserva] = useState<ReservaDelDia | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [initiating, setInitiating] = useState(false);

  const reservasPorInstalacion = useMemo(() => {
    const agrupadas = new Map<string, ReservaDelDia[]>();

    for (const reserva of reservasDelDia) {
      const existentes = agrupadas.get(reserva.instalacion) ?? [];
      existentes.push(reserva);
      agrupadas.set(reserva.instalacion, existentes);
    }

    return agrupadas;
  }, [reservasDelDia]);

  const totalReservas = reservasDelDia.length;
  const pendientes = reservasDelDia.filter((r) => r.estado === 'PENDIENTE').length;
  const confirmadas = reservasDelDia.filter((r) => r.estado === 'CONFIRMADA').length;
  const iniciadas = reservasDelDia.filter((r) => r.estado === 'INICIADA').length;

  const handleIniciarClick = (reserva: ReservaDelDia) => {
    setSelectedReserva(reserva);
    setShowModal(true);
    setCodigoInput('');
    setErrorMsg('');
  };

  const handleConfirmIniciar = async () => {
    if (!selectedReserva) return;
    setInitiating(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

      const res = await fetch(`${API_URL}/api/vigilante/reservas/${selectedReserva.id}/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ codigo: codigoInput }),
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setSelectedReserva(null);
        if (onIniciar) onIniciar(selectedReserva);
        window.location.reload();
      } else {
        setErrorMsg(data.message || 'Código incorrecto');
      }
    } catch {
      setErrorMsg('Error de conexión');
    } finally {
      setInitiating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">Cargando reservas del día...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard de Vigilancia</h1>
        <p className="text-slate-500">Resumen de reservas para el día de hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-600">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalReservas}</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-700">Pendientes</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-800">{pendientes}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">Confirmadas</p>
          <p className="mt-1 text-2xl font-semibold text-green-800">{confirmadas}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">Iniciadas</p>
          <p className="mt-1 text-2xl font-semibold text-blue-800">{iniciadas}</p>
        </div>
      </div>

      {/* Lista de reservas */}
      {reservasDelDia.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No hay reservas programadas para el día de hoy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(reservasPorInstalacion.entries()).map(([instalacion, reservas]) => (
            <div
              key={instalacion}
              className="rounded-lg border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                <h3 className="font-medium text-slate-900">{instalacion}</h3>
                <p className="text-xs text-slate-500">
                  {reservas.length} reserva(s)
                </p>
              </div>
              <div className="divide-y divide-slate-200">
                {reservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {reserva.horaInicio} - {reserva.horaFin}
                      </p>
                      <p className="text-sm text-slate-500">{reserva.usuario}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EstadoBadge estado={reserva.estado} />
                      {(reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') && (
                        <button
                          type="button"
                          onClick={() => handleIniciarClick(reserva)}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Verificación Código */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Iniciar Reserva</h2>

            <div className="mb-4 rounded bg-slate-50 p-3">
              <p className="text-sm text-slate-600">Reserva #{selectedReserva.id}</p>
              <p className="font-medium">{selectedReserva.instalacion}</p>
              <p className="text-sm text-slate-500">
                {selectedReserva.horaInicio} - {selectedReserva.horaFin}
              </p>
              <p className="text-sm text-slate-500">Usuario: {selectedReserva.usuario}</p>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Código de Verificación</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Ingrese el código de 6 dígitos"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-center text-lg tracking-widest"
              />
              {errorMsg && <p className="mt-1 text-sm text-red-600">{errorMsg}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmIniciar}
                disabled={codigoInput.length !== 6 || initiating}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {initiating ? 'Verificando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}