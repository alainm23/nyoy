import { Component, OnInit, ViewChild } from '@angular/core';

// Services
import { MenuController, NavController, PopoverController, IonSlides, IonContent } from '@ionic/angular'; 
import { DatabaseService } from '../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { StockValidatorService } from '../services/stock-validator.service';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-empresa-menu',
  templateUrl: './empresa-menu.page.html',
  styleUrls: ['./empresa-menu.page.scss'],
})
export class EmpresaMenuPage implements OnInit {
  @ViewChild ('slideWithNav2', { static: false }) slides_empresa: IonSlides;
  @ViewChild ('slideWithNav3', { static: false }) slides_carta: IonSlides;
  @ViewChild (IonContent) content: IonContent;

  sliderTwo: any;
  usuario_id: string = '';
  //Configuration for each Slider
  slideOptsTwo = {
    slidesPerView: 1,
    centeredSlides: true,
    spaceBetween: 10
  };

  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 3
  };
  size: number = 3;
  empresas: any [] = [];
  menu_elementos: any [] = [];
  menus: any [] = [];
  menus_dia: any [] = [];
  menus_dia_seleccionado: any [] = [];
  empresa_seleccionada: any;
  carta_seleccionada: any;
  loading_empresas: boolean = true;
  loading_carta: boolean = true;
  loading_platos: boolean = true;
  menu_dia_comentario: string = '';
  get_menu_elementos_by_carta: any;
  carta_current_index:  number = 0;
  constructor (
    public menu:MenuController,
    public navCtrl: NavController,
    public popoverController: PopoverController,
    public database: DatabaseService,
    private route: ActivatedRoute,
    public stock_validator: StockValidatorService,
    private storage: Storage
  ) {
    //Item object for Food
    this.sliderTwo =
    {
      isBeginningSlide: true,
      isEndSlide: false,
    };
  }

  ngOnInit () {
    this.storage.get ('usuario_id').then ((usuario_id) => {
      this.usuario_id = usuario_id;
    });

    this.database.get_empresas ().subscribe ((res: any []) => {
      this.empresas = res;
      this.loading_empresas = false;

      this.database.get_menus_elementos ().subscribe ((res: any) => {
        this.menus = res;
      });

      this.database.get_menus_dia ().subscribe ((res: any []) => {
        this.menus_dia = res;
      });

      setTimeout(() => {
        this.goSlideToId (this.route.snapshot.paramMap.get ('id'));
      }, 350);
    });
  }

  ionViewDidLeave () {
    this.stock_validator.limpiar_cantidad_elementos_menu ();
  }

  async slidesEmpresaChanged (event: any) {
    this.get_cartas_by_empresa (
       this.empresas [await this.slides_empresa.getActiveIndex ()]
    );
  }

  get_cartas_by_empresa (item: any) {
    if (item !== undefined) {
      this.empresa_seleccionada = item;
      this.loading_carta = true;
      if (item.cartas === undefined) {
        this.database.get_cartas_by_empresa (item.id).subscribe ((res: any []) => {
          item.cartas = res.sort ((a: any, b: any) => {
            if (a.orden > b.orden) {
              return 1;
            }

            if (a.orden < b.orden) {
              return -1
            }

            return 0;
          });
          this.loading_carta = false;
          this.slidesCartaChanged (null);
        });
      } else {
        this.slidesCartaChanged (null);
        this.loading_carta = false;
      }
    }
  }

  async slidesCartaChanged (event: any) {
    this.slides_carta.getActiveIndex ().then ((index) => {
      this.carta_current_index = index;
    });
    
    this.carta_seleccionada = this.empresa_seleccionada.cartas [await this.slides_carta.getActiveIndex ()];
    this.menus_dia_seleccionado = [];

    if (this.carta_seleccionada !== undefined) {
      if (this.carta_seleccionada.tipo_carta === '0') {
        if (this.carta_seleccionada.menus_dia === undefined) {
          this.database.get_menu_elementos_by_carta (this.carta_seleccionada.id).subscribe ((res: any []) => {
            this.carta_seleccionada.menus_dia = res;
            this.get_menu_elementos_by_carta = res;
          });
        }
      } else if (this.carta_seleccionada.tipo_carta === '1') {
        if (this.carta_seleccionada.platos === undefined) {
          this.loading_platos = true;
          this.database.get_platos_by_carta (this.carta_seleccionada.id).subscribe ((res: any) => {
            this.carta_seleccionada.platos = res;
            this.loading_platos = false;
            this.check_cantidad_platos ();
          });
        } else {
          this.loading_platos = false;
          this.check_cantidad_platos ();
        }
      } else if (this.carta_seleccionada.tipo_carta === '2') {
        if (this.carta_seleccionada.promociones === undefined) {
          this.loading_platos = true;
          this.database.get_promociones_by_carta (this.carta_seleccionada.id).subscribe ((res: any) => {
            this.carta_seleccionada.promociones = res;
            console.log ('proocomio', res);
            this.loading_platos = false;
          });
        }
      }
    } else {
      this.loading_platos = false;
    }
  }

  goSlideToId (id: string) {
    let index = this.get_slide_index_by_id (id);
    if (index !== null) {
      this.slides_empresa.slideTo (index);
    }

    if (index === 0) {
      this.get_cartas_by_empresa (this.empresas [index]);
    }
  }

  get_slide_index_by_id (id: string) {
    let returned: number = 0;
    let index: number = 0;
    this.empresas.forEach ((empresa: any) => {
      if (empresa.id == id) {
        returned = index;
      }

      index++
    });

    return returned;
  }

  get_empresa_by_id (id: string) {
    let returned = undefined;
    this.empresas.forEach ((empresa: any) => {
      if (empresa.id === id) {
        returned = empresa;
      }
    });

    return returned;
  }

  //Move to Next slide
  slideNext (object, slideView) {
    slideView.slideNext(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
  }

  //Move to previous slide
  slidePrev (object, slideView) {
    slideView.slidePrev(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });;
  }

  //Method called when slide is changed by drag or navigation
  SlideDidChange (object, slideView) {
    this.checkIfNavDisabled(object, slideView);
  }

  //Call methods to check if slide is first or last to enable disbale navigation  
  checkIfNavDisabled (object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }

  checkisBeginning (object, slideView) {
    slideView.isBeginning().then((istrue) => {
      object.isBeginningSlide = istrue;
    });
  }
  checkisEnd (object, slideView) {
    slideView.isEnd().then((istrue) => {
      object.isEndSlide = istrue;
    });
  }

  async check_slide_active (item: any) {
    // if (this.empresa_seleccionada.cartas [await this.slides_carta.getActiveIndex ()].id === item.id) {
    //   return true
    // }

    return false;
  }

  add_carrito (plato: any) { 
    // this.stock_validator.check_valid (plato.data, plato.insumos);
    // this.check_plato_cantidad (plato);
  }

  remove_carrito (plato: any) {
    this.stock_validator.remove_plato (plato.data, plato.insumos);
    this.check_plato_cantidad (plato);
  }

  ver_plato (plato: any) {
    this.navCtrl.navigateForward (['plato-descripcion', plato.id, false]);
  }

  check_plato_cantidad (plato) {
    plato.cantidad = this.stock_validator.check_carrito_plato (plato.data.id);
  }

  ionViewDidEnter () {
    this.check_cantidad_platos ();
  }

  check_cantidad_platos () {
    if (this.carta_seleccionada !== undefined) {
      if (this.carta_seleccionada.platos !== undefined) {
        this.carta_seleccionada.platos.forEach ((plato: any) => {
          this.check_plato_cantidad (plato);
        });
      }
    }
  }

  get_menus_dia (list: any [], carta: any) {
    return list.filter ((i: any) => {
      return i.carta_id
    });
  }

  add_menu_dia_carrito (menu_dia: any) {
    if (menu_dia.cantidad_solicitado === undefined) {
      menu_dia.cantidad_solicitado = 0;
    }

    if (this.carta_seleccionada !== undefined) {
      let res: any = this.stock_validator.check_menu (menu_dia, menu_dia.cantidad_solicitado + 1);
      if (res.valid) {
        if (this.menus_dia_seleccionado.find (x => x.id === menu_dia.id) === undefined) {
          this.menus_dia_seleccionado.push ({
            id: menu_dia.id,
            nombre: menu_dia.menu_nombre,
            cantidad: 1
          });
        } else {
          let tmp = this.menus_dia_seleccionado.find (x => x.id === menu_dia.id).cantidad;
          this.menus_dia_seleccionado.find (x => x.id === menu_dia.id).cantidad = tmp + 1;
        }

        menu_dia.cantidad_solicitado += 1;
        this.carta_seleccionada.cantidad_elementos_menu = res.cantidad_elementos_menu;
        this.carta_seleccionada.menus_completos = res.menus_completos;

        console.log (this.carta_seleccionada.cantidad_elementos_menu);
      }
    }
  }

  remove_menu_dia_carrito (menu_dia: any) {
    if (this.carta_seleccionada !== undefined) {
      if (menu_dia.cantidad_solicitado === undefined) {
        menu_dia.cantidad_solicitado = 0
      } else {
        menu_dia.cantidad_solicitado--;
        if (menu_dia.cantidad_solicitado < 0) {
          menu_dia.cantidad_solicitado = 0;
        }

        let res = this.stock_validator.restar_check_menu (menu_dia);
        this.carta_seleccionada.cantidad_elementos_menu = res.cantidad_elementos_menu;
        this.carta_seleccionada.menus_completos = res.menus_completos;

        if (this.menus_dia_seleccionado.find (x => x.id === menu_dia.id) !== undefined) {
          let tmp = this.menus_dia_seleccionado.find (x => x.id === menu_dia.id).cantidad;
          this.menus_dia_seleccionado.find (x => x.id === menu_dia.id).cantidad = tmp - 1;
        }
      }
    }
  }

  check_elemento_extra (menu_completo: number, id: string) {
    if (menu_completo === undefined) {
      return 0;
    }

    if (this.carta_seleccionada.cantidad_elementos_menu [id] === undefined) {
      return 0;
    }

    return this.carta_seleccionada.cantidad_elementos_menu [id] - menu_completo;
  }

  get_precio_total (carta_seleccionada: any, menus_completos: number, cantidad_elementos_menu: any [], menus_dia: any []) {
    let precio = 0;
    if (menus_completos === undefined) {
      menus_completos = 0;
    }

    if (cantidad_elementos_menu === undefined) {
      cantidad_elementos_menu = [];
    }

    precio += (carta_seleccionada.precio * menus_completos);
    for (let key in cantidad_elementos_menu) {
      let cantidad = cantidad_elementos_menu [key] - menus_completos;
      precio += cantidad * (menus_dia.find ((x: any) => x.data.id === key).data.precio);
    }

    return precio;
  }

  agregar_carrito_menu (menus_completos: number, cantidad_elementos_menu: any [], menus_dia: any [], pagar: boolean =  false) {
    let menus: any [] = [];
    this.menus_dia_seleccionado.forEach ((m: any) => {
      if (m.cantidad > 0) {
        menus.push (m);
      }
    });

    let request: any = {
      id: this.database.createId (),
      empresa_id: this.empresa_seleccionada.id,
      carta_id: this.carta_seleccionada.id,
      nombre: this.carta_seleccionada.nombre,
      imagen: this.carta_seleccionada.imagen,
      tipo: 'menu',
      precio: this.get_precio_total (this.carta_seleccionada, menus_completos, cantidad_elementos_menu, menus_dia),
      menus: menus,
      comentario: this.menu_dia_comentario
    }

    console.log (request);

    this.stock_validator.agregar_carrito_menu (request, this.carta_seleccionada.id);
    this.menu_dia_comentario = '';
    this.menus_dia_seleccionado = [];
    cantidad_elementos_menu = [];
    this.carta_seleccionada.cantidad_elementos_menu = [];
    this.carta_seleccionada.menus_completos = 0;
    this.content.scrollToTop (500);
    menus_dia.forEach ((x: any) => {
      x.menus_dia.forEach ((y: any) => {
        y.cantidad_solicitado = 0;
      });
    });
    if (pagar) {
      this.navCtrl.navigateForward (['pedido-resumen']);  
    }
  }

  ver_promocion (promocion: any) {
    this.navCtrl.navigateForward (['promocion-descripcion', promocion.id, false]);
  }

  get_imagen (promocion: any) {
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

  slideTo (i: number) {
    this.slides_carta.slideTo (i);
  }
}
