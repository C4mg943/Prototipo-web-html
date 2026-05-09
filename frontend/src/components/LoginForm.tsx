import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { verify2FA, recoverWith2FA } from '../services/auth';

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
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

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

  const navigateByRole = (roleId: number | undefined) => {
    let nextPath = '/mis-reservas';
    if (roleId === 3) {
      nextPath = '/admin';
    } else if (roleId === 2) {
      nextPath = '/vigilante';
    } else if ((location.state as NavigationState | null)?.from) {
      nextPath = (location.state as NavigationState | null)?.from ?? '/mis-reservas';
    }
    navigate(nextPath, { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');

    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Intentar login normal
      const response = await login(formData);
      
      // Si el backend retorna que requiere 2FA
      if ((response as any)?.data?.requires2FA) {
        setRequires2FA(true);
        setTempToken((response as any).data.tempToken);
        setIsSubmitting(false);
        return;
      }

      // Login normal sin 2FA
      const userData = localStorage.getItem('auth_user');
      const user = userData ? (JSON.parse(userData) as { idRol?: number | string } | null) : null;
      const roleId = typeof user?.idRol === 'string' ? Number(user.idRol) : user?.idRol;
      
      navigateByRole(roleId);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
      
      if (errorMessage.includes('USUARIO_NO_REGISTRADO') || errorMessage.includes('404')) {
        localStorage.setItem('pending_email', formData.correo);
        navigate('/registro', { replace: true });
        return;
      }
      
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (twoFactorCode.length !== 6) {
      setServerError('El código debe tener 6 dígitos.');
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError('');
      
      const response = await verify2FA(tempToken, twoFactorCode);
      
      // Guardar sesión
      const token = (response as any).data.token;
      const usuario = (response as any).data.usuario;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(usuario));
      
      // Redirigir según rol
      const roleId = typeof usuario?.idRol === 'string' ? Number(usuario.idRol) : usuario?.idRol;
      navigateByRole(roleId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Código inválido.';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');
    setRecoverySuccess('');

    if (!recoveryEmail.endsWith(institutionalDomain)) {
      setServerError(`El correo debe terminar en ${institutionalDomain}`);
      return;
    }

    if (recoveryCode.length !== 6) {
      setServerError('El código debe tener 6 dígitos.');
      return;
    }

    if (newPassword.length < 8) {
      setServerError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setServerError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await recoverWith2FA(recoveryEmail, recoveryCode, newPassword);
      
      // Guardar sesión automáticamente
      const token = (response as any).data.token;
      const usuario = (response as any).data.usuario;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(usuario));
      
      // Redirigir según rol
      const roleId = typeof usuario?.idRol === 'string' ? Number(usuario.idRol) : usuario?.idRol;
      navigateByRole(roleId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al recuperar contraseña.';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formulario de recuperación con 2FA
  if (showRecovery) {
    return (
      <form onSubmit={handleRecoverySubmit} className="auth-card">
        <h2 className="card-title">Recuperar Contraseña</h2>
        <p className="card-subtitle">
          Usa tu código de Google Authenticator para verificar tu identidad y establecer una nueva contraseña
        </p>

        <div className="form-group">
          <label htmlFor="recoveryEmail" className="form-label">
            Correo institucional
          </label>
          <input
            id="recoveryEmail"
            name="recoveryEmail"
            type="email"
            value={recoveryEmail}
            onChange={(event) => setRecoveryEmail(event.target.value.trim())}
            placeholder={`usuario${institutionalDomain}`}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recoveryCode" className="form-label">
            Código de Google Authenticator
          </label>
          <input
            id="recoveryCode"
            name="recoveryCode"
            type="text"
            value={recoveryCode}
            onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="form-input"
            maxLength={6}
            autoComplete="one-time-code"
            required
            style={{ fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }}
          />
          <p className="form-help">Ingresa el código de 6 dígitos de tu app de autenticación</p>
        </div>

        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="••••••••"
            className="form-input"
            minLength={8}
            required
          />
          <p className="form-help">Mínimo 8 caracteres</p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="form-input"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={
            !recoveryEmail ||
            recoveryCode.length !== 6 ||
            newPassword.length < 8 ||
            newPassword !== confirmPassword ||
            isSubmitting
          }
        >
          {isSubmitting ? 'Recuperando...' : 'Cambiar Contraseña'}
        </button>

        <p className="auth-link">
          <button 
            type="button" 
            onClick={() => {
              setShowRecovery(false);
              setRecoveryEmail('');
              setRecoveryCode('');
              setNewPassword('');
              setConfirmPassword('');
              setServerError('');
              setRecoverySuccess('');
            }}
            style={{ background: 'none', border: 'none', color: '#005cab', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Volver al login
          </button>
        </p>

        {recoverySuccess ? <p className="form-success" style={{ color: '#16a34a', textAlign: 'center', marginTop: '8px' }}>{recoverySuccess}</p> : null}
        {serverError ? <p className="form-error">{serverError}</p> : null}
      </form>
    );
  }

  // Si está en paso de 2FA, mostrar ese formulario
  if (requires2FA) {
    return (
      <form onSubmit={handle2FASubmit} className="auth-card">
        <h2 className="card-title">Verificación de Seguridad</h2>
        <p className="card-subtitle">Ingresa el código de Google Authenticator</p>

        <div className="form-group">
          <label htmlFor="twoFactorCode" className="form-label">
            Código de verificación
          </label>
          <input
            id="twoFactorCode"
            name="twoFactorCode"
            type="text"
            value={twoFactorCode}
            onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="form-input"
            maxLength={6}
            autoComplete="one-time-code"
            required
            style={{ fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }}
          />
          <p className="form-help">Ingresa el código de 6 dígitos de tu aplicación de autenticación</p>
        </div>

        <button type="submit" className="auth-submit" disabled={twoFactorCode.length !== 6 || isSubmitting}>
          {isSubmitting ? 'Verificando...' : 'Verificar'}
        </button>

        <p className="auth-link">
          <button 
            type="button" 
            onClick={() => {
              setRequires2FA(false);
              setTempToken('');
              setTwoFactorCode('');
              setServerError('');
            }}
            style={{ background: 'none', border: 'none', color: '#005cab', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Volver al login
          </button>
        </p>

        {serverError ? <p className="form-error">{serverError}</p> : null}
      </form>
    );
  }

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

      <p className="auth-link">
        <button
          type="button"
          onClick={() => {
            setShowRecovery(true);
            setRecoveryEmail(formData.correo);
            setServerError('');
          }}
          style={{ background: 'none', border: 'none', color: '#005cab', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9em' }}
        >
          ¿Olvidaste tu contraseña? (requiere 2FA)
        </button>
      </p>

      <p className="auth-link">
        ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>

      {serverError ? <p className="form-error">{serverError}</p> : null}
    </form>
  );
}
