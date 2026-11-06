import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Rol, RolCreate, RolUpdate } from '../../../models/rol.model';
import { RolService } from '../../../services/rol.service';

type ModoPopup = 'crear' | 'editar';

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
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: RolCreate = this.formularioVacio();
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
    this.modo.set('crear');
    this.idEditando = '';
    this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Rol): void {
    this.modo.set('editar');
    this.idEditando = fila.id_rol;
    this.formulario = {
      nombre_rol: fila.nombre_rol,
      descripcion: fila.descripcion ?? '',
    };
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
    const datos = {
      nombre_rol: this.formulario.nombre_rol.trim(),
      descripcion: this.formulario.descripcion.trim(),
    };
    const solicitud =
      this.modo() === 'crear'
        ? this.rolService.crear(datos)
        : this.rolService.actualizar(this.idEditando, datos satisfies RolUpdate);
    solicitud.subscribe({
      next: () => this.despuesDeGuardar(this.modo() === 'crear' ? 'Rol creado' : 'Rol actualizado'),
      error: (error: HttpErrorResponse) => {
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  eliminar(fila: Rol): void {
    if (!confirm(`Eliminar el rol "${fila.nombre_rol}"?`)) {
      return;
    }

    this.cargando.set(true);
    this.rolService.eliminar(fila.id_rol).subscribe({
      next: () => {
        this.avisar('Rol eliminado');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => {
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  private despuesDeGuardar(texto: string): void {
    this.popupAbierto.set(false);
    this.avisar(texto);
    this.refrescar();
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
      const detail = error.error?.detail;
      return typeof detail === 'string' ? detail : 'Ya existe un rol con ese nombre o está asignado a usuarios';
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
