import { Component } from '@angular/core';

import { Platform, MenuController, NavController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';

// Services
import { StockValidatorService } from './services/stock-validator.service';
import * as moment from 'moment';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  selected: number = 0;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private stock_validator: StockValidatorService,
    private menu: MenuController,
    public navController: NavController,
    public auth: AuthService,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp () {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.stock_validator.init ();
      moment.locale ('es');

      if (this.platform.is ('android')) {
        this.statusBar.overlaysWebView (false);
        this.statusBar.backgroundColorByHexString ('#000000');
      }
    });
  }

  open_menu () {
    this.menu.enable (true, 'first');
    this.menu.close ('first');
  }

  go_page (page: string, selected: number = 0) {
    this.selected = selected;
    if (page === 'home') {
      this.navController.navigateRoot (page);
    } else {
      this.navController.navigateForward (page);
    }
  }

  limpiar_cache () {
    this.stock_validator.limpiar_cache ();
  }

  async salir () {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Esta seguro que desea cerrar sesión?',
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
            this.auth.signOut ().then (() => {
              this.navController.navigateRoot ('login');
            });
          }
        }
      ]
    });

    await alert.present();
  }
}

