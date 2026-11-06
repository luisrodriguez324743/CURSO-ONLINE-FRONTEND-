import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { Usuario } from '../../../models/usuario.model';
import { Curso } from '../../../models/curso.model';
import { Certificado, CertificadoCreate, CertificadoUpdate } from '../../../models/certificado.model';
import { CursoService } from '../../../services/curso.service';
import { CertificadoService } from '../../../services/certificado.service';
import { UsuarioService } from '../../../services/usuario.service';

type ModoPopup = 'crear' | 'editar';
type CampoOrdenCertificado = keyof Certificado;

@Component({ selector: 'app-certificados', imports: [CommonModule, FormsModule], templateUrl: './certificados.html', styleUrl: './certificados.css' })
export class Certificados implements OnInit {
  private readonly service = inject(CertificadoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly cursoService = inject(CursoService);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cursos = signal<Curso[]>([]);
  readonly filas = signal<Certificado[]>([]); readonly mensaje = signal(''); readonly esError = signal(false); readonly cargando = signal(false); readonly popupAbierto = signal(false); readonly modo = signal<ModoPopup>('crear');
  idFiltro = ''; formulario: CertificadoCreate = this.formularioVacio(); private idEditando = '';
  campoOrden: CampoOrdenCertificado = 'fecha_emision';
  ordenAscendente = false;
  ngOnInit(): void { this.cargarCatalogos(); this.cargarTodos(); }
  buscarPorId(): void { const id = this.idFiltro.trim(); if (!id) { this.cargarTodos(); return; } this.cargando.set(true); this.service.obtener(id).subscribe({ next: (fila) => { this.filas.set([fila]); this.avisar(''); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }
  ordenarPor(campo: CampoOrdenCertificado): void { if (this.campoOrden === campo) this.ordenAscendente = !this.ordenAscendente; else { this.campoOrden = campo; this.ordenAscendente = true; } }
  filasOrdenadas(): Certificado[] { return [...this.filas()].sort((a, b) => this.comparar(a[this.campoOrden], b[this.campoOrden])); }
  nombreUsuario(id: string | null): string { const usuario = this.usuarios().find((item) => item.id_usuario === id); return usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido} (${usuario.nombre_usuario})` : 'Usuario no disponible'; }
  nombreCurso(id: string | null): string { const curso = this.cursos().find((item) => item.id_curso === id); return curso?.nombre ?? 'Curso no disponible'; }
  descargar(fila: Certificado): void { const usuario = this.usuarios().find((item) => item.id_usuario === fila.id_usuario); const curso = this.cursos().find((item) => item.id_curso === fila.id_curso); const instructor = this.usuarios().find((item) => item.id_usuario === curso?.id_profesor); const documento = new jsPDF(); const blanco = [235, 235, 235] as [number, number, number]; const gris = [150, 150, 150] as [number, number, number]; documento.setFillColor(36, 36, 36); documento.rect(0, 0, 210, 297, 'F'); documento.setTextColor(...blanco); documento.setFont('helvetica', 'bold'); documento.setFontSize(21); documento.text(this.normalizarPdf('CERTIFICADO DE FINALIZACION'), 10, 18); documento.setFontSize(11); documento.text(this.normalizarPdf('Se certifica que'), 10, 35); documento.setFontSize(19); documento.text(this.normalizarPdf(usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : 'Usuario no disponible'), 10, 52); documento.setFont('helvetica', 'normal'); documento.setFontSize(11); documento.text(this.normalizarPdf('ha completado satisfactoriamente el curso'), 10, 65); documento.setFont('helvetica', 'bold'); documento.setFontSize(16); documento.text(this.normalizarPdf(curso?.nombre ?? 'Curso no disponible'), 10, 80); documento.setFont('helvetica', 'italic'); documento.setFontSize(10); const descripcion = documento.splitTextToSize(this.normalizarPdf(curso?.descripcion ?? 'Sin descripcion registrada'), 170); documento.text(descripcion, 10, 92); documento.setDrawColor(...gris); documento.setLineWidth(0.25); documento.line(10, 112, 200, 112); documento.setFont('helvetica', 'bold'); documento.setFontSize(10); documento.text(this.normalizarPdf(`Codigo del certificado: ${fila.codigo}`), 10, 128); documento.text(this.normalizarPdf(`Fecha de emision: ${new Date(fila.fecha_emision).toLocaleDateString('es-CO')}`), 10, 136); documento.text('Modalidad: Curso Online - Certificado Digital', 10, 144); documento.line(10, 155, 200, 155); const tablaY = 205; const mitad = 105; documento.roundedRect(10, tablaY, 190, 42, 2, 2); documento.line(mitad, tablaY, mitad, tablaY + 42); documento.line(10, tablaY + 10, 200, tablaY + 10); documento.line(10, tablaY + 28, 200, tablaY + 28); documento.setFont('helvetica', 'bold'); documento.text('Firma del Estudiante', 14, tablaY + 7); documento.text('Firma del Instructor', 109, tablaY + 7); documento.setFont('helvetica', 'normal'); documento.text('____________________', 14, tablaY + 23); documento.text('____________________', 109, tablaY + 23); documento.text(this.normalizarPdf(usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : 'Usuario no disponible'), 14, tablaY + 37); documento.text(this.normalizarPdf(instructor ? `${instructor.primer_nombre} ${instructor.primer_apellido}` : 'Nombre del Instructor'), 109, tablaY + 37); documento.save(`${fila.codigo || 'certificado'}.pdf`); }
  abrirCrear(): void { this.modo.set('crear'); this.idEditando = ''; this.formulario = this.formularioVacio(); this.popupAbierto.set(true); }
  abrirEditar(fila: Certificado): void { this.modo.set('editar'); this.idEditando = fila.id_certificado; this.formulario = { codigo: fila.codigo, id_usuario: fila.id_usuario ?? '', id_curso: fila.id_curso ?? '' }; this.popupAbierto.set(true); }
  cerrarPopup(): void { this.popupAbierto.set(false); }
  guardar(): void { const f = this.formulario; if (!this.esUuid(f.id_usuario) || !this.esUuid(f.id_curso)) { this.avisar('Selecciona un usuario y un curso válidos.', true); return; } this.cargando.set(true); const datos = { codigo: f.codigo.trim(), id_usuario: f.id_usuario.trim(), id_curso: f.id_curso.trim() }; const peticion = this.modo() === 'crear' ? this.service.crear(datos) : this.service.actualizar(this.idEditando, { codigo: datos.codigo, id_usuario: datos.id_usuario, id_curso: datos.id_curso } as CertificadoUpdate); peticion.subscribe({ next: () => { this.popupAbierto.set(false); this.avisar(this.modo() === 'crear' ? 'Certificado emitido' : 'Certificado actualizado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  eliminar(fila: Certificado): void { if (!confirm(`Eliminar el certificado ${fila.codigo}?`)) return; this.cargando.set(true); this.service.eliminar(fila.id_certificado).subscribe({ next: () => { this.avisar('Certificado eliminado'); this.refrescar(); }, error: (e: HttpErrorResponse) => this.fallo(e, false) }); }
  private cargarTodos(): void { this.cargando.set(true); this.service.listar().subscribe({ next: (r) => { const filas = r.data ?? []; this.filas.set(filas); this.avisar(filas.length ? '' : 'No hay registros'); this.cargando.set(false); }, error: (e: HttpErrorResponse) => this.fallo(e, true) }); }
  private cargarCatalogos(): void { this.usuarioService.listar().subscribe({ next: (r) => this.usuarios.set(r.data ?? []) }); this.cursoService.listar().subscribe({ next: (r) => this.cursos.set(r.data ?? []) }); }
  private refrescar(): void { this.idFiltro.trim() ? this.buscarPorId() : this.cargarTodos(); }
  private formularioVacio(): CertificadoCreate { return { codigo: '', id_usuario: '', id_curso: '' }; }
  private esUuid(valor: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor.trim()); }
  private normalizarPdf(valor: string): string { return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  private comparar(a: Certificado[CampoOrdenCertificado], b: Certificado[CampoOrdenCertificado]): number { const valorA = a ?? ''; const valorB = b ?? ''; const diferencia = String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' }); return this.ordenAscendente ? diferencia : -diferencia; }
  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && !!texto); }
  private fallo(e: HttpErrorResponse, alListar: boolean): void { if (alListar) this.filas.set([]); this.avisar(e.status === 0 ? 'No se pudo conectar con la API.' : e.status === 404 ? (alListar ? 'No hay registros' : 'Certificado no encontrado') : typeof e.error?.detail === 'string' ? e.error.detail : 'No se pudo completar la operación', !alListar || e.status !== 404); this.cargando.set(false); }
}