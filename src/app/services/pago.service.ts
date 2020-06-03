import { Injectable } from '@angular/core';

import { EventsService } from '../services/events.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
declare var Culqi: any;

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  constructor (private events: EventsService, public http: HttpClient) {
    document.addEventListener ('payment_event', (token: any) => {
      let token_id = token.detail;
      this.events.publish_token_id (token_id);
      }, false);
  }

  initCulqi () {
    // Ingresa tu "Puclic Key" que te da Culqi aqui
    Culqi.publicKey = 'pk_test_HLVuKNmVSVy8D7aG';
    //Culqi.publicKey = 'pk_test_yycfYRkVXy5z38km';
  }
  
  cfgFormulario (descripcion: string, cantidad: number) {
    // Culqi.getOptions.style.logo = "https://firebasestorage.googleapis.com/v0/b/cps-database.appspot.com/o/icon-240.png?alt=media&token=4a678de0-f8ad-4370-a60d-be2e305d5d77";
      Culqi.settings ({
        title: 'Nyoy',
        currency: 'PEN',
        description: descripcion,
        amount: cantidad
    });
  }

  open () {
    return Culqi.open ();
  }

  procesarpagonyoy (token: string, monto: number, correo: string, moneda: string) {
    let url = 'http://api.ceradentperu.com/api/procesarpagonyoy/';
    url += token + "/";
    url += monto + "/";
    url += correo + "/";
    url += moneda;

    return this.http.get (url);
  }
}
