import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConnectionRequest2Page } from './connection-request2.page';

describe('ConnectionRequest2Page', () => {
  let component: ConnectionRequest2Page;
  let fixture: ComponentFixture<ConnectionRequest2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionRequest2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectionRequest2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
