import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly sidebarColapsado = signal(false);

  readonly menu = [
    { ruta: '/usuarios', etiqueta: 'Usuarios' },
    { ruta: '/roles', etiqueta: 'Roles' },
    { ruta: '/resenas', etiqueta: 'Reseñas' },

    { ruta: '/pagos', etiqueta: 'Pagos' },
    { ruta: '/facturas', etiqueta: 'Facturas' },
    { ruta: '/certificados', etiqueta: 'Certificados' },

    { ruta: '/cursos', etiqueta: 'Cursos' },
    { ruta: '/modulos', etiqueta: 'Módulos' },
    { ruta: '/lecciones', etiqueta: 'Lecciones' },
  ];

  alternarSidebar(): void {
    this.sidebarColapsado.update((colapsado) => !colapsado);
  }
}