import { Component, OnInit } from '@angular/core';

// Services
import { MenuController, NavController, PopoverController, LoadingController, Platform } from '@ionic/angular'; 
import { DatabaseService } from '../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { StockValidatorService } from '../services/stock-validator.service';

@Component({
  selector: 'app-promocion-descripcion',
  templateUrl: './promocion-descripcion.page.html',
  styleUrls: ['./promocion-descripcion.page.scss'],
})
export class PromocionDescripcionPage implements OnInit {
  promocion_id: string;
  promocion: any;
  _promocion: any;
  cantidad: number = 0;
  comentario: string = '';
  editar: string = 'false';
  constructor (
    public menu:MenuController,
    public navCtrl: NavController,
    public popoverController: PopoverController,
    public database: DatabaseService,
    private route: ActivatedRoute,
    public stock_validator: StockValidatorService,
    public loadingController: LoadingController,
    public platform: Platform
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Procesando informacion ...'
    });

    await loading.present ();

    this.editar = this.route.snapshot.paramMap.get ('editar');
    console.log (this.editar);

    if (this.editar === 'true') {
      this._promocion = this.stock_validator.get_backup_carrito_plato (this.route.snapshot.paramMap.get ('id'));
      console.log ('backup', this._promocion);
      this.cantidad = this._promocion.cantidad;
      this.comentario = this._promocion.comentarios;
    }

    this.promocion_id = this.route.snapshot.paramMap.get ('id');
    this.database.get_promocion_by_id (this.promocion_id).subscribe (async (res: any) => {
      this.promocion = res [0];
      console.log (res [0]);
      await loading.dismiss ();
    });

    this.platform.backButton.subscribeWithPriority (10, () => {
      if (this.editar === 'true') {
        console.log ('Boton de atras de presono');
        this.cancelar_editar ();
      }
    });
  }

  get_imagen_principal (promocion: any) {
    let imagen: string = '';
    for (let i = 0; i < promocion.platos.length; i++) {
      if (promocion.platos [i].image !== '') {
        imagen = promocion.platos [i].imagen;
        break;
      }
    }

    if (imagen !== '') {
      imagen = 'assets/img/919ffdf51c75e5a3222fd86b8afeb63e.png';
    }

    return imagen;
  }

  agregar () {
    if (this.promocion.tipo === '0') {
      if (this.stock_validator.verificar_agregar_carrito_promocion (this.promocion.empresa_id, this.promocion.insumos, this.cantidad + 1)) {
        this.cantidad++;
      }
    } else {
      let insumos: any [] = [];
      this.promocion.platos.forEach((plato: any) => {
        if (plato.tipo === 'plato') {
          plato.insumos.forEach((insumo: any) => {
            insumos.push ({
              cantidad: insumo.cantidad,
              id: insumo.id,
              insumo_id: insumo.insumo_id,
              plato_id: insumo.plato_id,
              empresa_id: plato.empresa_id
            });
          });
        } else {
          insumos.push ({
            cantidad: 1,
            id: plato.id,
            insumo_id: plato.id,
            plato_id: 0,
            empresa_id: plato.empresa_id
          });
        }
      });

      console.log (insumos);
      if (this.stock_validator.verificar_agregar_carrito_promocion_combo (insumos, this.cantidad + 1)) {
        this.cantidad++;
      }
    }
  }

  restar () {
    this.cantidad--;
    if (this.cantidad < 0) {
      this.cantidad = 0;
    }
  }

  agregar_carrito () {
    let request: any;
    if (this.promocion.tipo === '0') {
      this.promocion.insumos.forEach ((e: any) => {
        e.empresa_id = this.promocion.empresa_id;
      });

      request = {
        id: this.promocion_id,
        tipo: 'promocion',
        promocion_tipo: this.promocion.tipo,
        descripcion: this.promocion.descripcion,
        empresa_id: this.promocion.empresa_id,
        cantidad: this.cantidad,
        nombre: this.promocion.nombre,
        plato: this.promocion.plato,
        precio: this.promocion.precio_total,
        imagen: this.promocion.plato.imagen,
        carta_id: this.promocion.carta_id,
        descuento: this.promocion.descuento,
        insumos: this.promocion.insumos
      }
    } else {
      let insumos: any [] = [];
      this.promocion.platos.forEach((plato: any) => {
        if (plato.tipo === 'plato') {
          plato.insumos.forEach((insumo: any) => {
            insumos.push ({
              cantidad: insumo.cantidad,
              id: insumo.id,
              insumo_id: insumo.insumo_id,
              plato_id: insumo.plato_id,
              empresa_id: plato.empresa_id
            });
          });
        } else {
          insumos.push ({
            cantidad: 1,
            id: plato.id,
            insumo_id: plato.id,
            plato_id: 0,
            empresa_id: plato.empresa_id
          });
        }
      });

      request = {
        id: this.promocion_id,
        tipo: 'promocion',
        empresa_id: this.promocion.empresa_id,
        promocion_tipo: this.promocion.tipo,
        descripcion: this.promocion.descripcion,
        cantidad: this.cantidad,
        nombre: this.promocion.nombre,
        platos: this.promocion.platos,
        precio: this.promocion.precio_total,
        imagen: this.promocion.imagen,
        carta_id: this.promocion.carta_id,
        descuento: this.promocion.descuento,
        insumos: insumos
      }
    }

    console.log (request);
    this.stock_validator.agregar_carrito_promocion (request, this.comentario);
    
    this.comentario = '';
    this.cantidad = 0;
    this.navCtrl.back ();
  }

  go_resumen (editar: boolean) {
    if (editar) {
      this.stock_validator._carrito_platos.delete (this.route.snapshot.paramMap.get ('id'));
    }
    
    let request: any;
    if (this.promocion.tipo === '0') {
      this.promocion.insumos.forEach ((e: any) => {
        e.empresa_id = this.promocion.empresa_id;
      });

      request = {
        id: this.promocion_id,
        tipo: 'promocion',
        promocion_tipo: this.promocion.tipo,
        descripcion: this.promocion.descripcion,
        empresa_id: this.promocion.empresa_id,
        cantidad: this.cantidad,
        nombre: this.promocion.nombre,
        plato: this.promocion.plato,
        precio: this.promocion.precio_total,
        imagen: this.promocion.plato.imagen,
        carta_id: this.promocion.carta_id,
        descuento: this.promocion.descuento,
        insumos: this.promocion.insumos
      }
    } else {
      let insumos: any [] = [];
      this.promocion.platos.forEach((plato: any) => {
        if (plato.tipo === 'plato') {
          plato.insumos.forEach((insumo: any) => {
            insumos.push ({
              cantidad: insumo.cantidad,
              id: insumo.id,
              insumo_id: insumo.insumo_id,
              plato_id: insumo.plato_id,
              empresa_id: plato.empresa_id
            });
          });
        } else {
          insumos.push ({
            cantidad: 1,
            id: plato.id,
            insumo_id: plato.id,
            plato_id: 0,
            empresa_id: plato.empresa_id
          });
        }
      });

      request = {
        id: this.promocion_id,
        tipo: 'promocion',
        empresa_id: this.promocion.empresa_id,
        promocion_tipo: this.promocion.tipo,
        descripcion: this.promocion.descripcion,
        cantidad: this.cantidad,
        nombre: this.promocion.nombre,
        platos: this.promocion.platos,
        precio: this.promocion.precio_total,
        imagen: this.get_imagen_principal (this.promocion),
        carta_id: this.promocion.carta_id,
        descuento: this.promocion.descuento,
        insumos: insumos
      }
    }

    console.log (request);
    this.stock_validator.agregar_carrito_promocion (request, this.comentario);

    this.comentario = '';
    this.cantidad = 0;
    this.navCtrl.navigateForward ('pedido-resumen');
  }

  cancelar_editar () {
    let request: any;
    if (this.promocion.tipo === '0') {
      this.promocion.insumos.forEach ((e: any) => {
        e.empresa_id = this.promocion.empresa_id;
      });

      request = {
        id: this.promocion_id,
        tipo: 'promocion',
        promocion_tipo: this.promocion.tipo,
        descripcion: this.promocion.descripcion,
        empresa_id: this.promocion.empresa_id,
        cantidad: this._promocion.cantidad,
        nombre: this.promocion.nombre,
        plato: this.promocion.plato,
        precio: this.promocion.precio_total,
        imagen: this.promocion.plato.imagen,
        carta_id: this.promocion.carta_id,
        descuento: this.promocion.descuento,
        insumos: this.promocion.insumos
      }
    } else {
      let insumos: any [] = [];
      this.promocion.platos.forEach((plato: any) => {
        if (plato.tipo === 'plato') {
          plato.insumos.forEach((insumo: any) => {
            insumos.push ({
              cantidad: insumo.cantidad,
              id: insumo.id,
              insumo_id: insumo.insumo_id,
              plato_id: insumo.plato_id,
              empresa_id: plato.empresa_id
            });
          });
        } else {
          insumos.push ({
            cantidad: 1,
            id: plato.id,
            insumo_id: plato.id,
            plato_id: 0,
            empresa_id: plato.empresa_id
          });
        }
      });

      request = {
        id: this.promocion_id,
        tipo: 'promocion',
        empresa_id: this.promocion.empresa_id,
        promocion_tipo: this.promocion.tipo,
        descripcion: this.promocion.descripcion,
        cantidad: this._promocion.cantidad,
        nombre: this.promocion.nombre,
        platos: this.promocion.platos,
        precio: this.promocion.precio_total,
        imagen: this.get_imagen_principal (this.promocion),
        carta_id: this.promocion.carta_id,
        descuento: this.promocion.descuento,
        insumos: insumos
      }
    }

    console.log (request);
    this.stock_validator.agregar_carrito_promocion (request, this.comentario, true);

    this.comentario = '';
    this.cantidad = 0;
    this.navCtrl.navigateForward ('pedido-resumen');
  }

  back () {
    if (this.editar === 'true') {
      this.cancelar_editar ();
    } else {
      this.navCtrl.back ();
    }
  }
}
