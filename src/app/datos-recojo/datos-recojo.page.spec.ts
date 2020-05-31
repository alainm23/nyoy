import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DatosRecojoPage } from './datos-recojo.page';

describe('DatosRecojoPage', () => {
  let component: DatosRecojoPage;
  let fixture: ComponentFixture<DatosRecojoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosRecojoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosRecojoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
