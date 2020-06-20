import { Component, OnInit } from '@angular/core';

// Services
import { StockValidatorService } from '../services/stock-validator.service';
import { DatabaseService } from '../services/database.service';
import { NavController, LoadingController, MenuController, AlertController } from '@ionic/angular'; 
import { Storage } from '@ionic/storage';
import { PagoService } from '../services/pago.service';
import { EventsService } from '../services/events.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-datos-recojo',
  templateUrl: './datos-recojo.page.html',
  styleUrls: ['./datos-recojo.page.scss'],
})
export class DatosRecojoPage implements OnInit {
  tipo: string = '';

  tipo_pago: string = 'culqi';
  tipo_recojo: string = 'rapido';
  proceso: number = 0;
  hora_seleccionada: string = '11:45';

  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;
  subscribe: any = null;
  constructor (
    public stock_validator: StockValidatorService,
    private storage: Storage,
    private loadingController: LoadingController,
    private navController: NavController,
    private database: DatabaseService,
    private pago: PagoService,
    private events: EventsService,
    private auth: AuthService,
    private alertController: AlertController,
    private menu: MenuController,
    private route: ActivatedRoute
  ) { }

  async ngOnInit () {
    this.tipo = this.route.snapshot.paramMap.get ('tipo');

    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ()
    loading.dismiss ().then (() => {
      this.pago.initCulqi ();
    });

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
          Math.round (this.total * 100),
          this.auth.usuario.correo,
          'PEN'
          ).subscribe ((res: any) => {
            console.log ('pago', res);
            if (res.estado == 1) {
              if (res.respuesta.outcome.type == 'venta_exitosa') {
                this.add_pedido ('culqi', loading);
              }
            }
          });
      });
    }
  }

  select_hora (val: string) {
    this.hora_seleccionada = val;
  }

  escoger_hora () {
    this.proceso = 1;
  }

  get_precio_total () {
    let total: number = 0;

    if (this.tipo === 'restaurante') {
      this.stock_validator.carrito_platos.forEach (element => {
        if (element.tipo === 'extra') {
          total += element.precio * element.cantidad;
          element.extras.forEach ((extra: any) => {
            total += extra.precio * extra.cantidad;
          });
        } else {
          total += element.precio;
        }
      });
    } else {
      this.stock_validator.carrito_tienda.forEach (element => {
        total += element.precio * element.cantidad;
      });
    }

    return total;
  }

  ionViewDidLeave () {
    if (this.subscribe !== null) {
      this.subscribe.unsubscribe ();
      this.subscribe = null;
    }
  }
  
  async open_culqi () {
    if (this.tipo_pago === 'culqi') {
      console.log ('monto', Math.round (this.total * 100));
      this.pago.cfgFormulario ("Pago por el pedido", Math.round (this.total * 100));

      const loading = await this.loadingController.create({
        message: 'Espere un momento'
      });

      loading.present ();

      loading.dismiss ().then (async () => {
        await this.pago.open ();
      });
    } else {
      const alert = await this.alertController.create({
        header: 'Confirmar operacion',
        message: 'Procederemos a registrar su pedido, ¿Esta seguro?',
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
            handler: async () => {
              const loading = await this.loadingController.create({
                message: 'Espere un momento'
              });
          
              await loading.present ();

              this.add_pedido ('contra_entrega', loading);
            }
          }
        ]
      });
  
      await alert.present();
    }
  }

  async add_pedido (tipo_pago: string, loading: any) {
    let hora_seleccionada = '';
    if (this.tipo_recojo === 'horario') {
      hora_seleccionada = this.hora_seleccionada;
    }

    let platos: any [] = [];
    let empresas: any [] = [];
    let data: any = {
      id: this.database.createId (),
      tipo_pedido: 'recojo',
      dia: moment ().format ('DD'),
      mes: moment ().format ('MM'),
      anio: moment ().format ('YYYY'),
      hora: moment ().format ('hh'),
      minuto: moment ().format ('mm'),
      fecha: moment ().format ().toString (),
      usuario_id: await this.storage.get ('usuario_id'),
      usuario_token: await this.storage.get ('token_id'),
      usuario_nombre: this.auth.usuario.nombre,
      monto_total: this.total,
      tipo_recojo: this.tipo_recojo,
      hora_seleccionada: hora_seleccionada,
      estado: 0,
      tipo_pago: tipo_pago,
      pagado: false,
      observacion: '',
      hora_finalizacion: '',
      tipo: this.tipo
    };

    if (this.tipo === 'restaurante') {
      this.stock_validator.carrito_platos.forEach ((element: any) => {
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
            comentarios: element.comentarios,
            extras: element.extras
          });
        } else if (element.tipo === 'promocion') {
          if (element.promocion_tipo === '0') {
            platos.push ({
              empresa_id: element.empresa_id,
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
              empresa_id: element.empresa_id,
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
      data.empresas = empresas;
    } else {
      let productos: any [] = [];
      this.stock_validator.carrito_tienda.forEach ((element: any) => {
        productos.push ({
          id: element.id,
          nombre: element.nombre,
          medida: element.medida,
          cantidad: element.cantidad,
          precio: element.precio,
          categoria_id: element.categoria_id,
          marca_id: element.marca_id,
        });
      });

      platos.push ({
        tipo: 'tienda',
        productos: productos,
      })
    }

    data.platos = platos;
    console.log (data);

    const push_data: any = {
      titulo: 'Pedido solicitado',
      detalle: 'Se registro un nuevo pedido',
      mode: 'tags',
      tokens: 'Administrador',
      clave: data.id
    };

    this.database.add_pedido (data)
      .then (() => {
        this.pago.send_notification (push_data).subscribe (response => {
          // console.log ("Notificacion Enviada...", response);
        }, error => {
          // console.log ("Notificacion Error...", error);
        });

        this.storage.remove ('datos-envio');
        this.storage.remove ('carrito-platos');
        this.storage.remove ('carrito-insumos');
        this.storage.remove ('carrito-menus-dia');

        this.stock_validator.limpiar_cantidad_elementos_menu ();
        this.stock_validator.get_storage_values ();
        this.stock_validator.carrito_tienda.clear ();
        this.navController.navigateRoot ('operecion-exitosa');
        loading.dismiss ();
      })
      .catch ((error: any) => {
        console.log (error);
        loading.dismiss ();
      })
  }

  back () {
    this.navController.back ();
  }

  open_menu () {
    this.menu.enable (true, 'first');
    this.menu.close ('first');
  }
}
