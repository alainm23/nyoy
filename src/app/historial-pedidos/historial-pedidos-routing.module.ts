import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialPedidosPage } from './historial-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialPedidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialPedidosPageRoutingModule {}
