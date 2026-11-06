import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Resenas } from './pages/cuenta/resenas/resenas';
import { Roles } from './pages/cuenta/roles/roles';
import { Usuarios } from './pages/cuenta/usuarios/usuarios';
import { Cursos } from './pages/cuenta/cursos/cursos';
import { Modulos } from './pages/cuenta/modulos/modulos';
import { Lecciones } from './pages/cuenta/lecciones/lecciones';
import { Inscripciones } from './pages/cuenta/inscripciones/inscripciones';
import { Progresos } from './pages/cuenta/progresos/progresos';
import { Evaluaciones } from './pages/cuenta/evaluaciones/evaluaciones';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
      { path: 'usuarios', component: Usuarios },
      { path: 'roles', component: Roles },
      { path: 'resenas', component: Resenas },
      { path: 'cursos', component: Cursos },
      { path: 'modulos', component: Modulos },
      { path: 'lecciones', component: Lecciones },
      { path: 'inscripciones', component: Inscripciones },
      { path: 'progresos', component: Progresos },
      { path: 'evaluaciones', component: Evaluaciones },
      { path: '**', redirectTo: 'usuarios' },
    ],
  },
];
