import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverAvatarComponent } from './hover-avatar.component';

describe('HoverAvatarComponent', () => {
  let component: HoverAvatarComponent;
  let fixture: ComponentFixture<HoverAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoverAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoverAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
