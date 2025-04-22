import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsesCommentComponent } from './responses-comment.component';

describe('ResponsesCommentComponent', () => {
  let component: ResponsesCommentComponent;
  let fixture: ComponentFixture<ResponsesCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsesCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsesCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
