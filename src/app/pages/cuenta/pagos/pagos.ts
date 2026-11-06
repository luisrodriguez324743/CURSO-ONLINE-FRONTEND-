import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { Curso } from '../../../models/curso.model';
import { Pago, PagoCreate, PagoUpdate } from '../../../models/pago.model';
import { CursoService } from '../../../services/curso.service';
import { PagoService } from '../../../services/pago.service';
import { UsuarioService } from '../../../services/usuario.service';

type ModoPopup = 'crear' | 'editar';
type FormularioPago = PagoCreate & { monto: number };
type CampoOrdenPago = keyof Pago;

@Component({ selector: 'app-pagos', imports: [CommonModule, FormsModule], templateUrl: './pagos.html', styleUrl: './pagos.css' })
export class Pagos implements OnInit {
  private readonly service = inject(PagoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly cursoService = inject(CursoService);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cursos = signal<Curso[]>([]);
  readonly filas = signal<Pago[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');
  idFiltro = '';
  formulario: FormularioPago = this.formularioVacio();
  private idEditando = '';
  campoOrden: CampoOrdenPago = 'fecha_pago';
  ordenAscendente = false;

  ngOnInit(): void { this.cargarCatalogos(); this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.service.obtener(id).subscribe({ next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  ordenarPor(campo: CampoOrdenPago): void { if (this.campoOrden === campo) this.ordenAscendente = !this.ordenAscendente; else { this.campoOrden = campo; this.ordenAscendente = true; } }
  filasOrdenadas(): Pago[] { return [...this.filas()].sort((a, b) => this.comparar(a[this.campoOrden], b[this.campoOrden])); }
  nombreUsuario(id: string | null): string { const usuario = this.usuarios().find((item) => item.id_usuario === id); return usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido} (${usuario.nombre_usuario})` : 'Usuario no disponible'; }
  nombreCurso(id: string | null): string { const curso = this.cursos().find((item) => item.id_curso === id); return curso?.nombre ?? 'Curso no disponible'; }
  seleccionarCurso(idCurso: string): void { const curso = this.cursos().find((item) => item.id_curso === idCurso); if (curso) this.formulario.monto = curso.precio; }
  abrirCrear(): void { this.modo.set('crear'); this.idEditando = ''; this.formulario = this.formularioVacio(); this.popupAbierto.set(true); }
  abrirEditar(fila: Pago): void { this.modo.set('editar'); this.idEditando = fila.id_pago; this.formulario = { monto: fila.monto, metodo_pago: fila.metodo_pago, estado: fila.estado, id_usuario: fila.id_usuario ?? '', id_curso: fila.id_curso ?? '' }; this.popupAbierto.set(true); }
  cerrarPopup(): void { this.popupAbierto.set(false); }
  guardar(): void {
    if (!this.esUuid(this.formulario.id_usuario) || !this.esUuid(this.formulario.id_curso) || !this.formulario.metodo_pago.trim() || (this.modo() === 'editar' && (this.formulario.monto < 0 || !this.formulario.estado.trim()))) { this.avisar('Completa los datos del pago.', true); return; }
    this.cargando.set(true);
    const datos = { ...this.formulario, id_usuario: this.formulario.id_usuario.trim(), id_curso: this.formulario.id_curso.trim(), metodo_pago: this.formulario.metodo_pago.trim() };
    const peticion = this.modo() === 'crear' ? this.service.crear({ metodo_pago: datos.metodo_pago, estado: 'pagado', id_usuario: datos.id_usuario, id_curso: datos.id_curso }) : this.service.actualizar(this.idEditando, { monto: Number(datos.monto), metodo_pago: datos.metodo_pago, estado: datos.estado, id_usuario: datos.id_usuario, id_curso: datos.id_curso } as PagoUpdate);
    peticion.subscribe({ next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Pago creado' : 'Pago actualizado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) });
  }
  eliminar(fila: Pago): void { if (!confirm(`Eliminar el pago ${fila.id_pago}?`)) return; this.cargando.set(true); this.service.eliminar(fila.id_pago).subscribe({ next: () => { this.avisar('Pago eliminado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }

  private cargarTodos(): void { this.cargando.set(true); this.service.listar().subscribe({ next: (r) => { const filas = r.data ?? []; this.filas.set(filas); this.avisar(filas.length ? '' : 'No hay registros'); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, true) }); }
  private cargarCatalogos(): void { this.usuarioService.listar().subscribe({ next: (r) => this.usuarios.set(r.data ?? []) }); this.cursoService.listar().subscribe({ next: (r) => this.cursos.set(r.data ?? []) }); }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private formularioVacio(): FormularioPago { return { monto: 0, metodo_pago: 'efectivo', estado: 'pagado', id_usuario: '', id_curso: '' }; }
  private esUuid(valor: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor.trim()); }
  private comparar(a: Pago[CampoOrdenPago], b: Pago[CampoOrdenPago]): number { const valorA = a ?? ''; const valorB = b ?? ''; const diferencia = typeof valorA === 'number' && typeof valorB === 'number' ? valorA - valorB : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' }); return this.ordenAscendente ? diferencia : -diferencia; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private fallo(e: HttpErrorResponse, alListar: boolean): void { this.filas.set(alListar ? [] : this.filas()); this.avisar(e.status === 0 ? 'No se pudo conectar con la API.' : e.status === 404 ? (alListar ? 'No hay registros' : 'Pago no encontrado') : typeof e.error?.detail === 'string' ? e.error.detail : 'No se pudo completar la operación', !alListar || e.status !== 404); this.cargando.set(false); }
}