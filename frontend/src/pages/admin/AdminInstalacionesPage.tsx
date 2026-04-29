import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Instalacion {
  id: number;
  codigo: string;
  nombre: string;
  capacidad: number | null;
  esta_activo: boolean;
  id_escenario: number;
  nombre_escenario: string;
  id_deporte: number;
  nombre_deporte: string;
}

interface Escenario {
  id: number;
  codigo: string;
  nombre: string;
}

interface Deporte {
  id: number;
  codigo: string;
  nombre: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminInstalacionesPage() {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Instalacion | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const [instRes, escRes, depRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/instalaciones`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/escenarios/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/deportes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [instData, escData, depData] = await Promise.all([
        instRes.json(),
        escRes.json(),
        depRes.json(),
      ]);
      if (instData.success) setInstalaciones(instData.data);
      if (escData.success) setEscenarios(escData.data);
      if (depData.success) setDeportes(depData.data);
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
      id_escenario: parseInt(formData.get('id_escenario') as string),
      id_deporte: parseInt(formData.get('id_deporte') as string),
      capacidad: parseInt(formData.get('capacidad') as string) || null,
    };

    try {
      const token = localStorage.getItem('auth_token');
      const method = editItem ? 'PATCH' : 'POST';
      const url = editItem
        ? `${API_URL}/api/admin/instalaciones/${editItem.id}`
        : `${API_URL}/api/admin/instalaciones`;

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
    if (!confirm('¿Estás seguro de eliminar esta instalación?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/instalaciones/${id}`, {
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
    { key: 'nombre_escenario', header: 'Escenario' },
    { key: 'nombre_deporte', header: 'Deporte' },
    { key: 'capacidad', header: 'Capacidad' },
    {
      key: 'esta_activo',
      header: 'Estado',
      render: (row: Instalacion) => (
        <span className={row.esta_activo ? 'text-green-600' : 'text-red-600'}>
          {row.esta_activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (row: Instalacion) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Instalaciones</h1>
          <p className="text-slate-500">Administrar canchas y establecimientos</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nueva Instalación
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      <DataTable
        data={instalaciones}
        columns={columns}
        loading={loading}
        emptyMessage="No hay instalaciones registradas"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editItem ? 'Editar Instalación' : 'Nueva Instalación'}
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
                <label className="block text-sm font-medium mb-1">Escenario</label>
                <select
                  name="id_escenario"
                  defaultValue={editItem?.id_escenario || ''}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar escenario...</option>
                  {escenarios.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deporte</label>
                <select
                  name="id_deporte"
                  defaultValue={editItem?.id_deporte || ''}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar deporte...</option>
                  {deportes.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacidad</label>
                <input
                  name="capacidad"
                  type="number"
                  defaultValue={editItem?.capacidad || ''}
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