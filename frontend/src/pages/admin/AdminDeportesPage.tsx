import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Deport {
  id: number;
  codigo: string;
  nombre: string;
  etiqueta_campo: string;
  esta_activo: boolean;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminDeportesPage() {
  const [deportes, setDeportes] = useState<Deport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Deport | null>(null);

  useEffect(() => { fetchDeportes(); }, []);

  const fetchDeportes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/deportes`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } 
      });
      const data = await res.json();
      if (data.success) setDeportes(data.data);
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = { 
      codigo: (form.elements.namedItem('codigo') as HTMLInputElement).value, 
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value, 
      etiqueta_campo: (form.elements.namedItem('etiqueta_campo') as HTMLInputElement).value 
    };
    try {
      const method = editItem ? 'PATCH' : 'POST';
      const url = editItem ? `${API_URL}/api/admin/deportes/${editItem.id}` : `${API_URL}/api/admin/deportes`;
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (data.success) { setShowModal(false); setEditItem(null); fetchDeportes(); }
    } catch { setError('Error al guardar'); }
  };

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'etiqueta_campo', header: 'Etiqueta' },
    { key: 'esta_activo', header: 'Estado', render: (r: Deport) => <span className={r.esta_activo ? 'text-green-600' : 'text-red-600'}>{r.esta_activo ? 'Activo' : 'Inactivo'}</span> },
    { key: 'id', header: 'Acciones', render: (r: Deport) => <button type="button" onClick={() => { setEditItem(r); setShowModal(true); }} className="text-blue-600 hover:underline text-sm">Editar</button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Deportes</h1><p className="text-slate-500">Gestionar deportes</p></div>
        <button type="button" onClick={() => { setEditItem(null); setShowModal(true); }} className="bg-blue-600 px-4 py-2 text-white rounded-lg hover:bg-blue-700">+ Nuevo</button>
      </div>
      {error && <div className="bg-red-50 p-4 text-red-600 rounded-lg">{error}</div>}
      <DataTable data={deportes} columns={columns} loading={loading} emptyMessage="No hay deportes" />
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editItem ? 'Editar' : 'Nuevo'} Deporte</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Código</label><input name="codigo" defaultValue={editItem?.codigo} required className="w-full border rounded px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Nombre</label><input name="nombre" defaultValue={editItem?.nombre} required className="w-full border rounded px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Etiqueta</label><input name="etiqueta_campo" defaultValue={editItem?.etiqueta_campo} required className="w-full border rounded px-3 py-2" /></div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}