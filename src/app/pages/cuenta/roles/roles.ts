import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Rol, RolCreate } from '../../../models/rol.model';
import { RolService } from '../../../services/rol.service';

@Component({
  selector: 'app-roles',
  imports: [FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles implements OnInit {
  private readonly rolService = inject(RolService);

  readonly filas = signal<Rol[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);

  idFiltro = '';
  formulario: RolCreate = this.formularioVacio();

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
    this.rolService.obtener(id).subscribe({
      next: (rol) => {
        this.filas.set([rol]);
        this.avisar('');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  limpiarFiltro(): void {
    this.idFiltro = '';
    this.cargarTodos();
  }

  abrirCrear(): void {
    this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formulario.nombre_rol.trim()) {
      this.avisar('El nombre del rol es obligatorio.', true);
      return;
    }

    this.cargando.set(true);
    this.rolService
      .crear({
        nombre_rol: this.formulario.nombre_rol.trim(),
        descripcion: this.formulario.descripcion.trim(),
      })
      .subscribe({
        next: () => {
          this.popupAbierto.set(false);
          this.avisar('Rol creado');
          this.refrescar();
        },
        error: (error: HttpErrorResponse) => {
          this.avisar(this.textoError(error, false), true);
          this.cargando.set(false);
        },
      });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.rolService.listar().subscribe({
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

  private refrescar(): void {
    if (this.idFiltro.trim()) {
      this.buscarPorId();
      return;
    }
    this.cargarTodos();
  }

  private formularioVacio(): RolCreate {
    return { nombre_rol: '', descripcion: '' };
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
      return alListar ? 'No hay registros' : 'Rol no encontrado';
    }
    if (error.status === 409) {
      return 'Ya existe un rol con ese nombre';
    }
    if (error.status === 422) {
      return 'Revisa los datos. El filtro por ID tiene que ser un UUID.';
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'No se pudo completar la operacion';
  }
}
