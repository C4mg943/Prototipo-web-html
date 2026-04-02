import { Navigate, useParams } from 'react-router-dom';
import { BookingForm } from '../components/BookingForm';
import { CanchaInfo } from '../components/CanchaInfo';
import { sports } from '../data/sports';
import type { SportSlug } from '../types/domain';

function isSportSlug(value: string | undefined): value is SportSlug {
  return sports.some((sport) => sport.slug === value);
}

export function CanchaPage() {
  const { sportSlug } = useParams();

  if (!isSportSlug(sportSlug)) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="cancha-container">
      <CanchaInfo sportSlug={sportSlug} />
      <aside className="cancha-right" aria-label="Formulario de reserva">
        <BookingForm sportSlug={sportSlug} />
      </aside>
    </section>
  );
}
