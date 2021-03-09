import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StylistApplicationStep2Page } from './stylist-application-step2.page';

describe('StylistApplicationStep2Page', () => {
  let component: StylistApplicationStep2Page;
  let fixture: ComponentFixture<StylistApplicationStep2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StylistApplicationStep2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StylistApplicationStep2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
