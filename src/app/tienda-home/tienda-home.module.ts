import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TiendaHomePageRoutingModule } from './tienda-home-routing.module';

import { TiendaHomePage } from './tienda-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiendaHomePageRoutingModule
  ],
  declarations: [TiendaHomePage]
})
export class TiendaHomePageModule {}
