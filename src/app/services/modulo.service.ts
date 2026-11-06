import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Modulo, ModuloCreate, ModuloUpdate } from '../models/modulo.model';

@Injectable({ providedIn: 'root' })
export class ModuloService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/modulos`;

  listar(): Observable<ApiLista<Modulo>> {
    return this.http.get<ApiLista<Modulo>>(`${this.base}/`);
  }

  obtener(id: string): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.base}/${id}`);
  }

  crear(datos: ModuloCreate): Observable<ApiUno<Modulo>> {
    return this.http.post<ApiUno<Modulo>>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: ModuloUpdate): Observable<ApiUno<Modulo>> {
    return this.http.put<ApiUno<Modulo>>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
