import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-operecion-exitosa',
  templateUrl: './operecion-exitosa.page.html',
  styleUrls: ['./operecion-exitosa.page.scss'],
})
export class OperecionExitosaPage implements OnInit {

  constructor (private navControl: NavController) { }

  ngOnInit() {
  }

  gohome () {
    this.navControl.navigateRoot ('home');
  }

}
