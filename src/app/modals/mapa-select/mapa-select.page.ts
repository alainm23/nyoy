import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController, AlertController } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { DatabaseService } from '../../services/database.service';
declare var google: any;

@Component({
  selector: 'app-mapa-select',
  templateUrl: './mapa-select.page.html',
  styleUrls: ['./mapa-select.page.scss'],
})
export class MapaSelectPage implements OnInit {
  @ViewChild ('map', { static: false }) mapRef: ElementRef;
  @ViewChild ('searchbar', { read: ElementRef, static: false }) searchbar: ElementRef;

  i18n: any;
  map: any;
  loading: any;

  @Input () latitude: number = 0;
  @Input () longitude: number = 0;
  @Input () search_text: string = "";
  _search_text: string = '';
  preferencias: any;
  directionsService: any = new google.maps.DirectionsService ();
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private geolocation: Geolocation, 
    private platform: Platform,
    private database: DatabaseService,
    private loadingController: LoadingController,
    public alertController: AlertController,
    private locationAccuracy: LocationAccuracy,
    private androidPermissions: AndroidPermissions,
    public viewCtrl: ModalController) {}

  async ngOnInit() {
    this.preferencias = await this.database.get_preferencias ();
    if (this.platform.is ('cordova')) {
      this.checkGPSPermission ();
    } else {
      this.getLocationCoordinates ();
    }
  }

  ionViewDidEnter () {
    this.initAutocomplete ();
  }

  initAutocomplete () {
    const options = {
      types: ['establishment'],
      componentRestrictions: {country: "pe"}
    };
    
    let searchInput = this.searchbar.nativeElement.querySelector('input');
    let autocomplete = new google.maps.places.Autocomplete (searchInput);

    google.maps.event.addListener (autocomplete, 'place_changed', async () => {
      let loading = await this.loadingCtrl.create({
        message: '...'
      });

      await loading.present();
      
      await loading.dismiss ().then(() => {
        let place = autocomplete.getPlace ()
        this.search_text = place.formatted_address;

        let location = new google.maps.LatLng (place.geometry.location.lat(), place.geometry.location.lng());
        
        this.map.setZoom (17);
        this.map.panTo (location);
      });
    });
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
    
    google.maps.event.addListener(this.map, 'idle', () => {
      let location = this.map.getCenter ();
      
      this.latitude = location.lat ();
      this.longitude = location.lng ();

      let request = {
        origin: location,
        destination: location,
        travelMode: google.maps.TravelMode.WALKING
      };

      this.directionsService.route(request, (result, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          console.log (result);
          this._search_text = result.routes [0].legs [0].start_address.replace (', Peru', '').replace (', Cusco', '');
        }
      });
    });
  }

  async getLocationCoordinates () {
    let loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });
    
    await loading.present ();

    this.geolocation.getCurrentPosition ({ maximumAge: 60000, timeout: 30000, enableHighAccuracy: true }).then((resp) => {
      loading.dismiss ();
      this.InitMap (resp.coords.latitude, resp.coords.longitude);
    }).catch ((error) => {
      loading.dismiss ();
      console.log ('Error getting location' + error);
      this.InitMap (-13.531249, -71.9514909);
    });
  }

  closeModal () {
    this.viewCtrl.dismiss ();
  }

  async select () {
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

    this.directionsService.route (request, async (response: any, status: any) => {
      if (status == 'OK') {
        loading.dismiss ();

        this.viewCtrl.dismiss ({
          latitude: this.latitude,
          longitude: this.longitude,
          address: this._search_text,
          kilometros: response.routes [0].legs [0].distance.value,
          duracion: response.routes [0].legs [0].duration.value
        }, 'ok');
      } else {
        loading.dismiss ();
        console.log ('No se encuentra la ubicacion');
        const alert = await this.alertController.create({
          header: 'Error al encoentrar una ruta',
          message: 'No realizamos envios a la zona seleccionada.',
          buttons: ['Ok']
        });
    
        await alert.present();
      }
    });
  }

  async checkGPSPermission () {
    let loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });
    
    await loading.present ();

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
      .then ((result: any) => {
        loading.dismiss ();

        if (result.hasPermission) {
          this.askToTurnOnGPS ();
        } else {
          this.requestGPSPermission ();
        }
      },
      err => {
        alert (err);
      }
    );
  }

  async askToTurnOnGPS () {
    let loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });
    
    await loading.present ();

    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => {
        loading.dismiss ();
        this.getLocationCoordinates ();
      }, error => {
        this.navCtrl.pop ();
        console.log ('Error requesting location permissions ' + JSON.stringify(error))
      });
  }

  async requestGPSPermission () {
    let loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });
    
    await loading.present ();

    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      loading.dismiss ();
      
      if (canRequest) {
        
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(() => {
            this.askToTurnOnGPS ();
          }, error => {
            this.navCtrl.pop ();
            console.log ('requestPermission Error requesting location permissions ' + error)
          }
        );
      }
    });
  }
}
