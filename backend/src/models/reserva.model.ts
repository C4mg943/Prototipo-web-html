export interface ReservaRecord {
  id: number;
  id_usuario: number;
  id_instalacion: number;
  id_estado: number;
  fecha_reserva: string;
  id_franja_inicio: number;
  id_franja_fin: number;
  comienza_en: Date;
  termina_en: Date;
  duracion_horas: number;
  equipo_solicitado: boolean;
  notas: string | null;
  razon_cancelacion: string | null;
  codigo_verificacion: string | null;
  creado_en: Date;
  actualizado_en: Date;
}

export interface FranjaHorariaRecord {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  orden_clasificacion: number;
  esta_activo: boolean;
}

export interface InstalacionRecord {
  id: number;
  codigo: string;
  nombre: string;
  esta_activo: boolean;
}

export interface EstadoReservaRecord {
  id: number;
  codigo: string;
  nombre: string;
  es_final: boolean;
  esta_activo: boolean;
}

export interface CreateReservaInput {
  idInstalacion: number;
  fechaReserva: string;
  idFranjaInicio: number;
  idFranjaFin: number;
  equipoSolicitado?: boolean | undefined;
  notas?: string | undefined;
}

export interface UpdateReservaInput {
  fechaReserva: string;
  idFranjaInicio: number;
  idFranjaFin: number;
  equipoSolicitado?: boolean | undefined;
  notas?: string | undefined;
}

export interface CancelReservaInput {
  razonCancelacion: string;
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
  codigoVerificacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}
