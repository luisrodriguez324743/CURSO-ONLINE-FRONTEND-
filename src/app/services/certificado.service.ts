import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Certificado, CertificadoCreate, CertificadoUpdate } from '../models/certificado.model';

@Injectable({ providedIn: 'root' })
export class CertificadoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/certificados`;

  listar(): Observable<ApiLista<Certificado>> { return this.http.get<ApiLista<Certificado>>(`${this.base}/`); }
  obtener(id: string): Observable<Certificado> { return this.http.get<Certificado>(`${this.base}/${id}`); }
  crear(datos: CertificadoCreate): Observable<ApiUno<Certificado>> { return this.http.post<ApiUno<Certificado>>(`${this.base}/`, datos); }
  actualizar(id: string, datos: CertificadoUpdate): Observable<ApiUno<Certificado>> { return this.http.put<ApiUno<Certificado>>(`${this.base}/${id}`, datos); }
  eliminar(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}