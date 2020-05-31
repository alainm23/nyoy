import { Component, OnInit } from '@angular/core';

// Services
import { StockValidatorService } from '../services/stock-validator.service';
import { DatabaseService } from '../services/database.service';
import { NavController, LoadingController } from '@ionic/angular'; 
import { Storage } from '@ionic/storage';
import { PagoService } from '../services/pago.service';
import { EventsService } from '../services/events.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pago-resumen',
  templateUrl: './pago-resumen.page.html',
  styleUrls: ['./pago-resumen.page.scss'],
})
export class PagoResumenPage implements OnInit {
  costo_envio: number = 0;
  kilometros: number = 0;
  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;
  preferencias: any;
  subscribe: any = null;
  constructor (
    public stock_vaidator: StockValidatorService,
    private storage: Storage,
    private loadingController: LoadingController,
    private navController: NavController,
    private database: DatabaseService,
    private pago: PagoService,
    private events: EventsService,
    private auth: AuthService
  ) { }

  async ngOnInit () {
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    this.preferencias = await this.database.get_preferencias ();
    loading.dismiss ().then (() => {
      this.pago.initCulqi ();
    });

    let datos_envio = JSON.parse ((await this.storage.get ('datos-envio')));
    console.log ('datos_envio', datos_envio);
    this.kilometros = this.preferencias.delivery_limite / 1000;

    if (datos_envio.kilometros > this.preferencias.delivery_limite) {
      this.costo_envio = this.preferencias.delivery_precio;
    }

    this.total = this.get_precio_total ();
    this.subtotal = this.total / 1.18;
    this.igv = this.subtotal * 0.18;

    if (this.subscribe == null) {
      this.subscribe = this.events.get_token_id ().subscribe ((token_id: string) => {
        console.log (token_id);

        this.pago.procesarpagonyoy (
          token_id,
          (this.total + this.costo_envio) * 100,
          this.auth.usuario.correo,
          'PEN'
          ).subscribe ((res: any) => {
            console.log ('pago', res);
            if (res.estado == 1) {
              if (res.respuesta.outcome.type == 'venta_exitosa') {
                this.navController.navigateRoot ('operecion-exitosa');
              }
            }
          });
      });
    }
  }

  get_precio_total () {
    let total: number = 0;
    this.stock_vaidator.carrito_platos.forEach (element => {
      console.log ('element', element);
      if (element.tipo === 'extra') {
        total += element.precio * element.cantidad;
        element.extras.forEach ((extra: any) => {
          total += extra.precio;
        });
      } else {
        total += element.precio;
      }
    });

    console.log (total);
    return total;
  }

  ionViewDidLeave () {
    if (this.subscribe !== null) {
      this.subscribe.unsubscribe ();
      this.subscribe = null;
    }
  }
  
  async open_culqi () {
    this.pago.cfgFormulario ("Pago por el pedido", (this.total + this.costo_envio) * 100);

    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    loading.present ();

    loading.dismiss ().then (async () => {
      await this.pago.open ();
    });
  }

  formato () {
    this.stock_vaidator.carrito_platos.forEach (element => {
      console.log ('element', element);
    });
  }
}
