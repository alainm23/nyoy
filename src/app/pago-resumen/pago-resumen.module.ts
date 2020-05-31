import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagoResumenPageRoutingModule } from './pago-resumen-routing.module';

import { PagoResumenPage } from './pago-resumen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagoResumenPageRoutingModule
  ],
  declarations: [PagoResumenPage]
})
export class PagoResumenPageModule {}
