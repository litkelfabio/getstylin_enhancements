import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InnerConnectionRequestPage } from './inner-connection-request.page';

describe('InnerConnectionRequestPage', () => {
  let component: InnerConnectionRequestPage;
  let fixture: ComponentFixture<InnerConnectionRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InnerConnectionRequestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InnerConnectionRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
