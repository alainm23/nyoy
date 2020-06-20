import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TiendaGaleriaProductosPageRoutingModule } from './tienda-galeria-productos-routing.module';

import { TiendaGaleriaProductosPage } from './tienda-galeria-productos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiendaGaleriaProductosPageRoutingModule
  ],
  declarations: [TiendaGaleriaProductosPage]
})
export class TiendaGaleriaProductosPageModule {}
