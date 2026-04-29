import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Franca {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  orden_clasificacion: number;
  esta_activo: boolean;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminFranjasPage() {
  const [franjas, setFranjas] = useState<Franja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Franja | null>(null);

  useEffect(() => {
    fetchFranjas();
  }, []);

  const fetchFranjas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/franjas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFranjas(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      hora_inicio: formData.get('hora_inicio'),
      hora_fin: formData.get('hora_fin'),
      orden_clasificacion: parseInt(formData.get('orden_clasificacion') as string),
    };

    try {
      const token = localStorage.getItem('auth_token');
      const method = editItem ? 'PATCH' : 'POST';
      const url = editItem
        ? `${API_URL}/api/admin/franjas/${editItem.id}`
        : `${API_URL}/api/admin/franjas`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditItem(null);
        fetchFranjas();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta franca horaria?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/franjas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchFranjas();
      }
    } catch {
      setError('Error al eliminar');
    }
  };

  const columns = [
    { key: 'orden_clasificacion', header: '#' },
    {
      key: 'hora_inicio',
      header: 'Inicio',
      render: (row: Franca) => row.hora_inicio?.substring(0, 5),
    },
    {
      key: 'hora_fin',
      header: 'Fin',
      render: (row: Franca) => row.hora_fin?.substring(0, 5),
    },
    {
      key: 'esta_activo',
      header: 'Estado',
      render: (row: Franca) => (
        <span className={row.esta_activo ? 'text-green-600' : 'text-red-600'}>
          {row.esta_activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (row: Franca) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setEditItem(row); setShowModal(true); }}
            className="text-blue-600 hover:underline text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:underline text-sm"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Franjas Horarias</h1>
          <p className="text-slate-500">Administrar horarios de disponibilidad</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nueva Franja
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <DataTable
        data={franjas}
        columns={columns}
        loading={loading}
        emptyMessage="No hay franjas horarias"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editItem ? 'Editar Franca' : 'Nueva Franca'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hora Inicio</label>
                <input
                  name="hora_inicio"
                  type="time"
                  defaultValue={editItem?.hora_inicio?.substring(0, 5)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora Fin</label>
                <input
                  name="hora_fin"
                  type="time"
                  defaultValue={editItem?.hora_fin?.substring(0, 5)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Orden</label>
                <input
                  name="orden_clasificacion"
                  type="number"
                  defaultValue={editItem?.orden_clasificacion || franjas.length + 1}
                  required
                  min="1"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditItem(null); }}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}