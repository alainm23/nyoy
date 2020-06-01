import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MiCuentaPage } from './mi-cuenta.page';

const routes: Routes = [
  {
    path: '',
    component: MiCuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiCuentaPageRoutingModule {}
