import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { Usuario } from '../../../models/usuario.model';
import { Curso } from '../../../models/curso.model';
import { Inscripcion } from '../../../models/inscripcion.model';
import { Factura, FacturaCreate, FacturaUpdate } from '../../../models/factura.model';
import { Pago } from '../../../models/pago.model';
import { CursoService } from '../../../services/curso.service';
import { FacturaService } from '../../../services/factura.service';
import { InscripcionService } from '../../../services/inscripcion.service';
import { PagoService } from '../../../services/pago.service';
import { UsuarioService } from '../../../services/usuario.service';

type ModoPopup = 'crear' | 'editar';
type CampoOrdenFactura = keyof Factura;
type FormularioFactura = FacturaCreate & { numero_factura: string; fecha_emision: string; total: number };

@Component({ selector: 'app-facturas', imports: [CommonModule, FormsModule], templateUrl: './facturas.html', styleUrl: './facturas.css' })
export class Facturas implements OnInit {
  private readonly service = inject(FacturaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly cursoService = inject(CursoService);
  private readonly inscripcionService = inject(InscripcionService);
  private readonly pagoService = inject(PagoService);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cursos = signal<Curso[]>([]);
  readonly inscripciones = signal<Inscripcion[]>([]);
  readonly pagosDisponibles = signal<Pago[]>([]);
  readonly filas = signal<Factura[]>([]); readonly mensaje = signal(''); readonly esError = signal(false); readonly cargando = signal(false); readonly popupAbierto = signal(false); readonly modo = signal<ModoPopup>('crear');
  idFiltro = ''; formulario: FormularioFactura = this.formularioVacio(); private idEditando = '';
  campoOrden: CampoOrdenFactura = 'fecha_emision';
  ordenAscendente = false;
  idPagoSeleccionado = '';
  ngOnInit(): void { this.cargarCatalogos(); this.cargarTodos(); }
  buscarPorId(): void { const id = this.idFiltro.trim(); if (!id) { this.cargarTodos(); return; } this.cargando.set(true); this.service.obtener(id).subscribe({ next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  ordenarPor(campo: CampoOrdenFactura): void { if (this.campoOrden === campo) this.ordenAscendente = !this.ordenAscendente; else { this.campoOrden = campo; this.ordenAscendente = true; } }
  filasOrdenadas(): Factura[] { return [...this.filas()].sort((a, b) => this.comparar(a[this.campoOrden], b[this.campoOrden])); }
  abrirCrear(): void { this.modo.set('crear'); this.idEditando = ''; this.idPagoSeleccionado = ''; this.formulario = this.formularioVacio(); this.popupAbierto.set(true); }
  abrirEditar(fila: Factura): void { this.modo.set('editar'); this.idEditando = fila.id_factura; this.formulario = { id_pago: '', numero_factura: fila.numero_factura, fecha_emision: this.fechaParaInput(fila.fecha_emision), total: fila.total, id_inscripcion: fila.id_inscripcion ?? '', id_usuario: fila.id_usuario ?? '', id_curso: fila.id_curso ?? '', detalle_cursos: fila.detalle_cursos === '[]' ? '' : fila.detalle_cursos ?? '', metodo_pago: fila.metodo_pago, estado: fila.estado }; this.popupAbierto.set(true); }
  cerrarPopup(): void { this.popupAbierto.set(false); }
  seleccionarPago(idPago: string): void { const pago = this.pagosDisponibles().find((item) => item.id_pago === idPago); if (!pago) return; const inscripcion = this.inscripciones().find((item) => item.id_usuario === pago.id_usuario && item.id_curso === pago.id_curso); this.idPagoSeleccionado = pago.id_pago; this.formulario.id_pago = pago.id_pago; this.formulario.id_usuario = pago.id_usuario ?? ''; this.formulario.id_curso = pago.id_curso ?? ''; this.formulario.metodo_pago = pago.metodo_pago; this.formulario.estado = 'pagada'; this.formulario.id_inscripcion = inscripcion?.id_inscripcion ?? ''; if (!inscripcion) this.avisar('El pago seleccionado no tiene una inscripción relacionada.', true); }
  guardar(): void { const f = this.formulario; const relacionesValidas = this.esUuid(f.id_inscripcion) && this.esUuid(f.id_usuario) && this.esUuid(f.id_curso); if ((!relacionesValidas && this.modo() === 'editar') || (this.modo() === 'crear' && (!this.idPagoSeleccionado || !relacionesValidas)) || !f.metodo_pago.trim() || f.total < 0 || !f.numero_factura.trim()) { this.avisar(this.modo() === 'crear' ? 'Selecciona un pago confirmado con una inscripción relacionada.' : 'Completa todos los datos de la factura.', true); return; } this.cargando.set(true); const datos = { ...f, id_inscripcion: f.id_inscripcion.trim(), id_usuario: f.id_usuario.trim(), id_curso: f.id_curso.trim(), metodo_pago: f.metodo_pago.trim(), estado: this.modo() === 'crear' ? 'pagada' : f.estado.trim(), detalle_cursos: f.detalle_cursos.trim() || '[]' }; const peticion = this.modo() === 'crear' ? this.service.crear({ id_pago: datos.id_pago, id_inscripcion: datos.id_inscripcion, id_usuario: datos.id_usuario, id_curso: datos.id_curso, detalle_cursos: datos.detalle_cursos, metodo_pago: datos.metodo_pago, estado: datos.estado }) : this.service.actualizar(this.idEditando, { numero_factura: datos.numero_factura, fecha_emision: this.fechaParaApi(datos.fecha_emision), total: Number(datos.total), id_inscripcion: datos.id_inscripcion, id_usuario: datos.id_usuario, id_curso: datos.id_curso, detalle_cursos: datos.detalle_cursos, metodo_pago: datos.metodo_pago, estado: datos.estado }); peticion.subscribe({ next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Factura creada' : 'Factura actualizada'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  eliminar(fila: Factura): void { if (!confirm(`Eliminar la factura ${fila.numero_factura}?`)) return; this.cargando.set(true); this.service.eliminar(fila.id_factura).subscribe({ next: () => { this.avisar('Factura eliminada'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  private cargarTodos(): void { this.cargando.set(true); this.service.listar().subscribe({ next: (r) => { const filas = r.data ?? []; this.filas.set(filas); this.avisar(filas.length ? '' : 'No hay registros'); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, true) }); }
  private cargarCatalogos(): void { this.usuarioService.listar().subscribe({ next: (r) => this.usuarios.set(r.data ?? []) }); this.cursoService.listar().subscribe({ next: (r) => this.cursos.set(r.data ?? []) }); this.inscripcionService.listar().subscribe({ next: (filas) => this.inscripciones.set(filas) }); this.pagoService.listar().subscribe({ next: (r) => this.pagosDisponibles.set((r.data ?? []).filter((pago) => pago.estado === 'pagado' && !pago.id_factura)) }); }
  nombreUsuario(id: string | null): string { const usuario = this.usuarios().find((item) => item.id_usuario === id); return usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido} (${usuario.nombre_usuario})` : 'Usuario no disponible'; }
  nombreCurso(id: string | null): string { const curso = this.cursos().find((item) => item.id_curso === id); return curso?.nombre ?? 'Curso no disponible'; }
  descargar(fila: Factura): void { const usuario = this.usuarios().find((item) => item.id_usuario === fila.id_usuario); const curso = this.cursos().find((item) => item.id_curso === fila.id_curso); const documento = new jsPDF(); const blanco = [235, 235, 235] as [number, number, number]; const gris = [150, 150, 150] as [number, number, number]; documento.setFillColor(36, 36, 36); documento.rect(0, 0, 210, 297, 'F'); documento.setTextColor(...blanco); documento.setFont('helvetica', 'bold'); documento.setFontSize(22); documento.text(this.normalizarPdf('COMPROBANTE DE FACTURA'), 10, 22); documento.setFontSize(12); documento.text(this.normalizarPdf(fila.numero_factura), 10, 35); documento.setDrawColor(...gris); documento.line(10, 45, 200, 45); documento.setFontSize(11); documento.text(this.normalizarPdf(`Fecha de emision: ${new Date(fila.fecha_emision).toLocaleDateString('es-CO')}`), 10, 60); documento.text(this.normalizarPdf(`Estado: ${fila.estado}`), 10, 69); documento.text(this.normalizarPdf(`Metodo de pago: ${fila.metodo_pago}`), 10, 78); documento.setFontSize(14); documento.text('CLIENTE', 10, 98); documento.setFont('helvetica', 'normal'); documento.setFontSize(11); documento.text(this.normalizarPdf(usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : 'Usuario no disponible'), 10, 108); documento.text(this.normalizarPdf(usuario?.nombre_usuario ?? ''), 10, 116); documento.setFont('helvetica', 'bold'); documento.setFontSize(14); documento.text('CURSO', 10, 140); documento.setFont('helvetica', 'normal'); documento.setFontSize(11); documento.text(this.normalizarPdf(curso?.nombre ?? 'Curso no disponible'), 10, 150); const detalle = documento.splitTextToSize(this.normalizarPdf(fila.detalle_cursos && fila.detalle_cursos !== '[]' ? fila.detalle_cursos : 'Sin detalle registrado'), 170); documento.text(detalle, 10, 160); documento.setDrawColor(...gris); documento.line(10, 195, 200, 195); documento.setFont('helvetica', 'bold'); documento.setFontSize(16); documento.text(this.normalizarPdf(`TOTAL: $${fila.total.toFixed(2)}`), 10, 215); documento.setFont('helvetica', 'normal'); documento.setFontSize(10); documento.text('Curso Online - Comprobante digital', 105, 250, { align: 'center' }); documento.save(`${fila.numero_factura || 'factura'}.pdf`); }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private formularioVacio(): FormularioFactura { return { id_pago: '', numero_factura: '', fecha_emision: '', total: 0, id_inscripcion: '', id_usuario: '', id_curso: '', detalle_cursos: '[]', metodo_pago: 'efectivo', estado: 'pagada' }; }
  private fechaParaInput(valor: string): string { return valor ? new Date(valor).toISOString().slice(0, 16) : ''; }
  private fechaParaApi(valor: string): string | undefined { return valor ? new Date(valor).toISOString() : undefined; }
  private esUuid(valor: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor.trim()); }
  private comparar(a: Factura[CampoOrdenFactura], b: Factura[CampoOrdenFactura]): number { const valorA = a ?? ''; const valorB = b ?? ''; const diferencia = typeof valorA === 'number' && typeof valorB === 'number' ? valorA - valorB : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' }); return this.ordenAscendente ? diferencia : -diferencia; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private normalizarPdf(valor: string): string { return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  private fallo(e: HttpErrorResponse, alListar: boolean): void { if (alListar) this.filas.set([]); this.avisar(e.status === 0 ? 'No se pudo conectar con la API.' : e.status === 404 ? (alListar ? 'No hay registros' : 'Factura no encontrada') : typeof e.error?.detail === 'string' ? e.error.detail : 'No se pudo completar la operación', !alListar || e.status !== 404); this.cargando.set(false); }
}