export interface Rol {
  id_rol: string;
  nombre_rol: string;
  descripcion: string | null;
}

export interface RolCreate {
  nombre_rol: string;
  descripcion: string;
}

export interface RolUpdate {
  nombre_rol: string;
  descripcion: string;
}
