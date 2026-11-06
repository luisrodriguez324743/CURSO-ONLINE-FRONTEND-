import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { Progreso, ProgresoCreate, ProgresoUpdate } from '../models/progreso.model';

@Injectable({ providedIn: 'root' })
export class ProgresoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/progresos`;

  listar(): Observable<Progreso[]> {
    return this.http.get<Progreso[]>(`${this.base}/`);
  }

  obtener(id: string): Observable<Progreso> {
    return this.http.get<Progreso>(`${this.base}/${id}`);
  }

  crear(datos: ProgresoCreate): Observable<Progreso> {
    return this.http.post<Progreso>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: ProgresoUpdate): Observable<Progreso> {
    return this.http.put<Progreso>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
