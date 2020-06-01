import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperecionExitosaPage } from './operecion-exitosa.page';

const routes: Routes = [
  {
    path: '',
    component: OperecionExitosaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperecionExitosaPageRoutingModule {}
