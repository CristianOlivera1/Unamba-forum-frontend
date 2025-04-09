import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationWithoutFilesComponent } from './publication-without-files.component';

describe('PublicationWithoutFilesComponent', () => {
  let component: PublicationWithoutFilesComponent;
  let fixture: ComponentFixture<PublicationWithoutFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationWithoutFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationWithoutFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
