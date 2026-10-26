export interface Usuario {
  id_usuario: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  nombre_usuario: string;
  correo: string;
}

export interface UsuarioCreate {
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  nombre_usuario: string;
  correo: string;
  clave: string;
}

export interface UsuarioUpdate {
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  nombre_usuario?: string;
  correo?: string;
  clave?: string;
}