import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Bloqueo {
  id: number;
  id_instalacion: number;
  razon: string;
  inicia_en: string;
  termina_en: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminBloqueosPage() {
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchBloqueos(); }, []);

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

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'id_instalacion', header: 'Instalación' },
    { key: 'razon', header: 'Razón' },
    { key: 'inicia_en', header: 'Inicio', render: (r: Bloqueo) => new Date(r.inicia_en).toLocaleString() },
    { key: 'termina_en', header: 'Fin', render: (r: Bloqueo) => new Date(r.termina_en).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Bloqueos</h1>
        <p className="text-slate-500">Gestionar bloqueos de instalaciones</p>
      </div>
      {error && <div className="bg-red-50 p-4 text-red-600">{error}</div>}
      <DataTable data={bloqueos} columns={columns} loading={loading} emptyMessage="No hay bloqueos" />
    </div>
  );
}