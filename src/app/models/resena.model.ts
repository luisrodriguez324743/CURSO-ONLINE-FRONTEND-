export interface Resena {
  id_resena: string;
  calificacion: number;
  comentario: string | null;
  id_usuario: string;
  id_curso: string;
  fecha_creacion: string;
  fecha_edicion: string | null;
}

export interface ResenaCreate {
  calificacion: number;
  comentario: string;
  id_usuario: string;
  id_curso: string;
}

export interface ResenaUpdate {
  calificacion: number;
  comentario: string;
}
