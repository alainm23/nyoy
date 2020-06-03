import { Component, OnInit } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-operecion-exitosa',
  templateUrl: './operecion-exitosa.page.html',
  styleUrls: ['./operecion-exitosa.page.scss'],
})
export class OperecionExitosaPage implements OnInit {

  constructor (
    private navControl: NavController,
    private menu: MenuController
  ) { }

  ngOnInit() {
  }

  gohome () {
    this.navControl.navigateRoot ('home');
  }

  open_menu () {
    this.menu.enable (true, 'first');
    this.menu.close ('first');
  }
}
