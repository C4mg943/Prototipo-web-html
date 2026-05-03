import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Reserva {
  id: number;
  fecha_reserva: string;
  comienza_en: string;
  termina_en: string;
  duracion_horas: number;
  id_estado: number;
  estado_codigo: string;
  estado_nombre: string;
  notas: string | null;
  equipo_solicitado: boolean;
  razon_cancelacion: string | null;
  creado_en: string;
  id_instalacion: number;
  nombre_instalacion: string;
  codigo_instalacion: string;
  id_usuario: number;
  codigo_institucional: string;
  nombre_usuario: string;
  apellido_usuario: string;
  nombre_deporte: string;
  hora_inicio: string;
  hora_fin: string;
}

interface EstadoReserva {
  id: number;
  codigo: string;
  nombre: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [estados, setEstados] = useState<EstadoReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [newEstado, setNewEstado] = useState<number>(0);
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const [reservasRes, estadosRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/reservas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/estados-reserva`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [reservasData, estadosData] = await Promise.all([reservasRes.json(), estadosRes.json()]);
      if (reservasData.success) setReservas(reservasData.data);
      if (estadosData.success) setEstados(estadosData.data);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const openChangeStatus = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setNewEstado(reserva.id_estado);
    setCancelReason(reserva.razon_cancelacion || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReserva) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const body: { id_estado: number; razon_cancelacion?: string } = { id_estado: newEstado };
      
      if (newEstado === 3 && cancelReason) {
        body.razon_cancelacion = cancelReason;
      }

      const res = await fetch(`${API_URL}/api/admin/reservas/${selectedReserva.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setSelectedReserva(null);
        fetchData();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const getEstadoColor = (codigo: string) => {
    switch (codigo) {
      case 'PENDIENTE': return 'text-yellow-600 bg-yellow-50';
      case 'CONFIRMADA': return 'text-green-600 bg-green-50';
      case 'CANCELADA': return 'text-red-600 bg-red-50';
      case 'COMPLETADA': return 'text-blue-600 bg-blue-50';
      case 'NO_PRESENTO': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'fecha_reserva', 
      header: 'Fecha',
      render: (row: Reserva) => {
        const date = new Date(row.fecha_reserva);
        return date.toLocaleDateString('es-CO');
      }
    },
    {
      key: 'hora_inicio',
      header: 'Horario',
      render: (row: Reserva) => `${row.hora_inicio?.substring(0, 5)} - ${row.hora_fin?.substring(0, 5)}`
    },
    { key: 'nombre_instalacion', header: 'Instalación' },
    { key: 'nombre_deporte', header: 'Deporte' },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (row: Reserva) => `${row.nombre_usuario} ${row.apellido_usuario}`
    },
    {
      key: 'id_estado',
      header: 'Estado',
      render: (row: Reserva) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(row.estado_codigo)}`}>
          {row.estado_nombre}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Reserva) => (
        <button
          type="button"
          onClick={() => openChangeStatus(row)}
          className="text-blue-600 hover:underline text-sm"
        >
          Cambiar Estado
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Reservas</h1>
          <p className="text-slate-500">Administrar reservas del sistema</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <DataTable
        data={reservas}
        columns={columns}
        loading={loading}
        emptyMessage="No hay reservas registradas"
      />

      {/* ModalCambiar Estado */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cambiar Estado de Reserva</h2>
            
            <div className="mb-4 p-3 bg-slate-50 rounded">
              <p className="text-sm text-slate-600">Reserva #{selectedReserva.id}</p>
              <p className="font-medium">{selectedReserva.nombre_instalacion}</p>
              <p className="text-sm text-slate-500">
                {new Date(selectedReserva.fecha_reserva).toLocaleDateString('es-CO')} - {selectedReserva.hora_inicio?.substring(0,5)} a {selectedReserva.hora_fin?.substring(0,5)}
              </p>
              <p className="text-sm text-slate-500">
                Usuario: {selectedReserva.nombre_usuario} {selectedReserva.apellido_usuario}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nuevo Estado</label>
              <select
                value={newEstado}
                onChange={(e) => setNewEstado(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                {estados.map((est) => (
                  <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </select>
            </div>

            {newEstado === 3 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Razón de Cancelación</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Motivo de la cancelación..."
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowModal(false); setSelectedReserva(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
