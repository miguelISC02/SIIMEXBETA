import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing').then(m => m.LandingComponent),
  },
  {
    path: 'convocatorias',
    loadComponent: () =>
      import('./pages/convocatorias/convocatorias').then(m => m.ConvocatoriasComponent),
  },
  {
    path: 'investigadores',
    loadComponent: () =>
      import('./pages/investigadores/investigadores').then(m => m.InvestigadoresComponent),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil').then(m => m.PerfilComponent),
  },
  {
    path: 'postulacion',
    loadComponent: () =>
      import('./pages/postulacion/postulacion').then(m => m.PostulacionComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro').then(m => m.RegistroComponent),
  },

  {
    path: 'trayectoria',
    loadComponent: () =>
      import('./pages/trayectoria/trayectoria').then(m => m.TrayectoriaComponent),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/contacto/contacto').then(m => m.ContactoComponent),
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones').then(m => m.PublicacionesComponent),
  },
  {
    path: 'recuperacion',
    loadComponent: () =>
      import('./pages/recuperacion/recuperacion').then(m => m.RecuperacionComponent),
  },
  {
    path: 'registro-step2',
    loadComponent: () =>  
      import('./pages/registro-step2/registro-step2').then(m => m.RegistroStep2Component),
  },
  {
    path: 'login',
    loadComponent: () =>  
      import('./pages/login/login').then(m => m.loginComponent),
  },

  { path: '**', redirectTo: 'login' },
];

export default routes;
