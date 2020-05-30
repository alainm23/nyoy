import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaMenuPageRoutingModule } from './empresa-menu-routing.module';

import { EmpresaMenuPage } from './empresa-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaMenuPageRoutingModule
  ],
  declarations: [EmpresaMenuPage]
})
export class EmpresaMenuPageModule {}
