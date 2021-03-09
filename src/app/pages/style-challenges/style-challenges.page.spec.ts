import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StyleChallengesPage } from './style-challenges.page';

describe('StyleChallengesPage', () => {
  let component: StyleChallengesPage;
  let fixture: ComponentFixture<StyleChallengesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleChallengesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StyleChallengesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
