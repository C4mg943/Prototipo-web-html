import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Bloqueo {
  id: number;
  id_instalacion: number;
  razon: string;
  inicia_en: string;
  termina_en: string;
  esta_activo: boolean;
  nombre_instalacion?: string;
}

interface InstalacionOption {
  id: number;
  nombre: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminBloqueosPage() {
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [instalaciones, setInstalaciones] = useState<InstalacionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Bloqueo | null>(null);

  useEffect(() => { fetchBloqueos(); fetchInstalaciones(); }, []);

  const fetchBloqueos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/bloqueos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await res.json();
      if (data.success) setBloqueos(data.data);
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  };

  const fetchInstalaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/instalaciones`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setInstalaciones(data.data.map((item: { id: number; nombre: string }) => ({
          id: item.id,
          nombre: item.nombre,
        })));
      }
    } catch {
      setError('Error al cargar instalaciones');
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      id_instalacion: Number(formData.get('id_instalacion')),
      razon: formData.get('razon'),
      inicia_en: formData.get('inicia_en'),
      termina_en: formData.get('termina_en'),
    };

    try {
      const method = editItem ? 'PATCH' : 'POST';
      const url = editItem
        ? `${API_URL}/api/admin/bloqueos/${editItem.id}`
        : `${API_URL}/api/admin/bloqueos`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditItem(null);
        fetchBloqueos();
      } else {
        setError(data.message ?? 'No se pudo guardar');
      }
    } catch {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este bloqueo?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/bloqueos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchBloqueos();
      } else {
        setError(data.message ?? 'No se pudo eliminar');
      }
    } catch {
      setError('Error al eliminar');
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'id_instalacion',
      header: 'Instalación',
      render: (row: Bloqueo) => row.nombre_instalacion ?? row.id_instalacion,
    },
    { key: 'razon', header: 'Razón' },
    { key: 'inicia_en', header: 'Inicio', render: (r: Bloqueo) => new Date(r.inicia_en).toLocaleString() },
    { key: 'termina_en', header: 'Fin', render: (r: Bloqueo) => new Date(r.termina_en).toLocaleString() },
    {
      key: 'esta_activo',
      header: 'Estado',
      render: (row: Bloqueo) => (
        <span className={row.esta_activo ? 'text-green-600' : 'text-red-600'}>
          {row.esta_activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Bloqueo) => (
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
          <h1 className="text-2xl font-bold">Bloqueos</h1>
          <p className="text-slate-500">Gestionar bloqueos de instalaciones</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nuevo Bloqueo
        </button>
      </div>
      {error && <div className="bg-red-50 p-4 text-red-600">{error}</div>}
      <DataTable data={bloqueos} columns={columns} loading={loading} emptyMessage="No hay bloqueos" />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editItem ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Instalación</label>
                <select
                  name="id_instalacion"
                  defaultValue={editItem?.id_instalacion ?? ''}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                >
                  <option value="" disabled>Selecciona una instalación</option>
                  {instalaciones.map((instalacion) => (
                    <option key={instalacion.id} value={instalacion.id}>
                      {instalacion.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Razón</label>
                <input
                  name="razon"
                  defaultValue={editItem?.razon ?? ''}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Inicio</label>
                <input
                  name="inicia_en"
                  type="datetime-local"
                  defaultValue={editItem?.inicia_en ? new Date(editItem.inicia_en).toISOString().slice(0, 16) : ''}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Fin</label>
                <input
                  name="termina_en"
                  type="datetime-local"
                  defaultValue={editItem?.termina_en ? new Date(editItem.termina_en).toISOString().slice(0, 16) : ''}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditItem(null); }}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
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
