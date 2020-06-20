import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TiendaCarritoPageRoutingModule } from './tienda-carrito-routing.module';

import { TiendaCarritoPage } from './tienda-carrito.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiendaCarritoPageRoutingModule
  ],
  declarations: [TiendaCarritoPage]
})
export class TiendaCarritoPageModule {}
