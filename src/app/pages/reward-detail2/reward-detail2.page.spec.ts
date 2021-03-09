import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RewardDetail2Page } from './reward-detail2.page';

describe('RewardDetail2Page', () => {
  let component: RewardDetail2Page;
  let fixture: ComponentFixture<RewardDetail2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RewardDetail2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RewardDetail2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
