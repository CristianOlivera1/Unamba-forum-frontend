import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicationService } from '../../core/services/publication/publication.service';

@Component({
  selector: 'app-detail-publication',
  imports: [CommonModule,FormsModule],
  templateUrl: './detail-publication.component.html',
  styleUrl: './detail-publication.component.css'
})
export class DetailPublicationComponent implements OnInit{
  publication: any;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService
  ) {}

  ngOnInit() {
   this.loadPublicationById();
    
  }

  loadPublicationById(): void {
    const idPublicacion = this.route.snapshot.paramMap.get('idPublicacion');
    if (idPublicacion) {
      this.publicationService.getPublicationById(idPublicacion).subscribe({
        next: (response:any) => {
          this.publication = response.data;
        },
        error: (err) => {
          console.error('Error al obtener la carrera:', err);
        },
      });
    } else {
      console.error('idPublicacion es null');
    }
  }
}
