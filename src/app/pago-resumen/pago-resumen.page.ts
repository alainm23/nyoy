import { Component, OnInit } from '@angular/core';

// Services
import { StockValidatorService } from '../services/stock-validator.service';
import { DatabaseService } from '../services/database.service';
import { NavController, LoadingController } from '@ionic/angular'; 
import { Storage } from '@ionic/storage';
import { PagoService } from '../services/pago.service';
import { EventsService } from '../services/events.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';

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
  datos_envio: any;
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

    this.datos_envio = JSON.parse ((await this.storage.get ('datos-envio')));
    console.log ('datos_envio', this.datos_envio);
    this.kilometros = this.preferencias.delivery_limite / 1000;

    if (this.datos_envio.kilometros > this.preferencias.delivery_limite) {
      this.costo_envio = this.preferencias.delivery_precio;
    }

    this.total = this.get_precio_total ();
    this.subtotal = this.total / 1.18;
    this.igv = this.subtotal * 0.18;

    if (this.subscribe == null) {
      this.subscribe = this.events.get_token_id ().subscribe (async (token_id: string) => {
        console.log (token_id);
        const loading = await this.loadingController.create({
          message: 'Espere un momento'
        });
    
        await loading.present ();
        this.pago.procesarpagonyoy (
          token_id,
          (this.total + this.costo_envio) * 100,
          this.auth.usuario.correo,
          'PEN'
          ).subscribe ((res: any) => {
            console.log ('pago', res);
            if (res.estado == 1) {
              if (res.respuesta.outcome.type == 'venta_exitosa') {
                this.add_pedido (loading);
              }
            }
          });
      });
    }
  }

  get_precio_total () {
    let total: number = 0;
    console.log ('element', this.stock_vaidator.carrito_platos);
    this.stock_vaidator.carrito_platos.forEach (element => {
      if (element.tipo === 'extra') {
        total += element.precio * element.cantidad;
        element.extras.forEach ((extra: any) => {
          total += extra.precio * extra.cantidad;
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

  async add_pedido (loading: any) {
    let platos: any [] = [];
    let empresas: any [] = [];
    let data: any = {
      id: this.database.createId (),
      dia: moment ().format ('DD'),
      mes: moment ().format ('MM'),
      anio: moment ().format ('YYYY'),
      hora: moment ().format ('HH'),
      usuario_id: await this.storage.get ('usuario_id'),
      direccion: this.datos_envio.direccion,
      monto_total: this.total + this.costo_envio,
      estado: 'pedido',
      tipo_pago: 'culqi',
      pagado: false,
      observacion: '',
      hora_finalizacion: ''
    };

    this.stock_vaidator.carrito_platos.forEach ((element: any) => {
      empresas.push (element.empresa_id);
      if (element.tipo == 'menu') {
        platos.push ({
          empresa_id: element.empresa_id,
          carta_id: element.carta_id,
          menu_nombre: element.nombre,
          menus: element.menus,
          tipo: 'menu',
          precio: element.precio,
          comentario: element.comentario
        }); 
      } else if (element.tipo == 'extra') {
        platos.push ({
          empresa_id: element.empresa_id,
          carta_id: element.carta_id,
          plato_id: element.plato.id,
          plato_nombre: element.plato.nombre,
          cantidad: element.cantidad,
          precio: element.precio,
          tipo: 'extra',
          comentarios: element.comentarios
        });
      } else if (element.tipo === 'promocion') {
        if (element.promocion_tipo === '0') {
          platos.push ({
            // empresa_id: element.empresa_id, // Falta
            carta_id: element.carta_id,
            plato_id: element.plato.id,
            plato_nombre: element.plato.nombre,
            cantidad: element.cantidad,
            precio: element.precio,
            tipo: 'promocion',
            promocion_tipo: '0',
            comentarios: element.comentarios
          });
        } else {
          platos.push ({
            carta_id: element.carta_id,
            cantidad: element.cantidad,
            precio: element.precio,
            tipo: 'promocion',
            promocion_tipo: '1',
            comentarios: element.comentarios,
            platos: element.platos
          });
        }
      }
    });
    data.platos = platos;
    data.empresas = empresas;
    console.log (data);

    this.database.add_pedido (data)
      .then (() => {
        this.storage.clear ();
        this.stock_vaidator.get_storage_values ();
        this.navController.navigateRoot ('operecion-exitosa');
        loading.dismiss ();
      })
      .catch ((error: any) => {
        console.log (error);
        loading.dismiss ();
      })
  }
}
