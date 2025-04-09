import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationWithFilesComponent } from './publication-with-files.component';

describe('PublicationWithFilesComponent', () => {
  let component: PublicationWithFilesComponent;
  let fixture: ComponentFixture<PublicationWithFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationWithFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationWithFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
