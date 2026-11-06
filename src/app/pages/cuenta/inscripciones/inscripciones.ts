import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Inscripcion, InscripcionCreate } from '../../../models/inscripcion.model';
import { InscripcionService } from '../../../services/inscripcion.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-inscripciones',
  imports: [FormsModule],
  templateUrl: './inscripciones.html',
  styleUrl: './inscripciones.css',
})
export class Inscripciones implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);

  readonly filas = signal<Inscripcion[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario = this.formularioVacio();
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
    this.inscripcionService.obtener(id).subscribe({
      next: (inscripcion) => {
        this.filas.set([inscripcion]);
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

  abrirEditar(fila: Inscripcion): void {
    this.modo.set('editar');
    this.idEditando = fila.id_inscripcion;
    this.formulario = {
      estado: fila.estado,
      id_usuario: fila.id_usuario ?? '',
      id_curso: fila.id_curso ?? '',
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (
      !this.formulario.estado.trim() ||
      this.formulario.estado.trim().length > 20 ||
      !this.esUuid(this.formulario.id_usuario.trim()) ||
      !this.esUuid(this.formulario.id_curso.trim())
    ) {
      this.avisar('Ingresa un estado (máximo 20 caracteres) y los UUID válidos del usuario y curso.', true);
      return;
    }

    const datos: InscripcionCreate = {
      estado: this.formulario.estado.trim(),
      id_usuario: this.formulario.id_usuario.trim(),
      id_curso: this.formulario.id_curso.trim(),
    };
    this.cargando.set(true);
    const solicitud =
      this.modo() === 'crear'
        ? this.inscripcionService.crear(datos)
        : this.inscripcionService.actualizar(this.idEditando, datos);
    solicitud.subscribe({
      next: () =>
        this.despuesDeGuardar(
          this.modo() === 'crear' ? 'Inscripción creada' : 'Inscripción actualizada',
        ),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Inscripcion): void {
    if (!confirm('¿Eliminar esta inscripción?')) {
      return;
    }
    this.cargando.set(true);
    this.inscripcionService.eliminar(fila.id_inscripcion).subscribe({
      next: () => {
        this.avisar('Inscripción eliminada');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.inscripcionService.listar().subscribe({
      next: (filas) => {
        this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay registros');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error, true),
    });
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
    this.falloGuardar(error);
  }

  private falloGuardar(error: HttpErrorResponse, alListar = false): void {
    this.avisar(this.textoError(error, alListar), true);
    this.cargando.set(false);
  }

  private formularioVacio(): { estado: string; id_usuario: string; id_curso: string } {
    return { estado: 'activa', id_usuario: '', id_curso: '' };
  }

  private esUuid(valor: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    }
    if (error.status === 404) {
      return alListar ? 'No hay registros' : 'Inscripción no encontrada';
    }
    if (error.status === 422) {
      return 'Revisa que el estado y los UUID de usuario y curso sean válidos.';
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : 'No se pudo completar la operación.';
  }
}
