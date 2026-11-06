import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Curso, CursoCreate, CursoUpdate } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cursos`;

  listar(): Observable<ApiLista<Curso>> {
    return this.http.get<ApiLista<Curso>>(`${this.base}/`);
  }

  obtener(id: string): Observable<Curso> {
    return this.http.get<Curso>(`${this.base}/${id}`);
  }

  crear(datos: CursoCreate): Observable<ApiUno<Curso>> {
    return this.http.post<ApiUno<Curso>>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: CursoUpdate): Observable<ApiUno<Curso>> {
    return this.http.put<ApiUno<Curso>>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
