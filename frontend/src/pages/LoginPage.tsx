import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <section className="auth-page">
      <article className="auth-hero">
        <h1 className="hero-title">Reserva tus escenarios</h1>
        <p className="hero-desc">
          Consulta disponibilidad en tiempo real y agenda sin complicaciones. Accede con tu cuenta
          institucional.
        </p>
      </article>

      <LoginForm />
    </section>
  );
}
