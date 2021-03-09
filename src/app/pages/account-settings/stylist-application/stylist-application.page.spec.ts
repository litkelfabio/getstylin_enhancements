import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StylistApplicationPage } from './stylist-application.page';

describe('StylistApplicationPage', () => {
  let component: StylistApplicationPage;
  let fixture: ComponentFixture<StylistApplicationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StylistApplicationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StylistApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
