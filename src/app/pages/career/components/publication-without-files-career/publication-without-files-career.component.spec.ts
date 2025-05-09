import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationWithoutFilesCareerComponent } from './publication-without-files-career.component';

describe('PublicationWithoutFilesCareerComponent', () => {
  let component: PublicationWithoutFilesCareerComponent;
  let fixture: ComponentFixture<PublicationWithoutFilesCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationWithoutFilesCareerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationWithoutFilesCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
