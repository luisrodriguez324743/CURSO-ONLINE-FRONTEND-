export interface Pago {
  id_pago: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  estado: string;
  id_usuario: string | null;
  id_curso: string | null;
  id_factura: string | null;
}

export interface PagoCreate {
  metodo_pago: string;
  estado: string;
  id_usuario: string;
  id_curso: string;
}

export interface PagoUpdate {
  monto?: number;
  metodo_pago?: string;
  estado?: string;
  id_usuario?: string;
  id_curso?: string;
  id_factura?: string;
}