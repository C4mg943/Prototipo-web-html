import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface TwoFactorStatus {
  enabled: boolean;
}

interface SetupData {
  secret: string;
  qrCode: string;
}

export function TwoFactorSetupPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/auth/2fa/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSetupData(data.data);
      } else {
        setError(data.message || 'Error al configurar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/auth/2fa/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('2FA habilitado correctamente');
        setSetupData(null);
        setStatus({ enabled: true });
        setVerificationCode('');
      } else {
        setError(data.message || 'Código inválido');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('¿Estás seguro de que quieres deshabilitar la autenticación de dos factores?')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('2FA deshabilitado correctamente');
        setStatus({ enabled: false });
      } else {
        setError(data.message || 'Error al deshabilitar');
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
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/perfil')}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Volver al perfil
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Autenticación de Dos Factores
        </h1>
        <p className="text-slate-500 mb-6">
          Añade una capa extra de seguridad a tu cuenta
        </p>

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

        {!status?.enabled && !setupData && (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Currently disabled. Scan the QR code with Google Authenticator to enable.
            </p>
            <button
              onClick={handleSetup}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Cargando...' : 'Configurar 2FA'}
            </button>
          </div>
        )}

        {setupData && (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Escanea este código QR con tu aplicación Google Authenticator:
            </p>
            <img
              src={setupData.qrCode}
              alt="QR Code"
              className="mx-auto w-48 h-48 mb-4 border rounded-lg"
            />
            <p className="text-slate-500 text-sm mb-4">
              O ingresa este código manualmente: <span className="font-mono font-bold">{setupData.secret}</span>
            </p>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="form-help">Ingresa el código de 6 dígitos de Google Authenticator</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving || verificationCode.length !== 6}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Verificando...' : 'Activar'}
                </button>
                <button
                  type="button"
                  onClick={() => setSetupData(null)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {status?.enabled && !setupData && (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">2FA está habilitado</p>
              <p className="text-green-600 text-sm mt-1">
                Tu cuenta está protegida con autenticación de dos factores
              </p>
            </div>
            <button
              onClick={handleDisable}
              disabled={saving}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              {saving ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}