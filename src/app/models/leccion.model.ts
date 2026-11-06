export interface Leccion {
  id_leccion: string;
  nombre: string;
  contenido: string;
  orden: number;
  id_modulo: string;
  duracion: number;
}

export interface LeccionCreate {
  nombre: string;
  contenido: string;
  orden: number;
  id_modulo: string;
  duracion: number;
}

export interface LeccionUpdate {
  nombre?: string;
  contenido?: string;
  orden?: number;
  id_modulo?: string;
  duracion?: number;
}
