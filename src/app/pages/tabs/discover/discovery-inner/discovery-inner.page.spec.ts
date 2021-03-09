import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DiscoveryInnerPage } from './discovery-inner.page';

describe('DiscoveryInnerPage', () => {
  let component: DiscoveryInnerPage;
  let fixture: ComponentFixture<DiscoveryInnerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscoveryInnerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoveryInnerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
