import { Component, OnInit } from '@angular/core';

// Services
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MenuController, NavController, PopoverController, LoadingController } from '@ionic/angular'; 
import { DatabaseService } from '../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { StockValidatorService } from '../services/stock-validator.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-plato-descripcion',
  templateUrl: './plato-descripcion.page.html',
  styleUrls: ['./plato-descripcion.page.scss'],
})
export class PlatoDescripcionPage implements OnInit {
  plato: any = {
    data: {
      imagen: ''
    }
  };
  extras: any [] = [];
  form: FormGroup;
  cantidad: number = 0;
  es_favorito: boolean = false;
  constructor (
    public menu:MenuController,
    public navCtrl: NavController,
    public popoverController: PopoverController,
    public database: DatabaseService,
    private route: ActivatedRoute,
    public stock_validator: StockValidatorService,
    public loadingController: LoadingController,
    public auth: AuthService
  ) { }

  async ngOnInit () {
    this.form = new FormGroup({
      id: new FormControl (this.route.snapshot.paramMap.get ('id'), [Validators.required]),
      comentario: new FormControl ('', [Validators.required])
    });

    const loading = await this.loadingController.create({
      message: 'Procesando informacion ...'
    });

    await loading.present ();

    this.database.get_plato_by_id (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any) => {
      this.plato = res [0];
      // this.plato.cantidad = this.stock_validator.check_carrito_plato (this.plato.data.id);
      this.database.get_extras_by_carta (this.plato.data.carta_id).subscribe (async (res: any []) => {
        this.extras = res;
        this.extras.forEach ((e: any) => {
          e.cantidad = 0;
        });

        await loading.dismiss ();
      });

      this.database.is_plato_favorito (this.auth.usuario.id, this.route.snapshot.paramMap.get ('id')).subscribe ((favorito) => {
        if (favorito === undefined) {
          this.es_favorito = false;
        } else {
          this.es_favorito = true;
        }
  
        console.log (this.es_favorito);
      });
    });
  }

  add_carrito () {
    if (this.stock_validator.check_valid (this.plato.data, this.plato.insumos, this.cantidad + 1)) {
      this.cantidad += 1;
    }
  }

  remove_carrito () {
    this.cantidad -= 1;
    if (this.cantidad < 0) {
      this.cantidad = 0;
    }
  }

  back () {
    this.navCtrl.back ();
  }

  go_resumen () {
    this.stock_validator.agregar_carrito (this.plato.data, this.plato.insumos, this.cantidad, this.extras, this.form.value.comentario);
    this.form.reset ();
    this.cantidad = 0;
    this.extras.forEach ((e: any) => {
      e.cantidad = 0;
    });
    this.navCtrl.navigateForward ('pedido-resumen');
  }

  agregar_carrito () {
    this.stock_validator.agregar_carrito (this.plato.data, this.plato.insumos, this.cantidad, this.extras, this.form.value.comentario);
    this.form.reset ();
    this.cantidad = 0;
    this.extras.forEach ((e: any) => {
      e.cantidad = 0;
    });
    this.navCtrl.back ();
  }

  update_extra_cantidad (item: any, tipo: number) {
    if (tipo === +1) {
      if (this.stock_validator.check_add_extra_cantidad (item, item.cantidad + 1)) {
        item.cantidad += 1;
      }
    } else {
      item.cantidad -= 1;
      if (item.cantidad < 0) {
        item.cantidad = 0;
      }
    }
  }

  favorito () {
    this.database.set_plato_favorito (this.auth.usuario.id, this.route.snapshot.paramMap.get ('id'), !this.es_favorito);
  }
}
