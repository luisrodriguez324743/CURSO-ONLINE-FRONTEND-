export interface Curso {
  id_curso: string;
  nombre: string;
  descripcion: string;
  precio: number;
  id_profesor: string | null;
}

export interface CursoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  id_profesor: string | null;
}

export interface CursoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  id_profesor?: string | null;
}