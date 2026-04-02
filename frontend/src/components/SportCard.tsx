import { Link } from 'react-router-dom';
import type { SportCardData } from '../types/domain';

interface SportCardProps {
  sport: SportCardData;
}

export function SportCard({ sport }: SportCardProps) {
  return (
    <article className="sport-card">
      <img className="sport-img" src={sport.image} alt={sport.alt} loading="lazy" />
      <div className="sport-body">
        <p className="sport-name">{sport.name}</p>
        <p className="sport-description">{sport.description}</p>
        <Link to={`/canchas/${sport.slug}`} className="btn-ver">
          Ver canchas
        </Link>
      </div>
    </article>
  );
}
