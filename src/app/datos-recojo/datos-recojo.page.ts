import { Component, OnInit } from '@angular/core';

// Services
import { StockValidatorService } from '../services/stock-validator.service';
import { DatabaseService } from '../services/database.service';
import { NavController, LoadingController, MenuController } from '@ionic/angular'; 
import { Storage } from '@ionic/storage';
import { PagoService } from '../services/pago.service';
import { EventsService } from '../services/events.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-datos-recojo',
  templateUrl: './datos-recojo.page.html',
  styleUrls: ['./datos-recojo.page.scss'],
})
export class DatosRecojoPage implements OnInit {
  tipo_recojo: string = 'rapido';
  proceso: number = 0;
  hora_seleccionada: string = '11:45';

  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;
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

  ngOnInit () {
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
          this.total * 100,
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

  escoger_hora (val: string) {
    this.hora_seleccionada = val;
    this.proceso = 1;
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
    this.pago.cfgFormulario ("Pago por el pedido", this.total * 100);

    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    loading.present ();

    loading.dismiss ().then (async () => {
      await this.pago.open ();
    });
  }

  async add_pedido (loading: any) {
    let hora_seleccionada = '';
    if (this.tipo_recojo === 'horario') {
      hora_seleccionada = this.hora_seleccionada;
    }

    let platos: any [] = [];
    let empresas: any [] = [];
    let data: any = {
      id: this.database.createId (),
      dia: moment ().format ('DD'),
      mes: moment ().format ('MM'),
      anio: moment ().format ('YYYY'),
      hora: moment ().format ('HH'),
      usuario_id: await this.storage.get ('usuario_id'),
      monto_total: this.total,
      tipo_recojo: this.tipo_recojo,
      hora_seleccionada: hora_seleccionada,
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
