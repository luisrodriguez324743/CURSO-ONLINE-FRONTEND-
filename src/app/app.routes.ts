import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Resenas } from './pages/cuenta/resenas/resenas';
import { Roles } from './pages/cuenta/roles/roles';
import { Usuarios } from './pages/cuenta/usuarios/usuarios';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
      { path: 'usuarios', component: Usuarios },
      { path: 'roles', component: Roles },
      { path: 'resenas', component: Resenas },
      { path: '**', redirectTo: 'usuarios' },
    ],
  },
];
