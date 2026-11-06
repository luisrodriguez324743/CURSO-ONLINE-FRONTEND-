export interface Modulo {
  id_modulo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  id_curso: string;
}

export interface ModuloCreate {
  nombre: string;
  descripcion: string;
  orden: number;
  id_curso: string;
}

export interface ModuloUpdate {
  nombre?: string;
  descripcion?: string;
  orden?: number;
  id_curso?: string;
}
