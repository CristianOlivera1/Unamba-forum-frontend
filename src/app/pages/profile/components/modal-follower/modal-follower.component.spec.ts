import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFollowerComponent } from './modal-follower.component';

describe('ModalFollowerComponent', () => {
  let component: ModalFollowerComponent;
  let fixture: ComponentFixture<ModalFollowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFollowerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFollowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
