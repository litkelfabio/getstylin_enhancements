import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MemberPrivilegesPage } from './member-privileges.page';

describe('MemberPrivilegesPage', () => {
  let component: MemberPrivilegesPage;
  let fixture: ComponentFixture<MemberPrivilegesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberPrivilegesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MemberPrivilegesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
