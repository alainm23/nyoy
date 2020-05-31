import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosRecojoPage } from './datos-recojo.page';

const routes: Routes = [
  {
    path: '',
    component: DatosRecojoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosRecojoPageRoutingModule {}
