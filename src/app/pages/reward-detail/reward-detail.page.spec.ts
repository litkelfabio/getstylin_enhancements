import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RewardDetailPage } from './reward-detail.page';

describe('RewardDetailPage', () => {
  let component: RewardDetailPage;
  let fixture: ComponentFixture<RewardDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RewardDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RewardDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
