import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormData {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  confirmarContrasena: string;
}

const institutionalDomain = '@unimagdalena.edu.co';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
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

    if (formData.contrasena.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    return '';
  }, [formData.contrasena, submitted]);

  const confirmarError = useMemo(() => {
    if (!submitted && !formData.confirmarContrasena) {
      return '';
    }

    if (formData.confirmarContrasena !== formData.contrasena) {
      return 'Las contraseñas no coinciden.';
    }

    return '';
  }, [formData.confirmarContrasena, formData.contrasena, submitted]);

  const canSubmit =
    formData.nombres &&
    formData.apellidos &&
    formData.correo &&
    formData.contrasena &&
    formData.confirmarContrasena &&
    !correoError &&
    !contrasenaError &&
    !confirmarError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');

    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        contrasena: formData.contrasena,
      });
      navigate('/mis-reservas', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2 className="card-title">Crear cuenta</h2>
      <p className="card-subtitle">Regístrate con tu correo institucional</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nombres" className="form-label">
            Nombres
          </label>
          <input
            id="nombres"
            name="nombres"
            type="text"
            value={formData.nombres}
            onChange={(event) => setFormData((prev) => ({ ...prev, nombres: event.target.value }))}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apellidos" className="form-label">
            Apellidos
          </label>
          <input
            id="apellidos"
            name="apellidos"
            type="text"
            value={formData.apellidos}
            onChange={(event) => setFormData((prev) => ({ ...prev, apellidos: event.target.value }))}
            className="form-input"
            required
          />
        </div>
      </div>

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

      <div className="form-row">
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
            className="form-input"
            required
          />
          {contrasenaError ? <p className="form-error">{contrasenaError}</p> : null}
        </div>

        <div className="form-group">
          <label htmlFor="confirmarContrasena" className="form-label">
            Confirmar contraseña
          </label>
          <input
            id="confirmarContrasena"
            name="confirmarContrasena"
            type="password"
            value={formData.confirmarContrasena}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, confirmarContrasena: event.target.value }))
            }
            className="form-input"
            required
          />
          {confirmarError ? <p className="form-error">{confirmarError}</p> : null}
        </div>
      </div>

      <button type="submit" className="auth-submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="auth-link">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>

      {serverError ? <p className="form-error">{serverError}</p> : null}
    </form>
  );
}
