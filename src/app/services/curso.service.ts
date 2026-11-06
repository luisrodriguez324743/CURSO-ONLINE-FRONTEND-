import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista } from '../models/api-respuesta.model';
import { Curso } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cursos`;

  listar(): Observable<ApiLista<Curso>> { return this.http.get<ApiLista<Curso>>(`${this.base}/`); }
}