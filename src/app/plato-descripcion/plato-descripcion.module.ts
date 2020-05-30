import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlatoDescripcionPageRoutingModule } from './plato-descripcion-routing.module';

import { PlatoDescripcionPage } from './plato-descripcion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlatoDescripcionPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [PlatoDescripcionPage]
})
export class PlatoDescripcionPageModule {}
