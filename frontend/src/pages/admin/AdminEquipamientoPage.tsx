import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Equipamiento {
  id: number;
  codigo: string;
  nombre: string;
  cantidad_total: number;
  cantidad_disponible: number;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminEquipamientoPage() {
  const [items, setItems] = useState<Equipamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'cantidad_total', header: 'Total' },
    { key: 'cantidad_disponible', header: 'Disponible' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Equipamiento</h1>
        <p className="text-slate-500">Gestionar equipos deportivos</p>
      </div>
      {error && <div className="bg-red-50 p-4 text-red-600">{error}</div>}
      <DataTable data={items} columns={columns} loading={loading} emptyMessage="No hay equipamiento" />
    </div>
  );
}