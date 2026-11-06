import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import {
  Inscripcion,
  InscripcionCreate,
  InscripcionUpdate,
} from '../models/inscripcion.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/inscripciones`;

  listar(): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.base}/`);
  }

  obtener(id: string): Observable<Inscripcion> {
    return this.http.get<Inscripcion>(`${this.base}/${id}`);
  }

  crear(datos: InscripcionCreate): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: InscripcionUpdate): Observable<Inscripcion> {
    return this.http.put<Inscripcion>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
