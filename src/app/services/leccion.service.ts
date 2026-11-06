import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Leccion, LeccionCreate, LeccionUpdate } from '../models/leccion.model';

@Injectable({ providedIn: 'root' })
export class LeccionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/lecciones`;

  listar(): Observable<ApiLista<Leccion>> {
    return this.http.get<ApiLista<Leccion>>(`${this.base}/`);
  }

  obtener(id: string): Observable<Leccion> {
    return this.http.get<Leccion>(`${this.base}/${id}`);
  }

  crear(datos: LeccionCreate): Observable<ApiUno<Leccion>> {
    return this.http.post<ApiUno<Leccion>>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: LeccionUpdate): Observable<ApiUno<Leccion>> {
    return this.http.put<ApiUno<Leccion>>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
