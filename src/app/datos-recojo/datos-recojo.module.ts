import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosRecojoPageRoutingModule } from './datos-recojo-routing.module';

import { DatosRecojoPage } from './datos-recojo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosRecojoPageRoutingModule
  ],
  declarations: [DatosRecojoPage]
})
export class DatosRecojoPageModule {}
