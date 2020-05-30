import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromocionDescripcionPageRoutingModule } from './promocion-descripcion-routing.module';

import { PromocionDescripcionPage } from './promocion-descripcion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PromocionDescripcionPageRoutingModule
  ],
  declarations: [PromocionDescripcionPage]
})
export class PromocionDescripcionPageModule {}
