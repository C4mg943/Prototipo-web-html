export interface AuthUser {
  id: number;
  idRol: number;
  codigoInstitucional: string;
  nombres: string;
  apellidos: string;
  correo: string;
  fotoPerfilUrl: string | null;
}

export interface AuthPayload {
  token: string;
  usuario: AuthUser;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ReservaDto {
  id: number;
  idUsuario: number;
  idInstalacion: number;
  instalacion: {
    codigo: string;
    nombre: string;
  };
  estado: {
    id: number;
    codigo: string;
    nombre: string;
  };
  fechaReserva: string;
  franja: {
    idInicio: number;
    idFin: number;
  };
  comienzaEn: string;
  terminaEn: string;
  duracionHoras: number;
  equipoSolicitado: boolean;
  notas: string | null;
  razonCancelacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateReservaPayload {
  idInstalacion: number;
  fechaReserva: string;
  idFranjaInicio: number;
  idFranjaFin: number;
  equipoSolicitado?: boolean;
  notas?: string;
}

export interface CancelReservaPayload {
  razonCancelacion: string;
}

export interface FacilityOption {
  id: number;
  sport: SportSlug;
  name: string;
  scenario: string;
}

export type SportSlug =
  | 'futbol'
  | 'microfutbol'
  | 'tenis'
  | 'voleibol'
  | 'patinaje'
  | 'atletismo'
  | 'softball'
  | 'baloncesto';

export interface SportCardData {
  slug: SportSlug;
  name: string;
  image: string;
  alt: string;
  description: string;
}

export interface TimeSlot {
  id: number;
  label: string;
}
