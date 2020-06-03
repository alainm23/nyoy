import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../services/database.service';
import { Storage } from '@ionic/storage';
import { LoadingController, NavController } from '@ionic/angular';
@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
})
export class FavoritosPage implements OnInit {
  items: any [] = [];
  constructor (
    public loadingController: LoadingController,
    private database: DatabaseService,
    private storage: Storage,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    this.database.get_favoritos_by_user (await this.storage.get ('usuario_id')).subscribe ((res: any) => {
      loading.dismiss ();
      this.items = res;
      console.log (res);
    });
  }

  ver_plato (plato) {
    this.navCtrl.navigateForward (['plato-descripcion', plato.id, false]);
  }
  
  async favorito (item: any) {
    console.log (item);
    this.database.set_plato_favorito (await this.storage.get ('usuario_id'), item.data.id, !item.data.es_favorito);
  }
}
