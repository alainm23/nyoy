import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TiendaCarritoPage } from './tienda-carrito.page';

const routes: Routes = [
  {
    path: '',
    component: TiendaCarritoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiendaCarritoPageRoutingModule {}
