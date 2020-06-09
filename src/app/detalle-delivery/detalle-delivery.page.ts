import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { DatabaseService } from '../services/database.service';
declare var google: any;
import * as moment from 'moment';

@Component({
  selector: 'app-detalle-delivery',
  templateUrl: './detalle-delivery.page.html',
  styleUrls: ['./detalle-delivery.page.scss'],
})
export class DetalleDeliveryPage implements OnInit {
  @ViewChild ('map', { static: false }) mapRef: ElementRef;
  map: any;
  pedido_id: any;
  pedido: any = {
    estado: 0,
    ver_detalles: false
  };
  
  preferencias: any
  marker_repartidor: any = null;
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private geolocation: Geolocation, 
    private platform: Platform,
    private database: DatabaseService,
    private loadingController: LoadingController,
    public alertController: AlertController,
    public route: ActivatedRoute,
    public viewCtrl: ModalController) {}

  async ngOnInit() {
    this.pedido_id = this.route.snapshot.paramMap.get ('id');
    this.preferencias = await this.database.get_preferencias ();

    this.database.get_pedido_by_id (this.pedido_id).subscribe ((res: any) => {
      this.pedido = res;
      this.InitMap (res.latitud, res.longitud);
      if (res.repartidor_id !== '') {
        this.database.get_usuario (res.repartidor_id).subscribe ((res: any) => {
          this.updateMark (res.latitud, res.longitud);
        });
      }
    });
  }

  get_format_date (date: string) {
    return moment (date).format ('LLL');
  }

  updateMark (lat: number, lon: number) {
    if (this.marker_repartidor === null) {
      let location = new google.maps.LatLng (lat, lon);
      this.marker_repartidor = new google.maps.Marker({
        position: location,
        map: this.map,
        icon: 'assets/delivery-man.png'
      });
  
      this.marker_repartidor.setMap (this.map);
    } else {
      let location = new google.maps.LatLng (lat, lon);
      this.marker_repartidor.setPosition (location);
    }
  }

  async InitMap (latitude: number, longitude: number) {
    let location = new google.maps.LatLng (latitude, longitude);

    const options = {  
      center: location,
      zoom: 15,
      disableDefaultUI: true,
      streetViewControl: false,
      disableDoubleClickZoom: false,
      clickableIcons: false,
      scaleControl: true,
      styles: [
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "poi.business",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "transit",
          "stylers": [{
            "visibility": "off"
          }]
        }
      ],
      mapTypeId: 'roadmap',
    }

    this.map = await new google.maps.Map (this.mapRef.nativeElement, options);

    let marker_pedido = new google.maps.Marker ({
      position: location,
      map: this.map
    });
  }

  get_pedido_color (pedido: any) {
    let returned = '#ffffff';

    if (pedido.estado <= 2) {
      returned = '#D14B51';
    } else if (pedido.estado >= 3) {
      if (pedido.repartidor_llego) {
        returned = '#43CC4D';
      } else {
        returned = '#6046D1';
      }
    }

    return returned;
  }

  ver_detalles (item: any) {
    if (item.ver_detalles === undefined) {
      item.ver_detalles = true;
    } else {
      item.ver_detalles = !item.ver_detalles;
    }
  }
}
