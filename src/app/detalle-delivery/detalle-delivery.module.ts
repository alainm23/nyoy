import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleDeliveryPageRoutingModule } from './detalle-delivery-routing.module';

import { DetalleDeliveryPage } from './detalle-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleDeliveryPageRoutingModule
  ],
  declarations: [DetalleDeliveryPage]
})
export class DetalleDeliveryPageModule {}
