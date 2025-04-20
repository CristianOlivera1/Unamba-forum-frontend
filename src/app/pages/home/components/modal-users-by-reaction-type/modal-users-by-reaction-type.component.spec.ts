import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUsersByReactionTypeComponent } from './modal-users-by-reaction-type.component';

describe('ModalUsersByReactionTypeComponent', () => {
  let component: ModalUsersByReactionTypeComponent;
  let fixture: ComponentFixture<ModalUsersByReactionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUsersByReactionTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUsersByReactionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
