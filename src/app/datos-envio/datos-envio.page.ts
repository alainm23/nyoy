import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var google: any;

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Services
import { Geolocation } from '@ionic-native/geolocation/ngx';7
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-datos-envio',
  templateUrl: './datos-envio.page.html',
  styleUrls: ['./datos-envio.page.scss'],
})
export class DatosEnvioPage implements OnInit {
  @ViewChild ('map', { static: false }) mapRef: ElementRef;
  map: any;
  form: FormGroup;

  latitude: number = 0;
  longitude: number = 0;
  constructor (
    private geolocation: Geolocation,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      nombre_receptor: new FormControl (this.auth.usuario.nombre, [Validators.required]),
      direccion: new FormControl (this.auth.usuario.direccion, Validators.required),
      referencia: new FormControl ('', Validators.required),
      telefono: new FormControl ('', Validators.required),
    });
  }

  ionViewDidEnter () {
    this.InitMap ();
  }

  async InitMap () {
    this.geolocation.getCurrentPosition().then(async (resp) => {
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
}
