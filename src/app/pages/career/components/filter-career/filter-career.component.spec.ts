import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterCareerComponent } from './filter-career.component';

describe('FilterCareerComponent', () => {
  let component: FilterCareerComponent;
  let fixture: ComponentFixture<FilterCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterCareerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
