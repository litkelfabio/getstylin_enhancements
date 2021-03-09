import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BirthdayModal2Component } from './birthday-modal2.component';

describe('BirthdayModal2Component', () => {
  let component: BirthdayModal2Component;
  let fixture: ComponentFixture<BirthdayModal2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirthdayModal2Component ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BirthdayModal2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
