import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosEnvioPageRoutingModule } from './datos-envio-routing.module';

import { DatosEnvioPage } from './datos-envio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosEnvioPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [DatosEnvioPage]
})
export class DatosEnvioPageModule {}
