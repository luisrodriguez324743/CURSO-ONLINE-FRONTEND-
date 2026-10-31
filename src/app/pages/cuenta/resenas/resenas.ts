import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Resena, ResenaCreate, ResenaUpdate } from '../../../models/resena.model';
import { ResenaService } from '../../../services/resena.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-resenas',
  imports: [FormsModule],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css',
})
export class Resenas implements OnInit {
  private readonly resenaService = inject(ResenaService);

  readonly filas = signal<Resena[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idUsuarioFiltro = '';
  idCursoFiltro = '';
  formulario: ResenaCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void {
    this.cargarTodos();
  }

  buscar(): void {
    const idUsuario = this.idUsuarioFiltro.trim();
    const idCurso = this.idCursoFiltro.trim();
    if (!idUsuario && !idCurso) {
      this.cargarTodos();
      return;
    }

    this.cargando.set(true);
    if (idUsuario && idCurso) {
      this.resenaService.porUsuarioYCurso(idUsuario, idCurso).subscribe({
        next: (resena) => {
          this.filas.set([resena]);
          this.avisar('');
          this.cargando.set(false);
        },
        error: (error: HttpErrorResponse) => this.falloBusqueda(error),
      });
      return;
    }

    const consulta = idCurso
      ? this.resenaService.porCurso(idCurso)
      : this.resenaService.porUsuario(idUsuario);
    consulta.subscribe({
      next: (filas) => {
        this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay registros');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => this.falloBusqueda(error),
    });
  }

  limpiarFiltros(): void {
    this.idUsuarioFiltro = '';
    this.idCursoFiltro = '';
    this.cargarTodos();
  }

  abrirCrear(): void {
    this.modo.set('crear');
    this.idEditando = '';
    this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Resena): void {
    this.modo.set('editar');
    this.idEditando = fila.id_resena;
    this.formulario = {
      calificacion: fila.calificacion,
      comentario: fila.comentario ?? '',
      id_usuario: fila.id_usuario,
      id_curso: fila.id_curso,
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('La calificación debe estar entre 1 y 5 y los IDs deben ser UUID válidos.', true);
      return;
    }

    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.resenaService.crear(this.datosCreacion()).subscribe({
        next: () => this.despuesDeGuardar('Reseña creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.resenaService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
      next: () => this.despuesDeGuardar('Reseña actualizada'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.resenaService.listar().subscribe({
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

  private falloBusqueda(error: HttpErrorResponse): void {
    this.filas.set([]);
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private despuesDeGuardar(texto: string): void {
    this.popupAbierto.set(false);
    this.avisar(texto);
    this.refrescar();
  }

  private falloGuardar(error: HttpErrorResponse): void {
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private refrescar(): void {
    if (this.idUsuarioFiltro.trim() || this.idCursoFiltro.trim()) {
      this.buscar();
      return;
    }
    this.cargarTodos();
  }

  private formularioValido(): boolean {
    const calificacion = Number(this.formulario.calificacion);
    const calificacionValida =
      Number.isInteger(calificacion) && calificacion >= 1 && calificacion <= 5;
    if (!calificacionValida) {
      return false;
    }
    if (this.modo() === 'editar') {
      return true;
    }
    return this.esUuid(this.formulario.id_usuario.trim()) && this.esUuid(this.formulario.id_curso.trim());
  }

  private datosCreacion(): ResenaCreate {
    return {
      calificacion: Number(this.formulario.calificacion),
      comentario: this.formulario.comentario.trim(),
      id_usuario: this.formulario.id_usuario.trim(),
      id_curso: this.formulario.id_curso.trim(),
    };
  }

  private datosEdicion(): ResenaUpdate {
    return {
      calificacion: Number(this.formulario.calificacion),
      comentario: this.formulario.comentario.trim(),
    };
  }

  private formularioVacio(): ResenaCreate {
    return { calificacion: 5, comentario: '', id_usuario: '', id_curso: '' };
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
      return 'No se pudo conectar con la API. Revisa que el backend este en el puerto 8000.';
    }
    if (error.status === 404) {
      return alListar ? 'No hay registros' : 'Reseña no encontrada';
    }
    if (error.status === 422) {
      return 'Revisa que la calificación este entre 1 y 5 y que los IDs sean UUID válidos.';
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'No se pudo completar la operacion';
  }
}
