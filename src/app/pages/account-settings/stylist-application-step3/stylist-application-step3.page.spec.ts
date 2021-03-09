import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StylistApplicationStep3Page } from './stylist-application-step3.page';

describe('StylistApplicationStep3Page', () => {
  let component: StylistApplicationStep3Page;
  let fixture: ComponentFixture<StylistApplicationStep3Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StylistApplicationStep3Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StylistApplicationStep3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
