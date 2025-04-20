import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUserCommentPublicationComponent } from './modal-user-comment-publication.component';

describe('ModalUserCommentPublicationComponent', () => {
  let component: ModalUserCommentPublicationComponent;
  let fixture: ComponentFixture<ModalUserCommentPublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUserCommentPublicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUserCommentPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
