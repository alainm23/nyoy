import { Component, OnInit } from '@angular/core';

// Services
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

// Animations
import { trigger, state, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
export class HomePage implements OnInit {
  empresas: any [] = [];
  pedidos: any [] = [];

  subscription_1: Subscription = null;
  subscription_2: Subscription = null;
  constructor (
    public auth: AuthService,
    public database: DatabaseService,
    public navController: NavController,
    public alertController: AlertController,
    public storage: Storage,
    public loadingCtrl: LoadingController
  ) {}

  async ngOnInit () {
    const loading = await this.loadingCtrl.create ({
      message: 'Cargando información...'
    });

    loading.present ();
    
    this.subscription_1 = this.database.get_empresas ().subscribe ((res: any []) => {
      this.empresas = res.filter ((i: any) => {
        return i.habilitado;
      });

      this.check_loading (loading);
    }); 

    this.subscription_2 = this.database.get_pedidos_vigente (await this.storage.get ('usuario_id')).subscribe ((res: any []) => {
      this.pedidos = res;// .filter ((e: any) => {
      //   var today = moment ();
      //   var date = moment (e.fecha);
      //   return true;
      //   // return today.isSame (date);
      // });
      console.log (res);
      this.check_loading (loading);
    });
  }

  get_format_date (date: string) {
    return moment (date).format ('LL[ ]hh:mm a');
  }

  check_loading (loading: any) {
    if (this.subscription_1 !== null && this.subscription_2 !== null) {
      loading.dismiss ();
    }
  }

  salir () {
    this.auth.signOut ();
  }

  view_empresa (item: any) {
    this.navController.navigateForward (['empresa-menu', item.id]);
  }

  async alerta () {
    const alert = await this.alertController.create({
      message: 'Pronto, tu tienda de abarrotes en linea a tu disposición.',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });

    await alert.present();
  }

  get_pedido_color (pedido: any) {
    let returned = '#ffffff';
    if (pedido.estado <= 2) {
      returned = '#D14B51';
    } else if (pedido.estado === 3) {
      if (pedido.repartidor_llego) {
        returned = '#43CC4D';
      } else {
        returned = '#6046D1';
      }
    }

    return returned;
  }

  // ver_detalles (item: any) {
  //   console.log (item);
  //   this.navController.navigateForward (['detalle-delivery', item.id]);
  // }

  go_bodeba () {
    this.navController.navigateForward (['tienda-home']);
  }

  ver_detalles (item: any) {
    if (item.data.estado <= 2) {
      if (item.ver_detalles === undefined) {
        item.ver_detalles = true;
      } else {
        item.ver_detalles = !item.ver_detalles;
      }
    } else {
      console.log (item);
      this.navController.navigateForward (['detalle-delivery', item.data.id]);
    }
  }
} 
