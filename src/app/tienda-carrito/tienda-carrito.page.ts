import { Component, OnInit } from '@angular/core';

import { StockValidatorService } from '../services/stock-validator.service';
import { AlertController, NavController, LoadingController } from '@ionic/angular';

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
    private navCtrl: NavController,
    private loadingController: LoadingController
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

  async openCulqi () {
    const loading = await this.loadingController.create({
      message: 'Verificando...'
    });

    loading.present ();

    let valido = await this.stock_validator.validar_carrito_tienda ();

    loading.dismiss ();

    if (valido) {
      let item: any;
      for (item of this.stock_validator.carrito_tienda) {
        this.stock_validator.carrito_tienda.get (item [1].id).valido = true;
      }

      if (this.tipo_entrega == '0') {
        this.navCtrl.navigateForward (['datos-envio', 'tienda']);
      } else {
        this.navCtrl.navigateForward (['datos-recojo', 'tienda']);
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Error en el pedido',
        message: 'Lo sentimos, hay algunos productos que han superado nuestro stock (Hemos resaltado en rojo los productos agotados)',
        buttons: [
          {
            text: 'Editar',
            handler: () => {
            }
          }
        ]
      });
  
      await alert.present ();
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

  check_disabled () {
    let valido: boolean = false;
    let item: any;
    for (item of this.stock_validator.carrito_tienda) {
      if (item [1].cantidad > item [1].stock) {
        valido = true;
      }
    }
    
    return valido;
  }
}
