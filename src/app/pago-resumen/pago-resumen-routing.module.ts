import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoResumenPage } from './pago-resumen.page';

const routes: Routes = [
  {
    path: '',
    component: PagoResumenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoResumenPageRoutingModule {}
