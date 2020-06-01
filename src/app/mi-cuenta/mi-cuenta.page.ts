import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { IonRouterOutlet, ModalController, AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
})
export class MiCuentaPage implements OnInit {

  constructor (
    public auth: AuthService,
    public database: DatabaseService,
    public modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private navController: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController) { }

  ngOnInit() {
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
}
