import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteInfoRegisterGoogleComponent } from './complete-info-register-google.component';

describe('CompleteInfoRegisterGoogleComponent', () => {
  let component: CompleteInfoRegisterGoogleComponent;
  let fixture: ComponentFixture<CompleteInfoRegisterGoogleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteInfoRegisterGoogleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteInfoRegisterGoogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
