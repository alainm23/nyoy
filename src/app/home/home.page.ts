import { Component, OnInit } from '@angular/core';

// Services
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  empresas: any [] = [];

  constructor (
    public auth: AuthService,
    public database: DatabaseService,
    public navController: NavController,
    public alertController: AlertController
  ) {}

  ngOnInit () {
    this.database.get_empresas ().subscribe ((res: any []) => {
      this.empresas = res.filter ((i: any) => {
        return i.habilitado;
      });
      
      console.log ('items', res);
    }); 
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
} 
