import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InsideSecurityPage } from './inside-security.page';

describe('InsideSecurityPage', () => {
  let component: InsideSecurityPage;
  let fixture: ComponentFixture<InsideSecurityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsideSecurityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InsideSecurityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
