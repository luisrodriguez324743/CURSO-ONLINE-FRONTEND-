export interface Factura {
  id_factura: string;
  numero_factura: string;
  fecha_emision: string;
  total: number;
  id_inscripcion: string | null;
  id_usuario: string | null;
  id_curso: string | null;
  detalle_cursos: string | null;
  metodo_pago: string;
  estado: string;
}

export interface FacturaCreate {
  id_pago: string;
  id_inscripcion: string;
  id_usuario: string;
  id_curso: string;
  detalle_cursos: string;
  metodo_pago: string;
  estado: string;
}

export interface FacturaUpdate {
  numero_factura?: string;
  fecha_emision?: string;
  total?: number;
  id_inscripcion?: string;
  id_usuario?: string;
  id_curso?: string;
  detalle_cursos?: string;
  metodo_pago?: string;
  estado?: string;
}