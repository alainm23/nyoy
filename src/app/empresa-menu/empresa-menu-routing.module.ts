import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresaMenuPage } from './empresa-menu.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresaMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresaMenuPageRoutingModule {}
