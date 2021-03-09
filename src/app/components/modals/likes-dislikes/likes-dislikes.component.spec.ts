import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LikesDislikesComponent } from './likes-dislikes.component';

describe('LikesDislikesComponent', () => {
  let component: LikesDislikesComponent;
  let fixture: ComponentFixture<LikesDislikesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LikesDislikesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LikesDislikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
