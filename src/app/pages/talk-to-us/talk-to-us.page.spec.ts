import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TalkToUsPage } from './talk-to-us.page';

describe('TalkToUsPage', () => {
  let component: TalkToUsPage;
  let fixture: ComponentFixture<TalkToUsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TalkToUsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TalkToUsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
