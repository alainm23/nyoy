import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../services/database.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

@Component({
  selector: 'app-historial-pedidos',
  templateUrl: './historial-pedidos.page.html',
  styleUrls: ['./historial-pedidos.page.scss'],
})
export class HistorialPedidosPage implements OnInit {
  items: any [] = [];
  _items: any [] = [];
  empresas: any [] = [];
  constructor (
    public storage: Storage,
    public database: DatabaseService) { }

  async ngOnInit () {
    let usuario_id = await this.storage.get ('usuario_id');
    this.database.get_pedidos_by_usuario (usuario_id).subscribe ((res: any []) => {
      console.log (res);
      this.items = res;
      this._items = res;
    });

    this.database.get_empresas ().subscribe ((res: any []) => {
      this.empresas = res;
      console.log (res);
    });
  }

  get_format_date (date: string) {
    return moment (date).format ('LLL');
  }

  ver_detalles (item: any) {
    if (item.ver_detalles === undefined) {
      item.ver_detalles = true;
    } else {
      item.ver_detalles = !item.ver_detalles;
    }
  }

  select_changed (val: any) {
    console.log (val);
    this.items = this._items;
    if (val !== 'todos') {
      this.items = this.items.filter ((i: any) => {
        console.log ('return', i.pedido.empresas.indexOf (val.id));
        return !(i.pedido.empresas.indexOf (val.id) <= -1);
      });
    }
  }
}
