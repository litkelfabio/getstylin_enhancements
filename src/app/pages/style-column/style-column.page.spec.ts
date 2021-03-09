import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StyleColumnPage } from './style-column.page';

describe('StyleColumnPage', () => {
  let component: StyleColumnPage;
  let fixture: ComponentFixture<StyleColumnPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleColumnPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StyleColumnPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
