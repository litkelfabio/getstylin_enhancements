import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyRewards2Page } from './my-rewards2.page';

describe('MyRewards2Page', () => {
  let component: MyRewards2Page;
  let fixture: ComponentFixture<MyRewards2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyRewards2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRewards2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
