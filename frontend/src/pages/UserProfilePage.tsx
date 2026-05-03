import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  id_rol: number;
  codigo_institucional: string;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  telefono: string | null;
  foto_perfil_url: string | null;
  esta_activo: boolean;
}

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const rolNames: Record<number, string> = {
  1: 'Estudiante',
  2: 'Vigilante',
  3: 'Administrador',
};

export function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nombre_usuario: '',
    apellido_usuario: '',
    telefono: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setForm({
          nombre_usuario: data.data.nombre_usuario || '',
          apellido_usuario: data.data.apellido_usuario || '',
          telefono: data.data.telefono || '',
        });
      } else {
        setError(data.message || 'Error al cargar perfil');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Perfil actualizado correctamente');
        setProfile(data.data);
      } else {
        setError(data.message || 'Error al actualizar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mi Perfil</h1>
        <p className="text-slate-500 mb-6">Administra tu información personal</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Info estática */}
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-500">Correo</span>
            <span className="text-sm text-slate-900 font-medium">{profile?.correo_electronico}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-500">Código</span>
            <span className="text-sm text-slate-900 font-medium">{profile?.codigo_institucional}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-500">Rol</span>
            <span className="text-sm text-slate-900 font-medium">{rolNames[profile?.id_rol || 0]}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-500">Estado</span>
            <span className={`text-sm font-medium ${profile?.esta_activo ? 'text-green-600' : 'text-red-600'}`}>
              {profile?.esta_activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Formulario editable */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombres
            </label>
            <input
              type="text"
              value={form.nombre_usuario}
              onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Apellidos
            </label>
            <input
              type="text"
              value={form.apellido_usuario}
              onChange={(e) => setForm({ ...form, apellido_usuario: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Número de teléfono"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
