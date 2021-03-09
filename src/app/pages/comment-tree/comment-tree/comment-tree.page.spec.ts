import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommentTreePage } from './comment-tree.page';

describe('CommentTreePage', () => {
  let component: CommentTreePage;
  let fixture: ComponentFixture<CommentTreePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentTreePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentTreePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
