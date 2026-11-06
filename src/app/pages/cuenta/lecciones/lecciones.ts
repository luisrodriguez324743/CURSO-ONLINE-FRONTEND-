import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Leccion, LeccionCreate } from '../../../models/leccion.model';
import { LeccionService } from '../../../services/leccion.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-lecciones',
  imports: [FormsModule],
  templateUrl: './lecciones.html',
  styleUrl: './lecciones.css',
})
export class Lecciones implements OnInit {
  private readonly leccionService = inject(LeccionService);

  readonly filas = signal<Leccion[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: LeccionCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void {
    this.cargarTodos();
  }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) {
      this.cargarTodos();
      return;
    }
    this.cargando.set(true);
    this.leccionService.obtener(id).subscribe({
      next: (leccion) => {
        this.filas.set([leccion]);
        this.avisar('');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => this.falloBusqueda(error),
    });
  }

  limpiarFiltro(): void {
    this.idFiltro = '';
    this.cargarTodos();
  }

  abrirCrear(): void {
    this.modo.set('crear');
    this.idEditando = '';
    this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Leccion): void {
    this.modo.set('editar');
    this.idEditando = fila.id_leccion;
    this.formulario = { ...fila };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (
      !this.formulario.nombre.trim() ||
      !this.formulario.id_modulo.trim() ||
      !Number.isInteger(Number(this.formulario.orden)) ||
      Number(this.formulario.orden) < 0 ||
      !Number.isInteger(Number(this.formulario.duracion)) ||
      Number(this.formulario.duracion) < 0
    ) {
      this.avisar('Completa nombre e ID de módulo; orden y duración deben ser enteros no negativos.', true);
      return;
    }

    const datos: LeccionCreate = {
      nombre: this.formulario.nombre.trim(),
      contenido: this.formulario.contenido.trim(),
      orden: Number(this.formulario.orden),
      id_modulo: this.formulario.id_modulo.trim(),
      duracion: Number(this.formulario.duracion),
    };
    this.cargando.set(true);
    const solicitud =
      this.modo() === 'crear'
        ? this.leccionService.crear(datos)
        : this.leccionService.actualizar(this.idEditando, datos);
    solicitud.subscribe({
      next: () => this.despuesDeGuardar(this.modo() === 'crear' ? 'Lección creada' : 'Lección actualizada'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Leccion): void {
    if (!confirm(`Eliminar la lección "${fila.nombre}"?`)) {
      return;
    }
    this.cargando.set(true);
    this.leccionService.eliminar(fila.id_leccion).subscribe({
      next: () => {
        this.avisar('Lección eliminada');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.leccionService.listar().subscribe({
      next: (respuesta) => {
        const filas = respuesta.data ?? [];
        this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay registros');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        const listaVacia = error.status === 404;
        this.avisar(listaVacia ? 'No hay registros' : this.textoError(error, true), !listaVacia);
        this.cargando.set(false);
      },
    });
  }

  private formularioVacio(): LeccionCreate {
    return { nombre: '', contenido: '', orden: 0, id_modulo: '', duracion: 0 };
  }

  private refrescar(): void {
    if (this.idFiltro.trim()) {
      this.buscarPorId();
      return;
    }
    this.cargarTodos();
  }

  private despuesDeGuardar(texto: string): void {
    this.popupAbierto.set(false);
    this.avisar(texto);
    this.refrescar();
  }

  private falloBusqueda(error: HttpErrorResponse): void {
    this.filas.set([]);
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private falloGuardar(error: HttpErrorResponse): void {
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API. Revisa que el backend este en el puerto 8000.';
    }
    if (error.status === 404) {
      return alListar ? 'No hay registros' : 'Lección o módulo no encontrado';
    }
    if (error.status === 422) {
      return 'Revisa que el ID del módulo sea un UUID válido y que orden y duración no sean negativos.';
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : 'No se pudo completar la operacion';
  }
}
