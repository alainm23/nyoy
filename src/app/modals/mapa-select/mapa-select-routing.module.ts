import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapaSelectPage } from './mapa-select.page';

const routes: Routes = [
  {
    path: '',
    component: MapaSelectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaSelectPageRoutingModule {}
