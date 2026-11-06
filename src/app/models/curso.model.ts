export interface Curso {
  id_curso: string;
  nombre: string;
  descripcion: string;
  precio: number;
  id_profesor: string | null;
}