import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TiendaHomePage } from './tienda-home.page';

const routes: Routes = [
  {
    path: '',
    component: TiendaHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiendaHomePageRoutingModule {}
