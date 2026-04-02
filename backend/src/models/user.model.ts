export interface UserRecord {
  id: number;
  id_rol: number;
  codigo_institucional: string;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_electronico: string;
  hash_contrasena: string;
  telefono: string | null;
  foto_perfil_url: string | null;
  esta_activo: boolean;
}

export interface RegisterInput {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
}

export interface LoginInput {
  correo: string;
  contrasena: string;
}

export interface AuthUserDto {
  id: number;
  idRol: number;
  codigoInstitucional: string;
  nombres: string;
  apellidos: string;
  correo: string;
  fotoPerfilUrl: string | null;
}

export interface JwtAccessPayload {
  sub: number;
  roleId: number;
  email: string;
}

export interface AuthenticatedUser {
  id: number;
  roleId: number;
  email: string;
}
