import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var google: any;
import { MenuController, NavController } from '@ionic/angular'; 

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { DatabaseService } from '../services/database.service';

// Services
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular'; 
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AuthService } from '../services/auth.service';
import { MapaSelectPage } from '../modals/mapa-select/mapa-select.page';

@Component({
  selector: 'app-datos-envio',
  templateUrl: './datos-envio.page.html',
  styleUrls: ['./datos-envio.page.scss'],
})
export class DatosEnvioPage implements OnInit {
  form: FormGroup;

  latitude: number = 0;
  longitude: number = 0;
  mapa_seleccionado: boolean = false;

  preferencias: any;
  direcciones: any [] = [];
  nueva_dir: boolean = false;
  constructor (
    public geolocation: Geolocation,
    public auth: AuthService,
    public storage: Storage,
    public navController: NavController,
    public loadingController: LoadingController,
    public database: DatabaseService,
    public alertController: AlertController,
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    this.form = new FormGroup({
      nombre_receptor: new FormControl (this.auth.usuario.nombre, [Validators.required]),
      direccion: new FormControl ('', Validators.required),
      referencia: new FormControl (''),
      telefono: new FormControl (this.auth.usuario.telefono, Validators.required),
      _direccion: new FormControl (''),
      kilometros: new FormControl (''),
      duracion: new FormControl (''),
    });
    
    const loading = await this.loadingController.create({
      message: 'Espere un momento'
    });

    await loading.present ();

    this.database.get_usuario_direcciones (await this.storage.get ('usuario_id')).subscribe ((res: any []) => {
      this.direcciones = res;
      console.log (res.length);
      if (res.length > 0) {
        this.form.controls['_direccion'].setValue (res [0]);
        this.select_changed (res [0]);
      }
    });
    await loading.dismiss ();
  }

  async go_resumen () {
    let data: any = this.form.value;
    data.latitude = this.longitude;
    data.longitude = this.longitude;

    if (this.mapa_seleccionado) {
      const alert = await this.alertController.create({
        header: 'Guardar ubicación',
        message: 'Desea guardar esta direccion para futuros envios',
        inputs: [
          {
            name: 'nombre',
            type: 'text',
            placeholder: 'Mi casa'
          },
        ],
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              this.storage.set ('datos-envio', JSON.stringify (data));
              this.navController.navigateForward ('pago-resumen');
            }
          }, {
            text: 'Si',
            handler: async (data: any) => {
              let direccion: any = {
                id: this.database.createId (),
                nombre: data.nombre,
                direccion: this.form.value.direccion,
                referencia: this.form.value.referencia,
                latitud: this.latitude,
                longitud: this.longitude,
                kilometros: this.form.value.kilometros
              }

              let usuario_id = await this.storage.get ('usuario_id');
              this.database.add_direccion (usuario_id, direccion);
              this.storage.set ('datos-envio', JSON.stringify (data));
              this.navController.navigateForward ('pago-resumen');
            }
          }
        ]
      });
  
      await alert.present();
    } else {
      this.storage.set ('datos-envio', JSON.stringify (data));
      this.navController.navigateForward ('pago-resumen');
    }
  }

  select_changed (event: any) {
    if (event === 'nuevo') {
      this.marcar_ubicacion ();
    } else {
      this.nueva_dir = false;
      console.log (event)
      this.latitude = event.latitud;
      this.longitude = event.longitud;
      this.form.controls ['direccion'].setValue (event.direccion);
      this.form.controls ['referencia'].setValue (event.referencia);
      this.form.controls ['kilometros'].setValue (event.kilometros);
    }
  }

  async marcar_ubicacion () {
    const value = this.form.value;
    
    const modal = await this.modalController.create({
      component: MapaSelectPage,
      componentProps: {
        latitude: this.latitude,
        longitude: this.longitude,
        address: value.direccion
      }
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        console.log (response);

        this.mapa_seleccionado = true;
        this.latitude = response.data.latitude;
        this.longitude = response.data.longitude;
        this.form.controls ['direccion'].setValue (response.data.address);
        this.form.controls ['kilometros'].setValue (response.data.kilometros);
      }
    });

    return await modal.present();
  }

  open_menu () {
    this.menu.enable (true, 'first');
    this.menu.open ('first');
  }
}
