import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlatoDescripcionPage } from './plato-descripcion.page';

const routes: Routes = [
  {
    path: '',
    component: PlatoDescripcionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatoDescripcionPageRoutingModule {}
