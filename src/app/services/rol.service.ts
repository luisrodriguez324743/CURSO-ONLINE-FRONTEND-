import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Rol, RolCreate } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/roles`;

  listar(): Observable<ApiLista<Rol>> {
    return this.http.get<ApiLista<Rol>>(`${this.base}/`);
  }

  obtener(id: string): Observable<Rol> {
    return this.http.get<Rol>(`${this.base}/${id}`);
  }

  crear(datos: RolCreate): Observable<ApiUno<Rol>> {
    return this.http.post<ApiUno<Rol>>(`${this.base}/`, datos);
  }
}
