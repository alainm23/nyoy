import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.page.html',
  styleUrls: ['./sing-up.page.scss'],
})
export class SingUpPage implements OnInit {
  form: FormGroup;

  constructor (
    public navController: NavController,
    public auth: AuthService,
    public database: DatabaseService,
    public loadingController: LoadingController,
    public alertController: AlertController
  ) { }

  ngOnInit () {
    const password = new FormControl ('', Validators.required);
    const confirm_password = new FormControl ('', [Validators.required, CustomValidators.equalTo (password)]);

    this.form = new FormGroup ({
      nombre: new FormControl ('', Validators.required),
      email: new FormControl ('', [Validators.required, Validators.email]),
      password: password,
      confirmar_password: confirm_password,
      terms_conditions: new FormControl (false, Validators.compose([ Validators.required, Validators.pattern ('true')]))
    });
  }

  back () {
    this.navController.back ();
  }

  async onSubmit () {
    const loading = await this.loadingController.create({
      message: 'Procesando informacion ...'
    });

    await loading.present ();

    this.auth.createUserWithEmailAndPassword (this.form.value.email, this.form.value.password)
      .then ((res: firebase.auth.UserCredential) => {
        let request: any = {
          id: res.user.uid,
          nombre: this.form.value.nombre,
          correo: this.form.value.email,
          fecha_registro: new Date ().toISOString ()
        }

        this.database.create_user (request)
          .then (() => {
            loading.dismiss ();
            this.navController.navigateRoot ('home');
          })
          .catch ((error: any) => {
            loading.dismiss ();
            console.log ('Add user error, ', error);
          });
      })
      .catch (async (error: any) => {
        loading.dismiss ();

        let message: string = '';

        if (error.code == "auth/email-already-in-use") {
          message = "Esta dirección de correo electrónico ya está siendo utilizada por otra persona."
        } else if (error.code == "auth/network-request-failed") {
          message = "No tienes acceso a internet, no se puede proceder."
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
