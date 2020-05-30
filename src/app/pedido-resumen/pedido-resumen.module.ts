import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidoResumenPageRoutingModule } from './pedido-resumen-routing.module';

import { PedidoResumenPage } from './pedido-resumen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidoResumenPageRoutingModule
  ],
  declarations: [PedidoResumenPage]
})
export class PedidoResumenPageModule {}
