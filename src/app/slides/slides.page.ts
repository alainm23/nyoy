import { Component, OnInit } from '@angular/core';

// Services
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-slides',
  templateUrl: './slides.page.html',
  styleUrls: ['./slides.page.scss'],
})
export class SlidesPage implements OnInit {

  constructor (
    public navController: NavController
  ) { }

  ngOnInit() {
  }

  saltar () {
    this.navController.navigateRoot ('login');
  }
}
