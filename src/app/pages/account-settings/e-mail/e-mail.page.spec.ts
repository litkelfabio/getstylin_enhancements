import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EMailPage } from './e-mail.page';

describe('EMailPage', () => {
  let component: EMailPage;
  let fixture: ComponentFixture<EMailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EMailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EMailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
