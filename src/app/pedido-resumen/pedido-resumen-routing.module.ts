import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PedidoResumenPage } from './pedido-resumen.page';

const routes: Routes = [
  {
    path: '',
    component: PedidoResumenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedidoResumenPageRoutingModule {}
