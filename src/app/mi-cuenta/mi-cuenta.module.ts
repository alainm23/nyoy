import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MiCuentaPageRoutingModule } from './mi-cuenta-routing.module';

import { MiCuentaPage } from './mi-cuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MiCuentaPageRoutingModule
  ],
  declarations: [MiCuentaPage]
})
export class MiCuentaPageModule {}
