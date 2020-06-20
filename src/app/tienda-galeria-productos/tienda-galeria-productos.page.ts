import { Component, OnInit, ViewChild } from '@angular/core';

// Services
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { StockValidatorService } from '../services/stock-validator.service';
import { LoadingController, NavController, IonSlides, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tienda-galeria-productos',
  templateUrl: './tienda-galeria-productos.page.html',
  styleUrls: ['./tienda-galeria-productos.page.scss'],
})
export class TiendaGaleriaProductosPage implements OnInit {
  @ViewChild (IonSlides) slides: IonSlides;
  categoria: any;
  subcategorias: any [] = [];
  productos: any [] = [];
  _productos: any [] = [];
  categoria_seleccionada: string = 'todos';
  search_text: string = '';

  slideOpts: any = {
    initialSlide: 0,
    slidesPerView: 3
  }
  constructor (
    private route: ActivatedRoute,
    private database: DatabaseService,
    private loadingController: LoadingController,
    public stock_validator: StockValidatorService,
    private navController: NavController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    this.database.get_tienda_categoria_by_id (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any) => {
      this.categoria = res;
    });

    this.database.get_tienda_sub_categorias_by_categoria (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any) => {
      this.subcategorias = res;
      loading.dismiss ();
    });

    this.database.get_tienda_productos_by_categoria (this.route.snapshot.paramMap.get ('id')).subscribe ((res: any []) => {
      this.productos = res.filter ((p: any) => {
        p.cantidad = 0;
        return true;
      });
      this._productos = res;
    });
  }

  filtrar (subcategoria_id: string) {
    this.categoria_seleccionada = subcategoria_id;
    this.productos = this._productos;
    if (this.categoria_seleccionada !== 'todos') {
      this.productos = this.productos.filter ((producto: any) => {
        return producto.subcategoria_id === subcategoria_id;
      });
    }
  }

  filtrar_by_text () {
    this.productos = this._productos;
    if (this.search_text.trim () !== '') {
      this.productos = this.productos.filter ((p: any) => {
        return p.nombre.toLowerCase ().indexOf (this.search_text.toLowerCase ()) > -1; 
      });
    }
  }

  update_cantidad (item: any, s: number) {
    item.cantidad += s;

    if (item.cantidad > item.stock) {
      item.cantidad = item.stock;
    }

    if (item.cantidad < 0) {
      item.cantidad = 0;
    }
  }

  registrar_carrito (mas: boolean) {
    let productos: any [] = [];
    this.productos.forEach ((p: any) => {
      if (p.cantidad > 0) {
        let marca_id = p.marca_id;
        if (p.marca_id === undefined || p.marca_id === null) {
          marca_id = '';
        }
        productos.push ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          categoria_id: p.categoria_id,
          marca_id: marca_id,
          medida: p.medida,
          stock: p.stock,
          precio: p.precio_venta,
          imagen: p.imagen
        });
      }
    });
    console.log (productos);
    this.stock_validator.agregar_carrito_tienda (productos);

    this.productos.forEach ((p: any) => {
      p.cantidad = 0;
    });

    if (mas) {
      this.navController.navigateBack ('tienda-home');
      this.presentToast ('Tu pedido fue agregado al carrito de compras', 'success');
    } else {
      this.navController.navigateForward ('tienda-carrito');
    }
  }

  slidesEmpresaChanged () {
    this.slides.getActiveIndex ().then ((index: any) => {
      console.log (index);
      if (index === 0) {
        this.categoria_seleccionada = 'todos';
      } else {
        this.categoria_seleccionada = this.subcategorias [index-1].id;
      }

      this.filtrar (this.categoria_seleccionada);
    });
  }

  slideTo (i: number) {
    this.slides.slideTo (i+1);
  }

  async presentToast (message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'bottom',
      color: color,
      duration: 2.5 * 1000,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    });

    await toast.present ();
  }
}
