import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TiendaGaleriaProductosPage } from './tienda-galeria-productos.page';

const routes: Routes = [
  {
    path: '',
    component: TiendaGaleriaProductosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiendaGaleriaProductosPageRoutingModule {}
