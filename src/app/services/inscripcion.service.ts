import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { Inscripcion } from '../models/inscripcion.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/inscripciones`;

  listar(): Observable<Inscripcion[]> { return this.http.get<Inscripcion[]>(`${this.base}/`); }
}