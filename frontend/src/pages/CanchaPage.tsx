import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BookingForm } from '../components/BookingForm';
import { CanchaInfo } from '../components/CanchaInfo';
import { facilitiesBySport, sports } from '../data/sports';
import type { SportSlug } from '../types/domain';

function isSportSlug(value: string | undefined): value is SportSlug {
  return sports.some((sport) => sport.slug === value);
}

export function CanchaPage() {
  const { sportSlug } = useParams();
  const validSportSlug = isSportSlug(sportSlug) ? sportSlug : null;
  const fallbackSportSlug = sports[0]?.slug;
  const activeSportSlug = validSportSlug ?? fallbackSportSlug;
  const facilities = activeSportSlug ? facilitiesBySport[activeSportSlug] : [];
  const defaultFacilityId = facilities[0]?.id ?? 1;
  const [selectedFacilityId, setSelectedFacilityId] = useState<number>(defaultFacilityId);

  useEffect(() => {
    setSelectedFacilityId(defaultFacilityId);
  }, [defaultFacilityId]);

  const selectedFacility = facilities.find((facility) => facility.id === selectedFacilityId) ?? facilities[0];

  if (!validSportSlug) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="cancha-container">
      <CanchaInfo sportSlug={validSportSlug} selectedFacility={selectedFacility} />
      <aside className="cancha-right" aria-label="Formulario de reserva">
        <BookingForm
          sportSlug={validSportSlug}
          selectedFacilityId={selectedFacility?.id}
          onFacilityChange={setSelectedFacilityId}
        />
      </aside>
    </section>
  );
}
