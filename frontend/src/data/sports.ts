import type { FacilityOption, SportCardData, SportSlug, TimeSlot } from '../types/domain';

export const sports: SportCardData[] = [
  {
    slug: 'futbol',
    name: 'Fútbol',
    image: '/assets/canchas/futbol.jpeg',
    alt: 'Cancha de fútbol',
    description: 'Canchas de fútbol con superficie de tierra.',
  },
  {
    slug: 'microfutbol',
    name: 'Microfútbol',
    image: '/assets/canchas/microfutbol.jpeg',
    alt: 'Cancha de microfútbol',
    description: 'Canchas rápidas para partidos de microfútbol.',
  },
  {
    slug: 'tenis',
    name: 'Tenis',
    image: '/assets/canchas/tenis.jpeg',
    alt: 'Cancha de tenis',
    description: 'Cancha de tenis en superficie de cemento.',
  },
  {
    slug: 'voleibol',
    name: 'Voleibol',
    image: '/assets/canchas/voleibol.jpeg',
    alt: 'Cancha de voleibol',
    description: 'Canchas de voleibol para entrenamiento y torneos.',
  },
  {
    slug: 'patinaje',
    name: 'Patinaje',
    image: '/assets/canchas/patinaje.jpeg',
    alt: 'Pista de patinaje',
    description: 'Pista amplia para práctica de patinaje.',
  },
  {
    slug: 'atletismo',
    name: 'Atletismo',
    image: '/assets/canchas/atletismo.jpeg',
    alt: 'Pista de atletismo',
    description: 'Pista para carreras y ejercicios de atletismo.',
  },
  {
    slug: 'softball',
    name: 'Softball',
    image: '/assets/canchas/softball.jpeg',
    alt: 'Campo de softball',
    description: 'Campo de softball con graderías cercanas.',
  },
  {
    slug: 'baloncesto',
    name: 'Baloncesto',
    image: '/assets/canchas/baloncesto.jpeg',
    alt: 'Cancha de baloncesto',
    description: 'Canchas de baloncesto en cemento.',
  },
];

export const facilitiesBySport: Record<SportSlug, FacilityOption[]> = {
  futbol: [
    { id: 1, sport: 'futbol', name: 'Cancha Fútbol Tierra 1', scenario: 'Cancha Múltiple Tierra' },
    { id: 2, sport: 'futbol', name: 'Cancha Fútbol Tierra 2', scenario: 'Cancha Fútbol Tierra 2' },
  ],
  microfutbol: [
    { id: 3, sport: 'microfutbol', name: 'Cancha Microfútbol 1', scenario: 'Cancha Doble Cemento' },
    { id: 4, sport: 'microfutbol', name: 'Cancha Microfútbol 2', scenario: 'Cancha Cemento Mixta 1' },
    { id: 5, sport: 'microfutbol', name: 'Cancha Microfútbol 3', scenario: 'Cancha Cemento Mixta 2' },
    { id: 6, sport: 'microfutbol', name: 'Cancha Microfútbol 4', scenario: 'Cancha Cemento Mixta 3' },
  ],
  tenis: [{ id: 7, sport: 'tenis', name: 'Cancha Tenis 1', scenario: 'Cancha Doble Cemento' }],
  voleibol: [
    { id: 8, sport: 'voleibol', name: 'Cancha Voleibol 1', scenario: 'Cancha Doble Cemento' },
    { id: 9, sport: 'voleibol', name: 'Cancha Voleibol 2', scenario: 'Cancha Cemento Mixta 3' },
  ],
  patinaje: [
    { id: 10, sport: 'patinaje', name: 'Pista de Patinaje 1', scenario: 'Cancha Múltiple Tierra' },
  ],
  atletismo: [
    { id: 11, sport: 'atletismo', name: 'Pista de Atletismo 1', scenario: 'Cancha Múltiple Tierra' },
  ],
  softball: [{ id: 12, sport: 'softball', name: 'Campo Softball 1', scenario: 'Cancha de Softball' }],
  baloncesto: [
    { id: 13, sport: 'baloncesto', name: 'Cancha Baloncesto 1', scenario: 'Cancha Cemento Mixta 1' },
    { id: 14, sport: 'baloncesto', name: 'Cancha Baloncesto 2', scenario: 'Cancha Cemento Mixta 2' },
    { id: 15, sport: 'baloncesto', name: 'Cancha Baloncesto 3', scenario: 'Cancha Cemento Mixta 3' },
  ],
};

export const slotOptions: TimeSlot[] = [
  { id: 1, label: '07:00 - 08:00' },
  { id: 2, label: '08:00 - 09:00' },
  { id: 3, label: '09:00 - 10:00' },
  { id: 4, label: '10:00 - 11:00' },
  { id: 5, label: '11:00 - 12:00' },
  { id: 6, label: '12:00 - 13:00' },
  { id: 7, label: '13:00 - 14:00' },
  { id: 8, label: '14:00 - 15:00' },
  { id: 9, label: '15:00 - 16:00' },
  { id: 10, label: '16:00 - 17:00' },
  { id: 11, label: '17:00 - 18:00' },
  { id: 12, label: '18:00 - 19:00' },
  { id: 13, label: '19:00 - 20:00' },
];

export function getSportName(slug: SportSlug): string {
  return sports.find((sport) => sport.slug === slug)?.name ?? slug;
}
