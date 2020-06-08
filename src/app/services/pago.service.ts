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
    Culqi.getOptions.style.logo = "https://firebasestorage.googleapis.com/v0/b/restaurantesapp-d9c89.appspot.com/o/logo%20Nyoy%20300.png?alt=media&token=9fe607d2-6c33-46ff-8dcd-df7f7498ec18";
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

  send_notification (data: any) {
    return this.http.post ('http://api.ceradentperu.com/api/send-notification-nyoy', data);
  }
}
