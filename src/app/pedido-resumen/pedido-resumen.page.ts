import { Component, OnInit } from '@angular/core';

// Services
import { MenuController, NavController, PopoverController, LoadingController, AlertController } from '@ionic/angular'; 
import { DatabaseService } from '../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { StockValidatorService } from '../services/stock-validator.service';
import { Storage } from '@ionic/storage';
import { PagoService } from '../services/pago.service';
import { EventsService } from '../services/events.service';

// Animations
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-pedido-resumen',
  templateUrl: './pedido-resumen.page.html',
  styleUrls: ['./pedido-resumen.page.scss'],
  animations: [
    trigger('animation-top', [
      transition(':enter',
        [style({ transform: 'translateY(-5%)', opacity: 0 }),
        animate('125ms', style({ transform: 'translateY(0)', 'opacity': 1 }))]),
      transition(':leave',
        [style({ transform: 'translateY(0)', 'opacity': 1 }),
        animate('125ms', style({ transform: 'translateY(-5%)', 'opacity': 0 }))])
    ])
  ]
})
export class PedidoResumenPage implements OnInit {
  subscribe: any = null;
  tipo_entrega: string = '0';
  constructor (
    public menu:MenuController,
    public navCtrl: NavController,
    public popoverController: PopoverController,
    public database: DatabaseService,
    private route: ActivatedRoute,
    public stock_validator: StockValidatorService,
    public loadingController: LoadingController,
    private storage: Storage,
    public alertController: AlertController,
    public pago: PagoService,
    public events: EventsService
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create ({
      message: 'Cargando metodo de pago...'
    });

    loading.present ();

    loading.dismiss ().then (() => {
      this.pago.initCulqi ();
    });
  }
  
  getKeys (map: any){
    return Array.from (map.keys ());
  }

  add_carrito (item: any) {
    console.log (item);
    this.stock_validator.agregar_plato_extra_adicional (item.value, item.value.insumos, item.value.extras, item.value.cantidad);
  }

  remove_carrito (item: any) {
    console.log (item);
  }

  get_precio_total (list: any) {
    let total: number = 0;
    list.forEach (element => {
      if (element.tipo === 'extra') {
        total += element.precio * element.cantidad;
        element.extras.forEach ((extra: any) => {
          total += extra.precio * extra.cantidad;
        });
      } else {
        total += element.precio;
      }
    });

    return total;
  }

  get_extras_precio (extras: any []) {
    let total: number = 0;
    extras.forEach ((extra: any) => {
      total += extra.precio * extra.cantidad;
    });

    return total;
  }

  async eliminar_plato (item: any) {
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
            this.stock_validator.eliminar_plato (item.key);
          }
        }
      ]
    });

    await alert.present ();
  }

  async openCulqi (list: any) {
    console.log (this.tipo_entrega);

    if (this.tipo_entrega == '0') {
      this.navCtrl.navigateForward (['datos-envio', 'restaurante']);
    } else {
      this.navCtrl.navigateForward (['datos-recojo', 'restaurante']);
    }
  }

  ver_detalles (item: any) {
    if (item.ver_detalles === undefined) {
      item.ver_detalles = true;
    } else {
      item.ver_detalles = !item.ver_detalles;
    }
  }

  editar_extra (item: any) {
    console.log (item);
    this.navCtrl.navigateForward (['plato-descripcion', item.key, true]);
    this.stock_validator._carrito_platos.set (item.key, item.value);
    this.stock_validator.eliminar_plato (item.key);
  }

  editar_promocion (item) {
    console.log (item);
    this.navCtrl.navigateForward (['promocion-descripcion', item.key, true]);
    this.stock_validator._carrito_platos.set (item.key, item.value);
    this.stock_validator.eliminar_plato (item.key);
  }
}
