import { Component, OnInit } from '@angular/core';

// Services
import { StockValidatorService } from '../services/stock-validator.service';
import { DatabaseService } from '../services/database.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular'; 
import { Storage } from '@ionic/storage';
import { PagoService } from '../services/pago.service';
import { EventsService } from '../services/events.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pago-resumen',
  templateUrl: './pago-resumen.page.html',
  styleUrls: ['./pago-resumen.page.scss'],
})
export class PagoResumenPage implements OnInit {
  tipo: string = '';

  metodo_pago: string = 'culqi';
  costo_envio: number = 0;
  kilometros: number = 0;
  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;
  preferencias: any;
  subscribe: any = null;
  datos_envio: any;
  constructor (
    public stock_validator: StockValidatorService,
    private storage: Storage,
    private loadingController: LoadingController,
    private navController: NavController,
    private database: DatabaseService,
    private pago: PagoService,
    private events: EventsService,
    private auth: AuthService,
    public alertController: AlertController,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit () {
    this.tipo = this.route.snapshot.paramMap.get ('tipo');

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

    if (this.total > this.preferencias.delivery_precio_gratis) {
      this.costo_envio = 0;
    }

    if (this.subscribe == null) {
      this.subscribe = this.events.get_token_id ().subscribe (async (token_id: string) => {
        console.log (token_id);
        const loading = await this.loadingController.create({
          message: 'Espere un momento...'
        });
    
        await loading.present ();
        this.pago.procesarpagonyoy (
          token_id,
          Math.round ((this.total + this.costo_envio) * 100),
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
    if (this.metodo_pago === 'culqi') {
      console.log ('Monto', Math.round ((this.total + this.costo_envio) * 100));
      this.pago.cfgFormulario ("Pago por el pedido", Math.round((this.total + this.costo_envio) * 100));

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
            cssClass: 'secondary'
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
    let platos: any [] = [];
    let empresas: any [] = [];
    
    let data: any = {
      id: this.database.createId (),
      tipo_pedido: 'delivery',
      dia: moment ().format ('DD'),
      mes: moment ().format ('MM'),
      anio: moment ().format ('YYYY'),
      hora: moment ().format ('hh'),
      minuto: moment ().format ('mm'),
      fecha: moment ().format ().toString (),
      usuario_id: await this.storage.get ('usuario_id'),
      usuario_token: await this.storage.get ('token_id'),
      usuario_nombre: this.auth.usuario.nombre,
      direccion: this.datos_envio.direccion,
      latitud: this.datos_envio.latitude,
      longitud: this.datos_envio.longitude,
      telefono: this.datos_envio.telefono,
      referencia: this.datos_envio.referencia,
      monto_total: this.total + this.costo_envio,
      estado: 0,
      repartidor_llego: false,
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
          cantidad: element.cantidad,
          medida: element.medida,
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
        }, error => {
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
      });
  }
}
