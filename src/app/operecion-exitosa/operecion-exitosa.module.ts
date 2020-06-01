import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OperecionExitosaPageRoutingModule } from './operecion-exitosa-routing.module';

import { OperecionExitosaPage } from './operecion-exitosa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OperecionExitosaPageRoutingModule
  ],
  declarations: [OperecionExitosaPage]
})
export class OperecionExitosaPageModule {}
