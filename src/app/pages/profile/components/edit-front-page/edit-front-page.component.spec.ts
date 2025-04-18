import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFrontPageComponent } from './edit-front-page.component';

describe('EditFrontPageComponent', () => {
  let component: EditFrontPageComponent;
  let fixture: ComponentFixture<EditFrontPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFrontPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFrontPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
