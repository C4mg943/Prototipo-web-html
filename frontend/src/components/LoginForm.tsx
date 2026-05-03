import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginFormData {
  correo: string;
  contrasena: string;
}

interface NavigationState {
  from?: string;
}

const institutionalDomain = '@unimagdalena.edu.co';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    correo: '',
    contrasena: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const correoError = useMemo(() => {
    if (!submitted && !formData.correo) {
      return '';
    }

    if (!formData.correo.endsWith(institutionalDomain)) {
      return `El correo debe terminar en ${institutionalDomain}`;
    }

    return '';
  }, [formData.correo, submitted]);

  const contrasenaError = useMemo(() => {
    if (!submitted && !formData.contrasena) {
      return '';
    }

    if (formData.contrasena.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    return '';
  }, [formData.contrasena, submitted]);

  const canSubmit = !correoError && !contrasenaError && formData.correo && formData.contrasena;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');

    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);

      // Obtener el usuario del localStorage para saber el rol
      const userData = localStorage.getItem('auth_user');
      const user = userData ? (JSON.parse(userData) as { idRol?: number | string } | null) : null;
      const roleId = typeof user?.idRol === 'string' ? Number(user.idRol) : user?.idRol;
      
      // Redirigir según elrol
      let nextPath = '/mis-reservas'; // default para estudiante
      if (roleId) {
        if (roleId === 3) {
          nextPath = '/admin';
        } else if (roleId === 2) {
          nextPath = '/vigilante';
        }
      } else if ((location.state as NavigationState | null)?.from) {
        nextPath = (location.state as NavigationState | null)?.from ?? '/mis-reservas';
      }
      
      navigate(nextPath, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2 className="card-title">Bienvenido</h2>
      <p className="card-subtitle">Ingresa tus credenciales para acceder</p>

      <div className="form-group">
        <label htmlFor="correo" className="form-label">
          Correo institucional
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={(event) => setFormData((prev) => ({ ...prev, correo: event.target.value.trim() }))}
          placeholder={`usuario${institutionalDomain}`}
          className="form-input"
          required
        />
        {correoError ? <p className="form-error">{correoError}</p> : null}
      </div>

      <div className="form-group">
        <label htmlFor="contrasena" className="form-label">
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          value={formData.contrasena}
          onChange={(event) => setFormData((prev) => ({ ...prev, contrasena: event.target.value }))}
          placeholder="••••••••"
          className="form-input"
          required
        />
        {contrasenaError ? <p className="form-error">{contrasenaError}</p> : null}
      </div>

      <button type="submit" className="auth-submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="auth-link auth-note">Tu cuenta institucional ya debe estar habilitada por administración.</p>

      {serverError ? <p className="form-error">{serverError}</p> : null}
    </form>
  );
}
