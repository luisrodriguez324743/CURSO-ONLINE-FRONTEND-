import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Curso, CursoCreate } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-cursos',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class Cursos implements OnInit {
  private readonly cursoService = inject(CursoService);

  readonly filas = signal<Curso[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: CursoCreate = this.formularioVacio();
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
    this.cursoService.obtener(id).subscribe({
      next: (curso) => {
        this.filas.set([curso]);
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

  abrirEditar(fila: Curso): void {
    this.modo.set('editar');
    this.idEditando = fila.id_curso;
    this.formulario = {
      nombre: fila.nombre,
      descripcion: fila.descripcion,
      precio: fila.precio,
      id_profesor: fila.id_profesor ?? '',
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('El nombre es obligatorio y el precio debe ser un número mayor o igual a cero.', true);
      return;
    }

    const datos = this.datosFormulario();
    this.cargando.set(true);
    const solicitud =
      this.modo() === 'crear'
        ? this.cursoService.crear(datos)
        : this.cursoService.actualizar(this.idEditando, datos);
    solicitud.subscribe({
      next: () => this.despuesDeGuardar(this.modo() === 'crear' ? 'Curso creado' : 'Curso actualizado'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Curso): void {
    if (!confirm(`Eliminar el curso "${fila.nombre}"?`)) {
      return;
    }

    this.cargando.set(true);
    this.cursoService.eliminar(fila.id_curso).subscribe({
      next: () => {
        this.avisar('Curso eliminado');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.cursoService.listar().subscribe({
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

  private formularioValido(): boolean {
    return (
      Boolean(this.formulario.nombre.trim()) &&
      Number.isFinite(Number(this.formulario.precio)) &&
      Number(this.formulario.precio) >= 0
    );
  }

  private datosFormulario(): CursoCreate {
    return {
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim(),
      precio: Number(this.formulario.precio),
      id_profesor: this.formulario.id_profesor?.trim() || null,
    };
  }

  private formularioVacio(): CursoCreate {
    return { nombre: '', descripcion: '', precio: 0, id_profesor: null };
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
      return alListar ? 'No hay registros' : 'Curso o profesor no encontrado';
    }
    if (error.status === 422) {
      return 'Revisa el ID del curso/profesor y que el precio no sea negativo.';
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : 'No se pudo completar la operacion';
  }
}
