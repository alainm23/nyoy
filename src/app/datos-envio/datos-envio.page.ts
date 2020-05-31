import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var google: any;

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { DatabaseService } from '../services/database.service';

// Services
import { NavController, LoadingController } from '@ionic/angular'; 
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-datos-envio',
  templateUrl: './datos-envio.page.html',
  styleUrls: ['./datos-envio.page.scss'],
})
export class DatosEnvioPage implements OnInit {
  @ViewChild ('map', { static: false }) mapRef: ElementRef;
  map: any;
  directionsService: any = new google.maps.DirectionsService ();
  form: FormGroup;

  latitude: number = 0;
  longitude: number = 0;

  preferencias: any;
  constructor (
    public geolocation: Geolocation,
    public auth: AuthService,
    public storage: Storage,
    public navController: NavController,
    public loadingController: LoadingController,
    public database: DatabaseService
  ) { }

  async ngOnInit() {
    this.form = new FormGroup({
      nombre_receptor: new FormControl (this.auth.usuario.nombre, [Validators.required]),
      direccion: new FormControl (this.auth.usuario.direccion, Validators.required),
      referencia: new FormControl ('', Validators.required),
      telefono: new FormControl ('', Validators.required),
    });
    
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    this.preferencias = await this.database.get_preferencias ();
    await loading.dismiss ();
  }

  ionViewDidEnter () {
    this.InitMap ();
  }

  async InitMap () {
    this.geolocation.getCurrentPosition ().then (async (resp) => {
      let location = new google.maps.LatLng (resp.coords.latitude, resp.coords.longitude);
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

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

      if (this.map === null || this.map === undefined) {
        console.log ('Error del puto GPS');
      } else {
      }
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  current_location () {
    this.map.setZoom (17);
    this.map.panTo (new google.maps.LatLng (this.latitude, this.longitude));
  }

  async go_resumen () {
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    let point_origen = new google.maps.LatLng (this.preferencias.local_latitud, this.preferencias.local_longitud);
    let point_destino = this.map.getCenter ();

    let request = {
      origin: point_origen,
      destination: point_destino,
      travelMode: google.maps.TravelMode ['DRIVING']
    }

    let data: any = this.form.value;
    let location = this.map.getCenter ();
      
    data.latitude = location.lat ();
    data.longitude = location.lng ();

    this.directionsService.route (request, (response, status) => {
      if (status == 'OK') {
        loading.dismiss ();

        data.kilometros = response.routes [0].legs [0].distance.value;
        data.duracion = response.routes [0].legs [0].duration.value;

        console.log (data);

        this.storage.set ('datos-envio', JSON.stringify (data));
        this.navController.navigateForward ('pago-resumen');
      } else {
        console.log ('No es posible encontrar una ruta');
        loading.dismiss ();
      }
    });
  }
}
