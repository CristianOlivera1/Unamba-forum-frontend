import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { PublicationService } from '../../../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';
import { TimeUtils } from '../../../../Utils/TimeElapsed';

@Component({
  selector: 'app-publication-with-files',
  imports: [CommonModule],
  templateUrl: './publication-with-files.component.html',
  styleUrl: './publication-with-files.component.css'
})
export class PublicationWithFilesComponent implements OnInit {
  publications: any[] = [];

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.loadPublications();
  }

 getTimeElapsedWrapper(fechaRegistro: string): string {
    return TimeUtils.getTimeElapsed(fechaRegistro);
  }

  loadPublications(page: number = 0): void {
    this.publicationService.getPublicationsWithFilesPaginated(page).subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.publications = response.data;
        } else {
          console.error('Error al cargar las publicaciones:', response.listMessage);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

}
