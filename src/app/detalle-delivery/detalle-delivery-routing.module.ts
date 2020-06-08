import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleDeliveryPage } from './detalle-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleDeliveryPageRoutingModule {}
