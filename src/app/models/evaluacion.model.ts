export interface Evaluacion {
  id_evaluacion: string;
  nombre: string;
  descripcion: string;
  calificacion: number;
  id_leccion: string | null;
  id_usuario: string | null;
}

export interface EvaluacionCreate {
  nombre: string;
  descripcion: string;
  calificacion: number;
  id_leccion: string | null;
  id_usuario: string | null;
}

export type EvaluacionUpdate = Partial<EvaluacionCreate>;
