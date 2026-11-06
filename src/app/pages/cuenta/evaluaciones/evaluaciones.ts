import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Evaluacion, EvaluacionCreate } from '../../../models/evaluacion.model';
import { EvaluacionService } from '../../../services/evaluacion.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-evaluaciones',
  imports: [FormsModule],
  templateUrl: './evaluaciones.html',
  styleUrl: './evaluaciones.css',
})
export class Evaluaciones implements OnInit {
  private readonly evaluacionService = inject(EvaluacionService);

  readonly filas = signal<Evaluacion[]>([]);
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
    this.evaluacionService.obtener(id).subscribe({
      next: (evaluacion) => {
        this.filas.set([evaluacion]);
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

  abrirEditar(fila: Evaluacion): void {
    this.modo.set('editar');
    this.idEditando = fila.id_evaluacion;
    this.formulario = {
      nombre: fila.nombre,
      descripcion: fila.descripcion,
      calificacion: fila.calificacion,
      id_leccion: fila.id_leccion ?? '',
      id_usuario: fila.id_usuario ?? '',
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    const calificacion = Number(this.formulario.calificacion);
    if (
      !this.formulario.nombre.trim() ||
      this.formulario.nombre.trim().length > 150 ||
      !Number.isFinite(calificacion) ||
      calificacion < 0 ||
      calificacion > 100 ||
      !this.idsOpcionalesValidos()
    ) {
      this.avisar('Ingresa un nombre, una calificación de 0 a 100 y UUID válidos en los campos opcionales.', true);
      return;
    }

    const datos: EvaluacionCreate = {
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim(),
      calificacion,
      id_leccion: this.formulario.id_leccion.trim() || null,
      id_usuario: this.formulario.id_usuario.trim() || null,
    };
    this.cargando.set(true);
    const solicitud =
      this.modo() === 'crear'
        ? this.evaluacionService.crear(datos)
        : this.evaluacionService.actualizar(this.idEditando, datos);
    solicitud.subscribe({
      next: () =>
        this.despuesDeGuardar(
          this.modo() === 'crear' ? 'Evaluación creada' : 'Evaluación actualizada',
        ),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Evaluacion): void {
    if (!confirm(`¿Eliminar la evaluación "${fila.nombre}"?`)) {
      return;
    }
    this.cargando.set(true);
    this.evaluacionService.eliminar(fila.id_evaluacion).subscribe({
      next: () => {
        this.avisar('Evaluación eliminada');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.evaluacionService.listar().subscribe({
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

  private idsOpcionalesValidos(): boolean {
    return [this.formulario.id_leccion, this.formulario.id_usuario].every(
      (id) => !id.trim() || this.esUuid(id.trim()),
    );
  }

  private formularioVacio(): {
    nombre: string;
    descripcion: string;
    calificacion: number;
    id_leccion: string;
    id_usuario: string;
  } {
    return {
      nombre: '',
      descripcion: '',
      calificacion: 0,
      id_leccion: '',
      id_usuario: '',
    };
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
      return alListar ? 'No hay registros' : 'Evaluación no encontrada';
    }
    if (error.status === 422) {
      return 'Verifica que el nombre, calificación y UUID sean válidos.';
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : 'No se pudo completar la operación.';
  }
}
