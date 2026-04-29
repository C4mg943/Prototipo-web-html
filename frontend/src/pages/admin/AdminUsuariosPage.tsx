import { useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/DataTable';

interface Usuario {
  id: number;
  id_rol: number;
  codigo_institucional: string;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  telefono: string | null;
  esta_activo: boolean;
}

interface UsuarioForm {
  codigo_institucional: string;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  contrasena: string;
  id_rol: number;
  telefono: string;
}

const initialForm: UsuarioForm = {
  codigo_institucional: '',
  nombre_usuario: '',
  apellido_usuario: '',
  correo_electronico: '',
  contrasena: '',
  id_rol: 1,
  telefono: '',
};

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UsuarioForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Filter out inactive users
        const activeUsers = data.data.filter((u: Usuario) => u.esta_activo === true);
        setUsuarios(activeUsers);
      } else {
        setError(data.message || 'Error al cargar usuarios');
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingUser
        ? `${API_URL}/api/admin/usuarios/${editingUser.id}`
        : `${API_URL}/api/admin/usuarios`;
      const method = editingUser ? 'PATCH' : 'POST';

      const body = editingUser
        ? {
            nombre_usuario: form.nombre_usuario,
            apellido_usuario: form.apellido_usuario,
            correo_electronico: form.correo_electronico,
            telefono: form.telefono || null,
            id_rol: form.id_rol,
          }
        : form;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingUser(null);
        setForm(initialForm);
        fetchUsuarios();
      } else {
        setError(data.message || 'Error al guardar');
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setForm({
      codigo_institucional: user.codigo_institucional,
      nombre_usuario: user.nombre_usuario,
      apellido_usuario: user.apellido_usuario,
      correo_electronico: user.correo_electronico,
      contrasena: '',
      id_rol: user.id_rol,
      telefono: user.telefono || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsuarios();
      } else {
        setError(data.message || 'Error al eliminar');
      }
    } catch (e) {
      setError('Error de conexión');
    }
    setDeleteConfirm(null);
  };

  const columns = [
    { key: 'codigo_institucional', header: 'Código' },
    { key: 'nombre_usuario', header: 'Nombres' },
    { key: 'apellido_usuario', header: 'Apellidos' },
    { key: 'correo_electronico', header: 'Email' },
    {
      key: 'id_rol',
      header: 'Rol',
      render: (row: Usuario) => {
        const roles = { 1: 'Estudiante', 2: 'Vigilante', 3: 'Admin' };
        return roles[row.id_rol as keyof typeof roles] || row.id_rol;
      },
    },
    {
      key: 'esta_activo',
      header: 'Estado',
      render: (row: Usuario) => (
        <span className={row.esta_activo ? 'text-green-600' : 'text-red-600'}>
          {row.esta_activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Usuario) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200"
          >
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.id); }}
            className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
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
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500">Administrar usuarios del sistema</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => { setEditingUser(null); setForm(initialForm); setShowModal(true); }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}

      <DataTable
        data={usuarios}
        columns={columns}
        loading={loading}
        emptyMessage="No hay usuarios registrados"
      />

      {/* Modal Crear/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Código Institucional</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                      value={form.codigo_institucional}
                      onChange={(e) => setForm({ ...form, codigo_institucional: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input
                      type="password"
                      required
                      className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                      value={form.contrasena}
                      onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombres</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  value={form.nombre_usuario}
                  onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Apellidos</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  value={form.apellido_usuario}
                  onChange={(e) => setForm({ ...form, apellido_usuario: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  value={form.correo_electronico}
                  onChange={(e) => setForm({ ...form, correo_electronico: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Rol</label>
                <select
                  required
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  value={form.id_rol}
                  onChange={(e) => setForm({ ...form, id_rol: Number(e.target.value) })}
                >
                  <option value={1}>Estudiante</option>
                  <option value={2}>Vigilante</option>
                  <option value={3}>Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="rounded px-4 py-2 text-slate-700 hover:bg-slate-100"
                  onClick={() => { setShowModal(false); setEditingUser(null); }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Confirmar eliminación</h3>
            <p className="mb-4 text-slate-600">¿Estás seguro de eliminar este usuario?</p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded px-4 py-2 text-slate-700 hover:bg-slate-100"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}