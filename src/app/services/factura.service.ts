import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviaroments/enviaroment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Factura, FacturaCreate, FacturaUpdate } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/facturas`;

  listar(): Observable<ApiLista<Factura>> { return this.http.get<ApiLista<Factura>>(`${this.base}/`); }
  obtener(id: string): Observable<Factura> { return this.http.get<Factura>(`${this.base}/${id}`); }
  crear(datos: FacturaCreate): Observable<ApiUno<Factura>> { return this.http.post<ApiUno<Factura>>(`${this.base}/`, datos); }
  actualizar(id: string, datos: FacturaUpdate): Observable<ApiUno<Factura>> { return this.http.put<ApiUno<Factura>>(`${this.base}/${id}`, datos); }
  eliminar(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}