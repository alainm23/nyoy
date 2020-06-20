import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../services/database.service';
// import { Storage } from '@ionic/storage';
import { LoadingController, NavController } from '@ionic/angular';
import { StockValidatorService } from '../services/stock-validator.service';

@Component({
  selector: 'app-tienda-home',
  templateUrl: './tienda-home.page.html',
  styleUrls: ['./tienda-home.page.scss'],
})
export class TiendaHomePage implements OnInit {
  items: any [] = [];
  constructor (
    private database: DatabaseService,
    private loadingController: LoadingController,
    public stock_validator: StockValidatorService,
    private navController: NavController) { }
    
  async ngOnInit () {
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    this.database.get_tienda_categorias ().subscribe ((res: any) => {
      loading.dismiss ();
      this.items = res;
    });
  }

  go_galeria (item: any) {
    this.navController.navigateForward (['tienda-galeria-productos', item.id]);
  }
}
