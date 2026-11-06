export interface Inscripcion {
  id_inscripcion: string;
  fecha_inscripcion: string;
  estado: string;
  id_usuario: string | null;
  id_curso: string | null;
}