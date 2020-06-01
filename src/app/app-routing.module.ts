import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'slides',
    loadChildren: () => import('./slides/slides.module').then( m => m.SlidesPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'sing-up',
    loadChildren: () => import('./sing-up/sing-up.module').then( m => m.SingUpPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'empresa-menu/:id',
    loadChildren: () => import('./empresa-menu/empresa-menu.module').then( m => m.EmpresaMenuPageModule)
  },
  {
    path: 'plato-descripcion/:id',
    loadChildren: () => import('./plato-descripcion/plato-descripcion.module').then( m => m.PlatoDescripcionPageModule)
  },
  {
    path: 'pedido-resumen',
    loadChildren: () => import('./pedido-resumen/pedido-resumen.module').then( m => m.PedidoResumenPageModule)
  },
  {
    path: 'promocion-descripcion/:id',
    loadChildren: () => import('./promocion-descripcion/promocion-descripcion.module').then( m => m.PromocionDescripcionPageModule)
  },
  {
    path: 'datos-envio',
    loadChildren: () => import('./datos-envio/datos-envio.module').then( m => m.DatosEnvioPageModule)
  },
  {
    path: 'datos-recojo',
    loadChildren: () => import('./datos-recojo/datos-recojo.module').then( m => m.DatosRecojoPageModule)
  },
  {
    path: 'pago-resumen',
    loadChildren: () => import('./pago-resumen/pago-resumen.module').then( m => m.PagoResumenPageModule)
  },
  {
    path: 'operecion-exitosa',
    loadChildren: () => import('./operecion-exitosa/operecion-exitosa.module').then( m => m.OperecionExitosaPageModule)
  },
  {
    path: 'mi-cuenta',
    loadChildren: () => import('./mi-cuenta/mi-cuenta.module').then( m => m.MiCuentaPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
