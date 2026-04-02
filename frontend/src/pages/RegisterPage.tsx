import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <section className="auth-page">
      <article className="auth-hero">
        <h1 className="hero-title">Crea tu cuenta institucional</h1>
        <p className="hero-desc">
          Completa tu registro para gestionar reservas deportivas desde una sola plataforma.
        </p>
      </article>

      <RegisterForm />
    </section>
  );
}
