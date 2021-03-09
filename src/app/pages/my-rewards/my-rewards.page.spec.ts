import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyRewardsPage } from './my-rewards.page';

describe('MyRewardsPage', () => {
  let component: MyRewardsPage;
  let fixture: ComponentFixture<MyRewardsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyRewardsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRewardsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
