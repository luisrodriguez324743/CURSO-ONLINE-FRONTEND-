import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Modulo, ModuloCreate } from '../../../models/modulo.model';
import { ModuloService } from '../../../services/modulo.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-modulos',
  imports: [FormsModule],
  templateUrl: './modulos.html',
  styleUrl: './modulos.css',
})
export class Modulos implements OnInit {
  private readonly moduloService = inject(ModuloService);

  readonly filas = signal<Modulo[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: ModuloCreate = this.formularioVacio();
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
    this.moduloService.obtener(id).subscribe({
      next: (modulo) => {
        this.filas.set([modulo]);
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

  abrirEditar(fila: Modulo): void {
    this.modo.set('editar');
    this.idEditando = fila.id_modulo;
    this.formulario = { ...fila };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formulario.nombre.trim() || !this.formulario.id_curso.trim() || !this.numeroValido()) {
      this.avisar('Completa el nombre, el ID de curso y un orden entero mayor o igual a cero.', true);
      return;
    }

    const datos: ModuloCreate = {
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim(),
      orden: Number(this.formulario.orden),
      id_curso: this.formulario.id_curso.trim(),
    };
    this.cargando.set(true);
    const solicitud =
      this.modo() === 'crear'
        ? this.moduloService.crear(datos)
        : this.moduloService.actualizar(this.idEditando, datos);
    solicitud.subscribe({
      next: () => this.despuesDeGuardar(this.modo() === 'crear' ? 'Módulo creado' : 'Módulo actualizado'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Modulo): void {
    if (!confirm(`Eliminar el módulo "${fila.nombre}"?`)) {
      return;
    }
    this.cargando.set(true);
    this.moduloService.eliminar(fila.id_modulo).subscribe({
      next: () => {
        this.avisar('Módulo eliminado');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.moduloService.listar().subscribe({
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

  private numeroValido(): boolean {
    const orden = Number(this.formulario.orden);
    return Number.isInteger(orden) && orden >= 0;
  }

  private formularioVacio(): ModuloCreate {
    return { nombre: '', descripcion: '', orden: 0, id_curso: '' };
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
      return alListar ? 'No hay registros' : 'Módulo o curso no encontrado';
    }
    if (error.status === 422) {
      return 'Revisa que el ID del curso sea un UUID válido y el orden no sea negativo.';
    }
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : 'No se pudo completar la operacion';
  }
}
