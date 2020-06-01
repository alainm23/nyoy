import { Component, OnInit, ViewChild } from '@angular/core';

// Services
import { NavController, IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-slides',
  templateUrl: './slides.page.html',
  styleUrls: ['./slides.page.scss'],
})
export class SlidesPage implements OnInit {
  @ViewChild(IonSlides) slides: IonSlides;
  index: number = 0;
  constructor (
    public navController: NavController
  ) { }

  ngOnInit() {
  }

  saltar () {
    this.navController.navigateRoot ('login');
  }

  slidesChanged () {
    this.slides.getActiveIndex ().then (index => {
      this.index = index;
      console.log (index);
    })
  }

  event (event) {
    console.log (event);
  }
}
