import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyStylinPage } from './my-stylin.page';

describe('MyStylinPage', () => {
  let component: MyStylinPage;
  let fixture: ComponentFixture<MyStylinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyStylinPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyStylinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
