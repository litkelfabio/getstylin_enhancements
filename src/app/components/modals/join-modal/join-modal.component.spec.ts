import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JoinModalComponent } from './join-modal.component';

describe('JoinModalComponent', () => {
  let component: JoinModalComponent;
  let fixture: ComponentFixture<JoinModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
