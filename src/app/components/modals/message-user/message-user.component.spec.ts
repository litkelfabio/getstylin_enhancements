import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MessageUserComponent } from './message-user.component';

describe('MessageUserComponent', () => {
  let component: MessageUserComponent;
  let fixture: ComponentFixture<MessageUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageUserComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
