import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { Evaluacion, EvaluacionCreate, EvaluacionUpdate } from '../models/evaluacion.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/evaluaciones`;

  listar(): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.base}/`);
  }

  obtener(id: string): Observable<Evaluacion> {
    return this.http.get<Evaluacion>(`${this.base}/${id}`);
  }

  crear(datos: EvaluacionCreate): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: EvaluacionUpdate): Observable<Evaluacion> {
    return this.http.put<Evaluacion>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
