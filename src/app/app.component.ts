import { Component } from '@angular/core';

import { Platform, MenuController, NavController } from '@ionic/angular';
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
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private stock_validator: StockValidatorService,
    private menu: MenuController,
    public navController: NavController,
    public auth: AuthService
  ) {
    this.initializeApp();
  }

  initializeApp () {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.stock_validator.init ();
      moment.locale ('es');
    });
  }

  open_menu () {
    this.menu.enable (true, 'first');
    this.menu.close ('first');
  }

  go_page (page: string) {
    this.navController.navigateForward (page);
  }

  limpiar_cache () {
    this.stock_validator.limpiar_cache ();
  }
}

