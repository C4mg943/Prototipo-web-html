import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Escenario {
  id: number;
  codigo: string;
  nombre: string;
  descripcion_ubicacion: string | null;
  esta_activo: boolean;
  id_tipo_superficie: number;
  nombre_superficie: string;
}

interface TipoSuperficie {
  id: number;
  codigo: string;
  nombre: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminEscenariosPage() {
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [tiposSuperficie, setTiposSuperficie] = useState<TipoSuperficie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Escenario | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const [escRes, superRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/escenarios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/tipos-superficie`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [escData, superData] = await Promise.all([escRes.json(), superRes.json()]);
      if (escData.success) setEscenarios(escData.data);
      if (superData.success) setTiposSuperficie(superData.data);
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
      codigo: formData.get('codigo'),
      nombre: formData.get('nombre'),
      id_tipo_superficie: parseInt(formData.get('id_tipo_superficie') as string),
      descripcion_ubicacion: formData.get('descripcion_ubicacion') || null,
    };

    try {
      const token = localStorage.getItem('auth_token');
      const method = editItem ? 'PATCH' : 'POST';
      const url = editItem
        ? `${API_URL}/api/admin/escenarios/${editItem.id}`
        : `${API_URL}/api/admin/escenarios`;

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
        fetchData();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este escenario?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/escenarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch {
      setError('Error al eliminar');
    }
  };

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'nombre_superficie', header: 'Superficie' },
    { key: 'descripcion_ubicacion', header: 'Ubicación' },
    {
      key: 'esta_activo',
      header: 'Estado',
      render: (row: Escenario) => (
        <span className={row.esta_activo ? 'text-green-600' : 'text-red-600'}>
          {row.esta_activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (row: Escenario) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Escenarios</h1>
          <p className="text-slate-500">Administrar escenarios deportivos</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nuevo Escenario
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <DataTable
        data={escenarios}
        columns={columns}
        loading={loading}
        emptyMessage="No hay escenarios"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editItem ? 'Editar Escenario' : 'Nuevo Escenario'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  name="codigo"
                  defaultValue={editItem?.codigo}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  name="nombre"
                  defaultValue={editItem?.nombre}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Superficie</label>
                <select
                  name="id_tipo_superficie"
                  defaultValue={editItem?.id_tipo_superficie || ''}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar superficie...</option>
                  {tiposSuperficie.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  name="descripcion_ubicacion"
                  defaultValue={editItem?.descripcion_ubicacion || ''}
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