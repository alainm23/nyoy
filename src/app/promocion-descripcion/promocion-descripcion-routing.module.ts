import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromocionDescripcionPage } from './promocion-descripcion.page';

const routes: Routes = [
  {
    path: '',
    component: PromocionDescripcionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromocionDescripcionPageRoutingModule {}
