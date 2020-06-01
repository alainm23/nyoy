import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MiCuentaPage } from './mi-cuenta.page';

describe('MiCuentaPage', () => {
  let component: MiCuentaPage;
  let fixture: ComponentFixture<MiCuentaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiCuentaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MiCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
