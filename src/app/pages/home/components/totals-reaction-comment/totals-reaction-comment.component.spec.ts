import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalsReactionCommentComponent } from './totals-reaction-comment.component';

describe('TotalsReactionCommentComponent', () => {
  let component: TotalsReactionCommentComponent;
  let fixture: ComponentFixture<TotalsReactionCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalsReactionCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalsReactionCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
