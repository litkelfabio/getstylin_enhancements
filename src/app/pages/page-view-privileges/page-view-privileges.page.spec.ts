import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PageViewPrivilegesPage } from './page-view-privileges.page';

describe('PageViewPrivilegesPage', () => {
  let component: PageViewPrivilegesPage;
  let fixture: ComponentFixture<PageViewPrivilegesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageViewPrivilegesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PageViewPrivilegesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
