import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Resena, ResenaCreate, ResenaUpdate } from '../models/resena.model';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/resenas`;

  listar(): Observable<ApiLista<Resena>> {
    return this.http.get<ApiLista<Resena>>(`${this.base}/`);
  }

  porCurso(idCurso: string): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.base}/curso/${idCurso}`);
  }

  porUsuario(idUsuario: string): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.base}/usuario/${idUsuario}`);
  }

  porUsuarioYCurso(idUsuario: string, idCurso: string): Observable<Resena> {
    return this.http.get<Resena>(`${this.base}/usuario/${idUsuario}/curso/${idCurso}`);
  }

  crear(datos: ResenaCreate): Observable<ApiUno<Resena>> {
    return this.http.post<ApiUno<Resena>>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: ResenaUpdate): Observable<ApiUno<Resena>> {
    return this.http.put<ApiUno<Resena>>(`${this.base}/${id}`, datos);
  }
}
