import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapaSelectPageRoutingModule } from './mapa-select-routing.module';

import { MapaSelectPage } from './mapa-select.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapaSelectPageRoutingModule
  ],
  declarations: [MapaSelectPage]
})
export class MapaSelectPageModule {}
