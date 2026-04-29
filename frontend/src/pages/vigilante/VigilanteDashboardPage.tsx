import { useEffect, useState } from 'react';

interface ReservaItem {
  id: number;
  fecha_reserva: string;
  nombre_instalacion: string;
  comienza_en: string;
  termina_en: string;
  nombre_usuario: string;
  apellido_usuario: string;
  estado_codigo: string;
  estado_nombre: string;
  codigo_verificacion: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

function getDateOnly(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const datePart = getDateOnly(dateStr);
  const today = new Date().toISOString().split('T')[0];
  return datePart === today;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const datePart = getDateOnly(dateStr);
    const today = getDateOnly(new Date().toISOString());
    if (datePart === today) return 'Hoy';
    const tomorrow = getDateOnly(new Date(Date.now() + 86400000).toISOString());
    if (datePart === tomorrow) return 'Mañana';
    return date.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr || '-';
  }
}

function formatTime(isoStr: string | null): string {
  if (!isoStr) return '-';
  try {
    const time = isoStr.replace('Z', '');
    const [hours, minutes] = time.split('T')[1]?.split(':') || [];
    if (hours && minutes) {
      return `${hours}:${minutes}`;
    }
    return new Date(isoStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
}

export function VigilanteDashboardPage() {
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<ReservaItem | null>(null);
  const [codigoInput, setCodigoInput] = useState('');
  const [codigoError, setCodigoError] = useState('');
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/vigilante/todas-reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReservas(data.data);
      } else {
        setError(data.message || 'Error al cargar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const abrirIniciar = (reserva: ReservaItem) => {
    setSelectedReserva(reserva);
    setShowModal(true);
    setCodigoInput('');
    setCodigoError('');
  };

  const handleIniciar = async () => {
    if (!selectedReserva) return;
    setIniciando(true);
    setCodigoError('');

    try {
      const token = localStorage.getItem('auth_token');
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
        fetchReservas();
      } else {
        setCodigoError(data.message || 'Código incorrecto');
      }
    } catch {
      setCodigoError('Error de conexión');
    } finally {
      setIniciando(false);
    }
  };

  const reservasHoy = reservas.filter(r => isToday(r.fecha_reserva));
  const reservasSemana = reservas.filter(r => !isToday(r.fecha_reserva));

  const getBadgeColor = (codigo: string) => {
    switch (codigo) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADA': return 'bg-green-100 text-green-800';
      case 'INICIADA': return 'bg-blue-100 text-blue-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Vigilancia</h1>
        <p className="text-slate-500">Gestión de reservas</p>
      </div>

      {error && <div className="rounded bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Hoy */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-700">Hoy ({reservasHoy.length})</h2>
        {reservasHoy.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            No hay reservas para hoy
          </div>
        ) : (
          <div className="space-y-3">
            {reservasHoy.map(reserva => (
              <div key={reserva.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{reserva.nombre_instalacion}</p>
                    <p className="text-sm text-slate-500">
                      {formatTime(reserva.comienza_en)} - {formatTime(reserva.termina_en)}
                    </p>
                    <p className="text-sm text-slate-500">{reserva.nombre_usuario} {reserva.apellido_usuario}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeColor(reserva.estado_codigo)}`}>
                      {reserva.estado_nombre}
                    </span>
                    {(reserva.estado_codigo === 'PENDIENTE' || reserva.estado_codigo === 'CONFIRMADA') && (
                      <button
                        onClick={() => abrirIniciar(reserva)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos días */}
      {reservasSemana.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-700">Próximos días ({reservasSemana.length})</h2>
          <div className="space-y-3">
            {reservasSemana.map(reserva => (
              <div key={reserva.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{reserva.nombre_instalacion}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(reserva.fecha_reserva)} - {formatTime(reserva.comienza_en)} - {formatTime(reserva.termina_en)}
                    </p>
                    <p className="text-sm text-slate-500">{reserva.nombre_usuario} {reserva.apellido_usuario}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeColor(reserva.estado_codigo)}`}>
                    {reserva.estado_nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Iniciar Reserva</h2>
            <div className="mb-4 rounded bg-slate-50 p-3">
              <p className="font-medium">{selectedReserva.nombre_instalacion}</p>
              <p className="text-sm text-slate-500">
                {formatTime(selectedReserva.comienza_en)} - {formatTime(selectedReserva.termina_en)}
              </p>
              <p className="text-sm text-slate-500">
                Usuario: {selectedReserva.nombre_usuario} {selectedReserva.apellido_usuario}
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Código de verificación</label>
              <input
                type="text"
                maxLength={6}
                value={codigoInput}
                onChange={e => setCodigoInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Ingrese código de 6 dígitos"
                className="w-full rounded border border-slate-300 px-3 py-2 text-center text-lg tracking-widest"
              />
              {codigoError && <p className="mt-1 text-sm text-red-600">{codigoError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleIniciar}
                disabled={codigoInput.length !== 6 || iniciando}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {iniciando ? 'Verificando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}