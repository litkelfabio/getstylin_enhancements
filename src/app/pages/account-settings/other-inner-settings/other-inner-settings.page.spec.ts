import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OtherInnerSettingsPage } from './other-inner-settings.page';

describe('OtherInnerSettingsPage', () => {
  let component: OtherInnerSettingsPage;
  let fixture: ComponentFixture<OtherInnerSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherInnerSettingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OtherInnerSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
