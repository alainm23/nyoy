import { Component, OnInit } from '@angular/core';

// Services
import { NavController, LoadingController, AlertController, ToastController, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  constructor (
    public navController: NavController,
    public auth: AuthService,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public toastController: ToastController,
    public platform: Platform
  ) { }

  ngOnInit () {
    this.form = new FormGroup ({
      email: new FormControl ('', [Validators.required, Validators.email]),
      password: new FormControl ('', Validators.required)
    });
  }

  sing_up () {
    this.navController.navigateForward ('sing-up');
  }

  async submit () {
    const loading = await this.loadingController.create({
      message: 'Procesando informacion ...'
    });

    await loading.present ();

    this.auth.signInWithEmailAndPassword (this.form.value.email, this.form.value.password).then (async (response: any) => {
      await loading.dismiss ();
      this.navController.navigateRoot ('home');
    }, async (error: any) => {
      await loading.dismiss ();
      
      console.log (error);

      let message: string = "";

      if (error.code == 'auth/network-request-failed') {
        message = 'No tienes acceso a internet, no se puede proceder.'
      } else if (error.code == 'auth/user-not-found') {
        message = 'No encontramos a nigun usuario con ese correo';
      } else if (error.code == 'auth/wrong-password') {
        message = 'Ingrese una contraseña valida';
      } else if (error.code == 'auth/too-many-requests') {
        message = 'Hemos bloqueado todas las solicitudes de este dispositivo debido a una actividad inusual. Inténtalo más tarde.';
      } else {
        message = error.message;
      }

      let alert = await this.alertController.create({
        header: 'Opppps!',
        message: message,
        buttons: ['OK']
      });

      await alert.present();
    });
  }

  async recuperar_cuenta () {
    const alert = await this.alertController.create({
      header: '¿Olvidaste tu contraseña?',
      message: 'Ingresa tu correo electronico y te enviaremos un correo indicandote los pasos para poder recuperarla.',
      inputs: [
        {
          name: 'email',
          placeholder: 'Correo electronico',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Enviar',
          handler: async (data) => {
            const loading = await this.loadingController.create({
              message: 'Procesando Informacion ...'
            });

            await loading.present ();

            this.auth.sendPasswordResetEmail (data.email)
              .then (async (response: any) => {
                await loading.dismiss ();

                let alert = await this.alertController.create({
                  header: 'Usuario encontrado',
                  message: 'Acabamos de enviar un email a <strong>' + data.email + '</strong>, incluyendo los pasos para resetear la contraseña',
                  buttons: ['OK']
                });

                await alert.present ();   
              }, async (error: any) => {
                await loading.dismiss ();

                let message: string = "";

                if (error.code == 'auth/network-request-failed') {
                  message = 'No tienes acceso a internet, no se puede proceder.'
                } else if (error.code == 'auth/user-not-found') {
                  message = 'No encontramos a nigun usuario con ese correo';
                } else {
                  message = error.message;
                }

                let alert = await this.alertController.create({
                  header: 'Opppps!',
                  message: message,
                  buttons: ['OK']
                });

                await alert.present();
              });
          }
        }
      ]
    });

    await alert.present();
  }

  google () {
    this.auth.googleLogin ();
  }

  facebook () {
      this.auth.facebookLogin ();
  }
}
