import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { Platform, NavController, LoadingController } from '@ionic/angular';
import { DatabaseService } from "../services/database.service";
import { Router } from '@angular/router';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { Storage } from '@ionic/storage';

import { first } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuario: any = {
    id: '',
    nombre: '',
    direccion: '',
    telefono: ''
  };
  constructor (
    public afAuth: AngularFireAuth,
    public router: Router,
    public database: DatabaseService,
    public navController: NavController,
    public loadingController: LoadingController,
    public storage: Storage,
    private googlePlus: GooglePlus,
    private fb: Facebook,
    public platform: Platform) {
      this.afAuth.authState.subscribe (async (user: firebase.User) => {
        if (user) {
          this.storage.set ('usuario_id', user.uid);
          this.usuario = await this.database.get_usuario (user.uid);
            console.log (this.usuario);
        } else {
          this.storage.set ('usuario_id', '');
          this.usuario = {
            id: '',
            nombre: '',
            direccion: '',
            telefono: ''
          }
        }
      });
    }

  async isLogin () {
    return await this.afAuth.authState.pipe (first ()).toPromise ();
  }

  authState () {
    return this.afAuth.authState;
  }

  signInWithEmailAndPassword (email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword (email, password);
  }

  async signOut () {
    return this.afAuth.auth.signOut ()
      .then (() => {
        this.fb.getLoginStatus().then ((res) => {
          if (res.status === 'connected') {
            this.fb.logout ();
          }
        });
      });
  }

  sendPasswordResetEmail (email: string) {
    return this.afAuth.auth.sendPasswordResetEmail (email);
  }

  createUserWithEmailAndPassword (email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword (email, password);
  }

  googleLogin () {
    if (this.platform.is('cordova')) {
      this.nativeGoogleLogin ();
    } else {
      this.webGoogleLogin ();
    }
  }

  async nativeGoogleLogin () {
    const loading = await this.loadingController.create({
      message: 'Procesando informacion...',
    });

    await loading.present();

    this.googlePlus.login({
      'scope': 'restaurantesappweb@gmail.com',
      'webClientId': '934733338514-b9lpakl14j90r8fdnedbmm6c2jnm08n9.apps.googleusercontent.com',
      'offline': true
    }).then (async (res: any) => {
      const credential = await this.afAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken));

      const user = await this.database.getUser (credential.user.uid);
      if (user === undefined) {
        let request: any = {
          id: credential.user.uid,
          nombre: credential.user.displayName,
          email: credential.user.email,
          fecha_registro: new Date ().toISOString ()
        }

        this.database.create_user (request)
          .then (async () => {
            await loading.dismiss ();
            this.navController.navigateRoot ('home');
          })
          .catch (async (error: any) => {
            await loading.dismiss ();
            console.log ('Add user error, ', error);
          });
      } else {
        await loading.dismiss ();
        this.navController.navigateRoot ('home');
      }
    }).catch (err => {
      console.log ('googlePlus', err);
      loading.dismiss ();
    });
  }

  async webGoogleLogin () {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider)

    const loading = await this.loadingController.create({
      message: 'Procesando informacion ...'
    });

    await loading.present ();
    const user = await this.database.getUser (credential.user.uid);
    if (user === undefined) {
      let request: any = {
        id: credential.user.uid,
        nombre: credential.user.displayName,
        email: credential.user.email,
        fecha_registro: new Date ().toISOString ()
      }

      this.database.create_user (request)
        .then (async () => {
          await loading.dismiss ();
          this.navController.navigateRoot ('home');
        })
        .catch (async (error: any) => {
          await loading.dismiss ();
          console.log ('Add user error, ', error);
        });
    } else {
      await loading.dismiss ();
      this.navController.navigateRoot ('home');
    }
  }

  facebookLogin () {
    if (this.platform.is('cordova')) {
      this.nativeFacebookLogin();
    } else {
      this.webFacebookLogin ();
    }
  }

  async webFacebookLogin () {
    const provider = new firebase.auth.FacebookAuthProvider ();
    const credential = await this.afAuth.auth.signInWithPopup(provider);

    console.log ('credential', credential);

    const loading = await this.loadingController.create({
      message: 'Procesando informacion ...'
    });

    await loading.present ();
    const user = await this.database.getUser (credential.user.uid);
    if (user === undefined) {
      let request: any = {
        id: credential.user.uid,
        nombre: credential.user.displayName,
        email: credential.user.email,
        fecha_registro: new Date ().toISOString ()
      }

      this.database.create_user (request)
        .then (async () => {
          await loading.dismiss ();
          this.navController.navigateRoot ('home');
        })
        .catch (async (error: any) => {
          await loading.dismiss ();
          console.log ('Add user error, ', error);
        });
    } else {
      await loading.dismiss ();
      this.navController.navigateRoot ('home');
    }
  }

  async nativeFacebookLogin () {
    const loading = await this.loadingController.create ({
      message: 'Procesando informacion ...'
    });

    await loading.present ();

    this.fb.getLoginStatus ().then((res) => {
      if (res.status === 'connected') {
        this.afAuth.auth.signInAndRetrieveDataWithCredential (firebase.auth.FacebookAuthProvider.credential (res.authResponse.accessToken))
        .then ((credential: any) => {
          this.check_facebook_user (credential, loading);
        })
        .catch ((error: any) => {
          console.log ('this.afAuth.auth.signInAndRetrieveDataWithCredential', error);
          loading.dismiss ();
        });
      } else {
        this.fb.login (['public_profile', 'email'])
        .then ((facebookUser: any) => {
          this.afAuth.auth.signInAndRetrieveDataWithCredential (firebase.auth.FacebookAuthProvider.credential (facebookUser.authResponse.accessToken))
          .then ((credential: any) => {
            this.check_facebook_user (credential, loading);
          })
          .catch ((error: any) => {
            console.log ('this.afAuth.auth.signInAndRetrieveDataWithCredential', error);
            loading.dismiss ();
          });
        })
        .catch ((error: any) => {
          console.log ('this.facebook.login', error);
          loading.dismiss ();
        });
      }
    });
  }

  async check_facebook_user (credential: any, loading: any) {
    const user = await this.database.getUser (credential.user.uid);
    if (user === undefined) {
      let request: any = {
        id: credential.user.uid,
        nombre: credential.user.displayName,
        email: credential.user.email,
        fecha_registro: new Date ().toISOString ()
      }

      this.database.create_user (request)
        .then (async () => {
          await loading.dismiss ();
          this.navController.navigateRoot ('home');
        })
        .catch (async (error: any) => {
          await loading.dismiss ();
          console.log ('Add user error, ', error);
        });
    } else {
      await loading.dismiss ();
      this.navController.navigateRoot ('home');
    }
  }
}
