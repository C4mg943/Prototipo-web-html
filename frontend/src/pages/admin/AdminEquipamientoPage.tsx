import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Equipamiento {
  id: number;
  codigo: string;
  nombre: string;
  cantidad_total: number;
  cantidad_disponible: number;
  esta_activo: boolean;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminEquipamientoPage() {
  const [items, setItems] = useState<Equipamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Equipamiento | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/equipamiento`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      codigo: formData.get('codigo'),
      nombre: formData.get('nombre'),
      cantidad_total: Number(formData.get('cantidad_total')),
      cantidad_disponible: Number(formData.get('cantidad_disponible')),
    };

    try {
      const method = editItem ? 'PATCH' : 'POST';
      const url = editItem
        ? `${API_URL}/api/admin/equipamiento/${editItem.id}`
        : `${API_URL}/api/admin/equipamiento`;
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
        fetchItems();
      } else {
        setError(data.message ?? 'No se pudo guardar');
      }
    } catch {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este elemento de equipamiento?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/equipamiento/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        setError(data.message ?? 'No se pudo eliminar');
      }
    } catch {
      setError('Error al eliminar');
    }
  };

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'cantidad_total', header: 'Total' },
    { key: 'cantidad_disponible', header: 'Disponible' },
    {
      key: 'esta_activo',
      header: 'Estado',
      render: (row: Equipamiento) => (
        <span className={row.esta_activo ? 'text-green-600' : 'text-red-600'}>
          {row.esta_activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Equipamiento) => (
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
          <h1 className="text-2xl font-bold">Equipamiento</h1>
          <p className="text-slate-500">Gestionar equipos deportivos</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nuevo Equipo
        </button>
      </div>
      {error && <div className="bg-red-50 p-4 text-red-600">{error}</div>}
      <DataTable data={items} columns={columns} loading={loading} emptyMessage="No hay equipamiento" />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editItem ? 'Editar Equipamiento' : 'Nuevo Equipamiento'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Código</label>
                <input
                  name="codigo"
                  defaultValue={editItem?.codigo ?? ''}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <input
                  name="nombre"
                  defaultValue={editItem?.nombre ?? ''}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cantidad total</label>
                <input
                  name="cantidad_total"
                  type="number"
                  min="0"
                  defaultValue={editItem?.cantidad_total ?? 0}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cantidad disponible</label>
                <input
                  name="cantidad_disponible"
                  type="number"
                  min="0"
                  defaultValue={editItem?.cantidad_disponible ?? 0}
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
