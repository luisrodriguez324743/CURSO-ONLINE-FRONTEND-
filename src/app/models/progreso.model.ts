export interface Progreso {
  id_progreso: string;
  porcentaje: number;
  estado: string;
  ultima_actualizacion: string;
  id_usuario: string | null;
  id_curso: string | null;
  id_leccion: string | null;
}

export interface ProgresoCreate {
  porcentaje: number;
  estado: string;
  id_usuario: string | null;
  id_curso: string | null;
  id_leccion: string | null;
}

export type ProgresoUpdate = Partial<ProgresoCreate>;
