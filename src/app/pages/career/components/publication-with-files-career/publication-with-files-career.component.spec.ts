import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationWithFilesCareerComponent } from './publication-with-files-career.component';

describe('PublicationWithFilesCareerComponent', () => {
  let component: PublicationWithFilesCareerComponent;
  let fixture: ComponentFixture<PublicationWithFilesCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationWithFilesCareerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationWithFilesCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
