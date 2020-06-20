import { Injectable } from '@angular/core';

// Services
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StockValidatorService {
  subscribe: any = null;
  subscribe_menus_dia: any = null;
  
  subscribe_elementos_menu: any;
  elementos_menu: any [] = [];
  cantidad_elementos_menu: any [] = [];

  empresas_insumos = new Map <string, number> ();

  menus_dia = new Map <string, number> ();
  carrito_menus_dia = new Map <string, number> ();
  elemento_carta_menu= new Map <string, number> ();

  carrito_insumos = new Map <string, number> ();
  carrito_platos = new Map <string, any> ();
  _carrito_platos = new Map <string, any> ();
  carrito_extras = new Map <string, any> ();
  carrito_tienda = new Map <string, any> ();
  constructor (
    private database: DatabaseService,
    private auth: AuthService,
    public toastController: ToastController,
    private storage: Storage
  ) {
    
  }

  get_backup_carrito_plato (id: string) {
    return this._carrito_platos.get (id);
  }

  init () {
    this.auth.authState ().subscribe ((user: any) => {
      if (user) {
        this.get_stock ();
        this.get_menu_dia ();
        this.get_storage_values ();
      } else {
        if (this.subscribe !== null) {
          this.subscribe.unsubscribe ();
          this.subscribe = null;
          this.subscribe_menus_dia.unsubscribe ();
        }

        if (this.subscribe_menus_dia !== null) {
          this.subscribe_menus_dia.unsubscribe ();
          this.subscribe_menus_dia = null;
        }
      }
    });
  }

  get_stock () {
    this.subscribe = this.database.get_empresas_stock ().subscribe ((res: any []) => {
      res.forEach ((i: any) => {
        this.empresas_insumos.set (i.empresa_id + '-' + i.insumo_id, i.stock);
      });
      console.log ('Stock empresa', this.empresas_insumos);
    });
  }

  get_menu_dia () {
    this.subscribe_menus_dia = this.database.get_menus_dia ().subscribe ((res: any []) => {
      res.forEach ((i: any) => {
        this.menus_dia.set (i.carta_id + '-' + i.menu_id, i.stock);
      });
    });

    this.subscribe_elementos_menu = this.database.get_menus_elementos ().subscribe ((res: any []) => {
      this.elementos_menu = res;
      res.forEach ((i: any) => {
        this.cantidad_elementos_menu [i.id] = 0;
      });
    });
  }

  async get_storage_values () {
    this.carrito_platos = new Map (JSON.parse (await this.storage.get ('carrito-platos')));
    this.carrito_insumos = new Map (JSON.parse (await this.storage.get ('carrito-insumos')));
    this.carrito_menus_dia = new Map (JSON.parse (await this.storage.get ('carrito-menus-dia')));
    
    if (this.carrito_platos === null) {
      this.carrito_platos = new Map <string, any> ();
    }

    if (this.carrito_insumos === null) {
      this.carrito_insumos = new Map <string, any> ();
    }

    if (this.carrito_menus_dia === null) {
      this.carrito_menus_dia = new Map <string, number> ();
    }

    console.log ('insumo', this.carrito_insumos);
    console.log ('carrito_platos', this.carrito_platos);
  }

  check_valid (plato: any, insumos: any [], cantidad: number) {
    let valid = true;
    insumos.forEach ((i: any) => {
      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad;
      let stock = this.check_elemento (plato.empresa_id + '-' + i.insumo_id);

      if (this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id) !== undefined) {
        pedidos = this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id);
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {
        valid = false;
      }
    });

    if (!valid) {
      this.presentToast ('El pedido excede a nuestro stock', 'danger');
    }

    return valid;
  }

  agregar_plato_extra_adicional (plato: any, insumos: any [], extras: any [], cantidad: number) {
    let valid = true;
    insumos.forEach ((i: any) => {
      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad; // 0.25
      let stock = this.check_elemento (plato.empresa_id + '-' + i.insumo_id); // 2

      if (this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id) !== undefined) {
        pedidos = this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id); // 0.25
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {// 2 < 0.25 + 0.25
        valid = false;
      }
    });

    extras.forEach ((i: any) => {
      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad;
      let stock = this.check_elemento (plato.empresa_id + '-' + i.id); // 6

      if (this.carrito_insumos.get (plato.empresa_id + '-' + i.id) !== undefined) {
        pedidos = this.carrito_insumos.get (plato.empresa_id + '-' + i.id); // 1
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {
        valid = false;
      }
    });

    if (!valid) {
      this.presentToast ('El pedido excede a nuestro stock', 'danger');
    } else {
      let nueva_cantidad = this.carrito_platos.get (plato.id).cantidad + 1;
      this.carrito_platos.get (plato.id).cantidad = nueva_cantidad;

      insumos.forEach ((i: any) => {
        if (this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id) === undefined) {
          this.carrito_insumos.set (plato.empresa_id + '-' + i.insumo_id, i.cantidad);
        } else {
          let c = this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id);
          this.carrito_insumos.set (plato.empresa_id + '-' + i.insumo_id, i.cantidad + c);
        }
      });

      extras.forEach ((e: any) => {
        if (this.carrito_insumos.get (plato.empresa_id + '-' + e.id) === undefined) {
          this.carrito_insumos.set (plato.empresa_id + '-' + e.id, e.cantidad);
        } else {
          let c = this.carrito_insumos.get (plato.empresa_id + '-' + e.id);
          this.carrito_insumos.set (plato.empresa_id + '-' + e.id, e.cantidad + c);
        }
      });

      this.storage.set ('carrito-platos', JSON.stringify (Array.from (this.carrito_platos.entries ())));
      this.storage.set ('carrito-insumos', JSON.stringify (Array.from (this.carrito_insumos.entries ())));
      this.presentToast ('Tu pedido fue agregado al carrito de compras', 'success');
    }
  }
  
  verificar_agregar_carrito_promocion_combo (insumos: any [], cantidad: number) {
    let valid = true;

    insumos.forEach ((i: any) => {
      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad;
      let stock = this.check_elemento (i.empresa_id + '-' + i.insumo_id);

      if (this.carrito_insumos.get (i.empresa_id + '-' + i.insumo_id) !== undefined) {
        pedidos = this.carrito_insumos.get (i.empresa_id + '-' + i.insumo_id);
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {
        valid = false;
      }
    });


    if (!valid) {
      this.presentToast ('El pedido excede a nuestro stock', 'danger');
    }

    return valid;
  }

  verificar_agregar_carrito_promocion (empresa_id: string, insumos: any [], cantidad: number) {
    let valid = true;

    insumos.forEach ((i: any) => {
      let pedidos = 0;
      let pedidos_acuales = cantidad * i.cantidad;
      let stock = this.check_elemento (empresa_id + '-' + i.insumo_id);

      if (this.carrito_insumos.get (empresa_id + '-' + i.insumo_id) !== undefined) {
        pedidos = this.carrito_insumos.get (empresa_id + '-' + i.insumo_id);
      }

      if (stock === undefined || stock < pedidos_acuales + pedidos) {
        valid = false;
      }
    });


    if (!valid) {
      this.presentToast ('El pedido excede a nuestro stock', 'danger');
    }

    return valid;
  }

  agregar_carrito (plato: any, insumos: any [], cantidad: number, extras: any [], comentario: string, cancelar: boolean=false) {
    console.log ('insumos', insumos);
    console.log ('extras', extras);
    if (this.carrito_platos.get (plato.id) === undefined) {
      let _extras: any [] = [];
      extras.forEach ((e: any) => {
        _extras.push ({
          id: e.insumo_id,
          nombre: e.menu_nombre,
          precio: e.precio,
          cantidad: e.cantidad
        });
      });

      this.carrito_platos.set (plato.id, {
        id: plato.id,
        tipo: 'extra',
        nombre: plato.nombre,
        imagen: plato.imagen,
        resumen: plato.resumen,
        precio: plato.precio,
        cantidad: cantidad,
        empresa_id: plato.empresa_id,
        carta_id: plato.carta_id,
        extras: _extras,
        comentarios: comentario.trim (),
        plato: plato, // Variables apoyo
        insumos: insumos // Variables apoyo
      });
    } else {
      let c = this.carrito_platos.get (plato.id).cantidad + cantidad;
      let _extras = this.carrito_platos.get (plato.id).extras;
      extras.forEach ((e: any) => {
        if (_extras.find (x => x.id === e.insumo_id) === undefined) {
          _extras.push ({
            id: e.insumo_id,
            nombre: e.menu_nombre,
            precio: e.precio,
            cantidad: e.cantidad
          });
        } else {
          let tmp = _extras.find (x => x.id === e.insumo_id).cantidad + e.cantidad;
          _extras.find (x => x.id === e.insumo_id).cantidad = tmp;
        }
      });
      let comentarios = this.carrito_platos.get (plato.id).comentarios;
      if (comentario !== '') {
        comentarios += '\n' + comentario.trim ();
      }

      this.carrito_platos.set (plato.id, {
        tipo: 'extra',
        id: plato.id,
        nombre: plato.nombre,
        imagen: plato.imagen,
        resumen: plato.resumen,
        precio: plato.precio,
        cantidad: c,
        empresa_id: plato.empresa_id,
        comentarios: comentarios,
        carta_id: plato.carta_id,
        extras: _extras,
        plato: plato,
        insumos: insumos,
      });
    }
  
    insumos.forEach ((i: any) => {
      if (this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id) === undefined) {
        this.carrito_insumos.set (plato.empresa_id + '-' + i.insumo_id, i.cantidad * cantidad);
      } else {
        let c = this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id);
        this.carrito_insumos.set (plato.empresa_id + '-' + i.insumo_id, (c + i.cantidad * cantidad));
      }
    });

    extras.forEach ((e: any) => {
      if (this.carrito_insumos.get (e.empresa_id + '-' + e.insumo_id) === undefined) {
        this.carrito_insumos.set (e.empresa_id + '-' + e.insumo_id, e.cantidad);
      } else {
        let c = this.carrito_insumos.get (e.empresa_id + '-' + e.insumo_id);
        this.carrito_insumos.set (e.empresa_id + '-' + e.insumo_id, e.cantidad + c);
      }
    });

    this.storage.set ('carrito-platos', JSON.stringify (Array.from (this.carrito_platos.entries ())));
    this.storage.set ('carrito-insumos', JSON.stringify (Array.from (this.carrito_insumos.entries ())));
    if (!cancelar) {
      this.presentToast ('Tu pedido fue agregado al carrito de compras', 'success');
    }
  }

  check_carrito_plato (id: string) {
    if (this.carrito_platos.get (id) !== undefined) {
      return this.carrito_platos.get (id).cantidad;
    }

    return 0; 
  }

  check_elemento (id: string) {
    return this.empresas_insumos.get (id);
  }

  remove_plato (plato: any, insumos: any []) {
    if (this.carrito_platos.get (plato.id) !== undefined) {
      let c = this.carrito_platos.get (plato.id).cantidad;
      let extras = this.carrito_platos.get (plato.id).extras;
      if (c >= 1) {
        c -= 1;  
        if (c <= 0) {
          this.carrito_platos.delete (plato.id);

          insumos.forEach ((i: any) => {
            this.carrito_insumos.delete (plato.empresa_id + '-' + i.insumo_id);
          });
        } else {
          this.carrito_platos.set (plato.id, {
            id: plato.id,
            tipo: 'extra',
            nombre: plato.nombre,
            imagen: plato.imagen,
            resumen: plato.resumen,
            precio: plato.precio,
            cantidad: c,
            empresa_id: plato.empresa_id,
            carta_id: plato.carta_id,
            extras: extras,
            plato: plato,
            insumos: insumos
          });

          insumos.forEach ((i: any) => {
            if (this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id) === undefined) {
              this.carrito_insumos.set (plato.empresa_id + '-' + i.insumo_id, 0);
            } else {
              let c = this.carrito_insumos.get (plato.empresa_id + '-' + i.insumo_id);
              if (c > 0) {
                this.carrito_insumos.set (plato.empresa_id + '-' + i.insumo_id, c - i.cantidad);
              }
            }
          });
        }
      }
    }
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

  add_extra_plato (plato: any, insumo: any, type: string) {
    if (type === 'add') {
      if (this.carrito_platos.get (plato.id) !== undefined) {
        this.carrito_platos.get (plato.id).extras.push ({
          id: insumo.insumo_id,
          nombre: insumo.menu_nombre,
          precio: insumo.precio
        });
      }
    } else {
      if (this.carrito_platos.get (plato.id) !== undefined) {
        let extras = this.carrito_platos.get (plato.id).extras;
        for (var i = 0; i < extras.length; i++) { 
          if (extras [i].id == insumo.insumo_id) {
            extras.splice (i, 1); 
          }
        }
        this.carrito_platos.get (plato.id).extras = extras;
      }
    }
  }

  check_extra (plato: any, insumo_id: string) {
    let returned = false;
    if (this.carrito_platos.get (plato.id) !== undefined) {
      if (this.carrito_platos.get (plato.id).extras !== undefined) {
        if (this.carrito_platos.get (plato.id).extras.find (x => x.id === insumo_id) !== undefined) {
          returned = true;
        }
      }
    }

    return returned;
  }

  check_elemento_menu (id: string) {
    return this.menus_dia.get (id);
  }

  check_menu (menu_dia: any, cantidad: number) {
    let valid = true;

    let pedidos = 0;
    let pedidos_acuales = cantidad;
    let stock = this.check_elemento_menu (menu_dia.carta_id + '-' + menu_dia.menu_id);
    
    if (this.carrito_menus_dia.get (menu_dia.carta_id + '-' + menu_dia.id) !== undefined) {
      pedidos = this.carrito_menus_dia.get (menu_dia.carta_id + '-' + menu_dia.id);
    }

    if (stock === undefined || stock < pedidos_acuales + pedidos) {
      valid = false;
    }

    if (!valid) {
      this.presentToast ('El pedido excede a nuestro stock', 'danger');
    } else {
      this.cantidad_elementos_menu [menu_dia.elemento_menu_id] = this.cantidad_elementos_menu [menu_dia.elemento_menu_id] + 1;
    }

    return {
      valid: valid,
      cantidad_elementos_menu: this.cantidad_elementos_menu,
      menus_completos: this.calcular_menus_completos ()
    };
  }

  calcular_menus_completos () {
    let mayor = 0;  
    for  (let key in this.cantidad_elementos_menu) {
      if (this.cantidad_elementos_menu [key] > mayor) {
        mayor = this.cantidad_elementos_menu [key];
      }
    }

    let menus_completos: number = mayor; // 1
    for (let index = mayor; index > 0; index--) {
      let completo: boolean = true;
      for (let key in this.cantidad_elementos_menu) {
        if (this.cantidad_elementos_menu [key] < index) { // 0 < 1
          completo = false;
          menus_completos--;
          break;
        }
      }
    }

    return menus_completos;
  }

  restar_check_menu (menu_dia: any) {
    this.cantidad_elementos_menu [menu_dia.elemento_menu_id] = this.cantidad_elementos_menu [menu_dia.elemento_menu_id] - 1;
    if (this.cantidad_elementos_menu [menu_dia.elemento_menu_id] < 0) {
      this.cantidad_elementos_menu [menu_dia.elemento_menu_id] = 0;
    }
    
    return {
      cantidad_elementos_menu: this.cantidad_elementos_menu,
      menus_completos: this.calcular_menus_completos ()
    }
  }

  limpiar_cantidad_elementos_menu () {
    this.elementos_menu.forEach ((i: any) => {
      this.cantidad_elementos_menu [i.id] = 0;
    });
    console.log ('cantidad_elementos_menu', this.cantidad_elementos_menu);
  }

  agregar_carrito_menu (request: any, carta_id: string) {
    request.menus.forEach(element => {
      if (this.carrito_menus_dia.get (carta_id + '-' + element.id) === undefined) {
        this.carrito_menus_dia.set (carta_id + '-' + element.id, element.cantidad);
      } else {
        let c = this.carrito_menus_dia.get (carta_id + '-' + element.id);
        this.carrito_menus_dia.set (carta_id + '-' + element.id, c + element.cantidad);
      }
    });

    this.limpiar_cantidad_elementos_menu ();

    this.carrito_platos.set (request.id, request);
    this.storage.set ('carrito-platos', JSON.stringify (Array.from (this.carrito_platos.entries ())));
    this.storage.set ('carrito-menus-dia', JSON.stringify (Array.from (this.carrito_menus_dia.entries ())));
    this.presentToast ('Tu pedido fue agregado al carrito de compras', 'success');
  }

  agregar_carrito_promocion (request: any, comentario: string, cancelar: boolean = false) {
    if (this.carrito_platos.get (request.id) === undefined) {
      request.comentarios = comentario;
      this.carrito_platos.set (request.id, request);
    } else {
      let insumos = this.carrito_platos.get (request.id).insumos;
      let comentarios = this.carrito_platos.get (request.id).comentarios;
      let cantidad = this.carrito_platos.get (request.id).cantidad;
      
      request.insumos.forEach(element => {
        if (insumos.find (x => x.insumo_id === element.insumo_id) === undefined) {
          insumos.push (element); 
        } else {
          let tmp = insumos.find (x => x.insumo_id === element.insumo_id);
          tmp.cantidad += element.cantidad;
        }
      });
      if (comentario !== '') {
        comentarios += '\n' + comentario;
      }
      cantidad += request.cantidad

      let tmp = this.carrito_platos.get (request.id);
      tmp.insumos = insumos;
      tmp.comentarios = comentarios;
      tmp.cantidad = cantidad;

      this.carrito_platos.set (request.id, tmp);
    }
    
    request.insumos.forEach ((i: any) => {
      console.log ('insumos', i);
      if (this.carrito_insumos.get (i.empresa_id + '-' + i.insumo_id) === undefined) {
        this.carrito_insumos.set (i.empresa_id + '-' + i.insumo_id, i.cantidad * request.cantidad);
      } else {
        let c = this.carrito_insumos.get (i.empresa_id + '-' + i.insumo_id);
        this.carrito_insumos.set (i.empresa_id + '-' + i.insumo_id, c + (i.cantidad * request.cantidad));
      }
    });

    this.storage.set ('carrito-platos', JSON.stringify (Array.from (this.carrito_platos.entries ())));
    this.storage.set ('carrito-insumos', JSON.stringify (Array.from (this.carrito_insumos.entries ())));
    if (!cancelar) {
      this.presentToast ('Tu pedido fue agregado al carrito de compras', 'success');
    }
  } 

  check_insumo_extra_disponible (id: string) {
    if (this.empresas_insumos.get (id) === undefined) {
      return false;
    }

    return this.empresas_insumos.get (id) > 0;
  }

  check_add_extra_cantidad (item: any, cantidad: number) {
    let pedidos = 0;
    if (this.carrito_insumos.get (item.empresa_id + '-' + item.insumo_id) !== undefined) {
      pedidos = this.carrito_insumos.get (item.empresa_id + '-' + item.insumo_id);
    }

    if (this.empresas_insumos.get (item.empresa_id + '-' + item.insumo_id) === undefined) {
      return false;
    }

    return this.empresas_insumos.get (item.empresa_id + '-' + item.insumo_id) >= cantidad + pedidos;
  }

  inicializar_arreglo_menu () {
    this.cantidad_elementos_menu.forEach ((d: any) => {
      d = 0;
    });
  }

  eliminar_plato (key: string) {
    let item = this.carrito_platos.get (key);
    console.log (item);
    if (item.tipo === 'menu') {
      item.menus.forEach (element => {
        if (this.carrito_menus_dia.get (item.carta_id + '-' + element.id) !== undefined) {
          let c = this.carrito_menus_dia.get (item.carta_id + '-' + element.id);
          this.carrito_menus_dia.set (item.carta_id + '-' + element.id, c - element.cantidad);
        }
      });
      this.carrito_platos.delete (key);
    } else if (item.tipo === 'extra') {
      item.extras.forEach (element => {
        if (this.carrito_insumos.get (item.empresa_id + '-' + element.id) !== undefined) {
          let c = this.carrito_insumos.get (item.empresa_id + '-' + element.id);
          this.carrito_insumos.set (item.empresa_id + '-' + element.id, c - element.cantidad);
        }
      });

      item.insumos.forEach (element => {// 3 pollos - 0.5
        if (this.carrito_insumos.get (item.empresa_id + '-' + element.insumo_id) !== undefined) {
          let c = this.carrito_insumos.get (item.empresa_id + '-' + element.insumo_id);
          this.carrito_insumos.set (item.empresa_id + '-' + element.insumo_id, c - (element.cantidad * item.cantidad));
        }
      });
      this.carrito_platos.delete (key);
    } else if (item.tipo === 'promocion') {
      item.insumos.forEach (element => {
        if (this.carrito_insumos.get (element.empresa_id + '-' + element.insumo_id) !== undefined) {
          let c = this.carrito_insumos.get (element.empresa_id + '-' + element.insumo_id);
          this.carrito_insumos.set (element.empresa_id + '-' + element.insumo_id, c - (element.cantidad * item.cantidad));
        }
      });
      this.carrito_platos.delete (key);
    }

    this.storage.set ('carrito-platos', JSON.stringify (Array.from (this.carrito_platos.entries ())));
    this.storage.set ('carrito-menus-dia', JSON.stringify (Array.from (this.carrito_menus_dia.entries ())));
    this.storage.set ('carrito-insumos', JSON.stringify (Array.from (this.carrito_insumos.entries ())));
  }

  async limpiar_cache () {
    await this.storage.clear ();
  }

  agregar_carrito_tienda (productos: any []) {
    productos.forEach ((producto: any) => {
      if (this.carrito_tienda.get (producto.id) === undefined) {
        this.carrito_tienda.set (producto.id, producto);
      } else {
        let tmp = this.carrito_tienda.get (producto.id);
        tmp.cantidad += producto.cantidad;

        if (tmp.cantidad > tmp.stock) {
          tmp.cantidad = tmp.stock;
        }

        this.carrito_tienda.set (producto.id, tmp);
      }
    });
    
    console.log ('para carrito', this.carrito_tienda);
  }

  update_cantidad_carrito_tienda (producto: any, cantidad: number) {
    if (this.carrito_tienda.get (producto.id) !== undefined) {
      let tmp = this.carrito_tienda.get (producto.id);
        tmp.cantidad += cantidad;

      if (tmp.cantidad > tmp.stock) {
        tmp.cantidad = tmp.stock;
      }

      if (tmp.cantidad < 0) {
        tmp.cantidad = 0;
      }

      this.carrito_tienda.set (producto.id, tmp);
    }
  }

  eliminar_tienda_producto (producto: any) {
    this.carrito_tienda.delete (producto.id);
  }
}
