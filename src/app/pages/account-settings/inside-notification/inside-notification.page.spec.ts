import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InsideNotificationPage } from './inside-notification.page';

describe('InsideNotificationPage', () => {
  let component: InsideNotificationPage;
  let fixture: ComponentFixture<InsideNotificationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsideNotificationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InsideNotificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
