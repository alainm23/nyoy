import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosEnvioPage } from './datos-envio.page';

const routes: Routes = [
  {
    path: '',
    component: DatosEnvioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosEnvioPageRoutingModule {}
