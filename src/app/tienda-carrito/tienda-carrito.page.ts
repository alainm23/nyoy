import { Component, OnInit } from '@angular/core';

import { StockValidatorService } from '../services/stock-validator.service';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-tienda-carrito',
  templateUrl: './tienda-carrito.page.html',
  styleUrls: ['./tienda-carrito.page.scss'],
})
export class TiendaCarritoPage implements OnInit {
  tipo_entrega: string = '0';
  constructor (
    public stock_validator: StockValidatorService,
    public alertController: AlertController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  async eliminar (item: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Esta seguro que desea cancelar este pedido?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirmar',
          handler: () => {
            this.stock_validator.eliminar_tienda_producto (item);
          }
        }
      ]
    });

    await alert.present ();
  }

  get_precio_total (list: any) {
    let total: number = 0;
    list.forEach (element => {
      total += element.precio * element.cantidad;
    });

    return total;
  }

  openCulqi () {
    console.log (this.tipo_entrega);

    if (this.tipo_entrega == '0') {
      this.navCtrl.navigateForward (['datos-envio', 'tienda']);
    } else {
      this.navCtrl.navigateForward (['datos-recojo', 'tienda']);
    }
  }

  update_cantidad (item: any, c: number) {
    console.log (item);
    this.stock_validator.update_cantidad_carrito_tienda (item, c);
  }

  editar (item: any) {
    if (item.editar === undefined) {
      item.editar = true;
    } else {
      item.editar = !item.editar;
    }
  }
}
