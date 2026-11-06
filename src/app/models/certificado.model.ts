export interface Certificado {
  id_certificado: string;
  fecha_emision: string;
  codigo: string;
  id_usuario: string | null;
  id_curso: string | null;
}

export interface CertificadoCreate {
  codigo: string;
  id_usuario: string;
  id_curso: string;
}

export interface CertificadoUpdate {
  codigo?: string;
  id_usuario?: string;
  id_curso?: string;
}