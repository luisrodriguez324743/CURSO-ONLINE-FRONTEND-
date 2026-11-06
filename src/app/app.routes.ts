import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Resenas } from './pages/cuenta/resenas/resenas';
import { Roles } from './pages/cuenta/roles/roles';
import { Usuarios } from './pages/cuenta/usuarios/usuarios';

import { Pagos } from './pages/cuenta/pagos/pagos';
import { Facturas } from './pages/cuenta/facturas/facturas';
import { Certificados } from './pages/cuenta/certificados/certificados';

import { Cursos } from './pages/cuenta/cursos/cursos';
import { Modulos } from './pages/cuenta/modulos/modulos';
import { Lecciones } from './pages/cuenta/lecciones/lecciones';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },

      { path: 'usuarios', component: Usuarios },
      { path: 'roles', component: Roles },
      { path: 'resenas', component: Resenas },

      { path: 'pagos', component: Pagos },
      { path: 'facturas', component: Facturas },
      { path: 'certificados', component: Certificados },

      { path: 'cursos', component: Cursos },
      { path: 'modulos', component: Modulos },
      { path: 'lecciones', component: Lecciones },

      { path: '**', redirectTo: 'usuarios' },
    ],
  },
];
