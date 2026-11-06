import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Progreso, ProgresoCreate } from '../../../models/progreso.model';
import { ProgresoService } from '../../../services/progreso.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-progresos',
  imports: [FormsModule],
  templateUrl: './progresos.html',
  styleUrl: './progresos.css',
})
export class Progresos implements OnInit {
  private readonly progresoService = inject(ProgresoService);

  readonly filas = signal<Progreso[]>([]);
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
    this.progresoService.obtener(id).subscribe({
      next: (progreso) => {
        this.filas.set([progreso]);
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

  abrirEditar(fila: Progreso): void {
    this.modo.set('editar');
    this.idEditando = fila.id_progreso;
    this.formulario = {
      porcentaje: fila.porcentaje,
      estado: fila.estado,
      id_usuario: fila.id_usuario ?? '',
      id_curso: fila.id_curso ?? '',
      id_leccion: fila.id_leccion ?? '',
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    const porcentaje = Number(this.formulario.porcentaje);
    if (
      !Number.isFinite(porcentaje) ||
      porcentaje < 0 ||
      porcentaje > 100 ||
      !this.formulario.estado.trim() ||
      this.formulario.estado.trim().length > 30 ||
      !this.idsOpcionalesValidos()
    ) {
      this.avisar('Usa un porcentaje de 0 a 100, un estado válido y UUID válidos en los campos opcionales.', true);
      return;
    }

    const datos: ProgresoCreate = {
      porcentaje,
      estado: this.formulario.estado.trim(),
      id_usuario: this.formulario.id_usuario.trim() || null,
      id_curso: this.formulario.id_curso.trim() || null,
      id_leccion: this.formulario.id_leccion.trim() || null,
    };
    this.cargando.set(true);
    const solicitud =
      this.modo() === 'crear'
        ? this.progresoService.crear(datos)
        : this.progresoService.actualizar(this.idEditando, datos);
    solicitud.subscribe({
      next: () =>
        this.despuesDeGuardar(
          this.modo() === 'crear' ? 'Progreso creado' : 'Progreso actualizado',
        ),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Progreso): void {
    if (!confirm('¿Eliminar este registro de progreso?')) {
      return;
    }
    this.cargando.set(true);
    this.progresoService.eliminar(fila.id_progreso).subscribe({
      next: () => {
        this.avisar('Progreso eliminado');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  porcentajeVisual(porcentaje: number): number {
    if (!Number.isFinite(porcentaje)) {
      return 0;
    }
    return Math.min(100, Math.max(0, porcentaje));
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.progresoService.listar().subscribe({
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
    return [this.formulario.id_usuario, this.formulario.id_curso, this.formulario.id_leccion].every(
      (id) => !id.trim() || this.esUuid(id.trim()),
    );
  }

  private formularioVacio(): {
    porcentaje: number;
    estado: string;
    id_usuario: string;
    id_curso: string;
    id_leccion: string;
  } {
    return {
      porcentaje: 0,
      estado: 'En progreso',
      id_usuario: '',
      id_curso: '',
      id_leccion: '',
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
      return alListar ? 'No hay registros' : 'Progreso no encontrado';
    }
    if (error.status === 422) {
      return 'Verifica que el porcentaje esté entre 0 y 100 y los UUID sean válidos.';
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : 'No se pudo completar la operación.';
  }
}
