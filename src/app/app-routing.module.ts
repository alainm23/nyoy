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
    canActivate: [AuthGuard],
    loadChildren: () => import('./empresa-menu/empresa-menu.module').then( m => m.EmpresaMenuPageModule)
  },
  {
    path: 'plato-descripcion/:id/:editar',
    canActivate: [AuthGuard],
    loadChildren: () => import('./plato-descripcion/plato-descripcion.module').then( m => m.PlatoDescripcionPageModule)
  },
  {
    path: 'pedido-resumen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pedido-resumen/pedido-resumen.module').then( m => m.PedidoResumenPageModule)
  },
  {
    path: 'promocion-descripcion/:id/:editar',
    canActivate: [AuthGuard],
    loadChildren: () => import('./promocion-descripcion/promocion-descripcion.module').then( m => m.PromocionDescripcionPageModule)
  },
  {
    path: 'datos-envio/:tipo',
    canActivate: [AuthGuard],
    loadChildren: () => import('./datos-envio/datos-envio.module').then( m => m.DatosEnvioPageModule)
  },
  {
    path: 'datos-recojo/:tipo',
    canActivate: [AuthGuard],
    loadChildren: () => import('./datos-recojo/datos-recojo.module').then( m => m.DatosRecojoPageModule)
  },
  {
    path: 'pago-resumen/:tipo',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pago-resumen/pago-resumen.module').then( m => m.PagoResumenPageModule)
  },
  {
    path: 'operecion-exitosa',
    canActivate: [AuthGuard],
    loadChildren: () => import('./operecion-exitosa/operecion-exitosa.module').then( m => m.OperecionExitosaPageModule)
  },
  {
    path: 'mi-cuenta',
    canActivate: [AuthGuard],
    loadChildren: () => import('./mi-cuenta/mi-cuenta.module').then( m => m.MiCuentaPageModule)
  },
  {
    path: 'favoritos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: 'historial-pedidos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./historial-pedidos/historial-pedidos.module').then( m => m.HistorialPedidosPageModule)
  },
  {
    path: 'detalle-delivery/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./detalle-delivery/detalle-delivery.module').then( m => m.DetalleDeliveryPageModule)
  },
  {
    path: 'tienda-home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tienda-home/tienda-home.module').then( m => m.TiendaHomePageModule)
  },
  {
    path: 'tienda-galeria-productos/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tienda-galeria-productos/tienda-galeria-productos.module').then( m => m.TiendaGaleriaProductosPageModule)
  },
  {
    path: 'tienda-carrito',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tienda-carrito/tienda-carrito.module').then( m => m.TiendaCarritoPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
