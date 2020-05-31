import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OperecionExitosaPage } from './operecion-exitosa.page';

describe('OperecionExitosaPage', () => {
  let component: OperecionExitosaPage;
  let fixture: ComponentFixture<OperecionExitosaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperecionExitosaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OperecionExitosaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
