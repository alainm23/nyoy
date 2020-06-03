import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { IonRouterOutlet, ModalController, AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
})
export class MiCuentaPage implements OnInit {
  direcciones: any [] = [];
  constructor (
    public auth: AuthService,
    public database: DatabaseService,
    public modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private navController: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public storage: Storage,
    public toastController: ToastController) { }

  async ngOnInit() {
    const loading = await this.loadingController.create ({
      message: 'Cargando...'
    });

    loading.present ();

    this.database.get_usuario_direcciones (await this.storage.get ('usuario_id')).subscribe ((res: any []) => {
      this.direcciones = res;
      console.log (res);
      loading.dismiss ();
    });
  }

  async editar (val: string) {
    let header = '';
    let subHeader = '';
    if (val === 'nombre') {
      header = 'Actualizar Nombres';
      subHeader = 'Ingrese su nuevo nombre';
    } else if (val === 'telefono') {
      header = 'Actualizar Telefono';
      subHeader = 'Ingrese su nuevo telefono';
    }

    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      inputs: [
        {
          name: val,
          type: 'text',
          placeholder: this.auth.usuario [val],
          value: this.auth.usuario [val]
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: async (data: any) => {
            if (data [val].trim () !== '') {
              const loading = await this.loadingController.create ({
                message: 'Procesando...',
                translucent: true
              });

              await loading.present ();

              this.database.update_usuario (this.auth.usuario.id, data)
                .then (async () => {
                  this.auth.usuario [val] = data [val];                  
                  await loading.dismiss ();
                  this.presentToast ('Actualizado correctamente', 'bottom', 'success');
                })
                .catch (async (error: any) => {
                  await loading.dismiss ();
                  this.presentToast ('Ocurrio un error', 'bottom', 'danger');
                });
            } else {
              this.presentToast ('Ingrese un nombre valido', 'bottom', 'warning');
            }
          }
        }
      ]
    });

    await alert.present ();
  }

  async presentToast (message: string, position: any, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: position,
      color: color
    });

    toast.present ();
  }

  back () {
    this.navController.back ();
  }

  async eliminar_direccion (item: any) {
    console.log (item);
    const alert = await this.alertController.create({
      header: 'Eliminar ' + item.nombre,
      message: '¿Esta seguro que desea eliminar esta direccion?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirmar',
          handler: async () => {
            this.database.delete_direccion (await this.storage.get ('usuario_id'), item.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async editar_direccion (item: any) {
    const alert = await this.alertController.create({
      header: 'Editar direccion',
      subHeader: 'ascasc',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: item.nombre,
          placeholder: 'Mi casa'
        },
        {
          name: 'direccion',
          type: 'textarea',
          value: item.direccion,
          placeholder: 'Dirección',
        },
        {
          name: 'referencia',
          type: 'textarea',
          value: item.referencia,
          placeholder: 'Referencia',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Guardar',
          handler: async (data: any) => {
            console.log('Confirm Ok', data);
            if (data.nombre.trim () !== '' && data.direccion.trim () !== '') {
              item.nombre = data.nombre;
              item.direccion = data.direccion;
              item.referencia = data.referencia;

              this.database.update_direccion (await this.storage.get ('usuario_id'), item);
            } else {
              const toast = await this.toastController.create ({
                message: 'Ingrese todos los campos correctamente',
                duration: 2000,
                color: 'warning'
              });

              toast.present ();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
