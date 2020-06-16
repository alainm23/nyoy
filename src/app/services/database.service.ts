import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { first } from 'rxjs/operators';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

import { map } from 'rxjs/operators';
import { combineLatest, of } from "rxjs/index";
import * as moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor (
    public afs: AngularFirestore
  ) { }

  create_user (data: any) {
    return this.afs.collection ('Usuarios').doc (data.id).set (data);
  }

  get_usuario (id: string) {
    // return this.afs.collection ('Usuarios').doc (id).valueChanges ().pipe (first ()).toPromise ();
    return this.afs.collection ('Usuarios').doc (id).valueChanges ();
  }

  updateToken (uid: string, userId: string) {
    return this.afs.collection ('Usuarios').doc (uid).update ({
      'token_id': userId
    });
  }

  update_usuario (id: string, data: any) {
    return this.afs.collection ('Usuarios').doc (id).update (data);
  }

  is_plato_favorito (user_id: string, plato_id: string) {
    return this.afs.collection ('Usuarios').doc (user_id).collection ('Favoritos').doc (plato_id).valueChanges ();
  }

  get_favoritos_by_user (user_id: string) {
    const collection = this.afs.collection ('Usuarios').doc (user_id).collection ('Favoritos');

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();
          data.es_favorito = true;
          return this._get_plato_by_id (data.id).pipe (map (plato => Object.assign ({}, { data, plato })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_usuario_direcciones (user_id: string) {
    return this.afs.collection ('Usuarios').doc (user_id).collection ('Direcciones').valueChanges ();
  }
  
  add_direccion (user_id: string, data: any) {
    return this.afs.collection ('Usuarios').doc (user_id).collection ('Direcciones').doc (data.id).set (data);
  }

  delete_direccion (user_id: string, id: string) {
    return this.afs.collection ('Usuarios').doc (user_id).collection ('Direcciones').doc (id).delete ();
  }

  update_direccion (user_id: string, data: any) {
    return this.afs.collection ('Usuarios').doc (user_id).collection ('Direcciones').doc (data.id).update (data);
  }

  set_plato_favorito (user_id: string, plato_id: string, value: boolean) {
    if (value) {
      return this.afs.collection ('Usuarios').doc (user_id).collection ('Favoritos').doc (plato_id).set ({id: plato_id});
    } else {
      return this.afs.collection ('Usuarios').doc (user_id).collection ('Favoritos').doc (plato_id).delete ();
    }
  }

  createId () {
    return this.afs.createId ();
  }

  getUser (id: string) {
    return this.afs.collection ('Usuarios').doc (id).valueChanges ().pipe (first ()).toPromise ();
  }

  get_preferencias () {
    return this.afs.collection ('Preferencias').doc ('preferencias').valueChanges ().pipe (first ()).toPromise ();
  }

  get_empresas () {
    return this.afs.collection ('Empresas', ref => ref.orderBy ('orden')).valueChanges ();
  }

  get_cartas_by_empresa (id: string) {
    return this.afs.collection ('Empresa_Cartas', ref => ref.where ('empresa_id', '==', id)).valueChanges ();
  }

  get_insumos_by_plato (id: string) {
    return this.afs.collection ('Plato_Insumos', ref => ref.where ('plato_id', '==', id)).valueChanges ();
  }

  get_platos_by_carta (carta_id: string) {
    const collection = this.afs.collection ('Platos', ref => ref.where ('carta_id', '==', carta_id));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_insumos_by_plato (data.id).pipe (map (insumos => Object.assign ({}, { data, insumos })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_empresas_stock () {
    return this.afs.collection ('Empresa_Insumos').valueChanges ();
  }

  _get_plato_by_id (id: string) {
    return this.afs.collection ('Platos').doc (id).valueChanges ();
  }

  get_plato_by_id (id: string) {
    const collection = this.afs.collection('Platos').doc(id);    
    return collection.snapshotChanges().map (refReferencia=>{      
      const data:any = refReferencia.payload.data();  
      data.id = refReferencia.payload.id;              
      return this.get_insumos_by_plato (data.id).pipe(map(insumos => Object.assign({},{ insumos, data })));                     
    }).mergeMap (observables => {
      if (observables) {
        return combineLatest (observables);
      } else {
        return of([]);
      }
    });
  }

  get_extras_by_carta (carta_id: string) {
    return this.afs.collection ('Menus_Dia', ref => ref.where ('carta_id', '==', carta_id)).valueChanges ();
  }

  get_menu_dia_by_elemento_id (id: string, carta_id: string) {
    return this.afs.collection ('Menus_Dia', ref => ref.where ('elemento_menu_id', '==', id).where ('carta_id', '==', carta_id)).valueChanges ();
  }

  get_menu_elementos_by_carta (carta_id: string) {
    const collection = this.afs.collection ('Menu_Elementos', ref => ref.orderBy ('orden'));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_menu_dia_by_elemento_id (data.id, carta_id).pipe (map (menus_dia => Object.assign ({}, { data, menus_dia })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_menu_elemento_by_id (id: string) {
    return this.afs.collection ('Menu_Elementos').doc (id).valueChanges ();
  }

  get_menus () {
    const collection = this.afs.collection ('Menus');

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.get_menu_elemento_by_id (data.elemento_menu_id).pipe (map (menu_elemento => Object.assign ({}, { data, menu_elemento })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_menus_elementos () {
    return this.afs.collection ('Menu_Elementos').valueChanges ();
  }

  get_menus_dia () {
    return this.afs.collection ('Menus_Dia').valueChanges ();
  }

  get_promociones_by_carta (id: string) {
    return this.afs.collection ('Promociones', ref => ref.where ('carta_id', '==', id)).valueChanges ();
  }

  get_promocion_by_id (id: string) {
    const collection = this.afs.collection ('Promociones').doc (id);  
    return collection.snapshotChanges().map (async refReferencia=> {      
      const data:any = refReferencia.payload.data ();  
      data.id = refReferencia.payload.id;
      if (data.tipo === '0') {
        data.insumos = await this.get_insumos_by_plato (data.plato.id).pipe (first ()).toPromise ();
        return data
      } else {
        data.platos.forEach (async (element: any) => {
          element.insumos = await this.get_insumos_by_plato (element.id).pipe (first ()).toPromise ();
        });

        return data;
      }
    }).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  async add_pedido (data: any) {
    var batch = this.afs.firestore.batch ();

    batch.set (
      this.afs.collection ('Pedidos_Platos_Dia').doc (data.id).ref,
      data
    );

    batch.set (
      this.afs.collection ('Usuarios').doc (data.usuario_id).collection ('Pedidos').doc (data.id).ref,
      {
        fecha: moment().format (),
        estado: 0,
        monto_total: data.monto_total,
        id: data.id,
        tipo_pedido: data.tipo_pedido,
        repartidor_llego: false
      }
    );

    await batch.commit ();
  }

  get_pedido_by_id (pedido_id: string) {
    return this.afs.collection ('Pedidos_Platos_Dia').doc (pedido_id).valueChanges ();
  }
  get_pedidos_by_usuario (usuario_id: string) {
    const collection = this.afs.collection ('Usuarios').doc (usuario_id).collection ('Pedidos', ref => ref.where ('estado', '>=', 4));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();
          return this.get_pedido_by_id (data.id).pipe (map (pedido => Object.assign ({}, { data, pedido })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_pedidos_vigente (usuario_id: string) {
    const collection = this.afs.collection ('Usuarios').doc (usuario_id).collection ('Pedidos', ref => ref.where ('estado', '<=', 3));

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();
          return this.get_pedido_by_id (data.id).pipe (map (pedido => Object.assign ({}, { data, pedido })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }
}
