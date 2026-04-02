import { HeroSection } from '../components/HeroSection';
import { LocationSection } from '../components/LocationSection';
import { SportCard } from '../components/SportCard';
import { sports } from '../data/sports';

export function HomePage() {
  return (
    <>
      <HeroSection />

      <section id="deportes" className="sports-section">
        <h2 className="section-title">Deportes disponibles</h2>
        <p className="section-subtitle">
          Selecciona un deporte para ver las canchas disponibles a reservar.
        </p>

        <div className="sports-grid">
          {sports.map((sport) => (
            <SportCard key={sport.slug} sport={sport} />
          ))}
        </div>
      </section>

      <LocationSection />
    </>
  );
}
