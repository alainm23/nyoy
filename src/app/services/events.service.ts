import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private pago_subject = new Subject<any> ();
  constructor() { }

  publish_token_id (data: any) {
    this.pago_subject.next (data);
  }

  get_token_id (): Subject<any> {
    return this.pago_subject;
  }
}
