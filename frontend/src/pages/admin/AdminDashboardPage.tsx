import { useEffect, useState } from 'react';
import { AdminDashboard } from '../../components/admin/AdminDashboard';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface Stats {
  usuariosActivos: number;
  reservasPendientes: number;
  instalacionesDisponibles: number;
  reservasHoy: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    usuariosActivos: 0,
    reservasPendientes: 0,
    instalacionesDisponibles: 0,
    reservasHoy: 0,
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  return <AdminDashboard stats={stats} />;
}
